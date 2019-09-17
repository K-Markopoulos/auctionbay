import * as mongoose from 'mongoose';
import helpers = require('../tests/helpers');
import enums = require('../models/enums');
import parser = require('xml2json');
import fs = require('fs');
import Auction, { IAuction } from '../models/auction';
import User, { IUser } from '../models/user';
import Activity, { IActivity } from '../models/activity';

// Connect to the database.
const auth = process.env.MONGODB_USER || process.env.MONGODB_PASSWORD ?
  `${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@` : '';
const host = process.env.MONGODB_HOST;
const port = process.env.MONGODB_PORT;
const name = process.env.MONGODB_NAME;
const uriwa = `mongodb://${host}:${port}/${name}`;
const uri = `mongodb://${auth}${host}:${port}/${name}`;

mongoose.connect(uri, {
  keepAlive: true,
  useNewUrlParser: true
}).then(() => {
  console.info(`System connected to the database @ ${uriwa}.`);
}).then(() => {
  const usernames = {};
  const files = fs.readdirSync('./data/');
  files.forEach(file => {
    const data = fs.readFileSync('./data/' + file);
    const jsonString = parser.toJson(data);
    const json = JSON.parse(jsonString);
    json.Items.Item.forEach(item => {
      usernames[item.Seller.UserID] = 1;
      switch(item.Number_of_Bids) {
        case '0': break;
        case '1': usernames[item.Bids.Bid.Bidder.UserID] = 1; break;
        default : item.Bids.Bid.forEach(b => usernames[b.Bidder.UserID] = 1);
      }
    });
  });

  console.log(`Read ${Object.keys(usernames).length} users`);
  const docs = Object.keys(usernames).map(username => helpers.getUsersFields(username));
  console.log(`Prepared ${docs.length} users`);
  return User.create(docs);
  // return User.find({});
}).then(users => {
  console.log(`Created ${users.length} users`);

  const userIDs = {};
  users.forEach(u => {
    userIDs[u.username] = u._id;
  });

  const files = fs.readdirSync('./data/');
  let docs = [];
  files.forEach(file => {
    const data = fs.readFileSync('./data/' + file);
    const jsonString = parser.toJson(data);
    const json = JSON.parse(jsonString);
    docs = json.Items.Item.map(item => {
      const bids = item.Number_of_Bids === '0' && []
        || item.Number_of_Bids === '1' && [{
            bidder: userIDs[item.Bids.Bid.Bidder.UserID],
            time: item.Bids.Bid.Time,
            amount: item.Bids.Bid.Amount.replace('$','')
          }]
        || item.Bids.Bid.map(b => {
            return {
              bidder: userIDs[b.Bidder.UserID],
              time: b.Time,
              amount: b.Amount.replace('$','')
            }
          });
      const location = {
        address: item.Location.$t || item.Location,
        country: item.Country,
        lat: item.Location.Latitude,
        lon: item.Location.Longitude,
      };
      return {
          name: item.Name,
          category: item.Category,
          buyPrice: null,
          firstBid: item.First_Bid.replace('$',''),
          bids: bids,
          bidsCount: item.Number_of_Bids,
          location: location,
          started: item.Started,
          ends: item.Ends,
          seller: userIDs[item.Seller.UserID],
          description: item.Description.length && item.Description || '',
        }
    });
  });
  console.log(`Prepared ${docs.length} auctions`);
  return Auction.create(docs);
}).then(auctions => {
  console.log(`Created ${auctions.length} auctions`);
  const activities = [];
  auctions.forEach(auction => {
    auction.bids.forEach(bid => {
      activities.push(
        Activity.findOneAndUpdate(
          { type: enums.Activities.BID, item: auction._id, user: bid.bidder },
          { $inc: { count: 1 }},
          { upsert: true }
        ).exec()
      )
    })
  })
  return Promise.all(activities);
}).then((activities) => {
  console.log(`Created ${activities.length} activities`);
  console.log('Done');
  process.exit();
}).catch((error) => {
  console.error(`System failed to connect to the database @ ${uriwa}.`, error);
  process.exit();
});


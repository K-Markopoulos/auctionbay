import * as mongoose from 'mongoose';
import helpers = require('../tests/helpers');
import enums = require('../models/enums');
import User, { IUser } from '../models/user';
import Auction from '../models/auction';

// Connect to the database.
const auth = process.env.MONGODB_USER || process.env.MONGODB_PASSWORD ?
  `${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@` : '';
const host = process.env.MONGODB_HOST;
const port = process.env.MONGODB_PORT;
const name = !module.parent
  ? process.env.MONGODB_NAME
  : process.env.MONGODB_NAME + 'test';
const uriwa = `mongodb://${host}:${port}/${name}`;
const uri = `mongodb://${auth}${host}:${port}/${name}`;

mongoose.connect(uri, {
  keepAlive: true,
  useNewUrlParser: true
}).then(() => {
  console.info(`System connected to the database @ ${uriwa}.`);
}).then(async () => {
  return createMatrix();
}).then(() => {
  console.log('Done');
  process.exit();
}).catch((error) => {
  console.error(`System failed to connect to the database @ ${uriwa}.`, error);
  process.exit();
});

const createMatrix = async () => {
  const users = await User.find({});
  const auctions = await Auction.find({}).populate({
    path: 'bids.bidder',
    select: '_id',
    model: 'User'
  });

  let matrix = {};
  users.forEach(user => matrix[user.id] = {});

  auctions.forEach(auction => {
    auction.bids.forEach(bid => {
      matrix[(bid.bidder as IUser)._id] = {
        [auction._id]: true
      };
      // matrix[(bid.bidder as IUser)._id][auction._id] = true;
    });
  });
  console.log('-- Created Matrix --\n', JSON.stringify(matrix));
}


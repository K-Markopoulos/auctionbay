import * as mongoose from 'mongoose';
import helpers = require('../tests/helpers');
import enums = require('../models/enums');
import User, { UserSchema, IUser } from '../models/user';
import { IAuction } from '../models/auction';
import activity from '../models/activity';

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
  await mongoose.connection.collections.users.deleteMany({});
  await mongoose.connection.collections.auctions.deleteMany({});
  await mongoose.connection.collections.messages.deleteMany({});
  await mongoose.connection.collections.activities.deleteMany({});
  const users = await populateUsers();
  // const users = await User.find({});
  const auctions = await populateAuctions(users);
  const messages = await populateMessages(users);
  const activities = await populateActivities(users, auctions);
}).then(() => {
  console.log('Done');
  process.exit();
}).catch((error) => {
  console.error(`System failed to connect to the database @ ${uriwa}.`, error);
});


const populateUsers = async () => {
  return Promise.all([
    // create Admin
    helpers.createUser({
      username: 'Admin',
      role: enums.Role.ADMINISTRATOR,
      email: 'su@m.com'
    }),

    // Create 10 Bidders
    ...[...Array(10)].map(() => helpers.createUser()),

    // Create 10 Bidders pending-approval
    ...[...Array(10)].map(() => helpers.createUser({
      status: enums.Status.PENDING
    })),

    // Create 10 Sellers
    ...[...Array(10)].map(() => helpers.createUser({
      role: enums.Role.REGISTERED
    })),

    // Create 10 Guests
    ...[...Array(10)].map(() => helpers.createUser({
      role: enums.Role.GUEST
    }))

  ]).then(all => {
    all.forEach(user => {
      console.log(`Created ${user.role}: '${user.email}'`);
    });
    return all;
  });
};

const populateAuctions = async (users) => {
  const now = new Date();
  const r = () => Math.ceil(Math.random() * 10);
  // ends: new Date(now.getTime() + r()*60000) } // ends in next minutes
  return Promise.all([
    // create Auctions
    ...[...Array(30)].map((x,i) => helpers.createAuction({ seller: users[i % users.length]._id })),
  ]).then(all => {
    all.forEach(auction => {
      console.log(`Created Auction: ${auction.name}'`);
    });
    return all;
  });
};

const populateMessages = async (users) => {
  let promises = [];

  users.forEach(user => [...Array(10)].forEach(() => {
    
    // create 10 Notifications per user
    promises.push(helpers.createNotification({ to: user._id }));

    // create 10 Received message per user
    promises.push(helpers.createMessage({
      to: user._id,
      from: users[Math.ceil(Math.random() * 10) % users.length]._id
    }));

    // create 10 Sent message per user
    promises.push(helpers.createMessage({
      from: user._id,
      to: users[Math.ceil(Math.random() * 10) % users.length]._id
    }));
  }));
  return Promise.all(promises).then(all => {
    all.forEach(message => {
      console.log(`Created Message: ${message.id}\n\tFrom: ${message.from && message.from._id}\n\tTo: ${message.to._id}'`);
    });
    return all;
  });
};

const populateActivities = async (users: IUser[], auctions: IAuction[]) => {
  let activities = [];

  users.forEach(user => auctions.forEach(auction => {

    // 10% chance user has bid on this auction
    // else 60% chance user has visited this auction
    if (Math.random() < 0.1) {
      activities.push({
        type: enums.Activities.BID,
        item: auction._id,
        user: user._id,
        count: Math.ceil(Math.random()*2) // 1 or 2
      });
    } else if (Math.random() < 0.6) {
      const r = Math.ceil(Math.random()*10);
      activities.push({
        type: enums.Activities.VISIT,
        item: auction._id,
        user: user._id,
        count: r*r
      });
    }

  }));
  return activity.create(activities).then(all => {
    console.log(`Created ${all.length} Activities`);
    return all;
  });
};
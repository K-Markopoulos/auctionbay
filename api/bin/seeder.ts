import * as mongoose from 'mongoose';
import helpers = require('../tests/helpers');
import enums = require('../models/enums');

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
}).then(() => {
  return mongoose.connection.collections.users.deleteMany({});
}).then(() => {
  return mongoose.connection.collections.auctions.deleteMany({});
}).then(() => {
  return populateUsers();
}).then((users) => {
  return populateAuctions(users[0])
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
      role: enums.Role.SELLER
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

const populateAuctions = async (seller) => {
  return Promise.all([
    // create Auctions
    ...[...Array(30)].map(() => helpers.createAuction({ seller: seller })),
  ]).then(all => {
    all.forEach(auction => {
      console.log(`Created Auction: ${auction.name}'`);
    });
  });
};
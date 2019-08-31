import faker = require('faker');
import bcrypt = require('bcrypt');
import User, { IUser } from '../models/user';
import Auction, { IAuction, IBid } from '../models/auction';
import enums = require('../models/enums');
import mongoose = require('mongoose');

const createRating = (overrides?: any) => {
  const rating = {
    0: faker.random.number(),
    1: faker.random.number(),
    2: faker.random.number(),
    3: faker.random.number(),
    4: faker.random.number(),
    5: faker.random.number(),
    avg: 0,
    ...overrides
  }
  rating.avg = (rating[1] + 2*rating[2] + 3*rating[3] + 4*rating[4] + 5*rating[5]) /
    (rating[0] + rating[1] + rating[2] + rating[3] + rating[4] + rating[5]);
  rating.avg = Math.round(rating.avg * 10) / 10; 
  return rating;
};

const createLocation = (overrides?: any) => {
  return {
    address: faker.address.streetAddress(),
    country: faker.address.country(),
    ...overrides
  }
};

const createBid = (overrides?: any) => {
  return {
    time: faker.date.future(),
    amount: faker.random.number(),
    ...overrides
  }
};

const createUser = async (overrides?: any) => {
  const details = {
    username: faker.random.word(),
    email: faker.internet.email(),
    password: 'Ultra_secret',
    firstName: faker.name.findName(),
    lastName: faker.name.lastName(),
    location: createLocation(),
    phoneNumber: faker.phone.phoneNumber(),
    taxId: faker.random.number(),
    role: enums.Role.REGISTERED,
    status: enums.Status.APPROVED,
    sellerRating: createRating(),
    bidderRating: createRating(),
    ...overrides
  };
  details.password = bcrypt.hashSync(details.password, 10);

  const user = new User(details);
  return user.save();
};

const createAuction = async (overrides?: any) => {
  const details = {
    name: faker.commerce.productName(),
    category: faker.commerce.product(),
    buyPrice: 1000,
    firstBid: 10,
    bids: [],
    bidsCount: overrides && overrides.bids && overrides.bids.length || 0,
    location: createLocation(),
    started: new Date(),
    ends: faker.date.future(),
    seller: mongoose.Types.ObjectId,
    description: faker.lorem.sentence(),
    images: [],
    ...overrides
  };

  const auction = new Auction(details);
  return auction.save();
}

export = {
  createLocation,
  createUser,
  createAuction,
  createBid
}
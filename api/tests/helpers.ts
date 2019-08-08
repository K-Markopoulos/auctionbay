import faker = require('faker');
import bcrypt = require('bcrypt');
import User, { IUser } from '../models/user';
import Auction, { IAuction, IBid } from '../models/auction';
import enums = require('../models/enums');
import mongoose = require('mongoose');

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
    role: enums.Role.BIDDER,
    status: enums.Status.APPROVED,
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
import faker = require('faker');
import bcrypt = require('bcrypt');
import User, { IUser } from '../models/user';
import Auction, { IAuction, IBid } from '../models/auction';
import Message, { IMessage } from '../models/message';
import enums = require('../models/enums');
import mongoose = require('mongoose');

const createRating = (overrides?: any) => {
  const rating = {
    1: faker.random.number(),
    2: faker.random.number(),
    3: faker.random.number(),
    4: faker.random.number(),
    5: faker.random.number(),
    avg: 0,
    ...overrides
  }
  rating.avg = (rating[1] + 2*rating[2] + 3*rating[3] + 4*rating[4] + 5*rating[5]) /
    (rating[1] + rating[2] + rating[3] + rating[4] + rating[5]);
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
    phoneNumber: faker.phone.phoneNumberFormat().split('-').join(''),
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

const defaultHash = bcrypt.hashSync('Ultra_secret', 10);
const getUsersFields = username => {
  return {
    username: username,
    email: faker.internet.email(),
    password: defaultHash,
    firstName: faker.name.findName(),
    lastName: faker.name.lastName(),
    location: createLocation(),
    phoneNumber: faker.phone.phoneNumberFormat().split('-').join(''),
    taxId: faker.random.number(),
    role: enums.Role.REGISTERED,
    status: enums.Status.APPROVED,
    sellerRating: createRating(),
    bidderRating: createRating(),
  };
};

const random = (max?: number) => {
  return Math.ceil(Math.random()*10) % enums.Categories.length;
};

const createAuction = async (overrides?: any) => {
  const details = {
    name: faker.commerce.productName(),
    category: enums.Categories.slice(random(enums.Categories.length)),
    buyPrice: 1000,
    firstBid: 10,
    bids: [],
    bidsCount: overrides && overrides.bids && overrides.bids.length || 0,
    location: createLocation(),
    started: new Date(),
    ends: faker.date.recent(-1),
    seller: mongoose.Types.ObjectId,
    description: faker.lorem.sentence(),
    images: [],
    ...overrides
  };

  const auction = new Auction(details);
  return auction.save();
}

const createNotification = async (overrides?: any) => {
  const details = {
    type: enums.MessageType.NOTIFICATION,
    body: faker.lorem.sentences(),
    to: mongoose.Types.ObjectId,
    ...overrides
  };

  const notification = new Message(details);
  await notification.save();
  await User.findByIdAndUpdate(details.to, {
    $push: { messages: notification._id }
  });
  return notification;
}

const createMessage = async (overrides?: any) => {
  const details = {
    type: enums.MessageType.MESSAGE,
    body: faker.lorem.sentences(),
    from: mongoose.Types.ObjectId,
    to: mongoose.Types.ObjectId,
    ...overrides
  };

  const message = new Message(details);
  await message.save();
  await User.findByIdAndUpdate(details.from, {
    $push: { messages: message._id }
  });
  await User.findByIdAndUpdate(details.to, {
    $push: { messages: message._id }
  });
  return message;
}

export = {
  createLocation,
  createUser,
  getUsersFields,
  createAuction,
  createBid,
  createNotification,
  createMessage
}
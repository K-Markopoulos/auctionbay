import faker = require('faker');
import bcrypt = require('bcrypt');
import User, { IUser } from '../models/user';
import enums = require('../models/enums');

const createLocation = (overrides?: any) => {
  return {
    address: faker.address.streetAddress(),
    country: faker.address.country(),
    ...overrides
  }
};

const createUser = async (overrides?: any) => {
  const details = {
    username: faker.random.word(),
    email: faker.random.uuid + '@mail.com',
    password: 'Ultra_secret',
    firstName: faker.name.findName(),
    lastName: faker.name.lastName(),
    location: createLocation(),
    phoneNumber: faker.phone.phoneNumber(),
    taxId: faker.random.number(),
    role: enums.Role.BIDDER,
    status: enums.Status.APPROVED,
    ...overrides
  }
  details.password = bcrypt.hashSync(details.password, 10);

  const user = new User(details);
  return user.save();
};

export = {
  createLocation,
  createUser
}
import faker = require('faker');
import { get, post } from './requests';
import server = require('../../server');
import mongoose = require('mongoose');
import helpers = require('./helpers');
import tokens = require('../common/tokens');
import enums = require('../models/enums');
import users = require('../methods/users');

const registerData = {
  username: 'user',
  email: 'a@a.com',
  password: 'SuperSecret_1',
  firstName: 'Joe',
  lastName: 'Doe',
  location: {
    address: 'Str 12',
    country: 'US'
  },
  phoneNumber: '2102102101',
  taxId: 'AA11',
}

describe('Test users routes', function() {
  let admin;
  let adminToken;
  beforeEach(async () => {
    // delete all users before each test
    await mongoose.connection.collections.users.deleteMany({});
    admin = await helpers.createUser({ role: enums.Role.ADMINISTRATOR });
    adminToken = tokens.generate({ _id: admin._id });
  })

  describe('POST @ /', function(){
    it('should create a user', async () => {
      const p = await post(server, '/api/users/', registerData);

      p.should.have.status(200);
    });

    it('should not create a user with wrong input', async () => {
      const p = await post(server, '/api/users/', {});

      p.should.have.status(400);
    });

    it('should not create a user with existing email', async () => {
      const existingUser = await helpers.createUser();
      const p = await post(server, '/api/users/', { ...registerData, email: existingUser.email });
      
      p.should.have.status(400);
      p.body.should.have.property('error').that.equals('EMAIL_ALREADY_EXISTS');
    });

    it('should not create a user with existing username', async () => {
      const existingUser = await helpers.createUser();
      const p = await post(server, '/api/users/', { ...registerData, username: existingUser.username });

      p.should.have.status(400);
      p.body.should.have.property('error').that.equals('USERNAME_ALREADY_EXISTS');
    });

    it('should not create a user with weak password', async () => {
      const p = await post(server, '/api/users/', {...registerData, password: '1234'});

      p.should.have.status(400);
      p.body.error.should.equals('WEAK_PASSWORD');
    });
  });

  describe('POST @ /authenticate', function () {
    it('should authenticate a user', async () => {
      const creds = {
        email: 'blo@bla.com',
        password: 'Super_secure1'
      }
      await helpers.createUser(creds);
      const p = await post(server, '/api/users/authenticate', creds);

      p.should.have.status(200);
      p.body.should.have.property('token');
      p.body.should.have.property('id');
    });

    it('should not authenticate a user with wrong input', async () => {
      const p = await post(server, '/api/users/authenticate', {});
      
      p.should.have.status(400);
    });

    it('should not authenticate a not existing user', async () => {
      const creds = {
        email: 'blo@bla.com',
        password: 'Super_secure1'
      }
      await helpers.createUser(creds);
      creds.email = 'unknown@mail.com';
      const p = await post(server, '/api/users/authenticate', creds);
      
      p.should.have.status(401);
    });

    it('should not authenticate a user with wrong password', async () => {
      const creds = {
        email: 'blo@bla.com',
        password: 'Super_secure1'
      }
      await helpers.createUser(creds);
      creds.password = 'wrong';
      const p = await post(server, '/api/users/authenticate', creds);

      p.should.have.status(401);
    });
  });

  describe('POST @ /username', function () {
    it('should return true if username exists', async () => {
      const existingUser = await helpers.createUser();      
      const p = await post(server, '/api/users/username', { username: existingUser.username });

      p.body.should.equals(true);
    });

    it('should return false if username doesn\'t exists', async () => {
      await helpers.createUser();
      const p = await post(server, '/api/users/username', { username: 'ultra-rare-username' });

      p.body.should.equals(false);
    });
  });

  describe('POST @ /email', function () {
    it('should return true if email exists', async () => {
      const existingUser = await helpers.createUser();      
      const p = await post(server, '/api/users/email', { email: existingUser.email });

      p.body.should.equals(true);
    });

    it('should return false if email doesn\'t exists', async () => {
      await helpers.createUser();
      const p = await post(server, '/api/users/email', { email: 'ultra@rare.ru' });

      p.body.should.equals(false);
    });
  });

  describe('POST @ /approve', function () {
    it('should approve all requested users', async () => {
      const pending_users = await Promise.all([
        helpers.createUser({ status: enums.Status.PENDING }),
        helpers.createUser({ status: enums.Status.PENDING }),
        helpers.createUser({ status: enums.Status.PENDING }),
      ]);
      const data = {
        users: pending_users.map(x => x._id)
      };
      const p = await post(server, '/api/users/approve', data, adminToken);

      p.should.have.status(200);
      p.body.should.have.property('nModified').equals(3);
    });

    it('should not approve unkown users', async () => {
      const unknown_users = {
        users: await Array.of(4).map(mongoose.Types.ObjectId)
      };
      const p = await post(server, '/api/users/approve', unknown_users, adminToken);

      p.should.have.status(200);
      p.body.should.have.property('n').equals(0);
      p.body.should.have.property('nModified').equals(0);
    });

    it('should not approve users as not admin', async () => {
      const user = await helpers.createUser();
      const token = tokens.generate({ _id: user._id });
      const pending_users = await Promise.all([
        helpers.createUser({ status: enums.Status.PENDING }),
        helpers.createUser({ status: enums.Status.PENDING }),
        helpers.createUser({ status: enums.Status.PENDING }),
      ]);
      const data = {
        users: pending_users.map(x => x._id)
      };
      const p = await post(server, '/api/users/approve', data, token);

      p.should.have.status(403);
    });
  });

  describe('GET @ /:id', function () {
    it('should get user by id as self', async () => {
      const user = await helpers.createUser();
      const token = tokens.generate({ _id: user._id });
      const p = await get(server, `/api/users/${user._id}`, token);

      p.should.have.status(200);
      p.body.should.have.property('email').equals(user.email);
      p.body.should.have.property('username').equals(user.username);
    });

    it('should get user by id as admin', async () => {
      const user = await helpers.createUser();
      const p = await get(server, `/api/users/${user._id}`, adminToken);

      p.should.have.status(200);
      p.body.should.have.property('email').equals(user.email);
      p.body.should.have.property('username').equals(user.username);
    });

    it('should not get user as other', async () => {
      const user = await helpers.createUser();
      const otherUser = await helpers.createUser();
      const token = tokens.generate({ _id: otherUser._id });
      const p = await get(server, `/api/users/${user._id}`, token);

      p.should.have.status(403);
    });

    it('should not get user for unknown accessor', async () => {
      const user = await helpers.createUser();
      const token = tokens.generate({ _id: mongoose.Types.ObjectId });
      const p = await get(server, `/api/users/${user._id}`, token);

      p.should.have.status(401);
    });

    it('should not get an unknown user', async () => {
      const user = await helpers.createUser();
      const token = tokens.generate({ _id: user._id });
      const p = await get(server, `/api/users/${mongoose.Types.ObjectId}`, token);
      
      p.should.have.status(404);
    });
  });

  describe('POST @ /:id', function () {
    it('should update user by id', async () => {
      const user = await helpers.createUser();
      const token = tokens.generate({ _id: user._id });
      const changes = {
        firstName: 'NewName'
      };
      const p = await post(server, `/api/users/${user._id}`, changes, token);
      
      p.should.have.status(200);
      Object.keys(changes).forEach((prop) => {
        p.body.should.have.property(prop).equals(changes[prop]);
      });
    });

    it('should not update third user', async () => {
      const user1 = await helpers.createUser();
      const user2 = await helpers.createUser();
      const token1 = tokens.generate({ _id: user1._id });
      const changes = {
        firstName: 'NewName'
      };
      const p = await post(server, `/api/users/${user2._id}`,changes, token1);
      
      p.should.have.status(403);
    });
  });

  describe('GET @ /', function () {
    it('should get all users as admin', async () => {
      const users = await Promise.all([
        helpers.createUser(),
        helpers.createUser(),
        helpers.createUser(),
      ]);
      const p = await get(server, '/api/users/', adminToken);

      p.should.have.status(200);
      p.body.should.be.an('array').with.length(4);
    });

    it('should not get all users as not admin', async () => {
      const users = await Promise.all([
        helpers.createUser(),
        helpers.createUser(),
        helpers.createUser(),
      ]);
      const token = tokens.generate({ _id: users[0]._id });
      const p = await get(server, '/api/users/', token);

      p.should.have.status(403);
    });
  });
});
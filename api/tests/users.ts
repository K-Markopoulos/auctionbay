import faker = require('faker');
import { get, post } from './requests';
import server = require('../../server');
import mongoose = require('mongoose');
import helpers = require('./helpers');
import tokens = require('../common/tokens');

const registerData = {
  username: 'user',
  email: 'a@a.com',
  password: 'Secret',
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
  beforeEach(async () => {
    // delete all users before each test
    await mongoose.connection.collections.users.deleteMany({});
  })

  describe('POST @ /', function(){
    it('should create a user', async () => {
      const p = await post(server, '/api/users/', registerData);

      p.should.have.status(200);
    });

    // Skip until validation is implemented
    it.skip('should not create a user with wrong input', async () => {
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
  });

  describe('POST @ /authenticate', function () {
    it('should authenticate a user', async () => {
      const creds = {
        email: 'blo@bla.com',
        password: 'Super_secure'
      }
      await helpers.createUser(creds);
      const p = await post(server, '/api/users/authenticate', creds);

      p.should.have.status(200);
      p.body.should.have.property('token');
      p.body.should.have.property('_id');
    });

    // Skip until validation is implemented
    it.skip('should not authenticate a user with wrong input', async () => {
      const p = await post(server, '/api/users/authenticate', {});
      
      p.should.have.status(400);
    });

    it('should not authenticate a not existing user', async () => {
      const creds = {
        email: 'blo@bla.com',
        password: 'Super_secure'
      }
      await helpers.createUser(creds);
      creds.email = 'unknown@mail.com';
      const p = await post(server, '/api/users/authenticate', creds);
      
      p.should.have.status(401);
    });

    it('should not authenticate a user with wrong password', async () => {
      const creds = {
        email: 'blo@bla.com',
        password: 'Super_secure'
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

  describe.skip('GET @ /:id', function () {
    it('should get user by id', async () => {
      const user = await helpers.createUser();
      const token = tokens.generate({ _id: user._id });
      const p = await get(server, `/api/users/${user._id}`, token);
      console.info(p);

      p.should.have.status(200);
      p.body.should.have.property('email').equals(user.email);
      p.body.should.have.property('username').equals(user.username);
        // Object.keys(user-dto).forEach((prop) => p.body.should.have.property(prop));
    });

    it('should not get user for unknown accessor', async () => {
      const user = await helpers.createUser();
      const token = tokens.generate({ _id: faker.random.uuid() });
      const p = await get(server, `/api/users/${user._id}`, token);

      p.should.have.status(401);
    });

    it('should not get an unknown user', async () => {
      const user = await helpers.createUser();
      const token = tokens.generate({ _id: user._id });
      const p = await get(server, `/api/users/${faker.random.uuid()}`, token);
      
      p.should.have.status(404);
    });
  });

  describe.skip('POST @ /:id', function () {
    it('should update user by id', async () => {
      const user = await helpers.createUser();
      const token = tokens.generate({ _id: user._id });
      const changes = {
        firstName: 'NewName'
      };
      const p = await post(server, `/api/users/${user._id}`,changes, token);
      
      p.should.have.status(200);
      Object.keys(changes).forEach((prop) => {
        p.body.should.have.property(prop).equals(changes[prop]);
      });
    });

    it('should update third user', async () => {
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

  describe.skip('GET @ /', function () {
    it('should get all users', async () => {
      const users = await Array.of(20).forEach(async () => {
        await helpers.createUser();
      })
      const token = tokens.generate({ _id: users[0]._id });
      const p = await get(server, '/api/users/', token);

      p.should.be.an('array').with.length(20);
    });
  });
});
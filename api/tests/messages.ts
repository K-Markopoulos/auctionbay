import { get, post } from './requests';
import server = require('../../server');
import mongoose = require('mongoose');
import helpers = require('./helpers');
import tokens = require('../common/tokens');
import enums = require('../models/enums');


describe('Test message routes', function() {
  let user, userToken;
  this.beforeAll(async () => {
    // delete all users before all tests
    await mongoose.connection.collections.users.deleteMany({});

    user = await helpers.createUser({ role: enums.Role.REGISTERED });
    userToken = tokens.generate({ _id: user._id });
  });

  beforeEach(async () => {
    // delete all messages before each test
    await mongoose.connection.collections.messages.deleteMany({});
    await mongoose.connection.collections.users.findAndModify({},{},{ messages: [] });
  })

  describe('POST @ /', function(){
    it('should create a message', async () => {
      const receiver = await helpers.createUser();
      const messageData = {
        to: receiver.id,
        body: 'hello there'
      };

      const resCreate = await post(server, '/api/messages/', messageData, userToken);
      resCreate.should.have.status(200);
    });

    it('should not create a message with wrong input', async () => {
      [
        { to: user._id, body: ''},
        { to: '', body: 'hello there'},
        { to: '1234', body: 'hello there'},
        { to: user._id, body: ['1', '2']},
        {}
      ].forEach(async messageData => {
        const p = await post(server, '/api/messages/', messageData, userToken);
        p.should.have.status(400);
      });
    });

    it('should not create a message as an unknown user', async () => {
      const receiver = await helpers.createUser();
      const messageData = {
        to: receiver.id,
        body: 'hello there'
      };

      const p = await post(server, '/api/messages/', messageData);
      p.should.have.status(401);
    });

    it('should create a message and get that message from sender', async () => {
      const receiver = await helpers.createUser();
      const messageData = {
        to: receiver.id,
        body: 'hello there'
      };

      const resCreate = await post(server, '/api/messages/', messageData, userToken);
      const resGet = await get(server, '/api/messages/', userToken);

      resCreate.should.have.status(200);
      resGet.should.have.status(200);
      resGet.body.should.be.an('array').with.length(1);
      resGet.body[0].body.should.equals(messageData.body);
    });

    it('should create a message and get that message from receiver', async () => {
      const receiver = await helpers.createUser();
      const receiverToken = tokens.generate({ _id: receiver._id });
      const messageData = {
        to: receiver.id,
        body: 'hello there'
      };

      const resCreate = await post(server, '/api/messages/', messageData, userToken);
      const resGet = await get(server, '/api/messages/', receiverToken);

      resCreate.should.have.status(200);
      resGet.should.have.status(200);
      resGet.body.should.be.an('array').with.length(1);
      resGet.body[0].body.should.equals(messageData.body);
    });
  });
});
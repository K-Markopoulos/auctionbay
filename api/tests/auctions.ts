import faker = require('faker');
import { get, post, put } from './requests';
import server = require('../../server');
import mongoose = require('mongoose');
import helpers = require('./helpers');
import tokens = require('../common/tokens');
import enums = require('../models/enums');
import users = require('../methods/users');

const auctionData = {
  name: faker.commerce.productName(),
  category: faker.commerce.product(),
  buyPrice: 1000,
  firstBid: 10,
  location: helpers.createLocation(),
  ends: faker.date.future(),
  description: faker.lorem.sentence(),
  images: []
};

describe('Test auctions routes', function() {
  let admin, seller, bidder, adminToken, sellerToken, bidderToken;
  this.beforeAll(async () => {
    // delete all users before all tests
    await mongoose.connection.collections.users.deleteMany({});

    admin = await helpers.createUser({ role: enums.Role.ADMINISTRATOR });
    seller = await helpers.createUser({ role: enums.Role.SELLER });
    bidder = await helpers.createUser({ role: enums.Role.BIDDER });
    adminToken = tokens.generate({ _id: admin._id });
    sellerToken = tokens.generate({ _id: seller._id });
    bidderToken = tokens.generate({ _id: bidder._id });
  });

  beforeEach(async () => {
    // delete all users before each test
    await mongoose.connection.collections.auctions.deleteMany({});
  })

  describe('POST @ /', function() {
    it('should create an auction', async () => {
      const p = await post(server, '/api/auctions/', auctionData, sellerToken);

      p.should.have.status(200);
    });

    // Skip until validation is implemented
    it.skip('should not create an auction with wrong input', async () => {
      const p = await post(server, '/api/auctions/', {});

      p.should.have.status(400);
    });

    it('should not create an auction by unknown user', async () => {
      const token = tokens.generate({ _id: mongoose.Types.ObjectId });
      const p = await post(server, '/api/auctions/', auctionData, token);
      
      p.should.have.status(401);
    });

    it('should not create an auction by unauthorized user', async () => {
      const p = await post(server, '/api/auctions/', auctionData, bidderToken);
      
      p.should.have.status(403);
    });
  });

  describe('GET @ /:id', function() {
    let auction, bid;
    this.beforeEach(async () => {
      bid = helpers.createBid({ bidder: bidder });
      auction = await helpers.createAuction({ seller: seller, bids: [bid] });
    })

    it('should get an auction', async () => {
      const p = await get(server, `/api/auctions/${auction._id}`, sellerToken);

      p.should.have.status(200);
      p.body.should.have.property('name').equals(auction.name);
    });

    it('should not get an unknown auction', async () => {
      const p = await get(server, `/api/auctions/${mongoose.Types.ObjectId}`, sellerToken);

      p.should.have.status(404);
    });

    it('should not get an auction by unknown user', async () => {
      const p = await get(server, `/api/auctions/${auction._id}`);

      p.should.have.status(401);
    });
  });

  describe('GET @ /', function() {
    it('should get all auctions', async () => {
      // create 10 auctions
      await Promise.all([...Array(10)].map(() => helpers.createAuction({ seller: seller })));
      const p = await get(server, `/api/auctions/`, sellerToken);

      p.should.have.status(200);
      p.body.should.be.an('array').with.length(10);
    });
  });

  describe('PUT @ /:id', function() {
    let auction, bid;
    const changes = {
      description: faker.lorem.sentence()
    }
    this.beforeEach(async () => {
      bid = helpers.createBid({ bidder: bidder });
      auction = await helpers.createAuction({ seller: seller });
    });

    it('should update an auction', async () => {
      const p = await put(server, `/api/auctions/${auction._id}`, changes, sellerToken);

      p.should.have.status(200);
      p.body.should.have.property('name').equals(auction.name);
      p.body.should.have.property('description').equals(changes.description);
    });

    it('should not update an unknown auction', async () => {
      const p = await put(server, `/api/auctions/${mongoose.Types.ObjectId}`, changes, sellerToken);

      p.should.have.status(404);
    });

    it('should not update an auction by other than owner', async () => {
      const auction = await helpers.createAuction({ seller: seller });
      const seller2 = await helpers.createUser({ role: enums.Role.SELLER });
      const token = tokens.generate({ _id: seller2._id });
      const p = await put(server, `/api/auctions/${auction._id}`, changes, token);

      p.should.have.status(403);
    });
  });

  describe('POST @ /:id/bid', function() {
    let auction, bids;
    this.beforeEach(async () => {
      bids = [...Array(10)].map(() => helpers.createBid({ bidder: bidder }));
      auction = await helpers.createAuction({ seller: seller, bids: bids });
    });

    it('should place a bid', async () => {
      const bid = {
        amount: bids.reduce((maxAmount, bid) => Math.max(maxAmount, bid.amount), 0) + 100
      };
      const p = await post(server, `/api/auctions/${auction._id}/bid`, bid, bidderToken);

      p.should.have.status(200);
      p.body.bids[0].amount.should.equals(bid.amount);
      p.body.bids[0].bidder.username.should.equals(bidder.username);
    });

    it('should not place a bid by unknown user', async () => {
      const bid = {
        amount: bids.reduce((maxAmount, bid) => Math.max(maxAmount, bid.amount), 0) + 100
      };
      const p = await post(server, `/api/auctions/${auction._id}/bid`, bid);

      p.should.have.status(401);
    });

    it('should not place a bid by unathorized user', async () => {
      const bid = {
        amount: bids.reduce((maxAmount, bid) => Math.max(maxAmount, bid.amount), 0) + 100
      };
      const p = await post(server, `/api/auctions/${auction._id}/bid`, bid, sellerToken);

      p.should.have.status(403);
    });

    it('should not place a bid with wrong input', async () => {
      const bid = {
        amount: 'bla'
      };
      const p = await post(server, `/api/auctions/${auction._id}/bid`, bid, bidderToken);

      p.should.have.status(400);
    });

    it('should not place a bid with no input', async () => {
      const p = await post(server, `/api/auctions/${auction._id}/bid`, {}, bidderToken);

      p.should.have.status(400);
    });

    it('should not place a low bid', async () => {
      const bid = {
        amount: bids.reduce((maxAmount, bid) => Math.max(maxAmount, bid.amount), 0) - 100
      };
      const p = await post(server, `/api/auctions/${auction._id}/bid`, bid, bidderToken);

      p.should.have.status(400);
      p.body.error.should.equals('LOW_AMOUNT');
    });

    it('should not place a late bid', async () => {
      const bid = {
        amount: bids.reduce((maxAmount, bid) => Math.max(maxAmount, bid.amount), 0) + 100
      };
      auction = await helpers.createAuction({ seller: seller, bids: bids, ends: faker.date.past() });
      const p = await post(server, `/api/auctions/${auction._id}/bid`, bid, bidderToken);

      p.should.have.status(400);
      p.body.error.should.equals('AUCTION_ENDED');
    });
  });
});
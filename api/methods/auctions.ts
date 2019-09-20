import fs = require('fs');
import xml = require('xmlbuilder');
import User, { IUser, SellerSummary }from '../models/user';
import Auction, { IAuction, IBid }from '../models/auction';
import Message = require('./messages');
import errors = require('../common/errors');
import Files = require('../common/files');
import enums = require('../models/enums');
import mongoose = require('mongoose');
import Scheduler = require('../common/scheduler');

const _validateBid = (input: any, auction: IAuction) => {
  const bid = {
    bidder: input.accessor,
    time: new Date(),
    amount: input.amount
  };

  // check if auction has ended or has been bought
  if (bid.time >= auction.ends || auction.buyer || auction.lastBidder) {
    console.info('Bids not accepted. Time over.');
    throw new errors.BadRequestError('AUCTION_CLOSED');
  }

  // check if it's not the highest bid
  const isHighest = bid.amount > (auction.bids.length > 0 && auction.bids[0].amount);
  if (!isHighest) {
    console.info('Bid submitted is not the highest.');
    throw new errors.BadRequestError('LOW_AMOUNT');
  }

  return bid;
};

const _validatePurchase = (auction: IAuction) => {
  if (!auction) {
    throw new errors.NotFoundError();
  }
  if (auction.buyer || auction.lastBidder || auction.ends < new Date()) {
    throw new errors.BadRequestError('AUCTION_CLOSED');
  }
}

const _validateAuctionUpdate = async (input) => {
  const auction = await Auction.findById(input.id);
  if (auction.bids.length > 0) {
    console.info('Cannot modify auction with bids placed.');
    throw new errors.BadRequestError('CANNOT_MODIFY');
  }
  return auction;
}

const _getQueryFilters = (input: any) => {
  const filters = {};
  if (input.name) {
    filters['name'] = new RegExp(input.name, 'i');
  }
  if (input.category) {
    filters['category'] = input.category;
  }
  if (input.active) {
    filters['ends'] = { $gt: new Date() }
    filters['lastBidder'] = null;
    filters['buyer'] = null;
  }
  if (input.seller && mongoose.Types.ObjectId.isValid(input.seller)) {
    filters['seller'] = input.seller
  }
  return filters;
};

const sortByAvailableFields = {
  name: 'name',
  buyPrice: 'buyPrice',
  current: 'current',
  bidsCount: 'bidsCount',
  ends: 'ends'
};

const _getQueryOptions = (input: any) => {
  const page = Number(input.page) || 0;
  const limit = Number(input.limit) || 0;
  const sortBy = sortByAvailableFields[input.sortBy] || 'started';
  const order = input.order === 'desc' ? -1 : 1;

  return {
    skip: page * limit,
    limit: limit,
    sort: {
      [sortBy]: order
    }
  }
};

const _addImages = async (input: any, auction: IAuction) => {
  if (!input.files) {
    return;
  }
  const path = `${process.env.UPLOAD_FILE_PATH}/${auction.id}`;
  const files = await Promise.all(Files.move(input.files, path));
  auction.images.push(...files);
  console.log(files);
};

const _createXML = (auctions) => {
  const doc = xml.create('Items');
  auctions.map(auction => auction.toJSON()).forEach(auction => {
    const item = doc.ele('Item', { ItemID: auction.id });
    item.ele('Name', auction.name);
    auction.category.forEach(cat => item.ele('Category', cat));
    item.ele('Currently', auction.current);
    item.ele('First_bid', auction.firstBid);
    item.ele('Number_of_bids', auction.bids.length);
    const bids = item.ele('Bids');
    auction.bids.forEach(bid => {
      bids.ele('Bid')
        .ele('Bidder', { Rating: bid.bidder.bidderRating.avg, UserID: bid.bidder.id })
          .ele('Location', bid.bidder.location.address).up()
          .ele('Country', bid.bidder.location.country).up()
        .up()
        .ele('Time', bid.time).up()
        .ele('Amount', bid.amount).up()
    });
    item.ele('Location', auction.location.address);
    item.ele('Country', auction.location.country);
    item.ele('Started', auction.started);
    item.ele('Ends', auction.ends);
    item.ele('Seller', { Rating: auction.seller.sellerRating.avg, UserID: auction.seller.id });
  });
  
  return doc.end({ pretty: true });
};

const createAuction = async (input) => {
  const newAuction = {
    name: input.name,
    category: input.category,
    buyPrice: input.buyPrice,
    firstBid: input.firstBid,
    ends: new Date(input.ends),
    location: input.location,
    description: input.description,
    seller: input.accessor._id
  }
  const auction = new Auction(newAuction);
  await _addImages(input, auction);
  Scheduler.scheduleAuctionEnd(auction);

  console.info('Created new auction: ', auction.name);
  return (await auction.save()).toJSON();
};

const getAuction = async (input) => {
  const auction = await Auction.findById(input.id).populate('seller', SellerSummary);
  if (!auction) {
    console.info(`Auction with id ${input.id} not found`);
    throw new errors.NotFoundError();
  }
  return (await auction.save()).toJSON();
};

const getCategories = async (_input) => {
  return Promise.resolve(enums.Categories);
};

const getAllAuctions = async (input) => {
  const filters = _getQueryFilters(input);
  const options = _getQueryOptions(input);
  const auctions = await Auction.find(filters,{}, options).populate('seller', SellerSummary);
  const auctionsCount = await Auction.countDocuments(filters);
  return {
    data: auctions.map((auction: IAuction) => auction.toJSON()),
    total: auctionsCount
  }
};

const exportAuctions = async (input) => {
  const auctions = await Auction.find({}).populate({
    path: 'seller bids',
    populate: {
      path: 'bids.bidder',
      model: 'User'
    }
  });
  switch (input.responseType) {
    case 'xml':
      return _createXML(auctions);
    case 'json':
      return auctions.map(auction => auction.toJSON());
    default:
      throw new errors.BadRequestError('UNKNOWN_EXPORT_TYPE');
  }
};

const updateAuction = async (input) => {
  await _validateAuctionUpdate(input);
  const changes = {
    name: input.name,
    category: input.category,
    location: input.location,
    description: input.description,
  } as any;
  Object.keys(changes).forEach(x => {
    if (!changes[x]) {
      delete changes[x];
    }
  });
  if (input.removedImages) {
      changes.$pull = {
        images: {
          fid: { $in: input.removedImages }
        }
      }
  }
  const auction = await Auction.findByIdAndUpdate(input.id, changes, { new: true })
    .populate('seller', SellerSummary);
    await _addImages(input, auction);
  
    console.info('Updated auction: ', auction.name);
    return (await auction.save()).toJSON();
};

const deleteAuction = async (input) => {
  await _validateAuctionUpdate(input);
  const res = await Auction.deleteOne({ _id: input.id });
  Scheduler.cancelJob(input.id);
  console.log('Deleted auction', input.id, res.ok, res.n);
}

const placeBid = async (input) => {
  const auction = await Auction.findById(input.id).populate('seller', SellerSummary);
  const bid = _validateBid(input, auction);
  auction.bids.unshift(bid as IBid);
  auction.bidsCount += 1;
  return (await auction.save()).toJSON();
};

const buyItem = async (input) => {
  return Auction.findById(input.id).populate('seller', SellerSummary).then(auction => {
    _validatePurchase(auction);
    auction.buyer = input.accessor._id;
    return auction.save();
  }).then(auction => {
    Scheduler.cancelJob(auction._id.toString());
    Message.sendNotification({
      body: `Your item "${auction.name}" has been bought by ${input.accessor.username}`,
      to: (auction.seller as any)._id
    });
    return auction.toJSON();
  }).catch(err => {
    console.info('Failed to buy item', err);
    throw new errors.BadRequestError(err.message);
  })
};

export = {
  createAuction,
  exportAuctions,
  getAuction,
  getCategories,
  getAllAuctions,
  updateAuction,
  deleteAuction,
  placeBid,
  buyItem
}
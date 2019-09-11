import fs = require('fs');
import xml = require('xmlbuilder');
import User, { IUser, SellerSummary }from '../models/user';
import Auction, { IAuction, IBid }from '../models/auction';
import errors = require('../common/errors');
import Files = require('../common/files');

const _validateBid = (input: any, auction: IAuction) => {
  const bid = {
    bidder: input.accessor,
    time: new Date(),
    amount: input.amount
  };

  // check if auction has ended
  if (bid.time >= auction.ends) {
    console.info('Bids not accepted. Time over.');
    throw new errors.BadRequestError('AUCTION_ENDED');
  }

  // check if it's not the highest bid
  // TODO: check only the first, as we insert them in order
  const isHighest = (auction.bids as IBid[]).every((otherBid: IBid) => bid.amount > otherBid.amount);
  if (!isHighest) {
    console.info('Bid submitted is not the highest.');
    throw new errors.BadRequestError('LOW_AMOUNT');
  }

  return bid;
};

const _getQueryFilters = (input: any) => {
  const filters = {};
  if (input.name) {
    filters['name'] = new RegExp(input.name, 'i');
  }
  if (input.category) {
    filters['category'] = input.category;
  }
  if (input.active) {
    filters['ends'] = { $gt: new Date().toUTCString() }
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
  auction.images = files;
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
    ends: input.ends,
    location: input.location,
    description: input.description,
    seller: input.accessor._id
  }
  const auction = new Auction(newAuction);
  await _addImages(input, auction);

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
  const auctions = await Auction.find({});
  return _createXML(auctions);
};

const updateAuction = async (input) => {
  const changes = {
    name: input.name,
    category: input.category,
    location: input.location,
    description: input.description,
    images: input.images
  };
  Object.keys(changes).forEach(x => {
    if (!changes[x]) {
      delete changes[x];
    }
  });
  
  const auction = await Auction.findByIdAndUpdate(input.id, changes, { new: true })
    .populate('seller', SellerSummary);
  console.info('Updated auction ', input.id);
  return auction.toJSON();
};

const placeBid = async (input) => {
  const auction = await Auction.findById(input.id).populate('seller', SellerSummary);
  const bid = _validateBid(input, auction);
  auction.bids.unshift(bid as IBid);
  auction.bidsCount += 1;
  return (await auction.save()).toJSON();
};

export = {
  createAuction,
  exportAuctions,
  getAuction,
  getAllAuctions,
  updateAuction,
  placeBid
}
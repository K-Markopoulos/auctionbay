import User, { IUser }from '../models/user';
import Auction, { IAuction, IBid }from '../models/auction';
import errors = require('../common/errors');

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

const createAuction = async (input) => {
  const auction = new Auction(input);
  auction.seller = input.accessor;
  console.info('Created new auction: ', auction.name);
  return (await auction.save()).toJSON();
};

const getAuction = async (input) => {
  const auction = await Auction.findById(input.id);
  if (!auction) {
    console.info(`Auction with id ${input.id} not found`);
    throw new errors.NotFoundError();
  }
  return (await auction.save()).toJSON();
};

const getAllAuctions = async (input) => {
  const auctions = await Auction.find({});
  return auctions.map((auction: IAuction) => auction.toJSON());
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
  const auction = await Auction.findByIdAndUpdate(input.id, changes, { new: true });
  console.log('Updated auction ', input.id);
  return auction.toJSON();
};

const placeBid = async (input) => {
  const auction = await Auction.findById(input.id);
  const bid = _validateBid(input, auction);
  auction.bids.unshift(bid as IBid);
  return (await auction.save()).toJSON();
};

export = {
  createAuction,
  getAuction,
  getAllAuctions,
  updateAuction,
  placeBid
}
import fs = require('fs');
import User, { IUser }from '../models/user';
import Auction, { IAuction, IBid }from '../models/auction';
import errors = require('../common/errors');
import { IFile } from '../models/files';

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

const _moveImages = (files: any[], path): Promise<IFile>[] => {
  !fs.existsSync(path) && fs.mkdirSync(path);
  return files.map(file => {
    const newPath =  `${path}/${file.filename}`;
    return new Promise((resolve, reject) => {
      fs.rename(file.path,newPath, (error) => {
        if (error) {
          console.log('Error on moving files');
          reject(error);
        }
        console.info(`Create new file ${newPath}`);
        resolve({ name: file.originalname, fid: file.filename });
      });
    })
    
  })
}

const _addImages = async (input: any, auction: IAuction) => {
  if (!input.files) {
    return;
  }
  const path = `${process.env.UPLOAD_FILE_PATH}/${auction.id}`;
  const files = await Promise.all(_moveImages(input.files, path));
  auction.images = files;
  console.log(files);
}

const createAuction = async (input) => {
  const newAuction = {
    name: input.name,
    category: input.category,
    buyPrice: input.buyPrice,
    firstBid: input.firstBid,
    ends: input.ends,
    location: input.location,
    description: input.description,
    seller: input.accessor
  }
  const auction = new Auction(newAuction);
  await _addImages(input, auction);

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
  const filters = _getQueryFilters(input);
  const options = _getQueryOptions(input);
  const auctions = await Auction.find(filters,{}, options);
  const auctionsCount = await Auction.countDocuments(filters);
  return {
    data: auctions.map((auction: IAuction) => auction.toJSON()),
    total: auctionsCount
  }
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
  auction.bidsCount += 1;
  return (await auction.save()).toJSON();
};

export = {
  createAuction,
  getAuction,
  getAllAuctions,
  updateAuction,
  placeBid
}
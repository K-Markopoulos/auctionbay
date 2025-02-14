import mongoose  = require('mongoose');
import enums = require('./enums');
import User, { IUser, UserSchema } from './user';
import FileSchema, { IFile } from './files';
import Location, { ILocation, IItemLocation, LocationSchema } from './location';

// Bid

export interface IBid extends mongoose.Document{
  bidder: IUser | mongoose.Types.ObjectId,
  time: Date,
  amount: Number
}

const BidSchema = new mongoose.Schema<IBid>({

  bidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  time: {
    type: Date,
    required: true
  },

  amount: {
    type: Number,
    required: true
  }
});


// Auction

export interface IAuction extends mongoose.Document{
  name: String,
  category: String[],
  buyPrice: Number,
  firstBid: Number,
  bids: IBid[],
  bidsCount: number,
  location: IItemLocation,
  started: Date,
  ends: Date,
  seller: IUser | mongoose.Types.ObjectId,
  buyer: IUser | mongoose.Types.ObjectId,
  lastBidder: IUser | mongoose.Types.ObjectId,
  rating: number,
  description: String,
  images?: IFile[]
}

const AuctionSchema = new mongoose.Schema<IAuction>({
  
  // The auction's short name
  name: {
    type: String,
    required: true
  },

  // The auction's category/ies
  category: [{
    type: String,
    required: true
  }],

  // The auction's buy price, can be omitted
  buyPrice: {
    type: Number,
    required: false
  },

  // The auction's minimum bid, set by seller
  firstBid: {
    type: Number,
    required: true
  },

  // The auction's placed bids
  bids: [{
    type: BidSchema,
  }],

  // The auction's bid count
  bidsCount: {
    type: Number,
    default: 0
  },

  // The item's location
  location: {
    type: LocationSchema,
    required: true    
  },

  // The date the auction started
  started: {
    type: Date,
    required: true,
    default: new Date()
  },

  // The date the auction ends
  ends: {
    type: Date,
    required: true
  },

  // The creator of the auction
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // The user who bought the auction (via BuyPrice)
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // The user who bidded highest and won the auction
  lastBidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // The rating given by the auction winner
  rating: Number,

  // The item's description
  description: {
    type: String,
    default: ''
  },

  // The auction's images
  images: [
    FileSchema
  ]
});

// Index for free text search
AuctionSchema.index({
  name: 'text',
  description: 'text'
}, {
  weights: {
    name: 5,
    description: 1,
  }
});

AuctionSchema.methods.toJSON = function() {
  return {
    id: this.id,
    name: this.name,
    category: this.category,
    buyPrice: this.buyPrice,
    firstBid: this.firstBid,
    current: this.bids && this.bids[0] && this.bids[0].amount || this.firstBid,
    bids: this.bids,
    location: this.location,
    started: this.started,
    ends: this.ends,
    seller: this.seller,
    buyer: this.buyer,
    lastBidder: this.lastBidder,
    rating: this.rating,
    description: this.description,
    images: this.images || []
  };
};

export default mongoose.model<IAuction>('Auction', AuctionSchema);
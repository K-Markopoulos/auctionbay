import User, { IUser }from '../models/user';
import Auction, { IAuction, IBid }from '../models/auction';
import errors = require('../common/errors');

const createAuction = async (input) => {

};

const getAuction = async (input) => {

};

const getAllAuctions = async (input) => {
  const auctions = await Auction.find({});
  return auctions;
};

const updateAuction = async (input) => {

};

const placeBid = async (input) => {

};

export = {
  createAuction,
  getAuction,
  getAllAuctions,
  updateAuction,
  placeBid
}
import schedule = require('node-schedule');
import Auction, { IAuction } from '../models/auction';
import Messages = require('../methods/messages');
import enums = require('../models/enums');
import WS = require("./ws-server");
import User, { IUser } from '../models/user';

const jobs = new Map<String, schedule.Job>();

const scheduleAllAuctions = async () => {
  jobs.clear();
  // fetch all active auctions
  return Auction.find(
    {
      lastBidder: null,
      buyer: null,
      ends: { $gt: new Date() }
    }, 
    '_id ends'
  ).then(auctions => auctions.forEach(scheduleAuctionEnd));
};

const scheduleAuctionEnd = (auction: IAuction) => {
  const id = auction._id.toString();
  const job = schedule.scheduleJob(auction.ends, onAuctionEnd.bind(null, id, auction.ends));
  jobs.set(id, job);
  console.info(`Just scheduled auction end:${id} -> ${auction.ends}`);
};

const cancelJob = (id: string) => {
  if (jobs.has(id)) {
    jobs.get(id).cancel();
    jobs.delete(id);
  } else {
    console.warn('Couldn\'t find the scheduled job for id:', id);
  }
}

async function onAuctionEnd(id: string, date: Date) {
  console.log(`Auction with id:'${id}' just ended. ${date}`);
  // const announcement = {
  //   type: enums.MessageType.NOTIFICATION,
  //   body: 'Auction just ended.'
  // };
  // WS.notifyAll(announcement);

  const auction = await Auction.findById(id, 'name seller buyer bids').populate('buyer bids.bidder');
  const winner = ((auction.bids[0] && auction.bids[0].bidder) as IUser);

  if (winner) {
    auction.lastBidder = winner;

    Messages.sendNotification({
      body: `Your auction just ended and was bought by ${winner.username}!`,
      to: auction.seller
    });
    Messages.sendNotification({
      body: `You just won the auction '${auction.name}'!`,
      to: winner
    });

    return auction.save();
  }
}

export = {
  scheduleAllAuctions,
  scheduleAuctionEnd,
  cancelJob
}
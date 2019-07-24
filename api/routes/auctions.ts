import express = require('express');
import authenticate = require('../middlewares/authenticate');
import guard = require('../middlewares/guards');
import respond = require('../middlewares/respond');
import method = require('../methods/auctions');
import prepare = require('../middlewares/prepare');
import enums = require('../models/enums');

const router = express.Router();

// Get all auctions
router.route('/').get(
  authenticate,
  prepare(method.getAllAuctions),
  respond
);

// Create new auction
router.route('/').post(
  authenticate,
  guard.asRole(enums.Role.SELLER),
  prepare(method.createAuction),
  respond
);

// Get auction by id
router.route('/:id').get(
  authenticate,
  prepare(method.getAuction),
  respond
);

// Update auction by id
router.route('/:id').put(
  authenticate,
  guard.asOwner(),
  prepare(method.updateAuction),
  respond
);

// Place a bid
router.route('/:id/bid').post(
  authenticate,
  guard.asRole(enums.Role.BIDDER),
  prepare(method.placeBid),
  respond
);

export = router;
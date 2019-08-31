import express = require('express');
import { validator } from '../common/validator';
import authenticate = require('../middlewares/authenticate');
import guard = require('../middlewares/guards');
import respond = require('../middlewares/respond');
import method = require('../methods/auctions');
import prepare = require('../middlewares/prepare');
import { validate } from '../middlewares/validate';
import upload = require('../middlewares/multipart');
import enums = require('../models/enums');

const router = express.Router();

//
// Validation Schemas
//

const getAll = {
  query: {
    name: validator.string().optional().allow(''),
    category: validator.string().optional().allow(''),
    page: validator.number().optional(),
    limit: validator.number().optional()
  }
};

const createAuction = {
  body: {
    name: validator.string().required(),
    category: validator.array().items(validator.string()).required(),
    buyPrice: validator.number().optional().allow(''),
    firstBid: validator.number().required(),
    location: validator.object({
      address: validator.string().required(),
      country: validator.string().required(),
      lat: validator.string().optional(),
      lon: validator.string().optional(),
    }).optional(),
    ends: validator.date().required(),
    description: validator.string().required(),
    images: validator.array().items(validator.string()).max(10).required()
  }
};

const getAuction = {
  params: {
    id: validator.objectId().required()
  }
};

const updateAuction = {
  body: {
    name: validator.string().optional(),
    category: validator.string().optional(),
    location: validator.object({
      address: validator.string().required(),
      country: validator.string().required(),
      lat: validator.string().optional(),
      lon: validator.string().optional(),
    }).optional(),
    description: validator.string().optional(),
    images: validator.string().optional()
  }
};

const placeBid = {
  body: {
    amount: validator.number().required()
  }
};


//
// Routes
//

// Get all auctions
router.route('/').get(
  authenticate,
  validate(getAll),
  prepare(method.getAllAuctions),
  respond
);

// Create new auction
router.route('/').post(
  authenticate,
  guard.asRole([enums.Role.REGISTERED, enums.Role.ADMINISTRATOR]),
  upload.parseImages('auction'),
  validate(createAuction),
  prepare(method.createAuction),
  respond
);

// Get auction by id
router.route('/:id').get(
  authenticate,
  validate(getAuction),
  prepare(method.getAuction),
  respond
);

// Update auction by id
router.route('/:id').put(
  authenticate,
  guard.asOwner(),
  validate(updateAuction),
  prepare(method.updateAuction),
  respond
);

// Place a bid
router.route('/:id/bid').post(
  authenticate,
  guard.asRole([enums.Role.REGISTERED, enums.Role.ADMINISTRATOR]),
  validate(placeBid),
  prepare(method.placeBid),
  respond
);

export = router;
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
    category: validator.array().items(validator.string()).optional(),
    location: validator.object({
      address: validator.string().required(),
      country: validator.string().required(),
      lat: validator.string().optional(),
      lon: validator.string().optional(),
    }).optional(),
    description: validator.string().optional(),
    images: validator.array().items(validator.string().optional()).max(10).optional(),
    removedImages: validator.array().items(validator.string().optional()).optional()
  }
};

const deleteAuction = {
  params: {
    id: validator.objectId().required()
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

// Export auctions
router.route('/export').get(
  authenticate,
  guard.asAdmin(),
  prepare(method.exportAuctions, 'xml'),
  respond
);

// Get auction by id
router.route('/:id').get(
  validate(getAuction),
  prepare(method.getAuction),
  respond
);

// Update auction by id
router.route('/:id').put(
  authenticate,
  guard.asOwner(),
  upload.parseImages('auction'),
  validate(updateAuction),
  prepare(method.updateAuction),
  respond
);

// Delete auction by id
router.route('/:id').delete(
  authenticate,
  guard.asOwner(),
  validate(deleteAuction),
  prepare(method.deleteAuction),
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
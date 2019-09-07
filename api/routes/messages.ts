import express = require('express');
import { validator } from '../common/validator';
import authenticate = require('../middlewares/authenticate');
import { validate } from '../middlewares/validate';
import guard = require('../middlewares/guards');
import respond = require('../middlewares/respond');
import method = require('../methods/messages');
import prepare = require('../middlewares/prepare');
import upload = require('../middlewares/multipart');

const router = express.Router();

//
// Validation Schemas
//

const getAllSchema = {
  query: {
    cursor: validator.number().optional(),
    limit: validator.number().optional()
  }
};

const createSchema = {
  body: {
    to: validator.objectId().required(),
    body: validator.string().required()
  }
};

//
// Routes
//

// Get all messages
router.route('/').get(
  authenticate,
  validate(getAllSchema),
  prepare(method.getAllMessages),
  respond
);

// Create message
router.route('/').post(
  authenticate,
  validate(createSchema),
  prepare(method.sendMessage),
  respond
);


export = router;
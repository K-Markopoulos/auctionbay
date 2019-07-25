import express = require('express');
import { validator } from '../common/validator';
import authenticate = require('../middlewares/authenticate');
import { validate } from '../middlewares/validate';
import guard = require('../middlewares/guards');
import respond = require('../middlewares/respond');
import method = require('../methods/users');
import prepare = require('../middlewares/prepare');

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

const createUserSchema = {
  body: {
    username: validator.string().required(),
    email: validator.string().email().required(),
    // at least 8 digits, one letter and one digit
    password: validator.string().regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+=-]{8,}$/).required(),
    firstName: validator.string().required(),
    lastName: validator.string().required(),
    location: validator.object({
      address: validator.string().required(),
      country: validator.string().required()
    }).required(),
    phoneNumber: validator.string().length(10).required(),
    taxId: validator.string().required()
  }
};

const authenticateSchema = {
  body: {
    email: validator.string().email().required(),
    password: validator.string().required()
  }
};

const checkUsernameSchema = {
  body: {
    username: validator.string().required()
  }
};

const checkEmailSchema = {
  body: {
    email: validator.string().email().required()
  }
};

const approveUserSchema = {
  body: {
    users: validator.array().has(validator.objectId().required()).required()
  }
};

const getUserSchema = {
  params: {
    id: validator.objectId().required()
  }
};

const updateUserSchema = {
  params: {
    id: validator.objectId().required()
  },
  body: {
    email: validator.string().email().optional(),
    firstName: validator.string().optional(),
    lastName: validator.string().optional(),
    location: validator.object({
      address: validator.string().required(),
      country: validator.string().required()
    }).optional(),
    phoneNumber: validator.string().length(10).optional(),
    taxId: validator.string().optional()
  }
};

const deleteUserSchema = {
  params: {
    id: validator.objectId().required()
  }
};


//
// Routes
//

// Get all users
router.route('/').get(
  authenticate,
  validate(getAllSchema),
  prepare(method.getAllUsers),
  respond
);

// Create new user
router.route('/').post(
  validate(createUserSchema),
  prepare(method.createUser),
  respond
);

// Authenticate user
router.route('/authenticate').post(
  validate(authenticateSchema),
  prepare(method.authenticateUser),
  respond
);

// Check for existing username
router.route('/username').post(
  validate(checkUsernameSchema),
  prepare(method.checkUsername),
  respond
);

// Check for existing email
router.route('/email').post(
  validate(checkEmailSchema),
  prepare(method.checkEmail),
  respond
);

// Approve user
router.route('/approve').post(
  authenticate,
  guard.asAdmin(),
  validate(approveUserSchema),
  prepare(method.approveUsers),
  respond
);

// Get user by id
router.route('/:id').get(
  authenticate,
  validate(getUserSchema),
  prepare(method.getUser),
  respond
);

// Update user by id
router.route('/:id').post(
  authenticate,
  guard.asSelf(),
  validate(updateUserSchema),
  prepare(method.updateUser),
  respond
);

// Delete user
router.route('/:id').delete(
  authenticate,
  guard.asSelf(),
  validate(deleteUserSchema),
  prepare(method.deleteUser),
  respond
);

export = router;
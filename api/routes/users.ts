import express = require('express');
import authenticate = require('../middlewares/authenticate');
import respond = require('../middlewares/respond');
import method = require('../methods/users');
import prepare = require('../middlewares/prepare');

const router = express.Router();

// Get all users
router.route('/').get(
  authenticate,
  // authorize,
  prepare(method.getAllUsers),
  respond
);

// Create new user
router.route('/').post(
  prepare(method.createUser),
  respond
);

// Authenticate user
router.route('/authenticate').post(
  prepare(method.authenticateUser),
  respond
);

// Check username
router.route('/username').post(
  prepare(method.checkUsername),
  respond
);

// Check email
router.route('/email').post(
  prepare(method.checkEmail),
  respond
);

// Get user by id
router.route('/:id').get(
  authenticate,
  // authorize,
  prepare(method.getUser),
  respond
);

// Update user by id
router.route('/:id').post(
  authenticate,
  // authorize,
  prepare(method.updateUser),
  respond
);

// Delete user
router.route('/:id').delete(
  authenticate,
  // authorize,
  prepare(method.deleteUser),
  respond
);

export = router;
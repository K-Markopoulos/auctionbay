import express = require('express');
import authenticate = require('../middlewares/authenticate');
import guard = require('../middlewares/guards');
import respond = require('../middlewares/respond');
import method = require('../methods/users');
import prepare = require('../middlewares/prepare');

const router = express.Router();

// Get all users
router.route('/').get(
  authenticate,
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

// Check for existing username
router.route('/username').post(
  prepare(method.checkUsername),
  respond
);

// Check for existing email
router.route('/email').post(
  prepare(method.checkEmail),
  respond
);

// Get user by id
router.route('/:id').get(
  authenticate,
  prepare(method.getUser),
  respond
);

// Update user by id
router.route('/:id').post(
  authenticate,
  guard.asSelf,
  prepare(method.updateUser),
  respond
);

// Delete user
router.route('/:id').delete(
  authenticate,
  guard.asSelf,
  prepare(method.deleteUser),
  respond
);

export = router;
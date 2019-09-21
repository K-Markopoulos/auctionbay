import { Request, Response, NextFunction} from 'express';
import errors = require('../common/errors');
import tokens = require('../common/tokens');
import User, { IUser } from '../models/user';

// Authenticates the request by verifying the header token
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // Check headers
  if (!req.headers || !req.headers.authorization) {
    console.info('No authorization headers');
    return next(new errors.UnauthorizedError());
  }

  // Header value should be 'Bearer [token]'
  const parts = req.headers.authorization.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    console.info('The value of the Authorization header is invalid.');
    return next(new errors.UnauthorizedError());
  }

  const token = parts[1];
  let payload: any;

  try {
    payload = tokens.verify(token);
  } catch (error) {
    console.error('Could not verify token', error);
    return next(new errors.UnauthorizedError());
  }

  if (!payload) {
    return next(new errors.UnauthorizedError());
  }
  return User.findById(payload._id).then((user: IUser) => {
    if (!user) {
      return next(new errors.UnauthorizedError());
    }
    // authenticated
    res.locals.accessor = user;
    return next();
  }).catch(err => {
    console.log('Failed to authenticate:', err);
    throw err;
  })
};

export = authenticate;
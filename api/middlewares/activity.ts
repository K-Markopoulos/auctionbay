import { Request, Response, NextFunction} from 'express';
import errors = require('../common/errors');
import tokens = require('../common/tokens');
import User, { IUser } from '../models/user';
import Activity, { IActivity } from '../models/activity';
import enums = require('../models/enums');

const _logActivity = async (activity: Number, itemID: string, user: IUser) => {
  return Activity.findOneAndUpdate(
    { type: activity, item: itemID, user: user._id },
    { $inc: { count: 1 }},
    { upsert: true }
  ).exec();
};

const track = (activity: Number) => {
  return (req: Request, res: Response, next: NextFunction) => {

    if (res.locals.accessor) {
      return _logActivity(activity, req.params.id, res.locals.accessor).then(() => next());
    }

    // Check headers
    if (!req.headers || !req.headers.authorization) {
      return next();
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
      return _logActivity(activity, req.params.id, res.locals.accessor).then(() => next());
    });
  };
};

export = {
  track
};
import errors = require('../common/errors');
import { Request, Response, NextFunction} from 'express';
import User, { IUser } from '../models/user';
import Enums = require('../models/enums');
import Auction from '../models/auction';

const asRole = (role: string) => {
  return async (_req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(res.locals.accessor._id);
    if (!user) {
      console.warn('The accessor is not authenticated');
      return next(new errors.UnauthorizedError());
    }
    if (user.role !== role) {
      console.warn('The accessor is not authorized');
      return next(new errors.ForbiddenError());
    }
    return next();
  };
};

const asSelf = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(res.locals.accessor._id);
    if (!user) {
      console.warn('The accessor is not authenticated');
      return next(new errors.UnauthorizedError());
    }
    if (!user._id.equals(req.params.id)) {
      console.warn('The accessor is not authorized');
      return next(new errors.ForbiddenError());
    }
    return next();
  };
};

const asOwner = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const document = await Auction.findById(req.params.id, 'seller').populate('seller');
    if (!document) {
      console.warn('The document was not fount');
      return next(new errors.NotFoundError());
    }
    if ((document.seller as IUser)._id !== req.params.id) {
      console.warn('The accessor is not authorized');
      return next(new errors.ForbiddenError());
    }
    return next();
  };
}

const asAdmin = () => {
  return async (_req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(res.locals.accessor._id);
    if (!user) {
      console.warn('The accessor is not authenticated');
      return next(new errors.UnauthorizedError());
    }
    if (user.role !== Enums.Role.ADMINISTRATOR) {
      console.warn('The accessor is not authorized');
      return next(new errors.ForbiddenError());
    }
    next();
  };
};

export = {
  asRole,
  asSelf,
  asOwner,
  asAdmin
}
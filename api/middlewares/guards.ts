import errors = require('../common/errors');
import { Request, Response, RequestHandler} from 'express';
import User = require('../models/user');
import Enums = require('../models/enums');

const asRole = (role: string) => {
  return (req: Request, res: Response, next: any) => {
    return User.findById(res.locals.accessor._id).then((user: any) => {
      if (!user) {
        console.warn('The accessor is not authenticated');
        next(new errors.UnauthorizedError());
      }
      if (user.role !== role) {
        console.warn('The accessor is not authorized');
        next(new errors.UnauthorizedError());
      }
    })
  };
};

const asSelf = () => {
  return (req: Request, res: Response, next: any) => {
    return User.findById(res.locals.accessor._id).then((user: any) => {
      if (!user) {
        console.warn('The accessor is not authenticated');
        next(new errors.UnauthorizedError());
      }
      if (user._id !== req.params.id) {
        console.warn('The accessor is not authorized');
        next(new errors.UnauthorizedError());
      }
    })
  };
};
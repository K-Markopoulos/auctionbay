import joi, { validator }  from '../common/validator';
import errors = require('../common/errors');
import { Request, Response, NextFunction} from 'express';

export const validate = (schema: joi.SchemaLike) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const options = {
      allowUnknown: true,
      stripUnknown: true
    }
    try {
      validator.validate(req, schema, options, (err: joi.ValidationError, value) => {
        if (err) {
          const property = err.details[0].path.slice(-1)[0].toUpperCase();
          const state = property === 'PASSWORD'
            ? 'WEAK'
            : err.details[0].message.includes('required')
              ? 'MISSING'
              : 'INVALID';
          console.info('Bad request:', err.details[0]);
          return next(new errors.BadRequestError(`${state}_${property}`));
        }
        next();
      });
    } catch (err) {
      console.error('Validation failed', err.message);
      next(new errors.BadRequestError('VALIDATION_FAILED'));
    }
  };
};
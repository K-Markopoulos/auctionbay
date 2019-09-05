import multer = require('multer');
import errors = require('../common/errors');
import { Request, Response, NextFunction} from 'express';

const upload = multer({
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE, 10),
  },
  storage: multer.diskStorage({}),
});

const parseImages = (property: string) => {
  return (req: Request, res: Response, next:NextFunction) => {
    upload.array('images', 10)(req, res, (error) => {
      if (error) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          next(new errors.BadRequestError('FILE_TOO_LARGE'));
        } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
          // ignore error
          next();
        } else {
          next(error);
        }
      } else {
        // Deserialize input
        if (property && typeof req.body[property] == 'string') {
          req.body = JSON.parse(req.body[property]);
        }
        next();
      }
    });
  };
};

const parseSingle = (property: string) => {
  return (req: Request, res: Response, next:NextFunction) => {
    upload.single('avatar')(req, res, (error) => {
      if (error) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          next(new errors.BadRequestError('FILE_TOO_LARGE'));
        } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
          // ignore error
          next();
        } else {
          next(error);
        }
      } else {
        // Deserialize input
        if (property && typeof req.body[property] == 'string') {
          req.body = JSON.parse(req.body[property]);
        }
        next();
      }
    });
  };
};

export = {
  parseImages,
  parseSingle
};
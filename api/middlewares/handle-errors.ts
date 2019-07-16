import { Request, Response, RequestHandler } from 'express';

// Handles all errors.
const handle = (error: Error, req: Request, res: Response, _next: RequestHandler) => {
  let errorMsg: string = '';
  let status: number;
  switch (error.name) {
    case 'UnauthorizedError':
      status = 401;
      errorMsg = 'UNKNOWN_ACCESSOR';
      break;
    case 'ForbiddenError':
      status = 403;
      errorMsg = 'ACCESS_DENIED';
      break;
    case 'NotFoundError':
      status = 404;
      errorMsg = error.message;
      break;
    case 'BadRequestError':
      status = 400;
      errorMsg = error.message;
      break;
    default:
      status = 500;
      errorMsg = 'FAILED';
      break;
  }
  res.status(status).json({
    error: errorMsg
  });
};

export = handle;
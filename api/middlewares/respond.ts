import { Request, Response, RequestHandler} from 'express';

// Sends a response based on whatever has been put on res.locals.
const respond = (_req: Request, res: Response, _next: RequestHandler) => {
  res.status(res.locals.code);
  const headers = res.locals.headers;
  const content = res.locals.content;
  res.set(headers);
  res.json(content);
};

export = respond;

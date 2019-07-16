import { Request, Response, RequestHandler} from 'express';

const prepare = (method: Function) => {
  return (req: Request, res: Response, next: any) => {
    const input = Object.assign({}, req.params, req.query, req.body);
      return method(input).then((result) => {
        res.locals.content = result;
        res.locals.headers = { 'Content-Type': 'application/json' };
        res.locals.code = 200; // TODO
        return next();
      }).catch(err => {
        return  next(err);
      });
  }
}

export = prepare;
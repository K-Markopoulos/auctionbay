import { Request, Response, NextFunction} from 'express';

const prepare = (method: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const input = Object.assign({}, req.params, req.query, req.body);
    input.accessor = res.locals.accessor;
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
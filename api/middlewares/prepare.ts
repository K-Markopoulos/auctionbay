import { Request, Response, NextFunction} from 'express';

const prepare = (method: Function, type: string = 'json') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const input = Object.assign({}, req.params, req.query, req.body);
    if (req.files) {
      input.files = req.files;
    }
    if (req.file) {
      input.file = req.file;
    }
    if (req.params.responseType) {
      type = req.params.responseType;
    }
    input.accessor = res.locals.accessor;
      return method(input).then((result) => {
        res.locals.content = result;
        res.locals.headers = { 'Content-Type': 'application/' + type };
        res.locals.type = type;
        res.locals.code = 200;
        return next();
      }).catch(err => {
        return  next(err);
      });
  }
}

export = prepare;
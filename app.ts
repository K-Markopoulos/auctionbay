import bodyParser = require('body-parser');
import helmet = require('helmet');
import cors = require('cors');
import routes = require('./api/routes/index');
import errors = require('./api/common/errors');
import handle = require('./api/middlewares/handle-errors');

import express  = require('express');

const app = express();

// Parse body params and add them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(helmet());
app.use(cors());

// Mount application routes in /api path
app.use('/api', routes);

// Catch requests to unknown endpoints, and forward them to the error handler.
app.use((req, _res, _next) => {
  throw new errors.NotFoundError(`Nothing to ${req.method} @ ${req.url}.`);
});
  
// Set the error handler.
app.use(handle);

export = app;


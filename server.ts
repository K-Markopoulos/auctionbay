import * as mongoose from 'mongoose';
import app = require('./app');
import ws = require('./api/common/ws-server');
import Scheduler = require('./api/common/scheduler');
import https = require('https');
import fs = require('fs');

// Load all models.
require('./api/models/index');

// Connect to the database.
const auth = process.env.MONGODB_USER || process.env.MONGODB_PASSWORD ?
  `${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@` : '';
const host = process.env.MONGODB_HOST;
const port = process.env.MONGODB_PORT;
const name = !module.parent
  ? process.env.MONGODB_NAME
  : process.env.MONGODB_NAME + 'test';
const uriwa = `mongodb://${host}:${port}/${name}`;
const uri = `mongodb://${auth}${host}:${port}/${name}`;
mongoose.connect(uri, {
  keepAlive: true,
  useNewUrlParser: true,
  useFindAndModify: false
}).then(() => {
  console.info(`System connected to the database @ ${uriwa}.`);
  Scheduler.scheduleAllAuctions();
}).catch((error) => {
  console.error(`System failed to connect to the database @ ${uriwa}.`, error);
});

const server_port:number = Number(process.env.PORT);

// don't run server on tests
if (!module.parent) {
  // start the server on https
  const server = https.createServer({
    key: fs.readFileSync(process.env.SSL_KEY_FILE),
    cert: fs.readFileSync(process.env.SSL_CERT_FILE),
    passphrase: process.env.SSL_PASSPHRASE
  }, app);
  server.listen(server_port, process.env.HOST, () => {
    console.info(`Server started in ${process.env.NODE_ENV} mode on port ${process.env.PORT}.`);
  });

  // Start WebSocket server
  ws.mount(server);
  ws.start();
}

export = app;
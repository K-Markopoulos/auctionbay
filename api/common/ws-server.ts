
import WebSocketServer = require('websocket');
import tokens = require('./tokens');
import User, { IUser } from '../models/user';
import https = require('https');

let wsServer: WebSocketServer.server;
const clients: Map<string, WebSocketServer.connection> = new Map();

const mount = (server: https.Server) => {
  wsServer = new WebSocketServer.server({
    httpServer: server,
    autoAcceptConnections: false
  });
  console.info('WS mounted');
}

const originIsAllowed = (origin: string) =>  {
  return process.env.UI_BASE_URL === origin;
}

const acceptConnection = (request: WebSocketServer.request) =>  {
  if (!originIsAllowed(request.origin)) {
    request.reject();
    console.info('WS Connection from origin ' + request.origin + ' rejected.');
    return;
  }
  return request.accept(null, request.origin);
};


const handleMessage = (connection: WebSocketServer.connection) =>  {
  return (message: WebSocketServer.IMessage) => {
    console.info('WS Received Message: ' + message.utf8Data);
    let data;
    try {
      data = JSON.parse(message.utf8Data);
    } catch {
      console.info('Could not parse incoming message');
      return;
    }
    if (data.token) {
      verifyUser(data.token, connection);
    }
  };
};

const verifyUser = (token: string, connection: WebSocketServer.connection) => {
  let payload: any;
  const unauthorizedError = JSON.stringify({ error: 'UNAUTHORIZED'});
  try {
    payload = tokens.verify(token);
  } catch (error) {
    console.error('Could not verify token', error);
    return connection.send(unauthorizedError);
  }

  if (!payload) {
    return connection.send(unauthorizedError);
  }

  return User.findById(payload._id).then((user: IUser) => {
    if (!user) {
      return connection.send(unauthorizedError);
    }

    console.info('WS user verified. Storing connection');
    // Store the connection
    clients.set(user._id, connection);
  })
};

const storeConnection = (connection: WebSocketServer.connection, userID: string)=> {
  clients.set(userID, connection);
};

const closeConnection = (closeReason, description) =>  {
};

const start = () => {
  wsServer.on('request', function(request: WebSocketServer.request) {
      const connection = acceptConnection(request);
      if (!connection) return;

      console.info('WS Connection accepted.');

      connection.on('message', handleMessage(connection));
      // connection.on('close', closeConnection);
  });
};

const notifyUser = (userID: string, notification: Object) => {
  if (clients[userID]) {
    clients[userID].sendUTF(JSON.stringify(notification));
  }
};

const notifyAll = (notification: Object) => {
  const message = JSON.stringify(notification);
  Object.values(clients).forEach(connection => {
    connection.sendUTF(message);
  })
};

export = {
  mount,
  start,
  notifyUser,
  notifyAll
};
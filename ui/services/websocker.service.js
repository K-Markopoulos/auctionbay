import TokenService from './token.service';

let ws;

const WS = {
  connect() {
    ws = new WebSocket('wss://localhost:8888');

    ws.onopen = (connection) => {
      const data = {
        token: TokenService.getToken()
      };
      ws.send(JSON.stringify(data));
    };

    ws.onmessage = (message) => {
      let notification = {};
      try {
        notification = JSON.parse(message);
      } catch {
        console.error('Failed to parse WS notification');
      }
      this.$emit('NOTIFICATION', notification);
    };
  },

  send(message) {
    const data = JSON.stringify(message);
    ws.send(data);
  }
};

export default WS;
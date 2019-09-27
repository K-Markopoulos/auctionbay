import TokenService from './token.service';
import EventBus from './eventbus.service';
import Vue from 'vue';

const WS = new Vue({
  data: {
    ws: null
  },

  methods: {
    connect() {
      this.ws = new WebSocket(process.env.WS_BASE_URL);

      this.ws.onopen = (connection) => {
        const data = {
          token: TokenService.getToken()
        };
        this.ws.send(JSON.stringify(data));
      };

      this.ws.onmessage = (message) => {
        let notification = {};
        try {
          notification = JSON.parse(message.data);
        } catch {
          console.error('WS Failed to parse incoming notification');
        }
        console.log('Notification received:', message);
        EventBus.$emit('NOTIFICATION', notification);
      };
    },

    send(message) {
      const data = JSON.stringify(message);
      this.ws.send(data);
    },

    disconnect() {
      this.ws.close();
    }
  }
});

export default WS;
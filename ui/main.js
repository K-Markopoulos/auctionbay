import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import ApiService from './services/api.service'
import TokenService from './services/token.service'

// Set the base URL of the API
// ApiService.init(process.env.API_BASE_URL)
ApiService.init('https://localhost:8888/api');

// If token exists set header
if (TokenService.getToken()) {
  ApiService.setHeader()
}

new Vue({
  vuetify,
  router,
  render: h => h(App)
}).$mount('#app');

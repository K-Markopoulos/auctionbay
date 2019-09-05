import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import ApiService from './services/api.service'
import TokenService from './services/token.service'

Vue.prototype.$categories = [
  "Antiques",
  "Art",
  "Books",
  "CDs, DVDs, Games",
  "Clothing",
  "Collectibles",
  "Computers",
  "Dining",
  "Electronics",
  "Food & Gourmet Items",
  "For Your Pet",
  "Golf & Sports Gear",
  "Handbags",
  "Health & Fitness",
  "Home",
  "Jewelry",
  "Lawn & Garden",
  "Memorabilia",
  "Other",
  "Services",
  "Spa & Beauty",
  "Tickets-Entertainment",
  "Tickets-Sports",
  "Toys",
  "Travel",
  "Unique Experiences",
  "Wine",
];

Vue.prototype.$defaultAvatar = '/assets/user-avatar.png';
Vue.prototype.$user = {};

// Set the base URL of the API
// ApiService.init(process.env.API_BASE_URL)
ApiService.init('https://localhost:8888/api');

// If token exists set header
if (TokenService.getToken()) {
  ApiService.setHeader();
  ApiService.get(`/users/${TokenService.getUserID()}`).then(res => {
    Vue.prototype.$user = res.data;
    
    new Vue({
      vuetify,
      router,
      render: h => h(App)
    }).$mount('#app');
  })
} else {
  new Vue({
    vuetify,
    router,
    render: h => h(App)
  }).$mount('#app');
}



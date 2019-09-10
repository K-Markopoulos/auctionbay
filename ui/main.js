import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import ApiService from './services/api.service'
import TokenService from './services/token.service'
import store from './services/store.service'

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

// Set the base URL of the API
ApiService.init('https://localhost:8888/api');

// If token exists set header
if (TokenService.getToken()) {
  ApiService.setHeader();
  ApiService.get(`/users/${TokenService.getUserID()}`).then(res => {
    store.commit('set', res.data);
    
    new Vue({
      store,
      vuetify,
      router,
      render: h => h(App)
    }).$mount('#app');
  })
} else {
  new Vue({
    store,
    vuetify,
    router,
    render: h => h(App)
  }).$mount('#app');
}



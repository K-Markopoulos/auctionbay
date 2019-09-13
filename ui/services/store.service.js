import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: null,
    unread: 0,
    categories: []
  },
  mutations: {
    setUser (state, user) {
      state.user = user;
    },
    setUnreadCount (state, count) {
      state.unread = count;
    },
    decreaseNotificationCount (state) {
      state.unread--;
    },
    setCategories (state, categories) {
      state.categories = categories;
    }
  }
})
<template>
<v-app>
  <v-app-bar dark>
    <v-toolbar-title style="cursor:pointer">
      <router-link tag="span" to="/">Auction Bay</router-link>
    </v-toolbar-title>

    <v-spacer></v-spacer>

    <v-toolbar-items v-if="isLoggedIn()">
      <v-btn to="/auctions" text> Auctions </v-btn>
      <v-btn to="/users" v-if="isAdmin" text> Users </v-btn>
      <v-icon @click="openNewAuctionForm = true">mdi-plus</v-icon>
      <v-avatar id="user-avatar" size="30">
        <v-img :src="getUserAvatar" class="elevation-1"></v-img>
      </v-avatar>
      <v-menu bottom offset-y>
        <template v-slot:activator="{ on }">
          <div class="d-flex" v-on="on">
            <v-icon v-if="!!notificationCount" class="notification-circle">mdi-circle-outline</v-icon>
            <v-icon>mdi-menu-down</v-icon>
          </div>
        </template>
        <v-list>
        <v-list-item :to="getUserProfileLink">Profile</v-list-item>
        <v-list-item :to="getUserMessagesLink">
          Messages
          <div v-if="!!notificationCount" class="d-flex">
            <span class="px-2">·</span>
            <span v-text="notifIcon" class="notification-count"></span>
          </div>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item @click="logout">Logout</v-list-item>
        </v-list>
      </v-menu>
    </v-toolbar-items>

    <v-toolbar-items v-if="!isLoggedIn()">
      <v-btn to="/auctions" text> Auctions </v-btn>

        <v-divider></v-divider>
      <v-btn to="/login" text> Login </v-btn>
      <v-btn to="/register" text> Register </v-btn>
    </v-toolbar-items>
  </v-app-bar>

  <v-container fluid fill-height justify-center>
    <router-view></router-view>
  </v-container>

  <v-dialog v-model="openNewAuctionForm">
    <create-auction-form :on-cancel="closeDialog" :on-submit="closeDialog"></create-auction-form>
  </v-dialog>
</v-app>
</template>

<script>
import TokenService from './services/token.service';
import CreateAuctionFrom from './components/CreateAuctionForm';
import store from './services/store.service';
import WS from './services/websocker.service';

export default {
  name: 'app',
  components: {
    'create-auction-form': CreateAuctionFrom
  },

  data () {
    return {
      openNewAuctionForm: false
    }
  },

  computed: {
    user() {
      return store.state.user;
    },
    getUserProfileLink() {
      return `/users/${TokenService.getUserID()}`;
    },

    getUserMessagesLink() {
      return `/messages/`;
    },

    getUserAvatar() {
      return this.user.avatar &&
        `/uploads/${this.user.avatar.fid}`||
        this.$defaultAvatar;
    },

    isAdmin() {
      return this.user.role === 'ADMINISTRATOR';
    },

    notificationCount() {
      return store.state.unread;
    },
    notifIcon() {
      return this.notificationCount >= 10 && '10+' || this.notificationCount || ''
    }
  },

  methods: {
    isLoggedIn() {
      return !!TokenService.getToken();
    },

    logout() {
      TokenService.removeToken();
      TokenService.removeUserID();
      WS.disconnect();
      this.$router.push('/login');
    },

    closeDialog() {
      this.openNewAuctionForm = false;
    },
  }
}
</script>

<style>
#app, #toast-container {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}

#user-avatar {
  align-self: center;
  margin: 0px 10px;
}

.notification-circle {
  position: absolute;
  bottom: 20px;
  color: red !important;
}

.notification-count {
  color: red;
  font-weight: 600;
}
</style>

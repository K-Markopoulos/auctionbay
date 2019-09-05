<template>
<v-app>
  <v-app-bar dark>
    <v-toolbar-title>Auction Bay</v-toolbar-title>

    <v-spacer></v-spacer>

    <v-toolbar-items v-if="isLoggedIn()">
      <v-btn to="/" text> Home </v-btn>
      <v-btn to="/auctions" text> Auctions </v-btn>
      <v-btn to="/users" v-if="isAdmin" text> Users </v-btn>
      <v-icon @click="openNewAuctionForm = true">mdi-plus</v-icon>
      <v-avatar id="user-avatar" size="30">
        <v-img :src="getUserAvatar" class="elevation-1"></v-img>
      </v-avatar>
      <v-menu bottom offset-y>
        <template v-slot:activator="{ on }">
          <v-icon v-on="on">mdi-menu-down</v-icon>
        </template>
        <v-list>
         <v-list-item :to="getUserProfile" v-if="isLoggedIn()">Profile</v-list-item>
         <v-divider></v-divider>
         <v-list-item @click="logout" v-if="isLoggedIn()">Logout</v-list-item>
        </v-list>
      </v-menu>
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
    getUserProfile() {
      return `/users/${TokenService.getUserID()}`;
    },

    getUserAvatar() {
      return this.$user.avatar &&
        `/uploads/${this.$user.avatar.fid}`||
        this.$defaultAvatar;
    },

    isAdmin() {
      return this.$user.role === 'ADMINISTRATOR';
    }
  },

  methods: {
    isLoggedIn() {
      return !!TokenService.getToken();
    },

    logout() {
      TokenService.removeToken();
      TokenService.removeUserID();
      this.$router.push('/login');
    },

    closeDialog() {
      this.openNewAuctionForm = false;
    }
  }
}
</script>

<style>
#app {
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
</style>

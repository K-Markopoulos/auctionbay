<template>
<v-app>
  <v-app-bar dark>
    <v-toolbar-title>Auction Bay</v-toolbar-title>

    <v-spacer></v-spacer>

    <v-toolbar-items>
      <v-btn to="/" text> Home </v-btn>
      <v-btn to="/auctions" text> Auctions </v-btn>
      <v-btn to="/profile" text> Profile </v-btn>
      <v-btn to="/users" text> Users </v-btn>
      <v-btn @click="logout" v-if="isLoggedIn()" text> Logout </v-btn>
    </v-toolbar-items>
  </v-app-bar>

  <v-container fluid fill-height justify-center>
    <router-view></router-view>
  </v-container>
</v-app>
</template>

<script>
import TokenService from './services/token.service';
export default {
  name: 'app',
  data () {
    return {
      
    }
  },
  methods: {
    isLoggedIn() {
      return !!TokenService.getToken();
    },
    logout() {
      TokenService.removeToken();
      this.$router.push('/login');
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
</style>

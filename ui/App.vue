<template>
<v-app>
    <router-link to="/"> Home </router-link>
    <router-link to="/auctions"> Auctions </router-link>
    <router-link to="/profile"> Profile </router-link>
    <router-link to="/users"> Users </router-link>

    <v-container fluid>
      <router-view></router-view>
    </v-container>
</v-app>
</template>

<script>
export default {
  name: 'app',
  data () {
    return {
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

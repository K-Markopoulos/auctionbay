<template>
  <div>
    <ul>
      <li v-for="user in users" :key="user.id">
        {{ user.username }}
      </li>
    </ul>
  </div>
</template>

<script>
import ApiService from '../services/api.service';
  export default {
    name: 'UsersList',
    data () {
      return {
        users: []
      }
    },
    mounted() {
      ApiService.get('/users').then(this.onSuccess).catch(this.onError);
    },
    methods: {
      onSuccess: function(res) {
        this.users = res.data;
      },

      onError: function(res) {
        console.log('Failed to fetch users');
      } 
    }
  }
</script>

<style>
</style>

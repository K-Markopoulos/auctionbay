<template>
  <v-flex class="align-self-start">

    <user-list></user-list>

    <v-divider class="ma-8"></v-divider>

    <h1> Auctions</h1>
    <div class="d-flex justify-space-around ma-5">
      <div>
        Export auctions
        <v-btn @click="exportAuctions('xml')" color="primary"><v-icon class="left mr-2">mdi-xml</v-icon>XML</v-btn>
        <v-btn @click="exportAuctions('json')" color="primary"><v-icon class="left mr-2">mdi-json</v-icon>JSON</v-btn>
      </div>
    </div>
  </v-flex>
</template>

<script>
import ApiService from '../services/api.service';
import UserList from './UsersList';

  export default {
    name: 'AdminPanel',
    components: {
      'user-list': UserList
    },
    data () {
      return {

      }
    },

    computed: {

    },

    mounted() {

    },

    methods: {
      exportAuctions: function(type) {
        ApiService.get(`auctions/export/${type}`).then((response) => {
          const data = type === 'json'
            ? JSON.stringify(response.data, null, 2)
            : response.data;
          const url = window.URL.createObjectURL(new Blob([data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `Auctions.${type}`);
          document.body.appendChild(link);
          link.click();
        });
      },
    }
  }
</script>

<style>
</style>

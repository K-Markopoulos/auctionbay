<template>
  <v-container align-start fluid grid-list-md>
    <v-layout wrap>
      <v-flex v-for="auction in auctions" :key="auction.id">
        <auction-card :auction="auction"></auction-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import ApiService from '../services/api.service';
  import AuctionCard from './AuctionCard';

  export default {
    name: 'AuctionsList',
    components: {
      'auction-card': AuctionCard
    },
    data () {
      return {
        auctions: []
      }
    },
    
    mounted() {
      ApiService.get('/auctions').then(this.onSuccess).catch(this.onError);
    },
    
    methods: {
      onSuccess: function(res) {
        this.auctions = res.data;
      },

      onError: function(res) {
        console.log('Failed to fetch auctions');
      },
    },


  }
</script>

<style>
</style>

<template>
  <v-container align-start fluid grid-list-md>
    <v-layout wrap>
      <v-flex v-for="auction in auctions" :key="auction.id">
        <auction-card :auction="auction"></auction-card>
      </v-flex>
    </v-layout>
    <v-pagination
      v-model="page" :disabled="loading"
      :length="totalPages"
      :page="page"
      total-visible="7"
      circle
      next-icon="chevron_right"
      prev-icon="chevron_left"
      @input="getAuctions"
    ></v-pagination>
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
        auctions: [],
        page: 1,
        limit: 16,
        totalPages: 0,
        loading: true
      }
    },
    
    mounted() {
      this.getAuctions();
    },
    
    methods: {
      getAuctions: function() {
        this.loading = true;
        const query = `?page=${this.page - 1}&limit=${this.limit}`;
        ApiService.get(`/auctions${query}`).then(this.onSuccess).catch(this.onError);
      },

      onSuccess: function(res) {
        this.loading = false;
        this.auctions = res.data.data;
        this.totalPages = Math.ceil(res.data.total / this.limit);
      },

      onError: function(res) {
        this.loading = false;
        console.log('Failed to fetch auctions');
      },
    },


  }
</script>

<style>
</style>

<template>
  <v-card class="my-12">
  <v-card-title>
    <slot></slot>
  </v-card-title>
    <v-layout align-start class="horizontal-scroll">
      <v-flex v-for="auction in auctions" :key="auction.id">
        <div class="pa-2">
          <auction-card :auction="auction"></auction-card>
        </div>
      </v-flex>
    </v-layout>
    <div v-if="!this.auctions || this.auctions.length === 0">
      <h2 class="grey lighten-4 no-data">No data</h2>
    </div>
  </v-card>
</template>

<script>
import ApiService from '../services/api.service';
import AuctionCard from './AuctionCard';
  export default {
    name: 'AuctionsSlider',
    components: {
      'auction-card': AuctionCard
    },
    props: [ 'config' ],
    data () {
      return {
        auctions: [],
        filters: {}
      }
    },
    mounted() {
      this.filters = {
        page: 0,
        limit: 5,
        name: '',
        category: '',
        active: '',
        sortBy: '',
        order: '',
        ...this.config
      };
      if (this.filters.recommended) {
        this.getRecommended();
      } else {
        this.getAuctions();
      }
    },
    
    methods: {
      getAuctions: function() {
        const query = `page=${this.filters.page}` + 
          `&limit=${this.filters.limit}` + 
          `&name=${this.filters.name}` + 
          `&category=${this.filters.category}` + 
          `&active=${this.filters.active}` +
          `&sortBy=${this.filters.sortBy}` + 
          `&order=${this.filters.order}`;

        ApiService.get(`/auctions?${query}`).then(res => {
          this.auctions = res.data.data;
        }).catch(err => {
          console.log('Failed to fetch auctions');
        });
      },

      getRecommended: function() {
        ApiService.get('/auctions/recommend').then(res => {
          this.auctions = res.data;
          console.log(this.acutions);
        }).catch(err => {
          console.log('Failed to fetch recommended auctions');
        });
      },
    }
  }
</script>

<style>
.horizontal-scroll {
  overflow-x: auto;
}
.no-data {
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: x-large;
}
</style>

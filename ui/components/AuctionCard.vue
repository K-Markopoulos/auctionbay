<template>
  <v-card class="auction-card">
    <v-card-title v-text="auction.name"></v-card-title>
    <v-card-text v-text="auction.description"></v-card-text>
    <v-card-actions>
      <v-btn text :to="link" >Show details</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
  export default {
    name: 'AuctionCard',
    props: [ 'auction' ],
    data () {
      return {
        
      }
    },

    computed: {
      link: function() {
        return `/auctions/${this.auction.id}`;
      }
    }
  }
</script>

<style>
.auction-card {
  width: 400px;
  height: 200px;
}
</style>

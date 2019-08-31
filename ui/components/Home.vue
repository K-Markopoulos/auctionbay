<template>
  <div style="width: 100%;">
    <v-parallax class="stick-to-top" dark height="300" :src="banner">
      <v-row align="center" justify="center" class="banner-text">
        <h1 class="display-2 font-weight-thin mb-4">Welcome to Auction Bay</h1>
        <h4 class="subheading">Find <b>{{auctionsCount}}</b> products over <b>{{categoriesCount}}</b> categories!</h4>
      </v-row>
    </v-parallax>
    <div class="mx-10">
      <auctions-slider :config="{ active, sortBy: 'ends', order: 'asc' }">Closing soon</auctions-slider>
      <auctions-slider :config="{ active, sortBy: 'bidsCount', order: 'desc' }">Trending</auctions-slider>
      <auctions-slider>Picked for you (not really)</auctions-slider>
    </div>
  </div>
</template>

<script>
  import AuctionsSlider from './AuctionsSlider.vue'
  import ApiService from '../services/api.service'

  export default {
    name: 'Home',
    components: {
      'auctions-slider': AuctionsSlider
    },

    data () {
      return {
        banner: 'https://cdn.vuetifyjs.com/images/backgrounds/vbanner.jpg',
        auctionsCount: '',
        categoriesCount: this.$categories.length
      }
    },

    created() {
      this.getAuctionNumber()
    },

    methods: {
      getAuctionNumber: function() {
        const query = `page=0&limit=1`;
        ApiService.get(`/auctions?${query}`).then(res => {
          this.auctionsCount = res.data.total;
        }).catch(err => console.log(err));
      }
    }
  }
</script>

<style>
.stick-to-top {
    margin: -12px -12px 0;
}
.banner-text {
  flex-direction: column;
}
</style>

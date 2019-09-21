<template>
  <div style="width: 100%; align-self: flex-start;">
    <v-parallax class="stick-to-top" dark height="300" :src="banner">
      <v-row align="center" justify="center" class="banner-text">
        <h1 class="display-2 font-weight-thin mb-4">Welcome to Auction Bay</h1>
        <h4 class="subheading">Find <b>{{auctionsCount}}</b> products over <b>{{categoriesCount}}</b> categories!</h4>
      </v-row>
    </v-parallax>
    <div class="mx-10">
      <auctions-slider :config="{ active: 1, sortBy: 'ends', order: 'asc' }">Closing soon</auctions-slider>
      <auctions-slider :config="{ active: 1, sortBy: 'bidsCount', order: 'desc' }">Most bids</auctions-slider>
      <auctions-slider :config="{ recommended: 1 }" v-if="isLoggedin">You may also like</auctions-slider>
    </div>
  </div>
</template>

<script>
  import AuctionsSlider from './AuctionsSlider.vue'
  import ApiService from '../services/api.service'
  import store from '../services/store.service';
  
  export default {
    name: 'Home',
    components: {
      'auctions-slider': AuctionsSlider
    },

    data () {
      return {
        banner: '/assets/banner.jpg',
        auctionsCount: '',
      }
    },

    created() {
      this.getAuctionNumber()
    },

    computed: {
      isLoggedin() {
        return !!store.state.user;
      },
      categories() {
        return store.state.categories;
      },
      categoriesCount() {
        return this.categories.length;
      }
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
.v-parallax img {
    filter: brightness(0.5);
}
</style>

<template>
  <v-container id="auctions-container" fluid grid-list-md>
    <v-toolbar dense floating>
      <v-text-field
        v-model="searchQuery"
        label="Search auctions"
        name="search"
        prepend-icon="search"
        hide-details
        single-line
        @input="debounceSearch"
      ></v-text-field>

      <v-select
        v-model="searchCategory"
        label="Category"
        name="category"
        prepend-icon="category"
        hide-details
        single-line
        :items="categories"
        @input="getAuctions"
        >
      </v-select>

      <span class="ml-6">Auctions per page:</span>
      <v-select
        hide-details
        single-line
        name="limit"
        label="Auctions per page"
        v-model="limit"
        :items="[16,32,50]"
        style="max-width: 50px"
        @input="getAuctions"
        >
      </v-select>
    </v-toolbar>
    <v-layout align-start wrap>
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
  import store from '../services/store.service';

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
        loading: true,
        searchQuery: '',
        searchCategory:'',
        debounce: null
      }
    },
    
    mounted() {
      this.getAuctions();
    },
    
    computed: {
      categories() {
        return store.state.categories;
      }
    },

    methods: {
      getAuctions: function() {
        this.loading = true;
        const query = `page=${this.page - 1}&limit=${this.limit}&search=${this.searchQuery}&category=${this.searchCategory}`;

        ApiService.get(`/auctions?${query}`).then(this.onSuccess).catch(this.onError);
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

      debounceSearch: function () {
        const self = this;
        clearTimeout(this.debounce);
        this.debounce = setTimeout(() => {
          self.page = 1;
          self.getAuctions();
        }, 500);
      }
    },


  }
</script>

<style>
#auctions-container {
  align-self: flex-start;
}
</style>

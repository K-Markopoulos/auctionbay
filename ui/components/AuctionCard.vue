<template>
  <v-card
    class="mx-auto"
    width="400"
    :to="getLink"
  >
    <v-img
      class="white--text"
      height="200px"
      :src="getHeaderImg"
    >
      <v-card-title class="align-end fill-height shadow" v-text="auction.name"></v-card-title>
    </v-img>

    <v-card-text class="truncate" v-text="auction.description"></v-card-text>
      <span v-text="getStatus"></span>
    

    <v-card-actions>
      <v-avatar class="mr-2" size="30" color="grey">
        <v-img
          class="elevation-4"
          :src="getUserAvatar"
        ></v-img>
      </v-avatar>
      <span v-text="getSellerDisplayName"></span>
      <span>(</span><span v-text="getSellerRating"></span>
      <v-icon class="star-icon">mdi-star</v-icon>
      <span>)</span>


      <v-row
        align="center"
        justify="end"
        class="ma-0"
        style="width: -webkit-fill-available;"
      >
        <span v-if="auction.buyPrice">
          <v-icon class="mr-1">mdi-cash</v-icon>
          <span class="subheading mr-2" v-text="auction.buyPrice + '$'"></span>
          <span class="mr-1">·</span>
        </span>
        <v-icon class="mr-1">mdi-gavel</v-icon>
        <span class="subheading" v-text="getBidDetails"></span>
      </v-row>
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
      getLink: function() {
        return `/auctions/${this.auction.id}`;
      },

      getHeaderImg: function() {
        return this.auction.images && this.auction.images.length
          ? `/uploads/${this.auction.id}/${this.auction.images[0].fid}`
          : '/assets/no-photo-available.png';
      },

      isActive: function() {
        return moment(this.auction.ends) > moment() && !this.auction.buyer && !this.auction.lastBidder;
      },

      getStatus: function() {
        if (this.isActive) {
          return 'Ends ' + moment(this.auction.ends).fromNow()
        }
        return 'Closed'

      },

      getSellerDisplayName: function() {
        return `${this.auction.seller.username} `; 
      },

      getSellerRating: function() {
        return this.auction.seller.sellerRating.avg;
      },

      getBidDetails: function() {
        return `${this.auction.current}$ (${this.auction.bids.length})`
      },

      getUserAvatar: function() {
        return this.auction.seller.avatar &&
          `/uploads/${this.auction.seller.avatar.fid}`||
          this.$defaultAvatar;
      }
    },
    methods: {

    }
  }
</script>

<style>
.auction-card {
  width: 400px;
  height: 200px;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.star-icon {
  color: #efb000 !important;
}

.shadow {
  background-image: linear-gradient(to bottom, rgba(255,0,0,0), rgba(255,0,0,0), rgba(255,0,0,0),rgba(0,0,0,0.5));
  text-shadow: 1px 1px 7px black;
}
</style>

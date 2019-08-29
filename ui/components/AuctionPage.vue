<template>
  <v-container fluid fill-height>
    <v-layout>
      <v-flex large color="grey">
        <v-img height="600" class="elevation-2" :src="randomImg"></v-img>
      </v-flex>
      <v-flex small>
        <v-card outlined>
          <v-card-title v-text="auction.name"></v-card-title>
          <v-card-text v-text="auction.description"></v-card-text>
          <div v-text="getStatusString"></div>

          <v-card-text>
            <div class="title text--primary">Highest bid: {{auction.current}}$</div>
            <v-row class="ma-5">
              <v-text-field cols="8" v-model="bidValue" name="bidValue" validate-on-blur
                label="Enter your bid value" :rules="bidValueRules">
              </v-text-field>
              <v-btn class="primary" @click="openBidDialog">Place your bid</v-btn>
            </v-row>
          </v-card-text>
          <v-card-text v-if="auction.buyPrice">
            <div class="title text--primary">Buy it for: {{auction.buyPrice}}$</div>
            <v-btn class="primary" @click="buyConfirmDialog = true">Buy it now</v-btn>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>

    <v-dialog v-model="bidConfirmDialog" width="500">
      <v-card>
        <v-card-title primary-title class="headline grey lighten-3">
          Submit your bid
        </v-card-title>

        <v-card-text class="subtitle-1 black--text">
          You are about to place a bid of <b>{{bidValue}}$</b> for <b v-text="auction.name"></b>.
        </v-card-text>
        <v-card-text>
          This action is not reversible!
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn small text @click="bidConfirmDialog = false">
            Cancel
          </v-btn>
          <div class="flex-grow-1"></div>
          <v-btn color="primary" text @click="submitBid">
            Submit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="buyConfirmDialog" width="500">
      <v-card>
        <v-card-title primary-title class="headline grey lighten-3">
          <span>Buy <b v-text="auction.name"></b></span>
        </v-card-title>

        <v-card-text class="subtitle-1 black--text">
          You are about to buy <b v-text="auction.name"></b> for <b>{{bidValue}}$</b>.
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn small text @click="buyConfirmDialog = false">
            Cancel
          </v-btn>
          <div class="flex-grow-1"></div>
          <v-btn color="primary" text @click="submitBuy">
            Submit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
  import ApiService from '../services/api.service';
  
  export default {
    name: 'AuctionPage',
    props: ['id'],
    mounted() {
      this.getAuction();
    },

    data() {
      return {
        auction: {},
        randomImg: "https://images.unsplash.com/photo-1508138221679-760a23a2285b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80",
        loading: true,
        bidConfirmDialog: false,
        buyConfirmDialog: false,
        bidValue: '',
        bidValueRules: [
          v => !v || v > this.auction.current || "Value must be higher than " + this.auction.current + "$ (Current highest)"
        ],
      }
    },

    computed: {
      getStatusString: function() {
        if (moment(this.auction.ends) > moment()) {
          return 'Ends ' + moment(this.auction.ends).fromNow();
        }
        return 'Closed';
      },

      getHighestBid: function() {
        return this.auction.current;
      },

      getBuyPrice: function() {
        return this.auction.buyPrice;
      }
    },

    methods: {
      getAuction: function() {
        this.loading = true;
        ApiService.get(`/auctions/${this.id}`).then(res => {
          this.loading = false;
          this.auction = res.data;
        }).catch(err => console.log(err));
      },

      openBidDialog: function() {
        if (this.bidValue > this.auction.current) {
          this.bidConfirmDialog = true;
        }
      },

      submitBid: function() {
        const data = {
          amount: this.bidValue
        };
        ApiService.post(`/auctions/${this.id}/bid`, data).then(res => {
          this.auction = res.data;
          this.bidConfirmDialog = false;
        }).catch(err => console.log(err));
      },

      submitBuy: function() {

      }
    }
  }
</script>

<style>
</style>

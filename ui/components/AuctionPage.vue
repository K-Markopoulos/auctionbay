<template>
  <v-container fluid fill-height>
    <v-row style="align-self: flex-start;">
      <v-col cols="8" class="elevation-1 grey lighten-3">
          <div v-if="!hasImages()" class="no-image">
            No image available
          </div>
        <v-window
          id="auction-images"
          v-model="imgIndex"
        >
          <v-window-item
            v-for="img in auction.images"
            :key="img.fid"
          >
            <div class="image-window lighten-1">
              <img class="fit-image" :src="`uploads/${auction.id}/${img.fid}`">
            </div>
          </v-window-item>
        </v-window>
        <v-card-actions class="justify-space-between" v-if="hasImages()">
          <v-btn
            text
            @click="prev"
          >
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <v-item-group
            v-model="imgIndex"
            class="text-center"
            mandatory
          >
            <v-item
              v-for="n in auction.images.length"
              :key="`btn-${n}`"
              v-slot:default="{ active, toggle }"
            >
              <v-btn
                :input-value="active"
                icon
                small
                @click="toggle"
              >
                <v-icon>mdi-record</v-icon>
              </v-btn>
            </v-item>
          </v-item-group>
          <v-btn
            text
            @click="next"
          >
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </v-card-actions>
      </v-col>
      <v-col cols="4">
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
      </v-col>
    </v-row>

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
        auction: {
          images: []
        },
        loading: true,
        bidConfirmDialog: false,
        buyConfirmDialog: false,
        bidValue: '',
        bidValueRules: [
          v => !v || v > this.auction.current || "Value must be higher than " + this.auction.current + "$ (Current highest)"
        ],
        imgIndex: 0
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
          this.imgIndex = 0;
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

      },

      hasImages: function() {
        return this.auction.images && this.auction.images.length > 0;
      },

      next: function() {
        console.log('next', this.imgIndex);
        this.imgIndex = this.imgIndex + 1 === this.auction.images.length
          ? 0
          : this.imgIndex + 1
      },

      prev: function() {
        console.log('prev', this.imgIndex);
        this.imgIndex = this.imgIndex - 1 < 0
          ? this.auction.images.length - 1
          : this.imgIndex - 1
      },
    }
  }
</script>

<style>
#auction-images .v-window__container,
#auction-images .v-window-item {
  height: 600px;
}

.image-window {
  max-width:100%;
  max-height:100%;
  height: 100%;
  width: auto;
  background: #cecbcb;
}

.fit-image {
    height: 100%;
    width: 100%;
    object-fit: contain;
}

.no-image {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: x-large;
}
</style>

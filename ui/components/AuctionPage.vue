<template>
  <div style="height: 100%; width: 100%;" v-if="!loading">
    <div class="d-flex justify-end" v-if="isOwner && !isBought">
      <span v-if="readonly" class="action-helper action-button">Cannot edit or delete this auction, anymore.</span>
      <v-btn 
        @click="editDialog = true"
        :disabled="readonly"
        text outlined color="primary" class="action-button"
      >Edit Auction</v-btn>
      <v-btn
        @click="deleteConfirmDialog = true"
        :disabled="readonly"
        text outlined color="error" class="action-button" 
      >Delete Auction</v-btn>
    </div>

    <div class="d-flex justify-center" v-if="isOwner && isBought">
      <span class="action-helper action-button">This item has been bought!</span>
      <v-btn 
        @click="contactBuyer"
        text outlined color="primary" class="action-button"
      >Contact buyer</v-btn>
    </div>

    <div class="d-flex justify-center" v-if="isWinner">
      <span class="action-helper action-button">You have won this auction!</span>
      <v-btn 
        @click="contactSeller"
        text outlined color="primary" class="action-button mr-10"
      >Contact seller</v-btn>
      <v-rating
        background-color="orange lighten-3"
        color="orange"
        v-model="rating"
        hover
        :readonly="auction.rating"
      ></v-rating>
      <v-btn
        v-if="!auction.rating"
        :disabled="!rating"
        @click="submitRating"
        text outlined color="primary" class="action-button"
      >Rate now</v-btn>
    </div>

    <message-box v-if="showMessageBox" v-bind="messageProps"></message-box>
    
    <v-container fluid fill-height v-if="auction">
      <v-row style="align-self: flex-start;">
        <v-col cols="8">
          <div class="elevation-1 grey lighten-3 mb-5">
            <div v-if="!hasImages()" class="no-image">
              No image available
            </div>
            <div  v-if="auction.images.length > 0">
              <v-window
                id="auction-images"
                v-model="imgIndex"
                v-if="auction.images"
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
              </div>
          </div>
          <div class="elevation-1 grey lighten-3 mb-5">
            <div class="location-container">
              <div class="location-details">
                <h2>Location: <span>{{auction.location.address}}</span></h2>
                <h2>Country: <span>{{auction.location.country}}</span></h2>
              </div>
              <div id="locationMap"><span v-if="noMap">No Map available</span></div>
            </div>
          </div>

          <div class="elevation-1 grey lighten-3 mb-5">
            <div class="box-container">
              <h1>Description</h1>
              <v-divider></v-divider>
              <div class="description" v-text="auction.description"></div>
            </div>
          </div>
        </v-col>
        <v-col cols="4">
          <v-card outlined class="mb-8">
            <v-card-title v-text="auction.name"></v-card-title>
            <v-divider></v-divider>
            <div class="pa-5 end-date">
              <span v-text="getStatusString"></span>
              <span v-text="getEndDate"></span>
            </div>

            <v-card-text v-if="isActive">
              <div class="title text--primary">Highest bid: {{auction.current}}$</div>
              <v-row class="ma-5" v-if="isRegistered" >
                <v-text-field cols="8" v-model="bidValue" name="bidValue" validate-on-blur
                  label="Enter your bid value" :rules="bidValueRules">
                </v-text-field>
                <v-btn class="primary" @click="openBidDialog">Place your bid</v-btn>
              </v-row>
            </v-card-text>
            <v-card-text v-if="isActive && !!auction.buyPrice">
              <div class="title text--primary">Buy it for: {{auction.buyPrice}}$</div>
              <v-btn v-if="isRegistered"  class="primary" @click="buyConfirmDialog = true">Buy it now</v-btn>
            </v-card-text>
          </v-card>

          <v-card outlined v-if="auction.seller && auction.seller.sellerRating">
            <v-card-title>About the seller</v-card-title>

            <v-divider></v-divider>


            <v-card-title class="d-flex">
              <v-avatar class="mr-4" size="50" color="grey">
                <v-img class="elevation-4" :src="getUserAvatar"></v-img>
              </v-avatar>
              <span class="mr-4">{{auction.seller.username}}</span>
              <v-rating
                v-model="auction.seller.sellerRating.avg"
                readonly
                half-icon
                half-increment
                background-color="orange lighten-3"
                color="orange"
              ></v-rating>
            </v-card-title>
            <v-card-text>
              <div class="d-flex" v-for="r in reservedRange(6)" :key="r">
                <v-rating
                  :value="r"
                  readonly
                  dense
                  background-color="orange lighten-3"
                  color="orange"
                  class="pr-2"
                ></v-rating>
                <h3 class="rating-number">{{auction.seller.sellerRating[r]}}</h3>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!--  Popup dialogs -->

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
            You are about to buy <b v-text="auction.name"></b> for <b>{{auction.buyPrice}}$</b>.
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

      <v-dialog v-model="editDialog" v-if="editDialog">
        <update-auction-form
          :auction-data="auction"
          :on-close="() => editDialog = false"
          :on-submit="refresh"
        ></update-auction-form>
      </v-dialog>

      <v-dialog v-model="deleteConfirmDialog" width="500">
        <v-card>
          <v-card-title primary-title class="headline grey lighten-3">
            Delete your auction
          </v-card-title>

          <v-card-text class="subtitle-1 black--text">
            You won't be able to restore this auction. Are you sure?
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-btn small text @click="deleteConfirmDialog = false">
              Cancel
            </v-btn>
            <div class="flex-grow-1"></div>
            <v-btn color="primary" text @click="deleteAuction">
              Yes, delete it.
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script>
  import ApiService from '../services/api.service';
  import LocationService from '../services/location.service';
  import store from '../services/store.service';
  import UpdateAuctionForm from './UpdateAuctionForm';
  import MessageBox from './MessageBox';

  export default {
    name: 'AuctionPage',
    props: ['id'],
    components: {
      'update-auction-form': UpdateAuctionForm,
      'message-box': MessageBox
    },
    created() {
      this.getAuction();
    },
    data() {
      return {
        auction: null,
        loading: true,
        bidConfirmDialog: false,
        buyConfirmDialog: false,
        deleteConfirmDialog: false,
        editDialog: false,
        showMessageBox: false,
        messageProps: {},
        bidValue: '',
        bidValueRules: [
          v => !v || v > this.auction.current || "Value must be higher than " + this.auction.current + "$ (Current highest)"
        ],
        imgIndex: 0,
        noMap: false,
        rating: null
      }
    },

    computed: {
      user() {
        return store.state.user || {};
      },
      isOwner() {
        return this.auction && this.auction.seller && this.user && this.user.id === this.auction.seller.id
      },
      isWinner() {
        return this.user.id === this.auction.lastBidder || this.user.id === this.auction.buyer;
      },
      isRegistered() {
        return !!this.user;
      },
      isBought() {
        return this.auction.buyer || this.auction.lastBidder;
      },
      isActive: function() {
        return moment(this.auction.ends) > moment() && !this.isBought;
      },
      readonly: function() {
        return this.auction && this.auction.bids && this.auction.bids.length > 0 || !this.isActive;
      },
      getEndDate: function() {
        return this.isActive
          ? moment(this.auction.ends).format('DD-MM-YYYY h:mm a')
          : '';
      },

      getStatusString: function() {
        return this.isActive
          ? 'Ends ' + moment(this.auction.ends).fromNow()
          : 'Auction has ended';
      },

      getHighestBid: function() {
        return this.auction.current;
      },

      getBuyPrice: function() {
        return this.auction.buyPrice;
      },

      getUserAvatar: function() {
        return this.auction.seller.avatar &&
          `/uploads/${this.auction.seller.avatar.fid}`||
          this.$defaultAvatar;
      },
    },

    methods: {
      getAuction: function() {
        this.loading = true;
        ApiService.get(`/auctions/${this.id}`).then(res => {
          this.loading = false;
          this.auction = res.data;
          this.rating = this.auction.rating;
          this.imgIndex = 0;

          this.loadMap();
        }).catch(err => console.log(err));
      },

      openBidDialog: function() {
        if (this.bidValue > this.auction.current) {
          this.bidConfirmDialog = true;
        }
      },

      openEditDialog: function() {
        if (this.bidValue > this.auction.current) {
          this.bidConfirmDialog = true;
        }
      },

      contactSeller: function() {
        this.messageProps = {
          dialog: true,
          to: this.auction.seller,
          auctionId: this.auction.id,
          onCancel: () => this.showMessageBox = false,
          onSubmit: () => this.showMessageBox = false,
        },
        this.showMessageBox = true;
      },

      contactBuyer: function() {
        this.messageProps = {
          dialog: true,
          to: this.auction.buyer || this.auction.lastBidder,
          auctionId: this.auction.id,
          onCancel: () => this.showMessageBox = false,
          onSubmit: () => this.showMessageBox = false,
        },
        this.showMessageBox = true;
      },

      submitBid: function() {
        const data = {
          amount: this.bidValue
        };
        ApiService.post(`/auctions/${this.id}/bid`, data).then(res => {
          this.auction = res.data;
          this.bidConfirmDialog = false;
          this.bidValue = '';
        }).catch(err => console.log(err));
      },

      submitBuy: function() {
        ApiService.post(`/auctions/${this.id}/buy`, {}).then(res => {
          this.auction = res.data;
          this.buyConfirmDialog = false;
        }).catch(err => console.log(err));
      },

      submitRating: function() {
        ApiService.post(`/auctions/${this.id}/rate`, {rating: this.rating}).then(res => {
          this.auction = res.data;
        }).catch(err => console.log(err));
      },

      deleteAuction: function() {
        ApiService.delete(`/auctions/${this.id}`).then(res => {
          this.$router.push(`/`);
        }).catch(err => console.log(err));
      },

      refresh: function() {
        this.editDialog = false;
        this.getAuction();
      },

      loadMap: function() {
        if (this.auction.location.lat &&this.auction.location.lat) {
          const coords = [this.auction.location.lat,this.auction.location.lat];
          setTimeout(() => {
            LocationService.createMap('locationMap', coords);
          }, 200);
        } else {
          this.noMap = true;
        }
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

      reservedRange: function(n) {
        return [...Array(n).keys()].slice(1).reverse();
      }
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
  height: 500px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: x-large;
}

.location-container {
  display: flex;
  padding: 30px;
}

.box-container {
  padding: 30px;
}

.description {
  color: rgba(0,0,0,.87)!important;
  text-align: justify;
}

.location-details {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 30px;
}

#locationMap {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border: 1px solid black;
  border-radius: 5px;
  z-index: 1;
}

#locationMap > div {
  min-height: 250px;
}

.rating-number {
  color: rgba(0,0,0,.87);
  margin-top: auto;
  margin-bottom: auto;
  font-weight: 100;
}

.end-date {
  display: flex;
  flex-direction: column;
}

.action-button {
  float: right;
  margin-right: 20px !important;
}
.action-helper {
  height: 36px;
  line-height: 36px;
}
</style>

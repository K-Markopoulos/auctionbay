<template>
  <v-card class="elevation-12">
    <v-toolbar color="primary" dark flat>
      <v-toolbar-title>Create new Auction</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>
    <v-card-text>
      <v-form ref="form" v-model="valid">
        <v-text-field
          v-model="auction.name"
          label="Title"
          name="name"
          type="text"
          :rules="[v => !!v || 'Title is required']"
        ></v-text-field>

        <v-textarea
          v-model="auction.description"
          label="Description"
          name="description"
          type="text"
        ></v-textarea>

        <v-combobox
            v-model="auction.category"
            :items="$categories"
            chips
            clearable
            label="Categories"
            multiple
          >
            <template v-slot:selection="{ attrs, item, select, selected }">
              <v-chip
                v-bind="attrs"
                :input-value="selected"
                @click="select"
                v-text="item"
              >
              </v-chip>
            </template>
          </v-combobox>

          <v-file-input
            v-model="attachments"
            accept="image/png, image/jpeg, image/bmp"
            prepend-inner-icon="mdi-camera"
            prepend-icon=""
            label="Upload images of the item"
            multiple
            chips
            :rules="[
              v => v.every(x => x.size < 2000000) || 'Image should be less than 2MB!',
              v => v.length <= 10 || 'Max 10 images.'
            ]"
          ></v-file-input>

        <v-divider></v-divider>
        
        <v-layout wrap justify-space-between>
          <v-flex xs12 md3>
            <v-text-field
              v-model="auction.firstBid"
              label="First bid"
              name="firstBid"
              type="text"
              :rules="[v => !!v || 'Frist bid is required']"
            ></v-text-field>
          </v-flex>

          <v-flex xs12 md3 class="d-flex">
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-checkbox v-model="enableBuyPrice" v-on="on"></v-checkbox>
              </template>
              <span>Enable Purchase and set a buy price</span>
            </v-tooltip>
            <v-text-field
              v-model="auction.buyPrice"
              :disabled="!enableBuyPrice"
              label="Buy price"
              name="buyPrice"
              type="text"
            ></v-text-field>
          </v-flex>

          <v-flex class="d-flex" xs12 md3>
             <v-menu
              ref="menu"
              v-model="menu"
              transition="scale-transition"
              offset-y
              full-width
              max-width="290px"
              min-width="290px"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  v-model="endsDate"
                  label="End date"
                  prepend-icon="event"
                  readonly
                  v-on="on"
                  :rules="[v => !!v || 'End date is required']"
                ></v-text-field>
              </template>
              <v-date-picker v-model="endsDate" :min="today"></v-date-picker>
            </v-menu>
            <v-menu
              ref="menu"
              v-model="menu2"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              full-width
              max-width="290px"
              min-width="290px"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  v-model="endsTime"
                  label="End time"
                  prepend-icon="event"
                  readonly
                  v-on="on"
                  :rules="[v => !!v || 'End time is required']"
                ></v-text-field>
              </template>
              <v-time-picker ref="timer" v-model="endsTime" :min="nowTime">
                <div class="flex-grow-1"></div>
                <v-btn text color="primary" @click="menu2 = false">OK</v-btn>
              </v-time-picker>
            </v-menu>
          </v-flex>
        </v-layout>


        <v-divider></v-divider>

        <v-text-field
          v-model="auction.location.address"
          label="Address"
          name="address"
          type="text"
          :rules="[v => !!v || 'Address is required']"
        ></v-text-field>

        <v-text-field
          v-model="auction.location.country"
          label="Country"
          name="country"
          type="text"
          :rules="[v => !!v || 'Country is required']"
        ></v-text-field>

        <v-layout wrap justify-space-between>
          <v-flex xs12 md5>
            <v-text-field
              v-model="auction.location.lat"
              label="Latitude"
              name="latitude"
              type="text"
            ></v-text-field>
          </v-flex>

          <v-flex xs12 md5>
            <v-text-field
              v-model="auction.location.lon"
              label="Longtitude"
              name="longtitude"
              type="text"
            ></v-text-field>
          </v-flex>
        </v-layout>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-btn @click="onCancel" text>Cancel</v-btn>
      <v-spacer></v-spacer>
      <v-btn :disabled="!valid" color="primary" @click="onFormSubmit">Submit</v-btn>
      <v-spacer></v-spacer>
    </v-card-actions>
  </v-card>
</template>

<script>
  import ApiService from '../services/api.service';
  import TokenService from '../services/token.service';

  export default {
    name: 'CreateAuctionForm',
    props: [
      'onCancel',
      'onSubmit'
    ],
    data () {
      return {
        valid: true,
        auction: {
          location: {},
          images: []
        },
        attachments: [],
        endsDate: '',
        endsTime: '',
        menu: false,
        menu2: false,
        enableBuyPrice: false
      }
    },

    computed: {
      today: function() {
        return new Date().toISOString().substring(0,10);
      },
      nowTime: function() {
        return moment().format('h:mm');
      }
    },

    methods: {
      onFormSubmit: function() {
        this.$refs.form.validate();
        if (!this.valid) {
          return
        }
        this.auction.ends = new Date(this.endsDate + ' ' + this.endsTime).toISOString();

        const formData = this.buildFormData();
        ApiService.post('/auctions/', formData, true).then(this.onSuccess).catch(this.onError);
      },

      buildFormData: function() {
        const formData = new FormData();
        formData.append('auction', JSON.stringify(this.auction));
        this.attachments.forEach(file => formData.append('images', file));
        return formData;
      },

      onSuccess: function(res) {
        const id = res.data.id;
        this.$router.push(`/auctions/${id}`);
      },

      onError: function(res) {
        console.log('Failed to create new auction:', res.message);
      },
    }
  }
</script>

<style>
</style>

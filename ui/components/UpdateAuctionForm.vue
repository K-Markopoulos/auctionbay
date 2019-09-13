<template>
  <v-card class="elevation-12" v-if="!isLoading">
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

        <v-autocomplete
          v-model="auction.category"
          :items="categories"
          chips
          deletable-chips
          label="Categories"
          multiple
        >
          <template v-slot:selection="{ attrs, item, select, selected }">
            <v-chip
              v-bind="attrs"
              :input-value="selected"
              close
              @click="select"
              @click:close="remove(item)"
            >
            {{item}}
            </v-chip>
          </template>
        </v-autocomplete>

        <h3 class="d-flex">Existing images</h3>
        <v-avatar
          tile
          size="80"
          class="ma-4"
          style="flex-direction: column"
          v-for="image in auction.images" :key="image.fid"
        >
          <v-img :src="getImageSrc(image)"></v-img>
          <v-icon class="close" @click="removeImage(image)">close</v-icon>
        </v-avatar>

        <v-file-input
          v-model="attachments"
          accept="image/png, image/jpeg, image/bmp"
          prepend-inner-icon="mdi-camera"
          prepend-icon=""
          label="Add images"
          multiple
          chips
          :rules="[
            v => v.every(x => x.size < 2000000) || 'Image should be less than 2MB!',
            v => v.length <= 10 || 'Max 10 images.'
          ]"
        ></v-file-input>

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
      <v-btn @click="close" text>Cancel</v-btn>
      <v-spacer></v-spacer>
      <v-btn :disabled="!valid" color="primary" @click="onFormSubmit">Submit</v-btn>
      <v-spacer></v-spacer>
    </v-card-actions>
  </v-card>
</template>

<script>
  import ApiService from '../services/api.service';
  import TokenService from '../services/token.service';
  import store from '../services/store.service';

  export default {
    name: 'CreateAuctionForm',
    props: [
      'auctionData',
      'onClose',
      'onSubmit'
    ],
    mounted() {
      this.auction = JSON.parse(JSON.stringify(this.auctionData))
      this.isLoading = false;
    },
    data () {
      return {
        valid: true,
        attachments: [],
        auction: {},
        isLoading: true,
        removedImages: []
      }
    },
    computed: {
      getImageSrc() {
        return (image) => `/uploads/${this.auction.id}/${image.fid}`;
      },
      
      categories() {
        return store.state.categories;
      },
    },

    methods: {
      onFormSubmit: function() {
        this.$refs.form.validate();
        if (!this.valid) {
          return
        }

        const formData = this.buildFormData();
        ApiService.put(`/auctions/${this.auction.id}`, formData, true).then(this.onSuccess).catch(this.onError);
      },

      buildFormData: function() {
        const formData = new FormData();
        formData.append('auction', JSON.stringify({
          name: this.auction.name,
          description: this.auction.description,
          category: this.auction.category,
          removedImages: this.removedImages,
          location: this.auction.location,
        }));
        this.attachments.forEach(file => formData.append('images', file));
        return formData;
      },

      onSuccess: function(res) {
        const id = res.data.id;
        this.onSubmit();
      },

      onError: function(res) {
        console.log('Failed to update auction:', res.message);
      },

      remove: function(item) {
        const index = this.auction.category.indexOf(item)
        if (index >= 0) this.auction.category.splice(index, 1)
      },

      removeImage: function(item) {
        this.removedImages.push(item.fid);
        const index = this.auction.images.indexOf(item)
        if (index >= 0) this.auction.images.splice(index, 1)
      },

      close: function() {
        this.action = null;
        this.onClose();
      }
    }
  }
</script>

<style>
.close {
  cursor: pointer
}
</style>

<template>
  <v-card
  width="800"
  >
   
    <v-avatar size="200" class="my-5">
      <v-img
        class="elevation-4"
        style="border-radius: 50%"
        :src="getAvatar"
      ></v-img>
      <div v-if="editMode" class="avatar-icon">
        <input type="file" ref="file" style="display: none" @change="onFileChange">
        <v-icon  color="primary" @click="$refs.file.click()">mdi-camera-retake</v-icon>
      </div>
    </v-avatar>

    <v-divider></v-divider>

    <v-card-title>
      {{getFullname}}
    </v-card-title>

    <v-card-text id="profile-details">
      <v-form ref="form" v-model="valid">
        <v-row>
          <span class="profile-label">Username</span>
          <v-text-field
            outlined
            disabled
            v-model="user.username"></v-text-field>
        </v-row>
        <v-row>
          <span class="profile-label">Email</span>
          <v-text-field 
            :solo="editMode"
            :outlined="!editMode"
            :disabled="!editMode"
            :rules="emailRules"
            v-model="user.email"></v-text-field>
        </v-row>
        <v-row>
          <span class="profile-label">Phone number</span>
          <v-text-field 
            :solo="editMode"
            :outlined="!editMode"
            :disabled="!editMode"
            :rules="phoneNumberRules"
            v-model="user.phoneNumber"></v-text-field>
        </v-row>
        <v-row>
          <span class="profile-label">Tax ID</span>
          <v-text-field 
            :solo="editMode"
            :outlined="!editMode"
            :disabled="!editMode"
            v-model="user.taxId"></v-text-field>
        </v-row>
        <v-row>
          <span class="profile-label">Address</span>
          <v-text-field 
            :solo="editMode"
            :outlined="!editMode"
            :disabled="!editMode"
            v-model="user.location.address"></v-text-field>
        </v-row>
        <v-row>
          <span class="profile-label">Country</span>
          <v-text-field 
            :solo="editMode"
            :outlined="!editMode"
            :disabled="!editMode"
            v-model="user.location.country"></v-text-field>
        </v-row>
        <v-row>
          <span class="profile-label">Seller rating</span>
          <v-text-field
            outlined
            disabled v-model="user.sellerRating.avg"></v-text-field>
        </v-row>
        <v-row>
          <span class="profile-label">Bidder rating</span>
          <v-text-field
            outlined
            disabled class="text--primary" v-model="user.bidderRating.avg"></v-text-field>
        </v-row>
      </v-form>
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions flex v-if="isSameUser">
      <v-btn class="flex-grow-1" v-if="!editMode" @click="editMode = true" color="primary">Edit</v-btn>
      <v-btn class="flex-grow-1" v-if="editMode" @click="editMode = false; avatarPreview = null; getUser()" text>Cancel</v-btn>
      <v-btn class="flex-grow-1" v-if="editMode" @click="submitChanges" color="success">Save</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import ApiService from '../services/api.service';
import store from '../services/store.service';
  export default {
    name: 'UserPage',
    props: [ 'id' ],
    data () {
      return {
        user: {
          location: {},
          sellerRating: {},
          bidderRating: {},
        },
        avatarPreview: null,
        avatar: null,
        editMode: false,
        valid: true,
        phoneNumberRules: [
          v => !!v || 'Phone number is required',
          v => v && v.length == 10 || 'Phone number must be 10 characters'
        ],
        emailRules: [
          v => !!v || 'Email is required',
          v => /.+@.+\..+/.test(v) || 'Email must be valid',
        ],
      }
    },
    created() {
      this.getUser();
    },
    computed: {
      getFullname() {
        return `${this.user.firstName} ${this.user.lastName}`;
      },
      getAvatar() {
        return this.avatarPreview || this.user.avatar
          && `/uploads/${this.user.avatar.fid}`
          || this.$defaultAvatar
      },
      isSameUser() {
        return this.user.id === this.user.id;
      }
    },
    methods: {
      getUser() {
        ApiService.get(`/users/${this.id}`).then(res => {
          this.user = res.data;
        }).catch(err => {
          console.log(err);
        })
      },

      onFileChange(e) {
        this.avatar = e.target.files[0];
        this.avatarPreview = URL.createObjectURL(this.avatar);
      },

      submitChanges() {
        this.$refs.form.validate();
        if (!this.valid) {
          return
        }

        const formData = this.buildFormData();
        ApiService.post(`/users/${this.id}`, formData).then(res => {
          this.avatarPreview = null;
          this.editMode = false;
          this.user = res.data;
        }).catch(err => {
          console.log(err);
        });
      },

      buildFormData() {
        const formData = new FormData();
        formData.append('user', JSON.stringify(this.user));
        formData.append('avatar', this.avatar);
        return formData;
      }
    }
  }
</script>

<style>
.avatar-icon {
  position: absolute;
  bottom: 0;
  right: 0;
}

.profile-label {
  text-align: start;
  min-width: 200px;
  font-size: 24px;
  line-height: 48px;
  font-weight: 200;
  margin-left: 18px;
  margin-right: 18px;
}

#profile-details input {
  color: black;
}

#profile-details > div {
  margin-bottom: 12px;
}

#profile-details .v-input__slot {
    height: 44px !important;
    min-height: 44px;
}
</style>

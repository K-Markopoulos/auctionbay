<template>
  <component :is="tag" v-model="dialogOpen" width="500">
    <v-card>
      <v-card-title primary-title class="headline grey lighten-3">
        <v-row class="fill-width">
          <span class="message-label">To: </span>
          <v-text-field
            outlined
            disabled
            hide-details
            v-model="to.username"></v-text-field>
        </v-row>
        <v-row width="fill-width">
          <span class="message-label">Item ID: </span>
          <v-text-field
            outlined
            disabled
            hide-details
            v-model="auctionId"></v-text-field>
        </v-row>
      </v-card-title>

      <v-card-text>
        <v-row>
          <span class="message-label">Message: </span>
          <v-textarea class="subtitle-1 black--text"
            outlined
            hide-details
            v-model="body">
          </v-textarea>
        </v-row>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-btn small text @click="onCancel">
          Cancel
        </v-btn>
        <div class="flex-grow-1"></div>
        <v-btn color="primary" text @click="sendMessage">
          Send
          <v-icon>mdi-send</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </component>
</template>

<script>
  import ApiService from '../services/api.service';
  import store from '../services/store.service';

  export default {
    name: 'MessageBox',
    props: [
      'dialog',
      'onCancel',
      'onSubmit',
      'to',
      'auctionId'
    ],

    data() {
      return {
        dialogOpen: true,
        body: '',
      }
    },

    created() {

    },
    computed: {
      tag() {
        return this.dialog ? 'v-dialog' : 'div';
      }
    },
    methods: {
      sendMessage() {
        const message = {
          to: this.to.id,
          body: this.body
        }
        ApiService.post('/messages', message).then(res => {
          toastr.success('Message sent!');
          this.onSubmit()
        })
      }
    }
  }
</script>

<style>
.message-label {
  text-align: start;
  min-width: 60px;
  font-size: 18px;
  line-height: 56px;
  font-weight: 200;
  margin: 0 8px 0 8px;
}
.fill-width {
  width: 100%;
}
</style>
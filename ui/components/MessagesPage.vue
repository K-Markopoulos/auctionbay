<template>
  <v-card
  width="1200"
  height="100%"
  >
    <v-toolbar flat color="primary" dark>
      <v-toolbar-title>Messages</v-toolbar-title>
    </v-toolbar>

    <v-layout>
      <v-expansion-panels v-model="panel" accordion focusable width="300" class="message-panels">
        <v-expansion-panel v-for="folder in folders" :key="folder.name">
          <v-expansion-panel-header>{{folder.name}}</v-expansion-panel-header>
          <v-expansion-panel-content>
             <v-list two-line width="100%">
              <v-list-item v-for="message in folder.messages" :key="message._id" @click="activeMessage = message" class="message-item">
                <v-list-item-avatar>
                  <v-icon v-if="message.type === 'NOTIFICATION'">mdi-information-outline</v-icon>
                  <v-img v-if="message.type === 'MESSAGE'" :src="getUserAvatarByField(message, folder.field)"></v-img>
                </v-list-item-avatar>

                <v-list-item-content>
                  <v-list-item-title class="message-title" v-text="getMessageTitle(message, folder.field)"></v-list-item-title>
                  <v-list-item-subtitle class="message-subtitle" v-text="getMessageSubtitle(message)"></v-list-item-subtitle>
                  <v-list-item-subtitle class="message-time" v-text="getTime(message)"></v-list-item-subtitle>
                </v-list-item-content>

              </v-list-item>
            </v-list>
          </v-expansion-panel-content>
       </v-expansion-panel>
      </v-expansion-panels>

      <v-card flat width="100%" v-if="activeMessage">
        <v-card-title height="200">
          <div v-if="activeMessage.type === 'MESSAGE'">
            <v-avatar class="mr-2" size="30" color="grey">
              <v-img size="30" :src="getUserAvatar(activeMessage)"></v-img>
            </v-avatar>
            <span>{{getUserName(activeMessage)}}</span>
          </div>
          <span v-if="activeMessage.type === 'NOTIFICATION'">System Notification</span>
        </v-card-title>
          <v-divider></v-divider>
        <v-card-text>
          <span >{{activeMessage.body}}</span>
        </v-card-text>
      </v-card>
    </v-layout>
  </v-card>
</template>

<script>
import ApiService from '../services/api.service';
import store from '../services/store.service';
  export default {
    name: 'MessagesPage',
    data () {
      return {
        messages: [],
        folders: [
          {
            name: 'Received',
            messages: [],
            field: 'from'
          },
          {
            name: 'Sent',
            messages: [],
            field: 'to'
          },
        ],
        panel: 0,
        activeMessage: null
      }
    },
    created() {
      this.getMessages();
    },
    computed: {
      user() {
        return store.state.user;
      },
      getMessageTitle() {
        return (message, field) => message[field] && message[field].username || 'System Notification';
      },
      getMessageSubtitle() {
        return (message) => message.body;
      },
      getTime() {
        return (message) => moment(message.createdAt).fromNow();
      },
      getUserAvatarByField() {
        return (message, field) => {
          return message[field].avatar &&
            `/uploads/${message[field].avatar.fid}`||
            this.$defaultAvatar;
        }
      },
      getUserAvatar() {
        return (message) => {
          return (this.isReceived(message)
            ? message.from.avatar && `/uploads/${message.from.avatar.fid}`
            : message.to.avatar && `/uploads/${message.to.avatar.fid}`)
            || this.$defaultAvatar;
        }
      },
      getUserName() {
        return (message) => this.isReceived(message) ? message.from && message.from.username: message.to && message.to.username;
      }
    },
    methods: {
      getMessages() {
        ApiService.get('/messages/').then(res => {
          this.messages = res.data;
          this.folders[0].messages = this.messages.filter(this.isReceived);
          this.folders[1].messages = this.messages.filter(this.isSent);
          
        }).catch(err => {
          console.log(err);
        })
      },

      isReceived(message) {
        return message.to.id === this.user.id
      },

      isSent(message) {
        return message.to.id !== this.user.id
      }
    }
  }
</script>

<style>
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.v-expansion-panel-content__wrap {
  width: 300px;
  padding-left: 0 !important;
}
.message-title {
  text-align: start;
}

.message-subtitle{
  text-align: start;
}

.message-time{
  padding-top: 3px;
  text-align: start;
}

.message-item {
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-image: linear-gradient(to right,grey, white) 1;
}
</style>

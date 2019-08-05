<template>
  <div>
    <v-container fluid fill-height>
      <v-layout align-center justify-center>
        
        <v-flex xs12 sm8 md6>
          <v-toolbar dark color="primary" >
            <v-toolbar-title>Users</v-toolbar-title>
          </v-toolbar>
          <v-progress-linear v-if="isLoading" indeterminate color="purple"></v-progress-linear>
          <v-list width="auto">
            <v-list-item dense v-for="user in users" :key="user.id">
              <v-list-item-action>
                <v-checkbox :disabled="isApproved(user)" v-model="user.selected"></v-checkbox>
              </v-list-item-action>

              <v-list-item-content>
                <v-list-item-title v-text="user.username"></v-list-item-title>
                <v-list-item-subtitle v-text="user.firstName + ' ' + user.lastName"></v-list-item-subtitle>
                <v-list-item-subtitle v-text="userDetails(user)"></v-list-item-subtitle>
              </v-list-item-content>
              
              <v-list-item-action>
                <v-btn v-if="isApproved(user)" v-text="user.status" disabled text small></v-btn>
                <v-btn v-if="isPending(user)" :loading="user.approving" @click="approveUser(user)" small color="primary">Approve</v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
          <v-btn block :disabled="!anySelected" @click="approveUsers" color="primary">Approve selected</v-btn>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import ApiService from '../services/api.service';
  export default {
    name: 'UsersList',
    data () {
      return {
        users: [],
        isLoading: true
      }
    },
    computed: {
      isPending() {
        return (user) => user.status === 'PENDING'
      },
      isApproved() {
        return (user) => user.status === 'APPROVED'
      },
      userDetails() {
        return (user) => `Email: ${user.email}`
      },
      anySelected() {
        return this.users.some(x => x.selected);
      }
    },
    mounted() {
      ApiService.get('/users').then(this.onSuccess).catch(this.onError);
    },
    methods: {
      onSuccess: function(res) {
        this.isLoading = false;
        this.users = res.data.map(user => {
          return { ...user, approving: false }
        });
      },

      onError: function(res) {
        this.isLoading = false;
        console.log('Failed to fetch users');
      },

      approveUsers: function() {
        const selectedUsers = this.users.filter(u => u.selected);
        const data = {
          users: selectedUsers.map(u => {
            u.approving = true;
            return u.id;
          })
        };
        ApiService.post('/users/approve', data).then((res) => {
          selectedUsers.forEach(user => { user.approving = false; user.selected = false });

          if (res.data.nModified === selectedUsers.length) {
            selectedUsers.forEach(user => user.status = 'APPROVED');
          } else {
            console.log('Failed to approve user:', selectedUsers.map(u=>u.id));
          }
        });
      },

      approveUser: function(user) {
        user.approving = true;
        ApiService.post('/users/approve', { users: [user.id] }).then((res) => {
          user.approving = false;
          user.selected = false;
          if (res.data.nModified === 1) {
            user.status = 'APPROVED';
          } else {
            console.log('Failed to approve user:', user.id);
          }
        });
      }
    }
  }
</script>

<style>
</style>

<template>
  <v-flex class="align-self-start">
    <v-toolbar dark color="primary" >
      <v-toolbar-title>Users</v-toolbar-title>
      <div class="flex-grow-1"></div>
      <v-text-field
        v-model="search"
        append-icon="search"
        label="Search"
        single-line
        hide-details
        @input="debounceSearch"
      ></v-text-field>
    </v-toolbar>
    <v-data-table
      :headers="headers"
      :footer-props="footer"
      :items="users"
      :items-per-page="limit"
      :options.sync="options"
      :server-items-length="totalUsers"
      :items-per-page-options="[20, 10, 30, 40]"
      class="elevation-1"
    ></v-data-table>
    <v-btn block :disabled="!anySelected" @click="approveUsers" color="primary">Approve selected</v-btn>
    <v-btn block @click="exportUsers" color="primary"><v-icon>mdi-download</v-icon>Export auctions</v-btn>
  </v-flex>
</template>

<script>
import ApiService from '../services/api.service';
  export default {
    name: 'UsersList',
    data () {
      return {
        users: [],
        isLoading: true,
        headers: [
          { text: 'Username', value: 'username' },
          { text: 'Firstname', value: 'firstName' },
          { text: 'Lastname', value: 'lastName' },
          { text: 'Email', value: 'email' },
          { text: 'Country', value: 'location.country' },
          { text: 'Status', value: 'status' },
        ],
        footer: {
          'items-per-page-options': [10, 20, 30, 40, 50]
        },
        options: {},
        page: 1,
        limit: 10,
        totalUsers: 0,
        sortBy: '',
        status: '',
        search: '',
        debounce: null
      }
    },
    watch: {
      options: {
        handler () {
          this.getUsers();
        },
        deep: true,
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
      },
      getLink() {
        return (user) => `/users/${user.id}`;
      }
    },
    mounted() {
      this.getUsers();
    },
    methods: {
      getUsers: function() {
        this.isLoading = true;
        const { sortBy, sortDesc, page, itemsPerPage } = this.options;
        const order = sortDesc[0] ? 'desc' : 'asc';
        const query = 'page=' + (page-1) +
          '&limit=' + itemsPerPage +
          '&sortBy=' + sortBy +
          '&order=' + order +
          '&search=' + this.search +
          '&status=' + this.status;
        ApiService.get(`/users?${query}`).then(this.onSuccess).catch(this.onError);
      },

      onSuccess: function(res) {
        this.isLoading = false;
        this.users = res.data.data;
        this.totalUsers = res.data.total;
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
      },

      exportUsers: function() {
        ApiService.get('/auctions/export').then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'Auctions.xml');
          document.body.appendChild(link);
          link.click();
        });
      },

      debounceSearch: function () {
        const self = this;
        clearTimeout(this.debounce);
        this.debounce = setTimeout(() => {
          self.options.page = 1;
          self.getUsers();
        }, 500);
      }
    }
  }
</script>

<style>
</style>

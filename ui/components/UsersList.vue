<template>
  <v-flex class="align-self-start">
    <v-toolbar dark color="primary" >
      <v-toolbar-title>Users</v-toolbar-title>
      <div class="flex-grow-1"></div>
      <v-text-field
        v-model="search"
        append-icon="search"
        label="Search username, first name, last name or email"
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
      v-model="selected"
      show-select
      class="elevation-1"
    >
      <template v-slot:item.action="{ item }">
        <v-tooltip bottom v-if="isPending(item)">
          <template v-slot:activator="{ on }">
            <v-icon
              v-on="on"
              class="mr-2"
              @click="approveUser(item)"
            >
              mdi-account-check
            </v-icon>
          </template>
          Approve user's registration
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-icon
              v-on="on"
              class="mr-2"
              @click="showDetails(item)"
            >
              mdi-account-details
            </v-icon>
          </template>
          Show details
        </v-tooltip>
      </template>

      <template v-slot:header.data-table-select ="{ props, on }">
        <div class="d-flex">
          <v-simple-checkbox
            :indeterminate="props.indeterminate"
            v-model="props.value"
            v-on="on"
          ></v-simple-checkbox>
          <v-btn tile small :disabled="!props.value && !props.indeterminate" @click="approveUsers" color="primary">Approve</v-btn>
        </div>
      </template>
    </v-data-table>

    <v-dialog id="user-details" v-model="expandedUser" v-if="!!expandedUser">
      <user-details :id="expandedUser.id"></user-details>
      <v-btn
          v-if="isPending(expandedUser)"
          @click="approveUser(expandedUser)"
          prepend-icon="mdi-account-check"
          color="primary"
        >
        Approve user
      </v-btn>
    </v-dialog>
  </v-flex>
</template>

<script>
import ApiService from '../services/api.service';
import UserPage from './UserPage';

  export default {
    name: 'UsersList',
    components: {
      'user-details': UserPage
    },
    data () {
      return {
        users: [],
        selected: [],
        isLoading: true,
        headers: [
          { text: 'Username', value: 'username' },
          { text: 'Firstname', value: 'firstName' },
          { text: 'Lastname', value: 'lastName' },
          { text: 'Email', value: 'email' },
          { text: 'Country', value: 'location.country' },
          { text: 'Status', value: 'status' },
          { text: 'Actions', value: 'action', sortable: false, align: 'center' },
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
        debounce: null,
        expandedUser: null
      }
    },

    watch: {
      options: {
        handler () {
          this.fetchUsers();
        },
        deep: true,
      }
    },

    computed: {
      isPending() {
        return (user) => user.status === 'PENDING'
      },
    },

    mounted() {
      this.fetchUsers();
    },

    methods: {
      fetchUsers: function() {
        this.isLoading = true;
        const { sortBy, sortDesc, page, itemsPerPage } = this.options;
        const order = sortDesc[0] ? 'desc' : 'asc';
        const query = 'page=' + (page-1) +
          '&limit=' + itemsPerPage +
          '&sortBy=' + sortBy +
          '&order=' + order +
          '&search=' + this.search +
          '&status=' + this.status;
        ApiService.get(`/users?${query}`).then(this.onFetchSuccess).catch(this.onError);
      },

      onFetchSuccess: function(res) {
        this.isLoading = false;
        this.users = res.data.data;
        this.totalUsers = res.data.total;
      },

      onApproveSuccess: function(res) {
        if (res.data.ok && res.data.nModified > 0) {
          this.selected.forEach(user => user.status = 'APPROVED');
          const message = (res.data.nModified === 1
            ? 'user was'
            : 'users were') + ' successfully approved';
          toastr.success(`${res.data.nModified} ${message}`);
        } else {
          console.log('Failed to approve user:', this.selected.map(u=>u.id));
        }
      },

      onError: function(res) {
        this.isLoading = false;
        console.log('Failed to fetch users');
      },

      approveUsers: function() {
        if (this.selected.length === 0) {
          return;
        }
        const data = {
          users: this.selected.map(u => u.id)
        };
        ApiService.post('/users/approve', data).then(this.onApproveSuccess).catch(this.onError);
      },

      approveUser: function(user) {
        ApiService.post('/users/approve', { users: [user.id] })
          .then((res) => {
            user.status = 'APPROVED';
            this.onApproveSuccess(res);
          }).catch(this.onError);
      },

      exportAuctions: function(type) {
        ApiService.get(`auctions/export/${type}`).then((response) => {
          const data = type === 'json'
            ? JSON.stringify(response.data)
            : response.data;
          const url = window.URL.createObjectURL(new Blob([data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `Auctions.${type}`);
          document.body.appendChild(link);
          link.click();
        });
      },

      debounceSearch: function () {
        const self = this;
        clearTimeout(this.debounce);
        this.debounce = setTimeout(() => {
          self.options.page = 1;
          self.fetchUsers();
        }, 500);
      },

      showDetails: function(user) {
        this.expandedUser = user;
      }
    }
  }
</script>

<style>
#user-details .v-dialog--active {
  width: auto;
}
</style>

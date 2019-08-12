<template>
  <v-container fluid fill-height>
    <v-layout align-center justify-center>
      <v-flex xs12 sm8 md4>
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Login form</v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>
          <v-card-text>
            <v-form>
              <v-text-field
                v-model="email"
                label="Email"
                name="email"
                prepend-icon="email"
                type="text"
              ></v-text-field>

              <v-text-field
                id="password"
                v-model="password"
                label="Password"
                name="password"
                prepend-icon="lock"
                type="password"
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <router-link to="/register">Create an account</router-link>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="onSubmit">Login</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import ApiService from '../services/api.service';
  import TokenService from '../services/token.service';

  export default {
    name: 'Login',
    data () {
      return {
        email: '',
        password: '',
      }
    },
    methods: {
      onSubmit: function() {
        ApiService.post('/users/authenticate', {
          email: this.email,
          password: this.password
        }).then(this.onSuccess).catch(this.onError);
      },
      onSuccess: function(res) {
        TokenService.saveToken(res.data.token);
        ApiService.setHeader();
        console.log('Logged in');

        this.$router.push(this.$router.history.current.query.redirect || '/');
      },
      onError: function(res) {
        console.log('Failed to login:', res.message);
      }
    }
  }
</script>

<style>
</style>

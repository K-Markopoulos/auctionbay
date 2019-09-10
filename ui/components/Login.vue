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
            <v-form ref="form" v-model="valid">
              <v-text-field
                v-model="email"
                label="Email"
                name="email"
                prepend-icon="email"
                type="text"
                :rules="emailRules"
              ></v-text-field>

              <v-text-field
                id="password"
                v-model="password"
                label="Password"
                name="password"
                prepend-icon="lock"
                type="password"
                :rules="[v => !!v || 'Password is required']"
              ></v-text-field>
            </v-form>
          <span class="red--text" v-text="errorMessages"></span>
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
  import store from '../services/store.service';

  export default {
    name: 'Login',
    data () {
      return {
        email: '',
        emailRules: [
          v => !!v || 'Email is required',
          v => /.+@.+\..+/.test(v) || 'Email must be valid',
        ],
        password: '',
        errorMessages: '',
        valid: true
      }
    },
    methods: {
      onSubmit: function() {
        this.$refs.form.validate();
        if (this.valid) {
          this.errorMessages = '';
          ApiService.post('/users/authenticate', {
            email: this.email,
            password: this.password
          }).then(this.onSuccess).catch(this.onError);
        }
      },

      onSuccess: function(res) {
        store.commit('set', res.data);
        TokenService.saveToken(res.data.token);
        TokenService.saveUserID(res.data._id);
        ApiService.setHeader();
        console.log('Logged in');

        this.$router.push(this.$router.history.current.query.redirect || '/');
      },

      onError: function(res) {
        this.errorMessages = res.response.status === 401
          ? 'Wrong credentials. Email and password do not match.'
          : 'Failed to login';
      }
    }
  }
</script>

<style>
</style>

<template>
  <v-container fluid fill-height>
    <v-layout align-center justify-center>
      <v-flex xs12 sm8 md4>
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Registration form</v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>
          <v-card-text>
            <v-form ref="form" v-model="valid">
              <v-text-field
                v-model="firstname"
                label="Firstname"
                name="firstname"
                type="text"
                :rules="[v => !!v || 'Firstname is required']"
              ></v-text-field>

              <v-text-field
                v-model="lastname"
                label="Lastname"
                name="lastname"
                type="text"
                :rules="[v => !!v || 'Lastname is required']"
              ></v-text-field>

              <v-text-field
                v-model="username"
                label="Username"
                name="username"
                type="text"
                @blur="checkUsername"
                :rules="usernameRules"
                :error-messages="usernameErrors"
              ></v-text-field>

              <v-text-field
                v-model="email"
                label="Email"
                name="email"
                prepend-icon="email"
                type="text"
                @blur="checkEmail"
                :rules="emailRules"
                :error-messages="emailErrors"
              ></v-text-field>

              <v-text-field
                id="password"
                v-model="password"
                label="Password"
                name="password"
                prepend-icon="lock"
                type="password"
                :rules="passwordRules"
                :error-messages="passwordErrors"
                @blur="checkPasswordsMatch"
              ></v-text-field>

              <v-text-field
                id="password_confirm"
                v-model="password_confirm"
                label="Confirm Password"
                name="password_confirm"
                prepend-icon="lock"
                type="password"
                :error-messages="passwordErrors"
                @blur="checkPasswordsMatch"
              ></v-text-field>

              <v-divider></v-divider>

              <v-layout wrap justify-space-between>
                <v-flex xs12 md5>
                  <v-text-field
                    v-model="phoneNumber"
                    label="Phone"
                    name="phone"
                    type="text"
                    :counter="10"
                    :rules="phoneNumberRules"
                  ></v-text-field>
                </v-flex>


                <v-flex xs12 md5>
                  <v-text-field
                    v-model="taxId"
                    label="Tax ID"
                    name="taxId"
                    type="text"
                    :rules="[v => !!v || 'Tax ID is required']"
                  ></v-text-field>
                </v-flex>
              </v-layout>
              
              <v-text-field
                v-model="location.address"
                label="Address"
                name="address"
                type="text"
                :rules="[v => !!v || 'Address is required']"
              ></v-text-field>

              <v-text-field
                v-model="location.country"
                label="Country"
                name="country"
                type="text"
                :rules="[v => !!v || 'Country is required']"
              ></v-text-field>


            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn @click="onReset">Reset</v-btn>
            <v-spacer></v-spacer>
            <v-btn :disabled="!valid" color="primary" @click="onSubmit">Register</v-btn>
            <v-spacer></v-spacer>
            <router-link to="/login">Back to Login</router-link>
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
        valid: true,
        firstname: '',
        lastname: '',
        username: '',
        usernameErrors: '',
        usernameRules: [
          v => !!v || 'Username is required',
        ],
        email: '',
        emailErrors: '',
        emailRules: [
          v => !!v || 'Email is required',
          v => /.+@.+\..+/.test(v) || 'Email must be valid',
        ],
        password: '',
        password_confirm: '',
        passwordErrors: '',
        passwordRules: [
          v => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*():_+=-]{8,}$/.test(v) || 'Password must contain at least 8 characters, 1 letter and 1 digit',
        ],
        phoneNumber: '',
        phoneNumberRules: [
          v => !!v || 'Phone number is required',
          v => v.length == 10 || 'Phone number must be 10 characters'
        ],
        taxId: '',
        location: {
          address: '',
          country: ''
        }
      }
    },
    methods: {
      checkUsername: function() {
        if (!this.username) {
          return
        }

        ApiService.post('/users/username', { username: this.username }).then((res) => {
          this.usernameErrors = res.data ? 'Username already exists': '';
        }).catch((res) => console.log('Failed to check username', res));
      },

      checkEmail: function() {
        if (!this.email) {
          return
        }

        ApiService.post('/users/email', { email: this.email }).then((res) => {
          this.emailErrors = res.data ? 'Email already exists' : '';
        }).catch((res) => console.log('Failed to check email', res.data));
      },

      checkPasswordsMatch: function() {
        this.passwordErrors = !this.password_confirm || !this.password || this.password === this.password_confirm ? '' : 'Passwords don\'t match'
      },

      onReset: function() {
        this.$refs.form.reset();
      },

      onSubmit: function() {
        this.$refs.form.validate();
        if (!this.valid) {
          return
        }

        ApiService.post('/users/', {
          firstName: this.firstname,
          lastName: this.lastname,
          username: this.username,
          email: this.email,
          password: this.password,
          location: this.location,
          phoneNumber: this.phoneNumber,
          taxId: this.taxId
        }).then(this.onSuccess).catch(this.onError);
      },

      onSuccess: function(res) {
        this.$router.push('/login');
      },

      onError: function(res) {
        console.log('Failed to register:', res.message);
      }
    }
  }
</script>

<style>
</style>

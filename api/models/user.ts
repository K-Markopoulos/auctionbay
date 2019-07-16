import mongoose  = require('mongoose');
import FileSchema = require('./files');
import enums = require('./enums');
import bcrypt = require('bcrypt');

const Role = enums.Role;

export interface IUser extends mongoose.Document{
  username: string,
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  address: string,
  phoneNumber: string,
  role: string,
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date,
}

const UserSchema = new mongoose.Schema<IUser>({
  
  // The user's username
  username: {
    type: String,
    required: false
  },

  // The user's email
  email: {
    type: String,
    required: true
  },

  // The user's password
  password: {
    type: String,
    required: true
  },

  // The user's first name
  firstName: {
    type: String,
    required: true
  },

  // The user's last name
  lastName: {
    type: String,
    required: true
  },

  // The address of the user's company
  address: {
    type: String,
    required: true
  },

  // The user's phone number
  phoneNumber: {
    type: String,
    required: true
  },

  // The user's role
  role: {
    type: String,
    required: true,
    default: Role.NONE
  },

  // Created timestamp
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  },

  // Latest edit timestamp
  updatedAt: {
    type: Date,
    required: true,
    default: Date.now
  },

  // Latest login timestamp
  lastLogin: {
    type: Date,
    required: false
  }
});

UserSchema.pre<IUser>('save', function(next) {
  this.updatedAt = new Date();
  return next();
});

export default mongoose.model<IUser>('User', UserSchema);
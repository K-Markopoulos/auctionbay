import mongoose  = require('mongoose');
import enums = require('./enums');
import LocationSchema, { ILocation } from './location';

export interface IUser extends mongoose.Document{
  username: string,
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  location: ILocation,
  phoneNumber: string,
  taxId: string,
  role: string,
  status: string,
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date,
}

export const UserSchema = new mongoose.Schema<IUser>({
  
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

  // The user's location details
  location: {
    type: LocationSchema,
    required: true
  },

  // The user's phone number
  phoneNumber: {
    type: String,
    required: true
  },

  // The user's tax id
  taxId: {
    type: String,
    required: true
  },

  // The user's role
  role: {
    type: String,
    required: true,
    default: enums.Role.NONE
  },
  
  // The user's status in platform
  status : {
    type: String,
    required: true,
    default: enums.Status.PENDING
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

UserSchema.methods.toJSON = function() {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    firstName: this.firstName,
    lastName: this.lastName,
    location: this.location,
    phoneNumber: this.phoneNumber,
    taxId: this.taxId,
    role: this.role,
    status: this.status
  };
};

export default mongoose.model<IUser>('User', UserSchema);
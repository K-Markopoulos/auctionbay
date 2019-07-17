import mongoose = require('mongoose');

export interface ILocation extends mongoose.Document {
  address: String,
  country: String
}

export interface IItemLocation extends ILocation {
  lat?: String,
  lon?: String
}

export const LocationSchema = new mongoose.Schema<IItemLocation> ({
  address: {
    type: String,
    required: true
  },

  country: {
    type: String,
    required: true
  },

  lat: String,

  lon: String
});


export default LocationSchema;
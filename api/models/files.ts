import mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false
  },

  fid: {
    type: String,
    required: false
  }
});

module.exports = FileSchema;
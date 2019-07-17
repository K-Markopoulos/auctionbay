import mongoose = require('mongoose');

export interface IFile {
  name: String,
  fid: String
}

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

export default FileSchema;
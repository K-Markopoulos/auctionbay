import mongoose  = require('mongoose');
import enums = require('./enums');
import UserSchema, { IUser } from './user';


export interface IMessage extends mongoose.Document{
  type: string,
  body: String,
  from?: IUser | mongoose.Types.ObjectId,
  to: IUser | mongoose.Types.ObjectId,
  read: Boolean,
  createdAt: Date
}

export const MessageSchema = new mongoose.Schema<IMessage>({
  type: {
    type: String,
    required: true
  },

  body: {
    type: String,
    required: true
  },

  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  read: {
    type: Boolean,
    required: true,
    default: false
  },

  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  }
});

export default mongoose.model<IMessage>('Message', MessageSchema);
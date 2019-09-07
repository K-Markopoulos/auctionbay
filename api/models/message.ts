import mongoose  = require('mongoose');
import enums = require('./enums');
import UserSchema, { IUser } from './user';


export interface IMessage extends mongoose.Document{
  type: string,
  body: String,
  from?: IUser | mongoose.Types.ObjectId,
  to: IUser | mongoose.Types.ObjectId,
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

  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  }
});

export default mongoose.model<IMessage>('Message', MessageSchema);
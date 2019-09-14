import mongoose  = require('mongoose');
import enums = require('./enums');
import { IUser } from './user';
import { IAuction } from './auction';


export interface IActivity extends mongoose.Document{
  type: Number,
  item: IAuction | mongoose.Types.ObjectId,
  user: IUser | mongoose.Types.ObjectId,
  count: Number
}

export const MessageSchema = new mongoose.Schema<IActivity>({
  type: {
    type: Number,
    required: true
  },

  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
    required: true
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  count: {
    type: Number,
    required: true,
    default: 0
  }
});

export default mongoose.model<IActivity>('Activity', MessageSchema);
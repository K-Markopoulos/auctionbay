import mongoose = require('mongoose');

export interface IRating extends mongoose.Document {
  1: number,
  2: number,
  3: number,
  4: number,
  5: number,
  avg: number,
}


export const RatingSchema = new mongoose.Schema<IRating> ({
  1: {
    type: Number,
    default: 0
  },
  2: {
    type: Number,
    default: 0
  },
  3: {
    type: Number,
    default: 0
  },
  4: {
    type: Number,
    default: 0
  },
  5: {
    type: Number,
    default: 0
  },
  avg: {
    type: Number,
    default: 0
  },
});

export const DefaultRatingSchema: IRating = {
  2: 0,
  3: 0,
  4: 0,
  5: 0,
  avg: 0
} as IRating;

export default RatingSchema;
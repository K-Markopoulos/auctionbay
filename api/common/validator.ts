import joi = require('@hapi/joi');
import mongoose = require('mongoose');

export interface IExtendedJoi extends joi.Root {
  objectId: () => joi.StringSchema
}

export const validator: IExtendedJoi = joi.extend({
  name: 'objectId',
  base: joi.string(),
  pre: (value,state, prefs) => {
    if(!mongoose.Types.ObjectId.isValid(value)) {
      return this.createError('INVALID_ID', value, {}, state, prefs);
    }
    return value;
  }
});

export default joi;
const mongoose = require('mongoose');

const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BLOCK: 'block',
  DELETED: 'deleted',
}

const schema = new mongoose.Schema({
  title: String,
  descriptions: String,
  images: Array,
  userId: String,
  placeId: String,
  rating: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    default: STATUS.ACTIVE
  },
},
  {
    timestamps: true,
  });

schema.statics.STATUS = STATUS

module.exports = mongoose.model('review', schema);

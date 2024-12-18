const mongoose = require('mongoose');

const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DELETED: 'deleted',
}

const schema = new mongoose.Schema({
  title: String,
  descriptions: String,
  images: Array,
  userId: String,
  userLikes: {
    type: Array,
    default: [],
  },
  categoryIds: {
    type: Array,
    default: [],
  },
  priceStart: Number,
  priceEnd: Number,
  address: String,
  wardCode: String,
  districtCode: String,
  provinceCode: String,
  point: {
    type: Number,
    default: 0,
    require: true
  },
  rating: {
    type: Number,
    default: 0
  },
  totalRating: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    default: STATUS.ACTIVE
  }
},
  {
    timestamps: true,
  }
);

schema.statics.STATUS = STATUS

module.exports = mongoose.model('place', schema);

const mongoose = require('mongoose');

const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BLOCK: 'block',
  DELETED: 'deleted',
}

const ROLE = {
  USER: 'user',
  ADMIN: 'admin'
}

const schema = new mongoose.Schema({
  username: {
    type: String,
    default: null,
    require: true
  },
  password: {
    type: String,
    require: true
  },
  phone: {
    type: String,
    default: null,
    require: true
  },
  email: {
    type: String,
    default: null
  },
  fullName: {
    type: String,
    default: ''
  },
  avatar: Object,
  slogan: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    default: ROLE.USER
  },
  status: {
    type: String,
    default: STATUS.ACTIVE
  },
  rating: Number,
  address: String,
  wardCode: String,
  districtCode: String,
  provinceCode: String,
},
  {
    timestamps: true,
  });

schema.statics.STATUS = STATUS
schema.statics.ROLE = ROLE
module.exports = mongoose.model('user', schema);

var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  username: {
    type: String,
    default: null
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
  full_name: {
    type: String,
    default: ''
  },
  slogan: {
    type: String,
    default: ''
  },
  user_created: {
    type: String,
    default: ''
  },
  rating: Number,
});

module.exports = mongoose.model('user', userSchema);

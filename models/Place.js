var mongoose = require('mongoose');

var schema = mongoose.Schema({
  title: String,
  descriptions: String,
  images: Array,
  user_id: String,
  user_likes: Array,
  categories_id: Array,
  created_at: Date,
});

module.exports = mongoose.model('place', schema);

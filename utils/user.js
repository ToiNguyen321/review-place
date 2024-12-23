const Place = require("../models/Place");
const Review = require("../models/Review");

const userUtils = {};

userUtils.calculator = async (userId) => {
  const [placeTotal = 0, reviewTotal = 0, likeTotal] = await Promise.allSettled(
    [
      Place.find({ userId }).count(),
      Review.find({ userId }).count(),
      Place.find({ userId, userLikes: { $ne: [] } }).count(),
    ]
  );
  return {
    placeTotal: placeTotal?.value ?? 0,
    reviewTotal: reviewTotal?.value ?? 0,
    likeTotal: likeTotal?.value ?? 0,
  };
};

module.exports = userUtils;

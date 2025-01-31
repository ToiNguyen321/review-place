const { Place, Review } = require("../models");

const uUser = {};

uUser.calculator = async (userId) => {
  try {
    const [placeTotal = 0, reviewTotal = 0, likeTotal] =
      await Promise.allSettled([
        Place.countDocuments({ userId }),
        Review.countDocuments({ userId }),
        Place.countDocuments({
          userId,
          userLikes: { $ne: [] },
        }),
      ]);

    return {
      placeTotal: placeTotal?.value ?? 0,
      reviewTotal: reviewTotal?.value ?? 0,
      likeTotal: likeTotal?.value ?? 0,
    };
  } catch (error) {
    return {
      placeTotal: 0,
      reviewTotal: 0,
      likeTotal: 0,
    };
  }
};

module.exports = uUser;

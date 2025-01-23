const { Review, Place } = require("../models");

const place = {};

place.refine = (place) => {
  if (!place) {
    return place;
  }

  if (typeof place === "string") {
    place = JSON.parse(place);
  }

  if (place.address_components) {
    place.address_components = place.address_components.filter((c) => {
      if (c.types.includes("postal_code")) {
        return;
      }

      return true;
    });

    place.components = place.address_components
      .map((c) => {
        return c.long_name
          .replace(/tỉnh|thành phố|tp\.|quận|huyện|phường|xã|tx\.|thị xã/gi, "")
          .trim()
          .toLowerCase();
      })
      .reverse();
  }

  return place;
};

place.calculator = async (placeId) => {
  const [place, reviewsByPlaceId] = await Promise.all([
    Place.findOne({ _id: placeId }),
    Review.find({ placeId: placeId }).select("_id rating"),
  ]);
  const averageRating =
    reviewsByPlaceId.reduce((total, review) => total + review.rating, 0) /
    reviewsByPlaceId.length;
  return {
    place,
    reviewsByPlaceId,
    averageRating: Math.floor(averageRating || 0),
  };
};

module.exports = place;

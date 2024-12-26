const express = require("express");
const router = express.Router();
const Place = require("../../models/Place");
const {
  uploadHelpers,
  responseHelpers,
  paramHelpers,
} = require("../../helpers");
const { verifyToken, userByToken } = require("../../middleware/authMiddleware");
const User = require("../../models/User");
const Province = require("../../models/Province");
const District = require("../../models/District");
const Ward = require("../../models/Ward");

const getPlaceDetails = async (data) => {
  const userIds = data.map((i) => i?.userId);
  const wardCodes = data.map((i) => i.wardCode);
  const districtCodes = data.map((i) => i.districtCode);
  const provinceCodes = data.map((i) => i.provinceCode);

  const [users, provinces, districts, wards] = await Promise.all([
    User.find({ _id: { $in: userIds } }).select({ password: 0, __v: 0 }),
    Province.find({ code: { $in: provinceCodes } }).select({ __v: 0 }),
    District.find({ code: { $in: districtCodes } }).select({ __v: 0 }),
    Ward.find({ code: { $in: wardCodes } }).select({ __v: 0 }),
  ]);

  return { users, provinces, districts, wards };
};

const mapPlaceDetails = (data, details, userId) => {
  const { users, provinces, districts, wards } = details;
  return data.map((pl) => {
    pl.user = users.find((i) => i._id == pl.userId) ?? null;
    pl.province = provinces.find((i) => i.code == pl.provinceCode) ?? null;
    pl.district = districts.find((i) => i.code == pl.districtCode) ?? null;
    pl.ward = wards.find((i) => i.code == pl.wardCode) ?? null;
    pl.likedByUser = userId && pl.userLikes.includes(userId);
    return pl;
  });
};

/**
 * Home page: loading all places
 */
router.get("/", userByToken, async (req, res) => {
  const {
    page = 0,
    pageSize = 10,
    userIdPost = "",
    categoryIds = "",
    userLikes = "",
    provinceCode = "",
    notInId = "",
  } = req.query;
  const userId = req.userId;
  try {
    const limit = parseInt(pageSize);
    const offset = parseInt(page) * limit;

    const query = { status: Place.STATUS.ACTIVE };

    if (categoryIds) {
      query.categoryIds = { $in: paramHelpers.idsToArrayId(categoryIds) };
    }
    if (userLikes) {
      query.userLikes = { $in: userLikes };
    }
    if (provinceCode) {
      query.provinceCode = { $in: provinceCode };
    }
    if (userIdPost) {
      query.userId = { $in: userIdPost };
    }
    if (notInId) {
      query._id = { $nin: paramHelpers.idsToArrayId(notInId, true) };
    }

    const project = { __v: 0 };

    const data = await Place.find(query)
      .skip(offset)
      .limit(limit)
      .select(project)
      .lean();
    const total = await Place.countDocuments(query);

    const details = await getPlaceDetails(data);
    const mappedData = mapPlaceDetails(data, details, userId);

    return responseHelpers.createResponse(res, 200, {
      data: mappedData,
      meta: {
        total,
        next: total > offset + limit,
        page: parseInt(page),
        limit,
      },
    });
  } catch (error) {
    return responseHelpers.createResponse(res, 404, null, error.message, error);
  }
});

/**
 * Get top place
 */
router.get("/top", userByToken, async (req, res) => {
  const {
    page = 0,
    pageSize = 10,
    userIdPost = "",
    categoryIds = "",
    userLikes = "",
    provinceCode = "",
  } = req.query;
  const userId = req.userId;
  try {
    const limit = parseInt(pageSize);
    const offset = parseInt(page) * limit;

    const query = {
      status: Place.STATUS.ACTIVE,
      rating: { $gt: 2 },
      totalRating: { $gt: 1 },
    };

    if (categoryIds) {
      query.categoryIds = { $in: paramHelpers.idsToArrayId(categoryIds) };
    }
    if (userLikes) {
      query.userLikes = { $in: paramHelpers.idsToArrayId(userLikes) };
    }
    if (provinceCode) {
      query.provinceCode = { $in: provinceCode };
    }
    if (userIdPost) {
      query.userId = { $in: userIdPost };
    }

    const project = { __v: 0 };

    const data = await Place.find(query)
      .skip(offset)
      .limit(limit)
      .select(project)
      .sort({ rating: -1 })
      .lean();
    const total = await Place.countDocuments(query);

    const details = await getPlaceDetails(data);
    const mappedData = mapPlaceDetails(data, details, userId);

    return responseHelpers.createResponse(res, 200, {
      data: mappedData,
      meta: {
        total,
        next: total > offset + limit,
        page: parseInt(page),
        limit,
      },
    });
  } catch (error) {
    return responseHelpers.createResponse(res, 404, null, error.message, error);
  }
});

/**
 * Get top follows
 */
router.get("/top-follow", userByToken, async (req, res) => {
  const {
    page = 0,
    pageSize = 10,
    userIdPost = "",
    categoryIds = "",
    provinceCode = "",
    notInId,
  } = req.query;
  const userId = req.userId;

  try {
    const limit = parseInt(pageSize);
    const offset = parseInt(page) * limit;

    const matchStage = { status: Place.STATUS.ACTIVE };

    if (categoryIds) {
      matchStage.categoryIds = {
        $in: paramHelpers.idsToArrayId(categoryIds),
      };
    }
    if (provinceCode) {
      matchStage.provinceCode = { $in: provinceCode };
    }
    if (notInId) {
      matchStage._id = { $nin: paramHelpers.idsToArrayId(notInId, true) };
    }
    if (userIdPost) {
      matchStage.userId = { $in: userIdPost.split(",") };
    }

    const data = await Place.aggregate([
      { $match: matchStage },
      {
        $addFields: { likesCount: { $size: { $ifNull: ["$userLikes", []] } } },
      },
      { $match: { likesCount: { $gt: 0 } } },
      { $sort: { likesCount: -1 } },
      { $skip: offset },
      { $limit: limit },
      { $project: { __v: 0 } },
    ]);

    const total = await Place.countDocuments(matchStage);

    const details = await getPlaceDetails(data);
    const mappedData = mapPlaceDetails(data, details, userId);

    return responseHelpers.createResponse(res, 200, {
      data: mappedData,
      meta: {
        total,
        next: total > offset + limit,
        page: parseInt(page),
        limit,
      },
    });
  } catch (error) {
    return responseHelpers.createResponse(res, 404, null, error.message, error);
  }
});

/**
 * Get place by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Place.findById(id);
    if (!data) {
      return responseHelpers.createResponse(
        res,
        404,
        null,
        "Place not found",
        true
      );
    }

    const [user, province, district, ward] = await Promise.all([
      User.findById(data.userId).select({ password: 0, __v: 0 }),
      Province.findOne({ code: data.provinceCode }).select({ __v: 0 }),
      District.findOne({
        provinceCode: data.provinceCode,
        code: data.districtCode,
      }).select({ __v: 0 }),
      Ward.findOne({
        provinceCode: data.provinceCode,
        districtCode: data.districtCode,
        code: data.wardCode,
      }).select({ __v: 0 }),
    ]);

    return responseHelpers.createResponse(res, 200, {
      ...data.toObject(),
      user,
      province,
      district,
      ward,
    });
  } catch (error) {
    return responseHelpers.createResponse(res, 500, null, error.message, error);
  }
});

/**
 * Create new place
 */
router.post(
  "/",
  verifyToken,
  uploadHelpers.multerUpload("places").array("files", 5),
  async (req, res) => {
    try {
      const files = req.files ?? [];
      const {
        title,
        descriptions,
        point = 0,
        categoryIds = [],
        priceStart = 0,
        priceEnd = 0,
        provinceCode,
        districtCode,
        wardCode,
      } = req.body;

      const newPlace = new Place({
        title,
        descriptions,
        images: files.map((file) => ({
          filename: file.filename,
          url: `files/places/${file.filename}`,
          size: file.size,
          mimetype: file.mimetype,
        })),
        userId: req.userId,
        categoryIds,
        point,
        priceStart: parseInt(priceStart),
        priceEnd: parseInt(priceEnd),
        provinceCode,
        districtCode,
        wardCode,
      });

      const data = await newPlace.save();
      return responseHelpers.createResponse(res, 201, data);
    } catch (error) {
      return responseHelpers.createResponse(
        res,
        500,
        null,
        "Server error during place create",
        error
      );
    }
  }
);

router.post("/:id/like", verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.userId;
    const { like } = req.body;
    const data = await Place.findById(id);

    if (!data) {
      return responseHelpers.createResponse(
        res,
        404,
        null,
        "Place not found",
        true
      );
    }

    let userLikes = data.userLikes ?? [];
    const isLike = userLikes.includes(userId);

    if (like === true && !isLike) {
      userLikes.push(userId);
    } else if (like === false && isLike) {
      userLikes = userLikes.filter((i) => i !== userId);
    }

    const dataUpdate = await Place.updateOne(
      { _id: id },
      { $set: { userLikes } },
      { new: true }
    );
    return responseHelpers.createResponse(res, 200, dataUpdate);
  } catch (error) {
    return responseHelpers.createResponse(
      res,
      500,
      null,
      "Server error during place update",
      error
    );
  }
});

/**
 * Update place by ID
 */
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const {
      title,
      descriptions,
      address,
      provinceCode,
      districtCode,
      wardCode,
    } = req.body;

    const newObj = {};
    if (title) newObj.title = title;
    if (descriptions) newObj.descriptions = descriptions;
    if (address) newObj.address = address;
    if (provinceCode) newObj.provinceCode = provinceCode;
    if (districtCode) newObj.districtCode = districtCode;
    if (wardCode) newObj.wardCode = wardCode;

    const data = await Place.findByIdAndUpdate(
      id,
      { $set: newObj },
      { new: true }
    );

    if (!data) {
      return responseHelpers.createResponse(
        res,
        404,
        null,
        "Place not found",
        true
      );
    }

    return responseHelpers.createResponse(res, 200, data);
  } catch (error) {
    return responseHelpers.createResponse(
      res,
      500,
      null,
      "Server error during place update",
      error
    );
  }
});

/**
 * Delete place by ID
 */
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const data = await Place.findByIdAndUpdate(
      id,
      { $set: { status: Place.STATUS.DELETED } },
      { new: true }
    );

    if (!data) {
      return responseHelpers.createResponse(
        res,
        404,
        null,
        "Place not found or already deleted",
        true
      );
    }
    return responseHelpers.createResponse(
      res,
      200,
      {},
      "Place deleted successfully"
    );
  } catch (error) {
    return responseHelpers.createResponse(
      res,
      500,
      null,
      "Server error during place update",
      error
    );
  }
});

module.exports = router;

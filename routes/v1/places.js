const express = require("express");
const router = express.Router();
const { fileHelpers } = require("../../helpers");
const { verifyToken, userByToken } = require("../../middleware/authMiddleware");
const User = require("../../models/User");
const { Types } = require("mongoose");
const { uParams, uResponse, uQueryInfo } = require("../../utils");
const { Place } = require("../../models");

const getPlaceDetails = async (data) => {
  const userIds = data.map((i) => i?.userId);
  const users = await User.find({ _id: { $in: userIds } }).select({
    fullName: 1,
    status: 1,
    role: 1,
    avatar: 1,
  });
  return { users };
};

const mapPlaceDetails = (data = [], details, userId) => {
  const { users } = details;
  return data.map((pl) => {
    pl.user = users.find((i) => i._id == pl.userId) ?? null;
    pl.likedByUser = userId && pl.userLikes.toString().includes(userId);
    return pl;
  });
};

const filterCommon = (query, reqQuery) => {
  const {
    userIdPost = "",
    categoryIds = "",
    userLikes = "",
    provinceCode = "",
    districtCode = "",
    wardCode = "",
    notInId = "",
    searchText = "",
  } = reqQuery;

  if (categoryIds) {
    query["categories._id"] = {
      $in: uParams.idsToArrayId(categoryIds, false, true),
    };
  }
  if (userLikes) {
    query.userLikes = { $in: uParams.idsToArrayId(userLikes, false, true) };
  }
  if (provinceCode) {
    query["province.code"] = { $in: provinceCode };
  }
  if (districtCode) {
    query["district.code"] = { $in: districtCode };
  }
  if (wardCode) {
    query["ward.code"] = { $in: wardCode };
  }
  if (userIdPost) {
    query.userId = { $in: uParams.idsToArrayId(userIdPost, false, true) };
  }
  if (notInId) {
    query._id = { $nin: uParams.idsToArrayId(notInId, true, true) };
  }
  if (searchText) {
    const regex = new RegExp(searchText, "i"); // Tạo regex từ từ khoá
  }
};
/**
 * Home page: loading all places
 */
router.get("/", userByToken, async (req, res) => {
  const { page = 0, pageSize = 10 } = req.query;
  const userId = req.userId;

  try {
    const limit = parseInt(pageSize);
    const offset = parseInt(page) * limit;

    const query = { status: Place.STATUS.ACTIVE };

    filterCommon(query, req.query);

    const project = { __v: 0 };

    const data = await Place.find(query)
      .skip(offset)
      .limit(limit)
      .select(project)
      .lean();
    const total = await Place.countDocuments(query);

    const details = await getPlaceDetails(data);
    const mappedData = mapPlaceDetails(data, details, userId);

    return uResponse.createResponse(res, 200, {
      data: mappedData,
      meta: {
        total,
        next: total > offset + limit,
        page: parseInt(page),
        limit,
      },
    });
  } catch (error) {
    return uResponse.createResponse(res, 404, null, error.message, error);
  }
});

/** Get Place by useId */
router.get("/of-uid", verifyToken, async (req, res) => {
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

    filterCommon(query, {
      userIdPost,
      categoryIds,
      userLikes,
      provinceCode,
      notInId,
    });

    const project = { __v: 0 };

    const data = await Place.find(query)
      .skip(offset)
      .limit(limit)
      .select(project)
      .lean();
    const total = await Place.countDocuments(query);

    const details = await getPlaceDetails(data);
    const mappedData = mapPlaceDetails(data, details, userId);

    return uResponse.createResponse(res, 200, {
      data: mappedData,
      meta: {
        total,
        next: total > offset + limit,
        page: parseInt(page),
        limit,
      },
    });
  } catch (error) {
    console.log("🚀 ~ router.get ~ error:", error);
    return uResponse.createResponse(res, 404, null, error.message, error);
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

    filterCommon(query, {
      userIdPost,
      categoryIds,
      userLikes,
      provinceCode,
    });

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

    return uResponse.createResponse(res, 200, {
      data: mappedData,
      meta: {
        total,
        next: total > offset + limit,
        page: parseInt(page),
        limit,
      },
    });
  } catch (error) {
    return uResponse.createResponse(res, 404, null, error.message, error);
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

    filterCommon(matchStage, {
      userIdPost,
      categoryIds,
      notInId,
      provinceCode,
    });

    const [data, totalResult] = await Promise.all([
      // Truy vấn lấy dữ liệu với các bước như aggregate
      Place.aggregate([
        { $match: matchStage },
        {
          $addFields: {
            likesCount: { $size: { $ifNull: ["$userLikes", []] } },
          },
        },
        { $match: { likesCount: { $gt: 0 } } },
        { $sort: { likesCount: -1 } },
        { $skip: offset },
        { $limit: limit },
        { $project: { __v: 0 } },
      ]),

      // Truy vấn đếm số lượng tài liệu sau khi áp dụng $addFields và $match
      Place.aggregate([
        { $match: matchStage },
        {
          $addFields: {
            likesCount: { $size: { $ifNull: ["$userLikes", []] } },
          },
        },
        { $match: { likesCount: { $gt: 0 } } },
        { $count: "total" }, // Sử dụng $count để đếm số tài liệu thỏa mãn điều kiện
      ]),
    ]);

    // If no data is found
    const total = totalResult.length > 0 ? totalResult[0].total : 0;
    const next = offset + limit < total;

    const details = await getPlaceDetails(data);
    const mappedData = mapPlaceDetails(data, details, userId);

    return uResponse.createResponse(res, 200, {
      data: mappedData,
      meta: {
        total,
        next,
        page: parseInt(page),
        limit,
      },
    });
  } catch (error) {
    return uResponse.createResponse(res, 404, null, error.message, error);
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
      return uResponse.createResponse(res, 404, null, "Place not found", true);
    }

    const [user] = await Promise.all([
      User.findById(data.userId).select({ password: 0, __v: 0 }),
    ]);

    return uResponse.createResponse(res, 200, {
      ...data.toObject(),
      user,
    });
  } catch (error) {
    return uResponse.createResponse(res, 500, null, error.message, error);
  }
});

/**
 * Create new place
 */
router.post(
  "/",
  verifyToken,
  fileHelpers.multerUpload({ folder: "places", maxFiles: 5 }),
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
        location,
      } = req.body;

      const { province, district, ward, categories } =
        await uQueryInfo.queryInfoDetails({
          provinceCode,
          districtCode,
          wardCode,
          categoryIds,
        });

      const newPlace = new Place({
        title,
        descriptions,
        images: files.map((file) => ({
          publicId: file.publicId,
          filename: file.filename,
          url: file.url,
          width: file.width,
          height: file.height,
        })),
        userId: Types.ObjectId(req.userId),
        categories: categories.map(({ _id, title }) => ({
          _id,
          title,
        })),
        priceRange: {
          start: parseFloat(priceStart),
          end: parseFloat(priceEnd),
        },
        address,
        province: { code: province.code, ...province },
        district: { code: district.code, ...district },
        ward: { code: ward.code, ...ward },
        point: parseFloat(point),
        location: location
          ? {
              longitude: location.longitude,
              latitude: location.latitude,
            }
          : null,
      });

      const data = await newPlace.save();
      return uResponse.createResponse(res, 201, data);
    } catch (error) {
      return uResponse.createResponse(
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
  const id = req.params.id;
  const userId = req.userId;
  const { like } = req.body;

  try {
    // const data = await Place.findById(id);
    // console.log("🚀 ~ router.post ~ data:", data);
    // if (!data) {
    //   return uResponse.createResponse(res, 404, null, "Place not found", true);
    // }

    // let userLikes = data.userLikes ?? [];
    // const isLike = userLikes.includes(userId);

    // if (like === true && !isLike) {
    //   userLikes.push(userId);
    // } else if (like === false && isLike) {
    //   userLikes = userLikes.filter((i) => i.toString() !== userId);
    // }
    // const dataUpdate = await Place.findOneAndUpdate(
    //   { _id: id },
    //   { $set: { userLikes } },
    //   { new: true }
    // );

    const update = like
      ? { $addToSet: { userLikes: userId } } // add
      : { $pull: { userLikes: userId } }; // remove

    const dataUpdate = await Place.findByIdAndUpdate(
      id,
      update,
      { new: true } // Trả về tài liệu đã cập nhật
    );

    return uResponse.createResponse(res, 200, dataUpdate);
  } catch (error) {
    return uResponse.createResponse(
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
router.put(
  "/:id",
  verifyToken,
  fileHelpers.multerUpload({ folder: "places", maxFiles: 5 }),
  async (req, res) => {
    try {
      const id = req.params.id;
      const uploadedFiles = req.files ?? [];
      const {
        title,
        descriptions,
        address,
        point,
        provinceCode,
        districtCode,
        wardCode,
        categoryIds,
        location,
        priceStart,
        priceEnd,
        removedImages = [],
      } = req.body;

      const placeOld = await Place.findById(id).select({ images: 1, _id: 1 });

      if (!placeOld) {
        return uResponse.createResponse(
          res,
          404,
          null,
          "Place not found",
          true
        );
      }

      const newObj = {};
      if (title) {
        newObj.title = title;
      }
      if (descriptions) newObj.descriptions = descriptions;
      if (address) newObj.address = address;
      if (point) newObj.point = parseFloat(point);
      if (priceStart || priceEnd) {
        newObj.priceRange = {
          start: parseInt(priceStart),
          end: parseInt(priceEnd),
        };
      }
      if (location)
        newObj.location = {
          longitude: location.longitude,
          latitude: location.latitude,
        };

      const removedImages_ =
        typeof removedImages === "string" ? [removedImages] : removedImages;

      fileHelpers.removedFiles(removedImages_, "places");

      const keptImages =
        placeOld.images?.filter(
          (img) => !removedImages_.includes(img.publicId)
        ) ?? [];

      let newImages = [];
      if (uploadedFiles && uploadedFiles.length > 0) {
        newImages = uploadedFiles.map((file) => ({
          publicId: file.publicId,
          filename: file.filename,
          url: file.url,
          width: file.width,
          height: file.height,
        }));
      }

      newObj.images = keptImages.concat(newImages);

      const queryInfo = {};
      if (provinceCode) queryInfo.provinceCode = provinceCode;
      if (districtCode) queryInfo.districtCode = districtCode;
      if (wardCode) queryInfo.wardCode = wardCode;
      if (categoryIds) queryInfo.categoryIds = categoryIds;
      const { province, district, ward, categories } =
        await uQueryInfo.queryInfoDetails(queryInfo);

      if (province && provinceCode)
        newObj.province = { code: provinceCode, ...province };
      if (district && districtCode)
        newObj.district = { code: districtCode, ...district };
      if (ward && wardCode) newObj.ward = { code: wardCode, ...ward };
      if (categories && categoryIds)
        newObj.categories = categories.map(({ _id, title }) => ({
          _id,
          title,
        }));

      const data = await Place.findByIdAndUpdate(
        id,
        {
          $set: newObj,
        },
        { new: true }
      );

      if (!data) {
        return uResponse.createResponse(
          res,
          404,
          null,
          "Place not found",
          true
        );
      }

      return uResponse.createResponse(res, 200, data);
    } catch (error) {
      return uResponse.createResponse(
        res,
        500,
        null,
        "Server error during place update",
        error
      );
    }
  }
);

/**
 * Delete place by ID
 */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const id = req.params.id;

    const data = await Place.findByIdAndUpdate(
      id,
      { $set: { status: Place.STATUS.DELETED } },
      { new: true, runValidators: true }
    );

    if (!data) {
      return uResponse.createResponse(
        res,
        404,
        null,
        "Place not found or already deleted",
        true
      );
    }
    return uResponse.createResponse(res, 200, {}, "Place deleted successfully");
  } catch (error) {
    return uResponse.createResponse(
      res,
      500,
      null,
      "Server error during place update",
      error
    );
  }
});

module.exports = router;

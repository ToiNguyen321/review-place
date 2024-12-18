const express = require("express");
const router = express.Router();
const Place = require("../../models/Place");
const { uploadHelpers } = require("../../helpers");
const { verifyToken, userByToken } = require("../../middleware/authMiddleware");
const User = require("../../models/User");
const Province = require("../../models/Province");
const District = require("../../models/District");
const Ward = require("../../models/Ward");

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
  } = req.query;
  const userId = req.userId;
  try {
    const limit = parseInt(pageSize);
    const offset = parseInt(page) * limit;

    const query = {
      status: Place.STATUS.ACTIVE,
    };

    if (categoryIds) {
      // Chuyển đổi categoryIds thành mảng nếu có
      const categoryIdsArray = categoryIds ? categoryIds.split(",") : [];
      query.categoryIds = { $in: categoryIdsArray };
    }

    if (userLikes) {
      const userLikesArray = userLikes ? userLikes.split(",") : [];
      query.userLikes = { $in: userLikesArray };
    }

    if (provinceCode) {
      query.provinceCode = { $in: provinceCode };
    }
    if (userIdPost) {
      query.userId = { $in: userIdPost };
    }

    const project = {
      __v: 0,
    };

    const data = await Place.find(query)
      .skip(offset)
      .limit(limit)
      .select(project)
      .lean();
    const total = await Place.countDocuments(query);
    //Get user info
    const userIds = data.map((i) => i?.userId);
    const wardCodes = data.map((i) => i.wardCode);
    const districtCodes = data.map((i) => i.districtCode);
    const provinceCodes = data.map((i) => i.provinceCode);

    const [users = [], provinces = [], districts = [], wards = []] =
      await Promise.allSettled([
        User.find({ _id: { $in: userIds } }).select({
          password: 0,
          __v: 0,
        }),
        Province.find({ code: { $in: provinceCodes } }).select({
          __v: 0,
        }),
        District.find({ code: { $in: districtCodes } }).select({
          __v: 0,
        }),
        Ward.find({ code: { $in: wardCodes } }).select({
          __v: 0,
        }),
      ]);

    data.map((pl) => {
      //user
      const user = users.value.find((i) => i._id == pl.userId);
      pl.user = user ?? null;

      //Province Info
      const province = provinces.value.find((i) => i.code == pl.provinceCode);
      pl.province = province ?? null;
      //ward
      const district = districts.value.find((i) => i.code == pl.districtCode);
      pl.district = district ?? null;
      //ward
      const ward = wards.value.find((i) => i.code == pl.wardCode);
      pl.ward = ward ?? null;

      pl.likedByUser = userId && pl.userLikes.includes(userId);
    });

    return res.status(200).json({
      data,
      meta: {
        total,
        next: total > offset + limit,
        page: parseInt(page),
        limit,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
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
      return res.status(404).json({ message: "Place not found" });
    }

    // const userIds = data.map(i => i?.userId)
    // const wardCodes = data.map(i => i.wardCode)
    // const districtCodes = data.map(i => i.districtCode)
    // const provinceCodes = data.map(i => i.provinceCode)

    const [user, province, district, ward] = await Promise.allSettled([
      User.findById(data.userId, {
        password: 0,
        __v: 0,
      }),
      Province.findOne({ code: data.provinceCode }).select({
        __v: 0,
      }),
      District.findOne({ code: data.provinceCode }).select({
        __v: 0,
      }),
      Ward.findOne({ code: data.provinceCode }).select({
        __v: 0,
      }),
    ]);

    return res.json({
      ...data.toObject(),
      user: user.value,
      province: province.value,
      district: district.value,
      ward: ward.value,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
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
          url: `http://${req.headers.host}/files/places/${file.filename}`,
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
      return res.status(201).json(data);
    } catch (error) {
      return res.status(500).json({
        code: 500,
        message: "Server error during place creation",
        error: error.message,
      });
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
      return res.status(404).json({ code: 404, error: "Place not found" });
    }

    let userLikes = data.userLikes ?? [];
    // Kiểm tra xem userId có tồn tại trong mảng userLikes hay không
    const isLike = userLikes.includes(userId);

    if (like === true && !isLike) {
      // Nếu like là true và userId chưa có trong mảng userLikes thì thêm vào
      userLikes.push(userId);
    } else if (like === false && isLike) {
      // Nếu like là false và userId đã có trong mảng userLikes thì xóa đi
      userLikes = userLikes.filter((i) => i !== userId);
    }

    const dataUpdate = await Place.updateOne(
      { _id: id },
      { $set: { userLikes } },
      { new: true }
    );
    return res.json(dataUpdate);
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: "Server error during place update",
      error: error.message,
    });
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
    if (title) {
      newObj.title = title;
    }
    if (descriptions) {
      newObj.descriptions = descriptions;
    }
    if (address) {
      newObj.address = address;
    }
    if (provinceCode) {
      newObj.provinceCode = provinceCode;
    }
    if (districtCode) {
      newObj.districtCode = districtCode;
    }
    if (wardCode) {
      newObj.wardCode = wardCode;
    }

    const data = await Place.findByIdAndUpdate(
      id,
      { $set: newObj },
      { new: true }
    );

    if (!data) {
      return res.status(404).json({ code: 404, error: "Place not found" });
    }

    return res.json(data);
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: "Server error during place update",
      error: error.message,
    });
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
      return res.status(404).json({
        code: 404,
        error: "Place not found or already deleted",
      });
    }

    return res.json({ message: "Place deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: "Server error during place deletion",
      error: error.message,
    });
  }
});

module.exports = router;

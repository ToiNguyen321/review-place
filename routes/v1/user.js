const express = require("express");
const router = express.Router();
const { uploadHelpers } = require("../../helpers");
const User = require("../../models/User");
const { userUtils } = require("../../utils").default;
const { verifyToken } = require("../../middleware/authMiddleware");
const Province = require("../../models/Province");
const District = require("../../models/District");
const Ward = require("../../models/Ward");

/**
 * Get all users
 */
router.get("/", async (req, res) => {
  try {
    const limit = 12;
    const offset = 0;

    const query = {
      // status: User.STATUS.ACTIVE,
    };

    const project = {
      __v: 0,
    };

    const data = await User.find(query)
      .skip(offset)
      .limit(limit)
      .select(project)
      .lean();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Get statistic user
 */
router.get("/statistic/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const { placeTotal, reviewTotal, likeTotal } = await userUtils.calculator(
      userId
    );
    return res.status(200).json({
      placeTotal,
      reviewTotal,
      likeTotal,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Get user authen
 */
router.get("/me", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const query = {
      _id: userId,
    };

    const project = {
      password: 0,
      __v: 0,
    };

    const data = await User.findOne(query, project);

    if (!data) {
      return res.status(404).json({ error: "User not found" });
    }

    const { placeTotal, reviewTotal, likeTotal } = await userUtils.calculator(
      userId
    );
    const [province, district, ward] = await Promise.allSettled([
      Province.findOne({ code: data.provinceCode }).select({
        __v: 0,
      }),
      District.findOne({ code: data.districtCode }).select({
        __v: 0,
      }),
      Ward.findOne({ code: data.wardCode }).select({
        __v: 0,
      }),
    ]);

    return res.status(200).json({
      ...data.toObject(),
      placeTotal,
      reviewTotal,
      likeTotal,
      province: province.value,
      district: district.value,
      ward: ward.value,
    });
  } catch (error) {
    console.log("🚀 ~ router.get ~ error:", error);
    return res.status(500).json({ error: error.message });
  }
});

//Get user by Id
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const query = {
      status: User.STATUS.ACTIVE,
      _id: userId,
    };

    const project = {
      password: 0,
      __v: 0,
    };

    const data = await User.findOne(query, project);

    if (!data) {
      return res.status(404).json({ error: "User not found" });
    }

    const { placeTotal, reviewTotal, likeTotal } = await userUtils.calculator(
      userId
    );
    return res.status(200).json({
      ...data.toObject(),
      placeTotal,
      reviewTotal,
      likeTotal,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
/**
 * Update user by ID
 */
router.put(
  "/:id",
  uploadHelpers.multerUpload("users").single("files"),
  async (req, res) => {
    try {
      const id = req.params.id;
      const {
        fullName,
        slogan,
        password,
        address,
        provinceCode,
        districtCode,
        wardCode,
      } = req.body;
      const file = req.file ?? null; // Use req.file instead of req.files
      const userUpdateData = {};

      if (password) {
        userUpdateData.password = password;
      }
      if (slogan) {
        userUpdateData.slogan = slogan;
      }
      if (fullName) {
        userUpdateData.fullName = fullName;
      }
      if (address) {
        userUpdateData.address = address;
      }
      if (provinceCode) {
        userUpdateData.provinceCode = provinceCode;
      }
      if (districtCode) {
        userUpdateData.districtCode = districtCode;
      }
      if (wardCode) {
        userUpdateData.wardCode = wardCode;
      }

      if (file) {
        userUpdateData.avatar = {
          filename: file.filename,
          url: `http://${req.headers.host}/files/users/${file.filename}`,
          size: file.size,
          mimetype: file.mimetype,
        };
      }

      const data = await User.findByIdAndUpdate(
        id,
        { $set: userUpdateData },
        { new: true }
      );

      if (!data) {
        return res
          .status(404)
          .json({ error: "User not found or update failed" });
      }

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: "Server error 500" });
    }
  }
);

/**
 * Delete user by ID
 */
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = await User.findByIdAndUpdate(
      id,
      { $set: { status: User.STATUS.DELETED } },
      { new: true }
    );

    if (!data) {
      return res
        .status(404)
        .json({ error: "User not found or already deleted" });
    }

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;

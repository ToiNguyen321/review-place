const express = require("express");
const router = express.Router();
const { uploadHelpers, responseHelpers } = require("../../helpers");
const User = require("../../models/User");
const { userUtils } = require("../../utils");
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
    return responseHelpers.createResponse(res, 200, data);
  } catch (error) {
    return responseHelpers.createResponse(res, 500, null, error.message, error);
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
    return responseHelpers.createResponse(res, 200, {
      placeTotal,
      reviewTotal,
      likeTotal,
    });
  } catch (error) {
    return responseHelpers.createResponse(res, 500, null, error.message, error);
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
      return responseHelpers.createResponse(
        res,
        404,
        null,
        "User not found",
        true
      );
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
    return responseHelpers.createResponse(res, 200, {
      ...data.toObject(),
      placeTotal,
      reviewTotal,
      likeTotal,
      province: province.value,
      district: district.value,
      ward: ward.value,
    });
  } catch (error) {
    return responseHelpers.createResponse(res, 500, null, error.message, error);
  }
});

//Get user by Id
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const query = { status: User.STATUS.ACTIVE, _id: userId };
    const project = { password: 0, __v: 0 };

    const data = await User.findOne(query, project);

    if (!data) {
      return responseHelpers.createResponse(
        res,
        404,
        null,
        "User not found",
        true
      );
    }

    const { placeTotal, reviewTotal, likeTotal } = await userUtils.calculator(
      userId
    );
    return responseHelpers.createResponse(res, 200, {
      ...data.toObject(),
      placeTotal,
      reviewTotal,
      likeTotal,
    });
  } catch (error) {
    return responseHelpers.createResponse(res, 500, null, error.message, error);
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
          url: `files/users/${file.filename}`,
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
        return responseHelpers.createResponse(
          res,
          404,
          null,
          "User not found or update failed",
          true
        );
      }

      return responseHelpers.createResponse(res, 200, data);
    } catch (error) {
      return responseHelpers.createResponse(
        res,
        500,
        null,
        error.message,
        error
      );
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
      return responseHelpers.createResponse(
        res,
        404,
        null,
        "User not found or already deleted",
        true
      );
    }
    return responseHelpers.createResponse(
      res,
      200,
      null,
      "User deleted successfully"
    );
  } catch (error) {
    return responseHelpers.createResponse(res, 500, null, error.message, error);
  }
});

module.exports = router;

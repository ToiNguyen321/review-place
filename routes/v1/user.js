import express from "express";
import { fileHelpers } from "../../helpers/index.js";
import { User } from "../../models/index.js";
import { uUser, uQueryInfo, uResponse } from "../../utils/index.js";
import { verifyToken } from "../../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Get all users
 */
router.get("/", verifyToken, async (req, res) => {
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
    return uResponse.createResponse(res, 200, data);
  } catch (error) {
    return uResponse.createResponse(res, 500, null, error.message, error);
  }
});

/**
 * Get statistic user
 */
router.get("/statistic/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const { placeTotal, reviewTotal, likeTotal } = await uUser.calculator(
      userId
    );
    return uResponse.createResponse(res, 200, {
      placeTotal,
      reviewTotal,
      likeTotal,
    });
  } catch (error) {
    return uResponse.createResponse(res, 500, null, error.message, error);
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
      return uResponse.createResponse(res, 404, null, "User not found", true);
    }

    const { placeTotal, reviewTotal, likeTotal } = await uUser.calculator(
      userId
    );

    return uResponse.createResponse(res, 200, {
      ...data.toObject(),
      placeTotal,
      reviewTotal,
      likeTotal,
    });
  } catch (error) {
    console.log("🚀 ~ router.get ~ error:", error);
    return uResponse.createResponse(res, 500, null, error.message, error);
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
      return uResponse.createResponse(res, 404, null, "User not found", true);
    }

    const { placeTotal, reviewTotal, likeTotal } = await uUser.calculator(
      userId
    );

    return uResponse.createResponse(res, 200, {
      ...data.toObject(),
      placeTotal,
      reviewTotal,
      likeTotal,
    });
  } catch (error) {
    return uResponse.createResponse(res, 500, null, error.message, error);
  }
});
/**
 * Update user by ID
 */
router.put(
  "/:id",
  fileHelpers.multerUpload("users", 1, true),
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
        orientations,
        interests,
        gender,
      } = req.body;

      const files = req?.files || []; // Use req.file instead of req.files
      const userOld = await Place.findById(id).select({ images: 1, _id: 1 });

      if (!userOld) {
        return uResponse.createResponse(res, 404, null, "User not found", true);
      }

      const userUpdateData = {};

      const { province, district, ward } = await uQueryInfo.queryInfoDetails({
        provinceCode,
        districtCode,
        wardCode,
      });

      if (password) {
        userUpdateData.password = password;
      }
      if (slogan) {
        userUpdateData.slogan = slogan;
      }
      if (fullName) {
        userUpdateData.fullName = fullName;
      }
      if (gender) {
        userUpdateData.gender = gender;
      }
      if (orientations) {
        userUpdateData.orientations = orientations;
      }
      if (interests) {
        userUpdateData.interests = interests;
      }
      if (address) {
        userUpdateData.address = address;
      }
      if (ward && wardCode) {
        userUpdateData.ward = ward;
      }
      if (district && districtCode) {
        userUpdateData.district = district;
      }
      if (province && provinceCode) {
        userUpdateData.province = province;
      }

      if (files.length > 0) {
        fileHelpers.removedFiles([userOld?.avatar], "users");
        userUpdateData.avatar = {
          filename: files[0].filename,
          url: `files/users/${file.filename}`,
        };
      }

      const data = await User.findByIdAndUpdate(
        id,
        { $set: userUpdateData },
        { new: true }
      );

      if (!data) {
        return uResponse.createResponse(
          res,
          404,
          null,
          "User not found or update failed",
          true
        );
      }

      return uResponse.createResponse(res, 200, data);
    } catch (error) {
      return uResponse.createResponse(res, 500, null, error.message, error);
    }
  }
);

router.post("/register-firebase", async (req, res) => {
  const { firebaseToken } = req.body;
  try {
    return uResponse.createResponse(
      res,
      200,
      {
        firebaseToken,
      },
      "Register firebase token success"
    );
  } catch (error) {
    return uResponse.createResponse(
      res,
      200,
      null,
      "Invalid or expired token",
      error
    );
  }
});

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
      return uResponse.createResponse(
        res,
        404,
        null,
        "User not found or already deleted",
        true
      );
    }
    return uResponse.createResponse(
      res,
      200,
      null,
      "User deleted successfully"
    );
  } catch (error) {
    return uResponse.createResponse(res, 500, null, error.message, error);
  }
});

export default router;

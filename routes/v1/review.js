const express = require("express");
const router = express.Router();
const Place = require("../../models/Place");
const Review = require("../../models/Review");
const User = require("../../models/User");
const { uploadHelpers, responseHelpers } = require("../../helpers");
const { verifyToken } = require("../../middleware/authMiddleware");
const { place: placeUtils } = require("../../utils");

/**
 * Home page: loading all Reviews
 */
router.get("/", async (req, res) => {
  const { page = 0, pageSize = 10, placeId } = req.query;
  try {
    const limit = parseInt(pageSize);
    const offset = parseInt(page) * limit;

    const query = {
      status: Review.STATUS.ACTIVE,
    };

    if (placeId) {
      query.placeId = placeId;
    }

    const project = {
      __v: 0,
    };

    const data = await Review.find(query)
      .skip(offset)
      .limit(limit)
      .select(project)
      .sort({ createdAt: "desc" })
      .lean();
    const total = await Review.countDocuments(query);

    const userIds = data.map((i) => i?.userId);
    const users = await User.find({ _id: { $in: userIds } }).select({
      password: 0,
      __v: 0,
    });

    data.map((i) => {
      const user = users.find((us) => us._id == i.userId);
      i.user = user ?? null;
    });
    return responseHelpers.createResponse(res, 200, {
      data,
      meta: {
        total,
        next: total > offset + limit,
        page: parseInt(page),
        limit,
      },
    });
  } catch (error) {
    return responseHelpers.createResponse(res, 500, null, error.message, error);
  }
});

/**
 * Get Review by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Review.findById(id);
    const user = await User.findById(data.userId).select({
      password: 0,
      __v: 0,
    });
    if (!data) {
      return responseHelpers.createResponse(
        res,
        404,
        null,
        "Review not found",
        error
      );
    }
    return responseHelpers.createResponse(res, 200, {
      ...data.toObject(),
      user,
    });
  } catch (error) {
    return responseHelpers.createResponse(res, 500, null, error.message, error);
  }
});

/**
 * Create new Review
 */
router.post(
  "/",
  verifyToken,
  uploadHelpers.multerUpload("reviews").array("files", 3),
  async (req, res) => {
    try {
      const files = req.files ?? [];
      const { title, descriptions, placeId, rating = 0 } = req.body;

      const newReview = new Review({
        title,
        descriptions,
        images: files.map((file) => ({
          filename: file.filename,
          url: `files/reviews/${file.filename}`,
          size: file.size,
          mimetype: file.mimetype,
        })),
        userId: req.userId,
        placeId,
        rating: parseInt(rating) || 0,
      });

      const { averageRating } = await placeUtils.calculator(placeId);

      const [_, data] = await Promise.all([
        Place.updateOne(
          { _id: placeId },
          {
            $inc: { totalRating: 1 },
            rating: averageRating,
          }
        ),
        newReview.save(),
      ]);
      return responseHelpers.createResponse(res, 201, data);
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
 * Update Review by ID
 */
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    const { title, descriptions } = req.body;

    const newObj = {};
    if (title) {
      newObj.title = title;
    }
    if (descriptions) {
      newObj.descriptions = descriptions;
    }

    const data = await Review.findByIdAndUpdate(
      id,
      { $set: newObj },
      { new: true }
    );

    if (!data) {
      return responseHelpers.createResponse(
        res,
        404,
        null,
        "Review not found",
        true
      );
    }

    return responseHelpers.createResponse(res, 200, data);
  } catch (error) {
    return responseHelpers.createResponse(res, 500, null, error.message, error);
  }
});

/**
 * Delete Review by ID
 */
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const data = await Review.findByIdAndUpdate(
      id,
      { $set: { status: Review.STATUS.DELETED } },
      { new: true }
    );

    if (!data) {
      return responseHelpers.createResponse(
        res,
        404,
        null,
        "Review not found or already deleted",
        true
      );
    }
    return responseHelpers.createResponse(
      res,
      200,
      null,
      "Review deleted successfully"
    );
  } catch (error) {
    return responseHelpers.createResponse(res, 500, null, error.message, error);
  }
});

module.exports = router;

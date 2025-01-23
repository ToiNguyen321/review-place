const express = require("express");
const router = express.Router();
const { Place, Review } = require("../../models");
const User = require("../../models/User");
const { fileHelpers } = require("../../helpers");
const { verifyToken, userByToken } = require("../../middleware/authMiddleware");
const { uPlace, uResponse } = require("../../utils");
const { Types } = require("mongoose");
const reviewQueries = require("../../query/review.query");

/**
 * Home page: loading all Reviews
 */
router.get("/", userByToken, async (req, res) => {
  const userId = req.userId;
  const { page = 0, pageSize = 10, placeId, rating } = req.query;
  try {
    const limit = parseInt(pageSize);
    const offset = parseInt(page) * limit;

    const query = {
      status: Review.STATUS.ACTIVE,
    };

    if (rating && rating > 0) {
      query.rating = { $eq: rating };
    }

    if (placeId) {
      query.placeId = placeId;
    }

    const project = {
      __v: 0,
    };

    // const data = await Review.find(query)
    //   .skip(offset)
    //   .limit(limit)
    //   .select(project)
    //   .sort({
    //     createdAt: "desc",
    //   })
    //   .lean();
    // const data = await Review.aggregate([
    //   { $match: query }, // Điều kiện match ban đầu (trạng thái, rating, placeId...)
    //   {
    //     $addFields: {
    //       isUserReview: { $eq: ["userId", userId] }, // Trường mới đánh dấu review của người dùng hiện tại
    //     },
    //   },
    //   {
    //     $sort: {
    //       isUserReview: -1, // Đảm bảo review của người dùng hiện tại được ưu tiên
    //       createdAt: -1, // Sau đó sắp xếp theo thời gian
    //     },
    //   },
    //   {
    //     $skip: offset, // Phân trang: bỏ qua các review đã tải
    //   },
    //   {
    //     $limit: limit, // Giới hạn số lượng review trên mỗi trang
    //   },
    //   {
    //     $project: project, // Chọn các trường muốn hiển thị
    //   },
    // ]);

    // const total = await Review.countDocuments(query);

    const result = await Review.aggregate([
      { $match: query },
      {
        $facet: {
          data: [
            reviewQueries.addUserField(userId),
            ...reviewQueries.sortPipeline,
            ...reviewQueries.paginatePipeline(offset, limit),
            reviewQueries.lookupUserPipeline,
            reviewQueries.unwindUserPipeline,
            reviewQueries.projectPipeline,
          ],
          total: reviewQueries.countTotalPipeline(query),
        },
      },
    ]);

    // Trích xuất dữ liệu và total count
    const data = result[0]?.data || [];
    const total = result[0]?.total[0]?.count || 0;

    if (data.length === 0) {
      return uResponse.createResponse(res, 200, {
        data,
        meta: {
          total: 0,
          next: false,
          page: parseInt(page),
          limit,
        },
      });
    }

    // const userIds = data.map((i) => i?.userId);
    // const users = await User.find({ _id: { $in: userIds } }).select({
    //   password: 0,
    //   __v: 0,
    // });

    // data.map((i) => {
    //   const user = users.find((us) => us._id == i.userId);
    //   i.user = user ?? null;
    // });

    return uResponse.createResponse(res, 200, {
      data,
      meta: {
        total,
        next: total > offset + limit,
        page: parseInt(page),
        limit,
      },
    });
  } catch (error) {
    console.log("🚀 ~ router.get ~ error:", error);
    return uResponse.createResponse(res, 500, null, error.message, error);
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
      return uResponse.createResponse(
        res,
        404,
        null,
        "Review not found",
        error
      );
    }
    return uResponse.createResponse(res, 200, {
      ...data.toObject(),
      user,
    });
  } catch (error) {
    return uResponse.createResponse(res, 500, null, error.message, error);
  }
});

/**
 * Create new Review
 */
router.post(
  "/",
  verifyToken,
  fileHelpers.multerUpload({ folder: "reviews", maxFiles: 3 }),
  async (req, res) => {
    try {
      const files = req.files ?? [];
      const { title, descriptions, placeId, rating = 0 } = req.body;
      const newReview = new Review({
        title,
        descriptions,
        images: files.map((file) => ({
          publicId: file.publicId,
          filename: file.filename,
          url: file.url,
          width: file.width,
          height: file.height,
        })),
        userId: req.userId,
        placeId,
        rating: parseInt(rating) || 0,
      });

      const { averageRating = 0 } = await uPlace.calculator(placeId);
      console.log("🚀 ~ averageRating:", averageRating);

      const [_, data] = await Promise.all([
        Place.updateOne(
          { _id: placeId },
          {
            $inc: { totalRating: 1 },
            rating: averageRating,
            $addToSet: { userReviews: req.userId },
          }
        ),
        newReview.save(),
      ]);
      return uResponse.createResponse(res, 201, data);
    } catch (error) {
      console.log("🚀 ~ error:", error);
      return uResponse.createResponse(res, 500, null, error.message, error);
    }
  }
);

/**
 * Update Review by ID
 */
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    const uploadedFiles = req.files ?? [];
    const { title, descriptions, removedImages, rating = 0 } = req.body;

    const reviewOld = await Review.findById(id).select({ images: 1, _id: 1 });

    if (!reviewOld) {
      return uResponse.createResponse(res, 404, null, "Review not found", true);
    }

    const newObj = {};
    if (title) {
      newObj.title = title;
    }
    if (descriptions) {
      newObj.descriptions = descriptions;
    }
    if (rating) {
      newObj.rating = parseInt(rating);
    }

    const removedImages_ =
      typeof removedImages === "string" ? [removedImages] : removedImages;

    fileHelpers.removedFiles(removeFiles, "reviews");

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

    const data = await Review.findByIdAndUpdate(
      id,
      { $set: newObj },
      { new: true }
    );

    if (!data) {
      return uResponse.createResponse(res, 404, null, "Review not found", true);
    }

    return uResponse.createResponse(res, 200, data);
  } catch (error) {
    return uResponse.createResponse(res, 500, null, error.message, error);
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
      return uResponse.createResponse(
        res,
        404,
        null,
        "Review not found or already deleted",
        true
      );
    }
    return uResponse.createResponse(
      res,
      200,
      null,
      "Review deleted successfully"
    );
  } catch (error) {
    return uResponse.createResponse(res, 500, null, error.message, error);
  }
});

module.exports = router;

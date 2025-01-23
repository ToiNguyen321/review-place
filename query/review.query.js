const reviewQueries = {
  addUserField: (userId) => ({
    $addFields: {
      isUserReview: { $eq: ["$userId", userId] },
    },
  }),
  sortPipeline: [
    {
      $sort: {
        isUserReview: -1,
        createdAt: -1,
      },
    },
  ],
  paginatePipeline: (offset, limit) => [{ $skip: offset }, { $limit: limit }],
  lookupUserPipeline: {
    $lookup: {
      from: "users",
      let: { userIdStr: "$userId" },
      pipeline: [
        { $addFields: { userIdStr: { $toString: "$_id" } } },
        { $match: { $expr: { $eq: ["$$userIdStr", "$userIdStr"] } } },
      ],
      as: "user",
    },
  },
  unwindUserPipeline: {
    $unwind: {
      path: "$user",
      preserveNullAndEmptyArrays: true,
    },
  },
  projectPipeline: {
    $project: {
      userId: 1,
      title: 1,
      content: 1,
      rating: 1,
      images: 1,
      isUserReview: 1,
      createdAt: 1,
      "user._id": 1,
      "user.fullname": 1,
      "user.avatar": 1,
    },
  },
  countTotalPipeline: (query) => [{ $match: query }, { $count: "count" }],
};

module.exports = reviewQueries;

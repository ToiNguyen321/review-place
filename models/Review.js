const mongoose = require("mongoose");
const { STATUS } = require("../constants");

const schema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
    },
    descriptions: {
      type: String,
      required: true,
    },
    images: {
      type: [
        {
          filename: {
            type: String,
            required: true,
          },
          url: {
            type: String,
            required: true,
          },
        },
      ],
      default: [],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    placeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "place",
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(STATUS),
      default: STATUS.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

schema.statics.STATUS = STATUS;

module.exports = mongoose.model("review", schema);

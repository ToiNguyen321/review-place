const { STATUS } = require("../constants");
const { mongoose } = require("./database");

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
          publicId: {
            type: String,
            required: true,
          },
          filename: {
            type: String,
          },
          url: {
            type: String,
            required: true,
          },
          width: {
            type: Number,
          },
          height: {
            type: Number,
          },
          _id: false,
        },
      ],
      default: [],
    },
    userId: {
      type: String,
      required: true,
    },
    placeId: {
      type: String,
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

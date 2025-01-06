const { STATUS } = require("../constants");
const { mongoose } = require("./database");

const schema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
      required: true,
    },
    descriptions: {
      type: String,
      default: "",
    },
    image: {
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
    },
    status: {
      type: String,
      default: STATUS.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

schema.statics.STATUS = STATUS;

module.exports = mongoose.model("category", schema);

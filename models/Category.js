const mongoose = require("mongoose");

const STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  BLOCK: "block",
  DELETED: "deleted",
};

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
      type: Object,
      required: true,
    },
    status: {
      type: String,
      default: STATUS.ACTIVE,
    },
    rating: Number,
  },
  {
    timestamps: true,
  }
);

schema.statics.STATUS = STATUS;

module.exports = mongoose.model("category", schema);

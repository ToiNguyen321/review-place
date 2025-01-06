const { STATUS } = require("../constants");
const { mongoose } = require("./database");

const schema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
      required: true,
    },
    color: {
      type: String,
    },
    sort: {
      type: Number,
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

module.exports = mongoose.model("orientation", schema);

import mongoose from "mongoose";

import { STATUS } from "../constants/index.js";

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

export default mongoose.model("category", schema);

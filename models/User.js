import mongoose from "mongoose";
import { GENDER, ROLE, STATUS } from "../constants/index.js";

const schema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      default: null,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      default: null,
    },
    email: {
      type: String,
      default: null,
    },
    fullName: {
      type: String,
      default: "",
    },
    avatar: {
      filename: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    slogan: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      default: 0,
    },
    trendAndInterest: {
      type: String,
      default: "",
    },
    firebaseToken: {
      type: String,
    },
    address: {
      type: String,
      default: "",
    },
    province: {
      code: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
    },
    district: {
      code: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
    },
    ward: {
      code: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
    },
    orientations: {
      type: [String],
      required: true,
      default: [],
    },
    interests: {
      type: [String], //$push || $pull
      required: true,
      default: [],
    },
    gender: {
      type: String,
      enum: Object.values(GENDER),
    },
    role: {
      type: String,
      enum: Object.values(ROLE),
      default: ROLE.USER,
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
schema.statics.ROLE = ROLE;
schema.statics.GENDER = GENDER;

export default mongoose.model("User", schema); // dùng 'User' thay vì 'user' cho tên model

const mongoose = require("mongoose");

const STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  BLOCK: "block",
  DELETED: "deleted",
};

const ROLE = {
  USER: "user",
  ADMIN: "admin",
};

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
    role: {
      type: String,
      enum: Object.values(ROLE),
      default: ROLE.USER,
    },
    rating: {
      type: Number,
      default: 0,
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

module.exports = mongoose.model("User", schema); // dùng 'User' thay vì 'user' cho tên model

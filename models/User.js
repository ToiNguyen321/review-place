const { STATUS, GENDER, ROLE } = require("../constants");
const { mongoose } = require("./database");

const schema = new mongoose.Schema(
  {
    username: {
      type: String,
      default: null,
    },
    email: {
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
      // required: true,
      default: null,
    },
    fullName: {
      type: String,
      default: "",
    },
    avatar: {
      publicId: {
        type: String,
      },
      filename: {
        type: String,
      },
      url: {
        type: String,
      },
      width: {
        type: Number,
      },
      height: {
        type: Number,
      },
      _id: false,
    },
    slogan: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      default: 0,
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
      },
      name: {
        type: String,
      },
    },
    district: {
      code: {
        type: String,
      },
      name: {
        type: String,
      },
    },
    ward: {
      code: {
        type: String,
      },
      name: {
        type: String,
      },
    },
    personalization: {
      orientations: {
        type: [String],
        default: [],
      },
      interests: {
        type: [String],
        default: [],
      },
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
    passwordResetOtp: String,
    passwordResetExpires: Date,
    status: {
      type: String,
      enum: Object.values(STATUS),
      default: STATUS.ACTIVE,
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

schema.statics.STATUS = STATUS;
schema.statics.ROLE = ROLE;
schema.statics.GENDER = GENDER;

module.exports = mongoose.model("User", schema); // dùng 'User' thay vì 'user' cho tên model

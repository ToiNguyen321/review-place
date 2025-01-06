const { STATUS, GENDER, ROLE } = require("../constants");
const { mongoose } = require("./database");

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

module.exports = mongoose.model("User", schema); // dùng 'User' thay vì 'user' cho tên model

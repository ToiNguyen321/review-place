const { STATUS } = require("../constants");
const { mongoose } = require("./database");

const schema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    descriptions: {
      type: String,
      default: "",
      trim: true,
    },
    userLikes: {
      type: [String],
      default: [],
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
    categories: {
      type: [
        {
          _id: {
            type: String,
            required: true,
          },
          title: {
            type: String,
            required: true,
          },
        },
      ],
      default: [],
    },
    priceRange: {
      start: {
        type: Number,
      },
      end: {
        type: Number,
      },
    },
    address: {
      type: String,
      required: true,
      trim: true,
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
      nameEn: {
        type: String,
        required: true,
      },
      fullName: {
        type: String,
        required: true,
      },
      fullNameEn: {
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
      nameEn: {
        type: String,
        required: true,
      },
      fullName: {
        type: String,
        required: true,
      },
      fullNameEn: {
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
      nameEn: {
        type: String,
        required: true,
      },
      fullName: {
        type: String,
        required: true,
      },
      fullNameEn: {
        type: String,
        required: true,
      },
    },
    location: {
      coordinates: {
        longitude: {
          type: Number,
        },
        latitude: {
          type: Number,
        },
      },
    },
    point: {
      type: Number,
      default: 0,
      require: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    totalRating: {
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
    strict: true,
  }
);

schema.statics.STATUS = STATUS;

module.exports = mongoose.model("place", schema);

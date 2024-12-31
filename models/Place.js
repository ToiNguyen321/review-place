const mongoose = require("mongoose");

const STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  DELETED: "deleted",
};

// const schema = new mongoose.Schema(
//   {
//     title: String,
//     descriptions: String,
//     images: Array,
//     userId: String,
//     userLikes: {
//       type: Array,
//       default: [],
//     },
//     categoryIds: {
//       type: Array,
//       default: [],
//     },
//     priceStart: Number,
//     priceEnd: Number,
//     address: String,
//     wardCode: String,
//     districtCode: String,
//     provinceCode: String,
//     point: {
//       type: Number,
//       default: 0,
//       require: true,
//     },
//     rating: {
//       type: Number,
//       default: 0,
//     },
//     totalRating: {
//       type: Number,
//       default: 0,
//     },
//     status: {
//       type: String,
//       default: STATUS.ACTIVE,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// schema.statics.STATUS = STATUS;

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
    images: {
      type: [
        {
          filename: {
            type: String,
            required: true,
          },
          url: {
            type: String,
            required: true,
          },
        },
      ],
      default: [],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    categories: {
      type: [
        {
          _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "category",
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

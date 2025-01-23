const Joi = require("joi");

const placeSchema = {
  create: Joi.object({
    title: Joi.string().trim().required().messages({
      "any.required": "Tiêu đề không được để trống.",
      "string.empty": "Tiêu đề không được để trống.",
    }),
    descriptions: Joi.string().trim().required().messages({
      "any.required": "Mô tả không được để trống.",
      "string.empty": "Mô tả không được để trống.",
    }),
    point: Joi.number().required().messages({
      "any.required": "Điểm là bắt buộc.",
      "number.base": "Điểm phải là một số hợp lệ.",
    }),
    categoryIds: Joi.array()
      .items(
        Joi.string().required().messages({
          "string.base": "ID danh mục phải là chuỗi.",
          "any.required": "ID danh mục là bắt buộc.",
        })
      )
      .required()
      .messages({
        "any.required": "Danh sách danh mục là bắt buộc.",
      }),
    priceStart: Joi.number().min(0).default(0).messages({
      "number.min": "Giá bắt đầu không được nhỏ hơn 0.",
    }),
    priceEnd: Joi.number().min(0).default(0).messages({
      "number.min": "Giá kết thúc không được nhỏ hơn 0.",
    }),
    provinceCode: Joi.string().optional(),
    districtCode: Joi.string().optional(),
    wardCode: Joi.string().optional(),
    location: Joi.object({
      longitude: Joi.number().optional(),
      latitude: Joi.number().optional(),
    }).optional(),
    address: Joi.string().trim().optional(),
  }),
};

module.exports = placeSchema;

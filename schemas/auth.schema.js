const Joi = require("joi");

const authSchema = {
  resetPassword: Joi.object({
    email: Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
      .required()
      .messages({
        "string.email": "Địa chỉ email không hợp lệ.",
        "any.required": "Vui lòng nhập email.",
      }),
    password: Joi.string()
      .min(8)
      .max(30)
      .pattern(/^[a-zA-Z0-9]+$/)
      .required()
      .messages({
        "string.min": "Mật khẩu phải có ít nhất 8 ký tự.",
        "string.max": "Mật khẩu không được vượt quá 30 ký tự.",
        "string.pattern.base": "Mật khẩu chỉ được chứa chữ cái và số.",
        "any.required": "Vui lòng nhập mật khẩu.",
      }),
    otp: Joi.string().length(6).required(),
  }),
  login: Joi.object({
    username: Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
      .required(),
    password: Joi.string()
      .min(8)
      .max(30)
      .pattern(/^[a-zA-Z0-9]+$/)
      .required()
      .messages({
        "string.min": "Mật khẩu phải có ít nhất 8 ký tự.",
        "string.max": "Mật khẩu không được vượt quá 30 ký tự.",
        "string.pattern.base": "Mật khẩu chỉ được chứa chữ cái và số.",
        "any.required": "Vui lòng nhập mật khẩu.",
      }),
  }),
  register: Joi.object({
    email: Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
      .required()
      .messages({
        "string.email": "Địa chỉ email không hợp lệ.",
        "any.required": "Vui lòng nhập email.",
      }),
    password: Joi.string()
      .min(8)
      .max(30)
      .pattern(/^[a-zA-Z0-9]+$/)
      .required()
      .messages({
        "string.min": "Mật khẩu phải có ít nhất 8 ký tự.",
        "string.max": "Mật khẩu không được vượt quá 30 ký tự.",
        "string.pattern.base": "Mật khẩu chỉ được chứa chữ cái và số.",
        "any.required": "Vui lòng nhập mật khẩu.",
      }),
    fullName: Joi.string().allow("").required().messages({
      "string.base": "Slogan phải là chuỗi ký tự.",
      "string.empty": "Họ và tên không được để trống.",
      "any.required": "Vui lòng nhập đầy đủ họ tên.",
    }),
    phone: Joi.string()
      .pattern(/^(84|0[3|5|7|8|9])[0-9]{8}$/)
      .messages({
        "string.pattern.base": "Số điện thoại không hợp lệ.",
      }),
    slogan: Joi.string().allow("").messages({
      "string.base": "Slogan phải là chuỗi ký tự.",
    }),
  }),
};

module.exports = authSchema;

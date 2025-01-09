const Joi = require("joi");

const authSchema = {
  resetPassword: Joi.object({
    email: Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
      .required(),
    password: Joi.string()
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
      .required(),
    otp: Joi.string().length(6).required(),
  }),
};

module.exports = authSchema;

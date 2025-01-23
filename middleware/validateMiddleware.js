const { uResponse } = require("../utils");

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errorDetails = error.details.map((err) => ({
        field: err.context.key, // Tên trường bị lỗi
        message: err.message, // Nội dung lỗi
        type: err.type, // Loại lỗi (vd: string.empty, any.required)
      }));
      return uResponse.createResponse(
        res,
        400,
        null,
        "Yêu cầu không hợp lệ. Vui lòng kiểm tra lại dữ liệu.",
        {
          details: errorDetails,
        }
      );
    }
    next();
  };
};

module.exports = {
  validateRequest,
};

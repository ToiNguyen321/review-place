const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errorMessages = error.details.map((err) => err.message);
      return uResponse.createResponse(
        res,
        400,
        null,
        "Missing required information: phone, password, or fullName",
        errorMessages
      );
    }
    next();
  };
};

module.exports = {
  validateRequest,
};

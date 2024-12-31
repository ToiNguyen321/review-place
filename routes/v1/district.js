const express = require("express");
const router = express.Router();
const District = require("../../models/District");
const { uResponse } = require("../../utils");
/**
 * Home page: loading all place
 */
router.get("/", async (req, res) => {
  const { provinceCode } = req.query;

  const query = {
    provinceCode,
  };

  try {
    const project = {
      __v: 0,
      codeName: 0,
      pathWithType: 0,
      pathWithTypeEn: 0,
      administrativeUnitId: 0,
    };

    const data = await District.find(query).select(project).lean();
    return uResponse.createResponse(res, 200, data);
  } catch (error) {
    console.log("🚀 ~ router.get ~ error:", error);
    return uResponse.createResponse(res, 500, null, error.message, error);
  }
});

module.exports = router;

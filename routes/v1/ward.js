const express = require("express");
const router = express.Router();
const { Ward } = require("../../models");
const { uResponse } = require("../../utils");
/**
 * Home page: loading all place
 */
router.get("/", async (req, res) => {
  const { districtCode } = req.query;

  const query = {
    districtCode,
  };

  try {
    const project = {
      __v: 0,
      codeName: 0,
      pathWithType: 0,
      pathWithTypeEn: 0,
      administrativeUnitId: 0,
    };

    const data = await Ward.find(query).select(project).lean();
    return uResponse.createResponse(res, 200, data);
  } catch (error) {
    return uResponse.createResponse(res, 500, null, error.message, error);
  }
});

module.exports = router;

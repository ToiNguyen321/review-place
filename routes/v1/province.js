const express = require("express");
const router = express.Router();
const { uResponse } = require("../../utils");
const { Province } = require("../../models");
/**
 * Home page: loading all place
 */
router.get("/", async (req, res) => {
  try {
    const project = {
      __v: 0,
      codeName: 0,
      pathWithType: 0,
      pathWithTypeEn: 0,
      administrativeUnitId: 0,
    };

    const data = await Province.find().select(project).lean();
    return uResponse.createResponse(res, 200, data);
  } catch (error) {
    return uResponse.createResponse(res, 500, null, error.message, error);
  }
});

module.exports = router;

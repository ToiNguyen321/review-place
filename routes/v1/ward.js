import express from "express";
import { Ward } from "../../models/index.js";
import { uResponse } from "../../utils/index.js";
const router = express.Router();
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

export default router;

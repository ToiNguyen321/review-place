const express = require("express");
const router = express.Router();
const Ward = require("../../models/Ward");
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
    return res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

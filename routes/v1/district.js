const express = require("express");
const router = express.Router();
const District = require("../../models/District");
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
    return res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

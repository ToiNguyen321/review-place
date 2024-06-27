const express = require('express');
const router = express.Router();
const { multerUpload } = require('../../helpers');
const User = require('../../models/User')
router.get('/', async (req, res) => {
  try {
    const limit = 12
    const offset = 0

    const query = {
      // status: Gift.STATUS.ACTIVE,
    }

    const project = {
      // status: 0,
      // createdAt: 0,
      // updatedAt: 0,
      __v: 0,
    }

    const data = await User.find(query).skip(offset).limit(limit).select(project).lean()
    return res.json(data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
});

module.exports = router
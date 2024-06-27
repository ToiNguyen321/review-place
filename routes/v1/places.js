const express = require('express');
const router = express.Router();
const Place = require('../../models/Place');
const multipleUpload = require("../../middleware/multipleUploadMiddleware");
const { multerUpload } = require('../../helpers');
const verifyToken = require('../../middleware/authMiddleware');
/**
 * Home page: loading all place
 */
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

    const data = await Place.find(query).skip(offset).limit(limit).select(project).lean()
    return res.json(data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Place.findById(id)
    return res.json(data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
});

router.post('/', verifyToken, multerUpload.array('files', 5), async (req, res) => {
  const files = req.files ?? []
  const { title, descriptions } = req.body

  let newPlace = new Place({
    title,
    descriptions,
    images: files.map(i => ({
      filename: i.filename,
      url: `http://${req.headers.host}/files/${i.filename}`,
      size: i.size,
      mimetype: i.mimetype
    })),
    user_id: req.userId
  });
  const data = await newPlace.save()
  return res.json(data)
});

router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const { title, descriptions } = req.body
  let data = await Place.findByIdAndUpdate({ _id: id },
    {
      $set: {
        title,
        descriptions
      }
    },
  );
  return res.json(data)
});

module.exports = router
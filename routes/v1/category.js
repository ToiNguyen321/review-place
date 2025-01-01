const express = require("express");
const router = express.Router();
const { uResponse } = require("../../utils");
const { fileHelpers } = require("../../helpers");
const { Category, Place } = require("../../models");
/**
 * Home page: loading all place
 */
router.get("/", async (req, res) => {
  try {
    const query = {
      status: Category.STATUS.ACTIVE,
    };

    const project = {
      status: 0,
      createdAt: 0,
      updatedAt: 0,
      __v: 0,
    };

    const data = await Category.find(query).select(project).lean();
    return uResponse.createResponse(res, 200, data);
  } catch (error) {
    return uResponse.createResponse(res, 500, null, error.message, error);
  }
});

router.post(
  "/",
  fileHelpers.multerUpload("category", 1, true),
  async (req, res) => {
    try {
      const file = req.file ?? null;
      const { title, descriptions } = req.body;

      const dataCreate = {
        title,
        descriptions,
        status: Category.STATUS.ACTIVE,
      };

      if (file) {
        dataCreate.image = {
          filename: file.filename,
          url: `files/category/${file.filename}`,
        };
      }

      let newObj = new Category(dataCreate);
      const data = await newObj.save();
      return uResponse.createResponse(res, 200, data);
    } catch (error) {
      return uResponse.createResponse(res, 500, null, error.message, error);
    }
  }
);

router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { title, descriptions } = req.body;
    let data = await Place.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          title,
          descriptions,
        },
      }
    );
    return uResponse.createResponse(res, 200, data);
  } catch (error) {
    return uResponse.createResponse(res, 500, null, error.message, error);
  }
});

module.exports = router;

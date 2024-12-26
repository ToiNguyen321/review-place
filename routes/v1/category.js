const express = require("express");
const router = express.Router();
const Place = require("../../models/Place");
const { uploadHelpers, responseHelpers } = require("../../helpers");
const Category = require("../../models/Category");
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
    return responseHelpers.createResponse(res, 200, data);
  } catch (error) {
    return responseHelpers.createResponse(res, 500, null, error.message, error);
  }
});

router.post(
  "/",
  uploadHelpers.multerUpload("category").single("files"),
  async (req, res) => {
    try {
      const file = req.file ?? null;
      const { title, descriptions } = req.body;

      const dataCreate = {
        title,
        descriptions,
      };

      if (file) {
        dataCreate.image = {
          filename: file.filename,
          url: `files/category/${file.filename}`,
          size: file.size,
          mimetype: file.mimetype,
        };
      }

      let newObj = new Category(dataCreate);
      const data = await newObj.save();
      return responseHelpers.createResponse(res, 200, data);
    } catch (error) {
      return responseHelpers.createResponse(
        res,
        500,
        null,
        error.message,
        error
      );
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
    return responseHelpers.createResponse(res, 200, data);
  } catch (error) {
    return responseHelpers.createResponse(res, 500, null, error.message, error);
  }
});

module.exports = router;

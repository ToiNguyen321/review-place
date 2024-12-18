const express = require("express");
const router = express.Router();
const Place = require("../../models/Place");
const { uploadHelpers } = require("../../helpers");
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
    return res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
          url: `http://${req.headers.host}/files/category/${file.filename}`,
          size: file.size,
          mimetype: file.mimetype,
        };
      }

      let newObj = new Category(dataCreate);
      const data = await newObj.save();
      return res.status(200).json(data);
    } catch (error) {
      console.log("🚀 ~ router.post ~ error:", error);
      return res.status(500).json({
        code: 500,
        message: "Server error 500",
      });
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
    return res.json(data);
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: "Server error 500",
    });
  }
});

module.exports = router;

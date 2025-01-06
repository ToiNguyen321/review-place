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
  fileHelpers.multerUpload({
    folder: "categories",
    maxFiles: 1,
    isSingle: true,
    resize: false,
  }),
  async (req, res) => {
    try {
      const files = req.files ?? null;
      const { title, descriptions } = req.body;

      const dataCreate = {
        title,
        descriptions,
        status: Category.STATUS.ACTIVE,
      };

      if (files) {
        dataCreate.image = {
          publicId: files[0].publicId,
          filename: files[0].filename,
          url: files[0].url,
          width: files[0].width,
          height: files[0].height,
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

router.put(
  "/:id",
  fileHelpers.multerUpload({
    folder: "categories",
    maxFiles: 1,
    isSingle: true,
    resize: false,
  }),
  async (req, res) => {
    try {
      const id = req.params.id;
      const files = req.files ?? null;
      const { title, descriptions } = req.body;

      const old = await Category.findById(id).select({ image: 1, _id: 1 });

      if (!old) {
        return uResponse.createResponse(
          res,
          404,
          null,
          "Category not found",
          true
        );
      }
      const dataUpdate = {};

      if (title) {
        dataUpdate.title = title;
      }
      if (descriptions) {
        dataUpdate.descriptions = descriptions;
      }

      if (files && files.length > 0) {
        const removedImages = old?.image?.publicId
          ? [old?.image?.publicId]
          : [];
        fileHelpers.removedFiles(removedImages, "categories");
        dataUpdate.image = {
          publicId: files[0].publicId,
          filename: files[0].filename,
          url: files[0].url,
          width: files[0].width,
          height: files[0].height,
        };
      }
      console.log("🚀 ~ dataUpdate:", dataUpdate);

      let data = await Category.findByIdAndUpdate(
        id,
        {
          $set: dataUpdate,
        },
        { new: true }
      );
      console.log("🚀 ~ data:", data);

      return uResponse.createResponse(res, 200, data);
    } catch (error) {
      return uResponse.createResponse(res, 500, null, error.message, error);
    }
  }
);

router.get("/image-to-cloudinary", async (req, res) => {
  try {
    const query = {
      // status: Category.STATUS.ACTIVE,
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

// /**
//  * Hàm chuyển đổi ảnh từ local lên Cloudinary và cập nhật database.
//  */
// const uploadCategoriesToCloudinary = async () => {
//   try {
//     // Lấy toàn bộ dữ liệu category từ database
//     const categories = await Category.find();
//     console.log(`Đã tìm thấy ${categories.length} categories.`);

//     for (const category of categories) {
//       const localPath = path.resolve(__dirname, category.image.url); // Đường dẫn local của ảnh

//       // Kiểm tra nếu file tồn tại
//       if (!fs.existsSync(localPath)) {
//         console.warn(`File không tồn tại: ${localPath}`);
//         continue;
//       }

//       // Tải ảnh lên Cloudinary
//       const uploadResult = await cloudinary.uploader.upload(localPath, {
//         folder: "categories", // Thư mục trên Cloudinary
//         public_id: path.parse(category.image.filename).name, // Sử dụng tên file gốc làm publicId
//       });

//       console.log(`Ảnh đã được tải lên Cloudinary: ${uploadResult.secure_url}`);

//       // Cập nhật category với thông tin mới
//       category.image = {
//         filename: uploadResult.public_id,
//         url: uploadResult.secure_url,
//         size: uploadResult.bytes,
//         mimetype: `${uploadResult.resource_type}/${uploadResult.format}`,
//       };

//       // Lưu cập nhật vào database
//       await category.save();
//       console.log(`Đã cập nhật category: ${category.title}`);
//     }

//     console.log("Hoàn thành cập nhật tất cả categories!");
//   } catch (error) {
//     console.error("Lỗi trong quá trình cập nhật categories:", error.message);
//   }
// };

module.exports = router;

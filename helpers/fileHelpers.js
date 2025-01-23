const path = require("path");
const multer = require("multer");
const sharp = require("sharp");
const cloudinary = require("cloudinary").v2;
const DatauriParser = require("datauri/parser");
const parser = new DatauriParser();

// Configure Cloudinary
cloudinary.config({
  cloud_name: "your-cloud-name",
  api_key: "your-api-key",
  api_secret: "your-api-secret",
});

const dataUri = (file) => {
  const extension = path.extname(file.originalname).toString();
  return parser.format(extension, file.buffer);
};

const memoryStorage = () => multer.memoryStorage();

const multerUpload = ({
  folder = "",
  maxFiles = 3,
  isSingle = false,
  resize = true,
  maxWidth = 1024,
  maxHeight = 1024,
}) => {
  const storage = memoryStorage();

  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("File không phải là ảnh!"), false);
    }
  };

  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // Giới hạn file tối đa 2MB
      files: maxFiles, // Giới hạn số lượng file tối đa
    },
  });

  const handler = isSingle
    ? upload.single("files") // Upload một file
    : upload.array("files", maxFiles); // Upload nhiều file

  return async (req, res, next) => {
    handler(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      try {
        if (!req.files && !req.file) {
          return next();
        }

        const files = isSingle ? [req.file] : req.files;

        req.files = await Promise.all(
          files.map(async (file) => {
            let dataUriFile = null;
            if (resize) {
              const processedBuffer = await sharp(file.buffer)
                .resize(maxWidth, maxHeight, {
                  fit: "inside",
                  withoutEnlargement: true,
                })
                .jpeg({ quality: 80 })
                .toBuffer();

              dataUriFile = dataUri({
                originalname: file.originalname,
                buffer: processedBuffer,
              });
            } else {
              dataUriFile = dataUri(file);
            }

            // Upload ảnh lên Cloudinary
            const result = await cloudinary.uploader.upload(
              dataUriFile.content,
              {
                folder: folder || "uploads",
              }
            );

            return {
              publicId: result.public_id,
              filename: result.display_name,
              url: result.secure_url,
              size: result.bytes,
              mimetype: `${result.resource_type}/${result.format}`,
              width: result.width,
              height: result.height,
            };
          })
        );

        next(); // Tiếp tục xử lý router
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    });
  };
};

const removedFiles = async (removedFiles = []) => {
  if (!removedFiles || removedFiles?.length <= 0) {
    return;
  }
  console.log("🚀 ~ removedFiles ~ removedFiles:", removedFiles);
  try {
    await cloudinary.api.delete_resources(removedFiles);
  } catch (error) {
    console.error("Error removing files from Cloudinary:", error);
  }
};

module.exports = {
  multerUpload,
  removedFiles,
};

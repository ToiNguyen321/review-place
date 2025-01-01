import { join } from "path";
import multer from "multer";
import sharp from "sharp";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { fromIni } from "@aws-sdk/credential-providers";
import fs from "fs";
import string from "../utils/string.js";
const bucketName = process.env.S3_BUCKET_NAME;

const s3Client = new S3Client({
  region: "us-west-2",
  credentials: fromIni({ profile: "myProfile" }),
});
const storage = (folder = "") =>
  multer.memoryStorage({
    destination: (req, file, callback) => {
      const dir = join(
        !folder
          ? `${__dirname}/../uploads/files`
          : `${__dirname}/../uploads/files/${folder}`
      );
      fs.mkdirSync(dir, { recursive: true });
      callback(null, dir);
    },
    filename: (req, file, callback) => {
      const allowedMimeTypes = ["image/png", "image/jpeg"];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        const errorMess = `The file ${file.originalname} is invalid. Only allowed to upload image jpeg or png.`;
        return callback(errorMess, null);
      }
      const filename = `${Date.now()}-${file.originalname}`;
      callback(null, filename);
    },
  });

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png"];
  cb(null, allowedMimeTypes.includes(file.mimetype));
};

const uploadManyFiles = multer({ storage: storage(), fileFilter }).array(
  "files",
  5
);

const multipleUploadMiddleware = (req, res, next) => {
  uploadManyFiles(req, res, (err) => {
    if (
      err instanceof multer.MulterError &&
      err.code === "LIMIT_UNEXPECTED_FILE"
    ) {
      return res
        .status(400)
        .json({ message: "Exceeds the maximum number of files allowed." });
    } else if (err) {
      return res.status(500).json({ message: err.message });
    }
    next();
  });
};

const uploadToS3 = async (key, body, contentType) => {
  try {
    const data = await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    );
    return data;
  } catch (err) {
    console.error("Error uploading to S3:", err);
    throw new Error("S3 upload failed");
  }
};

const uploadImageAndCreateThumbnail = async (file) => {
  try {
    const { filename, mimetype, buffer } = file;

    const originalImageKey = `images/${Date.now()}_${filename}`;
    await uploadToS3(originalImageKey, buffer, mimetype);

    const thumbnailBuffer = await sharp(buffer)
      .resize({ width: 200 })
      .toBuffer();
    const thumbnailKey = `thumbnails/${Date.now()}_${filename}`;
    await uploadToS3(thumbnailKey, thumbnailBuffer, mimetype);

    return {
      imageUrl: `https://${bucketName}.s3.amazonaws.com/${originalImageKey}`,
      thumbnailUrl: `https://${bucketName}.s3.amazonaws.com/${thumbnailKey}`,
    };
  } catch (error) {
    console.error("Error uploading image and creating thumbnail:", error);
    throw new Error("Image upload and thumbnail creation failed");
  }
};

const memoryStorage = (folder) =>
  multer.memoryStorage({
    destination: (req, file, callback) => {
      const dir = join(
        !folder
          ? `${__dirname}/../uploads/files`
          : `${__dirname}/../uploads/files/${folder}`
      );
      fs.mkdirSync(dir, { recursive: true });
      callback(null, dir);
    },
    filename: (req, file, callback) => {
      const allowedMimeTypes = ["image/png", "image/jpeg"];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        const errorMess = `The file ${file.originalname} is invalid. Only allowed to upload image jpeg or png.`;
        return callback(errorMess, null);
      }
      const filename = `${file.originalname}`;
      callback(null, filename);
    },
  });

const multerUpload = (folder = "", maxFiles = 3, isSingle = false) => {
  const storage = memoryStorage(folder);

  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("File không phải là ảnh!"), false);
    }
  };

  // Cấu hình Multer với các giới hạn (kích thước file và số lượng file)
  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // Giới hạn file tối đa 5MB
      files: maxFiles, // Giới hạn số lượng file tối đa
    },
  });

  // Chọn cách upload: single file hoặc multiple files
  const handler = isSingle
    ? upload.single("files") // Upload một file
    : upload.array("files", maxFiles); // Upload nhiều file

  return async (req, res, next) => {
    handler(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      try {
        // Kiểm tra nếu không có file nào
        if (!req.files && !req.file) {
          return next();
        }

        // Tạo thư mục nếu chưa tồn tại
        const uploadPath = join(__dirname, "../uploads/files", folder);
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }

        // Xử lý và lưu ảnh nén
        const files = isSingle ? [req.file] : req.files;
        req.files = await Promise.all(
          files.map(async (file) => {
            const randomString = string.generateRandomString(16); // Tạo tên file ngẫu nhiên
            const extension = file.mimetype.split("/")[1]; // Lấy phần mở rộng
            const filename = `${randomString.substring(0, 24)}.${extension}`; // Đảm bảo tên file không quá 40 ký tự
            const outputPath = join(uploadPath, filename);
            // Nén và xử lý ảnh với sharp
            await sharp(file.buffer)
              .resize(1024) // Resize chiều ngang tối đa 800px
              .jpeg({ quality: 80 }) // Nén ảnh với chất lượng 80%
              .toFile(outputPath); // Lưu ảnh đã nén vào đĩa

            return {
              filename,
              path: `files/${folder}/${filename}`,
              size: fs.statSync(outputPath).size, // Kích thước file sau nén
              mimetype: "image/jpeg", // Đảm bảo trả về đúng mime type
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

const removedFiles = (removedFiles = [], folder) => {
  removedFiles.forEach((filename) => {
    const filePath = join(
      !folder
        ? `${__dirname}/../uploads/files/${filename}`
        : `${__dirname}/../uploads/files/${folder}/${filename}`
    );
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); // remove file
    }
  });
};

export default {
  multipleUploadMiddleware,
  multerUpload,
  // multerUpload: (folder) => multer({ storage: storage(folder), fileFilter }),
  uploadImageAndCreateThumbnail,
  removedFiles,
};

/**
 * Created by trungquandev.com's author on 17/08/2019.
 * multipleUploadMiddleware.js
 */
const util = require("util");
const path = require("path");
const multer = require("multer");
const sharp = require("sharp");
const bucketName = process.env.S3_BUCKET_NAME;
const { S3Client } = require("@aws-sdk/client-s3");
const { fromIni } = require("@aws-sdk/credential-providers");
const fs = require("fs");

const s3Client = new S3Client({
  region: "us-west-2",
  credentials: fromIni({ profile: "myProfile" }),
});

// Khởi tạo biến cấu hình cho việc lưu trữ file upload
let storage = (folder = "") =>
  multer.diskStorage({
    // Định nghĩa nơi file upload sẽ được lưu lại
    destination: (req, file, callback) => {
      const dir = path.join(
        !folder
          ? `${__dirname}/../uploads/files`
          : `${__dirname}/../uploads/files/${folder}`
      );
      fs.mkdirSync(dir, { recursive: true });

      callback(null, dir);
    },
    filename: (req, file, callback) => {
      // ở đây các bạn có thể làm bất kỳ điều gì với cái file nhé.
      // Mình ví dụ chỉ cho phép tải lên các loại ảnh png & jpg
      let math = ["image/png", "image/jpeg"];
      if (math.indexOf(file.mimetype) === -1) {
        let errorMess = `The file <strong>${file.originalname}</strong> is invalid. Only allowed to upload image jpeg or png.`;
        return callback(errorMess, null);
      }

      // Tên của file thì mình nối thêm một cái nhãn thời gian để tránh bị trùng tên file.
      let filename = `${Date.now()}-${file.originalname}`;
      callback(null, filename);
    },
  });

const fileFilter = (req, file, cb) => {
  if (file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// Khởi tạo middleware uploadManyFiles với cấu hình như ở trên,
let uploadManyFiles = multer({ storage: storage, fileFilter }).array(
  "files",
  5
);

// Mục đích của util.promisify() là để bên controller có thể dùng async-await để gọi tới middleware này
// let multipleUploadMiddleware = util.promisify(uploadManyFiles);
let multipleUploadMiddleware = (req, res, next) => {
  util.promisify(
    uploadManyFiles(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Các lỗi do Multer phát sinh
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return res
            .status(400)
            .json({ message: "Exceeds the maximum number of files allowed." });
        }
      } else if (err) {
        // Các lỗi khác
        return res.status(500).json({ message: err.message });
      }
      next();
    })
  );
};

const uploadImageAndCreateThumbnail = async (file) => {
  try {
    const { filename, mimetype, buffer } = file;

    // Upload original image to S3
    const originalImageKey = `images/${Date.now()}_${filename}`;
    try {
      const data = await s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: originalImageKey,
          Body: buffer,
          ContentType: mimetype,
        })
      );
      console.log(data);
    } catch (err) {
      console.log(err, err.stack);
    }

    // Create thumbnail using sharp
    const thumbnailBuffer = await sharp(buffer)
      .resize({ width: 200 }) // Adjust width as needed
      .toBuffer();

    const thumbnailKey = `thumbnails/${Date.now()}_${filename}`;
    try {
      const data = await s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: thumbnailKey,
          Body: thumbnailBuffer,
          ContentType: mimetype,
        })
      );
      console.log(data);
    } catch (err) {
      console.log(err, err.stack);
    }

    return {
      imageUrl: `https://${bucketName}.s3.amazonaws.com/${originalImageKey}`,
      thumbnailUrl: `https://${bucketName}.s3.amazonaws.com/${thumbnailKey}`,
    };
  } catch (error) {
    console.error("Error uploading image and creating thumbnail:", error);
    throw new Error("Image upload and thumbnail creation failed");
  }
};

module.exports = {
  multipleUploadMiddleware,
  multerUpload: (folder) => multer({ storage: storage(folder), fileFilter }),
  uploadImageAndCreateThumbnail,
};

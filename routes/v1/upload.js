const path = require("path");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const upload = multer({ storage: multer.memoryStorage() });
const DatauriParser = require("datauri/parser");

// Tạo instance của DatauriParser
const parser = new DatauriParser();

const dataUri = (req) => {
  // Lấy phần mở rộng của file
  const extension = path.extname(req.file.originalname).toString();

  // Chuyển buffer thành chuỗi Data URI
  return parser.format(extension, req.file.buffer);
};

/**
 * {
  asset_id: '311e0abb368eb9bd0e83d6370315bfb5',
  public_id: 'ahe7jlfrogmn7fluulz7',
  version: 1735638845,
  version_id: '0b922ad87ba95da7c2c23715e80b580b',
  signature: '9e3c10d0ecc761596b6b47d51c5f7d7afc439944',
  width: 2048,
  height: 1536,
  format: 'jpg',
  resource_type: 'image',
  created_at: '2024-12-31T09:54:05Z',
  tags: [],
  bytes: 314118,
  type: 'upload',
  etag: '4e95c33bbec58516c0856c7a0b383e1c',
  placeholder: false,
  url: 'http://res.cloudinary.com/db3tesfer/image/upload/v1735638845/ahe7jlfrogmn7fluulz7.jpg',
  secure_url: 'https://res.cloudinary.com/db3tesfer/image/upload/v1735638845/ahe7jlfrogmn7fluulz7.jpg',
  asset_folder: '',
  display_name: 'ahe7jlfrogmn7fluulz7',
  api_key: '196658788446895'
}
 */

router.post("/", upload.single("file"), async (req, res) => {
  try {
    console.log("🚀 ~ router.post ~ req.file:", req.file);
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const file = dataUri(req.body).content;
    // return res.json(200);
    // Upload hình ảnh lên Cloudinary
    const result = await cloudinary.uploader.upload(file);
    console.log("🚀 ~ router.post ~ result:", result);

    // Trả về thông tin file đã upload
    res.json({
      message: "File uploaded successfully!",
      url: result.secure_url, // URL công khai để hiển thị ảnh
      public_id: result.public_id,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Error uploading file to Cloudinary" });
  }
});

module.exports = router;

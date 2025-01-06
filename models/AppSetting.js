const { mongoose } = require("./database");

const schema = new mongoose.Schema(
  {
    version: { type: String, required: true, unique: true }, // Phiên bản app
    config: { type: Object, required: true }, // Nội dung config
    updatedAt: { type: Date, default: Date.now }, // Thời gian cập nhật
    isActive: { type: Boolean, default: true }, // Đánh dấu config đang dùng
  },
  { timestamps: true } // Tự động thêm createdAt và updatedAt
);

module.exports = mongoose.model("app_setting", schema);

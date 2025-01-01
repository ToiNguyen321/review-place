const express = require("express");
const router = express.Router();

const { multipleUploadMiddleware } = require("../helpers/index");
let multipleUpload = async (req, res, next) => {
  try {
    // thực hiện upload
    const data = await multipleUploadMiddleware(req, res);
    console.log("🚀 ~ multipleUpload ~ data:", data);
    // Nếu upload thành công, không lỗi thì tất cả các file của bạn sẽ được lưu trong biến req.files
    // debug(req.files);
    // Mình kiểm tra thêm một bước nữa, nếu như không có file nào được gửi lên thì trả về thông báo cho client
    // if (req.files.length <= 0) {
    //   return res.send(`You must select at least 1 file or more.`);
    // }
    // trả về cho người dùng cái thông báo đơn giản.
    // return res.send(`Your files has been uploaded.`);
    next();
  } catch (error) {
    // Nếu có lỗi thì debug lỗi xem là gì ở đây
    // debug(error);
    // Bắt luôn lỗi vượt quá số lượng file cho phép tải lên trong 1 lần
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.send(`Exceeds the number of files allowed to upload.`);
    }
    return res.send(`Error when trying upload many files: ${error}}`);
  }
};

export default multipleUpload;

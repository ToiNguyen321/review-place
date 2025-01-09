const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false, // Use `true` for port 465, `false` for all other ports
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// // Kiểm tra trạng thái kết nối với SMTP server
// transporter.verify(function (error, success) {
//   if (error) {
//     console.log("SMTP connection error: ", error);
//   } else {
//     console.log("Server is ready to take our messages");
//   }
// });

// Hàm gửi email
const sendMail = async (mailOptions) => {
  // try {
  //   const mailOptionsWithSender = {
  //     from: process.env.EMAIL_USER, // Thiết lập người gửi
  //     ...mailOptions, // Thêm các option khác vào
  //   };
  //   // Sử dụng Promise để gửi mail
  //   const info = await transporter.sendMail(mailOptionsWithSender);
  //   // Kiểm tra kết quả gửi mail
  //   if (info.accepted.length > 0) {
  //     console.log("Email sent successfully:", info.response);
  //     return true;
  //   } else {
  //     console.log("Email sending failed:", info.rejected);
  //     return false;
  //   }
  // } catch (error) {
  //   console.error("🚀 ~ sendMail ~ error:", error);
  //   return false;
  // }
};

module.exports = { sendMail };

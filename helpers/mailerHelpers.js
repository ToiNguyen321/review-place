import { configDotenv } from "dotenv";
import nodemailer from "nodemailer";

configDotenv();
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Server is ready to take our messages");
  }
});

const sendMail = async (mailOptions) => {
  try {
    let mailOptions = {
      from: process.env.EMAIL_USER,
      ...mailOptions,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return false;
      }
      return true;
    });
  } catch (error) {
    console.log("🚀 ~ sendMail ~ error:", error);
    return false;
  }
};
export default { sendMail };

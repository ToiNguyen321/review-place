import express from "express";
import { User } from "../../models/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  uPhone as phoneUtils,
  uEmail as emailUtils,
  uResponse,
} from "../../utils/index.js";
import { mailerHelpers } from "../../helpers/index.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const HASH_SALT_ROUNDS = parseInt(process.env.HASH_PASS, 10); // Đổi tên biến để rõ ràng hơn và đảm bảo đúng kiểu dữ liệu

// User registration
router.post("/register", async (req, res) => {
  try {
    const { password, phone, email, fullName, slogan } = req.body;
    // await mailerHelpers.sendMail("123", { email }, req)
    // return res.json({ success: true })
    // Kiểm tra thông tin bắt buộc
    if (!email || !password || !fullName) {
      return uResponse.createResponse(
        res,
        400,
        null,
        "Missing required information: phone, password, or fullName",
        true
      );
    }

    // Validate số điện thoại
    if (!phoneUtils.validate(phone)) {
      return uResponse.createResponse(
        res,
        400,
        null,
        "Invalid phone number format",
        true
      );
    }

    // Validate email nếu có
    if (email && !emailUtils.validate(email)) {
      return uResponse.createResponse(
        res,
        400,
        null,
        "Invalid phone number format",
        true
      );
    }

    // Kiểm tra người dùng đã tồn tại hay chưa
    const userExist = await User.findOne({ phone });
    if (userExist) {
      return uResponse.createResponse(
        res,
        409,
        null,
        "User already exists",
        true
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, HASH_SALT_ROUNDS);

    // Tạo và lưu người dùng mới
    const user = new User({
      password: hashedPassword,
      phone,
      email,
      fullName,
      slogan,
      status: User.STATUS.INACTIVE,
    });
    const data = await user.save();

    // Sau khi lưu thông tin người dùng vào cơ sở dữ liệu
    if (data) {
      // Sau khi lưu thông tin người dùng vào cơ sở dữ liệu
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        JWT_SECRET,
        { expiresIn: "1d" }
      );
      const url = `http://${req.headers.host}/auth/confirm/${token}`;

      let mailOptions = {
        to: user.email,
        subject: "Email Confirmation",
        text: `Please confirm your email by clicking ${url} here`, // plain text body
        html: `<p>Please confirm your email by clicking <a href="${url}">here</a></p>`,
      };

      const rsSendMail = await mailerHelpers.sendMail(mailOptions);
      if (rsSendMail) {
        return uResponse.createResponse(
          res,
          500,
          null,
          "Error sending email",
          true
        );
      }
      return uResponse.createResponse(
        res,
        201,
        null,
        "User registered, please check your email to confirm",
        false
      );
    } else {
      return uResponse.createResponse(
        res,
        201,
        null,
        "User registered failed",
        false
      );
    }
  } catch (error) {
    return uResponse.createResponse(
      res,
      500,
      null,
      "Server error during registration",
      error
    );
  }
});

// User login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    // Kiểm tra thông tin bắt buộc
    if (!username || !password) {
      return uResponse.createResponse(
        res,
        400,
        null,
        "Missing username or password",
        true
      );
    }

    //Check username is email or phone number
    let usernameIsEmail = false;
    if (/[a-zA-Z@]/.test(username)) {
      usernameIsEmail = true;
      if (!emailUtils.validate(username)) {
        return uResponse.createResponse(
          res,
          400,
          null,
          "Email is not in correct format",
          true
        );
      }
    }

    if (!phoneUtils.validate(username)) {
      return uResponse.createResponse(
        res,
        400,
        null,
        "Phone number is not in correct format",
        true
      );
    }

    let user = null;

    if (!usernameIsEmail) {
      user = await User.findOne({ phone: username });
    }
    if (usernameIsEmail) {
      user = await User.findOne({ email: username });
    }
    // Tìm kiếm người dùng
    if (!user) {
      return uResponse.createResponse(
        res,
        401,
        null,
        "Authentication failed: user not found",
        true
      );
    }

    // So sánh mật khẩu
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return uResponse.createResponse(
        res,
        401,
        null,
        "Authentication failed: incorrect username/password",
        true
      );
    }

    // Kiểm tra trạng thái người dùng
    if (user.status === User.STATUS.BLOCK) {
      return uResponse.createResponse(res, 403, null, "User is blocked", true);
    }

    // Tạo JWT token
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "15d",
    });

    // Trả về thông tin người dùng kèm theo token
    return uResponse.createResponse(res, 200, {
      user: {
        _id: user._id,
        phone: user.phone,
        email: user.email,
        fullName: user.fullName,
        slogan: user.slogan,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    return uResponse.createResponse(res, 500, null, "Login failed", error);
  }
});

router.get("/confirm/:token", async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, JWT_SECRET);
    await User.findByIdAndUpdate(decoded.userId, {
      status: User.STATUS.ACTIVE,
    });
    return uResponse.createResponse(res, 200, null, "Email confirmed");
  } catch (error) {
    return uResponse.createResponse(
      res,
      200,
      null,
      "Invalid or expired token",
      error
    );
  }
});

export default router;

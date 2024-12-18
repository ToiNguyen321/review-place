const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  phone: phoneUtils,
  email: emailUtils,
  email,
} = require("../../utils").default;
const { mailerHelpers } = require("../../helpers");
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
      return res.status(400).json({
        code: 400,
        error: "Missing required information: phone, password, or fullName",
      });
    }

    // Validate số điện thoại
    if (!phoneUtils.validate(phone)) {
      return res
        .status(400)
        .json({ code: 400, error: "Invalid phone number format" });
    }

    // Validate email nếu có
    if (email && !emailUtils.validate(email)) {
      return res.status(400).json({ code: 400, error: "Invalid email format" });
    }

    // Kiểm tra người dùng đã tồn tại hay chưa
    const userExist = await User.findOne({ phone });
    if (userExist) {
      return res.status(409).json({ code: 409, error: "User already exists" });
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
        return res.status(500).json({ message: "Error sending email" });
      }
      return res.status(201).json({
        message: "User registered, please check your email to confirm",
      });
    } else {
      return res.status(201).json({ message: "User registered failed" });
    }

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("🚀 ~ router.post('/register') ~ error:", error);
    return res.status(500).json({
      code: 500,
      message: "Server error during registration",
      error: error.message,
    });
  }
});

// User login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    // Kiểm tra thông tin bắt buộc
    if (!username || !password) {
      return res
        .status(400)
        .json({ code: 400, error: "Missing username or password" });
    }

    //Check username is email or phone number
    let usernameIsEmail = false;
    if (/[a-zA-Z@]/.test(username)) {
      usernameIsEmail = true;
      if (!emailUtils.validate(username)) {
        return res
          .status(400)
          .json({ code: 400, error: "Email is not in correct format" });
      }
    }

    if (!phoneUtils.validate(username)) {
      return res
        .status(400)
        .json({ code: 400, error: "Phone number is not in correct format" });
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
      return res
        .status(401)
        .json({ code: 401, error: "Authentication failed: user not found" });
    }

    // So sánh mật khẩu
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        code: 401,
        error: "Authentication failed: incorrect username/password",
      });
    }

    // Kiểm tra trạng thái người dùng
    if (user.status === User.STATUS.BLOCK) {
      return res.status(403).json({ code: 403, error: "User is blocked" });
    }

    // Tạo JWT token
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "15d",
    });

    // Trả về thông tin người dùng kèm theo token
    return res.status(200).json({
      user: {
        _id: user._id,
        phone: user.phone,
        email: user.email,
        fullName: user.fullName,
        slogan: user.slogan,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        jwt: token,
      },
      token,
    });
  } catch (error) {
    console.log("🚀 ~ router.post ~ error:", error);
    return res
      .status(500)
      .json({ code: 500, message: "Login failed", error: error.message });
  }
});

router.get("/confirm/:token", async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, JWT_SECRET);
    await User.findByIdAndUpdate(decoded.userId, {
      status: User.STATUS.ACTIVE,
    });
    res.status(200).json({ message: "Email confirmed" });
  } catch (error) {
    res.status(400).json({ error: "Invalid or expired token" });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const { User } = require("../../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const {
  // uPhone: phoneUtils,
  uEmail: emailUtils,
  uResponse,
} = require("../../utils");
const { mailerHelpers } = require("../../helpers");
const authSchema = require("../../schemas/auth.schema");
const { validateRequest } = require("../../middleware/validateMiddleware");
const { mongoose } = require("../../models/database");
const JWT_SECRET = process.env.JWT_SECRET;
const HASH_SALT_ROUNDS = parseInt(process.env.HASH_PASS, 10); // Đổi tên biến để rõ ràng hơn và đảm bảo đúng kiểu dữ liệu

// User registration
router.post(
  "/register",
  validateRequest(authSchema.register),
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { password, phone, email, fullName, slogan } = req.body;
      // return res.json({ success: true })
      // Kiểm tra thông tin bắt buộc
      // if (!email || !password || !fullName) {
      //   return uResponse.createResponse(
      //     res,
      //     400,
      //     null,
      //     "Missing required information: phone, password, or fullName",
      //     true
      //   );
      // }

      // // Validate số điện thoại
      // if (phone && !phoneUtils.validate(phone)) {
      //   return uResponse.createResponse(
      //     res,
      //     400,
      //     null,
      //     "Invalid phone number format",
      //     true
      //   );
      // }

      // // Validate email nếu có
      // if (!emailUtils.validate(email)) {
      //   return uResponse.createResponse(
      //     res,
      //     400,
      //     null,
      //     "Invalid phone number format",
      //     true
      //   );
      // }

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
      const data = await user.save({ session });

      // Sau khi lưu thông tin người dùng vào cơ sở dữ liệu
      if (data) {
        // Sau khi lưu thông tin người dùng vào cơ sở dữ liệu
        const token = jwt.sign(
          { userId: user._id, role: user.role },
          JWT_SECRET,
          { expiresIn: "1d" }
        );
        const url = `http://${req.headers.host}/api/v1/authenticator/confirm/${token}`;

        let mailOptions = {
          to: user.email,
          subject: "Xác nhận email đăng ký tài khoản thành công 🎉",
          text: `Chào ${user.name},\n\nChúc mừng bạn đã đăng ký thành công tài khoản tại ${process.env.APP_NAME}!\n\nĐể hoàn tất quá trình đăng ký và kích hoạt tài khoản, vui lòng nhấn vào liên kết sau:\n${url}\n\nNếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.\n\nCảm ơn bạn đã lựa chọn ${process.env.APP_NAME}!\n\nTrân trọng,\nĐội ngũ ${process.env.APP_NAME}`,
          html: `
          <p>Chào ${user.name},</p>
          <p>Chúc mừng bạn đã đăng ký thành công tài khoản tại <strong>${process.env.APP_NAME}</strong>!</p>
          <p>Để hoàn tất quá trình đăng ký và kích hoạt tài khoản, vui lòng nhấn vào nút dưới đây:</p>
          <a href="${url}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Xác nhận tài khoản</a>
          <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
          <p>Cảm ơn bạn đã lựa chọn <strong>${process.env.APP_NAME}</strong>!</p>
          <p>Trân trọng,<br>Đội ngũ <strong>${process.env.APP_NAME}</strong></p>
        `,
        };

        const rsSendMail = await mailerHelpers.sendMail(mailOptions);
        if (!rsSendMail) {
          // Rollback nếu gửi mail thất bại
          await session.abortTransaction();
          session.endSession();
          return uResponse.createResponse(
            res,
            500,
            null,
            "Error sending email",
            true
          );
        }

        await session.commitTransaction();
        session.endSession();

        return uResponse.createResponse(
          res,
          201,
          null,
          "User registered, please check your email to confirm",
          false
        );
      } else {
        await session.abortTransaction();
        session.endSession();
        return uResponse.createResponse(
          res,
          201,
          null,
          "User registered failed",
          false
        );
      }
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      return uResponse.createResponse(
        res,
        500,
        null,
        "Server error during registration",
        error
      );
    }
  }
);

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
        "Vui lòng nhập tài khoản/mật khẩu!",
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
          "Vui lòng nhập email đúng định dạng",
          true
        );
      }
    }

    // if (!phoneUtils.validate(username)) {
    //   return uResponse.createResponse(
    //     res,
    //     400,
    //     null,
    //     "Vui lòng nhập số điện thoại đúng định dạng",
    //     true
    //   );
    // }

    let user = null;

    // if (!usernameIsEmail) {
    //   user = await User.findOne({ phone: username });
    // }
    if (usernameIsEmail) {
      user = await User.findOne({ email: username });
    }
    // Tìm kiếm người dùng
    if (!user) {
      return uResponse.createResponse(
        res,
        401,
        null,
        "Tài khoản/Mật khẩu không chính xác, vui lòng thử lại!",
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
        "Tài khoản/Mật khẩu không chính xác, vui lòng thử lại!",
        true
      );
    }

    // Kiểm tra trạng thái người dùng
    if (user.status === User.STATUS.BLOCK) {
      return uResponse.createResponse(
        res,
        403,
        null,
        "Tài khoản của bạn đã bị khoá, vui lòng liên hệ trung tâm cskh để được hỗ trợ!",
        true
      );
    }

    // Tạo JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role, status: user.status },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

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
    console.log("🚀 ~ router.post ~ error:", error);
    return uResponse.createResponse(
      res,
      500,
      null,
      "Đăng nhập thất bại, vui lòng thử lại!",
      error
    );
  }
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return uResponse.createResponse(res, 404, null, "Email is required", true);
  }
  try {
    const user = await User.findOne({ email }).select({
      name: 1,
      _id: 1,
      email: 1,
    });

    if (!user) {
      return uResponse.createResponse(
        res,
        404,
        null,
        "User is not found",
        true
      );
    }

    const OTP = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
    });

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          passwordResetOtp: OTP,
          passwordResetExpires: Date.now() + 600000, // 10 minutes
        },
      }
    );

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Yêu cầu đặt lại mật khẩu cho tài khoản của bạn 🔒",
      text: `
    Chào ${user.name},
    
    Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản của mình tại ${process.env.APP_NAME}.
    
    Mã OTP của bạn là: ${OTP}
    
    Vui lòng nhập mã này trên màn hình đặt lại mật khẩu để tiếp tục.
    
    Lưu ý: Mã OTP này sẽ hết hạn sau 10 phút.
    
    Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này. Tài khoản của bạn sẽ vẫn được bảo mật.
    
    Trân trọng,  
    Đội ngũ ${process.env.APP_NAME}
      `,
      html: `
        <p>Chào ${user.name},</p>
        <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản của mình tại <strong>${process.env.APP_NAME}</strong>.</p>
        <p>Mã OTP của bạn là: <b style="font-size: 18px; color: #4CAF50;">${OTP}</b></p>
        <p>Vui lòng nhập mã này trên màn hình đặt lại mật khẩu để tiếp tục.</p>
        <p><strong>Lưu ý:</strong> Mã OTP này sẽ hết hạn sau 10 phút.</p>
        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này. Tài khoản của bạn sẽ vẫn được bảo mật.</p>
        <p>Trân trọng,<br>Đội ngũ <strong>${process.env.APP_NAME}</strong></p>
      `,
    };

    const rsSendMail = await mailerHelpers.sendMail(mailOptions);
    if (!rsSendMail) {
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
      "User forgot password, please check your email to confirm",
      false
    );
  } catch (error) {
    return uResponse.createResponse(
      res,
      500,
      null,
      "Forgot password failed",
      error
    );
  }
});

router.post(
  "/reset-password",
  validateRequest(authSchema.resetPassword),
  async (req, res) => {
    try {
      const { email, otp, password } = req.body;
      // Hash password
      const user = User.findOne({ email }).select({
        _id: 1,
        passwordResetOtp: 1,
        passwordResetExpires: 1,
        name: 1,
        email: 1,
      });

      if (!user) {
        return uResponse.createResponse(res, 404, null, "User not found", true);
      }

      // Kiểm tra OTP
      if (!user.passwordResetOtp || user.passwordResetOtp !== otp) {
        return uResponse.createResponse(res, 400, null, "Invalid OTP", true);
      }

      // Kiểm tra xem OTP đã hết hạn chưa
      const now = new Date();
      if (now > new Date(user.passwordResetExpires)) {
        return uResponse.createResponse(
          res,
          400,
          null,
          "OTP has expired",
          true
        );
      }

      const hashedPassword = await bcrypt.hash(password, HASH_SALT_ROUNDS);

      await User.updateOne(
        {
          _id: user._id,
        },
        {
          $set: {
            password: hashedPassword,
            passwordResetOtp: null,
            passwordResetExpires: null,
          },
        }
      );

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Đặt lại mật khẩu thành công ✅",
        text: `
Chào ${user.name},

Bạn đã đặt lại mật khẩu cho tài khoản của mình tại ${process.env.APP_NAME} thành công.

Nếu bạn không thực hiện hành động này, vui lòng liên hệ ngay với chúng tôi để được hỗ trợ.

Để đảm bảo an toàn, bạn nên:
- Không chia sẻ thông tin tài khoản hoặc mật khẩu với bất kỳ ai.
- Kích hoạt bảo mật hai lớp (nếu có).
- Đảm bảo mật khẩu của bạn đủ mạnh và khó đoán.

Cảm ơn bạn đã tin tưởng và sử dụng ${process.env.APP_NAME}.

Trân trọng,
Đội ngũ ${process.env.APP_NAME}
  `,
        html: `
          <p>Chào ${user.fullName},</p>
          <p>Bạn đã đặt lại mật khẩu cho tài khoản của mình tại <strong>${process.env.APP_NAME}</strong> thành công.</p>
          <p>Nếu bạn không thực hiện hành động này, vui lòng liên hệ ngay với chúng tôi để được hỗ trợ.</p>
          <p>Để đảm bảo an toàn, bạn nên:</p>
          <ul>
            <li>Không chia sẻ thông tin tài khoản hoặc mật khẩu với bất kỳ ai.</li>
            <li>Đảm bảo mật khẩu của bạn đủ mạnh và khó đoán.</li>
          </ul>
          <p>Cảm ơn bạn đã tin tưởng và sử dụng <strong>${process.env.APP_NAME}</strong>.</p>
          <p>Trân trọng,<br>Đội ngũ <strong>${process.env.APP_NAME}</strong></p>
        `,
      };

      return uResponse.createResponse(
        res,
        200,
        null,
        "User reset password success",
        false
      );
    } catch (error) {
      return uResponse.createResponse(res, 500, null, "Login failed", error);
    }
  }
);

router.get("/confirm/:token", async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, JWT_SECRET);
    await User.findByIdAndUpdate(decoded.userId, {
      status: User.STATUS.VERIFIED_INFO,
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

module.exports = router;

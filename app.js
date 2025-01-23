require("dotenv").config();

const environment = process.env.NODE_ENV || "development";

console.log(`App is running in ${environment} mode`);

// Cấu hình dựa trên môi trường
if (environment === "production") {
  // Cấu hình cho môi trường production
  console.log("Connecting to production database...");
} else if (environment === "staging") {
  // Cấu hình cho môi trường staging
  console.log("Connecting to staging database...");
} else {
  // Cấu hình cho môi trường development
  console.log("Connecting to development database...");
}

const {
  category,
  places,
  review,
  authenticator,
  user,
  province,
  district,
  ward,
  upload,
  personalization,
  appSetting,
  email,
} = require("./routes/v1/index");
var express = require("express");
var bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");

var { databaseConnect } = require("./models/database");
const response = require("./utils/response");
databaseConnect();

const cloudinary = require("cloudinary").v2;
// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET, // Click 'View API Keys' above to copy your API secret
});

var app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // Cho phép tối đa 100 request từ một IP trong 15 phút
  handler: function (req, res) {
    response.createResponse(
      res,
      429,
      null,
      "Ứng dụng quá tải do lưu lượng truy cập quá lớn, vui lòng không chờ trong giây lát!",
      true
    );
  },
  skip: (req, res) => {
    if (req.ip === "127.0.0.1") return true;
    return false;
  },
});

app.use(limiter); // Áp dụng cho tất cả các route

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());

app.set("view engine", "ejs");
app.set("views", "./views");

// Website routes
app.get("/", function (req, res) {
  res.end("Hello World\n");
});

app.use("/api/v1/authenticator", authenticator);
app.use("/api/v1/category", category);
app.use("/api/v1/place", places);
app.use("/api/v1/review", review);
app.use("/api/v1/user", user);
app.use("/api/v1/province", province);
app.use("/api/v1/district", district);
app.use("/api/v1/ward", ward);
app.use("/api/v1/personalization", personalization);
app.use("/api/v1/app-setting", appSetting);
app.use("/files", express.static("uploads/files"));
//TODO
app.use("/api/v1/upload", upload);
app.use("/api/v1/email", email);

const PORT = process.env.PORT || 3000;
const hostname = process.env.NODE_ENV === "development" ? "0.0.0.0" : "0.0.0.0"; // Lắng nghe mọi địa chỉ IP

app.listen(PORT, hostname, () => {
  console.log(`Server running at http://${hostname}:${PORT}/`);
});

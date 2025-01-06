require("dotenv").config();

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
} = require("./routes/v1/index");
var express = require("express");
var bodyParser = require("body-parser");
var { databaseConnect } = require("./models/database");

databaseConnect();
const cloudinary = require("cloudinary").v2;
// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET, // Click 'View API Keys' above to copy your API secret
});

var app = express();
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
app.use("/api/v1/upload", upload);

const PORT = process.env.PORT || 3000;
// const hostname = "127.0.0.1";
const hostname = process.env.NODE_ENV === "development" ? "0.0.0.0" : "0.0.0.0"; // Lắng nghe mọi địa chỉ IP
app.listen(PORT, hostname, () => {
  console.log(`Server running at http://${hostname}:${PORT}/`);
});

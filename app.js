import { configDotenv } from "dotenv";
import {
  category,
  places,
  review,
  authenticator,
  user,
  province,
  district,
  ward,
  upload,
} from "./routes/v1/index.js";
import bodyParser from "body-parser";
import { v2 as cloudinaryV2 } from "cloudinary";
import { database } from "./models/index.js";
import express from "express";

configDotenv();
database();

// Configuration
cloudinaryV2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET, // Click 'View API Keys' above to copy your API secret
});

const app = express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

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
app.use("/files", express.static("uploads/files"));
app.use("/api/v1/upload", upload);

const PORT = process.env.PORT || 3000;
// const hostname = "127.0.0.1";
const hostname = process.env.NODE_ENV === "development" ? "0.0.0.0" : "0.0.0.0"; // Lắng nghe mọi địa chỉ IP
app.listen(PORT, hostname, () => {
  console.log(`Server running at http://${hostname}:${PORT}/`);
});

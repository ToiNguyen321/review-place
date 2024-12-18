require("dotenv").config();
var express = require("express");
var bodyParser = require("body-parser");

var databaseConnect = require("./models/database");
databaseConnect();

var category = require("./routes/v1/category");
var places = require("./routes/v1/places");
var review = require("./routes/v1/review");
var authenticator = require("./routes/v1/authenticator");
var users = require("./routes/v1/user");
var province = require("./routes/v1/province");
var district = require("./routes/v1/district");
var ward = require("./routes/v1/ward");

var app = express();
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
app.use("/api/v1/user", users);
app.use("/api/v1/province", province);
app.use("/api/v1/district", district);
app.use("/api/v1/ward", ward);
app.use("/files", express.static("uploads/files"));

const PORT = process.env.PORT || 3000;
const hostname = "127.0.0.1";
app.listen(PORT, hostname, () => {
  console.log(`Server running at http://${hostname}:${PORT}/`);
});

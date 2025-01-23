const category = require("./category");
const authenticator = require("./authenticator");
const district = require("./district");
const places = require("./places");
const province = require("./province");
const review = require("./review");
const user = require("./user");
const ward = require("./ward");
const personalization = require("./personalization");
const appSetting = require("./appSetting");

//TODO
const upload = require("./upload");
const email = require("./email");

module.exports = {
  authenticator,
  category,
  district,
  places,
  province,
  review,
  user,
  ward,
  personalization,
  appSetting,
  upload,
  email,
};

const { mongoose } = require("./database");

// Schema cho Province
const schema = new mongoose.Schema({
  type: String,
  code: String,
  name: String,
  nameEn: String,
  fullName: String,
  fullNameEn: String,
  codeName: String,
  pathWithType: String,
  pathWithTypeEn: String,
  administrativeUnitId: Number,
  administrativeRegionId: Number,
});

module.exports = mongoose.model("province", schema);

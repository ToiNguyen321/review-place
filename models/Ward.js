import mongoose from "mongoose";

// Schema cho Ward
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
  districtCode: String,
  administrativeUnitId: Number,
});

export default mongoose.model("ward", schema);

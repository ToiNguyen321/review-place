import mongoose from "mongoose";

// Schema cho District
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
  provinceCode: String,
});

export default mongoose.model("district", schema);

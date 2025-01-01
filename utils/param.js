import { Types } from "mongoose";
const params = {};

params.idsToArrayId = (ids, isConvertObjectId = false, needArray = false) => {
  if (!ids) return needArray ? [] : "";
  const array = typeof ids === "string" ? ids.split(",") : ids;
  if (array.length <= 1 && !needArray) return ids;
  return array.map((i) => (isConvertObjectId ? new Types.ObjectId(i) : i));
};

export default params;

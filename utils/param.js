const ObjectId = require("mongoose").Types.ObjectId;

const params = {};

params.idsToArrayId = (ids, isConvertObjectId = false, needArray = false) => {
  if (!ids) return needArray ? [] : "";
  const array = typeof ids === "string" ? ids.split(",") : ids;
  if (array.length <= 1 && !needArray) return ids;
  return array.map((i) => (isConvertObjectId ? new ObjectId(i) : i));
};

module.exports = params;

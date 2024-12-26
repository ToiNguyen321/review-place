const ObjectId = require("mongoose").Types.ObjectId;
const idsToArrayId = (ids, isConvertObjectId = false) => {
  const array = ids.split(",");
  if (array.length <= 1) return ids;
  return array.map((i) => (isConvertObjectId ? ObjectId(i) : i));
};

module.exports = {
  idsToArrayId,
};

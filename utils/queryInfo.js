const { Province, District, Ward, Category } = require("../models");

const queryInfo = {};

queryInfo.queryInfoDetails = async ({
  provinceCode,
  districtCode,
  wardCode,
  categoryIds = null,
}) => {
  const query = [];

  if (provinceCode) {
    query.push(
      Province.findOne({ code: String(provinceCode) }).select({
        code: 1,
        name: 1,
        nameEn: 1,
        fullName: 1,
        fullNameEn: 1,
      })
    );
  } else {
    query.push(Promise.resolve(null));
  }

  if (districtCode) {
    query.push(
      District.findOne({ code: districtCode }).select({
        code: 1,
        name: 1,
        nameEn: 1,
        fullName: 1,
        fullNameEn: 1,
      })
    );
  } else {
    query.push(Promise.resolve(null));
  }

  if (wardCode) {
    query.push(
      Ward.findOne({ code: wardCode }).select({
        code: 1,
        name: 1,
        nameEn: 1,
        fullName: 1,
        fullNameEn: 1,
      })
    );
  } else {
    query.push(Promise.resolve(null));
  }

  if (categoryIds && Array.isArray(categoryIds) && categoryIds.length > 0) {
    query.push(
      Category.find({
        _id: { $in: categoryIds },
      }).select({
        _id: 1,
        title: 1,
      })
    );
  } else {
    query.push(Promise.resolve(null));
  }

  const [province, district, ward, categories] = await Promise.all(query);

  return { province, district, ward, categories };
};

module.exports = queryInfo;

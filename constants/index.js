const STATUS = {
  ACTIVE: "active", // Tài khoản đang hoạt động
  VERIFIED_INFO: "verified_info", // Đã xác minh thông tin (email, số điện thoại)
  VERIFIED_USER: "verified_user", // Đã xác minh danh tính người dùng
  INACTIVE: "inactive", // Tài khoản không hoạt động
  BLOCKED: "blocked", // Tài khoản bị chặn
  DELETED: "deleted", // Tài khoản đã bị xóa
};

const ROLE = {
  USER: "user",
  KOL: "kol",
  SHOP: "shop",
  ADMIN: "admin",
};

const GENDER = {
  MALE: "male",
  FEMALE: "female",
  OTHER: "other",
};

module.exports = {
  STATUS,
  ROLE,
  GENDER,
};

/**
 * Hàm tạo phản hồi chuẩn cho API.
 *
 * @param {Object} res - Đối tượng phản hồi (response) của Express.
 * @param {Number} statusCode - Mã trạng thái HTTP.
 * @param {String} message - Thông báo phản hồi.
 * @param {Object|Array|null} data - Dữ liệu trả về (nếu có).
 * @param {Object|null} error - Thông tin lỗi (nếu có).
 *
 * @returns {void} - Gửi phản hồi JSON.
 */
function createResponse(
  res,
  statusCode,
  data = null,
  message = null,
  error = null
) {
  const success = statusCode >= 200 && statusCode < 300;

  const response = {
    success,
    statusCode,
    message,
    data: data || null,
    error:
      error === true
        ? error
        : error
        ? {
            message: error?.message || "An error occurred",
            details: error?.details || null,
          }
        : null,
  };

  res.status(statusCode).json(response);
}

module.exports = {
  createResponse,
};

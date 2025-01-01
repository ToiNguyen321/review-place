const string = {};

string.removeViAccent = (content) => {
  return content
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};

string.separate = (value = "", sign = ",") => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, sign);
};

string.generateRandomString = (length = 16) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length - 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result + new Date().getTime();
};

export default string;

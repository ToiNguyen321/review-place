const phone = {};

phone.refine = (pn = "") => {
  pn = pn
    .replace(/[^0-9+]/g, "")
    .replace(/\+/g, (match, offset) => (offset === 0 ? match : ""));

  if (pn.startsWith("84")) {
    return `+84${pn.slice(2).replace(/^0+/, "")}`;
  }

  if (pn.startsWith("+84")) {
    return `+84${pn.slice(3).replace(/^0+/, "")}`;
  }

  if (pn.startsWith("0")) {
    return `+84${pn.replace(/^0+/, "")}`;
  }

  return pn;
};

phone.validate = (pn = "") => {
  const regexPhoneNumber = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;
  return pn.match(regexPhoneNumber) ? true : false;
};

module.exports = phone;

const jwt = require("jsonwebtoken");
const { uResponse } = require("../utils");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

function verifyToken(req, res, next) {
  // return next();
  let token = req.header("Authorization");
  if (token && token?.startsWith("Bearer ")) {
    token = token.substring(7, token.length);
  }
  if (!token)
    return uResponse.createResponse(res, 401, null, "Invalid denied", true);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.role = decoded.role;
    next();
  } catch (error) {
    return uResponse.createResponse(res, 401, null, "Invalid token", error);
  }
}

function userByToken(req, res, next) {
  try {
    if (!req || !req?.header) {
      next();
    }
    let token = req.header("Authorization");
    if (token && token.startsWith("Bearer ")) {
      token = token.substring(7, token.length);
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded?.userId ?? null;
  } catch (error) {
    req.userId = null;
  } finally {
    next();
  }
}

module.exports = { verifyToken, userByToken };

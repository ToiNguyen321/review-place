const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

function verifyToken(req, res, next) {
  // return next();
  let token = req.header("Authorization");
  if (token.startsWith("Bearer ")) {
    token = token.substring(7, token.length);
  }
  if (!token)
    return res.status(401).json({
      error: "Access denied",
      code: 401,
    });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.log("🚀 ~ verifyToken ~ error:", error);
    res.status(401).json({
      error: "Invalid token",
      code: 401,
    });
  }
}

function userByToken(req, res, next) {
  // return next();
  let token = req.header("Authorization");
  if (token.startsWith("Bearer ")) {
    token = token.substring(7, token.length);
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded?.userId ?? null;
  } catch (error) {
  } finally {
    next();
  }
}

module.exports = { verifyToken, userByToken };

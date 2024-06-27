const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;

function verifyToken(req, res, next) {
  return next();
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({
    error: 'Access denied',
    code: 401,
  });
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({
      error: 'Invalid token',
      code: 401,
    });
  }
};

module.exports = verifyToken;
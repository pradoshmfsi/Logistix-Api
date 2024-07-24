const jwt = require("jsonwebtoken");
require("dotenv").config();

const Auth = async (req, res, next) => {
  try {
    const jwtSecretKey = process.env.JWT_SECRET_KEY;
    const token = req.headers["x-auth-token"];
    if (!token) {
      return res.status(401).json({
        message: "Missing auth token",
      });
    }
    if (await jwt.verify(token, jwtSecretKey)) {
      next();
    }
  } catch (err) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
};

module.exports = Auth;

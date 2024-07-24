const express = require("express");
// const bcrypt = require("bcryptjs");
const { User } = require("../models/User");
const jwt = require("jsonwebtoken");
const { Location } = require("../models/Location");
const router = express.Router();
require("dotenv").config();

router.post("/register", async (req, res) => {
  try {
    let { name, email, password, location } = req.body;

    // const salt = await bcrypt.genSalt(10);
    // password = await bcrypt.hash(password, salt);
    const isRegistered = await User.findOne({ email: email });
    if (isRegistered) {
      return res.status(401).json({
        message: "Email already exists",
      });
    }
    const user = new User({ name, email, password, location });
    await user.save();
    return res.status(200).json({
      message: "User saved successfully",
      user,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const jwtSecretKey = process.env.JWT_SECRET_KEY;
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (user) {
      const verifyUser = password == user.password;
      if (verifyUser) {
        const payload = {
          user: {
            id: user._id,
          },
        };

        const token = jwt.sign(payload, jwtSecretKey, {
          expiresIn: 3600,
        });

        const locationData = await Location.findOne({ _id: user.location });
        res.status(200).json({
          message: "Logged in",
          user: {
            userId: user._id,
            name: user.name,
            email: user.email,
            location: locationData.location,
          },
          token,
        });
      } else {
        res.status(401).json({
          message: "Wrong Username/Password",
        });
      }
    } else {
      res.status(401).json({
        message: "Not registered",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
});

module.exports = router;

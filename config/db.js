const mongoose = require("mongoose");
require("dotenv").config();
exports.dbConn = async () => {
  try {
    const dbURL = process.env.DB_URL;
    mongoose.set("strictQuery", true);
    await mongoose.connect(dbURL);
    console.log(`Database connected`);
  } catch (err) {
    console.log(`Database connection error ${err.message}`);
  }
};

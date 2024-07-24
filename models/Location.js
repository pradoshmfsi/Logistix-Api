const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const locationSchema = new Schema({
  location: {
    type: String,
    required: true,
  },
});

exports.Location = mongoose.model("location", locationSchema);

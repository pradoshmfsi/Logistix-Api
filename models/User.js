const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    location: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

exports.User = mongoose.model("user", userSchema);

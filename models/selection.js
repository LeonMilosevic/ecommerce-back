const mongoose = require("mongoose");

const selection = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32
    },
    photoUrl: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Selection", selection);

const mongoose = require("mongoose");
// @ts-ignore
const { ObjectId } = mongoose.Schema;

const subCategory = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
      unique: true
    },
    category: {
      type: ObjectId,
      ref: "Category",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("SubCategory", subCategory);

const mongoose = require("mongoose");
//@ts-ignore
const { ObjectId } = mongoose.Schema;

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32
    },
    about: {
      type: String,
      required: true,
      maxlength: 2000
    },
    price: {
      type: Number,
      trim: true,
      required: true,
      maxlength: 20
    },
    category: {
      type: ObjectId,
      ref: "Category",
      required: true
    },
    subCategory: {
      type: ObjectId,
      ref: "SubCategory",
      required: true
    },
    onSale: {
      type: Boolean,
      required: false,
      price: { type: Number }
    },
    quantity: {
      type: Number,
      required: true
    },
    color: {
      type: String,
      required: true
    },
    size: {
      type: String,
      required: true
    },
    instructions: {
      type: String,
      maxLength: 2000,
      required: true
    },
    brand: {
      type: String,
      required: true
    },
    brandDescription: {
      type: String,
      required: true
    },
    photoUrl: [
      {
        type: String
      }
    ],
    photoId: [
      {
        type: String
      }
    ],
    selection: {
      type: ObjectId,
      ref: "Selection",
      required: false
    },
    sold: {
      type: Number,
      default: 0
    },
    editorsChoice: {
      type: Boolean,
      required: true
    },
    imageFolderName: String
  },
  { timestamps: true }
);

productSchema.path("photoUrl").validate(val => {
  const urlRegex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/;
  return urlRegex.test(val);
}, "Invalid URL.");

module.exports = mongoose.model("Product", productSchema);

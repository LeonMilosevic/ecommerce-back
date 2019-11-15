const mongoose = require("mongoose");
const mongoURI =
  "mongodb+srv://Leon:leon123@clothify-wfeps.mongodb.net/test?retryWrites=true&w=majority";
const db = mongoURI;

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true
    });

    console.log(`MongoDB connected`);
  } catch (error) {
    process.exit(1);
  }
};

module.exports = connectDB;

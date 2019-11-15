const express = require("express");
const connectDB = require("./config/db");
require("dotenv").config();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// routes
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const categoryRouter = require("./routes/category");
const subCategoryRouter = require("./routes/subCategory");
const selectionRouter = require("./routes/selection");
const productRouter = require("./routes/product");
const braintreeRouter = require("./routes/braintree");
const orderRouter = require("./routes/order");

// app
const app = express();
// init cors
app.use(cors());

// database
connectDB();

// middlewares
app.use(bodyParser.json());
app.use(cookieParser());

// routes middleware
app.use("/api", authRouter);
app.use("/api", userRouter);
app.use("/api", categoryRouter);
app.use("/api", subCategoryRouter);
app.use("/api", selectionRouter);
app.use("/api", productRouter);
app.use("/api", braintreeRouter);
app.use("/api", orderRouter);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

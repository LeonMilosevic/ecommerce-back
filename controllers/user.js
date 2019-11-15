const User = require("../models/user");
const { Order } = require("../models/orderSchema");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.userById = (req, res, next, id) => {
  User.findById(id).exec((error, user) => {
    if (error || !user)
      return res.status(400).json({ error: "User not found" });

    req.profile = user;
    next();
  });
};

exports.read = (req, res) => {
  req.profile.hashed_password = undefined;
  req.profile.salt = undefined;

  return res.json(req.profile);
};

exports.update = (req, res) => {
  req.body.role = 0;
  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $set: { address: req.body } },
    { new: true },
    (error, user) => {
      if (error)
        return res
          .status(400)
          .json({ error: "You are not authorized to perform this action" });
      //@ts-ignore
      user.hashed_password = undefined;
      //@ts-ignore
      user.salt = undefined;

      res.json(user);
    }
  );
};

exports.purchaseHistory = (req, res) => {
  Order.find({ user: req.profile._id })
    .populate("user", "_id name history")
    .sort("-created")
    .exec((error, orders) => {
      if (error) return res.status(400).json({ error: errorHandler(error) });

      res.json(orders);
    });
};

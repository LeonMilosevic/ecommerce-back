const { Order, CartItem } = require("../models/orderSchema");
const User = require("../models/user");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.orderById = (req, res, next, id) => {
  Order.findById(id).exec((error, order) => {
    if (error || !order)
      return res.status(400).json({ error: "Order not found" });
    req.order = order;
    next();
  });
};

exports.saveAddressToUserAddress = (req, res, next) => {
  let address = {
    firstName: req.body.order.address.firstName,
    lastName: req.body.order.address.lastName,
    mobile: req.body.order.address.mobile,
    country: req.body.order.address.country,
    city: req.body.order.address.city,
    postalCode: req.body.order.address.postalCode,
    fullAddress: req.body.order.address.fullAddress
  };

  User.findByIdAndUpdate(
    { _id: req.profile._id },
    { address: address },
    { new: true },
    (error, data) => {
      if (error)
        return res.status(400).json({ error: "Coult not update user address" });

      next();
    }
  );
};

exports.addOrderToUserHistory = (req, res, next) => {
  let history = [];

  req.body.order.products.forEach(item => {
    console.log(item.photoUrl);
    history.push({
      _id: item._id,
      name: item.name,
      price: item.price,
      photo: item.photoUrl[0],
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      transaction_id: req.body.order.transaction_id
    });
  });

  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $push: { history: history } },
    { new: true },
    (error, data) => {
      if (error)
        return res.status(400).json({ error: "could not update history" });

      next();
    }
  );
};

exports.createOrder = (req, res) => {
  req.body.order.user = req.profile;
  const order = new Order(req.body.order);
  order.save((error, data) => {
    if (error) return res.status(400).json({ error: errorHandler(error) });

    res.json(data);
  });
};

exports.listOrders = (req, res) => {
  Order.find()
    .populate("user", "_id name address email history")
    .sort("-created")
    .exec((error, orders) => {
      if (error) return res.status(400).json({ error: errorHandler(error) });

      res.json(orders);
    });
};

exports.singleOrder = (req, res) => {
  return res.json(req.order);
};

exports.getStatusValues = (req, res) => {
  res.json(Order.schema.path("status").enumValues);
};

exports.updateOrderStatus = (req, res) => {
  Order.update(
    { _id: req.body.orderId },
    { $set: { status: req.body.status } },
    (error, order) => {
      if (error) return res.status(400).json({ error: errorHandler(error) });

      res.json(order);
    }
  );
};

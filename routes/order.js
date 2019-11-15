const express = require("express");
const router = express.Router();

const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");
const { userById } = require("../controllers/user");
const {
  createOrder,
  addOrderToUserHistory,
  saveAddressToUserAddress,
  listOrders,
  singleOrder,
  orderById,
  getStatusValues,
  updateOrderStatus
} = require("../controllers/order");

const { decreaseQuantity } = require("../controllers/product");

router.post(
  "/order/create/:userId",
  requireSignin,
  isAuth,
  addOrderToUserHistory,
  saveAddressToUserAddress,
  decreaseQuantity,
  createOrder
);

router.get("/order/list/:userId", requireSignin, isAuth, isAdmin, listOrders);
router.get(
  "/order/:orderId/:userId/",
  requireSignin,
  isAuth,
  isAdmin,
  singleOrder
);
router.get(
  "/status-values/:userId",
  requireSignin,
  isAuth,
  isAdmin,
  getStatusValues
);
router.put(
  "/status-update/:orderId/:userId",
  requireSignin,
  isAuth,
  isAdmin,
  updateOrderStatus
);

router.param("userId", userById);
router.param("orderId", orderById);
module.exports = router;

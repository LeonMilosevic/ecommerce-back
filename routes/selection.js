const express = require("express");
const router = express.Router();

const {
  create,
  selectionById,
  read,
  update,
  remove,
  list
} = require("../controllers/selection");
const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");
const { userById } = require("../controllers/user");

router.get("/selection/:selectionById", read);
router.post(
  "/selection/create/:userId",
  requireSignin,
  isAuth,
  isAdmin,
  create
);
router.put(
  "/selection/:selectionById/:userId",
  requireSignin,
  isAuth,
  isAdmin,
  update
);
router.delete(
  "/selection/:selectionById/:userId",
  requireSignin,
  isAuth,
  isAdmin,
  remove
);

router.get("/selections", list);

router.param("selectionById", selectionById);
router.param("userId", userById);

module.exports = router;

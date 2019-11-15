const express = require("express");
const router = express.Router();

const {
  create,
  subCategoryById,
  read,
  update,
  remove,
  list
} = require("../controllers/subCategory");
const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");
const { userById } = require("../controllers/user");

router.get("/subcategory/:subCategoryById", read);
router.post(
  "/subcategory/create/:userId",
  requireSignin,
  isAuth,
  isAdmin,
  create
);
router.put(
  "/subcategory/:subCategoryById/:userId",
  requireSignin,
  isAuth,
  isAdmin,
  update
);
router.delete(
  "/subcategory/:subCategoryById/:userId",
  requireSignin,
  isAuth,
  isAdmin,
  remove
);

router.get("/subcategories", list);

router.param("subCategoryById", subCategoryById);
router.param("userId", userById);

module.exports = router;

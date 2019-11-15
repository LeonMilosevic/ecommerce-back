const express = require("express");
const router = express.Router();
const passport = require("passport");
const passportConf = require("../passport");

const {
  signup,
  signin,
  signout,
  confirmPasswordToken,
  confirmPasswordAndReset,
  googleOAuth,
  requestPasswordUpdate,
  facebookOAuth
} = require("../controllers/auth");
const { userSignupValidator } = require("../validator");

router.post("/signup", userSignupValidator, signup);
router.post("/signin", signin);
router.get("/signout", signout);

// forgot password
router.post("/auth/request-pass-token", requestPasswordUpdate);
router.get("/auth/check-pass-token/:token", confirmPasswordToken);
router.post("/auth/check-pass-token/:token", confirmPasswordAndReset);
// google oauth route
router.post(
  "/oauth/google",
  passport.authenticate("googleToken", { session: false }),
  googleOAuth
);

// facebook oauth route
router.post(
  "/oauth/facebook",
  passport.authenticate("facebookToken", { session: false }),
  facebookOAuth
);
module.exports = router;

const { check } = require("express-validator");

exports.userSignupValidator = [
  check("name", "please add name")
    .not()
    .isEmpty(),
  check("email", "please include a valid email").isEmail(),
  check(
    "password",
    "please enter a password with 6 or more characters"
  ).isLength({
    min: 6
  })
];

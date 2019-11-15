const User = require("../models/user");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const { errorHandler } = require("../helpers/dbErrorHandler");
const { validationResult } = require("express-validator");
const crypto = require("crypto");
require("dotenv").config();

const nodemailer = require("nodemailer");

exports.signup = (req, res) => {
  // --check for errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ errors: errors.array().map(error => error.msg)[0] });
  }
  // --end check for errors
  // check if google email matches the email in db
  User.findOne({ "google.email": req.body.email }, (error, user) => {
    if (error || user)
      return res
        .status(400)
        .json({ error: "User exists, try to sign in with google" });
    // check if facebook email is in db
    User.findOne({ "facebook.email": req.body.email }, (error, user) => {
      if (error || user)
        return res
          .status(400)
          .json({ error: "User exists, try to sign in with facebook" });

      // check if local email is in db
      User.findOne({ "local.email": req.body.email }, (error, user) => {
        if (error || user)
          return res.status(400).json({ error: "User with that email exists" });
        // create user
        const newUser = new User({
          method: "local",
          local: {
            email: req.body.email,
            password: req.body.password
          },
          name: req.body.name
        });

        newUser.save((error, user) => {
          if (error)
            return res.status(400).json({ error: errorHandler(error) });

          res.json({ user });
        });
      });
    });
  });
};

exports.signin = (req, res) => {
  const { email, password } = req.body;
  User.findOne({ "local.email": email }, async (error, user) => {
    if (error || !user)
      return res
        .status(400)
        .json({ error: "User with that email does not exist" });
    //@ts-ignore
    const isMatch = await user.authenticate(password);
    // compare password with hashed
    if (!isMatch)
      return res.status(401).json({ error: "Email and password dont match" });

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h"
    });

    res.cookie("t", token, { expire: 3600 });
    const {
      _id,
      local: { email },
      name,
      role,
      address,
      history
    } = user;
    return res.json({
      token,
      user: { _id, email, name, role, address, history }
    });
  });
};
// google oauth
exports.googleOAuth = async (req, res) => {
  // sign a token
  const token = jwt.sign({ _id: req.user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h"
  });
  res.cookie("t", token, { expire: 3600 });
  const {
    _id,
    google: { email },
    name,
    role,
    address
  } = req.user;
  return res.json({ token, user: { _id, email, name, role, address } });
};

exports.facebookOAuth = async (req, res) => {
  const token = jwt.sign({ _id: req.user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h"
  });
  res.cookie("t", token, { expire: 3600 });
  const {
    _id,
    facebook: { email },
    name,
    role,
    address
  } = req.user;

  return res.json({ token, user: { _id, email, name, role, address } });
};

exports.signout = (req, res) => {
  res.clearCookie("t");
  res.json({ message: "signout success" });
};
// facebook oauth

exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  userProperty: "auth"
});

exports.isAuth = (req, res, next) => {
  let user = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!user) return res.status(403).json({ error: "Access denied" });
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.profile.role === 0)
    return res.status(403).json({ error: "Admin only! Access Denied" });

  next();
};

exports.requestPasswordUpdate = async (req, res, next) => {
  if (!req.body.email) return res.json("email required");

  await User.findOne({
    "local.email": req.body.email
  }).then(user => {
    if (!user) return res.status(400).json({ error: "User does not exist" });

    const token = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 360000;

    user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: `${process.env.EMAIL_ADDRESS}`,
        pass: `${process.env.EMAIL_PASSWORD}`
      }
    });

    const mailOptions = {
      from: `clothify@support.com`,
      to: `${user.local.email}`,
      subject: "Forgot Password",
      text:
        `You are receiving this because you have requested the reset of your password for your account. \n\n` +
        `Please click on this link or paste it in your web browser to reset password: http://localhost:5000/api/auth/check-pass-token/${token}\n\n` +
        `If you haven't requested password change, or you don't want to change password anymore, your password will remain unchanged and this link will expire in 1 hour.`
    };

    transporter.sendMail(mailOptions, (error, response) => {
      if (error) console.log(error);

      res.status(200).json("Recovery email sent");
      next();
    });
  });
};

exports.confirmPasswordToken = (req, res) => {
  User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  })
    .then(user => {
      if (!user)
        return res
          .status(400)
          .json("Password reset token is invalid or has expired.");

      res.redirect(
        `https://localhost:3000/forgot-password-form/${req.params.token}`
      );
    })
    .catch(error => console.log(error));
};

exports.confirmPasswordAndReset = (req, res) => {
  User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  }).then(user => {
    if (!user)
      return res
        .status(400)
        .json({ error: "Password reset token is invalid or has expired" });

    user.local.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    user.save();

    res.status(200).json({ msg: "password updated" });
  });
};

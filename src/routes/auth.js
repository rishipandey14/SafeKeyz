const express = require("express");
const authRouter = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { validateSignUpData } = require("../utils/validation");
const isProduction = process.env.NODE_ENV === "production";

// signup API
authRouter.post("/signup", async (req, res) => {
  try {
    // validation of data
    validateSignUpData(req);

    const { password, ...rest } = req.body;

    // password encryption
    const hashedPassword = await bcrypt.hash(password, 10);

    // create new instance/user of the User model
    const user = new User({
      ...rest,
      password: hashedPassword,
    });
    const token = await user.getJWT();  // create JWT token

    // add the token in cookie and send response back to the user
    res.cookie("token", token, {
      httpOnly: true,        // prevents JS from accessing cookie (mitigates XSS)
      secure: true,          // only send cookie over HTTPS (important in production)
      sameSite: "None",    // controls cross-site behavior (CSRF protection)
      expires: new Date(Date.now() + 8 * 3600000) // 8 hours
    });

    await user.save();
    res.status(201).json({
      message: "User added up successfully",
      data: user,
    });

  } catch (err) {
    res.status(400).json({
      message: "Couldn't sign up the user",
      error: err.message,
    })
  }
});

// login API
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId: emailId });   // validate emailId
    if (!user) throw new Error("Invalid credentials");

    const isPasswordValid = await user.validatePassword(password);  // validate password

    if (isPasswordValid) {
      const token = await user.getJWT();  // create JWT token

      // add the token in cookie and send response back to the user
      res.cookie("token", token, {
        httpOnly: true,        // prevents JS from accessing cookie (mitigates XSS)
        secure: isProduction,          // only send cookie over HTTPS (important in production)
        sameSite: "Strict",    // controls cross-site behavior (CSRF protection)
        expires: new Date(Date.now() + 8 * 3600000) // 8 hours
      });
      res.json({
        message: "Login successfully",
        data: user,
      });
    }
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
});

// Logout API
authRouter.post("/logout", async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
  });

  res.json({ message: "Logout Successfully" });
});






module.exports = authRouter;
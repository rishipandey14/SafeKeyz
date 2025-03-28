const express = require("express");
const authRouter = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");
const {validateSignUpData} = require("../utils/validation");

// signup API
authRouter.post("/signup", async (req, res) => {
  try {
    // validation of data
    validateSignUpData(req);

    const {firstName, lastName, emailId, password} = req.body;

    // password encryption
    const hashedPassword = await bcrypt.hash(password, 10);

    // create new instance/user of the User model
    const user = new User({
      firstName,
      lastName,
      emailId,
      password : hashedPassword,
    });

    await user.save();
    res.status(201).json({
      message : "User added up successfully",
      data : user,
    });

  } catch (err) {
    res.status(400).json({
      message : "Couldn't sign up the user",
      error : err.message,
    })
  }
});

// login API
authRouter.post("/login", async (req, res) => {
  try {
    const {emailId, password} = req.body;

    const user = await User.findOne({emailId : emailId});   // validate emailId
    if(!user) throw new Error("Invalid credentials");

    const isPasswordValid = await user.validatePassword(password);  // validate password

    if(isPasswordValid) {
      const token = await user.getJWT();  // create JWT token

      // add the token in cookie and send response back to the user
      res.cookie("token", token, {expires : new Date(Date.now() + 8 * 3600000)});
      res.json({
        message : "Login successfully",
        data : user,
      });
    }
  } catch (err) {
    res.status(400).json({
      error : err.message,
    });
  }
});




module.exports = authRouter;
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




module.exports = authRouter;
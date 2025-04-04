const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const {validateEditProfileData} = require("../utils/validation");
const validator = require("validator");
const bcrypt =  require("bcrypt");
const isProduction = process.env.NODE_ENV === "production";



// view Profile API
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(400).json({
      error: err.message
    });
  }
});

// edit profile API
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if(!validateEditProfileData(req)) throw new Error("Invalid edit request");

    const loggedInUser = req.user;
    Object.keys(req.body).forEach(key => (loggedInUser[key] = req.body[key]));

    loggedInUser.save();

    res.json({
      message : `${loggedInUser.firstName} , your profile updated successfully`,
    })

  } catch (err) {
    res.json({
      error : err.message
    });
  }
});

// password change API
profileRouter.patch("/profile/password/change", userAuth, async(req, res) => {
  try {
    const loggedInUser = req.user;
    const {existingPassword, newPassword} = req.body

    //* check if existing password valid
    const isExistingPasswordValid = await loggedInUser.validatePassword(existingPassword);
    if (!isExistingPasswordValid) throw new Error("Invalid Existing password");

    //* check if the new password is strong or not
    if (!validator.isStrongPassword(newPassword)) {
      return res.status(400).json({ error: "Weak password. Use at least 8 characters with uppercase, lowercase, number, and special character." });
    }

    //* create new hashPassword and save it in DB
    loggedInUser.password = await bcrypt.hash(newPassword, 10);
    await loggedInUser.save();

    // logout user after password is changed
    res.clearCookie("token", {
      httpOnly : true,
      secure : isProduction,
      sameSite : "strict",
    });

    res.json({
      message : "Password changed successfully, Login again"
    });
  } catch (err) {
    res.status(400).json({
      error : err.message
    });
  }
});



module.exports = profileRouter;
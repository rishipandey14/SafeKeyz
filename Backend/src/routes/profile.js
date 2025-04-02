const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const {validateEditProfileData} = require("../utils/validation");



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



module.exports = profileRouter;
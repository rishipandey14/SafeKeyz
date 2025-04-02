const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");



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



module.exports = profileRouter;
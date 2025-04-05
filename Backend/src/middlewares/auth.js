require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/user");


const userAuth = async (req, res, next) => {
  try {
    // read the token from the request cookies
    const {token} = req.cookies;
    if(!token) throw new Error("Invalid token");

    // validate the token
    const decodedMessage = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // find the user
    const {_id} = decodedMessage;

    const user = await User.findById(_id);
    if(!user) throw new Error("User not found");

    req.user = user;
    next();

  } catch (err) {
    res.status(400).json({
      error : err.message,
    });
  }
}


module.exports = {
  userAuth
};
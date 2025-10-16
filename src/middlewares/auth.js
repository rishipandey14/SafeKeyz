require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const {validateToken} =  require("../utils/customJWTToken");


const userAuth = async (req, res, next) => {
  try {
    // read the token from the request cookies
    const {token} = req.cookies;
    if(!token) return res.status(401).json({error : "No token provided"});

    // validate the token
    const decodedMessage = validateToken(token);

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
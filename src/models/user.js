require("dotenv").config();
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const userSchema = mongoose.Schema({
  firstName : {
    type : String,
    required : true,
    lowercase : true,
    trim : true,
    maxLength: 50,
  },
  lastName : {
    type : String,
    required: true,
    lowercase : true,
    trim : true,
    maxLength: 50,
  },
  emailId : {
    type : String,
    required : true,
    lowercase : true,
    trim : true,
    validate(value) {
      if (!validator.isEmail(value)) throw new Error("Invalid email address : " + value);
    }
  },
  password : {
    type : String,
    required : true,
    validate(value) {
      if (!validator.isStrongPassword(value)) throw new Error("Weak Password, enter a strong one"); 
    }
  },
  age : {
    // required: true,
    type : Number,
  },
  gender : {
    // required: true,
    type : String,
    validate(value) {
      if(!["Male", "Female", "Others"].includes(value)) throw new Error("Gender is Invalid");
    }
  },
  photoUrl : {
    type : String,
    default : "https://png.pngtree.com/png-clipart/20231019/original/pngtree-user-profile-avatar-png-image_13369988.png",
    validate(value) {
      if(!validator.isURL(value)) throw new Error("Invalid Url!!");
    }
  },
}, {timestamps : true});


// method/function to check password validation 
userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const passwordHash = user.password;

  const isPasswordValid = await bcrypt.compare(passwordInputByUser, passwordHash);
  return isPasswordValid;
};


module.exports = mongoose.model("User", userSchema);
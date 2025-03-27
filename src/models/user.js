const mongoose = require("mongoose");
const validator = require("validator");


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
    type : Number,
  },
  gender : {
    type : String,
    validate(value) {
      if(!["male", "female", "others"].includes(value)) throw new Error("Gender is Invalid");
    }
  },
  photoUrl : {
    type : String,
    default : "https://png.pngtree.com/png-clipart/20231019/original/pngtree-user-profile-avatar-png-image_13369988.png",
    validate(value) {
      if(!validator.isURL(value)) throw new Error("Invalid Url!!");
    }
  },
});


module.exports = mongoose.model("User", userSchema);
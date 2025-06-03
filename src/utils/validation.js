const validator = require("validator");

const validateSignUpData =  (req) => {
  const {firstName, emailId, password} = req.body;

  if (!firstName ) {
    throw new Error("Invalid name")
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Enter valid email id")
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Weak Password")
  }

};

const validateEditProfileData = (req) => {
  const allowedToEditFields = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "photoUrl"
  ]

  const isEditAllowed = Object.keys(req.body).every(key => allowedToEditFields.includes(key));
  return isEditAllowed;
};

module.exports = {
  validateSignUpData,
  validateEditProfileData,
};
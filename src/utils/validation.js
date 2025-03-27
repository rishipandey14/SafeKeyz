const validator = require("validator");

const validateSignUpData =  (req) => {
  const {firstName, lastName, emailId, password} = req.body;

  if (!firstName || !lastName) {
    throw new Error("Invalid name")
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Enter valid email id")
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Weak Password")
  }

};

module.exports = {
  validateSignUpData,
};
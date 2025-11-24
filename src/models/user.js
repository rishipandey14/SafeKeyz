import "dotenv/config";
import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";


const userSchema = mongoose.Schema({
  firstName : {
    type : String,
    required : true,
    // lowercase : true,
    trim : true,
    maxLength: 50,
  },
  lastName : {
    type : String,
    required: true,
    // lowercase : true,
    trim : true,
    maxLength: 50,
  },
  emailId : {
    type : String,
    required : true,
    lowercase : true,
    trim : true,
    unique: true,
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
      if(value && !["Male", "Female", "Others"].includes(value)) throw new Error("Gender is Invalid");
    }
  },
  photoUrl : {
    type : String,
    default : "https://png.pngtree.com/png-clipart/20231019/original/pngtree-user-profile-avatar-png-image_13369988.png",
    validate(value) {
      // Accept regular http(s) URLs
      if (validator.isURL(value)) return true;

      // Accept data URLs for small base64-encoded images (dev use)
      // Format: data:image/{png|jpeg|jpg};base64,AAAA...
      if (typeof value === "string" && value.startsWith("data:image/")) {
        // basic pattern check
        const matches = value.match(/^data:image\/(png|jpeg|jpg);base64,([A-Za-z0-9+/=]+)$/);
        if (!matches) throw new Error("Invalid data URL for image");

        // optional: limit size of base64 payload (protects DB and request size)
        const base64Payload = matches[2] || "";
        const maxBase64Length = 300 * 1024; // ~300KB of base64 chars (~225KB binary)
        if (base64Payload.length > maxBase64Length) throw new Error("Image too large");

        return true;
      }

      throw new Error("Invalid Url!!");
    }
  },
  subscription: {type: String, enum: ["free", "premium"], default: "free"},
  storageUsed: {type: Number, default: 0},  // Storage in Bytes
  storageLimit: {type: Number, default: 50 * 1024},  // 50 KB (in bytes) for free users
  sharedFeeds: [{type: mongoose.Schema.Types.ObjectId, ref: "Feed"}],
}, {timestamps : true});


// method/function to check password validation 
userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const passwordHash = user.password;

  const isPasswordValid = await bcrypt.compare(passwordInputByUser, passwordHash);
  return isPasswordValid;
};

// method to get storage limit based on subscription
userSchema.methods.getStorageLimit = function() {
  if (this.subscription === "premium") {
    return Infinity; // Unlimited for premium users
  }
  return this.storageLimit; // Default limit for free users
};


const User = mongoose.model("User", userSchema);
export default User;
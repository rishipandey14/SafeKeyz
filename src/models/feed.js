import "dotenv/config";
import mongoose from "mongoose";


const feedSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: [
      'userId-password',
      'apiKey',
      'bankLockerKey',
      'note',
      'creditCard',
      'debitCard',
      'aadharCard',
      'panCard',
      'others'
    ],
    default: 'others',
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  sharedWith: [
    {
      emailId: {type: String, required: true, lowercase: true, trim: true},
      user: {type: mongoose.Schema.Types.ObjectId, ref: "User"}, // Will be populated when user registers
      permission: {type: String, enum: ["read", "write"], default: "read"},
      sharedAt: {type: Date, default: Date.now},
      sharedBy: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    },
  ],
  size: {type: Number, default: 0},  // Size in Bytes
}, { timestamps: true });




feedSchema.pre("save", function(next) {
  // Calculate the size of the entire document as it will be stored in MongoDB
  // This includes all fields: title, category, data, owner, sharedWith, timestamps, etc.
  const documentObject = {
    title: this.title,
    category: this.category,
    data: this.data,
    owner: this.owner,
    sharedWith: this.sharedWith,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
  
  const documentString = JSON.stringify(documentObject);
  this.size = Buffer.byteLength(documentString, "utf-8");
  next();
});


const Feed = mongoose.model("Feed", feedSchema);
export default Feed;

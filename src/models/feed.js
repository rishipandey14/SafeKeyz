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
}, { timestamps: true });


const Feed = mongoose.model("Feed", feedSchema);
export default Feed;
// const mongoose = require("mongoose");
// require("dotenv").config();
import mongoose from "mongoose";
import "dotenv/config";

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected successfully");
  } catch (err) {
    console.log("Database connection failed");
    process.exit(1);
  }
};

export default connectDb;
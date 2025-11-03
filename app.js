
import dotenv from "dotenv";
dotenv.config();
import express from "express";
const app = express();
import connectDb from "./src/config/database.js";
import cookieParser from "cookie-parser";
import cors from "cors";

// Development-only: always use local frontend URL by default
const allowedOrigin = process.env.FRONTEND_URL_LOCAL || "http://localhost:5173";

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());
app.use(cookieParser());

import authRouter from "./src/routes/auth.js";
import profileRouter from "./src/routes/profile.js";
import feedRouter from "./src/routes/feed.js";

app.use("/api", authRouter);
app.use("/api", profileRouter);
app.use("/api", feedRouter);

connectDb()
  .then(() => {
    const PORT = process.env.PORT || 7000;
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Database connection failed" + err.message);
  });
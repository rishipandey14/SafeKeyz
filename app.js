
import dotenv from "dotenv";
dotenv.config();
import express from "express";
const app = express();
import connectDb from "./src/config/database.js";
import cookieParser from "cookie-parser";
import cors from "cors";

// Development-only: always use local frontend URL by default
const allowedOrigin = "http://54.219.165.66" || "http://localhost:5173";

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

// Increase JSON body size limit to allow small base64 image uploads in dev (adjust as needed)
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

import authRouter from "./src/routes/auth.js";
import profileRouter from "./src/routes/profile.js";
import feedRouter from "./src/routes/feed.js";
import statsRouter from "./src/routes/stats.js";
import accessRouter from "./src/routes/access.js";

app.get("/", (req, res) => {
  res.send("SafeKeyz Backend is Running 🚀");
});

app.use("/api", authRouter);
app.use("/api", profileRouter);
app.use("/api", feedRouter);
app.use("/api", statsRouter);
// Mount access routes under /api/access to align with frontend paths
app.use("/api/access", accessRouter);

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
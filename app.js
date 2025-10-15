require("dotenv").config();
const express = require("express");
const app = express();
const connectDb = require("./src/config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const isProduction = process.env.NODE_ENV === "production";
if (isProduction) {
  // behind Vercel/Reverse proxies
  app.set("trust proxy", 1);
}
const allowedOrigin = isProduction
  ? process.env.FRONTEND_URL || "https://safe-keyz-frontend.vercel.app"
  : process.env.FRONTEND_URL_LOCAL || "http://localhost:5173";

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());
app.use(cookieParser());


const authRouter = require("./src/routes/auth");
const profileRouter = require("./src/routes/profile");
const feedRouter = require("./src/routes/feed");

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
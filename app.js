const express = require("express");
const app = express();
const connectDb = require("./src/config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");


app.use(cors({
  origin: "https://safe-keyz-frontend.vercel.app",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));

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
    app.listen(7000, () => {
      console.log("hello from server");
    });
  })
  .catch((err) => {
    console.log("Database connection failed" + err.message);
  });
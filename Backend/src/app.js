const express = require("express");
const app = express();
const connectDb = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");


app.use(cors({
  origin: "https://safe-keyz-frontend.vercel.app", // your frontend's origin
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());


const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const feedRouter = require("./routes/feed");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", feedRouter);


connectDb()
  .then(() => {
    app.listen(7000, () => {
      console.log("hello from server");
    });
  })
  .catch((err) => {
    console.log("Database connection failed" + err.message);
  });
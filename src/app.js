const express = require("express");
const app = express();
const connectDb = require("./config/database");
const cookieParser = require("cookie-parser");
app.use(express.json());
app.use(cookieParser());


const authRouter = require("./routes/auth");




app.use("/", authRouter);





connectDb()
  .then(() => {
    console.log("Database connected Successfully");
    app.listen(7000, () => {
      console.log("hello from server");
    });
  })
  .catch((err) => {
    console.log("Database connection failed" );
  });
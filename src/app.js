const express = require("express");
const app = express();
const connectDb = require("./config/database");

app.get("/test", (req, res) => {
  res.send("Test passed successfully");
});





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
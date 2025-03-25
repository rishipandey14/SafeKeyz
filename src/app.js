const express = require("express");
const app = express();

app.use("/test", (req, res) => {
  res.send("Test passed successfully");
});

app.listen(7000, () => {
  console.log("hello from server");
});
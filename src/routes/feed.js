const express = require("express");
const feedRouter = express.Router();
const {userAuth} = require("../middlewares/auth");
const feedController = require("../controllers/feedController");


// create a new feed entry
feedRouter.post('/feed/add', userAuth, feedController.createFeed);

// get all feeds of a user
feedRouter.get("/feed", userAuth, feedController.getAllFeeds);

// update the feed data
feedRouter.patch("/feed/:id", userAuth, feedController.updateFeed);

// delete the feed data
feedRouter.delete("/feed/:id", userAuth, feedController.deleteFeed);





module.exports = feedRouter;
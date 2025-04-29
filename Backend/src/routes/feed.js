const express = require("express");
const feedRouter = express.Router();
const {userAuth} = require("../middlewares/auth");
const feedController = require("../controllers/FeedController");


// create a new feed entry
feedRouter.post('/feed/add', userAuth, feedController.createFeed);


// get all feeds of a user
feedRouter.get("/feed", userAuth, feedController.getAllFeeds);





module.exports = feedRouter;
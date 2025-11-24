import express from "express";
import { userAuth } from "../middlewares/auth.js";
import { createFeed, getAllFeeds, updateFeed, deleteFeed } from "../controllers/feedController.js";
const feedRouter = express.Router();


feedRouter.post('/feed/add', userAuth, createFeed);
feedRouter.get("/feed", userAuth, getAllFeeds);
feedRouter.patch("/feed/:id", userAuth, updateFeed);
feedRouter.delete("/feed/:id", userAuth, deleteFeed);


export default feedRouter;
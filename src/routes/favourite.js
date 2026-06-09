import express from "express";
import { userAuth } from "../middlewares/auth";
import { favouriteManager } from "../controllers/favouriteController";

const favouriteRouter = express.Router();

favouriteRouter.post('/favourite/:credentialId', userAuth, favouriteManager);

export default favouriteRouter;
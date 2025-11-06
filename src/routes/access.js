import express from "express";
import { userAuth } from "../middlewares/auth.js";
import { giveAccess } from "../controllers/accessController.js";

const accessRouter = express.Router();

accessRouter.post("/give-access", userAuth, giveAccess);

export default accessRouter;
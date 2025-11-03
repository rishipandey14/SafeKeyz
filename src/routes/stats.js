import express from "express";
import { userAuth } from "../middlewares/auth.js";
import { stats } from "../controllers/statsController.js";


const statsRouter = express.Router();

statsRouter.get("/stats", stats);

export default statsRouter;
import express from "express";
import { userAuth } from "../middlewares/auth.js";
import { giveAccess, getSharedWithMe, getSharedByMe, revokeAccess } from "../controllers/accessController.js";

const accessRouter = express.Router();

accessRouter.post("/give-access", userAuth, giveAccess);
accessRouter.get("/shared-with-me", userAuth, getSharedWithMe);
accessRouter.get("/shared-by-me", userAuth, getSharedByMe);
accessRouter.delete("/revoke-access/:feedId/:email", userAuth, revokeAccess);

export default accessRouter;
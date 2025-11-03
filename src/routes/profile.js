import express from "express";
import { userAuth } from "../middlewares/auth.js";
import { profileView, profileEdit, changePassword } from "../controllers/profileController.js";

const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, profileView);
profileRouter.patch("/profile/edit", userAuth, profileEdit);
profileRouter.patch("/profile/password/change", userAuth, changePassword);

export default profileRouter;
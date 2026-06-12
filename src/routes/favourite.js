import express from "express";
import { userAuth } from "../middlewares/auth.js";
import { changeFavStatus, getAllFav } from "../controllers/favouriteController.js";

const favouriteRouter = express.Router();

// to add as a fav and remove
favouriteRouter.post('/favourite', userAuth, changeFavStatus);
favouriteRouter.get('/get-favourites', userAuth, getAllFav);


export default favouriteRouter;
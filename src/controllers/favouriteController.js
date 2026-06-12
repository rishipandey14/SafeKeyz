import Favourite from "../models/favourite.js";
import { decrypt } from "../utils/crypto.js";


export const changeFavStatus = async (req, res) => {
    try{
        const userId = req.user._id;
        const {feedId} = req.body;
        const isFav = await Favourite.findOne({userId, feedId});

        if(isFav) {
            await Favourite.findByIdAndDelete(isFav._id);

            return res.json({
                success: true,
                isFavourite: false,
            });
        }

        await Favourite.create({userId, feedId});

        res.json({
            success: true,
            isFavourite: true,
        });
    } catch (err) {
        res.status(500).json({error : err.message});
    }
};


export const getAllFav = async (req, res) => {
    try{
        const userId = req.user._id;
        const favData = await Favourite.find({userId}).populate("feedId");

        const decryptedFavData = favData.map((fav) => ({
            ...fav.toObject(),
            feedId: {
                ...fav.feedId.toObject(),
                data: JSON.parse(decrypt(fav.feedId.data)),
            },
        }));

        res.json({
            Data: decryptedFavData
        });
    } catch (err) {
        res.status(500).json({error : err.message});
    }
};
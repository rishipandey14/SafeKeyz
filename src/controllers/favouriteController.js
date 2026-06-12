import Favourite from "../models/favourite.js";


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
        res.json({
            Data: favData
        });
    } catch (err) {
        res.status(500).json({error : err.message});
    }
};
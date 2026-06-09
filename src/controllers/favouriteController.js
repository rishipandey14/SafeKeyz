import Favourite from "../models/favourite";


export const favouriteManager = async (req, res) => {
    try{
        const userId = req.user._id;
        const {credentialId} = req.params;

        const isFav = await Favourite.findOne({userId, credentialId});

        if(isFav) {
            await Favourite.findByIdAndDelete(isFav._id);

            return res.json({
                success: true,
                isFavourite: false,
            });
        }

        await Favourite.create({userId, credentialId});

        res.json({
            success: true,
            isFavourite: false,
        });
    } catch (err) {
        res.status(500).json({error : err.message});
    }
};
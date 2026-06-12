import mongoose from "mongoose";

const favouriteSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        feedId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Feed",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

favouriteSchema.index(
    {userId: 1, feedId: 1},
    {unique: true}
);

const Favourite = mongoose.model("Favourite", favouriteSchema);

export default Favourite;
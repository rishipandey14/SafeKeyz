import User from "../models/user.js";
import Feed from "../models/feed.js";

export const updateUserStorage = async (userId) => {
    try {
        // get all feeds of this user
        const feeds = await Feed.find({owner: userId});

        // console.log(`********Feeds******* -> ${feeds}`);

        // calculate the size of all the feeds
        const totalStorageUsed = feeds.reduce((total, feed) => {
            return total + (feed.size || 0);
        }, 0);

        // update user's storageUsed field
        await User.findByIdAndUpdate(userId, {
            storageUsed : totalStorageUsed,
        });

        return totalStorageUsed;
    } catch (err) {
        console.error("Error updating user storage:", err.message);
        throw err;
    }
}

export const hasExceededStorageLimit = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error("User not found");

        // Premium users have unlimited storage
        if (user.subscription === "premium") {
            return false;
        }

        const storageUsed = user.storageUsed || 0;
        const storageLimit = user.storageLimit || 0;

        // true if used strictly greater than limit
        return storageUsed > storageLimit;
    } catch (err) {
        console.error("Error checking storage limit:", err.message);
        throw err;
    }
};


export const wouldExceedStorageLimit = async (userId, feedId, newFeedSize) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error("User not found");

        // Premium users have unlimited storage
        if (user.subscription === "premium") {
            return false;
        }

        // Get all feeds except the one being updated
        const feeds = await Feed.find({ owner: userId, _id: { $ne: feedId } });
        
        // Calculate total size without the feed being updated
        const otherFeedsSize = feeds.reduce((total, feed) => {
            return total + (feed.size || 0);
        }, 0);

        // Add the new feed size
        const totalAfterUpdate = otherFeedsSize + newFeedSize;

        // Check if it would exceed the limit
        return totalAfterUpdate > user.storageLimit;
    } catch (err) {
        console.error("Error checking storage limit for update:", err.message);
        throw err;
    }
};

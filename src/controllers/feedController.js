import Feed from "../models/feed.js";
import { encrypt, decrypt } from "../utils/crypto.js";
import { updateUserStorage, hasExceededStorageLimit, wouldExceedStorageLimit } from "../utils/storage.js";
import User from "../models/user.js";


export const createFeed = async (req, res) => {
  try {
    // Check if user has exceeded storage limit
    const exceedsLimit = await hasExceededStorageLimit(req.user._id);
    if (exceedsLimit) {
      return res.status(403).json({
        error: "Storage limit exceeded! Your free subscription has ended. Upgrade to premium to enjoy unlimited storage and premium features."
      });
    }

    const {title, category, data} = req.body;
    const newFeed = new Feed({
      title,
      category,
      data : encrypt(JSON.stringify(data)) ,
      owner: req.user._id,
    });
    await newFeed.save();
    
    // Update user's storage usage
    const storage = await updateUserStorage(req.user._id);
    
    // Get user to return storage limit
    const user = await User.findById(req.user._id);
    
    res.status(201).json({
      message : "data saved successfully",
      storageUsed: storage,
      storageLimit: user.storageLimit,
    });
  } catch (err) {
    res.status(400).json({error : err.message});
  }
};

export const getAllFeeds = async (req, res) => {
  try {
    const feeds = await Feed.find({owner : req.user._id});

    const decryptedFeeds = feeds.map(feed => ({
      ...feed.toObject(),
      data : JSON.parse(decrypt(feed.data)),
    }));

    res.status(200).json({feeds : decryptedFeeds});
  } catch(err) {
    res.status(400).json({error : err.message});
  }
};

export const updateFeed = async (req, res) => {
  try {
    const feed = await Feed.findOne({_id : req.params.id, owner : req.user._id});
    if (!feed) return res.status(404).json({ message: 'Feed not found' });

    // Build the update object
    const updateObj = {};

    if (req.body.title) updateObj.title = req.body.title;
    if (req.body.category) updateObj.category = req.body.category;
    if (req.body.data){
      const existingData = JSON.parse(decrypt(feed.data));
      const updatedData = {...existingData, ...req.body.data};
      updateObj.data = encrypt(JSON.stringify(updatedData));
    }

    // Calculate the new size of the updated feed
    const updatedFeedDocument = {
      title: req.body.title || feed.title,
      category: req.body.category || feed.category,
      data: updateObj.data || feed.data,
      owner: feed.owner,
      sharedWith: feed.sharedWith,
      createdAt: feed.createdAt,
      updatedAt: new Date(),
    };
    const newFeedSize = Buffer.byteLength(JSON.stringify(updatedFeedDocument), "utf-8");

    // Check if update would exceed storage limit
    const exceedsLimit = await wouldExceedStorageLimit(req.user._id, feed._id, newFeedSize);
    if (exceedsLimit) {
      return res.status(403).json({
        error: "Storage limit exceeded! This update would exceed your storage limit. Upgrade to premium to enjoy unlimited storage."
      });
    }

    await Feed.findByIdAndUpdate(feed._id, updateObj, {
      new : true,
      runValidators : true,
    });

    // Update user's storage usage
    await updateUserStorage(req.user._id);

    res.status(200).json({message : "updated Successfully"});
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteFeed = async (req, res) => {
  try {
    const result = await Feed.deleteOne({
      _id : req.params.id,
      owner : req.user._id,
    });
    if(result.deletedCount === 0) throw new Error("Feed not Found");
    
    // Update user's storage usage
    await updateUserStorage(req.user._id);
    
    res.status(200).json({message : "deleted successfully"});
  } catch(err) {
    res.status(400).json({error : err.message});
  }
}
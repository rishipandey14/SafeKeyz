const { json } = require("express");
const Feed = require("../models/feed");
const { encrypt, decrypt } = require("../utils/crypto");


exports.createFeed = async (req, res) => {
  try {
    const {title, category, data} = req.body;
    const newFeed = new Feed({
      title,
      category,
      data : encrypt(JSON.stringify(data)) ,
      owner: req.user._id,
    });
    await newFeed.save();
    res.status(201).json({
      message : "data saved successfully",
    });
  } catch (err) {
    res.status(400).json({error : err.message});
  }
};

exports.getAllFeeds = async (req, res) => {
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

exports.updateFeed = async (req, res) => {
  try {
    const feed = await Feed.findOne({_id : req.params.id, owner : req.user._id});
    if (!feed) return res.status(404).json({ message: 'Feed not found' });

    // build the update obj

    const updateObj = {};

    if (req.body.title) updateObj.title = req.body.title;
    if (req.body.category) updateObj.category = req.body.category;
    if (req.body.data){
      const existingData = JSON.parse(decrypt(feed.data));
      const updatedData = {...existingData, ...req.body.data};
      updateObj.data = encrypt(JSON.stringify(updatedData));
    }

    const updatedFeed = await Feed.findByIdAndUpdate(feed._id, updateObj, {
      new : true,
      runValidators : true,
    });

    res.status(200).json({message : "updated Successfully"});
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteFeed = async (req, res) => {
  try {
    const result = await Feed.deleteOne({
      _id : req.params.id,
      owner : req.user._id,
    });
    if(result.deletedCount === 0) throw new Error("Feed not Found");
    res.status(200).json({message : "deleted successfully"});
  } catch(err) {
    res.status(400).json({error : err.message});
  }
}
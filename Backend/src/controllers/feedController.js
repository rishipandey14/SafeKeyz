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
    const updateObj = { ...req.body };

    if (updateObj.data) {
      updateObj.data = encrypt(JSON.stringify(updateObj.data));
    }

    const updatedFeed = await Feed.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      updateObj,
      { new: true, runValidators: true }
    );

    if (!updatedFeed) return res.status(404).json({ message: 'Feed not found' });

    res.status(200).json({message : "updated Successfully"});
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


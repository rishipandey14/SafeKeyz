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
}
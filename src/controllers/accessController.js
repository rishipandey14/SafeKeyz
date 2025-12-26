import Feed from "../models/feed.js";
import User from "../models/user.js";
import { decrypt } from "../utils/crypto.js";

export const giveAccess = async (req, res) => {
    try {
        const {feedId, email, permission} = req.body;
        const userId = req.user._id;
        const normalizedEmail = email?.trim().toLowerCase();
        const requesterEmail = req.user.emailId?.toLowerCase();

        // validation of incoming data
        if(!feedId || !email || !permission) {
            return res.status(400).json({
                success: false,
                error: "Feed Id , email , and Permission are required",
            });
        }

        if(!["read", "write"].includes(permission)){
            return res.status(400).json({
                success: false,
                error: "Permision must be either read or write",
            });
        }

        // validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({
                success: false,
                error: "Invalid email format",
            });
        }

        // find feed
        const feed = await Feed.findById(feedId);
        if(!feed){
            return res.status(404).json({
                success: false,
                error: "Invalid Feed Id",
            });
        }

        // check if user is the owner
        if(feed.owner.toString() !== userId.toString()){
            return res.status(403).json({
                success: false,
                error: "You aren't Authorized to share this credential",
            });
        }

        // check if the user is trying to share with themselves
        if(normalizedEmail === requesterEmail){
            return res.status(400).json({
                success: false,
                error: "You can't share a credential with yourself",
            });
        }

        // check if already shared with this email (use emailId key, ensure return)
        const alreadyShared = feed.sharedWith.find(share => share.emailId?.toLowerCase() === normalizedEmail);
        if(alreadyShared){
            return res.status(400).json({
                success: false,
                error: "Already shared with this email",
            });
        }

        // check if the email belongs to a registered user
        const sharedUser = await User.findOne({emailId: normalizedEmail});

        // add to shareWith array of feeds
        feed.sharedWith.push({
            emailId: normalizedEmail,
            user: sharedUser ? sharedUser : null,
            permission,
            sharedBy: userId,
            sharedAt: new Date(),
        });

        await feed.save();

        // if user exists add to their shared Feeds array
        if(sharedUser){
            if(!sharedUser.sharedFeeds.includes(feedId)){
                sharedUser.sharedFeeds.push(feedId);
                await sharedUser.save();
            }
        }

        res.status(200).json({
            success: true,
            message: `Credential shared successfully with ${email}`,
            data: {
                feedId: feed._id,
                sharedWith: feed.sharedWith[feed.sharedWith.length - 1],
            },
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
        });
    }
}

// Get credentials shared WITH this user
export const getSharedWithMe = async (req, res) => {
    try {
        const userEmail = req.user.emailId?.toLowerCase();
        const userId = req.user._id;

        // Fetch feeds shared with this user
        const sharedFeeds = await Feed.find({
            "sharedWith.emailId": userEmail,
        }).populate("owner", "firstName lastName emailId");

        const decryptedSharedFeeds = sharedFeeds.map(feed => {
            const shareInfo = feed.sharedWith.find(
                share => share.emailId?.toLowerCase() === userEmail
            );
            return {
                _id: feed._id,
                title: feed.title,
                category: feed.category,
                data: JSON.parse(decrypt(feed.data)),
                owner: feed.owner,
                permission: shareInfo?.permission || "read",
                sharedAt: shareInfo?.sharedAt,
                sharedBy: shareInfo?.sharedBy,
                createdAt: feed.createdAt,
                updatedAt: feed.updatedAt,
            };
        });

        res.status(200).json({
            success: true,
            data: decryptedSharedFeeds,
            total: decryptedSharedFeeds.length,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
        });
    }
}

// Get credentials shared BY this user
export const getSharedByMe = async (req, res) => {
    try {
        const userId = req.user._id;

        // Fetch feeds owned by this user that have been shared
        const feeds = await Feed.find({
            owner: userId,
            "sharedWith.0": { $exists: true }
        });

        const sharedData = feeds.map(feed => {
            return {
                _id: feed._id,
                title: feed.title,
                category: feed.category,
                data: JSON.parse(decrypt(feed.data)),
                owner: feed.owner,
                sharedWithUsers: feed.sharedWith,
                createdAt: feed.createdAt,
                updatedAt: feed.updatedAt,
            };
        });

        res.status(200).json({
            success: true,
            data: sharedData,
            total: sharedData.length,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
        });
    }
}

// Revoke access to a shared credential
export const revokeAccess = async (req, res) => {
    try {
        const { feedId, email } = req.params;
        const userId = req.user._id;
        const normalizedEmail = email?.trim().toLowerCase();

        // Find the feed
        const feed = await Feed.findById(feedId);
        if (!feed) {
            return res.status(404).json({
                success: false,
                error: "Feed not found",
            });
        }

        // Check if user is the owner
        if (feed.owner.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                error: "You don't have permission to revoke access for this credential",
            });
        }

        // Remove the share
        feed.sharedWith = feed.sharedWith.filter(
            share => share.emailId?.toLowerCase() !== normalizedEmail
        );

        await feed.save();

        // Remove feed from sharedUser's sharedFeeds array if it exists
        const sharedUser = await User.findOne({ emailId: normalizedEmail });
        if (sharedUser) {
            sharedUser.sharedFeeds = sharedUser.sharedFeeds.filter(
                id => id.toString() !== feedId
            );
            await sharedUser.save();
        }

        res.status(200).json({
            success: true,
            message: "Access revoked successfully",
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
        });
    }
}


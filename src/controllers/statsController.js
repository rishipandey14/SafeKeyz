import express from "express";
import User from "../models/user.js";
import Feed from "../models/feed.js";
import Device from "../models/device.js";

export const stats = async (req, res) => {
    try {
        const usersCount = await User.countDocuments();
        const credentialsCount = await Feed.countDocuments();
        const deviceCount = await Device.countDocuments();

        const statsData = {
            usersCount,
            credentialsCount,
            deviceCount,
        };

        res.json({
            message: "Stats fetched successfully",
            data: statsData,
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to fetch stats",
            error: err.message,
        });
    }
};
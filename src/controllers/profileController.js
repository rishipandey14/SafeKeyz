import { validateEditProfileData } from "../utils/validation.js";
import validator from "validator";
import bcrypt from "bcrypt";
import Feed from "../models/feed.js";

export const profileView = async (req, res) => {
    try {
        const user = req.user;
        
        // Get user's feeds to calculate stats
        const feeds = await Feed.find({ owner: user._id });
        
        // Calculate statistics
        const stats = {
            totalCredentials: feeds.length,
            storageUsed: user.storageUsed || 0,
            storageLimit: user.storageLimit , // in bytes
            storageUsedKB: ((user.storageUsed || 0) / 1024).toFixed(2),
            storagePercentage: user.storageLimit ? ((user.storageUsed / user.storageLimit) * 100).toFixed(2) : 0,
            subscription: user.subscription || 'free',
            updatedAt: user.updatedAt,
            accountCreated: user.createdAt,
        };
        
        res.json({
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                emailId: user.emailId,
                age: user.age,
                gender: user.gender,
                photoUrl: user.photoUrl,
                subscription: user.subscription,
            },
            stats
        });
    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
}

export const profileEdit = async (req, res) => {
    try {
        // Step 1: Validate allowed fields
        console.log(req.body);
        const isValidEdit = validateEditProfileData(req);
        if (!isValidEdit) {
        return res.status(400).json({ error: "Invalid edit request" });
        }

        // Step 2: Get logged-in user
        const loggedInUser = req.user;

        // Step 3: Update allowed fields
        Object.keys(req.body).forEach((key) => {
            loggedInUser[key] = req.body[key];
        });

        // Step 4: Save updated user
        await loggedInUser.save();

        // Step 5: Send success response
        return res.status(200).json({
            message: `${loggedInUser.firstName}, your profile has been updated successfully.`,
            data: loggedInUser,
        });

    } catch (err) {
        res.json({
            error : err.message
        });
    }
}

export const changePassword = async (req, res) => {
    try {
        const loggedInUser = req.user;
        const {existingPassword, newPassword} = req.body
    
        //* check if existing password valid
        const isExistingPasswordValid = await loggedInUser.validatePassword(existingPassword);
        if (!isExistingPasswordValid) throw new Error("Invalid Existing password");
    
        //* check if the new password is strong or not
        if (!validator.isStrongPassword(newPassword)) {
            return res.status(400).json({ error: "Weak password. Use at least 8 characters with uppercase, lowercase, number, and special character." });
        }
    
        //* create new hashPassword and save it in DB
        loggedInUser.password = await bcrypt.hash(newPassword, 10);
        await loggedInUser.save();
    
        // logout user after password is changed
        res.clearCookie("token", {
            httpOnly: true,
            secure: false,
            sameSite: "Lax",
            path: "/",
        });
    
        res.json({
            message : "Password changed successfully, Login again",
            data: loggedInUser
        });
    } catch (err) {
        res.status(400).json({
            error : err.message
        });
    }
}
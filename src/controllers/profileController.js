import { validateEditProfileData } from "../utils/validation.js";
import validator from "validator";
import bcrypt from "bcrypt";

export const profileView = async (req, res) => {
    try {
        const user = req.user;
        res.send(user);
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
import { validateEditProfileData } from "../utils/validation.js";
import validator from "validator";
import bcrypt from "bcrypt";
const isProduction = process.env.NODE_ENV === "production";

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
        if(!validateEditProfileData(req)) throw new Error("Invalid edit request");

        const loggedInUser = req.user;
        Object.keys(req.body).forEach(key => (loggedInUser[key] = req.body[key]));

        await loggedInUser.save();

        res.json({
            message : `${loggedInUser.firstName} , your profile updated successfully`,
            data: loggedInUser,
        })

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
            secure: isProduction,
            sameSite: isProduction ? "None" : "Lax",
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
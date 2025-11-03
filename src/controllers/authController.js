import bcrypt from "bcrypt";
import User from "../models/user.js";
import { validateSignUpData } from "../utils/validation.js";
import { createToken } from "../utils/customJWTToken.js";
import Device from "../models/device.js";
import useragent from "useragent";

export const signup = async (req, res) => {
    try {
        // validation of data
        validateSignUpData(req);
    
        const { password, ...rest } = req.body;

        // Prevent duplicate signup by checking email first
        const existing = await User.findOne({ emailId: rest.emailId });
        if (existing) {
            return res.status(400).json({ message: "Email already in use" });
        }
    
        // password encryption
        const hashedPassword = await bcrypt.hash(password, 10);
    
        // create new instance/user of the User model
        const user = new User({
            ...rest,
            password: hashedPassword,
        });
        const token = createToken(user);  // create JWT token
    
        // add the token in cookie and send response back to the user
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "Lax",
            expires: new Date(Date.now() + 8 * 3600000), // 8 hours
            path: "/",
        });
    
        await user.save();

        const agent = useragent.parse(req.headers["user-agent"]);
        const deviceName = `${agent.family} ${agent.os.family}`;
        const ipAddress = req.ip;

        await Device.findOneAndUpdate(
            { userId: user._1d, deviceName },
            { $set: { lastLogin: new Date(), ipAddress } },
            { upsert: true, new: true }
        );
        res.status(201).json({
            message: "User added up successfully",
            data: user,
            token: token, // JWT token for testing/debugging
        });
    
    } catch (err) {
        // Handle duplicate email error (unique index)
        if (err && err.code === 11000) {
            return res.status(400).json({
                message: "Email already in use",
                error: err.message,
            });
        }
        res.status(400).json({
            message: "Couldn't sign up the user",
            error: err.message,
        });
    }
}

export const login = async (req, res) => {
    try {
        const { emailId, password } = req.body;
    
        const user = await User.findOne({ emailId: emailId });   // validate emailId
        if (!user) throw new Error("Invalid Email or Password");
    
        const isPasswordValid = await user.validatePassword(password);  // validate password
    
        if (isPasswordValid) {
            const agent = useragent.parse(req.headers["user-agent"]);
            const deviceName = `${agent.family} ${agent.os.family}`;
            const ipAddress = req.ip;

            await Device.findOneAndUpdate(
                {userId : user._id, deviceName},
                {lastLogin: new Date(), ipAddress},
                {upsert: true}
            )


            const token = createToken(user);  // create JWT token
        
            // add the token in cookie and send response back to the user
            res.cookie("token", token, {
                httpOnly: true,
                secure: false,
                sameSite: "Lax",
                expires: new Date(Date.now() + 8 * 3600000),
                path: "/",
            });
            res.json({
                message: "Login successfully",
                data: user,
                token: token, // JWT token for testing/debugging
            });
        }
    } catch (err) {
        res.status(400).json({
            error: err.message,
        });
    }
}

export const logout = async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
        path: "/",
    });

    res.json({ message: "Logout Successfully" });
}
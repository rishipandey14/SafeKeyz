import "dotenv/config";
import jwt from "jsonwebtoken";

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY

/**
 * @param {object} user - user object to encode in token
 * @returns {string}  - signed JWT Token
 */

export const createToken = (user) => {

    const payload = {
        _id : user._id,
        emailId : user.emailId
    };
    try {
        const token =  jwt.sign(payload, JWT_SECRET_KEY, {expiresIn : "2D",});
        return token;
    } catch (error) {
        throw new Error("Token generation failed");
    }
}


/**
 * @param {string} token - The token to verify
 * @returns {object | null} - decoded payload if valid, or null if invalid/expired
 */

export const validateToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET_KEY);
        return decoded;
    } catch (error) {
        throw new Error(`Invalid or expired token : ${error.message}`);
    }
}
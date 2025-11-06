import Feed from "../models/feed.js";
import User from "../models/user.js";

export const giveAccess = async (req, res) => {
    try {
        const {feedId, email, permission} = req.body;
        const userId = req.user._id;

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
        if(email.toLowerCase() === req.user.emailId.toLowerCase()){
            return res.status(400).json({
                success: false,
                error: "You can't share a credential with yourself",
            });
        }

        // check if already shared with this email
        const alreadyShared = feed.sharedWith.find((share) => {
            share.email.toLowerCase() === email.toLowerCase();
        });
        if(alreadyShared){
            return res.status(400).json({
                success: false,
                error: "Already shared with this email",
            });
        }

        // check if the email belongs to a registered user
        const sharedUser = await User.findOne({emailId: email.toLowerCase()});

        // add to shareWith array of feeds
        feed.sharedWith.push({
            emailId: email,
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


//     try {
//         const { feedId, email, permission } = req.body;
//         const userId = req.user._id;

//         // Validation
//         if (!feedId || !email || !permission) {
//             return res.status(400).json({
//                 success: false,
//                 error: "Feed ID, email, and permission are required",
//             });
//         }

//         if (!["read", "write"].includes(permission)) {
//             return res.status(400).json({
//                 success: false,
//                 error: "Permission must be either 'read' or 'write'",
//             });
//         }

//         // Validate email format
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!emailRegex.test(email)) {
//             return res.status(400).json({
//                 success: false,
//                 error: "Invalid email format",
//             });
//         }

//         // Find the feed
//         const feed = await Feed.findById(feedId);
//         if (!feed) {
//             return res.status(404).json({
//                 success: false,
//                 error: "Credential not found",
//             });
//         }

//         // Check if user is the owner
//         if (feed.owner.toString() !== userId.toString()) {
//             return res.status(403).json({
//                 success: false,
//                 error: "You don't have permission to share this credential",
//             });
//         }

//         // Check if user is trying to share with themselves
//         if (email.toLowerCase() === req.user.emailId.toLowerCase()) {
//             return res.status(400).json({
//                 success: false,
//                 error: "You cannot share a credential with yourself",
//             });
//         }

//         // Check if already shared with this email
//         const alreadyShared = feed.sharedWith.find(
//             (share) => share.email.toLowerCase() === email.toLowerCase()
//         );

//         if (alreadyShared) {
//             return res.status(400).json({
//                 success: false,
//                 error: "Credential already shared with this email",
//             });
//         }

//         // Check if the email belongs to a registered user
//         const sharedUser = await User.findOne({ emailId: email.toLowerCase() });

//         // Add to sharedWith array
//         feed.sharedWith.push({
//             email: email.toLowerCase(),
//             user: sharedUser ? sharedUser._id : null,
//             permission,
//             sharedBy: userId,
//             sharedAt: new Date(),
//         });

//         await feed.save();

//         // If user exists, add to their sharedFeeds array
//         if (sharedUser) {
//             if (!sharedUser.sharedFeeds.includes(feedId)) {
//                 sharedUser.sharedFeeds.push(feedId);
//                 await sharedUser.save();
//             }
//         }

//         res.status(200).json({
//             success: true,
//             message: `Credential shared successfully with ${email}`,
//             data: {
//                 feedId: feed._id,
//                 sharedWith: feed.sharedWith[feed.sharedWith.length - 1],
//             },
//         });
//     } catch (err) {
//         console.error("Error sharing credential:", err);
//         res.status(500).json({
//             success: false,
//             error: err.message,
//         });
//     }
// };
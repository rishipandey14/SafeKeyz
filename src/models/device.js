import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    deviceName: String,
    ipAddress: String,
    lastLogin: {
        type: Date,
        default: Date.now,
    },
});

// Ensure a user can only have one record per deviceName
deviceSchema.index({ userId: 1, deviceName: 1 }, { unique: true });

const Device = mongoose.model("Device", deviceSchema);
export default Device;
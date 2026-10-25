// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: 254,
        },

        passwordHash: {
            type: String,
            required: true,
            select: false,
        },

        status: {
            type: String,
            enum: ["active", "disabled"],
            default: "active",
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export default mongoose.models.User || mongoose.model("User", userSchema);

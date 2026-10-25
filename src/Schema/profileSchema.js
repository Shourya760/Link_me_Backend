// models/Profile.js
import mongoose from "mongoose";

const customLinkSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        url: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2048,
        },
    },
    { _id: true, strict: false }
);

const achievementSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        year: {
            type: Number,
            min: 1900,
            max: 2200,
        },
    },
    { _id: true, strict: false }
);

const photoSchema = new mongoose.Schema(
    {
        url: {
            type: String,
            required: true,
        },
        alt: {
            type: String,
            default: "",
            maxlength: 200,
        },
    },
    { _id: true, strict: false }
);

const profileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            immutable: true,
        },

        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            minlength: 3,
            maxlength: 30,
            match: /^[a-z0-9_-]+$/,
        },

        name: {
            type: String,
            trim: true,
            maxlength: 100,
            default: "",
        },
        email: { type: String, trim: true, lowercase: true, maxlength: 254, default: "" },

        title: {
            type: String,
            trim: true,
            maxlength: 150,
            default: "",
        },

        bio: {
            type: String,
            maxlength: 1000,
            default: "",
        },

        avatar: {
            type: String,
            default: "",
        },

        socials: {
            type: Map,
            of: String,
            default: {},
        },

        customLinks: {
            type: [customLinkSchema],
            default: [],
        },

        photos: {
            type: [photoSchema],
            default: [],
        },

        interests: {
            type: [String],
            default: [],
        },

        achievements: {
            type: [achievementSchema],
            default: [],
        },

        theme: { type: mongoose.Schema.Types.Mixed, default: () => ({ id: "clean" }) },

        isPublic: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export default mongoose.models.Profile || mongoose.model("Profile", profileSchema);

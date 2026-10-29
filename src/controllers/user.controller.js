import mongoose from 'mongoose';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { createToken } from '../utils/token.js';
import { uploadToCloudinary } from '../Services/cloudinary.services.js';
import { createUser, deleteUserById, getUserByEmail, updateUserById } from '../Services/user.services.js';
import { createProfile, getProfileByUsername } from '../Services/profile.services.js';

const formatUser = (user) => ({
    id: user._id,
    email: user.email,
});

// CREATE USER / REGISTER
export const create_user = async (req, res) => {
    try {
        const { email, password, username, name } = req.body;

        // Validate required fields
        if (!email || !password || !username) {
            return res.status(400).json({
                success: false,
                message: 'EMAIL, PASSWORD AND USERNAME ARE REQUIRED',
            });
        }

        const cleanEmail = String(email).trim().toLowerCase();
        const cleanUsername = String(username).trim().toLowerCase();
        const cleanName = String(name || '').trim();

        // Validate email, username and password
        if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
            return res.status(400).json({
                success: false,
                message: 'INVALID EMAIL ADDRESS'
            });
        }
        if (String(password).length < 8) {
            return res.status(400).json({
                success: false,
                message: 'PASSWORD MUST BE AT LEAST 8 CHARACTERS'
            });
        }
        if (!/^[a-z0-9_-]{3,30}$/.test(cleanUsername)) {
            return res.status(400).json({
                success: false,
                message: 'USERNAME MUST BE 3-30 CHARACTERS USING LETTERS, NUMBERS, _ OR -',
            });
        }
        if (['login', 'register', 'settings', 'portfolio', 'preview', 'p', 'api', 'auth'].includes(cleanUsername)) {
            return res.status(400).json({
                success: false,
                message: 'USERNAME IS NOT AVAILABLE',
            });
        }

        // Check for existing email or username
        const existingUser = await getUserByEmail(cleanEmail);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'EMAIL IS ALREADY REGISTERED'
            });
        }

        const existingProfile = await getProfileByUsername(cleanUsername);
        if (existingProfile) {
            return res.status(409).json({
                success: false,
                message: 'USERNAME IS ALREADY TAKEN'
            });
        }

        // Hash password before saving it
        const passwordHash = await hashPassword(String(password));
        const user = await createUser({ email: cleanEmail, passwordHash });

        // Create the initial profile; remove the user if profile creation fails
        let profile;
        try {
            profile = await createProfile({
                userId: user._id,
                username: cleanUsername,
                name: cleanName,
                email: cleanEmail,
                isPublic: true,
            });
        } catch (error) {
            await deleteUserById(user._id);
            throw error;
        }

        const token = createToken(user._id);

        return res.status(201).json({
            success: true,
            message: 'ACCOUNT CREATED SUCCESSFULLY',
            token,
            user: formatUser(user),
            profile,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'EMAIL OR USERNAME IS ALREADY IN USE'
            });
        }

        console.error('Create user error:', error);
        return res.status(500).json({
            success: false,
            message: 'ERROR WHILE CREATING ACCOUNT'
        });
    }
};

// LOGIN USER
export const login_user = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'EMAIL AND PASSWORD ARE REQUIRED',
            });
        }

        const cleanEmail = String(email).trim().toLowerCase();
        const user = await getUserByEmail(cleanEmail, { includePassword: true });

        // Verify account and password
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'USER NOT FOUND'
            });
        }

        // Verify account and password
        if (user.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: 'USER IS UNACTIVE'
            });
        }

        const passwordMatches = await verifyPassword(String(password), user.passwordHash);
        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: 'INVALID EMAIL OR PASSWORD'
            });
        }

        const token = createToken(user._id);

        return res.status(200).json({
            success: true,
            message: 'LOGIN SUCCESSFUL',
            token,
            user: formatUser(user),
        });
    } catch (error) {
        console.error('Login user error:', error);
        return res.status(500).json({
            success: false,
            message: 'ERROR WHILE LOGGING IN'
        });
    }
};

// LOG OUT USER (JWT is stored client-side, so the client removes the token)
export const logout_user = (_req, res) => {
    return res.status(200).json({
        success: true,
        message: 'LOGOUT SUCCESSFUL'
    });
};

// DEACTIVATE AUTHENTICATED USER
export const deactivate_user = async (req, res) => {
    try {
        const userId = req.curr_user?.id;

        // Validate authenticated user ID
        if (!userId || !mongoose.isValidObjectId(userId)) {
            return res.status(400).json({
                success: false,
                message: 'INVALID USER ID'
            });
        }

        const user = await updateUserById(userId, { $set: { status: 'disabled' } });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'USER NOT FOUND'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'ACCOUNT DEACTIVATED SUCCESSFULLY'
        });
    } catch (error) {
        console.error('Deactivate user error:', error);
        return res.status(500).json({
            success: false,
            message: 'ERROR WHILE DEACTIVATING ACCOUNT'
        });
    }
};

// UPLOAD PROFILE / PORTFOLIO IMAGE
export const upload_image = async (req, res) => {
    try {
        const image = req.file;

        if (!image) {
            return res.status(400).json({
                success: false,
                message: 'IMAGE FILE IS REQUIRED'
            });
        }
        if (!image.mimetype.startsWith('image/')) {
            return res.status(400).json({
                success: false,
                message: 'FILE MUST BE AN IMAGE'
            });
        }
        if (image.size > 5 * 1024 * 1024) {
            return res.status(400).json({
                success: false,
                message: 'IMAGE MUST BE 5MB OR SMALLER'
            });
        }

        const uploadedImage = await uploadToCloudinary(image.buffer, 'linkme');

        return res.status(201).json({
            success: true,
            message: 'IMAGE UPLOADED SUCCESSFULLY',
            url: uploadedImage.secure_url,
            publicId: uploadedImage.public_id,
        });
    } catch (error) {
        console.error('Upload image error:', error);
        return res.status(502).json({
            success: false,
            message: 'ERROR WHILE UPLOADING IMAGE. CHECK CLOUDINARY CONFIGURATION',
        });
    }
};

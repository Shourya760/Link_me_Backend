import mongoose from 'mongoose';
import { getProfileByUserId, getProfileByUsername, updateProfileByUserId } from '../services/profile.services.js';
import { getUserByEmail, updateUserById } from '../services/user.services.js';

const editableFields = [
    'username', 'name', 'email', 'title', 'bio', 'avatar', 'socials',
    'customLinks', 'photos', 'interests', 'achievements', 'theme', 'isPublic',
];

const serializeProfile = (profile) => profile?.toJSON ? profile.toJSON() : profile;

// GET AUTHENTICATED USER PROFILE
export const get_my_profile = async (req, res) => {
    try {
        const userId = req.curr_user?.id;

        if (!userId || !mongoose.isValidObjectId(userId)) {
            return res.status(400).json({
                success: false,
                message: 'INVALID USER ID'
            });
        }

        const profile = await getProfileByUserId(userId);
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'PROFILE NOT FOUND'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'PROFILE FETCHED SUCCESSFULLY',
            profile: serializeProfile(profile),
        });
    } catch (error) {
        console.error('Get profile error:', error);
        return res.status(500).json({
            success: false,
            message: 'ERROR WHILE FETCHING PROFILE'
        });
    }
};

// UPDATE AUTHENTICATED USER PROFILE
export const update_my_profile = async (req, res) => {
    try {
        const userId = req.curr_user?.id;

        if (!userId || !mongoose.isValidObjectId(userId)) {
            return res.status(400).json({
                success: false,
                message: 'INVALID USER ID'
            });
        }

        // Keep only profile fields that the client is allowed to edit
        const profileData = Object.fromEntries(
            Object.entries(req.body).filter(([field]) => editableFields.includes(field))
        );

        if (profileData.username) {
            profileData.username = String(profileData.username).trim().toLowerCase();
            if (['login', 'register', 'settings', 'portfolio', 'preview', 'p', 'api', 'auth'].includes(profileData.username)) {
                return res.status(400).json({
                    success: false,
                    message: 'USERNAME IS NOT AVAILABLE',
                });
            }
        }
        if (profileData.email) {
            profileData.email = String(profileData.email).trim().toLowerCase();
            if (!/^\S+@\S+\.\S+$/.test(profileData.email)) {
                return res.status(400).json({ success: false, message: 'INVALID EMAIL ADDRESS' });
            }
            const existingUser = await getUserByEmail(profileData.email);
            if (existingUser && existingUser._id.toString() !== userId.toString()) {
                return res.status(409).json({ success: false, message: 'EMAIL IS ALREADY IN USE' });
            }
        }

        if (Object.keys(profileData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'NO PROFILE FIELDS PROVIDED'
            });
        }

        const profile = await updateProfileByUserId(userId, profileData);

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'PROFILE NOT FOUND'
            });
        }

        if (profileData.email) {
            await updateUserById(userId, { $set: { email: profileData.email } });
        }

        return res.status(200).json({
            success: true,
            message: 'PROFILE UPDATED SUCCESSFULLY',
            profile: serializeProfile(profile),
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'USERNAME IS ALREADY TAKEN'
            });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        console.error('Update profile error:', error);
        return res.status(500).json({
            success: false,
            message: 'ERROR WHILE UPDATING PROFILE'
        });
    }
};

// GET PUBLIC PROFILE BY USERNAME
export const get_public_profile = async (req, res) => {
    try {
        const username = String(req.params.username || '').trim().toLowerCase();
        if (!username) {
            return res.status(400).json({
                success: false,
                message: 'USERNAME IS REQUIRED'
            });
        }

        const profile = await getProfileByUsername(username, { publicOnly: true });
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'PUBLIC PROFILE NOT FOUND'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'PUBLIC PROFILE FETCHED SUCCESSFULLY',
            profile: serializeProfile(profile),
        });
    } catch (error) {
        console.error('Get public profile error:', error);
        return res.status(500).json({
            success: false,
            message: 'ERROR WHILE FETCHING PUBLIC PROFILE'
        });
    }
};

import Profile from '../schema/profileSchema.js';

export const getProfileByUserId = async (userId) => Profile.findOne({ userId });

export const getProfileByUsername = async (username, { publicOnly = false } = {}) => {
    const query = { username };
    if (publicOnly) query.isPublic = true;
    return Profile.findOne(query);
};

export const createProfile = async (data) => Profile.create(data);

export const updateProfileByUserId = async (userId, data) => Profile.findOneAndUpdate(
    { userId },
    { $set: data },
    { new: true, runValidators: true }
);

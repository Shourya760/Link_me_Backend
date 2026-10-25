import User from '../Schema/userSchema.js';

export const getUserByEmail = async (email, { includePassword = false } = {}) => {
    const query = User.findOne({ email });
    return includePassword ? query.select('+passwordHash') : query;
};

export const createUser = async (data) => User.create(data);
export const deleteUserById = async (userId) => User.deleteOne({ _id: userId });
export const updateUserById = async (userId, data) => User.findByIdAndUpdate(userId, data, { new: true, runValidators: true });

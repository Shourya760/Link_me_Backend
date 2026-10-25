import jwt from 'jsonwebtoken';

export const createToken = (userId) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET IS NOT CONFIGURED');
    }

    return jwt.sign(
        { sub: userId.toString() },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

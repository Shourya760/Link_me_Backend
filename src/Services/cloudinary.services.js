import cloudinary from '../../config/cloudinary.js';

export const uploadToCloudinary = async (fileBuffer, folder = 'general') => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(
                { folder },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            )
            .end(fileBuffer);
    });
};

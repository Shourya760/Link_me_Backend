import multer from 'multer';

const imageUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadSingleImage = imageUpload.single('image');

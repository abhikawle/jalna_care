import { v2 as cloudinary } from 'cloudinary';

const connectCloudinary = async () => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME || process.env.CLOUDINARY_URL?.match(/@([^/]+)/)?.[1];
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET_KEY;

    if (!cloudName || !apiKey || !apiSecret || cloudName === 'your_cloud_name' || cloudName === 'your_cloud_name_here') {
        console.warn(
            'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend/.env to enable image uploads.'
        );
        return false;
    }

    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
    });

    return true;
};

export default connectCloudinary;
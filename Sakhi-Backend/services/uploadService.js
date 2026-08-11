import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Configure Cloudinary if environment variables are provided
const isCloudinaryConfigured = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true
    });
}

/**
 * Uploads file buffer or disk file to Cloudinary if configured, or keeps local storage link
 * @param {Object} file - Express Multer file object
 * @param {Object} req - Express request object for protocol/host resolution
 * @returns {Promise<string>} Image URL
 */
export const uploadImageToStorage = async (file, req) => {
    if (!file) {
        throw new Error('No image file provided.');
    }

    if (isCloudinaryConfigured) {
        try {
            // Upload to Cloudinary via buffer stream or file path
            if (file.path) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'sakhi_community_posts',
                    resource_type: 'image'
                });
                // Remove local temporary file after Cloudinary upload completes
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
                return result.secure_url;
            } else if (file.buffer) {
                return new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: 'sakhi_community_posts', resource_type: 'image' },
                        (error, result) => {
                            if (error) return reject(error);
                            resolve(result.secure_url);
                        }
                    );
                    uploadStream.end(file.buffer);
                });
            }
        } catch (error) {
            console.error('[Upload Service] Cloudinary upload error:', error.message);
            // Fallback to local storage if Cloudinary fails
        }
    }

    // Local storage fallback
    const relativePath = `/uploads/community/${file.filename}`;
    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost:5000';
    return `${protocol}://${host}${relativePath}`;
};

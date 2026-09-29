import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';
import { unlink } from 'node:fs/promises';

const configured = Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
if (configured) cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET, secure: true });

export const publicImageUrl = (filename, env = process.env) => {
    const origin = env.PUBLIC_API_ORIGIN || `http://localhost:${env.PORT || 5000}`;
    return `${new URL(origin).origin}/uploads/community/${encodeURIComponent(filename)}`;
};
export const uploadImageToStorage = async file => {
    if (!file?.path) throw new Error('No validated image provided.');
    if (!configured) return publicImageUrl(file.filename);
    try {
        const result = await cloudinary.uploader.upload(file.path, { folder: 'sakhi_community_posts', resource_type: 'image', timeout: 15000 });
        return result.secure_url;
    } finally {
        // Remote storage failure is reported; no silent, potentially ephemeral local fallback.
        await unlink(file.path).catch(() => {});
    }
};

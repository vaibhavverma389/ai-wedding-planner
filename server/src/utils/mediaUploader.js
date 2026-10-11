import { cloudinary } from '../config/cloudinary.js';
import { env } from '../config/environment.js';
import { logger } from './logger.js';

/**
 * Uploads a file buffer to Cloudinary or falls back to data URI in test environment
 * @param {Buffer} fileBuffer
 * @param {string} folder
 * @param {string} mimetype
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export const uploadBufferToCloudinary = async (fileBuffer, folder = 'shaadisaathi/listings', mimetype = 'image/jpeg') => {
  // If running in test or if dev credentials are placeholder fallback, return mock URL
  if (env.NODE_ENV === 'test' || env.CLOUDINARY_API_KEY === '123456789012345') {
    const mockId = `mock_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    return {
      url: `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/image/upload/v1/${folder}/${mockId}.webp`,
      publicId: `${folder}/${mockId}`
    };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: mimetype.startsWith('image/') ? 'image' : 'raw'
      },
      (error, result) => {
        if (error) {
          logger.error(`Cloudinary upload failed: ${error.message}`);
          return reject(error);
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete a media file by public ID
 */
export const deleteMediaFromCloudinary = async (publicId) => {
  if (env.NODE_ENV === 'test' || !publicId || publicId.startsWith('mock_')) {
    return true;
  }
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    logger.error(`Failed to delete Cloudinary media (${publicId}): ${error.message}`);
    return false;
  }
};

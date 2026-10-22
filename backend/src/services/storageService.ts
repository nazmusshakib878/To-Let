import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/env';

// Configure Cloudinary if credentials are provided in env
if (config.cloudinary.isConfigured) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
  });
}

export interface StoredImageResult {
  imageUrl: string;
  storageProvider: 'cloudinary' | 'local';
}

export class StorageService {
  /**
   * Processes an uploaded file: uploads to Cloudinary if configured,
   * or keeps in local uploads folder for local development.
   */
  async processUploadedFile(file: Express.Multer.File): Promise<StoredImageResult> {
    if (config.cloudinary.isConfigured) {
      try {
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: 'tolet-khulna',
          transformation: [
            { width: 1200, height: 800, crop: 'limit', quality: 'auto:good' },
          ],
        });

        // Delete temporary local file after successful Cloudinary upload
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }

        return {
          imageUrl: uploadResult.secure_url,
          storageProvider: 'cloudinary',
        };
      } catch (error) {
        console.error('Cloudinary upload error, falling back to local storage:', error);
        // Fall back to local URL
        return {
          imageUrl: `/uploads/${file.filename}`,
          storageProvider: 'local',
        };
      }
    }

    // Default local file storage
    return {
      imageUrl: `/uploads/${file.filename}`,
      storageProvider: 'local',
    };
  }

  /**
   * Removes an image from local disk or Cloudinary when listing is deleted.
   */
  async deleteImage(imageUrl: string | null | undefined): Promise<void> {
    if (!imageUrl) return;

    try {
      if (imageUrl.includes('res.cloudinary.com')) {
        // Extract public_id from Cloudinary URL
        const parts = imageUrl.split('/');
        const fileWithExt = parts.slice(-2).join('/'); // folder/filename.ext
        const publicId = fileWithExt.replace(/\.[^/.]+$/, '');
        if (config.cloudinary.isConfigured) {
          await cloudinary.uploader.destroy(publicId);
        }
      } else if (imageUrl.startsWith('/uploads/')) {
        const filename = path.basename(imageUrl);
        const filepath = path.join(config.uploadDir, filename);
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
      }
    } catch (err) {
      console.warn('Error deleting image file:', err);
    }
  }
}

export const storageService = new StorageService();

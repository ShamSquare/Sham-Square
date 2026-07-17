/**
 * Cloudinary Configuration
 * Image hosting and management setup
 */

import { v2 as cloudinary } from 'cloudinary';
import envConfig from './env.config';
import logger from '../utils/logger.util';

class CloudinaryConfig {
  private isConfigured: boolean = false;

  /**
   * Initialize Cloudinary configuration
   */
  initialize(): void {
    if (this.isConfigured) {
      logger.info('Cloudinary already configured');
      return;
    }

    try {
      cloudinary.config({
        cloud_name: envConfig.cloudinary.cloudName,
        api_key: envConfig.cloudinary.apiKey,
        api_secret: envConfig.cloudinary.apiSecret,
        secure: true,
      });

      this.isConfigured = true;
      logger.info('Cloudinary configured successfully');
    } catch (error) {
      logger.error('Cloudinary configuration error', error);
      throw error;
    }
  }

  /**
   * Get Cloudinary instance
   */
  getInstance() {
    if (!this.isConfigured) {
      throw new Error('Cloudinary not configured. Call initialize() first.');
    }
    return cloudinary;
  }

  /**
   * Check if Cloudinary is configured
   */
  isInitialized(): boolean {
    return this.isConfigured;
  }
}

export default new CloudinaryConfig();

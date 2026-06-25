/**
 * Firebase Configuration
 * Firebase Admin SDK setup for push notifications
 */

import * as admin from 'firebase-admin';
import { Message, MulticastMessage, Messaging, getMessaging } from 'firebase-admin/messaging';
import envConfig from './env.config.ts';
import logger from '../utils/logger.util.ts';

interface IFirebaseCredentials {
  type: string;
  project_id: string;
  private_key_id?: string;
  private_key: string;
  client_email: string;
  client_id?: string;
  auth_uri?: string;
  token_uri?: string;
  auth_provider_x509_cert_url?: string;
  client_x509_cert_url?: string;
}

class FirebaseConfig {
  private app: admin.App | null = null;
  private messaging: Messaging | null = null;
  private isInitialized: boolean = false;

  /**
   * Initialize Firebase Admin SDK
   */
  initialize(): void {
    if (this.isInitialized && this.app) {
      logger.info('Firebase already initialized');
      return;
    }

    try {
      const credentials: IFirebaseCredentials = {
        type: 'service_account',
        project_id: envConfig.firebase.projectId,
        private_key: envConfig.firebase.privateKey,
        client_email: envConfig.firebase.clientEmail,
      };

      this.app = admin.initializeApp({
        credential: admin.cert(credentials as any),
        projectId: envConfig.firebase.projectId,
      });

      this.messaging = getMessaging(this.app);
      this.isInitialized = true;

      logger.info('Firebase Admin SDK initialized successfully');
    } catch (error) {
      logger.error('Firebase initialization error', error);
      throw error;
    }
  }

  /**
   * Get Firebase Admin App instance
   */
  getApp(): admin.App {
    if (!this.app) {
      throw new Error('Firebase not initialized. Call initialize() first.');
    }
    return this.app;
  }

  /**
   * Get Firebase Messaging instance
   */
  getMessaging(): Messaging {
    if (!this.messaging) {
      throw new Error('Firebase Messaging not initialized. Call initialize() first.');
    }
    return this.messaging;
  }

  /**
   * Check if Firebase is initialized
   */
  isInitializedStatus(): boolean {
    return this.isInitialized;
  }
}

export default new FirebaseConfig();

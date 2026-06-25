/**
 * Firebase Service
 * Handle Firebase Cloud Messaging for push notifications
 */

import admin from 'firebase-admin';
import { Message, MulticastMessage, Messaging } from 'firebase-admin/messaging';
import firebaseConfig from '../config/firebase.config.ts';
import logger from '../utils/logger.util.ts';
import { MessagingOptions } from 'child_process';

export interface IPushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface IMulticastNotificationResult {
  successCount: number;
  failureCount: number;
  failedTokens: string[];
}

export interface ISendResult {
  messageId: string;
  success: boolean;
}

class FirebaseService {
  /**
   * Ensure Firebase is initialized
   */
  private ensureInitialized(): void {
    if (!firebaseConfig.isInitializedStatus()) {
      firebaseConfig.initialize();
    }
  }

  /**
   * Send push notification to single device
   */
  async sendToDevice(fcmToken: string, payload: IPushNotificationPayload): Promise<ISendResult> {
    try {
      this.ensureInitialized();
      const messaging = firebaseConfig.getMessaging();

      const message: Message = {
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data || {},
        token: fcmToken,
      };

      const messageId = await messaging.send(message);

      logger.info(`Push notification sent to device: ${fcmToken}`);

      return {
        messageId,
        success: true,
      };
    } catch (error) {
      logger.error(`Failed to send notification to device: ${fcmToken}`, error);
      throw new Error(
        `Failed to send notification: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Send push notification to multiple devices
   */
  async sendToMultipleDevices(
    fcmTokens: string[],
    payload: IPushNotificationPayload
  ): Promise<IMulticastNotificationResult> {
    try {
      this.ensureInitialized();
      const messaging = firebaseConfig.getMessaging();

      if (fcmTokens.length === 0) {
        logger.warn('No FCM tokens provided for multicast notification');
        return {
          successCount: 0,
          failureCount: 0,
          failedTokens: [],
        };
      }

      const message: MulticastMessage = {
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data || {},
        tokens: fcmTokens,
      };

const response = await messaging.sendEachForMulticast(message);

      const failedTokens: string[] = [];
      response.responses.forEach((resp: any, idx: any) => {
        if (!resp.success) {
          failedTokens.push(fcmTokens[idx]);
        }
      });

      logger.info(
        `Multicast notification sent. Success: ${response.successCount}, Failed: ${response.failureCount}`
      );

      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
        failedTokens,
      };
    } catch (error) {
      logger.error('Multicast notification error', error);
      throw new Error(
        `Failed to send multicast notification: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Send notification to a topic
   */
  async sendToTopic(topic: string, payload: IPushNotificationPayload): Promise<ISendResult> {
    try {
      this.ensureInitialized();
      const messaging = firebaseConfig.getMessaging();

      const message: Message = {
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data || {},
        topic,
      };

      const messageId = await messaging.send(message);

      logger.info(`Push notification sent to topic: ${topic}`);

      return {
        messageId,
        success: true,
      };
    } catch (error) {
      logger.error(`Failed to send notification to topic: ${topic}`, error);
      throw new Error(
        `Failed to send topic notification: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Subscribe token to topic
   */
  async subscribeToTopic(fcmTokens: string[], topic: string): Promise<{ successCount: number }> {
    try {
      this.ensureInitialized();
      const messaging = firebaseConfig.getMessaging();

      const response = await messaging.subscribeToTopic(fcmTokens, topic);

      logger.info(`Subscribed ${response.successCount} tokens to topic: ${topic}`);

      return {
        successCount: response.successCount,
      };
    } catch (error) {
      logger.error(`Failed to subscribe to topic: ${topic}`, error);
      throw new Error(
        `Failed to subscribe to topic: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Unsubscribe token from topic
   */
  async unsubscribeFromTopic(fcmTokens: string[], topic: string): Promise<{ successCount: number }> {
    try {
      this.ensureInitialized();
      const messaging = firebaseConfig.getMessaging();

      const response = await messaging.unsubscribeFromTopic(fcmTokens, topic);

      logger.info(`Unsubscribed ${response.successCount} tokens from topic: ${topic}`);

      return {
        successCount: response.successCount,
      };
    } catch (error) {
      logger.error(`Failed to unsubscribe from topic: ${topic}`, error);
      throw new Error(
        `Failed to unsubscribe from topic: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Send notification with custom options
   */
  async sendWithOptions(
    fcmToken: string,
    payload: IPushNotificationPayload,
    options?: MessagingOptions
  ): Promise<ISendResult> {
    try {
      this.ensureInitialized();
      const messaging = firebaseConfig.getMessaging();

      const message: Message = {
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data || {},
        token: fcmToken,
        webpush: {
          headers: {
            TTL: '3600',
          },
          data: payload.data,
          notification: {
            title: payload.title,
            body: payload.body,
            icon: 'https://example.com/icon.png',
          },
          ...options,
        },
      };

      const messageId = await messaging.send(message);

      logger.info(`Custom push notification sent to device: ${fcmToken}`);

      return {
        messageId,
        success: true,
      };
    } catch (error) {
      logger.error(`Failed to send custom notification`, error);
      throw new Error(
        `Failed to send custom notification: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

export default new FirebaseService();

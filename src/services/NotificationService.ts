import { BaseService } from './BaseService';
import { notificationRepository, userDeviceRepository } from '../database/repositories/index';
import type { INotification } from '../database/models/index';
import {
  NotificationType,
} from '../database/enums/index';
import FirebaseService from './FirebaseService';
import logger from '../utils/logger.util';

export interface ICreateNotificationPayload {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  metadata?: Record<string, any>;
}

export interface ISendNotificationPayload extends ICreateNotificationPayload {
  sendPush?: boolean;
  sendInApp?: boolean;
}

export interface INotificationResult {
  notificationId?: string;
  success: boolean;
  message: string;
  pushNotificationResult?: any;
}

export class NotificationService extends BaseService<INotification> {
  constructor() {
    super(notificationRepository);
  }

  async createAndSendNotification(
    payload: ISendNotificationPayload
  ): Promise<INotificationResult> {
    const { userId, title, message, type, metadata, sendPush = true, sendInApp = true } = payload;

    try {
      let notificationId: string | undefined;

      if (sendInApp) {
        const notification = await notificationRepository.create({
          userId,
          title,
          body: message,
          type,
          data: metadata || {},
          isRead: false,
        });
        notificationId = (notification as any).id;
        logger.info(`Notification saved to database: ${notificationId}`);
      }

      if (sendPush) {
        await this.sendPushNotification(userId, title, message, type, metadata);
      }

      return {
        notificationId,
        success: true,
        message: 'Notification sent successfully',
      };
    } catch (error) {
      logger.error('Error creating and sending notification', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async sendPushNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
    metadata?: Record<string, any>
  ): Promise<any> {
    try {
      const userDevices = await userDeviceRepository.find({
        userId,
        isActive: true,
      });

      if (userDevices.length === 0) {
        logger.warn(`No active devices found for user: ${userId}`);
        return {
          success: false,
          message: 'No active devices found',
        };
      }

      const fcmTokens = userDevices.map((device) => device.fcmToken);

      const result = await FirebaseService.sendToMultipleDevices(fcmTokens, {
        title,
        body: message,
        data: {
          type: type.toString(),
          ...metadata,
        },
      });

      logger.info(
        `Push notifications sent. Success: ${result.successCount}, Failed: ${result.failureCount}`
      );

      if (result.failedTokens.length > 0) {
        await this.handleFailedTokens(result.failedTokens);
      }

      return {
        success: result.failureCount === 0,
        successCount: result.successCount,
        failureCount: result.failureCount,
      };
    } catch (error) {
      logger.error('Error sending push notification', error);
      throw error;
    }
  }

  private async handleFailedTokens(tokens: string[]): Promise<void> {
    try {
      for (const token of tokens) {
        await userDeviceRepository.updateOne({ fcmToken: token }, { isActive: false });
      }
      logger.info(`Deactivated ${tokens.length} failed FCM tokens`);
    } catch (error) {
      logger.error('Error handling failed tokens', error);
    }
  }

  async sendOrderStatusNotification(
    userId: string,
    orderNumber: string,
    orderStatus: string,
    orderId: string
  ): Promise<INotificationResult> {
    const statusNotificationMap: Record<string, { title: string; message: string; type: NotificationType }> = {
      PENDING: {
        title: 'Order Created',
        message: `Your order #${orderNumber} has been created successfully.`,
        type: NotificationType.ORDER,
      },
      CONFIRMED: {
        title: 'Order Confirmed',
        message: `Your order #${orderNumber} has been confirmed.`,
        type: NotificationType.ORDER,
      },
      PROCESSING: {
        title: 'Order Processing',
        message: `Your order #${orderNumber} is being prepared.`,
        type: NotificationType.ORDER,
      },
      SHIPPED: {
        title: 'Order Shipped',
        message: `Your order #${orderNumber} has been shipped.`,
        type: NotificationType.DELIVERY,
      },
      OUT_FOR_DELIVERY: {
        title: 'Out for Delivery',
        message: `Your order #${orderNumber} is out for delivery today.`,
        type: NotificationType.DELIVERY,
      },
      DELIVERED: {
        title: 'Order Delivered',
        message: `Your order #${orderNumber} has been delivered successfully.`,
        type: NotificationType.DELIVERY,
      },
      CANCELLED: {
        title: 'Order Cancelled',
        message: `Your order #${orderNumber} has been cancelled.`,
        type: NotificationType.ORDER,
      },
    };

    const notificationData = statusNotificationMap[orderStatus] || {
      title: 'Order Update',
      message: `Your order #${orderNumber} status has been updated.`,
      type: NotificationType.ORDER,
    };

    return this.createAndSendNotification({
      userId,
      ...notificationData,
      metadata: {
        orderId: orderId.toString(),
        orderNumber,
        orderStatus,
      },
    });
  }

  async sendPromotionalNotification(
    userIds: string[],
    title: string,
    message: string,
    metadata?: Record<string, any>
  ): Promise<any> {
    try {
      const results = await Promise.allSettled(
        userIds.map((userId) =>
          this.createAndSendNotification({
            userId,
            title,
            message,
            type: NotificationType.PROMOTION,
            metadata,
            sendPush: true,
            sendInApp: true,
          })
        )
      );

      const successful = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      logger.info(`Promotional notifications sent. Success: ${successful}, Failed: ${failed}`);

      return {
        total: userIds.length,
        successful,
        failed,
      };
    } catch (error) {
      logger.error('Error sending promotional notifications', error);
      throw error;
    }
  }

  async getUserNotifications(
    userId: string,
    limit: number = 20,
    skip: number = 0
  ): Promise<any> {
    try {
      const notifications = await notificationRepository.find(
        { userId },
        { limit, offset: skip, orderBy: 'createdAt', orderDir: 'desc' }
      );

      const total = await notificationRepository.count({ userId });
      const unreadCount = await notificationRepository.count({ userId, isRead: false });

      return {
        notifications,
        total,
        unreadCount,
        limit,
        skip,
      };
    } catch (error) {
      logger.error('Error fetching user notifications', error);
      throw error;
    }
  }

  async markAsRead(notificationId: string): Promise<any> {
    try {
      const notification = await notificationRepository.updateById(
        notificationId,
        { isRead: true }
      );

      logger.info(`Notification marked as read: ${notificationId}`);
      return notification;
    } catch (error) {
      logger.error('Error marking notification as read', error);
      throw error;
    }
  }

  async markAllAsRead(userId: string): Promise<any> {
    try {
      const notifications = await notificationRepository.find({ userId, isRead: false });
      for (const notification of notifications) {
        await notificationRepository.updateById(notification.id, { isRead: true });
      }

      logger.info(`Marked notifications as read for user: ${userId}`);
      return { success: true };
    } catch (error) {
      logger.error('Error marking all notifications as read', error);
      throw error;
    }
  }

  async deleteNotification(notificationId: string): Promise<any> {
    try {
      const result = await notificationRepository.deleteById(notificationId);
      logger.info(`Notification deleted: ${notificationId}`);
      return result;
    } catch (error) {
      logger.error('Error deleting notification', error);
      throw error;
    }
  }

  async clearOldNotifications(daysOld: number = 30): Promise<any> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const allNotifications = await notificationRepository.find();
      const oldNotifications = allNotifications.filter((n) => new Date(n.createdAt) < cutoffDate);
      for (const notification of oldNotifications) {
        await notificationRepository.deleteById(notification.id);
      }

      logger.info(`Cleared old notifications`);
      return { success: true };
    } catch (error) {
      logger.error('Error clearing old notifications', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();

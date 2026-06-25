import { Types } from 'mongoose';
import { BaseService } from './BaseService.ts';
import { notificationRepository } from '../database/repositories/index.ts';
import type { INotification } from '../database/models/index.ts';
import { Notification } from '../database/models/index.ts';
import {
  NotificationType,
} from '../database/enums/index.ts';
import UserDeviceModel from '../database/models/UserDevice.ts';
import FirebaseService from './FirebaseService.ts';
import logger from '../utils/logger.util.ts';

export interface ICreateNotificationPayload {
  userId: Types.ObjectId;
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

  /**
   * Create and send notification
   * Saves to DB and sends push notification if requested
   */
  async createAndSendNotification(
    payload: ISendNotificationPayload
  ): Promise<INotificationResult> {
    const { userId, title, message, type, metadata, sendPush = true, sendInApp = true } = payload;

    try {
      let notificationId: string | undefined;

      // Save to database if sendInApp is true
      if (sendInApp) {
        const notification = await Notification.create({
          userId,
          title,
          message,
          type,
          metadata: metadata || {},
          isRead: false,
        });
        notificationId = notification._id.toString();
        logger.info(`Notification saved to database: ${notificationId}`);
      }

      // Send push notification if sendPush is true
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

  /**
   * Send push notification to user's devices
   */
  async sendPushNotification(
    userId: Types.ObjectId,
    title: string,
    message: string,
    type: NotificationType,
    metadata?: Record<string, any>
  ): Promise<any> {
    try {
      // Fetch all active FCM tokens for user
      const userDevices = await UserDeviceModel.find({
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

      // Send multicast notification
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

      // Remove failed tokens
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

  /**
   * Handle failed FCM tokens
   * Deactivate or delete invalid tokens
   */
  private async handleFailedTokens(tokens: string[]): Promise<void> {
    try {
      await UserDeviceModel.updateMany(
        { fcmToken: { $in: tokens } },
        { isActive: false }
      );
      logger.info(`Deactivated ${tokens.length} failed FCM tokens`);
    } catch (error) {
      logger.error('Error handling failed tokens', error);
    }
  }

  /**
   * Send notification on order status change
   */
  async sendOrderStatusNotification(
    userId: Types.ObjectId,
    orderNumber: string,
    orderStatus: string,
    orderId: Types.ObjectId
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

  /**
   * Send promotional notification
   */
  async sendPromotionalNotification(
    userIds: Types.ObjectId[],
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

  /**
   * Get user notifications
   */
  async getUserNotifications(
    userId: Types.ObjectId,
    limit: number = 20,
    skip: number = 0
  ): Promise<any> {
    try {
      const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);

      const total = await Notification.countDocuments({ userId });
      const unreadCount = await Notification.countDocuments({ userId, isRead: false });

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

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: Types.ObjectId): Promise<any> {
    try {
      const notification = await Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
      );

      logger.info(`Notification marked as read: ${notificationId}`);
      return notification;
    } catch (error) {
      logger.error('Error marking notification as read', error);
      throw error;
    }
  }

  /**
   * Mark all user notifications as read
   */
  async markAllAsRead(userId: Types.ObjectId): Promise<any> {
    try {
      const result = await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true }
      );

      logger.info(`Marked ${result.modifiedCount} notifications as read for user: ${userId}`);
      return result;
    } catch (error) {
      logger.error('Error marking all notifications as read', error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: Types.ObjectId): Promise<any> {
    try {
      const result = await Notification.findByIdAndDelete(notificationId);
      logger.info(`Notification deleted: ${notificationId}`);
      return result;
    } catch (error) {
      logger.error('Error deleting notification', error);
      throw error;
    }
  }

  /**
   * Clear old notifications (for cleanup)
   */
  async clearOldNotifications(daysOld: number = 30): Promise<any> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await Notification.deleteMany({
        createdAt: { $lt: cutoffDate },
      });

      logger.info(`Cleared ${result.deletedCount} old notifications`);
      return result;
    } catch (error) {
      logger.error('Error clearing old notifications', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();

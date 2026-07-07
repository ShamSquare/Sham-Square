import { NotificationChannel, NotificationDeliveryStatus, NotificationType } from '../enums/index.ts';

export interface INotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  channels: NotificationChannel[];
  deliveryStatus: NotificationDeliveryStatus;
  isRead: boolean;
  readAt?: Date | null;
  sentAt?: Date | null;
  expiresAt?: Date | null;
  failureReason?: string;
  createdAt: Date;
}

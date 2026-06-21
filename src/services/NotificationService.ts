import { BaseService } from './BaseService.js';
import { notificationRepository } from '../database/repositories/index.js';
import type { INotification } from '../database/models/index.js';

export class NotificationService extends BaseService<INotification> {
  constructor() {
    super(notificationRepository);
  }
}

export const notificationService = new NotificationService();

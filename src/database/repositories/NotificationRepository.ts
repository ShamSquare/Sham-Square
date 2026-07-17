import { BaseRepository } from './BaseRepository';
import type { INotification } from '../models/index';

export class NotificationRepository extends BaseRepository<INotification> {
  constructor() {
    super('notifications');
  }
}

export const notificationRepository = new NotificationRepository();

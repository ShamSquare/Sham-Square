import { BaseRepository } from './BaseRepository.js';
import { Notification, type INotification } from '../models/index.js';

export class NotificationRepository extends BaseRepository<INotification> {
  constructor() {
    super(Notification);
  }
}

export const notificationRepository = new NotificationRepository();

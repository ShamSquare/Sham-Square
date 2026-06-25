import { BaseRepository } from './BaseRepository.ts';
import { Notification, type INotification } from '../models/index.ts';

export class NotificationRepository extends BaseRepository<INotification> {
  constructor() {
    super(Notification);
  }
}

export const notificationRepository = new NotificationRepository();

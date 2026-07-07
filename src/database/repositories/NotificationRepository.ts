import { BaseRepository } from './BaseRepository.ts';
import type { INotification } from '../models/index.ts';

export class NotificationRepository extends BaseRepository<INotification> {
  constructor() {
    super('notifications');
  }
}

export const notificationRepository = new NotificationRepository();

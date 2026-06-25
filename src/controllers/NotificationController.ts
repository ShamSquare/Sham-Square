import { CrudController } from './CrudController.ts';
import { notificationService } from '../services/index.ts';
import type { INotification } from '../database/models/index.ts';

export class NotificationController extends CrudController<INotification> {
  constructor() {
    super(notificationService);
  }
}

export const notificationController = new NotificationController();

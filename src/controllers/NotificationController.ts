import { CrudController } from './CrudController.js';
import { notificationService } from '../services/index.js';
import type { INotification } from '../database/models/index.js';

export class NotificationController extends CrudController<INotification> {
  constructor() {
    super(notificationService);
  }
}

export const notificationController = new NotificationController();

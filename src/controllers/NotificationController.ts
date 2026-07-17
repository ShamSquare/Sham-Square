import { CrudController } from './CrudController';
import { notificationService } from '../services/index';
import type { INotification } from '../database/models/index';
import { realtimeService } from '../services/RealtimeService';

export class NotificationController extends CrudController<INotification> {
  constructor() {
    super(notificationService);
  }

  async create(req: any, res: any) {
    const created = await notificationService.create(req.body);

    if ((created as any).userId) {
      realtimeService.emitToUser(String((created as any).userId), 'notification:created', created);
    } else {
      realtimeService.emitPublic('notification:created', created);
    }

    return this.sendCreated(res, created);
  }
}

export const notificationController = new NotificationController();

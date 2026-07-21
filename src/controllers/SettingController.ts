import { CrudController } from './CrudController';
import { settingService } from '../services/index';
import type { ISetting } from '../database/models/index';
import { isValidUUID } from '../utils/uuid.util';

export class SettingController extends CrudController<ISetting> {
  constructor() {
    super(settingService);
  }

  async update(req: any, res: any) {
    // Validate UUID format
    if (!isValidUUID(req.params.id)) {
      return this.sendError(res, 'Invalid setting ID', 400);
    }

    const updated = await settingService.updateById(req.params.id, req.body);
    if (!updated) {
      return this.sendError(res, 'Setting not found', 404);
    }
    return this.sendSuccess(res, updated);
  }
}

export const settingController = new SettingController();

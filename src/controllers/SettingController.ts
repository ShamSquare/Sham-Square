import { CrudController } from './CrudController.ts';
import { settingService } from '../services/index.ts';
import type { ISetting } from '../database/models/index.ts';

export class SettingController extends CrudController<ISetting> {
  constructor() {
    super(settingService);
  }
}

export const settingController = new SettingController();

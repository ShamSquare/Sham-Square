import { CrudController } from './CrudController.js';
import { settingService } from '../services/index.js';
import type { ISetting } from '../database/models/index.js';

export class SettingController extends CrudController<ISetting> {
  constructor() {
    super(settingService);
  }
}

export const settingController = new SettingController();

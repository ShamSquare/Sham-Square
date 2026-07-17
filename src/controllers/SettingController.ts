import { CrudController } from './CrudController';
import { settingService } from '../services/index';
import type { ISetting } from '../database/models/index';

export class SettingController extends CrudController<ISetting> {
  constructor() {
    super(settingService);
  }
}

export const settingController = new SettingController();

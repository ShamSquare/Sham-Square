import { BaseService } from './BaseService';
import { settingRepository } from '../database/repositories/index';
import type { ISetting } from '../database/models/index';

export class SettingService extends BaseService<ISetting> {
  constructor() {
    super(settingRepository);
  }
}

export const settingService = new SettingService();

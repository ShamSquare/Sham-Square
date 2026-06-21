import { BaseService } from './BaseService.js';
import { settingRepository } from '../database/repositories/index.js';
import type { ISetting } from '../database/models/index.js';

export class SettingService extends BaseService<ISetting> {
  constructor() {
    super(settingRepository);
  }
}

export const settingService = new SettingService();

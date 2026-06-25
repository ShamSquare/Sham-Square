import { BaseService } from './BaseService.ts';
import { settingRepository } from '../database/repositories/index.ts';
import type { ISetting } from '../database/models/index.ts';

export class SettingService extends BaseService<ISetting> {
  constructor() {
    super(settingRepository);
  }
}

export const settingService = new SettingService();

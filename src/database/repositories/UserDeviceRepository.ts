import { BaseRepository } from './BaseRepository';
import type { IUserDevice } from '../models/index';

export class UserDeviceRepository extends BaseRepository<IUserDevice> {
  constructor() {
    super('user_devices');
  }
}

export const userDeviceRepository = new UserDeviceRepository();

import { BaseService } from './BaseService';
import { userRepository } from '../database/repositories/index';
import type { IUser } from '../database/models/index';

export class UserService extends BaseService<IUser> {
  constructor() {
    super(userRepository);
  }
}

export const userService = new UserService();

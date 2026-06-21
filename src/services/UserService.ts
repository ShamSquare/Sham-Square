import { BaseService } from './BaseService.js';
import { userRepository } from '../database/repositories/index.js';
import type { IUser } from '../database/models/index.js';

export class UserService extends BaseService<IUser> {
  constructor() {
    super(userRepository);
  }
}

export const userService = new UserService();

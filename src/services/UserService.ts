import { BaseService } from './BaseService.ts';
import { userRepository } from '../database/repositories/index.ts';
import type { IUser } from '../database/models/index.ts';

export class UserService extends BaseService<IUser> {
  constructor() {
    super(userRepository);
  }
}

export const userService = new UserService();

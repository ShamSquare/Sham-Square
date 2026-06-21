import { CrudController } from './CrudController.js';
import { userService } from '../services/index.js';
import type { IUser } from '../database/models/index.js';

export class UserController extends CrudController<IUser> {
  constructor() {
    super(userService);
  }
}

export const userController = new UserController();

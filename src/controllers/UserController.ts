import { CrudController } from './CrudController.ts';
import { userService } from '../services/index.ts';
import type { IUser } from '../database/models/index.ts';

export class UserController extends CrudController<IUser> {
  constructor() {
    super(userService);
  }
}

export const userController = new UserController();

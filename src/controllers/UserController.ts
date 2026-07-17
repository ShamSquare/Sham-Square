import { CrudController } from './CrudController';
import { userService } from '../services/index';
import type { IUser } from '../database/models/index';
import { AppError } from '../utils/app-error.util';

export class UserController extends CrudController<IUser> {
  constructor() {
    super(userService);
  }

  async me(req: any, res: any) {
    const userId = (req as any).user?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const user = await userService.getById(userId);
    if (!user) throw new AppError('User not found', 404);

    return this.sendSuccess(res, user);
  }
}

export const userController = new UserController();

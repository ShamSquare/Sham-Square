import { CrudController } from './CrudController';
import { userService } from '../services/index';
import type { IUser } from '../database/models/index';
import { AppError } from '../utils/app-error.util';
import { hashPassword } from '../utils/password.util';

export class UserController extends CrudController<IUser> {
  constructor() {
    super(userService);
  }

  async create(req: any, res: any) {
    const { password, ...userData } = req.body;

    if (!password) {
      throw new AppError('Password is required', 400);
    }

    if (password.length < 8) {
      throw new AppError('Password must be at least 8 characters', 400);
    }

    const passwordHash = hashPassword(password);
    const created = await userService.create({
      ...userData,
      passwordHash,
    });

    return this.sendCreated(res, created);
  }

  async update(req: any, res: any) {
    const { password, ...userData } = req.body;

    if (password) {
      if (password.length < 8) {
        throw new AppError('Password must be at least 8 characters', 400);
      }
      userData.passwordHash = hashPassword(password);
    }

    const updated = await userService.updateById(req.params.id, userData);
    if (!updated) {
      return this.sendError(res, 'Not found', 404);
    }
    return this.sendSuccess(res, updated);
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

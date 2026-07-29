import { CrudController } from './CrudController';
import { addressService } from '../services/index';
import type { IAddress } from '../database/models/index';
import { AppError } from '../utils/app-error.util';

type AuthReq = import('../middlewares/auth.middleware').AuthRequest;

export class AddressController extends CrudController<IAddress> {
  constructor() {
    super(addressService);
  }

  /**
   * GET /addresses — returns only the current user's addresses.
   */
  async list(req: AuthReq, res: any) {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const items = await addressService.find({ userId, isDeleted: false } as any);
    return this.sendSuccess(res, items);
  }

  /**
   * POST /addresses — creates an address scoped to the current user.
   * If isDefault is true, unsets any existing default first.
   */
  async create(req: AuthReq, res: any) {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const { isDefault, ...rest } = req.body;

    // If setting as default, unset other defaults for this user
    if (isDefault) {
      await addressService.updateOne({ userId, isDefault: true } as any, { isDefault: false } as any);
    }

    const created = await addressService.create({
      ...rest,
      userId,
      isDefault: isDefault || false,
    } as any);

    return this.sendCreated(res, created);
  }

  /**
   * PUT /addresses/:id — updates an address, verifying ownership.
   */
  async update(req: AuthReq, res: any) {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const existing = await addressService.getById(req.params.id);
    if (!existing || existing.userId !== userId) {
      throw new AppError('Address not found', 404);
    }

    const { isDefault, ...rest } = req.body;

    // If setting as default, unset other defaults for this user
    if (isDefault) {
      await addressService.updateOne({ userId, isDefault: true } as any, { isDefault: false } as any);
    }

    const updated = await addressService.updateById(req.params.id, {
      ...rest,
      isDefault: isDefault ?? existing.isDefault,
    } as any);

    if (!updated) throw new AppError('Address not found', 404);
    return this.sendSuccess(res, updated);
  }

  /**
   * DELETE /addresses/:id — soft-deletes an address, verifying ownership.
   */
  async remove(req: AuthReq, res: any) {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const existing = await addressService.getById(req.params.id);
    if (!existing || existing.userId !== userId) {
      throw new AppError('Address not found', 404);
    }

    await addressService.deleteById(req.params.id);
    return this.sendNoContent(res);
  }

  /**
   * GET /addresses/:id — returns address only if owned by the current user.
   */
  async getById(req: AuthReq, res: any) {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const item = await addressService.getById(req.params.id);
    if (!item || item.userId !== userId) {
      throw new AppError('Address not found', 404);
    }

    return this.sendSuccess(res, item);
  }
}

export const addressController = new AddressController();

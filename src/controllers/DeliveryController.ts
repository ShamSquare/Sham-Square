import { CrudController } from './CrudController';
import { webAuthService } from '../services';
import type { IWebUser } from '../database/models';
import { AppError } from '../utils/app-error.util';
import { hashPassword } from '../utils/password.util';
import { isValidUUID } from '../utils/uuid.util';
import { RoleName } from '../database/enums/index';

export class DeliveryController extends CrudController<IWebUser> {
  constructor() {
    super(webAuthService);
  }

  async list(req: any, res: any) {
    const { search, page = 1, limit = 10 } = req.query;
    const filters: Record<string, any> = { role: RoleName.DELIVERY, isDeleted: false };
    if (search) {
      const s = search.toLowerCase();
      filters.$or = [
        { firstName: { $ilike: `%${s}%` } },
        { lastName: { $ilike: `%${s}%` } },
        { email: { $ilike: `%${s}%` } },
        { phone: { $ilike: `%${s}%` } },
      ];
    }
    const items = await this.service.find(filters, {
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit),
      orderBy: 'createdAt',
      orderDir: 'desc',
    });
    const total = await this.service.count(filters);
    return this.sendSuccess(res, {
      data: items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  }

  async create(req: any, res: any) {
    const { firstName, lastName, email, phone, password, status, avatar } = req.body;

    if (!firstName || !firstName.trim()) {
      throw new AppError('First name is required', 400, 'VALIDATION_ERROR');
    }
    if (!email || !email.trim()) {
      throw new AppError('Email is required', 400, 'VALIDATION_ERROR');
    }
    if (!phone || !phone.trim()) {
      throw new AppError('Phone is required', 400, 'VALIDATION_ERROR');
    }
    if (!password || password.length < 8) {
      throw new AppError('Password must be at least 8 characters', 400, 'VALIDATION_ERROR');
    }

    const existingEmail = await webAuthService.findOne({ email, isDeleted: false });
    if (existingEmail) {
      throw new AppError('Email already in use', 409, 'CONFLICT');
    }

    const existingPhone = await webAuthService.findOne({ phone, isDeleted: false });
    if (existingPhone) {
      throw new AppError('Phone number already in use', 409, 'CONFLICT');
    }

    const passwordHash = hashPassword(password);
    const userData: Partial<IWebUser> = {
      email: email.trim(),
      passwordHash,
      firstName: firstName.trim(),
      lastName: (lastName || '').trim(),
      phone: phone.trim(),
      avatar: avatar || null,
      role: RoleName.DELIVERY,
      roleType: 'delivery',
      status: status || 'ACTIVE',
      emailVerified: false,
      phoneVerified: false,
    };

    const user = await webAuthService.create(userData);
    return this.sendCreated(res, user);
  }

  async update(req: any, res: any) {
    if (!isValidUUID(req.params.id)) {
      return this.sendError(res, 'Invalid delivery user ID', 400);
    }
    const { firstName, lastName, email, phone, password, status, avatar } = req.body;
    const updateData: Record<string, any> = {};
    if (firstName !== undefined) updateData.firstName = firstName.trim();
    if (lastName !== undefined) updateData.lastName = lastName.trim();
    if (email !== undefined) updateData.email = email.trim();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (status !== undefined) updateData.status = status;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (password) {
      if (password.length < 8) {
        throw new AppError('Password must be at least 8 characters', 400, 'VALIDATION_ERROR');
      }
      updateData.passwordHash = hashPassword(password);
    }
    const updated = await this.service.updateById(req.params.id, updateData);
    if (!updated) {
      return this.sendError(res, 'Delivery user not found', 404);
    }
    return this.sendSuccess(res, updated);
  }

  async remove(req: any, res: any) {
    if (!isValidUUID(req.params.id)) {
      return this.sendError(res, 'Invalid delivery user ID', 400);
    }
    const item = await this.service.getById(req.params.id);
    if (!item) {
      return this.sendError(res, 'Delivery user not found', 404);
    }
    await this.service.deleteById(req.params.id);
    return this.sendNoContent(res);
  }

  async toggleStatus(req: any, res: any) {
    if (!isValidUUID(req.params.id)) {
      return this.sendError(res, 'Invalid delivery user ID', 400);
    }
    const user = await this.service.getById(req.params.id);
    if (!user) {
      return this.sendError(res, 'Delivery user not found', 404);
    }
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const updated = await this.service.updateById(req.params.id, { status: newStatus });
    if (!updated) {
      return this.sendError(res, 'Failed to update status', 500);
    }
    return this.sendSuccess(res, updated);
  }
}

export const deliveryController = new DeliveryController();
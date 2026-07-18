import { CrudController } from './CrudController';
import { roleService } from '../services/index';
import type { IRole } from '../database/models/index';
import { AppError } from '../utils/app-error.util';

// UUID v4 regex pattern
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class RoleController extends CrudController<IRole> {
  constructor() {
    super(roleService);
  }

  private validateId(id: string): void {
    if (!id) {
      throw new AppError('Role ID is required', 400, 'VALIDATION_ERROR');
    }
    if (id === 'undefined' || id === 'null') {
      throw new AppError('Invalid role ID: ID cannot be "undefined" or "null"', 400, 'VALIDATION_ERROR');
    }
    if (!UUID_REGEX.test(id)) {
      throw new AppError('Invalid role ID format: must be a valid UUID', 400, 'VALIDATION_ERROR');
    }
  }

  async list(req: any, res: any) {
    const items = await this.service.find({});
    return this.sendSuccess(res, items);
  }

  async getById(req: any, res: any) {
    this.validateId(req.params.id);
    const item = await this.service.getById(req.params.id);
    if (!item) {
      return this.sendError(res, 'Not found', 404);
    }
    return this.sendSuccess(res, item);
  }

  async update(req: any, res: any) {
    this.validateId(req.params.id);
    const updated = await this.service.updateById(req.params.id, req.body);
    if (!updated) {
      return this.sendError(res, 'Not found', 404);
    }
    return this.sendSuccess(res, updated);
  }

  async remove(req: any, res: any) {
    this.validateId(req.params.id);
    await this.service.deleteById(req.params.id);
    return this.sendNoContent(res);
  }
}

export const roleController = new RoleController();

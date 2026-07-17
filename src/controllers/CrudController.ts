import type { Request, Response } from 'express';
import { BaseController } from './BaseController';
import type { BaseService } from '../services/BaseService';

export class CrudController<T extends Record<string, any>> extends BaseController {
  constructor(protected readonly service: BaseService<T>) {
    super();
  }

  async list(req: Request, res: Response) {
    const items = await this.service.find({});
    return this.sendSuccess(res, items);
  }

  async getById(req: Request, res: Response) {
    const item = await this.service.getById(req.params.id);
    if (!item) {
      return this.sendError(res, 'Not found', 404);
    }
    return this.sendSuccess(res, item);
  }

  async create(req: Request, res: Response) {
    const created = await this.service.create(req.body);
    return this.sendCreated(res, created);
  }

  async update(req: Request, res: Response) {
    const updated = await this.service.updateById(
      req.params.id,
      req.body
    );
    if (!updated) {
      return this.sendError(res, 'Not found', 404);
    }
    return this.sendSuccess(res, updated);
  }

  async remove(req: Request, res: Response) {
    await this.service.deleteById(req.params.id);
    return this.sendNoContent(res);
  }
}

import type { Request, Response } from 'express';
import type { Document, UpdateQuery } from 'mongoose';
import { BaseController } from './BaseController.ts';
import type { BaseService } from '../services/BaseService.ts';

type CreatePayload<T extends Document> = Omit<T, keyof Document> & Record<string, unknown>;

export class CrudController<T extends Document> extends BaseController {
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
    const created = await this.service.create(req.body as CreatePayload<T>);
    return this.sendCreated(res, created);
  }

  async update(req: Request, res: Response) {
    const updated = await this.service.updateById(
      req.params.id,
      req.body as UpdateQuery<T>
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

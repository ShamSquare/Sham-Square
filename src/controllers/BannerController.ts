import { CrudController } from './CrudController';
import { bannerService } from '../services/index';
import type { IBanner } from '../database/models/index';
import { isValidUUID } from '../utils/uuid.util';

export class BannerController extends CrudController<IBanner> {
  constructor() {
    super(bannerService);
  }

  async update(req: any, res: any) {
    // Validate UUID format
    if (!isValidUUID(req.params.id)) {
      return this.sendError(res, 'Invalid banner ID', 400);
    }

    const updated = await bannerService.updateById(req.params.id, req.body);
    if (!updated) {
      return this.sendError(res, 'Banner not found', 404);
    }
    return this.sendSuccess(res, updated);
  }

  async remove(req: any, res: any) {
    // Validate UUID format
    if (!isValidUUID(req.params.id)) {
      return this.sendError(res, 'Invalid banner ID', 400);
    }

    await bannerService.deleteById(req.params.id);
    return this.sendNoContent(res);
  }
}

export const bannerController = new BannerController();

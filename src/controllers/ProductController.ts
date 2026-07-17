import { CrudController } from './CrudController';
import { productService } from '../services/index';
import type { IProduct } from '../database/models/index';
import { realtimeService } from '../services/RealtimeService';

export class ProductController extends CrudController<IProduct> {
  constructor() {
    super(productService);
  }

  async create(req: any, res: any) {
    const created = await productService.create(req.body);
    realtimeService.emitPublic('inventory:updated', { action: 'created', product: created });
    return this.sendCreated(res, created);
  }

  async update(req: any, res: any) {
    const updated = await productService.updateById(req.params.id, req.body);
    if (!updated) return this.sendError(res, 'Not found', 404);

    realtimeService.emitPublic('inventory:updated', { action: 'updated', product: updated });
    return this.sendSuccess(res, updated);
  }
}

export const productController = new ProductController();

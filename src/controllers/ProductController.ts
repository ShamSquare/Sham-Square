import { CrudController } from './CrudController.ts';
import { productService } from '../services/index.ts';
import type { IProduct } from '../database/models/index.ts';
import { realtimeService } from '../services/RealtimeService.ts';

export class ProductController extends CrudController<IProduct> {
  constructor() {
    super(productService);
  }

  async create(req: any, res: any) {
    const created = await productService.create(req.body);
    realtimeService.emitPublic('inventory:updated', { action: 'created', product: created });
    return res.status(201).json({ success: true, data: created });
  }

  async update(req: any, res: any) {
    const updated = await productService.updateById(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Not found' });

    realtimeService.emitPublic('inventory:updated', { action: 'updated', product: updated });
    return res.status(200).json({ success: true, data: updated });
  }
}

export const productController = new ProductController();

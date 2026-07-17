import { CrudController } from './CrudController';
import { productService } from '../services/index';
import type { IProduct } from '../database/models/index';
import { realtimeService } from '../services/RealtimeService';

export class ProductController extends CrudController<IProduct> {
  constructor() {
    super(productService);
  }

  async create(req: any, res: any) {
    const data = req.body || {};
    const cleanData = { ...data };
    
    // Clean UUID fields - convert empty strings to null
    const uuidFields = ['categoryId', 'subCategoryId', 'vendorId', 'brandId', 'createdBy', 'updatedBy'];
    uuidFields.forEach(field => {
      if (cleanData[field] === '' || cleanData[field] === undefined) {
        cleanData[field] = null;
      }
    });
    
    const created = await productService.create(cleanData);
    realtimeService.emitPublic('inventory:updated', { action: 'created', product: created });
    return this.sendCreated(res, created);
  }

  async update(req: any, res: any) {
    const data = req.body || {};
    const cleanData = { ...data };
    
    // Clean UUID fields - convert empty strings to null
    const uuidFields = ['categoryId', 'subCategoryId', 'vendorId', 'brandId', 'createdBy', 'updatedBy'];
    uuidFields.forEach(field => {
      if (cleanData[field] === '' || cleanData[field] === undefined) {
        cleanData[field] = null;
      }
    });
    
    const updated = await productService.updateById(req.params.id, cleanData);
    if (!updated) return this.sendError(res, 'Not found', 404);

    realtimeService.emitPublic('inventory:updated', { action: 'updated', product: updated });
    return this.sendSuccess(res, updated);
  }
}

export const productController = new ProductController();

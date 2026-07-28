import { CrudController } from './CrudController';
import { productReviewService, productService } from '../services/index';
import type { IProductReview } from '../database/models/index';

export class ProductReviewController extends CrudController<IProductReview> {
  constructor() {
    super(productReviewService);
  }

  async create(req: any, res: any) {
    try {
      const created = await super.create(req, res);
      
      // Update product rating after review is created
      if (created && (created as any).productId) {
        await productService.updateProductRating((created as any).productId);
      }
      
      return created;
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error?.message || 'فشل إنشاء التقييم',
        code: error?.code,
      });
    }
  }

  async update(req: any, res: any) {
    try {
      const updated = await super.update(req, res);
      
      // Update product rating after review is updated
      if (updated && (updated as any).productId) {
        await productService.updateProductRating((updated as any).productId);
      }
      
      return updated;
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error?.message || 'فشل تحديث التقييم',
        code: error?.code,
      });
    }
  }

  async remove(req: any, res: any) {
    try {
      // Get review before deletion to know which product to update
      const existing = await productReviewService.getById(req.params.id);
      const productId = existing?.productId;
      
      await super.remove(req, res);
      
      // Update product rating after review is deleted
      if (productId) {
        await productService.updateProductRating(productId);
      }
      
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error?.message || 'فشل حذف التقييم',
        code: error?.code,
      });
    }
  }
}

export const productReviewController = new ProductReviewController();

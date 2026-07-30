import { CrudController } from './CrudController';
import { productReviewService, productService } from '../services/index';
import { getAdminClient } from '../database/supabase';
import type { IProductReview } from '../database/models/index';
import { AppError } from '../utils/app-error.util';
import { isValidUUID } from '../utils/uuid.util';

function convertKeysFromDb(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === 'sub_category') {
      result.sub_category = value;
    } else {
      const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      result[camelKey] = value;
    }
  }
  return result;
}

export class ProductReviewController extends CrudController<IProductReview> {
  constructor() {
    super(productReviewService);
  }

  async list(req: any, res: any) {
    try {
      const client = getAdminClient();
      const {
        productId,
        userId,
        limit = '20',
        offset = '0',
        orderBy = 'created_at',
        orderDir = 'desc',
      } = req.query;

      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
      const offsetNum = Math.max(0, parseInt(offset as string, 10) || 0);

      let query = client.from('product_reviews').select('*', { count: 'exact' });

      const userRole = req.user?.role;
      if (userRole === 'departmentadmin') {
        const managedCategory = (req as any).user?.managedCategory;
        if (!managedCategory) {
          throw new AppError('Department Admin must have a managed category assigned', 403, 'NO_MANAGED_CATEGORY');
        }

        const { data: categoryProducts } = await client
          .from('products')
          .select('id')
          .eq('category', managedCategory)
          .eq('is_deleted', false as any);

        const categoryProductIds = categoryProducts?.map((p: any) => p.id) || [];
        if (categoryProductIds.length === 0) {
          return this.sendSuccess(res, []);
        }

        query = query.in('product_id', categoryProductIds);
      }

      if (productId) {
        query = query.eq('product_id', productId);
      }

      if (userId) {
        query = query.eq('user_id', userId);
      }

      query = query.eq('is_deleted', false as any);
      query = query.order(orderBy as string, { ascending: orderDir !== 'desc' });
      query = query.range(offsetNum, offsetNum + limitNum - 1);

      const { data: reviews, error, count } = await query;

      if (error) {
        throw error;
      }

      return this.sendSuccess(res, (reviews || []).map((r: any) => convertKeysFromDb(r)));
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error?.message || 'فشل جلب المراجعات',
        code: error?.code,
      });
    }
  }

  async adminList(req: any, res: any) {
    try {
      const client = getAdminClient();
      const {
        rating,
        status,
        productId,
        userId,
        search,
        orderBy = 'created_at',
        orderDir = 'desc',
        page = '1',
        limit = '20',
      } = req.query;

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
      const offset = (pageNum - 1) * limitNum;

      const userRole = req.user?.role;
      let managedCategory: string | undefined;
      let categoryProductIds: string[] = [];

      if (userRole === 'departmentadmin') {
        managedCategory = (req as any).user?.managedCategory;
        if (!managedCategory) {
          throw new AppError('Department Admin must have a managed category assigned', 403, 'NO_MANAGED_CATEGORY');
        }

        const { data: categoryProducts, error: productsError } = await client
          .from('products')
          .select('id')
          .eq('category', managedCategory)
          .eq('is_deleted', false as any);

        if (productsError) {
          throw new AppError('Failed to fetch category products', 500, 'PRODUCTS_ERROR');
        }

        categoryProductIds = categoryProducts?.map((p: any) => p.id) || [];

        if (categoryProductIds.length === 0) {
          return res.json({
            success: true,
            data: [],
            pagination: {
              page: pageNum,
              limit: limitNum,
              total: 0,
              totalPages: 1,
            },
          });
        }
      }

      let query = client
        .from('product_reviews')
        .select(`
          *,
          product:products!product_id(id, name, image, thumbnail, images),
          user:users!user_id(id, first_name, last_name, avatar, email)
        `, { count: 'exact' });

      if (rating) {
        const ratingNum = parseInt(rating, 10);
        if (ratingNum >= 1 && ratingNum <= 5) {
          query = query.eq('rating', ratingNum);
        }
      }

      if (status === 'approved') {
        query = query.eq('is_approved', true as any).eq('is_hidden', false as any);
      } else if (status === 'pending') {
        query = query.eq('is_approved', false as any).eq('is_hidden', false as any);
      } else if (status === 'rejected') {
        query = query.eq('is_hidden', true as any);
      }

      if (productId) {
        query = query.eq('product_id', productId);
      }

      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (userRole === 'departmentadmin' && categoryProductIds.length > 0) {
        query = query.in('product_id', categoryProductIds);
      }

      if (search && search.trim()) {
        const searchTerm = `%${search.trim()}%`;
        query = query.or(`title.ilike.${searchTerm},comment.ilike.${searchTerm}` as any);
      }

      query = query.eq('is_deleted', false as any);
      query = query.range(offset, offset + limitNum - 1);

      const { data: reviews, error, count } = await query;

      if (error) {
        return res.status(400).json({
          success: false,
          message: error?.message || 'فشل جلب المراجعات',
        });
      }

      let result = reviews || [];
      if (search && search.trim()) {
        const searchLower = search.trim().toLowerCase();
        result = result.filter((r: any) => {
          const productName = (r.product?.name || '').toLowerCase();
          const userName = `${r.user?.first_name || ''} ${r.user?.last_name || ''}`.toLowerCase();
          const title = (r.title || '').toLowerCase();
          const comment = (r.comment || '').toLowerCase();
          return (
            productName.includes(searchLower) ||
            userName.includes(searchLower) ||
            title.includes(searchLower) ||
            comment.includes(searchLower)
          );
        });
      }

      return res.json({
        success: true,
        data: result,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limitNum),
        },
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error?.message || 'فشل جلب المراجعات',
        code: error?.code,
      });
    }
  }

  async getById(req: any, res: any) {
    try {
      if (!isValidUUID(req.params.id)) {
        return this.sendError(res, 'Invalid review ID', 400);
      }

      const review = await productReviewService.getById(req.params.id);
      if (!review) {
        return this.sendError(res, 'Not found', 404);
      }

      const userRole = req.user?.role;
      if (userRole === 'departmentadmin') {
        const managedCategory = (req as any).user?.managedCategory;
        if (!managedCategory) {
          throw new AppError('Department Admin must have a managed category assigned', 403, 'NO_MANAGED_CATEGORY');
        }

        const client = getAdminClient();
        const { data: product } = await client
          .from('products')
          .select('category')
          .eq('id', review.productId)
          .single();

        if (!product || product.category !== managedCategory) {
          throw new AppError('Access denied. Review is not in your managed category.', 403, 'CATEGORY_MISMATCH');
        }
      }

      return this.sendSuccess(res, review);
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error?.message || 'فشل جلب المراجعة',
        code: error?.code,
      });
    }
  }

  async create(req: any, res: any) {
    try {
      const created = await productReviewService.create(req.body as any);
      if (created && created.productId) {
        await productService.updateProductRating(created.productId);
      }
      return this.sendCreated(res, created);
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
      const updated = await productReviewService.updateById(req.params.id, req.body as any);
      if (!updated) {
        return this.sendError(res, 'Not found', 404);
      }
      if (updated && updated.productId) {
        await productService.updateProductRating(updated.productId);
      }
      return this.sendSuccess(res, updated);
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
      if (!isValidUUID(req.params.id)) {
        return this.sendError(res, 'Invalid review ID', 400);
      }

      const existing = await productReviewService.getById(req.params.id);
      if (!existing) {
        return this.sendError(res, 'Not found', 404);
      }

      const userRole = req.user?.role;
      if (userRole === 'departmentadmin') {
        const managedCategory = (req as any).user?.managedCategory;
        if (!managedCategory) {
          throw new AppError('Department Admin must have a managed category assigned', 403, 'NO_MANAGED_CATEGORY');
        }

        const client = getAdminClient();
        const { data: product } = await client
          .from('products')
          .select('category')
          .eq('id', existing.productId)
          .single();

        if (!product || product.category !== managedCategory) {
          throw new AppError('Access denied. Review is not in your managed category.', 403, 'CATEGORY_MISMATCH');
        }
      }

      await productReviewService.deleteById(req.params.id);
      if (existing.productId) {
        await productService.updateProductRating(existing.productId);
      }
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error?.message || 'فشل حذف المراجعة',
        code: error?.code,
      });
    }
  }
}

export const productReviewController = new ProductReviewController();
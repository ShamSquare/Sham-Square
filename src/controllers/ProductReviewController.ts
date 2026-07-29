import { CrudController } from './CrudController';
import { productReviewService, productService } from '../services/index';
import { getAdminClient } from '../database/supabase';
import type { IProductReview } from '../database/models/index';
import { AppError } from '../utils/app-error.util';

export class ProductReviewController extends CrudController<IProductReview> {
  constructor() {
    super(productReviewService);
  }

  async list(req: any, res: any) {
    try {
      const filter: Record<string, any> = {};
      if (req.query.productId) {
        filter.productId = req.query.productId;
      }
      if (req.query.userId) {
        filter.userId = req.query.userId;
      }
      const options: { limit?: number; offset?: number; orderBy?: string; orderDir?: 'asc' | 'desc' } = {};
      if (req.query.limit) options.limit = parseInt(req.query.limit, 10);
      if (req.query.offset) options.offset = parseInt(req.query.offset, 10);
      if (req.query.orderBy) options.orderBy = req.query.orderBy;
      if (req.query.orderDir) options.orderDir = req.query.orderDir === 'desc' ? 'desc' : 'asc';
      const items = await productReviewService.find(filter, options);
      return this.sendSuccess(res, items);
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error?.message || 'فشل جلب المراجعات',
        code: error?.code,
      });
    }
  }

  /**
   * Admin endpoint: fetch all reviews with product and user data joined.
   * Supports filtering, searching, sorting, and pagination.
   * GET /api/v1/product-reviews/admin-list
   */
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

      // Department Admin filtering - only show reviews for products in their category
      const userRole = req.user?.role;
      if (userRole === 'departmentadmin') {
        const managedCategory = (req as any).user?.managedCategory;
        if (!managedCategory) {
          throw new AppError('Department Admin must have a managed category assigned', 403, 'NO_MANAGED_CATEGORY');
        }

        // Get product IDs in the managed category
        const { data: categoryProducts, error: productsError } = await client
          .from('products')
          .select('id')
          .eq('category', managedCategory)
          .eq('is_deleted', false);

        if (productsError) {
          throw new AppError('Failed to fetch category products', 500, 'PRODUCTS_ERROR');
        }

        const categoryProductIds = categoryProducts?.map((p: any) => p.id) || [];
        
        if (categoryProductIds.length === 0) {
          // No products in this category
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

        // If productId filter is provided, validate it's in the managed category
        if (productId && !categoryProductIds.includes(productId as string)) {
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

      // Build the base query with joins
      let query = client
        .from('product_reviews')
        .select(`
          *,
          product:products!product_id(id, name, name_ar, image, thumbnail, images),
          user:users!user_id(id, first_name, last_name, avatar, email)
        `, { count: 'exact' });

      // Apply filters
      if (rating) {
        const ratingNum = parseInt(rating, 10);
        if (ratingNum >= 1 && ratingNum <= 5) {
          query = query.eq('rating', ratingNum);
        }
      }

      if (status === 'approved') {
        query = query.eq('is_approved', true).eq('is_hidden', false);
      } else if (status === 'pending') {
        query = query.eq('is_approved', false).eq('is_hidden', false);
      } else if (status === 'rejected') {
        query = query.eq('is_hidden', true);
      }

      if (productId) {
        query = query.eq('product_id', productId);
      }

      if (userId) {
        query = query.eq('user_id', userId);
      }

      // Department Admin category filter
      if (userRole === 'departmentadmin') {
        const managedCategory = (req as any).user?.managedCategory;
        if (managedCategory) {
          const { data: categoryProducts } = await client
            .from('products')
            .select('id')
            .eq('category', managedCategory)
            .eq('is_deleted', false);

          const categoryProductIds = categoryProducts?.map((p: any) => p.id) || [];
          if (categoryProductIds.length > 0) {
            query = query.in('product_id', categoryProductIds);
          }
        }
      }

      // Search across review title, comment
      if (search && search.trim()) {
        const searchTerm = `%${search.trim()}%`;
        query = query.or(`title.ilike.${searchTerm},comment.ilike.${searchTerm}` as any);
      }

      // Only show non-deleted reviews
      query = query.eq('is_deleted', false as any);

      // Apply sorting
      const allowedOrderBy = ['created_at', 'updated_at', 'rating', 'title'];
      const safeOrderBy = allowedOrderBy.includes(orderBy) ? orderBy : 'created_at';
      const safeOrderDir = orderDir === 'asc' ? 'asc' : 'desc';
      query = query.order(safeOrderBy, { ascending: safeOrderDir });

      // Apply pagination
      query = query.range(offset, offset + limitNum - 1);

      const { data: reviews, error, count } = await query;

      if (error) {
        return res.status(400).json({
          success: false,
          message: error?.message || 'فشل جلب المراجعات',
        });
      }

      // If search term provided, also search in product/user names (post-filter since Supabase doesn't support cross-table ilike easily)
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

  async create(req: any, res: any) {
    try {
      // Directly create the review via service (don't use super.create which sends response)
      const created = await productReviewService.create(req.body as any);
      
      // Update product rating after review is created
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
      // Directly update the review via service
      const updated = await productReviewService.updateById(req.params.id, req.body as any);
      if (!updated) {
        return this.sendError(res, 'Not found', 404);
      }
      
      // Update product rating after review is updated
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
      // Get review before deletion to know which product to update
      const existing = await productReviewService.getById(req.params.id);
      const productId = existing?.productId;
      
      await productReviewService.deleteById(req.params.id);
      
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
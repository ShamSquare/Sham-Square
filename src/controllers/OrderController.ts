import { CrudController } from './CrudController';
import { orderService, notificationService } from '../services/index';
import type { IOrder } from '../database/models/index';
import { OrderStatus } from '../database/enums/index';
import { AppError } from '../utils/app-error.util';
import { realtimeService } from '../services/RealtimeService';
import { isValidUUID } from '../utils/uuid.util';
import { orderItemRepository } from '../database/repositories/index';
import { getAdminClient } from '../database/supabase';

type AuthReq = import('../middlewares/auth.middleware').AuthRequest;

export class OrderController extends CrudController<IOrder> {
  constructor() {
    super(orderService);
  }

  async list(req: AuthReq, res: any) {
    const {
      search,
      status,
      paymentStatus,
      dateFrom,
      dateTo,
      sortBy = 'newest',
      page = '1',
      limit = '50',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(limit as string, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    const filter: Record<string, any> = {};

    // Department Admin filtering - only show orders containing their category products
    const userRole = req.user?.role;
    if (userRole === 'departmentadmin') {
      const managedCategory = (req as any).user?.managedCategory;
      if (!managedCategory) {
        throw new AppError('Department Admin must have a managed category assigned', 403, 'NO_MANAGED_CATEGORY');
      }

      // Optimized: fetch only product IDs in the managed category, then order_items for those products
      const client = getAdminClient();

      // Step 1: Get product IDs in the managed category (single query)
      const { data: categoryProducts, error: productsError } = await client
        .from('products')
        .select('id')
        .eq('category', managedCategory)
        .eq('is_deleted', false as any);

      if (productsError) {
        throw new AppError('Failed to fetch category products', 500, 'PRODUCTS_ERROR');
      }

      const categoryProductIds = (categoryProducts || []).map((p: any) => p.id);

      if (categoryProductIds.length === 0) {
        // No products in this category yet
        return res.status(200).json({
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

      // Step 2: Get order IDs that contain those products (filtered at DB level using .in())
      const { data: orderItems, error: orderItemsError } = await client
        .from('order_items')
        .select('order_id')
        .in('product_id', categoryProductIds);

      if (orderItemsError) {
        throw new AppError('Failed to filter orders by category', 500, 'FILTER_ERROR');
      }

      const orderIds = Array.from(
        new Set((orderItems || []).map((oi: any) => oi.order_id))
      );

      if (orderIds.length === 0) {
        // No orders found for this category
        return res.status(200).json({
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

      filter.id = { $in: orderIds };
    }

    if (search && typeof search === 'string') {
      const term = search.trim().toLowerCase();
      filter.$or = [
        { id: { $ilike: `%${term}%` } },
        { orderNumber: { $ilike: `%${term}%` } },
        { 'shippingAddress.fullName': { $ilike: `%${term}%` } },
        { 'shippingAddress.phone': { $ilike: `%${term}%` } },
        { 'shippingAddress.email': { $ilike: `%${term}%` } },
      ];
    }

    if (status && typeof status === 'string') {
      filter.status = status.toUpperCase();
    }

    if (paymentStatus && typeof paymentStatus === 'string') {
      filter['payment.status'] = paymentStatus.toUpperCase();
    }

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom && typeof dateFrom === 'string') {
        filter.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo && typeof dateTo === 'string') {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = toDate;
      }
    }

    let orderBy: string | undefined;
    let orderDir: 'asc' | 'desc' = 'desc';

    if (sortBy === 'oldest') {
      orderBy = 'createdAt';
      orderDir = 'asc';
    } else if (sortBy === 'total') {
      orderBy = 'pricing.total';
      orderDir = 'desc';
    } else {
      orderBy = 'createdAt';
      orderDir = 'desc';
    }

    const [items, total] = await Promise.all([
      orderService.find(filter, { limit: limitNum, offset, orderBy, orderDir }),
      orderService.count(filter),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limitNum));

    return res.status(200).json({
      success: true,
      data: items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    });
  }

  async create(req: AuthReq, res: any) {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const payload = {
      ...req.body,
      userId,
      orderNumber: req.body.orderNumber || `ORD-${Date.now()}`,
    };
    
    
    // Create the order first
    const created = await orderService.create(payload as any);
    
    // If items are provided in the request, create order items
    const items = req.body.items;
    
    if (items && Array.isArray(items) && items.length > 0) {
      
      for (const item of items) {
        try {
          const orderItem = {
            orderId: created.id,
            productId: item.productId || item.product_id || '',
            variantId: item.variantId || item.variant_id || item.productId || item.product_id || '',
            sku: item.sku || '',
            productName: item.productName || item.product_name || 'Unknown Product',
            variantName: item.variantName || item.variant_name || '',
            thumbnail: item.thumbnail || item.productImage || '',
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || item.price || 0,
            lineTotal: item.lineTotal || (item.unitPrice || item.price || 0) * (item.quantity || 1),
            currency: item.currency || 'USD',
            status: 'PENDING' as any,
          };
          await orderItemRepository.create(orderItem);
        } catch (itemError) {
          console.error(`[ORDER CREATE] Failed to create order item for product ${item.productId}:`, itemError);
        }
      }
      
    } else {
      console.log(`[ORDER CREATE] No items provided in request for order ${created.id}`);
    }
    
    realtimeService.emitToUser(String(userId), 'order:created', created);
    realtimeService.emitToAdmins('order:created', created);

    try {
      await notificationService.sendOrderStatusNotification(
        userId as any,
        created.orderNumber,
        OrderStatus.PENDING,
        created.id
      );
    } catch {
      // keep order creation intact even if notification fails
    }

    return this.sendCreated(res, created);
  }

  async update(req: AuthReq, res: any) {
    // Validate UUID format
    if (!isValidUUID(req.params.id)) {
      return this.sendError(res, 'Invalid order ID', 400);
    }

    // Department Admin can only update orders in their category
    const userRole = req.user?.role;
    if (userRole === 'departmentadmin') {
      const managedCategory = (req as any).user?.managedCategory;
      if (!managedCategory) {
        throw new AppError('Department Admin must have a managed category assigned', 403, 'NO_MANAGED_CATEGORY');
      }

      // Verify the order contains products from the department admin's category
      const client = getAdminClient();
      
      // Get order items for this order
      const { data: orderItems, error: orderItemsError } = await client
        .from('order_items')
        .select('product_id')
        .eq('order_id', req.params.id)
        .eq('is_deleted', false as any);

      if (orderItemsError || !orderItems || orderItems.length === 0) {
        throw new AppError('Access denied. Order does not contain products from your category.', 403, 'CATEGORY_MISMATCH');
      }

      // Get product IDs in the managed category
      const productIds = orderItems.map((oi: any) => oi.product_id);
      const { data: categoryProducts, error: productsError } = await client
        .from('products')
        .select('id')
        .eq('category', managedCategory)
        .eq('is_deleted', false as any)
        .in('id', productIds);

      if (productsError || !categoryProducts || categoryProducts.length === 0) {
        throw new AppError('Access denied. Order does not contain products from your category.', 403, 'CATEGORY_MISMATCH');
      }
    }

    const updated = await orderService.updateById(req.params.id, req.body as any);
    if (!updated) {
      return this.sendError(res, 'Order not found', 404);
    }

    if ((updated as any).userId) {
      realtimeService.emitToUser(String((updated as any).userId), 'order:updated', updated);
    }
    realtimeService.emitToAdmins('order:updated', updated);
    return res.status(200).json({ success: true, data: updated });
  }
}

export const orderController = new OrderController();

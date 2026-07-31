import { CrudController } from './CrudController';
import { orderService, notificationService, couponService } from '../services/index';
import type { IOrder } from '../database/models/index';
import { OrderStatus } from '../database/enums/index';
import { AppError } from '../utils/app-error.util';
import { realtimeService } from '../services/RealtimeService';
import { isValidUUID } from '../utils/uuid.util';
import { getAdminClient } from '../database/supabase';
import { orderItemRepository } from '../database/repositories/index';
import { validateStock, deductStock } from '../utils/stock.util';

type AuthReq = import('../middlewares/auth.middleware').AuthRequest;

export class OrderController extends CrudController<IOrder> {
  constructor() {
    super(orderService);
  }

  async list(req: AuthReq, res: any) {
    const {
      search,
      status,
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

    // Regular users can only see their own orders
    // Admins and Department Admins see all orders (with department admin category filtering)
    if (userRole !== 'departmentadmin' && userRole !== 'admin' && userRole !== 'super_admin') {
      filter.userId = req.user?.userId;
    }

    if (userRole === 'departmentadmin') {
      const managedCategory = (req as any).user?.managedCategory ||
        (req as any).user?.categoryType;
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

    const items = req.body.items;
    const orderItems = (items && Array.isArray(items) ? items : []).map((item: any) => ({
      productId: item.productId || item.product_id || '',
      quantity: item.quantity || 1,
    }));

    if (orderItems.length === 0) {
      throw new AppError('No items provided in request', 400);
    }

    await validateStock(orderItems);

    const couponCode = req.body.couponCode;

    let discount = 0;
    let appliedCoupon: Awaited<ReturnType<typeof couponService.calculateDiscount>> | null = null;
    if (couponCode) {
      try {
        appliedCoupon = await couponService.calculateDiscount(
          couponCode,
          req.body.pricing.subtotal,
          userId
        );
        discount = appliedCoupon.discount;
      } catch (err: any) {
        return this.sendError(res, err.message || 'Invalid coupon', 400);
      }
    }

    const payload = {
      ...req.body,
      userId,
      orderNumber: req.body.orderNumber || `ORD-${Date.now()}`,
      pricing: {
        ...req.body.pricing,
        discount,
        total:
          req.body.pricing.subtotal +
          req.body.pricing.shipping +
          req.body.pricing.tax -
          discount,
      },
    };

    const created = await orderService.create(payload as any);

    if (appliedCoupon) {
      await couponService.incrementUsage(appliedCoupon.coupon.id);
    }

    for (const item of items || []) {
      try {
        const orderItem = {
          orderId: created.id,
          productId: item.productId || item.product_id || '',
          variantId: item.variantId || item.variant_id || item.productId || item.product_id || '',
          sku: item.sku || '',
          productName: item.productName || item.product_name || 'Unknown Product',
          variantName: item.variantName || item.variant_name || '',
          thumbnail: item.thumbnail || item.productImage || '',
          selectedColor: item.selectedColor || item.selected_color || undefined,
          selectedSize: item.selectedSize || item.selected_size || item.selectedOption || item.selected_option || undefined,
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice || item.price || 0,
          lineTotal: item.lineTotal || (item.unitPrice || item.price || 0) * (item.quantity || 1),
          currency: 'SYP',
          status: 'PENDING' as any,
        };
        await orderItemRepository.create(orderItem);
      } catch (itemError) {
        console.error(`[ORDER CREATE] Failed to create order item for product ${item.productId}:`, itemError);
      }
    }

    await deductStock(orderItems);

    const client = getAdminClient();
    if (orderItems.length > 0) {
      for (const item of orderItems) {
        const { data: product } = await client
          .from('products')
          .select('id, name, stock, total_sold, price, category, thumbnail, isFeatured, status')
          .eq('id', item.productId)
          .single();

        if (product) {
          realtimeService.emitPublic('inventory:updated', { product });
        }
      }
    }

    realtimeService.emitToUser(String(userId), 'order:created', created);
    realtimeService.emitToAdmins('order:created', created);

    try {
      await notificationService.sendOrderStatusNotification(
        userId,
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
    if (!isValidUUID(req.params.id)) {
      return this.sendError(res, 'Invalid order ID', 400);
    }

    await this.assertOrderInManagedCategory(req, req.params.id);

    const existingOrder = await orderService.getById(req.params.id);
    if (!existingOrder) {
      return this.sendError(res, 'Order not found', 404);
    }

    const oldStatus = existingOrder?.status;
    const newStatus = (req.body as any).status;
    const isBeingCancelled = oldStatus !== 'CANCELLED' && newStatus === 'CANCELLED';

    const updated = await orderService.updateById(req.params.id, req.body as any);
    if (!updated) {
      return this.sendError(res, 'Order not found', 404);
    }

    if (isBeingCancelled) {
      try {
        const client = getAdminClient();
        await client.rpc('cancel_order_stock_restore', { p_order_id: req.params.id });
      } catch (stockError: any) {
        try {
          await orderService.updateById(req.params.id, { status: oldStatus });
        } catch (rollbackError) {
          console.error('[STOCK RESTORE] Failed to rollback order cancellation:', rollbackError);
        }
        return this.sendError(res, stockError.message || 'Failed to restore stock. Order cancellation rolled back.', 500);
      }
    }

    if ((updated as any).userId) {
      realtimeService.emitToUser(String((updated as any).userId), 'order:updated', updated);
    }
    realtimeService.emitToAdmins('order:updated', updated);
    return res.status(200).json({ success: true, data: updated });
  }

  private async assertOrderInManagedCategory(req: AuthReq, orderId: string): Promise<void> {
    const userRole = req.user?.role;
    if (userRole !== 'departmentadmin') {
      return;
    }

    const managedCategory = (req as any).user?.managedCategory ||
      (req as any).user?.categoryType;
    if (!managedCategory) {
      throw new AppError('Department Admin must have a managed category assigned', 403, 'NO_MANAGED_CATEGORY');
    }

    const client = getAdminClient();

    const { data: orderItems, error: orderItemsError } = await client
      .from('order_items')
      .select('product_id')
      .eq('order_id', orderId)
      .eq('is_deleted', false as any);

    if (orderItemsError || !orderItems || orderItems.length === 0) {
      throw new AppError('Access denied. Order does not contain products from your category.', 403, 'CATEGORY_MISMATCH');
    }

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

  async getById(req: AuthReq, res: any) {
    if (!isValidUUID(req.params.id)) {
      return this.sendError(res, 'Invalid order ID', 400);
    }

    await this.assertOrderInManagedCategory(req, req.params.id);

    const order = await orderService.getById(req.params.id);
    if (!order) {
      return this.sendError(res, 'Order not found', 404);
    }

    // Regular users can only view their own orders
    const userRole = req.user?.role;
    if (userRole !== 'departmentadmin' && userRole !== 'admin' && userRole !== 'super_admin') {
      if (order.userId !== req.user?.userId) {
        return this.sendError(res, 'Order not found', 404);
      }
    }

    return this.sendSuccess(res, order);
  }

  async remove(req: AuthReq, res: any) {
    if (!isValidUUID(req.params.id)) {
      return this.sendError(res, 'Invalid order ID', 400);
    }

    await this.assertOrderInManagedCategory(req, req.params.id);

    await orderService.deleteById(req.params.id);
    return this.sendNoContent(res);
  }
}

export const orderController = new OrderController();

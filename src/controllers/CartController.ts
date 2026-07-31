import { CrudController } from './CrudController';
import { cartService, notificationService, orderService } from '../services/index';
import type { ICart } from '../database/models/index';
import { cartRepository, orderRepository } from '../database/repositories/index';
import { OrderStatus, CartStatus } from '../database/enums/index';
import { AppError } from '../utils/app-error.util';
import { realtimeService } from '../services/RealtimeService';
import { validateStock } from '../utils/stock.util';
import { getAdminClient } from '../database';

export class CartController extends CrudController<ICart> {
  constructor() {
    super(cartService);
  }

  async convertActive(req: any, res: any) {
    const userId = (req as any).user?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const payment = req.body?.payment || { method: 'COD' };
    const shippingAddress = req.body?.shippingAddress;
    const addressId = req.body?.addressId;
    const checkoutItems = req.body?.items;
    const cart = await cartRepository.findOne({ userId, status: 'ACTIVE' as any });
    if (!cart) throw new AppError('Active cart not found', 404);

    const items = checkoutItems;
    const activeItems = items.filter((it: any) => !it.isDeleted);
    if (activeItems.length === 0) throw new AppError('Cart is empty', 400);

    const stockItems = activeItems.map((it: any) => ({
      productId: it.productId,
      quantity: it.quantity || 1,
    }));
    await validateStock(stockItems);

    const subtotal = activeItems.reduce((s: any, it: any) => s + (it.unitPrice || 0) * (it.quantity || 1), 0);
    const pricing = { subtotal, discount: 0, shipping: 0, tax: 0, total: subtotal, currency: 'SYP' };

    const atomicItems = activeItems.map((it: any) => ({
      productId: it.product?.id || it.productId,
      sku: '',
      productName: it.product?.nameAr || it.product?.name || it.productName,
      variantName: '',
      thumbnail: it.product?.thumbnail || it.product?.imageUrl || it.product?.image || it.thumbnail || '',
      selectedColor: it.selectedColor || it.selected_color || undefined,
      selectedSize: it.selectedSize || it.selected_size || it.selectedOption || it.selected_option || undefined,
      quantity: it.quantity,
      unitPrice: it.product?.price || it.unitPrice || it.price || 0,
      lineTotal: (it.product?.price || it.unitPrice || it.price || 0) * it.quantity,
      currency: 'SYP',
    }));

    const payload = {
      orderNumber: `ORD-${Date.now()}`,
      userId: cart.userId!,
      payment,
      shippingAddress: shippingAddress || {},
      addressId: addressId || null,
      pricing,
      items: atomicItems,
    };

    const created = await orderService.createAtomic(payload);

    await cartRepository.updateById(cart.id, {
      status: CartStatus.CONVERTED,
      convertedOrderId: created.id,
    });

    const client = getAdminClient();
    const order = await orderService.getById(created.id);

    for (const item of stockItems) {
      const { data: product } = await client
        .from('products')
        .select('id, name, stock, total_sold, price, category, thumbnail, isFeatured, status')
        .eq('id', item.productId)
        .single();

      if (product) {
        realtimeService.emitPublic('inventory:updated', { product });
      }
    }

    realtimeService.emitToUser(String(userId), 'cart:updated', {
      status: CartStatus.CONVERTED,
      orderId: created.id,
    });
    realtimeService.emitToUser(String(userId), 'order:created', order);
    realtimeService.emitToAdmins('order:created', order);

    try {
      if (!order) {
        console.error("NO ORDER FOUND")
  return;
}

console.log(order.id);
      await notificationService.sendOrderStatusNotification(
        userId,
        order.orderNumber,
        OrderStatus.PENDING,
        order.id
      );
    } catch (error) {
      console.error("ERROR HAPPEND : ", error)
    }

    return this.sendCreated(res, order);
  }
}

export const cartController = new CartController();

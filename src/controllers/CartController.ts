import { CrudController } from './CrudController';
import { cartService, notificationService } from '../services/index';
import type { ICart } from '../database/models/index';
import { cartRepository, cartItemRepository, orderRepository, orderItemRepository } from '../database/repositories/index';
import { OrderStatus, CartStatus } from '../database/enums/index';
import { AppError } from '../utils/app-error.util';
import { realtimeService } from '../services/RealtimeService';
import { BaseController } from './BaseController';
import { validateStock, deductStock } from '../utils/stock.util';

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
    const activeItems = items.filter((it : any) => !it.isDeleted);
    if (activeItems.length === 0) throw new AppError('Cart is empty', 400);

    const stockItems = activeItems.map((it: any) => ({
      productId: it.productId,
      quantity: it.quantity || 1,
    }));
    await validateStock(stockItems);

    const subtotal = activeItems.reduce((s: any, it: any) => s + (it.unitPrice || 0) * (it.quantity || 1), 0);
    const pricing = { subtotal, discount: 0, shipping: 0, tax: 0, total: subtotal, currency: 'SYP' };

    const createdOrder = await orderRepository.create({
      orderNumber: `ORD-${Date.now()}`,
      userId: cart.userId!,
      payment,
      shippingAddress: shippingAddress || {},
      addressId: addressId || null,
      pricing,
    });

 for (const it of activeItems) {
   const finalColor = it.selectedColor || it.selected_color || null;
   const finalSize = it.selectedSize || it.selected_size || it.selectedOption || it.selected_option || null;

   await orderItemRepository.create({
     orderId: createdOrder.id,
     productId: it.product?.id || it.productId,
     sku: '',
     productName: it.product?.nameAr || it.product?.name || it.productName,
     variantName: '',
     thumbnail: it.product?.thumbnail || it.product?.imageUrl || it.product?.image || it.thumbnail || '',
     selectedColor: finalColor || undefined,
     selectedSize: finalSize || undefined,
     quantity: it.quantity,
     unitPrice: it.product?.price || it.unitPrice || it.price || 0,
     lineTotal: (it.product?.price || it.unitPrice || it.price || 0) * it.quantity,
     currency: 'SYP',
   });
 }

    // Deduct stock after successful order item creation
    try {
      await deductStock(stockItems);
    } catch (stockError) {
      console.error(`[CART CONVERT] Stock deduction failed for order ${createdOrder.id}:`, stockError);
    }

    await cartRepository.updateById(cart.id, {
      status: CartStatus.CONVERTED,
      convertedOrderId: createdOrder.id,
    });

    realtimeService.emitToUser(String(userId), 'cart:updated', {
      status: CartStatus.CONVERTED,
      orderId: createdOrder.id,
    });
    realtimeService.emitToUser(String(userId), 'order:created', createdOrder);
    realtimeService.emitToAdmins('order:created', createdOrder);

    try {
      await notificationService.sendOrderStatusNotification(
        userId,
        createdOrder.orderNumber,
        OrderStatus.PENDING,
        createdOrder.id
      );
    } catch (notificationError) {
      // If notification fails, keep order creation intact.
    }

    return this.sendCreated(res, createdOrder);
  }
}

export const cartController = new CartController();

import { CrudController } from './CrudController.ts';
import { cartService, notificationService } from '../services/index.ts';
import type { ICart } from '../database/models/index.ts';
import mongoose from 'mongoose';
import { Cart, CartItem, Order, OrderItem } from '../database/models/index.ts';
import { OrderStatus } from '../database/enums/index.ts';
import { AppError } from '../utils/app-error.util.ts';
import { realtimeService } from '../services/RealtimeService.ts';

type AuthReq = import('../middlewares/auth.middleware.ts').AuthRequest;

export class CartController extends CrudController<ICart> {
  constructor() {
    super(cartService);
  }

  // Convert active cart for authenticated user into an order (atomic)
  async convertActive(req: AuthReq, res: any) {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const payment = req.body?.payment || { method: 'COD' };
    const shippingAddress = req.body?.shippingAddress;

    const session = await mongoose.startSession();
    try {
      let createdOrder: any = null;
      await session.withTransaction(async () => {
        const cart = await Cart.findOne({ userId, status: 'ACTIVE' }).session(session);
        if (!cart) throw new AppError('Active cart not found', 404);

        const items = await CartItem.find({ cartId: cart._id, isDeleted: { $ne: true } }).session(session);
        if (!items || items.length === 0) throw new AppError('Cart is empty', 400);

        const subtotal = items.reduce((s: number, it: any) => s + (it.unitPrice || 0) * (it.quantity || 1), 0);
        const pricing = { subtotal, discount: 0, shipping: 0, tax: 0, total: subtotal, currency: cart.currency || 'USD' };

        const orderDoc = new Order({
          orderNumber: `ORD-${Date.now()}`,
          userId: cart.userId,
          payment,
          shippingAddress: shippingAddress || {},
          pricing,
        });

        createdOrder = await orderDoc.save({ session });

        // create order items
        for (const it of items) {
          const oi = new OrderItem({
            orderId: createdOrder._id,
            productId: it.productId,
            variantId: it.variantId,
            sku: it.variantId?.toString() || '',
            productName: it.productName,
            variantName: it.variantName,
            thumbnail: it.thumbnail,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            lineTotal: it.lineTotal,
            currency: it.currency,
          });
          await oi.save({ session });
        }

        // mark cart converted
        cart.status = 'CONVERTED' as any;
        cart.convertedOrderId = createdOrder._id;
        await cart.save({ session });
      });

      res.status(201).json({ success: true, data: createdOrder });
      realtimeService.emitToUser(String(userId), 'cart:updated', {
        status: 'CONVERTED',
        orderId: createdOrder._id,
      });
      realtimeService.emitToUser(String(userId), 'order:created', createdOrder);
      realtimeService.emitToAdmins('order:created', createdOrder);

      try {
        await notificationService.sendOrderStatusNotification(
          userId as any,
          createdOrder.orderNumber,
          OrderStatus.PENDING,
          createdOrder._id
        );
      } catch (notificationError) {
        // If notification fails, keep order creation intact.
      }
    } catch (error: any) {
      session.abortTransaction().catch(() => {});
      throw error;
    } finally {
      session.endSession();
    }
  }
}

export const cartController = new CartController();

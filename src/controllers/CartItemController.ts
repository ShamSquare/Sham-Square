import { CrudController } from './CrudController';
import { cartItemService, cartService, productService } from '../services/index';
import type { ICartItem, ICart } from '../database/models/index';
import { cartRepository, cartItemRepository, productVariantRepository } from '../database/repositories/index';
import { realtimeService } from '../services/RealtimeService';
import { CartStatus } from '../database/enums/index';
import { AppError } from '../utils/app-error.util';

export class CartItemController extends CrudController<ICartItem> {
  constructor() {
    super(cartItemService);
  }

  /**
   * POST /api/v1/cart-items
   * Protected: requires authenticated user via `protect` middleware.
   * Body: { productId: string, quantity: number }
   *
   * Flow:
   * 1. Get authenticated user from req.user.userId
   * 2. Find user's active cart or create one
   * 3. Check if product already exists in cart
   *    - If yes: update quantity (increment)
   *    - If no: create new cart_item with cartId
   * 4. Look up product to populate unitPrice, productName, thumbnail
   */
  async create(req: any, res: any) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
      }

      const { productId, quantity = 1, selectedColor, selectedOption } = req.body;
      if (!productId) {
        return res.status(400).json({
          success: false,
          message: 'productId is required',
        });
      }

      const qty = Number(quantity);
      if (isNaN(qty) || qty < 1) {
        return res.status(400).json({
          success: false,
          message: 'quantity must be a positive number',
        });
      }

      // 1. Find or create active cart for this user
      let cart = await cartRepository.findOne({ userId, status: CartStatus.ACTIVE } as any);
      if (!cart) {
        cart = await cartService.create({
          userId,
          status: CartStatus.ACTIVE,
          currency: 'SYP',
          subtotal: 0,
          discount: 0,
          shipping: 0,
          tax: 0,
          total: 0,
          itemCount: 0,
        } as any);
      }

      // 2. Look up product for price/name/thumbnail
      const product = await productService.getById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      const unitPrice = product.price ?? 0;
      const productName = product.name || '';
      const thumbnail = product.thumbnail || (product.images?.[0]) || product.image || '';

      // Get the default variant for this product
      const variants = await productVariantRepository.find({ productId: product.id } as any);
      const defaultVariant = variants?.[0];

      // 3. Check if product already exists in this cart
      const existingItem = await cartItemRepository.findOne({ cartId: cart.id, productId } as any);

      let cartItem: ICartItem;
      if (existingItem) {
        // Increment quantity
        const newQuantity = (existingItem.quantity || 0) + qty;
        const updated = await cartItemService.updateById(existingItem.id, {
          quantity: newQuantity,
          lineTotal: unitPrice * newQuantity,
        } as any);
        if (!updated) {
          return res.status(500).json({ success: false, message: 'Failed to update cart item' });
        }
        cartItem = updated;
      } else {
        // Create new cart item with cartId
        console.log("CREATING CART ITEM:", {
  cartId: cart.id,
  productId,
  variantId: defaultVariant?.id || product.id,
  quantity: qty,
  selectedColor,
  selectedSize: selectedOption
});
        const created = await cartItemService.create({
          cartId: cart.id,
          productId,
          variantId: defaultVariant?.id || product.id,
          quantity: qty,
          unitPrice,
          selectedColor: selectedColor || undefined,
          selectedSize: selectedOption || undefined,
          lineTotal: unitPrice * qty,
          currency: 'SYP',
          productName,
          thumbnail,
          variantName: defaultVariant?.name || '',
        } as any);
        cartItem = created;
      }

      const allItems = await cartItemRepository.find({ cartId: cart.id } as any);
      const activeItems = allItems.filter((it: any) => !it.isDeleted);
      const itemCount = activeItems.reduce((sum: number, it: any) => sum + (it.quantity || 0), 0);
      const subtotal = activeItems.reduce((sum: number, it: any) => sum + (it.lineTotal || 0), 0);
      await cartRepository.updateById(cart.id, {
        itemCount,
        subtotal,
        total: subtotal - (cart.discount || 0),
      });

      await this.emitCartUpdate(cartItem);
      return this.sendCreated(res, cartItem);
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error?.message || 'Failed to create cart item',
        code: error?.code,
      });
    }
  }

  async update(req: any, res: any) {
    const updated = await cartItemService.updateById(req.params.id, req.body);
    if (!updated) return this.sendError(res, 'Not found', 404);

    await this.emitCartUpdate(updated);
    return this.sendSuccess(res, updated);
  }

  async remove(req: any, res: any) {
    const existing = await cartItemService.getById(req.params.id);
    await cartItemService.deleteById(req.params.id);
    if (existing) await this.emitCartUpdate(existing, 'removed');
    return this.sendNoContent(res);
  }

  private async emitCartUpdate(item: any, action = 'updated') {
    const payload = { action, item };
    const cart = item?.cartId ? await cartRepository.findById(item.cartId) : null;
    if (cart?.userId) {
      realtimeService.emitToUser(String(cart.userId), 'cart:updated', payload);
    }
    realtimeService.emitToAdmins('cart:updated', payload);
  }
}

export const cartItemController = new CartItemController();

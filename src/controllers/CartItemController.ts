import { CrudController } from './CrudController.ts';
import { cartItemService } from '../services/index.ts';
import { Cart, type ICartItem } from '../database/models/index.ts';
import { realtimeService } from '../services/RealtimeService.ts';

export class CartItemController extends CrudController<ICartItem> {
  constructor() {
    super(cartItemService);
  }

  async create(req: any, res: any) {
    const created = await cartItemService.create(req.body);
    await this.emitCartUpdate(created);
    return res.status(201).json({ success: true, data: created });
  }

  async update(req: any, res: any) {
    const updated = await cartItemService.updateById(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Not found' });

    await this.emitCartUpdate(updated);
    return res.status(200).json({ success: true, data: updated });
  }

  async remove(req: any, res: any) {
    const existing = await cartItemService.getById(req.params.id);
    await cartItemService.deleteById(req.params.id);
    if (existing) await this.emitCartUpdate(existing, 'removed');
    return res.status(204).send();
  }

  private async emitCartUpdate(item: any, action = 'updated') {
    const payload = { action, item };
    const cart = item?.cartId ? await Cart.findById(item.cartId).select('userId').lean() : null;
    if (cart?.userId) {
      realtimeService.emitToUser(String(cart.userId), 'cart:updated', payload);
    }
    realtimeService.emitToAdmins('cart:updated', payload);
  }
}

export const cartItemController = new CartItemController();

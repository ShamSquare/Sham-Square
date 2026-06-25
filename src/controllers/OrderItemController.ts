import { CrudController } from './CrudController.ts';
import { orderItemService } from '../services/index.ts';
import type { IOrderItem } from '../database/models/index.ts';

export class OrderItemController extends CrudController<IOrderItem> {
  constructor() {
    super(orderItemService);
  }
}

export const orderItemController = new OrderItemController();

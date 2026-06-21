import { CrudController } from './CrudController.js';
import { orderItemService } from '../services/index.js';
import type { IOrderItem } from '../database/models/index.js';

export class OrderItemController extends CrudController<IOrderItem> {
  constructor() {
    super(orderItemService);
  }
}

export const orderItemController = new OrderItemController();

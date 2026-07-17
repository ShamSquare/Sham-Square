import { CrudController } from './CrudController';
import { orderItemService } from '../services/index';
import type { IOrderItem } from '../database/models/index';

export class OrderItemController extends CrudController<IOrderItem> {
  constructor() {
    super(orderItemService);
  }
}

export const orderItemController = new OrderItemController();

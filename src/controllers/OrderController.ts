import { CrudController } from './CrudController.js';
import { orderService } from '../services/index.js';
import type { IOrder } from '../database/models/index.js';

export class OrderController extends CrudController<IOrder> {
  constructor() {
    super(orderService);
  }
}

export const orderController = new OrderController();

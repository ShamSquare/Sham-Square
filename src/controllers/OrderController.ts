import { CrudController } from './CrudController.ts';
import { orderService } from '../services/index.ts';
import type { IOrder } from '../database/models/index.ts';

export class OrderController extends CrudController<IOrder> {
  constructor() {
    super(orderService);
  }
}

export const orderController = new OrderController();

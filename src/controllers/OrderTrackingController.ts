import { CrudController } from './CrudController.ts';
import { orderTrackingService } from '../services/index.ts';
import type { IOrderTracking } from '../database/models/index.ts';

export class OrderTrackingController extends CrudController<IOrderTracking> {
  constructor() {
    super(orderTrackingService);
  }
}

export const orderTrackingController = new OrderTrackingController();

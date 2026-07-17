import { CrudController } from './CrudController';
import { orderTrackingService } from '../services/index';
import type { IOrderTracking } from '../database/models/index';

export class OrderTrackingController extends CrudController<IOrderTracking> {
  constructor() {
    super(orderTrackingService);
  }
}

export const orderTrackingController = new OrderTrackingController();

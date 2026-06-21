import { CrudController } from './CrudController.js';
import { orderTrackingService } from '../services/index.js';
import type { IOrderTracking } from '../database/models/index.js';

export class OrderTrackingController extends CrudController<IOrderTracking> {
  constructor() {
    super(orderTrackingService);
  }
}

export const orderTrackingController = new OrderTrackingController();

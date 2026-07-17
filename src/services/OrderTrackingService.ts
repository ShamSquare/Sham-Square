import { BaseService } from './BaseService';
import { orderTrackingRepository } from '../database/repositories/index';
import type { IOrderTracking } from '../database/models/index';

export class OrderTrackingService extends BaseService<IOrderTracking> {
  constructor() {
    super(orderTrackingRepository);
  }
}

export const orderTrackingService = new OrderTrackingService();

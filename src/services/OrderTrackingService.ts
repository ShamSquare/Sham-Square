import { BaseService } from './BaseService.ts';
import { orderTrackingRepository } from '../database/repositories/index.ts';
import type { IOrderTracking } from '../database/models/index.ts';

export class OrderTrackingService extends BaseService<IOrderTracking> {
  constructor() {
    super(orderTrackingRepository);
  }
}

export const orderTrackingService = new OrderTrackingService();

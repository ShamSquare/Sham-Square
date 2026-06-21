import { BaseService } from './BaseService.js';
import { orderTrackingRepository } from '../database/repositories/index.js';
import type { IOrderTracking } from '../database/models/index.js';

export class OrderTrackingService extends BaseService<IOrderTracking> {
  constructor() {
    super(orderTrackingRepository);
  }
}

export const orderTrackingService = new OrderTrackingService();

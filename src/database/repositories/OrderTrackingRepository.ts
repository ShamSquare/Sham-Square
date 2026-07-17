import { BaseRepository } from './BaseRepository';
import type { IOrderTracking } from '../models/index';

export class OrderTrackingRepository extends BaseRepository<IOrderTracking> {
  constructor() {
    super('order_tracking');
  }
}

export const orderTrackingRepository = new OrderTrackingRepository();

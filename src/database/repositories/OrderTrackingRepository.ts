import { BaseRepository } from './BaseRepository.ts';
import type { IOrderTracking } from '../models/index.ts';

export class OrderTrackingRepository extends BaseRepository<IOrderTracking> {
  constructor() {
    super('order_tracking');
  }
}

export const orderTrackingRepository = new OrderTrackingRepository();

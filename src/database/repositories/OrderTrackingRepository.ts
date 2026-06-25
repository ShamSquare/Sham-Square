import { BaseRepository } from './BaseRepository.ts';
import { OrderTracking, type IOrderTracking } from '../models/index.ts';

export class OrderTrackingRepository extends BaseRepository<IOrderTracking> {
  constructor() {
    super(OrderTracking);
  }
}

export const orderTrackingRepository = new OrderTrackingRepository();

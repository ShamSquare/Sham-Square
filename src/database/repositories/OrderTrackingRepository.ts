import { BaseRepository } from './BaseRepository.js';
import { OrderTracking, type IOrderTracking } from '../models/index.js';

export class OrderTrackingRepository extends BaseRepository<IOrderTracking> {
  constructor() {
    super(OrderTracking);
  }
}

export const orderTrackingRepository = new OrderTrackingRepository();

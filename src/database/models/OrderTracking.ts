import { OrderStatus, TrackingEventSource } from '../enums/index.ts';

export interface IOrderTracking {
  id: string;
  orderId: string;
  status: OrderStatus;
  title: string;
  message?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  locationLabel?: string;
  source: TrackingEventSource;
  metadata: Record<string, unknown>;
  createdBy?: string | null;
  createdAt: Date;
}

import { BaseRepository } from './BaseRepository';
import type { IOrder } from '../models/index';
import type { IUser } from '../models/User';
import { getAdminClient } from '../supabase';

function camelToSnake(key: string): string {
  return key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
}

function snakeToCamel(key: string): string {
  return key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function convertKeysFromDb(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === 'sub_category') {
      result.sub_category = value;
    } else {
      const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      result[camelKey] = value;
    }
  }
  return result;
}

export interface OrderWithUser extends IOrder {
  user?: Partial<IUser> | null;
  items?: any[];
  productCount?: number;
  products?: Array<{ productName: string; quantity: number }>;
}

export class OrderRepository extends BaseRepository<IOrder> {
  constructor() {
    super('orders');
  }

  async findById(id: string): Promise<OrderWithUser | null> {
    const client = getAdminClient();

    const { data: result, error } = await client
      .from('orders')
      .select(`
        *,
        user:users(*),
        items:order_items(*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!result) return null;

    const order = convertKeysFromDb(result) as OrderWithUser;
    if (result.user) {
      order.user = convertKeysFromDb(result.user) as Partial<IUser>;
    }
    if (result.items) {
      order.items = (result.items || []).map((item: any) => convertKeysFromDb(item));
    }
    
    // Add product summary
    const items = result.items || [];
    order.productCount = items.length;
    order.products = items.map((item: any) => ({
      productName: item.product_name,
      quantity: item.quantity,
    }));
    
    return order;
  }

  async find(
    filter?: Partial<IOrder>,
    options?: { limit?: number; offset?: number; orderBy?: string; orderDir?: 'asc' | 'desc' }
  ): Promise<OrderWithUser[]> {
    const client = getAdminClient();
    let query = client
      .from('orders')
      .select(`
        *,
        user:users(*),
        items:order_items(*)
      `);

    if (filter) {
      const dbFilter: Record<string, any> = {};
      for (const [key, value] of Object.entries(filter)) {
        if (value !== undefined) {
          const snakeKey = key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
          dbFilter[snakeKey] = value;
        }
      }

      for (const [key, value] of Object.entries(dbFilter)) {
        if (value !== undefined && typeof value === 'object' && !Array.isArray(value)) {
          // Handle special operators like $or, $ilike, etc. - skip for now
          continue;
        }
        if (value !== undefined && !(typeof value === 'object')) {
          query = query.eq(key, value);
        }
      }
    }

    if (options?.orderBy) {
      query = query.order(camelToSnake(options.orderBy), { ascending: options.orderDir !== 'desc' });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset !== undefined && options?.limit) {
      query = query.range(options.offset, options.offset + options.limit - 1);
    }

    const { data: result, error } = await query;

    if (error) throw error;

    return (result || []).map((r) => {
      const order = convertKeysFromDb(r) as OrderWithUser;
      if (r.user) {
        order.user = convertKeysFromDb(r.user) as Partial<IUser>;
      }
      if (r.items) {
        order.items = (r.items || []).map((item: any) => convertKeysFromDb(item));
      }
      
      // Add product summary
      const items = r.items || [];
      order.productCount = items.length;
      order.products = items.map((item: any) => ({
        productName: item.product_name,
        quantity: item.quantity,
      }));
      
      return order;
    });
  }

  async count(filter?: Partial<IOrder>): Promise<number> {
    const client = getAdminClient();
    let query = client.from('orders').select('*', { count: 'exact', head: true });

    if (filter) {
      for (const [key, value] of Object.entries(filter)) {
        if (value !== undefined) {
          const snakeKey = key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
          query = query.eq(snakeKey, value);
        }
      }
    }

    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  }

  async updateById(id: string, data: Partial<IOrder>): Promise<IOrder | null> {
    const client = getAdminClient();

    const dbData: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      dbData[key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`)] = value;
    }

    const { data: result, error } = await client
      .from('orders')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result ? (convertKeysFromDb(result) as IOrder) : null;
  }
}

export const orderRepository = new OrderRepository();
import { getAdminClient } from '../supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

function camelToSnake(key: string): string {
  return key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
}

function snakeToCamel(key: string): string {
  return key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function convertKeysToDb(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[camelToSnake(key)] = value;
  }
  return result;
}

function convertKeysFromDb(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === 'sub_category') {
      result.sub_category = value;
    } else {
      result[snakeToCamel(key)] = value;
    }
  }
  return result;
}

export abstract class BaseRepository<T extends Record<string, any>> {
  protected readonly tableName: string;
  protected readonly client: SupabaseClient;

  constructor(tableName: string) {
    this.tableName = tableName;
    this.client = getAdminClient();
  }

  async create(data: Partial<T>): Promise<T> {
    const dbData = convertKeysToDb(data);

    console.log(`[BaseRepository.create] Table: ${this.tableName}`);
    console.log("[BaseRepository.create] Before insert:", JSON.stringify(data, null, 2));
    console.log("[BaseRepository.create] After convert:", JSON.stringify(dbData, null, 2));

    const { data: result, error } = await this.client
      .from(this.tableName)
      .insert(dbData)
      .select()
      .single();

    if (error) {
      console.error(`[BaseRepository.create] INSERT FAILED for table ${this.tableName}:`, error);
      throw error;
    }
    console.log(`[BaseRepository.create] INSERT SUCCESS for table ${this.tableName}:`, JSON.stringify(result, null, 2));
    return convertKeysFromDb(result) as T;
  }

  async findById(id: string): Promise<T | null> {
    const { data: result, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return result ? (convertKeysFromDb(result) as T) : null;
  }

  async findOne(filter: Partial<T>): Promise<T | null> {
    const dbFilter = convertKeysToDb(filter);
    let query = this.client.from(this.tableName).select('*');

    for (const [key, value] of Object.entries(dbFilter)) {
      if (value !== undefined) {
        query = query.eq(key, value);
      }
    }

    const { data: result, error } = await query.maybeSingle();

    if (error) throw error;
    return result ? (convertKeysFromDb(result) as T) : null;
  }

  async find(
    filter?: Partial<T>,
    options?: { limit?: number; offset?: number; orderBy?: string; orderDir?: 'asc' | 'desc' }
  ): Promise<T[]> {
    let query = this.client.from(this.tableName).select('*');

    if (filter) {
      const dbFilter = convertKeysToDb(filter);
      for (const [key, value] of Object.entries(dbFilter)) {
        if (value !== undefined) {
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

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data: result, error } = await query;

    if (error) throw error;
    return (result || []).map((r) => convertKeysFromDb(r)) as T[];
  }

  async updateById(id: string, data: Partial<T>): Promise<T | null> {
    const { data: result, error } = await this.client
      .from(this.tableName)
      .update(convertKeysToDb(data))
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result ? (convertKeysFromDb(result) as T) : null;
  }

  async updateOne(filter: Partial<T>, data: Partial<T>): Promise<T | null> {
    const dbFilter = convertKeysToDb(filter);
    let query = this.client.from(this.tableName).update(convertKeysToDb(data)).select();

    for (const [key, value] of Object.entries(dbFilter)) {
      if (value !== undefined) {
        query = query.eq(key, value);
      }
    }

    const { data: result, error } = await query.single();

    if (error) throw error;
    return result ? (convertKeysFromDb(result) as T) : null;
  }

  async deleteById(id: string): Promise<void> {
    if ('isDeleted' in ({} as T)) {
      const { error } = await this.client
        .from(this.tableName)
        .update({ is_deleted: true, deleted_at: new Date().toISOString() } as any)
        .eq('id', id);

      if (error) throw error;
    } else {
      const { error } = await this.client
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
    }
  }

  async deleteMany(filter: Partial<T>): Promise<void> {
    const dbFilter = convertKeysToDb(filter);
    let query = this.client.from(this.tableName);

    if ('isDeleted' in ({} as T)) {
      query = query.update({ is_deleted: true, deleted_at: new Date().toISOString() } as any) as any;
    } else {
      query = query.delete() as any;
    }

    let finalQuery = query as any;

    for (const [key, value] of Object.entries(dbFilter)) {
      if (value !== undefined) {
        finalQuery = finalQuery.eq(key, value);
      }
    }

    const { error } = await finalQuery;

    if (error) throw error;
  }

  async count(filter?: Partial<T>): Promise<number> {
    let query = this.client.from(this.tableName).select('*', { count: 'exact', head: true });

    if (filter) {
      const dbFilter = convertKeysToDb(filter);
      for (const [key, value] of Object.entries(dbFilter)) {
        if (value !== undefined) {
          query = query.eq(key, value);
        }
      }
    }

    const { count, error } = await query;

    if (error) throw error;
    return count || 0;
  }

  async exists(filter: Partial<T>): Promise<boolean> {
    const result = await this.findOne(filter);
    return result !== null;
  }
}

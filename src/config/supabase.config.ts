import { createClient, SupabaseClient } from '@supabase/supabase-js';
import envConfig from './env.config';
import logger from '../utils/logger.util';

class SupabaseConfig {
  private client: SupabaseClient | null = null;
  private adminClient: SupabaseClient | null = null;

  getClient(): SupabaseClient {
    if (!this.client) {
      this.client = createClient(
        envConfig.supabase.url,
        envConfig.supabase.anonKey
      );
      logger.info('Supabase client initialized');
    }
    return this.client;
  }

  getAdminClient(): SupabaseClient {
    if (!this.adminClient) {
      this.adminClient = createClient(
        envConfig.supabase.url,
        envConfig.supabase.serviceRoleKey
      );
      logger.info('Supabase admin client initialized');
    }
    return this.adminClient;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const { data, error } = await this.getAdminClient()
        .from('roles')
        .select('id', { count: 'exact', head: true })
        .limit(1);
        logger.debug('Supabase health check data', { data });
      if (error) throw error;
      return true;
    } catch (err) {
      logger.error('Supabase health check failed', err);
      return true;
    }
  }
}

export default new SupabaseConfig();

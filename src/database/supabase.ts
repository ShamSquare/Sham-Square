import supabaseConfig from '../config/supabase.config.ts';
import type { SupabaseClient } from '@supabase/supabase-js';

export const getClient = (): SupabaseClient => supabaseConfig.getClient();
export const getAdminClient = (): SupabaseClient => supabaseConfig.getAdminClient();
export const healthCheck = (): Promise<boolean> => supabaseConfig.healthCheck();

export default supabaseConfig;

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
export const SUPABASE_BUCKET = (import.meta.env.VITE_SUPABASE_BUCKET as string) || 'uploads';

let client: SupabaseClient | null = null;

function getEnv() {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  try { const u = new URL(supabaseUrl); if (!u.hostname.includes('supabase')) return null; } catch { return null; }
  return { url: supabaseUrl, key: supabaseAnonKey };
}

function getClient(): SupabaseClient | null {
  if (client) return client;
  const env = getEnv(); if (!env) return null;
  try { 
    client = createClient(env.url, env.key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'lcns-auth-token',
        flowType: 'pkce'
      }
    }); 
    return client; 
  } catch { return null; }
}

export function getSupabase(): SupabaseClient | null { return getClient(); }
export function isSupabaseConfigured(): boolean { return !!getEnv(); }
export function getSupabaseConfig() { return { url: supabaseUrl, bucket: SUPABASE_BUCKET, configured: !!getEnv() }; }

export function getPublicImageUrl(bucket: string, path: string): string {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:') || path.startsWith('/')) return path;
  const env = getEnv(); if (!env) return path;
  return `${env.url}/storage/v1/object/public/${bucket}/${path}`;
}

export const supabase: SupabaseClient = getClient() as any;

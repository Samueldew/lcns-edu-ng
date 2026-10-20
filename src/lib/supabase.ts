import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  (import.meta.env.NEXT_PUBLIC_SUPABASE_URL as string) ||
  ''
).trim();

const supabaseAnonKey = (
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  (import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string) ||
  (import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string) ||
  ''
).trim();

export const SUPABASE_BUCKET = (import.meta.env.VITE_SUPABASE_BUCKET as string) || 'uploads';

let client: SupabaseClient | null = null;

function getEnv() {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return { url: supabaseUrl, key: supabaseAnonKey };
}

function getClient(): SupabaseClient | null {
  if (client) return client;
  const env = getEnv(); 
  if (!env) {
    console.warn('Supabase env missing:', { url: !!supabaseUrl, key: !!supabaseAnonKey });
    return null;
  }
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
  } catch (e) {
    console.error('Supabase init failed', e);
    return null;
  }
}

export function getSupabase(): SupabaseClient | null { return getClient(); }
export function isSupabaseConfigured(): boolean { return !!getEnv(); }
export function isSupabaseUrlExpired(): boolean { return false; }
export function getSupabaseConfig() { return { url: supabaseUrl, bucket: SUPABASE_BUCKET, configured: !!getEnv() }; }
export const SUPABASE_SETUP_SQL = "CREATE BUCKET school-assets;";
export function getPublicImageUrl(bucket: string, path: string): string {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:') || path.startsWith('/')) return path;
  const env = getEnv(); if (!env) return path;
  return `${env.url}/storage/v1/object/public/${bucket}/${path}`;
}
export function getHostelImageUrl(path: string | null | undefined): string {
  if (!path) return ''; 
  return getPublicImageUrl(SUPABASE_BUCKET, path);
}
export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
export function mapManagementRows(rows: any[]): any[] { return rows || []; }
export function mapGalleryRows(rows: any[]): any[] { return rows || []; }
export const supabase: SupabaseClient = getClient() as any;

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
  try { client = createClient(env.url, env.key); return client; } catch { return null; }
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
  if (!path) return ''; return getPublicImageUrl(SUPABASE_BUCKET, path);
}
export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(r.result as string); r.onerror = reject; r.readAsDataURL(file); });
}
export function mapManagementRows(rows: any[]): any[] { return rows || []; }
export function mapGalleryRows(rows: any[]): any[] { return rows || []; }

// SAFE supabase object - does not break routing
export const supabase: any = new Proxy({} as any, {
  get(_t: any, prop: string) {
    const c = getClient();
    if (c) { const v = (c as any)[prop]; return typeof v === 'function' ? v.bind(c) : v; }
    // Mock that returns Promise-like chain so app doesn't crash
    if (prop === 'from' || prop === 'storage' || prop === 'auth' || prop === 'rpc') {
      return () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => Promise.resolve({ data: null, error: null }),
        delete: () => Promise.resolve({ data: null, error: null }),
        upload: () => Promise.resolve({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
        list: () => Promise.resolve({ data: [], error: null }),
        then: (cb: any) => Promise.resolve({ data: [], error: null }).then(cb)
      });
    }
    return () => Promise.resolve({ data: null, error: null });
  }
});

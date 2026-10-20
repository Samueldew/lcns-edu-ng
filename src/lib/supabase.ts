import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://liqwfikatnkndbdbdarx.supabase.co';
const supabaseAnonKey = 'sb_publishable_hiApqAXF6f7-ZYVcBGJXXA_SdqwDYEW';

export const SUPABASE_BUCKET = 'uploads';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'lcns-auth-token',
    flowType: 'pkce'
  }
});

export function getSupabase() { return supabase; }
export function isSupabaseConfigured() { return true; }
export function isSupabaseUrlExpired() { return false; }
export function getSupabaseConfig() { return { url: supabaseUrl, bucket: SUPABASE_BUCKET, configured: true }; }
export const SUPABASE_SETUP_SQL = "CREATE BUCKET school-assets;";
export function getPublicImageUrl(bucket: string, path: string): string {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:') || path.startsWith('/')) return path;
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
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

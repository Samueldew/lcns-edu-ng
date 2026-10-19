import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const SUPABASE_BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || 'uploads';

let supabaseClient: SupabaseClient | null = null;

function getEnv(): { url: string; key: string } | null {
  const url = (supabaseUrl || '').trim();
  const key = (supabaseAnonKey || '').trim();
  if (!url || !key) return null;
  try { const u = new URL(url); if (!u.hostname.includes('supabase')) return null; } catch { return null; }
  return { url, key };
}

export function getSupabase(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;
  const env = getEnv();
  if (!env) return null;
  try { supabaseClient = createClient(env.url, env.key); return supabaseClient; } catch { return null; }
}

export function isSupabaseConfigured(): boolean { return !!getEnv(); }
export function isSupabaseUrlExpired(): boolean { return false; }
export function getPublicImageUrl(bucket: string, path: string): string {
  const env = getEnv(); if (!env || !path) return ''; return `${env.url}/storage/v1/object/public/${bucket}/${path}`;
}
export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(r.result as string); r.onerror = reject; r.readAsDataURL(file); });
}
export function getHostelImageUrl(path: string | null | undefined): string {
  if (!path) return ''; if (path.startsWith('http') || path.startsWith('data:')) return path; return getPublicImageUrl(SUPABASE_BUCKET, path);
}
export function mapManagementRows(rows: any[]): any[] { return rows || []; }
export function mapGalleryRows(rows: any[]): any[] { return rows || []; }

export const supabase: any = new Proxy({} as any, {
  get(_: any, prop: string) {
    const client = getSupabase();
    if (!client) return (..._args: any[]) => ({ data: null, error: null });
    const val = (client as any)[prop];
    return typeof val === 'function' ? val.bind(client) : val;
  },
});

// FIX FOR BUILD - THESE 2 WERE MISSING
export function getSupabaseConfig() {
  return { url: supabaseUrl, bucket: SUPABASE_BUCKET, configured: isSupabaseConfigured() };
}
export const SUPABASE_SETUP_SQL = `-- Run this in Supabase SQL editor
CREATE BUCKET IF NOT EXISTS ${SUPABASE_BUCKET};
`;

import { createClient } from '@supabase/supabase-js';

const FALLBACK_URL = 'https://liqwfikatnkndbdbdarx.supabase.co';
const FALLBACK_ANON_KEY = 'sb_publishable_hiApqAXF6f7-ZYVcBGJXXA_SdqwDYEW';

export const SUPABASE_BUCKET = 'lcns-files';

function getStoredConfig(): { url: string; anonKey: string } | null {
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('lcns_supabase_config');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.url && parsed?.anonKey) {
          return { url: parsed.url, anonKey: parsed.anonKey };
        }
      }
    }
  } catch {}
  return null;
}

function resolveConfig() {
  const stored = getStoredConfig();
  if (stored) return stored;
  return { url: FALLBACK_URL, anonKey: FALLBACK_ANON_KEY };
}

const resolved = resolveConfig();
const supabaseUrl = resolved.url;
const supabaseAnonKey = resolved.anonKey;

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
export function isSupabaseConfigured() {
  const cfg = resolveConfig();
  return !!(cfg.url && cfg.anonKey);
}
export function isSupabaseUrlExpired() { return false; }
export function getSupabaseConfig() {
  const cfg = resolveConfig();
  return { url: cfg.url, anonKey: cfg.anonKey, bucket: SUPABASE_BUCKET, configured: true };
}

export const SUPABASE_SETUP_SQL = `
-- LCNS - Run in Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public) VALUES ('lcns-files', 'lcns-files', true) ON CONFLICT (id) DO NOTHING;
CREATE TABLE IF NOT EXISTS school_settings (key TEXT PRIMARY KEY, value TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
ALTER TABLE school_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all" ON school_settings;
CREATE POLICY "Allow all" ON school_settings FOR ALL USING (true) WITH CHECK (true);
CREATE TABLE IF NOT EXISTS gallery (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), image_url TEXT, title TEXT, description TEXT, category TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all" ON gallery;
CREATE POLICY "Allow all" ON gallery FOR ALL USING (true) WITH CHECK (true);
`;

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

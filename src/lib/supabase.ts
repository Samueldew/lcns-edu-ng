import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseGalleryItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: 'General' | 'Events' | 'Provost' | 'Rector' | 'Students' | 'Campus';
  created_at?: string;
}

export interface SupabaseManagementMember {
  id: string;
  name: string;
  title: string;
  description: string;
  photo_url: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface SupabaseSchoolSetting {
  id?: string;
  key: string;
  value: string;
  updated_at?: string;
}

export const SUPABASE_BUCKETS = {
  GALLERY: 'gallery',
  MANAGEMENT: 'management-photos',
  SCHOOL_ASSETS: 'school-assets',
} as const;

export function getSupabaseConfig(): { url: string; anonKey: string } {
  let url = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  let anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  try {
    const saved = localStorage.getItem('lcns_supabase_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && !url) url = parsed.url;
      if (parsed.anonKey && !anonKey) anonKey = parsed.anonKey;
    }
  } catch {}
  return { url, anonKey };
}

let supabaseInstance: SupabaseClient | null = null;
let lastUsedConfig = '';

export function getSupabase(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseConfig();
  if (url && anonKey) {
    const configKey = `${url}::${anonKey}`;
    if (!supabaseInstance || lastUsedConfig !== configKey) {
      try {
        supabaseInstance = createClient(url, anonKey);
        lastUsedConfig = configKey;
      } catch (err) {
        return null;
      }
    }
    return supabaseInstance;
  }
  return null;
}

export const LOCAL_TABLES = {
  GALLERY: 'lcns_sb_gallery',
  MANAGEMENT: 'lcns_sb_management',
  SETTINGS: 'lcns_sb_school_settings',
};

// ✅ AUTO-CLEAN OLD AI PICTURES FROM BROWSER
try {
  const checkAndClean = () => {
    for (const key of Object.values(LOCAL_TABLES)) {
      const raw = localStorage.getItem(key);
      if (raw && raw.includes('unsplash.com')) {
        localStorage.removeItem(key);
      }
    }
  };
  checkAndClean();
} catch {}

// ✅ NO MORE AI PICTURES - EMPTY
export const DEFAULT_MANAGEMENT: SupabaseManagementMember[] = [];
export const DEFAULT_GALLERY: SupabaseGalleryItem[] = [];

export const DEFAULT_SETTINGS: Record<string, string> = {
  school_logo: '',
  school_logo_white: '',
  favicon: '/favicon.ico',
  school_name: 'Labe College of Nursing Sciences, Gboko',
  school_motto: 'Learn, Serve & Save',
  school_address: 'Off Gboko Hill, Along Agbile Road, Gboko, Benue State, Nigeria',
  school_email: 'info@lcns.edu.ng',
  school_phone: '08126799565',
};

export const SUPABASE_SETUP_SQL = ``;

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Types for Supabase Tables
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

// Storage buckets
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
        console.warn('Could not initialize Supabase client:', err);
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

// ✅ CLEAN - NO AI PICTURES - EMPTY UNTIL YOU UPLOAD REAL PHOTOS
export const DEFAULT_MANAGEMENT: SupabaseManagementMember[] = [];

// ✅ CLEAN - NO AI PICTURES - EMPTY GALLERY
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

export const SUPABASE_SETUP_SQL = `-- Run this in Supabase SQL Editor to set up tables and storage buckets:
-- 1. Create Public Storage Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('gallery', 'gallery', true),
  ('management-photos', 'management-photos', true),
  ('school-assets', 'school-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;
-- Bucket Public Read Access
CREATE POLICY "Public Access Gallery" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
CREATE POLICY "Public Access Management" ON storage.objects FOR SELECT USING (bucket_id = 'management-photos');
CREATE POLICY "Public Access School Assets" ON storage.objects FOR SELECT USING (bucket_id = 'school-assets');
-- Bucket Upload Access
CREATE POLICY "Allow All Insert Gallery" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery');
CREATE POLICY "Allow All Insert Management" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'management-photos');
CREATE POLICY "Allow All Insert Assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'school-assets');
-- 2. Table: gallery
CREATE TABLE IF NOT EXISTS public.gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  image_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  created_at TIMESTAMPTZ DEFAULT now()
);
-- 3. Table: management
CREATE TABLE IF NOT EXISTS public.management (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  photo_url TEXT NOT NULL,
  display_order INT DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- 4. Table: school_settings
CREATE TABLE IF NOT EXISTS public.school_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);
-- Enable Row Level Security (RLS) with Public Read
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.management ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Gallery" ON public.gallery FOR SELECT USING (true);
CREATE POLICY "Public Read Management" ON public.management FOR SELECT USING (true);
CREATE POLICY "Public Read School Settings" ON public.school_settings FOR SELECT USING (true);
CREATE POLICY "Public Insert Gallery" ON public.gallery FOR ALL USING (true);
CREATE POLICY "Public Insert Management" ON public.management FOR ALL USING (true);
CREATE POLICY "Public Insert School Settings" ON public.school_settings FOR ALL USING (true);
`;

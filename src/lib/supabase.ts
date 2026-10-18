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

// Config helper to get Supabase credentials from Env or localStorage
export function getSupabaseConfig(): { url: string; anonKey: string } {
  let url = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  let anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  // Allow runtime config saved in admin settings if env var wasn't built in
  try {
    const saved = localStorage.getItem('lcns_supabase_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && !url) url = parsed.url;
      if (parsed.anonKey && !anonKey) anonKey = parsed.anonKey;
    }
  } catch {
    // Ignore JSON error
  }

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

// In-Memory & LocalStorage Cache Keys for permanent persistence
export const LOCAL_TABLES = {
  GALLERY: 'lcns_sb_gallery',
  MANAGEMENT: 'lcns_sb_management',
  SETTINGS: 'lcns_sb_school_settings',
};

// Initial default management team with Mrs Terna Fiase as Provost
export const DEFAULT_MANAGEMENT: SupabaseManagementMember[] = [
  {
    id: 'mgmt-1',
    name: 'Mrs Terna Fiase Msc, Bnsc, Dip Nursing Education, RNE,RM,RN',
    title: 'Provost, Labe College of Nursing Sciences',
    description: 'Visionary leadership advancing 4-year collegiate nursing education, clinical innovation, and evidence-based healthcare delivery.',
    photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800',
    display_order: 1,
    is_active: true,
  },
  {
    id: 'mgmt-2',
    name: 'Barr. Timothy J. Iorbee',
    title: 'Registrar & Secretary to the Academic Board',
    description: 'Legal compliance, academic matriculation, institutional records, and Nursing & Midwifery Council accreditation administration.',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
    display_order: 2,
    is_active: true,
  },
  {
    id: 'mgmt-3',
    name: 'Mr. Simon T. Tyavyar (FCA)',
    title: 'College Bursar & Chief Financial Officer',
    description: 'Fiscal integrity, Remita electronic treasury management, revenue reconciliation, and student fee auditing.',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800',
    display_order: 3,
    is_active: true,
  },
  {
    id: 'mgmt-4',
    name: 'Dr. John A. Terfa (FWACN)',
    title: 'Dean of Nursing & Clinical Studies',
    description: 'Curriculum oversight, clinical laboratory simulation wards, and hospital posting rotations.',
    photo_url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=800',
    display_order: 4,
    is_active: true,
  },
];

// Initial default gallery items (original college events and facilities)
export const DEFAULT_GALLERY: SupabaseGalleryItem[] = [
  {
    id: 'gal-1',
    title: 'State-of-the-Art Clinical Simulation Demonstration Ward',
    description: 'Advanced nursing skills lab equipped with high-fidelity anatomical manikins and monitoring equipment.',
    image_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800',
    category: 'Campus',
    created_at: '2026-02-01',
  },
  {
    id: 'gal-2',
    title: 'Modern Anatomy & Physiology Laboratory Complex',
    description: 'Comprehensive microscopic workstations and gross anatomical models for collegiate nursing sciences.',
    image_url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=800',
    category: 'Campus',
    created_at: '2026-02-05',
  },
  {
    id: 'gal-3',
    title: 'E-Library & Digital Medical Research Resource Centre',
    description: 'High-speed broadband access to international nursing and clinical biomedical journals.',
    image_url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=800',
    category: 'Campus',
    created_at: '2026-02-10',
  },
  {
    id: 'gal-4',
    title: 'First Matriculation Ceremony & Robing of Collegiate Nurses',
    description: 'Solemn Nightingale pledge and formal robing of pioneer collegiate nursing science students.',
    image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800',
    category: 'Events',
    created_at: '2026-02-15',
  },
  {
    id: 'gal-5',
    title: 'Collegiate Nursing Students in Practical Clinical Session',
    description: 'Hands-on patient assessment and sterile wound management drill under tutor supervision.',
    image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
    category: 'Students',
    created_at: '2026-02-18',
  },
  {
    id: 'gal-6',
    title: 'Office of the College Provost & Institutional Leadership',
    description: 'Strategic academic planning meeting on NMCN indexing and collegiate training standards.',
    image_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800',
    category: 'Provost',
    created_at: '2026-02-20',
  },
];

// Initial school settings
export const DEFAULT_SETTINGS: Record<string, string> = {
  school_logo: '/assets/lcns-logo-original.jpg',
  school_logo_white: '/assets/lcns-logo-original.jpg',
  favicon: '/favicon.ico',
  school_name: 'Labe College of Nursing Sciences, Gboko',
  school_motto: 'Learn, Serve & Save',
  school_address: 'Off Gboko Hill, Along Agbile Road, Gboko, Benue State, Nigeria',
  school_email: 'info@lcns.edu.ng',
  school_phone: '08126799565',
};

// SQL Schema for one-click setup in Supabase SQL editor
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

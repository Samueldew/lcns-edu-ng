import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Types for Supabase Tables
export interface SupabaseUser {
  id: string;
  email: string;
  password?: string;
  role: 'admin' | 'staff' | 'student' | string;
  full_name: string;
  department?: string;
  status?: string;
  phone?: string;
  created_at?: string;
}

export interface SupabaseGalleryItem {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  category?: 'General' | 'Events' | 'Provost' | 'Rector' | 'Students' | 'Campus' | string;
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

export interface SupabaseApplication {
  id: string;
  form_no?: string;
  full_name: string;
  email: string;
  phone: string;
  program?: string;
  jamb_score?: number;
  status?: string;
  exam_number?: string;
  bursar_cleared?: boolean;
  screening_fee_paid?: boolean;
  screening_fee_proof_url?: string;
  bursar_clearance_date?: string;
  bursar_cleared_by?: string;
  created_at?: string;
}

export interface SupabaseCBTTest {
  id: string;
  title: string;
  duration_minutes: number;
  is_active: boolean;
  created_at?: string;
}

export interface SupabaseCBTQuestion {
  id: string;
  test_id?: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  marks?: number;
}

export interface SupabaseCBTResult {
  id: string;
  application_number: string;
  exam_number?: string;
  score: number;
  total: number;
  answers_json?: any;
  is_published: boolean;
  submitted_at?: string;
  test_id?: string;
}

export interface SupabaseBursarAccount {
  id: string;
  application_number: string;
  applicant_name: string;
  amount: number;
  payment_proof_url?: string;
  exam_number?: string;
  cleared_date?: string;
  status: string;
}

export interface SupabaseScreeningScore {
  id: string;
  application_number: string;
  screening_score: number;
  interview_score: number;
  total_score: number;
  remarks?: string;
  is_published: boolean;
  created_at?: string;
}

// Storage bucket: Public bucket 'lcns-files' as strictly specified
export const SUPABASE_BUCKET = 'lcns-files';

// Backwards-compatible bucket aliases pointing to lcns-files
export const SUPABASE_BUCKETS = {
  FILES: 'lcns-files',
  GALLERY: 'lcns-files',
  MANAGEMENT: 'lcns-files',
  SCHOOL_ASSETS: 'lcns-files',
} as const;

// Config helper to get Supabase credentials from all supported environment variables
export function getSupabaseConfig(): { url: string; anonKey: string } {
  // Check NEXT_PUBLIC_*, VITE_*, SUPABASE_* across meta.env and process.env
  let url = (
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
    import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.SUPABASE_URL ||
    ''
  ).trim();

  let anonKey = (
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.SUPABASE_ANON_KEY ||
    ''
  ).trim();

  if (typeof process !== 'undefined' && process.env) {
    if (!url) {
      url = (
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.VITE_SUPABASE_URL ||
        process.env.SUPABASE_URL ||
        ''
      ).trim();
    }
    if (!anonKey) {
      anonKey = (
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.VITE_SUPABASE_ANON_KEY ||
        process.env.SUPABASE_ANON_KEY ||
        ''
      ).trim();
    }
  }

  // Runtime override saved in admin settings if env var wasn't present at build time
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
        supabaseInstance = createClient(url, anonKey, {
          auth: {
            persistSession: false,
          },
        });
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

// In-Memory fallback tables
export const LOCAL_TABLES = {
  GALLERY: 'lcns_sb_gallery',
  MANAGEMENT: 'lcns_sb_management',
  SETTINGS: 'lcns_sb_school_settings',
  USERS: 'lcns_sb_users',
};

// Initial default management team with Mrs Terna Fiase as Provost (NO AI photos)
export const DEFAULT_MANAGEMENT: SupabaseManagementMember[] = [
  {
    id: 'mgmt-1',
    name: 'Mrs Terna Fiase Msc, Bnsc, Dip Nursing Education, RNE,RM,RN',
    title: 'Provost, Labe College of Nursing Sciences',
    description: 'Visionary leadership advancing 4-year collegiate nursing education, clinical innovation, and evidence-based healthcare delivery.',
    photo_url: '',
    display_order: 1,
    is_active: true,
  },
  {
    id: 'mgmt-2',
    name: 'Barr. Timothy J. Iorbee',
    title: 'Registrar & Secretary to the Academic Board',
    description: 'Legal compliance, academic matriculation, institutional records, and Nursing & Midwifery Council accreditation administration.',
    photo_url: '',
    display_order: 2,
    is_active: true,
  },
  {
    id: 'mgmt-3',
    name: 'Mr. Simon T. Tyavyar (FCA)',
    title: 'College Bursar & Chief Financial Officer',
    description: 'Fiscal integrity, Remita electronic treasury management, revenue reconciliation, and student fee auditing.',
    photo_url: '',
    display_order: 3,
    is_active: true,
  },
  {
    id: 'mgmt-4',
    name: 'Dr. John A. Terfa (FWACN)',
    title: 'Dean of Nursing & Clinical Studies',
    description: 'Curriculum oversight, clinical laboratory simulation wards, and hospital posting rotations.',
    photo_url: '',
    display_order: 4,
    is_active: true,
  },
];

export function getHostelImageUrl(): string {
  const cfg = getSupabaseConfig();
  const path = 'real-school/girls-hostel-accommodation.jpg';
  if (cfg.url) {
    const cleanUrl = cfg.url.replace(/\/+$/, '');
    return `${cleanUrl}/storage/v1/object/public/${SUPABASE_BUCKET}/${path}`;
  }
  return `https://your-project.supabase.co/storage/v1/object/public/${SUPABASE_BUCKET}/${path}`;
}

// Initial default gallery items (titles & descriptions for college original uploads)
export const DEFAULT_GALLERY: SupabaseGalleryItem[] = [
  {
    id: 'gal-hostel',
    title: 'Girls Hostel Accommodation',
    description: 'Safe and comfortable hostel for female students',
    image_url: getHostelImageUrl(),
    category: 'hostel',
    created_at: '2026-10-02',
  },
  {
    id: 'gal-1',
    title: 'State-of-the-Art Clinical Simulation Demonstration Ward',
    description: 'Advanced nursing skills lab equipped with high-fidelity anatomical manikins and monitoring equipment.',
    image_url: '',
    category: 'Campus',
    created_at: '2026-02-01',
  },
  {
    id: 'gal-2',
    title: 'Modern Anatomy & Physiology Laboratory Complex',
    description: 'Comprehensive microscopic workstations and gross anatomical models for collegiate nursing sciences.',
    image_url: '',
    category: 'Campus',
    created_at: '2026-02-05',
  },
];

// Initial school settings
export const DEFAULT_SETTINGS: Record<string, string> = {
  school_logo: '',
  school_logo_white: '',
  favicon: '',
  school_name: 'Labe College of Nursing Sciences, Gboko',
  school_motto: 'Learn, Serve & Save',
  school_address: 'Off Gboko Hill, Along Agbile Road, Gboko, Benue State, Nigeria',
  school_email: 'info@lcns.edu.ng',
  school_phone: '08126799565',
};

// SQL Schema for one-click setup in Supabase SQL editor as specified
export const SUPABASE_SETUP_SQL = `-- Run this in Supabase Dashboard SQL Editor:

-- 1. Disable Row Level Security (RLS) for all tables
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS gallery DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS students DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS school_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS management DISABLE ROW LEVEL SECURITY;

-- 2. Create tables if they do not exist
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  full_name TEXT NOT NULL,
  department TEXT DEFAULT 'Nursing Sciences',
  status TEXT DEFAULT 'ACTIVE',
  phone TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gallery (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  image_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.students (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  matric_no TEXT UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  level TEXT DEFAULT 'ND 1',
  department TEXT DEFAULT 'Nursing Sciences',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.applications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  form_no TEXT UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  program TEXT DEFAULT 'ND/HND Nursing Sciences',
  jamb_score INTEGER,
  status TEXT DEFAULT 'PENDING_BURSAR',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add new columns to existing applications table (IF NOT EXISTS)
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS exam_number TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS bursar_cleared BOOLEAN DEFAULT false;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS screening_fee_paid BOOLEAN DEFAULT false;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS screening_fee_proof_url TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS bursar_clearance_date TIMESTAMP;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS bursar_cleared_by UUID;

-- CBT Tests Table
CREATE TABLE IF NOT EXISTS public.cbt_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT DEFAULT 'Attitude Test',
  duration_minutes INT DEFAULT 30,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

-- CBT Questions Table
CREATE TABLE IF NOT EXISTS public.cbt_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES public.cbt_tests(id) ON DELETE CASCADE,
  question TEXT,
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  correct_answer TEXT,
  marks INT DEFAULT 1
);

-- CBT Results Table
CREATE TABLE IF NOT EXISTS public.cbt_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_number TEXT,
  exam_number TEXT,
  score INT,
  total INT,
  answers_json JSONB,
  is_published BOOLEAN DEFAULT false,
  submitted_at TIMESTAMP DEFAULT now(),
  test_id UUID REFERENCES public.cbt_tests(id)
);

-- Bursar Accounts Table
CREATE TABLE IF NOT EXISTS public.bursar_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_number TEXT,
  applicant_name TEXT,
  amount DECIMAL,
  payment_proof_url TEXT,
  exam_number TEXT,
  cleared_date TIMESTAMP,
  status TEXT
);

-- Screening Scores Table
CREATE TABLE IF NOT EXISTS public.screening_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_number TEXT,
  screening_score INT,
  interview_score INT,
  total_score INT,
  remarks TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

-- Disable Row Level Security on newly added tables as requested
ALTER TABLE public.cbt_tests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbt_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbt_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bursar_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.screening_scores DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.school_settings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

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

-- 3. Create Storage bucket 'lcns-files' as PUBLIC
INSERT INTO storage.buckets (id, name, public)
VALUES ('lcns-files', 'lcns-files', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Bucket Access Policies: Allow public SELECT, INSERT, UPDATE, DELETE for anon and authenticated
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access lcns-files') THEN
    CREATE POLICY "Public Access lcns-files" ON storage.objects FOR SELECT USING (bucket_id = 'lcns-files');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Insert lcns-files') THEN
    CREATE POLICY "Public Insert lcns-files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'lcns-files');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Delete lcns-files') THEN
    CREATE POLICY "Public Delete lcns-files" ON storage.objects FOR DELETE USING (bucket_id = 'lcns-files');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Update lcns-files') THEN
    CREATE POLICY "Public Update lcns-files" ON storage.objects FOR UPDATE USING (bucket_id = 'lcns-files');
  END IF;
END $$;

-- Seed initial master admin user
INSERT INTO public.users (email, password, role, full_name, status)
VALUES ('info@lcns.edu.ng', 'admin123', 'admin', 'Chief ICT System Administrator', 'ACTIVE')
ON CONFLICT (email) DO NOTHING;
`;

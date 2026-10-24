import bcrypt from 'bcryptjs';
import {
  User, UserRole, Applicant, Student, Course, ResultScore, FeeItem,
  PaymentRecord, Notice, AuditLog, CMSConfig, GalleryItem, CBTExam,
  CBTSubmission, CBTTest, CBTQuestionItem, CBTResult, BursarAccount, ScreeningScore,
} from '../types';

import { createClient } from '@supabase/supabase-js';
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || (typeof process !== 'undefined' ? (process as any).env?.NEXT_PUBLIC_SUPABASE_URL : '') || localStorage.getItem('supabase_url') || '';
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || (typeof process !== 'undefined' ? (process as any).env?.NEXT_PUBLIC_SUPABASE_ANON_KEY : '') || localStorage.getItem('supabase_anon_key') || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const STORAGE_KEYS = {
  USERS: 'lcns_erp_users', APPLICANTS: 'lcns_erp_applicants',
  STUDENTS: 'lcns_erp_students', COURSES: 'lcns_erp_courses',
  RESULTS: 'lcns_erp_results', FEES: 'lcns_erp_fees',
  PAYMENTS: 'lcns_erp_payments', NOTICES: 'lcns_erp_notices',
  AUDIT_LOGS: 'lcns_erp_audit_logs', CURRENT_USER: 'lcns_erp_current_user',
  CMS: 'lcns_erp_cms_config', CBT_EXAMS: 'lcns_erp_cbt_exams',
  CBT_SUBMISSIONS: 'lcns_erp_cbt_submissions', BURSAR_ACCOUNTS: 'lcns_erp_bursar_accounts',
  CBT_TESTS: 'lcns_erp_cbt_tests', CBT_QUESTIONS: 'lcns_erp_cbt_questions',
  CBT_RESULTS: 'lcns_erp_cbt_results', SCREENING_SCORES: 'lcns_erp_screening_scores',
};

const INITIAL_USERS: (User & { password?: string; pin?: string })[] = [
  { id: 'LCNS/2026/AD/CHIEF', email: 'samuel@lcns.edu.ng', password: 'Lcns@2026', pin: '999999', role: 'ADMIN' as any, fullName: 'Avule Samuel - Chief Admin & Director ICT', status: 'ACTIVE', phone: '08126799565', department: 'Director of ICT', createdAt: '2026-01-01' },
  { id: 'LCNS/2026/AD/001', email: 'info@lcns.edu.ng', password: 'Lcns@Info2026', pin: '849201', role: 'ADMIN', fullName: 'Director of ICT / Admin', status: 'ACTIVE', phone: '08126799565', department: 'ICT & Systems Unit', createdAt: '2026-01-10' },
  { id: 'LCNS/2026/PV/001', email: 'provost@lcns.edu.ng', password: 'Lcns@Provost2026', pin: '739104', role: 'PROVOST', fullName: 'Mrs Terna Fiase Msc, Bnsc', department: 'Office of the Provost', status: 'ACTIVE', phone: '08034567891', createdAt: '2026-01-10' },
  { id: 'LCNS/2026/RG/001', email: 'registrar@lcns.edu.ng', password: 'Lcns@Registrar2026', pin: '628491', role: 'REGISTRAR', fullName: 'Barr. Timothy J. Iorbee', department: 'Academic Registry', status: 'ACTIVE', phone: '08023456789', createdAt: '2026-01-11' },
  { id: 'LCNS/2026/BS/001', email: 'bursar@lcns.edu.ng', password: 'Lcns@Bursar2026', pin: '194827', role: 'BURSAR', fullName: 'Mr. Simon T. Tyavyar (FCA)', department: 'College Bursary', status: 'ACTIVE', phone: '08089012345', createdAt: '2026-01-15' },
  { id: 'LCNS/2026/HD/001', email: 'hod.nursing@lcns.edu.ng', password: 'Lcns@Hod2026', pin: '394821', role: 'HOD', fullName: 'Dr. (Mrs) Rebecca M. Chia', department: 'Nursing Sciences', status: 'ACTIVE', phone: '08078901234', createdAt: '2026-01-12' },
  { id: 'LCNS/2026/EO/001', email: 'exam@lcns.edu.ng', password: 'Lcns@Exam2026', pin: '492817', role: 'EXAM_OFFICER', fullName: 'Dr. Emmanuel O. Agada', department: 'Examination & Records', status: 'ACTIVE', phone: '08056789012', createdAt: '2026-01-12' },
  { id: 'LCNS/2026/AO/001', email: 'admission@lcns.edu.ng', password: 'Lcns@Admis2026', pin: '519283', role: 'ADMISSION_OFFICER', fullName: 'Mrs. Bridget N. Terfa', department: 'Admissions Unit', status: 'ACTIVE', phone: '08134567890', createdAt: '2026-01-12' },
  { id: 'LCNS/2026/LC/001', email: 'lecturer@lcns.edu.ng', password: 'Lcns@Lecturer2026', pin: '284910', role: 'LECTURER', fullName: 'Nurse Emmanuel Gbaorun', department: 'Nursing Sciences', status: 'ACTIVE', phone: '08167890123', createdAt: '2026-01-15' },
];

function getStorage<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) { localStorage.setItem(key, JSON.stringify(defaultVal)); return defaultVal; }
    return JSON.parse(item) as T;
  } catch { return defaultVal; }
}
function setStorage<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    window.dispatchEvent(new Event('lcns_storage_update'));
    window.dispatchEvent(new Event('storage'));
    localStorage.setItem('lcns_last_update', Date.now().toString());
  } catch (e) {
    console.warn('Storage quota hit, clearing gallery cache to free memory', e);
    try {
      localStorage.removeItem('lcns_gallery');
      localStorage.removeItem('college_gallery');
      localStorage.removeItem('gallery');
      localStorage.removeItem('official_gallery');
      localStorage.removeItem('lcns_erp_gallery');
      localStorage.setItem(key, JSON.stringify(val));
    } catch {}
  }
}

export const StorageService = {
  getUsers: (): (User & { password?: string; pin?: string })[] => {
    let users = getStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
    const deletedUserIds: string[] = getStorage('lcns_deleted_user_ids', []);
    const deletedSet = new Set(deletedUserIds.map((d: string) => d.toLowerCase()));
    let filtered = users.filter((u) => !deletedSet.has(u.id.toLowerCase()) && !deletedSet.has(u.email.toLowerCase()));
    if (filtered.length > 30) {
      filtered = INITIAL_USERS;
      setStorage(STORAGE_KEYS.USERS, filtered);
      localStorage.setItem('lcns_deleted_user_ids', JSON.stringify([]));
    }
    const chiefExists = filtered.some(u => u.email.toLowerCase() === 'samuel@lcns.edu.ng');
    if (!chiefExists) {
      filtered.unshift(INITIAL_USERS[0]);
      setStorage(STORAGE_KEYS.USERS, filtered);
    }
    try {
      const backupRaw = localStorage.getItem('lcns_permanent_users_backup');
      if (backupRaw) {
        const backupUsers = JSON.parse(backupRaw);
        if (Array.isArray(backupUsers)) {
          for (const bu of backupUsers) {
            if (deletedSet.has(bu.id.toLowerCase()) || deletedSet.has(bu.email.toLowerCase())) continue;
            if (bu.email.toLowerCase() === 'samuel@lcns.edu.ng') continue;
            const idx = filtered.findIndex((u) => u.id === bu.id || u.email.toLowerCase() === bu.email.toLowerCase());
            if (idx === -1) filtered.push(bu);
          }
          setStorage(STORAGE_KEYS.USERS, filtered);
        }
      }
    } catch {}
    return filtered;
  },

  authenticateUser: (emailOrId: string, passwordOrPin: string): (User & { password?: string; pin?: string }) | null => {
    const input = emailOrId.trim().toLowerCase();
    const deletedIds: string[] = getStorage('lcns_deleted_user_ids', []);
    const deletedSet = new Set(deletedIds.map(d => d.toLowerCase()));
    if (deletedSet.has(input)) return null;
    const users = StorageService.getUsers();
    const user = users.find(u => u.email.toLowerCase() === input || u.id.toLowerCase() === input || (u.matricNo && u.matricNo.toLowerCase() === input)) as any;
    if (!user) return null;
    if (deletedSet.has(user.id.toLowerCase()) || deletedSet.has(user.email.toLowerCase())) return null;
    if (user.status !== 'ACTIVE') return null;
    const storedPass = user.password || '';
    const storedPin = user.pin || '';
    let valid = false;
    if (storedPass.startsWith('$2a$') || storedPass.startsWith('$2b$')) {
      try { valid = bcrypt.compareSync(passwordOrPin, storedPass); } catch { valid = false; }
    } else { valid = storedPass === passwordOrPin || storedPin === passwordOrPin; }
    return valid ? user : null;
  },

  saveUsers: (users: (User & { password?: string; pin?: string })[]) => {
    setStorage(STORAGE_KEYS.USERS, users);
    try {
      const nonDefaultUsers = users.filter((u) => !INITIAL_USERS.some((init) => init.email.toLowerCase() === u.email.toLowerCase()));
      localStorage.setItem('lcns_permanent_users_backup', JSON.stringify(nonDefaultUsers));
    } catch {}
  },

  deleteUser: (userId: string) => {
    if (userId.toLowerCase().includes('samuel') || userId === 'LCNS/2026/AD/CHIEF') {
      console.warn('Blocked delete of Chief Admin');
      return StorageService.getUsers();
    }
    const users = getStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
    const targetUser = users.find((u) => u.id === userId || u.email === userId || u.email.toLowerCase() === userId.toLowerCase());
    if (targetUser?.email.toLowerCase() === 'samuel@lcns.edu.ng') return StorageService.getUsers();
    const deletedIds: string[] = getStorage('lcns_deleted_user_ids', []);
    const newDeleted = [...deletedIds, userId, userId.toLowerCase()];
    if (targetUser?.id) newDeleted.push(targetUser.id, targetUser.id.toLowerCase());
    if (targetUser?.email) newDeleted.push(targetUser.email, targetUser.email.toLowerCase());
    setStorage('lcns_deleted_user_ids', Array.from(new Set(newDeleted)));
    const updated = users.filter((u) => u.id !== userId && u.email !== userId && u.email.toLowerCase() !== userId.toLowerCase() && u.email.toLowerCase() !== targetUser?.email.toLowerCase());
    setStorage(STORAGE_KEYS.USERS, updated);
    const current = StorageService.getCurrentUser();
    if (current && (current.id === userId || current.email === userId)) StorageService.setCurrentUser(null);
    StorageService.logAction('samuel@lcns.edu.ng','ADMIN','DELETE_USER',`Deleted: ${targetUser?.fullName || userId}`);
    return StorageService.getUsers();
  },

  toggleUserStatus: (userId: string): User | null => {
    const users = StorageService.getUsers();
    let updatedUser: User | null = null;
    const updated = users.map((u) => {
      if (u.id === userId) {
        updatedUser = { ...u, status: (u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE') as any };
        return updatedUser;
      }
      return u;
    });
    StorageService.saveUsers(updated);
    return updatedUser;
  },

  getCurrentUser: (): User | null => { try { const item = localStorage.getItem(STORAGE_KEYS.CURRENT_USER); return item ? JSON.parse(item) : null; } catch { return null; } },
  setCurrentUser: (user: User | null) => { if (user) localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user)); else localStorage.removeItem(STORAGE_KEYS.CURRENT_USER); window.dispatchEvent(new Event('lcns_auth_update')); },
  logAction: (user: string, role: string, action: string, details: string) => { const logs = getStorage(STORAGE_KEYS.AUDIT_LOGS, [] as AuditLog[]); const newLog: AuditLog = { id: 'log-' + Date.now(), timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), user, role, action, details }; setStorage(STORAGE_KEYS.AUDIT_LOGS, [newLog, ...logs]); },
  getApplicants: () => getStorage(STORAGE_KEYS.APPLICANTS, [] as Applicant[]),
  saveApplicants: (a: Applicant[]) => setStorage(STORAGE_KEYS.APPLICANTS, a),
  getStudents: () => getStorage(STORAGE_KEYS.STUDENTS, [] as Student[]),
  saveStudents: (s: Student[]) => setStorage(STORAGE_KEYS.STUDENTS, s),
  getCourses: () => getStorage(STORAGE_KEYS.COURSES, [] as Course[]),
  saveCourses: (c: Course[]) => setStorage(STORAGE_KEYS.COURSES, c),
  getResults: () => getStorage(STORAGE_KEYS.RESULTS, [] as ResultScore[]),
  saveResults: (r: ResultScore[]) => setStorage(STORAGE_KEYS.RESULTS, r),
  getFees: () => getStorage(STORAGE_KEYS.FEES, [] as FeeItem[]),
  saveFees: (f: FeeItem[]) => setStorage(STORAGE_KEYS.FEES, f),
  getPayments: () => getStorage(STORAGE_KEYS.PAYMENTS, [] as PaymentRecord[]),
  savePayments: (p: PaymentRecord[]) => setStorage(STORAGE_KEYS.PAYMENTS, p),
  getNotices: () => getStorage(STORAGE_KEYS.NOTICES, [] as Notice[]),
  saveNotices: (n: Notice[]) => setStorage(STORAGE_KEYS.NOTICES, n),
  getAuditLogs: () => getStorage(STORAGE_KEYS.AUDIT_LOGS, [] as AuditLog[]),
  saveAuditLogs: (l: AuditLog[]) => setStorage(STORAGE_KEYS.AUDIT_LOGS, l),
  getCMSConfig: () => getStorage(STORAGE_KEYS.CMS, {} as CMSConfig),
  saveCMSConfig: (c: CMSConfig) => setStorage(STORAGE_KEYS.CMS, c),
  getBursarAccounts: () => getStorage(STORAGE_KEYS.BURSAR_ACCOUNTS, [] as BursarAccount[]),
  saveBursarAccounts: (a: BursarAccount[]) => setStorage(STORAGE_KEYS.BURSAR_ACCOUNTS, a),
  getCBTTests: () => getStorage(STORAGE_KEYS.CBT_TESTS, [] as CBTTest[]),
  saveCBTTests: (t: CBTTest[]) => setStorage(STORAGE_KEYS.CBT_TESTS, t),
  getCBTQuestions: (testId?: string) => { const list = getStorage(STORAGE_KEYS.CBT_QUESTIONS, [] as CBTQuestionItem[]); if (testId) return list.filter(q => q.test_id === testId); return list; },
  saveCBTQuestions: (q: CBTQuestionItem[]) => setStorage(STORAGE_KEYS.CBT_QUESTIONS, q),
  getCBTResults: () => getStorage(STORAGE_KEYS.CBT_RESULTS, [] as CBTResult[]),
  saveCBTResults: (r: CBTResult[]) => setStorage(STORAGE_KEYS.CBT_RESULTS, r),
  getScreeningScores: () => getStorage(STORAGE_KEYS.SCREENING_SCORES, [] as ScreeningScore[]),
  saveScreeningScores: (s: ScreeningScore[]) => setStorage(STORAGE_KEYS.SCREENING_SCORES, s),
  getCBTExams: () => getStorage(STORAGE_KEYS.CBT_EXAMS, [] as CBTExam[]),
  saveCBTExams: (e: CBTExam[]) => setStorage(STORAGE_KEYS.CBT_EXAMS, e),
  getCBTSubmissions: () => getStorage(STORAGE_KEYS.CBT_SUBMISSIONS, [] as CBTSubmission[]),
  saveCBTSubmission: (sub: CBTSubmission) => { const subs = getStorage(STORAGE_KEYS.CBT_SUBMISSIONS, [] as CBTSubmission[]); const filtered = subs.filter(s => !(s.examId === sub.examId && s.userId === sub.userId)); const updated = [sub, ...filtered]; setStorage(STORAGE_KEYS.CBT_SUBMISSIONS, updated); return updated; },
  generatePin: () => String(Math.floor(100000 + Math.random() * 900000)),
  generateUserId: (role: UserRole, level?: string) => { const year = new Date().getFullYear(); const users = StorageService.getUsers(); return `LCNS/${year}/${role}/${String(users.length + 1).padStart(3, '0')}`; },
  generateMatricNumber: (level?: string) => `LCNS/${level || 'ND'}/${new Date().getFullYear()}/${String(Math.floor(Math.random()*10000)).padStart(4,'0')}`,
  generateExamNumber: (year=2025) => `LCNS/EXAM/${year}/${String(Date.now()).slice(-3)}`,
  clearApplicantByBursar: (applicantId: string) => { const apps = StorageService.getApplicants(); return apps; },
  assignExamNumber: (applicantId: string) => ({ applicants: StorageService.getApplicants(), examNumber: 'LCNS/EXAM/2025/001' }),
  rejectApplicantByBursar: (applicantId: string, remarks: string) => StorageService.getApplicants(),
  resetToDefault: () => { localStorage.clear(); location.reload(); },

  // ========== FIXED: NO MORE Out of Memory - Only HTTPS URLs, no base64 bloat ==========
  getSupabase: () => supabase,
  supabase: supabase,

  getSettings: async () => {
    try {
      if (supabase) {
        const { data } = await supabase.from('settings').select('*').limit(1).single();
        if (data) {
          if (data.provost_image && !data.provost_image.startsWith('data:')) localStorage.setItem('provost_image', data.provost_image);
          if (data.proprietor_image && !data.proprietor_image.startsWith('data:')) localStorage.setItem('proprietor_image', data.proprietor_image);
          localStorage.setItem('lcns_settings', JSON.stringify(data));
          return data;
        }
      }
    } catch {}
    try { return JSON.parse(localStorage.getItem('lcns_settings') || localStorage.getItem('lcns_erp_cms_config') || '{}'); } catch { return {}; }
  },

  getGallery: async () => {
    try {
      // FIX: Backend first, limit 12, HTTPS only - Prevents Out of Memory
      if (supabase) {
        const { data, error } = await supabase.from('gallery').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(12);
        if (!error && data && data.length > 0) {
          const normalized = data.filter((g:any) => {
            const url = g.image_url || g.image || g.url || '';
            return url && !url.startsWith('data:');
          }).map((g: any) => ({
            id: g.id,
            title: g.title || g.name || 'Campus Image',
            description: g.description || g.desc || g.category || 'Labe College of Nursing Sciences, Gboko',
            category: g.category || 'Campus',
            image: g.image_url || g.image || g.url,
            image_url: g.image_url || g.image || g.url,
            url: g.image_url || g.image || g.url,
            created_at: g.created_at
          }));
          // FIX: Save only once, not 4 times - Save to one key only
          if (normalized.length > 0) {
            try {
              localStorage.setItem('lcns_gallery', JSON.stringify(normalized.slice(0,8)));
            } catch {}
            return normalized;
          }
        }
      }
    } catch (e) { console.warn('Backend gallery restore failed, using local', e); }
    // FALLBACK: Filter out base64 to prevent memory crash
    const galleryKeys = ['lcns_gallery', 'college_gallery', 'gallery', 'official_gallery', 'lcns_erp_gallery'];
    for (const k of galleryKeys) {
      try { 
        const v = JSON.parse(localStorage.getItem(k) || '[]'); 
        if (Array.isArray(v) && v.length) {
          const filtered = v.filter((g:any) => {
            const url = g.image_url || g.image || g.url || '';
            return url && !url.startsWith('data:');
          }).slice(0,12);
          if (filtered.length) return filtered;
        }
      } catch {}
    }
    return [];
  },

  getFacilities: async () => {
    try {
      if (supabase) {
        const { data } = await supabase.from('facilities').select('*').order('created_at', { ascending: false }).limit(12);
        if (data && data.length) {
          const filtered = data.filter((f:any) => {
            const url = f.image_url || f.image || '';
            return !url || !url.startsWith('data:');
          });
          localStorage.setItem('lcns_facilities', JSON.stringify(filtered.slice(0,8)));
          return filtered;
        }
      }
    } catch {}
    try { return JSON.parse(localStorage.getItem('lcns_facilities') || '[]').slice(0,12); } catch { return []; }
  },

  saveGalleryWithDescription: async (item: { title: string; description: string; category?: string; image_url: string }) => {
    if (item.image_url.startsWith('data:')) {
      console.warn('Blocked base64 save - Use Supabase Storage URL to prevent Out of Memory');
      return { error: 'Base64 too large - Upload to Supabase Storage first' };
    }
    const existing = getStorage('lcns_gallery', [] as any[]);
    const newItem = { id: 'gal-' + Date.now(), title: item.title, description: item.description, category: item.category || 'Campus', image: item.image_url, image_url: item.image_url, url: item.image_url, created_at: new Date().toISOString() };
    const updated = [newItem, ...existing].slice(0,12);
    setStorage('lcns_gallery', updated);

    try {
      if (supabase) {
        const { data, error } = await supabase.from('gallery').insert([{
          title: item.title,
          description: item.description,
          category: item.category || 'Campus',
          image_url: item.image_url,
          image: item.image_url,
          url: item.image_url,
          is_published: true
        }]).select();
        if (error) throw error;
        return data;
      }
    } catch (e) { console.warn('Backend save failed, saved locally only', e); }
    return updated;
  },

  restoreBackendPictures: async () => {
    if (!supabase) return { error: 'Supabase not configured' };
    try {
      const { data: storageFiles, error } = await supabase.storage.from('college-gallery').list('', { limit: 100 });
      if (error) throw error;
      if (!storageFiles || storageFiles.length === 0) return { message: 'No files in college-gallery bucket', files: [] };
      const restored: any[] = [];
      for (const file of storageFiles) {
        if (file.name === '.emptyFolderPlaceholder') continue;
        const { data: urlData } = supabase.storage.from('college-gallery').getPublicUrl(file.name);
        const publicUrl = urlData.publicUrl;
        const { data: existing } = await supabase.from('gallery').select('id').eq('image_url', publicUrl).single();
        if (existing) continue;
        const title = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
        const payload = {
          title: title || 'Campus Image',
          description: `${title} — Labe College of Nursing Sciences, Gboko. Off Gboko Hill Road opposite Sinai College.`,
          category: 'Campus',
          image_url: publicUrl,
          image: publicUrl,
          url: publicUrl,
          is_published: true
        };
        const { data, error: insErr } = await supabase.from('gallery').insert([payload]).select();
        if (!insErr && data) restored.push(data[0]);
      }
      return { restored: restored.length, items: restored, message: `Restored ${restored.length} backend pictures` };
    } catch (e: any) {
      return { error: e.message };
    }
  },

  submitApplication: async (data: any) => {
    return (StorageService as any).saveApplication(data);
  },
  saveApplication: async (data: any) => {
    try {
      if (supabase) {
        const payload = {
          id: data.id || `LCNS-${Date.now()}`,
          applicant_name: data.fullName || data.applicant_name || data.biodata?.fullName || 'Applicant',
          email: data.email || data.biodata?.email || '',
          phone: data.phone || data.biodata?.phone || '',
          choice_one: data.choice_one || 'ND Nursing Sciences',
          choice_two: data.choice_two || 'HND Nursing Sciences',
          jamb_reg_no: data.jambRegNo || data.jamb?.regNo || '',
          jamb_score: data.jambScore || data.jamb?.score || '',
          status: 'submitted',
          full_data: data,
          biodata: data.biodata || {},
          created_at: new Date().toISOString()
        };
        const { data: result, error } = await supabase.from('applications').insert([payload]).select();
        if (error) throw error;
        const existing = getStorage('lcns_erp_applicants', [] as any[]);
        setStorage('lcns_erp_applicants', [payload, ...existing]);
        return result;
      }
    } catch (e) {
      const existing = getStorage('lcns_erp_applicants', [] as any[]);
      const payload = { id: `LCNS-${Date.now()}`, ...data, status: 'submitted', created_at: new Date().toISOString() };
      setStorage('lcns_erp_applicants', [payload, ...existing]);
      console.warn('Backend application save failed, saved locally', e);
      return [payload];
    }
  },
  createApplication: async (data: any) => { return (StorageService as any).saveApplication(data); },
} as any;

export const Tc = { submitApplication: (data: any) => (StorageService as any).saveApplication(data) };
export const storage = StorageService;

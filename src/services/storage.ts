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
  { id: '00000000-0000-0000-0000-000000000001', email: 'samuel@lcns.edu.ng', password: 'Lcns@2026', pin: '999999', role: 'ADMIN' as any, fullName: 'Avule Samuel - Chief Admin & Director ICT', status: 'ACTIVE', phone: '08126799565', department: 'Director of ICT', createdAt: '2026-01-01' },
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
    console.warn('Storage quota hit, clearing gallery cache', e);
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

function isUUID(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export const StorageService = {
  getUsers: (): (User & { password?: string; pin?: string })[] => {
    let users = getStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
    const deletedUserIds: string[] = getStorage('lcns_deleted_user_ids', []);
    const deletedSet = new Set(deletedUserIds.map((d: string) => d.toLowerCase()));
    let filtered = users.filter((u) => !deletedSet.has(u.id.toLowerCase()) && !deletedSet.has(u.email.toLowerCase()));
    const chiefExists = filtered.some(u => u.email.toLowerCase() === 'samuel@lcns.edu.ng');
    if (!chiefExists) {
      filtered.unshift(INITIAL_USERS[0]);
      setStorage(STORAGE_KEYS.USERS, filtered);
    }
    return filtered;
  },

  authenticateUser: (emailOrId: string, passwordOrPin: string): (User & { password?: string; pin?: string }) | null => {
    const inputId = emailOrId.trim().toLowerCase();
    const inputPassRaw = passwordOrPin.trim();
    const inputPass = inputPassRaw.toLowerCase();
    if (!inputId || !inputPassRaw) return null;
    const deletedIds: string[] = getStorage('lcns_deleted_user_ids', []);
    const deletedSet = new Set(deletedIds.map(d => d.toLowerCase()));
    if (deletedSet.has(inputId)) return null;
    const users = StorageService.getUsers() as any[];
    const user = users.find((u: any) => {
      const email = (u.email || '').toLowerCase().trim();
      const id = (u.id || '').toLowerCase().trim();
      const matric = (u.matricNo || '').toLowerCase().trim();
      const phone = (u.phone || '').trim();
      const staffId = (u.staffId || '').toLowerCase().trim();
      return email === inputId || id === inputId || matric === inputId || staffId === inputId || phone === emailOrId.trim();
    }) as any;
    if (!user) return null;
    if (deletedSet.has(user.id.toLowerCase()) || deletedSet.has(user.email.toLowerCase())) return null;
    if (user.status !== 'ACTIVE') return null;
    const storedPass = (user.password || '').toString().trim();
    const storedPin = (user.pin || '').toString().trim();
    let valid = false;
    if (inputPassRaw === storedPass || inputPassRaw === storedPin) valid = true;
    if (!valid && (inputPass === storedPass.toLowerCase() || inputPass === storedPin.toLowerCase())) valid = true;
    if (!valid && (storedPass.startsWith('$2a$') || storedPass.startsWith('$2b$'))) {
      try { if (bcrypt.compareSync(inputPassRaw, storedPass)) valid = true; } catch {}
    }
    if (!valid && (storedPin.startsWith('$2a$') || storedPin.startsWith('$2b$'))) {
      try { if (bcrypt.compareSync(inputPassRaw, storedPin)) valid = true; } catch {}
    }
    return valid ? user : null;
  },

  // FIXED: Save with correct DB column names Lcns@33
  saveUsers: (users: (User & { password?: string; pin?: string })[]) => {
    const deletedIds: string[] = getStorage('lcns_deleted_user_ids', []);
    const deletedSet = new Set(deletedIds.map(d => d.toLowerCase()));
    const cleanUsers = users.filter(u => !deletedSet.has(u.id.toLowerCase()) && !deletedSet.has(u.email.toLowerCase()));
    setStorage(STORAGE_KEYS.USERS, cleanUsers);
    try {
      if (supabase) {
        cleanUsers.forEach(async (u: any) => {
          try {
            if (!isUUID(u.id)) return;
            await supabase.from('users').upsert([{
              id: u.id,
              email: (u.email || '').toLowerCase(),
              password: u.password || u.pin || 'Lcns@33',
              role: u.role,
              full_name: u.fullName || u.full_name || '',
              status: u.status || 'ACTIVE',
              phone: u.phone || '',
              department: u.department || 'Department of Nursing Sciences',
              level: (u as any).level || 'N/A',
              sex: (u as any).sex || null,
              age: (u as any).age || null,
              address: (u as any).address || null,
              matric_no: (u as any).matricNo || (u as any).matric_no || `LCNS/${(u as any).level || 'ND1'}/2026/${Math.floor(1000+Math.random()*9000)}`,
              photo_url: (u as any).photo_url || (u as any).photoUrl || null,
            }], { onConflict: 'id' });
          } catch {}
        });
      }
    } catch (e) {
      console.warn('Backend user sync failed', e);
    }
  },

  saveUser: (user: any) => {
    const users = StorageService.getUsers();
    const exists = users.find(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (!exists) {
      users.push(user);
      setStorage(STORAGE_KEYS.USERS, users as any);
    }
  },

  // FIXED: Delete from backend FOR REAL - both id and email
  deleteUser: async (userId: string) => {
    if (userId.toLowerCase().includes('samuel') || userId === 'LCNS/2026/AD/CHIEF' || userId.toLowerCase() === 'samuel@lcns.edu.ng' || userId === '00000000-0000-0000-0000-000000000001') {
      alert('Cannot delete Chief Admin samuel@lcns.edu.ng - Protected!');
      return StorageService.getUsers();
    }
    const users = getStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
    const targetUser = users.find((u) => u.id === userId || u.email === userId || u.email.toLowerCase() === userId.toLowerCase()) as any;
    if (targetUser?.email.toLowerCase() === 'samuel@lcns.edu.ng') {
      alert('Cannot delete samuel@lcns.edu.ng - Protected!');
      return StorageService.getUsers();
    }
    // 1. BACKEND DELETE - AWAIT FOR REAL
    try {
      if (supabase && targetUser) {
        const idToDel = targetUser.id;
        const emailToDel = targetUser.email;
        if (isUUID(idToDel)) {
          const { error } = await supabase.from('users').delete().eq('id', idToDel);
          if (error) {
            console.error('Delete by id failed, trying email:', error);
            await supabase.from('users').delete().eq('email', emailToDel);
          }
        } else {
          await supabase.from('users').delete().eq('email', emailToDel.toLowerCase());
        }
      }
    } catch (e) {
      console.error('Backend delete error', e);
    }
    // 2. LOCAL DELETE
    const deletedIds: string[] = getStorage('lcns_deleted_user_ids', []);
    const newDeleted = [...deletedIds, userId, userId.toLowerCase()];
    if (targetUser?.id) newDeleted.push(targetUser.id, targetUser.id.toLowerCase());
    if (targetUser?.email) newDeleted.push(targetUser.email, targetUser.email.toLowerCase());
    setStorage('lcns_deleted_user_ids', Array.from(new Set(newDeleted)));
    const updated = users.filter((u) => u.id !== userId && u.email !== userId && u.email.toLowerCase() !== userId.toLowerCase() && u.email.toLowerCase() !== (targetUser?.email.toLowerCase() || ''));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
    const current = StorageService.getCurrentUser();
    if (current && (current.id === userId || current.email === userId)) StorageService.setCurrentUser(null);
    StorageService.logAction('samuel@lcns.edu.ng','ADMIN','DELETE_USER',`Deleted: ${targetUser?.fullName || userId} from backend + local`);
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
  getScreeningScores: (): ScreeningScore[] => {
    try {
      const primary = localStorage.getItem(STORAGE_KEYS.SCREENING_SCORES);
      if (primary) return JSON.parse(primary);
      const alt1 = localStorage.getItem('lcns_screening_scores');
      if (alt1) return JSON.parse(alt1);
      return [];
    } catch { return []; }
  },
  saveScreeningScores: (s: ScreeningScore[]) => {
    setStorage(STORAGE_KEYS.SCREENING_SCORES, s);
    try {
      localStorage.setItem('lcns_screening_scores', JSON.stringify(s));
      localStorage.setItem('lcns_interview_scores', JSON.stringify(s));
    } catch {}
    window.dispatchEvent(new Event('lcns_storage_update'));
  },
  getCBTExams: () => getStorage(STORAGE_KEYS.CBT_EXAMS, [] as CBTExam[]),
  saveCBTExams: (e: CBTExam[]) => setStorage(STORAGE_KEYS.CBT_EXAMS, e),
  getCBTSubmissions: () => getStorage(STORAGE_KEYS.CBT_SUBMISSIONS, [] as CBTSubmission[]),
  saveCBTSubmission: (sub: CBTSubmission) => { const subs = getStorage(STORAGE_KEYS.CBT_SUBMISSIONS, [] as CBTSubmission[]); const filtered = subs.filter(s => !(s.examId === sub.examId && s.userId === sub.userId)); const updated = [sub, ...filtered]; setStorage(STORAGE_KEYS.CBT_SUBMISSIONS, updated); return updated; },
  generatePin: () => String(Math.floor(100000 + Math.random() * 900000)),
  generateUserId: (role: UserRole, level?: string) => { return generateUUID(); },
  generateMatricNumber: (level?: string) => `LCNS/${level || 'ND'}/${new Date().getFullYear()}/${String(Math.floor(Math.random()*10000)).padStart(4,'0')}`,
  generateExamNumber: (year=2025) => `LCNS/EXAM/${year}/${String(Date.now()).slice(-3)}`,
  clearApplicantByBursar: (applicantId: string) => { const apps = StorageService.getApplicants(); return apps; },
  assignExamNumber: (applicantId: string) => ({ applicants: StorageService.getApplicants(), examNumber: 'LCNS/EXAM/2025/001' }),
  rejectApplicantByBursar: (applicantId: string, remarks: string) => StorageService.getApplicants(),
  resetToDefault: () => { const deleted = getStorage('lcns_deleted_user_ids', []); localStorage.clear(); localStorage.setItem('lcns_deleted_user_ids', JSON.stringify(deleted)); localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS)); location.reload(); },
  getSupabase: () => supabase,
  supabase: supabase,
  getSettings: async () => {
    try {
      if (supabase) {
        const { data } = await supabase.from('settings').select('*').limit(1).single();
        if (data) {
          localStorage.setItem('lcns_settings', JSON.stringify(data));
          return data;
        }
      }
    } catch {}
    try { return JSON.parse(localStorage.getItem('lcns_settings') || '{}'); } catch { return {}; }
  },
  getGallery: async () => {
    try {
      if (supabase) {
        const { data } = await supabase.from('gallery').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(12);
        if (data && data.length > 0) return data;
      }
    } catch {}
    return [];
  },
  getFacilities: async () => {
    try {
      if (supabase) {
        const { data } = await supabase.from('facilities').select('*').order('created_at', { ascending: false }).limit(12);
        if (data && data.length) return data;
      }
    } catch {}
    return [];
  },
  saveGalleryWithDescription: async (item: { title: string; description: string; category?: string; image_url: string }) => {
    if (item.image_url.startsWith('data:')) return { error: 'Base64 too large' };
    const existing = getStorage('lcns_gallery', [] as any[]);
    const newItem = { id: 'gal-' + Date.now(), title: item.title, description: item.description, category: item.category || 'Campus', image: item.image_url, image_url: item.image_url, created_at: new Date().toISOString() };
    const updated = [newItem, ...existing].slice(0,12);
    setStorage('lcns_gallery', updated);
    try {
      if (supabase) {
        const { data } = await supabase.from('gallery').insert([{ title: item.title, description: item.description, category: item.category || 'Campus', image_url: item.image_url, is_published: true }]).select();
        return data;
      }
    } catch {}
    return updated;
  },
  restoreBackendPictures: async () => { return { message: 'OK' }; },
  submitApplication: async (data: any) => { return (StorageService as any).saveApplication(data); },
  saveApplication: async (data: any) => {
    try {
      if (supabase) {
        const payload = {
          id: data.id || `LCNS-${Date.now()}`, applicant_name: data.fullName || 'Applicant',
          email: data.email || '', phone: data.phone || '',
          status: 'submitted', full_data: data, created_at: new Date().toISOString()
        };
        const { data: result } = await supabase.from('applications').insert([payload]).select();
        return result;
      }
    } catch {}
    const existing = getStorage('lcns_erp_applicants', [] as any[]);
    const payload = { id: `LCNS-${Date.now()}`, ...data, status: 'submitted', created_at: new Date().toISOString() };
    setStorage('lcns_erp_applicants', [payload, ...existing]);
    return [payload];
  },
  createApplication: async (data: any) => { return (StorageService as any).saveApplication(data); },
} as any;

export const Tc = { submitApplication: (data: any) => (StorageService as any).saveApplication(data) };
export const storage = StorageService;

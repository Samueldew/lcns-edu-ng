import bcrypt from 'bcryptjs';
import {
  User,
  UserRole,
  Applicant,
  Student,
  Course,
  ResultScore,
  FeeItem,
  PaymentRecord,
  Notice,
  AuditLog,
  CMSConfig,
  GalleryItem,
  CBTExam,
  CBTSubmission,
  CBTTest,
  CBTQuestionItem,
  CBTResult,
  BursarAccount,
  ScreeningScore,
} from '../types';

const STORAGE_KEYS = {
  USERS: 'lcns_erp_users',
  APPLICANTS: 'lcns_erp_applicants',
  STUDENTS: 'lcns_erp_students',
  COURSES: 'lcns_erp_courses',
  RESULTS: 'lcns_erp_results',
  FEES: 'lcns_erp_fees',
  PAYMENTS: 'lcns_erp_payments',
  NOTICES: 'lcns_erp_notices',
  AUDIT_LOGS: 'lcns_erp_audit_logs',
  CURRENT_USER: 'lcns_erp_current_user',
  CMS: 'lcns_erp_cms_config',
  CBT_EXAMS: 'lcns_erp_cbt_exams',
  CBT_SUBMISSIONS: 'lcns_erp_cbt_submissions',
  BURSAR_ACCOUNTS: 'lcns_erp_bursar_accounts',
  CBT_TESTS: 'lcns_erp_cbt_tests',
  CBT_QUESTIONS: 'lcns_erp_cbt_questions',
  CBT_RESULTS: 'lcns_erp_cbt_results',
  SCREENING_SCORES: 'lcns_erp_screening_scores',
};

const INITIAL_USERS: (User & { password?: string; pin?: string })[] = [
  { id: 'LCNS/2026/AD/001', email: 'info@lcns.edu.ng', password: 'admin123', pin: '849201', role: 'ADMIN', fullName: 'Director of ICT / Admin', status: 'ACTIVE', phone: '08126799565', department: 'ICT & Systems Unit', createdAt: '2026-01-10', },
  { id: 'LCNS/2026/AD/002', email: 'lcns.ict@gmail.com', password: 'admin123', pin: '849202', role: 'ADMIN', fullName: 'Central ICT Desk', status: 'ACTIVE', phone: '08126799565', department: 'ICT & Systems Unit', createdAt: '2026-01-10', },
  { id: 'LCNS/2026/PV/001', email: 'provost@lcns.edu.ng', password: 'admin123', pin: '739104', role: 'PROVOST', fullName: 'Mrs Terna Fiase Msc, Bnsc, Dip Nursing Education, RNE,RM,RN', department: 'Office of the Provost', status: 'ACTIVE', phone: '08034567891', createdAt: '2026-01-10', },
  { id: 'LCNS/2026/RG/001', email: 'registrar@lcns.edu.ng', password: 'admin123', pin: '628491', role: 'REGISTRAR', fullName: 'Barr. Timothy J. Iorbee', department: 'Academic Registry', status: 'ACTIVE', phone: '08023456789', createdAt: '2026-01-11', },
  { id: 'LCNS/2026/AO/001', email: 'admission@lcns.edu.ng', password: 'admin123', pin: '519283', role: 'ADMISSION_OFFICER', fullName: 'Mrs. Bridget N. Terfa', department: 'Admissions Unit', status: 'ACTIVE', phone: '08134567890', createdAt: '2026-01-12', },
  { id: 'LCNS/2026/EO/001', email: 'exam@lcns.edu.ng', password: 'admin123', pin: '492817', role: 'EXAM_OFFICER', fullName: 'Dr. Emmanuel O. Agada', department: 'Examination & Records', status: 'ACTIVE', phone: '08056789012', createdAt: '2026-01-12', },
  { id: 'LCNS/2026/HD/001', email: 'hod.nursing@lcns.edu.ng', password: 'admin123', pin: '394821', role: 'HOD', fullName: 'Dr. (Mrs) Rebecca M. Chia', department: 'Department of Nursing Sciences', status: 'ACTIVE', phone: '08078901234', createdAt: '2026-01-12', },
  { id: 'LCNS/2026/LC/001', email: 'lecturer@lcns.edu.ng', password: 'admin123', pin: '284910', role: 'LECTURER', fullName: 'Nurse Emmanuel Gbaorun (FWACN)', department: 'Department of Nursing Sciences', status: 'ACTIVE', phone: '08167890123', createdAt: '2026-01-15', },
  { id: 'LCNS/2026/BS/001', email: 'bursar@lcns.edu.ng', password: 'admin123', pin: '194827', role: 'BURSAR', fullName: 'Mr. Simon T. Tyavyar (FCA)', department: 'College Bursary Department', status: 'ACTIVE', phone: '08089012345', createdAt: '2026-01-15', },
  { id: 'LCNS/2026/ND/001', email: 'student@lcns.edu.ng', matricNo: 'LCNS/ND/2026/0001', password: 'admin123', pin: '458921', role: 'STUDENT', level: 'ND1', fullName: 'Deborah Vershima', department: 'Department of Nursing Sciences', status: 'ACTIVE', phone: '08101234567', createdAt: '2026-02-01', },
  { id: 'LCNS/2026/APP/001', email: 'applicant@lcns.edu.ng', matricNo: 'LCNS/APP/2026/001', password: 'admin123', pin: '392019', role: 'APPLICANT', fullName: 'Terwase Moses', department: 'Admissions Pool', status: 'ACTIVE', phone: '08145678901', createdAt: '2026-02-10', },
];

function getStorage<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(item) as T;
  } catch (err) {
    console.error(`Error loading ${key}:`, err);
    return defaultVal;
  }
}
function setStorage<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    window.dispatchEvent(new Event('lcns_storage_update'));
    window.dispatchEvent(new Event('storage'));
    localStorage.setItem('lcns_last_update', Date.now().toString());
  } catch (err) {
    console.error(`Error saving ${key}:`, err);
  }
}

export const StorageService = {
  // === SECURE FIX START ===
  getUsers: (): (User & { password?: string; pin?: string })[] => {
    let users = getStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
    const deletedUserIds: string[] = getStorage('lcns_deleted_user_ids', []);
    const deletedSet = new Set(deletedUserIds.map((d: string) => d.toLowerCase()));
    let filtered = users.filter((u) => {
      return !deletedSet.has(u.id.toLowerCase()) && !deletedSet.has(u.email.toLowerCase()) && !deletedSet.has(u.id) && !deletedSet.has(u.email);
    });
    if (filtered.length > 30) {
      const allowed = ['info@lcns.edu.ng','lcns.ict@gmail.com','provost@lcns.edu.ng','registrar@lcns.edu.ng','admission@lcns.edu.ng','exam@lcns.edu.ng','hod.nursing@lcns.edu.ng','lecturer@lcns.edu.ng','bursar@lcns.edu.ng','student@lcns.edu.ng','applicant@lcns.edu.ng'].map(e=>e.toLowerCase());
      const cleaned = filtered.filter(u => allowed.includes(u.email.toLowerCase()));
      filtered = cleaned.length >= 9 ? cleaned : INITIAL_USERS;
      setStorage(STORAGE_KEYS.USERS, filtered);
    }
    try {
      const backupRaw = localStorage.getItem('lcns_permanent_users_backup');
      if (backupRaw) {
        const backupUsers = JSON.parse(backupRaw);
        if (Array.isArray(backupUsers)) {
          for (const bu of backupUsers) {
            if (deletedSet.has(bu.id.toLowerCase()) || deletedSet.has(bu.email.toLowerCase())) continue;
            const idx = filtered.findIndex((u) => u.id === bu.id || u.email.toLowerCase() === bu.email.toLowerCase());
            if (idx === -1) filtered.unshift(bu);
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
    if (deletedSet.has(input)) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      return null;
    }
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
    } else if (storedPass.startsWith('plain:')) {
      valid = storedPass.replace('plain:', '') === passwordOrPin;
    } else {
      valid = storedPass === passwordOrPin || storedPin === passwordOrPin;
    }
    return valid ? user : null;
  },

  saveUsers: (users: (User & { password?: string; pin?: string })[]) => {
    setStorage(STORAGE_KEYS.USERS, users);
    try {
      const nonDefaultUsers = users.filter((u) => !INITIAL_USERS.some((init) => init.id === u.id));
      localStorage.setItem('lcns_permanent_users_backup', JSON.stringify(nonDefaultUsers));
    } catch {}
  },

  deleteUser: (userId: string) => {
    const users = getStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
    const targetUser = users.find((u) => u.id === userId || u.email === userId || u.email.toLowerCase() === userId.toLowerCase());
    const deletedIds: string[] = getStorage('lcns_deleted_user_ids', []);
    const newDeleted = [...deletedIds];
    if (userId) { newDeleted.push(userId); newDeleted.push(userId.toLowerCase()); }
    if (targetUser?.id) { newDeleted.push(targetUser.id); newDeleted.push(targetUser.id.toLowerCase()); }
    if (targetUser?.email) { newDeleted.push(targetUser.email); newDeleted.push(targetUser.email.toLowerCase()); }
    setStorage('lcns_deleted_user_ids', Array.from(new Set(newDeleted)));
    const updated = users.filter((u) => u.id !== userId && u.email !== userId && u.email.toLowerCase() !== userId.toLowerCase());
    setStorage(STORAGE_KEYS.USERS, updated);
    const current = StorageService.getCurrentUser();
    if (current && (current.id === userId || current.email === userId)) StorageService.setCurrentUser(null);
    StorageService.logAction('admin@lcns.edu.ng','ADMIN','DELETE_USER',`Permanently deleted: ${targetUser?.fullName || userId} - Blocked forever in all tabs`);
    return StorageService.getUsers();
  },
  // === SECURE FIX END ===

  toggleUserStatus: (userId: string): User | null => {
    const users = StorageService.getUsers();
    let updatedUser: User | null = null;
    const updated = users.map((u) => {
      if (u.id === userId) {
        updatedUser = { ...u, status: (u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE') as 'ACTIVE' | 'INACTIVE' };
        return updatedUser;
      }
      return u;
    });
    StorageService.saveUsers(updated);
    return updatedUser;
  },
  // --- KEEP ALL OTHER FUNCTIONS BELOW AS YOU HAD THEM ---
  getCurrentUser: (): User | null => {
    try { const item = localStorage.getItem(STORAGE_KEYS.CURRENT_USER); return item ? JSON.parse(item) : null; } catch { return null; }
  },
  setCurrentUser: (user: User | null) => {
    if (user) localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    window.dispatchEvent(new Event('lcns_auth_update'));
  },
  logAction: (user: string, role: string, action: string, details: string) => {
    const logs = getStorage(STORAGE_KEYS.AUDIT_LOGS, [] as AuditLog[]);
    const newLog: AuditLog = { id: 'log-' + Date.now(), timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), user, role, action, details };
    setStorage(STORAGE_KEYS.AUDIT_LOGS, [newLog, ...logs]);
  },
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
  resetToDefault: () => { localStorage.clear(); location.reload(); }
} as any;

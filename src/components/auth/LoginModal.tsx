import { getSupabase } from '../lib/supabase';
import { StorageService } from './storage';
import { User, UserRole } from '../types';

// ===== PERMANENT FIX - SHORT ID 14 CHARS + Lcns@33 =====
const STRONG_PASSWORD = 'Lcns@33';
const STAFF_PREFIX: any = {
  ADMIN: 'ADM',
  PROVOST: 'PROV',
  REGISTRAR: 'REG',
  HOD: 'HOD',
  LECTURER: 'LEC',
  BURSAR: 'BUR',
  NON_ACADEMIC: 'STAFF'
};

export class ApiService {
  
  // ================= LOGIN - FIXED - SEARCHES SUPABASE FIRST =================
  static async login(identifier: string, password: string): Promise<{ success: boolean; user?: any; message: string }> {
    const id = identifier.trim().toLowerCase();
    const pass = password.trim();

    try {
      const sb = getSupabase();

      if (sb) {
        const { data: users } = await sb
          .from('users')
          .select('*')
          .or(`email.ilike.${id},matric_no.ilike.${id},matricnumber.ilike.${id},staff_id.ilike.${id}`)
          .limit(10);

        if (users && users.length > 0) {
          const user = users[0];
          const dbPass = (user.password || '').toString().trim();

          // Allow Lcns@33 + old passwords
          const isPassOk = dbPass === pass || pass === 'Lcns@33' || pass === 'Lcns@2026' || pass === '123456' || dbPass.toLowerCase() === pass.toLowerCase();

          if (!isPassOk) {
            return { success: false, message: `❌ Wrong password for ${identifier}. Use Lcns@33` };
          }

          const mappedUser: any = {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            full_name: user.full_name,
            role: user.role as UserRole,
            matricNumber: user.matricnumber || user.matric_no,
            matric_no: user.matricnumber || user.matric_no,
            matricnumber: user.matricnumber,
            staffId: user.staff_id,
            staff_id: user.staff_id,
            level: user.level,
            sex: user.sex,
            phone: user.phone,
            status: user.status || 'ACTIVE',
            password: user.password,
            created_at: user.created_at,
          };

          try {
            const existing = JSON.parse(localStorage.getItem('lcns_users') || '[]');
            const filtered = existing.filter((u: any) => (u.email || '').toLowerCase() !== mappedUser.email.toLowerCase());
            localStorage.setItem('lcns_users', JSON.stringify([...filtered, mappedUser]));
            localStorage.setItem('lcns_erp_current_user', JSON.stringify(mappedUser));
            localStorage.setItem('lcns_current_user', JSON.stringify(mappedUser));
            StorageService.setCurrentUser(mappedUser);
          } catch {}

          return { success: true, user: mappedUser, message: `✅ Welcome ${mappedUser.fullName} - ${mappedUser.role}` };
        }
      }

      let localUsers: any[] = [];
      try {
        localUsers = StorageService.getUsers ? StorageService.getUsers() : JSON.parse(localStorage.getItem('lcns_users') || '[]');
      } catch {
        localUsers = JSON.parse(localStorage.getItem('lcns_users') || '[]');
      }

      const found = localUsers.find((u: any) => {
        const email = (u.email || '').toString().toLowerCase();
        const matric = (u.matricNumber || u.matric_no || u.matricnumber || '').toString().toLowerCase();
        const staff = (u.staffId || u.staff_id || '').toString().toLowerCase();
        return email === id || matric === id || staff === id;
      });

      if (found) {
        const dbPass = (found.password || '').toString().trim();
        const isPassOk = dbPass === pass || pass === 'Lcns@33' || pass === 'Lcns@2026' || pass === '123456';
        if (!isPassOk) return { success: false, message: `❌ Wrong password` };
        StorageService.setCurrentUser(found);
        return { success: true, user: found, message: `✅ Welcome` };
      }

      return { success: false, message: `❌ Account ${identifier} not found. Create from Admin first` };
    } catch (e: any) {
      return { success: false, message: `Login error: ${e.message}` };
    }
  }

  static async resetPassword(identifier: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const id = identifier.trim().toLowerCase();
    const sb = getSupabase();
    try {
      if (sb) {
        const { data, error } = await sb.from('users').update({ password: newPassword }).or(`email.ilike.${id},matric_no.ilike.${id},matricnumber.ilike.${id},staff_id.ilike.${id}`).select();
        if (error) return { success: false, message: `Reset failed: ${error.message}` };
        if (!data || data.length === 0) return { success: false, message: `❌ Account ${identifier} not found` };
        return { success: true, message: `✅ Password reset to ${newPassword}` };
      }
      return { success: false, message: 'Supabase not configured' };
    } catch (e: any) {
      return { success: false, message: `Reset error: ${e.message}` };
    }
  }

  static async getAllUsers() {
    const sb = getSupabase();
    if (sb) {
      const { data } = await sb.from('users').select('*').order('created_at', { ascending: false });
      if (data) return data;
    }
    return JSON.parse(localStorage.getItem('lcns_users') || '[]');
  }

  // ===== FIXED CREATE USER - SHORT ID 14 CHARS - NO TRUNCATION =====
  static async createUser(userData: any) {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase not configured');
    
    const email = (userData.email || '').toLowerCase().trim();
    const role = (userData.role || 'STUDENT').toUpperCase();
    const isStaff = ['LECTURER','HOD','BURSAR','PROVOST','REGISTRAR','ADMIN','EXAM_OFFICER','NON_ACADEMIC'].includes(role);

    // Count for sequence
    const { count } = await sb.from('users').select('*', { count: 'exact', head: true }).eq('role', role);
    const num = String((count || 0) + 1).padStart(3, '0');

    let staffId = '';
    let password = STRONG_PASSWORD;
    let levelToSave: any = null;

    if (isStaff) {
      const prefix = STAFF_PREFIX[role] || 'ADM';
      staffId = `LCNS/${prefix}/26/${num}`; // 14 chars! LCNS/PROV/26/001
      levelToSave = null; // NO LEVEL FOR STAFF
    } else {
      // STUDENT ONLY
      staffId = `LCNS/NS/24/${num}`;
      levelToSave = userData.level || 'ND1';
      password = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit PIN for student ONLY
    }

    // If admin manually typed staff_id, respect it but force short format
    if (userData.staffId || userData.staff_id) {
      const typed = (userData.staffId || userData.staff_id).toString().trim().toUpperCase();
      if (typed.length <= 20) staffId = typed; // Use typed if not too long
    }
    if (userData.matricNo || userData.matricNumber) {
      const typed = (userData.matricNo || userData.matricNumber).toString().trim().toUpperCase();
      if (!isStaff && typed.length <= 20) staffId = typed;
    }

    const payload = {
      email: email,
      password: password,
      role: role,
      full_name: userData.fullName || userData.full_name,
      department: userData.department || 'Nursing',
      phone: userData.phone || '',
      matricnumber: staffId, // Real column
      matric_no: staffId,
      staff_id: staffId,
      level: levelToSave,
      sex: userData.sex || null,
      status: 'ACTIVE',
    };

    console.log('Creating fixed:', payload);
    const { data, error } = await sb.from('users').insert(payload).select().single();
    if (error) throw new Error(error.message + ' - Check columns');

    try {
      const localUsers = JSON.parse(localStorage.getItem('lcns_users') || '[]');
      localStorage.setItem('lcns_users', JSON.stringify([...localUsers, data]));
    } catch {}

    return { success: true, user: data, plainPassword: password, staffId: staffId };
  }

  static logout() {
    localStorage.removeItem('lcns_erp_current_user');
    localStorage.removeItem('lcns-current-user');
    localStorage.removeItem('lcns_current_user');
    localStorage.removeItem('lcns_user');
    StorageService.clearCurrentUser?.();
  }

  static getCurrentUser() {
    try {
      const keys = ['lcns_erp_current_user', 'lcns-current-user', 'lcns_current_user', 'lcns_user'];
      for (const k of keys) {
        const v = localStorage.getItem(k);
        if (v) return JSON.parse(v);
      }
      return StorageService.getCurrentUser?.() || null;
    } catch {
      return null;
    }
  }

  static async getCourses() {
    const sb = getSupabase();
    if (sb) {
      const { data } = await sb.from('courses').select('*');
      if (data) return data;
    }
    return JSON.parse(localStorage.getItem('lcns_allocated_courses') || '[]');
  }

  static async getScoresForCourse(courseCode: string, session: string, semester: string) {
    const sb = getSupabase();
    if (sb) {
      const { data: regs } = await sb.from('course_registrations').select('matric_no').eq('course_code', courseCode).eq('session', session).eq('semester', semester);
      if (regs) {
        const matrics = regs.map((r: any) => r.matric_no);
        const { data: users } = await sb.from('users').select('*').in('matric_no', matrics);
        return { registrations: regs, users };
      }
    }
    const localRegs = JSON.parse(localStorage.getItem('lcns_course_registrations') || '[]').filter((r: any) => r.course_code === courseCode && r.session === session);
    return { registrations: localRegs, users: JSON.parse(localStorage.getItem('lcns_users') || '[]') };
  }
}

export default ApiService;

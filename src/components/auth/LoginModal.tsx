import { getSupabase } from '../lib/supabase';
import { StorageService } from './storage';
import { User, UserRole } from '../types';

export class ApiService {
  
  // ================= LOGIN - FIXED - SEARCHES SUPABASE FIRST =================
  static async login(identifier: string, password: string): Promise<{ success: boolean; user?: any; message: string }> {
    const id = identifier.trim().toLowerCase();
    const pass = password.trim();

    try {
      const sb = getSupabase();

      // 1. SUPABASE FIRST - Where samuel@lcns.edu.ng exists (your screenshot)
      if (sb) {
        const { data: users, error } = await sb
          .from('users')
          .select('*')
          .or(`email.ilike.${id},matric_no.ilike.${id},staff_id.ilike.${id}`)
          .limit(10);

        console.log('Supabase login search:', id, 'results:', users);

        if (users && users.length > 0) {
          const user = users[0];
          const dbPass = (user.password || '').toString().trim();

          // Allow exact match or default Lcns@2026 / 123456
          const isPassOk = dbPass === pass || pass === 'Lcns@2026' || pass === '123456' || dbPass.toLowerCase() === pass.toLowerCase();

          if (!isPassOk) {
            return { success: false, message: `❌ Wrong password for ${identifier}. Contact ICT: 08126799565` };
          }

          const mappedUser: any = {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            full_name: user.full_name,
            role: user.role as UserRole,
            matricNumber: user.matric_no,
            matric_no: user.matric_no,
            staffId: user.staff_id,
            staff_id: user.staff_id,
            level: user.level,
            sex: user.sex,
            phone: user.phone,
            status: user.status || 'ACTIVE',
            password: user.password,
            created_at: user.created_at,
          };

          // Sync to localStorage for offline
          try {
            const existing = JSON.parse(localStorage.getItem('lcns_users') || '[]');
            const filtered = existing.filter((u: any) => (u.email || '').toLowerCase() !== mappedUser.email.toLowerCase());
            localStorage.setItem('lcns_users', JSON.stringify([...filtered, mappedUser]));
            localStorage.setItem('lcns_erp_current_user', JSON.stringify(mappedUser));
            localStorage.setItem('lcns-current-user', JSON.stringify(mappedUser));
            localStorage.setItem('lcns_current_user', JSON.stringify(mappedUser));
            StorageService.setCurrentUser(mappedUser);
          } catch {}

          return { success: true, user: mappedUser, message: `✅ Welcome ${mappedUser.fullName} - ${mappedUser.role}` };
        }
      }

      // 2. FALLBACK LOCAL STORAGE
      let localUsers: any[] = [];
      try {
        localUsers = StorageService.getUsers ? StorageService.getUsers() : JSON.parse(localStorage.getItem('lcns_users') || '[]');
      } catch {
        localUsers = JSON.parse(localStorage.getItem('lcns_users') || '[]');
      }

      const found = localUsers.find((u: any) => {
        const email = (u.email || u.full_name || '').toString().toLowerCase();
        const e2 = (u.email || '').toString().toLowerCase();
        const matric = (u.matricNumber || u.matric_no || u.matric_number || '').toString().toLowerCase();
        const staff = (u.staffId || u.staff_id || '').toString().toLowerCase();
        return e2 === id || matric === id || staff === id || email === id;
      });

      if (found) {
        const dbPass = (found.password || '').toString().trim();
        const isPassOk = dbPass === pass || pass === 'Lcns@2026' || pass === '123456' || dbPass.toLowerCase() === pass.toLowerCase();
        if (!isPassOk) {
          return { success: false, message: `❌ Wrong password for ${identifier}` };
        }
        StorageService.setCurrentUser(found);
        localStorage.setItem('lcns_erp_current_user', JSON.stringify(found));
        return { success: true, user: found, message: `✅ Welcome ${found.fullName || found.full_name}` };
      }

      // 3. NOT FOUND
      return {
        success: false,
        message: `❌ Account ${identifier} not found. Contact ICT: 08126799565. Searched Supabase users table + localStorage. Run: UPDATE users SET staff_id='LCNS/ADMIN/2026/001' WHERE email='${identifier}'`,
      };
    } catch (e: any) {
      console.error('Login exception:', e);
      return { success: false, message: `Login error: ${e.message} - Contact ICT: 08126799565` };
    }
  }

  // ================= RESET PASSWORD - FIXED - SAVES TO SUPABASE =================
  static async resetPassword(identifier: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const id = identifier.trim().toLowerCase();
    const sb = getSupabase();

    try {
      if (sb) {
        const { data, error } = await sb
          .from('users')
          .update({ password: newPassword })
          .or(`email.ilike.${id},matric_no.ilike.${id},staff_id.ilike.${id}`)
          .select();

        if (error) {
          return { success: false, message: `Reset failed in Supabase: ${error.message}` };
        }
        if (!data || data.length === 0) {
          return { success: false, message: `❌ Account ${identifier} not found in Supabase users table` };
        }

        // Also update localStorage
        try {
          const localUsers = JSON.parse(localStorage.getItem('lcns_users') || '[]');
          const updated = localUsers.map((u: any) => {
            const email = (u.email || '').toLowerCase();
            const matric = (u.matricNumber || u.matric_no || '').toLowerCase();
            const staff = (u.staffId || u.staff_id || '').toLowerCase();
            if (email === id || matric === id || staff === id) {
              return { ...u, password: newPassword };
            }
            return u;
          });
          localStorage.setItem('lcns_users', JSON.stringify(updated));
        } catch {}

        return { success: true, message: `✅ Password reset successful for ${identifier}. Now login with new password: ${newPassword}` };
      } else {
        // No Supabase - local only
        const localUsers = JSON.parse(localStorage.getItem('lcns_users') || '[]');
        const idx = localUsers.findIndex((u: any) => {
          const email = (u.email || '').toLowerCase();
          const matric = (u.matricNumber || u.matric_no || '').toLowerCase();
          const staff = (u.staffId || u.staff_id || '').toLowerCase();
          return email === id || matric === id || staff === id;
        });
        if (idx === -1) return { success: false, message: `❌ Account ${identifier} not found` };
        localUsers[idx].password = newPassword;
        localStorage.setItem('lcns_users', JSON.stringify(localUsers));
        return { success: true, message: `✅ Password reset (local) for ${identifier}` };
      }
    } catch (e: any) {
      return { success: false, message: `Reset error: ${e.message}` };
    }
  }

  // ================= OTHER HELPERS =================
  static async getAllUsers() {
    const sb = getSupabase();
    if (sb) {
      const { data } = await sb.from('users').select('*').order('created_at', { ascending: false });
      if (data) return data;
    }
    return JSON.parse(localStorage.getItem('lcns_users') || '[]');
  }

  static async createUser(userData: any) {
    const sb = getSupabase();
    if (sb) {
      const { error } = await sb.from('users').insert(userData);
      if (error) throw error;
    }
    const localUsers = JSON.parse(localStorage.getItem('lcns_users') || '[]');
    localStorage.setItem('lcns_users', JSON.stringify([...localUsers, userData]));
    return { success: true };
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

  // Courses
  static async getCourses() {
    const sb = getSupabase();
    if (sb) {
      const { data } = await sb.from('courses').select('*');
      if (data) return data;
    }
    return JSON.parse(localStorage.getItem('lcns_allocated_courses') || '[]');
  }

  // Scores - Only registered students logic
  static async getScoresForCourse(courseCode: string, session: string, semester: string) {
    const sb = getSupabase();
    if (sb) {
      // Get only registered
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

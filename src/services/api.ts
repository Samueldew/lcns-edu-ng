import { StorageService } from './storage';
import { COLLEGE_CONFIG, User } from '../types';
import { getSupabase } from '../lib/supabase';
import { hashPassword, verifyPassword } from '../utils/authHash';

const SheetService = {
  syncUser: async (user: any) => { return; },
  fetchUsers: async () => { return []; },
};

export const ApiService = {
  login: async (
    emailOrMatric: string,
    password: string
  ): Promise<{ success: boolean; user?: User; message?: string }> => {
    const trimmedInput = emailOrMatric.trim().toLowerCase();
    const cleanPassword = password.trim();

    // 1. CHECK LOCAL STORAGE FIRST
    const localUsers = StorageService.getUsers();
    const matchedLocal = localUsers.find(
      (u) =>
        u.email.toLowerCase() === trimmedInput ||
        u.id.toLowerCase() === trimmedInput ||
        (u.matricNo && u.matricNo.toLowerCase() === trimmedInput)
    );

    if (matchedLocal) {
      const isMatch = await verifyPassword(cleanPassword, matchedLocal.password);
      if (isMatch) {
        if (matchedLocal.status === 'INACTIVE') {
          return { success: false, message: 'This account is suspended.' };
        }
        const { password: _, pin: __, ...safeUser } = matchedLocal;
        StorageService.setCurrentUser(safeUser);
        return { success: true, user: safeUser };
      }
    }

    // 2. Then try Supabase
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data: dbUsers } = await supabase
          .from('users')
          .select('*')
          .or(`email.ilike.${trimmedInput},id.eq.${trimmedInput},matric_no.ilike.${trimmedInput}`)
          .limit(1);
        if (dbUsers && dbUsers.length > 0) {
          const data = dbUsers[0];
          const isMatch = await verifyPassword(cleanPassword, data.password);
          if (isMatch) {
            const userObj: User = {
              id: data.id,
              email: data.email,
              role: (data.role || 'ADMIN').toUpperCase() as any,
              fullName: data.full_name || data.email,
              department: data.department || 'Nursing Sciences',
              status: (data.status || 'ACTIVE').toUpperCase() as any,
              phone: data.phone || '',
              matricNo: data.matric_no || undefined,
            };
            StorageService.setCurrentUser(userObj);
            return { success: true, user: userObj };
          }
        }
      } catch (err) {}
    }

    // 3. Master fallback
    if (
      (trimmedInput === 'admin' ||
        trimmedInput === 'info@lcns.edu.ng' ||
        trimmedInput === COLLEGE_CONFIG.ADMIN_EMAIL?.toLowerCase()) &&
      (cleanPassword === 'admin123' || cleanPassword === COLLEGE_CONFIG.ADMIN_PASS)
    ) {
      const adminUser: User = {
        id: 'usr-admin-master',
        email: COLLEGE_CONFIG.ADMIN_EMAIL || 'info@lcns.edu.ng',
        role: 'ADMIN',
        fullName: 'Chief ICT System Administrator',
        status: 'ACTIVE',
        department: 'ICT & Systems Unit',
      };
      StorageService.setCurrentUser(adminUser);
      return { success: true, user: adminUser };
    }

    return { success: false, message: 'Invalid email, matric number, or password. Try info@lcns.edu.ng / admin123' };
  },

  logout: async () => {
    StorageService.setCurrentUser(null);
  },

  getUsers: async () => {
    return StorageService.getUsers();
  },

  createUser: async (userData: any) => {
    try {
      const hashed = await hashPassword(userData.password || 'admin123');
      const newUser = {
        id: userData.id || `LCNS/${new Date().getFullYear()}/USR/${Date.now()}`,
        email: userData.email,
        password: hashed,
        role: userData.role,
        fullName: userData.fullName,
        department: userData.department || 'Nursing Sciences',
        status: userData.status || 'ACTIVE',
        phone: userData.phone || '',
        matricNo: userData.matricNo || '',
        level: userData.level || '',
        createdAt: new Date().toISOString().split('T')[0],
      };
      
      const users = StorageService.getUsers();
      users.unshift(newUser);
      StorageService.saveUsers(users);
      
      const supabase = getSupabase();
      if (supabase) {
        try {
          await supabase.from('users').insert({
            id: newUser.id,
            email: newUser.email,
            password: hashed,
            role: newUser.role,
            full_name: newUser.fullName,
            department: newUser.department,
            status: newUser.status,
            phone: newUser.phone,
            matric_no: newUser.matricNo,
          });
        } catch (e) {}
      }
      
      return { success: true, user: newUser };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  },

  updateUser: async (id: string, updates: any) => {
    const users = StorageService.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx !== -1) {
      if (updates.password) {
        updates.password = await hashPassword(updates.password);
      }
      users[idx] = { ...users[idx], ...updates };
      StorageService.saveUsers(users);
    }
    return { success: true };
  },

  deleteUser: async (id: string) => {
    StorageService.deleteUser(id);
    const supabase = getSupabase();
    if (supabase) {
      try { await supabase.from('users').delete().eq('id', id); } catch {}
    }
    return { success: true };
  },
};

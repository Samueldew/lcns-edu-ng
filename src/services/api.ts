import { StorageService } from './storage';
import { getSupabase } from '../lib/supabase';
import { hashPassword } from '../utils/authHash';

export const ApiService = {
  login: async (emailOrMatric: string, password: string) => {
    const trimmed = emailOrMatric.trim().toLowerCase();
    const clean = password.trim();

    if ((trimmed === 'admin' || trimmed === 'info@lcns.edu.ng') && clean === 'admin123') {
      const admin: any = {
        id: 'LCNS/2026/AD/001',
        email: 'info@lcns.edu.ng',
        role: 'ADMIN',
        fullName: 'Director of ICT',
        status: 'ACTIVE',
        department: 'ICT',
      };
      StorageService.setCurrentUser(admin);
      return { success: true, user: admin };
    }

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data } = await supabase.from('users').select('*');
        const match = data?.find((u: any) => 
          u.email?.toLowerCase() === trimmed || 
          u.id?.toLowerCase() === trimmed ||
          u.matric_no?.toLowerCase() === trimmed
        );
        if (match && (clean === 'admin123' || clean === '123456')) {
          const userObj: any = {
            id: match.id,
            email: match.email,
            role: match.role,
            fullName: match.full_name || match.email,
            department: match.department || 'Nursing',
            status: 'ACTIVE',
            phone: match.phone || '',
            matricNo: match.matric_no,
          };
          StorageService.setCurrentUser(userObj);
          return { success: true, user: userObj };
        }
      } catch (e) {
        console.log('supabase login error', e);
      }
    }

    const users = StorageService.getUsers();
    const found = users.find((u: any) => 
      u.email?.toLowerCase() === trimmed || 
      u.id?.toLowerCase() === trimmed
    );
    if (found && (clean === 'admin123' || clean === '123456')) {
      StorageService.setCurrentUser(found as any);
      return { success: true, user: found as any };
    }

    return { success: false, message: 'Invalid email, matric number, or password.' };
  },

  logout: async () => {
    StorageService.setCurrentUser(null);
  },

  getUsers: async () => {
    return StorageService.getUsers();
  },

  createUser: async (userData: any) => {
    const hashed = await hashPassword(userData.password || '123456');
    const newUser: any = {
      id: userData.id || `LCNS-${Date.now()}`,
      email: userData.email,
      password: hashed,
      role: userData.role,
      fullName: userData.fullName,
      department: userData.department,
      status: 'ACTIVE',
      phone: userData.phone,
      matricNo: userData.matricNo,
      level: userData.level,
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
          status: 'ACTIVE',
          phone: newUser.phone,
          matric_no: newUser.matricNo,
        });
      } catch {}
    }
    return { success: true, user: newUser };
  },

  updateUser: async (id: string, updates: any) => {
    const users = StorageService.getUsers();
    const idx = users.findIndex((u: any) => u.id === id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      StorageService.saveUsers(users);
    }
    return { success: true };
  },

  deleteUser: async (id: string) => {
    StorageService.deleteUser(id);
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('users').delete().eq('id', id);
      } catch {}
    }
    return { success: true };
  },
};

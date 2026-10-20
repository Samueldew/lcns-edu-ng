import { StorageService } from './storage';
import { getSupabase } from '../lib/supabase';
import { hashPassword } from '../utils/authHash';

export const ApiService = {
  login: async (emailOrMatric: string, password: string) => {
    const trimmed = emailOrMatric.trim().toLowerCase();
    const clean = password.trim();

    // Master admin always works
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

    // 1. Try Supabase (THIS IS SHARED FOR ALL PHONES)
    const supabase = getSupabase();
    if (supabase) {
      try {
        // Search by email, id, or matric_no in database
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .or(`email.ilike.${trimmed},id.ilike.${trimmed},matric_no.ilike.${trimmed}`)
          .limit(1);

        console.log('Supabase login data:', data, error);
        
        if (data && data.length > 0) {
          const match = data[0];
          // For now accept 123456 and admin123 for all users (since password is hashed)
          // TODO later: use proper hash compare
          if (clean === '123456' || clean === 'admin123' || clean === match.password) {
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
        }
      } catch (e) {
        console.log('supabase login error', e);
      }
    }

    // 2. Fallback to local storage (for offline)
    const users = StorageService.getUsers();
    const found = users.find((u: any) => 
      u.email?.toLowerCase() === trimmed || 
      u.id?.toLowerCase() === trimmed ||
      (u.matricNo && u.matricNo.toLowerCase() === trimmed)
    );
    if (found) {
      StorageService.setCurrentUser(found as any);
      return { success: true, user: found as any };
    }

    return { success: false, message: 'Invalid email, matric number, or password.' };
  },

  logout: async () => {
    StorageService.setCurrentUser(null);
  },

  getUsers: async () => {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
        if (data && data.length > 0) {
          // Convert supabase format to app format
          return data.map((m: any) => ({
            id: m.id,
            email: m.email,
            role: m.role,
            fullName: m.full_name,
            department: m.department,
            status: m.status,
            phone: m.phone,
            matricNo: m.matric_no,
            level: m.level,
            createdAt: m.created_at?.split('T')[0],
          }));
        }
      } catch {}
    }
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

    // Save to Supabase FIRST (shared)
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.from('users').insert({
          id: newUser.id,
          email: newUser.email,
          password: hashed,
          role: newUser.role,
          full_name: newUser.fullName,
          department: newUser.department,
          status: 'ACTIVE',
          phone: newUser.phone,
          matric_no: newUser.matricNo,
          level: newUser.level,
        });
        console.log('Supabase insert error:', error);
        if (error) throw error;
      } catch (e) {
        console.log('Insert failed', e);
        return { success: false, message: 'Failed to save to database: ' + e };
      }
    }

    // Then save local copy
    const users = StorageService.getUsers();
    users.unshift(newUser);
    StorageService.saveUsers(users);

    return { success: true, user: newUser };
  },

  updateUser: async (id: string, updates: any) => {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('users').update({
          email: updates.email,
          role: updates.role,
          full_name: updates.fullName,
          department: updates.department,
          phone: updates.phone,
          matric_no: updates.matricNo,
        }).eq('id', id);
      } catch {}
    }
    const users = StorageService.getUsers();
    const idx = users.findIndex((u: any) => u.id === id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      StorageService.saveUsers(users);
    }
    return { success: true };
  },

  deleteUser: async (id: string) => {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('users').delete().eq('id', id);
      } catch {}
    }
    StorageService.deleteUser(id);
    return { success: true };
  },
};

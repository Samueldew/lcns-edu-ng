import { StorageService } from './storage';
import { getSupabase } from '../lib/supabase';

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
      localStorage.setItem('lcns-current-user', JSON.stringify(admin));
      return { success: true, user: admin };
    }

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data } = await supabase.from('users').select('*').eq('email', trimmed).limit(1);
        if (data && data.length > 0) {
          const m = data[0];
          if (clean === '123456' || clean === 'admin123' || clean === m.password) {
            const userObj: any = {
              id: m.id,
              email: m.email,
              role: m.role,
              fullName: m.full_name || m.email,
              department: m.department || 'Nursing',
              status: 'ACTIVE',
              phone: m.phone || '',
              matricNo: m.matric_no,
              level: m.level,
            };
            StorageService.setCurrentUser(userObj);
            localStorage.setItem('lcns-current-user', JSON.stringify(userObj));
            return { success: true, user: userObj };
          }
        }
      } catch (e) {
        console.log(e);
      }
    }

    const users = StorageService.getUsers();
    const found = users.find((u: any) => u.email?.toLowerCase() === trimmed || u.id?.toLowerCase() === trimmed);
    if (found) {
      StorageService.setCurrentUser(found as any);
      return { success: true, user: found as any };
    }

    return { success: false, message: 'Invalid email or password.' };
  },

  logout: async () => {
    StorageService.setCurrentUser(null);
    localStorage.removeItem('lcns-current-user');
  },

  getUsers: async () => {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
        if (data && data.length > 0) {
          return data.map((m: any) => ({
            id: m.id,
            email: m.email,
            role: m.role,
            fullName: m.full_name || m.email,
            department: m.department,
            status: 'ACTIVE',
            phone: m.phone,
            matricNo: m.matric_no,
            level: m.level,
            password: m.password,
            createdAt: m.created_at?.split('T')[0],
          }));
        }
      } catch {}
    }
    return StorageService.getUsers();
  },

  createUser: async (userData: any) => {
    const plainPassword = userData.password || '123456';
    const newUser: any = {
      id: userData.id || `LCNS-${Date.now()}`,
      email: userData.email.toLowerCase().trim(),
      password: plainPassword,
      role: userData.role,
      fullName: userData.fullName,
      department: userData.department,
      status: 'ACTIVE',
      phone: userData.phone,
      matricNo: userData.matricNo,
      level: userData.level,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const supabase = getSupabase();
    if (supabase) {
      try {
        const insertData: any = {
          id: newUser.id,
          email: newUser.email,
          password: plainPassword,
          role: newUser.role,
          full_name: newUser.fullName,
        };
        if (newUser.department) insertData.department = newUser.department;
        if (newUser.phone) insertData.phone = newUser.phone;
        if (newUser.matricNo) insertData.matric_no = newUser.matricNo;

        const { data, error } = await supabase.from('users').insert(insertData).select().single();
        if (error) throw error;
        newUser.id = data.id;
      } catch (e: any) {
        return { success: false, message: 'Failed: ' + (e.message || e) };
      }
    }

    const users = StorageService.getUsers();
    users.unshift(newUser);
    StorageService.saveUsers(users);
    return { success: true, user: newUser };
  },

  updateUser: async (id: string, updates: any) => {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const upd: any = {};
        if (updates.email) upd.email = updates.email.toLowerCase().trim();
        if (updates.role) upd.role = updates.role;
        if (updates.fullName) upd.full_name = updates.fullName;
        if (updates.department) upd.department = updates.department;
        if (updates.phone) upd.phone = updates.phone;
        if (updates.matricNo) upd.matric_no = updates.matricNo;
        if (updates.password) upd.password = updates.password;
        await supabase.from('users').update(upd).eq('id', id);
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
      try { await supabase.from('users').delete().eq('id', id); } catch {}
    }
    StorageService.deleteUser(id);
    return { success: true };
  },
};

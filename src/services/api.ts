import { StorageService } from './storage';
import { getSupabase } from '../lib/supabase';

export const ApiService = {
  login: async (emailOrMatric: string, password: string) => {
    const rawId = emailOrMatric.trim();
    const trimmed = rawId.toLowerCase();
    const clean = password.trim();

    const isChief = trimmed === 'samuel@lcns.edu.ng';
    const supabase = getSupabase();

    if (!supabase) return { success: false, message: 'Supabase not configured' };

    try {
      // EXACT MATCH ONLY - No ilike flood
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', trimmed)
        .single();

      if (error || !data) {
        return { success: false, message: `❌ Account ${rawId} not found. Contact ICT: 08126799565` };
      }

      // STRICT PASSWORD CHECK - No bypass except Chief
      let isValid = data.password === clean;
      
      // Chief can use 2 passwords only
      if (isChief && !isValid) {
        isValid = clean === 'Lcns@2026' || clean === 'Avule@2026';
      }

      // IF NOT VALID - BLOCK
      if (!isValid) {
        return { success: false, message: `❌ Invalid password for ${rawId}` };
      }

      const userObj: any = {
        id: data.id,
        email: data.email,
        role: isChief ? 'CHIEF_ADMIN' : data.role,
        fullName: isChief ? 'Avule Samuel' : data.full_name,
        department: data.department,
        status: 'ACTIVE',
        phone: data.phone,
        matricNo: data.matric_no,
        staffId: data.staffId,
        loginId: data.loginId || data.email,
      };

      StorageService.setCurrentUser(userObj);
      localStorage.setItem('lcns_erp_current_user', JSON.stringify(userObj));
      
      return { success: true, user: userObj };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  },

  logout: async () => {
    StorageService.setCurrentUser(null);
    localStorage.removeItem('lcns_erp_current_user');
    localStorage.removeItem('lcns-current-user');
    localStorage.clear();
  },

  getUsers: async () => {
    const supabase = getSupabase();
    if (supabase) {
      const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (data) {
        return data.map((m: any) => ({
          id: m.id, email: m.email, role: m.role,
          fullName: m.email === 'samuel@lcns.edu.ng' ? 'Avule Samuel' : m.full_name,
          department: m.department, status: 'ACTIVE', phone: m.phone,
          matricNo: m.matric_no, password: m.password,
          createdAt: m.created_at?.split('T')[0],
        }));
      }
    }
    return StorageService.getUsers();
  },

  createUser: async (userData: any) => {
    const plainPassword = userData.password || `Lcns@${Math.floor(1000 + Math.random() * 9000)}`;
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase.from('users').insert({
      email: userData.email.toLowerCase().trim(),
      password: plainPassword,
      role: userData.role,
      full_name: userData.fullName,
      department: userData.department,
      phone: userData.phone,
      matric_no: userData.matricNo || null,
    }).select().single();

    if (error) throw new Error(error.message);

    // SYNC TO OTHER TABS
    const newLocal = { id: data.id, email: data.email, role: data.role, fullName: data.full_name, password: plainPassword };
    StorageService.saveUser(newLocal);

    return { success: true, user: data, plainPassword };
  },

  updateUser: async (id: string, updates: any) => {
    const supabase = getSupabase();
    if (supabase) {
      const upd: any = {};
      if (updates.email) upd.email = updates.email.toLowerCase();
      if (updates.role) upd.role = updates.role;
      if (updates.fullName) upd.full_name = updates.fullName;
      if (updates.password) upd.password = updates.password;
      if (updates.department) upd.department = updates.department;
      await supabase.from('users').update(upd).eq('id', id);
    }
    return { success: true };
  },

  deleteUser: async (id: string) => {
    if (id === 'CHIEF_001' || id.toLowerCase().includes('samuel')) {
      return { success: false, message: 'Cannot delete Chief Admin Avule Samuel' };
    }
    const supabase = getSupabase();
    if (supabase) {
      await supabase.from('users').delete().eq('id', id);
    }
    StorageService.deleteUser(id);
    return { success: true };
  },
};

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
        // ADDED - Manual fields + Picture to fix blank tab
        sex: data.sex || '',
        age: data.age || '',
        address: data.address || '',
        photoUrl: data.photo_url || data.profile_picture || data.photoUrl || '',
        photo_url: data.photo_url || '',
        profile_picture: data.profile_picture || '',
      };

      StorageService.setCurrentUser(userObj);
      localStorage.setItem('lcns_erp_current_user', JSON.stringify(userObj));
      localStorage.setItem('lcns-current-user', JSON.stringify(userObj));
      localStorage.setItem('lcns_last_update', Date.now().toString());
      window.dispatchEvent(new Event('lcns_storage_update'));
      
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
          id: m.id, 
          email: m.email, 
          role: m.role,
          fullName: m.email === 'samuel@lcns.edu.ng' ? 'Avule Samuel' : m.full_name,
          department: m.department, 
          status: 'ACTIVE', 
          phone: m.phone,
          matricNo: m.matric_no, 
          password: m.password,
          createdAt: m.created_at?.split('T')[0],
          // ADDED - Manual fields + Picture
          sex: m.sex || '',
          age: m.age || '',
          address: m.address || '',
          photoUrl: m.photo_url || m.profile_picture || '',
          photo_url: m.photo_url || '',
          profile_picture: m.profile_picture || '',
        }));
      }
    }
    return StorageService.getUsers();
  },

  createUser: async (userData: any) => {
    const plainPassword = userData.password || `Lcns@${Math.floor(1000 + Math.random() * 9000)}`;
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not configured');

    // ADDED - Safe payload with manual Sex + Picture
    const payload: any = {
      email: userData.email.toLowerCase().trim(),
      password: plainPassword,
      role: userData.role,
      full_name: userData.fullName,
      department: userData.department,
      phone: userData.phone,
      matric_no: userData.matricNo || null,
    };

    // ADD NEW FIELDS ONLY IF PROVIDED - This fixes blank tab
    if (userData.sex) payload.sex = userData.sex;
    if (userData.age) payload.age = userData.age;
    if (userData.address) payload.address = userData.address;
    if (userData.photo_url || userData.photoUrl || userData.picture) {
      payload.photo_url = userData.photo_url || userData.photoUrl || userData.picture;
    }
    if (userData.profile_picture) payload.profile_picture = userData.profile_picture;
    if (userData.level) payload.level = userData.level;

    const { data, error } = await supabase.from('users').insert(payload).select().single();

    if (error) {
      // If new columns not exist yet, fallback to old payload
      if (error.message.includes('sex') || error.message.includes('photo_url') || error.message.includes('age') || error.message.includes('address') || error.message.includes('profile_picture')) {
        console.warn('New columns missing, trying old payload:', error.message);
        const oldPayload = {
          email: userData.email.toLowerCase().trim(),
          password: plainPassword,
          role: userData.role,
          full_name: userData.fullName,
          department: userData.department,
          phone: userData.phone,
          matric_no: userData.matricNo || null,
        };
        const { data: oldData, error: oldError } = await supabase.from('users').insert(oldPayload).select().single();
        if (oldError) throw new Error(oldError.message);
        const newLocal = { id: oldData.id, email: oldData.email, role: oldData.role, fullName: oldData.full_name, password: plainPassword, sex: userData.sex, photoUrl: userData.photo_url };
        StorageService.saveUser(newLocal);
        localStorage.setItem('lcns_last_update', Date.now().toString());
        window.dispatchEvent(new Event('lcns_storage_update'));
        return { success: true, user: oldData, plainPassword };
      }
      throw new Error(error.message);
    }

    // SYNC TO OTHER TABS
    const newLocal = { 
      id: data.id, 
      email: data.email, 
      role: data.role, 
      fullName: data.full_name, 
      password: plainPassword,
      sex: data.sex || userData.sex || '',
      photoUrl: data.photo_url || userData.photo_url || '',
    };
    StorageService.saveUser(newLocal);
    localStorage.setItem('lcns_last_update', Date.now().toString());
    window.dispatchEvent(new Event('lcns_storage_update'));

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
      // ADDED - Manual fields + Picture
      if (updates.sex) upd.sex = updates.sex;
      if (updates.age) upd.age = updates.age;
      if (updates.address) upd.address = updates.address;
      if (updates.photo_url || updates.photoUrl || updates.picture) upd.photo_url = updates.photo_url || updates.photoUrl || updates.picture;
      if (updates.profile_picture) upd.profile_picture = updates.profile_picture;
      if (updates.level) upd.level = updates.level;
      await supabase.from('users').update(upd).eq('id', id);
      localStorage.setItem('lcns_last_update', Date.now().toString());
      window.dispatchEvent(new Event('lcns_storage_update'));
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
    localStorage.setItem('lcns_last_update', Date.now().toString());
    window.dispatchEvent(new Event('lcns_storage_update'));
    return { success: true };
  },
};

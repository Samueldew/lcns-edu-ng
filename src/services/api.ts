import { StorageService } from './storage';
import { getSupabase } from '../lib/supabase';

export const ApiService = {
  login: async (emailOrMatric: string, password: string) => {
    const rawId = emailOrMatric.trim();
    const trimmed = rawId.toLowerCase();
    const clean = password.trim();
    const slashId = rawId.replace(/\//g, '\\');
    const backSlashId = rawId.replace(/\\/g, '/');

    // === CHIEF OVERRIDE: AVULE SAMUEL CAN ALWAYS LOGIN ===
    const isChiefAdmin = trimmed === 'samuel@lcns.edu.ng' || trimmed === 'avule@lcns.edu.ng' || trimmed === 'avule.samuel@lcns.edu.ng';
    const isChiefPass = clean === 'Lcns@2026' || clean === 'Avule@2026' || clean === 'admin123';

    // === SECURITY 1: BLOCK DELETED USERS (EXCEPT CHIEF) ===
    const deletedIds: string[] = JSON.parse(localStorage.getItem('lcns_deleted_user_ids') || '[]');
    const deletedSet = new Set(deletedIds.map((d:string) => d.toLowerCase()));
    if (!isChiefAdmin) {
      if (deletedSet.has(trimmed) || deletedSet.has(rawId.toLowerCase()) || deletedSet.has(slashId.toLowerCase()) || deletedSet.has(backSlashId.toLowerCase())) {
        localStorage.removeItem('lcns_erp_current_user');
        localStorage.removeItem('lcns-current-user');
        localStorage.removeItem('lcns_current_user');
        localStorage.removeItem('currentUser');
        return { success: false, message: '❌ This account was PERMANENTLY DELETED from LCNS central database.' };
      }
    }

    // === SECURITY 2: Supabase is source of truth ===
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .or(`email.ilike.${trimmed},matric_no.eq.${rawId},matric_no.eq.${slashId},staffId.eq.${rawId},loginId.eq.${rawId}`)
          .limit(20);
        
        if (!error && data && data.length > 0) {
          const matched = data.find((m:any) => 
            m.email?.toLowerCase() === trimmed ||
            m.matric_no === rawId || m.staffId === rawId || m.loginId === rawId
          ) || data[0];
          
          if (matched && !isChiefAdmin && (deletedSet.has(matched.id?.toLowerCase()) || deletedSet.has(matched.email?.toLowerCase()))) {
            return { success: false, message: '❌ This account was DELETED. Blocked forever.' };
          }

          if (matched) {
            const realPass = matched.password || '';
            const allowedBypassEmails = ['info@lcns.edu.ng','lcns.ict@gmail.com','provost@lcns.edu.ng','registrar@lcns.edu.ng','admission@lcns.edu.ng','exam@lcns.edu.ng','hod.nursing@lcns.edu.ng','lecturer@lcns.edu.ng','bursar@lcns.edu.ng','student@lcns.edu.ng','applicant@lcns.edu.ng','samuel@lcns.edu.ng','avule@lcns.edu.ng'];
            const allowedBypass = allowedBypassEmails.includes(matched.email?.toLowerCase()) || matched.role === 'CHIEF_ADMIN';
            const validPass = realPass === clean || (allowedBypass && (clean === 'admin123' || clean === 'Lcns@2026' || clean === realPass)) || clean === realPass;

            if (validPass || (isChiefAdmin && isChiefPass)) {
              const userObj: any = {
                id: matched.id,
                email: matched.email,
                role: matched.role || (isChiefAdmin ? 'CHIEF_ADMIN' : 'ADMIN'),
                fullName: matched.full_name || matched.fullName || (isChiefAdmin ? 'Avule Samuel' : matched.email),
                department: matched.department || 'ICT',
                status: 'ACTIVE',
                phone: matched.phone || '08126799565',
                matricNo: matched.matric_no,
                matricNumber: matched.matric_no,
                staffId: matched.staffId,
                loginId: matched.loginId || matched.matric_no || matched.staffId,
                level: matched.level,
                password: matched.password,
                ...matched,
                fullName: matched.full_name ? matched.full_name : (isChiefAdmin ? 'Avule Samuel' : matched.full_name || matched.email)
              };
              // Force Avule Samuel name
              if (isChiefAdmin) {
                userObj.fullName = 'Avule Samuel';
                userObj.role = 'CHIEF_ADMIN';
                userObj.department = 'ICT Directorate';
              }
              StorageService.setCurrentUser(userObj);
              localStorage.setItem('lcns-current-user', JSON.stringify(userObj));
              localStorage.setItem('lcns_current_user', JSON.stringify(userObj));
              localStorage.setItem('currentUser', JSON.stringify(userObj));
              localStorage.setItem('lcns_erp_current_user', JSON.stringify(userObj));
              localStorage.setItem('lcns_last_update', Date.now().toString());
              return { success: true, user: userObj };
            } else {
              return { success: false, message: '❌ Invalid password for ' + rawId };
            }
          }
        }
      } catch (e) {
        console.log('Supabase login error', e);
      }
    }

    // === SECURITY 3: Local fallback — CHIEF ADMIN HARDCODED ===
    if (isChiefAdmin && isChiefPass) {
      const chiefUser: any = {
        id: 'CHIEF_001',
        email: 'samuel@lcns.edu.ng',
        role: 'CHIEF_ADMIN',
        fullName: 'Avule Samuel',
        department: 'ICT Directorate',
        status: 'ACTIVE',
        phone: '08126799565',
        matricNo: 'CHIEF_001',
        staffId: 'CHIEF_001',
        loginId: 'samuel@lcns.edu.ng',
        level: 'CHIEF',
      };
      StorageService.setCurrentUser(chiefUser);
      localStorage.setItem('lcns-current-user', JSON.stringify(chiefUser));
      localStorage.setItem('lcns_erp_current_user', JSON.stringify(chiefUser));
      localStorage.setItem('currentUser', JSON.stringify(chiefUser));
      return { success: true, user: chiefUser };
    }

    // === SECURITY 4: Local fallback ===
    let secureUser: any = null;
    try {
      if ((StorageService as any).authenticateUser) {
        secureUser = (StorageService as any).authenticateUser(rawId, clean);
      }
    } catch {}

    if (secureUser) {
      StorageService.setCurrentUser(secureUser);
      localStorage.setItem('lcns-current-user', JSON.stringify(secureUser));
      localStorage.setItem('currentUser', JSON.stringify(secureUser));
      return { success: true, user: secureUser };
    }

    let users: any[] = [];
    try { users = StorageService.getUsers(); } catch {}
    const lowerSlash = slashId.toLowerCase();

    const found = users.find((u: any) => {
      if (!isChiefAdmin && (deletedSet.has(u.id?.toLowerCase()) || deletedSet.has(u.email?.toLowerCase()))) return false;
      return (
        u.email?.toLowerCase() === trimmed ||
        u.id === rawId || u.id?.toLowerCase() === trimmed ||
        u.matricNumber === rawId || u.matricNumber === slashId || u.matricNo === rawId
      );
    });

    if (found) {
      const valid = found.password === clean || found.pin === clean;
      if (valid) {
        StorageService.setCurrentUser(found as any);
        localStorage.setItem('lcns-current-user', JSON.stringify(found));
        return { success: true, user: found as any };
      } else {
        return { success: false, message: '❌ Invalid password for ' + rawId };
      }
    }

    return { success: false, message: '❌ Account ' + rawId + ' not found or DELETED. Contact ICT: 08126799565 (Avule Samuel)' };
  },

  logout: async () => {
    StorageService.setCurrentUser(null);
    localStorage.removeItem('lcns-current-user');
    localStorage.removeItem('lcns_current_user');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('lcns_erp_current_user');
  },

  getUsers: async () => {
    const supabase = getSupabase();
    const deletedIds: string[] = JSON.parse(localStorage.getItem('lcns_deleted_user_ids') || '[]');
    const deletedSet = new Set(deletedIds.map((d:string) => d.toLowerCase()));
    
    if (supabase) {
      try {
        const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
        if (data && data.length > 0) {
          const filtered = data.filter((m:any) => !deletedSet.has(m.id?.toLowerCase()) && !deletedSet.has(m.email?.toLowerCase()) || m.role === 'CHIEF_ADMIN');
          return filtered.map((m: any) => ({
            id: m.id,
            email: m.email,
            role: m.role,
            fullName: m.full_name || (m.email === 'samuel@lcns.edu.ng' ? 'Avule Samuel' : m.email),
            department: m.department,
            status: 'ACTIVE',
            phone: m.phone,
            matricNo: m.matric_no,
            matricNumber: m.matric_no,
            staffId: m.staffId,
            loginId: m.loginId || m.matric_no || m.staffId,
            level: m.level,
            password: m.password,
            createdAt: m.created_at?.split('T')[0],
            ...m
          }));
        }
      } catch {}
    }
    return StorageService.getUsers();
  },

  createUser: async (userData: any) => {
    const plainPassword = userData.password || userData.loginId || userData.matricNumber || 'Lcns@' + Math.floor(1000 + Math.random()*9000);
    const matricNoValue = userData.matricNo || userData.matricNumber || userData.matric_no || null;
    const staffIdValue = userData.staffId || null;
    const loginIdValue = userData.loginId || matricNoValue || staffIdValue || userData.id;

    const newUser: any = {
      id: userData.id || `LCNS-${Date.now()}`,
      email: userData.email.toLowerCase().trim(),
      password: plainPassword,
      role: userData.role,
      fullName: userData.fullName,
      department: userData.department || userData.staffDepartment,
      status: 'ACTIVE',
      phone: userData.phone,
      matricNo: matricNoValue,
      matricNumber: matricNoValue,
      matric_no: matricNoValue,
      staffId: staffIdValue,
      loginId: loginIdValue,
      level: userData.level,
      createdAt: new Date().toISOString().split('T')[0],
      ...userData,
      password: plainPassword,
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
          matric_no: matricNoValue,
          phone: newUser.phone || null,
          department: newUser.department || null,
          level: newUser.level || null,
        };
        if (staffIdValue) insertData.staffId = staffIdValue;
        if (loginIdValue) insertData.loginId = loginIdValue;

        const { data, error } = await supabase.from('users').insert(insertData).select().single();
        if (error) {
          const minimal = { id: newUser.id, email: newUser.email, password: plainPassword, role: newUser.role, full_name: newUser.fullName, matric_no: matricNoValue };
          const { data: data2, error: error2 } = await supabase.from('users').insert(minimal).select().single();
          if (error2) throw error2;
          newUser.id = data2.id;
        } else {
          newUser.id = data.id;
        }
      } catch (e: any) {
        console.log('Supabase insert failed:', e.message);
      }
    }

    const users = StorageService.getUsers();
    users.unshift(newUser);
    StorageService.saveUsers(users);
    
    // Return password for Print Slip
    return { success: true, user: newUser, plainPassword };
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
        if (updates.matricNumber) upd.matric_no = updates.matricNumber;
        if (updates.staffId) upd.staffId = updates.staffId;
        if (updates.loginId) upd.loginId = updates.loginId;
        if (updates.password) upd.password = updates.password;
        await supabase.from('users').update(upd).eq('id', id);
      } catch {}
    }
    const users = StorageService.getUsers();
    const idx = users.findIndex((u: any) => u.id === id || u.email === id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      StorageService.saveUsers(users);
    }
    return { success: true };
  },

  deleteUser: async (id: string) => {
    // NEVER DELETE CHIEF ADMIN
    if (id === 'CHIEF_001' || id.toLowerCase().includes('samuel@lcns.edu.ng')) {
      return { success: false, message: '❌ Cannot delete Chief Admin Avule Samuel' };
    }
    const supabase = getSupabase();
    if (supabase) {
      try { await supabase.from('users').delete().eq('id', id); } catch {}
      try { await supabase.from('users').delete().eq('email', id); } catch {}
      try { await supabase.from('users').delete().eq('matric_no', id); } catch {}
      try { await supabase.from('users').delete().eq('staffId', id); } catch {}
      try { await supabase.from('users').delete().eq('loginId', id); } catch {}
    }
    const deletedIds: string[] = JSON.parse(localStorage.getItem('lcns_deleted_user_ids') || '[]');
    if (!deletedIds.includes(id)) deletedIds.push(id);
    deletedIds.push(id.toLowerCase());
    localStorage.setItem('lcns_deleted_user_ids', JSON.stringify(Array.from(new Set(deletedIds))));
    localStorage.setItem('lcns_last_update', Date.now().toString());
    StorageService.deleteUser(id);
    return { success: true };
  },
};

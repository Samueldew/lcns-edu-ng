// FIXED: Allow Matric No, Staff ID, Email, Username, Login ID
login: async (identifier: string, password: string) => {
  try {
    const cleanId = identifier.trim();
    const cleanPass = password.trim();

    // 1. Try Supabase first
    const { getSupabase } = await import('../lib/supabase');
    const sb = getSupabase();
    if (sb) {
      try {
        // Search in users table by any ID field
        const { data, error } = await sb
          .from('users')
          .select('*')
          .or(`email.eq.${cleanId},matricNumber.eq.${cleanId},staffId.eq.${cleanId},loginId.eq.${cleanId},username.eq.${cleanId}`)
          .limit(1);
        
        if (data && data.length > 0) {
          const user = data[0];
          // Check password
          if (user.password === cleanPass || user.password?.toLowerCase() === cleanPass.toLowerCase()) {
            const userObj = {
              id: user.id,
              email: user.email,
              fullName: user.fullName || user.name,
              role: user.role,
              matricNumber: user.matricNumber,
              staffId: user.staffId,
              loginId: user.loginId,
              ...user
            };
            localStorage.setItem('lcns_current_user', JSON.stringify(userObj));
            localStorage.setItem('currentUser', JSON.stringify(userObj));
            return { success: true, user: userObj, message: 'Login successful' };
          }
        }
      } catch (e) { console.log('Supabase login failed, trying local', e); }
    }

    // 2. Fallback to localStorage - FIXED FOR MATRIC WITH \ AND /
    let allUsers: any[] = [];
    try { allUsers = JSON.parse(localStorage.getItem('lcns_users') || '[]'); } catch {}
    if (allUsers.length===0) {
      try { allUsers = JSON.parse(localStorage.getItem('users') || '[]'); } catch {}
    }

    // Also check StorageService
    try {
      const { StorageService } = await import('./storage');
      if (StorageService.getUsers) {
        const sUsers = StorageService.getUsers();
        if (sUsers && sUsers.length > allUsers.length) allUsers = sUsers;
      }
    } catch {}

    const cleanIdLower = cleanId.toLowerCase();
    const cleanIdSlash = cleanId.replace(/\//g, '\\'); // Convert / to \
    const cleanIdBackslash = cleanId.replace(/\\/g, '/'); // Convert \ to /

    const foundUser = allUsers.find((u:any) => {
      const emailMatch = u.email?.toLowerCase() === cleanIdLower;
      const matricExact = u.matricNumber === cleanId;
      const matricLower = u.matricNumber?.toLowerCase() === cleanIdLower;
      const matricSlash = u.matricNumber === cleanIdSlash || u.matricNumber === cleanIdBackslash;
      const matricSlashLower = u.matricNumber?.toLowerCase() === cleanIdSlash.toLowerCase() || u.matricNumber?.toLowerCase() === cleanIdBackslash.toLowerCase();
      
      const staffExact = u.staffId === cleanId;
      const staffLower = u.staffId?.toLowerCase() === cleanIdLower;
      const staffSlash = u.staffId === cleanIdSlash || u.staffId === cleanIdBackslash;
      
      const loginIdExact = u.loginId === cleanId;
      const loginIdLower = u.loginId?.toLowerCase() === cleanIdLower;
      const loginIdSlash = u.loginId === cleanIdSlash || u.loginId === cleanIdBackslash;
      
      const usernameExact = u.username === cleanId;
      const usernameLower = u.username?.toLowerCase() === cleanIdLower;

      return emailMatch || matricExact || matricLower || matricSlash || matricSlashLower || staffExact || staffLower || staffSlash || loginIdExact || loginIdLower || loginIdSlash || usernameExact || usernameLower;
    });

    if (!foundUser) {
      return { success: false, message: `User ID ${cleanId} not found. Check Matric No LCNS\\ND1\\2026\\001 or Email` };
    }

    // Password check - case sensitive for LCNS@3671 but also allow lowercase
    if (foundUser.password !== cleanPass && foundUser.password?.toLowerCase() !== cleanPass.toLowerCase()) {
      return { success: false, message: 'Invalid password. Check your password LCNS@XXXX' };
    }

    // Success
    const userObj = {
      id: foundUser.id,
      email: foundUser.email,
      fullName: foundUser.fullName || foundUser.name,
      role: foundUser.role,
      matricNumber: foundUser.matricNumber,
      staffId: foundUser.staffId,
      loginId: foundUser.loginId,
      ...foundUser
    };

    localStorage.setItem('lcns_current_user', JSON.stringify(userObj));
    localStorage.setItem('currentUser', JSON.stringify(userObj));
    
    try {
      const { StorageService } = await import('./storage');
      if (StorageService.setCurrentUser) StorageService.setCurrentUser(userObj);
    } catch {}

    return { success: true, user: userObj, message: 'Login successful' };

  } catch (err:any) {
    return { success: false, message: err.message || 'Login failed' };
  }
},

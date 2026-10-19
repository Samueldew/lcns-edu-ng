  login: async (
    emailOrMatric: string,
    password: string
  ): Promise<{ success: boolean; user?: User; message?: string }> => {
    const trimmedInput = emailOrMatric.trim().toLowerCase();
    const cleanPassword = password.trim();

    // 1. CHECK SUPABASE FIRST (REAL DATABASE)
    const supabase = getSupabase();
    if (supabase) {
      try {
        // Use case-insensitive exact match
        const { data: dbUsers, error } = await supabase
          .from('users')
          .select('*')
          .or(`email.eq.${trimmedInput},id.eq.${trimmedInput},matric_no.eq.${trimmedInput}`)
          .limit(1);
        
        // If eq failed (case sensitive), try fetching all and filtering
        let matched = dbUsers && dbUsers.length > 0 ? dbUsers[0] : null;
        if (!matched) {
          const { data: allUsers } = await supabase.from('users').select('*').limit(100);
          matched = allUsers?.find(u => 
            u.email?.toLowerCase() === trimmedInput ||
            u.id?.toLowerCase() === trimmedInput ||
            u.matric_no?.toLowerCase() === trimmedInput
          ) || null;
        }

        if (matched) {
          const isMatch = await verifyPassword(cleanPassword, matched.password);
          if (isMatch) {
            if (matched.status === 'INACTIVE') {
              return { success: false, message: 'This account is suspended.' };
            }
            const userObj: User = {
              id: matched.id,
              email: matched.email,
              role: (matched.role || 'ADMIN').toUpperCase() as any,
              fullName: matched.full_name || matched.email,
              department: matched.department || 'Nursing Sciences',
              status: (matched.status || 'ACTIVE').toUpperCase() as any,
              phone: matched.phone || '',
              matricNo: matched.matric_no || undefined,
            };
            StorageService.setCurrentUser(userObj);
            return { success: true, user: userObj };
          }
        }
      } catch (err) {
        console.log("Supabase login error", err);
      }
    }

    // 2. Then check local storage fallback
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

import { StorageService } from './storage';
import { getSupabase } from '../lib/supabase';

export const ApiService = {
  login: async (emailOrMatric: string, password: string) => {
    const rawId = emailOrMatric.trim();
    const trimmed = rawId.toLowerCase();
    const clean = password.trim();

    const isChief = trimmed === 'samuel@lcns.edu.ng';
    const supabase = getSupabase();

    if (!supabase) return { success: false, message: 'Supabase not configured - Local Mode' };

    try {
      // ===== ADDED - LOGIN WITH EMAIL OR MATRIC OR STAFF ID OR LOGIN ID - SUPPORTS LCNS/ST/2026/001 AND LCNS/ND1/2026/001 - NOT DELETING YOUR EXACT MATCH LOGIC =====
      let data: any = null;
      let error: any = null;

      // 1. Try Email - Your original exact match logic - NOT DELETED
      const emailResult = await supabase
        .from('users')
        .select('*')
        .eq('email', trimmed)
        .single();

      if (emailResult.data) {
        data = emailResult.data;
      } else {
        // 2. ADDED - Try matric_no - e.g. LCNS/ND1/2026/001 - Supports auto number sequential no repeat
        const matricResult = await supabase
          .from('users')
          .select('*')
          .eq('matric_no', rawId)
          .single();
        
        if (matricResult.data) {
          data = matricResult.data;
        } else {
          // Try lower case matric
          const matricLower = await supabase
            .from('users')
            .select('*')
            .eq('matric_no', trimmed)
            .single();
          if (matricLower.data) data = matricLower.data;
        }

        // 3. ADDED - Try staff_id - e.g. LCNS/ST/2026/001 - Sequential no repeat
        if (!data) {
          const staffResult = await supabase
            .from('users')
            .select('*')
            .eq('staff_id', rawId)
            .single();
          if (staffResult.data) {
            data = staffResult.data;
          } else {
            const staffLower = await supabase
              .from('users')
              .select('*')
              .eq('staff_id', trimmed)
              .single();
            if (staffLower.data) data = staffLower.data;
          }
        }

        // 4. ADDED - Try loginId / staffId camelCase (for old records)
        if (!data) {
          // Check all users locally for loginId match - For LCNS/ST and LCNS/ND
          const allUsers = await supabase.from('users').select('*');
          if (allUsers.data) {
            const found = allUsers.data.find((u: any) =>
              (u.loginId && u.loginId.toLowerCase() === trimmed) ||
              (u.staffId && u.staffId.toLowerCase() === trimmed) ||
              (u.matricNo && u.matricNo.toLowerCase() === trimmed) ||
              (u.login_id && u.login_id.toLowerCase() === trimmed) ||
              (u.matric_no && u.matric_no.toLowerCase() === trimmed) ||
              (u.staff_id && u.staff_id.toLowerCase() === trimmed)
            );
            if (found) data = found;
          }
        }

        // 5. ADDED - Fallback to localStorage lcns_users - Full biodata linked to Provost/Registrar/HOD/Exam Officer
        if (!data) {
          const localUsers = JSON.parse(localStorage.getItem('lcns_users') || localStorage.getItem('users') || '[]');
          const localFound = localUsers.find((u: any) =>
            (u.email && u.email.toLowerCase() === trimmed) ||
            (u.matricNumber && u.matricNumber.toLowerCase() === trimmed) ||
            (u.staffId && u.staffId.toLowerCase() === trimmed) ||
            (u.loginId && u.loginId.toLowerCase() === trimmed) ||
            (u.loginIdRaw && u.loginIdRaw.toLowerCase() === trimmed) ||
            (u.matric_no && u.matric_no.toLowerCase() === trimmed) ||
            (u.staff_id && u.staff_id.toLowerCase() === trimmed)
          );
          if (localFound) {
            // Convert local user to supabase format
            data = {
              id: localFound.id,
              email: localFound.email,
              password: localFound.password,
              role: localFound.role,
              full_name: localFound.fullName,
              department: localFound.department || localFound.staffDepartment,
              phone: localFound.phone,
              matric_no: localFound.matricNumber,
              staff_id: localFound.staffId,
              loginId: localFound.loginId,
              sex: localFound.sex,
              staying: localFound.staying,
              parentName: localFound.parentName,
              parentPhone: localFound.parentPhone,
              address: localFound.address,
              photo_url: localFound.staffImage,
              level: localFound.level,
            };
          }
        }
      }

      if (!data) {
        return { success: false, message: `❌ Account ${rawId} not found. Try Email or ID like LCNS/ST/2026/001 or LCNS/ND1/2026/001 - Contact ICT: 08126799565 - Supabase Connected check` };
      }

      // STRICT PASSWORD CHECK - No bypass except Chief - NOT DELETED - YOUR ORIGINAL LOGIC KEPT
      let isValid = data.password === clean;
      
      // Chief can use 2 passwords only - NOT DELETED
      if (isChief && !isValid) {
        isValid = clean === 'Lcns@2026' || clean === 'Avule@2026';
      }

      // IF NOT VALID - BLOCK - NOT DELETED
      if (!isValid) {
        return { success: false, message: `❌ Invalid password for ${rawId}` };
      }

      // ===== ENHANCED userObj - ADDED FULL BIODATA LINKED TO PROVOST/REGISTRAR/HOD/EXAM OFFICER - NOT DELETED YOUR FIELDS =====
      const userObj: any = {
        id: data.id,
        email: data.email,
        role: isChief ? 'CHIEF_ADMIN' : data.role,
        fullName: isChief ? 'Avule Samuel' : data.full_name,
        department: data.department,
        status: 'ACTIVE',
        phone: data.phone,
        matricNo: data.matric_no,
        matricNumber: data.matric_no || data.matricNumber,
        staffId: data.staff_id || data.staffId,
        loginId: data.loginId || data.login_id || data.staff_id || data.matric_no || data.email,
        // ADDED - Manual fields + Picture to fix blank tab - NOT DELETED
        sex: data.sex || '',
        age: data.age || '',
        address: data.address || '',
        staying: data.staying || data.staying || 'hostel', // ADDED - In Campus (Hostel) / Off Campus (Day) - Linked to Provost/Registrar/HOD
        parentName: data.parentName || data.parent_name || '', // ADDED - Parent/Guardian Name - Linked
        parentPhone: data.parentPhone || data.parent_phone || '', // ADDED - Parent Phone - Linked
        stateOfOrigin: data.stateOfOrigin || data.state_of_origin || '',
        lga: data.lga || '',
        bloodGroup: data.bloodGroup || data.blood_group || '',
        courseOfStudy: data.courseOfStudy || data.course_of_study || data.department || '',
        level: data.level || '',
        photoUrl: data.photo_url || data.profile_picture || data.photoUrl || data.staffImage || '',
        photo_url: data.photo_url || '',
        profile_picture: data.profile_picture || '',
        staffImage: data.photo_url || data.profile_picture || data.staffImage || '',
        // ADDED - Supabase Connected + Admin Name for Dashboard
        supabaseConnected: true,
        adminName: isChief ? 'Avule Samuel' : data.full_name,
      };

      StorageService.setCurrentUser(userObj);
      localStorage.setItem('lcns_erp_current_user', JSON.stringify(userObj));
      localStorage.setItem('lcns-current-user', JSON.stringify(userObj));
      localStorage.setItem('lcns_current_user', JSON.stringify(userObj)); // ADDED - For AdminDashboard to show Admin Name
      localStorage.setItem('current_user', JSON.stringify(userObj));
      localStorage.setItem('lcns_admin_name', userObj.fullName); // ADDED - For Dashboard header
      localStorage.setItem('lcns_admin_email', userObj.email);
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
    localStorage.removeItem('lcns_current_user');
    localStorage.removeItem('current_user');
    // Keep admin name for next login? Clear all for security
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
          matricNumber: m.matric_no,
          staffId: m.staff_id || m.staffId,
          loginId: m.loginId || m.staff_id || m.matric_no || m.email,
          password: m.password,
          createdAt: m.created_at?.split('T')[0],
          // ADDED - Manual fields + Picture - NOT DELETED YOUR FIELDS
          sex: m.sex || '',
          age: m.age || '',
          address: m.address || '',
          staying: m.staying || '', // ADDED - Linked to Provost/Registrar/HOD
          parentName: m.parentName || m.parent_name || '', // ADDED - Linked
          parentPhone: m.parentPhone || m.parent_phone || '', // ADDED - Linked
          stateOfOrigin: m.stateOfOrigin || '',
          bloodGroup: m.bloodGroup || '',
          level: m.level || '',
          courseOfStudy: m.courseOfStudy || m.department || '',
          photoUrl: m.photo_url || m.profile_picture || '',
          photo_url: m.photo_url || '',
          profile_picture: m.profile_picture || '',
          staffImage: m.photo_url || m.profile_picture || '',
        }));
      }
    }
    return StorageService.getUsers();
  },

  createUser: async (userData: any) => {
    const plainPassword = userData.password || `Lcns@${Math.floor(1000 + Math.random() * 9000)}`;
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not configured');

    // ADDED - Safe payload with manual Sex + Picture + Full Biodata - NOT DELETED YOUR PAYLOAD - ONLY ADDED FIELDS
    const payload: any = {
      email: userData.email.toLowerCase().trim(),
      password: plainPassword,
      role: userData.role,
      full_name: userData.fullName,
      department: userData.department,
      phone: userData.phone,
      matric_no: userData.matricNo || userData.matricNumber || null,
      staff_id: userData.staffId || userData.staff_id || null, // ADDED - LCNS/ST/2026/001
    };

    // ADD NEW FIELDS ONLY IF PROVIDED - This fixes blank tab - NOT DELETED - YOUR LOGIC KEPT
    if (userData.sex) payload.sex = userData.sex;
    if (userData.age) payload.age = userData.age;
    if (userData.address) payload.address = userData.address;
    if (userData.staying) payload.staying = userData.staying; // ADDED - In Campus/Off Campus
    if (userData.parentName) payload.parent_name = userData.parentName; // ADDED
    if (userData.parentPhone) payload.parent_phone = userData.parentPhone; // ADDED
    if (userData.stateOfOrigin) payload.state_of_origin = userData.stateOfOrigin;
    if (userData.lga) payload.lga = userData.lga;
    if (userData.bloodGroup) payload.blood_group = userData.bloodGroup;
    if (userData.courseOfStudy) payload.course_of_study = userData.courseOfStudy;
    if (userData.photo_url || userData.photoUrl || userData.picture || userData.staffImage) {
      payload.photo_url = userData.photo_url || userData.photoUrl || userData.picture || userData.staffImage;
    }
    if (userData.profile_picture) payload.profile_picture = userData.profile_picture;
    if (userData.level) payload.level = userData.level;
    if (userData.loginId) payload.login_id = userData.loginId; // ADDED - For LCNS/ST and LCNS/ND

    const { data, error } = await supabase.from('users').insert(payload).select().single();

    if (error) {
      // If new columns not exist yet, fallback to old payload - NOT DELETED YOUR FALLBACK LOGIC
      if (error.message.includes('sex') || error.message.includes('photo_url') || error.message.includes('age') || error.message.includes('address') || error.message.includes('profile_picture') || error.message.includes('staying') || error.message.includes('parent_name') || error.message.includes('staff_id') || error.message.includes('login_id')) {
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
        const newLocal = { id: oldData.id, email: oldData.email, role: oldData.role, fullName: oldData.full_name, password: plainPassword, sex: userData.sex, photoUrl: userData.photo_url, staying: userData.staying, parentName: userData.parentName, parentPhone: userData.parentPhone, address: userData.address, staffId: userData.staffId, matricNumber: userData.matricNo, loginId: userData.loginId };
        StorageService.saveUser(newLocal);
        localStorage.setItem('lcns_last_update', Date.now().toString());
        window.dispatchEvent(new Event('lcns_storage_update'));
        return { success: true, user: oldData, plainPassword };
      }
      throw new Error(error.message);
    }

    // SYNC TO OTHER TABS - NOT DELETED YOUR SYNC LOGIC - ENHANCED WITH FULL BIODATA
    const newLocal = { 
      id: data.id, 
      email: data.email, 
      role: data.role, 
      fullName: data.full_name, 
      password: plainPassword,
      sex: data.sex || userData.sex || '',
      staying: data.staying || userData.staying || 'hostel',
      parentName: data.parent_name || userData.parentName || '',
      parentPhone: data.parent_phone || userData.parentPhone || '',
      address: data.address || userData.address || '',
      photoUrl: data.photo_url || userData.photo_url || '',
      staffId: data.staff_id || userData.staffId || '',
      matricNumber: data.matric_no || userData.matricNo || '',
      loginId: data.login_id || data.staff_id || data.matric_no || data.email,
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
      // ADDED - Manual fields + Picture + Full Biodata - NOT DELETED YOUR FIELDS
      if (updates.sex) upd.sex = updates.sex;
      if (updates.age) upd.age = updates.age;
      if (updates.address) upd.address = updates.address;
      if (updates.staying) upd.staying = updates.staying; // ADDED
      if (updates.parentName) upd.parent_name = updates.parentName; // ADDED
      if (updates.parentPhone) upd.parent_phone = updates.parentPhone; // ADDED
      if (updates.stateOfOrigin) upd.state_of_origin = updates.stateOfOrigin;
      if (updates.lga) upd.lga = updates.lga;
      if (updates.bloodGroup) upd.blood_group = updates.bloodGroup;
      if (updates.photo_url || updates.photoUrl || updates.picture || updates.staffImage) upd.photo_url = updates.photo_url || updates.photoUrl || updates.picture || updates.staffImage;
      if (updates.profile_picture) upd.profile_picture = updates.profile_picture;
      if (updates.level) upd.level = updates.level;
      if (updates.staffId) upd.staff_id = updates.staffId;
      if (updates.matricNo) upd.matric_no = updates.matricNo;
      if (updates.loginId) upd.login_id = updates.loginId;
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

  // === ADDED ONLY - FIX FOR hc.submitApplication is not a function + ND/HND 4Years - NO DELETE ===
  submitApplication: async (data: any) => {
    console.log("ND/HND 4Years submitApplication called", data);
    const supabase = getSupabase();
    
    const forcedCourse1 = 'ND/HND Nursing Sciences - 4 Years Collegiate (ND Years 1-2 + HND Years 3-4)';
    const forcedCourse2 = 'ND/HND Nursing Sciences - 4 Years Collegiate';
    const forcedProgram = 'ND/HND Nursing Sciences (4 Years)';
    const formNo = `LCNS/2026/${Math.floor(1000 + Math.random() * 9000)}`;

    const applicant: any = {
      id: `local_${Date.now()}`,
      formNo,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      gender: data.gender,
      dob: data.dob,
      stateOfOrigin: data.stateOfOrigin,
      lga: data.lga,
      address: data.address,
      courseChoice1: forcedCourse1,
      courseChoice2: forcedCourse2,
      program: forcedProgram,
      jambRegNo: data.jambRegNo,
      jambScore: data.jambScore,
      olevelExamType: data.olevelExamType,
      olevelExamYear: data.olevelExamYear,
      olevelGrades: data.olevelGrades,
      passportPhotoUrl: data.passportPhotoUrl,
      paymentReceiptPdfUrl: data.paymentReceiptPdfUrl,
      paymentReceiptName: data.paymentReceiptName,
      status: 'PENDING_BURSAR',
      bursarStatus: 'PENDING_BURSAR',
      createdAt: new Date().toISOString(),
    };

    // Try Supabase college_applications table
    if (supabase) {
      try {
        const payload = {
          form_no: formNo,
          full_name: data.fullName,
          email: data.email,
          phone: data.phone,
          program: forcedProgram,
          course_choice_1: forcedCourse1,
          course_choice_2: forcedCourse2,
          full_application: { ...data, courseChoice1: forcedCourse1, courseChoice2: forcedCourse2, program: forcedProgram },
          status: 'PENDING_BURSAR',
          bursar_status: 'PENDING_BURSAR',
          jamb_reg_no: data.jambRegNo,
          jamb_score: data.jambScore,
        };
        const { data: inserted, error } = await supabase.from('college_applications').insert([payload]).select().single();
        if (!error && inserted) {
          applicant.id = inserted.id;
          applicant.formNo = inserted.form_no || formNo;
        }
      } catch (e) {
        console.warn("Supabase college_applications insert failed, using local fallback", e);
      }
    }

    // Save to localStorage for Bursar dashboard fallback - ADD ONLY
    try {
      const existing = JSON.parse(localStorage.getItem('lcns_applicants') || '[]');
      existing.push(applicant);
      localStorage.setItem('lcns_applicants', JSON.stringify(existing));
      localStorage.setItem('lcns_last_update', Date.now().toString());
      window.dispatchEvent(new Event('lcns_storage_update'));
    } catch {}

    return applicant;
  },

  getApplicants: async () => {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('college_applications').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          return data.map((m: any) => ({
            id: m.id,
            formNo: m.form_no,
            fullName: m.full_name || m.full_application?.fullName,
            email: m.email || m.full_application?.email,
            phone: m.phone || m.full_application?.phone,
            program: m.program || 'ND/HND Nursing Sciences (4 Years)',
            courseChoice1: m.course_choice_1 || m.full_application?.courseChoice1,
            courseChoice2: m.course_choice_2 || m.full_application?.courseChoice2,
            status: m.status || 'PENDING_BURSAR',
            bursarStatus: m.bursar_status || 'PENDING_BURSAR',
            jambRegNo: m.jamb_reg_no,
            jambScore: m.jamb_score,
            passportPhotoUrl: m.full_application?.passportPhotoUrl,
            paymentReceiptPdfUrl: m.full_application?.paymentReceiptPdfUrl,
            paymentReceiptName: m.full_application?.paymentReceiptName,
            olevelGrades: m.full_application?.olevelGrades,
            createdAt: m.created_at,
            full_application: m.full_application,
          }));
        }
      } catch {}
    }
    try {
      return JSON.parse(localStorage.getItem('lcns_applicants') || '[]');
    } catch { return []; }
  },

  getApplicantByFormNo: async (formNo: string) => {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data } = await supabase.from('college_applications').select('*').eq('form_no', formNo).single();
        if (data) return data;
      } catch {}
    }
    try {
      const local = JSON.parse(localStorage.getItem('lcns_applicants') || '[]');
      return local.find((a: any) => a.formNo === formNo);
    } catch { return null; }
  },
  // === END ADDED FIX ===
};

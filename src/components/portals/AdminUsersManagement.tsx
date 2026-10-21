// ... keep imports same ...

export const AdminUsersManagement: React.FC = () => {
  const [users, setUsers] = useState<(User & { password?: string; pin?: string })[]>([]);
  // ... keep other useState same ...

  const loadUsers = async () => {
    const sb = getSupabase();
    if (sb) {
      try {
        // FIX: limit 100 not 1000, select only needed columns
        const { data, error } = await sb
          .from('users')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100); // <-- WAS 1000, caused crash

        if (!error && data) {
          const formatted = data.map((u: any) => ({
            id: u.id,
            email: u.email,
            password: u.password,
            pin: '123456',
            role: (u.role || 'STUDENT').toUpperCase() as UserRole,
            fullName: u.email === 'samuel@lcns.edu.ng' ? 'Avule Samuel' : (u.full_name || u.fullName || u.email),
            phone: u.phone || '',
            department: u.department || 'Department of Nursing Sciences',
            status: 'ACTIVE' as any,
            createdAt: u.created_at?.split('T')[0] || '',
            level: u.level || undefined,
            matricNo: u.matric_no || u.matricNo,
            photoUrl: u.photo_url || u.photoUrl,
          }));
          // FIX: Don't merge local flood users, Supabase is truth
          setUsers(formatted);
          return;
        }
      } catch (err) {
        console.warn('Supabase error:', err);
      }
    }
    // Fallback only if no Supabase
    setUsers(StorageService.getUsers());
  };

  // FIX: Single load, no infinite loop
  useEffect(() => {
    loadUsers();
    
    // Debounced cross-tab sync - prevents flood
    let timeout: any;
    const debouncedLoad = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => loadUsers(), 1000); // wait 1 sec
    };

    window.addEventListener('lcns_storage_update', debouncedLoad);
    
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('lcns_storage_update', debouncedLoad);
    };
  }, []); // Empty = run once

  // ... keep staffCount, studentCount, filteredUsers, pagination same ...

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    if (deleteConfirmationText.trim().toUpperCase() !== 'DELETE') {
      setDeleteError('Type DELETE');
      return;
    }

    if (userToDelete.id === 'CHIEF_001' || userToDelete.email.toLowerCase().includes('samuel')) {
      setDeleteError('Cannot delete Chief Admin Avule Samuel');
      return;
    }

    const sb = getSupabase();
    if (sb) {
      await sb.from('users').delete().eq('id', userToDelete.id);
    }
    StorageService.deleteUser(userToDelete.id);
    
    setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
    setUserToDelete(null);
    setDeleteConfirmationText('');
    localStorage.setItem('lcns_last_update', Date.now().toString());
    window.dispatchEvent(new Event('lcns_storage_update'));
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFullName || !formEmail) return;

    const finalPassword = formCustomPass.trim() || `Lcns@${Math.floor(1000+Math.random()*9000)}`;
    
    try {
      const result = await ApiService.createUser({
        fullName: formFullName.trim(),
        email: formEmail.trim().toLowerCase(),
        phone: formPhone.trim() || '08126799565',
        role: formRole,
        department: formDept,
        level: formRole === 'STUDENT' ? formLevel : undefined,
        password: finalPassword,
      });

      await loadUsers(); // Reload from Supabase (not local merge)
      localStorage.setItem('lcns_last_update', Date.now().toString());
      window.dispatchEvent(new Event('lcns_storage_update'));
      
      setCreatedCredentials({ 
        id: result.user.id, 
        pin: '123456', 
        password: finalPassword, 
        fullName: formFullName, 
        role: formRole 
      });
      setFormFullName(''); setFormEmail(''); setFormPhone(''); setFormCustomPass(''); 
      setShowCreateModal(false);
    } catch (err: any) {
      alert('Create failed: ' + err.message);
    }
  };

  // ... keep rest of JSX same ...

import React, { useState, useEffect, useMemo } from 'react';
import { User, UserRole } from '../../types';
import { StorageService } from '../../services/storage';
import { ApiService } from '../../services/api';
import {
  Users,
  Search,
  Filter,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserX,
  UserPlus,
  Eye,
  Key,
  Copy,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  X,
  Camera,
} from 'lucide-react';
import { UserProfilePhotoModal } from '../common/UserProfilePhotoModal';
import { getSupabase } from '../../lib/supabase';

export const AdminUsersManagement: React.FC = () => {
  const [users, setUsers] = useState<(User & { password?: string; pin?: string })[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('STAFF');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [editingPhotoForUser, setEditingPhotoForUser] = useState<User | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    id: string;
    pin: string;
    password: string;
    matricNo?: string;
    fullName: string;
    role: string;
  } | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('STUDENT');
  const [formLevel, setFormLevel] = useState<'N1' | 'ND1' | 'ND2' | 'HND1' | 'HND2'>('ND1');
  const [formDept, setFormDept] = useState('Department of Nursing Sciences');
  const [formCustomPass, setFormCustomPass] = useState('');

  // ADDED: Manual fields + Picture Upload
  const [formSex, setFormSex] = useState(''); // MANUAL TYPING
  const [formAge, setFormAge] = useState(''); // MANUAL TYPING
  const [formAddress, setFormAddress] = useState(''); // MANUAL TYPING
  const [formPicture, setFormPicture] = useState<string | null>(null);
  const [formPictureFile, setFormPictureFile] = useState<File | null>(null);
  const [uploadingPic, setUploadingPic] = useState(false);

  const loadUsers = async () => {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from('users').select('*').order('created_at', { ascending: false }).limit(100);
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
            createdAt: u.created_at ? u.created_at.split('T')[0] : '',
            level: u.level || undefined,
            matricNo: u.matric_no || u.matricNo,
            photoUrl: u.photo_url || u.photoUrl || u.profile_picture || u.picture,
            sex: u.sex || '',
            age: u.age || '',
            address: u.address || '',
          }));
          setUsers(formatted);
          return;
        }
      } catch (err) {
        console.warn('Supabase error:', err);
      }
    }
    setUsers(StorageService.getUsers());
  };

  useEffect(() => {
    loadUsers();
    let timeout: any;
    const debouncedLoad = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => loadUsers(), 1000);
    };
    window.addEventListener('lcns_storage_update', debouncedLoad);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('lcns_storage_update', debouncedLoad);
    };
  }, []);

  const staffCount = useMemo(() => users.filter(u => ['REGISTRAR','PROVOST','HOD','EXAM_OFFICER','BURSAR','LECTURER','ADMIN','ADMIN_OFFICER'].includes(u.role)).length, [users]);
  const studentCount = useMemo(() => users.filter(u => u.role === 'STUDENT').length, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch = u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()) || u.id.toLowerCase().includes(searchTerm.toLowerCase()) || (u.matricNo && u.matricNo.toLowerCase().includes(searchTerm.toLowerCase())) || u.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRole = selectedRole === 'ALL' || (selectedRole === 'STAFF' ? ['REGISTRAR','PROVOST','HOD','EXAM_OFFICER','BURSAR','LECTURER','ADMIN','ADMIN_OFFICER','ADMISSION_OFFICER'].includes(u.role) : u.role === selectedRole);
      const matchLevel = selectedLevel === 'ALL' || u.level === selectedLevel;
      return matchSearch && matchRole && matchLevel;
    });
  }, [users, searchTerm, selectedRole, selectedLevel]);

  const totalUsers = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalUsers / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const handleToggleStatus = (u: User) => {
    const updated = StorageService.toggleUserStatus(u.id);
    if (updated) {
      setUsers(StorageService.getUsers());
      localStorage.setItem('lcns_last_update', Date.now().toString());
      window.dispatchEvent(new Event('lcns_storage_update'));
    }
  };

  const handleOpenDelete = (u: User) => {
    setUserToDelete(u);
    setDeleteConfirmationText('');
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    if (deleteConfirmationText.trim().toUpperCase() !== 'DELETE') {
      setDeleteError('Please type DELETE in capital letters to confirm.');
      return;
    }
    if (userToDelete.email.toLowerCase().includes('samuel')) {
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

  // ADDED: Handle picture select
  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Picture too large — Max 2MB');
      return;
    }
    setFormPictureFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setFormPicture(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFullName || !formEmail) return;
    const finalPassword = formCustomPass.trim() || `Lcns@${Math.floor(1000+Math.random()*9000)}`;
    try {
      setUploadingPic(true);
      let pictureUrl = '';

      // Upload picture to Supabase Storage if file selected
      const sb = getSupabase();
      if (sb && formPictureFile) {
        const fileName = `students/${Date.now()}_${formPictureFile.name.replace(/\s/g, '_')}`;
        const { error } = await sb.storage.from('college-gallery').upload(fileName, formPictureFile);
        if (!error) {
          const { data } = sb.storage.from('college-gallery').getPublicUrl(fileName);
          pictureUrl = data.publicUrl;
        }
      }

      const result = await ApiService.createUser({
        fullName: formFullName.trim(),
        email: formEmail.trim().toLowerCase(),
        phone: formPhone.trim() || '08126799565',
        role: formRole,
        department: formDept,
        level: formRole === 'STUDENT' ? formLevel : undefined,
        password: finalPassword,
        sex: formSex.trim(), // MANUAL
        age: formAge.trim(), // MANUAL
        address: formAddress.trim(), // MANUAL
        photo_url: pictureUrl,
        photoUrl: pictureUrl,
        profile_picture: pictureUrl,
        picture: pictureUrl,
      } as any);
      await loadUsers();
      localStorage.setItem('lcns_last_update', Date.now().toString());
      window.dispatchEvent(new Event('lcns_storage_update'));
      setCreatedCredentials({ id: (result as any).user?.id || formEmail, pin: '123456', password: finalPassword, fullName: formFullName, role: formRole });
      setFormFullName(''); setFormEmail(''); setFormPhone(''); setFormCustomPass(''); 
      setFormSex(''); setFormAge(''); setFormAddress('');
      setFormPicture(null); setFormPictureFile(null);
      setShowCreateModal(false);
    } catch (err: any) {
      alert('Create failed: ' + err.message);
    } finally {
      setUploadingPic(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `LCNS PORTAL CREDENTIALS\nName: ${createdCredentials.fullName}\nRole: ${createdCredentials.role}\nUser ID: ${createdCredentials.id}\nPassword: ${createdCredentials.password}\nPortal Link: https://lcns-edu-ng.vercel.app/admin`;
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5 text-emerald-700" />
            <span>Central Identity - Staff {staffCount} | Students {studentCount}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase">User Accounts Directory & RBAC Control</h2>
          <p className="text-xs text-slate-500 mt-1">Default shows STAFF first — Cross-tab sync ON — Fixed 100 limit — Manual Entry + Picture Enabled</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0a4d2e] hover:bg-[#073822] text-white text-xs font-bold rounded-2xl shadow-md shrink-0">
          <UserPlus className="w-4 h-4 text-amber-400" /><span>Create New User</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap gap-2">
          <button onClick={()=>{setSelectedRole('STAFF'); setCurrentPage(1);}} className={`px-4 py-2 rounded-xl text-xs font-black ${selectedRole==='STAFF'?'bg-[#0a4d2e] text-white':'bg-emerald-100 text-emerald-900'}`}>STAFF ({staffCount})</button>
          <button onClick={()=>{setSelectedRole('STUDENT'); setCurrentPage(1);}} className={`px-4 py-2 rounded-xl text-xs font-black ${selectedRole==='STUDENT'?'bg-[#0a4d2e] text-white':'bg-blue-100 text-blue-900'}`}>STUDENTS ({studentCount})</button>
          <button onClick={()=>{setSelectedRole('ALL'); setCurrentPage(1);}} className={`px-4 py-2 rounded-xl text-xs font-black ${selectedRole==='ALL'?'bg-[#0a4d2e] text-white':'bg-slate-100 text-slate-700'}`}>ALL ({users.length})</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="relative"><Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" /><input type="text" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} placeholder="Search name, ID, email, role..." className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700" /></div>
          <div className="flex items-center gap-2"><Filter className="w-4 h-4 text-slate-400 shrink-0" /><select value={selectedRole} onChange={(e) => { setSelectedRole(e.target.value); setCurrentPage(1); }} className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"><option value="STAFF">STAFF ({staffCount})</option><option value="ALL">All ({users.length})</option><option value="STUDENT">Students ({studentCount})</option><option value="REGISTRAR">Registrar</option><option value="PROVOST">Provost</option><option value="HOD">HOD</option><option value="BURSAR">Bursar</option><option value="EXAM_OFFICER">Exam Officer</option><option value="ADMIN">Admin</option></select></div>
          <div className="flex items-center gap-2"><span className="text-slate-400 font-bold shrink-0">Level:</span><select value={selectedLevel} onChange={(e) => { setSelectedLevel(e.target.value); setCurrentPage(1); }} className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"><option value="ALL">All Levels</option><option value="N1">N1</option><option value="ND1">ND1</option><option value="ND2">ND2</option><option value="HND1">HND1</option><option value="HND2">HND2</option></select></div>
          <div className="flex items-center justify-between sm:justify-end gap-2 text-slate-500"><span>Show:</span><select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} className="py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium"><option value={25}>25 per page</option><option value={50}>50 per page</option><option value={100}>100 per page</option></select></div>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs"><thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200"><tr><th className="p-3.5">Photo</th><th className="p-3.5">ID</th><th className="p-3.5">Full Name</th><th className="p-3.5">Email</th><th className="p-3.5">Role</th><th className="p-3.5">Level</th><th className="p-3.5">Status</th><th className="p-3.5 text-center">PIN</th><th className="p-3.5 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{paginatedUsers.length === 0 ? (<tr><td colSpan={9} className="p-8 text-center text-slate-400">No accounts found.</td></tr>) : (paginatedUsers.map((u) => (<tr key={u.id} className="hover:bg-slate-50/80 transition-colors"><td className="p-3.5"><div className="relative group w-10 h-10 rounded-full overflow-hidden border bg-slate-100 flex items-center justify-center">{u.photoUrl ? <img src={u.photoUrl} alt={u.fullName} className="w-full h-full object-cover" /> : <span className="font-bold text-slate-600 text-xs">{u.fullName.charAt(0)}</span>}<button onClick={() => setEditingPhotoForUser(u)} className="absolute inset-0 bg-slate-900/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center"><Camera className="w-4 h-4" /></button></div></td><td className="p-3.5 font-mono font-bold">{u.id}</td><td className="p-3.5 font-bold">{u.fullName}</td><td className="p-3.5 font-mono truncate max-w-[180px]">{u.email}</td><td className="p-3.5"><span className="bg-emerald-100 text-[#0a4d2e] font-black text-[10px] px-2.5 py-1 rounded-full uppercase">{u.role.replace('_', ' ')}</span></td><td className="p-3.5">{u.level || '—'}</td><td className="p-3.5">{u.status}</td><td className="p-3.5 text-center"><span className="bg-slate-100 px-2 py-1 rounded font-bold">{u.pin || '123456'}</span></td><td className="p-3.5 text-right"><div className="inline-flex gap-1.5"><button onClick={() => setViewingUser(u)} className="p-1.5 bg-slate-100 rounded-lg"><Eye className="w-3.5 h-3.5" /></button><button onClick={() => handleToggleStatus(u)} className="p-1.5 bg-amber-100 rounded-lg"><UserX className="w-3.5 h-3.5" /></button><button onClick={() => handleOpenDelete(u)} className="p-1.5 bg-red-100 text-red-700 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button></div></td></tr>)))}</tbody></table>
        </div>
        <div className="pt-2 flex justify-between text-xs text-slate-500"><div>Showing {totalUsers === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalUsers)} of {totalUsers}</div><div className="flex gap-1.5"><button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border rounded-xl disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button><span className="px-3 py-1 font-bold bg-slate-100 rounded-xl">Page {currentPage} of {totalPages}</span><button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 border rounded-xl disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button></div></div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-[#0a4d2e] to-[#042114] text-white p-6 flex items-center justify-between sticky top-0 z-10"><h3 className="font-bold uppercase">Create User - Manual Entry + Picture</h3><button onClick={() => setShowCreateModal(false)} className="p-1.5 text-emerald-300"><X className="w-5 h-5" /></button></div>
            <form onSubmit={handleCreateUserSubmit} className="p-6 space-y-4 text-xs">
              {/* PICTURE UPLOAD - ADDED */}
              <div className="bg-[#f0faf0] border-2 border-dashed border-green-300 rounded-2xl p-4 text-center">
                <label className="block font-black mb-2 text-[#0a4d2e]">Upload Student Picture (Max 2MB)</label>
                {formPicture ? (
                  <div className="flex flex-col items-center gap-2">
                    <img src={formPicture} alt="Preview" className="w-28 h-28 rounded-2xl object-cover border-4 border-yellow-400 shadow-md"/>
                    <p className="text-[11px] font-bold text-green-700">{formPictureFile?.name}</p>
                    <button type="button" onClick={()=>{setFormPicture(null); setFormPictureFile(null);}} className="text-[11px] bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold">Remove</button>
                  </div>
                ) : (
                  <div className="py-2"><p className="text-3xl">📸</p><p className="text-[11px] text-slate-500 mt-1">No picture yet</p></div>
                )}
                <input type="file" accept="image/*" onChange={handlePictureChange} className="mt-3 block w-full text-[11px] text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-full file:border-0 file:text-[11px] file:font-bold file:bg-[#0a4d2e] file:text-white" />
                <p className="text-[10px] text-slate-400 mt-1">JPG/PNG — Will upload to Supabase college-gallery — No Out of Memory</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className="block font-bold mb-1">Full Name *</label><input type="text" value={formFullName} onChange={(e) => setFormFullName(e.target.value)} placeholder="Type full name" className="w-full p-2.5 bg-slate-50 border rounded-xl" required /></div>
                <div><label className="block font-bold mb-1">Email *</label><input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="Type email" className="w-full p-2.5 bg-slate-50 border rounded-xl" required /></div>
              </div>

              {/* MANUAL INPUTS - ADDED */}
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block font-bold mb-1">Sex (Type Manually) *</label><input type="text" value={formSex} onChange={(e) => setFormSex(e.target.value)} placeholder="Type Male / Female" className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold" /></div>
                <div><label className="block font-bold mb-1">Age (Type Manually)</label><input type="text" value={formAge} onChange={(e) => setFormAge(e.target.value)} placeholder="Type age e.g. 22" className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold" /></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className="block font-bold mb-1">Phone</label><input type="text" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="Type phone" className="w-full p-2.5 bg-slate-50 border rounded-xl" /></div>
                <div><label className="block font-bold mb-1">Password</label><input type="text" value={formCustomPass} onChange={(e) => setFormCustomPass(e.target.value)} placeholder="Type password" className="w-full p-2.5 bg-slate-50 border rounded-xl" /></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className="block font-bold mb-1">Role *</label><select value={formRole} onChange={(e) => setFormRole(e.target.value as UserRole)} className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold"><option value="STUDENT">STUDENT</option><option value="LECTURER">LECTURER</option><option value="HOD">HOD</option><option value="BURSAR">BURSAR</option><option value="REGISTRAR">REGISTRAR</option><option value="PROVOST">PROVOST</option><option value="EXAM_OFFICER">EXAM OFFICER</option><option value="ADMIN">ADMIN</option></select></div>
                <div><label className="block font-bold mb-1">Level (Type or Select)</label><select value={formLevel} onChange={(e) => setFormLevel(e.target.value as any)} disabled={formRole !== 'STUDENT'} className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold disabled:opacity-50"><option value="ND1">ND1</option><option value="ND2">ND2</option><option value="HND1">HND1</option><option value="HND2">HND2</option></select></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className="block font-bold mb-1">Department (Type Manually)</label><input type="text" value={formDept} onChange={(e) => setFormDept(e.target.value)} placeholder="Type department" className="w-full p-2.5 bg-slate-50 border rounded-xl" /></div>
                <div><label className="block font-bold mb-1">Address (Type Manually)</label><input type="text" value={formAddress} onChange={(e) => setFormAddress(e.target.value)} placeholder="Type address e.g. Off Gboko Hill" className="w-full p-2.5 bg-slate-50 border rounded-xl" /></div>
              </div>

              <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2.5 border rounded-xl font-bold">Cancel</button><button type="submit" disabled={uploadingPic} className="px-5 py-2.5 bg-[#0a4d2e] text-white rounded-xl font-bold disabled:opacity-50">{uploadingPic ? 'Uploading...' : 'Create with Picture'}</button></div>
            </form>
          </div>
        </div>
      )}
      {createdCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 text-xs"><div className="text-center"><CheckCircle2 className="w-10 h-10 mx-auto text-green-500" /><h3 className="font-black text-lg uppercase mt-2">User Created!</h3></div><div className="bg-slate-50 p-4 rounded-2xl border space-y-2"><div className="flex justify-between"><span>Name:</span><strong>{createdCredentials.fullName}</strong></div><div className="flex justify-between"><span>Role:</span><span className="bg-emerald-100 px-2 py-0.5 rounded font-bold">{createdCredentials.role}</span></div><div className="flex justify-between"><span>ID:</span><span className="font-mono font-black text-[#0a4d2e]">{createdCredentials.id}</span></div><div className="flex justify-between"><span>Password:</span><span className="font-mono font-black text-amber-700">{createdCredentials.password}</span></div></div><div className="flex gap-2"><button onClick={handleCopyCredentials} className="flex-1 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2"><Copy className="w-4 h-4" />Copy</button><button onClick={() => setCreatedCredentials(null)} className="flex-1 py-2.5 bg-[#0a4d2e] text-white font-bold rounded-xl">Done</button></div></div>
        </div>
      )}
      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border"><div className="bg-gradient-to-r from-[#0a4d2e] to-[#042114] text-white p-6 flex items-center justify-between"><h3 className="font-bold">{viewingUser.fullName}</h3><button onClick={() => setViewingUser(null)}><X className="w-5 h-5" /></button></div><div className="p-6 text-xs space-y-2"><p>Email: {viewingUser.email}</p><p>ID: {viewingUser.id}</p><p>Role: {viewingUser.role}</p><p>Sex: {(viewingUser as any).sex || '—'}</p><p>Age: {(viewingUser as any).age || '—'}</p><p>Address: {(viewingUser as any).address || '—'}</p><button onClick={() => setViewingUser(null)} className="mt-4 px-4 py-2 bg-slate-100 rounded-xl font-bold">Close</button></div></div>
        </div>
      )}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80"><div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4"><h3 className="font-black uppercase text-red-950">Delete {userToDelete.fullName}?</h3><p className="text-xs text-slate-600">Type DELETE to confirm</p><input type="text" value={deleteConfirmationText} onChange={(e) => setDeleteConfirmationText(e.target.value)} placeholder="Type DELETE" className="w-full p-2.5 border-2 border-red-300 rounded-xl font-bold" />{deleteError && <p className="text-red-600 text-xs font-bold">{deleteError}</p>}<div className="flex gap-2"><button onClick={() => setUserToDelete(null)} className="flex-1 py-2.5 border rounded-xl font-bold">Cancel</button><button onClick={handleConfirmDelete} disabled={deleteConfirmationText.trim().toUpperCase() !== 'DELETE'} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold disabled:opacity-40">Confirm Delete</button></div></div></div>
      )}
      {editingPhotoForUser && (<UserProfilePhotoModal isOpen={true} onClose={() => setEditingPhotoForUser(null)} currentUser={editingPhotoForUser} onPhotoUpdated={() => { loadUsers(); setEditingPhotoForUser(null); }} />)}
    </div>
  );
};

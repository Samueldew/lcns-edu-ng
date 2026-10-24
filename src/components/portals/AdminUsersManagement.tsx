import React, { useState, useEffect, useMemo } from 'react';
import { User, UserRole } from '../../types';
import { StorageService } from '../../services/storage';
import { ApiService } from '../../services/api';
import {
  Users, Search, Filter, Trash2, UserX, UserPlus, Eye, Copy,
  CheckCircle2, ChevronLeft, ChevronRight, X, Camera,
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
  const [createdCredentials, setCreatedCredentials] = useState<any>(null);
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('STUDENT');
  const [formLevel, setFormLevel] = useState<'N1' | 'ND1' | 'ND2' | 'HND1' | 'HND2'>('ND1');
  const [formDept, setFormDept] = useState('Department of Nursing Sciences');
  const [formCustomPass, setFormCustomPass] = useState('');
  const [formSex, setFormSex] = useState(''); // MANUAL - NO SELECT
  const [formAge, setFormAge] = useState('');
  const [formAddress, setFormAddress] = useState('');
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
            id: u.id, email: u.email, password: u.password, pin: '123456',
            role: (u.role || 'STUDENT').toUpperCase() as UserRole,
            fullName: u.email === 'samuel@lcns.edu.ng' ? 'Avule Samuel' : (u.full_name || u.fullName || u.email),
            phone: u.phone || '', department: u.department || 'Department of Nursing Sciences',
            status: 'ACTIVE' as any, createdAt: u.created_at ? u.created_at.split('T')[0] : '',
            level: u.level || undefined, matricNo: u.matric_no || u.matricNo,
            photoUrl: u.photo_url || u.photoUrl || u.profile_picture || u.picture,
            sex: u.sex || '', age: u.age || '', address: u.address || '',
          }));
          setUsers(formatted); return;
        }
      } catch {}
    }
    setUsers(StorageService.getUsers());
  };

  useEffect(() => { loadUsers(); }, []);

  const staffCount = useMemo(() => users.filter(u => ['REGISTRAR','PROVOST','HOD','EXAM_OFFICER','BURSAR','LECTURER','ADMIN','ADMIN_OFFICER'].includes(u.role)).length, [users]);
  const studentCount = useMemo(() => users.filter(u => u.role === 'STUDENT').length, [users]);
  const filteredUsers = useMemo(() => users.filter((u) => {
    const matchSearch = u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()) || u.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = selectedRole === 'ALL' || (selectedRole === 'STAFF' ? ['REGISTRAR','PROVOST','HOD','EXAM_OFFICER','BURSAR','LECTURER','ADMIN','ADMIN_OFFICER','ADMISSION_OFFICER'].includes(u.role) : u.role === selectedRole);
    const matchLevel = selectedLevel === 'ALL' || u.level === selectedLevel;
    return matchSearch && matchRole && matchLevel;
  }), [users, searchTerm, selectedRole, selectedLevel]);

  const totalUsers = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalUsers / pageSize));
  const paginatedUsers = useMemo(() => filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize), [filteredUsers, currentPage, pageSize]);

  const handleToggleStatus = (u: User) => {
    StorageService.toggleUserStatus(u.id);
    setUsers(StorageService.getUsers());
  };
  const handleOpenDelete = (u: User) => { setUserToDelete(u); setDeleteConfirmationText(''); setDeleteError(null); };
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    if (deleteConfirmationText.trim().toUpperCase() !== 'DELETE') { setDeleteError('Please type DELETE'); return; }
    if (userToDelete.email.toLowerCase().includes('samuel')) { setDeleteError('Cannot delete Chief Admin'); return; }
    const sb = getSupabase(); if (sb) await sb.from('users').delete().eq('id', userToDelete.id);
    StorageService.deleteUser(userToDelete.id);
    setUsers(prev => prev.filter(u => u.id !== userToDelete.id)); setUserToDelete(null);
  };
  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Max 2MB'); return; }
    setFormPictureFile(file);
    const reader = new FileReader(); reader.onload = (ev) => setFormPicture(ev.target?.result as string); reader.readAsDataURL(file);
  };
  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!formFullName || !formEmail) return;
    const finalPassword = formCustomPass.trim() || `Lcns@${Math.floor(1000+Math.random()*9000)}`;
    try {
      setUploadingPic(true); let pictureUrl = ''; const sb = getSupabase();
      if (sb && formPictureFile) {
        const fileName = `students/${Date.now()}_${formPictureFile.name.replace(/\s/g, '_')}`;
        const { error } = await sb.storage.from('college-gallery').upload(fileName, formPictureFile);
        if (!error) { const { data } = sb.storage.from('college-gallery').getPublicUrl(fileName); pictureUrl = data.publicUrl; }
      }
      const result = await ApiService.createUser({
        fullName: formFullName.trim(), email: formEmail.trim().toLowerCase(),
        phone: formPhone.trim() || '08126799565', role: formRole, department: formDept,
        level: formRole === 'STUDENT' ? formLevel : undefined, password: finalPassword,
        sex: formSex.trim(), age: formAge.trim(), address: formAddress.trim(),
        photo_url: pictureUrl, photoUrl: pictureUrl,
      } as any);
      await loadUsers();
      setCreatedCredentials({ id: (result as any).user?.id || formEmail, password: finalPassword, fullName: formFullName, role: formRole });
      setFormFullName(''); setFormEmail(''); setFormPhone(''); setFormCustomPass(''); setFormSex(''); setFormAge(''); setFormAddress(''); setFormPicture(null); setFormPictureFile(null); setShowCreateModal(false);
    } catch (err: any) { alert('Create failed: ' + err.message); } finally { setUploadingPic(false); }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border p-6 flex justify-between"><div><h2 className="text-xl font-black uppercase">User Accounts Directory</h2><p className="text-xs text-slate-500">Staff {staffCount} | Students {studentCount} | Manual Sex Entry + Picture</p></div><button onClick={() => setShowCreateModal(true)} className="px-4 py-2.5 bg-[#0a4d2e] text-white text-xs font-bold rounded-2xl"><UserPlus className="w-4 h-4 inline mr-1" />Create New User</button></div>

      <div className="bg-white rounded-3xl border p-4 space-y-4">
        <div className="flex gap-2"><button onClick={()=>setSelectedRole('STAFF')} className={`px-4 py-2 rounded-xl text-xs font-black ${selectedRole==='STAFF'?'bg-[#0a4d2e] text-white':'bg-emerald-100'}`}>STAFF ({staffCount})</button><button onClick={()=>setSelectedRole('STUDENT')} className={`px-4 py-2 rounded-xl text-xs font-black ${selectedRole==='STUDENT'?'bg-[#0a4d2e] text-white':'bg-blue-100'}`}>STUDENTS ({studentCount})</button><button onClick={()=>setSelectedRole('ALL')} className={`px-4 py-2 rounded-xl text-xs font-black ${selectedRole==='ALL'?'bg-[#0a4d2e] text-white':'bg-slate-100'}`}>ALL ({users.length})</button></div>
        <div className="overflow-x-auto rounded-2xl border"><table className="w-full text-left text-xs"><thead className="bg-slate-50 font-bold uppercase border-b"><tr><th className="p-3.5">Photo</th><th className="p-3.5">Full Name</th><th className="p-3.5">Email</th><th className="p-3.5">Role</th><th className="p-3.5">Sex</th><th className="p-3.5 text-right">Actions</th></tr></thead><tbody className="divide-y">{paginatedUsers.map((u) => (<tr key={u.id}><td className="p-3.5"><div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center">{(u as any).photoUrl ? <img src={(u as any).photoUrl} className="w-full h-full object-cover"/> : <span className="font-bold">{u.fullName.charAt(0)}</span>}</div></td><td className="p-3.5 font-bold">{u.fullName}</td><td className="p-3.5">{u.email}</td><td className="p-3.5">{u.role}</td><td className="p-3.5 font-bold">{(u as any).sex || '—'}</td><td className="p-3.5 text-right"><button onClick={() => setViewingUser(u)} className="p-1.5 bg-slate-100 rounded-lg"><Eye className="w-3.5 h-3.5" /></button><button onClick={() => handleOpenDelete(u)} className="p-1.5 bg-red-100 text-red-700 rounded-lg ml-1"><Trash2 className="w-3.5 h-3.5" /></button></td></tr>))}</tbody></table></div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border">
            <div className="bg-[#0a4d2e] text-white p-6 flex justify-between sticky top-0"><h3 className="font-bold uppercase">Create User - Manual Sex + Picture</h3><button onClick={() => setShowCreateModal(false)}><X className="w-5 h-5" /></button></div>
            <form onSubmit={handleCreateUserSubmit} className="p-6 space-y-4 text-xs">
              <div className="bg-[#f0faf0] border-2 border-dashed border-green-300 rounded-2xl p-4 text-center">
                <label className="block font-black mb-2 text-[#0a4d2e]">Upload Picture (Max 2MB)</label>
                {formPicture ? (<div className="flex flex-col items-center gap-2"><img src={formPicture} className="w-28 h-28 rounded-2xl object-cover border-4 border-yellow-400"/><button type="button" onClick={()=>{setFormPicture(null); setFormPictureFile(null);}} className="text-[11px] bg-red-100 text-red-700 px-3 py-1 rounded-full">Remove</button></div>) : (<div className="py-2"><p className="text-3xl">📸</p></div>)}
                <input type="file" accept="image/*" onChange={handlePictureChange} className="mt-3 block w-full text-[11px] file:mr-3 file:py-2 file:px-3 file:rounded-full file:border-0 file:bg-[#0a4d2e] file:text-white" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className="block font-bold mb-1">Full Name *</label><input type="text" value={formFullName} onChange={(e) => setFormFullName(e.target.value)} placeholder="Type full name" className="w-full p-2.5 bg-slate-50 border rounded-xl" required /></div>
                <div><label className="block font-bold mb-1">Email *</label><input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="Type email" className="w-full p-2.5 bg-slate-50 border rounded-xl" required /></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Sex * (Type Manually)</label>
                  <input type="text" value={formSex} onChange={(e) => setFormSex(e.target.value)} placeholder="Type Male or Female" className="w-full p-2.5 bg-slate-50 border-2 border-green-200 rounded-xl font-black" required />
                  <p className="text-[10px] text-green-700 mt-1 font-bold">No select — You type yourself: Male / Female</p>
                </div>
                <div><label className="block font-bold mb-1">Age (Type Manually)</label><input type="text" value={formAge} onChange={(e) => setFormAge(e.target.value)} placeholder="Type age e.g. 22" className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold" /></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className="block font-bold mb-1">Phone</label><input type="text" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="Type phone" className="w-full p-2.5 bg-slate-50 border rounded-xl" /></div>
                <div><label className="block font-bold mb-1">Password</label><input type="text" value={formCustomPass} onChange={(e) => setFormCustomPass(e.target.value)} placeholder="Type password" className="w-full p-2.5 bg-slate-50 border rounded-xl" /></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className="block font-bold mb-1">Department (Type Manually)</label><input type="text" value={formDept} onChange={(e) => setFormDept(e.target.value)} placeholder="Type department" className="w-full p-2.5 bg-slate-50 border rounded-xl" /></div>
                <div><label className="block font-bold mb-1">Address (Type Manually)</label><input type="text" value={formAddress} onChange={(e) => setFormAddress(e.target.value)} placeholder="Type address" className="w-full p-2.5 bg-slate-50 border rounded-xl" /></div>
              </div>

              <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2.5 border rounded-xl font-bold">Cancel</button><button type="submit" disabled={uploadingPic} className="px-5 py-2.5 bg-[#0a4d2e] text-white rounded-xl font-bold">{uploadingPic ? 'Uploading...' : 'Create with Picture'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { User, UserRole } from '../../types';
import { StorageService } from '../../services/storage';
import { ApiService } from '../../services/api';
import {
  Users, Search, Filter, Trash2, UserX, UserPlus, Eye, Copy,
  CheckCircle2, ChevronLeft, ChevronRight, X, Camera, Edit3, Save,
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
  const [formSex, setFormSex] = useState('');
  const [formAge, setFormAge] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formPicture, setFormPicture] = useState<string | null>(null);
  const [formPictureFile, setFormPictureFile] = useState<File | null>(null);
  const [uploadingPic, setUploadingPic] = useState(false);

  // EDIT STATE - NEW
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<(User & { password?: string }) | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('STUDENT');
  const [editLevel, setEditLevel] = useState('ND1');
  const [editDept, setEditDept] = useState('');
  const [editSex, setEditSex] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editPicture, setEditPicture] = useState<string | null>(null);
  const [editPictureFile, setEditPictureFile] = useState<File | null>(null);

  const roles: { value: UserRole; label: string }[] = [
    { value: 'PROVOST', label: 'Provost' },
    { value: 'REGISTRAR', label: 'Registrar' },
    { value: 'HOD', label: 'HOD' },
    { value: 'EXAM_OFFICER', label: 'Exam Officer' },
    { value: 'BURSAR', label: 'Bursar' },
    { value: 'ADMISSION_OFFICER', label: 'Admission Officer' },
    { value: 'LECTURER', label: 'Lecturer' },
    { value: 'STUDENT', label: 'Student - Photo Required' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'ADMIN_OFFICER', label: 'Admin Officer' },
  ];

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
  const handleEditPictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Max 2MB'); return; }
    setEditPictureFile(file);
    const reader = new FileReader(); reader.onload = (ev) => setEditPicture(ev.target?.result as string); reader.readAsDataURL(file);
  };

  // EDIT - NEW FEATURE
  const handleOpenEdit = (u: any) => {
    setEditingUser(u);
    setEditFullName(u.fullName || '');
    setEditEmail(u.email || '');
    setEditPhone(u.phone || '');
    setEditRole(u.role || 'STUDENT');
    setEditLevel(u.level || 'ND1');
    setEditDept(u.department || 'Department of Nursing Sciences');
    setEditSex(u.sex || '');
    setEditAge(u.age || '');
    setEditAddress(u.address || '');
    setEditPicture(u.photoUrl || null);
    setEditPictureFile(null);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      setUploadingPic(true);
      let pictureUrl = editPicture || '';
      const sb = getSupabase();
      if (sb && editPictureFile) {
        const fileName = `students/${Date.now()}_${editPictureFile.name.replace(/\s/g, '_')}`;
        const { error } = await sb.storage.from('college-gallery').upload(fileName, editPictureFile);
        if (!error) {
          const { data } = sb.storage.from('college-gallery').getPublicUrl(fileName);
          pictureUrl = data.publicUrl;
        }
      }
      if (sb) {
        await sb.from('users').update({
          full_name: editFullName.trim(),
          email: editEmail.trim().toLowerCase(),
          phone: editPhone.trim(),
          role: editRole,
          department: editDept.trim(),
          level: editRole === 'STUDENT' ? editLevel : null,
          sex: editSex.trim(),
          age: editAge.trim(),
          address: editAddress.trim(),
          photo_url: pictureUrl,
        }).eq('id', editingUser.id);
      }
      // Update local storage
      const localUsers = StorageService.getUsers();
      const updatedLocal = localUsers.map((u:any) => u.id === editingUser.id ? {
        ...u,
        fullName: editFullName.trim(),
        email: editEmail.trim().toLowerCase(),
        phone: editPhone.trim(),
        role: editRole,
        department: editDept.trim(),
        level: editLevel,
        sex: editSex.trim(),
        age: editAge.trim(),
        address: editAddress.trim(),
        photoUrl: pictureUrl,
        photo_url: pictureUrl,
      } : u);
      localStorage.setItem('lcns_users', JSON.stringify(updatedLocal));
      // Also update lcns_users key used by dashboards
      try {
        const allLcnsUsers = JSON.parse(localStorage.getItem('lcns_users') || '[]');
        // already done
      } catch {}

      await loadUsers();
      setShowEditModal(false);
      setEditingUser(null);
      alert(`✅ Edited ${editFullName} - New Role: ${editRole} - Photo ${pictureUrl ? 'Updated' : 'Kept'}`);
    } catch (err: any) {
      alert('Edit failed: ' + err.message);
    } finally {
      setUploadingPic(false);
    }
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
      <div className="bg-white rounded-3xl border p-6 flex justify-between"><div><h2 className="text-xl font-black uppercase">User Accounts Directory - Role Assign + Edit + Photo Upload</h2><p className="text-xs text-slate-500">Staff {staffCount} | Students {studentCount} | Manual Sex Entry + Picture + Edit Role Anytime</p></div><button onClick={() => setShowCreateModal(true)} className="px-4 py-2.5 bg-[#0a4d2e] text-white text-xs font-bold rounded-2xl"><UserPlus className="w-4 h-4 inline mr-1" />Create New User + Assign Role + Photo</button></div>

      {createdCredentials && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 flex justify-between items-center">
          <div><p className="font-black text-sm">✅ Created {createdCredentials.fullName} as {createdCredentials.role}</p><p className="text-xs">Email: {createdCredentials.id} | Password: {createdCredentials.password}</p></div>
          <button onClick={()=>setCreatedCredentials(null)} className="px-3 py-1 bg-white border rounded-full"><X size={14}/></button>
        </div>
      )}

      <div className="bg-white rounded-3xl border p-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-2"><button onClick={()=>setSelectedRole('STAFF')} className={`px-4 py-2 rounded-xl text-xs font-black ${selectedRole==='STAFF'?'bg-[#0a4d2e] text-white':'bg-emerald-100'}`}>STAFF ({staffCount})</button><button onClick={()=>setSelectedRole('STUDENT')} className={`px-4 py-2 rounded-xl text-xs font-black ${selectedRole==='STUDENT'?'bg-[#0a4d2e] text-white':'bg-blue-100'}`}>STUDENTS ({studentCount})</button><button onClick={()=>setSelectedRole('ALL')} className={`px-4 py-2 rounded-xl text-xs font-black ${selectedRole==='ALL'?'bg-[#0a4d2e] text-white':'bg-slate-100'}`}>ALL ({users.length})</button></div>
          <div className="flex items-center gap-2 bg-white border rounded-xl px-3 flex-1"><Search size={16}/><input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="Search Name, Email, ID" className="flex-1 py-2 text-xs font-bold outline-none"/></div>
        </div>
        <div className="overflow-x-auto rounded-2xl border"><table className="w-full text-left text-xs"><thead className="bg-slate-50 font-bold uppercase border-b"><tr><th className="p-3.5">Photo</th><th className="p-3.5">Full Name</th><th className="p-3.5">Email</th><th className="p-3.5">Role</th><th className="p-3.5">Sex</th><th className="p-3.5">Level</th><th className="p-3.5 text-right">Actions</th></tr></thead><tbody className="divide-y">{paginatedUsers.map((u) => (<tr key={u.id}><td className="p-3.5"><div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center border-2">{(u as any).photoUrl ? <img src={(u as any).photoUrl} className="w-full h-full object-cover"/> : <span className="font-bold">{u.fullName.charAt(0)}</span>}</div></td><td className="p-3.5 font-bold">{u.fullName}</td><td className="p-3.5">{u.email}</td><td className="p-3.5"><span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px]">{u.role}</span></td><td className="p-3.5 font-bold">{(u as any).sex || '—'}</td><td className="p-3.5">{(u as any).level || '-'}</td><td className="p-3.5 text-right flex gap-1 justify-end"><button onClick={() => setViewingUser(u)} className="p-2 bg-slate-100 rounded-lg"><Eye className="w-3.5 h-3.5" /></button><button onClick={() => handleOpenEdit(u as any)} className="p-2 bg-blue-600 text-white rounded-lg flex items-center gap-1 font-black"><Edit3 className="w-3.5 h-3.5" /> Edit</button><button onClick={() => handleOpenDelete(u)} className="p-2 bg-red-100 text-red-700 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button></td></tr>))}</tbody></table></div>
        <div className="flex justify-between text-xs"><button onClick={()=>setCurrentPage(p=>Math.max(1,p-1))} disabled={currentPage===1} className="px-3 py-1 border rounded">Prev</button><span>Page {currentPage} / {totalPages} - {totalUsers} users</span><button onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))} disabled={currentPage===totalPages} className="px-3 py-1 border rounded">Next</button></div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border">
            <div className="bg-[#0a4d2e] text-white p-6 flex justify-between sticky top-0 z-10"><h3 className="font-bold uppercase">Create User - Assign Role + Manual Sex + Picture Upload</h3><button onClick={() => setShowCreateModal(false)}><X className="w-5 h-5" /></button></div>
            <form onSubmit={handleCreateUserSubmit} className="p-6 space-y-4 text-xs">
              <div className="bg-[#f0faf0] border-2 border-dashed border-green-300 rounded-2xl p-4 text-center">
                <label className="block font-black mb-2 text-[#0a4d2e]">Student Photo Upload (Max 2MB) - For ID Card, Biodata, Result Slip</label>
                {formPicture ? (<div className="flex flex-col items-center gap-2"><img src={formPicture} className="w-28 h-28 rounded-2xl object-cover border-4 border-yellow-400"/><button type="button" onClick={()=>{setFormPicture(null); setFormPictureFile(null);}} className="text-[11px] bg-red-100 text-red-700 px-3 py-1 rounded-full">Remove Photo</button></div>) : (<div className="py-2"><p className="text-3xl">📸</p><p className="text-[10px] text-slate-500">Student must upload photo during creation - Used for ID card</p></div>)}
                <input type="file" accept="image/*" onChange={handlePictureChange} className="mt-3 block w-full text-[11px] file:mr-3 file:py-2 file:px-3 file:rounded-full file:border-0 file:bg-[#0a4d2e] file:text-white" />
              </div>

              {/* ROLE ASSIGN - NEW */}
              <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-4">
                <label className="block font-black mb-2 text-blue-900">Assign Role * - Admin Selects Role When Creating User</label>
                <select value={formRole} onChange={e=>setFormRole(e.target.value as UserRole)} className="w-full p-3 bg-white border-2 border-blue-400 rounded-xl font-black text-sm">
                  {roles.map(r=><option key={r.value} value={r.value}>{r.label} - {r.value}</option>)}
                </select>
                <p className="text-[10px] text-blue-700 mt-1">Provost sees Senate approval, Registrar sees CBT manager, HOD sees course reg, Bursar sees fees, Student sees results after Provost publishes.</p>
                {formRole==='STUDENT' && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div><label className="block font-bold mb-1">Student Level *</label><select value={formLevel} onChange={e=>setFormLevel(e.target.value as any)} className="w-full p-2.5 bg-white border rounded-xl font-bold"><option value="ND1">ND1</option><option value="ND2">ND2</option><option value="HND1">HND1</option><option value="HND2">HND2</option><option value="N1">N1</option></select></div>
                    <div className="bg-amber-100 border border-amber-300 rounded-xl p-2 text-[10px]">Photo required for Student - ID Card, Biodata</div>
                  </div>
                )}
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
                <div><label className="block font-bold mb-1">Password (Type)</label><input type="text" value={formCustomPass} onChange={(e) => setFormCustomPass(e.target.value)} placeholder="Type password or auto" className="w-full p-2.5 bg-slate-50 border rounded-xl" /></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className="block font-bold mb-1">Department (Type Manually)</label><input type="text" value={formDept} onChange={(e) => setFormDept(e.target.value)} placeholder="Type department" className="w-full p-2.5 bg-slate-50 border rounded-xl" /></div>
                <div><label className="block font-bold mb-1">Address (Type Manually)</label><input type="text" value={formAddress} onChange={(e) => setFormAddress(e.target.value)} placeholder="Type address" className="w-full p-2.5 bg-slate-50 border rounded-xl" /></div>
              </div>

              <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2.5 border rounded-xl font-bold">Cancel</button><button type="submit" disabled={uploadingPic} className="px-5 py-2.5 bg-[#0a4d2e] text-white rounded-xl font-bold">{uploadingPic ? 'Uploading...' : 'Create User with Role + Photo'}</button></div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL - NEW FEATURE */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border">
            <div className="bg-blue-700 text-white p-6 flex justify-between sticky top-0 z-10"><h3 className="font-bold uppercase">Edit User - Change Role, Info, Photo - {editingUser.fullName}</h3><button onClick={() => setShowEditModal(false)}><X className="w-5 h-5" /></button></div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs">
              <div className="bg-[#f0faf0] border-2 border-dashed border-green-300 rounded-2xl p-4 text-center">
                <label className="block font-black mb-2 text-[#0a4d2e]">Edit Photo - Student / Staff Photo Update</label>
                {editPicture ? (<div className="flex flex-col items-center gap-2"><img src={editPicture} className="w-28 h-28 rounded-2xl object-cover border-4 border-blue-400"/><button type="button" onClick={()=>{setEditPicture(null); setEditPictureFile(null);}} className="text-[11px] bg-red-100 text-red-700 px-3 py-1 rounded-full">Remove</button></div>) : (<div className="py-2"><p className="text-3xl">📸</p></div>)}
                <input type="file" accept="image/*" onChange={handleEditPictureChange} className="mt-3 block w-full text-[11px] file:mr-3 file:py-2 file:px-3 file:rounded-full file:border-0 file:bg-blue-700 file:text-white" />
              </div>

              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4">
                <label className="block font-black mb-2 text-amber-900">Edit Role - Admin Can Change Role Anytime</label>
                <select value={editRole} onChange={e=>setEditRole(e.target.value as UserRole)} className="w-full p-3 bg-white border-2 border-amber-400 rounded-xl font-black text-sm">
                  {roles.map(r=><option key={r.value} value={r.value}>{r.label} - {r.value}</option>)}
                </select>
                <p className="text-[10px] text-amber-800 mt-1">Changing role will change dashboard access. Student role requires photo for ID card.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className="block font-bold mb-1">Full Name *</label><input type="text" value={editFullName} onChange={e=>setEditFullName(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl" required /></div>
                <div><label className="block font-bold mb-1">Email *</label><input type="email" value={editEmail} onChange={e=>setEditEmail(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl" required /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block font-bold mb-1">Sex * (Type Manually)</label><input type="text" value={editSex} onChange={e=>setEditSex(e.target.value)} className="w-full p-2.5 bg-slate-50 border-2 border-green-200 rounded-xl font-black" required /></div>
                <div><label className="block font-bold mb-1">Age</label><input type="text" value={editAge} onChange={e=>setEditAge(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block font-bold mb-1">Phone</label><input type="text" value={editPhone} onChange={e=>setEditPhone(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl" /></div>
                <div><label className="block font-bold mb-1">Level</label><select value={editLevel} onChange={e=>setEditLevel(e.target.value)} className="w-full p-2.5 bg-white border rounded-xl font-bold"><option>ND1</option><option>ND2</option><option>HND1</option><option>HND2</option><option>STAFF</option></select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block font-bold mb-1">Department</label><input type="text" value={editDept} onChange={e=>setEditDept(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl" /></div>
                <div><label className="block font-bold mb-1">Address</label><input type="text" value={editAddress} onChange={e=>setEditAddress(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl" /></div>
              </div>
              <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2.5 border rounded-xl font-bold">Cancel</button><button type="submit" disabled={uploadingPic} className="px-5 py-2.5 bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2"><Save size={16}/>{uploadingPic ? 'Uploading...' : 'Save Edited Info + Role + Photo'}</button></div>
            </form>
          </div>
        </div>
      )}

      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75"><div className="bg-white rounded-2xl max-w-md w-full p-6"><div className="flex justify-between"><h3 className="font-black">{viewingUser.fullName} - {viewingUser.role}</h3><button onClick={()=>setViewingUser(null)}><X size={16}/></button></div><div className="mt-4 space-y-2 text-xs"><p>Email: {viewingUser.email}</p><p>Role: {viewingUser.role} - Can be edited via Edit button</p><p>Sex: {(viewingUser as any).sex || '-'}</p><p>Photo: {(viewingUser as any).photoUrl ? 'Uploaded - Shows on ID Card' : 'No photo - Student should upload'}</p></div></div></div>
      )}

      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75"><div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-3"><h3 className="font-bold">Delete {userToDelete.fullName}?</h3><p className="text-xs">Type DELETE to confirm</p><input value={deleteConfirmationText} onChange={e=>setDeleteConfirmationText(e.target.value)} placeholder="Type DELETE" className="w-full border-2 p-2 rounded-xl text-xs"/><p className="text-red-600 text-xs">{deleteError}</p><div className="flex gap-2"><button onClick={()=>setUserToDelete(null)} className="flex-1 py-2 border rounded-xl">Cancel</button><button onClick={handleConfirmDelete} className="flex-1 py-2 bg-red-600 text-white rounded-xl">Delete</button></div></div></div>
      )}
    </div>
  );
};

export default AdminUsersManagement;

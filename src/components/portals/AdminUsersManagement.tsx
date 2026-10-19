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
  const [users, setUsers] = useState<(User & { password?: string; pin?: string })[]>(
    StorageService.getUsers()
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Deletion modal state
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Profile modal state
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [editingPhotoForUser, setEditingPhotoForUser] = useState<User | null>(null);

  // Create User modal state
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

  // Create form inputs
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('STUDENT');
  const [formLevel, setFormLevel] = useState<'N1' | 'ND1' | 'ND2' | 'HND1' | 'HND2'>('ND1');
  const [formDept, setFormDept] = useState('Department of Nursing Sciences');
  const [formCustomPass, setFormCustomPass] = useState('');

  const loadUsers = async () => {
    const localUsers = StorageService.getUsers();
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from('users').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          const formatted = data.map((u: any) => ({
            id: u.id,
            email: u.email,
            password: u.password,
            pin: u.pin || '123456',
            role: (u.role || 'STUDENT').toUpperCase() as UserRole,
            fullName: u.full_name || u.fullName || u.email,
            phone: u.phone || '',
            department: u.department || 'Department of Nursing Sciences',
            status: (u.status || 'ACTIVE').toUpperCase() as any,
            createdAt: u.created_at ? u.created_at.split('T')[0] : '',
          }));

          const merged = [...formatted];
          for (const lu of localUsers) {
            if (!merged.some((m) => m.email.toLowerCase() === lu.email.toLowerCase())) {
              merged.push(lu);
            }
          }
          setUsers(merged);
          return;
        }
      } catch (err) {
        console.warn('Error fetching Supabase users in AdminUsersManagement:', err);
      }
    }
    setUsers(localUsers);
  };

  // Sync users on mount and storage update
  useEffect(() => {
    loadUsers();
    const handleStorageUpdate = () => {
      loadUsers();
    };
    window.addEventListener('lcns_storage_update', handleStorageUpdate);
    window.addEventListener('lcns_users_update', handleStorageUpdate);
    return () => {
      window.removeEventListener('lcns_storage_update', handleStorageUpdate);
      window.removeEventListener('lcns_users_update', handleStorageUpdate);
    };
  }, []);

  // Filtered and searched users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.matricNo && u.matricNo.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchRole = selectedRole === 'ALL' || u.role === selectedRole;
      const matchLevel =
        selectedLevel === 'ALL' ||
        u.level === selectedLevel ||
        (u.role === 'STUDENT' && u.matricNo?.includes(selectedLevel));

      return matchSearch && matchRole && matchLevel;
    });
  }, [users, searchTerm, selectedRole, selectedLevel]);

  // Pagination calculation
  const totalUsers = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalUsers / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Handlers
  const handleToggleStatus = (u: User) => {
    const updated = StorageService.toggleUserStatus(u.id);
    if (updated) {
      setUsers(StorageService.getUsers());
      StorageService.logAction(
        'info@lcns.edu.ng',
        'ADMIN',
        'USER_STATUS_CHANGE',
        `Changed status of ${u.fullName} (${u.id}) to ${updated.status}`
      );
    }
  };

  const handleOpenDelete = (u: User) => {
    setUserToDelete(u);
    setDeleteConfirmationText('');
    setDeleteError(null);
  };

  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    if (deleteConfirmationText.trim().toUpperCase() !== 'DELETE') {
      setDeleteError('Please type DELETE in capital letters to confirm.');
      return;
    }

    StorageService.deleteUser(userToDelete.id);
    const sb = getSupabase();
    if (sb) {
      sb.from('users')
        .delete()
        .or(`id.eq.${userToDelete.id},email.eq.${userToDelete.email}`)
        .then(() => loadUsers());
    }
    setUsers(StorageService.getUsers());
    setUserToDelete(null);
    setDeleteConfirmationText('');
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFullName || !formEmail) return;

    // Generate auto ID and PIN
    const newId = StorageService.generateUserId(formRole, formLevel);
    const newPin = StorageService.generatePin();
    const newMatricNo =
      formRole === 'STUDENT' ? StorageService.generateMatricNumber(formLevel) : undefined;
    const finalPassword = formCustomPass.trim() || 'admin123';

    const res = await ApiService.createUser({
      fullName: formFullName.trim(),
      email: formEmail.trim().toLowerCase(),
      phone: formPhone.trim() || '08126799565',
      role: formRole,
      department: formDept,
      level: formRole === 'STUDENT' ? formLevel : undefined,
      matricNo: newMatricNo,
      password: finalPassword,
      pin: newPin,
    });

    await loadUsers();

    // Show credential popup
    setCreatedCredentials({
      id: newId,
      pin: newPin,
      password: finalPassword,
      matricNo: newMatricNo,
      fullName: formFullName,
      role: formRole,
    });

    // Reset inputs
    setFormFullName('');
    setFormEmail('');
    setFormPhone('');
    setFormCustomPass('');
    setShowCreateModal(false);
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `LCNS PORTAL CREDENTIALS\nName: ${createdCredentials.fullName}\nRole: ${createdCredentials.role}\nUser ID: ${createdCredentials.id}\nLogin PIN: ${createdCredentials.pin}\nPassword: ${createdCredentials.password}${
      createdCredentials.matricNo ? `\nMatric No: ${createdCredentials.matricNo}` : ''
    }\nPortal Link: https://lcns.edu.ng/login`;

    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5 text-emerald-700" />
            <span>Central Identity &amp; Role Management</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase font-serif-crest">
            User Accounts Directory &amp; RBAC Control
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Search, filter, view profile photos, generate credentials, suspend, or permanently delete user accounts.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0a4d2e] hover:bg-[#073822] text-white text-xs font-bold rounded-2xl shadow-md transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4 text-amber-400" />
          <span>Create New User &amp; Auto ID</span>
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, ID, email..."
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
            >
              <option value="ALL">All Roles ({users.length})</option>
              <option value="STUDENT">Students</option>
              <option value="LECTURER">Lecturers</option>
              <option value="HOD">Heads of Department</option>
              <option value="BURSAR">Bursars</option>
              <option value="REGISTRAR">Registrars</option>
              <option value="PROVOST">Provosts</option>
              <option value="ADMISSION_OFFICER">Admission Officers</option>
              <option value="EXAM_OFFICER">Exam Officers</option>
              <option value="ADMIN">System Admins</option>
              <option value="APPLICANT">Applicants</option>
            </select>
          </div>

          {/* Level Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold shrink-0">Level:</span>
            <select
              value={selectedLevel}
              onChange={(e) => {
                setSelectedLevel(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
            >
              <option value="ALL">All Levels</option>
              <option value="N1">N1</option>
              <option value="ND1">ND1</option>
              <option value="ND2">ND2</option>
              <option value="HND1">HND1</option>
              <option value="HND2">HND2</option>
            </select>
          </div>

          {/* Page Size */}
          <div className="flex items-center justify-between sm:justify-end gap-2 text-slate-500">
            <span>Show:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">Photo</th>
                <th className="p-3.5">Student / Staff ID</th>
                <th className="p-3.5">Full Name &amp; Contact</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Level</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-center">Login PIN</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    No user accounts match the selected filters or search query.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Photo */}
                    <td className="p-3.5">
                      <div className="relative group w-10 h-10 rounded-full overflow-hidden border border-slate-300 bg-slate-100 flex items-center justify-center shrink-0">
                        {u.photoUrl ? (
                          <img
                            src={u.photoUrl}
                            alt={u.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-bold text-slate-600 text-xs">
                            {u.fullName.charAt(0)}
                          </span>
                        )}
                        <button
                          onClick={() => setEditingPhotoForUser(u)}
                          title="Change user photo"
                          className="absolute inset-0 bg-slate-900/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <Camera className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                    {/* ID */}
                    <td className="p-3.5 font-mono-code font-bold text-slate-900">
                      <div>{u.id}</div>
                      {u.matricNo && (
                        <span className="block text-[10px] text-emerald-800 font-normal">
                          {u.matricNo}
                        </span>
                      )}
                    </td>

                    {/* Full Name & Phone */}
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{u.fullName}</div>
                      <div className="text-[11px] text-slate-500">{u.phone || '08126799565'}</div>
                    </td>

                    {/* Email */}
                    <td className="p-3.5 font-mono-code text-slate-600 truncate max-w-[180px]">
                      {u.email}
                    </td>

                    {/* Role */}
                    <td className="p-3.5">
                      <span className="inline-block bg-emerald-100 text-[#0a4d2e] font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Level */}
                    <td className="p-3.5 font-semibold text-slate-700">
                      {u.level || (u.role === 'STUDENT' ? 'ND1' : '—')}
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 font-bold text-[11px] ${
                          u.status === 'ACTIVE' ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {u.status === 'ACTIVE' ? (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Suspended</span>
                          </>
                        )}
                      </span>
                    </td>

                    {/* PIN */}
                    <td className="p-3.5 text-center">
                      <span className="font-mono-code bg-slate-100 px-2 py-1 rounded text-slate-700 font-bold text-[11px]">
                        {u.pin || '458921'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        {/* View Profile */}
                        <button
                          onClick={() => setViewingUser(u)}
                          title="View Profile Details"
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Suspend / Activate */}
                        <button
                          onClick={() => handleToggleStatus(u)}
                          title={u.status === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            u.status === 'ACTIVE'
                              ? 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                              : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                          }`}
                        >
                          {u.status === 'ACTIVE' ? (
                            <UserX className="w-3.5 h-3.5" />
                          ) : (
                            <UserCheck className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* DELETE USER */}
                        <button
                          onClick={() => handleOpenDelete(u)}
                          title="Permanently Delete User"
                          className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing{' '}
            <strong className="text-slate-900">
              {totalUsers === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </strong>{' '}
            to{' '}
            <strong className="text-slate-900">
              {Math.min(currentPage * pageSize, totalUsers)}
            </strong>{' '}
            of <strong className="text-slate-900">{totalUsers}</strong> accounts
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-bold text-slate-700 bg-slate-100 rounded-xl">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in no-print">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-r from-[#0a4d2e] to-[#042114] text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-xl">
                  <UserPlus className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold uppercase font-serif-crest text-base">
                    Create User Account &amp; Auto Generate ID
                  </h3>
                  <p className="text-xs text-emerald-300">
                    Auto-assigns official ID convention &amp; 6-digit login PIN
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-emerald-300 hover:text-white rounded-xl hover:bg-emerald-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formFullName}
                    onChange={(e) => setFormFullName(e.target.value)}
                    placeholder="e.g. John Terver"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="e.g. j.terver@lcns.edu.ng"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Assigned Role *
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 font-bold"
                  >
                    <option value="STUDENT">STUDENT</option>
                    <option value="LECTURER">LECTURER</option>
                    <option value="HOD">HOD (Head of Department)</option>
                    <option value="BURSAR">BURSAR</option>
                    <option value="REGISTRAR">REGISTRAR</option>
                    <option value="PROVOST">PROVOST</option>
                    <option value="ADMISSION_OFFICER">ADMISSION OFFICER</option>
                    <option value="EXAM_OFFICER">EXAM OFFICER</option>
                    <option value="ADMIN">ADMINISTRATOR</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Academic Level (for Student)
                  </label>
                  <select
                    value={formLevel}
                    onChange={(e) => setFormLevel(e.target.value as any)}
                    disabled={formRole !== 'STUDENT'}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 font-bold disabled:opacity-50"
                  >
                    <option value="ND1">ND 1 (Year 1)</option>
                    <option value="ND2">ND 2 (Year 2)</option>
                    <option value="HND1">HND 1 (Year 3)</option>
                    <option value="HND2">HND 2 (Year 4)</option>
                    <option value="N1">N 1</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="08126799565"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Custom Password (Optional)
                  </label>
                  <input
                    type="text"
                    value={formCustomPass}
                    onChange={(e) => setFormCustomPass(e.target.value)}
                    placeholder="Default: admin123"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Department / Unit
                </label>
                <input
                  type="text"
                  value={formDept}
                  onChange={(e) => setFormDept(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              {/* Auto generation info box */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 space-y-1">
                <span className="font-bold block">Automatic System Conventions:</span>
                <p>
                  &bull; User ID: Format <code>LCNS/2026/[ROLE]/XXX</code> (e.g. <code>LCNS/2026/ND/005</code>)
                </p>
                <p>
                  &bull; Login PIN: Auto-generated 6-digit random code
                </p>
                {formRole === 'STUDENT' && (
                  <p>
                    &bull; Matric Number: Auto-generated <code>LCNS/ND/2026/XXXX</code>
                  </p>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0a4d2e] hover:bg-[#073822] text-white rounded-xl font-bold shadow-md"
                >
                  Create &amp; Generate Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATED CREDENTIALS POPUP */}
      {createdCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in no-print">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 p-6 space-y-5">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-[#22c55e]" />
              </div>
              <h3 className="text-lg font-black uppercase font-serif-crest text-slate-900">
                User Account Created Successfully!
              </h3>
              <p className="text-xs text-slate-500">
                Please copy and securely deliver these login credentials to the user.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Full Name:</span>
                <strong className="text-slate-900">{createdCredentials.fullName}</strong>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Role:</span>
                <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-bold uppercase text-[10px]">
                  {createdCredentials.role}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Official User ID:</span>
                <span className="font-mono-code font-black text-[#0a4d2e] text-sm">
                  {createdCredentials.id}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">6-Digit Login PIN:</span>
                <span className="font-mono-code font-black text-amber-700 text-sm">
                  {createdCredentials.pin}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Password:</span>
                <span className="font-mono-code font-bold text-slate-800">
                  {createdCredentials.password}
                </span>
              </div>

              {createdCredentials.matricNo && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Matriculation No:</span>
                  <span className="font-mono-code font-bold text-emerald-900">
                    {createdCredentials.matricNo}
                  </span>
                </div>
              )}
            </div>

            {copiedNotification && (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
                <span>Credentials copied to clipboard!</span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleCopyCredentials}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Credentials</span>
              </button>

              <button
                onClick={() => setCreatedCredentials(null)}
                className="flex-1 py-2.5 bg-[#0a4d2e] hover:bg-[#073822] text-white font-bold rounded-xl text-xs shadow-xs transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW PROFILE MODAL */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in no-print">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-r from-[#0a4d2e] to-[#042114] text-white p-6 relative">
              <button
                onClick={() => setViewingUser(null)}
                className="absolute top-4 right-4 text-emerald-300 hover:text-white p-1 rounded-xl hover:bg-emerald-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4">
                <div className="relative group w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-400 bg-slate-900 shrink-0">
                  {viewingUser.photoUrl ? (
                    <img
                      src={viewingUser.photoUrl}
                      alt={viewingUser.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-black text-xl">
                      {viewingUser.fullName.charAt(0)}
                    </div>
                  )}
                  <button
                    onClick={() => {
                      const target = viewingUser;
                      setViewingUser(null);
                      setEditingPhotoForUser(target);
                    }}
                    className="absolute inset-0 bg-slate-950/70 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <h3 className="font-bold text-base font-serif-crest text-white leading-tight">
                    {viewingUser.fullName}
                  </h3>
                  <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded uppercase inline-block mt-1">
                    {viewingUser.role.replace('_', ' ')}
                  </span>
                  <div className="text-xs text-emerald-300 font-mono-code mt-0.5">
                    {viewingUser.id}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Email:</span>
                  <strong className="text-slate-800 break-all">{viewingUser.email}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Phone:</span>
                  <strong className="text-slate-800">{viewingUser.phone || '08126799565'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Level:</span>
                  <strong className="text-slate-800">{viewingUser.level || 'ND1'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Status:</span>
                  <span
                    className={`font-bold ${
                      viewingUser.status === 'ACTIVE' ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {viewingUser.status}
                  </span>
                </div>
                {viewingUser.matricNo && (
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px] uppercase">Matric No:</span>
                    <strong className="text-emerald-900 font-mono-code">
                      {viewingUser.matricNo}
                    </strong>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Login PIN:</span>
                  <strong className="font-mono-code text-amber-800">
                    {viewingUser.pin || '458921'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Password:</span>
                  <strong className="font-mono-code text-slate-700">
                    {viewingUser.password || 'admin123'}
                  </strong>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  onClick={() => {
                    const target = viewingUser;
                    setViewingUser(null);
                    setEditingPhotoForUser(target);
                  }}
                  className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#0a4d2e] rounded-xl font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  <span>Upload / Change Photo</span>
                </button>

                <button
                  onClick={() => setViewingUser(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL (CRITICAL REQUIREMENT) */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in no-print">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-red-300 p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-100 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black uppercase font-serif-crest text-red-950">
                  Delete User Account
                </h3>
                <span className="text-xs text-red-600 font-semibold">
                  This action is permanent and cannot be undone.
                </span>
              </div>
            </div>

            <div className="p-4 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-900 space-y-2">
              <p>
                Are you sure you want to permanently delete user account for{' '}
                <strong>{userToDelete.fullName}</strong> ({userToDelete.id} &bull; {userToDelete.email})?
              </p>
              <p className="text-[11px] text-red-700">
                The account will be permanently erased and will not return back even upon refresh or data reload.
              </p>
            </div>

            {deleteError && (
              <div className="p-2.5 bg-red-100 text-red-800 rounded-xl text-xs font-bold">
                {deleteError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                To confirm, type <span className="text-red-700 font-mono-code">DELETE</span> in the box below:
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="Type DELETE"
                className="w-full p-2.5 border-2 border-red-300 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteConfirmationText.trim().toUpperCase() !== 'DELETE'}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-md disabled:opacity-40 transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirm &amp; Delete User</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USER PHOTO MODAL TRIGGER */}
      {editingPhotoForUser && (
        <UserProfilePhotoModal
          isOpen={true}
          onClose={() => setEditingPhotoForUser(null)}
          currentUser={editingPhotoForUser}
          onPhotoUpdated={(newUrl) => {
            setUsers(StorageService.getUsers());
            setEditingPhotoForUser(null);
          }}
        />
      )}
    </div>
  );
};

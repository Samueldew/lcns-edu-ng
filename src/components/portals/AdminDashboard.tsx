import React, { useState, useEffect } from 'react';
import { User, COLLEGE_CONFIG, AuditLog } from '../../types';
import { StorageService } from '../../services/storage';
import { ApiService } from '../../services/api';
import { getSupabaseConfig, SUPABASE_BUCKET } from '../../lib/supabase';
import {
  Database,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  Shield,
  Key,
  Users,
  Search,
  ExternalLink,
  Download,
  Terminal,
  Activity,
  Trash2,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';
import { AdminCMS } from './AdminCMS';
import { AdminUsersManagement } from './AdminUsersManagement';
import { AdminSettings } from './AdminSettings';
import { AdminManagement } from './AdminManagement';
import { AdminGallery } from './AdminGallery';
import { CBTExamManager } from '../cbt/CBTExamManager';
import { Sliders, Camera, Award, UserCheck } from 'lucide-react';

interface AdminDashboardProps {
  initialTab?: 'settings' | 'management' | 'gallery' | 'users' | 'cbt' | 'system' | 'cms';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialTab }) => {
  const [users, setUsers] = useState(StorageService.getUsers());
  const [auditLogs, setAuditLogs] = useState(StorageService.getAuditLogs());
  const [backendStatus, setBackendStatus] = useState<{
    tested: boolean;
    online: boolean;
    latency: number;
    message: string;
  }>({
    tested: false,
    online: false,
    latency: 0,
    message: 'Pending connection check',
  });
  const [testingConnection, setTestingConnection] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<
    'settings' | 'management' | 'gallery' | 'users' | 'cbt' | 'system' | 'cms'
  >(initialTab || 'settings');

  useEffect(() => {
    if (initialTab) {
      setActiveAdminTab(initialTab);
    }
  }, [initialTab]);

  // New User Form State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<User['role']>('LECTURER');
  const [newDept, setNewDept] = useState('Department of Nursing Sciences');
  const [newPassword, setNewPassword] = useState('admin123');

  // Generator state
  const [generatedMatric, setGeneratedMatric] = useState<string | null>(null);
  const [generatedPIN, setGeneratedPIN] = useState<string | null>(null);

  useEffect(() => {
    handleTestConnection();
  }, []);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    const result = await ApiService.testBackendConnection();
    setBackendStatus({
      tested: true,
      online: result.online,
      latency: result.latency,
      message: result.message,
    });
    setTestingConnection(false);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newEmail) return;

    const currentUsers = StorageService.getUsers();
    const newUser = {
      id: 'usr-' + Date.now(),
      fullName: newFullName,
      email: newEmail,
      role: newRole,
      department: newDept,
      password: newPassword,
      status: 'ACTIVE' as const,
      createdAt: new Date().toISOString().split('T')[0],
    };

    StorageService.saveUsers([newUser, ...currentUsers]);
    setUsers(StorageService.getUsers());
    StorageService.logAction('info@lcns.edu.ng', 'ADMIN', 'CREATE_USER', `Created new ${newRole} account for ${newFullName} (${newEmail})`);
    setAuditLogs(StorageService.getAuditLogs());

    // Reset Form
    setNewFullName('');
    setNewEmail('');
    setShowAddUserModal(false);
  };

  const handleGenerateMatric = async () => {
    const matric = await ApiService.generateMatric('ND', 2026);
    setGeneratedMatric(matric);
  };

  const handleGeneratePIN = () => {
    const pin = ApiService.generatePIN();
    setGeneratedPIN(pin);
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to restore the LCNS ERP database to initial defaults?')) {
      StorageService.resetToDefault();
      setUsers(StorageService.getUsers());
      setAuditLogs(StorageService.getAuditLogs());
      alert('ERP database successfully reset to default demo records.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner / System Health */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800 text-emerald-200 text-xs font-bold uppercase tracking-wider mb-2">
              <Activity className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
              <span>Central ICT &amp; Systems Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase font-serif-crest">
              Administrator Dashboard
            </h1>
            <p className="text-xs text-emerald-200 mt-1">
              Supabase PostgreSQL &bull; Bucket: {SUPABASE_BUCKET} &bull; Cross-Device Sync
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl border border-emerald-600/50 shadow-md transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
              <span>{testingConnection ? 'Pinging Supabase...' : 'Test Supabase Database'}</span>
            </button>

            <button
              onClick={() => setShowAddUserModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create User Account</span>
            </button>
          </div>
        </div>

        {/* Backend Endpoint Status Card */}
        <div className="mt-6 pt-6 border-t border-emerald-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-emerald-950/70 p-3.5 rounded-2xl border border-emerald-800/60 flex items-center justify-between">
            <div>
              <span className="text-emerald-400 block text-[10px] uppercase font-bold">Supabase Backend</span>
              <span className="font-bold text-white text-sm">
                {backendStatus.online ? 'CONNECTED / ACTIVE' : 'CONNECTING...'}
              </span>
            </div>
            {backendStatus.online ? (
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            ) : (
              <span className="h-3 w-3 rounded-full bg-amber-500"></span>
            )}
          </div>

          <div className="bg-emerald-950/70 p-3.5 rounded-2xl border border-emerald-800/60">
            <span className="text-emerald-400 block text-[10px] uppercase font-bold">Database Latency</span>
            <span className="font-mono-code font-bold text-white text-sm">
              {backendStatus.latency} ms
            </span>
          </div>

          <div className="bg-emerald-950/70 p-3.5 rounded-2xl border border-emerald-800/60 truncate">
            <span className="text-emerald-400 block text-[10px] uppercase font-bold">Storage Bucket</span>
            <span className="font-mono-code text-[11px] text-amber-300 truncate block">
              {SUPABASE_BUCKET} (Public)
            </span>
          </div>
        </div>
      </div>

      {/* Admin Sub Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={() => setActiveAdminTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeAdminTab === 'settings'
              ? 'bg-[#0a4d2e] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4 text-[#ca8a04]" />
          <span>Logo &amp; School Settings (/admin/settings)</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('management')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeAdminTab === 'management'
              ? 'bg-[#0a4d2e] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-400" />
          <span>Management Team (/admin/management)</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('gallery')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeAdminTab === 'gallery'
              ? 'bg-[#0a4d2e] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Camera className="w-4 h-4 text-amber-400" />
          <span>Photo Gallery (/admin/gallery)</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeAdminTab === 'users'
              ? 'bg-[#0a4d2e] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <span>Users &amp; Roles (/admin/users)</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-700 text-white font-bold">
            {users.length}
          </span>
        </button>

        <button
          onClick={() => setActiveAdminTab('cbt')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeAdminTab === 'cbt'
              ? 'bg-[#0a4d2e] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4 text-amber-400" />
          <span>CBT Tests &amp; Scores</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('system')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeAdminTab === 'system'
              ? 'bg-[#0a4d2e] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Sync &amp; Database Health</span>
        </button>
      </div>

      {activeAdminTab === 'settings' && <AdminSettings />}

      {activeAdminTab === 'management' && <AdminManagement />}

      {activeAdminTab === 'gallery' && <AdminGallery />}

      {activeAdminTab === 'users' && <AdminUsersManagement />}

      {activeAdminTab === 'cbt' && (
        <CBTExamManager
          currentUser={
            StorageService.getCurrentUser() || {
              id: 'LCNS/2026/AD/001',
              email: 'info@lcns.edu.ng',
              role: 'ADMIN',
              fullName: 'Director of ICT / Admin',
              status: 'ACTIVE',
            }
          }
          allowedTypes={['APPLICANT_SCREENING', 'COURSE_TEST']}
        />
      )}

      {activeAdminTab === 'system' && (
        <>
          {/* QUICK SYSTEM UTILITIES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matric Number Generator Tool */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm uppercase">Matric Number Generator</h3>
                </div>
                <button
                  onClick={handleGenerateMatric}
                  className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                >
              Generate Next Matric
            </button>
          </div>
          <p className="text-xs text-slate-600">
            Generates standardized matriculation codes complying with LCNS registrar convention: <code>LCNS/YEAR/LEVEL/COUNT</code>.
          </p>
          {generatedMatric && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
              <span className="text-xs text-slate-600">Generated Code:</span>
              <span className="font-mono-code text-base font-black text-emerald-900">{generatedMatric}</span>
            </div>
          )}
        </div>

        {/* Admission PIN / Voucher Scratch Card Generator */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-50 text-amber-800 rounded-xl">
                <Key className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm uppercase">Scratch Card / PIN Generator</h3>
            </div>
            <button
              onClick={handleGeneratePIN}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              Generate Admission PIN
            </button>
          </div>
          <p className="text-xs text-slate-600">
            Generates 12-character high entropy admission access PINs for prospective candidates.
          </p>
          {generatedPIN && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
              <span className="text-xs text-slate-600">PIN Code:</span>
              <span className="font-mono-code text-base font-black text-amber-950">{generatedPIN}</span>
            </div>
          )}
        </div>
      </div>

      {/* USER MANAGEMENT TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base uppercase font-serif-crest">
              ERP User Accounts &amp; Access Roles
            </h3>
            <p className="text-xs text-slate-500">
              Manage system access permissions for academic staff, students, and officers.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            Total Users: {users.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">Full Name &amp; Contact</th>
                <th className="p-3.5">Email / Identifier</th>
                <th className="p-3.5">System Role</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-center">Test Password</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900">{u.fullName}</div>
                    <div className="text-[11px] text-slate-500">{u.phone || '08126799565'}</div>
                  </td>
                  <td className="p-3.5">
                    <span className="font-mono-code text-slate-700">{u.email}</span>
                    {u.matricNo && (
                      <span className="block font-mono-code text-[10px] text-emerald-800 font-bold">
                        {u.matricNo}
                      </span>
                    )}
                  </td>
                  <td className="p-3.5">
                    <span className="inline-block bg-emerald-100 text-emerald-900 font-bold text-[10px] px-2.5 py-1 rounded-full uppercase">
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-600">{u.department || 'Central Administration'}</td>
                  <td className="p-3.5">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <code className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-mono-code">
                      {u.password || 'admin123'}
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AUDIT LOGS TRAIL */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base uppercase font-serif-crest">
              System Audit Trail &amp; Transaction Logs
            </h3>
            <p className="text-xs text-slate-500">
              Real-time activity log tracking authentication, admissions, result modifications, and bursary entries.
            </p>
          </div>
          <button
            onClick={handleResetData}
            className="text-xs text-red-600 hover:text-red-800 font-bold flex items-center gap-1 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Demo DB</span>
          </button>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between text-xs gap-3"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{log.action}</span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold uppercase">
                    {log.role}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">{log.details}</p>
                <span className="text-[10px] text-slate-400">By: {log.user}</span>
              </div>
              <span className="text-[10px] font-mono-code text-slate-400 shrink-0">
                {log.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>
      </>
      )}

      {/* ADD USER MODAL */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900 uppercase font-serif-crest">
              Create New ERP Staff / Student Account
            </h3>
            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="e.g. Dr. John Terungwa"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. john@lcns.edu.ng"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role *</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-emerald-900"
                  >
                    <option value="ADMIN">ADMIN (ICT)</option>
                    <option value="PROVOST">PROVOST</option>
                    <option value="REGISTRAR">REGISTRAR</option>
                    <option value="ADMISSION_OFFICER">ADMISSION OFFICER</option>
                    <option value="EXAM_OFFICER">EXAM OFFICER</option>
                    <option value="HOD">HOD</option>
                    <option value="LECTURER">LECTURER</option>
                    <option value="BURSAR">BURSAR</option>
                    <option value="STUDENT">STUDENT</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Password</label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono-code"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold shadow-md"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

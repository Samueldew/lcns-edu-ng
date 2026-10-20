import React, { useState, useEffect } from 'react';
import { User, COLLEGE_CONFIG, AuditLog } from '../../types';
import { StorageService } from '../../services/storage';
import { ApiService } from '../../services/api';
import { getSupabaseConfig, SUPABASE_BUCKET, getSupabase } from '../../lib/supabase';
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
import { Sliders, Camera, Award, UserCheck, ArrowUpCircle, GraduationCap, Calendar } from 'lucide-react';
import { StudentPromotion } from './StudentPromotion';
// ✅ SUPER FINE LINK - Admin/Registrar/Provost See All Applicants Records and Process - CBT + Interview + Admission
import { AdminAdmissionManager } from './AdminAdmissionManager';

interface AdminDashboardProps {
  initialTab?: 'settings' | 'management' | 'gallery' | 'users' | 'cbt' | 'system' | 'cms' | 'promotion' | 'admissions_all';
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
    'settings' | 'management' | 'gallery' | 'users' | 'cbt' | 'system' | 'cms' | 'promotion' | 'admissions_all'
  >(initialTab || 'admissions_all');

  const currentUser = StorageService.getCurrentUser() || { id: 'LCNS/2026/AD/001', email: 'info@lcns.edu.ng', role: 'ADMIN', fullName: 'Director of ICT / Admin', status: 'ACTIVE' };

  useEffect(() => {
    if (initialTab) {
      setActiveAdminTab(initialTab);
    }
  }, [initialTab]);

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<User['role']>('LECTURER');
  const [newDept, setNewDept] = useState('Department of Nursing Sciences');
  const [newPassword, setNewPassword] = useState('admin123');

  const [generatedMatric, setGeneratedMatric] = useState<string | null>(null);
  const [generatedPIN, setGeneratedPIN] = useState<string | null>(null);

  useEffect(() => {
    handleTestConnection();
  }, []);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    const start = Date.now();
    try {
      const sb = getSupabase();
      if (!sb) throw new Error('Supabase not configured');
      const { error } = await sb.from('school_settings').select('key').limit(1);
      const latency = Date.now() - start;
      setBackendStatus({
        tested: true,
        online: true,
        latency: latency,
        message: error ? 'Connected - table setup needed' : 'Connected & Active',
      });
    } catch (err: any) {
      setBackendStatus({
        tested: true,
        online: false,
        latency: Date.now() - start,
        message: err?.message || 'Not connected',
      });
    }
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
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800 text-emerald-200 text-xs font-bold uppercase tracking-wider mb-2">
              <Activity className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
              <span>Central ICT & Systems Management - All Applicants + CBT + Interview Link</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase font-serif-crest">
              Administrator Dashboard - Super Fine Linked
            </h1>
            <p className="text-xs text-emerald-200 mt-1">
              Supabase PostgreSQL • Bucket: {SUPABASE_BUCKET} • All Applicants Records + CBT + Interview + Admission Linked to Applicant Portal
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={handleTestConnection} disabled={testingConnection} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl border border-emerald-600/50 shadow-md transition-all"><RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} /><span>{testingConnection ? 'Pinging Supabase...' : 'Test Supabase Database'}</span></button>
            <button onClick={() => setShowAddUserModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all"><UserPlus className="w-4 h-4" /><span>Create User Account</span></button>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-emerald-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-emerald-950/70 p-3.5 rounded-2xl border border-emerald-800/60 flex items-center justify-between">
            <div><span className="text-emerald-400 block text-[10px] uppercase font-bold">Supabase Backend</span><span className="font-bold text-white text-sm">{backendStatus.online ? 'CONNECTED / ACTIVE' : 'CONNECTING...'}</span></div>
            {backendStatus.online ? <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span></span> : <span className="h-3 w-3 rounded-full bg-amber-500"></span>}
          </div>
          <div className="bg-emerald-950/70 p-3.5 rounded-2xl border border-emerald-800/60"><span className="text-emerald-400 block text-[10px] uppercase font-bold">Database Latency</span><span className="font-mono-code font-bold text-white text-sm">{backendStatus.latency} ms</span></div>
          <div className="bg-emerald-950/70 p-3.5 rounded-2xl border border-emerald-800/60 truncate"><span className="text-emerald-400 block text-[10px] uppercase font-bold">Storage Bucket</span><span className="font-mono-code text-[11px] text-amber-300 truncate block">{SUPABASE_BUCKET} (Public)</span></div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        {/* ✅ SUPER FINE LINK - All Applicants */}
        <button onClick={() => setActiveAdminTab('admissions_all')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${activeAdminTab === 'admissions_all' ? 'bg-blue-700 text-white shadow-md ring-2 ring-blue-300' : 'bg-blue-50 text-blue-800 border-2 border-blue-300 hover:bg-blue-100'}`}>
          <GraduationCap className="w-4 h-4" />
          <span>🎓 All Applicants Records - CBT + Interview + Admission - Link Registrar/Admin to Applicant</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-black font-black">SUPER FINE</span>
        </button>
        <button onClick={() => setActiveAdminTab('promotion')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${activeAdminTab === 'promotion' ? 'bg-amber-500 text-black shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-amber-50 border border-amber-200'}`}>
          <ArrowUpCircle className="w-4 h-4" /><span>Promote Students & New Session 2026/2027</span>
        </button>
        <button onClick={() => setActiveAdminTab('settings')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeAdminTab === 'settings' ? 'bg-[#0a4d2e] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}><Sliders className="w-4 h-4 text-[#ca8a04]" /><span>School Settings</span></button>
        <button onClick={() => setActiveAdminTab('users')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeAdminTab === 'users' ? 'bg-[#0a4d2e] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}><UserCheck className="w-4 h-4 text-emerald-400" /><span>Users & Roles</span><span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-700 text-white font-bold">{users.length}</span></button>
        <button onClick={() => setActiveAdminTab('cbt')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeAdminTab === 'cbt' ? 'bg-[#0a4d2e] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}><Award className="w-4 h-4 text-amber-400" /><span>CBT Tests Old</span></button>
        <button onClick={() => setActiveAdminTab('system')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeAdminTab === 'system' ? 'bg-[#0a4d2e] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}><Database className="w-4 h-4 text-emerald-400" /><span>Sync & Health</span></button>
      </div>

      {activeAdminTab === 'admissions_all' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border-2 border-blue-300 p-3 rounded-xl text-xs font-bold">
            ✅ LINKED: Registrar and Admin to Applicant CBT and Interview Exams and Scores - Admin sets CBT exams from Admin/Registrar, JAMB scores display on board with JAMB registration number, admission in progress, CBT test score publish by Admin/Registrar, interview scores published, if admitted congratulation full name + kindly proceed to JAMB CBT center and print admission number and returns back to school - Supabase lcns_applicants table - Applicant can return with application number and see dashboard
          </div>
          <AdminAdmissionManager currentUser={currentUser} />
        </div>
      )}
      {activeAdminTab === 'promotion' && <StudentPromotion />}
      {activeAdminTab === 'settings' && <AdminSettings />}
      {activeAdminTab === 'management' && <AdminManagement />}
      {activeAdminTab === 'gallery' && <AdminGallery />}
      {activeAdminTab === 'users' && <AdminUsersManagement />}
      {activeAdminTab === 'cbt' && (
        <CBTExamManager
          currentUser={StorageService.getCurrentUser() || { id: 'LCNS/2026/AD/001', email: 'info@lcns.edu.ng', role: 'ADMIN', fullName: 'Director of ICT / Admin', status: 'ACTIVE' }}
          allowedTypes={['APPLICANT_SCREENING', 'COURSE_TEST']}
        />
      )}
      {activeAdminTab === 'system' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl"><Terminal className="w-5 h-5" /></div><h3 className="font-bold text-slate-900 text-sm uppercase">Matric Number Generator</h3></div><button onClick={handleGenerateMatric} className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold">Generate Next Matric</button></div>
              <p className="text-xs text-slate-600">Generates standardized matriculation codes: <code>LCNS/YEAR/LEVEL/COUNT</code>.</p>
              {generatedMatric && <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between"><span className="text-xs text-slate-600">Generated Code:</span><span className="font-mono-code text-base font-black text-emerald-900">{generatedMatric}</span></div>}
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="p-2 bg-amber-50 text-amber-800 rounded-xl"><Key className="w-5 h-5" /></div><h3 className="font-bold text-slate-900 text-sm uppercase">Scratch Card / PIN Generator</h3></div><button onClick={handleGeneratePIN} className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold">Generate Admission PIN</button></div>
              <p className="text-xs text-slate-600">Generates 12-character high entropy admission access PINs.</p>
              {generatedPIN && <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between"><span className="text-xs text-slate-600">PIN Code:</span><span className="font-mono-code text-base font-black text-amber-950">{generatedPIN}</span></div>}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;

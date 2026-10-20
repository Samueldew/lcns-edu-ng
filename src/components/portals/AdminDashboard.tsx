import React, { useEffect, useState } from 'react';
import { StorageService } from '../../services/storage';
import { AdminSettings } from './AdminSettings';
import AdminManagement from './AdminManagement';
import { AdminGallery } from './AdminGallery';
import { CBTExamManager } from '../cbt/CBTExamManager';
import { Sliders, Camera, Award, UserCheck, ArrowUpCircle, GraduationCap, Users, Database, BookOpen } from 'lucide-react';
import { StudentPromotion } from './StudentPromotion';
import { AdminAdmissionManager } from '../admin/AdminAdmissionManager';

const SUPABASE_BUCKET = 'lcns-media';

interface AdminDashboardProps {
  initialTab?: 'settings' | 'management' | 'gallery' | 'users' | 'cbt' | 'system' | 'cms' | 'promotion' | 'courses' | 'applicants';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialTab }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>(() => JSON.parse(localStorage.getItem('lcns_courses') || '[]'));
  const [activeAdminTab, setActiveAdminTab] = useState<
    'settings' | 'management' | 'gallery' | 'users' | 'cbt' | 'system' | 'cms' | 'promotion' | 'courses' | 'applicants'
  >(initialTab || 'settings');

  useEffect(() => {
    try {
      const allUsers = StorageService.getUsers ? StorageService.getUsers() : JSON.parse(localStorage.getItem('lcns_users') || '[]');
      setUsers(allUsers);
    } catch {}
  }, [activeAdminTab]);

  const lecturers = users.filter((u: any) => u.role === 'LECTURER' || u.role === 'HOD');

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-slate-900 via-[#0a4d2e] to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-900">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-black/30 px-3 py-1 rounded-full">Director of ICT - Admin Portal</span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase mt-2 flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-amber-400"/>
            Administrator Dashboard
          </h1>
          <p className="text-xs text-emerald-200 mt-1">
            Supabase PostgreSQL • Bucket: {SUPABASE_BUCKET} • Cross-Device Sync • {localStorage.getItem('lcns_current_session') || '2025/2026'} Session • Users: {users.length} • Lecturers: {lecturers.length}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <button onClick={() => setActiveAdminTab('promotion')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeAdminTab === 'promotion' ? 'bg-amber-500 text-black shadow-md ring-2 ring-amber-300' : 'text-slate-600 hover:bg-amber-50 border border-amber-200'}`}>
          <ArrowUpCircle className="w-4 h-4" />Promote Students & New Session 2026/2027<span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-black text-amber-400">NEW</span>
        </button>
        <button onClick={() => setActiveAdminTab('courses')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeAdminTab === 'courses' ? 'bg-emerald-700 text-white shadow-md ring-2 ring-emerald-300' : 'text-emerald-800 hover:bg-emerald-50 border-2 border-emerald-300'}`}>
          <BookOpen className="w-4 h-4" />📚 Allocate Courses<span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-black text-white">{courses.length}</span>
        </button>
        <button onClick={() => setActiveAdminTab('applicants')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeAdminTab === 'applicants' ? 'bg-purple-700 text-white shadow-md ring-2 ring-purple-300' : 'text-purple-800 hover:bg-purple-50 border-2 border-purple-300'}`}>
          <GraduationCap className="w-4 h-4" />🎓 All Applicants<span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-black">SUPER FINE</span>
        </button>
        <button onClick={() => setActiveAdminTab('settings')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeAdminTab === 'settings' ? 'bg-[#0a4d2e] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
          <Sliders className="w-4 h-4 text-[#ca8a04]" />School Settings
        </button>
        <button onClick={() => setActiveAdminTab('management')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeAdminTab === 'management' ? 'bg-[#0a4d2e] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
          <Users className="w-4 h-4 text-emerald-400" />Management Team
        </button>
        <button onClick={() => setActiveAdminTab('gallery')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeAdminTab === 'gallery' ? 'bg-[#0a4d2e] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
          <Camera className="w-4 h-4 text-amber-400" />Photo Gallery
        </button>
        <button onClick={() => setActiveAdminTab('users')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeAdminTab === 'users' ? 'bg-[#0a4d2e] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
          <UserCheck className="w-4 h-4 text-emerald-400" />Users & Roles<span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-700 text-white">{users.length}</span>
        </button>
        <button onClick={() => setActiveAdminTab('cbt')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeAdminTab === 'cbt' ? 'bg-[#0a4d2e] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
          <Award className="w-4 h-4 text-amber-400" />CBT Tests
        </button>
        <button onClick={() => setActiveAdminTab('system')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeAdminTab === 'system' ? 'bg-[#0a4d2e] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
          <Database className="w-4 h-4 text-emerald-400" />Sync & Health
        </button>
      </div>

      {activeAdminTab === 'promotion' && <StudentPromotion />}
      {activeAdminTab === 'settings' && <AdminSettings />}
      {activeAdminTab === 'management' && <AdminManagement />}
      {activeAdminTab === 'gallery' && <AdminGallery />}
      {activeAdminTab === 'users' && (
        <div className="bg-white rounded-2xl border p-4">
          <h3 className="font-black">Users Information - {users.length} Users Found</h3>
          <div className="mt-3 grid gap-2">
            {users.map((u:any) => (
              <div key={u.email} className="flex justify-between border p-2 rounded-xl text-xs">
                <span className="font-bold">{u.fullName} | {u.email} | {u.role}</span>
                <span className="bg-green-100 px-2 rounded">{u.status || 'ACTIVE'}</span>
              </div>
            ))}
            {users.length===0 && <p className="text-xs text-red-500">No users in localStorage - Create users in Management</p>}
          </div>
        </div>
      )}
      {activeAdminTab === 'cbt' && <CBTExamManager currentUser={{id:'admin',email:'admin@lcns.edu.ng',role:'ADMIN',fullName:'Admin',status:'ACTIVE'}} />}
      {activeAdminTab === 'courses' && (
        <div className="bg-white rounded-3xl border-2 p-4">
          <h2 className="font-black">📚 Course Allocation - {courses.length} Courses - {lecturers.length} Lecturers</h2>
          <div className="overflow-x-auto border-2 rounded-xl mt-3">
            <table className="w-full text-xs"><thead className="bg-slate-900 text-white"><tr><th className="p-2">Code</th><th className="p-2">Title</th><th className="p-2">Lecturer</th></tr></thead><tbody>{courses.map((c:any)=><tr key={c.id} className="border-b"><td className="p-2 font-mono font-black">{c.code}</td><td className="p-2">{c.title}</td><td className="p-2">{c.lecturer}</td></tr>)}</tbody></table>
          </div>
        </div>
      )}
      {activeAdminTab === 'applicants' && (
        <div className="space-y-4">
          <div className="bg-purple-50 border-2 border-purple-300 p-3 rounded-xl text-xs font-bold">🎓 All Applicants Records - CBT + Interview + Admit - Super Fine Link - With Picture</div>
          <AdminAdmissionManager currentUser={{id:'admin',email:'admin@lcns.edu.ng',role:'ADMIN',fullName:'Admin - Director of ICT',status:'ACTIVE'}} />
        </div>
      )}
      {activeAdminTab === 'system' && (
        <div className="bg-white rounded-2xl border p-6 text-xs">
          <h3 className="font-black">System Health</h3>
          <p>Session: {localStorage.getItem('lcns_current_session') || '2025/2026'}</p>
          <p>Users: {users.length}</p>
          <p>Bucket: {SUPABASE_BUCKET}</p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

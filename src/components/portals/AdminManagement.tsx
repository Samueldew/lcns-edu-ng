import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { Settings, BookOpen, GraduationCap, LayoutDashboard } from 'lucide-react';
import { CourseAllocationManager } from '../admin/CourseAllocationManager';
import { AdminAdmissionManager } from '../admin/AdminAdmissionManager';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'courses_alloc' | 'admissions_all' | 'settings'>('courses_alloc');
  const currentUser = StorageService.getCurrentUser() || { id: 'ADMIN/001', email: 'admin@lcns.edu.ng', role: 'ADMIN', fullName: 'System Administrator', status: 'ACTIVE' };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div className="bg-gradient-to-r from-slate-900 to-emerald-900 text-white rounded-3xl p-6 shadow-xl">
        <h1 className="text-2xl font-black uppercase flex items-center gap-2"><LayoutDashboard className="w-6 h-6"/>Admin Dashboard - {currentUser.fullName}</h1>
        <p className="text-xs text-slate-300 mt-1">Course Allocation to Lecturers + All Applicants Link - Super Fine</p>
      </div>
      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border">
        <button onClick={() => setActiveTab('courses_alloc')} className={`px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='courses_alloc'?'bg-emerald-700 text-white':'bg-emerald-50 border-2 border-emerald-300 text-emerald-800'}`}><BookOpen className="w-4 h-4 inline mr-1"/>📚 Allocate Courses to Lecturers</button>
        <button onClick={() => setActiveTab('admissions_all')} className={`px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab==='admissions_all'?'bg-purple-700 text-white':'bg-purple-50 border border-purple-300 text-purple-800'}`}><GraduationCap className="w-4 h-4 inline mr-1"/>🎓 All Applicants Records</button>
        <button onClick={() => setActiveTab('settings')} className={`px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab==='settings'?'bg-slate-900 text-white':'bg-slate-50 border text-slate-600'}`}><Settings className="w-4 h-4 inline mr-1"/>Settings</button>
      </div>
      {activeTab==='courses_alloc' && <CourseAllocationManager currentUser={currentUser} />}
      {activeTab==='admissions_all' && <AdminAdmissionManager currentUser={currentUser} />}
      {activeTab==='settings' && <div className="bg-white rounded-3xl border p-8 text-center"><p className="font-black">System Settings</p><p className="text-xs text-slate-500 mt-2">Create LECTURER accounts so they appear in Course Allocation dropdown</p></div>}
    </div>
  );
};
export default AdminDashboard;

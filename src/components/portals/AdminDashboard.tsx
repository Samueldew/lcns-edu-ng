import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { Users, BookOpen, GraduationCap, Settings, Image as ImageIcon, Building, FileSpreadsheet, Award, BarChart3 } from 'lucide-react';
import { AdminGallery } from './AdminGallery';
import { AdminAdmissionManager } from './AdminAdmissionManager';
import { CollegeLogo } from '../common/CollegeLogo';
import { CourseRegistrationApproval } from '../portals/CourseRegistrationApproval';
import { ScoreSheetViewer } from '../portals/ScoreSheetViewer';

export const AdminDashboard: React.FC = () => {
  const currentUser = StorageService.getCurrentUser() || { role: 'ADMIN', fullName: 'Admin', email: 'admin@lcns.edu.ng' };
  const [activeTab, setActiveTab] = useState<'overview' | 'gallery' | 'admissions' | 'students' | 'courses' | 'course_reg' | 'scoresheets' | 'settings'>('overview');
  
  const students = StorageService.getStudents() || [];
  const courses = StorageService.getCourses() || [];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-emerald-800">
        <div className="flex items-center gap-3">
          <CollegeLogo size="md" />
          <div>
            <h1 className="text-2xl font-black uppercase">College of Nursing Sciences, Catholic Diocese of Gboko</h1>
            <p className="text-xs text-emerald-200">Admin Dashboard - Complete - Bishop + Provost + Gallery + All Management - OLD DASHBOARD RETURNED</p>
            <p className="text-[10px] text-amber-300">Admin: {currentUser.fullName} - {currentUser.email}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 bg-white p-3 rounded-2xl border shadow-sm">
        <button onClick={()=>setActiveTab('overview')} className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 ${activeTab==='overview'?'bg-slate-900 text-white':'bg-slate-100'}`}><BarChart3 className="w-4 h-4"/>Overview</button>
        <button onClick={()=>setActiveTab('gallery')} className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 ${activeTab==='gallery'?'bg-amber-600 text-white ring-2 ring-amber-300':'bg-amber-50 border-2 border-amber-400 text-amber-800'}`}><ImageIcon className="w-4 h-4"/>🖼️ Gallery - Bishop + Provost + Logo - NEW</button>
        <button onClick={()=>setActiveTab('admissions')} className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 ${activeTab==='admissions'?'bg-purple-700 text-white':'bg-purple-50 border border-purple-300 text-purple-800'}`}><GraduationCap className="w-4 h-4"/>Admissions</button>
        <button onClick={()=>setActiveTab('students')} className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 ${activeTab==='students'?'bg-emerald-700 text-white':'bg-emerald-50 border border-emerald-300 text-emerald-800'}`}><Users className="w-4 h-4"/>Students ({students.length})</button>
        <button onClick={()=>setActiveTab('courses')} className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 ${activeTab==='courses'?'bg-blue-700 text-white':'bg-blue-50 border border-blue-300 text-blue-800'}`}><BookOpen className="w-4 h-4"/>Courses ({courses.length})</button>
        <button onClick={()=>setActiveTab('course_reg')} className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 ${activeTab==='course_reg'?'bg-indigo-700 text-white':'bg-indigo-50 border-2 border-indigo-400 text-indigo-800'}`}><FileSpreadsheet className="w-4 h-4"/>Course Reg Approval</button>
        <button onClick={()=>setActiveTab('scoresheets')} className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 ${activeTab==='scoresheets'?'bg-emerald-800 text-white':'bg-slate-100'}`}><Award className="w-4 h-4"/>Score Sheets</button>
        <button onClick={()=>setActiveTab('settings')} className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 ${activeTab==='settings'?'bg-slate-700 text-white':'bg-slate-100'}`}><Settings className="w-4 h-4"/>Settings</button>
      </div>

      {activeTab==='overview' && (
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-white border-2 rounded-2xl p-5 text-center"><Users className="w-8 h-8 mx-auto text-emerald-700"/><p className="font-black text-2xl mt-2">{students.length}</p><p className="text-xs">Students</p></div>
          <div className="bg-white border-2 rounded-2xl p-5 text-center"><BookOpen className="w-8 h-8 mx-auto text-blue-700"/><p className="font-black text-2xl mt-2">{courses.length}</p><p className="text-xs">Courses</p></div>
          <div className="bg-white border-2 rounded-2xl p-5 text-center"><ImageIcon className="w-8 h-8 mx-auto text-amber-600"/><p className="font-black text-2xl mt-2">{JSON.parse(localStorage.getItem('lcns_gallery_photos')||'[]').length}</p><p className="text-xs">Gallery Photos</p></div>
          <div className="bg-white border-2 rounded-2xl p-5 text-center"><Building className="w-8 h-8 mx-auto text-purple-700"/><p className="font-black text-xs mt-2">COLLEGE OF NURSING SCIENCES, CATHOLIC DIOCESE OF GBOKO</p></div>
        </div>
      )}

      {activeTab==='gallery' && <AdminGallery />}
      {activeTab==='admissions' && <AdminAdmissionManager currentUser={currentUser} />}
      {activeTab==='course_reg' && <CourseRegistrationApproval currentUser={currentUser} />}
      {activeTab==='scoresheets' && <ScoreSheetViewer currentUser={currentUser} />}
      
      {activeTab==='students' && (
        <div className="bg-white rounded-2xl border p-6"><h2 className="font-black">All Students - {students.length}</h2><div className="mt-3 space-y-2 max-h-96 overflow-y-auto">{students.map((s:any)=><div key={s.matricNo} className="border p-2 rounded text-xs flex justify-between"><span>{s.fullName} - {s.matricNo} - {s.level}</span><span>{s.program}</span></div>)}</div></div>
      )}
      
      {activeTab==='courses' && (
        <div className="bg-white rounded-2xl border p-6"><h2 className="font-black">All Courses - {courses.length}</h2><div className="mt-3 space-y-2 max-h-96 overflow-y-auto">{courses.map((c:any)=><div key={c.id} className="border p-2 rounded text-xs flex justify-between"><span>{c.code} - {c.title}</span><span>{c.units} units - {c.level}</span></div>)}</div></div>
      )}

      {activeTab==='settings' && (
        <div className="bg-white rounded-2xl border p-6 space-y-3">
          <h2 className="font-black">Settings - School Info</h2>
          <p className="text-xs">School: COLLEGE OF NURSING SCIENCES, CATHOLIC DIOCESE OF GBOKO</p>
          <p className="text-xs">Bishop Photo: {localStorage.getItem('lcns_bishop_photo') ? '✅ Uploaded' : '❌ Not uploaded'}</p>
          <p className="text-xs">Provost Photo: {localStorage.getItem('lcns_provost_photo') ? '✅ Uploaded' : '❌ Not uploaded'}</p>
          <p className="text-xs">Logo: {localStorage.getItem('lcns_college_logo') ? '✅ Custom' : 'Default'}</p>
          <button onClick={()=>{ localStorage.clear(); alert('Cleared - Refresh'); location.reload(); }} className="px-4 py-2 bg-red-700 text-white rounded-xl text-xs font-black">Clear All Cache</button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

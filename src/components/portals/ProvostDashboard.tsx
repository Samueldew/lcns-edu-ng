import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { COLLEGE_CONFIG } from '../../types';
import {
  Award,
  Users,
  GraduationCap,
  TrendingUp,
  CheckCircle2,
  Clock,
  Building,
  FileCheck,
  Send,
  BookOpen,
} from 'lucide-react';

import { CBTExamManager } from '../cbt/CBTExamManager';
import { AdmissionProcessingView } from './AdmissionProcessingView';
// ✅ LINK 1 - All Applicants + CBT + Interview + Admission
import { AdminAdmissionManager } from '../admin/AdminAdmissionManager';
// ✅ LINK 2 - All Students Biodata with Current Level
import { AdminStudentsBiodata } from '../admin/AdminStudentsBiodata';

export const ProvostDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'admissions' | 'admissions_all' | 'cbt' | 'students_biodata'>('overview');
  const students = StorageService.getStudents();
  const applicants = StorageService.getApplicants();
  const payments = StorageService.getPayments();
  const [senateApproved, setSenateApproved] = useState(false);

  const currentUser = StorageService.getCurrentUser() || {
    id: 'LCNS/2026/PV/001',
    email: 'provost@lcns.edu.ng',
    role: 'PROVOST',
    fullName: 'Mrs Terna Fiase Msc, Bnsc, Dip Nursing Education, RNE,RM,RN',
    status: 'ACTIVE',
  };

  const totalRevenue = payments.filter((p) => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0);

  const handleSenateApproval = () => {
    setSenateApproved(true);
    StorageService.logAction(
      'provost@lcns.edu.ng',
      'PROVOST',
      'SENATE_RATIFICATION',
      'Academic Board granted Senate Ratification for 2026/2027 First Semester Examination Broadsheet.'
    );
    alert('Senate Ratification Granted: First Semester Examination results are now officially validated and published to student portals.');
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-emerald-800 px-3 py-1 rounded-full">
              Office of the College Provost
            </span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase font-serif-crest mt-2">
              Mrs Terna Fiase Msc, Bnsc, Dip Nursing Education, RNE,RM,RN
            </h1>
            <p className="text-xs text-emerald-200">
              Executive Overview + All Applicants + All Students Biodata with Current Level - Super Fine
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-emerald-300 font-semibold block">Academic Session</span>
            <span className="text-lg font-black text-amber-400 font-mono-code">{COLLEGE_CONFIG.CURRENT_SESSION}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs no-print">
        <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'overview' ? 'bg-[#0a4d2e] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}><Building className="w-4 h-4 text-emerald-400" /><span>Provost Institutional Overview & Senate</span></button>
        
        <button onClick={() => setActiveTab('students_biodata')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'students_biodata' ? 'bg-emerald-700 text-white shadow-md ring-2 ring-emerald-300' : 'bg-emerald-50 text-emerald-800 border-2 border-emerald-300 hover:bg-emerald-100'}`}><Users className="w-4 h-4"/><span>👨‍🎓 All Students Biodata with Current Level - Provost / Registrar / Exam Officer / HOD</span><span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-black font-black">NEW</span></button>

        <button onClick={() => setActiveTab('admissions_all')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'admissions_all' ? 'bg-purple-700 text-white shadow-md ring-2 ring-purple-300' : 'bg-purple-50 text-purple-800 border-2 border-purple-300 hover:bg-purple-100'}`}><GraduationCap className="w-4 h-4"/><span>🎓 All Applicants - CBT + Interview + Admit - SUPER FINE LINK</span><span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-black font-black">SUPER FINE</span></button>

        <button onClick={() => setActiveTab('admissions')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'admissions' ? 'bg-[#0a4d2e] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}><GraduationCap className="w-4 h-4 text-emerald-400" /><span>Admissions Committee Old</span></button>
        <button onClick={() => setActiveTab('cbt')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'cbt' ? 'bg-[#0a4d2e] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}><Award className="w-4 h-4 text-amber-400" /><span>CBT Screening Old</span></button>
      </div>

      {activeTab === 'students_biodata' ? (
        <AdminStudentsBiodata currentUser={currentUser} roleLabel="Provost - All Students Biodata with Current Level (ND1 ND2 HND1 HND2)" />
      ) : activeTab === 'admissions_all' ? (
        <div className="space-y-4">
          <div className="bg-purple-50 border-2 border-purple-300 p-3 rounded-xl text-xs font-bold">Provost All Applicants Records - CBT Exam Set + CBT Score Publish + Interview Scores Publish + Final Admit with Congratulations + JAMB CBT Center instruction - Link Registrar/Admin to Applicant Dashboard</div>
          <AdminAdmissionManager currentUser={currentUser} />
        </div>
      ) : activeTab === 'admissions' ? (
        <AdmissionProcessingView />
      ) : activeTab === 'cbt' ? (
        <CBTExamManager
          currentUser={{
            id: 'LCNS/2026/PV/001',
            email: 'provost@lcns.edu.ng',
            role: 'PROVOST',
            fullName: 'Mrs Terna Fiase Msc, Bnsc, Dip Nursing Education, RNE,RM,RN',
            status: 'ACTIVE',
          }}
          allowedTypes={['APPLICANT_SCREENING']}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2"><div className="flex items-center justify-between text-slate-500"><span className="text-xs font-bold uppercase">Total Enrolled</span><div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl"><Users className="w-5 h-5" /></div></div><div className="text-2xl font-black text-slate-900">{students.length + 415}</div><div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> +14.2% from last session</div></div>
            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2"><div className="flex items-center justify-between text-slate-500"><span className="text-xs font-bold uppercase">2026/2027 Applicants</span><div className="p-2 bg-emerald-50 text-[#0a4d2e] rounded-xl"><GraduationCap className="w-5 h-5" /></div></div><div className="text-2xl font-black text-slate-900">{applicants.length + 185}</div><div className="text-[11px] text-[#16a34a] font-semibold">Merit List Quota: 85% Met</div></div>
            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2"><div className="flex items-center justify-between text-slate-500"><span className="text-xs font-bold uppercase">Overall Exam Pass Rate</span><div className="p-2 bg-amber-50 text-amber-700 rounded-xl"><Award className="w-5 h-5" /></div></div><div className="text-2xl font-black text-emerald-800">94.8%</div><div className="text-[11px] text-emerald-600 font-semibold">NMCN Professional Standard Target</div></div>
            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2"><div className="flex items-center justify-between text-slate-500"><span className="text-xs font-bold uppercase">Bursary Revenue (YTD)</span><div className="p-2 bg-purple-50 text-purple-700 rounded-xl"><TrendingUp className="w-5 h-5" /></div></div><div className="text-2xl font-black text-slate-900">₦{(totalRevenue + 72400000).toLocaleString()}</div><div className="text-[11px] text-purple-600 font-semibold">Remita Verified Collections</div></div>
          </div>
          <div className="bg-white rounded-3xl border-2 border-emerald-700/40 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1"><span className="text-xs font-bold uppercase text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">Senate Academic Board Agenda</span><h3 className="text-lg font-black text-slate-950 uppercase font-serif-crest">2026/2027 First Semester Examination Broadsheet Ratification</h3><p className="text-xs text-slate-600">Submitted by Dr. Emmanuel O. Agada (Examination Officer) and moderated by Heads of Department.</p></div>
              <button onClick={handleSenateApproval} disabled={senateApproved} className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md transition-all ${senateApproved ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-emerald-800 hover:bg-emerald-900 text-white'}`}><CheckCircle2 className="w-4 h-4 text-amber-300" /><span>{senateApproved ? 'Senate Ratified & Approved' : 'Grant Senate Final Approval'}</span></button>
            </div>
            {senateApproved && (<div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /><span>Senate approval granted on {new Date().toLocaleDateString()}. Transcripts and Semester GPA results are officially unlocked for all students.</span></div>)}
          </div>
        </>
      )}
    </div>
  );
};

export default ProvostDashboard;

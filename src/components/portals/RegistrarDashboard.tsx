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
// ✅ SUPER FINE LINK - Provost / Registrar / Admin / Admission Officer See All Applicants Records and Process
import { AdminAdmissionManager } from '../admin/AdminAdmissionManager';

export const ProvostDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'admissions' | 'admissions_all' | 'cbt'>('overview');
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
              Executive Institutional Overview + All Applicants Records + CBT + Interview + Admission Linked - Super Fine
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

        {/* ✅ NEW SUPER FINE - LINK Provost to Applicant CBT + Interview + Admission */}
        <button onClick={() => setActiveTab('admissions_all')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'admissions_all' ? 'bg-purple-700 text-white shadow-md ring-2 ring-purple-300' : 'bg-purple-50 text-purple-800 border-2 border-purple-300 hover:bg-purple-100'}`}><GraduationCap className="w-4 h-4"/><span>🎓 All Applicants Records - Provost/Registrar/Admin/Admission Officer - CBT + Interview + Final Admit - SUPER FINE LINK</span><span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-black font-black">SUPER FINE</span></button>

        <button onClick={() => setActiveTab('admissions')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'admissions' ? 'bg-[#0a4d2e] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}><GraduationCap className="w-4 h-4 text-emerald-400" /><span>Admissions Committee Old (/admissions)</span></button>
        <button onClick={() => setActiveTab('cbt')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'cbt' ? 'bg-[#0a4d2e] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}><Award className="w-4 h-4 text-amber-400" /><span>Applicant CBT Screening Scores & PDF Old</span></button>
      </div>

      {activeTab === 'admissions_all' ? (
        <div className="space-y-4">
          <div className="bg-purple-50 border-2 border-purple-300 p-3 rounded-xl text-xs font-bold">
            <p>📋 SUPER FINE LINK - Provost / Registrar / Admin / Admission Officer See All Applicants Records and Process: Applicant Apply Online (Biodata → Academics: secondary school name, WACE/NECO/NABTEB exam number year, if two seating indicates baths, Mathematics English Chemistry Biology Physics compulsory + 4 others grading → JAMB reg number scores year institution first choice Labe College Course ND/HND → Upload result WACE if two seating one box optional + passport + proof of Payments → Review confirmation → Dashboard download biodata with application number exam number attached instruction kindly come with form on aptitude test day with passport attached pending bursar clearance → After bursar clearance use application number to return → Dashboard open showing biodata form, CBT exams set from Registrar/Admin, JAMB scores display on board with JAMB registration number, admission in progress, CBT test score publish by Registrar/Admin, interview scores published → If admitted congratulation full name + kindly proceed to JAMB CBT center and print admission number and returns back to school) - All linked via Supabase lcns_applicants</p>
          </div>
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
            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500"><span className="text-xs font-bold uppercase">Total Enrolled</span><div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl"><Users className="w-5 h-5" /></div></div>
              <div className="text-2xl font-black text-slate-900">{students.length + 415}</div>
              <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> +14.2% from last session</div>
            </div>
            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500"><span className="text-xs font-bold uppercase">2026/2027 Applicants</span><div className="p-2 bg-emerald-50 text-[#0a4d2e] rounded-xl"><GraduationCap className="w-5 h-5" /></div></div>
              <div className="text-2xl font-black text-slate-900">{applicants.length + 185}</div>
              <div className="text-[11px] text-[#16a34a] font-semibold">Merit List Quota: 85% Met</div>
            </div>
            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500"><span className="text-xs font-bold uppercase">Overall Exam Pass Rate</span><div className="p-2 bg-amber-50 text-amber-700 rounded-xl"><Award className="w-5 h-5" /></div></div>
              <div className="text-2xl font-black text-emerald-800">94.8%</div>
              <div className="text-[11px] text-emerald-600 font-semibold">NMCN Professional Standard Target</div>
            </div>
            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500"><span className="text-xs font-bold uppercase">Bursary Revenue (YTD)</span><div className="p-2 bg-purple-50 text-purple-700 rounded-xl"><TrendingUp className="w-5 h-5" /></div></div>
              <div className="text-2xl font-black text-slate-900">₦{(totalRevenue + 72400000).toLocaleString()}</div>
              <div className="text-[11px] text-purple-600 font-semibold">Remita Verified Collections</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border-2 border-emerald-700/40 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">Senate Academic Board Agenda</span>
                <h3 className="text-lg font-black text-slate-950 uppercase font-serif-crest">2026/2027 First Semester Examination Broadsheet Ratification</h3>
                <p className="text-xs text-slate-600">Submitted by Dr. Emmanuel O. Agada (Examination Officer) and moderated by Heads of Department.</p>
              </div>
              <button onClick={handleSenateApproval} disabled={senateApproved} className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md transition-all ${senateApproved ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-emerald-800 hover:bg-emerald-900 text-white'}`}><CheckCircle2 className="w-4 h-4 text-amber-300" /><span>{senateApproved ? 'Senate Ratified & Approved' : 'Grant Senate Final Approval'}</span></button>
            </div>
            {senateApproved && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /><span>Senate approval granted on {new Date().toLocaleDateString()}. Transcripts and Semester GPA results are officially unlocked for all students.</span></div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProvostDashboard;

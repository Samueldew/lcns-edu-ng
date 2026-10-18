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

export const ProvostDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'cbt'>('overview');
  const students = StorageService.getStudents();
  const applicants = StorageService.getApplicants();
  const payments = StorageService.getPayments();
  const [senateApproved, setSenateApproved] = useState(false);

  // Calculate total revenue
  const totalRevenue = payments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);

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
      {/* Executive Welcome */}
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
              Executive Institutional Overview &bull; Labe College of Nursing Sciences, Gboko
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-emerald-300 font-semibold block">Academic Session</span>
            <span className="text-lg font-black text-amber-400 font-mono-code">{COLLEGE_CONFIG.CURRENT_SESSION}</span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs no-print">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'overview'
              ? 'bg-[#0a4d2e] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building className="w-4 h-4 text-emerald-400" />
          <span>Provost Institutional Overview &amp; Senate</span>
        </button>

        <button
          onClick={() => setActiveTab('cbt')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'cbt'
              ? 'bg-[#0a4d2e] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4 text-amber-400" />
          <span>Applicant CBT Screening Scores &amp; PDF</span>
        </button>
      </div>

      {activeTab === 'cbt' ? (
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
          {/* KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Total Enrolled</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{students.length + 415}</div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +14.2% from last session
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">2026/2027 Applicants</span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{applicants.length + 185}</div>
          <div className="text-[11px] text-blue-600 font-semibold">
            Merit List Quota: 85% Met
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Overall Exam Pass Rate</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-800">94.8%</div>
          <div className="text-[11px] text-emerald-600 font-semibold">
            NMCN Professional Standard Target
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Bursary Revenue (YTD)</span>
            <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₦{(totalRevenue + 72400000).toLocaleString()}
          </div>
          <div className="text-[11px] text-purple-600 font-semibold">
            Remita Verified Collections
          </div>
        </div>
      </div>

      {/* SENATE APPROVAL & RATIFICATION ACTION */}
      <div className="bg-white rounded-3xl border-2 border-emerald-700/40 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              Senate Academic Board Agenda
            </span>
            <h3 className="text-lg font-black text-slate-950 uppercase font-serif-crest">
              2026/2027 First Semester Examination Broadsheet Ratification
            </h3>
            <p className="text-xs text-slate-600">
              Submitted by Dr. Emmanuel O. Agada (Examination Officer) and moderated by Heads of Department.
            </p>
          </div>

          <button
            onClick={handleSenateApproval}
            disabled={senateApproved}
            className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md transition-all ${
              senateApproved
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-emerald-800 hover:bg-emerald-900 text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-amber-300" />
            <span>{senateApproved ? 'Senate Ratified & Approved' : 'Grant Senate Final Approval'}</span>
          </button>
        </div>

        {senateApproved && (
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Senate approval granted on {new Date().toLocaleDateString()}. Transcripts and Semester GPA results are officially unlocked for all students.
            </span>
          </div>
        )}
      </div>

      {/* COLLEGIATE CURRICULAR BREAKDOWN (4-YEAR ND/HND) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-sm uppercase">National Diploma (ND) Phase &bull; Years 1 &amp; 2</h4>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full">
              Non-Terminal Pre-Requisite
            </span>
          </div>
          <div className="text-xs text-slate-600 space-y-2">
            <div className="flex justify-between border-b pb-1">
              <span>ND 1 &amp; ND 2 Enrollment:</span>
              <strong className="text-slate-900">248 Students</strong>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>Clinical Simulation Ward Attendance:</span>
              <strong className="text-emerald-700">98.5%</strong>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>HND Progression Requirement:</span>
              <strong className="text-emerald-700">Minimum 2.50 CGPA (Lower Credit)</strong>
            </div>
            <div className="flex justify-between">
              <span>NBTE / NMCN Compliance:</span>
              <strong className="text-emerald-700">100% Accredited Curriculum</strong>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-sm uppercase">Higher National Diploma (HND) Phase &bull; Years 3 &amp; 4</h4>
            <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
              Advanced Clinical &amp; NYSC
            </span>
          </div>
          <div className="text-xs text-slate-600 space-y-2">
            <div className="flex justify-between border-b pb-1">
              <span>HND 1 &amp; HND 2 Enrollment:</span>
              <strong className="text-slate-900">172 Students</strong>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>Hospital Postings (General Hospital &amp; BSUTH):</span>
              <strong className="text-emerald-700">Active Rotations (ICU, Maternal, Community)</strong>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>Dual Professional Licenses:</span>
              <strong className="text-slate-900">RN &amp; RPHN (Nursing Council of Nigeria)</strong>
            </div>
            <div className="flex justify-between">
              <span>Graduation Status:</span>
              <strong className="text-emerald-700">Direct Mobilization for NYSC Call-Up</strong>
            </div>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
};

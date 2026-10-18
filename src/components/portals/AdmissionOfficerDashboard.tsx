import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { Applicant } from '../../types';
import {
  GraduationCap,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  FileCheck,
  Download,
  Filter,
  Sparkles,
  Award,
  ChevronDown,
} from 'lucide-react';

import { CBTExamManager } from '../cbt/CBTExamManager';

export const AdmissionOfficerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'admissions' | 'cbt'>('admissions');
  const [applicants, setApplicants] = useState<Applicant[]>(StorageService.getApplicants());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [screeningScoreInput, setScreeningScoreInput] = useState<number>(75);

  const filtered = applicants.filter((a) => {
    const matchesSearch =
      a.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.formNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.jambRegNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.program.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = (id: string, newStatus: Applicant['status']) => {
    const updated = applicants.map((a) => {
      if (a.id === id) {
        return {
          ...a,
          status: newStatus,
          screeningScore: a.screeningScore || screeningScoreInput,
        };
      }
      return a;
    });

    StorageService.saveApplicants(updated);
    setApplicants(updated);
    StorageService.logAction(
      'admission@lcns.edu.ng',
      'ADMISSION_OFFICER',
      'UPDATE_ADMISSION_STATUS',
      `Updated applicant ${id} status to ${newStatus}`
    );
  };

  const handleExportCSV = () => {
    const headers = ['FormNo', 'FullName', 'Email', 'Phone', 'Program', 'JambScore', 'Status', 'AcceptancePaid'];
    const rows = filtered.map((a) => [
      a.formNo,
      `"${a.fullName}"`,
      a.email,
      a.phone,
      `"${a.program}"`,
      a.jambScore,
      a.status,
      a.acceptanceFeePaid ? 'YES' : 'NO',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LCNS_Applicants_List_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const admittedCount = applicants.filter((a) => a.status === 'ADMITTED').length;
  const screenedCount = applicants.filter((a) => a.status === 'SCREENED').length;
  const bursarClearedCount = applicants.filter(
    (a) => a.status === 'BURSAR_CLEARED' || a.bursarStatus === 'CLEARED'
  ).length;
  const pendingBursarCount = applicants.filter(
    (a) => a.status === 'PENDING_BURSAR' || a.bursarStatus === 'PENDING_BURSAR'
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-emerald-800 px-3 py-1 rounded-full">
              Admissions Directorate &bull; Admissions Officer
            </span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase font-serif-crest mt-2">
              Mrs. Bridget N. Terfa
            </h1>
            <p className="text-xs text-emerald-200">
              Candidate Screening, Bursar Clearance Vetting, Merit List Compilation &amp; Quota Management
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl border border-emerald-600 shadow-md transition-all self-start sm:self-auto"
          >
            <Download className="w-4 h-4" />
            <span>Export Admissions Broadsheet (CSV)</span>
          </button>
        </div>

        {/* Counter cards */}
        <div className="mt-6 pt-6 border-t border-emerald-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-center">
          <div className="bg-emerald-950/70 p-3 rounded-2xl border border-emerald-800">
            <span className="text-emerald-300 block text-[10px] font-bold uppercase">Total Admitted</span>
            <span className="text-xl font-black text-amber-400 font-mono-code">{admittedCount} Candidates</span>
          </div>
          <div className="bg-emerald-950/70 p-3 rounded-2xl border border-emerald-800">
            <span className="text-emerald-300 block text-[10px] font-bold uppercase">Bursar Cleared</span>
            <span className="text-xl font-black text-[#22c55e] font-mono-code">{bursarClearedCount} Cleared</span>
          </div>
          <div className="bg-emerald-950/70 p-3 rounded-2xl border border-emerald-800">
            <span className="text-amber-300 block text-[10px] font-bold uppercase">Pending Bursar Audit</span>
            <span className="text-xl font-black text-amber-300 font-mono-code">{pendingBursarCount} Pending</span>
          </div>
          <div className="bg-emerald-950/70 p-3 rounded-2xl border border-emerald-800">
            <span className="text-blue-300 block text-[10px] font-bold uppercase">Screened / Vetted</span>
            <span className="text-xl font-black text-white font-mono-code">{screenedCount} Candidates</span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs no-print">
        <button
          onClick={() => setActiveTab('admissions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'admissions'
              ? 'bg-[#0a4d2e] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-emerald-400" />
          <span>Candidate Vetting &amp; Admissions List</span>
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
          <span>Applicant CBT Screening Scores &amp; Result PDF</span>
        </button>
      </div>

      {activeTab === 'cbt' ? (
        <CBTExamManager
          currentUser={{
            id: 'LCNS/2026/AO/001',
            email: 'admission@lcns.edu.ng',
            role: 'ADMISSION_OFFICER',
            fullName: 'Mrs. Bridget N. Terfa',
            status: 'ACTIVE',
          }}
          allowedTypes={['APPLICANT_SCREENING']}
        />
      ) : (
        <>
          {/* FILTER BAR & SEARCH */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search candidate by Form No, Name, JAMB..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="BURSAR_CLEARED">Bursar Cleared (Ready for Admission)</option>
              <option value="PENDING_BURSAR">Pending Bursar Audit</option>
              <option value="SUBMITTED">Pending Screening (SUBMITTED)</option>
              <option value="SCREENED">Screened (Under Review)</option>
              <option value="ADMITTED">Admitted (Provisional Offer)</option>
              <option value="REJECTED">Declined / Ineligible</option>
            </select>
          </div>
        </div>

        {/* APPLICANTS TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3">Form Number</th>
                <th className="p-3">Candidate Full Name</th>
                <th className="p-3">Programme / Choices</th>
                <th className="p-3">JAMB UTME</th>
                <th className="p-3">Bursary Status</th>
                <th className="p-3">Admission Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((a) => {
                const isBursarCleared =
                  a.status === 'BURSAR_CLEARED' ||
                  a.status === 'ADMITTED' ||
                  a.bursarStatus === 'CLEARED';

                return (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono-code font-bold text-emerald-900">{a.formNo}</td>
                    <td className="p-3 font-bold text-slate-900 uppercase">
                      {a.fullName}
                      <span className="block text-[10px] text-slate-500 font-normal">{a.email} &bull; {a.phone}</span>
                    </td>
                    <td className="p-3 font-semibold text-slate-700">
                      <div>{a.courseChoice1 || a.program}</div>
                      {a.courseChoice2 && (
                        <div className="text-[10px] text-slate-400">2nd: {a.courseChoice2}</div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-slate-900">{a.jambScore}</span>
                      <span className="block text-[10px] text-slate-500 font-mono-code">{a.jambRegNo}</span>
                    </td>
                    <td className="p-3">
                      {isBursarCleared ? (
                        <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-[#22c55e]" /> Cleared
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-700" /> Pending Audit
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {a.status === 'ADMITTED' && (
                        <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Admitted
                        </span>
                      )}
                      {a.status === 'BURSAR_CLEARED' && (
                        <span className="bg-teal-100 text-teal-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
                          <Sparkles className="w-3 h-3 text-teal-600" /> Cleared (Awaiting Offer)
                        </span>
                      )}
                      {a.status === 'PENDING_BURSAR' && (
                        <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3 text-amber-600" /> Awaiting Bursar
                        </span>
                      )}
                      {a.status === 'SCREENED' && (
                        <span className="bg-blue-100 text-blue-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3 text-blue-600" /> Screened ({a.screeningScore || 75}%)
                        </span>
                      )}
                      {a.status === 'SUBMITTED' && (
                        <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3 text-slate-600" /> Submitted
                        </span>
                      )}
                      {a.status === 'REJECTED' && (
                        <span className="bg-red-100 text-red-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
                          <XCircle className="w-3 h-3 text-red-600" /> Declined
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {a.status !== 'ADMITTED' && (
                          <button
                            onClick={() => handleUpdateStatus(a.id, 'ADMITTED')}
                            className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-[11px] font-bold shadow-xs"
                            title="Grant provisional admission offer"
                          >
                            Admit
                          </button>
                        )}
                        {(a.status === 'BURSAR_CLEARED' || a.status === 'SUBMITTED') && (
                          <button
                            onClick={() => handleUpdateStatus(a.id, 'SCREENED')}
                            className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-[11px] font-bold"
                            title="Mark screened"
                          >
                            Screen
                          </button>
                        )}
                        {a.status !== 'REJECTED' && (
                          <button
                            onClick={() => handleUpdateStatus(a.id, 'REJECTED')}
                            className="px-2 py-1 text-red-600 hover:bg-red-50 rounded-lg text-[11px] font-bold"
                            title="Reject application"
                          >
                            Decline
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}
    </div>
  );
};

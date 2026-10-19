import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import { Applicant } from '../../types';
import { getSupabase } from '../../lib/supabase';
import { CollegeLogo } from '../common/CollegeLogo';
import {
  GraduationCap,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  Award,
  Filter,
  Check,
  X,
  FileText,
  Sparkles,
  Printer,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

export const AdmissionProcessingView: React.FC = () => {
  const [applicants, setApplicants] = useState<Applicant[]>(StorageService.getApplicants());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleStorageUpdate = () => {
      setApplicants(StorageService.getApplicants());
    };
    window.addEventListener('lcns_storage_update', handleStorageUpdate);
    return () => window.removeEventListener('lcns_storage_update', handleStorageUpdate);
  }, []);

  const handleUpdateStatus = async (
    applicantId: string,
    newStatus: 'ADMISSION_IN_PROGRESS' | 'ADMITTED' | 'NOT ADMITTED'
  ) => {
    setProcessingId(applicantId);
    const updated = applicants.map((a) => {
      if (a.id === applicantId || a.formNo === applicantId) {
        return {
          ...a,
          status: newStatus as Applicant['status'],
        };
      }
      return a;
    });

    StorageService.saveApplicants(updated);
    setApplicants(updated);

    // Sync to Supabase applications
    try {
      const sb = getSupabase();
      if (sb) {
        const target = updated.find((a) => a.id === applicantId || a.formNo === applicantId);
        if (target) {
          await sb
            .from('applications')
            .update({ status: newStatus })
            .eq('form_no', target.formNo);
        }
      }
    } catch (err) {
      console.warn('Supabase sync error on admission status update:', err);
    }

    setToastMsg(`Status for candidate ${applicantId} set to: ${newStatus.replace('_', ' ')}`);
    setTimeout(() => setToastMsg(null), 3500);
    setProcessingId(null);
  };

  // Filter to show all or BURSAR_CLEARED applicants
  const filteredApplicants = applicants.filter((a) => {
    const matchesSearch =
      a.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.formNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.examNumber && a.examNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (a.exam_number && a.exam_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      a.jambRegNo.toLowerCase().includes(searchTerm.toLowerCase());

    const isCleared =
      a.bursar_cleared ||
      a.bursarCleared ||
      a.bursarStatus === 'CLEARED' ||
      a.status === 'BURSAR_CLEARED' ||
      a.status === 'ADMISSION_IN_PROGRESS' ||
      a.status === 'ADMITTED' ||
      a.status === 'NOT ADMITTED';

    if (statusFilter === 'BURSAR_CLEARED') {
      return matchesSearch && a.status === 'BURSAR_CLEARED';
    } else if (statusFilter === 'ADMISSION_IN_PROGRESS') {
      return matchesSearch && a.status === 'ADMISSION_IN_PROGRESS';
    } else if (statusFilter === 'ADMITTED') {
      return matchesSearch && a.status === 'ADMITTED';
    } else if (statusFilter === 'NOT ADMITTED') {
      return matchesSearch && a.status === 'NOT ADMITTED';
    }

    // Default: show all cleared candidates
    return matchesSearch && isCleared;
  });

  const bursarClearedTotal = applicants.filter(
    (a) => a.status === 'BURSAR_CLEARED' || a.bursarStatus === 'CLEARED'
  ).length;
  const inProgressTotal = applicants.filter((a) => a.status === 'ADMISSION_IN_PROGRESS').length;
  const admittedTotal = applicants.filter((a) => a.status === 'ADMITTED').length;
  const notAdmittedTotal = applicants.filter((a) => a.status === 'NOT ADMITTED').length;

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0a4d2e] text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-[#0a4d2e] to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-emerald-800 px-3 py-1 rounded-full">
              Academic Registry &bull; Admissions Committee Broadsheet (/admissions)
            </span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase font-serif-crest mt-2">
              Admission Processing &amp; Offer Ratification
            </h1>
            <p className="text-xs text-emerald-200">
              Registrar, Provost &amp; Admission Officer Executive Panel &bull; Review BURSAR_CLEARED applicants and set final admission decisions.
            </p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1.5 bg-amber-400 text-slate-950 font-black text-xs rounded-xl uppercase tracking-wider">
              2026/2027 Session
            </span>
          </div>
        </div>

        {/* 4 Counter Summary Cards */}
        <div className="mt-6 pt-6 border-t border-emerald-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-emerald-950/70 p-3 rounded-2xl border border-emerald-800">
            <span className="text-emerald-300 block text-[10px] font-bold uppercase">Bursar Cleared</span>
            <span className="text-xl font-black text-[#22c55e] font-mono-code">{bursarClearedTotal}</span>
          </div>
          <div className="bg-emerald-950/70 p-3 rounded-2xl border border-emerald-800">
            <span className="text-amber-300 block text-[10px] font-bold uppercase">In Progress</span>
            <span className="text-xl font-black text-amber-300 font-mono-code">{inProgressTotal}</span>
          </div>
          <div className="bg-emerald-950/70 p-3 rounded-2xl border border-emerald-800">
            <span className="text-amber-300 block text-[10px] font-bold uppercase">Admitted Offers</span>
            <span className="text-xl font-black text-amber-400 font-mono-code">{admittedTotal}</span>
          </div>
          <div className="bg-emerald-950/70 p-3 rounded-2xl border border-emerald-800">
            <span className="text-red-300 block text-[10px] font-bold uppercase">Not Admitted</span>
            <span className="text-xl font-black text-red-300 font-mono-code">{notAdmittedTotal}</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search candidate by name, form no, exam no..."
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0a4d2e] text-slate-900"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="ALL">All Cleared Candidates</option>
              <option value="BURSAR_CLEARED">Awaiting Committee (BURSAR_CLEARED)</option>
              <option value="ADMISSION_IN_PROGRESS">In Progress (ADMISSION_IN_PROGRESS)</option>
              <option value="ADMITTED">Offered Admission (ADMITTED)</option>
              <option value="NOT ADMITTED">Not Admitted (NOT ADMITTED)</option>
            </select>
          </div>
        </div>

        {/* Applicants Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">Candidate Details</th>
                <th className="p-3.5">Exam Number</th>
                <th className="p-3.5">Programme</th>
                <th className="p-3.5">JAMB / O-Level</th>
                <th className="p-3.5">Current Status</th>
                <th className="p-3.5 text-right">Admission Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApplicants.length > 0 ? (
                filteredApplicants.map((app) => {
                  const isCurrentAdmitted = app.status === 'ADMITTED';
                  const isCurrentInProgress = app.status === 'ADMISSION_IN_PROGRESS';
                  const isCurrentNotAdmitted = app.status === 'NOT ADMITTED';

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & Form */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 uppercase">{app.fullName}</div>
                        <div className="font-mono text-emerald-800 text-[11px] font-semibold">{app.formNo}</div>
                        <div className="text-[10px] text-slate-400">{app.stateOfOrigin} State &bull; {app.email}</div>
                      </td>

                      {/* Exam Number */}
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-[#0a4d2e] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                          {app.exam_number || app.examNumber || 'LCNS/EXAM/2025/001'}
                        </span>
                      </td>

                      {/* Programme */}
                      <td className="p-3.5">
                        <span className="font-semibold text-slate-800 block">{app.program}</span>
                        <span className="text-[10px] text-slate-500">Choice 1: {app.courseChoice1 || 'ND Nursing'}</span>
                      </td>

                      {/* JAMB & O-Level */}
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900">{app.jambScore} pts</span>
                        <span className="text-[10px] text-slate-500 block font-mono">{app.jambRegNo}</span>
                      </td>

                      {/* Current Status Pill */}
                      <td className="p-3.5">
                        {isCurrentAdmitted && (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-950 font-bold rounded-full text-[10px] uppercase flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>ADMITTED</span>
                          </span>
                        )}
                        {isCurrentInProgress && (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-950 font-bold rounded-full text-[10px] uppercase flex items-center gap-1 w-fit border border-amber-300">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>IN PROGRESS</span>
                          </span>
                        )}
                        {isCurrentNotAdmitted && (
                          <span className="px-2.5 py-1 bg-red-100 text-red-950 font-bold rounded-full text-[10px] uppercase flex items-center gap-1 w-fit">
                            <XCircle className="w-3.5 h-3.5 text-red-600" />
                            <span>NOT ADMITTED</span>
                          </span>
                        )}
                        {app.status === 'BURSAR_CLEARED' && (
                          <span className="px-2.5 py-1 bg-emerald-100 text-[#0a4d2e] font-bold rounded-full text-[10px] uppercase flex items-center gap-1 w-fit border border-emerald-300">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#16a34a]" />
                            <span>BURSAR CLEARED</span>
                          </span>
                        )}
                      </td>

                      {/* Admission Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Set IN PROGRESS */}
                          {!isCurrentInProgress && !isCurrentAdmitted && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(app.id, 'ADMISSION_IN_PROGRESS')}
                              disabled={processingId === app.id}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-bold transition-colors"
                              title="Set status to ADMISSION_IN_PROGRESS"
                            >
                              In Progress
                            </button>
                          )}

                          {/* Set ADMITTED */}
                          {!isCurrentAdmitted && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(app.id, 'ADMITTED')}
                              disabled={processingId === app.id}
                              className="px-3 py-1 bg-[#0a4d2e] hover:bg-[#073822] text-white rounded-lg text-[11px] font-bold shadow-xs transition-all flex items-center gap-1"
                              title="Admit candidate"
                            >
                              <Check className="w-3.5 h-3.5 text-emerald-300" />
                              <span>ADMIT</span>
                            </button>
                          )}

                          {/* Set NOT ADMITTED */}
                          {!isCurrentNotAdmitted && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(app.id, 'NOT ADMITTED')}
                              disabled={processingId === app.id}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1"
                              title="Decline admission"
                            >
                              <X className="w-3.5 h-3.5 text-red-700" />
                              <span>NOT ADMITTED</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    <p className="font-bold text-slate-700">No applicants match the current filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

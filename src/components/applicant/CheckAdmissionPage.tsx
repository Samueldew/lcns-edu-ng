import React, { useState, useEffect } from 'react';
import { CollegeLogo } from '../common/CollegeLogo';
import { Applicant } from '../../types';
import { StorageService } from '../../services/storage';
import { getSupabase } from '../../lib/supabase';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileText,
  CreditCard,
  Award,
  Hash,
} from 'lucide-react';

interface CheckAdmissionPageProps {
  onOpenLogin?: () => void;
  onOpenApplication?: () => void;
}

export const CheckAdmissionPage: React.FC<CheckAdmissionPageProps> = ({
  onOpenLogin,
  onOpenApplication,
}) => {
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const formNo = params.get('app_no') || params.get('form_no');
    if (formNo) {
      setQuery(formNo);
      handleSearch(formNo);
    }
  }, []);

  const handleSearch = async (searchVal: string = query) => {
    const clean = searchVal.trim().toLowerCase();
    if (!clean) return;

    setLoading(true);
    setSearched(true);

    // First search in local storage
    const applicants = StorageService.getApplicants();
    let found = applicants.find(
      (a) =>
        a.formNo.toLowerCase() === clean ||
        a.email.toLowerCase() === clean ||
        (a.examNumber && a.examNumber.toLowerCase() === clean) ||
        (a.exam_number && a.exam_number.toLowerCase() === clean) ||
        a.jambRegNo.toLowerCase() === clean
    );

    // If not found or to ensure latest bursar clearance from Supabase
    try {
      const sb = getSupabase();
      if (sb) {
        const { data } = await sb
          .from('applications')
          .select('*')
          .or(`form_no.ilike.%${clean}%,exam_number.ilike.%${clean}%,email.ilike.%${clean}%`)
          .limit(1);

        if (data && data.length > 0) {
          const row = data[0];
          if (found) {
            found = {
              ...found,
              bursar_cleared: row.bursar_cleared ?? found.bursar_cleared,
              bursarCleared: row.bursar_cleared ?? found.bursarCleared,
              exam_number: row.exam_number || found.exam_number,
              examNumber: row.exam_number || found.examNumber,
              status: row.status || found.status,
            };
          }
        }
      }
    } catch (err) {
      console.warn('Supabase lookup warning:', err);
    }

    setApplicant(found || null);
    setLoading(false);
  };

  const isBursarCleared = Boolean(
    applicant &&
      (applicant.bursar_cleared ||
        applicant.bursarCleared ||
        applicant.bursarStatus === 'CLEARED' ||
        applicant.status === 'BURSAR_CLEARED' ||
        applicant.status === 'ADMITTED')
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-emerald-950 via-[#0a4d2e] to-emerald-950 text-white rounded-3xl p-8 shadow-2xl border border-emerald-800 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-10 -translate-y-10 w-48 h-48 bg-emerald-700/20 rounded-full blur-3xl pointer-events-none" />
          <div className="flex justify-center mb-3">
            <CollegeLogo size="lg" />
          </div>
          <span className="inline-block px-3 py-1 bg-amber-400 text-emerald-950 text-xs font-black uppercase tracking-wider rounded-full mb-2">
            Admissions &amp; Screening Portal
          </span>
          <h1 className="text-2xl sm:text-4xl font-black uppercase font-serif-crest tracking-tight">
            Check Admission &amp; Screening Status
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200 mt-2 max-w-2xl mx-auto">
            Labe College of Nursing Sciences, Gboko &bull; 2026/2027 Academic Session.
            Verify Bursary clearance, check your assigned Examination Number, and take the CBT Attitude Test.
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-slate-200 space-y-4">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            Enter Application Number / JAMB Reg No / Email
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. LCNS/APP/2026/014 or LCNS/APP/2026/102"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#0a4d2e] focus:bg-white text-slate-900 transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              className="px-6 py-3 bg-[#0a4d2e] hover:bg-[#073822] text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4 text-emerald-300" />
              <span>{loading ? 'Checking...' : 'Check Status'}</span>
            </button>
          </div>
          {/* SAMPLE CANDIDATES REMOVED - Clean production checker */}
        </div>

        {/* Results Section */}
        {searched && (
          <div>
            {applicant ? (
              <div className="space-y-6">
                {/* Candidate Overview Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                        Candidate Profile
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase font-serif-crest mt-2">
                        {applicant.fullName}
                      </h2>
                      <p className="text-xs text-slate-600">
                        Application Form No: <strong className="font-mono text-slate-900">{applicant.formNo}</strong> &bull; JAMB Reg: <strong>{applicant.jambRegNo}</strong> ({applicant.jambScore} pts)
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-xs text-slate-500 font-semibold block">Programme Applied:</span>
                      <span className="text-sm font-bold text-[#0a4d2e]">{applicant.program}</span>
                    </div>
                  </div>

                  {/* BURSAR STATUS LOGIC */}
                  {isBursarCleared ? (
                    <div className="space-y-5">
                      {/* Cleared & Exam Number Notification */}
                      <div className="p-6 bg-emerald-50 border-2 border-emerald-500 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2.5 text-emerald-950 font-bold text-base">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                            <span className="uppercase tracking-wide font-black">
                              Bursar Cleared &bull; Official Examination Number Assigned
                            </span>
                          </div>
                          <span className="px-3 py-1 bg-emerald-200 text-emerald-900 rounded-full text-xs font-black uppercase">
                            Eligible for CBT
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
                          Your screening fee payment has been officially audited and cleared by the College Bursar on{' '}
                          <strong>{applicant.bursarClearedDate || applicant.bursar_clearance_date?.substring(0, 10) || new Date().toISOString().split('T')[0]}</strong>.
                          You are eligible to sit for the online CBT Attitude Test.
                        </p>

                        {/* Exam Number Hero Box */}
                        <div className="bg-white p-4 rounded-xl border border-emerald-300 shadow-xs flex items-center justify-between flex-wrap gap-3">
                          <div>
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                              Your Assigned Examination Number
                            </span>
                            <span className="text-xl sm:text-2xl font-black font-mono text-[#0a4d2e]">
                              {applicant.exam_number || applicant.examNumber || 'LCNS/EXAM/2025/001'}
                            </span>
                          </div>
                          <button
                            onClick={() => window.print()}
                            className="px-4 py-2 bg-[#0a4d2e] hover:bg-[#073822] text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2"
                          >
                            <Printer className="w-4 h-4 text-amber-300" />
                            <span>Print Clearance Slip</span>
                          </button>
                        </div>
                      </div>

                      {/* CBT Attitude Test Card */}
                      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-700 space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-amber-500 text-slate-950 rounded-2xl font-black shadow-md">
                              <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="text-lg font-black uppercase tracking-wide">
                                CBT Attitude Test
                              </h3>
                              <p className="text-xs text-emerald-300">
                                Standard Attitude &amp; Clinical Aptitude Screening &bull; 30 Minutes
                              </p>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-emerald-600/60 border border-emerald-400 text-emerald-200 rounded-full text-xs font-bold uppercase tracking-wider">
                            Active Test
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                          Your examination profile is active. You may now start your 30-minute timed CBT Attitude Test session. Your responses and score will be automatically saved to your admissions file.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                          <a
                            href={`/applicant/cbt/test-attitude-01?app_no=${encodeURIComponent(applicant.formNo)}`}
                            className="flex-1 py-3.5 px-6 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all text-center flex items-center justify-center gap-2"
                          >
                            <span>Launch CBT Attitude Test</span>
                            <ArrowRight className="w-4 h-4" />
                          </a>

                          <a
                            href={`/applicant/dashboard?app_no=${encodeURIComponent(applicant.formNo)}`}
                            className="py-3.5 px-6 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-2xl border border-white/20 transition-all text-center flex items-center justify-center gap-2"
                          >
                            <span>Open Candidate Dashboard</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* NOT CLEARED */
                    <div className="p-6 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-4">
                      <div className="flex items-center gap-2.5 text-amber-950 font-bold text-base">
                        <Clock className="w-6 h-6 text-amber-700" />
                        <span className="uppercase tracking-wide font-black">
                          Awaiting Bursar Clearance - Pay Screening Fee
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                        Candidate <strong>{applicant.fullName}</strong> ({applicant.formNo}) is currently awaiting bursary clearance.
                        In accordance with College Academic Board regulations, <strong>Examination Numbers are only generated and CBT examination unlocked after screening fee verification</strong>.
                      </p>

                      <div className="bg-white p-4 rounded-xl border border-amber-200 space-y-2 text-xs text-slate-700">
                        <div className="font-bold text-slate-900 uppercase">Screening Fee Payment Instructions:</div>
                        <div>&bull; Amount: <strong>₦15,000 (Non-Refundable Screening &amp; CBT Processing Fee)</strong></div>
                        <div>&bull; Bank: <strong>Zenith Bank PLC / First Bank of Nigeria</strong></div>
                        <div>&bull; Account Name: <strong>Labe College of Nursing Sciences, Gboko</strong></div>
                        <div>&bull; Account No: <strong>1018894231</strong></div>
                        <div>&bull; Or Pay via Remita RRR on College Portal</div>
                      </div>

                      <div className="flex items-center gap-3 pt-2 flex-wrap">
                        <a
                          href={`/applicant/dashboard?app_no=${encodeURIComponent(applicant.formNo)}`}
                          className="px-5 py-2.5 bg-[#0a4d2e] hover:bg-[#073822] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                        >
                          <span>Go to Applicant Dashboard</span>
                          <ArrowRight className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 text-center text-slate-500 space-y-3 shadow-md border border-slate-200">
                <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No applicant record found for "{query}"</h3>
                <p className="text-xs max-w-md mx-auto text-slate-600">
                  Please verify that you entered your complete Application Form Number (e.g. <code>LCNS/APP/2026/014</code>) or Registered Email Address.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

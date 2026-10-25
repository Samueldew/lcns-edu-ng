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
    const cleanRaw = searchVal.trim();
    const clean = cleanRaw.toLowerCase();
    if (!clean) return;

    setLoading(true);
    setSearched(true);

    const applicants = StorageService.getApplicants();
    let found = applicants.find(
      (a) =>
        a.formNo.toLowerCase() === clean ||
        a.email.toLowerCase() === clean ||
        (a.examNumber && a.examNumber.toLowerCase() === clean) ||
        (a.exam_number && a.exam_number.toLowerCase() === clean) ||
        a.jambRegNo.toLowerCase() === clean
    );

    try {
      const sb = getSupabase();
      if (sb) {
        let { data } = await sb
          .from('college_applications')
          .select('*')
          .ilike('form_no', `%${cleanRaw}%`)
          .limit(1);

        if ((!data || data.length === 0) && cleanRaw) {
          const all = await sb.from('college_applications').select('*').order('created_at', { ascending: false }).limit(50);
          if (all.data) {
            const matched = all.data.find((row: any) => {
              const form = (row.form_no || '').toLowerCase();
              const email = (row.full_application?.email || row.bio_data?.email || '').toLowerCase();
              const name = (row.full_application?.fullName || row.bio_data?.fullName || '').toLowerCase();
              const jamb = (row.jamb_reg_no || '').toLowerCase();
              return form.includes(clean) || email.includes(clean) || name.includes(clean) || jamb.includes(clean);
            });
            if (matched) {
              data = [matched];
            }
          }
        }

        if (data && data.length > 0) {
          const row = data[0];
          const mapped: any = {
            id: row.id,
            formNo: row.form_no,
            form_no: row.form_no,
            fullName: row.full_application?.fullName || row.bio_data?.fullName || 'Applicant',
            email: row.full_application?.email || row.bio_data?.email || '',
            phone: row.full_application?.phone || row.bio_data?.phone || '',
            program: row.program || 'ND/HND Nursing Sciences',
            jambRegNo: row.jamb_reg_no || row.full_application?.jambRegNo || '',
            jambScore: row.jamb_score || row.full_application?.jambScore || '',
            status: row.status || 'PENDING_BURSAR',
            bursarStatus: row.payment_status || row.status || 'PENDING_BURSAR',
            bursar_cleared: row.status === 'APPROVED' || row.payment_status === 'PAID' || row.status === 'BURSAR_CLEARED' || row.status === 'ADMITTED',
            bursarCleared: row.status === 'APPROVED' || row.payment_status === 'PAID',
            bursarClearedDate: row.updated_at || row.created_at,
            exam_number: row.exam_number || row.full_application?.examNumber || row.form_no,
            examNumber: row.exam_number || row.form_no,
            photo_url: row.photo_url || row.full_application?.passportPhotoUrl,
            created_at: row.created_at,
            full_application: row.full_application,
          };

          if (found) {
            found = { ...found, ...mapped } as any;
          } else {
            found = mapped as any;
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
        applicant.status === 'ADMITTED' ||
        applicant.status === 'APPROVED' ||
        (applicant as any).payment_status === 'PAID')
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-gradient-to-r from-emerald-950 via-[#0a4d2e] to-emerald-950 text-white rounded-3xl p-8 shadow-2xl border border-emerald-800 text-center relative overflow-hidden">
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
            Labe College of Nursing Sciences, Gboko • 2026/2027 Academic Session.
          </p>
        </div>

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
                placeholder="Enter your Application Form No"
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
        </div>

        {searched && (
          <div>
            {applicant ? (
              <div className="space-y-6">
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
                        Application Form No: <strong className="font-mono text-slate-900">{applicant.formNo}</strong> • JAMB Reg: <strong>{applicant.jambRegNo}</strong> ({applicant.jambScore} pts)
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-xs text-slate-500 font-semibold block">Programme Applied:</span>
                      <span className="text-sm font-bold text-[#0a4d2e]">{applicant.program}</span>
                    </div>
                  </div>

                  {isBursarCleared ? (
                    <div className="space-y-5">
                      <div className="p-6 bg-emerald-50 border-2 border-emerald-500 rounded-2xl space-y-4">
                        <div className="flex items-center gap-2.5 text-emerald-950 font-bold text-base">
                          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                          <span className="uppercase tracking-wide font-black">
                            Bursar Cleared • Official Examination Number Assigned
                          </span>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-emerald-300 flex items-center justify-between flex-wrap gap-3">
                          <div>
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                              Your Assigned Examination Number
                            </span>
                            <span className="text-xl sm:text-2xl font-black font-mono text-[#0a4d2e]">
                              {applicant.exam_number || applicant.examNumber}
                            </span>
                          </div>
                          <button onClick={() => window.print()} className="px-4 py-2 bg-[#0a4d2e] text-white rounded-xl text-xs font-bold flex items-center gap-2">
                            <Printer className="w-4 h-4 text-amber-300" />
                            <span>Print Clearance Slip</span>
                          </button>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-700 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-amber-500 text-slate-950 rounded-2xl font-black">
                            <Sparkles className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-lg font-black uppercase tracking-wide">CBT Attitude Test</h3>
                            <p className="text-xs text-emerald-300">Standard Attitude & Clinical Aptitude Screening • 30 Minutes</p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                          <a href={`/applicant/cbt/test-attitude-01?app_no=${encodeURIComponent(applicant.formNo)}`} className="flex-1 py-3.5 px-6 bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl text-center flex items-center justify-center gap-2">
                            <span>Launch CBT Attitude Test</span>
                            <ArrowRight className="w-4 h-4" />
                          </a>
                          <a href={`/applicant/dashboard?app_no=${encodeURIComponent(applicant.formNo)}`} className="py-3.5 px-6 bg-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-2xl border border-white/20 text-center">
                            <span>Open Candidate Dashboard</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-4">
                      <div className="flex items-center gap-2.5 text-amber-950 font-bold text-base">
                        <Clock className="w-6 h-6 text-amber-700" />
                        <span className="uppercase tracking-wide font-black">Awaiting Bursar Clearance</span>
                      </div>
                      <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                        Candidate <strong>{applicant.fullName}</strong> is currently awaiting bursary clearance. Examination Number will be generated after screening fee verification.
                      </p>
                      <div className="bg-white p-4 rounded-xl border border-amber-200 space-y-2 text-xs text-slate-700">
                        <div className="font-bold text-slate-900 uppercase">Screening Fee Payment Instructions:</div>
                        <div>• Amount: <strong>₦15,000 (Non-Refundable)</strong></div>
                        <div>• Bank: <strong>Zenith Bank PLC / First Bank</strong></div>
                        <div>• Account Name: <strong>Labe College of Nursing Sciences, Gboko</strong></div>
                        <div>• Account No: <strong>1018894231</strong></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 text-center text-slate-500 space-y-3 shadow-md border border-slate-200">
                <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No applicant record found</h3>
                <p className="text-xs max-w-md mx-auto text-slate-600">
                  Please verify that you entered your correct Application Form Number or Registered Email Address.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

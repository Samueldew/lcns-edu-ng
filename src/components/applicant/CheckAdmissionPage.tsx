import React, { useState, useEffect } from 'react';
import { CollegeLogo } from '../common/CollegeLogo';
import { Applicant } from '../../types';
import { StorageService } from '../../services/storage';
import { getSupabase } from '../../lib/supabase';
import { Search, CheckCircle2, AlertCircle, Clock, Printer, Sparkles, ArrowRight } from 'lucide-react';

interface CheckAdmissionPageProps {
  onOpenLogin?: () => void;
  onOpenApplication?: () => void;
}

export const CheckAdmissionPage: React.FC<CheckAdmissionPageProps> = ({ onOpenLogin, onOpenApplication }) => {
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
    if (!cleanRaw) return;
    setLoading(true);
    setSearched(true);
    let found: any = null;

    const applicants = StorageService.getApplicants();
    found = applicants.find((a) => a.formNo.toLowerCase() === cleanRaw.toLowerCase());

    try {
      const sb = getSupabase();
      if (sb) {
        const { data: lcnsData } = await sb
          .from('lcns_applicants')
          .select('*')
          .ilike('application_number', `%${cleanRaw}%`)
          .limit(1);

        if (lcnsData && lcnsData.length > 0) {
          const row = lcnsData[0];
          found = {
            id: row.id,
            formNo: row.application_number,
            fullName: row.full_name,
            email: row.email || '',
            phone: row.phone || '',
            program: row.course || 'ND/HND Nursing Sciences',
            jambRegNo: row.jamb_reg || '',
            jambScore: row.jamb_score || '',
            status: 'APPROVED',
            bursar_cleared: true,
            bursarCleared: true,
            bursarStatus: 'CLEARED',
            exam_number: row.exam_no,
            examNumber: row.exam_no,
            photo_url: row.photo_url,
            application_number: row.application_number,
          };
        }
      }
    } catch (err) {
      console.warn(err);
    }

    setApplicant(found || null);
    setLoading(false);
  };

  const isBursarCleared = Boolean(applicant && (applicant as any).bursar_cleared);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-gradient-to-r from-emerald-950 via-[#0a4d2e] to-emerald-950 text-white rounded-3xl p-8 shadow-2xl border border-emerald-800 text-center">
          <div className="flex justify-center mb-3"><CollegeLogo size="lg" /></div>
          <span className="inline-block px-3 py-1 bg-amber-400 text-emerald-950 text-xs font-black uppercase tracking-wider rounded-full mb-2">Admissions & Screening Portal</span>
          <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">Check Admission & Screening Status</h1>
          <p className="text-xs sm:text-sm text-emerald-200 mt-2">Labe College of Nursing Sciences, Gboko • 2026/2027 Academic Session.</p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-slate-200 space-y-4">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">Enter Application Number / JAMB Reg No / Email</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. LCNS/2026/8342" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#0a4d2e] focus:bg-white text-slate-900" onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
            </div>
            <button onClick={() => handleSearch()} disabled={loading} className="px-6 py-3 bg-[#0a4d2e] text-white rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2">
              <Search className="w-4 h-4 text-emerald-300" /><span>{loading ? 'Checking...' : 'Check Status'}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500">Example: LCNS/2026/8342</p>
        </div>

        {searched && (
          <div>
            {applicant ? (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-slate-200 space-y-4">
                <div className="flex gap-4 border-b border-slate-100 pb-4">
                  {applicant.photo_url && <img src={applicant.photo_url} alt="passport" className="w-20 h-24 object-cover rounded-xl border-2 border-emerald-600" />}
                  <div>
                    <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">Candidate Profile</span>
                    <h2 className="text-xl font-black text-slate-900 uppercase mt-2">{applicant.fullName}</h2>
                    <p className="text-xs text-slate-600">Form No: <strong className="font-mono text-slate-900">{applicant.formNo}</strong> • Exam: <strong>{applicant.exam_number || applicant.examNumber}</strong></p>
                    <p className="text-sm font-bold text-[#0a4d2e] mt-1">{applicant.program}</p>
                  </div>
                </div>
                <div className="p-6 bg-emerald-50 border-2 border-emerald-500 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2.5 text-emerald-950 font-bold text-base"><CheckCircle2 className="w-6 h-6 text-emerald-600" /><span className="uppercase font-black">Application Received • Exam Number Assigned</span></div>
                  <div className="bg-white p-4 rounded-xl border border-emerald-300 flex items-center justify-between flex-wrap gap-3">
                    <div><span className="text-[11px] font-bold text-slate-500 uppercase block">Your Assigned Examination Number</span><span className="text-xl font-black font-mono text-[#0a4d2e]">{applicant.exam_number || applicant.examNumber}</span></div>
                    <a href={`/print/${applicant.id}`} className="px-4 py-2 bg-[#0a4d2e] text-white rounded-xl text-xs font-bold flex items-center gap-2"><Printer className="w-4 h-4 text-amber-300" /><span>Print Slip</span></a>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-emerald-700">
                  <div className="flex items-center gap-3"><div className="p-2.5 bg-amber-500 text-slate-950 rounded-2xl"><Sparkles className="w-6 h-6" /></div><div><h3 className="text-lg font-black uppercase">CBT Attitude Test</h3><p className="text-xs text-emerald-300">30 Minutes Screening</p></div></div>
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <a href={`/applicant/dashboard?app_no=${encodeURIComponent(applicant.formNo)}`} className="flex-1 py-3.5 px-6 bg-amber-400 text-slate-950 font-black text-xs uppercase rounded-2xl text-center flex items-center justify-center gap-2"><span>Open Candidate Dashboard</span><ArrowRight className="w-4 h-4" /></a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 text-center shadow-md border border-slate-200">
                <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" /><h3 className="text-base font-bold text-slate-800 mt-2">No record found for {query}</h3>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

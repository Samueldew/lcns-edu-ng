import React, { useState, useEffect } from 'react';
import { CollegeLogo } from '../common/CollegeLogo';
import { Applicant, COLLEGE_CONFIG } from '../../types';
import { StorageService } from '../../services/storage';
import { createClient } from '@supabase/supabase-js';
import {
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  CreditCard,
  Sparkles,
  FileText,
  UserCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const getSupabase = () => {
  if (!supabaseUrl || !supabaseAnonKey) return null as any;
  return createClient(supabaseUrl, supabaseAnonKey);
};

interface AdmissionCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFormNo?: string;
  onOpenLogin: () => void;
}

export const AdmissionCheckerModal: React.FC<AdmissionCheckerModalProps> = ({
  isOpen,
  onClose,
  defaultFormNo,
  onOpenLogin,
}) => {
  const [query, setQuery] = useState(defaultFormNo || '');
  const [searched, setSearched] = useState(false);
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [payingAcceptance, setPayingAcceptance] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showPrintLetter, setShowPrintLetter] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (defaultFormNo && isOpen) {
      setQuery(defaultFormNo);
      handleSearch(defaultFormNo);
    }
  }, [defaultFormNo, isOpen]);

  if (!isOpen) return null;

  const mapRowToApplicant = (row: any): Applicant => {
    const full = row.full_application || {};
    const bio = row.bio_data || full;
    return {
      id: row.id,
      formNo: row.form_no,
      fullName: full.fullName || bio.fullName || `${bio.surname || ''} ${bio.firstName || ''}`.trim() || 'Applicant',
      email: full.email || row.applicant_email || '',
      phone: full.phoneNumber || '',
      program: row.program || full.program || 'Nursing',
      jambRegNo: row.jamb_reg_no || full.jambRegNo || '',
      jambScore: row.jamb_score || full.jambScore || '',
      stateOfOrigin: bio.stateOfOrigin || full.stateOfOrigin || '',
      screeningScore: full.screeningScore || row.screening_score || 70,
      status: (row.status?.toUpperCase() === 'ADMITTED' ? 'ADMITTED' : row.status?.toUpperCase() === 'BURSAR_CLEARED' ? 'BURSAR_CLEARED' : 'SUBMITTED') as any,
      acceptanceFeePaid: row.acceptance_fee_paid || false,
      acceptanceReceiptNo: row.acceptance_receipt_no || '',
      exam_number: row.exam_number || row.form_no,
      examNumber: row.exam_number || row.form_no,
      bursar_cleared: row.bursar_cleared || row.status === 'BURSAR_CLEARED' || row.status === 'bursar_cleared',
      bursarCleared: row.bursar_cleared || row.status === 'BURSAR_CLEARED',
      bursar_clearance_date: row.bursar_clearance_date,
      bursarClearedDate: row.bursar_clearance_date,
    } as any;
  };

  const handleSearch = async (searchVal: string = query) => {
    const clean = searchVal.trim();
    if (!clean) return;
    setLoading(true);
    setSearched(true);
    try {
      const sb = getSupabase();
      if (!sb) throw new Error("Supabase client not initialized");
      let { data, error } = await sb.from('college_applications').select('*').or(`form_no.ilike.%${clean}%,exam_number.ilike.%${clean}%`).limit(5);
      if (error) console.error("Supabase search error:", error);
      if (!data || data.length === 0) {
        const { data: allData } = await sb.from('college_applications').select('*').limit(200);
        const lower = clean.toLowerCase();
        const found = allData?.find((r: any) => {
          const email = (r.full_application?.email || r.applicant_email || '').toLowerCase();
          const jamb = (r.jamb_reg_no || r.full_application?.jambRegNo || '').toLowerCase();
          const form = (r.form_no || '').toLowerCase();
          return form === lower || email === lower || jamb === lower || form.includes(lower);
        });
        if (found) data = [found];
      }
      if (data && data.length > 0) {
        const mapped = mapRowToApplicant(data[0]);
        setApplicant(mapped);
        if (mapped.status === 'ADMITTED') {
          try { confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } }); } catch {}
        }
      } else {
        setApplicant(null);
      }
    } catch (e) {
      console.error("Search failed:", e);
      const applicants = StorageService.getApplicants();
      const lower = clean.toLowerCase();
      const found = applicants.find((a) => a.formNo.toLowerCase() === lower || a.email.toLowerCase() === lower || a.jambRegNo.toLowerCase() === lower);
      setApplicant(found || null);
    } finally {
      setLoading(false);
    }
  };

  const handlePayAcceptance = async () => {
    if (!applicant) return;
    setPayingAcceptance(true);
    setTimeout(() => {
      const applicants = StorageService.getApplicants();
      const receiptNo = `LCNS-ACC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const updated = applicants.map((a) => {
        if (a.id === applicant.id) return { ...a, acceptanceFeePaid: true, acceptanceReceiptNo: receiptNo };
        return a;
      });
      StorageService.saveApplicants(updated);
      setApplicant({ ...applicant, acceptanceFeePaid: true, acceptanceReceiptNo: receiptNo } as any);
      const payments = StorageService.getPayments();
      const newPay = {
        id: 'pay-' + Date.now(), receiptNo,
        rrr: `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        matricOrFormNo: applicant.formNo, payerName: applicant.fullName, feeType: 'Provisional Acceptance Fee', amount: 25000,
        session: COLLEGE_CONFIG.CURRENT_SESSION, paymentDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
        paymentMethod: 'Remita / Card' as const, status: 'PAID' as const, verifiedBy: 'Remita Automated Gateway',
      };
      StorageService.savePayments([newPay, ...payments]);
      setPayingAcceptance(false);
      setPaymentSuccess(true);
    }, 900);
  };

  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden border border-slate-200">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white p-5 flex items-center justify-between no-print border-b border-emerald-950">
          <div className="flex items-center gap-3"><CollegeLogo size="sm" /><div><h2 className="text-base font-bold uppercase font-serif-crest leading-tight">Admission Status Checker</h2><p className="text-xs text-emerald-300">2026/2027 Academic Session • Labe College of Nursing Sciences</p></div></div>
          <button onClick={onClose} className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">
          <div className="no-print space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Enter Application Form No / JAMB Reg No / Email</label>
            <div className="flex gap-2">
              <div className="relative flex-1"><Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" /><input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. LCNS/2026/8902 or your email" className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 text-slate-900" onKeyDown={(e) => e.key === 'Enter' && handleSearch()} /></div>
              <button onClick={() => handleSearch()} disabled={loading} className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-60">{loading ? 'Checking...' : 'Check Status'}</button>
            </div>
          </div>
          {searched && (
            <div className="mt-6 pt-5 border-t border-slate-200">
              {applicant ? (
                <div>
                  {applicant.status === 'ADMITTED' && (
                    <div className="space-y-5">
                      <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-2xl"><div className="flex items-start gap-3.5"><div className="p-2.5 bg-emerald-600 text-white rounded-xl"><Sparkles className="w-6 h-6" /></div><div><span className="inline-block bg-emerald-200 text-emerald-900 font-extrabold text-[10px] px-2 py-0.5 rounded uppercase mb-1">Provisional Admission Offered</span><h3 className="text-lg font-black text-emerald-950 uppercase">Congratulations, {applicant.fullName}!</h3><p className="text-xs text-emerald-900 mt-1">You have been offered provisional admission into <strong>Labe College of Nursing Sciences, Gboko</strong> for the <strong>{applicant.program}</strong> programme.</p></div></div></div>
                    </div>
                  )}
                  {applicant.status !== 'ADMITTED' && (
                    <div className="p-5 bg-emerald-50 border-2 border-emerald-500 rounded-2xl space-y-3"><div className="flex items-center gap-2 font-bold text-sm"><CheckCircle2 className="w-5 h-5 text-emerald-600" /><span className="uppercase font-black">{(applicant as any).bursar_cleared ? 'Bursar Cleared & Examination Number Assigned' : 'Application Found - Awaiting Clearance'}</span></div><p className="text-xs">Candidate: <strong>{applicant.fullName}</strong> ({applicant.formNo}) • Programme: <strong>{applicant.program}</strong></p><div className="p-3 bg-white border border-emerald-300 rounded-xl"><span className="text-[10px] text-slate-500 font-bold uppercase">Official Examination Number</span><div className="text-base font-black font-mono text-[#0a4d2e]">{(applicant as any).exam_number || applicant.formNo}</div></div></div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-500 space-y-2"><AlertCircle className="w-8 h-8 text-amber-500 mx-auto" /><p className="text-sm font-bold text-slate-700">No applicant record found for "{query}"</p><p className="text-xs">Please ensure you typed your Application Form No (e.g. LCNS/2026/8902) accurately.</p></div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

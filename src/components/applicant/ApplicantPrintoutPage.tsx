import React, { useState, useEffect } from 'react';
import { CollegeLogo } from '../common/CollegeLogo';
import { Applicant, COLLEGE_CONFIG } from '../../types';
import { StorageService } from '../../services/storage';
import { getSupabase } from '../../lib/supabase';
import {
  Printer,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  ArrowLeft,
  User,
  ShieldCheck,
} from 'lucide-react';

export const ApplicantPrintoutPage: React.FC = () => {
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const formNo =
      params.get('app_no') ||
      params.get('form_no') ||
      localStorage.getItem('lcns_current_app_no');

    const applicants = StorageService.getApplicants();
    const found =
      (formNo &&
        applicants.find(
          (a) =>
            a.formNo.toLowerCase() === formNo.toLowerCase() ||
            a.email.toLowerCase() === formNo.toLowerCase()
        )) ||
      applicants[0];

    setApplicant(found || null);
    if (found) {
      loadSupabaseSync(found.formNo);
    } else {
      setLoading(false);
    }
  }, []);

  const loadSupabaseSync = async (formNo: string) => {
    try {
      const sb = getSupabase();
      if (sb) {
        const { data } = await sb
          .from('applications')
          .select('*')
          .eq('form_no', formNo)
          .limit(1);

        if (data && data.length > 0) {
          const row = data[0];
          setApplicant((prev) =>
            prev
              ? {
                  ...prev,
                  bursar_cleared: row.bursar_cleared ?? prev.bursar_cleared,
                  bursarCleared: row.bursar_cleared ?? prev.bursarCleared,
                  exam_number: row.exam_number || prev.exam_number,
                  examNumber: row.exam_number || prev.examNumber,
                  status: row.status || prev.status,
                }
              : prev
          );
        }
      }
    } catch (err) {
      console.warn('Printout Supabase sync error:', err);
    }
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const isBursarCleared = Boolean(
    applicant &&
      (applicant.bursar_cleared ||
        applicant.bursarCleared ||
        applicant.bursarStatus === 'CLEARED' ||
        applicant.status === 'BURSAR_CLEARED' ||
        applicant.status === 'ADMITTED')
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#0a4d2e] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Loading Application Printout...</p>
        </div>
      </div>
    );
  }

  if (!applicant) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">No Applicant Found</h2>
          <p className="text-xs text-slate-600">Please provide an application number to view printout.</p>
          <a
            href="/check-admission"
            className="inline-block py-2 px-4 bg-[#0a4d2e] text-white rounded-xl text-xs font-bold"
          >
            Check Admission Status
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Bar / Print Action Header (Hidden during print) */}
        <div className="flex flex-wrap items-center justify-between gap-4 no-print bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <a
            href={`/applicant/dashboard?app_no=${encodeURIComponent(applicant.formNo)}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Candidate Dashboard</span>
          </a>

          <div className="flex items-center gap-2">
            {isBursarCleared ? (
              <button
                onClick={handlePrint}
                className="px-5 py-2.5 bg-[#0a4d2e] hover:bg-[#073822] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span>Print Application Slip (PDF)</span>
              </button>
            ) : (
              <button
                disabled
                className="px-5 py-2.5 bg-slate-200 text-slate-400 rounded-xl text-xs font-bold cursor-not-allowed flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Locked &bull; Awaiting Bursar Clearance</span>
              </button>
            )}
          </div>
        </div>

        {/* LOCKED SCREEN IF NOT CLEARED */}
        {!isBursarCleared ? (
          <div className="p-8 sm:p-12 text-center bg-amber-50 rounded-3xl border-2 border-amber-300 space-y-4 shadow-sm">
            <Clock className="w-16 h-16 text-amber-600 mx-auto" />
            <h2 className="text-xl sm:text-2xl font-black uppercase text-amber-950 font-serif-crest tracking-tight">
              Awaiting Bursar Clearance
            </h2>
            <p className="text-sm text-amber-900 max-w-lg mx-auto leading-relaxed">
              Applicant <strong>{applicant.fullName}</strong> (<code>{applicant.formNo}</code>) cannot download or print the official application registration slip because the <strong>₦15,000 Screening Fee</strong> has not yet been audited and cleared by the College Bursar.
            </p>
            <div className="inline-block px-4 py-1.5 rounded-full bg-amber-200 text-amber-950 text-xs font-bold uppercase tracking-wider">
              Status: PENDING_BURSAR
            </div>
            <div className="pt-2">
              <a
                href="/check-admission"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0a4d2e] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#073822]"
              >
                <span>Check Admission Clearance</span>
              </a>
            </div>
          </div>
        ) : (
          /* CLEARED OFFICIAL STAMPED PRINTOUT */
          <div className="border-4 border-double border-[#0a4d2e] rounded-2xl p-8 bg-white shadow-xl print-page relative text-xs text-slate-800 space-y-5">
            {/* 1. Header with School Logo */}
            <div className="text-center pb-4 border-b-2 border-[#0a4d2e]">
              <div className="flex items-center justify-center gap-3 mb-2">
                <CollegeLogo size="md" />
                <div>
                  <h1 className="text-lg sm:text-2xl font-black text-emerald-950 uppercase font-serif-crest tracking-tight">
                    Labe College of Nursing Sciences, Gboko
                  </h1>
                  <p className="text-xs font-bold text-[#0a4d2e] tracking-wider uppercase">
                    Benue State, Nigeria &bull; Motto: "Learn, Serve &amp; Save"
                  </p>
                  <p className="text-[11px] text-slate-500">
                    P.M.B. 104, Along Agbile Road, Gboko &bull; Email: info@lcns.edu.ng &bull; ICT Support: 08126799565
                  </p>
                </div>
              </div>
              <div className="inline-block bg-[#0a4d2e] text-white font-bold text-xs uppercase px-5 py-1.5 rounded-full mt-2">
                2026/2027 Admissions Screening Acknowledgement Slip
              </div>
            </div>

            {/* 2. Grid with All Form Data & Passport Photo on Top Right */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-4 items-start">
              <div className="md:col-span-2 space-y-2 text-xs">
                <div className="flex border-b border-slate-100 py-1">
                  <span className="w-44 font-bold text-slate-600">Application Form No:</span>
                  <span className="font-mono font-bold text-[#0a4d2e] text-sm">{applicant.formNo}</span>
                </div>
                <div className="flex border-b border-slate-100 py-1">
                  <span className="w-44 font-bold text-slate-600">Candidate Full Name:</span>
                  <span className="font-bold text-slate-900 uppercase">{applicant.fullName}</span>
                </div>
                <div className="flex border-b border-slate-100 py-1">
                  <span className="w-44 font-bold text-slate-600">Official Exam Number:</span>
                  <span className="font-mono font-bold text-[#0a4d2e]">{applicant.exam_number || applicant.examNumber || 'LCNS/EXAM/2025/001'}</span>
                </div>
                <div className="flex border-b border-slate-100 py-1">
                  <span className="w-44 font-bold text-slate-600">Course Choice 1:</span>
                  <span className="font-bold text-[#0a4d2e]">{applicant.courseChoice1 || applicant.program}</span>
                </div>
                <div className="flex border-b border-slate-100 py-1">
                  <span className="w-44 font-bold text-slate-600">Course Choice 2:</span>
                  <span className="font-bold text-slate-700">{applicant.courseChoice2 || 'HND Nursing Sciences'}</span>
                </div>
                <div className="flex border-b border-slate-100 py-1">
                  <span className="w-44 font-bold text-slate-600">Email Address:</span>
                  <span className="text-slate-800">{applicant.email}</span>
                </div>
                <div className="flex border-b border-slate-100 py-1">
                  <span className="w-44 font-bold text-slate-600">Phone Number:</span>
                  <span className="text-slate-800">{applicant.phone}</span>
                </div>
                <div className="flex border-b border-slate-100 py-1">
                  <span className="w-44 font-bold text-slate-600">Gender / DOB:</span>
                  <span className="text-slate-800">{applicant.gender} &bull; {applicant.dob}</span>
                </div>
                <div className="flex border-b border-slate-100 py-1">
                  <span className="w-44 font-bold text-slate-600">State / LGA of Origin:</span>
                  <span className="text-slate-800">{applicant.stateOfOrigin} State &bull; {applicant.lga}</span>
                </div>
                <div className="flex border-b border-slate-100 py-1">
                  <span className="w-44 font-bold text-slate-600">JAMB Reg / Score:</span>
                  <span className="font-bold text-slate-900">{applicant.jambRegNo} ({applicant.jambScore} pts)</span>
                </div>
                <div className="flex border-b border-slate-100 py-1">
                  <span className="w-44 font-bold text-slate-600">Next of Kin / Sponsor:</span>
                  <span className="text-slate-800">{applicant.sponsorName || 'Parent / Guardian'} ({applicant.sponsorPhone || applicant.phone})</span>
                </div>
              </div>

              {/* Passport Photo on Top Right */}
              <div className="flex flex-col items-center">
                <div className="w-32 h-40 border-2 border-[#0a4d2e] rounded-xl overflow-hidden shadow-sm bg-slate-100 flex items-center justify-center">
                  {applicant.passportPhotoUrl ? (
                    <img
                      src={applicant.passportPhotoUrl}
                      alt="Applicant Passport"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-slate-400" />
                  )}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 font-semibold uppercase">Official Passport</span>
                <span className="text-[9px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full mt-1">
                  Verified Biometric
                </span>
              </div>
            </div>

            {/* 3. O'Level Breakdown Table */}
            <div className="my-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                O'Level Subject Breakdown ({applicant.olevelExamType} &bull; {applicant.olevelExamYear})
              </h4>
              <table className="w-full text-xs border border-slate-200">
                <thead className="bg-emerald-50 text-emerald-950 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2 text-left">English Language</th>
                    <th className="p-2 text-left">Mathematics</th>
                    <th className="p-2 text-left">Biology</th>
                    <th className="p-2 text-left">Chemistry</th>
                    <th className="p-2 text-left">Physics</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="font-bold text-slate-800">
                    <td className="p-2 border-r border-slate-200">{applicant.olevelGrades?.english || 'B3'}</td>
                    <td className="p-2 border-r border-slate-200">{applicant.olevelGrades?.mathematics || 'B2'}</td>
                    <td className="p-2 border-r border-slate-200">{applicant.olevelGrades?.biology || 'A1'}</td>
                    <td className="p-2 border-r border-slate-200">{applicant.olevelGrades?.chemistry || 'B3'}</td>
                    <td className="p-2">{applicant.olevelGrades?.physics || 'B3'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. Bursar Cleared Stamp & Date Section */}
            <div className="my-6 p-4 rounded-2xl border-2 border-dashed flex flex-col sm:flex-row items-center justify-between gap-4 bg-emerald-50/50">
              <div className="space-y-1 text-xs">
                <span className="font-bold text-emerald-950 block uppercase tracking-wider">
                  Bursary Payment Reconciliation &amp; Audit:
                </span>
                <p className="text-slate-700">
                  Payment Voucher: <strong>{applicant.paymentReceiptName || 'Proof_of_Payment.pdf'}</strong>
                </p>
                <p className="text-slate-600 text-[11px]">
                  Audited by: Dr. Isaac M. Agber, College Bursar
                </p>
                <div className="text-[11px] text-[#0a4d2e] font-bold">
                  Screening Fee ₦15,000 Verified &bull; Cleared for CBT Attitude Test
                </div>
              </div>

              {/* Official Stamp with Date */}
              <div className="border-4 border-emerald-800 rounded-xl p-3 text-center text-emerald-900 transform rotate-1 bg-white shadow-xs max-w-xs">
                <div className="text-[10px] font-black uppercase tracking-widest text-emerald-950">
                  LABE COLLEGE OF NURSING SCIENCES
                </div>
                <div className="text-xs font-black uppercase text-emerald-800 py-0.5">
                  ★ BURSAR CLEARED &bull; PAID ★
                </div>
                <div className="text-[10px] font-mono font-bold text-emerald-950">
                  DATE: {applicant.bursarClearedDate || applicant.bursar_clearance_date?.substring(0, 10) || new Date().toISOString().split('T')[0]}
                </div>
                <div className="text-[9px] text-emerald-700 italic">
                  Authorized Bursary Signature &amp; Seal
                </div>
              </div>
            </div>

            {/* Signatures Footer */}
            <div className="pt-4 flex justify-between items-end text-xs text-slate-700">
              <div className="text-center">
                <div className="w-36 border-b border-slate-800 pb-1 font-serif-crest font-bold text-slate-900">
                  Candidate Signature
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">Applicant Attestation</span>
              </div>

              <div className="text-center">
                <div className="w-36 border-b border-slate-800 pb-1 font-serif-crest font-bold text-slate-900">
                  Barr. Timothy J. Iorbee
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">College Registrar</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

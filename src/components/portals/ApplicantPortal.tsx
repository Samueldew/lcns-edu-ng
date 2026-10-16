import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { Applicant, COLLEGE_CONFIG } from '../../types';
import { CollegeLogo } from '../common/CollegeLogo';
import {
  FileText,
  CreditCard,
  Printer,
  CheckCircle2,
  Clock,
  Award,
  Sparkles,
  Calendar,
  Building,
  User,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ApplicantPortal: React.FC = () => {
  const applicants = StorageService.getApplicants();
  // Default to applicant 2 or 1
  const [applicant, setApplicant] = useState<Applicant>(applicants[1] || applicants[0]);
  const [payingAcceptance, setPayingAcceptance] = useState(false);
  const [showLetter, setShowLetter] = useState(false);

  const handlePayAcceptance = () => {
    setPayingAcceptance(true);
    setTimeout(() => {
      const receiptNo = `LCNS-ACC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const updated = applicants.map((a) => {
        if (a.id === applicant.id) {
          return {
            ...a,
            acceptanceFeePaid: true,
            acceptanceReceiptNo: receiptNo,
          };
        }
        return a;
      });

      StorageService.saveApplicants(updated);
      setApplicant({
        ...applicant,
        acceptanceFeePaid: true,
        acceptanceReceiptNo: receiptNo,
      });

      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
        });
      } catch {
        // Safe fallback
      }

      setPayingAcceptance(false);
      alert(`Acceptance Fee of ₦25,000 successfully processed! Receipt No: ${receiptNo}. You may now proceed to Academic Registry clearance.`);
    }, 800);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-emerald-800 px-3 py-1 rounded-full">
              2026/2027 Admissions Applicant Portal
            </span>
            <h1 className="text-xl sm:text-2xl font-black uppercase font-serif-crest mt-2">
              {applicant.fullName}
            </h1>
            <p className="text-xs text-emerald-200 font-mono-code">
              Form No: <strong className="text-white">{applicant.formNo}</strong> &bull; {applicant.program}
            </p>
          </div>

          <div className="bg-emerald-950/80 p-3.5 rounded-2xl border border-emerald-800 text-center sm:text-right">
            <span className="text-[10px] text-emerald-300 uppercase block font-bold">Admission Status</span>
            <span className="text-sm font-black text-amber-400 uppercase">
              {applicant.status === 'ADMITTED' ? 'PROVISIONAL OFFER GRANTED' : applicant.status}
            </span>
          </div>
        </div>
      </div>

      {/* ADMISSION OFFER BANNER */}
      {applicant.status === 'ADMITTED' && (
        <div className="p-6 bg-emerald-50 rounded-3xl border-2 border-emerald-500 shadow-sm space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-800 text-white rounded-2xl shrink-0">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-black uppercase text-emerald-900 bg-emerald-200 px-3 py-0.5 rounded-full">
                Offer of Provisional Admission
              </span>
              <h3 className="text-lg font-black text-emerald-950 uppercase font-serif-crest">
                Congratulations, {applicant.fullName}!
              </h3>
              <p className="text-xs text-emerald-900 leading-relaxed">
                You have been offered provisional admission into <strong>Labe College of Nursing Sciences, Gboko</strong> to study <strong>{applicant.program}</strong> for the 2026/2027 Academic Session.
              </p>
            </div>
          </div>

          {/* Acceptance Fee Status & Action */}
          <div className="pt-4 border-t border-emerald-200 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 font-bold">
              <span>Acceptance Fee (₦25,000):</span>
              {applicant.acceptanceFeePaid ? (
                <span className="bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> PAID (Receipt: {applicant.acceptanceReceiptNo})
                </span>
              ) : (
                <span className="bg-amber-100 text-amber-900 px-3 py-1 rounded-full flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-700" /> PENDING PAYMENT
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 no-print">
              {!applicant.acceptanceFeePaid && (
                <button
                  onClick={handlePayAcceptance}
                  disabled={payingAcceptance}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <CreditCard className="w-4 h-4 text-amber-300" />
                  <span>{payingAcceptance ? 'Processing Remita Payment...' : 'Pay ₦25,000 Acceptance Fee'}</span>
                </button>
              )}

              <button
                onClick={() => setShowLetter(!showLetter)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                <span>{showLetter ? 'Hide Admission Letter' : 'View & Print Admission Letter'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMISSION LETTER TEMPLATE */}
      {showLetter && (
        <div className="border-4 border-double border-emerald-900 p-8 rounded-2xl bg-white shadow-xl print-page space-y-4 text-xs text-slate-800">
          <div className="flex items-center justify-between no-print pb-3 border-b">
            <span className="font-bold text-slate-600 uppercase">Official Admission Letter</span>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-900"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Letter</span>
            </button>
          </div>

          <div className="text-center pb-4 border-b-2 border-emerald-900">
            <h1 className="text-xl font-black uppercase font-serif-crest text-emerald-950">
              Labe College of Nursing Sciences, Gboko
            </h1>
            <p className="text-xs font-bold text-emerald-800 uppercase">
              Office of the Registrar &bull; P.M.B. 104, Gboko, Benue State
            </p>
            <p className="text-[10px] text-slate-500">
              Email: info@lcns.edu.ng | Support: 08126799565 ICT | lcns.edu.ng
            </p>
          </div>

          <div className="py-2 text-justify leading-relaxed space-y-3">
            <p>
              Dear <strong>{applicant.fullName.toUpperCase()}</strong> (Form No: {applicant.formNo}),
            </p>
            <p>
              We are pleased to inform you that you have been offered provisional admission into <strong>Labe College of Nursing Sciences, Gboko</strong> for the 2026/2027 Academic Session to study <strong>{applicant.program}</strong>.
            </p>
            <p>
              Please note that you must present your original credentials and Remita Acceptance Fee receipt to the Admissions Officer on resumption.
            </p>
          </div>

          <div className="pt-8 flex justify-between items-end">
            <div>
              <div className="w-36 border-b border-slate-700 mb-1 font-serif text-emerald-900 font-bold">
                Barr. T. J. Iorbee
              </div>
              <p className="font-bold text-slate-900">Barr. Timothy J. Iorbee</p>
              <p className="text-[10px] text-slate-500">Registrar &bull; LCNS</p>
            </div>
            <div className="w-20 h-20 border border-emerald-900 rounded-full flex flex-col items-center justify-center p-1 text-[8px] font-bold text-emerald-900 uppercase">
              <span>OFFICIAL SEAL</span>
              <span>LCNS GBOKO</span>
            </div>
          </div>
        </div>
      )}

      {/* APPLICATION BIO SUMMARY */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-slate-900 text-base uppercase font-serif-crest">
          Application Credentials on File
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div><span className="text-slate-500 block text-[10px]">Email:</span><strong>{applicant.email}</strong></div>
          <div><span className="text-slate-500 block text-[10px]">Phone:</span><strong>{applicant.phone}</strong></div>
          <div><span className="text-slate-500 block text-[10px]">JAMB Reg:</span><strong>{applicant.jambRegNo} ({applicant.jambScore})</strong></div>
          <div><span className="text-slate-500 block text-[10px]">Origin:</span><strong>{applicant.stateOfOrigin} State ({applicant.lga} LGA)</strong></div>
        </div>
      </div>
    </div>
  );
};

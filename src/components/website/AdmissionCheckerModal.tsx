import React, { useState, useEffect } from 'react';
import { CollegeLogo } from '../common/CollegeLogo';
import { Applicant, COLLEGE_CONFIG } from '../../types';
import { StorageService } from '../../services/storage';
import { ApiService } from '../../services/api';
import {
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  CreditCard,
  GraduationCap,
  Sparkles,
  FileText,
  UserCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

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

  useEffect(() => {
    if (defaultFormNo) {
      setQuery(defaultFormNo);
      handleSearch(defaultFormNo);
    }
  }, [defaultFormNo, isOpen]);

  if (!isOpen) return null;

  const handleSearch = (searchVal: string = query) => {
    const clean = searchVal.trim().toLowerCase();
    if (!clean) return;

    setSearched(true);
    const applicants = StorageService.getApplicants();
    const found = applicants.find(
      (a) =>
        a.formNo.toLowerCase() === clean ||
        a.email.toLowerCase() === clean ||
        a.jambRegNo.toLowerCase() === clean
    );

    setApplicant(found || null);

    if (found && found.status === 'ADMITTED') {
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
        });
      } catch {
        // safe fallback
      }
    }
  };

  const handlePayAcceptance = async () => {
    if (!applicant) return;
    setPayingAcceptance(true);

    setTimeout(() => {
      const applicants = StorageService.getApplicants();
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

      // Also create payment record in Bursary
      const payments = StorageService.getPayments();
      const newPay = {
        id: 'pay-' + Date.now(),
        receiptNo,
        rrr: `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        matricOrFormNo: applicant.formNo,
        payerName: applicant.fullName,
        feeType: 'Provisional Acceptance Fee',
        amount: 25000,
        session: COLLEGE_CONFIG.CURRENT_SESSION,
        paymentDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
        paymentMethod: 'Remita / Card' as const,
        status: 'PAID' as const,
        verifiedBy: 'Remita Automated Gateway',
      };
      StorageService.savePayments([newPay, ...payments]);
      StorageService.logAction(
        applicant.email,
        'APPLICANT',
        'ACCEPTANCE_PAYMENT',
        `Acceptance fee ₦25,000 paid for ${applicant.formNo}. Receipt: ${receiptNo}`
      );

      setPayingAcceptance(false);
      setPaymentSuccess(true);
    }, 900);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white p-5 flex items-center justify-between no-print border-b border-emerald-950">
          <div className="flex items-center gap-3">
            <CollegeLogo size="sm" />
            <div>
              <h2 className="text-base font-bold uppercase font-serif-crest leading-tight">
                Admission Status Checker
              </h2>
              <p className="text-xs text-emerald-300">
                2026/2027 Academic Session &bull; Labe College of Nursing Sciences
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Search Box */}
          <div className="no-print space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Enter Application Form No / JAMB Reg No / Email
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. LCNS/APP/2026/014 or LCNS/APP/2026/089"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-900"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button
                onClick={() => handleSearch()}
                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <span>Check Status</span>
              </button>
            </div>

            {/* Quick Demo Pre-fill links */}
            <div className="flex items-center gap-2 pt-1 text-xs text-slate-500 flex-wrap">
              <span className="font-semibold text-slate-600">Sample test candidates:</span>
              <button
                onClick={() => {
                  setQuery('LCNS/APP/2026/014');
                  handleSearch('LCNS/APP/2026/014');
                }}
                className="underline text-emerald-800 hover:text-emerald-950 font-mono-code font-bold"
              >
                LCNS/APP/2026/014 (Admitted &amp; Paid)
              </button>
              <span>&bull;</span>
              <button
                onClick={() => {
                  setQuery('LCNS/APP/2026/089');
                  handleSearch('LCNS/APP/2026/089');
                }}
                className="underline text-emerald-800 hover:text-emerald-950 font-mono-code font-bold"
              >
                LCNS/APP/2026/089 (Admitted - Pay Acceptance)
              </button>
            </div>
          </div>

          {/* Results Display */}
          {searched && (
            <div className="mt-6 pt-5 border-t border-slate-200">
              {applicant ? (
                <div>
                  {/* Status: ADMITTED */}
                  {applicant.status === 'ADMITTED' && (
                    <div className="space-y-5">
                      <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-2xl relative overflow-hidden">
                        <div className="flex items-start gap-3.5">
                          <div className="p-2.5 bg-emerald-600 text-white rounded-xl shrink-0 shadow-md">
                            <Sparkles className="w-6 h-6 animate-spin" />
                          </div>
                          <div>
                            <span className="inline-block bg-emerald-200 text-emerald-900 font-extrabold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider mb-1">
                              Provisional Admission Offered
                            </span>
                            <h3 className="text-base sm:text-lg font-black text-emerald-950 font-serif-crest uppercase">
                              Congratulations, {applicant.fullName}!
                            </h3>
                            <p className="text-xs text-emerald-900 mt-1 leading-relaxed">
                              You have been offered provisional admission into <strong>Labe College of Nursing Sciences, Gboko</strong> for the <strong>{applicant.program}</strong> programme (2026/2027 Academic Session).
                            </p>
                          </div>
                        </div>

                        {/* Acceptance Fee Status */}
                        <div className="mt-4 pt-3 border-t border-emerald-200 flex flex-wrap items-center justify-between text-xs gap-2">
                          <div className="flex items-center gap-1.5 font-bold">
                            <span>Acceptance Fee (₦25,000):</span>
                            {applicant.acceptanceFeePaid ? (
                              <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> PAID (Receipt: {applicant.acceptanceReceiptNo})
                              </span>
                            ) : (
                              <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> PENDING PAYMENT
                              </span>
                            )}
                          </div>

                          {!applicant.acceptanceFeePaid && (
                            <button
                              onClick={handlePayAcceptance}
                              disabled={payingAcceptance}
                              className="inline-flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-sm transition-all"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>{payingAcceptance ? 'Processing Payment...' : 'Pay Acceptance Fee Online'}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between gap-3 no-print">
                        <button
                          onClick={() => setShowPrintLetter(!showPrintLetter)}
                          className="inline-flex items-center gap-2 bg-emerald-900 hover:bg-emerald-950 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all"
                        >
                          <FileText className="w-4 h-4" />
                          <span>{showPrintLetter ? 'Hide Admission Letter' : 'View & Print Admission Letter'}</span>
                        </button>

                        <button
                          onClick={() => {
                            onClose();
                            onOpenLogin();
                          }}
                          className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border border-slate-300"
                        >
                          <UserCheck className="w-4 h-4 text-emerald-700" />
                          <span>Proceed to Student Portal</span>
                        </button>
                      </div>

                      {/* OFFICIAL PRINTABLE PROVISIONAL ADMISSION LETTER */}
                      {showPrintLetter && (
                        <div className="border-4 border-double border-emerald-900 p-8 rounded-xl bg-white shadow-xl mt-4 print-page space-y-4">
                          <div className="flex items-center justify-between no-print pb-3 border-b border-slate-200">
                            <span className="text-xs font-bold text-slate-500 uppercase">Official Admission Letter Preview</span>
                            <button
                              onClick={handlePrint}
                              className="inline-flex items-center gap-1.5 bg-emerald-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-900"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Print Letter</span>
                            </button>
                          </div>

                          {/* Letterhead */}
                          <div className="text-center pb-4 border-b-2 border-emerald-900">
                            <div className="flex items-center justify-center gap-3 mb-1">
                              <CollegeLogo size="md" />
                              <div>
                                <h1 className="text-xl font-black text-emerald-950 uppercase font-serif-crest tracking-tight">
                                  Labe College of Nursing Sciences, Gboko
                                </h1>
                                <p className="text-xs font-extrabold text-emerald-800 tracking-wider uppercase">
                                  Office of the Registrar &bull; Admissions Unit
                                </p>
                                <p className="text-[11px] text-slate-600">
                                  P.M.B. 104, Gboko, Benue State &bull; Email: info@lcns.edu.ng &bull; Phone: 08126799565 ICT
                                </p>
                              </div>
                            </div>
                            <div className="text-xs font-bold text-slate-600 mt-2">
                              Ref: LCNS/REG/ADM/2026/041 &bull; Date: October 15, 2026
                            </div>
                          </div>

                          {/* Recipient */}
                          <div className="text-xs space-y-1 text-slate-800">
                            <p>To:</p>
                            <p className="font-bold uppercase text-slate-950 text-sm">{applicant.fullName}</p>
                            <p>Application Form No: <strong className="font-mono-code">{applicant.formNo}</strong></p>
                            <p>JAMB Reg No: <strong>{applicant.jambRegNo}</strong> (Score: {applicant.jambScore})</p>
                            <p>State of Origin: {applicant.stateOfOrigin} State</p>
                          </div>

                          {/* Subject */}
                          <div className="text-center py-2">
                            <h3 className="font-black text-emerald-950 uppercase underline font-serif-crest text-sm tracking-wide">
                              OFFER OF PROVISIONAL ADMISSION FOR 2026/2027 ACADEMIC SESSION
                            </h3>
                          </div>

                          {/* Letter Body */}
                          <div className="text-xs text-slate-800 leading-relaxed space-y-2 text-justify">
                            <p>
                              I am pleased to inform you that following your satisfactory performance in the Unified Tertiary Matriculation Examination (UTME) and the college screening exercise, the Academic Board of <strong>Labe College of Nursing Sciences, Gboko</strong> has offered you provisional admission to study:
                            </p>
                            <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded text-center font-bold text-emerald-950 text-sm">
                              PROGRAMME: {applicant.program.toUpperCase()}
                            </div>
                            <p>
                              This offer is subject to the confirmation of your minimum entry qualifications of five (5) credit passes in WAEC/NECO/NABTEB including English Language, Mathematics, Biology, Chemistry, and Physics in not more than two sittings, as well as satisfactory medical fitness report from the College Clinic.
                            </p>
                            <p>
                              <strong>Conditions of Acceptance:</strong>
                            </p>
                            <ol className="list-decimal pl-5 space-y-1">
                              <li>Payment of non-refundable Acceptance Fee of ₦25,000 within two (2) weeks of this notification.</li>
                              <li>Completion of biometric indexing with the Nursing and Midwifery Council of Nigeria (NMCN).</li>
                              <li>Full compliance with the matriculation oath, code of conduct, and professional nursing ethics of the college.</li>
                            </ol>
                            <p>
                              Accept our hearty congratulations on your well-deserved admission into this noble profession.
                            </p>
                          </div>

                          {/* Signatures */}
                          <div className="pt-6 flex justify-between items-end text-xs">
                            <div className="text-center">
                              <div className="w-32 border-b-2 border-slate-900 mb-1 font-serif-crest font-bold text-emerald-900">
                                Timothy J. Iorbee
                              </div>
                              <p className="font-bold text-slate-900">Barr. Timothy J. Iorbee</p>
                              <p className="text-[11px] text-slate-500">Registrar / Secretary to Board</p>
                            </div>
                            <div className="text-center">
                              <div className="w-24 h-24 border-2 border-emerald-900 rounded-full flex flex-col items-center justify-center p-1 text-[9px] font-bold text-emerald-900 text-center uppercase">
                                <span>Official Seal</span>
                                <span>LCNS GBOKO</span>
                                <span>★ 2026 ★</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Status: SCREENED */}
                  {applicant.status === 'SCREENED' && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                      <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <span>Screening Completed - Under Senate Ratification</span>
                      </div>
                      <p className="text-xs text-blue-800">
                        Candidate: <strong>{applicant.fullName}</strong> ({applicant.formNo}).
                        Screening score: <strong>{applicant.screeningScore || 70}%</strong>.
                        The admission recommendation is scheduled for release in the upcoming Batch 2 list. Please check back regularly.
                      </p>
                    </div>
                  )}

                  {/* Status: PENDING_BURSAR */}
                  {(applicant.status === 'PENDING_BURSAR' || applicant.bursarStatus === 'PENDING_BURSAR') && (
                    <div className="p-5 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-3">
                      <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
                        <Clock className="w-5 h-5 text-amber-700" />
                        <span className="uppercase tracking-wide font-black">Awaiting Bursar Clearance</span>
                      </div>
                      <p className="text-xs text-amber-900 leading-relaxed">
                        Candidate: <strong>{applicant.fullName}</strong> ({applicant.formNo}).
                        <br />
                        Your online application and uploaded bank proof of payment are undergoing bursary verification.
                        Under college regulations, <strong>applicant cannot download application printout if not cleared</strong>.
                        Please check back after 12-24 hours.
                      </p>
                      <div className="pt-1">
                        <span className="inline-block px-3 py-1 bg-amber-200 text-amber-950 rounded-full text-[11px] font-bold uppercase">
                          Clearance Status: Awaiting Bursar Clearance
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Status: BURSAR_CLEARED */}
                  {(applicant.status === 'BURSAR_CLEARED' || applicant.bursarStatus === 'CLEARED') && applicant.status !== 'ADMITTED' && (
                    <div className="p-5 bg-emerald-50 border-2 border-emerald-500 rounded-2xl space-y-3">
                      <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                        <CheckCircle2 className="w-5 h-5 text-[#22c55e]" />
                        <span className="uppercase tracking-wide font-black">Payment Audited &amp; Bursar Cleared</span>
                      </div>
                      <p className="text-xs text-emerald-900 leading-relaxed">
                        Candidate: <strong>{applicant.fullName}</strong> ({applicant.formNo}).
                        <br />
                        Payment verified by the College Bursar on <strong>{applicant.bursarClearedDate || new Date().toISOString().split('T')[0]}</strong>. You are cleared for aptitude screening examination and credential verification.
                      </p>
                      <div className="pt-2 flex items-center gap-2">
                        <button
                          onClick={handlePrint}
                          className="px-4 py-2 bg-[#0a4d2e] hover:bg-[#06321e] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                        >
                          <Printer className="w-4 h-4 text-amber-300" />
                          <span>Print Cleared Registration Slip</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Status: SUBMITTED */}
                  {applicant.status === 'SUBMITTED' && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                      <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                        <Clock className="w-5 h-5 text-amber-600" />
                        <span>Application Received - Awaiting Physical Screening</span>
                      </div>
                      <p className="text-xs text-amber-800">
                        Your application for <strong>{applicant.program}</strong> is acknowledged. Physical screening and aptitude test date is scheduled for Saturday at 9:00 AM at the College ICT Center.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-500 space-y-2">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">No applicant record found for "{query}"</p>
                  <p className="text-xs">
                    Please ensure you typed your Application Form No (e.g. LCNS/APP/2026/014) or JAMB Reg No accurately.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import { Applicant, CBTExam, CBTSubmission, COLLEGE_CONFIG } from '../../types';
import { CollegeLogo } from '../common/CollegeLogo';
import { UserProfilePhotoModal } from '../common/UserProfilePhotoModal';
import { CBTExamSession } from '../cbt/CBTExamSession';
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
  ShieldCheck,
  AlertCircle,
  Camera,
  Play,
  Upload,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ApplicantPortal: React.FC = () => {
  const currentUser = StorageService.getCurrentUser();
  const [applicants, setApplicants] = useState<Applicant[]>(StorageService.getApplicants());

  // Find applicant matching current logged-in user, else first or second
  const initialApplicant =
    applicants.find(
      (a) =>
        a.email.toLowerCase() === currentUser?.email.toLowerCase() ||
        a.formNo === currentUser?.id ||
        a.id === currentUser?.id
    ) ||
    applicants[1] ||
    applicants[0];

  const [applicant, setApplicant] = useState<Applicant>(initialApplicant);
  const [activeTab, setActiveTab] = useState<'status' | 'printout' | 'cbt' | 'letter'>('status');
  const [payingAcceptance, setPayingAcceptance] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [activeCbtExam, setActiveCbtExam] = useState<CBTExam | null>(null);

  // Sync on storage updates
  useEffect(() => {
    const handleStorageUpdate = () => {
      const refreshed = StorageService.getApplicants();
      setApplicants(refreshed);
      const match =
        refreshed.find(
          (a) =>
            a.id === applicant.id ||
            a.formNo === applicant.formNo ||
            a.email.toLowerCase() === currentUser?.email.toLowerCase()
        ) || refreshed[0];
      if (match) {
        setApplicant(match);
      }
    };
    window.addEventListener('lcns_storage_update', handleStorageUpdate);
    return () => window.removeEventListener('lcns_storage_update', handleStorageUpdate);
  }, [applicant.id, currentUser?.email]);

  const isBursarCleared =
    applicant.status === 'BURSAR_CLEARED' ||
    applicant.status === 'ADMITTED' ||
    applicant.status === 'SCREENED' ||
    applicant.bursarStatus === 'CLEARED';

  const isPendingBursar =
    applicant.status === 'PENDING_BURSAR' || applicant.bursarStatus === 'PENDING_BURSAR';

  // CBT Screening exams
  const cbtExams = StorageService.getCBTExams().filter(
    (ex) => ex.type === 'APPLICANT_SCREENING' && ex.isPublished
  );
  const cbtSubmissions = StorageService.getCBTSubmissions().filter(
    (sub) => sub.userId === applicant.formNo || sub.userEmail === applicant.email
  );

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
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-20 rounded-2xl bg-white/10 border-2 border-amber-400 overflow-hidden shadow-md flex items-center justify-center">
                {applicant.passportPhotoUrl ? (
                  <img
                    src={applicant.passportPhotoUrl}
                    alt={applicant.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-amber-200" />
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowPhotoModal(true)}
                title="Change passport photo"
                className="absolute -bottom-2 -right-2 bg-amber-400 hover:bg-amber-300 text-slate-950 p-1.5 rounded-full shadow transition-all"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-emerald-800 px-3 py-1 rounded-full">
                2026/2027 Admissions Applicant Portal
              </span>
              <h1 className="text-xl sm:text-2xl font-black uppercase font-serif-crest mt-2">
                {applicant.fullName}
              </h1>
              <p className="text-xs text-emerald-200 font-mono-code">
                Form No: <strong className="text-white">{applicant.formNo}</strong> &bull; Choice 1: {applicant.courseChoice1 || applicant.program}
              </p>
            </div>
          </div>

          <div className="bg-emerald-950/80 p-3.5 rounded-2xl border border-emerald-800 text-center sm:text-right">
            <span className="text-[10px] text-emerald-300 uppercase block font-bold">Admission &amp; Clearance Status</span>
            <span className="text-sm font-black text-amber-400 uppercase">
              {applicant.status === 'ADMITTED'
                ? 'PROVISIONAL OFFER GRANTED'
                : isPendingBursar
                ? 'AWAITING BURSAR CLEARANCE'
                : isBursarCleared
                ? 'BURSAR CLEARED'
                : applicant.status}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs no-print">
        <button
          onClick={() => setActiveTab('status')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'status'
              ? 'bg-[#0a4d2e] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4 text-emerald-400" />
          <span>Admission Status &amp; Clearance</span>
        </button>

        <button
          onClick={() => setActiveTab('printout')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'printout'
              ? 'bg-[#0a4d2e] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Printer className="w-4 h-4 text-amber-400" />
          <span>Application Printout (/applicant/printout)</span>
          {!isBursarCleared && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
              Locked
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('cbt')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'cbt'
              ? 'bg-[#0a4d2e] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Aptitude &amp; Screening CBT ({cbtExams.length})</span>
        </button>

        {applicant.status === 'ADMITTED' && (
          <button
            onClick={() => setActiveTab('letter')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'letter'
                ? 'bg-[#0a4d2e] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Official Admission Letter</span>
          </button>
        )}
      </div>

      {/* TAB 1: ADMISSION STATUS & CLEARANCE OVERVIEW */}
      {activeTab === 'status' && (
        <div className="space-y-6">
          {/* Awaiting Bursar Clearance Notification */}
          {isPendingBursar && (
            <div className="p-6 bg-amber-50 rounded-3xl border-2 border-amber-400 shadow-sm space-y-3">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <span className="inline-block bg-amber-200 text-amber-950 font-black text-[10px] px-2.5 py-0.5 rounded uppercase tracking-wider mb-1">
                    Action Pending: Bursary Reconciliation
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-amber-950 font-serif-crest uppercase">
                    Awaiting Bursar Clearance
                  </h3>
                  <p className="text-xs text-amber-900 mt-1 leading-relaxed max-w-2xl">
                    Your application form details and bank proof have been logged. The Bursar is currently auditing and verifying your payment. Under College policy, <strong>official registration printouts are locked</strong> until payment clearance is approved.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Cleared Notice */}
          {isBursarCleared && (
            <div className="p-6 bg-emerald-50 rounded-3xl border-2 border-emerald-500 shadow-sm flex items-start gap-3.5">
              <div className="p-2.5 bg-[#0a4d2e] text-white rounded-xl shrink-0">
                <ShieldCheck className="w-6 h-6 text-emerald-300" />
              </div>
              <div className="space-y-1">
                <span className="inline-block bg-emerald-200 text-emerald-950 font-black text-[10px] px-2.5 py-0.5 rounded uppercase tracking-wider">
                  Payment Verified
                </span>
                <h3 className="text-base sm:text-lg font-black text-emerald-950 font-serif-crest uppercase">
                  Bursar Clearance Granted
                </h3>
                <p className="text-xs text-emerald-900 leading-relaxed max-w-2xl">
                  Your application payment has been reconciled and officially cleared on <strong>{applicant.bursarClearedDate || '2026-02-12'}</strong> by the College Bursar. You can now download and print your official registration slip with the Bursar Cleared stamp.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('printout')}
                    className="px-4 py-2 bg-[#0a4d2e] hover:bg-[#06321e] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                  >
                    <Printer className="w-4 h-4 text-amber-300" />
                    <span>Download Cleared Application Slip</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PROVISIONAL ADMISSION OFFER */}
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
                    You have been offered provisional admission into <strong>Labe College of Nursing Sciences, Gboko</strong> to study <strong>{applicant.courseChoice1 || applicant.program}</strong> for the 2026/2027 Academic Session.
                  </p>
                </div>
              </div>

              {/* Acceptance Fee Action */}
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
                    onClick={() => setActiveTab('letter')}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View Official Admission Letter</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* APPLICATION CREDENTIALS CARD */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base uppercase font-serif-crest">
              Application Credentials &amp; Programme Choices
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div><span className="text-slate-500 block text-[10px]">Email:</span><strong>{applicant.email}</strong></div>
              <div><span className="text-slate-500 block text-[10px]">Phone:</span><strong>{applicant.phone}</strong></div>
              <div><span className="text-slate-500 block text-[10px]">Course Choice 1:</span><strong className="text-[#0a4d2e]">{applicant.courseChoice1 || applicant.program}</strong></div>
              <div><span className="text-slate-500 block text-[10px]">Course Choice 2:</span><strong>{applicant.courseChoice2 || 'HND Nursing Sciences'}</strong></div>
              <div><span className="text-slate-500 block text-[10px]">JAMB Reg / Score:</span><strong>{applicant.jambRegNo} ({applicant.jambScore})</strong></div>
              <div><span className="text-slate-500 block text-[10px]">State / LGA:</span><strong>{applicant.stateOfOrigin} / {applicant.lga}</strong></div>
              <div><span className="text-slate-500 block text-[10px]">Gender / DOB:</span><strong>{applicant.gender} &bull; {applicant.dob}</strong></div>
              <div><span className="text-slate-500 block text-[10px]">Proof Document:</span><strong>{applicant.paymentReceiptName || 'Attached ✓'}</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: APPLICATION PRINTOUT (/applicant/printout) */}
      {activeTab === 'printout' && (
        <div className="space-y-6">
          {!isBursarCleared ? (
            <div className="p-8 text-center bg-amber-50 rounded-3xl border-2 border-amber-300 space-y-3">
              <Clock className="w-12 h-12 text-amber-600 mx-auto" />
              <h3 className="text-lg font-black uppercase text-amber-950 font-serif-crest">
                Awaiting Bursar Clearance
              </h3>
              <p className="text-xs text-amber-900 max-w-md mx-auto leading-relaxed">
                Applicant cannot download application printout if not cleared by the College Bursar.
                Please allow 12-24 hours for bank payment reconciliation.
              </p>
              <div className="inline-block px-4 py-1.5 rounded-full bg-amber-200 text-amber-950 text-xs font-bold uppercase tracking-wider">
                Status: PENDING_BURSAR
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center no-print">
                <span className="text-xs font-bold text-slate-600 uppercase">
                  Official Stamped Application Slip
                </span>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-[#0a4d2e] hover:bg-[#06321e] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Download / Print Cleared Slip</span>
                </button>
              </div>

              {/* Official Stamped Slip Template */}
              <div className="border-2 border-[#0a4d2e] rounded-2xl p-8 bg-white shadow-xl print-page relative text-xs text-slate-800 space-y-4">
                <div className="text-center pb-4 border-b-2 border-[#0a4d2e]">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <CollegeLogo size="md" />
                    <div>
                      <h1 className="text-lg sm:text-xl font-black text-emerald-950 uppercase font-serif-crest">
                        Labe College of Nursing Sciences, Gboko
                      </h1>
                      <p className="text-xs font-bold text-[#0a4d2e] tracking-wider uppercase">
                        Benue State, Nigeria &bull; Motto: "Learn, Serve &amp; Save"
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Official Email: info@lcns.edu.ng | Support: 08126799565 ICT | lcns.edu.ng
                      </p>
                    </div>
                  </div>
                  <div className="inline-block bg-[#0a4d2e] text-white font-bold text-xs uppercase px-4 py-1 rounded-full mt-2">
                    2026/2027 Admissions Screening Acknowledgement Slip
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 my-4 items-start">
                  <div className="col-span-2 space-y-2 text-xs">
                    <div className="flex border-b border-slate-100 py-1">
                      <span className="w-40 font-bold text-slate-600">Application Form No:</span>
                      <span className="font-mono-code font-bold text-[#0a4d2e] text-sm">{applicant.formNo}</span>
                    </div>
                    <div className="flex border-b border-slate-100 py-1">
                      <span className="w-40 font-bold text-slate-600">Candidate Full Name:</span>
                      <span className="font-bold text-slate-900 uppercase">{applicant.fullName}</span>
                    </div>
                    <div className="flex border-b border-slate-100 py-1">
                      <span className="w-40 font-bold text-slate-600">Course Choice 1:</span>
                      <span className="font-bold text-[#0a4d2e]">{applicant.courseChoice1 || applicant.program}</span>
                    </div>
                    <div className="flex border-b border-slate-100 py-1">
                      <span className="w-40 font-bold text-slate-600">Course Choice 2:</span>
                      <span className="font-bold text-slate-700">{applicant.courseChoice2 || 'HND Nursing Sciences'}</span>
                    </div>
                    <div className="flex border-b border-slate-100 py-1">
                      <span className="w-40 font-bold text-slate-600">Email Address:</span>
                      <span className="text-slate-800">{applicant.email}</span>
                    </div>
                    <div className="flex border-b border-slate-100 py-1">
                      <span className="w-40 font-bold text-slate-600">Phone Number:</span>
                      <span className="text-slate-800">{applicant.phone}</span>
                    </div>
                    <div className="flex border-b border-slate-100 py-1">
                      <span className="w-40 font-bold text-slate-600">Gender / DOB:</span>
                      <span className="text-slate-800">{applicant.gender} &bull; {applicant.dob}</span>
                    </div>
                    <div className="flex border-b border-slate-100 py-1">
                      <span className="w-40 font-bold text-slate-600">State / LGA:</span>
                      <span className="text-slate-800">{applicant.stateOfOrigin} / {applicant.lga}</span>
                    </div>
                    <div className="flex border-b border-slate-100 py-1">
                      <span className="w-40 font-bold text-slate-600">JAMB Reg / Score:</span>
                      <span className="font-bold text-slate-900">{applicant.jambRegNo} ({applicant.jambScore})</span>
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
                  </div>
                </div>

                {/* O-Level Breakdown Table */}
                <div className="my-4">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    O'Level Subject Breakdown ({applicant.olevelExamType} - {applicant.olevelExamYear})
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
                        <td className="p-2 border-r border-slate-200">{applicant.olevelGrades.english}</td>
                        <td className="p-2 border-r border-slate-200">{applicant.olevelGrades.mathematics}</td>
                        <td className="p-2 border-r border-slate-200">{applicant.olevelGrades.biology}</td>
                        <td className="p-2 border-r border-slate-200">{applicant.olevelGrades.chemistry}</td>
                        <td className="p-2">{applicant.olevelGrades.physics}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* BURSAR CLEARED STAMP SECTION */}
                <div className="my-6 p-4 rounded-2xl border-2 border-dashed flex flex-col sm:flex-row items-center justify-between gap-4 bg-emerald-50/50">
                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-emerald-950 block uppercase tracking-wider">
                      Bursary Payment Reconciliation &amp; Audit:
                    </span>
                    <p className="text-slate-700">
                      Payment Voucher: <strong>{applicant.paymentReceiptName || 'Proof_of_Payment.pdf'}</strong>
                    </p>
                    <p className="text-slate-600 text-[11px]">
                      Audited by: Mr. Simon T. Tyavyar (FCA), College Bursar
                    </p>
                  </div>

                  {/* Stamp Display */}
                  <div className="border-4 border-emerald-700 rounded-xl p-3 text-center text-emerald-800 transform rotate-1 bg-white shadow-xs max-w-xs">
                    <div className="text-[10px] font-black uppercase tracking-widest text-emerald-950">
                      LABE COLLEGE OF NURSING SCIENCES
                    </div>
                    <div className="text-xs font-black uppercase text-emerald-800 py-0.5">
                      ★ BURSAR CLEARED &bull; PAID ★
                    </div>
                    <div className="text-[10px] font-mono-code font-bold text-emerald-950">
                      DATE: {applicant.bursarClearedDate || new Date().toISOString().split('T')[0]}
                    </div>
                    <div className="text-[9px] text-emerald-700 italic">
                      Authorized Bursary Signature &amp; Seal
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CBT SCREENING TESTS */}
      {activeTab === 'cbt' && (
        <div className="space-y-6">
          {activeCbtExam ? (
            <CBTExamSession
              exam={activeCbtExam}
              currentUser={{
                id: applicant.formNo,
                email: applicant.email,
                role: 'APPLICANT',
                fullName: applicant.fullName,
                photoUrl: applicant.passportPhotoUrl,
                status: 'ACTIVE',
              }}
              onClose={() => setActiveCbtExam(null)}
              onCompleted={() => setActiveCbtExam(null)}
            />
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div>
                <h3 className="font-bold uppercase font-serif-crest text-base text-slate-900">
                  2026/2027 Admissions Computer-Based Screening Tests (CBT)
                </h3>
                <p className="text-xs text-slate-500">
                  Applicants who have completed application and bursar clearance are scheduled for electronic aptitude screening.
                </p>
              </div>

              {/* Past Submissions */}
              {cbtSubmissions.length > 0 && (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
                  <span className="text-xs font-bold uppercase text-emerald-900 tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Your Submitted CBT Scores</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {cbtSubmissions.map((sub) => (
                      <div key={sub.id} className="bg-white p-3 rounded-xl border border-emerald-200 shadow-2xs flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-slate-900 block">{sub.examTitle}</span>
                          <span className="text-[10px] text-slate-500">Submitted: {sub.submittedAt}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black text-emerald-900 font-mono-code">{sub.percentage}%</span>
                          <span className="text-[10px] text-slate-500 block">({sub.score} / {sub.totalMarks || sub.totalQuestions})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Exams */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Available Screening Tests
                </span>
                {cbtExams.length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500 text-xs">
                    No active screening tests are currently published by the Admissions Committee.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cbtExams.map((exam) => {
                      const alreadyTaken = cbtSubmissions.some((s) => s.examId === exam.id);
                      return (
                        <div key={exam.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                                {exam.type.replace('_', ' ')}
                              </span>
                              <span className="text-xs font-mono-code text-slate-500">
                                {exam.durationMinutes} Mins &bull; {exam.questions.length} Questions
                              </span>
                            </div>
                            <h4 className="font-bold text-sm text-slate-900 mt-1">{exam.title}</h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Total Marks: <strong>{exam.totalMarks}</strong> &bull; Pass Mark: <strong>50%</strong>
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                            {alreadyTaken ? (
                              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" /> Test Completed
                              </span>
                            ) : (
                              <button
                                onClick={() => setActiveCbtExam(exam)}
                                className="px-4 py-2 bg-[#0a4d2e] hover:bg-[#06321e] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                              >
                                <Play className="w-3.5 h-3.5 text-amber-400" />
                                <span>Start CBT Exam</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: OFFICIAL ADMISSION LETTER */}
      {activeTab === 'letter' && applicant.status === 'ADMITTED' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center no-print">
            <span className="text-xs font-bold text-slate-600 uppercase">Provisional Admission Letter</span>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-900 shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Letter</span>
            </button>
          </div>

          <div className="border-4 border-double border-emerald-900 p-8 rounded-2xl bg-white shadow-xl print-page space-y-4 text-xs text-slate-800">
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

            <div className="flex justify-between items-start my-4">
              <div>
                <p>Dear <strong>{applicant.fullName.toUpperCase()}</strong>,</p>
                <p className="font-mono-code text-[11px] text-slate-600">Application No: {applicant.formNo}</p>
                <p className="text-slate-600 text-[11px]">State / LGA: {applicant.stateOfOrigin} / {applicant.lga}</p>
              </div>
              <div className="w-24 h-32 rounded-lg border border-emerald-800 overflow-hidden shadow-xs">
                {applicant.passportPhotoUrl ? (
                  <img src={applicant.passportPhotoUrl} alt="Passport" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[10px]">No Photo</div>
                )}
              </div>
            </div>

            <div className="py-2 text-justify leading-relaxed space-y-3">
              <p className="font-bold text-center uppercase text-emerald-950 underline text-sm">
                OFFER OF PROVISIONAL ADMISSION: 2026/2027 ACADEMIC SESSION
              </p>
              <p>
                I am pleased to inform you that following your satisfactory performance in the Unified Tertiary Matriculation Examination (UTME) and subsequent institutional screening, you have been offered provisional admission into <strong>Labe College of Nursing Sciences, Gboko</strong> to undergo the 4-Year Collegiate Program in <strong>{applicant.courseChoice1 || applicant.program}</strong>.
              </p>
              <p>
                This offer is subject to verification of your academic credentials (WAEC/NECO/NABTEB) and prompt payment of the non-refundable Provisional Acceptance Fee of ₦25,000 via Remita.
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
        </div>
      )}

      {/* USER PHOTO UPLOAD MODAL */}
      <UserProfilePhotoModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        currentUser={{
          id: applicant.formNo,
          email: applicant.email,
          role: 'APPLICANT',
          fullName: applicant.fullName,
          photoUrl: applicant.passportPhotoUrl,
          status: 'ACTIVE',
        }}
        onPhotoUpdated={(newUrl) => {
          setApplicant((prev) => ({ ...prev, passportPhotoUrl: newUrl }));
        }}
      />
    </div>
  );
};

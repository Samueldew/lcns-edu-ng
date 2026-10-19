import React, { useState, useEffect } from 'react';
import { CollegeLogo } from '../common/CollegeLogo';
import { Applicant, CBTTest, CBTResult, ScreeningScore, COLLEGE_CONFIG } from '../../types';
import { StorageService } from '../../services/storage';
import { getSupabase } from '../../lib/supabase';
import {
  FileText,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  Award,
  Sparkles,
  Search,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Building,
  User,
  GraduationCap,
  CreditCard,
  X,
} from 'lucide-react';

export const ApplicantDashboard: React.FC = () => {
  const [appNo, setAppNo] = useState<string>('');
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [cbtTests, setCbtTests] = useState<CBTTest[]>([]);
  const [cbtResults, setCbtResults] = useState<CBTResult[]>([]);
  const [screeningScores, setScreeningScores] = useState<ScreeningScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'application' | 'clearance' | 'cbt' | 'scores'>('all');
  const [showAcceptanceFeeModal, setShowAcceptanceFeeModal] = useState(false);
  const [payingFee, setPayingFee] = useState(false);
  const [acceptanceFeePaid, setAcceptanceFeePaid] = useState(false);
  const [acceptanceReceiptNo, setAcceptanceReceiptNo] = useState<string>('');

  // Load applicant from ?app_no= or localStorage or default
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryAppNo = params.get('app_no') || params.get('form_no') || localStorage.getItem('lcns_current_app_no');
    const allApplicants = StorageService.getApplicants();
    const target =
      (queryAppNo && allApplicants.find((a) => a.formNo.toLowerCase() === queryAppNo.toLowerCase())) ||
      allApplicants[0] ||
      null;

    if (target) {
      setAppNo(target.formNo);
      setApplicant(target);
      localStorage.setItem('lcns_current_app_no', target.formNo);
    }

    loadData(target?.formNo || queryAppNo || '');
  }, []);

  const loadData = async (targetAppNo: string) => {
    setLoading(true);
    // Local data first
    const tests = StorageService.getCBTTests();
    const results = StorageService.getCBTResults();
    const scores = StorageService.getScreeningScores();

    setCbtTests(tests);
    setCbtResults(results);
    setScreeningScores(scores);

    // Sync from Supabase if available
    try {
      const sb = getSupabase();
      if (sb) {
        if (targetAppNo) {
          const { data: appData } = await sb
            .from('applications')
            .select('*')
            .eq('form_no', targetAppNo)
            .limit(1);

          if (appData && appData.length > 0) {
            const row = appData[0];
            setApplicant((prev) =>
              prev
                ? {
                    ...prev,
                    bursar_cleared: row.bursar_cleared ?? prev.bursar_cleared,
                    bursarCleared: row.bursar_cleared ?? prev.bursarCleared,
                    exam_number: row.exam_number || prev.exam_number,
                    examNumber: row.exam_number || prev.examNumber,
                  }
                : prev
            );
          }
        }

        const { data: dbTests } = await sb.from('cbt_tests').select('*');
        if (dbTests && dbTests.length > 0) {
          setCbtTests(dbTests);
        }

        const { data: dbResults } = await sb.from('cbt_results').select('*');
        if (dbResults && dbResults.length > 0) {
          setCbtResults(dbResults);
        }

        const { data: dbScores } = await sb.from('screening_scores').select('*');
        if (dbScores && dbScores.length > 0) {
          setScreeningScores(dbScores);
        }
      }
    } catch (err) {
      console.warn('Applicant dashboard Supabase sync warning:', err);
    }
    setLoading(false);
  };

  const handleSwitchApplicant = (newFormNo: string) => {
    const all = StorageService.getApplicants();
    const found = all.find((a) => a.formNo.toLowerCase() === newFormNo.toLowerCase());
    if (found) {
      setApplicant(found);
      setAppNo(found.formNo);
      localStorage.setItem('lcns_current_app_no', found.formNo);
      window.history.replaceState({}, '', `/applicant/dashboard?app_no=${encodeURIComponent(found.formNo)}`);
      loadData(found.formNo);
    }
  };

  const activeTest = cbtTests.find((t) => t.is_active) || cbtTests[0];
  const candidateResult = cbtResults.find(
    (r) =>
      applicant &&
      (r.application_number?.toLowerCase() === applicant.formNo.toLowerCase() ||
        (applicant.exam_number && r.exam_number?.toLowerCase() === applicant.exam_number.toLowerCase()) ||
        (applicant.examNumber && r.exam_number?.toLowerCase() === applicant.examNumber.toLowerCase()))
  );
  const candidateScreening = screeningScores.find(
    (s) => applicant && s.application_number?.toLowerCase() === applicant.formNo.toLowerCase()
  );

  const isBursarCleared = Boolean(
    applicant &&
      (applicant.bursar_cleared ||
        applicant.bursarCleared ||
        applicant.bursarStatus === 'CLEARED' ||
        applicant.status === 'BURSAR_CLEARED' ||
        applicant.status === 'ADMITTED')
  );

  const examNumber = applicant?.exam_number || applicant?.examNumber || 'LCNS/EXAM/2025/001';

  const handlePrint = () => {
    window.print();
  };

  const handleProcessAcceptancePayment = () => {
    if (!applicant) return;
    setPayingFee(true);
    setTimeout(() => {
      const rec = `LCNS-ACC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setAcceptanceReceiptNo(rec);
      setAcceptanceFeePaid(true);
      setPayingFee(false);

      // Record payment in StorageService
      const payments = StorageService.getPayments();
      payments.unshift({
        id: 'acc-' + Date.now(),
        receiptNo: rec,
        rrr: `2409-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        matricOrFormNo: applicant.formNo,
        payerName: applicant.fullName,
        feeType: 'Acceptance Fee (2026/2027 Session)',
        amount: 50000,
        session: COLLEGE_CONFIG.CURRENT_SESSION,
        semester: 'First',
        paymentDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
        paymentMethod: 'Remita / Card',
        status: 'PAID',
        verifiedBy: 'Dr. Isaac M. Agber (Bursar)',
      });
      StorageService.savePayments(payments);
    }, 1000);
  };

  if (!applicant) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">No Candidate Selected</h2>
          <p className="text-xs text-slate-600">Please provide an application number or select a candidate.</p>
          <div className="space-y-2">
            <button
              onClick={() => handleSwitchApplicant('LCNS/APP/2026/014')}
              className="w-full py-2 px-4 bg-[#0a4d2e] text-white rounded-xl text-xs font-bold"
            >
              Load LCNS/APP/2026/014 (Deborah Vershima)
            </button>
            <button
              onClick={() => handleSwitchApplicant('LCNS/APP/2026/102')}
              className="w-full py-2 px-4 bg-emerald-800 text-white rounded-xl text-xs font-bold"
            >
              Load LCNS/APP/2026/102 (Mngunengen Cynthia)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Candidate Dashboard Top Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-[#0a4d2e] to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800 no-print">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <CollegeLogo size="md" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider">
                    Applicant Admissions Dashboard
                  </span>
                  <span className="text-xs text-emerald-300">2026/2027 Session</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black uppercase font-serif-crest mt-1">
                  {applicant.fullName}
                </h1>
                <p className="text-xs text-emerald-200">
                  Form No: <span className="font-mono font-bold text-white">{applicant.formNo}</span> &bull; JAMB Reg: <span className="font-mono font-bold text-white">{applicant.jambRegNo}</span> &bull; {applicant.program}
                </p>
              </div>
            </div>

            {/* Quick Switcher dropdown for testing */}
            <div className="bg-emerald-950/80 p-3 rounded-2xl border border-emerald-800/80 text-xs space-y-1.5 self-start md:self-auto">
              <span className="text-[10px] text-emerald-300 font-bold uppercase block tracking-wider">Switch Candidate View:</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleSwitchApplicant('LCNS/APP/2026/014')}
                  className={`px-2.5 py-1 rounded-lg font-mono font-bold text-[11px] transition-all ${
                    applicant.formNo === 'LCNS/APP/2026/014' ? 'bg-amber-400 text-slate-950' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  014 (Deborah)
                </button>
                <button
                  onClick={() => handleSwitchApplicant('LCNS/APP/2026/102')}
                  className={`px-2.5 py-1 rounded-lg font-mono font-bold text-[11px] transition-all ${
                    applicant.formNo === 'LCNS/APP/2026/102' ? 'bg-amber-400 text-slate-950' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  102 (Cynthia)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4 SECTIONS NAV / QUICK ANCHORS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 no-print">
          <a
            href="#section-application-pdf"
            className="p-4 bg-white hover:bg-emerald-50/60 rounded-2xl border border-slate-200 shadow-xs transition-all flex items-center gap-3 group"
          >
            <div className="p-2.5 bg-emerald-100 text-[#0a4d2e] rounded-xl group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Section A</span>
              <span className="text-xs font-bold text-slate-900 group-hover:text-[#0a4d2e]">Application PDF</span>
            </div>
          </a>

          <a
            href="#section-bursar-slip"
            className="p-4 bg-white hover:bg-emerald-50/60 rounded-2xl border border-slate-200 shadow-xs transition-all flex items-center gap-3 group"
          >
            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl group-hover:scale-105 transition-transform">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Section B</span>
              <span className="text-xs font-bold text-slate-900 group-hover:text-[#0a4d2e]">Bursar Clearance Slip</span>
            </div>
          </a>

          <a
            href="#section-cbt-test"
            className="p-4 bg-white hover:bg-emerald-50/60 rounded-2xl border border-slate-200 shadow-xs transition-all flex items-center gap-3 group"
          >
            <div className="p-2.5 bg-emerald-100 text-[#0a4d2e] rounded-xl group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Section C</span>
              <span className="text-xs font-bold text-slate-900 group-hover:text-[#0a4d2e]">CBT Attitude Test</span>
            </div>
          </a>

          <a
            href="#section-screening-scores"
            className="p-4 bg-white hover:bg-emerald-50/60 rounded-2xl border border-slate-200 shadow-xs transition-all flex items-center gap-3 group"
          >
            <div className="p-2.5 bg-purple-100 text-purple-800 rounded-xl group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Section D</span>
              <span className="text-xs font-bold text-slate-900 group-hover:text-[#0a4d2e]">Screening &amp; Interview</span>
            </div>
          </a>
        </div>

        {/* ======================================================== */}
        {/* ADMISSION STATUS & ACCEPTANCE FEE NOTIFICATION BANNER    */}
        {/* ======================================================== */}
        {applicant.status === 'ADMITTED' && (
          <div className="bg-gradient-to-r from-emerald-950 via-[#0a4d2e] to-emerald-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-[#ca8a04] no-print">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ca8a04] text-slate-950 font-black text-xs rounded-full uppercase tracking-wider shadow-sm">
                  <Award className="w-4 h-4 text-emerald-950" />
                  <span>ADMITTED &bull; PROVISIONAL OFFER OF ADMISSION</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black font-serif-crest text-amber-300 uppercase tracking-tight">
                  Congratulations! Admission Granted
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
                  Candidate <strong>{applicant.fullName}</strong> (<code>{applicant.formNo}</code>) has been formally admitted into the <strong>{applicant.courseChoice1 || applicant.program}</strong> program at Labe College of Nursing Sciences, Gboko for the {COLLEGE_CONFIG.CURRENT_SESSION} Academic Session.
                </p>
                <div className="flex items-center gap-3 pt-1 text-xs text-amber-200">
                  <span className="font-semibold">&bull; Acceptance Fee: ₦50,000</span>
                  <span>&bull; Status: Official Offer Confirmed</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAcceptanceFeeModal(true)}
                  className="px-6 py-3.5 bg-[#ca8a04] hover:bg-[#eab308] text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Proceed to Pay Acceptance Fee</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {applicant.status === 'ADMISSION_IN_PROGRESS' && (
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-6 text-emerald-950 shadow-sm no-print">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-200 text-emerald-900 rounded-2xl">
                <Clock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="inline-block px-3 py-0.5 bg-emerald-200 text-emerald-900 text-[10px] font-black uppercase rounded-full tracking-wider">
                  Status: ADMISSION_IN_PROGRESS
                </div>
                <h3 className="text-base font-black uppercase font-serif-crest text-emerald-950">
                  Application Under Central Admissions Board Review
                </h3>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  Your credentials and CBT examination performance are currently before the Registrar and Provost's committee. Final admission decisions will be published here shortly.
                </p>
              </div>
            </div>
          </div>
        )}

        {applicant.status === 'NOT ADMITTED' && (
          <div className="bg-red-50 border-2 border-red-300 rounded-3xl p-6 text-red-950 shadow-sm no-print">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-200 text-red-900 rounded-2xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="inline-block px-3 py-0.5 bg-red-200 text-red-900 text-[10px] font-black uppercase rounded-full tracking-wider">
                  Status: NOT ADMITTED
                </div>
                <h3 className="text-base font-black uppercase font-serif-crest text-red-950">
                  Admission Notification
                </h3>
                <p className="text-xs text-red-900 leading-relaxed">
                  We regret to inform you that admission was not granted for the {COLLEGE_CONFIG.CURRENT_SESSION} academic session. We wish you success in your future academic pursuits.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION A: DOWNLOAD APPLICATION PDF                      */}
        {/* ======================================================== */}
        <section id="section-application-pdf" className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 text-[#0a4d2e] rounded-xl font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800">
                  Section A &bull; Admissions Registration
                </span>
                <h2 className="text-xl font-black text-slate-900 uppercase font-serif-crest">
                  Download Application PDF
                </h2>
              </div>
            </div>

            {isBursarCleared ? (
              <a
                href={`/applicant/printout?app_no=${encodeURIComponent(applicant.formNo)}`}
                className="px-4 py-2 bg-[#0a4d2e] hover:bg-[#073822] text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto"
              >
                <Download className="w-4 h-4 text-emerald-300" />
                <span>Download / Print Application PDF</span>
              </a>
            ) : (
              <button
                disabled
                className="px-4 py-2 bg-slate-200 text-slate-400 rounded-xl text-xs font-bold cursor-not-allowed flex items-center gap-2 self-start sm:self-auto"
              >
                <Printer className="w-4 h-4" />
                <span>Locked &bull; Awaiting Bursar Clearance</span>
              </button>
            )}
          </div>

          {!isBursarCleared ? (
            /* LOCKED NOTIFICATION: Applicant CANNOT download application printout if not cleared */
            <div className="p-8 text-center bg-amber-50 rounded-2xl border-2 border-amber-300 space-y-4">
              <Clock className="w-12 h-12 text-amber-600 mx-auto" />
              <div className="space-y-1">
                <div className="inline-block px-3 py-1 bg-amber-200 text-amber-950 text-[10px] font-black uppercase rounded-full tracking-wider">
                  Status: PENDING_BURSAR
                </div>
                <h3 className="text-lg font-black uppercase text-amber-950 font-serif-crest">
                  Awaiting Bursar Clearance
                </h3>
                <p className="text-xs text-amber-900 max-w-lg mx-auto leading-relaxed">
                  Candidate <strong>{applicant.fullName}</strong> cannot download or print the official registration slip yet because the <strong>₦15,000 Screening Fee</strong> payment receipt has not been cleared by the College Bursar.
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs text-slate-700 max-w-md mx-auto">
                Once the College Bursar audits your uploaded payment proof and clicks <strong>CLEAR</strong>, your official stamped application slip and CBT exam number will immediately become available for print at <code>/applicant/printout</code>.
              </div>
            </div>
          ) : (
            /* Printable Official Application Form Body */
            <div className="p-6 border-2 border-slate-300 rounded-2xl bg-slate-50/40 space-y-6 text-xs text-slate-800">
              {/* Header / Letterhead */}
              <div className="text-center pb-4 border-b-2 border-emerald-950 flex flex-col items-center justify-center">
                <CollegeLogo size="sm" />
                <h3 className="text-base sm:text-lg font-black text-emerald-950 uppercase font-serif-crest tracking-tight mt-1">
                  Labe College of Nursing Sciences, Gboko
                </h3>
              <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                Official Undergraduate Application &amp; Registration Summary
              </p>
              <p className="text-[10px] text-slate-500">
                P.M.B. 104, Gboko, Benue State &bull; Academic Session: {COLLEGE_CONFIG.CURRENT_SESSION}
              </p>
            </div>

            {/* Candidate Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              <div className="md:col-span-2 space-y-3">
                <div className="grid grid-cols-2 gap-3 p-3 bg-white rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Application Form No</span>
                    <span className="font-mono font-black text-sm text-[#0a4d2e]">{applicant.formNo}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">JAMB Registration No</span>
                    <span className="font-mono font-bold text-sm text-slate-900">{applicant.jambRegNo} ({applicant.jambScore} Pts)</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Full Name</span>
                    <span className="font-bold text-slate-900 uppercase">{applicant.fullName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Gender &amp; DOB</span>
                    <span className="text-slate-800">{applicant.gender} &bull; {applicant.dob}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">State &amp; LGA of Origin</span>
                    <span className="text-slate-800">{applicant.stateOfOrigin} State &bull; {applicant.lga}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Programme Applied</span>
                    <span className="font-bold text-emerald-900">{applicant.program}</span>
                  </div>
                </div>

                {/* O-Level Results */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-600 block">Submitted O-Level Credentials:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[11px]">
                    <div className="p-1.5 bg-slate-50 rounded border border-slate-200">
                      <span className="block font-semibold text-slate-500 text-[10px]">English</span>
                      <strong className="text-emerald-800 font-mono">B3 (Credit)</strong>
                    </div>
                    <div className="p-1.5 bg-slate-50 rounded border border-slate-200">
                      <span className="block font-semibold text-slate-500 text-[10px]">Mathematics</span>
                      <strong className="text-emerald-800 font-mono">C4 (Credit)</strong>
                    </div>
                    <div className="p-1.5 bg-slate-50 rounded border border-slate-200">
                      <span className="block font-semibold text-slate-500 text-[10px]">Biology</span>
                      <strong className="text-emerald-800 font-mono">A1 (Distinction)</strong>
                    </div>
                    <div className="p-1.5 bg-slate-50 rounded border border-slate-200">
                      <span className="block font-semibold text-slate-500 text-[10px]">Chemistry</span>
                      <strong className="text-emerald-800 font-mono">B2 (Credit)</strong>
                    </div>
                    <div className="p-1.5 bg-slate-50 rounded border border-slate-200">
                      <span className="block font-semibold text-slate-500 text-[10px]">Physics</span>
                      <strong className="text-emerald-800 font-mono">C5 (Credit)</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Passport & QR / Stamp */}
              <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-200 text-center space-y-3">
                <div className="w-32 h-36 bg-slate-100 rounded-xl border-2 border-emerald-900 overflow-hidden shadow-inner flex items-center justify-center">
                  {applicant.passportPhotoUrl ? (
                    <img src={applicant.passportPhotoUrl} alt={applicant.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-slate-300" />
                  )}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Application Registered: {applicant.createdAt || '2026-02-10'}
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">
                  Verified Application
                </span>
              </div>
            </div>
          </div>
        )}
      </section>

        {/* ======================================================== */}
        {/* SECTION B: PRINT BURSAR CLEARANCE SLIP                   */}
        {/* ======================================================== */}
        <section id="section-bursar-slip" className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl font-bold">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800">
                  Section B &bull; College Bursary
                </span>
                <h2 className="text-xl font-black text-slate-900 uppercase font-serif-crest">
                  Print Bursar Clearance Slip
                </h2>
              </div>
            </div>

            <button
              onClick={handlePrint}
              disabled={!isBursarCleared}
              className={`px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto ${
                isBursarCleared
                  ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 font-black'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>Print Bursar Clearance Slip</span>
            </button>
          </div>

          {/* Clearance Status Display */}
          {isBursarCleared ? (
            <div className="p-6 border-2 border-emerald-500 rounded-2xl bg-emerald-50/50 space-y-6 text-xs text-slate-800">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-emerald-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="font-black text-sm uppercase text-emerald-950">
                    Official Bursary Audit &amp; Screening Clearance Slip
                  </span>
                </div>
                <span className="px-3 py-1 bg-emerald-600 text-white font-mono font-bold rounded-full text-xs">
                  STATUS: CLEARED
                </span>
              </div>

              {/* Clearance Detail Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 bg-white rounded-xl border border-emerald-300">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Candidate Exam Number</span>
                  <span className="font-mono font-black text-base text-[#0a4d2e]">{examNumber}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-emerald-300">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Clearance Date</span>
                  <span className="font-bold text-slate-800">
                    {applicant.bursarClearedDate || applicant.bursar_clearance_date?.substring(0, 10) || new Date().toISOString().split('T')[0]}
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-emerald-300">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Audited Amount</span>
                  <span className="font-mono font-bold text-slate-800">₦15,000 (Screening &amp; CBT Fee)</span>
                </div>
              </div>

              {/* Clearance Statement & Signatures */}
              <div className="p-4 bg-white rounded-xl border border-emerald-200 text-slate-700 leading-relaxed text-xs">
                This certifies that <strong>{applicant.fullName}</strong> (Application No: <code>{applicant.formNo}</code>) has fulfilled all institutional financial obligations for the 2026/2027 screening exercise. The candidate is hereby authorized to sit for the CBT Attitude Test using the assigned Examination Number: <strong>{examNumber}</strong>.
              </div>

              <div className="pt-2 flex justify-between items-end">
                <div>
                  <div className="w-40 border-b-2 border-slate-900 pb-1 font-serif-crest font-bold text-slate-900">
                    Dr. Isaac M. Agber
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">College Bursar</span>
                  <span className="text-[9px] text-slate-400">Finance &amp; Accounts Division</span>
                </div>
                <div className="w-20 h-20 border-2 border-emerald-800 rounded-full flex flex-col items-center justify-center text-[8px] font-black text-emerald-900 uppercase text-center p-1">
                  <span>BURSARY</span>
                  <span>LCNS GBOKO</span>
                  <span>CLEARED</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
                <Clock className="w-5 h-5 text-amber-700" />
                <span className="uppercase tracking-wide font-black">Awaiting Bursar Clearance - Pay Screening Fee</span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                Your clearance slip cannot be printed because your ₦15,000 screening fee payment has not yet been audited and approved by the Bursary.
              </p>
              <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs text-slate-700">
                Please ensure you have uploaded your bank deposit teller or Remita payment receipt on the portal, or visit the Bursary department at the College Administrative Block.
              </div>
            </div>
          )}
        </section>

        {/* ======================================================== */}
        {/* SECTION C: CBT ATTITUDE TEST                             */}
        {/* ======================================================== */}
        <section id="section-cbt-test" className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 text-[#0a4d2e] rounded-xl font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#0a4d2e]">
                  Section C &bull; Computer Based Test
                </span>
                <h2 className="text-xl font-black text-slate-900 uppercase font-serif-crest">
                  CBT Attitude Test
                </h2>
              </div>
            </div>

            {activeTest && (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-900 font-bold text-xs rounded-full uppercase tracking-wider self-start sm:self-auto">
                {activeTest.title} &bull; {activeTest.duration_minutes} Mins
              </span>
            )}
          </div>

          {/* Test Status Box */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-[#0a4d2e] text-white space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                  Active Examination
                </span>
                <h3 className="text-xl font-black uppercase tracking-wide mt-0.5">
                  {activeTest?.title || 'Attitude Test'}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Duration: {activeTest?.duration_minutes || 30} Minutes &bull; Timed Computer-Based Aptitude &amp; Attitude Screening
                </p>
              </div>

              {/* Status pill */}
              <div>
                {candidateResult ? (
                  <span className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-bold rounded-xl text-xs uppercase flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Test Completed</span>
                  </span>
                ) : isBursarCleared ? (
                  <span className="px-3 py-1.5 bg-amber-500/20 border border-amber-400 text-amber-300 font-bold rounded-xl text-xs uppercase flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Eligible to Sit</span>
                  </span>
                ) : (
                  <span className="px-3 py-1.5 bg-red-500/20 border border-red-400 text-red-300 font-bold rounded-xl text-xs uppercase flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span>Awaiting Bursar Clearance</span>
                  </span>
                )}
              </div>
            </div>

            {/* If test was completed, show score if published */}
            {candidateResult ? (
              <div className="p-4 bg-white/10 rounded-2xl border border-white/20 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                    CBT Result Status:
                  </span>
                  {candidateResult.is_published ? (
                    <span className="px-2.5 py-0.5 bg-emerald-500 text-slate-950 font-black text-xs rounded-full uppercase">
                      Official Result Published
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 font-bold text-xs rounded-full uppercase">
                      Under Senate Ratification (Pending Publication)
                    </span>
                  )}
                </div>

                {candidateResult.is_published ? (
                  <div className="flex items-baseline gap-4 pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Candidate Score</span>
                      <span className="text-3xl font-black font-mono text-amber-400">
                        {candidateResult.score} / {candidateResult.total}
                      </span>
                    </div>
                    <div className="text-xs text-emerald-300 font-bold">
                      Percentage: {Math.round((candidateResult.score / candidateResult.total) * 100)}%
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-300 leading-relaxed">
                    You have successfully submitted your CBT Attitude Test on{' '}
                    <strong>{candidateResult.submitted_at?.substring(0, 16) || 'recently'}</strong>. Official scores will be displayed once published by the Registrar and Provost.
                  </p>
                )}
              </div>
            ) : isBursarCleared ? (
              <div className="pt-2">
                <a
                  href={`/applicant/cbt/${activeTest?.id || 'test-attitude-01'}?app_no=${encodeURIComponent(applicant.formNo)}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start CBT Attitude Test Now</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            ) : (
              <p className="text-xs text-amber-200">
                You must obtain Bursar clearance before taking the CBT Attitude Test.
              </p>
            )}
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION D: SCREENING & INTERVIEW SCORES                  */}
        {/* ======================================================== */}
        <section id="section-screening-scores" className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-100 text-purple-800 rounded-xl font-bold">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-purple-800">
                  Section D &bull; Academic Board Ratification
                </span>
                <h2 className="text-xl font-black text-slate-900 uppercase font-serif-crest">
                  Screening &amp; Interview Scores
                </h2>
              </div>
            </div>

            {candidateScreening && candidateScreening.is_published && (
              <span className="px-3 py-1 bg-purple-100 text-purple-900 font-bold text-xs rounded-full uppercase tracking-wider self-start sm:self-auto">
                Official Scores Released
              </span>
            )}
          </div>

          {candidateScreening ? (
            <div className="space-y-4">
              {candidateScreening.is_published ? (
                <div className="p-6 bg-purple-50/70 border-2 border-purple-300 rounded-2xl space-y-5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-bold uppercase text-purple-900">
                      Overall Assessment Composite Score
                    </span>
                    <span className="px-3 py-1 bg-purple-700 text-white font-mono font-bold text-xs rounded-full">
                      TOTAL: {candidateScreening.total_score}%
                    </span>
                  </div>

                  {/* 3 Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-white rounded-xl border border-purple-200 shadow-xs">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Screening Score</span>
                      <span className="text-2xl font-black font-mono text-[#0a4d2e]">
                        {candidateScreening.screening_score}%
                      </span>
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-purple-200 shadow-xs">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Interview Score</span>
                      <span className="text-2xl font-black font-mono text-purple-700">
                        {candidateScreening.interview_score}%
                      </span>
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-purple-200 shadow-xs">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Composite Total</span>
                      <span className="text-2xl font-black font-mono text-amber-600">
                        {candidateScreening.total_score}%
                      </span>
                    </div>
                  </div>

                  {/* Remarks */}
                  {candidateScreening.remarks && (
                    <div className="p-3.5 bg-white rounded-xl border border-purple-200 text-xs text-slate-700">
                      <span className="font-bold text-slate-900 block mb-0.5">Faculty Board Remarks:</span>
                      <p>{candidateScreening.remarks}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-[#0a4d2e] font-bold text-sm">
                    <Clock className="w-5 h-5 text-[#16a34a]" />
                    <span>Screening Assessment Completed &bull; Scores Pending Publication</span>
                  </div>
                  <p className="text-xs text-[#0a4d2e] leading-relaxed">
                    Your physical screening and interview exercise records have been received and are currently undergoing Senate collation and verification. Scores will appear here once officially published.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2">
              <Clock className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">Screening &amp; Interview Scheduled</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Candidate <strong>{applicant.fullName}</strong> is slated for the physical screening &amp; oral interview at the College Conference Hall. Results will be uploaded here upon faculty completion.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* ACCEPTANCE FEE PAYMENT MODAL */}
      {showAcceptanceFeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm no-print">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-r from-emerald-950 via-[#0a4d2e] to-emerald-900 text-white p-6 flex items-center justify-between border-b border-emerald-800">
              <div className="flex items-center gap-3">
                <CollegeLogo size="sm" />
                <div>
                  <h3 className="font-black uppercase font-serif-crest text-sm tracking-wide">
                    Admission Acceptance Fee
                  </h3>
                  <p className="text-[11px] text-emerald-300">
                    {applicant.fullName} &bull; {applicant.formNo}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAcceptanceFeeModal(false);
                  setAcceptanceFeePaid(false);
                }}
                className="p-1.5 text-emerald-300 hover:text-white rounded-xl hover:bg-emerald-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {!acceptanceFeePaid ? (
                <>
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2 text-xs text-slate-800">
                    <div className="flex justify-between border-b border-emerald-100 pb-1.5">
                      <span className="text-slate-600 font-bold">Admitted Programme:</span>
                      <span className="font-bold text-[#0a4d2e]">{applicant.courseChoice1 || applicant.program}</span>
                    </div>
                    <div className="flex justify-between border-b border-emerald-100 pb-1.5">
                      <span className="text-slate-600 font-bold">Academic Session:</span>
                      <span className="font-bold text-slate-900">{COLLEGE_CONFIG.CURRENT_SESSION}</span>
                    </div>
                    <div className="flex justify-between border-b border-emerald-100 pb-1.5">
                      <span className="text-slate-600 font-bold">Payment Description:</span>
                      <span className="text-slate-800">Non-Refundable Acceptance &amp; Provisional Matriculation Fee</span>
                    </div>
                    <div className="flex justify-between items-baseline pt-1">
                      <span className="text-slate-700 font-black uppercase text-xs">Total Amount Payable:</span>
                      <span className="text-xl font-black text-[#0a4d2e] font-mono">₦50,000.00</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                    <strong>College Bank Account Details:</strong><br />
                    Bank: <strong>Zenith Bank PLC</strong> &bull; Account Number: <strong>1228491024</strong><br />
                    Account Name: <strong>Labe College of Nursing Sciences Gboko</strong>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      disabled={payingFee}
                      onClick={handleProcessAcceptancePayment}
                      className="w-full py-3.5 px-4 bg-[#0a4d2e] hover:bg-[#06321e] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      {payingFee ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Processing Electronic Transaction...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 text-emerald-300" />
                          <span>Pay ₦50,000 via Remita / Card / Bank</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAcceptanceFeeModal(false)}
                      className="w-full py-2.5 text-slate-500 hover:text-slate-800 text-xs font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-4 py-2">
                  <div className="w-16 h-16 bg-emerald-100 text-[#0a4d2e] rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black uppercase font-serif-crest text-[#0a4d2e]">
                      Acceptance Fee Paid Successfully!
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Official College Electronic Receipt has been generated for candidate <strong>{applicant.fullName}</strong>.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5 text-left">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">Receipt Number:</span>
                      <span className="font-mono font-bold text-[#0a4d2e]">{acceptanceReceiptNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">Amount Paid:</span>
                      <span className="font-mono font-bold text-slate-900">₦50,000.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">Status:</span>
                      <span className="font-bold text-emerald-800">CONFIRMED &amp; RECONCILED</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="flex-1 py-3 px-4 bg-[#0a4d2e] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
                    >
                      <Printer className="w-4 h-4 text-emerald-300" />
                      <span>Print Acceptance Receipt</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAcceptanceFeeModal(false);
                        setAcceptanceFeePaid(false);
                      }}
                      className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


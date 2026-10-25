import React, { useState, useEffect, useRef } from 'react';
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
  ShieldCheck,
  User,
  CreditCard,
  Upload,
  X,
  Building,
} from 'lucide-react';

export const ApplicantDashboard: React.FC = () => {
  const [appNo, setAppNo] = useState<string>('');
  const [inputAppNo, setInputAppNo] = useState<string>('');
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [cbtTests, setCbtTests] = useState<CBTTest[]>([]);
  const [cbtResults, setCbtResults] = useState<CBTResult[]>([]);
  const [screeningScores, setScreeningScores] = useState<ScreeningScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingFee, setUploadingFee] = useState(false);
  const [feeSnap, setFeeSnap] = useState<string | null>(null);
  const [showAcceptanceFeeModal, setShowAcceptanceFeeModal] = useState(false);
  const [payingFee, setPayingFee] = useState(false);
  const [acceptanceFeePaid, setAcceptanceFeePaid] = useState(false);
  const [acceptanceReceiptNo, setAcceptanceReceiptNo] = useState<string>('');
  const printRef = useRef<HTMLDivElement>(null);

  // NEW - INTERVIEW FINAL RESULT STATE - ADDED
  const [interviewFinal, setInterviewFinal] = useState<any>(null);

  // Load from URL ?app_no=
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryAppNo = params.get('app_no') || params.get('form_no') || localStorage.getItem('lcns_current_app_no') || '';
    if (queryAppNo) {
      setInputAppNo(queryAppNo);
      loadApplicant(queryAppNo);
    } else {
      setLoading(false);
    }
  }, []);

  const loadApplicant = async (targetAppNo: string) => {
    if (!targetAppNo.trim()) return;
    setLoading(true);
    const allApplicants = StorageService.getApplicants();
    let found = allApplicants.find((a) => 
      a.formNo.toLowerCase() === targetAppNo.toLowerCase() ||
      a.email.toLowerCase() === targetAppNo.toLowerCase() ||
      (a.examNumber && a.examNumber.toLowerCase() === targetAppNo.toLowerCase()) ||
      (a.exam_number && a.exam_number.toLowerCase() === targetAppNo.toLowerCase()) ||
      a.jambRegNo.toLowerCase() === targetAppNo.toLowerCase()
    ) || null;

    if (found) {
      setApplicant(found);
      setAppNo(found.formNo);
      localStorage.setItem('lcns_current_app_no', found.formNo);
      setFeeSnap((found as any).screeningFeeSnap || null);
      
      // NEW - Load interview final result for this applicant
      try {
        const keysToTry = [
          `lcns_applicant_final_result_${found.formNo}`,
          `lcns_applicant_final_${found.formNo}`,
          `lcns_interview_result_${found.formNo}`,
          `lcns_interview_${found.formNo}`,
          `lcns_final_${found.formNo}`,
          `lcns_applicant_final_result_${targetAppNo}`,
        ];
        for (const k of keysToTry) {
          const v = localStorage.getItem(k);
          if (v) { setInterviewFinal(JSON.parse(v)); break; }
        }
        // Also check global arrays
        const allScores = JSON.parse(localStorage.getItem('lcns_interview_scores') || localStorage.getItem('lcns_applicant_interview_scores') || localStorage.getItem('lcns_final_admission_scores') || '[]');
        if (Array.isArray(allScores)) {
          const match = allScores.find((s:any) => 
            s.applicationNumber === found.formNo || 
            s.application_number === found.formNo ||
            s.formNo === found.formNo ||
            s.form_no === found.formNo ||
            s.examNumber === found.exam_number ||
            s.exam_number === found.exam_number
          );
          if (match) setInterviewFinal(match);
        }
      } catch {}
    } else {
      setApplicant(null);
    }

    // Load CBT & Scores
    setCbtTests(StorageService.getCBTTests());
    setCbtResults(StorageService.getCBTResults());
    setScreeningScores(StorageService.getScreeningScores());

    // Supabase sync
    try {
      const sb = getSupabase();
      if (sb && targetAppNo) {
        const { data: appData } = await sb.from('applications').select('*').or(`form_no.ilike.%${targetAppNo}%,email.ilike.%${targetAppNo}%,exam_number.ilike.%${targetAppNo}%`).limit(1);
        if (appData && appData[0] && found) {
          const row = appData[0];
          const merged = {
            ...found,
            bursar_cleared: row.bursar_cleared ?? found.bursar_cleared,
            bursarCleared: row.bursar_cleared ?? found.bursarCleared,
            exam_number: row.exam_number || found.exam_number,
            examNumber: row.exam_number || found.examNumber,
            status: row.status || found.status,
          };
          setApplicant(merged as any);
        }
        const { data: dbTests } = await sb.from('cbt_tests').select('*').eq('is_published', true);
        if (dbTests?.length) setCbtTests(dbTests);
        const { data: dbResults } = await sb.from('cbt_results').select('*');
        if (dbResults?.length) setCbtResults(dbResults);
        const { data: dbScores } = await sb.from('screening_scores').select('*');
        if (dbScores?.length) setScreeningScores(dbScores);
        
        // NEW - Try Supabase final scores
        try {
          const { data: finalDb } = await sb.from('applicant_results').select('*').or(`application_number.ilike.%${targetAppNo}%,form_no.ilike.%${targetAppNo}%`).limit(1);
          if (finalDb && finalDb[0]) {
            setInterviewFinal(finalDb[0]);
          }
        } catch {}
      }
    } catch (e) { console.warn(e); }
    setLoading(false);
  };

  const isBursarCleared = Boolean(applicant && (applicant.bursar_cleared || applicant.bursarCleared || applicant.bursarStatus === 'CLEARED' || applicant.status === 'BURSAR_CLEARED' || applicant.status === 'ADMISSION_IN_PROGRESS' || applicant.status === 'ADMITTED'));
  const examNumber = applicant?.exam_number || applicant?.examNumber || '';

  const candidateResult = cbtResults.find((r) => applicant && (r.application_number?.toLowerCase() === applicant.formNo.toLowerCase() || r.exam_number?.toLowerCase() === examNumber.toLowerCase()));
  const candidateScreening = screeningScores.find((s) => applicant && s.application_number?.toLowerCase() === applicant.formNo.toLowerCase());

  // ===== PDF DOWNLOAD WITH PASSPORT + CATHOLIC DIOCESE =====
  const handleDownloadApplicationPDF = () => {
    if (!applicant) return;
    const passport = applicant.passportPhotoUrl || (applicant as any).passport || '';
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>${applicant.formNo} - Application Form</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 20px; color: #111; font-size: 12px; }
            .header { text-align: center; border-bottom: 3px double #0a4d2e; padding-bottom: 12px; margin-bottom: 16px; }
            .header h1 { margin: 0; font-size: 18px; font-weight: 900; text-transform: uppercase; color: #0a4d2e; }
            .header h2 { margin: 2px 0; font-size: 12px; font-weight: 800; color: #b45309; text-transform: uppercase; }
            .header p { margin: 0; font-size: 10px; color: #555; }
            .passport-box { float: right; width: 120px; height: 140px; border: 2px solid #0a4d2e; overflow: hidden; margin-left: 12px; }
            .passport-box img { width: 100%; height: 100%; object-fit: cover; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 12px 0; }
            .field { border: 1px solid #ddd; padding: 6px 8px; border-radius: 6px; background: #f9fafb; }
            .label { font-size: 9px; font-weight: 700; color: #666; text-transform: uppercase; display: block; }
            .value { font-size: 12px; font-weight: 700; color: #111; }
            .stamp { width: 110px; height: 110px; border: 2px dashed #0a4d2e; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 9px; font-weight: 900; color: #0a4d2e; margin-top: 20px; }
            .footer { margin-top: 30px; border-top: 1px solid #ccc; padding-top: 10px; display: flex; justify-content: space-between; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Labe College of Nursing Sciences, Gboko</h1>
            <h2>Catholic Diocese of Gboko</h2>
            <p>P.M.B. 104, Off Gboko Hill Road, Opposite Sinai College, Gboko, Benue State • 2026/2027 Academic Session</p>
            <p style="font-weight:800; margin-top:6px; color:#0a4d2e;">OFFICIAL APPLICATION FORM - APPLICANT COPY</p>
          </div>

          <div class="passport-box">
            ${passport ? `<img src="${passport}" />` : `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#999;">NO PASSPORT</div>`}
          </div>

          <div style="font-size:13px; font-weight:800; margin-bottom:8px;">Candidate: ${applicant.fullName} • Form No: ${applicant.formNo}</div>
          
          <div class="grid">
            <div class="field"><span class="label">Form Number</span><span class="value">${applicant.formNo}</span></div>
            <div class="field"><span class="label">JAMB Reg / Score</span><span class="value">${applicant.jambRegNo} - ${applicant.jambScore} pts</span></div>
            <div class="field"><span class="label">Full Name</span><span class="value">${applicant.fullName}</span></div>
            <div class="field"><span class="label">Gender / DOB</span><span class="value">${applicant.gender} / ${applicant.dob}</span></div>
            <div class="field"><span class="label">State / LGA</span><span class="value">${applicant.stateOfOrigin} / ${applicant.lga}</span></div>
            <div class="field"><span class="label">Phone / Email</span><span class="value">${applicant.phone} / ${applicant.email}</span></div>
            <div class="field"><span class="label">Programme Applied</span><span class="value">${applicant.program}</span></div>
            <div class="field"><span class="label">Examination Number</span><span class="value" style="color:#0a4d2e;">${examNumber || 'AWAITING BURSAR CLEARANCE'}</span></div>
            <div class="field"><span class="label">Bursar Status</span><span class="value">${isBursarCleared ? 'CLEARED' : 'PENDING - SCREENING FEE ₦15,000'}</span></div>
            <div class="field"><span class="label">Admission Status</span><span class="value">${applicant.status}</span></div>
          </div>

          <div style="margin-top:16px;">
            <strong>O-Level: </strong> English B3, Mathematics C4, Biology A1, Chemistry B2, Physics C5 (Submitted) • Next of Kin: ${(applicant as any).nextOfKin || 'N/A'}
          </div>

          <div class="footer">
            <div>
              <div style="width:160px; border-bottom:1px solid #111; height:20px;"></div>
              <span style="font-size:10px; font-weight:700;">Candidate Signature</span>
            </div>
            <div style="text-align:center;">
              <div class="stamp">LCNS GBOKO<br/>REGISTRAR<br/>OFFICIAL STAMP<br/>2026/2027</div>
              <div style="margin-top:6px; font-size:10px; font-weight:800;">Barr. Timothy J. Iorbee<br/>Registrar</div>
            </div>
          </div>

          <p style="text-align:center; margin-top:20px; font-size:9px; color:#666;">This document is system generated. Valid only with College stamp and Bursar clearance. Labe College of Nursing Sciences, Gboko - Catholic Diocese of Gboko - Excellence in Nursing Education.</p>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 600);
  };

  const handleUploadScreeningFee = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !applicant) return;
    setUploadingFee(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setFeeSnap(base64);
      // Save to applicant
      const all = StorageService.getApplicants();
      const updated = all.map((a) => a.formNo === applicant.formNo ? { ...a, screeningFeeSnap: base64, screeningFeeUploaded: true, screeningFeeDate: new Date().toISOString() } as any : a);
      StorageService.saveApplicants(updated);
      setApplicant({ ...applicant, screeningFeeSnap: base64 } as any);
      setUploadingFee(false);
    };
    reader.readAsDataURL(file);
  };

  const handleProcessAcceptancePayment = () => {
    if (!applicant) return;
    setPayingFee(true);
    setTimeout(() => {
      const rec = `LCNS-ACC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setAcceptanceReceiptNo(rec);
      setAcceptanceFeePaid(true);
      setPayingFee(false);
      const payments = StorageService.getPayments();
      payments.unshift({
        id: 'acc-' + Date.now(),
        receiptNo: rec,
        rrr: `2409-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        matricOrFormNo: applicant.formNo,
        payerName: applicant.fullName,
        feeType: 'Acceptance Fee (2026/2027)',
        amount: 50000,
        session: COLLEGE_CONFIG.CURRENT_SESSION,
        semester: 'First',
        paymentDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
        paymentMethod: 'Remita / Card',
        status: 'PAID',
        verifiedBy: 'Dr. Isaac M. Agber (Bursar)',
      } as any);
      StorageService.savePayments(payments);
    }, 1000);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-6 h-6 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin" /></div>;
  }

  // NO APPLICANT - Show entry box to return with App No
  if (!applicant) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full space-y-5 border border-slate-200">
          <div className="text-center">
            <CollegeLogo size="md" />
            <h2 className="text-lg font-black uppercase mt-2">Applicant Dashboard Login</h2>
            <p className="text-xs text-slate-500">Enter your Application Form No to return to your dashboard</p>
          </div>
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            <input type="text" value={inputAppNo} onChange={(e) => setInputAppNo(e.target.value)} placeholder="LCNS/APP/2026/..." className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-800" onKeyDown={(e) => e.key === 'Enter' && loadApplicant(inputAppNo)} />
          </div>
          <button onClick={() => loadApplicant(inputAppNo)} className="w-full py-3 bg-[#0a4d2e] text-white rounded-xl font-bold text-xs uppercase">Open My Dashboard</button>
          <p className="text-[11px] text-center text-slate-400">Labe College of Nursing Sciences, Gboko<br/><span className="text-amber-700 font-bold">Catholic Diocese of Gboko</span></p>
        </div>
      </div>
    );
  }

  const publishedCBTTests = cbtTests.filter(t => t.is_published || t.is_active);

  return (
    <div className="min-h-screen bg-slate-100/70 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER WITH CATHOLIC DIOCESE */}
        <div className="bg-gradient-to-r from-emerald-950 via-[#0a4d2e] to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-emerald-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <CollegeLogo size="md" />
              <div>
                <h1 className="text-xl sm:text-2xl font-black uppercase font-serif">Labe College of Nursing Sciences, Gboko</h1>
                <p className="text-[11px] font-black tracking-widest text-amber-300 uppercase">Catholic Diocese of Gboko</p>
                <p className="text-xs text-emerald-200 mt-1">{applicant.fullName} • <span className="font-mono text-white">{applicant.formNo}</span> • {applicant.program}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="bg-emerald-950/80 p-2.5 rounded-2xl border border-emerald-800 text-[11px]">
                <span className="text-emerald-300 block font-bold uppercase">Exam No</span>
                <span className="font-mono font-black text-amber-300">{examNumber || 'PENDING'}</span>
              </div>
              <div className="bg-emerald-950/80 p-2.5 rounded-2xl border border-emerald-800 text-[11px]">
                <span className="text-emerald-300 block font-bold uppercase">Status</span>
                <span className="font-black text-white uppercase">{applicant.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* QUICK RETURN BOX */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row gap-3 items-center shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input value={inputAppNo} onChange={(e) => setInputAppNo(e.target.value)} placeholder="Enter another Application No to switch dashboard" className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs" onKeyDown={(e) => e.key === 'Enter' && loadApplicant(inputAppNo)} />
          </div>
          <button onClick={() => loadApplicant(inputAppNo)} className="px-5 py-2.5 bg-[#0a4d2e] text-white rounded-xl text-xs font-bold uppercase w-full sm:w-auto">Open Dashboard</button>
          <button onClick={handleDownloadApplicationPDF} className="px-5 py-2.5 bg-amber-500 text-slate-950 rounded-xl text-xs font-black uppercase flex items-center gap-2 w-full sm:w-auto justify-center"><Download className="w-4 h-4" />Download Application PDF</button>
        </div>

        {/* NEW - FINAL ADMISSION RESULT BANNER - INTERVIEW SCORE + TOTAL + REMARKS - SHOW ONLY IF PUBLISHED */}
        {interviewFinal && (interviewFinal.published !== false) && (
          <div className={`rounded-3xl p-6 shadow-xl border-2 ${ (interviewFinal.remarks === 'PASSED' || interviewFinal.remarks === 'ADMITTED' || interviewFinal.totalScore >= 50 || interviewFinal.total_score >= 50) ? 'bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 border-amber-400 text-white' : 'bg-gradient-to-r from-red-950 via-red-900 to-red-950 border-red-300 text-white' }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <span className={`px-3 py-1 font-black text-xs rounded-full uppercase ${ (interviewFinal.remarks === 'PASSED' || interviewFinal.remarks === 'ADMITTED') ? 'bg-amber-400 text-slate-950' : 'bg-red-400 text-white'}`}>
                  {interviewFinal.remarks === 'PASSED' || interviewFinal.remarks === 'ADMITTED' ? '✅ ADMISSION OFFERED - PASSED' : interviewFinal.remarks || 'RESULT PUBLISHED'}
                </span>
                <h2 className="text-xl font-black uppercase mt-2 text-amber-300">
                  {interviewFinal.remarks === 'PASSED' || interviewFinal.remarks === 'ADMITTED' ? `Congratulations ${applicant.fullName} - You Passed!` : `Result Published - ${applicant.fullName}`}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  <div className="bg-white/10 backdrop-blur p-3 rounded-xl border border-white/20">
                    <span className="text-[10px] font-bold uppercase text-emerald-200 block">CBT Score</span>
                    <span className="text-xl font-black font-mono text-white">{interviewFinal.cbtScore ?? interviewFinal.cbt_score ?? candidateResult?.score ?? '-'}</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur p-3 rounded-xl border border-white/20">
                    <span className="text-[10px] font-bold uppercase text-amber-200 block">Interview Score</span>
                    <span className="text-xl font-black font-mono text-amber-300">{interviewFinal.interviewScore ?? interviewFinal.interview_score ?? '-'}</span>
                  </div>
                  <div className="bg-amber-400 text-slate-950 p-3 rounded-xl border-2 border-white">
                    <span className="text-[10px] font-bold uppercase block">Total Score</span>
                    <span className="text-2xl font-black font-mono">{interviewFinal.totalScore ?? interviewFinal.total_score ?? ((interviewFinal.cbtScore || 0) + (interviewFinal.interviewScore || 0))}</span>
                  </div>
                  <div className={`p-3 rounded-xl border-2 ${ (interviewFinal.remarks === 'PASSED' || interviewFinal.remarks === 'ADMITTED') ? 'bg-green-500 text-white border-white' : 'bg-red-500 text-white border-white'}`}>
                    <span className="text-[10px] font-bold uppercase block">Remarks</span>
                    <span className="text-lg font-black">{interviewFinal.remarks || ( (interviewFinal.totalScore||0) >= 50 ? 'PASSED' : 'FAILED' )}</span>
                  </div>
                </div>
                <p className="text-xs text-emerald-100 mt-3">
                  Published by: {interviewFinal.publishedBy || interviewFinal.published_by || 'Provost / Registrar'} on {interviewFinal.publishedAt ? new Date(interviewFinal.publishedAt).toLocaleDateString() : new Date().toLocaleDateString()} • 
                  { (interviewFinal.remarks === 'PASSED' || interviewFinal.remarks === 'ADMITTED') ? ' Proceed to pay acceptance fee and print admission letter.' : ' Thank you for applying.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ADMITTED BANNER */}
        {applicant.status === 'ADMITTED' && (
          <div className="bg-gradient-to-r from-emerald-950 via-[#0a4d2e] to-emerald-900 text-white rounded-3xl p-6 shadow-xl border-2 border-amber-400">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 bg-amber-400 text-slate-950 font-black text-xs rounded-full uppercase">ADMITTED - Congratulations!</span>
                <h2 className="text-xl font-black uppercase mt-2 text-amber-300">Congratulations you have been offered admission into Labe College of Nursing Sciences Gboko</h2>
                <p className="text-xs text-emerald-100 mt-1 max-w-2xl">Candidate <strong>{applicant.fullName}</strong> ({applicant.formNo}) - {applicant.courseChoice1 || applicant.program}. Proceed to CBT Center and print your admission letter and return to school for registrations.</p>
              </div>
              <button onClick={() => setShowAcceptanceFeeModal(true)} className="px-6 py-3 bg-amber-400 text-slate-950 font-black text-xs uppercase rounded-xl flex items-center gap-2"><CreditCard className="w-4 h-4" />Pay Acceptance & Print Letter <ArrowRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        {applicant.status === 'ADMISSION_IN_PROGRESS' && (
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 flex gap-3"><Clock className="w-6 h-6 text-emerald-700 shrink-0" /><div><h4 className="font-black uppercase text-emerald-950 text-sm">Admission In Progress - Under Registrar & Provost Review</h4><p className="text-xs text-emerald-900">Your file is with Registrar / Admission Officer. Final status will change to ADMITTED once approved.</p></div></div>
        )}

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT - Application Form + Passport */}
          <div className="lg:col-span-2 space-y-6">
            {/* SECTION A - APPLICATION FORM PREVIEW WITH PASSPORT */}
            <section ref={printRef} className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black uppercase text-sm flex items-center gap-2"><FileText className="w-5 h-5 text-emerald-800" />Application Form & Passport</h3>
                <button onClick={handleDownloadApplicationPDF} className="px-3 py-1.5 bg-[#0a4d2e] text-white rounded-lg text-xs font-bold flex items-center gap-1"><Printer className="w-4 h-4" />Download PDF</button>
              </div>

              <div className="text-center border-b-2 border-double border-emerald-950 pb-3">
                <h4 className="font-black uppercase text-[#0a4d2e] text-base">Labe College of Nursing Sciences, Gboko</h4>
                <p className="text-[11px] font-black uppercase tracking-widest text-amber-700">Catholic Diocese of Gboko</p>
                <p className="text-[10px] text-slate-500">P.M.B. 104, Gboko, Benue State • 2026/2027 Session • Official Applicant Copy</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-slate-50 border rounded-xl"><span className="text-[10px] text-slate-500 font-bold uppercase block">Form No</span><strong className="font-mono text-[#0a4d2e]">{applicant.formNo}</strong></div>
                  <div className="p-2.5 bg-slate-50 border rounded-xl"><span className="text-[10px] text-slate-500 font-bold uppercase block">JAMB / Score</span><strong>{applicant.jambRegNo} / {applicant.jambScore}</strong></div>
                  <div className="p-2.5 bg-slate-50 border rounded-xl"><span className="text-[10px] text-slate-500 font-bold uppercase block">Full Name</span><strong className="uppercase">{applicant.fullName}</strong></div>
                  <div className="p-2.5 bg-slate-50 border rounded-xl"><span className="text-[10px] text-slate-500 font-bold uppercase block">Programme</span><strong>{applicant.program}</strong></div>
                  <div className="p-2.5 bg-slate-50 border rounded-xl"><span className="text-[10px] text-slate-500 font-bold uppercase block">State / LGA</span><span>{applicant.stateOfOrigin} / {applicant.lga}</span></div>
                  <div className="p-2.5 bg-slate-50 border rounded-xl"><span className="text-[10px] text-slate-500 font-bold uppercase block">Exam Number</span><strong className="font-mono text-amber-700">{examNumber || 'AWAITING BURSAR'}</strong></div>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 bg-white border rounded-xl">
                  <div className="w-28 h-32 bg-slate-100 rounded-xl border-2 border-emerald-800 overflow-hidden flex items-center justify-center">
                    {applicant.passportPhotoUrl || (applicant as any).passport ? <img src={applicant.passportPhotoUrl || (applicant as any).passport} alt="Passport" className="w-full h-full object-cover" /> : <User className="w-12 h-12 text-slate-300" />}
                  </div>
                  <span className="text-[10px] font-bold uppercase text-slate-500">Passport Attached</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">{isBursarCleared ? 'BURSAR CLEARED' : 'PENDING CLEARANCE'}</span>
                </div>
              </div>
            </section>

            {/* SECTION B - SCREENING FEE UPLOAD */}
            <section className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 space-y-4">
              <h3 className="font-black uppercase text-sm flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-amber-600" />Screening Fee - Upload Payment Proof (Dashboard)</h3>
              {!isBursarCleared ? (
                <div className="space-y-3">
                  <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-xs text-amber-900">
                    <strong>Pay ₦15,000 Screening & CBT Fee</strong> to: Zenith Bank PLC - 1018894231 - Labe College of Nursing Sciences Gboko. Upload clear snap of teller / transfer proof here. Bursar will clear and generate your Exam Number.
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 items-center">
                    <label className="flex-1 w-full cursor-pointer">
                      <input type="file" accept="image/*" className="hidden" onChange={handleUploadScreeningFee} />
                      <div className="w-full py-3 px-4 bg-[#0a4d2e] text-white rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-2 hover:bg-[#073822]"><Upload className="w-4 h-4" />{uploadingFee ? 'Uploading...' : 'Upload Screening Fee Snap (Clear Photo)'}</div>
                    </label>
                    {feeSnap && <span className="text-xs font-bold text-emerald-700 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" />Uploaded - Awaiting Bursar</span>}
                  </div>
                  {feeSnap && <div className="mt-3 p-2 border rounded-xl bg-slate-50"><img src={feeSnap} alt="Fee Proof" className="max-h-64 rounded-lg mx-auto" /><p className="text-[11px] text-center text-slate-500 mt-1">Screening Fee Proof - Submitted for Bursar Clearance</p></div>}
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-2xl flex items-center gap-3"><CheckCircle2 className="w-6 h-6 text-emerald-600" /><div><h4 className="font-black uppercase text-emerald-950 text-sm">Bursar Cleared - Exam Number Assigned</h4><p className="text-xs text-emerald-900">Fee cleared on {applicant.bursarClearedDate || new Date().toISOString().split('T')[0]}. Exam No: <strong className="font-mono">{examNumber}</strong>. You can now take CBT and print clearance slip.</p></div></div>
              )}
            </section>

            {/* SECTION C - CBT TESTS SET BY ADMIN / REGISTRAR / PROVOST */}
            <section className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 space-y-4">
              <h3 className="font-black uppercase text-sm flex items-center gap-2"><Sparkles className="w-5 h-5 text-emerald-800" />CBT Tests Set by Admin / Registrar / Provost - Take Test Here</h3>
              {publishedCBTTests.length === 0 ? (
                <p className="text-xs text-slate-500 p-4 bg-slate-50 rounded-xl border">No CBT test published yet. Check back - Tests are set by Admin, Registrar, Provost.</p>
              ) : (
                <div className="space-y-3">
                  {publishedCBTTests.map((test) => {
                    const resultForTest = cbtResults.find(r => r.test_id === test.id && r.application_number?.toLowerCase() === applicant.formNo.toLowerCase());
                    return (
                      <div key={test.id} className="p-4 border-2 border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-300 transition">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">{test.is_active ? 'ACTIVE' : 'PUBLISHED'} • {test.duration_minutes} mins • Set by {test.created_by || 'Admin'}</span>
                          <h4 className="font-black uppercase text-sm mt-1">{test.title}</h4>
                          <p className="text-xs text-slate-600">{test.description || 'Attitude & Clinical Aptitude Screening - Labe College of Nursing Sciences'}</p>
                        </div>
                        {resultForTest ? (
                          <span className="px-3 py-1.5 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-1"><CheckCircle2 className="w-4 h-4" />Done: {resultForTest.score}/{resultForTest.total}</span>
                        ) : isBursarCleared ? (
                          <a href={`/applicant/cbt/${test.id}?app_no=${encodeURIComponent(applicant.formNo)}`} className="px-5 py-2.5 bg-amber-400 text-slate-950 rounded-xl text-xs font-black uppercase flex items-center gap-2">Take Test <ArrowRight className="w-4 h-4" /></a>
                        ) : (
                          <span className="px-3 py-1.5 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold">Locked - Need Bursar Clearance</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* RIGHT - Scores */}
          <div className="space-y-6">
            {/* SCORES PUBLISHED BY PROVOST */}
            <section className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 space-y-4">
              <h3 className="font-black uppercase text-sm flex items-center gap-2"><Award className="w-5 h-5 text-purple-700" />Scores Published by Provost / Registrar</h3>
              
              {/* CBT Score */}
              <div className="p-3 border rounded-xl bg-slate-50">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">CBT Score</span>
                {candidateResult ? (
                  candidateResult.is_published ? <span className="text-lg font-black font-mono text-emerald-800">{candidateResult.score}/{candidateResult.total} ({Math.round(candidateResult.score / candidateResult.total * 100)}%)</span> : <span className="text-xs font-bold text-amber-700">Submitted - Pending Publication by Provost</span>
                ) : <span className="text-xs text-slate-400">Not taken yet</span>}
              </div>

              {/* Screening & Interview Scores from Provost */}
              <div className="p-3 border rounded-xl bg-purple-50/70">
                <span className="text-[10px] font-bold uppercase text-purple-700 block">Screening & Interview Scores (Provost)</span>
                {candidateScreening ? (
                  candidateScreening.is_published ? (
                    <div className="mt-2 space-y-1 text-xs">
                      <div className="flex justify-between"><span>Screening:</span><strong>{candidateScreening.screening_score}%</strong></div>
                      <div className="flex justify-between"><span>Interview:</span><strong>{candidateScreening.interview_score}%</strong></div>
                      <div className="flex justify-between border-t pt-1 mt-1"><span>Total:</span><strong className="font-black text-purple-800">{candidateScreening.total_score}%</strong></div>
                      {candidateScreening.remarks && <p className="text-[11px] text-slate-600 mt-1">Remark: {candidateScreening.remarks}</p>}
                    </div>
                  ) : <span className="text-xs font-bold text-amber-700">Screened - Scores pending publication by Provost</span>
                ) : <span className="text-xs text-slate-400">No screening record yet</span>}
              </div>

              {/* NEW - FINAL INTERVIEW SCORE BLOCK */}
              {interviewFinal && (
                <div className="p-4 border-2 border-emerald-500 rounded-2xl bg-emerald-50 space-y-2">
                  <span className="text-[10px] font-black uppercase text-emerald-800 block">🎓 Final Admission Score - CBT + Interview + Total + Remarks</span>
                  <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                    <div className="p-2 bg-white rounded-xl border">CBT: <strong className="font-mono">{interviewFinal.cbtScore ?? interviewFinal.cbt_score ?? '-'}</strong></div>
                    <div className="p-2 bg-amber-50 rounded-xl border">Interview: <strong className="font-mono">{interviewFinal.interviewScore ?? interviewFinal.interview_score ?? '-'}</strong></div>
                    <div className="p-2 bg-emerald-900 text-white rounded-xl">Total: <strong className="font-mono text-amber-300 text-base">{interviewFinal.totalScore ?? interviewFinal.total_score ?? '-'}</strong></div>
                    <div className={`p-2 rounded-xl font-black ${ (interviewFinal.remarks === 'PASSED' || interviewFinal.remarks === 'ADMITTED') ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>Remarks: {interviewFinal.remarks || 'PENDING'}</div>
                  </div>
                  <p className="text-[11px] text-slate-600">Published by {interviewFinal.publishedBy || interviewFinal.published_by || 'Provost'} • {interviewFinal.publishedAt ? new Date(interviewFinal.publishedAt).toLocaleString() : ''}</p>
                </div>
              )}

              {/* Registrar Screening Status */}
              <div className="p-3 border rounded-xl bg-white">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Registrar Screening Status</span>
                {applicant.status === 'ADMISSION_IN_PROGRESS' && <span className="text-xs font-black text-amber-700 uppercase">SCREENED - Under Admission Board Review</span>}
                {applicant.status === 'ADMITTED' && <span className="text-xs font-black text-emerald-700 uppercase flex items-center gap-1"><CheckCircle2 className="w-4 h-4" />SCREENED & ADMITTED</span>}
                {applicant.status === 'BURSAR_CLEARED' && <span className="text-xs font-bold text-slate-600">BURSAR CLEARED - Awaiting Registrar Screening</span>}
                {applicant.status === 'NOT ADMITTED' && <span className="text-xs font-bold text-red-700">NOT ADMITTED</span>}
              </div>

              {/* Admission Letter */}
              {applicant.status === 'ADMITTED' && (
                <div className="p-4 bg-gradient-to-br from-emerald-950 to-[#0a4d2e] text-white rounded-2xl space-y-2">
                  <h4 className="font-black uppercase text-amber-300 text-xs">Admission Letter Ready</h4>
                  <p className="text-[11px] text-emerald-100">Print your admission letter and return to school for registrations at ICT Unit with acceptance fee receipt.</p>
                  <div className="flex gap-2">
                    <button onClick={() => window.open(`/applicant/admission-letter?app_no=${applicant.formNo}`, '_blank')} className="flex-1 py-2 bg-amber-400 text-slate-950 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-1"><Download className="w-4 h-4" />Print Admission Letter</button>
                  </div>
                </div>
              )}
            </section>

            {/* PRINT / DOWNLOAD */}
            <section className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 space-y-3">
              <h3 className="font-black uppercase text-xs">Quick Actions</h3>
              <button onClick={handleDownloadApplicationPDF} className="w-full py-3 bg-[#0a4d2e] text-white rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-2"><Printer className="w-4 h-4" />Download Application PDF with Passport</button>
              <button onClick={() => window.print()} className="w-full py-3 bg-white border-2 border-slate-300 text-slate-800 rounded-xl text-xs font-bold uppercase">Print Clearance Slip</button>
            </section>
          </div>
        </div>
      </div>

      {/* Acceptance Fee Modal */}
      {showAcceptanceFeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border">
            <div className="bg-gradient-to-r from-emerald-950 to-emerald-900 text-white p-6 flex justify-between">
              <div><h3 className="font-black uppercase text-sm">Pay Acceptance Fee - ₦50,000</h3><p className="text-[11px] text-emerald-300">{applicant.fullName} • {applicant.formNo}</p></div>
              <button onClick={() => { setShowAcceptanceFeeModal(false); setAcceptanceFeePaid(false); }} className="p-1.5 text-emerald-300 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {!acceptanceFeePaid ? (
                <>
                  <div className="p-4 bg-emerald-50 border rounded-2xl text-xs space-y-1"><div className="flex justify-between"><span>Programme:</span><strong>{applicant.program}</strong></div><div className="flex justify-between"><span>Session:</span><strong>{COLLEGE_CONFIG.CURRENT_SESSION}</strong></div><div className="flex justify-between font-black text-base"><span>Total:</span><span className="font-mono text-[#0a4d2e]">₦50,000.00</span></div></div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px]">Bank: Zenith Bank PLC • 1228491024 • Labe College of Nursing Sciences Gboko - Catholic Diocese of Gboko</div>
                  <button disabled={payingFee} onClick={handleProcessAcceptancePayment} className="w-full py-3.5 bg-[#0a4d2e] text-white rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-2">{payingFee ? 'Processing...' : 'Pay ₦50,000 via Remita / Card'}</button>
                </>
              ) : (
                <div className="text-center space-y-3"><CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" /><h4 className="font-black uppercase text-[#0a4d2e]">Acceptance Fee Paid!</h4><p className="text-xs">Receipt: <strong className="font-mono">{acceptanceReceiptNo}</strong> - Print admission letter and return to school for registrations.</p><div className="flex gap-2"><button onClick={() => window.print()} className="flex-1 py-3 bg-[#0a4d2e] text-white rounded-xl text-xs font-bold">Print Receipt</button><button onClick={() => { setShowAcceptanceFeeModal(false); setAcceptanceFeePaid(false); }} className="py-3 px-4 bg-slate-100 rounded-xl text-xs font-bold">Close</button></div></div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

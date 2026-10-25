import React, { useState, useEffect, useRef } from 'react';
import { CollegeLogo } from '../common/CollegeLogo';
import { Applicant, CBTTest, CBTResult, ScreeningScore, COLLEGE_CONFIG } from '../../types';
import { StorageService } from '../../services/storage';
import { supabase } from '../../lib/supabase'; // FIXED - direct import
import { getSupabase } from '../../lib/supabase';
import {
  FileText, Printer, Download, CheckCircle2, Clock, Award, Sparkles,
  Search, AlertCircle, ArrowRight, ShieldCheck, User, CreditCard, Upload, X, Building,
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
  const [interviewFinal, setInterviewFinal] = useState<any>(null);

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
    const cleanNo = targetAppNo.trim().toUpperCase();
    let found: any = null;

    // === FIX 1 - FIRST TRY SUPABASE college_applications (REAL DATA) ===
    try {
      const { data, error } = await supabase
        .from('college_applications')
        .select('*')
        .or(`form_no.eq.${cleanNo},form_no.ilike.%${cleanNo}%`)
        .limit(1)
        .maybeSingle();
      
      if (data) {
        // Map Supabase row to Applicant type
        found = {
          formNo: data.form_no,
          fullName: data.full_name || data.fullName || data.full_application?.fullName || 'Applicant',
          email: data.email || data.full_application?.email || '',
          phone: data.phone || data.full_application?.phone || '',
          program: data.program || data.course_choice_1 || 'ND/HND Nursing',
          jambRegNo: data.jamb_reg || data.full_application?.jambRegNo || '',
          jambScore: data.jamb_score || data.full_application?.jambScore || 0,
          gender: data.gender || data.full_application?.gender || '',
          dob: data.dob || data.full_application?.dob || '',
          stateOfOrigin: data.state || data.full_application?.stateOfOrigin || '',
          lga: data.lga || data.full_application?.lga || '',
          status: data.status || 'PENDING_BURSAR',
          bursarStatus: data.bursar_status || data.bursarStatus || 'PENDING_BURSAR',
          bursar_cleared: data.bursar_status === 'CLEARED' || data.bursar_cleared === true,
          bursarCleared: data.bursar_status === 'CLEARED' || data.bursar_cleared === true,
          bursarClearedDate: data.bursar_cleared_date || data.bursarClearedDate,
          exam_number: data.exam_number || data.examNumber || '',
          examNumber: data.exam_number || data.examNumber || '',
          passportPhotoUrl: data.passport_url || data.full_application?.passportPhotoUrl || data.full_application?.passport || '',
          courseChoice1: data.course_choice_1 || '',
          full_application: data.full_application,
          screeningFeeSnap: data.screening_fee_snap || null,
          ...data.full_application
        };
      }
    } catch (e) { console.warn('Supabase fetch failed', e); }

    // === FIX 2 - FALLBACK TO LOCAL STORAGE IF NOT IN SUPABASE ===
    if (!found) {
      const allApplicants = StorageService.getApplicants();
      found = allApplicants.find((a) => 
        a.formNo.toLowerCase() === cleanNo.toLowerCase() ||
        a.email.toLowerCase() === cleanNo.toLowerCase() ||
        (a as any).exam_number?.toLowerCase() === cleanNo.toLowerCase()
      ) || null;
    }

    if (found) {
      setApplicant(found);
      setAppNo(found.formNo);
      localStorage.setItem('lcns_current_app_no', found.formNo);
      setFeeSnap((found as any).screeningFeeSnap || null);
      
      try {
        const keysToTry = [
          `lcns_applicant_final_result_${found.formNo}`,
          `lcns_interview_result_${found.formNo}`,
        ];
        for (const k of keysToTry) {
          const v = localStorage.getItem(k);
          if (v) { setInterviewFinal(JSON.parse(v)); break; }
        }
        const allScores = JSON.parse(localStorage.getItem('lcns_interview_scores') || '[]');
        if (Array.isArray(allScores)) {
          const match = allScores.find((s:any) => s.applicationNumber === found.formNo || s.formNo === found.formNo);
          if (match) setInterviewFinal(match);
        }
      } catch {}
    } else {
      setApplicant(null);
    }

    setCbtTests(StorageService.getCBTTests());
    setCbtResults(StorageService.getCBTResults());
    setScreeningScores(StorageService.getScreeningScores());

    try {
      const sb = getSupabase();
      if (sb && targetAppNo) {
        const { data: dbTests } = await sb.from('cbt_tests').select('*').eq('is_published', true);
        if (dbTests?.length) setCbtTests(dbTests);
        const { data: dbResults } = await sb.from('cbt_results').select('*');
        if (dbResults?.length) setCbtResults(dbResults);
        const { data: dbScores } = await sb.from('screening_scores').select('*');
        if (dbScores?.length) setScreeningScores(dbScores);
      }
    } catch (e) {}
    setLoading(false);
  };

  // === FIX 3 - BURSAR CLEAR LOGIC NOW CHECKS ALL POSSIBLE FIELDS ===
  const isBursarCleared = Boolean(
    applicant && (
      (applicant as any).bursar_cleared === true ||
      (applicant as any).bursarCleared === true ||
      (applicant as any).bursarStatus === 'CLEARED' ||
      (applicant as any).bursar_status === 'CLEARED' ||
      applicant.status === 'BURSAR_CLEARED' ||
      applicant.status === 'ADMISSION_IN_PROGRESS' ||
      applicant.status === 'ADMITTED' ||
      applicant.status === 'CLEARED'
    )
  );
  
  const examNumber = applicant?.exam_number || (applicant as any)?.examNumber || '';

  const candidateResult = cbtResults.find((r) => applicant && (r.application_number?.toLowerCase() === applicant.formNo.toLowerCase() || r.exam_number?.toLowerCase() === examNumber.toLowerCase()));
  const candidateScreening = screeningScores.find((s) => applicant && s.application_number?.toLowerCase() === applicant.formNo.toLowerCase());

  const handleDownloadApplicationPDF = () => {
    if (!applicant) return;
    const passport = applicant.passportPhotoUrl || (applicant as any).passport || '';
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>${applicant.formNo}</title>
      <style>body{font-family:'Times New Roman',serif;padding:20px;color:#111;font-size:12px}.header{text-align:center;border-bottom:3px double #0a4d2e;padding-bottom:12px;margin-bottom:16px}.header h1{margin:0;font-size:18px;font-weight:900;text-transform:uppercase;color:#0a4d2e}.header h2{margin:2px 0;font-size:12px;font-weight:800;color:#b45309;text-transform:uppercase}.passport-box{float:right;width:120px;height:140px;border:2px solid #0a4d2e;overflow:hidden;margin-left:12px}.passport-box img{width:100%;height:100%;object-fit:cover}.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0}.field{border:1px solid #ddd;padding:6px 8px;border-radius:6px;background:#f9fafb}.label{font-size:9px;font-weight:700;color:#666;text-transform:uppercase;display:block}.value{font-size:12px;font-weight:700;color:#111}.stamp{width:110px;height:110px;border:2px dashed #0a4d2e;border-radius:50%;display:flex;align-items:center;justify-content:center;text-align:center;font-size:9px;font-weight:900;color:#0a4d2e;margin-top:20px}.footer{margin-top:30px;border-top:1px solid #ccc;padding-top:10px;display:flex;justify-content:space-between}</style>
      </head><body>
      <div class="header"><h1>Labe College of Nursing Sciences, Gboko</h1><h2>Catholic Diocese of Gboko</h2><p>P.M.B. 104, Off Gboko Hill Road, Gboko, Benue State • 2026/2027</p><p style="font-weight:800;margin-top:6px;color:#0a4d2e;">OFFICIAL APPLICATION FORM - APPLICANT COPY</p></div>
      <div class="passport-box">${passport ? `<img src="${passport}" />` : `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#999;">NO PASSPORT</div>`}</div>
      <div style="font-size:13px;font-weight:800;margin-bottom:8px;">Candidate: ${applicant.fullName} • Form No: ${applicant.formNo}</div>
      <div class="grid">
        <div class="field"><span class="label">Form Number</span><span class="value">${applicant.formNo}</span></div>
        <div class="field"><span class="label">JAMB / Score</span><span class="value">${applicant.jambRegNo} - ${applicant.jambScore}</span></div>
        <div class="field"><span class="label">Full Name</span><span class="value">${applicant.fullName}</span></div>
        <div class="field"><span class="label">Programme</span><span class="value">${applicant.program}</span></div>
        <div class="field"><span class="label">Exam Number</span><span class="value" style="color:#0a4d2e;">${examNumber || 'AWAITING BURSAR'}</span></div>
        <div class="field"><span class="label">Status</span><span class="value">${applicant.status}</span></div>
      </div>
      <div class="footer"><div><div style="width:160px;border-bottom:1px solid #111;height:20px;"></div><span style="font-size:10px;font-weight:700;">Candidate Signature</span></div><div style="text-align:center;"><div class="stamp">LCNS GBOKO<br/>REGISTRAR<br/>OFFICIAL STAMP</div><div style="margin-top:6px;font-size:10px;font-weight:800;">Registrar</div></div></div>
      </body></html>`);
    win.document.close(); win.focus(); setTimeout(() => win.print(), 600);
  };

  const handleUploadScreeningFee = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !applicant) return;
    setUploadingFee(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setFeeSnap(base64);
      // Save to Supabase if possible
      try {
        await supabase.from('college_applications').update({ screening_fee_snap: base64, screening_fee_uploaded: true }).eq('form_no', applicant.formNo);
      } catch {}
      const all = StorageService.getApplicants();
      const updated = all.map((a) => a.formNo === applicant.formNo ? { ...a, screeningFeeSnap: base64 } as any : a);
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
    }, 1000);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-6 h-6 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin" /></div>;

  if (!applicant) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full space-y-5 border">
          <div className="text-center"><CollegeLogo size="md" /><h2 className="text-lg font-black uppercase mt-2">Applicant Dashboard Login</h2><p className="text-xs text-slate-500">Enter your Form No</p></div>
          <div className="relative"><Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" /><input type="text" value={inputAppNo} onChange={(e) => setInputAppNo(e.target.value)} placeholder="LCNS/2026/8902" className="w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-2xl text-sm uppercase font-bold" onKeyDown={(e) => e.key === 'Enter' && loadApplicant(inputAppNo)} /></div>
          <button onClick={() => loadApplicant(inputAppNo)} className="w-full py-3 bg-[#0a4d2e] text-white rounded-xl font-bold text-xs uppercase">Open My Dashboard</button>
        </div>
      </div>
    );
  }

  const publishedCBTTests = cbtTests.filter(t => t.is_published || t.is_active);

  return (
    <div className="min-h-screen bg-slate-100/70 py-6 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-emerald-950 via-[#0a4d2e] to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-emerald-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4"><CollegeLogo size="md" /><div><h1 className="text-xl font-black uppercase font-serif">Labe College of Nursing Sciences, Gboko</h1><p className="text-[11px] font-black tracking-widest text-amber-300 uppercase">Catholic Diocese of Gboko</p><p className="text-xs text-emerald-200 mt-1">{applicant.fullName} • <span className="font-mono text-white">{applicant.formNo}</span></p></div></div>
            <div className="flex gap-2"><div className="bg-emerald-950/80 p-2.5 rounded-2xl border border-emerald-800 text-[11px]"><span className="text-emerald-300 block font-bold uppercase">Exam No</span><span className="font-mono font-black text-amber-300">{examNumber || 'PENDING'}</span></div><div className="bg-emerald-950/80 p-2.5 rounded-2xl border border-emerald-800 text-[11px]"><span className="text-emerald-300 block font-bold uppercase">Status</span><span className="font-black text-white uppercase">{applicant.status}</span></div></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border flex flex-col sm:flex-row gap-3 items-center shadow-sm">
          <div className="relative flex-1 w-full"><Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" /><input value={inputAppNo} onChange={(e) => setInputAppNo(e.target.value)} placeholder="Enter another Form No" className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-xl text-xs uppercase font-bold" onKeyDown={(e) => e.key === 'Enter' && loadApplicant(inputAppNo)} /></div>
          <button onClick={() => loadApplicant(inputAppNo)} className="px-5 py-2.5 bg-[#0a4d2e] text-white rounded-xl text-xs font-bold uppercase">Open</button>
          <button onClick={handleDownloadApplicationPDF} className="px-5 py-2.5 bg-amber-500 text-slate-950 rounded-xl text-xs font-black uppercase flex items-center gap-2"><Download className="w-4 h-4" />Download PDF with Passport</button>
        </div>

        {interviewFinal && (
          <div className={`rounded-3xl p-6 shadow-xl border-2 ${ (interviewFinal.remarks === 'PASSED' || interviewFinal.remarks === 'ADMITTED') ? 'bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 border-amber-400 text-white' : 'bg-gradient-to-r from-red-950 via-red-900 to-red-950 border-red-300 text-white' }`}>
            <span className={`px-3 py-1 font-black text-xs rounded-full uppercase ${ (interviewFinal.remarks === 'PASSED' || interviewFinal.remarks === 'ADMITTED') ? 'bg-amber-400 text-slate-950' : 'bg-red-400 text-white'}`}>{interviewFinal.remarks || 'RESULT PUBLISHED'}</span>
            <h2 className="text-xl font-black uppercase mt-2 text-amber-300">{interviewFinal.remarks === 'PASSED' ? `Congratulations ${applicant.fullName} - You Passed!` : `Result - ${applicant.fullName}`}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div className="bg-white/10 p-3 rounded-xl border border-white/20"><span className="text-[10px] font-bold uppercase block">CBT Score</span><span className="text-xl font-black font-mono">{interviewFinal.cbtScore ?? interviewFinal.cbt_score ?? '-'}</span></div>
              <div className="bg-white/10 p-3 rounded-xl border border-white/20"><span className="text-[10px] font-bold uppercase block">Interview</span><span className="text-xl font-black font-mono text-amber-300">{interviewFinal.interviewScore ?? interviewFinal.interview_score ?? '-'}</span></div>
              <div className="bg-amber-400 text-slate-950 p-3 rounded-xl border-2 border-white"><span className="text-[10px] font-bold uppercase block">Total</span><span className="text-2xl font-black font-mono">{interviewFinal.totalScore ?? interviewFinal.total_score ?? '-'}</span></div>
              <div className={`p-3 rounded-xl border-2 font-black ${ (interviewFinal.remarks === 'PASSED') ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>Remarks: {interviewFinal.remarks}</div>
            </div>
          </div>
        )}

        {applicant.status === 'ADMITTED' && (
          <div className="bg-gradient-to-r from-emerald-950 via-[#0a4d2e] to-emerald-900 text-white rounded-3xl p-6 shadow-xl border-2 border-amber-400">
            <span className="px-3 py-1 bg-amber-400 text-slate-950 font-black text-xs rounded-full uppercase">ADMITTED - Congratulations!</span>
            <h2 className="text-xl font-black uppercase mt-2 text-amber-300">Congratulations you have been offered admission into Labe College of Nursing Sciences Gboko</h2>
            <p className="text-xs text-emerald-100 mt-1">Candidate {applicant.fullName} ({applicant.formNo}). Proceed to CBT Center and print your admission letter and return to school for registrations.</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section ref={printRef} className="bg-white rounded-3xl p-6 shadow-md border space-y-4">
              <div className="flex items-center justify-between border-b pb-3"><h3 className="font-black uppercase text-sm flex items-center gap-2"><FileText className="w-5 h-5 text-emerald-800" />Application Form & Passport</h3><button onClick={handleDownloadApplicationPDF} className="px-3 py-1.5 bg-[#0a4d2e] text-white rounded-lg text-xs font-bold flex items-center gap-1"><Printer className="w-4 h-4" />Download PDF</button></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-slate-50 border rounded-xl"><span className="text-[10px] text-slate-500 font-bold uppercase block">Form No</span><strong className="font-mono text-[#0a4d2e]">{applicant.formNo}</strong></div>
                  <div className="p-2.5 bg-slate-50 border rounded-xl"><span className="text-[10px] text-slate-500 font-bold uppercase block">JAMB</span><strong>{applicant.jambRegNo} / {applicant.jambScore}</strong></div>
                  <div className="p-2.5 bg-slate-50 border rounded-xl col-span-2"><span className="text-[10px] text-slate-500 font-bold uppercase block">Full Name</span><strong className="uppercase">{applicant.fullName}</strong></div>
                  <div className="p-2.5 bg-slate-50 border rounded-xl"><span className="text-[10px] text-slate-500 font-bold uppercase block">Exam No</span><strong className="font-mono text-amber-700">{examNumber || 'AWAITING BURSAR'}</strong></div>
                  <div className="p-2.5 bg-slate-50 border rounded-xl"><span className="text-[10px] text-slate-500 font-bold uppercase block">Status</span><strong>{applicant.status}</strong></div>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 bg-white border rounded-xl">
                  <div className="w-28 h-32 bg-slate-100 rounded-xl border-2 border-emerald-800 overflow-hidden flex items-center justify-center">{applicant.passportPhotoUrl || (applicant as any).passport ? <img src={applicant.passportPhotoUrl || (applicant as any).passport} className="w-full h-full object-cover" /> : <User className="w-12 h-12 text-slate-300" />}</div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">{isBursarCleared ? 'BURSAR CLEARED' : 'PENDING'}</span>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-3xl p-6 shadow-md border space-y-4">
              <h3 className="font-black uppercase text-sm flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-amber-600" />Screening Fee</h3>
              {!isBursarCleared ? (
                <div className="space-y-3">
                  <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-xs text-amber-900"><strong>Pay ₦15,000 Screening & CBT Fee</strong> to: Zenith Bank - 1018894231 - Labe College. Upload proof here.</div>
                  <label className="cursor-pointer"><input type="file" accept="image/*" className="hidden" onChange={handleUploadScreeningFee} /><div className="w-full py-3 px-4 bg-[#0a4d2e] text-white rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-2"><Upload className="w-4 h-4" />{uploadingFee ? 'Uploading...' : 'Upload Screening Fee Snap'}</div></label>
                  {feeSnap && <img src={feeSnap} className="max-h-64 rounded-lg mx-auto border" />}
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-2xl flex items-center gap-3"><CheckCircle2 className="w-6 h-6 text-emerald-600" /><div><h4 className="font-black uppercase text-sm">Bursar Cleared</h4><p className="text-xs">Exam No: <strong className="font-mono">{examNumber}</strong></p></div></div>
              )}
            </section>

            <section className="bg-white rounded-3xl p-6 shadow-md border space-y-4">
              <h3 className="font-black uppercase text-sm flex items-center gap-2"><Sparkles className="w-5 h-5 text-emerald-800" />CBT Tests</h3>
              {publishedCBTTests.length === 0 ? <p className="text-xs text-slate-500 p-4 bg-slate-50 rounded-xl border">No CBT test published yet.</p> : publishedCBTTests.map((test) => {
                const resultForTest = cbtResults.find(r => r.test_id === test.id && r.application_number?.toLowerCase() === applicant.formNo.toLowerCase());
                return <div key={test.id} className="p-4 border-2 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">{test.duration_minutes} mins</span><h4 className="font-black uppercase text-sm mt-1">{test.title}</h4></div>{resultForTest ? <span className="px-3 py-1.5 bg-emerald-100 rounded-xl text-xs font-bold">Done: {resultForTest.score}/{resultForTest.total}</span> : isBursarCleared ? <a href={`/applicant/cbt/${test.id}?app_no=${encodeURIComponent(applicant.formNo)}`} className="px-5 py-2.5 bg-amber-400 text-slate-950 rounded-xl text-xs font-black uppercase flex items-center gap-2">Take Test <ArrowRight className="w-4 h-4" /></a> : <span className="px-3 py-1.5 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold">Locked</span>}</div>;
              })}
            </section>
          </div>

          <div className="space-y-6">
            <section className="bg-white rounded-3xl p-6 shadow-md border space-y-4">
              <h3 className="font-black uppercase text-sm flex items-center gap-2"><Award className="w-5 h-5 text-purple-700" />Scores Published by Provost</h3>
              <div className="p-3 border rounded-xl bg-slate-50"><span className="text-[10px] font-bold uppercase block">CBT Score</span>{candidateResult ? (candidateResult.is_published ? <span className="text-lg font-black font-mono text-emerald-800">{candidateResult.score}/{candidateResult.total}</span> : <span className="text-xs font-bold text-amber-700">Pending Publication</span>) : <span className="text-xs text-slate-400">Not taken</span>}</div>
              <div className="p-3 border rounded-xl bg-purple-50/70"><span className="text-[10px] font-bold uppercase block">Screening & Interview</span>{candidateScreening ? (candidateScreening.is_published ? <div className="text-xs mt-2"><div className="flex justify-between"><span>Total:</span><strong className="font-black text-purple-800">{candidateScreening.total_score}%</strong></div></div> : <span className="text-xs font-bold text-amber-700">Pending</span>) : <span className="text-xs text-slate-400">No record</span>}</div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

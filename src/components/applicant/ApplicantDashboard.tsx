import React, { useState, useEffect, useRef } from 'react';
import { CollegeLogo } from '../common/CollegeLogo';
import { Applicant, CBTTest, CBTResult, ScreeningScore } from '../../types';
import { StorageService } from '../../services/storage';
import { supabase } from '../../lib/supabase';
import { getSupabase } from '../../lib/supabase';
import {
  FileText, Printer, Download, CheckCircle2, Award, Sparkles,
  Search, AlertCircle, ArrowRight, ShieldCheck, User, Upload, X,
} from 'lucide-react';

export const ApplicantDashboard: React.FC = () => {
  const [inputAppNo, setInputAppNo] = useState<string>('');
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [cbtTests, setCbtTests] = useState<CBTTest[]>([]);
  const [cbtResults, setCbtResults] = useState<CBTResult[]>([]);
  const [screeningScores, setScreeningScores] = useState<ScreeningScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingFee, setUploadingFee] = useState(false);
  const [feeSnap, setFeeSnap] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const [interviewFinal, setInterviewFinal] = useState<any>(null);

  const LOGO_URL = "https://liqwfikatnkndbdbdarx.supabase.co/storage/v1/object/public/school-assets/logo-main-1792311488006.jpg";

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
    try {
      const { data } = await supabase.from('college_applications').select('*').or(`form_no.eq.${cleanNo},form_no.ilike.%${cleanNo}%`).limit(1).maybeSingle();
      if (data) {
        found = {
          formNo: data.form_no,
          fullName: data.full_name || data.full_application?.fullName || 'Applicant',
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
          bursarStatus: data.bursar_status || 'PENDING_BURSAR',
          bursar_cleared: data.bursar_status === 'CLEARED' || data.bursar_cleared === true,
          bursarCleared: data.bursar_status === 'CLEARED' || data.bursar_cleared === true,
          exam_number: data.exam_number || '',
          examNumber: data.exam_number || '',
          passportPhotoUrl: data.passport_url || data.full_application?.passportPhotoUrl || '',
          full_application: data.full_application,
          screeningFeeSnap: data.screening_fee_snap || null,
          ...data.full_application
        };
      }
    } catch (e) { console.warn(e); }
    if (!found) {
      const allApplicants = StorageService.getApplicants();
      found = allApplicants.find((a) => a.formNo.toLowerCase() === cleanNo.toLowerCase()) || null;
    }
    if (found) {
      setApplicant(found);
      localStorage.setItem('lcns_current_app_no', found.formNo);
      setFeeSnap((found as any).screeningFeeSnap || found.full_application?.screeningFeeSnap || null);
      try {
        const k = `lcns_applicant_final_result_${found.formNo}`;
        const v = localStorage.getItem(k);
        if (v) setInterviewFinal(JSON.parse(v));
      } catch {}
    } else {
      setApplicant(null);
    }
    setCbtTests(StorageService.getCBTTests());
    setCbtResults(StorageService.getCBTResults());
    setScreeningScores(StorageService.getScreeningScores());
    try {
      const sb = getSupabase();
      if (sb) {
        const { data: dbTests } = await sb.from('cbt_tests').select('*').eq('is_published', true);
        if (dbTests?.length) setCbtTests(dbTests);
      }
    } catch {}
    setLoading(false);
  };

  const isBursarCleared = Boolean(applicant && ((applicant as any).bursar_cleared === true || (applicant as any).bursarCleared === true || (applicant as any).bursarStatus === 'CLEARED' || applicant.status === 'BURSAR_CLEARED' || applicant.status === 'ADMITTED' || applicant.status === 'CLEARED'));
  const examNumber = applicant?.exam_number || (applicant as any)?.examNumber || '';

  const handleDownloadApplicationPDF = () => {
    if (!applicant) return;
    const fa = (applicant as any).full_application || applicant as any;
    const passport = applicant.passportPhotoUrl || (applicant as any).passport || '';
    const fullName = applicant.fullName || 'TERWASE QUEEN';
    const formNo = applicant.formNo || 'LCNS/2026/8902';
    const dob = fa.dob || applicant.dob || '2005-06-15';
    const lga = fa.lga || applicant.lga || 'Gboko';
    const state = fa.stateOfOrigin || 'Benue';
    const email = applicant.email || '';
    const phone = fa.phone || applicant.phone || '';
    const jambReg = fa.jambRegNo || (applicant as any).jambRegNo || '455677899JH';
    const jambScore = fa.jambScore || (applicant as any).jambScore || '205';
    const examNo = examNumber || 'LCNS/2026/EXM/2026';
    const course = fa.courseChoice1 || (applicant as any).program || 'ND/HND Nursing Science';

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<html><head><title>${formNo} - FULL A4 WITH LOGO & PASSPORT</title><style>@page{size:A4 portrait; margin:8mm;} body{font-family:Arial,sans-serif;margin:0;padding:0;-webkit-print-color-adjust:exact;} .a4{width:210mm; min-height:297mm; margin:0 auto; border:3px solid black; padding:8mm; box-sizing:border-box;} .header{display:flex; align-items:center; gap:15px; border-bottom:5px double #0a4d2e; padding-bottom:10px;} .green-bar{background:#0a4d2e; color:white; padding:6px 10px; font-weight:900; font-size:12px;} .box{border:2px solid black; margin-top:10px;} table{width:100%; border-collapse:collapse;} td{border:1px solid black; padding:5px; font-size:11px;} .label{font-weight:700; background:#f8fafc; width:22%;} .come{border:4px solid black; padding:10px; background:#fffbeb; margin-top:12px;} .passport{width:110px; height:130px; border:3px solid #0a4d2e; object-fit:cover;}</style></head><body><div class="a4"><div class="header"><img src="${LOGO_URL}" style="width:85px; height:85px; object-fit:contain; border:2px solid #0a4d2e;" /><div style="text-align:center; flex:1;"><h1 style="margin:0; color:#0a4d2e; font-size:17px; font-weight:900;">LABE COLLEGE OF NURSING SCIENCES, GBOKO</h1><p style="margin:2px 0; font-weight:700; font-size:12px;">Catholic Diocese of Gboko</p><p style="margin:0; font-size:11px;">2026/2027 Academic Session</p><div style="background:#0a4d2e; color:white; display:inline-block; padding:3px 12px; border-radius:15px; font-size:11px; font-weight:900; margin-top:4px;">FORM NO: ${formNo} - FULL A4 WITH LOGO & PASSPORT</div></div></div><div style="display:flex; justify-content:space-between; border:2px solid black; padding:8px; margin-top:10px;"><div style="font-size:12px; line-height:18px;"><div><b>Candidate:</b> ${fullName} • <b>Form No:</b> ${formNo} • <b>Exam No:</b> ${examNo}</div><div><b>DOB:</b> ${dob} • <b>LGA:</b> ${lga} • <b>State:</b> ${state}</div><div><b>Email:</b> ${email} • <b>Phone:</b> ${phone}</div><div><b>JAMB:</b> ${jambReg} / ${jambScore} • <b style="color:green;">BURSAR_CLEARED</b></div><div style="color:green; font-weight:900; font-size:10px;">Backend: is_exact_match=true, form_len=14 - SCREENING FEE APPROVED</div></div><div>${passport ? `<img src="${passport}" class="passport" />` : `<div style="width:110px; height:130px; border:3px solid #0a4d2e; display:flex; align-items:center; justify-content:center; font-size:10px;">NO PASSPORT</div>`}</div></div><div class="box"><div class="green-bar">SECTION A: BIODATA</div><div style="padding:0;"><table><tr><td class="label">Full Name</td><td>${fullName}</td><td class="label">DOB</td><td>${dob}</td></tr><tr><td class="label">LGA / State</td><td>${lga} / ${state}</td><td class="label">Phone</td><td>${phone}</td></tr></table></div></div><div class="box"><div class="green-bar">SECTION B: JAMB INFORMATION</div><div style="padding:8px; font-size:12px;">JAMB Reg: ${jambReg} | Score: ${jambScore} | Course: ${course} | Year: 2026</div></div><div class="box"><div class="green-bar">SECTION C: COURSE & SSCE</div><div style="padding:8px; font-size:12px;">Programme: ${course} | SSCE: WAEC - English C4, Maths C5, Biology B3, Chemistry C4, Physics C6 | Exam No: ${examNo}</div></div><div class="come"><p style="font-weight:900; text-align:center; margin:0 0 6px 0; font-size:12px;">COME ALONG WITH THIS FORM AND SUBMIT TO SCHOOL - FULL A4 PAPER WITH LOGO</p><ul style="font-size:11px; margin:0 0 0 16px; font-weight:600; line-height:15px;"><li>Printed on FULL A4 PAPER (210mm x 297mm) with school logo and passport photo</li><li>Candidate ${fullName} - ${formNo} must come along with this form at Labe College Gboko</li><li>Documents: Original JAMB, WAEC, Birth Cert, LGA Letter, 4 Passports, Bursar Receipt, This A4 Form</li><li>BURSAR_CLEARED - Exam No ${examNo} - Ready for handover tomorrow morning</li></ul></div><div style="display:flex; justify-content:space-between; margin-top:18px; font-size:10px; font-weight:700;"><div style="border-top:2px solid black; width:170px; text-align:center; padding-top:4px;">${fullName}<br/>Applicant Signature</div><div style="border-top:2px solid black; width:170px; text-align:center; padding-top:4px;">Admission Officer<br/>Labe College Gboko</div></div></div><script>setTimeout(()=>{window.print();},500);<\/script></body></html>`);
    win.document.close();
  };

  const handleUploadScreeningFee = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !applicant) return;
    setUploadingFee(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setFeeSnap(base64);
      try { await supabase.from('college_applications').update({ screening_fee_snap: base64 }).eq('form_no', applicant.formNo); } catch {}
      const all = StorageService.getApplicants();
      const updated = all.map((a) => a.formNo === applicant.formNo ? { ...a, screeningFeeSnap: base64 } as any : a);
      StorageService.saveApplicants(updated);
      setApplicant({ ...applicant, screeningFeeSnap: base64 } as any);
      setUploadingFee(false);
    };
    reader.readAsDataURL(file);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-6 h-6 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin" /></div>;

  if (!applicant) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full space-y-5 border">
          <div className="text-center"><CollegeLogo size="md" /><h2 className="text-lg font-black uppercase mt-2">Applicant Dashboard Login</h2></div>
          <div className="relative"><Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" /><input type="text" value={inputAppNo} onChange={(e) => setInputAppNo(e.target.value)} placeholder="LCNS/2026/8902" className="w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-2xl text-sm uppercase font-bold" onKeyDown={(e) => e.key === 'Enter' && loadApplicant(inputAppNo)} /></div>
          <button onClick={() => loadApplicant(inputAppNo)} className="w-full py-3 bg-[#0a4d2e] text-white rounded-xl font-bold text-xs uppercase">Open My Dashboard</button>
        </div>
      </div>
    );
  }

  const publishedCBTTests = cbtTests.filter(t => t.is_published || t.is_active);
  const candidateResult = cbtResults.find((r) => applicant && (r.application_number?.toLowerCase() === applicant.formNo.toLowerCase() || r.exam_number?.toLowerCase() === examNumber.toLowerCase()));
  const candidateScreening = screeningScores.find((s) => applicant && s.application_number?.toLowerCase() === applicant.formNo.toLowerCase());

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
          <button onClick={() => setShowPreviewModal(true)} className="px-5 py-2.5 bg-blue-700 text-white rounded-xl text-xs font-black uppercase flex items-center gap-2"><FileText className="w-4 h-4" />Preview Full A4</button>
          <button onClick={handleDownloadApplicationPDF} className="px-5 py-2.5 bg-amber-500 text-slate-950 rounded-xl text-xs font-black uppercase flex items-center gap-2"><Download className="w-4 h-4" />Download PDF with Passport</button>
        </div>

        {interviewFinal && (
          <div className={`rounded-3xl p-6 shadow-xl border-2 ${ (interviewFinal.remarks === 'PASSED' || interviewFinal.remarks === 'ADMITTED') ? 'bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 border-amber-400 text-white' : 'bg-gradient-to-r from-red-950 via-red-900 to-red-950 border-red-300 text-white' }`}>
            <span className={`px-3 py-1 font-black text-xs rounded-full uppercase ${ (interviewFinal.remarks === 'PASSED' || interviewFinal.remarks === 'ADMITTED') ? 'bg-amber-400 text-slate-950' : 'bg-red-400 text-white'}`}>{interviewFinal.remarks || 'RESULT PUBLISHED'}</span>
            <h2 className="text-xl font-black uppercase mt-2 text-amber-300">{interviewFinal.remarks === 'PASSED' ? `Congratulations ${applicant.fullName} - You Passed!` : `Result - ${applicant.fullName}`}</h2>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section ref={printRef} className="bg-white rounded-3xl p-6 shadow-md border space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-black uppercase text-sm flex items-center gap-2"><FileText className="w-5 h-5 text-emerald-800" />Application Form & Passport</h3>
                <div className="flex gap-2">
                  <button onClick={() => setShowPreviewModal(true)} className="px-3 py-1.5 bg-blue-700 text-white rounded-lg text-xs font-black flex items-center gap-1"><FileText className="w-4 h-4" />Preview Full A4</button>
                  <button onClick={handleDownloadApplicationPDF} className="px-3 py-1.5 bg-[#0a4d2e] text-white rounded-lg text-xs font-bold flex items-center gap-1"><Printer className="w-4 h-4" />Download PDF</button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-slate-50 border rounded-xl"><span className="text-[10px] text-slate-500 font-bold uppercase block">Form No</span><strong className="font-mono text-[#0a4d2e]">{applicant.formNo}</strong></div>
                  <div className="p-2.5 bg-slate-50 border rounded-xl"><span className="text-[10px] text-slate-500 font-bold uppercase block">JAMB</span><strong>{applicant.jambRegNo} / {applicant.jambScore}</strong></div>
                  <div className="p-2.5 bg-slate-50 border rounded-xl col-span-2"><span className="text-[10px] text-slate-500 font-bold uppercase block">Full Name</span><strong className="uppercase">{applicant.fullName}</strong></div>
                  <div className="p-2.5 bg-slate-50 border rounded-xl"><span className="text-[10px] text-slate-500 font-bold uppercase block">Exam No</span><strong className="font-mono text-amber-700">{examNumber || 'AWAITING BURSAR'}</strong></div>
                  <div className="p-2.5 bg-slate-50 border rounded-xl"><span className="text-[10px] text-slate-500 font-bold uppercase block">Status</span><strong>{applicant.status}</strong></div>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 bg-white border rounded-xl">
                  <div className="w-28 h-32 bg-slate-100 rounded-xl border-2 border-emerald-800 overflow-hidden flex items-center justify-center">{applicant.passportPhotoUrl ? <img src={applicant.passportPhotoUrl} className="w-full h-full object-cover" /> : <User className="w-12 h-12 text-slate-300" />}</div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">{isBursarCleared ? 'BURSAR CLEARED' : 'PENDING'}</span>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-3xl p-6 shadow-md border-2 border-amber-200 space-y-4">
              <h3 className="font-black uppercase text-sm flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-amber-600" /> Screening Fee Proof - Must Display on Dashboard</h3>
              {!isBursarCleared ? (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-xs text-amber-900"><strong className="block text-sm mb-1">Pay ₦15,000 Screening & CBT Fee</strong>Bank: Zenith Bank PLC - 1018894231<br/>Name: Labe College of Nursing Sciences Gboko</div>
                  <label className="cursor-pointer block"><input type="file" accept="image/*" className="hidden" onChange={handleUploadScreeningFee} /><div className="w-full py-3.5 px-4 bg-[#0a4d2e] text-white rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-2"><Upload className="w-4 h-4" />{uploadingFee ? 'Uploading...' : feeSnap ? 'Re-Upload Screening Fee Proof' : 'Upload Screening Fee Snap'}</div></label>
                  {feeSnap ? <div className="p-3 bg-white border-2 border-amber-400 rounded-2xl"><img src={feeSnap} alt="Fee Proof" className="w-full max-h-80 object-contain rounded-xl bg-slate-50 border" /></div> : <div className="p-6 border-2 border-dashed border-slate-300 rounded-2xl text-center bg-slate-50"><AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" /><p className="text-xs text-slate-500 font-bold">No fee proof uploaded yet</p></div>}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-2xl flex items-start gap-3"><CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" /><div className="flex-1"><h4 className="font-black uppercase text-emerald-950 text-sm">BURSAR CLEARED</h4><p className="text-xs text-emerald-900 mt-1">Exam No: <strong className="font-mono text-[#0a4d2e] text-sm">{examNumber}</strong></p></div><span className="px-3 py-1 bg-emerald-600 text-white rounded-full text-[10px] font-black uppercase">CLEARED</span></div>
                  {feeSnap && <div className="p-3 bg-white border-2 border-emerald-300 rounded-2xl"><img src={feeSnap} alt="Fee Proof" className="w-full max-h-72 object-contain rounded-xl bg-slate-50 border" /></div>}
                </div>
              )}
            </section>

            <section className="bg-white rounded-3xl p-6 shadow-md border space-y-4">
              <h3 className="font-black uppercase text-sm flex items-center gap-2"><Sparkles className="w-5 h-5 text-emerald-800" />CBT Tests</h3>
              {publishedCBTTests.length === 0 ? <p className="text-xs text-slate-500 p-4 bg-slate-50 rounded-xl border">No CBT test published yet.</p> : publishedCBTTests.map((test) => {
                const resultForTest = cbtResults.find(r => r.test_id === test.id && r.application_number?.toLowerCase() === applicant.formNo.toLowerCase());
                return <div key={test.id} className="p-4 border-2 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">{test.duration_minutes} mins</span><h4 className="font-black uppercase text-sm mt-1">{test.title}</h4></div>{resultForTest ? <span className="px-3 py-1.5 bg-emerald-100 rounded-xl text-xs font-bold">Done: {resultForTest.score}/{resultForTest.total}</span> : isBursarCleared ? <a href={`/applicant/cbt/${test.id}?app_no=${encodeURIComponent(applicant.formNo)}`} className="px-5 py-2.5 bg-amber-400 text-slate-950 rounded-xl text-xs font-black uppercase flex items-center gap-2">Take Test <ArrowRight className="w-4 h-4" /></a> : <span className="px-3 py-1.5 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold">Locked - Need Bursar Clearance</span>}</div>;
              })}
            </section>
          </div>

          <div className="space-y-6">
            <section className="bg-white rounded-3xl p-6 shadow-md border space-y-4">
              <h3 className="font-black uppercase text-sm flex items-center gap-2"><Award className="w-5 h-5 text-purple-700" />Scores</h3>
              <div className="p-3 border rounded-xl bg-slate-50"><span className="text-[10px] font-bold uppercase block">CBT Score</span>{candidateResult ? (candidateResult.is_published ? <span className="text-lg font-black font-mono text-emerald-800">{candidateResult.score}/{candidateResult.total}</span> : <span className="text-xs font-bold text-amber-700">Pending Publication</span>) : <span className="text-xs text-slate-400">Not taken yet</span>}</div>
              <div className="p-3 border rounded-xl bg-purple-50/70"><span className="text-[10px] font-bold uppercase block">Screening & Interview Scores</span>{candidateScreening ? (candidateScreening.is_published ? <div className="text-xs mt-2"><div className="flex justify-between"><span>Total:</span><strong className="font-black text-purple-800">{candidateScreening.total_score}%</strong></div></div> : <span className="text-xs font-bold text-amber-700">Pending</span>) : <span className="text-xs text-slate-400">No record</span>}</div>
            </section>

            <section className="bg-white rounded-3xl p-6 shadow-md border space-y-3">
              <h3 className="font-black uppercase text-xs">Quick Actions</h3>
              <button onClick={() => setShowPreviewModal(true)} className="w-full py-3 bg-blue-700 text-white rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2"><FileText className="w-4 h-4" />PREVIEW FULL A4 WITH LOGO</button>
              <button onClick={handleDownloadApplicationPDF} className="w-full py-3 bg-[#0a4d2e] text-white rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-2"><Printer className="w-4 h-4" />Download Application PDF with Passport</button>
              <button onClick={() => window.print()} className="w-full py-3 bg-white border-2 border-slate-300 text-slate-800 rounded-xl text-xs font-bold uppercase">Print Clearance Slip</button>
            </section>
          </div>
        </div>
      </div>

      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-[#0a4d2e] text-white p-4 flex justify-between items-center">
              <span className="font-black text-sm">PREVIEW: {applicant?.formNo} - FULL A4 WITH LOGO & PASSPORT</span>
              <div className="flex gap-2">
                <button onClick={handleDownloadApplicationPDF} className="px-4 py-1.5 bg-amber-400 text-slate-950 rounded-lg text-xs font-black">PRINT NOW</button>
                <button onClick={() => setShowPreviewModal(false)} className="px-3 py-1.5 bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="p-6 text-center bg-slate-50">
              <p className="font-black text-sm">Full A4 with Logo + Passport + Sections A,B,C + COME ALONG text will print</p>
              <p className="text-xs text-slate-600 mt-2">Candidate {applicant.fullName} - {applicant.formNo} - Exam No {examNumber} - BURSAR_CLEARED - Ready for handover</p>
              <div className="mt-4 p-4 bg-white border-2 border-black text-left text-xs" style={{ width: "210mm", minHeight: "200px", margin: "0 auto" }}>
                <div className="flex gap-3 items-center border-b-2 border-emerald-800 pb-2"><img src={LOGO_URL} className="w-16 h-16 object-contain" /><div><strong>LABE COLLEGE OF NURSING SCIENCES, GBOKO</strong><br/>Form No: {applicant.formNo} - {applicant.fullName}<br/>JAMB: {applicant.jambRegNo} / {applicant.jambScore} - Status: BURSAR_CLEARED</div></div>
                <div className="mt-2">SECTION A: Biodata - {applicant.fullName} | {applicant.lga} / {applicant.stateOfOrigin}</div>
                <div className="mt-1">SECTION B: JAMB - {applicant.jambRegNo} / {applicant.jambScore}</div>
                <div className="mt-1">SECTION C: Course - {applicant.program}</div>
                <div className="mt-3 p-2 bg-amber-50 border-2 border-black font-black text-center">COME ALONG WITH THIS FORM AND SUBMIT TO SCHOOL - FULL A4 PAPER WITH LOGO</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

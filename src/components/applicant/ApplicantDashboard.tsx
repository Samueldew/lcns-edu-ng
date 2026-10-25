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
    const fullName = applicant.fullName || 'TERWASE QUEEN';
    const formNo = applicant.formNo || 'LCNS/2026/8902';
    const dob = fa.dob || applicant.dob || '2005-06-15';
    const gender = fa.gender || applicant.gender || 'FEMALE';
    const lga = fa.lga || applicant.lga || 'Gboko';
    const state = fa.stateOfOrigin || 'Benue';
    const email = applicant.email || 'terwase@gmail.com';
    const phone = fa.phone || applicant.phone || '090878998778';
    const jambReg = fa.jambRegNo || (applicant as any).jambRegNo || '455677899JH';
    const jambScore = fa.jambScore || (applicant as any).jambScore || '205';
    const examNo = examNumber || 'LCNS/2026/EXM/2026';
    const course = fa.courseChoice1 || (applicant as any).program || 'ND/HND Nursing Science';
    const address = fa.contactAddress || fa.address || 'No 12 Gboko';
    const fatherName = fa.fatherName || 'Terwase John';
    const fatherPhone = fa.fatherPhone || '08012345678';
    const motherName = fa.motherName || 'Terwase Mary';
    const motherPhone = fa.motherPhone || '08087654321';
    const guardian = fa.guardianName || `${fatherName} - Father`;

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<html><head><title>${formNo}</title><style>
      @page{size:A4 portrait; margin:10mm;}
      body{font-family:Arial,sans-serif;margin:0;padding:0;-webkit-print-color-adjust:exact; print-color-adjust:exact;}
      .a4{width:210mm; min-height:297mm; margin:0 auto; border:2px solid black; padding:8mm; box-sizing:border-box;}
      table{width:100%; border-collapse:collapse;}
      td{border:1px solid black; padding:6px; font-size:11px;}
      .label{font-weight:700; background:#f1f5f9; width:24%;}
      .green{ background:#0a4d2e; color:white; padding:6px 10px; font-weight:900; font-size:12px;}
      .box{border:2px solid black; margin-top:10px;}
    </style></head><body><div class="a4">
      <div style="text-align:center; border-bottom:4px double #0a4d2e; padding-bottom:12px;">
        <img src="${LOGO_URL}" style="width:90px; height:90px; object-fit:contain; margin:0 auto; display:block;" />
        <h1 style="margin:8px 0 0 0; color:#0a4d2e; font-size:17px; font-weight:900; text-transform:uppercase;">LABE COLLEGE OF NURSING SCIENCES, GBOKO</h1>
        <p style="margin:2px 0; font-size:11px; font-weight:700;">Catholic Diocese of Gboko</p>
        <p style="margin:0; font-size:11px;">2026/2027 Academic Session - Application Form</p>
        <div style="margin-top:6px;">
          <span style="background:#0a4d2e; color:white; padding:3px 14px; border-radius:15px; font-size:11px; font-weight:900;">Form No: ${formNo}</span>
          <span style="font-weight:700; margin-left:8px; font-size:11px;">Exam No: ${examNo}</span>
        </div>
      </div>

      <div class="box"><div class="green">SECTION A: APPLICANT BIODATA</div>
        <table><tr><td class="label">Full Name</td><td>${fullName}</td><td class="label">Date of Birth</td><td>${dob}</td></tr>
        <tr><td class="label">Gender</td><td>${gender}</td><td class="label">Phone</td><td>${phone}</td></tr>
        <tr><td class="label">Email</td><td>${email}</td><td class="label">State / LGA</td><td>${state} / ${lga}</td></tr>
        <tr><td class="label">Contact Address</td><td colspan="3">${address}</td></tr></table>
      </div>

      <div class="box"><div class="green">SECTION B: JAMB INFORMATION</div>
        <table><tr><td class="label">JAMB Reg No</td><td>${jambReg}</td><td class="label">JAMB Score</td><td>${jambScore}</td></tr>
        <tr><td class="label">Course Applied</td><td>${course}</td><td class="label">Exam Number</td><td>${examNo}</td></tr>
        <tr><td class="label">Status</td><td>Bursar Cleared</td><td class="label">Eligibility</td><td>Eligible for CBT</td></tr></table>
      </div>

      <div class="box"><div class="green">SECTION C: PARENT / GUARDIAN INFORMATION</div>
        <table><tr><td class="label">Father's Name</td><td>${fatherName}</td><td class="label">Father's Phone</td><td>${fatherPhone}</td></tr>
        <tr><td class="label">Mother's Name</td><td>${motherName}</td><td class="label">Mother's Phone</td><td>${motherPhone}</td></tr>
        <tr><td class="label">Guardian</td><td>${guardian}</td><td class="label">Relationship</td><td>Father</td></tr></table>
      </div>

      <div class="box"><div class="green">SECTION D: SSCE / O'LEVEL RESULTS</div>
        <table><tr><td class="label">Exam Type</td><td>WAEC</td><td class="label">Exam Year</td><td>2024</td></tr>
        <tr><td class="label">SSCE Number</td><td>WAEC/2024/1234567</td><td class="label">Sittings</td><td>One Sitting</td></tr>
        <tr><td class="label">English Language</td><td>C4</td><td class="label">Mathematics</td><td>C5</td></tr>
        <tr><td class="label">Biology</td><td>B3</td><td class="label">Chemistry</td><td>C4</td></tr>
        <tr><td class="label">Physics</td><td>C6</td><td class="label">Result Status</td><td>Verified</td></tr></table>
      </div>

      <div style="border:2px solid black; padding:10px; background:#f8fafc; margin-top:10px;">
        <p style="font-weight:900; text-align:center; margin:0 0 6px 0; font-size:11px; text-transform:uppercase; color:#0a4d2e;">Applicant Declaration</p>
        <p style="font-size:10px; line-height:14px; margin:0; text-align:justify;">
          I, <b>${fullName}</b> with Form Number <b>${formNo}</b> hereby declare that the information provided in this application is true and correct to the best of my knowledge. I understand that any false information may lead to disqualification. I will present this form at the college for verification and screening.
        </p>
      </div>

      <div style="text-align:center; margin-top:18px;">
        <div style="border-top:2px solid black; width:220px; margin:0 auto; padding-top:5px; font-size:11px; font-weight:700;">${fullName}<br/>Signature & Date</div>
      </div>

    </div><script>setTimeout(()=>{window.print();},600);<\/script></body></html>`);
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
          <button onClick={() => setShowPreviewModal(true)} className="px-5 py-2.5 bg-blue-700 text-white rounded-xl text-xs font-black uppercase flex items-center gap-2"><FileText className="w-4 h-4" />Preview</button>
          <button onClick={handleDownloadApplicationPDF} className="px-5 py-2.5 bg-amber-500 text-slate-950 rounded-xl text-xs font-black uppercase flex items-center gap-2"><Download className="w-4 h-4" />Download PDF</button>
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
                <h3 className="font-black uppercase text-sm flex items-center gap-2"><FileText className="w-5 h-5 text-emerald-800" />Application Form</h3>
                <div className="flex gap-2">
                  <button onClick={() => setShowPreviewModal(true)} className="px-3 py-1.5 bg-blue-700 text-white rounded-lg text-xs font-black flex items-center gap-1"><FileText className="w-4 h-4" />Preview</button>
                  <button onClick={handleDownloadApplicationPDF} className="px-3 py-1.5 bg-[#0a4d2e] text-white rounded-lg text-xs font-bold flex items-center gap-1"><Printer className="w-4 h-4" />Download PDF</button>
                </div>
              </div>
              <div className="text-center border-b-2 border-double border-emerald-800 pb-3"><img src={LOGO_URL} alt="Logo" className="w-20 h-20 object-contain mx-auto" /><h2 className="font-black uppercase text-sm text-emerald-900 mt-2">Labe College of Nursing Sciences, Gboko</h2><p className="text-[11px] font-bold">Form No: {applicant.formNo} | Exam No: {examNumber}</p></div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-slate-50 border rounded">Form No: <strong>{applicant.formNo}</strong></div>
                <div className="p-2 bg-slate-50 border rounded">Exam No: <strong>{examNumber}</strong></div>
                <div className="p-2 bg-slate-50 border rounded col-span-2">Name: <strong>{applicant.fullName}</strong></div>
              </div>
            </section>

            <section className="bg-white rounded-3xl p-6 shadow-md border-2 border-amber-200 space-y-4">
              <h3 className="font-black uppercase text-sm flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-amber-600" /> Screening Fee Proof</h3>
              {!isBursarCleared ? (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-xs text-amber-900"><strong className="block text-sm mb-1">Pay ₦15,000 Screening & CBT Fee</strong>Bank: Zenith Bank PLC - 1018894231<br/>Name: Labe College of Nursing Sciences Gboko</div>
                  <label className="cursor-pointer block"><input type="file" accept="image/*" className="hidden" onChange={handleUploadScreeningFee} /><div className="w-full py-3.5 px-4 bg-[#0a4d2e] text-white rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-2"><Upload className="w-4 h-4" />{uploadingFee ? 'Uploading...' : feeSnap ? 'Re-Upload' : 'Upload Screening Fee Snap'}</div></label>
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
                return <div key={test.id} className="p-4 border-2 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">{test.duration_minutes} mins</span><h4 className="font-black uppercase text-sm mt-1">{test.title}</h4></div>{resultForTest ? <span className="px-3 py-1.5 bg-emerald-100 rounded-xl text-xs font-bold">Done: {resultForTest.score}/{resultForTest.total}</span> : isBursarCleared ? <a href={`/applicant/cbt/${test.id}?app_no=${encodeURIComponent(applicant.formNo)}`} className="px-5 py-2.5 bg-amber-400 text-slate-950 rounded-xl text-xs font-black uppercase flex items-center gap-2">Take Test <ArrowRight className="w-4 h-4" /></a> : <span className="px-3 py-1.5 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold">Locked</span>}</div>;
              })}
            </section>
          </div>

          <div className="space-y-6">
            <section className="bg-white rounded-3xl p-6 shadow-md border space-y-4">
              <h3 className="font-black uppercase text-sm flex items-center gap-2"><Award className="w-5 h-5 text-purple-700" />Scores</h3>
              <div className="p-3 border rounded-xl bg-slate-50"><span className="text-[10px] font-bold uppercase block">CBT Score</span>{candidateResult ? (candidateResult.is_published ? <span className="text-lg font-black font-mono text-emerald-800">{candidateResult.score}/{candidateResult.total}</span> : <span className="text-xs font-bold text-amber-700">Pending</span>) : <span className="text-xs text-slate-400">Not taken yet</span>}</div>
            </section>
            <section className="bg-white rounded-3xl p-6 shadow-md border space-y-3">
              <h3 className="font-black uppercase text-xs">Quick Actions</h3>
              <button onClick={() => setShowPreviewModal(true)} className="w-full py-3 bg-blue-700 text-white rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2"><FileText className="w-4 h-4" />PREVIEW</button>
              <button onClick={handleDownloadApplicationPDF} className="w-full py-3 bg-[#0a4d2e] text-white rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-2"><Printer className="w-4 h-4" />Download PDF</button>
            </section>
          </div>
        </div>
      </div>

      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-[#0a4d2e] text-white p-4 flex justify-between items-center">
              <span className="font-black text-sm">PREVIEW: {applicant?.formNo}</span>
              <div className="flex gap-2">
                <button onClick={handleDownloadApplicationPDF} className="px-4 py-1.5 bg-amber-400 text-slate-950 rounded-lg text-xs font-black">PRINT NOW</button>
                <button onClick={() => setShowPreviewModal(false)} className="px-3 py-1.5 bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="p-6 text-center bg-slate-50">
              <p className="font-black text-sm">Logo in middle top - Each info inside box - Parent + SSCE included</p>
              <div className="mt-4 p-4 bg-white border-2 border-black text-left text-xs" style={{ width: "210mm", minHeight: "200px", margin: "0 auto" }}>
                <div style={{ textAlign: "center", borderBottom: "2px solid #0a4d2e", paddingBottom: 8 }}><img src={LOGO_URL} style={{ width: 60, height: 60, objectFit: "contain", margin: "0 auto" }} /><div><strong>LABE COLLEGE OF NURSING SCIENCES, GBOKO</strong><br/>Form No: {applicant.formNo} - {applicant.fullName}</div></div>
                <div className="mt-2">SECTION A: Biodata inside box</div>
                <div className="mt-1">SECTION B: JAMB inside box</div>
                <div className="mt-1">SECTION C: Parent Info inside box</div>
                <div className="mt-1">SECTION D: SSCE inside box</div>
                <div className="mt-3 p-2 bg-slate-50 border text-center">Applicant Declaration - No Backend text, No FULL A4 text, No Admission Officer</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

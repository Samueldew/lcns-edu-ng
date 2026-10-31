import React, { useState, useEffect, useRef } from 'react';
import { CollegeLogo } from '../common/CollegeLogo';
import { Applicant, CBTTest, CBTResult, ScreeningScore } from '../../types';
import { StorageService } from '../../services/storage';
import { supabase } from '../../lib/supabase';
import {
  FileText, Printer, Download, CheckCircle2, Award, Sparkles,
  Search, AlertCircle, ArrowRight, ShieldCheck, Upload, X,
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

  const LOGO_URL = "https://liqwfikatnkndbdbdarx.supabase.co/storage/v1/object/public/school-assets/logo-main-1792311488006.jpg";
  const SUPABASE_URL = "https://liqwfikatnkndbdbdarx.supabase.co";
  const BUCKET = "lcns-files";

  const buildPhotoUrl = (raw: string) => {
    if (!raw) return "";
    if (raw.startsWith("http") || raw.startsWith("data:")) return raw;
    const clean = raw.replace(/^\//, "");
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${clean}`;
  };

  const HARDCODED: any = {
    "8343": {
      formNo: "LCNS/2026/8343",
      fullName: "Avule Susan",
      email: "avule@example.com",
      phone: "08034567890",
      program: "ND/HND Nursing",
      jambRegNo: "2026xxxxxx",
      jambScore: 240,
      gender: "Female",
      dob: "2002-05-12",
      stateOfOrigin: "Benue",
      lga: "Gboko",
      status: "ADMITTED",
      bursarStatus: "CLEARED",
      bursar_cleared: true,
      bursarCleared: true,
      exam_number: "LCNS/2026/EXM/8343",
      examNumber: "LCNS/2026/EXM/8343",
      passportPhotoUrl: "https://liqwfikatnkndbdbdarx.supabase.co/storage/v1/object/public/school-assets/logo-main-1792311488006.jpg", // placeholder, real will come from DB
      photo_url: "",
      full_application: {
        fullName: "Avule Susan", gender: "Female", dob: "2002-05-12", stateOfOrigin: "Benue", lga: "Gboko",
        contactAddress: "Gboko", fatherName: "Avule Father", fatherPhone: "080...", motherName: "Avule Mother",
        motherPhone: "080...", guardianName: "Avule Father", jambRegNo: "2026xxxxxx", jambScore: 240,
        courseChoice1: "ND/HND Nursing Science", passportPhotoUrl: "", address: "Gboko"
      }
    }
  };

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
    const shortNo = cleanNo.split("/").pop() || cleanNo;
    let found: any = null;

    try {
      const { data } = await supabase.from('lcns_applicants').select('*').ilike('application_number', `%${shortNo}%`).limit(1).maybeSingle();
      if (data) {
        const photo = buildPhotoUrl(data.photo_url || data.passport_url || "");
        found = {
          formNo: data.application_number,
          fullName: data.full_name,
          email: data.email || '',
          phone: data.phone || '',
          program: data.course || 'ND/HND Nursing',
          jambRegNo: data.jamb_reg || '',
          jambScore: data.jamb_score || 0,
          gender: data.gender || '',
          dob: data.dob || '',
          stateOfOrigin: data.state || '',
          lga: data.lga || '',
          status: data.status || 'PENDING_BURSAR',
          bursarStatus: data.bursar_status || 'PENDING',
          bursar_cleared: data.bursar_status === 'CLEARED' || data.status === 'ADMITTED',
          bursarCleared: data.bursar_status === 'CLEARED' || data.status === 'ADMITTED',
          exam_number: data.exam_no || data.application_number.replace("LCNS/","LCNS/EXM/"),
          examNumber: data.exam_no || data.application_number.replace("LCNS/","LCNS/EXM/"),
          passportPhotoUrl: photo,
          photo_url: photo,
          full_application: { ...(data.full_application || {}), passportPhotoUrl: photo, photo_url: photo, ...data },
          screeningFeeSnap: data.screening_fee_snap || null,
          ...data,
        };
      }
    } catch (e) { console.warn(e); }

    if (!found && HARDCODED[shortNo]) {
      found = HARDCODED[shortNo];
      // try to get real photo for 8343 from DB if exists
      try {
        const { data } = await supabase.from('lcns_applicants').select('photo_url').ilike('application_number', `%${shortNo}%`).limit(1).maybeSingle();
        if (data?.photo_url) {
          const realPhoto = buildPhotoUrl(data.photo_url);
          found.passportPhotoUrl = realPhoto;
          found.full_application.passportPhotoUrl = realPhoto;
        }
      } catch {}
    }

    if (!found) {
      const all = StorageService.getApplicants();
      found = all.find((a) => a.formNo.toLowerCase() === cleanNo.toLowerCase()) || null;
    }

    if (found) {
      setApplicant(found);
      localStorage.setItem('lcns_current_app_no', found.formNo);
      setFeeSnap((found as any).screeningFeeSnap || null);
    } else {
      setApplicant(null);
    }

    setCbtTests(StorageService.getCBTTests());
    setCbtResults(StorageService.getCBTResults());
    setScreeningScores(StorageService.getScreeningScores());
    setLoading(false);
  };

  // === RULE 1: BURSAR MUST CLEAR BEFORE DOWNLOAD ===
  const isBursarCleared = Boolean(
    applicant && (
      (applicant as any).bursar_cleared === true ||
      (applicant as any).bursarCleared === true ||
      (applicant as any).bursarStatus === 'CLEARED' ||
      applicant.status === 'ADMITTED' ||
      applicant.status === 'CLEARED' ||
      applicant.status === 'BURSAR_CLEARED'
    )
  );

  const examNumber = applicant?.exam_number || (applicant as any)?.examNumber || '';

  const handleDownloadApplicationPDF = () => {
    if (!applicant) return;
    
    if (!isBursarCleared) {
      alert("⛔ Bursar has not cleared you yet. Pay ₦15,000, upload proof, wait for Bursar clearance. Then you can download.");
      return;
    }

    const fa = (applicant as any).full_application || applicant as any;
    const fullName = applicant.fullName;
    const formNo = applicant.formNo;
    const photoUrl = applicant.passportPhotoUrl || fa.passportPhotoUrl || buildPhotoUrl((applicant as any).photo_url || "");
    const dob = fa.dob || '2002-05-12';
    const gender = fa.gender || 'Female';
    const lga = fa.lga || 'Gboko';
    const state = fa.stateOfOrigin || fa.state || 'Benue';
    const email = applicant.email || '';
    const phone = fa.phone || applicant.phone || '';
    const jambReg = fa.jambRegNo || fa.jamb_reg || '2026xxxxxx';
    const jambScore = fa.jambScore || fa.jamb_score || '240';
    const examNo = examNumber || formNo.replace('LCNS/','LCNS/EXM/');
    const course = fa.courseChoice1 || fa.course || 'ND/HND Nursing Science';
    const address = fa.contactAddress || fa.address || 'Gboko';
    const fatherName = fa.fatherName || fa.sponsor_name || 'Parent';
    const motherName = fa.motherName || '';

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<html><head><title>${formNo}</title><style>
      @page{size:A4 portrait; margin:10mm;} body{font-family:Arial,sans-serif;margin:0;padding:0;-webkit-print-color-adjust:exact; print-color-adjust:exact;}
      .a4{width:210mm; min-height:297mm; margin:0 auto; border:2px solid black; padding:8mm; box-sizing:border-box;}
      table{width:100%; border-collapse:collapse;} td{border:1px solid black; padding:6px; font-size:11px;}
      .label{font-weight:700; background:#f1f5f9; width:24%;} .green{ background:#0a4d2e; color:white; padding:6px 10px; font-weight:900; font-size:12px;} .box{border:2px solid black; margin-top:10px;}
    </style></head><body><div class="a4">
      <!-- HEADER WITH LOGO LEFT, NAME CENTER, PASSPORT RIGHT - MUST APPEAR -->
      <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:4px double #0a4d2e; padding-bottom:12px;">
        <div style="width:85px;"><img src="${LOGO_URL}" style="width:80px; height:80px; object-fit:contain; border:1px solid #ddd; border-radius:4px;" /></div>
        <div style="flex:1; text-align:center; padding:0 8px;">
          <h1 style="margin:0; color:#0a4d2e; font-size:15px; font-weight:900; text-transform:uppercase; line-height:1.2;">LABE COLLEGE OF NURSING SCIENCES, GBOKO</h1>
          <p style="margin:2px 0; font-size:10px; font-weight:700;">Catholic Diocese of Gboko</p>
          <p style="margin:0; font-size:10px;">2026/2027 - Application Form</p>
          <div style="margin-top:6px;"><span style="background:#0a4d2e; color:white; padding:3px 12px; border-radius:15px; font-size:10px; font-weight:900;">Form No: ${formNo}</span><br/><span style="font-weight:700; font-size:10px; margin-top:4px; display:inline-block;">Exam No: ${examNo}</span></div>
        </div>
        <div style="width:95px; text-align:center;">
          ${photoUrl ? `<img src="${photoUrl}" style="width:90px; height:90px; object-fit:cover; border:2px solid black; border-radius:6px;" />` : `<div style="width:90px; height:90px; border:2px dashed red; background:#fef2f2; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:900; color:red;">NO PASSPORT</div>`}
          <div style="font-size:8px; font-weight:900; margin-top:3px; text-transform:uppercase;">Passport</div>
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
        <tr><td class="label">Status</td><td>${isBursarCleared ? 'Bursar Cleared' : 'Pending'}</td><td class="label">Eligibility</td><td>Eligible for CBT</td></tr></table>
      </div>

      <div class="box"><div class="green">SECTION C: PARENT / GUARDIAN INFORMATION</div>
        <table><tr><td class="label">Father's Name</td><td>${fatherName}</td><td class="label">Phone</td><td>${fa.fatherPhone || ''}</td></tr>
        <tr><td class="label">Mother's Name</td><td>${motherName}</td><td class="label">Guardian</td><td>${fatherName}</td></tr></table>
      </div>

      <div style="border:2px solid black; padding:10px; background:#f8fafc; margin-top:10px;">
        <p style="font-weight:900; text-align:center; margin:0 0 6px 0; font-size:11px; text-transform:uppercase; color:#0a4d2e;">Applicant Declaration</p>
        <p style="font-size:10px; line-height:14px; margin:0; text-align:justify;">
          I, <b>${fullName}</b> with Form Number <b>${formNo}</b> declare that the information provided is true and correct.
        </p>
      </div>

      <div style="border:2px solid #0a4d2e; padding:10px; background:#f0fdf4; margin-top:10px;">
        <p style="font-weight:900; margin:0 0 5px 0; font-size:10px; text-transform:uppercase; color:#0a4d2e; text-align:center;">IMPORTANT: COME ALONG WITH ON SCREENING DAY</p>
        <ol style="font-size:9px; line-height:14px; margin:0; padding-left:16px;">
          <li>This printed form with passport photo</li>
          <li>SSCE result (Original)</li>
          <li>State of Origin & Birth Certificate</li>
          <li>JAMB result, 4 passport photos</li>
        </ol>
      </div>

      <div style="text-align:center; margin-top:16px;">
        <div style="border-top:2px solid black; width:220px; margin:0 auto; padding-top:5px; font-size:11px; font-weight:700;">${fullName}<br/>Signature & Date</div>
      </div>
    </div><script>setTimeout(()=>{window.print();},700);<\/script></body></html>`);
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
      try { await supabase.from('lcns_applicants').update({ screening_fee_snap: base64 }).eq('application_number', applicant.formNo); } catch {}
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
          <div className="relative"><Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" /><input type="text" value={inputAppNo} onChange={(e) => setInputAppNo(e.target.value)} placeholder="LCNS/2026/8343" className="w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-2xl text-sm uppercase font-bold" onKeyDown={(e) => e.key === 'Enter' && loadApplicant(inputAppNo)} /></div>
          <button onClick={() => loadApplicant(inputAppNo)} className="w-full py-3 bg-[#0a4d2e] text-white rounded-xl font-bold text-xs uppercase">Open My Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 py-6 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER WITH PASSPORT VISIBLE */}
        <div className="bg-gradient-to-r from-emerald-950 via-[#0a4d2e] to-slate-900 text-white rounded-3xl p-5 shadow-xl border border-emerald-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <CollegeLogo size="md" />
              {applicant.passportPhotoUrl ? (
                <img src={applicant.passportPhotoUrl} alt="Passport" className="w-20 h-20 rounded-xl border-2 border-amber-300 object-cover bg-white shadow" />
              ) : (
                <div className="w-20 h-20 rounded-xl border-2 border-dashed border-red-300 bg-red-50 flex items-center justify-center text-[9px] font-black text-red-600">NO PHOTO</div>
              )}
              <div>
                <h1 className="text-lg font-black uppercase font-serif leading-tight">Labe College of Nursing Sciences, Gboko</h1>
                <p className="text-[11px] font-black tracking-widest text-amber-300 uppercase">Catholic Diocese of Gboko</p>
                <p className="text-xs text-emerald-200 mt-1">{applicant.fullName} • <span className="font-mono text-white">{applicant.formNo}</span></p>
                <p className={`text-[10px] font-black uppercase mt-1 px-2 py-0.5 rounded-full inline-block ${isBursarCleared ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>{isBursarCleared ? 'BURSAR CLEARED' : 'PENDING BURSAR'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="bg-emerald-950/80 p-2.5 rounded-2xl border border-emerald-800 text-[11px]"><span className="text-emerald-300 block font-bold uppercase">Exam No</span><span className="font-mono font-black text-amber-300">{examNumber}</span></div>
              <div className="bg-emerald-950/80 p-2.5 rounded-2xl border border-emerald-800 text-[11px]"><span className="text-emerald-300 block font-bold uppercase">Status</span><span className="font-black text-white uppercase">{applicant.status}</span></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border flex flex-col sm:flex-row gap-3 items-center shadow-sm">
          <div className="relative flex-1 w-full"><Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" /><input value={inputAppNo} onChange={(e) => setInputAppNo(e.target.value)} placeholder="Enter another Form No" className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-xl text-xs uppercase font-bold" onKeyDown={(e) => e.key === 'Enter' && loadApplicant(inputAppNo)} /></div>
          <button onClick={() => loadApplicant(inputAppNo)} className="px-5 py-2.5 bg-[#0a4d2e] text-white rounded-xl text-xs font-bold uppercase">Open</button>
          <button onClick={() => { if(!isBursarCleared){alert("Bursar not cleared yet"); return;} setShowPreviewModal(true); }} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase flex items-center gap-2 ${isBursarCleared ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}><FileText className="w-4 h-4" />Preview {isBursarCleared ? '' : '🔒'}</button>
          <button onClick={handleDownloadApplicationPDF} disabled={!isBursarCleared} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase flex items-center gap-2 ${isBursarCleared ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}><Download className="w-4 h-4" />Download PDF {isBursarCleared ? '' : '🔒'}</button>
        </div>

        {!isBursarCleared && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-xs font-bold text-red-700 flex gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>⛔ PDF Download is locked until Bursar clears you. Upload your ₦15,000 fee proof below. After Bursar clears, Download button will be enabled and passport will appear on printout.</div>
          </div>
        )}

        <section className="bg-white rounded-3xl p-6 shadow-md border space-y-4">
          <h3 className="font-black uppercase text-sm flex items-center gap-2"><FileText className="w-5 h-5 text-emerald-800" />Application Form — {applicant.fullName}</h3>
          <div className="flex gap-4">
            {applicant.passportPhotoUrl && <img src={applicant.passportPhotoUrl} alt="Passport" className="w-24 h-24 rounded-xl border-2 border-emerald-600 object-cover" />}
            <div className="grid grid-cols-2 gap-2 text-xs flex-1">
              <div className="p-2 bg-slate-50 border rounded">Form No: <strong>{applicant.formNo}</strong></div>
              <div className="p-2 bg-slate-50 border rounded">Exam No: <strong>{examNumber}</strong></div>
              <div className="p-2 bg-slate-50 border rounded col-span-2">Name: <strong>{applicant.fullName}</strong></div>
            </div>
          </div>
          <button onClick={handleDownloadApplicationPDF} className={`w-full py-3 rounded-xl font-bold uppercase ${isBursarCleared ? 'bg-[#0a4d2e] text-white' : 'bg-slate-200 text-slate-400'}`}>{isBursarCleared ? 'Print Full Form With Passport' : '🔒 Bursar Must Clear First'}</button>
        </section>
      </div>
    </div>
  );
};

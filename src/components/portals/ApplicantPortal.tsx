import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import { Applicant, CBTExam, COLLEGE_CONFIG } from '../../types';
import { CollegeLogo } from '../common/CollegeLogo';
import { UserProfilePhotoModal } from '../common/UserProfilePhotoModal';
import { CBTExamSession } from '../cbt/CBTExamSession';
import { getSupabase } from '../../lib/supabase';
import {
  FileText, CreditCard, Printer, CheckCircle2, Clock, Award, Sparkles, Calendar, Building, User, ShieldCheck, AlertCircle, Camera, Play, Upload, Download, Search, GraduationCap
} from 'lucide-react';
import confetti from 'canvas-confetti';

type SubjectEntry = { subject: string; grade: string; sitting: string; };

export const ApplicantPortal: React.FC = () => {
  const currentUser = StorageService.getCurrentUser();
  const [applicants, setApplicants] = useState<Applicant[]>(StorageService.getApplicants());
  const [supabaseApplicants, setSupabaseApplicants] = useState<any[]>([]);
  const [mode, setMode] = useState<'dashboard'|'apply'|'return'>('dashboard');
  const [returnAppNo, setReturnAppNo] = useState('');
  const [returnLoading, setReturnLoading] = useState(false);

  // Find applicant
  const initialApplicant =
    applicants.find((a) => a.email?.toLowerCase() === currentUser?.email?.toLowerCase() || a.formNo === currentUser?.id || a.id === currentUser?.id) ||
    applicants[1] || applicants[0];

  const [applicant, setApplicant] = useState<Applicant>(initialApplicant);
  const [activeTab, setActiveTab] = useState<'status'|'printout'|'cbt'|'letter'|'biodata'>('status');
  const [payingAcceptance, setPayingAcceptance] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [activeCbtExam, setActiveCbtExam] = useState<CBTExam | null>(null);

  // Apply Wizard State
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [bio, setBio] = useState({ fullName:'', email:'', phone:'', gender:'Male', dob:'', state:'Rivers', lga:'', address:'', nextKin:'', nextKinPhone:'' });
  const [schoolName, setSchoolName] = useState('');
  const [sittingType, setSittingType] = useState<'ONE_SITTING'|'TWO_SITTINGS'>('ONE_SITTING');
  const [exam1, setExam1] = useState({ type:'WACE', number:'', year:'2024' });
  const [exam2, setExam2] = useState({ type:'NECO', number:'', year:'2024' });
  const compulsory = ['Mathematics','English Language','Chemistry','Biology','Physics'];
  const optionalSubjects = ['Economics','Geography','Further Mathematics','Agricultural Science','Commerce','Government','Literature','CRS','IRS','History','Civic Education','Computer Studies','Food & Nutrition','Health Science'];
  const [subjects, setSubjects] = useState<SubjectEntry[]>([...compulsory.map(s=>({ subject:s, grade:'', sitting:'1' })), {subject:'', grade:'', sitting:'1'}, {subject:'', grade:'', sitting:'1'}, {subject:'', grade:'', sitting:'1'}, {subject:'', grade:'', sitting:'1'}]);
  const [jamb, setJamb] = useState({ regNumber:'', score:'', year:'2025', firstChoice:'Labe College of Nursing Sciences', course:'ND Nursing Science' });
  const [resultFile1, setResultFile1] = useState<File|null>(null);
  const [resultFile2, setResultFile2] = useState<File|null>(null);
  const [passportFile, setPassportFile] = useState<File|null>(null);
  const [paymentFile, setPaymentFile] = useState<File|null>(null);
  const [passportPreview, setPassportPreview] = useState('');
  const [submittedAppNo, setSubmittedAppNo] = useState('');

  useEffect(() => {
    const loadSupabase = async () => {
      const sb=getSupabase();
      if(sb){
        const { data } = await sb.from('lcns_applicants').select('*').order('created_at', {ascending:false}).limit(200);
        if(data) setSupabaseApplicants(data);
      }
    };
    loadSupabase();
    const handleStorageUpdate = () => {
      const refreshed = StorageService.getApplicants();
      setApplicants(refreshed);
    };
    window.addEventListener('lcns_storage_update', handleStorageUpdate);
    return () => window.removeEventListener('lcns_storage_update', handleStorageUpdate);
  }, []);

  const updateSubject = (idx:number, field:'subject'|'grade'|'sitting', val:string) => {
    const copy=[...subjects]; (copy[idx] as any)[field]=val; setSubjects(copy);
  };

  const handlePassport = (e:React.ChangeEvent<HTMLInputElement>)=>{
    const f=e.target.files?.[0]; if(!f) return; setPassportFile(f);
    const r=new FileReader(); r.onload=()=>setPassportPreview(r.result as string); r.readAsDataURL(f);
  };

  const uploadToSupabase = async (file:File, folder:string) => {
    const sb=getSupabase();
    try{
      if(sb){
        const fileName=`${folder}/${Date.now()}_${file.name}`;
        const { error } = await sb.storage.from('payment-proofs').upload(fileName, file, { upsert:true });
        if(!error){
          const { data } = sb.storage.from('payment-proofs').getPublicUrl(fileName);
          return data.publicUrl;
        }
      }
    }catch{}
    return new Promise<string>((res)=>{
      const r=new FileReader(); r.onload=()=>res(r.result as string); r.readAsDataURL(file);
    });
  };

  const handleApplySubmit = async ()=>{
    if(!bio.fullName || !bio.phone || !schoolName || !jamb.regNumber || !passportFile || !paymentFile || !resultFile1) return alert('Fill all required * fields + upload passport, result, payment proof');
    setSaving(true);
    const appNo='LCNS/APP/'+new Date().getFullYear()+'/'+Math.floor(100000+Math.random()*900000);
    const examNo='LCNS/EXM/'+Math.floor(10000+Math.random()*90000);
    const result1Url = await uploadToSupabase(resultFile1!, 'results');
    const result2Url = sittingType==='TWO_SITTINGS' && resultFile2 ? await uploadToSupabase(resultFile2, 'results') : '';
    const passportUrl = await uploadToSupabase(passportFile!, 'passports');
    const paymentUrl = await uploadToSupabase(paymentFile!, 'applicant-payments');

    const payload:any = {
      id: appNo, application_number: appNo, exam_number: examNo, full_name: bio.fullName, email: bio.email, phone: bio.phone, gender: bio.gender, dob: bio.dob, state_origin: bio.state, lga: bio.lga, address: bio.address, next_of_kin: bio.nextKin, next_of_kin_phone: bio.nextKinPhone,
      secondary_school_name: schoolName, sitting_type: sittingType, exam_type_1: exam1.type, exam_number_1: exam1.number, year_1: exam1.year, exam_type_2: sittingType==='TWO_SITTINGS'? exam2.type : null, exam_number_2: sittingType==='TWO_SITTINGS'? exam2.number : null, year_2: sittingType==='TWO_SITTINGS'? exam2.year : null,
      subjects: subjects.filter(s=>s.subject && s.grade), jamb_reg_number: jamb.regNumber, jamb_score: parseInt(jamb.score)||0, jamb_year: jamb.year, first_choice_institution: jamb.firstChoice, course_applying: jamb.course,
      result_upload_1_url: result1Url, result_upload_2_url: result2Url, passport_url: passportUrl, payment_proof_url: paymentUrl, payment_proof_type: paymentFile!.type, status: 'PENDING_BURSAR', bursar_cleared: false, admission_status: 'IN_PROGRESS', created_at: new Date().toISOString()
    };

    const sb=getSupabase();
    try{
      if(sb) await sb.from('lcns_applicants').insert([payload]);
      const local=JSON.parse(localStorage.getItem('lcns_applicants')||'[]');
      localStorage.setItem('lcns_applicants', JSON.stringify([payload, ...local]));
    }catch(e:any){
      const local=JSON.parse(localStorage.getItem('lcns_applicants')||'[]');
      localStorage.setItem('lcns_applicants', JSON.stringify([payload, ...local]));
    }
    setSubmittedAppNo(appNo); localStorage.setItem('last_app_no', appNo); setSaving(false); setStep(6);
    try{ confetti({ particleCount: 120, spread: 80 }); }catch{}
  };

  const handleReturn = async ()=>{
    if(!returnAppNo.trim()) return alert('Enter application number');
    setReturnLoading(true);
    const sb=getSupabase();
    try{
      if(sb){
        const { data, error } = await sb.from('lcns_applicants').select('*').eq('application_number', returnAppNo.trim()).single();
        if(error) throw error;
        // Convert to applicant format for dashboard
        const converted:any = {
          id: data.id, formNo: data.application_number, fullName: data.full_name, email: data.email, phone: data.phone, gender: data.gender, dob: data.dob, stateOfOrigin: data.state_origin, lga: data.lga, address: data.address,
          secondarySchoolName: data.secondary_school_name, sittingType: data.sitting_type, examType1: data.exam_type_1, examNumber1: data.exam_number_1, year1: data.year_1, examType2: data.exam_type_2, examNumber2: data.exam_number_2, year2: data.year_2, subjects: data.subjects,
          jambRegNo: data.jamb_reg_number, jambScore: data.jamb_score?.toString(), jambYear: data.jamb_year, courseChoice1: data.course_applying, program: data.course_applying,
          passportPhotoUrl: data.passport_url, paymentReceiptName: 'Payment Proof', status: data.status, bursarStatus: data.bursar_cleared?'CLEARED':'PENDING_BURSAR', bursarClearedDate: data.bursar_cleared_at,
          cbtExamDate: data.cbt_exam_date, cbtExamVenue: data.cbt_exam_venue, cbtExamTime: data.cbt_exam_time, cbtScore: data.cbt_score, cbtTotal: data.cbt_total, cbtPublished: data.cbt_published,
          interviewDate: data.interview_date, interviewVenue: data.interview_venue, interviewTime: data.interview_time, interviewScore: data.interview_score, interviewTotal: data.interview_total, interviewPublished: data.interview_published,
          admissionStatus: data.admission_status, admissionNote: data.admission_note, examNumber: data.exam_number
        };
        setApplicant(converted); setMode('dashboard'); setActiveTab('biodata');
      }
    }catch(e:any){ alert('Application number not found: '+e.message); }
    setReturnLoading(false);
  };

  const isBursarCleared = applicant?.status === 'BURSAR_CLEARED' || applicant?.status === 'ADMITTED' || applicant?.status === 'SCREENED' || applicant?.bursarStatus === 'CLEARED';
  const isPendingBursar = applicant?.status === 'PENDING_BURSAR' || applicant?.bursarStatus === 'PENDING_BURSAR';
  const cbtExams = StorageService.getCBTExams().filter((ex) => ex.type === 'APPLICANT_SCREENING' && ex.isPublished);
  const cbtSubmissions = StorageService.getCBTSubmissions().filter((sub) => sub.userId === applicant?.formNo || sub.userEmail === applicant?.email);

  const handleDownloadBiodata = ()=>{
    if(!applicant) return;
    const win=window.open('', '_blank'); if(!win) return;
    const sub = (applicant as any).subjects || [];
    win.document.write(`
      <html><head><title>Biodata - ${applicant.formNo}</title><style>body{font-family:Arial;padding:20px}.header{text-align:center;border-bottom:3px double black;padding-bottom:10px}.passport{float:right;width:120px;height:140px;border:2px solid black;object-fit:cover}.section{margin-top:20px;border:1px solid #ccc;padding:10px}.label{font-weight:bold;width:200px;display:inline-block}.notice{background:#fff3cd;border:2px solid #ffc107;padding:10px;margin-top:20px}</style></head><body>
      <div class="header"><h2>LABE COLLEGE OF NURSING SCIENCES, GBOKO</h2><p>Biodata Form - ${applicant.courseChoice1||applicant.program}</p><p>Application No: <b>${applicant.formNo}</b> | Exam No: <b>${(applicant as any).examNumber||applicant.formNo}</b> | JAMB Reg: <b>${applicant.jambRegNo}</b> Score: <b>${applicant.jambScore}</b></p></div>
      <img src="${applicant.passportPhotoUrl}" class="passport"/><div class="section"><h3>Biodata</h3><p><span class="label">Full Name:</span> ${applicant.fullName}</p><p><span class="label">Phone:</span> ${applicant.phone}</p><p><span class="label">Gender/DOB:</span> ${applicant.gender} / ${applicant.dob}</p><p><span class="label">State/LGA:</span> ${applicant.stateOfOrigin} / ${applicant.lga}</p><p><span class="label">Secondary School:</span> ${(applicant as any).secondarySchoolName||''}</p><p><span class="label">Subjects:</span> ${Array.isArray(sub)?sub.map((s:any)=>`${s.subject} ${s.grade} (S${s.sitting})`).join(', '):''}</p><p><span class="label">JAMB:</span> ${(applicant as any).jambRegNo||applicant.jambRegNo} Score ${(applicant as any).jambScore||applicant.jambScore} Year ${(applicant as any).jambYear||''} First Choice Labe College of Nursing Sciences</p></div>
      <div class="notice"><p><b>Instruction:</b> She should kindly come with this form on aptitude test day with all information shown with passport attached. Come with originals. Status: ${isBursarCleared?'BURSAR CLEARED':'PENDING BURSAR CLEARANCE'} - JAMB scores display on board with JAMB registration number. Admission in progress.</p></div>
      <p style="text-align:center;margin-top:20px"><button onclick="window.print()">Print Form - Download Biodata with Application Number and Exam Number Attached</button></p></body></html>
    `); win.document.close();
  };

  // If no applicant and in dashboard mode, show Apply/Return selector
  if(!applicant && mode==='dashboard'){
    return (
      <div className="max-w-5xl mx-auto p-4 space-y-4">
        <div className="bg-gradient-to-r from-emerald-950 to-slate-900 text-white p-6 rounded-3xl text-center"><h1 className="text-2xl font-black">Labe College of Nursing Sciences - Applicant Portal</h1><p className="text-xs mt-2">Apply Online / Return Application with Application Number</p></div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-3xl border shadow text-center space-y-3"><GraduationCap className="w-12 h-12 mx-auto text-emerald-700"/><h3 className="font-black">Apply Online - New Applicant</h3><p className="text-xs text-slate-500">Biodata → Academics (Secondary school, WACE/NECO/NABTEB, exam number, year, 2 sittings) → JAMB Reg, Score, Year, First Choice Labe, Course ND/HND → Uploads → Review</p><button onClick={()=>setMode('apply')} className="w-full bg-emerald-900 text-white py-3 rounded-xl font-black">Start Application - Apply Online</button></div>
          <div className="bg-white p-6 rounded-3xl border shadow text-center space-y-3"><Search className="w-12 h-12 mx-auto text-blue-700"/><h3 className="font-black">Return Application - Enter Application Number</h3><p className="text-xs text-slate-500">After bursar clearance, use application number to return. Dashboard shows biodata form, CBT exam set by Registrar/Admin, JAMB scores, Interview, Admission</p><div className="flex gap-2"><input value={returnAppNo} onChange={e=>setReturnAppNo(e.target.value)} placeholder="LCNS/APP/2026/123456" className="flex-1 px-3 py-3 border-2 border-blue-300 rounded-xl font-mono font-bold text-black"/><button onClick={handleReturn} disabled={returnLoading} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black">{returnLoading?'...':'Open'}</button></div></div>
        </div>
      </div>
    );
  }

  // Apply Mode
  if(mode==='apply'){
    if(step===6){
      return (
        <div className="max-w-3xl mx-auto p-6 bg-white rounded-3xl shadow space-y-4 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto"><CheckCircle2 className="w-8 h-8 text-green-600"/></div>
          <h2 className="text-2xl font-black text-green-700">Application Submitted!</h2>
          <div className="bg-slate-900 text-white p-4 rounded-xl font-mono text-sm">Application Number: <span className="text-amber-300 font-black text-lg">{submittedAppNo}</span> - Keep safe! Use to return.</div>
          <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-xl text-left text-sm"><p className="font-black">📋 Confirmation - Review your data:</p><p className="mt-2">Download your biodata form with application number and exam number attached, passport attached. Kindly come with form on aptitude test day with all information shown. Status: Pending Bursar Clearance.</p></div>
          <div className="flex gap-2"><button onClick={()=>{ setMode('return'); setReturnAppNo(submittedAppNo); }} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-black">Return Dashboard - Enter App No</button><button onClick={()=>{ setMode('dashboard'); setStep(1); }} className="flex-1 bg-slate-200 py-3 rounded-xl font-bold">Home</button></div>
        </div>
      );
    }
    return (
      <div className="max-w-4xl mx-auto p-4 bg-white rounded-3xl shadow space-y-4">
        <div className="flex justify-between items-center"><h2 className="text-xl font-black">📝 Apply Online - Labe College of Nursing Sciences</h2><button onClick={()=>setMode('dashboard')} className="px-3 py-1 bg-slate-100 rounded text-xs font-bold">Back</button></div>
        <div className="flex justify-between text-[11px] font-black flex-wrap gap-1"><span className={`px-3 py-1 rounded-full ${step===1?'bg-blue-600 text-white':'bg-slate-100'}`}>1. Biodata</span><span className={`px-3 py-1 rounded-full ${step===2?'bg-blue-600 text-white':'bg-slate-100'}`}>2. Academics - Secondary, WACE/NECO/NABTEB, 2 Sittings, Maths/English/Chem/Bio/Physics + 4 Others Grading</span><span className={`px-3 py-1 rounded-full ${step===3?'bg-blue-600 text-white':'bg-slate-100'}`}>3. JAMB Reg, Score, Year, First Choice Labe, Course ND/HND</span><span className={`px-3 py-1 rounded-full ${step===4?'bg-blue-600 text-white':'bg-slate-100'}`}>4. Upload Result, Passport, Payment Proof</span><span className={`px-3 py-1 rounded-full ${step===5?'bg-blue-600 text-white':'bg-slate-100'}`}>5. Review & Submit</span></div>

        {step===1 && (
          <div className="grid md:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border">
            <h3 className="md:col-span-2 font-black text-sm">Step 1: Biodata</h3>
            <div><label className="text-[11px] font-bold">Full Name *</label><input value={bio.fullName} onChange={e=>setBio({...bio, fullName:e.target.value})} placeholder="Surname First Other" className="w-full mt-1 px-3 py-2 border rounded-lg text-sm text-black font-bold"/></div>
            <div><label className="text-[11px] font-bold">Phone *</label><input value={bio.phone} onChange={e=>setBio({...bio, phone:e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm text-black"/></div>
            <div><label className="text-[11px] font-bold">Email</label><input value={bio.email} onChange={e=>setBio({...bio, email:e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm text-black"/></div>
            <div><label className="text-[11px] font-bold">Gender</label><select value={bio.gender} onChange={e=>setBio({...bio, gender:e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm text-black"><option>Male</option><option>Female</option></select></div>
            <div><label className="text-[11px] font-bold">DOB</label><input value={bio.dob} onChange={e=>setBio({...bio, dob:e.target.value})} type="date" className="w-full mt-1 px-3 py-2 border rounded-lg text-sm text-black"/></div>
            <div><label className="text-[11px] font-bold">State</label><input value={bio.state} onChange={e=>setBio({...bio, state:e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm text-black"/></div>
            <div><label className="text-[11px] font-bold">LGA</label><input value={bio.lga} onChange={e=>setBio({...bio, lga:e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm text-black"/></div>
            <div className="md:col-span-2"><label className="text-[11px] font-bold">Address</label><input value={bio.address} onChange={e=>setBio({...bio, address:e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm text-black"/></div>
            <button onClick={()=>setStep(2)} className="md:col-span-2 bg-blue-600 text-white py-3 rounded-xl font-black">Next: Academics →</button>
          </div>
        )}

        {step===2 && (
          <div className="bg-slate-50 p-4 rounded-xl border space-y-3">
            <h3 className="font-black text-sm">Step 2: Academics - Secondary School Name, WACE/NECO/NABTEB, Exam No, Year, 2 Sittings</h3>
            <div><label className="text-[11px] font-bold">Name of Secondary School *</label><input value={schoolName} onChange={e=>setSchoolName(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm text-black font-bold"/></div>
            <div className="flex gap-2"><label className="text-[11px] font-bold">If two seating indicates baths:</label><select value={sittingType} onChange={e=>setSittingType(e.target.value as any)} className="px-3 py-2 border rounded-lg text-sm font-black text-black"><option value="ONE_SITTING">One Sitting</option><option value="TWO_SITTINGS">Two Sittings (Baths)</option></select></div>
            <div className="grid md:grid-cols-3 gap-2 bg-white p-3 rounded-xl border"><p className="md:col-span-3 font-black text-xs">Sitting 1</p><div><label className="text-[11px]">Exam Type</label><select value={exam1.type} onChange={e=>setExam1({...exam1, type:e.target.value})} className="w-full mt-1 px-2 py-2 border rounded text-sm text-black"><option>WACE</option><option>NECO</option><option>NABTEB</option></select></div><div><label className="text-[11px]">Exam Number *</label><input value={exam1.number} onChange={e=>setExam1({...exam1, number:e.target.value})} className="w-full mt-1 px-2 py-2 border rounded text-sm text-black"/></div><div><label className="text-[11px]">Year *</label><input value={exam1.year} onChange={e=>setExam1({...exam1, year:e.target.value})} className="w-full mt-1 px-2 py-2 border rounded text-sm text-black"/></div></div>
            {sittingType==='TWO_SITTINGS' && <div className="grid md:grid-cols-3 gap-2 bg-amber-50 p-3 rounded-xl border border-amber-300"><p className="md:col-span-3 font-black text-xs">Sitting 2 - Second</p><div><select value={exam2.type} onChange={e=>setExam2({...exam2, type:e.target.value})} className="w-full mt-1 px-2 py-2 border rounded text-sm text-black"><option>WACE</option><option>NECO</option><option>NABTEB</option></select></div><div><input value={exam2.number} onChange={e=>setExam2({...exam2, number:e.target.value})} placeholder="Exam No 2" className="w-full mt-1 px-2 py-2 border rounded text-sm text-black"/></div><div><input value={exam2.year} onChange={e=>setExam2({...exam2, year:e.target.value})} placeholder="Year 2" className="w-full mt-1 px-2 py-2 border rounded text-sm text-black"/></div></div>}
            <div className="bg-white p-3 rounded-xl border"><p className="font-black text-xs mb-2">Compulsory: Mathematics, English, Chemistry, Biology, Physics + Choose any other 4 with grading (A1-F9)</p><div className="space-y-1">{subjects.map((s,i)=><div key={i} className="grid grid-cols-3 gap-2"><div>{i<5 ? <input value={s.subject} disabled className="w-full px-2 py-2 border bg-slate-100 rounded text-xs font-black text-black"/> : <select value={s.subject} onChange={e=>updateSubject(i,'subject',e.target.value)} className="w-full px-2 py-2 border rounded text-xs text-black"><option value="">-- Choose --</option>{optionalSubjects.map(op=><option key={op} value={op}>{op}</option>)}</select>}</div><div><select value={s.grade} onChange={e=>updateSubject(i,'grade',e.target.value)} className="w-full px-2 py-2 border rounded text-xs text-black"><option value="">Grade</option><option>A1</option><option>B2</option><option>B3</option><option>C4</option><option>C5</option><option>C6</option><option>D7</option><option>E8</option><option>F9</option></select></div><div><select value={s.sitting} onChange={e=>updateSubject(i,'sitting',e.target.value)} className="w-full px-2 py-2 border rounded text-xs text-black"><option value="1">Sitting 1</option><option value="2">Sitting 2</option></select></div></div>)}</div></div>
            <div className="flex gap-2"><button onClick={()=>setStep(1)} className="flex-1 bg-slate-200 py-3 rounded-xl font-bold">← Back</button><button onClick={()=>setStep(3)} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-black">Next: JAMB →</button></div>
          </div>
        )}

        {step===3 && (
          <div className="bg-slate-50 p-4 rounded-xl border space-y-3">
            <h3 className="font-black text-sm">Step 3: JAMB - Registration Number, Scores, First Choice Labe College, Year, Course ND/HND</h3>
            <div className="grid md:grid-cols-2 gap-3 bg-white p-3 rounded-xl border">
              <div><label className="text-[11px] font-bold">JAMB Registration Number *</label><input value={jamb.regNumber} onChange={e=>setJamb({...jamb, regNumber:e.target.value})} placeholder="202412345678AB" className="w-full mt-1 px-3 py-2 border rounded-lg text-sm font-black text-black"/></div>
              <div><label className="text-[11px] font-bold">JAMB Scores *</label><input value={jamb.score} onChange={e=>setJamb({...jamb, score:e.target.value})} type="number" className="w-full mt-1 px-3 py-2 border-2 border-amber-300 rounded-lg text-sm font-black text-black"/></div>
              <div><label className="text-[11px] font-bold">Year of JAMB Exam *</label><input value={jamb.year} onChange={e=>setJamb({...jamb, year:e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm text-black"/></div>
              <div><label className="text-[11px] font-bold">Institution of First Choice</label><input value={jamb.firstChoice} onChange={e=>setJamb({...jamb, firstChoice:e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm text-black bg-amber-50 font-bold"/></div>
              <div className="md:col-span-2"><label className="text-[11px] font-bold">Course Applying ND/HND Nursing Science *</label><select value={jamb.course} onChange={e=>setJamb({...jamb, course:e.target.value})} className="w-full mt-1 px-3 py-2 border-2 border-blue-300 rounded-lg text-sm font-black text-black"><option>ND Nursing Science</option><option>HND Nursing Science</option><option>ND/HND Nursing Science</option></select></div>
            </div>
            <div className="flex gap-2"><button onClick={()=>setStep(2)} className="flex-1 bg-slate-200 py-3 rounded-xl font-bold">← Back</button><button onClick={()=>setStep(4)} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-black">Next: Uploads →</button></div>
          </div>
        )}

        {step===4 && (
          <div className="bg-slate-50 p-4 rounded-xl border space-y-3">
            <h3 className="font-black text-sm">Step 4: Upload Result eg WACE if two seating one box optional, Passport, Proof of Payments</h3>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-xl border"><label className="text-[11px] font-bold">Upload Result WACE Sitting 1 *</label><input type="file" accept=".png,.jpg,.jpeg,.pdf" onChange={e=>setResultFile1(e.target.files?.[0]||null)} className="w-full mt-1 px-2 py-2 border-2 border-dashed rounded-lg text-xs"/></div>
              <div className="bg-white p-3 rounded-xl border"><label className="text-[11px] font-bold">Upload Result Sitting 2 (Optional if two sittings)</label><input type="file" accept=".png,.jpg,.jpeg,.pdf" onChange={e=>setResultFile2(e.target.files?.[0]||null)} disabled={sittingType!=='TWO_SITTINGS'} className="w-full mt-1 px-2 py-2 border-2 border-dashed rounded-lg text-xs disabled:bg-slate-100"/></div>
              <div className="bg-white p-3 rounded-xl border"><label className="text-[11px] font-bold">Upload Passport *</label><input type="file" accept=".png,.jpg,.jpeg" onChange={handlePassport} className="w-full mt-1 px-2 py-2 border-2 border-dashed rounded-lg text-xs"/>{passportPreview && <img src={passportPreview} alt="passport" className="w-24 h-24 object-cover rounded border mt-2 mx-auto"/>}</div>
              <div className="bg-white p-3 rounded-xl border"><label className="text-[11px] font-bold">Upload Prove of Payments *</label><input type="file" accept=".png,.jpg,.jpeg,.pdf" onChange={e=>setPaymentFile(e.target.files?.[0]||null)} className="w-full mt-1 px-2 py-2 border-2 border-dashed border-red-300 rounded-lg text-xs"/></div>
            </div>
            <div className="flex gap-2"><button onClick={()=>setStep(3)} className="flex-1 bg-slate-200 py-3 rounded-xl font-bold">← Back</button><button onClick={()=>setStep(5)} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-black">Review →</button></div>
          </div>
        )}

        {step===5 && (
          <div className="bg-white p-4 rounded-xl border space-y-3">
            <h3 className="font-black text-sm">Step 5: Review His Data - Confirmation Notice</h3>
            <div className="bg-slate-900 text-white p-4 rounded-xl text-xs space-y-1"><p>Biodata: {bio.fullName} | {bio.phone} | {bio.gender} | {bio.state}</p><p>Academics: {schoolName} | {sittingType} | {exam1.type} {exam1.number} {exam1.year} | Subjects: {subjects.filter(s=>s.subject && s.grade).map(s=>`${s.subject} ${s.grade}`).join(', ')}</p><p>JAMB: Reg {jamb.regNumber} Score {jamb.score} Year {jamb.year} First Choice {jamb.firstChoice} Course {jamb.course}</p></div>
            <div className="bg-amber-50 border-2 border-amber-400 p-4 rounded-xl text-sm"><p className="font-black">Please review your data before submitting. After submitting, dashboard will display showing biodata and you can download biodata with application number and exam number attached. Form says she should kindly come with form on aptitude test day with all information show with passport attached. It should show pending bursar clearance.</p></div>
            <div className="flex gap-2"><button onClick={()=>setStep(4)} className="flex-1 bg-slate-200 py-3 rounded-xl font-bold">← Back</button><button onClick={handleApplySubmit} disabled={saving} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-black disabled:bg-gray-300">{saving?'Submitting to Supabase...':'Submit - Save to Supabase'}</button></div>
          </div>
        )}
      </div>
    );
  }

  // Return Mode
  if(mode==='return'){
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-3xl shadow space-y-4">
        <h2 className="text-xl font-black text-center">🔄 Return Application - Enter Application Number</h2><p className="text-xs text-center">After bursar clearance, use application number to return - applicant dashboard open</p>
        <div className="flex gap-2"><input value={returnAppNo} onChange={e=>setReturnAppNo(e.target.value)} placeholder="LCNS/APP/2026/123456" className="flex-1 px-4 py-3 border-2 border-blue-300 rounded-xl font-mono font-black text-black"/><button onClick={handleReturn} disabled={returnLoading} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black">{returnLoading?'Searching...':'Open Dashboard'}</button></div>
        <button onClick={()=>setMode('dashboard')} className="w-full bg-slate-100 py-2 rounded-xl text-xs font-bold">Back to Portal</button>
      </div>
    );
  }

  // DASHBOARD MODE - Existing applicant
  if(!applicant) return null;

  const handlePayAcceptance = () => {
    setPayingAcceptance(true);
    setTimeout(() => {
      const receiptNo = `LCNS-ACC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const updated = applicants.map((a) => a.id === applicant.id ? { ...a, acceptanceFeePaid: true, acceptanceReceiptNo: receiptNo } : a);
      StorageService.saveApplicants(updated);
      setApplicant({ ...applicant, acceptanceFeePaid: true, acceptanceReceiptNo: receiptNo } as any);
      try{ confetti({ particleCount: 100, spread: 80 }); }catch{}
      setPayingAcceptance(false);
      alert(`Acceptance Fee ₦25,000 processed! Receipt: ${receiptNo}`);
    }, 800);
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative"><div className="w-16 h-20 rounded-2xl bg-white/10 border-2 border-amber-400 overflow-hidden shadow-md flex items-center justify-center">{applicant.passportPhotoUrl ? <img src={applicant.passportPhotoUrl} alt={applicant.fullName} className="w-full h-full object-cover"/> : <User className="w-8 h-8 text-amber-200"/>}</div><button onClick={() => setShowPhotoModal(true)} className="absolute -bottom-2 -right-2 bg-amber-400 text-slate-950 p-1.5 rounded-full shadow"><Camera className="w-3.5 h-3.5"/></button></div>
            <div><span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-emerald-800 px-3 py-1 rounded-full">2026/2027 Admissions Applicant Portal - JAMB: {applicant.jambRegNo||(applicant as any).jambRegNo} Score: {applicant.jambScore||(applicant as any).jambScore}</span><h1 className="text-xl sm:text-2xl font-black uppercase mt-2">{applicant.fullName}</h1><p className="text-xs text-emerald-200 font-mono">Form No: <strong className="text-white">{applicant.formNo}</strong> | Exam No: {(applicant as any).examNumber||applicant.formNo} | Course: {applicant.courseChoice1||applicant.program} | {applicant.courseChoice1?.includes('ND')?'ND/HND Nursing Science':''}</p></div>
          </div>
          <div className="bg-emerald-950/80 p-3.5 rounded-2xl border border-emerald-800 text-center sm:text-right"><span className="text-[10px] text-emerald-300 uppercase block font-bold">Status</span><span className="text-sm font-black text-amber-400 uppercase">{applicant.status==='ADMITTED'?'PROVISIONAL OFFER GRANTED':isPendingBursar?'AWAITING BURSAR CLEARANCE - Pending Bursar Clearance':isBursarCleared?'BURSAR CLEARED - Admission in Progress':applicant.status}</span></div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border shadow-xs no-print">
        <button onClick={()=>setActiveTab('biodata')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab==='biodata'?'bg-blue-700 text-white':'text-slate-600 hover:bg-slate-100'}`}><FileText className="w-4 h-4"/>Biodata Form + Application No + Exam No + Passport + Instruction Aptitude Test Day</button>
        <button onClick={()=>setActiveTab('status')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab==='status'?'bg-[#0a4d2e] text-white':'text-slate-600 hover:bg-slate-100'}`}><Award className="w-4 h-4"/>Admission Status & Clearance - JAMB Scores Display</button>
        <button onClick={()=>setActiveTab('printout')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab==='printout'?'bg-[#0a4d2e] text-white':'text-slate-600 hover:bg-slate-100'}`}><Printer className="w-4 h-4"/>Printout - Pending Bursar Clearance / Cleared</button>
        <button onClick={()=>setActiveTab('cbt')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab==='cbt'?'bg-[#0a4d2e] text-white':'text-slate-600 hover:bg-slate-100'}`}><Sparkles className="w-4 h-4"/>CBT Exams Set from Registrar/Admin - JAMB Scores Display - CBT Score Publish</button>
        {applicant.status==='ADMITTED' && <button onClick={()=>setActiveTab('letter')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab==='letter'?'bg-[#0a4d2e] text-white':'text-slate-600 hover:bg-slate-100'}`}><FileText className="w-4 h-4"/>Official Admission Letter - Congratulation</button>}
        <button onClick={()=>setMode('apply')} className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-400 text-black">Apply New</button>
        <button onClick={()=>setMode('return')} className="px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white">Return with App No</button>
      </div>

      {activeTab==='biodata' && (
        <div className="bg-white rounded-3xl border p-6 space-y-4">
          <div className="flex justify-between items-center"><h3 className="font-black text-base">Biodata Form - Application Number and Exam Number Attached - Passport Attached - JAMB Scores Display</h3><button onClick={handleDownloadBiodata} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1"><Download className="w-4 h-4"/>Download Biodata with Application Number and Exam Number + Passport</button></div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border"><p>Full Name: <b>{applicant.fullName}</b> | App No: <b className="text-blue-700">{applicant.formNo}</b> | Exam No: <b>{(applicant as any).examNumber||applicant.formNo}</b></p><p>JAMB Registration Number: <span className="font-mono font-black bg-yellow-200 px-2">{applicant.jambRegNo||(applicant as any).jambRegNo}</span> | JAMB Score: <span className="font-black text-lg text-blue-700">{applicant.jambScore||(applicant as any).jambScore}</span> | Year: {(applicant as any).jambYear||''} | Course Applying: {applicant.courseChoice1||applicant.program} (ND/HND Nursing Science)</p><p>Secondary School: {(applicant as any).secondarySchoolName||''} | Sitting: {(applicant as any).sittingType||''} | {(applicant as any).examType1||''} {(applicant as any).examNumber1||''} {(applicant as any).year1||''}</p><p>Subjects: Maths, English, Chemistry, Biology, Physics compulsory + {(applicant as any).subjects ? (applicant as any).subjects.map((s:any)=>`${s.subject} ${s.grade}`).join(', ') : `${applicant.olevelGrades?.english||''} English, ${applicant.olevelGrades?.mathematics||''} Maths...`}</p></div>
              <div className="bg-amber-50 border-2 border-amber-300 p-3 rounded-xl"><p className="font-black">Instruction:</p><p>She should kindly come with the form on aptitude test day with all information show with passport attached on and it should show pending bursar clearance. After bursar clearance use application number to return once input application number applicant dashboard open, showing his biodata form, CBT exams set from Registrar or Admin. JAMB scores should display on the board with JAMB registration number. Admission in progress, his CBT test score publish by Registrar and Admin, Interview scores published by Registrar or Admin. If admitted write congratulation the full name of applicant and add kindly proceed to JAMB CBT center and print your admission number and returns back to school.</p><p className="mt-2">Status: {isBursarCleared?'✅ BURSAR CLEARED - You can now see CBT exams':'⏳ PENDING BURSAR CLEARANCE - Bursar needs to clear your payment proof'}</p></div>
              <div className="bg-blue-50 p-3 rounded-xl border"><h4 className="font-black">CBT Exam - Set from Registrar/Admin</h4><p className="text-[11px]">CBT Exam Date: {(applicant as any).cbtExamDate||'Not yet set by Registrar/Admin'} | Venue: {(applicant as any).cbtExamVenue||''}</p><p className="text-[11px]">JAMB Scores display on board: {applicant.jambRegNo} Score {applicant.jambScore}</p><p className="text-[11px]">Admission in progress | CBT Test Score Publish: {(applicant as any).cbtPublished ? `${(applicant as any).cbtScore}/${(applicant as any).cbtTotal}` : 'Not yet published by Registrar/Admin'} | Interview Scores Published: {(applicant as any).interviewPublished ? `${(applicant as any).interviewScore}/${(applicant as any).interviewTotal}` : 'Not yet published'}</p></div>
            </div>
            <div className="space-y-3"><div className="border-2 border-black p-2 rounded-xl text-center"><p className="text-[10px] font-bold">PASSPORT ATTACHED</p><img src={applicant.passportPhotoUrl} alt="passport" className="w-32 h-40 object-cover mx-auto border-2 border-black mt-2"/><p className="text-[11px] font-mono mt-1">App No: {applicant.formNo}</p><p className="text-[11px] font-mono">Exam No: {(applicant as any).examNumber||applicant.formNo}</p><p className="text-[11px]">JAMB Reg: {applicant.jambRegNo}</p></div></div>
          </div>
        </div>
      )}

      {activeTab==='status' && (
        <div className="space-y-6">
          {isPendingBursar && <div className="p-6 bg-amber-50 rounded-3xl border-2 border-amber-400 flex gap-3"><Clock className="w-6 h-6"/><div><h3 className="font-black">AWAITING BURSAR CLEARANCE - Pending Bursar Clearance</h3><p className="text-xs">Your proof of payment is being verified. After bursar clearance, use application number to return - dashboard will open showing biodata, JAMB scores, CBT exams set from Registrar/Admin.</p></div></div>}
          {isBursarCleared && <div className="p-6 bg-emerald-50 rounded-3xl border-2 border-emerald-500 flex gap-3"><ShieldCheck className="w-6 h-6"/><div><h3 className="font-black">BURSAR CLEARED - Admission in Progress</h3><p className="text-xs">Cleared on {applicant.bursarClearedDate}. JAMB Registration Number: {applicant.jambRegNo} - JAMB Score: {applicant.jambScore} displays on board. CBT exams set from Registrar/Admin will appear. CBT test score publish by Registrar/Admin and Interview scores published.</p></div></div>}
          {applicant.status==='ADMITTED' && (
            <div className="p-6 bg-green-50 rounded-3xl border-2 border-green-500"><h3 className="font-black text-lg">🎉 Congratulations {applicant.fullName}!</h3><p className="text-sm mt-2">You have been offered provisional admission into {applicant.courseChoice1||applicant.program} - ND/HND Nursing Science!</p><p className="text-sm mt-2 font-bold">Kindly proceed to JAMB CBT center and print your admission number and returns back to school with admission letter and biodata form with passport attached.</p><p className="text-xs mt-2">JAMB Reg: {applicant.jambRegNo} | CBT Score: {(applicant as any).cbtScore||'--'} | Interview: {(applicant as any).interviewScore||'--'}</p></div>
          )}
          <div className="bg-white rounded-3xl border p-6 space-y-2 text-xs"><h3 className="font-bold uppercase">JAMB Scores Display on Board with JAMB Registration Number</h3><p>JAMB Reg No: <span className="font-mono font-black bg-yellow-200 px-2 py-1 rounded">{applicant.jambRegNo||(applicant as any).jambRegNo}</span> | Score: <b className="text-2xl text-blue-700">{applicant.jambScore||(applicant as any).jambScore}</b> | Year: {(applicant as any).jambYear||''}</p><p>Course Applying: {applicant.courseChoice1||applicant.program} - Institution First Choice: Labe College of Nursing Sciences</p><p>Status: Admission in Progress | CBT Score Publish by Registrar/Admin: {(applicant as any).cbtPublished ? `${(applicant as any).cbtScore}/${(applicant as any).cbtTotal}` : 'Not yet published'} | Interview: {(applicant as any).interviewPublished ? `${(applicant as any).interviewScore}` : 'Not yet published'}</p></div>
        </div>
      )}

      {activeTab==='printout' && (
        <div className="space-y-4">
          {!isBursarCleared ? (
            <div className="p-8 text-center bg-amber-50 rounded-3xl border-2 border-amber-300"><Clock className="w-12 h-12 mx-auto text-amber-600"/><h3 className="font-black">AWAITING BURSAR CLEARANCE - Pending Bursar Clearance</h3><p className="text-xs">Applicant cannot download application printout if not cleared by Bursar. After bursar clearance use application number to return.</p></div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between no-print"><span className="text-xs font-bold uppercase">Official Stamped Application Slip - Application No + Exam No + Passport Attached</span><button onClick={handlePrint} className="px-4 py-2 bg-[#0a4d2e] text-white text-xs font-bold rounded-xl flex items-center gap-1"><Printer className="w-4 h-4"/>Download / Print - She should kindly come with form on aptitude test day</button></div>
              <div className="border-2 border-[#0a4d2e] rounded-2xl p-8 bg-white shadow-xl text-xs space-y-4">
                <div className="text-center pb-4 border-b-2 border-[#0a4d2e]"><div className="flex items-center justify-center gap-3"><CollegeLogo size="md"/><div><h1 className="text-lg font-black uppercase">Labe College of Nursing Sciences, Gboko</h1><p className="text-xs font-bold tracking-wider uppercase">Application No: {applicant.formNo} | Exam No: {(applicant as any).examNumber||applicant.formNo} | JAMB Reg: {applicant.jambRegNo} Score: {applicant.jambScore}</p></div></div></div>
                <div className="grid grid-cols-3 gap-6"><div className="col-span-2 space-y-1"><p>Full Name: <b>{applicant.fullName}</b></p><p>Phone: {applicant.phone} | Gender: {applicant.gender} | DOB: {applicant.dob}</p><p>Secondary School: {(applicant as any).secondarySchoolName||''} | {applicant.jambRegNo} | Course: {applicant.courseChoice1||applicant.program} ND/HND Nursing Science</p><p>JAMB Scores Display: {applicant.jambRegNo} - {applicant.jambScore} - Year {(applicant as any).jambYear||''} - First Choice Labe College of Nursing Sciences</p></div><div className="flex flex-col items-center"><div className="w-32 h-40 border-2 border-[#0a4d2e] rounded-xl overflow-hidden">{applicant.passportPhotoUrl ? <img src={applicant.passportPhotoUrl} alt="Passport" className="w-full h-full object-cover"/> : <User className="w-10 h-10"/>}</div><span className="text-[10px] mt-1 font-bold">Passport Attached - Application No + Exam No</span></div></div>
                <div className="my-6 p-4 rounded-2xl border-2 border-dashed bg-emerald-50/50 flex justify-between items-center"><div><p className="font-bold">Bursary: {isBursarCleared?'BURSAR CLEARED - PAID':'PENDING BURSAR CLEARANCE'}</p><p className="text-[11px]">Kindly come with form on aptitude test day with all information show with passport attached</p></div><div className="border-4 border-emerald-700 rounded-xl p-3 text-center transform rotate-1 bg-white"><div className="text-[10px] font-black">LABE COLLEGE</div><div className="text-xs font-black">★ BURSAR {isBursarCleared?'CLEARED':'PENDING'} ★</div><div className="text-[10px] font-mono">DATE: {applicant.bursarClearedDate||new Date().toISOString().split('T')[0]}</div></div></div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab==='cbt' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border p-6 space-y-4">
            <h3 className="font-bold uppercase">CBT Exams Set from Registrar or Admin - JAMB Scores Display - CBT Test Score Publish by Registrar/Admin - Interview Scores Published</h3>
            <div className="bg-blue-50 p-4 rounded-xl border"><p className="text-xs font-bold">JAMB Registration Number: {applicant.jambRegNo||(applicant as any).jambRegNo} | JAMB Score: {applicant.jambScore||(applicant as any).jambScore} - Display on board with JAMB registration number</p><p className="text-xs">Admission in progress - CBT exam set from Registrar/Admin will show here</p></div>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl border-2 bg-blue-50 border-blue-200"><h4 className="font-black text-xs">CBT Exam - Set by Registrar/Admin</h4>{(applicant as any).cbtExamDate ? <div className="text-xs mt-2"><p>Date: <b>{(applicant as any).cbtExamDate}</b> Venue: <b>{(applicant as any).cbtExamVenue}</b> Time: <b>{(applicant as any).cbtExamTime}</b></p><p className="mt-2">Score: {(applicant as any).cbtPublished ? <span className="font-black text-lg text-blue-700">{(applicant as any).cbtScore}/{(applicant as any).cbtTotal}</span> : <span className="text-amber-600">Not yet published by Registrar/Admin</span>}</p></div> : <p className="text-xs mt-2 text-slate-500">Not yet scheduled by Registrar/Admin</p>}</div>
              <div className="p-4 rounded-xl border-2 bg-purple-50 border-purple-200"><h4 className="font-black text-xs">Interview Scores - Published by Registrar/Admin</h4>{(applicant as any).interviewDate ? <div className="text-xs mt-2"><p>Date: <b>{(applicant as any).interviewDate}</b></p><p className="mt-2">Score: {(applicant as any).interviewPublished ? <span className="font-black text-lg text-purple-700">{(applicant as any).interviewScore}/{(applicant as any).interviewTotal}</span> : <span className="text-amber-600">Not yet published</span>}</p></div> : <p className="text-xs mt-2 text-slate-500">Interview not yet scheduled</p>}</div>
              <div className={`p-4 rounded-xl border-2 ${applicant.status==='ADMITTED'?'bg-green-50 border-green-500':'bg-slate-50'}`}><h4 className="font-black text-xs">Admission</h4>{applicant.status==='ADMITTED' ? <div className="mt-2"><p className="font-black text-green-800 text-sm">🎉 Congratulations {applicant.fullName}!</p><p className="text-xs mt-1">Kindly proceed to JAMB CBT center and print your admission number and returns back to school.</p></div> : <p className="text-xs mt-2">Admission in progress - Wait for CBT + Interview scores published by Registrar/Admin</p>}</div>
            </div>
            {activeCbtExam ? <CBTExamSession exam={activeCbtExam} currentUser={{ id: applicant.formNo, email: applicant.email, role: 'APPLICANT', fullName: applicant.fullName, photoUrl: applicant.passportPhotoUrl, status: 'ACTIVE' }} onClose={()=>setActiveCbtExam(null)} onCompleted={()=>setActiveCbtExam(null)}/> : <div className="space-y-3"><p className="text-xs font-bold uppercase">Available Screening Tests from Registrar/Admin ({cbtExams.length})</p><div className="grid md:grid-cols-2 gap-4">{cbtExams.map((exam:any)=>{ const alreadyTaken=cbtSubmissions.some((s:any)=>s.examId===exam.id); return <div key={exam.id} className="p-4 bg-slate-50 rounded-2xl border flex justify-between items-center"><div><p className="font-bold text-sm">{exam.title}</p><p className="text-xs text-slate-500">{exam.durationMinutes} Mins - {exam.questions.length} Questions</p></div>{alreadyTaken ? <span className="text-xs font-bold text-emerald-700 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/>Completed</span> : <button onClick={()=>setActiveCbtExam(exam)} className="px-4 py-2 bg-[#0a4d2e] text-white text-xs font-bold rounded-xl flex items-center gap-1"><Play className="w-3.5 h-3.5"/>Start CBT</button>}</div>})}</div></div>}
          </div>
        </div>
      )}

      {activeTab==='letter' && applicant.status==='ADMITTED' && (
        <div className="space-y-4"><div className="flex justify-between no-print"><span className="text-xs font-bold uppercase">Provisional Admission Letter - Congratulation {applicant.fullName}</span><button onClick={handlePrint} className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1"><Printer className="w-4 h-4"/>Print Letter - Proceed to JAMB CBT Center</button></div>
          <div className="border-4 border-double border-emerald-900 p-8 rounded-2xl bg-white shadow-xl text-xs space-y-4">
            <div className="text-center pb-4 border-b-2 border-emerald-900"><h1 className="text-xl font-black uppercase">Labe College of Nursing Sciences, Gboko</h1><p className="text-xs font-bold uppercase">Offer of Provisional Admission - 2026/2027 - {applicant.courseChoice1||applicant.program} - JAMB Reg: {applicant.jambRegNo} Score: {applicant.jambScore}</p></div>
            <p>Dear <b>{applicant.fullName.toUpperCase()}</b>, Application No: {applicant.formNo} Exam No: {(applicant as any).examNumber||applicant.formNo}</p>
            <p className="font-bold text-center uppercase underline">Congratulations!</p>
            <p>You have been offered provisional admission into Labe College of Nursing Sciences to study {applicant.courseChoice1||applicant.program} - ND/HND Nursing Science. Your CBT Score: {(applicant as any).cbtScore||''} Interview Score: {(applicant as any).interviewScore||''} JAMB Score: {applicant.jambScore} displayed on board with JAMB registration number {applicant.jambRegNo}.</p>
            <p className="font-bold mt-4">Next: Kindly proceed to JAMB CBT center and print your admission number and returns back to school with your biodata form, passport attached, application number, exam number, and all original documents.</p>
            <div className="pt-8 flex justify-between"><div><p className="font-bold">Barr. Timothy J. Iorbee</p><p className="text-[10px]">Registrar - LCNS</p></div><div className="w-20 h-20 border border-emerald-900 rounded-full flex flex-col items-center justify-center text-[8px] font-bold uppercase"><span>OFFICIAL SEAL</span><span>LCNS GBOKO</span></div></div>
          </div>
        </div>
      )}

      <UserProfilePhotoModal isOpen={showPhotoModal} onClose={()=>setShowPhotoModal(false)} currentUser={{ id: applicant.formNo, email: applicant.email, role: 'APPLICANT', fullName: applicant.fullName, photoUrl: applicant.passportPhotoUrl, status: 'ACTIVE' }} onPhotoUpdated={(newUrl)=>setApplicant(prev=>({ ...prev, passportPhotoUrl: newUrl } as any))}/>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import { CollegeLogo } from '../common/CollegeLogo';
import { ApiService } from '../../services/api';
import { Applicant } from '../../types';
import { compressImage } from '../../utils/imageCompressor';
import { X, User, GraduationCap, BookOpen, Award, CheckCircle2, Printer, FileCheck, ChevronRight, ChevronLeft, Upload, FileText, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ApplicationFormModalProps { isOpen: boolean; onClose: () => void; onOpenAdmissionChecker: (formNo?: string) => void; }

export const ApplicationFormModal: React.FC<ApplicationFormModalProps> = ({ isOpen, onClose, onOpenAdmissionChecker }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [submitting, setSubmitting] = useState(false);
  const [submittedApplicant, setSubmittedApplicant] = useState<Applicant | null>(null);
  const [fullName, setFullName] = useState(''); const [email, setEmail] = useState(''); const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Female'); const [dob, setDob] = useState('2005-06-15');
  const [stateOfOrigin, setStateOfOrigin] = useState('Benue'); const [lga, setLga] = useState('Gboko');
  const [address, setAddress] = useState('Gboko, Benue State'); const [sponsorName, setSponsorName] = useState(''); const [sponsorPhone, setSponsorPhone] = useState('');
  const [courseChoice1, setCourseChoice1] = useState('ND/HND Nursing Sciences - 4 Years Collegiate (ND Years 1-2 + HND Years 3-4)');
  const [courseChoice2, setCourseChoice2] = useState('ND/HND Nursing Sciences - 4 Years Collegiate');
  const [program, setProgram] = useState<Applicant['program']>('ND/HND Nursing Sciences (4 Years)' as any);
  const [jambRegNo, setJambRegNo] = useState(''); const [jambScore, setJambScore] = useState<number>(205);
  const [olevelExamType, setOlevelExamType] = useState<'WAEC' | 'NECO' | 'NABTEB'>('WAEC'); const [olevelExamYear, setOlevelExamYear] = useState('2025');
  const [english, setEnglish] = useState('B3'); const [mathematics, setMathematics] = useState('B2'); const [biology, setBiology] = useState('A1'); const [chemistry, setChemistry] = useState('B3'); const [physics, setPhysics] = useState('B3');
  const [passportPhotoUrl, setPassportPhotoUrl] = useState<string>(''); const [compressingPhoto, setCompressingPhoto] = useState(false);
  const [paymentReceiptPdfUrl, setPaymentReceiptPdfUrl] = useState<string>(''); const [paymentReceiptName, setPaymentReceiptName] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null); const pdfInputRef = useRef<HTMLInputElement>(null);
  if (!isOpen) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return; setUploadError(null); setCompressingPhoto(true);
    try { const compressed = await compressImage(file, { maxWidth: 500, maxHeight: 500, quality: 0.85, mimeType: 'image/jpeg' }); setPassportPhotoUrl(compressed); }
    catch (err: any) { setUploadError('Failed to process passport image: ' + err.message); } finally { setCompressingPhoto(false); }
  };
  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return; setUploadError(null); setPaymentReceiptName(file.name);
    const reader = new FileReader(); reader.onload = () => { setPaymentReceiptPdfUrl(reader.result as string); }; reader.onerror = () => { setUploadError('Failed to read payment receipt document.'); }; reader.readAsDataURL(file);
  };
  const handleNext = () => {
    setUploadError(null);
    if (step === 1) { if (!fullName.trim() || !email.trim() || !phone.trim() || !stateOfOrigin.trim() || !lga.trim()) { alert('Please fill in your full name, email, phone number, state, and LGA.'); return; } }
    if (step === 2) { if (!courseChoice1 || !courseChoice2) { alert('Please specify your Course Choice 1 and Course Choice 2.'); return; } if (!jambRegNo.trim() || jambScore < 100) { alert('Please provide a valid JAMB registration number and score.'); return; } }
    if (step === 4) { if (!passportPhotoUrl) { setUploadError('Passport photograph upload is required to proceed.'); return; } if (!paymentReceiptPdfUrl) { setUploadError('Proof of Bank Payment (Receipt / Teller / Remita slip) upload is required.'); return; } }
    setStep((prev) => (prev + 1) as any);
  };
  const handleBack = () => { setStep((prev) => (prev - 1) as any); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passportPhotoUrl || !paymentReceiptPdfUrl) { alert('Both Passport Photograph and Proof of Bank Payment are required.'); return; }
    setSubmitting(true);
    try {
      const forcedCourse1 = 'ND/HND Nursing Sciences - 4 Years Collegiate (ND Years 1-2 + HND Years 3-4)';
      const forcedCourse2 = 'ND/HND Nursing Sciences - 4 Years Collegiate';
      const forcedProgram = 'ND/HND Nursing Sciences (4 Years)';
      const applicantData = {
        fullName, email, phone, gender, dob, stateOfOrigin, lga, address,
        courseChoice1: forcedCourse1, courseChoice2: forcedCourse2, program: forcedProgram as any,
        jambRegNo, jambScore, passportPhotoUrl, paymentReceiptPdfUrl,
        paymentReceiptName: paymentReceiptName || 'Proof_of_Payment.pdf',
        olevelExamType, olevelExamYear, olevelGrades: { english, mathematics, biology, chemistry, physics },
        sponsorName: sponsorName || 'Parent / Guardian', sponsorPhone: sponsorPhone || phone,
      };

      // === FIXED: SAFE COLUMNS ONLY - NO full_data / biodata ===
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
        const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
        if (supabaseUrl && supabaseKey) {
          const supabase = createClient(supabaseUrl, supabaseKey);
          const formNo = `LCNS-${Date.now().toString().slice(-6)}-${Math.floor(Math.random()*100)}`;
          const { error: appError } = await supabase.from('applications').insert({
            id: formNo, applicant_name: fullName, email: email, phone: phone,
            choice_one: forcedCourse1, choice_two: forcedCourse2,
            jamb_reg_no: jambRegNo, jamb_score: jambScore, status: 'PENDING_BURSAR',
            created_at: new Date().toISOString()
          });
          if (appError) { console.warn('applications insert error:', appError.message); alert('Supabase Error: ' + appError.message); }
          else { console.log('✅ Saved to applications:', formNo); }
          (applicantData as any).formNo = formNo;
        }
      } catch (supaErr: any) { console.warn('Supabase direct insert skipped:', supaErr?.message); }

      const result = await ApiService.submitApplication(applicantData);
      setSubmittedApplicant(result); setSubmitting(false);
      try { confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } }); } catch {}
    } catch (err: any) { setSubmitting(false); alert('Error submitting application: ' + err.message); }
  };

  const handlePrintSlip = () => {
    if (submittedApplicant?.status === 'PENDING_BURSAR' || submittedApplicant?.bursarStatus === 'PENDING_BURSAR') { alert('Official Registration Printout is locked awaiting Bursar payment verification. Please check back once cleared by Bursar.'); return; }
    window.print();
  };
  const isBursarCleared = submittedApplicant && (submittedApplicant.status === 'BURSAR_CLEARED' || submittedApplicant.status === 'ADMITTED' || submittedApplicant.bursarStatus === 'CLEARED');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden border border-slate-200">
        <div className="bg-gradient-to-r from-[#0a4d2e] to-[#042114] text-white p-5 flex items-center justify-between no-print border-b border-emerald-950">
          <div className="flex items-center gap-3"><CollegeLogo size="sm" /><div><h2 className="text-base font-bold uppercase font-serif-crest leading-tight">2026/2027 Online Application Portal</h2><p className="text-xs text-emerald-300">Labe College of Nursing Sciences, Gboko &bull; Catholic Diocese of Gboko &bull; Office of the Admissions Officer</p></div></div>
          <button onClick={onClose} className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        {!submittedApplicant && (
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 no-print">
            <div className="flex items-center justify-between max-w-xl mx-auto text-xs font-semibold">
              <span className={`flex items-center gap-1.5 ${step >= 1 ? 'text-[#0a4d2e] font-bold' : 'text-slate-400'}`}><span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 1 ? 'bg-[#0a4d2e] text-white' : 'bg-slate-200'}`}>1</span><span>Bio-Data</span></span><span className="text-slate-300">&rarr;</span>
              <span className={`flex items-center gap-1.5 ${step >= 2 ? 'text-[#0a4d2e] font-bold' : 'text-slate-400'}`}><span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 2 ? 'bg-[#0a4d2e] text-white' : 'bg-slate-200'}`}>2</span><span>Choices &amp; JAMB</span></span><span className="text-slate-300">&rarr;</span>
              <span className={`flex items-center gap-1.5 ${step >= 3 ? 'text-[#0a4d2e] font-bold' : 'text-slate-400'}`}><span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 3 ? 'bg-[#0a4d2e] text-white' : 'bg-slate-200'}`}>3</span><span>O-Level</span></span><span className="text-slate-300">&rarr;</span>
              <span className={`flex items-center gap-1.5 ${step >= 4 ? 'text-[#0a4d2e] font-bold' : 'text-slate-400'}`}><span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 4 ? 'bg-[#0a4d2e] text-white' : 'bg-slate-200'}`}>4</span><span>Photo &amp; Payment</span></span><span className="text-slate-300">&rarr;</span>
              <span className={`flex items-center gap-1.5 ${step >= 5 ? 'text-[#0a4d2e] font-bold' : 'text-slate-400'}`}><span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 5 ? 'bg-[#0a4d2e] text-white' : 'bg-slate-200'}`}>5</span><span>Review</span></span>
            </div>
          </div>
        )}
        <div className="p-6">
          {submittedApplicant ? (
            <div className="space-y-6">
              {!isBursarCleared ? (
                <div className="p-5 bg-amber-50 border-2 border-amber-400 rounded-2xl text-center no-print space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-200 text-amber-950 font-black text-xs uppercase tracking-wider"><Clock className="w-4 h-4 text-amber-800" /><span>Status: Awaiting Bursar Clearance</span></div>
                  <h3 className="text-lg font-black text-amber-950 font-serif-crest uppercase">Application Form Submitted Successfully!</h3>
                  <p className="text-xs text-amber-900 max-w-lg mx-auto leading-relaxed">Your form details and bank payment proof have been registered under <strong>{submittedApplicant.formNo}</strong>.<br /><strong>Notice:</strong> Official Printout locked until Bursar clearance.</p>
                  <div className="pt-2 flex items-center justify-center gap-3"><button disabled className="inline-flex items-center gap-2 bg-slate-300 text-slate-500 cursor-not-allowed px-4 py-2 rounded-xl text-xs font-bold"><Printer className="w-4 h-4" /><span>Download Printout (Locked)</span></button><button onClick={() => onOpenAdmissionChecker(submittedApplicant.formNo)} className="inline-flex items-center gap-2 bg-[#0a4d2e] hover:bg-[#06321e] text-white px-4 py-2 rounded-xl text-xs font-bold"><Award className="w-4 h-4" /><span>Track Bursar Clearance</span></button></div>
                </div>
              ) : (
                <div className="p-5 bg-emerald-50 border-2 border-emerald-500 rounded-2xl text-center no-print space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-200 text-emerald-950 font-black text-xs uppercase tracking-wider"><ShieldCheck className="w-4 h-4 text-emerald-800" /><span>Status: Bursar Cleared & Verified</span></div>
                  <h3 className="text-lg font-black text-emerald-950 font-serif-crest uppercase">Application Cleared for Physical Screening</h3>
                  <div className="pt-2 flex items-center justify-center gap-3"><button onClick={handlePrintSlip} className="inline-flex items-center gap-2 bg-[#0a4d2e] hover:bg-[#06321e] text-white px-5 py-2.5 rounded-xl text-xs font-bold"><Printer className="w-4 h-4" /><span>Download / Print Cleared Slip</span></button></div>
                </div>
              )}
              <div className="border-2 border-[#0a4d2e] rounded-2xl p-6 bg-white shadow-sm print-page relative">
                <div className="text-center pb-4 border-b-2 border-[#0a4d2e]"><div className="flex items-center justify-center gap-3 mb-2"><CollegeLogo size="md" /><div><h1 className="text-lg sm:text-xl font-black text-emerald-950 uppercase font-serif-crest">Labe College of Nursing Sciences, Gboko</h1><p className="text-sm font-black text-[#0a4d2e] uppercase">Catholic Diocese of Gboko, Benue State</p></div></div><div className="inline-block bg-[#0a4d2e] text-white font-bold text-xs uppercase px-4 py-1 rounded-full mt-2">2026/2027 Admissions Screening Acknowledgement Slip</div></div>
                <div className="grid grid-cols-3 gap-4 my-5 items-start"><div className="col-span-2 space-y-2 text-xs"><div className="flex border-b border-slate-100 py-1"><span className="w-40 font-bold text-slate-600">Form No:</span><span className="font-mono-code font-bold text-[#0a4d2e] text-sm">{submittedApplicant.formNo}</span></div><div className="flex border-b border-slate-100 py-1"><span className="w-40 font-bold text-slate-600">Full Name:</span><span className="font-bold text-slate-900 uppercase">{submittedApplicant.fullName}</span></div><div className="flex border-b border-slate-100 py-1"><span className="w-40 font-bold text-slate-600">Choice 1:</span><span className="font-bold text-[#0a4d2e]">{submittedApplicant.courseChoice1}</span></div><div className="flex border-b border-slate-100 py-1"><span className="w-40 font-bold text-slate-600">Email:</span><span className="text-slate-800">{submittedApplicant.email}</span></div></div><div className="flex flex-col items-center"><div className="w-32 h-40 border-2 border-[#0a4d2e] rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">{submittedApplicant.passportPhotoUrl ? (<img src={submittedApplicant.passportPhotoUrl} alt="Passport" className="w-full h-full object-cover" />) : (<User className="w-10 h-10 text-slate-300" />)}</div></div></div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {uploadError && (<div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" /><span>{uploadError}</span></div>)}
              {step === 1 && (<div className="space-y-4"><h3 className="text-sm font-bold text-[#0a4d2e] uppercase border-b pb-2 flex items-center gap-1.5"><User className="w-4 h-4" /> Step 1: Bio-Data</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="sm:col-span-2"><label className="block text-xs font-bold mb-1">Full Name *</label><input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm" required /></div><div><label className="block text-xs font-bold mb-1">Email *</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm" required /></div><div><label className="block text-xs font-bold mb-1">Phone *</label><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm" required /></div><div><label className="block text-xs font-bold mb-1">Gender *</label><select value={gender} onChange={(e) => setGender(e.target.value as any)} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"><option>Female</option><option>Male</option></select></div><div><label className="block text-xs font-bold mb-1">DOB *</label><input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm" required /></div><div><label className="block text-xs font-bold mb-1">State *</label><input type="text" value={stateOfOrigin} onChange={(e) => setStateOfOrigin(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm" required /></div><div><label className="block text-xs font-bold mb-1">LGA *</label><input type="text" value={lga} onChange={(e) => setLga(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm" required /></div><div className="sm:col-span-2"><label className="block text-xs font-bold mb-1">Address *</label><input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm" required /></div></div></div>)}
              {step === 2 && (<div className="space-y-4"><h3 className="text-sm font-bold text-[#0a4d2e] uppercase border-b pb-2 flex items-center gap-1.5"><GraduationCap className="w-4 h-4" /> Step 2: Course & JAMB</h3><div><label className="block text-xs font-bold mb-1">Choice 1 *</label><select value={courseChoice1} onChange={(e) => setCourseChoice1(e.target.value)} className="w-full p-3 bg-slate-50 border-2 border-emerald-500 rounded-xl text-sm font-bold"><option value="ND/HND Nursing Sciences - 4 Years Collegiate (ND Years 1-2 + HND Years 3-4)">✅ ND/HND Nursing Sciences - 4 Years Collegiate (ND Years 1-2 + HND Years 3-4)</option><option value="ND Nursing Sciences (Years 1 & 2)">ND Nursing Sciences</option></select></div><div><label className="block text-xs font-bold mb-1">Choice 2 *</label><select value={courseChoice2} onChange={(e) => setCourseChoice2(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold"><option value="ND/HND Nursing Sciences - 4 Years Collegiate">✅ ND/HND Nursing Sciences - 4 Years Collegiate</option><option value="HND Nursing Sciences (Years 3 & 4)">HND Nursing Sciences</option></select></div><div className="grid grid-cols-2 gap-4 pt-2"><div><label className="block text-xs font-bold mb-1">JAMB Reg No *</label><input type="text" value={jambRegNo} onChange={(e) => setJambRegNo(e.target.value.toUpperCase())} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm uppercase" required /></div><div><label className="block text-xs font-bold mb-1">JAMB Score *</label><input type="number" value={jambScore} onChange={(e) => setJambScore(Number(e.target.value))} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold" required /></div></div></div>)}
              {step === 3 && (<div className="space-y-4"><h3 className="text-sm font-bold text-[#0a4d2e] uppercase border-b pb-2 flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> Step 3: O-Level</h3><div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-bold mb-1">Exam Type</label><select value={olevelExamType} onChange={(e) => setOlevelExamType(e.target.value as any)} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold"><option>WAEC</option><option>NECO</option><option>NABTEB</option></select></div><div><label className="block text-xs font-bold mb-1">Year</label><input type="text" value={olevelExamYear} onChange={(e) => setOlevelExamYear(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm" /></div></div><div className="grid grid-cols-5 gap-3 pt-2">{[['English', english, setEnglish], ['Maths', mathematics, setMathematics], ['Biology', biology, setBiology], ['Chemistry', chemistry, setChemistry], ['Physics', physics, setPhysics]].map(([label, val, setter]: any) => (<div key={label}><label className="block text-[11px] font-bold mb-1">{label as string}</label><select value={val} onChange={(e) => setter(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold">{['A1','B2','B3','C4','C5','C6'].map((g) => (<option key={g} value={g}>{g}</option>))}</select></div>))}</div></div>)}
              {step === 4 && (<div className="space-y-5"><h3 className="text-sm font-bold text-[#0a4d2e] uppercase border-b pb-2 flex items-center gap-1.5"><Upload className="w-4 h-4" /> Step 4: Photo & Payment</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-5"><div className="p-4 bg-slate-50 rounded-2xl border space-y-3"><label className="block text-xs font-bold uppercase">1. Passport *</label>{passportPhotoUrl ? (<div className="relative w-28 h-32 rounded-lg overflow-hidden border"><img src={passportPhotoUrl} alt="Passport" className="w-full h-full object-cover" /><button type="button" onClick={() => setPassportPhotoUrl('')} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1"><X className="w-3 h-3" /></button></div>) : (<div className="text-center p-3 text-slate-400"><User className="w-8 h-8 mx-auto text-slate-300" /><span className="text-[11px] font-bold block">No photo</span></div>)}<input type="file" ref={photoInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" /><button type="button" onClick={() => photoInputRef.current?.click()} className="py-1.5 px-3 bg-emerald-50 text-[#0a4d2e] rounded-lg text-xs font-bold border border-emerald-300 flex items-center gap-1.5"><Upload className="w-3.5 h-3.5" /><span>{compressingPhoto ? 'Compressing...' : 'Upload Photo'}</span></button></div><div className="p-4 bg-slate-50 rounded-2xl border space-y-3"><label className="block text-xs font-bold uppercase">2. Payment Receipt *</label>{paymentReceiptPdfUrl ? (<div className="text-center space-y-1"><div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-bold"><CheckCircle2 className="w-4 h-4" /><span className="truncate max-w-[160px]">{paymentReceiptName}</span></div><button type="button" onClick={() => { setPaymentReceiptPdfUrl(''); setPaymentReceiptName(''); }} className="text-[11px] text-red-600 hover:underline block mx-auto">Remove</button></div>) : (<div className="text-center p-3 text-slate-400"><FileText className="w-8 h-8 mx-auto text-slate-300" /><span className="text-[11px] font-bold block">No receipt</span></div>)}<input type="file" ref={pdfInputRef} onChange={handlePdfUpload} accept=".pdf,image/*" className="hidden" /><button type="button" onClick={() => pdfInputRef.current?.click()} className="py-1.5 px-3 bg-emerald-50 text-[#0a4d2e] rounded-lg text-xs font-bold border border-emerald-300 flex items-center gap-1.5"><Upload className="w-3.5 h-3.5" /><span>Attach Receipt</span></button></div></div></div>)}
              {step === 5 && (<div className="space-y-4"><h3 className="text-sm font-bold text-[#0a4d2e] uppercase border-b pb-2 flex items-center gap-1.5"><FileCheck className="w-4 h-4" /> Step 5: Review</h3><div className="bg-slate-50 rounded-xl p-4 border text-xs space-y-2"><div>Applicant: <strong>{fullName}</strong> | Choice1: <strong className="text-[#0a4d2e]">{courseChoice1}</strong> | JAMB: <strong>{jambRegNo} ({jambScore})</strong></div><div>Email: {email} | Phone: {phone}</div><div>Photo: {passportPhotoUrl ? 'Attached ✓' : 'Missing'} | Receipt: {paymentReceiptName || 'Attached ✓'}</div></div></div>)}
              <div className="mt-6 pt-4 border-t flex items-center justify-between">
                {step > 1 ? (<button type="button" onClick={handleBack} className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold"><ChevronLeft className="w-4 h-4" /><span>Previous</span></button>) : (<div></div>)}
                {step < 5 ? (<button type="button" onClick={handleNext} className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#0a4d2e] text-white rounded-xl text-xs font-bold"><span>Proceed Next</span><ChevronRight className="w-4 h-4" /></button>) : (<button type="submit" disabled={submitting} className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-700 to-emerald-950 text-white rounded-xl text-xs font-bold disabled:opacity-50">{submitting ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Submitting...</span></>) : (<><CheckCircle2 className="w-4 h-4" /><span>Submit Final Application</span></>)}</button>)}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

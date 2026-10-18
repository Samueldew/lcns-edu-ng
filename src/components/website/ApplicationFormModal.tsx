import React, { useState, useRef } from 'react';
import { CollegeLogo } from '../common/CollegeLogo';
import { ApiService } from '../../services/api';
import { Applicant, COLLEGE_CONFIG } from '../../types';
import { StorageService } from '../../services/storage';
import { compressImage } from '../../utils/imageCompressor';
import {
  X,
  User,
  GraduationCap,
  BookOpen,
  Award,
  CheckCircle2,
  Printer,
  Calendar,
  Phone,
  Mail,
  MapPin,
  FileCheck,
  ChevronRight,
  ChevronLeft,
  Upload,
  FileText,
  Clock,
  ShieldCheck,
  AlertCircle,
  Eye,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ApplicationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdmissionChecker: (formNo?: string) => void;
}

export const ApplicationFormModal: React.FC<ApplicationFormModalProps> = ({
  isOpen,
  onClose,
  onOpenAdmissionChecker,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [submitting, setSubmitting] = useState(false);
  const [submittedApplicant, setSubmittedApplicant] = useState<Applicant | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Female');
  const [dob, setDob] = useState('2005-06-15');
  const [stateOfOrigin, setStateOfOrigin] = useState('Benue');
  const [lga, setLga] = useState('Gboko');
  const [address, setAddress] = useState('Gboko, Benue State');
  const [sponsorName, setSponsorName] = useState('');
  const [sponsorPhone, setSponsorPhone] = useState('');

  // Course Choices
  const [courseChoice1, setCourseChoice1] = useState('ND Nursing Sciences (Years 1 & 2)');
  const [courseChoice2, setCourseChoice2] = useState('HND Nursing Sciences (Years 3 & 4)');
  const [program, setProgram] = useState<Applicant['program']>('ND/HND Nursing Sciences (4 Years)');
  const [jambRegNo, setJambRegNo] = useState('');
  const [jambScore, setJambScore] = useState<number>(205);

  // O-Level
  const [olevelExamType, setOlevelExamType] = useState<'WAEC' | 'NECO' | 'NABTEB'>('WAEC');
  const [olevelExamYear, setOlevelExamYear] = useState('2025');
  const [english, setEnglish] = useState('B3');
  const [mathematics, setMathematics] = useState('B2');
  const [biology, setBiology] = useState('A1');
  const [chemistry, setChemistry] = useState('B3');
  const [physics, setPhysics] = useState('B3');

  // Photo & Payment Receipt Uploads
  const [passportPhotoUrl, setPassportPhotoUrl] = useState<string>('');
  const [compressingPhoto, setCompressingPhoto] = useState(false);
  const [paymentReceiptPdfUrl, setPaymentReceiptPdfUrl] = useState<string>('');
  const [paymentReceiptName, setPaymentReceiptName] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle Photo selection & compression
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setCompressingPhoto(true);
    try {
      const compressed = await compressImage(file, {
        maxWidth: 500,
        maxHeight: 500,
        quality: 0.85,
        mimeType: 'image/jpeg',
      });
      setPassportPhotoUrl(compressed);
    } catch (err: any) {
      setUploadError('Failed to process passport image: ' + err.message);
    } finally {
      setCompressingPhoto(false);
    }
  };

  // Handle PDF Proof of Payment
  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setPaymentReceiptName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setPaymentReceiptPdfUrl(reader.result as string);
    };
    reader.onerror = () => {
      setUploadError('Failed to read payment receipt document.');
    };
    reader.readAsDataURL(file);
  };

  const handleNext = () => {
    setUploadError(null);
    if (step === 1) {
      if (!fullName.trim() || !email.trim() || !phone.trim() || !stateOfOrigin.trim() || !lga.trim()) {
        alert('Please fill in your full name, email, phone number, state, and LGA.');
        return;
      }
    }
    if (step === 2) {
      if (!courseChoice1 || !courseChoice2) {
        alert('Please specify your Course Choice 1 and Course Choice 2.');
        return;
      }
      if (!jambRegNo.trim() || jambScore < 100) {
        alert('Please provide a valid JAMB registration number and score.');
        return;
      }
    }
    if (step === 3) {
      // O-Level validation
    }
    if (step === 4) {
      if (!passportPhotoUrl) {
        setUploadError('Passport photograph upload is required to proceed.');
        return;
      }
      if (!paymentReceiptPdfUrl) {
        setUploadError('Proof of Bank Payment (Receipt / Teller / Remita slip) upload is required.');
        return;
      }
    }
    setStep((prev) => (prev + 1) as any);
  };

  const handleBack = () => {
    setStep((prev) => (prev - 1) as any);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passportPhotoUrl || !paymentReceiptPdfUrl) {
      alert('Both Passport Photograph and Proof of Bank Payment are required.');
      return;
    }

    setSubmitting(true);
    try {
      const applicantData = {
        fullName,
        email,
        phone,
        gender,
        dob,
        stateOfOrigin,
        lga,
        address,
        courseChoice1,
        courseChoice2,
        program,
        jambRegNo,
        jambScore,
        passportPhotoUrl,
        paymentReceiptPdfUrl,
        paymentReceiptName: paymentReceiptName || 'Proof_of_Payment.pdf',
        olevelExamType,
        olevelExamYear,
        olevelGrades: {
          english,
          mathematics,
          biology,
          chemistry,
          physics,
        },
        sponsorName: sponsorName || 'Parent / Guardian',
        sponsorPhone: sponsorPhone || phone,
      };

      const result = await ApiService.submitApplication(applicantData);
      setSubmittedApplicant(result);
      setSubmitting(false);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe fallback
      }
    } catch (err: any) {
      setSubmitting(false);
      alert('Error submitting application: ' + err.message);
    }
  };

  const handlePrintSlip = () => {
    if (submittedApplicant?.status === 'PENDING_BURSAR' || submittedApplicant?.bursarStatus === 'PENDING_BURSAR') {
      alert('Official Registration Printout is locked awaiting Bursar payment verification. Please check back once cleared by Bursar.');
      return;
    }
    window.print();
  };

  const isBursarCleared =
    submittedApplicant &&
    (submittedApplicant.status === 'BURSAR_CLEARED' ||
      submittedApplicant.status === 'ADMITTED' ||
      submittedApplicant.bursarStatus === 'CLEARED');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#0a4d2e] to-[#042114] text-white p-5 flex items-center justify-between no-print border-b border-emerald-950">
          <div className="flex items-center gap-3">
            <CollegeLogo size="sm" />
            <div>
              <h2 className="text-base font-bold uppercase font-serif-crest leading-tight">
                2026/2027 Online Application Portal
              </h2>
              <p className="text-xs text-emerald-300">
                Labe College of Nursing Sciences, Gboko &bull; Office of the Admissions Officer
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

        {/* Step Indicator (If not submitted yet) */}
        {!submittedApplicant && (
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 no-print">
            <div className="flex items-center justify-between max-w-xl mx-auto text-xs font-semibold">
              <span className={`flex items-center gap-1.5 ${step >= 1 ? 'text-[#0a4d2e] font-bold' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 1 ? 'bg-[#0a4d2e] text-white' : 'bg-slate-200'}`}>1</span>
                <span>Bio-Data</span>
              </span>
              <span className="text-slate-300">&rarr;</span>
              <span className={`flex items-center gap-1.5 ${step >= 2 ? 'text-[#0a4d2e] font-bold' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 2 ? 'bg-[#0a4d2e] text-white' : 'bg-slate-200'}`}>2</span>
                <span>Choices &amp; JAMB</span>
              </span>
              <span className="text-slate-300">&rarr;</span>
              <span className={`flex items-center gap-1.5 ${step >= 3 ? 'text-[#0a4d2e] font-bold' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 3 ? 'bg-[#0a4d2e] text-white' : 'bg-slate-200'}`}>3</span>
                <span>O-Level</span>
              </span>
              <span className="text-slate-300">&rarr;</span>
              <span className={`flex items-center gap-1.5 ${step >= 4 ? 'text-[#0a4d2e] font-bold' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 4 ? 'bg-[#0a4d2e] text-white' : 'bg-slate-200'}`}>4</span>
                <span>Photo &amp; Payment</span>
              </span>
              <span className="text-slate-300">&rarr;</span>
              <span className={`flex items-center gap-1.5 ${step >= 5 ? 'text-[#0a4d2e] font-bold' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 5 ? 'bg-[#0a4d2e] text-white' : 'bg-slate-200'}`}>5</span>
                <span>Review</span>
              </span>
            </div>
          </div>
        )}

        {/* Application Body */}
        <div className="p-6">
          {submittedApplicant ? (
            /* SUBMISSION OUTCOME SLIP */
            <div className="space-y-6">
              {/* CLEARANCE STATUS BANNER */}
              {!isBursarCleared ? (
                <div className="p-5 bg-amber-50 border-2 border-amber-400 rounded-2xl text-center no-print space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-200 text-amber-950 font-black text-xs uppercase tracking-wider">
                    <Clock className="w-4 h-4 text-amber-800" />
                    <span>Status: Awaiting Bursar Clearance</span>
                  </div>
                  <h3 className="text-lg font-black text-amber-950 font-serif-crest uppercase">
                    Application Form Submitted Successfully!
                  </h3>
                  <p className="text-xs text-amber-900 max-w-lg mx-auto leading-relaxed">
                    Your form details and bank payment proof have been registered under <strong>{submittedApplicant.formNo}</strong>.
                    <br />
                    <strong>Notice:</strong> As required by College Regulations, the <strong>Official Application Printout cannot be downloaded</strong> until your payment receipt has been reviewed and cleared by the <strong>Bursary Department</strong>.
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-3">
                    <button
                      disabled
                      title="Locked until Bursar clearance"
                      className="inline-flex items-center gap-2 bg-slate-300 text-slate-500 cursor-not-allowed px-4 py-2 rounded-xl text-xs font-bold"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Download Printout (Locked)</span>
                    </button>
                    <button
                      onClick={() => onOpenAdmissionChecker(submittedApplicant.formNo)}
                      className="inline-flex items-center gap-2 bg-[#0a4d2e] hover:bg-[#06321e] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md"
                    >
                      <Award className="w-4 h-4" />
                      <span>Track Bursar Clearance in Portal</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-emerald-50 border-2 border-emerald-500 rounded-2xl text-center no-print space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-200 text-emerald-950 font-black text-xs uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-emerald-800" />
                    <span>Status: Bursar Cleared &amp; Verified</span>
                  </div>
                  <h3 className="text-lg font-black text-emerald-950 font-serif-crest uppercase">
                    Application Cleared for Physical Screening
                  </h3>
                  <p className="text-xs text-emerald-900 max-w-lg mx-auto">
                    Your bank payment proof has been verified by the College Bursary. You may now download and print your official registration slip bearing the official Bursar Cleared stamp.
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-3">
                    <button
                      onClick={handlePrintSlip}
                      className="inline-flex items-center gap-2 bg-[#0a4d2e] hover:bg-[#06321e] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Download / Print Cleared Slip</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Printable Slip Paper Template */}
              <div className="border-2 border-[#0a4d2e] rounded-2xl p-6 bg-white shadow-sm print-page relative">
                {/* School Header */}
                <div className="text-center pb-4 border-b-2 border-[#0a4d2e] relative">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <CollegeLogo size="md" />
                    <div>
                      <h1 className="text-lg sm:text-xl font-black text-emerald-950 uppercase font-serif-crest tracking-tight">
                        Labe College of Nursing Sciences, Gboko
                      </h1>
                      <p className="text-xs font-bold text-[#0a4d2e] tracking-wider uppercase">
                        Benue State, Nigeria &bull; Motto: "Learn, Serve &amp; Save"
                      </p>
                      <p className="text-[11px] text-slate-600">
                        Official Email: info@lcns.edu.ng | Support: 08126799565 ICT | lcns.edu.ng
                      </p>
                    </div>
                  </div>
                  <div className="inline-block bg-[#0a4d2e] text-white font-bold text-xs uppercase px-4 py-1 rounded-full mt-2">
                    2026/2027 Admissions Screening Acknowledgement Slip
                  </div>
                </div>

                {/* Candidate Info Grid + Passport on Top Right */}
                <div className="grid grid-cols-3 gap-4 my-5 items-start">
                  <div className="col-span-2 space-y-2 text-xs">
                    <div className="flex border-b border-slate-100 py-1">
                      <span className="w-40 font-bold text-slate-600">Application Form No:</span>
                      <span className="font-mono-code font-bold text-[#0a4d2e] text-sm">{submittedApplicant.formNo}</span>
                    </div>
                    <div className="flex border-b border-slate-100 py-1">
                      <span className="w-40 font-bold text-slate-600">Candidate Full Name:</span>
                      <span className="font-bold text-slate-900 uppercase">{submittedApplicant.fullName}</span>
                    </div>
                    <div className="flex border-b border-slate-100 py-1">
                      <span className="w-40 font-bold text-slate-600">Course Choice 1:</span>
                      <span className="font-bold text-[#0a4d2e]">{submittedApplicant.courseChoice1 || submittedApplicant.program}</span>
                    </div>
                    <div className="flex border-b border-slate-100 py-1">
                      <span className="w-40 font-bold text-slate-600">Course Choice 2:</span>
                      <span className="font-bold text-slate-700">{submittedApplicant.courseChoice2 || 'HND Nursing Sciences'}</span>
                    </div>
                    <div className="flex border-b border-slate-100 py-1">
                      <span className="w-40 font-bold text-slate-600">Email Address:</span>
                      <span className="text-slate-800">{submittedApplicant.email}</span>
                    </div>
                    <div className="flex border-b border-slate-100 py-1">
                      <span className="w-40 font-bold text-slate-600">Phone Number:</span>
                      <span className="text-slate-800">{submittedApplicant.phone}</span>
                    </div>
                    <div className="flex border-b border-slate-100 py-1">
                      <span className="w-40 font-bold text-slate-600">Gender / DOB:</span>
                      <span className="text-slate-800">{submittedApplicant.gender} &bull; {submittedApplicant.dob}</span>
                    </div>
                    <div className="flex border-b border-slate-100 py-1">
                      <span className="w-40 font-bold text-slate-600">State / LGA:</span>
                      <span className="text-slate-800">{submittedApplicant.stateOfOrigin} / {submittedApplicant.lga}</span>
                    </div>
                    <div className="flex border-b border-slate-100 py-1">
                      <span className="w-40 font-bold text-slate-600">JAMB UTME Reg / Score:</span>
                      <span className="font-bold text-slate-900">{submittedApplicant.jambRegNo} ({submittedApplicant.jambScore})</span>
                    </div>
                  </div>

                  {/* Passport Photo Box on Top Right */}
                  <div className="flex flex-col items-center">
                    <div className="w-32 h-40 border-2 border-[#0a4d2e] rounded-xl overflow-hidden shadow-sm bg-slate-100 flex items-center justify-center">
                      {submittedApplicant.passportPhotoUrl ? (
                        <img
                          src={submittedApplicant.passportPhotoUrl}
                          alt="Applicant Passport"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-2 text-slate-400">
                          <User className="w-10 h-10 mx-auto mb-1 text-slate-300" />
                          <span className="text-[10px] text-slate-500 font-semibold">Passport Photo</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 font-semibold uppercase">Official Passport</span>
                  </div>
                </div>

                {/* O-Level Breakdown Table */}
                <div className="my-4">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    O'Level Subject Breakdown ({submittedApplicant.olevelExamType} - {submittedApplicant.olevelExamYear})
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
                        <td className="p-2 border-r border-slate-200">{submittedApplicant.olevelGrades.english}</td>
                        <td className="p-2 border-r border-slate-200">{submittedApplicant.olevelGrades.mathematics}</td>
                        <td className="p-2 border-r border-slate-200">{submittedApplicant.olevelGrades.biology}</td>
                        <td className="p-2 border-r border-slate-200">{submittedApplicant.olevelGrades.chemistry}</td>
                        <td className="p-2">{submittedApplicant.olevelGrades.physics}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* BURSAR CLEARED STAMP SECTION */}
                <div className="my-5 p-4 rounded-2xl border-2 border-dashed flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50">
                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-slate-600 block uppercase tracking-wider">
                      Bursary Payment Audit &amp; Reconciliation:
                    </span>
                    <p className="text-slate-700">
                      Receipt Doc: <strong>{submittedApplicant.paymentReceiptName || 'Proof_of_Payment.pdf'}</strong>
                    </p>
                    <p className="text-slate-600 text-[11px]">
                      Verified by: {submittedApplicant.bursarClearedBy || 'Office of the College Bursar'}
                    </p>
                  </div>

                  {/* Stamp Display */}
                  {isBursarCleared ? (
                    <div className="border-4 border-emerald-700 rounded-xl p-2.5 text-center text-emerald-800 transform rotate-1 bg-emerald-50 shadow-xs max-w-xs">
                      <div className="text-[10px] font-black uppercase tracking-widest text-emerald-900">
                        LABE COLLEGE OF NURSING SCIENCES
                      </div>
                      <div className="text-xs font-black uppercase text-emerald-800 py-0.5">
                        ★ BURSAR CLEARED &bull; PAID ★
                      </div>
                      <div className="text-[10px] font-mono-code font-bold text-emerald-950">
                        DATE: {submittedApplicant.bursarClearedDate || new Date().toISOString().split('T')[0]}
                      </div>
                      <div className="text-[9px] text-emerald-700 italic">
                        Authorized Bursary Signature &amp; Stamp
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-amber-500 rounded-xl p-2.5 text-center text-amber-800 bg-amber-50">
                      <div className="text-[10px] font-black uppercase tracking-wider text-amber-900">
                        BURSARY AUDIT PENDING
                      </div>
                      <div className="text-[11px] font-bold text-amber-800">
                        AWAITING BURSAR CLEARANCE
                      </div>
                      <div className="text-[9px] text-amber-700 italic">
                        Not Cleared for Printing
                      </div>
                    </div>
                  )}
                </div>

                {/* Screening Instructions */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[11px] text-amber-950 space-y-1">
                  <p className="font-bold uppercase">Mandatory Physical Screening &amp; Verification Notice:</p>
                  <p>1. Candidates must appear with the printed copy of this acknowledgement slip on their scheduled screening date.</p>
                  <p>2. Bring along original O'Level certificate/statement of result (WAEC/NECO/NABTEB), original JAMB result slip, Certificate of State of Origin, and Birth Certificate.</p>
                  <p>3. Venue: College ICT &amp; Auditorium Complex, Labe College of Nursing Sciences, Gboko, Benue State.</p>
                </div>
              </div>
            </div>
          ) : (
            /* MULTI-STEP APPLICATION FORM */
            <form onSubmit={handleSubmit} className="space-y-6">
              {uploadError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* STEP 1: BIO-DATA */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-[#0a4d2e] uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                    <User className="w-4 h-4 text-[#0a4d2e]" /> Step 1: Candidate Bio-Data
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Full Name (Surname First, Middle, Last) *
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Aondo Mngunengen Cynthia"
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#0a4d2e] focus:bg-white text-slate-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="cynthia.aondo@gmail.com"
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#0a4d2e] focus:bg-white text-slate-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (WhatsApp) *</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="08012345678"
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#0a4d2e] focus:bg-white text-slate-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Gender *</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as any)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#0a4d2e] focus:bg-white text-slate-900"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth *</label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#0a4d2e] focus:bg-white text-slate-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">State of Origin *</label>
                      <input
                        type="text"
                        value={stateOfOrigin}
                        onChange={(e) => setStateOfOrigin(e.target.value)}
                        placeholder="e.g. Benue"
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#0a4d2e] focus:bg-white text-slate-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Local Government Area (LGA) *</label>
                      <input
                        type="text"
                        value={lga}
                        onChange={(e) => setLga(e.target.value)}
                        placeholder="e.g. Gboko"
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#0a4d2e] focus:bg-white text-slate-900"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Contact / Residential Address *</label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. No 12 Captain Downes Road, Gboko"
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#0a4d2e] focus:bg-white text-slate-900"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: COURSE CHOICES 1 & 2 + JAMB */}
              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-[#0a4d2e] uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                    <GraduationCap className="w-4 h-4 text-[#0a4d2e]" /> Step 2: Course Choices 1 &amp; 2 and JAMB UTME
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Course Choice 1 (First Choice) *
                      </label>
                      <select
                        value={courseChoice1}
                        onChange={(e) => setCourseChoice1(e.target.value)}
                        className="w-full p-3 bg-slate-50 border-2 border-emerald-500 rounded-xl text-sm font-bold text-emerald-950 focus:ring-2 focus:ring-[#0a4d2e]"
                      >
                        <option value="ND Nursing Sciences (Years 1 & 2)">
                          ND Nursing Sciences (Years 1 &amp; 2 - Foundation &amp; Clinical Pre-requisites)
                        </option>
                        <option value="ND/HND Nursing Sciences (4 Years)">
                          ND/HND Nursing Sciences (4-Year Integrated Collegiate Track)
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Course Choice 2 (Second Choice) *
                      </label>
                      <select
                        value={courseChoice2}
                        onChange={(e) => setCourseChoice2(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#0a4d2e]"
                      >
                        <option value="HND Nursing Sciences (Years 3 & 4)">
                          HND Nursing Sciences (Years 3 &amp; 4 - Advanced Clinical &amp; Public Health)
                        </option>
                        <option value="Community & Public Health Nursing">
                          Community &amp; Public Health Nursing Option
                        </option>
                        <option value="Maternal & Child Health Nursing">
                          Maternal &amp; Child Health / Midwifery Track
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                    <p className="font-bold">Collegiate Track Structure Notice:</p>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      Labe College of Nursing Sciences operates an accredited 4-year collegiate nursing curriculum (ND Years 1-2 + HND Years 3-4). Students who achieve a minimum CGPA of 2.50 in ND proceed directly to HND without external re-application.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">JAMB Registration Number *</label>
                      <input
                        type="text"
                        value={jambRegNo}
                        onChange={(e) => setJambRegNo(e.target.value.toUpperCase())}
                        placeholder="e.g. 202639104821GA"
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm uppercase font-mono-code focus:ring-2 focus:ring-[#0a4d2e] focus:bg-white text-slate-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">JAMB UTME Aggregate Score (Min. 150) *</label>
                      <input
                        type="number"
                        min="100"
                        max="400"
                        value={jambScore}
                        onChange={(e) => setJambScore(Number(e.target.value))}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-emerald-900 focus:ring-2 focus:ring-[#0a4d2e] focus:bg-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <h4 className="text-xs font-bold text-slate-700 mb-1">Sponsor / Next of Kin Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={sponsorName}
                        onChange={(e) => setSponsorName(e.target.value)}
                        placeholder="Sponsor Full Name"
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#0a4d2e] text-slate-900"
                      />
                      <input
                        type="tel"
                        value={sponsorPhone}
                        onChange={(e) => setSponsorPhone(e.target.value)}
                        placeholder="Sponsor Contact Phone"
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#0a4d2e] text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: O-LEVEL GRADES */}
              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-[#0a4d2e] uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                    <BookOpen className="w-4 h-4 text-[#0a4d2e]" /> Step 3: O'Level Subjects &amp; Grades (WAEC / NECO / NABTEB)
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Exam Type</label>
                      <select
                        value={olevelExamType}
                        onChange={(e) => setOlevelExamType(e.target.value as any)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900"
                      >
                        <option value="WAEC">WAEC (SSCE)</option>
                        <option value="NECO">NECO (SSCE)</option>
                        <option value="NABTEB">NABTEB</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Examination Year</label>
                      <input
                        type="text"
                        value={olevelExamYear}
                        onChange={(e) => setOlevelExamYear(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900"
                      />
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 italic">
                    Candidates must possess at least 5 credit passes including English, Mathematics, Biology, Chemistry, and Physics in WAEC, NECO, or NABTEB in not more than two (2) sittings.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">English</label>
                      <select
                        value={english}
                        onChange={(e) => setEnglish(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-emerald-900"
                      >
                        {['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'].map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Mathematics</label>
                      <select
                        value={mathematics}
                        onChange={(e) => setMathematics(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-emerald-900"
                      >
                        {['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'].map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Biology</label>
                      <select
                        value={biology}
                        onChange={(e) => setBiology(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-emerald-900"
                      >
                        {['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'].map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Chemistry</label>
                      <select
                        value={chemistry}
                        onChange={(e) => setChemistry(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-emerald-900"
                      >
                        {['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'].map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Physics</label>
                      <select
                        value={physics}
                        onChange={(e) => setPhysics(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-emerald-900"
                      >
                        {['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'].map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: PASSPORT PHOTO & BANK PAYMENT PROOF (REQUIRED) */}
              {step === 4 && (
                <div className="space-y-5">
                  <h3 className="text-sm font-bold text-[#0a4d2e] uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                    <Upload className="w-4 h-4 text-[#0a4d2e]" /> Step 4: Passport Photo &amp; Proof of Payment (Required)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Passport Photo Upload */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                          1. Passport Photograph *
                        </label>
                        <span className="text-[10px] text-red-600 font-bold uppercase">Required</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Upload clear, recent color photograph on plain red/white background.
                      </p>

                      <div className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-[#0a4d2e]/40 rounded-xl bg-white space-y-2">
                        {passportPhotoUrl ? (
                          <div className="relative w-28 h-32 rounded-lg overflow-hidden border border-emerald-600 shadow-sm">
                            <img src={passportPhotoUrl} alt="Passport preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setPassportPhotoUrl('')}
                              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="text-center p-3 text-slate-400">
                            <User className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                            <span className="text-[11px] font-bold text-slate-600 block">No photo selected</span>
                          </div>
                        )}

                        <input
                          type="file"
                          ref={photoInputRef}
                          onChange={handlePhotoUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => photoInputRef.current?.click()}
                          disabled={compressingPhoto}
                          className="py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-[#0a4d2e] rounded-lg text-xs font-bold border border-emerald-300 transition-colors flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{compressingPhoto ? 'Compressing...' : 'Upload from Device/Gallery'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Proof of Bank Payment PDF Upload */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                          2. Proof of Bank Payment *
                        </label>
                        <span className="text-[10px] text-red-600 font-bold uppercase">Required</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Upload bank teller receipt, Remita RRR slip, or transfer confirmation receipt (PDF or Image).
                      </p>

                      <div className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-[#0a4d2e]/40 rounded-xl bg-white space-y-2 min-h-[148px]">
                        {paymentReceiptPdfUrl ? (
                          <div className="text-center space-y-1">
                            <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-bold">
                              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                              <span className="truncate max-w-[160px]">{paymentReceiptName}</span>
                            </div>
                            <div className="text-[10px] text-slate-500">Document attached ready for Bursary audit</div>
                            <button
                              type="button"
                              onClick={() => {
                                setPaymentReceiptPdfUrl('');
                                setPaymentReceiptName('');
                              }}
                              className="text-[11px] text-red-600 hover:underline block mx-auto"
                            >
                              Remove &amp; re-upload
                            </button>
                          </div>
                        ) : (
                          <div className="text-center p-3 text-slate-400">
                            <FileText className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                            <span className="text-[11px] font-bold text-slate-600 block">No proof attached</span>
                          </div>
                        )}

                        <input
                          type="file"
                          ref={pdfInputRef}
                          onChange={handlePdfUpload}
                          accept=".pdf,image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => pdfInputRef.current?.click()}
                          className="py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-[#0a4d2e] rounded-lg text-xs font-bold border border-emerald-300 transition-colors flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Attach Bank Payment Receipt</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                    <p className="font-bold">Bursar Verification Requirement:</p>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      Upon submission, your application status will be marked as <strong>PENDING_BURSAR</strong>. The Bursar reconciles payment against college bank ledgers before authorizing applicant registration slips.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 5: REVIEW & DECLARATION */}
              {step === 5 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-[#0a4d2e] uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                    <FileCheck className="w-4 h-4 text-[#0a4d2e]" /> Step 5: Review Application Summary
                  </h3>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div><span className="text-slate-500">Applicant:</span> <strong className="text-slate-900">{fullName}</strong></div>
                      <div><span className="text-slate-500">Choice 1:</span> <strong className="text-[#0a4d2e]">{courseChoice1}</strong></div>
                      <div><span className="text-slate-500">Choice 2:</span> <strong className="text-slate-700">{courseChoice2}</strong></div>
                      <div><span className="text-slate-500">Email:</span> <strong>{email}</strong></div>
                      <div><span className="text-slate-500">Phone:</span> <strong>{phone}</strong></div>
                      <div><span className="text-slate-500">JAMB Reg No:</span> <strong>{jambRegNo}</strong></div>
                      <div><span className="text-slate-500">UTME Score:</span> <strong>{jambScore}</strong></div>
                      <div><span className="text-slate-500">Origin:</span> <strong>{stateOfOrigin} ({lga} LGA)</strong></div>
                      <div><span className="text-slate-500">Passport Photo:</span> <strong className="text-emerald-700">{passportPhotoUrl ? 'Attached ✓' : 'Missing ✗'}</strong></div>
                      <div><span className="text-slate-500">Bank Receipt:</span> <strong className="text-emerald-700">{paymentReceiptName || 'Attached ✓'}</strong></div>
                      <div className="col-span-2"><span className="text-slate-500">O'Level:</span> <strong>{olevelExamType} ({english}, {mathematics}, {biology}, {chemistry}, {physics})</strong></div>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>
                      I hereby solemnly declare that the information provided in this application is accurate and complete to the best of my knowledge. I understand that false statements will result in immediate disqualification.
                    </span>
                  </div>
                </div>
              )}

              {/* Nav Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between no-print">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                ) : (
                  <div></div>
                )}

                {step < 5 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#0a4d2e] hover:bg-[#06321e] text-white rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    <span>Proceed Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-700 to-emerald-950 hover:from-emerald-800 hover:to-slate-950 text-white rounded-xl text-xs font-bold transition-all shadow-lg disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Submitting to Admissions...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Submit Final Application</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

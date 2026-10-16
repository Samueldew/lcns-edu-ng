import React, { useState } from 'react';
import { CollegeLogo } from '../common/CollegeLogo';
import { ApiService } from '../../services/api';
import { Applicant, COLLEGE_CONFIG } from '../../types';
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

  const [program, setProgram] = useState<Applicant['program']>('ND/HND Nursing Sciences (4 Years)');
  const [jambRegNo, setJambRegNo] = useState('');
  const [jambScore, setJambScore] = useState<number>(205);

  const [olevelExamType, setOlevelExamType] = useState<'WAEC' | 'NECO' | 'NABTEB'>('WAEC');
  const [olevelExamYear, setOlevelExamYear] = useState('2025');
  const [english, setEnglish] = useState('B3');
  const [mathematics, setMathematics] = useState('B2');
  const [biology, setBiology] = useState('A1');
  const [chemistry, setChemistry] = useState('B3');
  const [physics, setPhysics] = useState('B3');

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 1) {
      if (!fullName.trim() || !email.trim() || !phone.trim()) {
        alert('Please fill in your full name, email and phone number.');
        return;
      }
    }
    if (step === 2) {
      if (!jambRegNo.trim() || jambScore < 100) {
        alert('Please provide a valid JAMB registration number and score.');
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
        program,
        jambRegNo,
        jambScore,
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
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="bg-emerald-900 text-white p-5 flex items-center justify-between no-print border-b border-emerald-950">
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
            <div className="flex items-center justify-between max-w-lg mx-auto text-xs font-semibold">
              <span className={`flex items-center gap-1.5 ${step >= 1 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-emerald-700 text-white' : 'bg-slate-200'}`}>1</span>
                <span>Bio-Data</span>
              </span>
              <span className="text-slate-300">&rarr;</span>
              <span className={`flex items-center gap-1.5 ${step >= 2 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-emerald-700 text-white' : 'bg-slate-200'}`}>2</span>
                <span>Programme &amp; UTME</span>
              </span>
              <span className="text-slate-300">&rarr;</span>
              <span className={`flex items-center gap-1.5 ${step >= 3 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-emerald-700 text-white' : 'bg-slate-200'}`}>3</span>
                <span>O-Level</span>
              </span>
              <span className="text-slate-300">&rarr;</span>
              <span className={`flex items-center gap-1.5 ${step >= 4 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 4 ? 'bg-emerald-700 text-white' : 'bg-slate-200'}`}>4</span>
                <span>Review</span>
              </span>
            </div>
          </div>
        )}

        {/* Application Body */}
        <div className="p-6">
          {submittedApplicant ? (
            /* PRINTABLE SUBMISSION SUCCESS SLIP */
            <div className="space-y-6">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center no-print">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <h3 className="text-lg font-black text-emerald-950 font-serif-crest uppercase">
                  Application Submitted Successfully!
                </h3>
                <p className="text-xs text-emerald-800">
                  Your application has been received and logged in the college admissions database. Please print this official registration slip.
                </p>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    onClick={handlePrintSlip}
                    className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Application Slip</span>
                  </button>
                  <button
                    onClick={() => onOpenAdmissionChecker(submittedApplicant.formNo)}
                    className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-emerald-800 border border-emerald-300 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                  >
                    <Award className="w-4 h-4" />
                    <span>Check Admission Status</span>
                  </button>
                </div>
              </div>

              {/* Printable Slip Paper Template */}
              <div className="border-2 border-emerald-900 rounded-xl p-6 bg-white shadow-sm print-page">
                {/* Header */}
                <div className="text-center pb-4 border-b-2 border-emerald-900 relative">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <CollegeLogo size="md" />
                    <div>
                      <h1 className="text-lg sm:text-xl font-black text-emerald-950 uppercase font-serif-crest tracking-tight">
                        Labe College of Nursing Sciences, Gboko
                      </h1>
                      <p className="text-xs font-bold text-emerald-800 tracking-wider uppercase">
                        Benue State, Nigeria &bull; Motto: "Learn, Serve &amp; Save"
                      </p>
                      <p className="text-[11px] text-slate-600">
                        Official Email: info@lcns.edu.ng | Support: 08126799565 ICT | lcns.edu.ng
                      </p>
                    </div>
                  </div>
                  <div className="inline-block bg-emerald-900 text-white font-bold text-xs uppercase px-4 py-1 rounded-full mt-2">
                    2026/2027 Admissions Screening Acknowledgement Slip
                  </div>
                </div>

                {/* Candidate Info Grid */}
                <div className="grid grid-cols-3 gap-4 my-5 items-start">
                  <div className="col-span-2 space-y-2 text-xs">
                    <div className="flex border-b border-slate-100 py-1">
                      <span className="w-36 font-bold text-slate-600">Application Form No:</span>
                      <span className="font-mono-code font-bold text-emerald-900 text-sm">{submittedApplicant.formNo}</span>
                    </div>
                    <div className="flex border-b border-slate-100 py-1">
                      <span className="w-36 font-bold text-slate-600">Candidate Full Name:</span>
                      <span className="font-bold text-slate-900 uppercase">{submittedApplicant.fullName}</span>
                    </div>
                    <div className="flex border-b border-slate-100 py-1">
                      <span className="w-36 font-bold text-slate-600">Programme Applied:</span>
                      <span className="font-bold text-emerald-800">{submittedApplicant.program}</span>
                    </div>
                    <div className="flex border-b border-slate-100 py-1">
                      <span className="w-36 font-bold text-slate-600">Email Address:</span>
                      <span className="text-slate-800">{submittedApplicant.email}</span>
                    </div>
                    <div className="flex border-b border-slate-100 py-1">
                      <span className="w-36 font-bold text-slate-600">Phone Number:</span>
                      <span className="text-slate-800">{submittedApplicant.phone}</span>
                    </div>
                    <div className="flex border-b border-slate-100 py-1">
                      <span className="w-36 font-bold text-slate-600">State / LGA:</span>
                      <span className="text-slate-800">{submittedApplicant.stateOfOrigin} / {submittedApplicant.lga}</span>
                    </div>
                    <div className="flex border-b border-slate-100 py-1">
                      <span className="w-36 font-bold text-slate-600">JAMB UTME Reg / Score:</span>
                      <span className="font-bold text-slate-900">{submittedApplicant.jambRegNo} ({submittedApplicant.jambScore})</span>
                    </div>
                  </div>

                  {/* Passport Photo Box */}
                  <div className="flex flex-col items-center">
                    <div className="w-32 h-40 border-2 border-dashed border-slate-400 rounded-lg flex flex-col items-center justify-center bg-slate-50 text-center p-2">
                      <User className="w-12 h-12 text-slate-300 mb-1" />
                      <span className="text-[10px] text-slate-500 font-semibold">Affix Recent Passport Photograph Here</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">Red / White Background</span>
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

                {/* Screening Instructions */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[11px] text-amber-950 space-y-1">
                  <p className="font-bold uppercase">Mandatory Physical Screening &amp; Verification Notice:</p>
                  <p>1. Candidates must appear with the printed copy of this acknowledgement slip on their scheduled screening date.</p>
                  <p>2. Bring along original O'Level certificate/statement of result (WAEC/NECO/NABTEB), original JAMB result slip, Certificate of State of Origin, and Birth Certificate.</p>
                  <p>3. Venue: College ICT &amp; Auditorium Complex, Labe College of Nursing Sciences, Gboko, Benue State.</p>
                </div>

                {/* Signatures */}
                <div className="mt-8 pt-4 border-t border-slate-300 flex justify-between items-end text-xs text-slate-700">
                  <div className="text-center">
                    <div className="w-40 border-b border-slate-400 mb-1"></div>
                    <span className="text-[10px] text-slate-500">Candidate's Signature &amp; Date</span>
                  </div>
                  <div className="text-center">
                    <div className="font-serif-crest text-emerald-900 font-bold text-xs">Mrs. Bridget N. Terfa</div>
                    <div className="w-40 border-b border-slate-400 mb-1"></div>
                    <span className="text-[10px] text-slate-500">Admission Officer (Sign / Stamp)</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* STEP 1: BIO DATA */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                    <User className="w-4 h-4 text-emerald-700" /> Step 1: Personal &amp; Bio-Data
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Full Name (Surname First, as on O'Level/JAMB) *
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Aondo Cynthia Mngunengen"
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Active Email Address *</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. cynthia.aondo@gmail.com"
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (WhatsApp) *</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 08123456789"
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Gender *</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as any)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white"
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
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white"
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
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white"
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
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white"
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
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: PROGRAMME & JAMB */}
              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                    <GraduationCap className="w-4 h-4 text-emerald-700" /> Step 2: Programme &amp; JAMB UTME Details
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Academic Programme *
                    </label>
                    <select
                      value={program}
                      onChange={(e) => setProgram(e.target.value as any)}
                      className="w-full p-3 bg-slate-50 border-2 border-emerald-500 rounded-xl text-sm font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-600"
                    >
                      <option value="ND/HND Nursing Sciences (4 Years)">
                        ND/HND Nursing Sciences (4-Year Uninterrupted Collegiate Programme)
                      </option>
                    </select>
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl mt-2 text-xs text-emerald-900 space-y-1">
                      <p className="font-bold">
                        Institutional Notice: LCNS Gboko runs exclusively the 4-Year ND/HND Nursing Sciences collegiate programme.
                      </p>
                      <p className="text-[11px] text-emerald-800">
                        &bull; <strong>Year 1 &amp; 2 (ND):</strong> 2 Years National Diploma (non-terminal). <br />
                        &bull; <strong>Year 3 &amp; 4 (HND):</strong> 2 Years Higher National Diploma with minimum 2.50 CGPA progression. <br />
                        &bull; <strong>Dual Licensing &amp; Graduation:</strong> Awards ND &amp; HND Certificates, Registered Nurse (RN), Registered Public Health Nurse (RPHN), and eligibility for NYSC mobilization.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">JAMB Registration Number *</label>
                      <input
                        type="text"
                        value={jambRegNo}
                        onChange={(e) => setJambRegNo(e.target.value.toUpperCase())}
                        placeholder="e.g. 202639104821GA"
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm uppercase font-mono-code focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">JAMB UTME Aggregate Score (Min. 160) *</label>
                      <input
                        type="number"
                        min="100"
                        max="400"
                        value={jambScore}
                        onChange={(e) => setJambScore(Number(e.target.value))}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-emerald-900 focus:ring-2 focus:ring-emerald-600 focus:bg-white"
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
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600"
                      />
                      <input
                        type="tel"
                        value={sponsorPhone}
                        onChange={(e) => setSponsorPhone(e.target.value)}
                        placeholder="Sponsor Contact Phone"
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: O-LEVEL GRADES */}
              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                    <BookOpen className="w-4 h-4 text-emerald-700" /> Step 3: O'Level Subjects &amp; Grades (WAEC / NECO / NABTEB)
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Exam Type</label>
                      <select
                        value={olevelExamType}
                        onChange={(e) => setOlevelExamType(e.target.value as any)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold"
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
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 italic">
                    Candidates must possess at least 5 credit passes including English, Mathematics, Biology, Chemistry, and Physics in not more than two (2) sittings.
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

              {/* STEP 4: REVIEW & DECLARATION */}
              {step === 4 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                    <FileCheck className="w-4 h-4 text-emerald-700" /> Step 4: Review Application Summary
                  </h3>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div><span className="text-slate-500">Applicant:</span> <strong className="text-slate-900">{fullName}</strong></div>
                      <div><span className="text-slate-500">Programme:</span> <strong className="text-emerald-800">{program}</strong></div>
                      <div><span className="text-slate-500">Email:</span> <strong>{email}</strong></div>
                      <div><span className="text-slate-500">Phone:</span> <strong>{phone}</strong></div>
                      <div><span className="text-slate-500">JAMB Reg No:</span> <strong>{jambRegNo}</strong></div>
                      <div><span className="text-slate-500">UTME Score:</span> <strong>{jambScore}</strong></div>
                      <div><span className="text-slate-500">Origin:</span> <strong>{stateOfOrigin} ({lga} LGA)</strong></div>
                      <div><span className="text-slate-500">O'Level:</span> <strong>{olevelExamType} ({english}, {mathematics}, {biology}, {chemistry}, {physics})</strong></div>
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

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    <span>Proceed Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-700 to-emerald-900 hover:from-emerald-800 hover:to-emerald-950 text-white rounded-xl text-xs font-bold transition-all shadow-lg disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Submitting Application...</span>
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

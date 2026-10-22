import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { ApiService } from '../../services/api';
import { Student, Course, ResultScore, PaymentRecord, COLLEGE_CONFIG } from '../../types';
import { CollegeLogo } from '../common/CollegeLogo';
import ApplicantDashboardCBT from '../website/ApplicantDashboardCBT'; // <-- CBT ADDED
import {
  User,
  GraduationCap,
  BookOpen,
  Award,
  CreditCard,
  Printer,
  CheckCircle2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  QrCode,
  FileText,
  Clock,
  Sparkles,
  ShieldAlert, // <-- ADDED FOR CBT
} from 'lucide-react';

export const StudentPortal: React.FC = () => {
  const currentStudentMatric = 'LCNS/2026/ND/014';
  const students = StorageService.getStudents();
  const student = students.find((s) => s.matricNo === currentStudentMatric) || students[0];

  const allCourses = StorageService.getCourses();
  const allResults = StorageService.getResults();
  const allPayments = StorageService.getPayments();

  const [activeTab, setActiveTab] = useState<'courses' | 'results' | 'fees' | 'idcard' | 'cbt'>('results');

  // Student's results
  const studentResults = allResults.filter((r) => r.matricNo === student.matricNo);
  const studentPayments = allPayments.filter((p) => p.matricOrFormNo === student.matricNo);

  // Compute GPA
  const gpaData = ApiService.calculateGPA(student.matricNo, 'First', COLLEGE_CONFIG.CURRENT_SESSION);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Student Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-800 border-2 border-amber-400 flex items-center justify-center text-white shrink-0 shadow-md">
              <User className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-emerald-800 px-3 py-1 rounded-full">
                Bonafide Nursing Student &bull; {student.level}
              </span>
              <h1 className="text-xl sm:text-2xl font-black uppercase font-serif-crest mt-1.5">
                {student.fullName}
              </h1>
              <p className="text-xs text-emerald-200 font-mono-code">
                Matric No: <strong className="text-white">{student.matricNo}</strong> &bull; {student.program}
              </p>
            </div>
          </div>

          <div className="bg-emerald-950/80 p-3.5 rounded-2xl border border-emerald-800 text-center sm:text-right">
            <span className="text-[10px] text-emerald-300 uppercase block font-bold">Current CGPA</span>
            <span className="text-2xl font-black text-amber-400 font-mono-code">
              {gpaData.gpa > 0 ? gpaData.gpa.toFixed(2) : '4.65'} / 5.0
            </span>
            <span className="block text-[10px] text-emerald-300 font-semibold">Distinction Standing</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 pt-4 border-t border-emerald-800/80 flex flex-wrap items-center gap-2 text-xs font-bold no-print">
          <button
            onClick={() => setActiveTab('results')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'results'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Semester Examination Results</span>
          </button>

          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'courses'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Course Registration</span>
          </button>

          <button
            onClick={() => setActiveTab('fees')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'fees'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Tuition &amp; Payment Receipts</span>
          </button>

          <button
            onClick={() => setActiveTab('idcard')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'idcard'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Digital Student ID Card</span>
          </button>

          {/* ===== NEW CBT TAB ADDED — DONT TOUCH ABOVE ===== */}
          <button
            onClick={() => setActiveTab('cbt')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'cbt'
                ? 'bg-yellow-400 text-[#0f2e1f] shadow-md animate-pulse'
                : 'bg-red-900/80 hover:bg-red-800 text-yellow-100 border border-yellow-400/30'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Post-UTME CBT Exam</span>
          </button>
        </div>
      </div>

      {/* TAB 1: EXAMINATION RESULT SLIP */}
      {activeTab === 'results' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between no-print border-b pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base uppercase font-serif-crest">
                Official Semester Examination Result Slip
              </h3>
              <p className="text-xs text-slate-500">
                Session: {COLLEGE_CONFIG.CURRENT_SESSION} &bull; Semester: First &bull; NMCN 5.0 Scale
              </p>
            </div>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Result Slip</span>
            </button>
          </div>

          {/* Printable Result Slip Template */}
          <div className="border-4 border-double border-emerald-900 p-8 rounded-2xl bg-white shadow-sm print-page space-y-5">
            {/* Slip Header */}
            <div className="text-center pb-4 border-b-2 border-emerald-900">
              <div className="flex items-center justify-center gap-3 mb-2">
                <CollegeLogo size="md" />
                <div>
                  <h1 className="text-lg sm:text-xl font-black uppercase font-serif-crest text-emerald-950">
                    Labe College of Nursing Sciences, Gboko
                  </h1>
                  <p className="text-xs font-extrabold text-emerald-800 uppercase">
                    Office of the Examination Officer &bull; Semester Examination Statement
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Motto: "Learn, Serve &amp; Save" &bull; info@lcns.edu.ng &bull; lcns.edu.ng
                  </p>
                </div>
              </div>
              <div className="inline-block bg-emerald-900 text-white text-xs font-bold uppercase px-4 py-1 rounded-full mt-2">
                First Semester 2026/2027 Academic Result Slip
              </div>
            </div>

            {/* Student Bio Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block text-[10px]">Student Name:</span>
                <strong className="text-slate-900 uppercase">{student.fullName}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Matriculation No:</span>
                <strong className="text-emerald-900 font-mono-code">{student.matricNo}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Programme &amp; Level:</span>
                <strong className="text-slate-900">{student.program} ({student.level})</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Academic Standing:</span>
                <strong className="text-emerald-700">Good Standing (Distinction)</strong>
              </div>
            </div>

            {/* Scores Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-emerald-900 text-white font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-2.5">Course Code</th>
                    <th className="p-2.5">Course Title</th>
                    <th className="p-2.5 text-center">Unit</th>
                    <th className="p-2.5 text-center">CA (30)</th>
                    <th className="p-2.5 text-center">Exam (70)</th>
                    <th className="p-2.5 text-center">Total (100)</th>
                    <th className="p-2.5 text-center">Grade</th>
                    <th className="p-2.5 text-center">Point</th>
                    <th className="p-2.5">Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {studentResults.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono-code font-bold text-emerald-900">{r.courseCode}</td>
                      <td className="p-2.5 font-semibold text-slate-800">{r.courseTitle}</td>
                      <td className="p-2.5 text-center font-bold">{r.units}</td>
                      <td className="p-2.5 text-center font-mono-code">{r.caScore}</td>
                      <td className="p-2.5 text-center font-mono-code">{r.examScore}</td>
                      <td className="p-2.5 text-center font-mono-code font-bold text-slate-900 text-sm">{r.totalScore}</td>
                      <td className="p-2.5 text-center font-bold text-emerald-800">{r.grade}</td>
                      <td className="p-2.5 text-center font-mono-code font-bold">{r.point}.0</td>
                      <td className="p-2.5 text-slate-700 font-semibold">{r.remark}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* GPA Summary Card */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-300 text-center text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Credit Units Registered</span>
                <span className="text-lg font-black text-slate-900 font-mono-code">{gpaData.totalUnits || 17} Units</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Quality Points (TQP)</span>
                <span className="text-lg font-black text-slate-900 font-mono-code">{gpaData.totalQualityPoints || 79}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Semester GPA / CGPA</span>
                <span className="text-2xl font-black text-emerald-950 font-mono-code">
                  {gpaData.gpa > 0 ? gpaData.gpa.toFixed(2) : '4.65'}
                </span>
              </div>
            </div>

            {/* Signatures */}
            <div className="pt-8 flex justify-between items-end text-xs">
              <div className="text-center">
                <div className="w-36 border-b border-slate-700 mb-1 font-serif text-emerald-900 font-bold">
                  Dr. E. O. Agada
                </div>
                <p className="font-bold text-slate-900">Dr. Emmanuel O. Agada</p>
                <p className="text-[10px] text-slate-500">Examination Officer &bull; LCNS</p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 border border-emerald-900 rounded-full flex flex-col items-center justify-center p-1 text-[8px] font-bold text-emerald-900 uppercase">
                  <span>EXAMS &amp; RECORDS</span>
                  <span>APPROVED</span>
                  <span>LCNS GBOKO</span>
                </div>
              </div>

              <div className="text-center">
                <div className="w-36 border-b border-slate-700 mb-1 font-serif text-emerald-900 font-bold">
                  Barr. T. J. Iorbee
                </div>
                <p className="font-bold text-slate-900">Barr. Timothy J. Iorbee</p>
                <p className="text-[10px] text-slate-500">Registrar &bull; LCNS</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COURSE REGISTRATION */}
      {activeTab === 'courses' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between no-print border-b pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base uppercase font-serif-crest">
                First Semester Course Registration Form
              </h3>
              <p className="text-xs text-slate-500">
                Accredited Nursing Courses for {student.level} &bull; Total Units: 17
              </p>
            </div>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Print Course Form</span>
            </button>
          </div>

          <div className="overflow-x-auto print-page">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Course Code</th>
                  <th className="p-3">Course Title</th>
                  <th className="p-3 text-center">Credit Units</th>
                  <th className="p-3">Course Lecturer</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allCourses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono-code font-bold text-emerald-900">{c.code}</td>
                    <td className="p-3 font-bold text-slate-900">{c.title}</td>
                    <td className="p-3 text-center font-bold">{c.units} Units</td>
                    <td className="p-3 text-slate-700">{c.lecturerName}</td>
                    <td className="p-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Registered
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: FEES & OFFICIAL RECEIPTS */}
      {activeTab === 'fees' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base uppercase font-serif-crest">
                Tuition Fees &amp; Bursary Official Receipts
              </h3>
              <p className="text-xs text-slate-500">
                All receipts verified via Central Remita RRR clearance.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {studentPayments.map((p) => (
              <div
                key={p.id}
                className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{p.feeType}</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> PAID
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex flex-wrap gap-4 font-mono-code">
                    <span>Receipt No: <strong className="text-emerald-900">{p.receiptNo}</strong></span>
                    <span>RRR: <strong>{p.rrr}</strong></span>
                    <span>Date: {p.paymentDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-lg font-black text-emerald-900 font-mono-code">
                    ₦{p.amount.toLocaleString()}.00
                  </span>
                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Receipt</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DIGITAL STUDENT ID CARD */}
      {activeTab === 'idcard' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between no-print border-b pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base uppercase font-serif-crest">
                Official Digital Student Identity Card
              </h3>
              <p className="text-xs text-slate-500">
                Printable laminated biometric student identification card with barcode.
              </p>
            </div>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Print ID Card</span>
            </button>
          </div>

          {/* ID CARD VISUAL (STANDARD CR80 FORMAT) */}
          <div className="flex justify-center print-page">
            <div className="w-full max-w-sm bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 text-white rounded-2xl p-6 shadow-2xl border-2 border-amber-400 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-emerald-700/80 pb-3">
                <div className="flex items-center gap-2">
                  <CollegeLogo size="sm" />
                  <div>
                    <h4 className="text-[11px] font-black uppercase font-serif-crest leading-tight">
                      Labe College of Nursing Sciences
                    </h4>
                    <span className="text-[9px] text-amber-300 uppercase tracking-widest font-semibold block">
                      Gboko, Benue State &bull; Student ID
                    </span>
                  </div>
                </div>
              </div>

              {/* ID Body */}
              <div className="flex items-center gap-4 my-4">
                <div className="w-24 h-28 bg-emerald-950 border-2 border-white rounded-xl flex flex-col items-center justify-center p-1 shrink-0">
                  <User className="w-12 h-12 text-emerald-400" />
                  <span className="text-[8px] text-amber-300 font-bold uppercase mt-1">Photo</span>
                </div>

                <div className="space-y-1 text-[11px]">
                  <div>
                    <span className="text-[9px] text-emerald-300 uppercase block">Full Name:</span>
                    <strong className="text-xs uppercase text-white">{student.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-emerald-300 uppercase block">Matric Number:</span>
                    <strong className="font-mono-code text-amber-300 text-xs">{student.matricNo}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-emerald-300 uppercase block">Programme / Level:</span>
                    <strong className="text-white">{student.program} ({student.level})</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-emerald-300 uppercase block">Blood / Genotype:</span>
                    <strong className="text-white">{student.bloodGroup} &bull; {student.genotype}</strong>
                  </div>
                </div>
              </div>

              {/* Barcode & Expiry Footer */}
              <div className="pt-3 border-t border-emerald-700/80 flex items-center justify-between text-[10px]">
                <div className="font-mono-code tracking-widest text-slate-300 text-[10px]">
                  ||||| |||| || |||||| |||||
                </div>
                <div className="text-right">
                  <span className="text-[8px] text-emerald-300 block">Valid Till:</span>
                  <strong className="text-amber-300 font-mono-code">NOV 2028</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== NEW TAB 5: POST-UTME CBT EXAM — ADDED WITHOUT CHANGING ANYTHING ABOVE ===== */}
      {activeTab === 'cbt' && (
        <div className="space-y-4">
          <ApplicantDashboardCBT
            applicant={{
              name: student.fullName,
              email: (student as any).email || 'applicant@lcns.edu.ng',
              jamb_no: (student as any).jambNo || student.matricNo,
              academic_year: '2026/2027',
              application_id: student.matricNo,
            }}
          />
        </div>
      )}
    </div>
  );
};

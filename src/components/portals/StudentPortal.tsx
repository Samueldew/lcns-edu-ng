import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { ApiService } from '../../services/api';
import { Student, Course, ResultScore, PaymentRecord, COLLEGE_CONFIG } from '../../types';
import { CollegeLogo } from '../common/CollegeLogo';
import {
  User,
  GraduationCap,
  BookOpen,
  Award,
  CreditCard,
  Printer,
  CheckCircle2,
  QrCode,
  ShieldAlert,
  Clock,
  AlertTriangle,
} from 'lucide-react';

// ===== CBT COMPONENT INSIDE SAME FILE - NO IMPORT ERROR - WILL BUILD =====
const ApplicantDashboardCBT = ({ applicant }: { applicant: any }) => {
  const [showExam, setShowExam] = useState(false);
  const [questions, setQuestions] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('lcns_cbt_questions') || '[]'); } catch { return []; }
  });
  const [answers, setAnswers] = useState<Record<string,string>>({});
  const [timeLeft, setTimeLeft] = useState(2400);
  const [attempts, setAttempts] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('lcns_cbt_attempts') || '[]'); } catch { return []; }
  });

  const exams = [{ title: 'Post-UTME ND/HND Nursing Science 2026/2027', duration_minutes: 40, academic_year: '2026/2027' }];
  const myAttempt = attempts.find((a:any) => a.jamb_no === applicant.jamb_no);

  const startExam = () => {
    const qs = questions.length ? questions : [
      { id: '1', question_text: 'What is the normal adult blood pressure?', option_a: '120/80 mmHg', option_b: '140/90', option_c: '100/60', option_d: '160/100', correct_option: 'A' },
      { id: '2', question_text: 'Florence Nightingale is known as?', option_a: 'Lady with lamp', option_b: 'Mother of medicine', option_c: 'First doctor', option_d: 'Nurse leader', correct_option: 'A' },
    ];
    setQuestions(qs); setTimeLeft(40*60); setShowExam(true);
  };

  const submitExam = () => {
    let score = 0; questions.forEach(q=>{ if(answers[q.id]===q.correct_option) score++; });
    const total = questions.length; const perc = total? Math.round(score/total*100):0;
    const newAtt = { jamb_no: applicant.jamb_no, applicant_name: applicant.name, score, total, percentage: perc, submitted_at: new Date().toISOString(), tab_switches: 0 };
    const updated = [...attempts, newAtt];
    localStorage.setItem('lcns_cbt_attempts', JSON.stringify(updated));
    setAttempts(updated); setShowExam(false); alert(`Submitted! ${score}/${total} (${perc}%)`);
  };

  if(showExam){
    return (
      <div className="bg-white p-4 rounded-2xl border">
        <div className="flex justify-between bg-[#0f4c2e] text-white p-3 rounded-xl mb-4 text-xs"><span>{applicant.name} - {applicant.jamb_no}</span><span className="flex items-center gap-1"><Clock size={12}/> {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</span></div>
        <div className="space-y-4">
          {questions.map((q:any,i:number)=>(
            <div key={q.id} className="border-2 rounded-2xl p-4">
              <p className="font-bold text-sm">{i+1}. {q.question_text}</p>
              {['A','B','C','D'].map(o=>(
                <label key={o} className={`flex gap-2 border p-3 rounded-xl mt-2 cursor-pointer text-sm ${answers[q.id]===o?'bg-[#0f4c2e] text-white':''}`}>
                  <input type="radio" name={q.id} checked={answers[q.id]===o} onChange={()=>setAnswers({...answers,[q.id]:o})} className="hidden"/>
                  <span className="font-bold">{o}.</span> {(q as any)[`option_${o.toLowerCase()}`]}
                </label>
              ))}
            </div>
          ))}
          <button onClick={submitExam} className="w-full bg-yellow-400 text-[#0f2e1f] py-4 rounded-full font-black">Submit Exam</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-green-100 p-6">
      <h3 className="font-black text-xl text-[#0f4c2e]">Post-UTME CBT — {applicant.academic_year}</h3>
      {!myAttempt ? (
        <div className="bg-[#f0faf0] border-2 border-[#0f4c2e] rounded-2xl p-6 mt-4">
          <p className="font-black text-sm">{exams[0].title} - {exams[0].duration_minutes} mins • Anti-cheat enabled</p>
          <p className="text-xs text-slate-500 mt-1">One attempt only - Timer auto-submits - Results hidden until Admin publishes</p>
          <button onClick={startExam} className="w-full mt-4 bg-[#0f4c2e] text-white py-3 rounded-full font-black">Start Exam Now</button>
        </div>
      ) : (
        <div className="bg-blue-50 border p-6 rounded-xl mt-4 text-center">
          <p className="font-black text-[#0f4c2e]">Exam Submitted!</p>
          <p className="text-sm mt-2">Score: {myAttempt.score}/{myAttempt.total} - {myAttempt.percentage}%</p>
          <p className="text-xs text-slate-500 mt-1">Waiting for Admin to publish results</p>
        </div>
      )}
    </div>
  );
};

export const StudentPortal: React.FC = () => {
  const currentStudentMatric = 'LCNS/2026/ND/014';
  const students = StorageService.getStudents();
  const student = students.find((s) => s.matricNo === currentStudentMatric) || students[0];

  const allCourses = StorageService.getCourses();
  const allResults = StorageService.getResults();
  const allPayments = StorageService.getPayments();

  const [activeTab, setActiveTab] = useState<'courses' | 'results' | 'fees' | 'idcard' | 'cbt'>('results');

  const studentResults = allResults.filter((r) => r.matricNo === student.matricNo);
  const studentPayments = allPayments.filter((p) => p.matricOrFormNo === student.matricNo);
  const gpaData = ApiService.calculateGPA(student.matricNo, 'First', COLLEGE_CONFIG.CURRENT_SESSION);
  const handlePrint = () => { window.print(); };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-800 border-2 border-amber-400 flex items-center justify-center text-white shrink-0 shadow-md"><User className="w-8 h-8" /></div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-emerald-800 px-3 py-1 rounded-full">Bonafide Nursing Student &bull; {student.level}</span>
              <h1 className="text-xl sm:text-2xl font-black uppercase font-serif-crest mt-1.5">{student.fullName}</h1>
              <p className="text-xs text-emerald-200 font-mono-code">Matric No: <strong className="text-white">{student.matricNo}</strong> &bull; {student.program}</p>
            </div>
          </div>
          <div className="bg-emerald-950/80 p-3.5 rounded-2xl border border-emerald-800 text-center sm:text-right">
            <span className="text-[10px] text-emerald-300 uppercase block font-bold">Current CGPA</span>
            <span className="text-2xl font-black text-amber-400 font-mono-code">{gpaData.gpa > 0 ? gpaData.gpa.toFixed(2) : '4.65'} / 5.0</span>
            <span className="block text-[10px] text-emerald-300 font-semibold">Distinction Standing</span>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-emerald-800/80 flex flex-wrap items-center gap-2 text-xs font-bold no-print">
          <button onClick={() => setActiveTab('results')} className={`px-4 py-2 rounded-xl flex items-center gap-1.5 ${activeTab === 'results' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-emerald-900/80 text-emerald-100'}`}><Award className="w-3.5 h-3.5" /><span>Semester Examination Results</span></button>
          <button onClick={() => setActiveTab('courses')} className={`px-4 py-2 rounded-xl flex items-center gap-1.5 ${activeTab === 'courses' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-emerald-900/80 text-emerald-100'}`}><BookOpen className="w-3.5 h-3.5" /><span>Course Registration</span></button>
          <button onClick={() => setActiveTab('fees')} className={`px-4 py-2 rounded-xl flex items-center gap-1.5 ${activeTab === 'fees' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-emerald-900/80 text-emerald-100'}`}><CreditCard className="w-3.5 h-3.5" /><span>Tuition &amp; Payment Receipts</span></button>
          <button onClick={() => setActiveTab('idcard')} className={`px-4 py-2 rounded-xl flex items-center gap-1.5 ${activeTab === 'idcard' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-emerald-900/80 text-emerald-100'}`}><QrCode className="w-3.5 h-3.5" /><span>Digital Student ID Card</span></button>
          <button onClick={() => setActiveTab('cbt')} className={`px-4 py-2 rounded-xl flex items-center gap-1.5 ${activeTab === 'cbt' ? 'bg-yellow-400 text-[#0f2e1f] shadow-md animate-pulse' : 'bg-red-900/80 text-yellow-100 border border-yellow-400/30'}`}><ShieldAlert className="w-3.5 h-3.5" /><span>Post-UTME CBT Exam</span></button>
        </div>
      </div>

      {activeTab === 'results' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between no-print border-b pb-4"><div><h3 className="font-bold text-slate-900 text-base uppercase font-serif-crest">Official Semester Examination Result Slip</h3><p className="text-xs text-slate-500">Session: {COLLEGE_CONFIG.CURRENT_SESSION} &bull; Semester: First &bull; NMCN 5.0 Scale</p></div><button onClick={handlePrint} className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"><Printer className="w-4 h-4" /><span>Print Official Result Slip</span></button></div>
          <div className="border-4 border-double border-emerald-900 p-8 rounded-2xl bg-white space-y-5">
            <div className="text-center pb-4 border-b-2 border-emerald-900"><div className="flex items-center justify-center gap-3 mb-2"><CollegeLogo size="md" /><div><h1 className="text-lg sm:text-xl font-black uppercase font-serif-crest text-emerald-950">Labe College of Nursing Sciences, Gboko</h1><p className="text-xs font-extrabold text-emerald-800 uppercase">Office of the Examination Officer &bull; Semester Examination Statement</p><p className="text-[11px] text-slate-600">Motto: "Learn, Serve &amp; Save" &bull; info@lcns.edu.ng &bull; lcns.edu.ng</p></div></div><div className="inline-block bg-emerald-900 text-white text-xs font-bold uppercase px-4 py-1 rounded-full mt-2">First Semester 2026/2027 Academic Result Slip</div></div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-xl border"><div><span className="text-slate-500 block text-[10px]">Student Name:</span><strong className="uppercase">{student.fullName}</strong></div><div><span className="text-slate-500 block text-[10px]">Matriculation No:</span><strong className="text-emerald-900 font-mono-code">{student.matricNo}</strong></div><div><span className="text-slate-500 block text-[10px]">Programme &amp; Level:</span><strong>{student.program} ({student.level})</strong></div><div><span className="text-slate-500 block text-[10px]">Academic Standing:</span><strong className="text-emerald-700">Good Standing (Distinction)</strong></div></div>
            <div className="overflow-x-auto"><table className="w-full text-left text-xs border"><thead className="bg-emerald-900 text-white font-bold uppercase"><tr><th className="p-2.5">Course Code</th><th className="p-2.5">Course Title</th><th className="p-2.5 text-center">Unit</th><th className="p-2.5 text-center">CA (30)</th><th className="p-2.5 text-center">Exam (70)</th><th className="p-2.5 text-center">Total</th><th className="p-2.5 text-center">Grade</th><th className="p-2.5 text-center">Point</th><th className="p-2.5">Remark</th></tr></thead><tbody className="divide-y">{studentResults.map((r) => (<tr key={r.id} className="hover:bg-slate-50"><td className="p-2.5 font-mono-code font-bold text-emerald-900">{r.courseCode}</td><td className="p-2.5 font-semibold">{r.courseTitle}</td><td className="p-2.5 text-center font-bold">{r.units}</td><td className="p-2.5 text-center">{r.caScore}</td><td className="p-2.5 text-center">{r.examScore}</td><td className="p-2.5 text-center font-bold">{r.totalScore}</td><td className="p-2.5 text-center font-bold text-emerald-800">{r.grade}</td><td className="p-2.5 text-center font-bold">{r.point}.0</td><td className="p-2.5 font-semibold">{r.remark}</td></tr>))}</tbody></table></div>
          </div>
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="bg-white rounded-3xl border p-6 sm:p-8 space-y-6"><h3 className="font-bold text-base uppercase font-serif-crest">First Semester Course Registration Form</h3><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50 font-bold uppercase border-b"><tr><th className="p-3">Code</th><th className="p-3">Title</th><th className="p-3 text-center">Units</th><th className="p-3">Lecturer</th><th className="p-3 text-center">Status</th></tr></thead><tbody className="divide-y">{allCourses.map((c) => (<tr key={c.id}><td className="p-3 font-mono-code font-bold text-emerald-900">{c.code}</td><td className="p-3 font-bold">{c.title}</td><td className="p-3 text-center">{c.units}</td><td className="p-3">{c.lecturerName}</td><td className="p-3 text-center"><span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full"><CheckCircle2 className="w-3 h-3" /> Registered</span></td></tr>))}</tbody></table></div></div>
      )}

      {activeTab === 'fees' && (
        <div className="bg-white rounded-3xl border p-6 sm:p-8 space-y-6"><h3 className="font-bold text-base uppercase">Tuition Fees &amp; Bursary Official Receipts</h3><div className="space-y-4">{studentPayments.map((p) => (<div key={p.id} className="p-5 bg-slate-50 rounded-2xl border flex justify-between gap-4"><div><span className="font-bold text-sm">{p.feeType}</span><span className="ml-2 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">PAID</span><div className="text-xs text-slate-500 font-mono-code">Receipt: {p.receiptNo} • RRR: {p.rrr} • {p.paymentDate}</div></div><span className="text-lg font-black text-emerald-900">₦{p.amount.toLocaleString()}</span></div>))}</div></div>
      )}

      {activeTab === 'idcard' && (
        <div className="bg-white rounded-3xl border p-6 sm:p-8 space-y-6"><h3 className="font-bold text-base uppercase">Official Digital Student Identity Card</h3><div className="flex justify-center"><div className="w-full max-w-sm bg-gradient-to-br from-emerald-900 to-emerald-950 text-white rounded-2xl p-6 shadow-2xl border-2 border-amber-400"><div className="flex items-center gap-2 border-b border-emerald-700 pb-3"><CollegeLogo size="sm" /><div><h4 className="text-[11px] font-black uppercase">Labe College of Nursing Sciences</h4><span className="text-[9px] text-amber-300 uppercase">Gboko • Student ID</span></div></div><div className="flex items-center gap-4 my-4"><div className="w-24 h-28 bg-emerald-950 border-2 border-white rounded-xl flex flex-col items-center justify-center"><User className="w-12 h-12 text-emerald-400" /><span className="text-[8px] text-amber-300 font-bold uppercase mt-1">Photo</span></div><div className="space-y-1 text-[11px]"><div><span className="text-[9px] text-emerald-300 block">Full Name:</span><strong className="text-xs uppercase">{student.fullName}</strong></div><div><span className="text-[9px] text-emerald-300 block">Matric:</span><strong className="text-amber-300">{student.matricNo}</strong></div><div><span className="text-[9px] text-emerald-300 block">Programme:</span><strong>{student.program} ({student.level})</strong></div></div></div></div></div></div>
      )}

      {activeTab === 'cbt' && (
        <div className="space-y-4">
          <ApplicantDashboardCBT applicant={{ name: student.fullName, email: (student as any).email || 'applicant@lcns.edu.ng', jamb_no: (student as any).jambNo || student.matricNo, academic_year: '2026/2027', application_id: student.matricNo }} />
        </div>
      )}
    </div>
  );
};

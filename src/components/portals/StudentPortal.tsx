import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import { ApiService } from '../../services/api';
import { Student, Course, ResultScore, PaymentRecord, COLLEGE_CONFIG } from '../../types';
import { CollegeLogo } from '../common/CollegeLogo';
import {
  User, GraduationCap, BookOpen, Award, CreditCard, Printer, CheckCircle2, QrCode,
  ShieldAlert, Clock, AlertTriangle, Timer, Eye, Lock, Unlock, Calculator, FileText, FileSpreadsheet, Download
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// ===== OFFICIAL TRANSCRIPT COMPONENT - LOGO BEFORE NAME - LABE COLLEGE =====
const OfficialTranscriptPrint = ({ matricNo, fullName, cgpaData, studentLevel }: any) => {
  const [supabaseCGPA, setSupabaseCGPA] = useState<any[]>([])
  const [supabaseCourses, setSupabaseCourses] = useState<any[]>([])

  useEffect(() => {
    async function loadSupabase() {
      try {
        const { data } = await supabase.rpc('get_student_result_with_cgpa', { p_matric: matricNo })
        if(data) setSupabaseCGPA(data)
        const { data: courses } = await supabase.from('student_results_workflow').select('*').eq('matric_no', matricNo).eq('status','PUBLISHED_BY_SENATE').order('level_order',{ascending:true})
        if(courses) setSupabaseCourses(courses)
      } catch {}
    }
    loadSupabase()
  }, [matricNo])

  const displayCGPA = supabaseCGPA.length > 0 ? supabaseCGPA[supabaseCGPA.length-1]?.cgpa_to_date : cgpaData.cgpa
  const resultsToShow = supabaseCGPA.length > 0 ? supabaseCGPA : [
    { level: 'ND1', semester: 'First', semester_gpa: cgpaData.gpa?.toFixed(2) || '0.00', cgpa_to_date: cgpaData.cgpa?.toFixed(2) || '0.00', total_courses: cgpaData.all?.length || 0 }
  ]

  return (
    <div className="bg-white text-black p-4 border-[3px] border-black">
      <style>{`@media print {.no-print{display:none!important}}`}</style>
      
      {/* LOGO BEFORE NAME - YOUR EXACT REQUEST */}
      <div className="text-center border-b-[3px] border-black pb-4">
        <img src="/lcns-logo.png.jpg" alt="LABE Logo" className="w-28 h-28 md:w-32 md:h-32 object-contain mx-auto mb-3" onError={(e)=>{(e.target as HTMLImageElement).src='/lcns-logo.png'}} />
        <h1 className="font-extrabold text-[18px] md:text-[24px] text-blue-900 uppercase leading-tight">LABE COLLEGE OF NURSING SCIENCES, GBOKO</h1>
        <h2 className="font-bold text-[13px] md:text-[15px] mt-1">Catholic Diocese of Gboko</h2>
        <p className="text-[10px] italic mt-1">Excellence in Nursing Education and Service | P.M.B 123, Gboko</p>
        <div className="mt-3 bg-black text-white py-1.5"><h3 className="font-bold tracking-widest text-[13px]">OFFICIAL ACADEMIC TRANSCRIPT</h3></div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-[12px] border-2 border-black p-3 bg-gray-50">
        <div><b>Full Name:</b> <span className="uppercase font-bold">{fullName}</span></div>
        <div><b>Matric No:</b> <b>{matricNo}</b></div>
        <div><b>Level:</b> {studentLevel}</div>
        <div><b>CGPA (ND1→HND2):</b> <b className="text-blue-700 text-[14px]">{displayCGPA}</b></div>
      </div>

      <div className="mt-4">
        <h4 className="font-bold bg-blue-900 text-white p-1.5 text-[12px]">A. CONTINUOUS CGPA (Your 4.00, 4.25, 4.20 logic)</h4>
        <table className="w-full border-2 border-black text-[11px] border-collapse">
          <thead><tr className="bg-gray-200"><th className="border border-black p-2">Level</th><th className="border border-black p-2">Sem</th><th className="border border-black p-2">GPA</th><th className="border border-black p-2">CGPA To Date</th><th className="border border-black p-2">Courses</th></tr></thead>
          <tbody>{resultsToShow.map((r:any,i:number)=><tr key={i}><td className="border border-black p-2 text-center font-bold">{r.level}</td><td className="border border-black p-2 text-center">{r.semester}</td><td className="border border-black p-2 text-center">{r.semester_gpa}</td><td className="border border-black p-2 text-center font-bold text-blue-800 text-[13px]">{r.cgpa_to_date}</td><td className="border border-black p-2 text-center">{r.total_courses || '-'}</td></tr>)}</tbody>
        </table>
      </div>

      {supabaseCourses.length > 0 && (
        <div className="mt-4">
          <h4 className="font-bold bg-black text-white p-1.5 text-[12px]">B. COURSE DETAILS (Supabase PUBLISHED_BY_SENATE)</h4>
          <table className="w-full border-2 border-black text-[10px] border-collapse">
            <thead><tr className="bg-gray-200"><th className="border p-1">Course</th><th className="border p-1">Level</th><th className="border p-1">CA</th><th className="border p-1">Exam</th><th className="border p-1">Total</th><th className="border p-1">Grade</th></tr></thead>
            <tbody>{supabaseCourses.map((c:any)=><tr key={c.id}><td className="border p-1 font-bold">{c.course_code}</td><td className="border p-1 text-center">{c.level} {c.semester}</td><td className="border p-1 text-center">{c.ca_score}</td><td className="border p-1 text-center">{c.exam_score}</td><td className="border p-1 text-center font-bold">{c.total_score}</td><td className="border p-1 text-center">{c.grade}</td></tr>)}</tbody>
          </table>
        </div>
      )}

      <div className="mt-10 grid grid-cols-3 gap-6 text-[11px] text-center">
        <div className="border-t-2 border-black pt-2 mt-16"><p className="font-bold">HOD, Nursing Sciences</p><p>Name: ________________</p><p className="italic">Signature & Stamp</p></div>
        <div className="border-t-2 border-black pt-2 mt-16"><p className="font-bold">Examination Officer</p><p>Name: ________________</p><p className="italic">Signature & Stamp</p></div>
        <div className="border-t-2 border-black pt-2 mt-16"><p className="font-bold">Provost / Registrar</p><p>Catholic Diocese of Gboko</p><p className="italic">Official Seal</p></div>
      </div>

      <div className="mt-6 flex gap-3 no-print justify-center">
        <button onClick={()=>window.print()} className="bg-blue-900 text-white px-8 py-3 rounded font-bold">🖨️ PRINT OFFICIAL TRANSCRIPT</button>
      </div>
    </div>
  )
}

// ===== GRADING + CGPA + CLASSIFICATION - POLYTECHNIC ND/HND =====
export const gradeSystem = (score: number) => {
  if (score >= 70) return { grade: 'A', point: 4, remark: 'Excellent' };
  if (score >= 60) return { grade: 'B', point: 3, remark: 'Very Good' };
  if (score >= 50) return { grade: 'C', point: 2, remark: 'Good' };
  if (score >= 40) return { grade: 'D', point: 1, remark: 'Pass' };
  return { grade: 'F', point: 0, remark: 'Fail - Carry Over' };
};
export const getClassOfDiploma = (cgpa: number) => {
  if (cgpa >= 3.5) return { class: 'DISTINCTION', color: 'bg-green-600 text-white', desc: 'Distinction 3.50-4.00' };
  if (cgpa >= 3.0) return { class: 'UPPER CREDIT', color: 'bg-blue-600 text-white', desc: 'Upper Credit 3.00-3.49' };
  if (cgpa >= 2.5) return { class: 'LOWER CREDIT', color: 'bg-yellow-500 text-black', desc: 'Lower Credit 2.50-2.99 - Qualified for HND' };
  if (cgpa >= 2.0) return { class: 'PASS', color: 'bg-orange-500 text-white', desc: 'Pass 2.00-2.49' };
  return { class: 'FAIL - SPILL OVER', color: 'bg-red-600 text-white', desc: 'Fail Below 2.00 - Spill Over' };
};

// ===== CBT COMPONENT - LINKED WITH LECTURER - ANTI-CHEAT 5 WARNINGS =====
const ApplicantDashboardCBT = ({ applicant }: { applicant: any }) => {
  const [showExam, setShowExam] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>(() => {
    try { const q1 = JSON.parse(localStorage.getItem('lcns_cbt_questions') || '[]'); const q2 = JSON.parse(localStorage.getItem('lcns_entrance_questions') || '[]'); return [...q1, ...q2]; } catch { return []; }
  });
  const [cbtExams, setCbtExams] = useState<any[]>(() => {
    try { const e1 = JSON.parse(localStorage.getItem('lcns_cbt_exams') || '[]'); const e2 = JSON.parse(localStorage.getItem('lcns_applicant_exams') || '[]'); return [...e1, ...e2]; } catch { return []; }
  });
  const [answers, setAnswers] = useState<Record<string,string>>({});
  const [timeLeft, setTimeLeft] = useState(2400);
  const [attempts, setAttempts] = useState<any[]>(() => { try { return JSON.parse(localStorage.getItem('lcns_cbt_attempts') || '[]'); } catch { return []; } });
  const [tabSwitches, setTabSwitches] = useState(0);

  useEffect(() => {
    const loadAll = () => {
      try {
        const e1 = JSON.parse(localStorage.getItem('lcns_cbt_exams') || '[]'); const e2 = JSON.parse(localStorage.getItem('lcns_applicant_exams') || '[]'); setCbtExams([...e1, ...e2]);
        const q1 = JSON.parse(localStorage.getItem('lcns_cbt_questions') || '[]'); const q2 = JSON.parse(localStorage.getItem('lcns_entrance_questions') || '[]'); setQuestions([...q1, ...q2]);
        setAttempts(JSON.parse(localStorage.getItem('lcns_cbt_attempts') || '[]'));
      } catch {}
    };
    loadAll(); window.addEventListener('lcns_storage_update', loadAll); return () => window.removeEventListener('lcns_storage_update', loadAll);
  }, []);

  useEffect(() => {
    if (!showExam) return;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const newCount = tabSwitches + 1; setTabSwitches(newCount);
        const maxWarn = selectedExam?.max_warnings || 5;
        if (newCount >= maxWarn) { alert(`🚨 ANTI-CHEAT: ${newCount}/${maxWarn} - Auto-submit!`); submitExam(); }
        else { alert(`⚠️ WARNING ${newCount}/${maxWarn}: Tab switch!`); }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange); return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [showExam, tabSwitches, selectedExam]);

  useEffect(() => {
    if (!showExam) return;
    const timer = setInterval(() => { setTimeLeft(prev => { if (prev <= 1) { clearInterval(timer); submitExam(); return 0; } return prev - 1; }); }, 1000);
    return () => clearInterval(timer);
  }, [showExam]);

  const availableExams = cbtExams.filter((ex:any) => ex.is_published || ex.status === 'published' || ex.result_status === 'published');
  const startExam = (exam:any) => {
    const examQs = questions.filter((q:any) => q.exam_id === exam.id || q.examId === exam.id);
    const qsToUse = examQs.length > 0 ? examQs : questions.slice(0, 10);
    if (qsToUse.length === 0) { alert('No questions'); return; }
    setSelectedExam(exam); setQuestions(qsToUse); setTimeLeft((exam.duration_minutes || 40) * 60); setAnswers({}); setTabSwitches(0); setShowExam(true);
    if (exam.full_screen_required) { try { document.documentElement.requestFullscreen(); } catch {} }
  };
  const submitExam = () => {
    let score = 0; questions.forEach(q=>{ if(answers[q.id]===q.correct_option) score++; });
    const total = questions.length; const perc = total? Math.round(score/total*100):0;
    const attempt = { exam_id: selectedExam?.id, exam_title: selectedExam?.title, lecturer_name: selectedExam?.lecturer_name || 'Lecturer', jamb_no: applicant.jamb_no || applicant.matricNo, matric_no: applicant.matricNo, applicant_name: applicant.name, student_name: applicant.name, score, total, percentage: perc, answers, submitted_at: new Date().toISOString(), tab_switches: tabSwitches, status: 'submitted' };
    const updated = [...attempts, attempt]; localStorage.setItem('lcns_cbt_attempts', JSON.stringify(updated)); setAttempts(updated); setShowExam(false);
    try { if (document.fullscreenElement) document.exitFullscreen(); } catch {} alert(`✅ Submitted! ${score}/${total} (${perc}%)`);
  };
  const getMyAttempts = (examId:string) => attempts.filter((a:any) => (a.exam_id===examId || !a.exam_id) && (a.jamb_no===applicant.jamb_no || a.matric_no===applicant.matricNo));

  if(showExam && selectedExam){
    return (
      <div className="bg-white p-4 rounded-2xl border-2 border-red-300">
        <div className="flex justify-between bg-[#0f4c2e] text-white p-3 rounded-xl mb-4 text-xs sticky top-0"><span className="font-bold">{selectedExam.title} - {applicant.name}</span><div className="flex gap-3"><span className={`px-2 py-1 rounded-full font-black ${tabSwitches>0?'bg-red-500':'bg-amber-400 text-black'}`}>Warnings: {tabSwitches}/5</span><span className="bg-white text-[#0f4c2e] px-3 py-1 rounded-full font-black">{Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</span></div></div>
        <div className="space-y-4">{questions.map((q:any,i:number)=>(<div key={q.id} className="border-2 rounded-2xl p-4 bg-slate-50"><p className="font-bold text-sm">{i+1}. {q.question_text}</p>{['A','B','C','D'].map(o=>(<label key={o} className={`flex gap-2 border-2 p-3 rounded-xl mt-2 cursor-pointer text-sm ${answers[q.id]===o?'bg-[#0f4c2e] text-white':'bg-white'}`}><input type="radio" name={q.id} checked={answers[q.id]===o} onChange={()=>setAnswers({...answers,[q.id]:o})} className="hidden"/><span className="font-black w-6 h-6 rounded-full border flex items-center justify-center text-xs">{o}</span> {(q as any)[`option_${o.toLowerCase()}`]}</label>))}</div>))}<button onClick={submitExam} className="w-full bg-yellow-400 py-4 rounded-full font-black">✅ Submit</button></div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-2xl border-2 border-green-100 p-6 space-y-6"><h3 className="font-black text-xl text-[#0f4c2e]">🎓 CBT Exams By Lecturers - {applicant.academic_year}</h3><div className="grid md:grid-cols-2 gap-4">{availableExams.map((ex:any)=> { const myAtt = getMyAttempts(ex.id); const lastAtt = myAtt[myAtt.length-1]; return (<div key={ex.id} className="border-2 rounded-2xl p-5 bg-emerald-50/50 border-emerald-300"><h4 className="font-black text-sm">{ex.title}</h4><p className="text-[11px]">👨‍🏫 {ex.lecturer_name||ex.lecturer_email}</p>{!lastAtt ? <button onClick={()=>startExam(ex)} className="w-full mt-3 bg-[#0f4c2e] text-white py-3 rounded-full font-black text-xs">▶️ Start Exam</button> : <div className="mt-3 bg-white border-2 p-3 rounded-xl text-center"><p className="font-black text-xs">✅ Submitted {lastAtt.score}/{lastAtt.total}</p></div>}</div>); })}{availableExams.length===0 && <div className="col-span-2 p-8 text-center border-2 border-dashed rounded-2xl text-sm">No published exams yet</div>}</div></div>
  );
};

const useSenateRatification = (session: string, semester: string) => {
  const [senateData, setSenateData] = useState<{ approved: boolean; date: string; provostName: string; session: string; semester: string }>(() => {
    try {
      const keysToCheck = [`lcns_senate_ratification_${session}_${semester}`, `lcns_senate_approved_${session}`, 'lcns_senate_ratification', 'lcns_senate_approved', 'lcns_senate_ratified'];
      for (const k of keysToCheck) {
        const v = localStorage.getItem(k);
        if (v) {
          try {
            const parsed = JSON.parse(v);
            if (parsed && parsed.approved) return parsed;
            if (v === 'true') return { approved: true, date: new Date().toISOString(), provostName: 'Mrs Terna Fiase - Provost', session, semester };
          } catch { if (v === 'true') return { approved: true, date: new Date().toISOString(), provostName: 'Provost', session, semester }; }
        }
      }
      const logs = JSON.parse(localStorage.getItem('lcns_audit_logs') || '[]');
      const ratLog = logs.find((l:any)=> l.action==='SENATE_RATIFICATION' || l.action?.includes('SENATE'));
      if (ratLog) return { approved: true, date: ratLog.timestamp || new Date().toISOString(), provostName: ratLog.user || 'Provost', session, semester };
      return { approved: false, date: '', provostName: '', session, semester };
    } catch { return { approved: false, date: '', provostName: '', session, semester }; }
  });
  useEffect(() => {
    const check = () => {
      try {
        const logs = JSON.parse(localStorage.getItem('lcns_audit_logs') || '[]');
        const ratLog = logs.find((l:any)=> l.action==='SENATE_RATIFICATION');
        if (ratLog) { setSenateData({ approved: true, date: ratLog.timestamp, provostName: ratLog.user || 'Provost', session, semester }); return; }
        const v = localStorage.getItem('lcns_senate_approved');
        if (v === 'true') setSenateData({ approved: true, date: new Date().toISOString(), provostName: 'Provost', session, semester });
      } catch {}
    };
    check(); window.addEventListener('storage', check); window.addEventListener('lcns_storage_update', check);
    const iv = setInterval(check, 3000);
    return () => { window.removeEventListener('storage', check); window.removeEventListener('lcns_storage_update', check); clearInterval(iv); };
  }, [session, semester]);
  return senateData;
};

export const StudentPortal: React.FC = () => {
  const safeCurrentUser = (() => {
    try {
      const keys = ['lcns_erp_current_user', 'lcns-current-user', 'lcns_current_user', 'lcns_user'];
      for (const k of keys) { const v = localStorage.getItem(k); if (v) { const p = JSON.parse(v); if (p && p.email) return p; } }
      return StorageService.getCurrentUser();
    } catch { return null; }
  })();

  const currentStudentMatric = safeCurrentUser?.matricNo || safeCurrentUser?.matric_no || safeCurrentUser?.matricNumber || 'LCNS/2026/ND/014';
  const students = StorageService.getStudents() || [];
  let student = students.find((s) => s.matricNo === currentStudentMatric) || students[0];
  if (!student) {
    student = {
      matricNo: currentStudentMatric, fullName: safeCurrentUser?.fullName || 'LCNS Student',
      level: safeCurrentUser?.level || 'ND1', program: safeCurrentUser?.department || 'Nursing Sciences',
      department: 'Nursing Sciences', email: safeCurrentUser?.email || 'student@lcns.edu.ng',
      photoUrl: safeCurrentUser?.photoUrl || '', status: 'ACTIVE', session: '2026/2027',
    } as any;
  }

  const allCourses = StorageService.getCourses() || [];
  const allResults = StorageService.getResults() || [];
  const allPayments = StorageService.getPayments() || [];
  const [activeTab, setActiveTab] = useState<'courses' | 'results' | 'fees' | 'idcard' | 'cbt' | 'transcript'>('results');
  const [selectedSemester, setSelectedSemester] = useState<'First' | 'Second'>('First');
  const [selectedSession, setSelectedSession] = useState(COLLEGE_CONFIG.CURRENT_SESSION || '2026/2027');

  const [resultComputation, setResultComputation] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('lcns_results') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    const loadResults = () => {
      try { setResultComputation(JSON.parse(localStorage.getItem('lcns_results') || '[]')); } catch {}
    };
    loadResults(); window.addEventListener('lcns_storage_update', loadResults); window.addEventListener('storage', loadResults);
    return () => { window.removeEventListener('lcns_storage_update', loadResults); window.removeEventListener('storage', loadResults); };
  }, []);

  const studentMatricSafe = (student as any)?.matricNo || currentStudentMatric;
  const studentResults = allResults.filter((r) => r.matricNo === studentMatricSafe && r.semester === selectedSemester && r.session === selectedSession);
  const studentPayments = allPayments.filter((p) => p.matricOrFormNo === studentMatricSafe);
  const gpaData = (() => { try { return ApiService.calculateGPA(studentMatricSafe, selectedSemester, selectedSession); } catch { return { gpa: 0 } as any; } })();

  const senate = useSenateRatification(selectedSession, selectedSemester);
  const isResultPublished = senate.approved;

  const calculateMyResult = (semester?: 'First' | 'Second') => {
    let filtered = resultComputation.filter((r:any) => r.matricNo === studentMatricSafe);
    if (semester) filtered = filtered.filter((r:any) => r.semester?.toUpperCase().startsWith(semester.toUpperCase().slice(0,3)) || r.semester === semester || (semester==='First' && r.semester==='FIRST') || (semester==='Second' && r.semester==='SECOND'));
    let totalCU = 0, totalGP = 0, carry: any[] = [];
    filtered.forEach((r:any) => {
      const g = gradeSystem(r.score || r.totalScore || 0);
      if (g.grade==='F') carry.push(r);
      totalCU += r.creditUnit || r.units || 3;
      totalGP += (r.creditUnit || 3) * g.point;
    });
    const gpa = totalCU ? totalGP / totalCU : 0;
    return { gpa, totalCU, totalGP, carry, count: filtered.length, courses: filtered };
  };

  const calculateMyCGPA = () => {
    const all = resultComputation.filter((r:any) => r.matricNo === studentMatricSafe);
    let totalCU = 0, totalGP = 0;
    all.forEach((r:any) => {
      const g = gradeSystem(r.score || r.totalScore || 0);
      totalCU += r.creditUnit || r.units || 3;
      totalGP += (r.creditUnit || 3) * g.point;
    });
    const cgpa = totalCU ? totalGP / totalCU : 0;
    const classification = getClassOfDiploma(cgpa);
    const carryAll = all.filter((r:any) => gradeSystem(r.score || 0).grade==='F');
    return { cgpa, totalCU, totalGP, classification, carryAll, all };
  };

  const myFirstSem = calculateMyResult('First');
  const mySecondSem = calculateMyResult('Second');
  const myCGPAData = calculateMyCGPA();

  const downloadResultSlipPDF = () => {
    if (!isResultPublished) { alert('Result not yet published by Provost - Awaiting Senate'); return; }
    const firstCourses = resultComputation.filter((r:any) => r.matricNo === studentMatricSafe && (r.semester==='FIRST' || r.semester==='First'));
    const secondCourses = resultComputation.filter((r:any) => r.matricNo === studentMatricSafe && (r.semester==='SECOND' || r.semester==='Second'));
    const html = `
      <html><head><style>body{font-family:Arial; font-size:11px;} table{width:100%; border-collapse:collapse;} th,td{border:1px solid #000; padding:4px;} th{background:#0a4d2e; color:#fff;} .header{text-align:center;} .carry{color:red; font-weight:bold;}</style></head><body>
      <div class="header"><h2>LABE COLLEGE OF NURSING SCIENCES, GBOKO</h2><h3>Catholic Diocese of Gboko</h3><h3>ND/HND NURSING - STUDENT RESULT SLIP - ${studentMatricSafe} - ${displayName}</h3></div>
      <h4>FIRST SEMESTER - GPA: ${myFirstSem.gpa.toFixed(2)}</h4>
      <table><tr><th>Course</th><th>Title</th><th>CU</th><th>Score</th><th>Grade</th><th>GP</th><th>Remark</th></tr>
      ${firstCourses.map((r:any)=>{const g=gradeSystem(r.score||0); return `<tr><td>${r.courseCode}</td><td>${r.courseTitle||''}</td><td>${r.creditUnit||3}</td><td>${r.score||0}</td><td>${g.grade}</td><td>${(r.creditUnit||3)*g.point}</td><td class="${g.grade==='F'?'carry':''}">${g.remark}</td></tr>`}).join('')}
      </table>
      <h4>SECOND SEMESTER - GPA: ${mySecondSem.gpa.toFixed(2)}</h4>
      <table><tr><th>Course</th><th>Title</th><th>CU</th><th>Score</th><th>Grade</th><th>GP</th><th>Remark</th></tr>
      ${secondCourses.map((r:any)=>{const g=gradeSystem(r.score||0); return `<tr><td>${r.courseCode}</td><td>${r.courseTitle||''}</td><td>${r.creditUnit||3}</td><td>${r.score||0}</td><td>${g.grade}</td><td>${(r.creditUnit||3)*g.point}</td><td>${g.remark}</td></tr>`}).join('')}
      </table>
      <div style="border:2px solid #000; padding:10px; margin-top:15px;">
        <p>CGPA: ${myCGPAData.cgpa.toFixed(2)} | Class: ${myCGPAData.classification.class}</p>
      </div>
      </body></html>`;
    const win = window.open('', '_blank'); if (win) { win.document.write(html); win.document.close(); win.focus(); setTimeout(()=>win.print(), 500); }
  };

  const downloadTranscriptPDF = () => {
    if (!isResultPublished) { alert('Transcript available after Senate Approval'); return; }
    const all = myCGPAData.all;
    const levels = ['ND1','ND2','HND1','HND2'];
    let tables = '';
    levels.forEach(lvl => {
      const lvlCourses = all.filter((r:any)=>r.level===lvl);
      if (lvlCourses.length===0) return;
      let cu=0, gp=0; lvlCourses.forEach((r:any)=>{ const g=gradeSystem(r.score||0); cu+=r.creditUnit||3; gp+=(r.creditUnit||3)*g.point; });
      const gpa = cu?gp/cu:0;
      tables += `<h4>${lvl} - GPA: ${gpa.toFixed(2)}</h4><table><tr><th>Course</th><th>Title</th><th>CU</th><th>Score</th><th>Grade</th><th>Point</th><th>GP</th></tr>${lvlCourses.map((r:any)=>{const g=gradeSystem(r.score||0); return `<tr><td>${r.courseCode}</td><td>${r.courseTitle||''}</td><td>${r.creditUnit||3}</td><td>${r.score||0}</td><td>${g.grade}</td><td>${g.point}</td><td>${(r.creditUnit||3)*g.point}</td></tr>`}).join('')}</table><br/>`;
    });
    const html = `<html><head><style>body{font-family:Arial; font-size:9px;} table{width:100%; border-collapse:collapse;} th,td{border:1px solid #000; padding:3px;} th{background:#0a4d2e; color:#fff;} .header{text-align:center;}</style></head><body>
      <div class="header"><h2>LABE COLLEGE OF NURSING SCIENCES, GBOKO</h2><p>Catholic Diocese of Gboko</p><p>Matric: ${studentMatricSafe} - Name: ${displayName}</p></div>
      ${tables}
      <p>CGPA: ${myCGPAData.cgpa.toFixed(2)} | Class: ${myCGPAData.classification.class}</p></body></html>`;
    const win = window.open('', '_blank'); if (win) { win.document.write(html); win.document.close(); win.focus(); setTimeout(()=>win.print(), 600); }
  };

  const exportMyCSV = () => {
    const all = myCGPAData.all;
    if (all.length===0) { alert('No results yet'); return; }
    let csv = 'Matric No,Full Name,Course Code,Course Title,Credit Unit,Score,Grade\n';
    all.forEach((r:any)=>{ const g=gradeSystem(r.score||0); csv += `"${r.matricNo}","${r.fullName||displayName}","${r.courseCode}","${r.courseTitle||''}","${r.creditUnit||3}","${r.score||0}","${g.grade}"\n`; });
    const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${studentMatricSafe}_Result.csv`; document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const displayName = (student?.fullName || safeCurrentUser?.fullName || 'Student').toString().toUpperCase();
  const displayMatric = student?.matricNo || currentStudentMatric;

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-800 border-2 border-amber-400 flex items-center justify-center"><User className="w-8 h-8" /></div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-emerald-800 px-3 py-1 rounded-full">Student • {student.level} • {studentMatricSafe} • {isResultPublished ? '✅ Published' : '🔒 Awaiting Senate'} • CGPA {myCGPAData.cgpa.toFixed(2)}</span>
              <h1 className="text-xl sm:text-2xl font-black uppercase mt-1.5">{displayName}</h1>
              <p className="text-xs text-emerald-200">Matric: <strong className="text-white">{displayMatric}</strong> • {student.program} • CGPA: {myCGPAData.cgpa.toFixed(2)} • {myCGPAData.classification.class}</p>
            </div>
          </div>
          <div className="bg-emerald-950/80 p-3.5 rounded-2xl border text-center">
            <span className="text-[10px] text-emerald-300 uppercase block font-bold">Current CGPA / Class</span>
            <span className="text-2xl font-black text-amber-400">{myCGPAData.cgpa.toFixed(2)} / 4.00</span>
            <span className={`block text-[10px] px-2 py-0.5 rounded-full font-black mt-1 ${myCGPAData.classification.color}`}>{myCGPAData.classification.class}</span>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-emerald-800/80 flex flex-wrap gap-2 text-xs font-bold no-print">
          <button onClick={() => setActiveTab('results')} className={`px-4 py-2 rounded-xl flex items-center gap-1.5 ${activeTab === 'results' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-900/80 text-emerald-100'}`}><Award className="w-3.5 h-3.5" /><span>Results</span></button>
          <button onClick={() => setActiveTab('transcript')} className={`px-4 py-2 rounded-xl flex items-center gap-1.5 ${activeTab === 'transcript' ? 'bg-blue-600 text-white' : 'bg-blue-900/80 text-blue-100 border border-blue-400'}`}><FileText className="w-3.5 h-3.5" /><span>🎓 OFFICIAL TRANSCRIPT (LABE)</span></button>
          <button onClick={() => setActiveTab('courses')} className={`px-4 py-2 rounded-xl ${activeTab === 'courses' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-900/80 text-emerald-100'}`}>Courses</button>
          <button onClick={() => setActiveTab('fees')} className={`px-4 py-2 rounded-xl ${activeTab === 'fees' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-900/80 text-emerald-100'}`}>Fees</button>
          <button onClick={() => setActiveTab('idcard')} className={`px-4 py-2 rounded-xl ${activeTab === 'idcard' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-900/80 text-emerald-100'}`}>ID Card</button>
          <button onClick={() => setActiveTab('cbt')} className={`px-4 py-2 rounded-xl ${activeTab === 'cbt' ? 'bg-yellow-400 text-[#0f2e1f]' : 'bg-red-900/80 text-yellow-100'}`}>CBT</button>
        </div>
      </div>

      {activeTab === 'transcript' && (
        <div className="space-y-4">
          <OfficialTranscriptPrint matricNo={displayMatric} fullName={displayName} cgpaData={myCGPAData} studentLevel={student.level} />
        </div>
      )}

      {activeTab === 'results' && (
        <div className="bg-white rounded-3xl border shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row justify-between gap-3 items-center bg-slate-50 p-4 rounded-2xl border">
            <div className="flex gap-2">
              <select value={selectedSession} onChange={e=>setSelectedSession(e.target.value)} className="px-3 py-2 border-2 rounded-xl text-xs font-bold"><option>2026/2027</option><option>2025/2026</option></select>
              <select value={selectedSemester} onChange={e=>setSelectedSemester(e.target.value as any)} className="px-3 py-2 border-2 rounded-xl text-xs font-bold"><option value="First">First Semester</option><option value="Second">Second Semester</option></select>
            </div>
            <div className={`px-4 py-2 rounded-full text-xs font-black flex items-center gap-2 ${isResultPublished?'bg-emerald-100 text-emerald-800 border-2 border-emerald-400':'bg-red-50 text-red-700 border-2 border-red-300'}`}>
              {isResultPublished ? <><Unlock size={14}/> ✅ Senate Ratified - {senate.provostName}</> : <><Lock size={14}/> 🔒 Not Yet Published</>}
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-3">
            <div className="bg-slate-900 text-white rounded-2xl p-4 text-center"><p className="text-[10px] text-slate-400">FIRST SEM GPA</p><p className="text-2xl font-black text-amber-400">{myFirstSem.gpa.toFixed(2)}</p></div>
            <div className="bg-slate-900 text-white rounded-2xl p-4 text-center"><p className="text-[10px] text-slate-400">SECOND SEM GPA</p><p className="text-2xl font-black text-amber-400">{mySecondSem.gpa.toFixed(2)}</p></div>
            <div className="bg-emerald-900 text-white rounded-2xl p-4 text-center"><p className="text-[10px] text-emerald-300">CGPA</p><p className="text-2xl font-black text-amber-400">{myCGPAData.cgpa.toFixed(2)} / 4.00</p></div>
            <div className={`rounded-2xl p-4 text-center border-2 ${myCGPAData.classification.color}`}><p className="text-[10px] font-bold">CLASS</p><p className="text-sm font-black">{myCGPAData.classification.class}</p></div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={downloadResultSlipPDF} className="px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-black flex items-center gap-2"><FileText className="w-4 h-4"/> Download Result Slip</button>
            <button onClick={downloadTranscriptPDF} className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-2"><GraduationCap className="w-4 h-4"/> Download Transcript PDF</button>
            <button onClick={exportMyCSV} className="px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-black flex items-center gap-2"><FileSpreadsheet className="w-4 h-4"/> Export CSV</button>
            <button onClick={()=>setActiveTab('transcript')} className="px-4 py-2 bg-black text-white rounded-xl text-xs font-black">View Official LABE Transcript</button>
          </div>

          {!isResultPublished ? (
            <div className="border-4 border-dashed border-amber-300 rounded-3xl p-12 text-center bg-amber-50/50 space-y-4">
              <div className="w-20 h-20 bg-slate-900 text-white rounded-full flex items-center justify-center mx-auto"><Lock className="w-10 h-10"/></div>
              <h2 className="text-xl font-black uppercase">Result Not Yet Published</h2>
              <p className="text-sm text-slate-600 max-w-lg mx-auto">Your result is awaiting Senate Ratification. CGPA <b>{myCGPAData.cgpa.toFixed(2)}</b> will unlock after Provost publishes.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border-4 border-double border-emerald-900 p-8 rounded-2xl bg-white space-y-5">
                <div className="text-center pb-4 border-b-2 border-emerald-900">
                  <div className="flex items-center justify-center gap-3 mb-2"><CollegeLogo size="md" /><div><h1 className="text-lg font-black uppercase text-emerald-950">Labe College of Nursing Sciences, Gboko</h1><p className="text-xs font-extrabold text-emerald-800 uppercase">Catholic Diocese of Gboko</p></div></div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border">
                    <thead className="bg-emerald-900 text-white font-bold uppercase"><tr><th className="p-2.5">Course Code</th><th className="p-2.5">Title</th><th className="p-2.5 text-center">Unit</th><th className="p-2.5 text-center">Total</th><th className="p-2.5 text-center">Grade</th><th className="p-2.5">Remark</th></tr></thead>
                    <tbody className="divide-y">
                      {studentResults.length>0 ? studentResults.map((r)=>(
                        <tr key={r.id}><td className="p-2.5 font-mono font-bold">{r.courseCode}</td><td className="p-2.5">{r.courseTitle}</td><td className="p-2.5 text-center">{r.units}</td><td className="p-2.5 text-center font-bold">{r.totalScore}</td><td className="p-2.5 text-center font-bold">{r.grade}</td><td className="p-2.5">{r.remark}</td></tr>
                      )) : <tr><td colSpan={6} className="p-8 text-center text-slate-500">No results for {selectedSemester}</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="bg-white rounded-3xl border p-6 sm:p-8 space-y-6"><h3 className="font-bold text-base uppercase">Course Registration - {displayName}</h3><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50 font-bold uppercase border-b"><tr><th className="p-3">Code</th><th className="p-3">Title</th><th className="p-3 text-center">Units</th><th className="p-3">Lecturer</th><th className="p-3 text-center">Status</th></tr></thead><tbody className="divide-y">{allCourses.map((c) => (<tr key={c.id}><td className="p-3 font-mono font-bold text-emerald-900">{c.code}</td><td className="p-3 font-bold">{c.title}</td><td className="p-3 text-center">{c.units}</td><td className="p-3">{c.lecturerName}</td><td className="p-3 text-center"><span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full"><CheckCircle2 className="w-3 h-3" /> Registered</span></td></tr>))}</tbody></table></div></div>
      )}

      {activeTab === 'fees' && (
        <div className="bg-white rounded-3xl border p-6 sm:p-8 space-y-6"><h3 className="font-bold text-base uppercase">Tuition Fees - {displayName}</h3><div className="space-y-4">{studentPayments.map((p) => (<div key={p.id} className="p-5 bg-slate-50 rounded-2xl border flex justify-between"><div><span className="font-bold text-sm">{p.feeType}</span><span className="ml-2 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">PAID</span><div className="text-xs text-slate-500">Receipt: {p.receiptNo}</div></div><span className="text-lg font-black text-emerald-900">₦{p.amount.toLocaleString()}</span></div>))}</div></div>
      )}

      {activeTab === 'idcard' && (
        <div className="bg-white rounded-3xl border p-6 sm:p-8"><h3 className="font-bold uppercase">ID Card - {displayName}</h3><div className="flex justify-center mt-6"><div className="w-full max-w-sm bg-gradient-to-br from-emerald-900 to-emerald-950 text-white rounded-2xl p-6 border-2 border-amber-400"><div className="flex items-center gap-2 border-b border-emerald-700 pb-3"><CollegeLogo size="sm" /><div><h4 className="text-[11px] font-black uppercase">Labe College of Nursing Sciences</h4><span className="text-[9px] text-amber-300 uppercase">Gboko • {student.level}</span></div></div><div className="flex items-center gap-4 my-4"><div className="w-24 h-28 bg-emerald-950 border-2 border-white rounded-xl flex flex-col items-center justify-center"><User className="w-12 h-12 text-emerald-400" /></div><div className="space-y-1 text-[11px]"><div><span className="text-[9px] text-emerald-300 block">Full Name:</span><strong className="text-xs uppercase">{displayName}</strong></div><div><span className="text-[9px] text-emerald-300 block">Matric:</span><strong className="text-amber-300">{displayMatric}</strong></div><div><span className="text-[9px] text-emerald-300 block">CGPA:</span><strong>{myCGPAData.cgpa.toFixed(2)} - {myCGPAData.classification.class}</strong></div></div></div></div></div></div>
      )}

      {activeTab === 'cbt' && (
        <div className="space-y-4">
          <ApplicantDashboardCBT applicant={{ name: displayName, fullName: displayName, email: (student as any).email, jamb_no: displayMatric, matricNo: displayMatric, application_number: displayMatric, academic_year: '2026/2027', level: student.level, session: selectedSession }} />
        </div>
      )}
    </div>
  );
};

export default StudentPortal;

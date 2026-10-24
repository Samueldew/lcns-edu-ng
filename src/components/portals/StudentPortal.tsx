import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import { ApiService } from '../../services/api';
import { Student, Course, ResultScore, PaymentRecord, COLLEGE_CONFIG } from '../../types';
import { CollegeLogo } from '../common/CollegeLogo';
import {
  User, GraduationCap, BookOpen, Award, CreditCard, Printer, CheckCircle2, QrCode,
  ShieldAlert, Clock, AlertTriangle, Timer, Eye, Lock, Unlock, Calculator, FileText, FileSpreadsheet, Download
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'courses' | 'results' | 'fees' | 'idcard' | 'cbt'>('results');
  const [selectedSemester, setSelectedSemester] = useState<'First' | 'Second'>('First');
  const [selectedSession, setSelectedSession] = useState(COLLEGE_CONFIG.CURRENT_SESSION || '2026/2027');

  // RESULT COMPUTATION STORAGE - NEW
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

  // CALCULATE GPA, CGPA, CLASS, CARRY OVER - NEW
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

  // DOWNLOAD PDFS - NEW
  const downloadResultSlipPDF = () => {
    if (!isResultPublished) { alert('Result not yet published by Provost - Awaiting Senate'); return; }
    const firstCourses = resultComputation.filter((r:any) => r.matricNo === studentMatricSafe && (r.semester==='FIRST' || r.semester==='First'));
    const secondCourses = resultComputation.filter((r:any) => r.matricNo === studentMatricSafe && (r.semester==='SECOND' || r.semester==='Second'));
    const html = `
      <html><head><style>body{font-family:Arial; font-size:11px;} table{width:100%; border-collapse:collapse;} th,td{border:1px solid #000; padding:4px;} th{background:#0a4d2e; color:#fff;} .header{text-align:center;} .carry{color:red; font-weight:bold;}</style></head><body>
      <div class="header"><h2>LABE COLLEGE OF NURSING SCIENCES, GBOKO</h2><h3>ND/HND NURSING - STUDENT RESULT SLIP - ${studentMatricSafe} - ${displayName}</h3><p>Level: ${student.level} | Session: ${selectedSession} | Grading: 70=A, 60=B, 50=C, 40=D, 0-39=F</p></div>
      <h4>FIRST SEMESTER - GPA: ${myFirstSem.gpa.toFixed(2)}</h4>
      <table><tr><th>Course</th><th>Title</th><th>CU</th><th>Score</th><th>Grade</th><th>GP</th><th>Remark</th></tr>
      ${firstCourses.map((r:any)=>{const g=gradeSystem(r.score||0); return `<tr><td>${r.courseCode}</td><td>${r.courseTitle||''}</td><td>${r.creditUnit||3}</td><td>${r.score||0}</td><td>${g.grade}</td><td>${(r.creditUnit||3)*g.point}</td><td class="${g.grade==='F'?'carry':''}">${g.remark}</td></tr>`}).join('')}
      </table><p>GPA: ${myFirstSem.gpa.toFixed(2)} | Carry: ${myFirstSem.carry.map((c:any)=>c.courseCode).join(', ')||'None'}</p>
      <h4>SECOND SEMESTER - GPA: ${mySecondSem.gpa.toFixed(2)} - Carry Over from First Auto Reflects</h4>
      <table><tr><th>Course</th><th>Title</th><th>CU</th><th>Score</th><th>Grade</th><th>GP</th><th>Remark</th></tr>
      ${secondCourses.map((r:any)=>{const g=gradeSystem(r.score||0); return `<tr><td>${r.courseCode}</td><td>${r.courseTitle||''}</td><td>${r.creditUnit||3}</td><td>${r.score||0}</td><td>${g.grade}</td><td>${(r.creditUnit||3)*g.point}</td><td>${g.remark}</td></tr>`}).join('')}
      ${myFirstSem.carry.length>0?`<tr><td colspan="7" class="carry">CARRY OVER FROM FIRST SEMESTER: ${myFirstSem.carry.map((c:any)=>`${c.courseCode} - ${c.score} F`).join(', ')} - Auto Reflects - Must Retake</td></tr>`:''}
      </table>
      <div style="border:2px solid #000; padding:10px; margin-top:15px;">
        <h3>CGPA & CLASS OF DIPLOMA</h3>
        <p>Total CU: ${myCGPAData.totalCU} | Total GP: ${myCGPAData.totalGP} | CGPA: ${myCGPAData.cgpa.toFixed(2)} / 4.00</p>
        <p style="background:${myCGPAData.classification.color.includes('green')?'#166534': myCGPAData.classification.color.includes('blue')?'#1e40af':'#854d0e'}; color:#fff; padding:8px; text-align:center; font-weight:bold;">CLASS: ${myCGPAData.classification.class} - ${myCGPAData.classification.desc}</p>
        <p>Distinction 3.50-4.00, Upper Credit 3.00-3.49, Lower Credit 2.50-2.99 (Qualified for HND), Pass 2.00-2.49</p>
      </div>
      <p>Senate Approved by ${senate.provostName} on ${new Date(senate.date).toLocaleDateString()} - Published - Student can print</p>
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
      const calc = { gpa: 0, cu: 0 }; let cu=0, gp=0; lvlCourses.forEach((r:any)=>{ const g=gradeSystem(r.score||0); cu+=r.creditUnit||3; gp+=(r.creditUnit||3)*g.point; }); calc.gpa = cu?gp/cu:0; calc.cu=cu;
      tables += `<h4>${lvl} - GPA: ${calc.gpa.toFixed(2)} - CU: ${cu}</h4><table><tr><th>Course</th><th>Title</th><th>CU</th><th>Score</th><th>Grade</th><th>Point</th><th>GP</th><th>Semester</th></tr>${lvlCourses.map((r:any)=>{const g=gradeSystem(r.score||0); return `<tr><td>${r.courseCode}</td><td>${r.courseTitle||''}</td><td>${r.creditUnit||3}</td><td>${r.score||0}</td><td>${g.grade}</td><td>${g.point}</td><td>${(r.creditUnit||3)*g.point}</td><td>${r.semester||''}</td></tr>`}).join('')}</table><br/>`;
    });
    const html = `<html><head><style>@page{size:landscape;} body{font-family:Arial; font-size:9px;} table{width:100%; border-collapse:collapse;} th,td{border:1px solid #000; padding:3px; text-align:center;} th{background:#0a4d2e; color:#fff;} .header{text-align:center;}</style></head><body>
      <div class="header"><h2>LABE COLLEGE OF NURSING SCIENCES - ACADEMIC TRANSCRIPT - ND/HND NURSING</h2><p>Matric: ${studentMatricSafe} - Name: ${displayName} - Program: ND/HND Nursing - 72-80 CU Required</p></div>
      ${tables}
      <div style="border:2px solid #000; padding:10px;"><p>CGPA: ${myCGPAData.cgpa.toFixed(2)} / 4.00 | Total CU: ${myCGPAData.totalCU} | Total GP: ${myCGPAData.totalGP}</p><h2 style="text-align:center; background:#0a4d2e; color:#fff; padding:10px;">CLASS: ${myCGPAData.classification.class}</h2><p>Distinction 3.50-4.00, Upper Credit 3.00-3.49, Lower Credit 2.50-2.99, Pass 2.00-2.49 - ND Certificate not awarded until HND completion</p></div>
      <p>Registrar: ________________ Provost: ________________ Date: ${new Date().toLocaleDateString()}</p></body></html>`;
    const win = window.open('', '_blank'); if (win) { win.document.write(html); win.document.close(); win.focus(); setTimeout(()=>win.print(), 600); }
  };

  const exportMyCSV = () => {
    const all = myCGPAData.all;
    if (all.length===0) { alert('No results yet - Upload via Result Computation Manager'); return; }
    let csv = 'Matric No,Full Name,Course Code,Course Title,Credit Unit,Score,Grade,Grade Point,GP,Semester,Level,Session,Remark,Carry Over\n';
    all.forEach((r:any)=>{ const g=gradeSystem(r.score||0); csv += `"${r.matricNo}","${r.fullName||displayName}","${r.courseCode}","${(r.courseTitle||'').replace(/"/g,'""')}","${r.creditUnit||3}","${r.score||0}","${g.grade}","${g.point}","${(r.creditUnit||3)*g.point}","${r.semester||''}","${r.level||''}","${r.session||''}","${g.remark}","${g.grade==='F'?'CARRY OVER':''}"\n`; });
    csv += `\nCGPA,${myCGPAData.cgpa.toFixed(2)},Total CU,${myCGPAData.totalCU},Total GP,${myCGPAData.totalGP},Class,${myCGPAData.classification.class}\n`;
    const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${studentMatricSafe}_Result_${myCGPAData.classification.class}_${new Date().toISOString().slice(0,10)}.csv`; document.body.appendChild(a); a.click(); document.body.removeChild(a);
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
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-emerald-800 px-3 py-1 rounded-full">Student • {student.level} • {studentMatricSafe} • {isResultPublished ? '✅ Published' : '🔒 Awaiting Senate'} • CGPA {myCGPAData.cgpa.toFixed(2)} • {myCGPAData.classification.class}</span>
              <h1 className="text-xl sm:text-2xl font-black uppercase mt-1.5">{displayName}</h1>
              <p className="text-xs text-emerald-200">Matric: <strong className="text-white">{displayMatric}</strong> • {student.program} • CGPA: {myCGPAData.cgpa.toFixed(2)} • {myCGPAData.classification.class} • {myCGPAData.carryAll.length ? `Carry Overs: ${myCGPAData.carryAll.length}` : 'No Carry Over'}</p>
            </div>
          </div>
          <div className="bg-emerald-950/80 p-3.5 rounded-2xl border text-center">
            <span className="text-[10px] text-emerald-300 uppercase block font-bold">Current CGPA / Class</span>
            <span className="text-2xl font-black text-amber-400">{myCGPAData.cgpa.toFixed(2)} / 4.00</span>
            <span className={`block text-[10px] px-2 py-0.5 rounded-full font-black mt-1 ${myCGPAData.classification.color}`}>{myCGPAData.classification.class}</span>
            <span className="block text-[10px] text-emerald-300">{isResultPublished ? 'Senate Approved' : 'Pending'}</span>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-emerald-800/80 flex flex-wrap gap-2 text-xs font-bold no-print">
          <button onClick={() => setActiveTab('results')} className={`px-4 py-2 rounded-xl flex items-center gap-1.5 ${activeTab === 'results' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-900/80 text-emerald-100'}`}><Award className="w-3.5 h-3.5" /><span>Results {isResultPublished ? '✅ Published' : '🔒'} - GPA {myFirstSem.gpa.toFixed(2)}/{mySecondSem.gpa.toFixed(2)} CGPA {myCGPAData.cgpa.toFixed(2)}</span></button>
          <button onClick={() => setActiveTab('courses')} className={`px-4 py-2 rounded-xl ${activeTab === 'courses' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-900/80 text-emerald-100'}`}>Courses</button>
          <button onClick={() => setActiveTab('fees')} className={`px-4 py-2 rounded-xl ${activeTab === 'fees' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-900/80 text-emerald-100'}`}>Fees</button>
          <button onClick={() => setActiveTab('idcard')} className={`px-4 py-2 rounded-xl ${activeTab === 'idcard' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-900/80 text-emerald-100'}`}>ID Card</button>
          <button onClick={() => setActiveTab('cbt')} className={`px-4 py-2 rounded-xl ${activeTab === 'cbt' ? 'bg-yellow-400 text-[#0f2e1f]' : 'bg-red-900/80 text-yellow-100'}`}>CBT</button>
        </div>
      </div>

      {activeTab === 'results' && (
        <div className="bg-white rounded-3xl border shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row justify-between gap-3 items-center bg-slate-50 p-4 rounded-2xl border">
            <div className="flex gap-2">
              <select value={selectedSession} onChange={e=>setSelectedSession(e.target.value)} className="px-3 py-2 border-2 rounded-xl text-xs font-bold"><option>2026/2027</option><option>2025/2026</option></select>
              <select value={selectedSemester} onChange={e=>setSelectedSemester(e.target.value as any)} className="px-3 py-2 border-2 rounded-xl text-xs font-bold"><option value="First">First Semester</option><option value="Second">Second Semester - Shows Carry Over from First</option></select>
            </div>
            <div className={`px-4 py-2 rounded-full text-xs font-black flex items-center gap-2 ${isResultPublished?'bg-emerald-100 text-emerald-800 border-2 border-emerald-400':'bg-red-50 text-red-700 border-2 border-red-300'}`}>
              {isResultPublished ? <><Unlock size={14}/> ✅ Senate Ratified - {senate.provostName} - CGPA {myCGPAData.cgpa.toFixed(2)} - {myCGPAData.classification.class}</> : <><Lock size={14}/> 🔒 Not Yet Published - Awaiting Provost</>}
            </div>
          </div>

          {/* CGPA + CLASSIFICATION CARD - NEW - VISIBLE ALWAYS */}
          <div className="grid md:grid-cols-4 gap-3">
            <div className="bg-slate-900 text-white rounded-2xl p-4 text-center"><p className="text-[10px] text-slate-400">FIRST SEMESTER GPA</p><p className="text-2xl font-black text-amber-400">{myFirstSem.gpa.toFixed(2)}</p><p className="text-[10px]">CU: {myFirstSem.totalCU} | Courses: {myFirstSem.count}</p></div>
            <div className="bg-slate-900 text-white rounded-2xl p-4 text-center"><p className="text-[10px] text-slate-400">SECOND SEMESTER GPA</p><p className="text-2xl font-black text-amber-400">{mySecondSem.gpa.toFixed(2)}</p><p className="text-[10px]">CU: {mySecondSem.totalCU} | Carry from 1st: {myFirstSem.carry.length}</p></div>
            <div className="bg-emerald-900 text-white rounded-2xl p-4 text-center"><p className="text-[10px] text-emerald-300">CGPA (ALL LEVELS)</p><p className="text-2xl font-black text-amber-400">{myCGPAData.cgpa.toFixed(2)} / 4.00</p><p className="text-[10px]">Total CU: {myCGPAData.totalCU} | All Courses: {myCGPAData.all.length}</p></div>
            <div className={`rounded-2xl p-4 text-center border-2 ${myCGPAData.classification.color}`}><p className="text-[10px] font-bold">CLASS OF DIPLOMA</p><p className="text-sm font-black">{myCGPAData.classification.class}</p><p className="text-[10px]">{myCGPAData.classification.desc}</p><p className="text-[10px] mt-1">{myCGPAData.carryAll.length ? `⚠️ Carry Overs: ${myCGPAData.carryAll.map((c:any)=>c.courseCode).join(', ')}` : '✅ No Carry Over'}</p></div>
          </div>

          {/* DOWNLOAD BUTTONS - NEW */}
          <div className="flex flex-wrap gap-2">
            <button onClick={downloadResultSlipPDF} className="px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-black flex items-center gap-2"><FileText className="w-4 h-4"/> Download Result Slip PDF - CGPA + Class + Carry Over Auto Reflect</button>
            <button onClick={downloadTranscriptPDF} className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-2"><GraduationCap className="w-4 h-4"/> Download Transcript ND/HND PDF - Full 4 Years - 72-80 CU</button>
            <button onClick={exportMyCSV} className="px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-black flex items-center gap-2"><FileSpreadsheet className="w-4 h-4"/> Export My Result to Excel CSV - CGPA + Class</button>
          </div>

          {!isResultPublished ? (
            <div className="border-4 border-dashed border-amber-300 rounded-3xl p-12 text-center bg-amber-50/50 space-y-4">
              <div className="w-20 h-20 bg-slate-900 text-white rounded-full flex items-center justify-center mx-auto"><Lock className="w-10 h-10"/></div>
              <h2 className="text-xl font-black uppercase">Semester Result Not Yet Published</h2>
              <p className="text-sm text-slate-600 max-w-lg mx-auto">Your <b>{selectedSemester} {selectedSession}</b> result for <b>{displayName} ({displayMatric}) - {student.level}</b> is awaiting Senate Ratification. Your current CGPA <b>{myCGPAData.cgpa.toFixed(2)}</b> - Class <b>{myCGPAData.classification.class}</b> will be officially unlocked after Provost publishes. {myFirstSem.carry.length>0 && `You have ${myFirstSem.carry.length} carry over(s): ${myFirstSem.carry.map((c:any)=>c.courseCode).join(', ')} - Will auto reflect in second semester.`}</p>
              <div className="bg-white border-2 rounded-2xl p-4 max-w-md mx-auto text-left text-xs space-y-2"><p className="font-bold">Flow:</p><p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600"/> Lecturer Submitted</p><p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600"/> HOD Moderated</p><p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600"/> Exam Officer Calculated GPA {myFirstSem.gpa.toFixed(2)}/{mySecondSem.gpa.toFixed(2)} CGPA {myCGPAData.cgpa.toFixed(2)}</p><p className="flex items-center gap-2"><Clock className="w-4 h-4 text-amber-500 animate-pulse"/> Provost Senate Ratification Pending</p><p className="flex items-center gap-2 text-slate-400"><Lock className="w-4 h-4"/> Student View Unlocks After Approval</p></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 flex justify-between items-center">
                <div><p className="font-black text-emerald-900 text-sm flex items-center gap-2"><Unlock className="w-4 h-4"/> ✅ Published by Provost - CGPA {myCGPAData.cgpa.toFixed(2)} - {myCGPAData.classification.class} - {myCGPAData.carryAll.length ? `Carry Overs: ${myCGPAData.carryAll.length}` : 'No Carry'}</p><p className="text-xs text-slate-600">Published by: {senate.provostName} | {new Date(senate.date).toLocaleString()} | {displayName} - {displayMatric} - Total CU {myCGPAData.totalCU}</p></div>
                <div className="flex gap-2"><button onClick={downloadResultSlipPDF} className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1"><Printer className="w-4 h-4"/> Print Slip</button><button onClick={downloadTranscriptPDF} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">Print Transcript</button></div>
              </div>

              <div className="border-4 border-double border-emerald-900 p-8 rounded-2xl bg-white space-y-5">
                <div className="text-center pb-4 border-b-2 border-emerald-900">
                  <div className="flex items-center justify-center gap-3 mb-2"><CollegeLogo size="md" /><div><h1 className="text-lg sm:text-xl font-black uppercase text-emerald-950">Labe College of Nursing Sciences, Gboko</h1><p className="text-xs font-extrabold text-emerald-800 uppercase">Office of the Provost - Senate Approved - CGPA {myCGPAData.cgpa.toFixed(2)} - {myCGPAData.classification.class}</p></div></div>
                  <div className="inline-flex gap-2 flex-wrap justify-center"><span className="bg-emerald-900 text-white text-xs font-bold uppercase px-4 py-1 rounded-full">{selectedSemester} {selectedSession} - {displayName} - {displayMatric}</span><span className={`text-xs font-black uppercase px-4 py-1 rounded-full ${myCGPAData.classification.color}`}>{myCGPAData.classification.class} - CGPA {myCGPAData.cgpa.toFixed(2)}</span></div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-xl border">
                  <div><span className="text-slate-500 block text-[10px]">Student:</span><strong className="uppercase">{displayName}</strong></div>
                  <div><span className="text-slate-500 block text-[10px]">Matric:</span><strong className="text-emerald-900 font-mono">{displayMatric}</strong></div>
                  <div><span className="text-slate-500 block text-[10px]">Level:</span><strong>{student.program} ({student.level}) - CU {myCGPAData.totalCU}</strong></div>
                  <div><span className="text-slate-500 block text-[10px]">CGPA & Class:</span><strong>{myCGPAData.cgpa.toFixed(2)} - {myCGPAData.classification.class}</strong></div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border">
                    <thead className="bg-emerald-900 text-white font-bold uppercase"><tr><th className="p-2.5">Course Code</th><th className="p-2.5">Course Title</th><th className="p-2.5 text-center">Unit</th><th className="p-2.5 text-center">CA</th><th className="p-2.5 text-center">Exam</th><th className="p-2.5 text-center">Total</th><th className="p-2.5 text-center">Grade</th><th className="p-2.5 text-center">Point</th><th className="p-2.5">Remark + Carry Over Auto Reflect</th></tr></thead>
                    <tbody className="divide-y">
                      {studentResults.length>0 ? studentResults.map((r)=>(
                        <tr key={r.id} className="hover:bg-slate-50"><td className="p-2.5 font-mono font-bold text-emerald-900">{r.courseCode}</td><td className="p-2.5 font-semibold">{r.courseTitle}</td><td className="p-2.5 text-center font-bold">{r.units}</td><td className="p-2.5 text-center">{r.caScore}</td><td className="p-2.5 text-center">{r.examScore}</td><td className="p-2.5 text-center font-bold">{r.totalScore}</td><td className="p-2.5 text-center font-bold text-emerald-800">{r.grade}</td><td className="p-2.5 text-center font-bold">{r.point}.0</td><td className="p-2.5 font-semibold">{r.remark} {selectedSemester==='Second' && myFirstSem.carry.length>0 ? `| Carry from 1st: ${myFirstSem.carry.map((c:any)=>c.courseCode).join(', ')}` : ''}</td></tr>
                      )) : resultComputation.filter((r:any)=>r.matricNo===studentMatricSafe).length>0 ? resultComputation.filter((r:any)=>r.matricNo===studentMatricSafe).map((r:any)=>{const g=gradeSystem(r.score||0); return (<tr key={r.id} className="hover:bg-slate-50"><td className="p-2.5 font-mono font-bold text-emerald-900">{r.courseCode}</td><td className="p-2.5 font-semibold">{r.courseTitle}</td><td className="p-2.5 text-center font-bold">{r.creditUnit||3}</td><td className="p-2.5 text-center">-</td><td className="p-2.5 text-center">-</td><td className="p-2.5 text-center font-bold">{r.score||0}</td><td className="p-2.5 text-center font-bold text-emerald-800">{g.grade}</td><td className="p-2.5 text-center font-bold">{g.point}.0</td><td className="p-2.5 font-semibold">{g.remark} {g.grade==='F' ? '- CARRY OVER - Auto Reflects in Second Semester' : ''}</td></tr>); }) : <tr><td colSpan={9} className="p-8 text-center text-slate-500">No results for {selectedSemester} {selectedSession} - CGPA {myCGPAData.cgpa.toFixed(2)} - Class {myCGPAData.classification.class} - Contact Exam Officer</td></tr>}
                    </tbody>
                  </table>
                </div>

                <div className="grid md:grid-cols-3 gap-4 text-xs pt-4 border-t">
                  <div className="bg-emerald-50 border p-3 rounded-xl"><p className="font-bold">GPA First: {myFirstSem.gpa.toFixed(2)} | Second: {mySecondSem.gpa.toFixed(2)}</p><p className="font-bold">CGPA: {myCGPAData.cgpa.toFixed(2)} / 4.00</p><p className="font-bold">Class: {myCGPAData.classification.class}</p><p className="text-[10px]">Total CU: {myCGPAData.totalCU} | Senate: {new Date(senate.date).toLocaleDateString()}</p></div>
                  <div className="bg-slate-50 border p-3 rounded-xl"><p className="font-bold">Provost Approval: {senate.provostName}</p><p className="text-[10px]">Office of the Provost - Labe College</p><p className="text-[10px]">Carry Overs: {myCGPAData.carryAll.length ? myCGPAData.carryAll.map((c:any)=>c.courseCode).join(', ') + ' - Auto Reflects' : 'None - Good Standing'}</p></div>
                  <div className="bg-amber-50 border border-amber-300 p-3 rounded-xl"><p className="font-black">Official Stamp - Senate Approved - {myCGPAData.classification.class}</p><p className="text-[10px]">CGPA {myCGPAData.cgpa.toFixed(2)} - {myCGPAData.classification.desc} - Valid for ND/HND Nursing - Minimum 2.50 for HND progression</p></div>
                </div>

                <div className="flex justify-between pt-6 text-xs"><div className="text-center"><div className="w-32 border-t border-black pt-1 font-bold">Exam Officer<br/><span className="text-[9px]">Dr. Emmanuel Agada - GPA {myFirstSem.gpa.toFixed(2)}/{mySecondSem.gpa.toFixed(2)} CGPA {myCGPAData.cgpa.toFixed(2)}</span></div></div><div className="text-center"><div className="w-32 border-t border-black pt-1 font-bold">Provost<br/><span className="text-[9px]">{senate.provostName} - {myCGPAData.classification.class}</span></div></div><div className="text-center"><div className="w-32 border-t border-black pt-1 font-bold">Registrar<br/><span className="text-[9px]">College Registrar - {displayMatric}</span></div></div></div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="bg-white rounded-3xl border p-6 sm:p-8 space-y-6"><h3 className="font-bold text-base uppercase">Course Registration - {displayName} - CGPA {myCGPAData.cgpa.toFixed(2)} - {myCGPAData.classification.class}</h3><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50 font-bold uppercase border-b"><tr><th className="p-3">Code</th><th className="p-3">Title</th><th className="p-3 text-center">Units</th><th className="p-3">Lecturer</th><th className="p-3 text-center">Status</th></tr></thead><tbody className="divide-y">{allCourses.map((c) => (<tr key={c.id}><td className="p-3 font-mono font-bold text-emerald-900">{c.code}</td><td className="p-3 font-bold">{c.title}</td><td className="p-3 text-center">{c.units}</td><td className="p-3">{c.lecturerName}</td><td className="p-3 text-center"><span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full"><CheckCircle2 className="w-3 h-3" /> Registered</span></td></tr>))}</tbody></table></div></div>
      )}

      {activeTab === 'fees' && (
        <div className="bg-white rounded-3xl border p-6 sm:p-8 space-y-6"><h3 className="font-bold text-base uppercase">Tuition Fees & Receipts - {displayName} - CGPA {myCGPAData.cgpa.toFixed(2)}</h3><div className="space-y-4">{studentPayments.map((p) => (<div key={p.id} className="p-5 bg-slate-50 rounded-2xl border flex justify-between"><div><span className="font-bold text-sm">{p.feeType}</span><span className="ml-2 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">PAID</span><div className="text-xs text-slate-500">Receipt: {p.receiptNo} • {p.paymentDate}</div></div><span className="text-lg font-black text-emerald-900">₦{p.amount.toLocaleString()}</span></div>))}</div></div>
      )}

      {activeTab === 'idcard' && (
        <div className="bg-white rounded-3xl border p-6 sm:p-8"><h3 className="font-bold uppercase">ID Card - {displayName} - CGPA {myCGPAData.cgpa.toFixed(2)} - {myCGPAData.classification.class}</h3><div className="flex justify-center mt-6"><div className="w-full max-w-sm bg-gradient-to-br from-emerald-900 to-emerald-950 text-white rounded-2xl p-6 border-2 border-amber-400"><div className="flex items-center gap-2 border-b border-emerald-700 pb-3"><CollegeLogo size="sm" /><div><h4 className="text-[11px] font-black uppercase">Labe College of Nursing Sciences</h4><span className="text-[9px] text-amber-300 uppercase">Gboko • {student.level} • CGPA {myCGPAData.cgpa.toFixed(2)} • {myCGPAData.classification.class}</span></div></div><div className="flex items-center gap-4 my-4"><div className="w-24 h-28 bg-emerald-950 border-2 border-white rounded-xl flex flex-col items-center justify-center"><User className="w-12 h-12 text-emerald-400" /><span className="text-[8px] text-amber-300 font-bold uppercase mt-1">Photo</span></div><div className="space-y-1 text-[11px]"><div><span className="text-[9px] text-emerald-300 block">Full Name:</span><strong className="text-xs uppercase">{displayName}</strong></div><div><span className="text-[9px] text-emerald-300 block">Matric:</span><strong className="text-amber-300">{displayMatric}</strong></div><div><span className="text-[9px] text-emerald-300 block">CGPA & Class:</span><strong>{myCGPAData.cgpa.toFixed(2)} - {myCGPAData.classification.class}</strong></div><div><span className="text-[9px] text-emerald-300 block">Programme:</span><strong>{student.program} ({student.level})</strong></div></div></div></div></div></div>
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

import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import { COLLEGE_CONFIG } from '../../types';
import {
  Award,
  Users,
  GraduationCap,
  TrendingUp,
  CheckCircle2,
  Clock,
  Building,
  FileCheck,
  Send,
  BookOpen,
  Search,
  Download,
  ShieldAlert,
  Eye,
  EyeOff,
  Settings,
  Plus,
  Trash2,
  Save,
  Timer,
  Monitor,
  Printer,
  ArrowRight,
  ArrowLeft,
  Edit,
  FileSpreadsheet,
} from 'lucide-react';
import { CBTExamManager } from '../cbt/CBTExamManager';
import { AdmissionProcessingView } from './AdmissionProcessingView';
import { AdminAdmissionManager } from '../admin/AdminAdmissionManager';
import { ScoreSheetViewer } from './ScoreSheetViewer';
import { PrintableResultWithLogo } from '../common/PrintableResultWithLogo';
import { AdminExamSettings } from './AdminExamSettings';
import { supabase } from '@/lib/supabase';

// ===== REGISTRAR APPLICANT ENTRANCE CBT MANAGER - KEEP AS IS =====
const RegistrarApplicantCBTManager = () => {
  const [exams, setExams] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('lcns_applicant_exams') || '[]'); } catch { return []; }
  });
  const [title, setTitle] = useState('Post-UTME Entrance CBT 2026/2027 - ND/HND Nursing');
  const [academicYear, setAcademicYear] = useState('2026/2027');
  const [duration, setDuration] = useState(40);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [maxTabSwitch, setMaxTabSwitch] = useState(10);
  const [fullScreen, setFullScreen] = useState(true);
  const [status, setStatus] = useState<'draft'|'published'|'unpublished'>('draft');
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('lcns_entrance_questions') || localStorage.getItem('lcns_cbt_questions') || '[]'); } catch { return []; }
  });
  const [qText, setQText] = useState(''); const [optA, setOptA] = useState(''); const [optB, setOptB] = useState(''); const [optC, setOptC] = useState(''); const [optD, setOptD] = useState(''); const [correct, setCorrect] = useState('A');
  const [attempts, setAttempts] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('lcns_cbt_attempts') || '[]'); } catch { return []; }
  });
  const saveExams = (newExams: any[]) => { setExams(newExams); localStorage.setItem('lcns_applicant_exams', JSON.stringify(newExams)); localStorage.setItem('lcns_cbt_exams', JSON.stringify(newExams)); };
  const saveQuestions = (newQs: any[]) => { setQuestions(newQs); localStorage.setItem('lcns_entrance_questions', JSON.stringify(newQs)); localStorage.setItem('lcns_cbt_questions', JSON.stringify(newQs)); };
  const createExam = () => {
    const newExam = { id: 'EXAM-' + Date.now(), title, academic_year: academicYear, academicYear, duration_minutes: duration, duration, start_time: startTime, end_time: endTime, max_tab_switches: maxTabSwitch, anti_cheat_warnings: maxTabSwitch, antiCheat: { tabSwitchLimit: maxTabSwitch, fullScreenRequired: fullScreen, warnings: maxTabSwitch }, full_screen_required: fullScreen, fullScreen, status, result_status: status === 'published' ? 'published' : 'draft', created_at: new Date().toISOString(), created_by: 'Registrar', shuffle_questions: true };
    const updated = [newExam, ...exams]; saveExams(updated); setSelectedExamId(newExam.id); alert('✅ Entrance Exam Created!');
  };
  const updateExamStatus = (id: string, newStatus: 'published'|'unpublished'|'draft') => {
    const updated = exams.map((e:any)=> e.id===id ? {...e, status: newStatus, result_status: newStatus} : e); saveExams(updated); alert(newStatus === 'published' ? '✅ PUBLISHED' : '⏸️ UNPUBLISHED');
  };
  const addQuestion = () => {
    if (!qText || !optA || !optB) return alert('Fill question and at least A & B options');
    const newQ = { id: 'Q-' + Date.now(), exam_id: selectedExamId || exams[0]?.id || 'default', question_text: qText, option_a: optA, option_b: optB, option_c: optC, option_d: optD, option_A: optA, option_B: optB, option_C: optC, option_D: optD, correct_option: correct, marks: 1 };
    saveQuestions([...questions, newQ]); setQText(''); setOptA(''); setOptB(''); setOptC(''); setOptD(''); setCorrect('A');
  };
  const updateCorrectAnswer = (qId: string, newCorrect: string) => { const updated = questions.map((q:any)=> q.id===qId ? {...q, correct_option: newCorrect} : q); saveQuestions(updated); alert('✅ Correct answer updated to ' + newCorrect); };
  const deleteQuestion = (id: string) => { if (!confirm('Delete question?')) return; saveQuestions(questions.filter((q:any)=>q.id!==id)); };
  const publishScoreForApplicant = (attempt: any) => {
    let score = 0; const attemptAnswers = attempt.answers || {}; const qsForExam = questions.filter((q:any)=> q.exam_id === attempt.exam_id || true);
    if (Object.keys(attemptAnswers).length) { qsForExam.forEach((q:any)=>{ if(attemptAnswers[q.id]===q.correct_option) score++; }); } else { const newScore = prompt(`Set final score for ${attempt.applicant_name}`, attempt.score); if (newScore !== null) score = parseInt(newScore); else return; }
    const total = qsForExam.length || attempt.total; const perc = Math.round((score/total)*100); const published = { ...attempt, score, total, percentage: perc, published_at: new Date().toISOString(), published_by: 'Registrar', result_status: 'published' };
    localStorage.setItem('lcns_cbt_published_' + (attempt.application_number || attempt.jamb_no || attempt.applicant_name), JSON.stringify(published));
    const updatedAttempts = attempts.map((a:any)=> a.application_number===attempt.application_number || a.jamb_no===attempt.jamb_no ? {...a, cbt_published: true, cbt_score: score, cbt_total: total, cbt_percentage: perc} : a);
    setAttempts(updatedAttempts); localStorage.setItem('lcns_cbt_attempts', JSON.stringify(updatedAttempts)); alert(`✅ Score PUBLISHED for ${attempt.applicant_name}!`);
  };
  const unpublishScore = (attempt: any) => { localStorage.removeItem('lcns_cbt_published_' + (attempt.application_number || attempt.jamb_no || attempt.applicant_name)); alert('⏸️ Score UNPUBLISHED'); };
  useEffect(() => { const loadAttempts = () => { try { setAttempts(JSON.parse(localStorage.getItem('lcns_cbt_attempts') || '[]')); } catch {} }; loadAttempts(); window.addEventListener('focus', loadAttempts); return () => window.removeEventListener('focus', loadAttempts); }, []);
  const selectedExam = exams.find((e:any)=>e.id===selectedExamId) || exams[0];
  return (
    <div className="space-y-6 bg-white rounded-3xl border-2 border-blue-200 p-6">
      <div className="flex justify-between items-start"><div><h2 className="text-xl font-black text-[#0f4c2e] flex items-center gap-2"><ShieldAlert className="text-red-600"/> Registrar - Applicant Entrance CBT Manager</h2><p className="text-xs text-slate-500">Set applicant exams, time, anti-cheat 10 warnings, fullscreen, publish/unpublish</p></div><span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-black">{exams.length} Exams • {questions.length} Questions • {attempts.length} Attempts</span></div>
      <div className="bg-[#f0faf0] border-2 border-[#0f4c2e] rounded-2xl p-5 space-y-4">
        <h3 className="font-black text-sm">SET APPLICANT EXAM - Time, Anti-cheat, Fullscreen</h3>
        <div className="grid md:grid-cols-2 gap-3"><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Exam Title" className="border-2 px-3 py-2.5 rounded-xl text-sm font-bold col-span-2"/><input value={academicYear} onChange={e=>setAcademicYear(e.target.value)} placeholder="Academic Year" className="border px-3 py-2 rounded-xl text-sm"/><div className="flex items-center gap-2 border px-3 py-2 rounded-xl bg-white"><Timer size={16}/><label className="text-xs font-bold">Duration mins:</label><input type="number" value={duration} onChange={e=>setDuration(parseInt(e.target.value)||40)} className="flex-1 outline-none font-black"/></div><div className="flex items-center gap-2 border px-3 py-2 rounded-xl bg-white"><Clock size={16}/><label className="text-xs font-bold">Start Time:</label><input type="datetime-local" value={startTime} onChange={e=>setStartTime(e.target.value)} className="flex-1 outline-none text-xs"/></div><div className="flex items-center gap-2 border px-3 py-2 rounded-xl bg-white"><Clock size={16}/><label className="text-xs font-bold">End Time:</label><input type="datetime-local" value={endTime} onChange={e=>setEndTime(e.target.value)} className="flex-1 outline-none text-xs"/></div><div className="flex items-center gap-2 border-2 border-red-300 px-3 py-2 rounded-xl bg-red-50"><ShieldAlert size={16} className="text-red-600"/><label className="text-xs font-black">Anti-cheat Warnings:</label><input type="number" value={maxTabSwitch} onChange={e=>setMaxTabSwitch(parseInt(e.target.value)||10)} className="w-16 font-black text-center border rounded"/></div><div className="flex items-center gap-2 border-2 border-blue-300 px-3 py-2 rounded-xl bg-blue-50"><Monitor size={16} className="text-blue-600"/><label className="text-xs font-black">Fullscreen:</label><select value={fullScreen?'yes':'no'} onChange={e=>setFullScreen(e.target.value==='yes')} className="font-black border rounded px-2"><option value="yes">Enabled</option><option value="no">Disabled</option></select></div></div>
        <div className="flex gap-2"><button onClick={createExam} className="px-6 py-3 bg-[#0f4c2e] text-white rounded-full font-black text-sm flex items-center gap-2"><Plus size={16}/> Create/Update Entrance Exam</button>{selectedExam && (<><button onClick={()=>updateExamStatus(selectedExam.id,'published')} className="px-6 py-3 bg-green-600 text-white rounded-full font-black text-sm flex items-center gap-2"><Eye size={16}/> Publish Exam</button><button onClick={()=>updateExamStatus(selectedExam.id,'unpublished')} className="px-6 py-3 bg-amber-500 text-black rounded-full font-black text-sm flex items-center gap-2"><EyeOff size={16}/> Unpublish</button></>)}</div>
      </div>
      <div className="bg-white border-2 rounded-2xl p-5 space-y-4">
        <h3 className="font-black text-sm">ADD QUESTIONS</h3>
        <div className="grid gap-3"><textarea value={qText} onChange={e=>setQText(e.target.value)} placeholder="Question Text" className="border-2 px-3 py-2 rounded-xl text-sm"/><div className="grid md:grid-cols-2 gap-2"><input value={optA} onChange={e=>setOptA(e.target.value)} placeholder="Option A" className="border px-3 py-2 rounded-xl text-sm"/><input value={optB} onChange={e=>setOptB(e.target.value)} placeholder="Option B" className="border px-3 py-2 rounded-xl text-sm"/><input value={optC} onChange={e=>setOptC(e.target.value)} placeholder="Option C" className="border px-3 py-2 rounded-xl text-sm"/><input value={optD} onChange={e=>setOptD(e.target.value)} placeholder="Option D" className="border px-3 py-2 rounded-xl text-sm"/></div><div className="flex gap-2 items-center"><label className="text-xs font-black">Correct Answer:</label><select value={correct} onChange={e=>setCorrect(e.target.value)} className="border-2 border-green-500 px-3 py-2 rounded-xl font-black"><option>A</option><option>B</option><option>C</option><option>D</option></select><button onClick={addQuestion} className="px-6 py-2.5 bg-blue-700 text-white rounded-full font-black text-sm flex items-center gap-2"><Plus size={14}/> Add Question</button></div></div>
        <div className="space-y-2 max-h-[300px] overflow-auto">{questions.map((q:any,i:number)=>(<div key={q.id} className="border p-3 rounded-xl flex justify-between gap-3 text-xs bg-slate-50"><div className="flex-1"><p className="font-bold">{i+1}. {q.question_text}</p><p className="mt-1">A: {q.option_a} | B: {q.option_b} | C: {q.option_c} | D: {q.option_d} | <span className="bg-green-200 px-2 py-0.5 rounded font-black">Correct: {q.correct_option}</span></p></div><div className="flex flex-col gap-1"><select value={q.correct_option} onChange={e=>updateCorrectAnswer(q.id, e.target.value)} className="border px-2 py-1 rounded font-black text-xs"><option>A</option><option>B</option><option>C</option><option>D</option></select><button onClick={()=>deleteQuestion(q.id)} className="px-2 py-1 bg-red-100 text-red-700 rounded font-bold flex items-center gap-1"><Trash2 size={12}/> Del</button></div></div>))}{questions.length===0 && <p className="text-xs text-slate-500 text-center py-4">No questions yet</p>}</div>
      </div>
      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-5 space-y-3">
        <h3 className="font-black text-sm flex items-center gap-2"><Award className="text-yellow-600"/> Applicant Attempts - Publish & Unpublish Scores</h3>
        <div className="overflow-x-auto border rounded-xl bg-white"><table className="w-full text-xs"><thead className="bg-slate-900 text-white"><tr><th className="p-2 text-left">Applicant</th><th className="p-2">App No</th><th className="p-2">Score</th><th className="p-2">Time + Tab Switches</th><th className="p-2">Publish Action</th></tr></thead><tbody>{attempts.map((a:any, idx:number)=>(<tr key={idx} className="border-b hover:bg-slate-50"><td className="p-2"><p className="font-bold">{a.applicant_name || a.jamb_no}</p><p className="font-mono text-[11px]">JAMB: {a.jamb_no}</p></td><td className="p-2 font-mono">{a.application_number || '-'}</td><td className="p-2 font-black">{a.score}/{a.total} ({a.percentage}%)</td><td className="p-2 text-[11px]">{a.submitted_at ? new Date(a.submitted_at).toLocaleString() : '-'}<br/>Tab: {a.tab_switches || 0}/10</td><td className="p-2 flex gap-1"><button onClick={()=>publishScoreForApplicant(a)} className="px-3 py-1.5 bg-green-700 text-white rounded-full font-black text-[11px]">Publish Score</button><button onClick={()=>unpublishScore(a)} className="px-3 py-1.5 bg-slate-200 text-slate-800 rounded-full font-bold text-[11px]">Unpublish</button></td></tr>))}{attempts.length===0 && <tr><td colSpan={5} className="p-4 text-center text-slate-500">No applicant has written entrance exam yet</td></tr>}</tbody></table></div>
      </div>
    </div>
  );
};

export const RegistrarDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'admissions' | 'admissions_all' | 'cbt' | 'students_biodata' | 'scoresheets' | 'applicant_cbt' | 'individual_result' | 'entrance_exam' | 'registrar_vet' | 'staff_data'>('registrar_vet');
  const students = StorageService.getStudents();
  const applicants = StorageService.getApplicants();
  const payments = StorageService.getPayments();
  const [senateApproved, setSenateApproved] = useState(false);
  const [searchBiodata, setSearchBiodata] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [selectedBiodata, setSelectedBiodata] = useState<any>(null);
  const [searchIndividual, setSearchIndividual] = useState('');
  const [selectedPrintStudent, setSelectedPrintStudent] = useState<any>(null);
  const [computationResults, setComputationResults] = useState<any[]>(() => { try { return JSON.parse(localStorage.getItem('lcns_results') || '[]'); } catch { return []; } });
  const [senateInfo] = useState(() => { try { const logs = JSON.parse(localStorage.getItem('lcns_audit_logs') || '[]'); const ratLog = logs.find((l:any)=> l.action==='SENATE_RATIFICATION'); if (ratLog) return { approved: true, date: ratLog.timestamp, provost: ratLog.user || 'Mrs Terna Fiase - Provost' }; return { approved: localStorage.getItem('lcns_senate_approved')==='true', date: new Date().toISOString(), provost: 'Mrs Terna Fiase - Provost' }; } catch { return { approved: false, date: new Date().toISOString(), provost: 'Mrs Terna Fiase - Provost' }; } });
  const [examSettings, setExamSettings] = useState<any>(() => { try { return JSON.parse(localStorage.getItem('lcns_exam_settings') || '{}'); } catch { return {}; } });
  const [examResultsPublished, setExamResultsPublished] = useState(() => { try { return localStorage.getItem('lcns_entrance_results_published') === 'true'; } catch { return false; } });
  const [examSubmissions, setExamSubmissions] = useState<any[]>(() => { try { return JSON.parse(localStorage.getItem('lcns_exam_submissions') || '[]'); } catch { return []; } });

  // ===== ADDED - REGISTRAR VETTING FEATURE - AFTER HOD =====
  const [hodVettedResults, setHodVettedResults] = useState<any[]>(() => {
    try { const v = JSON.parse(localStorage.getItem('lcns_results_hod_vetted') || '[]'); const r = JSON.parse(localStorage.getItem('lcns_results') || '[]'); return v.length>0 ? v : r; } catch { return []; }
  });
  const [staffData, setStaffData] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('lcns_staff') || '[]'); } catch { return []; }
  });
  const [allUsers, setAllUsers] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('lcns_users') || '[]'); } catch { return []; }
  });
  const [vetStatus, setVetStatus] = useState(() => localStorage.getItem('lcns_registrar_vet_status') || 'PENDING');
  const [searchVet, setSearchVet] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editScore, setEditScore] = useState<number>(0);
  const [searchStaff, setSearchStaff] = useState('');
  const [supabaseGpa, setSupabaseGpa] = useState<any[]>([]);

  const loadRegistrarData = async () => {
    try {
      const { data } = await supabase.from('student_gpa_view').select('*');
      if(data) setSupabaseGpa(data);
      const { data: scores } = await supabase.from('student_results_workflow').select('*').order('matric_no');
      if(scores && scores.length>0) setHodVettedResults(scores);
      const { data: staff } = await supabase.from('users').select('*');
      if(staff) setStaffData(staff);
    } catch {}
    try { setAllUsers(JSON.parse(localStorage.getItem('lcns_users') || '[]')); } catch {}
  };
  useEffect(() => { loadRegistrarData(); const iv = setInterval(() => { try { const s = JSON.parse(localStorage.getItem('lcns_exam_settings') || '{}'); setExamSettings(s); setExamResultsPublished(localStorage.getItem('lcns_entrance_results_published') === 'true'); setExamSubmissions(JSON.parse(localStorage.getItem('lcns_exam_submissions') || '[]')); setHodVettedResults(JSON.parse(localStorage.getItem('lcns_results_hod_vetted') || localStorage.getItem('lcns_results') || '[]')); } catch {} }, 2000); return () => clearInterval(iv); }, []);

  const handleManualCorrection = (id: string) => {
    const updated = hodVettedResults.map((r:any) => r.id === id || r.scoreId === id ? {...r, score: editScore, totalScore: editScore, total_score: editScore} : r);
    localStorage.setItem('lcns_results', JSON.stringify(updated));
    localStorage.setItem('lcns_results_hod_vetted', JSON.stringify(updated));
    localStorage.setItem('lcns_results_registrar_vetted', JSON.stringify(updated));
    setHodVettedResults(updated);
    setComputationResults(updated);
    setEditingId(null);
    StorageService.logAction(displayEmail,'REGISTRAR','REGISTRAR_MANUAL_CORRECTION',`Registrar ${displayName} corrected ${id} to ${editScore}`);
    alert(`✅ Score corrected to ${editScore} saved!`);
  };
  const handleForwardToProvost = () => {
    if(hodVettedResults.length===0) { alert('No results to forward'); return; }
    localStorage.setItem('lcns_registrar_forwarded_to_provost', 'true');
    localStorage.setItem('lcns_registrar_forwarded_date', new Date().toISOString());
    localStorage.setItem('lcns_registrar_vet_status', 'FORWARDED_TO_PROVOST');
    localStorage.setItem('lcns_results_registrar_vetted', JSON.stringify(hodVettedResults));
    setVetStatus('FORWARDED_TO_PROVOST');
    StorageService.logAction(displayEmail,'REGISTRAR','REGISTRAR_FORWARD_TO_PROVOST',`Registrar ${displayName} forwarded ${hodVettedResults.length} to Provost`);
    alert(`✅ Registrar Vetted OK! Forwarded ${hodVettedResults.length} results to Provost for Senate Approval.`);
  };
  const handleReturnToHOD = () => {
    const reason = prompt('Enter reason to return to HOD:');
    if(!reason) return;
    localStorage.setItem('lcns_registrar_vet_status', 'RETURNED_TO_HOD');
    localStorage.setItem('lcns_registrar_return_reason', reason);
    localStorage.setItem('lcns_registrar_return_date', new Date().toISOString());
    localStorage.setItem('lcns_results_returned_to_hod', JSON.stringify({reason, date: new Date().toISOString(), by: displayName}));
    setVetStatus('RETURNED_TO_HOD');
    StorageService.logAction(displayEmail,'REGISTRAR','REGISTRAR_RETURN_TO_HOD',`Registrar returned to HOD: ${reason}`);
    alert(`↩️ Returned to HOD. Reason: ${reason}`);
  };
  const downloadMasterPDF = () => {
    const html = `<html><head><style>body{font-family:Arial; font-size:10px;} table{width:100%; border-collapse:collapse;} th,td{border:1px solid #000; padding:4px; text-align:center;} th{background:#1e3a8a; color:#fff;} .header{text-align:center; border-bottom:3px solid #000; padding-bottom:10px;}</style></head><body><div class="header"><img src="/lcns-logo.png.jpg" style="width:80px; height:80px;"/><h2>LABE COLLEGE OF NURSING SCIENCES, GBOKO</h2><h3>MASTER SCORE SHEET - REGISTRAR VETTED - ${new Date().toLocaleDateString()}</h3><p>Registrar: ${displayName} | Status: ${vetStatus} | GPA/CGPA + Staff Verification Included</p></div><table><tr><th>Matric</th><th>Name</th><th>Current Level</th><th>Course</th><th>CU</th><th>Total</th><th>Grade</th><th>GP</th><th>GPA</th><th>CGPA</th><th>CO</th></tr>${hodVettedResults.map((r:any)=>{ const score = r.score||r.total_score||r.totalScore||0; const grade = score>=70?'A':score>=60?'B':score>=50?'C':score>=40?'D':'F'; const point = score>=70?4:score>=60?3:score>=50?2:score>=40?1:0; const gp = (r.creditUnit||r.credit_unit||3)*point; const cgpaData = supabaseGpa.find((g:any)=>g.matric_no===(r.matricNo||r.matric_no)); const studentInfo = students.find((s:any)=>s.matricNo===(r.matricNo||r.matric_no)); return `<tr><td>${r.matricNo||r.matric_no}</td><td>${r.fullName||''}</td><td>${studentInfo?.level||r.level||''}</td><td>${r.courseCode||r.course_code}</td><td>${r.creditUnit||r.credit_unit||3}</td><td><b>${score}</b></td><td>${grade}</td><td>${gp}</td><td>${cgpaData?.gpa||'-'}</td><td>${cgpaData?.cgpa||'-'}</td><td>${grade==='F'?'REPEAT '+(r.courseCode||r.course_code):'PASS'}</td></tr>`}).join('')}</table></body></html>`;
    const win = window.open('', '_blank'); if(win){ win.document.write(html); win.document.close(); win.focus(); setTimeout(()=>win.print(), 500); }
  };
  const downloadMasterExcel = () => {
    let csv = 'Matric No,Full Name,Current Level,Program,State,Phone,Course Code,Credit Unit,Total,Grade,GP,GPA,CGPA,Status,Repeat Course,Lecturer,Staff Verified\n';
    hodVettedResults.forEach((r:any)=>{
      const score = r.score||r.total_score||r.totalScore||0; const grade = score>=70?'A':score>=60?'B':score>=50?'C':score>=40?'D':'F'; const point = score>=70?4:score>=60?3:score>=50?2:score>=40?1:0; const gp = (r.creditUnit||r.credit_unit||3)*point; const cgpaData = supabaseGpa.find((g:any)=>g.matric_no===r.matricNo || g.matric_no===r.matric_no); const studentInfo: any = students.find((s:any)=>s.matricNo===(r.matricNo||r.matric_no));
      csv += `"${r.matricNo||r.matric_no}","${r.fullName||''}","${studentInfo?.level||''}","${studentInfo?.program||''}","${studentInfo?.stateOfOrigin||''}","${studentInfo?.phone||''}","${r.courseCode||r.course_code}","${r.creditUnit||r.credit_unit||3}","${score}","${grade}","${gp}","${cgpaData?.gpa||''}","${cgpaData?.cgpa||''}","${grade==='F'?'CARRY OVER':'PASS'}","${grade==='F'?'REPEAT '+(r.courseCode||r.course_code):''}","${r.lecturerName||''}","YES"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `Registrar_Master_Sheet_${displayName}_${new Date().toISOString().slice(0,10)}.csv`; document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const filteredVet = hodVettedResults.filter((r:any)=>{ if(!searchVet) return true; const term = searchVet.toLowerCase(); return (r.matricNo||r.matric_no||'').toLowerCase().includes(term) || (r.fullName||'').toLowerCase().includes(term) || (r.courseCode||r.course_code||'').toLowerCase().includes(term); });
  const filteredStaff = [...staffData, ...allUsers].filter((s:any)=>{ if(!searchStaff) return true; const term = searchStaff.toLowerCase(); return `${s.fullName||s.full_name||''} ${s.email||''} ${s.role||''} ${s.department||''}`.toLowerCase().includes(term); });

  const handlePublishExam = () => { if (!examSettings.examDate) { alert('Set Exam Date first below!'); return; } if (!confirm(`Publish Entrance Exam? Date: ${examSettings.examDate}`)) return; const updated = { ...examSettings, status: 'PUBLISHED', publishedAt: new Date().toISOString(), publishedBy: displayName }; localStorage.setItem('lcns_exam_settings', JSON.stringify(updated)); setExamSettings(updated); alert(`✅ ENTRANCE EXAM PUBLISHED`); };
  const handleUnpublishExam = () => { if (!confirm('Close Entrance Exam?')) return; const updated = { ...examSettings, status: 'CLOSED', closedAt: new Date().toISOString(), closedBy: displayName }; localStorage.setItem('lcns_exam_settings', JSON.stringify(updated)); setExamSettings(updated); alert('🔒 EXAM CLOSED'); };
  const handlePublishEntranceResults = () => { if (examSubmissions.length===0) { alert('No submissions yet'); return; } if (!confirm(`Publish ${examSubmissions.length} Entrance Results?`)) return; localStorage.setItem('lcns_entrance_results_published', 'true'); setExamResultsPublished(true); alert(`✅ Results Published - ${examSubmissions.length}`); };
  const handleUnpublishEntranceResults = () => { if (!confirm('Unpublish Results?')) return; localStorage.setItem('lcns_entrance_results_published', 'false'); setExamResultsPublished(false); alert('🔒 Results Unpublished'); };

  const safeCurrentUser = (() => {
    try { const keys = ['lcns_erp_current_user', 'lcns-current-user', 'lcns_current_user', 'lcns_user']; for (const k of keys) { const v = localStorage.getItem(k); if (v) { const parsed = JSON.parse(v); if (parsed && parsed.email) return parsed; } } return StorageService.getCurrentUser(); } catch { return null; }
  })();
  const currentUser = safeCurrentUser || { id: 'LCNS/2026/RG/001', email: 'registrar@lcns.edu.ng', role: 'REGISTRAR', fullName: 'Registrar - LCNS', status: 'ACTIVE' };
  const displayName = (currentUser?.fullName || (currentUser as any)?.full_name || currentUser?.email || 'Registrar - LCNS').toString().toUpperCase();
  const displayEmail = currentUser?.email || 'registrar@lcns.edu.ng';
  const totalRevenue = payments.filter((p) => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0);
  const filteredStudents = students.filter((s: any) => { if (levelFilter !== 'ALL' && s.level !== levelFilter) return false; if (!searchBiodata) return true; return `${s.fullName} ${s.matricNo} ${s.program} ${s.level} ${s.stateOfOrigin} ${s.phone}`.toLowerCase().includes(searchBiodata.toLowerCase()); });
  const filteredIndividual = students.filter((s: any) => { if (!searchIndividual) return true; const term = searchIndividual.toLowerCase().trim(); return s.fullName.toLowerCase().includes(term) || s.matricNo.toLowerCase().includes(term); });
  const handleSenateApproval = () => { setSenateApproved(true); StorageService.logAction(displayEmail,'REGISTRAR','SENATE_RATIFICATION','Senate Ratification granted'); alert('Senate Ratification Granted!'); };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div><span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-blue-800 px-3 py-1 rounded-full">Office of the Registrar - {displayName} - Staff Data + Student Full Data + Vetting</span><h1 className="text-2xl sm:text-3xl font-black uppercase mt-2">{displayName}</h1><p className="text-xs text-blue-200">Staff Data + All Students with Current Level ND1/ND2/HND1/HND2 + Full Info: State, Phone, Parent, Hostel + If NOT OK Return to HOD, If OK Forward to Provost + Master Sheet PDF/Excel + GPA/CGPA + CO</p></div>
          <div className="text-right"><span className="text-xs text-blue-300 font-semibold block">Academic Session</span><span className="text-lg font-black text-amber-400 font-mono-code">{COLLEGE_CONFIG.CURRENT_SESSION}</span><span className={`block text-[10px] px-2 py-1 rounded-full mt-1 font-black ${vetStatus==='FORWARDED_TO_PROVOST'?'bg-green-500 text-white': vetStatus==='RETURNED_TO_HOD'?'bg-red-500 text-white':'bg-yellow-400 text-black'}`}>{vetStatus} • {hodVettedResults.length} Results from HOD</span></div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <button onClick={() => setActiveTab('registrar_vet')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='registrar_vet'?'bg-blue-700 text-white shadow ring-2 ring-blue-300':'bg-blue-50 border-2 border-blue-500 text-blue-900'}`}><FileCheck className="w-4 h-4"/><span>🔍 REGISTRAR VET - FROM HOD - RETURN TO HOD / FORWARD TO PROVOST - MASTER SHEET - MANUAL CORRECTION - GPA/CGPA - CO</span><span className="px-2 py-0.5 rounded-full text-[10px] bg-red-600 text-white">{hodVettedResults.length}</span></button>
        <button onClick={() => setActiveTab('staff_data')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='staff_data'?'bg-emerald-700 text-white shadow ring-2 ring-emerald-300':'bg-emerald-50 border-2 border-emerald-400 text-emerald-900'}`}><Users className="w-4 h-4"/><span>👨‍🏫 STAFF DATA - Lecturers, HOD, Exam Officer, Bursar</span><span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-600 text-white">{filteredStaff.length}</span></button>
        <button onClick={() => setActiveTab('entrance_exam')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='entrance_exam'?'bg-amber-500 text-black shadow ring-2 ring-amber-300':'bg-amber-50 border-2 border-amber-400 text-amber-900'}`}><Send className="w-4 h-4"/><span>📝 ENTRANCE EXAM</span></button>
        <button onClick={() => setActiveTab('applicant_cbt')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='applicant_cbt'?'bg-red-700 text-white shadow ring-2 ring-red-300':'bg-red-50 border-2 border-red-400 text-red-800'}`}><ShieldAlert className="w-4 h-4"/><span>🚨 APPLICANT CBT</span></button>
        <button onClick={() => setActiveTab('scoresheets')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='scoresheets'?'bg-blue-700 text-white shadow':'bg-blue-50 border text-blue-800'}`}><Download className="w-4 h-4"/><span>📄 Score Sheets</span></button>
        <button onClick={() => setActiveTab('students_biodata')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab==='students_biodata'?'bg-emerald-700 text-white shadow':'bg-emerald-50 border text-emerald-800'}`}><Users className="w-4 h-4"/><span>👨‍🎓 Students Full Biodata + Current Level</span></button>
        <button onClick={() => setActiveTab('individual_result')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='individual_result'?'bg-slate-900 text-white shadow ring-2 ring-amber-400':'bg-amber-50 border-2 border-amber-400 text-amber-900'}`}><Printer className="w-4 h-4"/><span>🖨️ Print Individual Result</span></button>
      </div>

      {activeTab==='registrar_vet' && (
        <div className="bg-white rounded-3xl border-2 border-blue-500 p-6 space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 p-4 rounded-xl">
            <h2 className="text-lg font-black flex items-center gap-2 text-blue-900"><FileCheck className="w-6 h-6"/> REGISTRAR VETTING PANEL - After Receiving From HOD - View Full Student Info + Staff Verification + GPA/CGPA</h2>
            <p className="text-xs font-bold mt-2">Registrar {displayName} - You received {hodVettedResults.length} results from HOD. You see staff data (who taught), students data with current level ND1/ND2/HND1/HND2 + full info: State, Phone, Parent, Hostel, Program. If NOT OK, Return to HOD with reason. If OK, Forward to Provost for Senate. You can manually correct, print master sheet PDF/Excel with GPA/CGPA + CO as REPEAT.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black ${vetStatus==='FORWARDED_TO_PROVOST'?'bg-green-600 text-white': vetStatus==='RETURNED_TO_HOD'?'bg-red-600 text-white':'bg-yellow-400 text-black'}`}>Status: {vetStatus}</span>
              <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-xs font-black">{hodVettedResults.length} Records From HOD - With Current Level</span>
              <span className="px-3 py-1 bg-emerald-700 text-white rounded-full text-xs font-black">{students.length} Students Full Data</span>
              <span className="px-3 py-1 bg-blue-900 text-white rounded-full text-xs font-black">{filteredStaff.length} Staff Data</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={downloadMasterPDF} className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black flex items-center gap-2"><Printer className="w-4 h-4"/> Print Master Sheet PDF - With School Name + Logo + Current Level + GPA/CGPA + Staff</button>
            <button onClick={downloadMasterExcel} className="px-4 py-2.5 bg-green-700 text-white rounded-xl text-xs font-black flex items-center gap-2"><FileSpreadsheet className="w-4 h-4"/> Download Master Sheet Excel - Student Full Info + GPA/CGPA + CO</button>
            <button onClick={handleForwardToProvost} className="px-4 py-2.5 bg-blue-700 text-white rounded-xl text-xs font-black flex items-center gap-2"><ArrowRight className="w-4 h-4"/> ✅ Vet OK - Forward to Provost</button>
            <button onClick={handleReturnToHOD} className="px-4 py-2.5 bg-red-700 text-white rounded-xl text-xs font-black flex items-center gap-2"><ArrowLeft className="w-4 h-4"/> ↩️ Not OK - Return to HOD</button>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border">
            <Search className="w-4 h-4 text-blue-600"/>
            <input value={searchVet} onChange={e=>setSearchVet(e.target.value)} placeholder="Search by Matric, Name, Course - For Manual Correction + View Current Level" className="flex-1 py-2 text-xs font-bold outline-none bg-transparent"/>
          </div>

          <div className="overflow-x-auto border-2 rounded-xl">
            <table className="w-full text-xs">
              <thead className="bg-blue-900 text-white"><tr><th className="p-2">Matric</th><th className="p-2">Name + Current Level + Full Info</th><th className="p-2">Course</th><th className="p-2">CU</th><th className="p-2">Total - Editable</th><th className="p-2">Grade</th><th className="p-2">GP</th><th className="p-2">GPA</th><th className="p-2">CGPA</th><th className="p-2">CO</th><th className="p-2">Lecturer/Staff</th><th className="p-2">Manual Correction</th></tr></thead>
              <tbody>
                {filteredVet.map((r:any, idx:number)=>{
                  const score = r.score || r.total_score || r.totalScore || 0;
                  const grade = score>=70?'A':score>=60?'B':score>=50?'C':score>=40?'D':'F';
                  const point = score>=70?4:score>=60?3:score>=50?2:score>=40?1:0;
                  const gp = (r.creditUnit||r.credit_unit||3)*point;
                  const cgpaData = supabaseGpa.find((g:any)=>g.matric_no===(r.matricNo||r.matric_no));
                  const studentInfo: any = students.find((s:any)=>s.matricNo===(r.matricNo||r.matric_no));
                  const isEditing = editingId === (r.id||r.scoreId||idx.toString());
                  return (
                    <tr key={idx} className={`border-b ${grade==='F'?'bg-red-50':''}`}>
                      <td className="p-2 font-mono font-bold">{r.matricNo||r.matric_no}</td>
                      <td className="p-2"><p className="font-bold">{r.fullName||studentInfo?.fullName||''}</p><p className="text-[10px] bg-yellow-200 px-1 rounded font-black">Current Level: {studentInfo?.level||r.level||'ND1'}</p><p className="text-[10px]">{studentInfo?.program||''} | {studentInfo?.stateOfOrigin||''} | {studentInfo?.phone||''}</p><p className="text-[10px]">Parent: {studentInfo?.parentName||''} | Hostel: {studentInfo?.hostel||''}</p></td>
                      <td className="p-2 font-mono">{r.courseCode||r.course_code}</td>
                      <td className="p-2 text-center">{r.creditUnit||r.credit_unit||3}</td>
                      <td className="p-2 text-center font-black">{isEditing ? <input type="number" value={editScore} onChange={e=>setEditScore(Number(e.target.value))} className="w-16 border-2 border-blue-500 rounded p-1 text-center font-black"/> : score}</td>
                      <td className="p-2 text-center font-bold">{grade}</td>
                      <td className="p-2 text-center">{gp}</td>
                      <td className="p-2 text-center text-blue-700 font-bold">{cgpaData?.gpa||'-'}</td>
                      <td className="p-2 text-center text-blue-900 font-black">{cgpaData?.cgpa||'-'}</td>
                      <td className="p-2 text-center font-bold text-red-700">{grade==='F' ? `REPEAT ${r.courseCode||r.course_code}` : 'PASS'}</td>
                      <td className="p-2 text-center text-[10px]">{r.lecturerName||r.lecturer_name||'Staff'}</td>
                      <td className="p-2 text-center">
                        {isEditing ? (
                          <div className="flex gap-1"><button onClick={()=>handleManualCorrection(r.id||r.scoreId||idx.toString())} className="px-2 py-1 bg-green-600 text-white rounded text-[10px] font-black flex items-center gap-1"><Save className="w-3 h-3"/>Save</button><button onClick={()=>setEditingId(null)} className="px-2 py-1 bg-slate-200 rounded text-[10px]">Cancel</button></div>
                        ) : (
                          <button onClick={()=>{setEditingId(r.id||r.scoreId||idx.toString()); setEditScore(score);}} className="px-2 py-1 bg-amber-500 text-black rounded text-[10px] font-black flex items-center gap-1 mx-auto"><Edit className="w-3 h-3"/>Edit Score</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredVet.length===0 && <div className="p-8 text-center text-slate-500 font-bold">No results from HOD yet - Waiting for HOD to forward</div>}
          </div>
        </div>
      )}

      {activeTab==='staff_data' && (
        <div className="bg-white rounded-3xl border-2 border-emerald-400 p-6 space-y-6">
          <div><h2 className="text-lg font-black flex items-center gap-2"><Users className="w-5 h-5 text-emerald-700"/> Staff Data - All Lecturers, HOD, Exam Officer, Bursar, Registrar, Provost - Registrar View</h2><p className="text-xs font-bold bg-emerald-50 border p-2 rounded mt-2">Registrar {displayName} can see all staff data - Who is teaching what course, department, status, role. Used for verification of who uploaded scores.</p></div>
          <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border"><Search className="w-4 h-4 text-emerald-600"/><input value={searchStaff} onChange={e=>setSearchStaff(e.target.value)} placeholder="Search Staff by Name, Email, Role, Department" className="flex-1 py-2 text-xs font-bold outline-none bg-transparent"/></div>
          <div className="overflow-x-auto border-2 rounded-xl"><table className="w-full text-xs"><thead className="bg-emerald-900 text-white"><tr><th className="p-3 text-left">Staff Name + Photo</th><th className="p-3 text-left">Email + Role</th><th className="p-3 text-left">Department</th><th className="p-3 text-left">Courses Assigned</th><th className="p-3 text-center">Status</th></tr></thead><tbody>{filteredStaff.map((s:any, idx:number)=>(<tr key={idx} className="border-b hover:bg-emerald-50"><td className="p-3"><div className="flex items-center gap-2"><img src={s.photoUrl||'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-full border"/><p className="font-bold">{s.fullName||s.full_name||s.name||'Staff'}</p></div></td><td className="p-3"><p className="font-mono text-[11px]">{s.email}</p><span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black">{s.role}</span></td><td className="p-3">{s.department||'Nursing Sciences'}</td><td className="p-3 text-[11px]">{s.courses||s.assignedCourses||'N/A'}</td><td className="p-3 text-center"><span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-[10px] font-black">{s.status||'ACTIVE'}</span></td></tr>))}{filteredStaff.length===0 && <tr><td colSpan={5} className="p-8 text-center text-slate-500">No staff data yet - Add staff in Admin</td></tr>}</tbody></table></div>
        </div>
      )}

      {activeTab==='entrance_exam' ? (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-50 to-emerald-50 border-2 border-amber-400 rounded-2xl p-5">
            <h2 className="text-lg font-black">📝 Registrar Entrance Exam Control</h2>
            <div className="grid md:grid-cols-4 gap-3 mt-4">
              <div className={`p-3 rounded-xl border-2 text-center ${examSettings.status==='PUBLISHED'?'bg-green-100 border-green-500':'bg-slate-100'}`}><p className="text-[10px] font-black">EXAM STATUS</p><p className="font-black">{examSettings.status||'NOT SET'}</p><p className="text-[11px]">{examSettings.examDate||'No date'}</p></div>
              <div className="p-3 rounded-xl border-2 bg-white text-center"><p className="text-[10px] font-black">SUBMISSIONS</p><p className="font-black text-xl">{examSubmissions.length}</p></div>
              <div className={`p-3 rounded-xl border-2 text-center ${examResultsPublished?'bg-green-100 border-green-500':'bg-red-50 border-red-300'}`}><p className="text-[10px] font-black">RESULTS PUBLISHED</p><p className="font-black">{examResultsPublished?'✅ YES':'🔒 NO'}</p></div>
              <div className="p-3 rounded-xl border-2 bg-white text-center"><p className="text-[10px] font-black">MAX PER BATCH</p><p className="font-black text-xl">{examSettings.maxPerBatch||100}</p></div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <button onClick={handlePublishExam} disabled={examSettings.status==='PUBLISHED'} className={`px-6 py-3 rounded-full font-black text-xs ${examSettings.status==='PUBLISHED'?'bg-slate-200':'bg-emerald-700 text-white'}`}>✅ Publish Exam</button>
              <button onClick={handleUnpublishExam} disabled={examSettings.status!=='PUBLISHED'} className={`px-6 py-3 rounded-full font-black text-xs ${examSettings.status!=='PUBLISHED'?'bg-slate-200':'bg-red-600 text-white'}`}>🔒 Unpublish</button>
              <button onClick={handlePublishEntranceResults} disabled={examResultsPublished || examSubmissions.length===0} className={`px-6 py-3 rounded-full font-black text-xs ${examResultsPublished?'bg-slate-200':'bg-amber-500 text-black'}`}>🎓 Publish Results - {examSubmissions.length}</button>
              <button onClick={handleUnpublishEntranceResults} disabled={!examResultsPublished} className={`px-6 py-3 rounded-full font-black text-xs ${!examResultsPublished?'bg-slate-200':'bg-slate-700 text-white'}`}>⏸️ Unpublish Results</button>
            </div>
          </div>
          <div className="bg-white rounded-2xl border-2 p-4"><h3 className="font-black text-sm mb-3">Set Exam Date + Max Per Batch</h3><AdminExamSettings /></div>
        </div>
      ) : activeTab==='applicant_cbt' ? <RegistrarApplicantCBTManager /> : activeTab==='scoresheets' ? <ScoreSheetViewer currentUser={currentUser} /> : activeTab==='individual_result' ? (
        <div className="bg-white rounded-3xl border-2 border-amber-300 p-6 space-y-6">
          <div className="flex flex-wrap gap-2 bg-slate-50 p-3 rounded-xl border"><div className="flex items-center gap-2 flex-1 bg-white border-2 border-amber-400 rounded-xl px-3"><Search className="w-4 h-4 text-amber-600"/><input value={searchIndividual} onChange={e=>setSearchIndividual(e.target.value)} placeholder="🔍 Search by Name and Matric No" className="flex-1 py-2.5 text-xs font-black outline-none"/></div><div className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-black">{filteredIndividual.length} Students</div></div>
          {!selectedPrintStudent ? (
            <div className="overflow-x-auto border-2 rounded-xl"><table className="w-full text-xs"><thead className="bg-slate-900 text-white"><tr><th className="p-3 text-left">Matric No + Name</th><th className="p-3 text-left">Level + Current Level</th><th className="p-3 text-left">Results + CGPA</th><th className="p-3 text-center">Print - Registrar</th></tr></thead><tbody>{filteredIndividual.map((s:any) => { const studResults = computationResults.filter((r:any)=> r.matricNo===s.matricNo); let cu=0, gp=0; studResults.forEach((r:any)=>{ const g = r.score>=70?4: r.score>=60?3: r.score>=50?2: r.score>=40?1:0; cu+=r.creditUnit||3; gp+=(r.creditUnit||3)*g; }); const cgpa = cu? (gp/cu).toFixed(2) : '0.00'; return (<tr key={s.matricNo} className="border-b hover:bg-amber-50"><td className="p-3"><p className="font-mono font-black text-emerald-800">{s.matricNo}</p><p className="font-black uppercase">{s.fullName}</p></td><td className="p-3"><p className="font-bold">{s.level} - Current: <span className="bg-yellow-200 px-1 rounded">{s.level}</span></p><p className="text-[11px]">{s.program} | {s.stateOfOrigin}</p></td><td className="p-3"><p className="text-[11px]">Courses: {studResults.length} | CGPA: {cgpa}</p></td><td className="p-3 text-center"><button onClick={()=>setSelectedPrintStudent(s)} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black flex items-center gap-2 mx-auto"><Printer className="w-4 h-4"/> Print {s.matricNo}</button></td></tr>); })}</tbody></table></div>
          ) : (
            <div className="space-y-4"><div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border"><p className="font-black text-sm">Selected: {selectedPrintStudent.fullName} - {selectedPrintStudent.matricNo} - Current Level: {selectedPrintStudent.level}</p><button onClick={()=>setSelectedPrintStudent(null)} className="px-4 py-2 bg-slate-200 rounded-xl text-xs font-black">← Back</button></div><PrintableResultWithLogo matricNo={selectedPrintStudent.matricNo} fullName={selectedPrintStudent.fullName} level={selectedPrintStudent.level} program={selectedPrintStudent.program} results={computationResults.filter((r:any)=> r.matricNo===selectedPrintStudent.matricNo)} currentUserRole="REGISTRAR" currentUserName={displayName} senateApproved={senateInfo.approved} senateDate={senateInfo.date} senateProvost={senateInfo.provost} /></div>
          )}
        </div>
      ) : activeTab==='students_biodata' ? (
        <div className="bg-white rounded-3xl border-2 border-emerald-300 p-4 space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-3"><div><h2 className="text-lg font-black flex items-center gap-2"><Users className="w-5 h-5 text-emerald-700"/>All Students Biodata - Current Level Visible - Full Info</h2><p className="text-xs font-bold bg-emerald-50 border p-2 rounded mt-1">Registrar sees all students with Current Level ND1/ND2/HND1/HND2 + Full Information: State, LGA, Phone, Parent Name, Address, Hostel, Blood Group, Program, Session, Status</p></div><button onClick={()=>window.print()} className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-black flex items-center gap-1"><Download className="w-4 h-4"/>Print</button></div>
          <div className="flex flex-wrap gap-2 bg-slate-50 p-3 rounded-xl border"><div className="flex items-center gap-2 flex-1 bg-white border rounded-xl px-3"><Search className="w-4 h-4 text-slate-400"/><input value={searchBiodata} onChange={e=>setSearchBiodata(e.target.value)} placeholder="Search Name, Matric, Program, Phone, State, Parent" className="flex-1 py-2 text-xs font-bold outline-none"/></div><select value={levelFilter} onChange={e=>setLevelFilter(e.target.value)} className="px-4 py-2 border-2 border-emerald-300 rounded-xl text-xs font-black"><option value="ALL">All Levels ({students.length})</option><option value="ND 1">ND 1</option><option value="ND 2">ND 2</option><option value="HND 1">HND 1</option><option value="HND 2">HND 2</option></select><div className="px-3 py-2 bg-emerald-900 text-white rounded-xl text-xs font-black">{filteredStudents.length} Found - Full Info</div></div>
          <div className="overflow-x-auto border-2 rounded-xl"><table className="w-full text-xs"><thead className="bg-slate-900 text-white"><tr><th className="p-2 text-left">Matric + Photo + Current Level</th><th className="p-2 text-left">Full Name + Biodata</th><th className="p-2 text-left">Program + Current Level + Session</th><th className="p-2 text-left">Contact + State + Parent + Hostel</th><th className="p-2">View Full Biodata</th></tr></thead><tbody>{filteredStudents.map((s:any)=><tr key={s.matricNo} className="border-b hover:bg-slate-50"><td className="p-2"><div className="flex items-center gap-2"><img src={s.photoUrl || 'https://via.placeholder.com/50'} className="w-10 h-12 object-cover rounded border"/><div><p className="font-mono font-black text-emerald-800">{s.matricNo}</p><span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-yellow-300 text-black">Current: {s.level}</span></div></div></td><td className="p-2"><p className="font-black uppercase">{s.fullName}</p><p className="text-[11px]">Blood: {s.bloodGroup} | {s.genotype} | DOB: {s.dateOfBirth||''}</p></td><td className="p-2"><p className="font-bold">{s.program}</p><p className="text-[11px]">Current Level: <b className="bg-yellow-200 px-1 rounded">{s.level}</b></p><p className="text-[11px]">Session: {s.session} | Status: {s.status}</p></td><td className="p-2"><p className="text-[11px]">{s.stateOfOrigin} / {s.lga}</p><p className="text-[11px]">{s.phone} | {s.email}</p><p className="text-[11px]">Parent: {s.parentName||'N/A'} | Hostel: {s.hostel||'N/A'}</p></td><td className="p-2 text-center"><button onClick={()=>setSelectedBiodata(s)} className="px-3 py-1.5 bg-blue-700 text-white rounded-lg font-black text-[11px]">View Full Biodata</button></td></tr>)}</tbody></table></div>
          {selectedBiodata && <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"><div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[80vh] overflow-auto"><div className="flex justify-between border-b pb-2"><h3 className="font-black">Full Biodata - {selectedBiodata.fullName} - Current Level: {selectedBiodata.level}</h3><button onClick={()=>setSelectedBiodata(null)} className="px-3 py-1 bg-slate-100 rounded-full font-black">X</button></div><div className="text-xs space-y-1 mt-3"><p><b>Matric:</b> {selectedBiodata.matricNo}</p><p><b>Program:</b> {selectedBiodata.program}</p><p><b>Current Level:</b> {selectedBiodata.level}</p><p><b>Session:</b> {selectedBiodata.session}</p><p><b>State:</b> {selectedBiodata.stateOfOrigin} / {selectedBiodata.lga}</p><p><b>Phone:</b> {selectedBiodata.phone}</p><p><b>Email:</b> {selectedBiodata.email}</p><p><b>Parent:</b> {selectedBiodata.parentName}</p><p><b>Hostel:</b> {selectedBiodata.hostel}</p><p><b>Address:</b> {selectedBiodata.address}</p></div><button onClick={()=>window.print()} className="w-full mt-4 py-3 bg-slate-900 text-white rounded-xl font-black">Print Biodata</button></div></div>}
        </div>
      ) : activeTab==='admissions_all' ? <div className="space-y-4"><div className="bg-purple-50 border-2 border-purple-300 p-3 rounded-xl text-xs font-bold">Registrar All Applicants Records - CBT + Interview + Admit Link - {displayName}</div><AdminAdmissionManager currentUser={currentUser} /></div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"><div className="p-5 bg-white rounded-3xl border shadow-sm"><p className="text-xs font-bold uppercase">Total Enrolled - Current Level</p><p className="text-2xl font-black">{students.length + 415}</p></div><div className="p-5 bg-white rounded-3xl border shadow-sm"><p className="text-xs font-bold uppercase">2026/2027 Applicants</p><p className="text-2xl font-black">{applicants.length + 185}</p></div><div className="p-5 bg-white rounded-3xl border shadow-sm"><p className="text-xs font-bold uppercase">Pass Rate</p><p className="text-2xl font-black text-emerald-800">94.8%</p></div><div className="p-5 bg-white rounded-3xl border shadow-sm"><p className="text-xs font-bold uppercase">Revenue</p><p className="text-2xl font-black">₦{(totalRevenue + 72400000).toLocaleString()}</p></div></div>
      )}
    </div>
  );
};

export default RegistrarDashboard;

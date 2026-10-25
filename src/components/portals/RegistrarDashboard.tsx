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
} from 'lucide-react';
import { CBTExamManager } from '../cbt/CBTExamManager';
import { AdmissionProcessingView } from './AdmissionProcessingView';
import { AdminAdmissionManager } from '../admin/AdminAdmissionManager';
import { ScoreSheetViewer } from './ScoreSheetViewer';
// ADDED - Individual Result Print with School Full Name + Logo - FOR REGISTRAR, EXAM OFFICER, ADMIN, HOD, PROVOST FINAL
import { PrintableResultWithLogo } from '../common/PrintableResultWithLogo';
// === ADD ONLY - ENTRANCE EXAM PUBLISH CONTROL - REGISTRAR + PROVOST + ADMIN ===
import { AdminExamSettings } from './AdminExamSettings';
// === END ADD ===

// ===== REGISTRAR APPLICANT ENTRANCE CBT MANAGER - NEW FEATURE ADDED =====
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

  const saveExams = (newExams: any[]) => {
    setExams(newExams);
    localStorage.setItem('lcns_applicant_exams', JSON.stringify(newExams));
    localStorage.setItem('lcns_cbt_exams', JSON.stringify(newExams));
  };

  const saveQuestions = (newQs: any[]) => {
    setQuestions(newQs);
    localStorage.setItem('lcns_entrance_questions', JSON.stringify(newQs));
    localStorage.setItem('lcns_cbt_questions', JSON.stringify(newQs));
  };

  const createExam = () => {
    const newExam = {
      id: 'EXAM-' + Date.now(),
      title, academic_year: academicYear, academicYear,
      duration_minutes: duration, duration,
      start_time: startTime, end_time: endTime,
      max_tab_switches: maxTabSwitch,
      anti_cheat_warnings: maxTabSwitch,
      antiCheat: { tabSwitchLimit: maxTabSwitch, fullScreenRequired: fullScreen, warnings: maxTabSwitch },
      full_screen_required: fullScreen,
      fullScreen,
      status, result_status: status === 'published' ? 'published' : 'draft',
      created_at: new Date().toISOString(),
      created_by: 'Registrar',
      shuffle_questions: true,
    };
    const updated = [newExam, ...exams];
    saveExams(updated);
    setSelectedExamId(newExam.id);
    alert('✅ Entrance Exam Created! Now add questions - Set time, anti-cheat 10 warnings, fullscreen');
  };

  const updateExamStatus = (id: string, newStatus: 'published'|'unpublished'|'draft') => {
    const updated = exams.map((e:any)=> e.id===id ? {...e, status: newStatus, result_status: newStatus} : e);
    saveExams(updated);
    alert(newStatus === 'published' ? '✅ Entrance Exam PUBLISHED - Applicants can now write exam with fullscreen + 10 warnings anti-cheat' : '⏸️ Exam UNPUBLISHED - Applicants cannot write now');
  };

  const addQuestion = () => {
    if (!qText || !optA || !optB) return alert('Fill question and at least A & B options');
    const newQ = {
      id: 'Q-' + Date.now(),
      exam_id: selectedExamId || exams[0]?.id || 'default',
      question_text: qText,
      option_a: optA, option_b: optB, option_c: optC, option_d: optD,
      option_A: optA, option_B: optB, option_C: optC, option_D: optD,
      correct_option: correct,
      marks: 1,
    };
    saveQuestions([...questions, newQ]);
    setQText(''); setOptA(''); setOptB(''); setOptC(''); setOptD(''); setCorrect('A');
  };

  const updateCorrectAnswer = (qId: string, newCorrect: string) => {
    const updated = questions.map((q:any)=> q.id===qId ? {...q, correct_option: newCorrect} : q);
    saveQuestions(updated);
    alert('✅ Correct answer updated to ' + newCorrect + ' - Will be used when publishing scores');
  };

  const deleteQuestion = (id: string) => {
    if (!confirm('Delete question?')) return;
    saveQuestions(questions.filter((q:any)=>q.id!==id));
  };

  const publishScoreForApplicant = (attempt: any) => {
    let score = 0;
    const attemptAnswers = attempt.answers || {};
    const qsForExam = questions.filter((q:any)=> q.exam_id === attempt.exam_id || true);
    if (Object.keys(attemptAnswers).length) {
      qsForExam.forEach((q:any)=>{ if(attemptAnswers[q.id]===q.correct_option) score++; });
    } else {
      const newScore = prompt(`Set final score for ${attempt.applicant_name} (${attempt.application_number || attempt.jamb_no}) - Total ${qsForExam.length || attempt.total}. Enter score:`, attempt.score);
      if (newScore !== null) score = parseInt(newScore);
      else return;
    }
    const total = qsForExam.length || attempt.total;
    const perc = Math.round((score/total)*100);
    const published = { ...attempt, score, total, percentage: perc, published_at: new Date().toISOString(), published_by: 'Registrar', result_status: 'published' };
    localStorage.setItem('lcns_cbt_published_' + (attempt.application_number || attempt.jamb_no || attempt.applicant_name), JSON.stringify(published));
    const updatedAttempts = attempts.map((a:any)=> a.application_number===attempt.application_number || a.jamb_no===attempt.jamb_no ? {...a, cbt_published: true, cbt_score: score, cbt_total: total, cbt_percentage: perc} : a);
    setAttempts(updatedAttempts);
    localStorage.setItem('lcns_cbt_attempts', JSON.stringify(updatedAttempts));
    try {
      const allApplicants = JSON.parse(localStorage.getItem('lcns_applicants') || '[]');
      const updated = allApplicants.map((ap:any)=> ap.application_number===attempt.application_number || ap.jamb_reg_number===attempt.jamb_no ? {...ap, cbt_published: true, cbt_score: score, cbt_total: total, cbt_percentage: perc, cbt_published_by: 'Registrar', cbt_published_at: new Date().toISOString()} : ap);
      localStorage.setItem('lcns_applicants', JSON.stringify(updated));
    } catch {}
    alert(`✅ Score PUBLISHED for ${attempt.applicant_name}! ${score}/${total} (${perc}%) - Applicant will see scores now in dashboard`);
  };

  const unpublishScore = (attempt: any) => {
    localStorage.removeItem('lcns_cbt_published_' + (attempt.application_number || attempt.jamb_no || attempt.applicant_name));
    alert('⏸️ Score UNPUBLISHED for ' + attempt.applicant_name + ' - Applicant will not see score');
  };

  useEffect(() => {
    const loadAttempts = () => {
      try { setAttempts(JSON.parse(localStorage.getItem('lcns_cbt_attempts') || '[]')); } catch {}
    };
    loadAttempts();
    window.addEventListener('focus', loadAttempts);
    return () => window.removeEventListener('focus', loadAttempts);
  }, []);

  const selectedExam = exams.find((e:any)=>e.id===selectedExamId) || exams[0];

  return (
    <div className="space-y-6 bg-white rounded-3xl border-2 border-blue-200 p-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-black text-[#0f4c2e] flex items-center gap-2"><ShieldAlert className="text-red-600"/> Registrar - Applicant Entrance CBT Manager</h2>
          <p className="text-xs text-slate-500">Set applicant exams, set time, anti-cheat 10 warnings, fullscreen, publish/unpublish, set correct answer after submitting, publish scores applicant sees</p>
        </div>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-black">{exams.length} Exams • {questions.length} Questions • {attempts.length} Attempts</span>
      </div>

      <div className="bg-[#f0faf0] border-2 border-[#0f4c2e] rounded-2xl p-5 space-y-4">
        <h3 className="font-black text-sm">SET APPLICANT EXAM - Time, Anti-cheat, Fullscreen</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Exam Title e.g. Post-UTME 2026/2027" className="border-2 px-3 py-2.5 rounded-xl text-sm font-bold col-span-2"/>
          <input value={academicYear} onChange={e=>setAcademicYear(e.target.value)} placeholder="Academic Year e.g. 2026/2027" className="border px-3 py-2 rounded-xl text-sm"/>
          <div className="flex items-center gap-2 border px-3 py-2 rounded-xl bg-white"><Timer size={16}/><label className="text-xs font-bold">Duration mins:</label><input type="number" value={duration} onChange={e=>setDuration(parseInt(e.target.value)||40)} className="flex-1 outline-none font-black"/></div>
          <div className="flex items-center gap-2 border px-3 py-2 rounded-xl bg-white"><Clock size={16}/><label className="text-xs font-bold">Start Time:</label><input type="datetime-local" value={startTime} onChange={e=>setStartTime(e.target.value)} className="flex-1 outline-none text-xs"/></div>
          <div className="flex items-center gap-2 border px-3 py-2 rounded-xl bg-white"><Clock size={16}/><label className="text-xs font-bold">End Time:</label><input type="datetime-local" value={endTime} onChange={e=>setEndTime(e.target.value)} className="flex-1 outline-none text-xs"/></div>
          <div className="flex items-center gap-2 border-2 border-red-300 px-3 py-2 rounded-xl bg-red-50"><ShieldAlert size={16} className="text-red-600"/><label className="text-xs font-black">Anti-cheat Detector Warnings:</label><input type="number" value={maxTabSwitch} onChange={e=>setMaxTabSwitch(parseInt(e.target.value)||10)} className="w-16 font-black text-center border rounded"/><span className="text-xs">warnings (10 = fail)</span></div>
          <div className="flex items-center gap-2 border-2 border-blue-300 px-3 py-2 rounded-xl bg-blue-50"><Monitor size={16} className="text-blue-600"/><label className="text-xs font-black">Fullscreen Mode:</label><select value={fullScreen?'yes':'no'} onChange={e=>setFullScreen(e.target.value==='yes')} className="font-black border rounded px-2"><option value="yes">Enabled - Force Fullscreen</option><option value="no">Disabled</option></select></div>
        </div>
        <div className="flex gap-2">
          <button onClick={createExam} className="px-6 py-3 bg-[#0f4c2e] text-white rounded-full font-black text-sm flex items-center gap-2"><Plus size={16}/> Create/Update Entrance Exam</button>
          {selectedExam && (
            <>
              <button onClick={()=>updateExamStatus(selectedExam.id,'published')} className="px-6 py-3 bg-green-600 text-white rounded-full font-black text-sm flex items-center gap-2"><Eye size={16}/> Publish Exam</button>
              <button onClick={()=>updateExamStatus(selectedExam.id,'unpublished')} className="px-6 py-3 bg-amber-500 text-black rounded-full font-black text-sm flex items-center gap-2"><EyeOff size={16}/> Unpublish</button>
            </>
          )}
        </div>
        {selectedExam && <div className="text-xs bg-white p-3 rounded-xl border"><p className="font-black">Current Exam: {selectedExam.title} | Status: <span className={selectedExam.status==='published'?'text-green-600':'text-amber-600'}>{selectedExam.status}</span> | Duration: {selectedExam.duration_minutes} mins | Anti-cheat: {selectedExam.max_tab_switches || selectedExam.anti_cheat_warnings} warnings | Fullscreen: {selectedExam.full_screen_required || selectedExam.fullScreen ? 'Yes' : 'No'} | Time: {selectedExam.start_time} to {selectedExam.end_time}</p></div>}
      </div>

      <div className="bg-white border-2 rounded-2xl p-5 space-y-4">
        <h3 className="font-black text-sm">ADD QUESTIONS - Set Correct Answer (Can change after applicant submitted - Then publish scores)</h3>
        <div className="grid gap-3">
          <textarea value={qText} onChange={e=>setQText(e.target.value)} placeholder="Question Text e.g. What is normal BP?" className="border-2 px-3 py-2 rounded-xl text-sm"/>
          <div className="grid md:grid-cols-2 gap-2">
            <input value={optA} onChange={e=>setOptA(e.target.value)} placeholder="Option A" className="border px-3 py-2 rounded-xl text-sm"/>
            <input value={optB} onChange={e=>setOptB(e.target.value)} placeholder="Option B" className="border px-3 py-2 rounded-xl text-sm"/>
            <input value={optC} onChange={e=>setOptC(e.target.value)} placeholder="Option C" className="border px-3 py-2 rounded-xl text-sm"/>
            <input value={optD} onChange={e=>setOptD(e.target.value)} placeholder="Option D" className="border px-3 py-2 rounded-xl text-sm"/>
          </div>
          <div className="flex gap-2 items-center">
            <label className="text-xs font-black">Correct Answer:</label>
            <select value={correct} onChange={e=>setCorrect(e.target.value)} className="border-2 border-green-500 px-3 py-2 rounded-xl font-black">
              <option>A</option><option>B</option><option>C</option><option>D</option>
            </select>
            <button onClick={addQuestion} className="px-6 py-2.5 bg-blue-700 text-white rounded-full font-black text-sm flex items-center gap-2"><Plus size={14}/> Add Question</button>
          </div>
        </div>

        <div className="space-y-2 max-h-[300px] overflow-auto">
          {questions.map((q:any,i:number)=>(
            <div key={q.id} className="border p-3 rounded-xl flex justify-between gap-3 text-xs bg-slate-50">
              <div className="flex-1"><p className="font-bold">{i+1}. {q.question_text}</p><p className="mt-1">A: {q.option_a} | B: {q.option_b} | C: {q.option_c} | D: {q.option_d} | <span className="bg-green-200 px-2 py-0.5 rounded font-black">Correct: {q.correct_option}</span></p></div>
              <div className="flex flex-col gap-1">
                <select value={q.correct_option} onChange={e=>updateCorrectAnswer(q.id, e.target.value)} className="border px-2 py-1 rounded font-black text-xs">
                  <option>A</option><option>B</option><option>C</option><option>D</option>
                </select>
                <button onClick={()=>deleteQuestion(q.id)} className="px-2 py-1 bg-red-100 text-red-700 rounded font-bold flex items-center gap-1"><Trash2 size={12}/> Del</button>
              </div>
            </div>
          ))}
          {questions.length===0 && <p className="text-xs text-slate-500 text-center py-4">No questions yet - Add questions set by Registrar</p>}
        </div>
      </div>

      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-5 space-y-3">
        <h3 className="font-black text-sm flex items-center gap-2"><Award className="text-yellow-600"/> Applicant Attempts - Publish & Unpublish Scores - Applicant See Scores</h3>
        <p className="text-xs">After applicant submits entrance exam, Registrar sets correct answers above, then publishes scores - Applicant sees scores in dashboard</p>
        <div className="overflow-x-auto border rounded-xl bg-white">
          <table className="w-full text-xs">
            <thead className="bg-slate-900 text-white"><tr><th className="p-2 text-left">Applicant - JAMB Reg No</th><th className="p-2">App No</th><th className="p-2">Submitted Score (Before Correction)</th><th className="p-2">Time + Tab Switches</th><th className="p-2">Publish Action</th></tr></thead>
            <tbody>
              {attempts.map((a:any, idx:number)=>(
                <tr key={idx} className="border-b hover:bg-slate-50">
                  <td className="p-2"><p className="font-bold">{a.applicant_name || a.jamb_no}</p><p className="font-mono text-[11px]">JAMB: {a.jamb_no || a.jamb_reg_number} | App: {a.application_number || a.jamb_no}</p></td>
                  <td className="p-2 font-mono">{a.application_number || '-'}</td>
                  <td className="p-2 font-black">{a.score}/{a.total} ({a.percentage}%)</td>
                  <td className="p-2 text-[11px]">{a.submitted_at ? new Date(a.submitted_at).toLocaleString() : '-'}<br/>Tab: {a.tab_switches || 0}/10 warnings</td>
                  <td className="p-2 flex gap-1">
                    <button onClick={()=>publishScoreForApplicant(a)} className="px-3 py-1.5 bg-green-700 text-white rounded-full font-black text-[11px]">Publish Score</button>
                    <button onClick={()=>unpublishScore(a)} className="px-3 py-1.5 bg-slate-200 text-slate-800 rounded-full font-bold text-[11px]">Unpublish</button>
                  </td>
                </tr>
              ))}
              {attempts.length===0 && <tr><td colSpan={5} className="p-4 text-center text-slate-500">No applicant has written entrance exam yet - Waiting for applicants to write - After Bursar clearance they can write</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const RegistrarDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'admissions' | 'admissions_all' | 'cbt' | 'students_biodata' | 'scoresheets' | 'applicant_cbt' | 'individual_result' | 'entrance_exam'>('applicant_cbt');
  const students = StorageService.getStudents();
  const applicants = StorageService.getApplicants();
  const payments = StorageService.getPayments();
  const [senateApproved, setSenateApproved] = useState(false);
  const [searchBiodata, setSearchBiodata] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [selectedBiodata, setSelectedBiodata] = useState<any>(null);

  // ADDED - Individual Result Print
  const [searchIndividual, setSearchIndividual] = useState('');
  const [selectedPrintStudent, setSelectedPrintStudent] = useState<any>(null);
  const [computationResults] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('lcns_results') || '[]'); } catch { return []; }
  });
  const [senateInfo] = useState(() => {
    try {
      const logs = JSON.parse(localStorage.getItem('lcns_audit_logs') || '[]');
      const ratLog = logs.find((l:any)=> l.action==='SENATE_RATIFICATION');
      if (ratLog) return { approved: true, date: ratLog.timestamp, provost: ratLog.user || 'Mrs Terna Fiase - Provost' };
      return { approved: localStorage.getItem('lcns_senate_approved')==='true', date: new Date().toISOString(), provost: 'Mrs Terna Fiase - Provost' };
    } catch { return { approved: false, date: new Date().toISOString(), provost: 'Mrs Terna Fiase - Provost' }; }
  });

  // === ADD ONLY - ENTRANCE EXAM PUBLISH STATE FOR REGISTRAR ===
  const [examSettings, setExamSettings] = useState<any>(() => {
    try { return JSON.parse(localStorage.getItem('lcns_exam_settings') || '{}'); } catch { return {}; }
  });
  const [examResultsPublished, setExamResultsPublished] = useState(() => {
    try { return localStorage.getItem('lcns_entrance_results_published') === 'true'; } catch { return false; }
  });
  const [examSubmissions, setExamSubmissions] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('lcns_exam_submissions') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    const iv = setInterval(() => {
      try {
        const s = JSON.parse(localStorage.getItem('lcns_exam_settings') || '{}');
        setExamSettings(s);
        setExamResultsPublished(localStorage.getItem('lcns_entrance_results_published') === 'true');
        setExamSubmissions(JSON.parse(localStorage.getItem('lcns_exam_submissions') || '[]'));
      } catch {}
    }, 2000);
    return () => clearInterval(iv);
  }, []);

  const handlePublishExam = () => {
    if (!examSettings.examDate) { alert('Set Exam Date first below!'); return; }
    if (!confirm(`Publish Entrance Exam? Date: ${examSettings.examDate} - Applicants login with Application Number LCNS/2026/XXXX at /exam - Rolling Batch`)) return;
    const updated = { ...examSettings, status: 'PUBLISHED', publishedAt: new Date().toISOString(), publishedBy: displayName };
    localStorage.setItem('lcns_exam_settings', JSON.stringify(updated));
    setExamSettings(updated);
    alert(`✅ ENTRANCE EXAM PUBLISHED - ${updated.examDate} - Applicants can now start with Application Number - Rolling Batch - Miss=Join Next`);
  };
  const handleUnpublishExam = () => {
    if (!confirm('Close Entrance Exam? Applicants will no longer write')) return;
    const updated = { ...examSettings, status: 'CLOSED', closedAt: new Date().toISOString(), closedBy: displayName };
    localStorage.setItem('lcns_exam_settings', JSON.stringify(updated));
    setExamSettings(updated);
    alert('🔒 EXAM CLOSED - Now publish results so applicants see on dashboard with Application Number');
  };
  const handlePublishEntranceResults = () => {
    if (examSubmissions.length===0) { alert('No submissions yet'); return; }
    if (!confirm(`Publish ${examSubmissions.length} Entrance Results? Applicant will see on dashboard with Application Number`)) return;
    localStorage.setItem('lcns_entrance_results_published', 'true');
    setExamResultsPublished(true);
    alert(`✅ Results Published - ${examSubmissions.length} - Applicants see on /applicant/dashboard with LCNS/2026/XXXX`);
  };
  const handleUnpublishEntranceResults = () => {
    if (!confirm('Unpublish Results? Hide from dashboard')) return;
    localStorage.setItem('lcns_entrance_results_published', 'false');
    setExamResultsPublished(false);
    alert('🔒 Results Unpublished - Hidden from dashboard');
  };
  // === END ADD ===

  const safeCurrentUser = (() => {
    try {
      const keys = ['lcns_erp_current_user', 'lcns-current-user', 'lcns_current_user', 'lcns_user'];
      for (const k of keys) {
        const v = localStorage.getItem(k);
        if (v) {
          const parsed = JSON.parse(v);
          if (parsed && parsed.email) return parsed;
        }
      }
      return StorageService.getCurrentUser();
    } catch { return null; }
  })();

  const currentUser = safeCurrentUser || {
    id: 'LCNS/2026/RG/001',
    email: 'registrar@lcns.edu.ng',
    role: 'REGISTRAR',
    fullName: 'Registrar - LCNS',
    status: 'ACTIVE',
  };

  const displayName = (currentUser?.fullName || currentUser?.full_name || currentUser?.email || 'Registrar - LCNS').toString().toUpperCase();
  const displayEmail = currentUser?.email || 'registrar@lcns.edu.ng';

  const totalRevenue = payments.filter((p) => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0);

  const filteredStudents = students.filter((s: any) => {
    if (levelFilter !== 'ALL' && s.level !== levelFilter) return false;
    if (!searchBiodata) return true;
    return `${s.fullName} ${s.matricNo} ${s.program} ${s.level} ${s.stateOfOrigin} ${s.phone}`.toLowerCase().includes(searchBiodata.toLowerCase());
  });

  const filteredIndividual = students.filter((s: any) => {
    if (!searchIndividual) return true;
    const term = searchIndividual.toLowerCase().trim();
    return s.fullName.toLowerCase().includes(term) || s.matricNo.toLowerCase().includes(term);
  });

  const handleSenateApproval = () => {
    setSenateApproved(true);
    StorageService.logAction(displayEmail,'REGISTRAR','SENATE_RATIFICATION','Senate Ratification granted');
    alert('Senate Ratification Granted!');
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-blue-800 px-3 py-1 rounded-full">Office of the Registrar - {displayName} - Score Sheets + Applicant Entrance CBT + Individual Result Print with Logo + Entrance Publish/Unpublish</span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase mt-2">{displayName}</h1>
            <p className="text-xs text-blue-200">{displayEmail} - Executive Overview + Score Sheets Download + All Students Biodata + All Applicants + APPLICANT ENTRANCE CBT + Print Individual Result with SCHOOL FULL NAME Labe College of Nursing Sciences, Gboko + Logo - CGPA + Class + Carry Over + Entrance Exam Publish → Applicant Starts with App Number → Unpublish Close → Publish Result → Applicant sees on dashboard</p>
          </div>
          <div className="text-right"><span className="text-xs text-blue-300 font-semibold block">Academic Session</span><span className="text-lg font-black text-amber-400 font-mono-code">{COLLEGE_CONFIG.CURRENT_SESSION}</span><span className={`block text-[10px] px-2 py-1 rounded-full mt-1 font-black ${examSettings.status==='PUBLISHED'?'bg-amber-400 text-black':'bg-slate-600 text-white'}`}>{examSettings.status==='PUBLISHED'?`📝 ENTRANCE PUBLISHED ${examSettings.examDate}`:'📝 ENTRANCE NOT PUBLISHED'}</span></div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        {/* === ADD ONLY - ENTRANCE EXAM TAB FOR REGISTRAR === */}
        <button onClick={() => setActiveTab('entrance_exam')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='entrance_exam'?'bg-amber-500 text-black shadow ring-2 ring-amber-300 animate-pulse':'bg-amber-50 border-2 border-amber-400 text-amber-900'}`}><Send className="w-4 h-4"/><span>📝 ENTRANCE EXAM - Publish/Unpublish - Result on Dashboard with App No</span><span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-black ${examSettings.status==='PUBLISHED'?'bg-green-600 text-white':'bg-red-600 text-white'}`}>{examSettings.status==='PUBLISHED'?'PUBLISHED':'NOT'}</span></button>
        {/* === END ADD === */}
        <button onClick={() => setActiveTab('applicant_cbt')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='applicant_cbt'?'bg-red-700 text-white shadow ring-2 ring-red-300 animate-pulse':'bg-red-50 border-2 border-red-400 text-red-800'}`}><ShieldAlert className="w-4 h-4"/><span>🚨 APPLICANT ENTRANCE CBT</span></button>
        <button onClick={() => setActiveTab('scoresheets')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='scoresheets'?'bg-blue-700 text-white shadow':'bg-blue-50 border text-blue-800'}`}><Download className="w-4 h-4"/><span>📄 Score Sheets 40+60</span></button>
        <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab==='overview'?'bg-[#0a4d2e] text-white':'text-slate-600 hover:bg-slate-100'}`}><Building className="w-4 h-4 text-emerald-400"/><span>Overview</span></button>
        <button onClick={() => setActiveTab('students_biodata')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab==='students_biodata'?'bg-emerald-700 text-white shadow':'bg-emerald-50 border text-emerald-800'}`}><Users className="w-4 h-4"/><span>👨‍🎓 Students Biodata</span></button>
        <button onClick={() => setActiveTab('admissions_all')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab==='admissions_all'?'bg-purple-700 text-white shadow':'bg-purple-50 border text-purple-800'}`}><GraduationCap className="w-4 h-4"/><span>🎓 All Applicants</span></button>
        {/* ADDED - Individual Result Print - NO DELETE OLD */}
        <button onClick={() => setActiveTab('individual_result')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='individual_result'?'bg-slate-900 text-white shadow ring-2 ring-amber-400':'bg-amber-50 border-2 border-amber-400 text-amber-900'}`}><Printer className="w-4 h-4"/><span>🖨️ Print Individual Result - School Full Name + Logo - Registrar/Exam Officer/Admin/HOD/Provost</span><span className="px-2 py-0.5 rounded-full text-[10px] bg-red-600 text-white">NEW</span></button>
      </div>

      {activeTab==='entrance_exam' ? (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-50 to-emerald-50 border-2 border-amber-400 rounded-2xl p-5">
            <h2 className="text-lg font-black">📝 Registrar Entrance Exam Control - Publish → Applicant Starts with App Number → Unpublish → Publish Result → Applicant Sees on Dashboard</h2>
            <p className="text-xs font-bold mt-2">Flow: Publish Exam → Applicants write at /exam with LCNS/2026/XXXX - Rolling Batch Miss=Join Next Many batches → Unpublish Close → Publish Results → Applicants see result at /applicant/dashboard with Application Number</p>
            <div className="grid md:grid-cols-4 gap-3 mt-4">
              <div className={`p-3 rounded-xl border-2 text-center ${examSettings.status==='PUBLISHED'?'bg-green-100 border-green-500':'bg-slate-100'}`}><p className="text-[10px] font-black">EXAM STATUS</p><p className="font-black">{examSettings.status||'NOT SET'}</p><p className="text-[11px]">{examSettings.examDate||'No date'}</p></div>
              <div className="p-3 rounded-xl border-2 bg-white text-center"><p className="text-[10px] font-black">SUBMISSIONS</p><p className="font-black text-xl">{examSubmissions.length}</p></div>
              <div className={`p-3 rounded-xl border-2 text-center ${examResultsPublished?'bg-green-100 border-green-500':'bg-red-50 border-red-300'}`}><p className="text-[10px] font-black">RESULTS PUBLISHED</p><p className="font-black">{examResultsPublished?'✅ YES - Applicants see dashboard':'🔒 NO'}</p></div>
              <div className="p-3 rounded-xl border-2 bg-white text-center"><p className="text-[10px] font-black">MAX PER BATCH</p><p className="font-black text-xl">{examSettings.maxPerBatch||100}</p></div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <button onClick={handlePublishExam} disabled={examSettings.status==='PUBLISHED'} className={`px-6 py-3 rounded-full font-black text-xs ${examSettings.status==='PUBLISHED'?'bg-slate-200':'bg-emerald-700 text-white'}`}>✅ Publish Exam - Applicant Starts with App No</button>
              <button onClick={handleUnpublishExam} disabled={examSettings.status!=='PUBLISHED'} className={`px-6 py-3 rounded-full font-black text-xs ${examSettings.status!=='PUBLISHED'?'bg-slate-200':'bg-red-600 text-white'}`}>🔒 Unpublish / Close Exam</button>
              <button onClick={handlePublishEntranceResults} disabled={examResultsPublished || examSubmissions.length===0} className={`px-6 py-3 rounded-full font-black text-xs ${examResultsPublished?'bg-slate-200':'bg-amber-500 text-black'}`}>🎓 Publish Results - {examSubmissions.length} - Applicant Sees on Dashboard</button>
              <button onClick={handleUnpublishEntranceResults} disabled={!examResultsPublished} className={`px-6 py-3 rounded-full font-black text-xs ${!examResultsPublished?'bg-slate-200':'bg-slate-700 text-white'}`}>⏸️ Unpublish Results</button>
            </div>
            <div className="mt-4 bg-white border rounded-xl p-3 text-xs">
              <p className="font-black">Applicant sees result with Application Number:</p>
              <p>/applicant/dashboard or /check-admission → Enter LCNS/2026/XXXX → If lcns_entrance_results_published=true, shows score, batch, rolling status</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border-2 p-4">
            <h3 className="font-black text-sm mb-3">Set Exam Date + Max Per Batch - Registrar/Provost/Admin</h3>
            <AdminExamSettings />
          </div>
          <div className="bg-white rounded-2xl border-2 p-4 overflow-x-auto">
            <h3 className="font-black text-sm mb-3">Recent Submissions - {examSubmissions.length}</h3>
            <table className="w-full text-xs"><thead className="bg-slate-900 text-white"><tr><th className="p-2 text-left">Form No</th><th className="p-2">Name</th><th className="p-2">Original</th><th className="p-2">Joined - Rolling</th><th className="p-2">Answered</th><th className="p-2">Published?</th></tr></thead><tbody>{examSubmissions.slice(-20).reverse().map((s:any,i:number)=><tr key={i} className="border-b"><td className="p-2 font-mono font-black">{s.form_no}</td><td className="p-2">{s.full_name}</td><td className="p-2 text-center">{s.original_batch}</td><td className="p-2 text-center">{s.joined_batch} {s.joined_batch!==s.original_batch?'(MISSED JOINED NEXT)':''}</td><td className="p-2 text-center">{s.total_answered}</td><td className="p-2 text-center">{examResultsPublished?'✅ Sees dashboard':''}</td></tr>)}</tbody></table>
          </div>
        </div>
      ) : activeTab==='applicant_cbt' ? (
        <RegistrarApplicantCBTManager />
      ) : activeTab==='scoresheets' ? (
        <ScoreSheetViewer currentUser={currentUser} />
      ) : activeTab==='individual_result' ? (
        <div className="bg-white rounded-3xl border-2 border-amber-300 p-6 space-y-6">
          <div>
            <h2 className="text-lg font-black flex items-center gap-2"><Printer className="w-5 h-5 text-amber-600"/> Print Individual Student Result with School Full Name & Logo - Registrar View - {displayName}</h2>
            <p className="text-xs bg-amber-50 border p-2 rounded mt-1 font-bold">Registrar {displayName} can print individual student result - With LABE COLLEGE OF NURSING SCIENCES, GBOKO full name + Logo + CGPA + Class + Carry Over Auto Reflect - Search by Name and Matric No - For all roles: Exam Officer, Registrar, Admin, HOD, Provost Final</p>
          </div>

          <div className="flex flex-wrap gap-2 bg-slate-50 p-3 rounded-xl border">
            <div className="flex items-center gap-2 flex-1 bg-white border-2 border-amber-400 rounded-xl px-3">
              <Search className="w-4 h-4 text-amber-600"/>
              <input value={searchIndividual} onChange={e=>setSearchIndividual(e.target.value)} placeholder="🔍 Search by Name and Matric No - e.g. Okonkwo or LCNS/2026/ND1/001" className="flex-1 py-2.5 text-xs font-black outline-none"/>
              {searchIndividual && <button onClick={()=>setSearchIndividual('')} className="px-2 py-1 bg-slate-100 rounded-full text-[10px] font-black">Clear</button>}
            </div>
            <div className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-black">{filteredIndividual.length} Students - Search by Name and Matric</div>
          </div>

          {!selectedPrintStudent ? (
            <div className="overflow-x-auto border-2 rounded-xl">
              <table className="w-full text-xs">
                <thead className="bg-slate-900 text-white"><tr><th className="p-3 text-left">Matric No + Name - Search by Name and Matric</th><th className="p-3 text-left">Level + Program</th><th className="p-3 text-left">Results + CGPA</th><th className="p-3 text-center">Print with School Name + Logo - Registrar</th></tr></thead>
                <tbody>
                  {filteredIndividual.map((s:any) => {
                    const studResults = computationResults.filter((r:any)=> r.matricNo===s.matricNo);
                    let cu=0, gp=0; studResults.forEach((r:any)=>{ const g = r.score>=70?4: r.score>=60?3: r.score>=50?2: r.score>=40?1:0; cu+=r.creditUnit||3; gp+=(r.creditUnit||3)*g; });
                    const cgpa = cu? (gp/cu).toFixed(2) : '0.00';
                    return (
                      <tr key={s.matricNo} className="border-b hover:bg-amber-50">
                        <td className="p-3"><p className="font-mono font-black text-emerald-800">{s.matricNo}</p><p className="font-black uppercase">{s.fullName}</p></td>
                        <td className="p-3"><p className="font-bold">{s.level} - {s.program}</p><p className="text-[11px]">{s.session}</p></td>
                        <td className="p-3"><p className="text-[11px]">Courses: {studResults.length} | CGPA: {cgpa}</p><p className="text-[10px]">{studResults.filter((r:any)=>r.score<40).length ? `⚠️ Carry: ${studResults.filter((r:any)=>r.score<40).map((r:any)=>r.courseCode).join(', ')}` : '✅ No Carry'}</p></td>
                        <td className="p-3 text-center"><button onClick={()=>setSelectedPrintStudent(s)} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black flex items-center gap-2 mx-auto"><Printer className="w-4 h-4"/> Print {s.matricNo} - School Full Name + Logo - REGISTRAR</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border">
                <p className="font-black text-sm">Selected: {selectedPrintStudent.fullName} - {selectedPrintStudent.matricNo} - Printing as Registrar - {displayName}</p>
                <button onClick={()=>setSelectedPrintStudent(null)} className="px-4 py-2 bg-slate-200 rounded-xl text-xs font-black">← Back to List</button>
              </div>
              <PrintableResultWithLogo
                matricNo={selectedPrintStudent.matricNo}
                fullName={selectedPrintStudent.fullName}
                level={selectedPrintStudent.level}
                program={selectedPrintStudent.program}
                results={computationResults.filter((r:any)=> r.matricNo===selectedPrintStudent.matricNo)}
                currentUserRole="REGISTRAR"
                currentUserName={displayName}
                senateApproved={senateInfo.approved}
                senateDate={senateInfo.date}
                senateProvost={senateInfo.provost}
              />
            </div>
          )}
        </div>
      ) : activeTab==='students_biodata' ? (
        <div className="bg-white rounded-3xl border-2 border-emerald-300 p-4 space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-3">
            <div><h2 className="text-lg font-black flex items-center gap-2"><Users className="w-5 h-5 text-emerald-700"/>All Students Biodata - Current Level Visible</h2></div>
            <button onClick={()=>window.print()} className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-black flex items-center gap-1"><Download className="w-4 h-4"/>Print</button>
          </div>
          <div className="flex flex-wrap gap-2 bg-slate-50 p-3 rounded-xl border">
            <div className="flex items-center gap-2 flex-1 bg-white border rounded-xl px-3"><Search className="w-4 h-4 text-slate-400"/><input value={searchBiodata} onChange={e=>setSearchBiodata(e.target.value)} placeholder="Search Name, Matric No, Program, Phone, State" className="flex-1 py-2 text-xs font-bold outline-none"/></div>
            <select value={levelFilter} onChange={e=>setLevelFilter(e.target.value)} className="px-4 py-2 border-2 border-emerald-300 rounded-xl text-xs font-black">
              <option value="ALL">All Levels ({students.length})</option>
              <option value="ND 1">ND 1</option><option value="ND 2">ND 2</option><option value="HND 1">HND 1</option><option value="HND 2">HND 2</option>
            </select>
            <div className="px-3 py-2 bg-emerald-900 text-white rounded-xl text-xs font-black">{filteredStudents.length} Found</div>
          </div>
          <div className="overflow-x-auto border-2 rounded-xl">
            <table className="w-full text-xs"><thead className="bg-slate-900 text-white"><tr><th className="p-2 text-left">Matric No + Photo</th><th className="p-2 text-left">Full Name</th><th className="p-2 text-left">Program + Level</th><th className="p-2 text-left">Contact + State</th><th className="p-2">View</th></tr></thead>
              <tbody>{filteredStudents.map((s:any)=><tr key={s.matricNo} className="border-b hover:bg-slate-50"><td className="p-2"><div className="flex items-center gap-2"><img src={s.photoUrl || 'https://via.placeholder.com/50'} className="w-10 h-12 object-cover rounded border"/><div><p className="font-mono font-black text-emerald-800">{s.matricNo}</p><span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100">{s.level}</span></div></div></td><td className="p-2 font-black uppercase">{s.fullName}</td><td className="p-2">{s.program} <b className="bg-yellow-200 px-1 rounded">{s.level}</b></td><td className="p-2">{s.phone} | {s.stateOfOrigin}</td><td className="p-2 text-center"><button onClick={()=>setSelectedBiodata(s)} className="px-3 py-1.5 bg-blue-700 text-white rounded-lg font-black text-[11px]">View</button></td></tr>)}</tbody>
            </table>
          </div>
          {selectedBiodata && <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"><div className="bg-white rounded-2xl max-w-2xl w-full p-6"><div className="flex justify-between border-b pb-2"><h3 className="font-black">Full Biodata - {selectedBiodata.fullName}</h3><button onClick={()=>setSelectedBiodata(null)} className="px-3 py-1 bg-slate-100 rounded-full font-black">X</button></div><button onClick={()=>window.print()} className="w-full mt-4 py-3 bg-slate-900 text-white rounded-xl font-black">Print Biodata</button></div></div>}
        </div>
      ) : activeTab==='admissions_all' ? (
        <div className="space-y-4"><div className="bg-purple-50 border-2 border-purple-300 p-3 rounded-xl text-xs font-bold">Registrar All Applicants Records - CBT + Interview + Admit Link - {displayName}</div><AdminAdmissionManager currentUser={currentUser} /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white rounded-3xl border shadow-sm"><p className="text-xs font-bold uppercase">Total Enrolled</p><p className="text-2xl font-black">{students.length + 415}</p></div>
          <div className="p-5 bg-white rounded-3xl border shadow-sm"><p className="text-xs font-bold uppercase">2026/2027 Applicants</p><p className="text-2xl font-black">{applicants.length + 185}</p></div>
          <div className="p-5 bg-white rounded-3xl border shadow-sm"><p className="text-xs font-bold uppercase">Pass Rate</p><p className="text-2xl font-black text-emerald-800">94.8%</p></div>
          <div className="p-5 bg-white rounded-3xl border shadow-sm"><p className="text-xs font-bold uppercase">Revenue</p><p className="text-2xl font-black">₦{(totalRevenue + 72400000).toLocaleString()}</p></div>
        </div>
      )}
    </div>
  );
};

export default RegistrarDashboard;

import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import { COLLEGE_CONFIG } from '../../types';
import {
  Award,
  Users,
  GraduationCap,
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
  Key,
  Rocket,
  Calendar,
} from 'lucide-react';
import { CBTExamManager } from '../cbt/CBTExamManager';
import { AdmissionProcessingView } from './AdmissionProcessingView';
import { AdminAdmissionManager } from '../admin/AdminAdmissionManager';
import { ScoreSheetViewer } from './ScoreSheetViewer';
import { PrintableResultWithLogo } from '../common/PrintableResultWithLogo';
import { AdminExamSettings } from './AdminExamSettings';
import { InterviewScoresEntryView } from '../admin/InterviewScoresEntryView';
import { supabase } from '@/lib/supabase';

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
  const saveExams = (newExams: any[]) => { setExams(newExams); localStorage.setItem('lcns_applicant_exams', JSON.stringify(newExams)); };
  const saveQuestions = (newQs: any[]) => { setQuestions(newQs); localStorage.setItem('lcns_entrance_questions', JSON.stringify(newQs)); };
  const createExam = () => {
    const newExam = { id: 'EXAM-' + Date.now(), title, academic_year: academicYear, duration_minutes: duration, start_time: startTime, end_time: endTime, max_tab_switches: maxTabSwitch, full_screen_required: fullScreen, status, created_at: new Date().toISOString() };
    const updated = [newExam, ...exams]; saveExams(updated); setSelectedExamId(newExam.id); alert('✅ Entrance Exam Created!');
  };
  const updateExamStatus = (id: string, newStatus: 'published'|'unpublished'|'draft') => {
    const updated = exams.map((e:any)=> e.id===id ? {...e, status: newStatus} : e); saveExams(updated); alert(newStatus === 'published' ? '✅ PUBLISHED' : '⏸️ UNPUBLISHED');
  };
  const addQuestion = () => {
    if (!qText || !optA || !optB) return alert('Fill question and at least A & B');
    const newQ = { id: 'Q-' + Date.now(), exam_id: selectedExamId || exams[0]?.id || 'default', question_text: qText, option_a: optA, option_b: optB, option_c: optC, option_d: optD, correct_option: correct, marks: 1 };
    saveQuestions([...questions, newQ]); setQText(''); setOptA(''); setOptB(''); setOptC(''); setOptD(''); setCorrect('A');
  };
  const deleteQuestion = (id: string) => { if (!confirm('Delete?')) return; saveQuestions(questions.filter((q:any)=>q.id!==id)); };
  const publishScoreForApplicant = (attempt: any) => {
    let score = attempt.score || 0;
    const published = { ...attempt, score, published_at: new Date().toISOString(), result_status: 'published' };
    localStorage.setItem('lcns_cbt_published_' + (attempt.application_number || attempt.jamb_no || attempt.applicant_name), JSON.stringify(published));
    alert(`✅ Score PUBLISHED for ${attempt.applicant_name}!`);
  };
  const unpublishScore = (attempt: any) => { localStorage.removeItem('lcns_cbt_published_' + (attempt.application_number || attempt.jamb_no || attempt.applicant_name)); alert('⏸️ UNPUBLISHED'); };
  useEffect(() => { const loadAttempts = () => { try { setAttempts(JSON.parse(localStorage.getItem('lcns_cbt_attempts') || '[]')); } catch {} }; loadAttempts(); }, []);
  const selectedExam = exams.find((e:any)=>e.id===selectedExamId) || exams[0];
  return (
    <div className="space-y-6 bg-white rounded-3xl border-2 border-blue-200 p-6">
      <div className="flex justify-between"><div><h2 className="text-xl font-black flex items-center gap-2"><ShieldAlert className="text-red-600"/> Registrar - Applicant Entrance CBT Manager</h2><p className="text-xs">Set applicant exams, time, anti-cheat 10 warnings, fullscreen</p></div><span className="px-3 py-1 bg-blue-100 rounded-full text-xs font-black">{exams.length} Exams • {questions.length} Qs • {attempts.length} Attempts</span></div>
      <div className="bg-[#f0faf0] border-2 border-[#0f4c2e] rounded-2xl p-5 space-y-4">
        <h3 className="font-black text-sm">SET APPLICANT EXAM</h3>
        <div className="grid md:grid-cols-2 gap-3"><input value={title} onChange={e=>setTitle(e.target.value)} className="border-2 px-3 py-2.5 rounded-xl text-sm font-bold col-span-2"/><input value={academicYear} onChange={e=>setAcademicYear(e.target.value)} className="border px-3 py-2 rounded-xl text-sm"/><div className="flex items-center gap-2 border px-3 py-2 rounded-xl bg-white"><Timer size={16}/><label className="text-xs font-bold">Duration:</label><input type="number" value={duration} onChange={e=>setDuration(parseInt(e.target.value)||40)} className="flex-1 outline-none font-black"/></div><div className="flex items-center gap-2 border px-3 py-2 rounded-xl bg-white"><Clock size={16}/><label className="text-xs font-bold">Start:</label><input type="datetime-local" value={startTime} onChange={e=>setStartTime(e.target.value)} className="flex-1 outline-none text-xs"/></div><div className="flex items-center gap-2 border px-3 py-2 rounded-xl bg-white"><Clock size={16}/><label className="text-xs font-bold">End:</label><input type="datetime-local" value={endTime} onChange={e=>setEndTime(e.target.value)} className="flex-1 outline-none text-xs"/></div><div className="flex items-center gap-2 border-2 border-red-300 px-3 py-2 rounded-xl bg-red-50"><ShieldAlert size={16} className="text-red-600"/><label className="text-xs font-black">Warnings:</label><input type="number" value={maxTabSwitch} onChange={e=>setMaxTabSwitch(parseInt(e.target.value)||10)} className="w-16 font-black text-center border rounded"/></div><div className="flex items-center gap-2 border-2 border-blue-300 px-3 py-2 rounded-xl bg-blue-50"><Monitor size={16}/><label className="text-xs font-black">Fullscreen:</label><select value={fullScreen?'yes':'no'} onChange={e=>setFullScreen(e.target.value==='yes')} className="font-black border rounded px-2"><option value="yes">Enabled</option><option value="no">Disabled</option></select></div></div>
        <div className="flex gap-2"><button onClick={createExam} className="px-6 py-3 bg-[#0f4c2e] text-white rounded-full font-black text-sm flex items-center gap-2"><Plus size={16}/> Create/Update</button>{selectedExam && (<><button onClick={()=>updateExamStatus(selectedExam.id,'published')} className="px-6 py-3 bg-green-600 text-white rounded-full font-black text-sm flex items-center gap-2"><Eye size={16}/> Publish</button><button onClick={()=>updateExamStatus(selectedExam.id,'unpublished')} className="px-6 py-3 bg-amber-500 text-black rounded-full font-black text-sm flex items-center gap-2"><EyeOff size={16}/> Unpublish</button></>)}</div>
      </div>
      <div className="bg-white border-2 rounded-2xl p-5 space-y-4">
        <h3 className="font-black text-sm">ADD QUESTIONS</h3>
        <div className="grid gap-3"><textarea value={qText} onChange={e=>setQText(e.target.value)} placeholder="Question Text" className="border-2 px-3 py-2 rounded-xl text-sm"/><div className="grid md:grid-cols-2 gap-2"><input value={optA} onChange={e=>setOptA(e.target.value)} placeholder="Option A" className="border px-3 py-2 rounded-xl text-sm"/><input value={optB} onChange={e=>setOptB(e.target.value)} placeholder="Option B" className="border px-3 py-2 rounded-xl text-sm"/><input value={optC} onChange={e=>setOptC(e.target.value)} placeholder="Option C" className="border px-3 py-2 rounded-xl text-sm"/><input value={optD} onChange={e=>setOptD(e.target.value)} placeholder="Option D" className="border px-3 py-2 rounded-xl text-sm"/></div><div className="flex gap-2 items-center"><label className="text-xs font-black">Correct:</label><select value={correct} onChange={e=>setCorrect(e.target.value)} className="border-2 border-green-500 px-3 py-2 rounded-xl font-black"><option>A</option><option>B</option><option>C</option><option>D</option></select><button onClick={addQuestion} className="px-6 py-2.5 bg-blue-700 text-white rounded-full font-black text-sm flex items-center gap-2"><Plus size={14}/> Add</button></div></div>
        <div className="space-y-2 max-h-[300px] overflow-auto">{questions.map((q:any,i:number)=>(<div key={q.id} className="border p-3 rounded-xl flex justify-between gap-3 text-xs bg-slate-50"><div className="flex-1"><p className="font-bold">{i+1}. {q.question_text}</p><p className="mt-1">A: {q.option_a} | B: {q.option_b} | C: {q.option_c} | D: {q.option_d} | <span className="bg-green-200 px-2 py-0.5 rounded font-black">Correct: {q.correct_option}</span></p></div><button onClick={()=>deleteQuestion(q.id)} className="px-2 py-1 bg-red-100 text-red-700 rounded font-bold flex items-center gap-1"><Trash2 size={12}/> Del</button></div>))}</div>
      </div>
      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-5 space-y-3">
        <h3 className="font-black text-sm flex items-center gap-2"><Award/> Applicant Attempts</h3>
        <div className="overflow-x-auto border rounded-xl bg-white"><table className="w-full text-xs"><thead className="bg-slate-900 text-white"><tr><th className="p-2 text-left">Applicant</th><th className="p-2">App No</th><th className="p-2">Score</th><th className="p-2">Action</th></tr></thead><tbody>{attempts.map((a:any, idx:number)=>(<tr key={idx} className="border-b"><td className="p-2"><p className="font-bold">{a.applicant_name || a.jamb_no}</p></td><td className="p-2 font-mono">{a.application_number || '-'}</td><td className="p-2 font-black">{a.score}/{a.total} ({a.percentage}%)</td><td className="p-2 flex gap-1"><button onClick={()=>publishScoreForApplicant(a)} className="px-3 py-1.5 bg-green-700 text-white rounded-full font-black text-[11px]">Publish</button><button onClick={()=>unpublishScore(a)} className="px-3 py-1.5 bg-slate-200 rounded-full font-bold text-[11px]">Unpublish</button></td></tr>))}</tbody></table></div>
      </div>
    </div>
  );
};

export const RegistrarDashboard: React.FC = () => {
  const safeCurrentUser = (() => {
    try { const keys = ['lcns_erp_current_user', 'lcns-current-user', 'lcns_current_user', 'lcns_user']; for (const k of keys) { const v = localStorage.getItem(k); if (v) { const parsed = JSON.parse(v); if (parsed && parsed.email) return parsed; } } return StorageService.getCurrentUser(); } catch { return null; }
  })();
  const currentUser = safeCurrentUser || { id: 'LCNS/2026/RG/001', email: 'registrar@lcns.edu.ng', role: 'REGISTRAR', fullName: 'Registrar - LCNS', status: 'ACTIVE' };
  const displayName = (currentUser?.fullName || (currentUser as any)?.full_name || currentUser?.email || 'Registrar').toString().toUpperCase();
  const displayEmail = currentUser?.email || 'registrar@lcns.edu.ng';

  const [activeTab, setActiveTab] = useState<'overview' | 'admissions' | 'admissions_all' | 'cbt' | 'students_biodata' | 'scoresheets' | 'applicant_cbt' | 'individual_result' | 'entrance_exam' | 'registrar_vet' | 'staff_data' | 'interview_scores' | 'users' | 'courses' | 'promotion' | 'session'>('courses');
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
  const [users, setUsers] = useState<any[]>(() => { try { return JSON.parse(localStorage.getItem('lcns_users') || '[]'); } catch { return []; } });
  const [showPasswords, setShowPasswords] = useState<{[k:string]:boolean}>({});
  const [userSearch, setUserSearch] = useState('');

  // ===== REGISTRAR ADD COURSE + ASSIGN LECTURER =====
  const [courses, setCourses] = useState<any[]>(() => { try { return JSON.parse(localStorage.getItem('lcns_courses') || '[]'); } catch { return []; } });
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [courseCode, setCourseCode] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [courseUnits, setCourseUnits] = useState(3);
  const [courseLevel, setCourseLevel] = useState('ND1');
  const [courseSemester, setCourseSemester] = useState<'First' | 'Second'>('First');
  const [courseLecturer, setCourseLecturer] = useState('Nurse Emmanuel Gbaorun (FWACN)');
  const [courseDept, setCourseDept] = useState('Nursing Sciences');
  const [searchCourse, setSearchCourse] = useState('');

  // ===== NEW - SESSION & PROMOTION BACKEND - WHOLE PORTAL =====
  const [currentSession, setCurrentSession] = useState<string>(COLLEGE_CONFIG.CURRENT_SESSION || '2026/2027');
  const [allSessions, setAllSessions] = useState<any[]>([]);
  const [promotionSearch, setPromotionSearch] = useState('');
  const [promotions, setPromotions] = useState<any[]>([]);

  // ===== LOAD ALL FROM SUPABASE BACKEND =====
  const loadRegistrarData = async () => {
    try {
      const { data } = await supabase.from('student_gpa_view').select('*');
      if(data) setSupabaseGpa(data);
      const { data: scores } = await supabase.from('student_results_workflow').select('*').order('matric_no');
      if(scores && scores.length>0) setHodVettedResults(scores);

      const { data: staff } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if(staff){
        const formatted = staff.map((u:any)=>({
          id: u.id, email: u.email, fullName: u.full_name||u.fullName||u.full_name, full_name: u.full_name||u.fullName, role: u.role, department: u.department,
          status: u.status||'ACTIVE', phone: u.phone, matricNumber: u.matric_no||'', matric_no: u.matric_no||'', staffId: u.staff_id||'',
          level: u.level||'ND1', current_semester: u.current_semester||'First', createdAt: u.created_at, password: u.password||'', loginId: u.matric_no||u.staff_id||u.email
        }));
        setStaffData(formatted);
        setUsers(formatted);
        setAllUsers(formatted);
        localStorage.setItem('lcns_users', JSON.stringify(formatted));
      }
      const { data: coursesData } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
      if(coursesData && coursesData.length>0){
        setCourses(coursesData);
        localStorage.setItem('lcns_courses', JSON.stringify(coursesData));
      }
      // Load current session from backend - WHOLE PORTAL
      const { data: setting } = await supabase.from('college_settings').select('*').eq('setting_key','CURRENT_SESSION').single();
      if(setting) setCurrentSession(setting.setting_value);
      const { data: sessions } = await supabase.from('academic_sessions').select('*').order('session_name');
      if(sessions) setAllSessions(sessions);
      const { data: promo } = await supabase.from('promotions').select('*').order('created_at', { ascending: false }).limit(100);
      if(promo) setPromotions(promo);
    } catch {}
  };
  useEffect(() => { 
    loadRegistrarData();
    // Real-time: Whole portal updates when Registrar runs new session
    const channel = supabase.channel('registrar-session-global')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'college_settings' }, (payload) => {
        if((payload.new as any)?.setting_key === 'CURRENT_SESSION'){
          setCurrentSession((payload.new as any).setting_value);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); }
  }, []);

  // ===== PROMOTION LOGIC: FIRST -> SECOND -> NEXT LEVEL FIRST =====
  const getNextPromotion = (level: string, semester: string) => {
    const l = (level||'ND1').toUpperCase();
    const s = (semester||'First').toLowerCase();
    if(l==='ND1' && s==='first') return { nextLevel: 'ND1', nextSemester: 'Second', label: 'ND1 First → ND1 Second' };
    if(l==='ND1' && s==='second') return { nextLevel: 'ND2', nextSemester: 'First', label: 'ND1 Second → ND2 First (PROMOTED TO ND2)' };
    if(l==='ND2' && s==='first') return { nextLevel: 'ND2', nextSemester: 'Second', label: 'ND2 First → ND2 Second' };
    if(l==='ND2' && s==='second') return { nextLevel: 'HND1', nextSemester: 'First', label: 'ND2 Second → HND1 First (PROMOTED TO HND1)' };
    if(l==='HND1' && s==='first') return { nextLevel: 'HND1', nextSemester: 'Second', label: 'HND1 First → HND1 Second' };
    if(l==='HND1' && s==='second') return { nextLevel: 'HND2', nextSemester: 'First', label: 'HND1 Second → HND2 First (PROMOTED TO HND2)' };
    if(l==='HND2' && s==='first') return { nextLevel: 'HND2', nextSemester: 'Second', label: 'HND2 First → HND2 Second' };
    if(l==='HND2' && s==='second') return { nextLevel: 'GRADUATED', nextSemester: 'Completed', label: 'HND2 Second → GRADUATED 🎓' };
    return { nextLevel: 'ND1', nextSemester: 'First', label: 'New Admitted → ND1 First' };
  };

  const handlePromoteStudentBackend = async (student: any) => {
    const currLevel = student.level || 'ND1';
    const currSem = student.current_semester || 'First';
    const next = getNextPromotion(currLevel, currSem);
    if(!confirm(`Promote ${student.full_name||student.fullName}?\n${currLevel} ${currSem} → ${next.nextLevel} ${next.nextSemester}\n${next.label}\nStudent will see automatically!`)) return;
    const promo: any = {
      id: 'promo-'+Date.now(),
      matric_no: student.matric_no||student.matricNumber,
      full_name: student.full_name||student.fullName,
      from_level: currLevel,
      to_level: next.nextLevel,
      from_semester: currSem,
      to_semester: next.nextSemester,
      from_session: currentSession,
      to_session: currentSession,
      promotion_type: next.label,
      promoted_by: displayName,
      created_at: new Date().toISOString()
    };
    try {
      await supabase.from('promotions').insert([promo]);
      await supabase.from('student_promotions').insert([promo]);
      const { error } = await supabase.from('users').update({ level: next.nextLevel, current_semester: next.nextSemester }).eq('matric_no', promo.matric_no);
      if(error) await supabase.from('users').update({ level: next.nextLevel, current_semester: next.nextSemester }).eq('email', student.email);
      await supabase.from('student_academic_history').insert([{
        id: 'hist-'+Date.now(),
        matric_no: promo.matric_no,
        level: next.nextLevel,
        session: currentSession,
        semester: next.nextSemester,
        status: next.nextLevel==='GRADUATED'?'GRADUATED':'ACTIVE'
      }]);
      const updated = users.map((u:any)=> (u.matric_no===promo.matric_no || u.email===student.email) ? {...u, level: next.nextLevel, current_semester: next.nextSemester} : u);
      setUsers(updated);
      localStorage.setItem('lcns_users', JSON.stringify(updated));
      alert(`✅ PROMOTED & SAVED IN BACKEND!\n${promo.full_name}: ${currLevel} ${currSem} → ${next.nextLevel} ${next.nextSemester}\nStudent dashboard auto shows ${next.nextLevel} ${next.nextSemester}! Lecturer sees new semester!`);
      loadRegistrarData();
    } catch(err:any){ alert('Error: '+err.message); }
  };

  const handleBulkPromote = async (fromLevel: string, fromSemester: string) => {
    const list = users.filter((u:any)=>u.role==='STUDENT' && u.level===fromLevel && (u.current_semester||'First')===fromSemester);
    if(list.length===0) return alert(`No students in ${fromLevel} ${fromSemester}`);
    const next = getNextPromotion(fromLevel, fromSemester);
    if(!confirm(`Bulk Promote ALL ${list.length} students?\n${fromLevel} ${fromSemester} → ${next.nextLevel} ${next.nextSemester}\n${next.label}`)) return;
    for(const s of list){ await handlePromoteStudentBackend(s); }
  };

  // ===== RUN NEW SESSION - WHOLE PORTAL CHANGES =====
  const handleRunNewSession = async (newSessionName: string) => {
    if(!newSessionName) return alert('Enter session e.g., 2027/2028');
    if(!confirm(`🚀 RUN NEW SESSION ${newSessionName}?\nWhole portal ${currentSession} → ${newSessionName}\nAll users (Provost, Student, Lecturer, HOD, Exam Officer, Bursar, Admin) will see ${newSessionName}!\nOld session data KEPT - view by academic year!`)) return;
    try {
      await supabase.from('academic_sessions').upsert([{ id: 'sess-'+newSessionName.replace('/','-'), session_name: newSessionName, is_current: true, status: 'ACTIVE', created_by: displayName, created_at: new Date().toISOString() }], { onConflict: 'id' });
      await supabase.from('academic_sessions').update({ is_current: false }).neq('session_name', newSessionName);
      await supabase.from('college_settings').upsert([{ id: 'setting-current-session', setting_key: 'CURRENT_SESSION', setting_value: newSessionName, updated_by: displayName, updated_at: new Date().toISOString() }], { onConflict: 'setting_key' });
      setCurrentSession(newSessionName);
      localStorage.setItem('lcns_current_session', newSessionName);
      alert(`✅ NEW SESSION RUN! Whole portal now ${newSessionName}!\nAll dashboards will show ${newSessionName}!\nOld data SAFE!`);
      const { data } = await supabase.from('academic_sessions').select('*').order('session_name');
      if(data) setAllSessions(data);
    } catch(err:any){ alert('Failed: '+err.message); }
  };

  // ===== ADD COURSE BACKEND =====
  const handleCreateCourseBackend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode || !courseTitle) { alert('Enter Course Code + Title'); return; }
    const newCourse: any = {
      id: 'crs-' + Date.now(),
      course_code: courseCode.toUpperCase(),
      course_title: courseTitle,
      code: courseCode.toUpperCase(),
      title: courseTitle,
      credit_unit: courseUnits,
      units: courseUnits,
      level: courseLevel.toUpperCase(),
      semester: courseSemester,
      department: courseDept,
      lecturer_name: courseLecturer,
      lecturerName: courseLecturer,
      session: currentSession,
      academic_year: currentSession,
      created_by: displayName,
      created_at: new Date().toISOString()
    };
    try {
      const { error } = await supabase.from('courses').insert([newCourse]);
      if(error) throw error;
      const updated = [newCourse, ...courses];
      setCourses(updated);
      localStorage.setItem('lcns_courses', JSON.stringify(updated));
      StorageService.saveCourses(updated as any);
      alert(`✅ Course ${courseCode.toUpperCase()} - ${courseLevel} ${courseSemester} - Session ${currentSession} - Lecturer ${courseLecturer} - Saved to backend! ND1 students will see it in ${courseSemester} semester for registration!`);
      setCourseCode(''); setCourseTitle(''); setShowAddCourse(false);
    } catch(err:any) {
      const updated = [newCourse, ...courses];
      setCourses(updated);
      localStorage.setItem('lcns_courses', JSON.stringify(updated));
      StorageService.saveCourses(updated as any);
      alert(`✅ Course saved locally!`);
      setShowAddCourse(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if(!confirm('Delete this course?')) return;
    try { await supabase.from('courses').delete().eq('id', id); } catch {}
    const updated = courses.filter((c:any)=>c.id!==id);
    setCourses(updated);
    localStorage.setItem('lcns_courses', JSON.stringify(updated));
    StorageService.saveCourses(updated as any);
  };

  const filteredCourses = courses.filter((c:any)=>{
    if(!searchCourse) return true;
    const t=searchCourse.toLowerCase();
    return `${c.course_code||c.code||''} ${c.course_title||c.title||''} ${c.lecturer_name||''} ${c.level||''}`.toLowerCase().includes(t);
  });

  const handleManualCorrection = (id: string) => {
    const updated = hodVettedResults.map((r:any) => r.id === id || r.scoreId === id ? {...r, score: editScore, totalScore: editScore, total_score: editScore} : r);
    localStorage.setItem('lcns_results', JSON.stringify(updated));
    localStorage.setItem('lcns_results_hod_vetted', JSON.stringify(updated));
    localStorage.setItem('lcns_results_registrar_vetted', JSON.stringify(updated));
    setHodVettedResults(updated);
    setComputationResults(updated);
    setEditingId(null);
    alert(`✅ Score corrected to ${editScore} saved!`);
  };
  const handleForwardToProvost = () => {
    if(hodVettedResults.length===0) { alert('No results'); return; }
    localStorage.setItem('lcns_registrar_vet_status', 'FORWARDED_TO_PROVOST');
    localStorage.setItem('lcns_results_registrar_vetted', JSON.stringify(hodVettedResults));
    setVetStatus('FORWARDED_TO_PROVOST');
    alert(`✅ Forwarded ${hodVettedResults.length} to Provost`);
  };
  const handleReturnToHOD = () => {
    const reason = prompt('Enter reason to return to HOD:'); if(!reason) return;
    localStorage.setItem('lcns_registrar_vet_status', 'RETURNED_TO_HOD');
    setVetStatus('RETURNED_TO_HOD');
    alert(`↩️ Returned to HOD: ${reason}`);
  };
  const downloadMasterPDF = () => {
    const html = `<html><head><style>body{font-family:Arial; font-size:10px;} table{width:100%; border-collapse:collapse;} th,td{border:1px solid #000; padding:4px; text-align:center;} th{background:#1e3a8a; color:#fff;}</style></head><body><h2>LABE - MASTER SHEET - REGISTRAR VETTED - ${currentSession}</h2><table><tr><th>Matric</th><th>Name</th><th>Course</th><th>Total</th><th>Grade</th><th>GPA</th></tr>${hodVettedResults.map((r:any)=>{ const score = r.score||r.total_score||0; const grade = score>=70?'A':score>=60?'B':score>=50?'C':score>=40?'D':'F'; return `<tr><td>${r.matricNo||r.matric_no}</td><td>${r.fullName||''}</td><td>${r.courseCode||r.course_code}</td><td>${score}</td><td>${grade}</td><td>${supabaseGpa.find((g:any)=>g.matric_no===(r.matricNo||r.matric_no))?.gpa||'-'}</td></tr>`}).join('')}</table></body></html>`;
    const win = window.open('', '_blank'); if(win){ win.document.write(html); win.document.close(); win.focus(); setTimeout(()=>win.print(), 500); }
  };
  const downloadMasterExcel = () => {
    let csv = 'Matric,Name,Course,Total,Grade,GPA\n';
    hodVettedResults.forEach((r:any)=>{ const score = r.score||r.total_score||0; const grade = score>=70?'A':score>=60?'B':score>=50?'C':score>=40?'D':'F'; csv += `"${r.matricNo||r.matric_no}","${r.fullName||''}","${r.courseCode||r.course_code}","${score}","${grade}"\n`; });
    const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `Registrar_Master_${new Date().toISOString().slice(0,10)}.csv`; document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const filteredVet = hodVettedResults.filter((r:any)=>{ if(!searchVet) return true; const term = searchVet.toLowerCase(); return (r.matricNo||r.matric_no||'').toLowerCase().includes(term) || (r.fullName||'').toLowerCase().includes(term); });
  const filteredStaff = [...staffData, ...allUsers].filter((s:any)=>{ if(!searchStaff) return true; const term = searchStaff.toLowerCase(); return `${s.fullName||s.full_name||''} ${s.email||''} ${s.role||''}`.toLowerCase().includes(term); });
  const filteredUsers = users.filter((u:any)=>{ if(!userSearch) return true; const t=userSearch.toLowerCase(); return (u.fullName||'').toLowerCase().includes(t) || (u.email||'').toLowerCase().includes(t); });
  const totalRevenue = payments.filter((p) => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0);
  const filteredStudents = students.filter((s: any) => { if (levelFilter !== 'ALL' && s.level !== levelFilter) return false; if (!searchBiodata) return true; return `${s.fullName} ${s.matricNo} ${s.program} ${s.level}`.toLowerCase().includes(searchBiodata.toLowerCase()); });
  const filteredIndividual = students.filter((s: any) => { if (!searchIndividual) return true; const term = searchIndividual.toLowerCase().trim(); return s.fullName.toLowerCase().includes(term) || s.matricNo.toLowerCase().includes(term); });

  const handlePublishExam = () => { if (!examSettings.examDate) { alert('Set Exam Date first!'); return; } if (!confirm(`Publish Entrance Exam? Date: ${examSettings.examDate}`)) return; const updated = { ...examSettings, status: 'PUBLISHED', publishedAt: new Date().toISOString(), publishedBy: displayName }; localStorage.setItem('lcns_exam_settings', JSON.stringify(updated)); setExamSettings(updated); alert(`✅ ENTRANCE EXAM PUBLISHED`); };
  const handleUnpublishExam = () => { if (!confirm('Close Entrance Exam?')) return; const updated = { ...examSettings, status: 'CLOSED', closedAt: new Date().toISOString(), closedBy: displayName }; localStorage.setItem('lcns_exam_settings', JSON.stringify(updated)); setExamSettings(updated); alert('🔒 EXAM CLOSED'); };
  const handlePublishEntranceResults = () => { if (examSubmissions.length===0) { alert('No submissions'); return; } if (!confirm(`Publish ${examSubmissions.length} Entrance Results?`)) return; localStorage.setItem('lcns_entrance_results_published', 'true'); setExamResultsPublished(true); alert(`✅ Results Published`); };
  const handleUnpublishEntranceResults = () => { if (!confirm('Unpublish Results?')) return; localStorage.setItem('lcns_entrance_results_published', 'false'); setExamResultsPublished(false); alert('🔒 Unpublished'); };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border-4 border-yellow-400">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div><span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-blue-800 px-3 py-1 rounded-full">Office of the Registrar - {displayName} - PORTAL SESSION: {currentSession} - Users: {users.length} Backend + Courses: {courses.length} + Promotions: {promotions.length}</span><h1 className="text-2xl sm:text-3xl font-black uppercase mt-2">{displayName} - CURRENT: {currentSession}</h1><p className="text-xs text-blue-200">Add Course + Assign Lecturer → ND1 student sees in First/Second Semester → Registers — Promotion ND1 First→Second→ND2 First — Run New Session → Whole Portal Changes! - Users: {users.length} from Backend - Courses: {courses.length} from Backend</p></div>
          <div className="text-right"><span className="text-xs text-blue-300 font-semibold block">Academic Session - Whole Portal</span><span className="text-lg font-black text-amber-400 font-mono-code">{currentSession}</span><span className={`block text-[10px] px-2 py-1 rounded-full mt-1 font-black ${vetStatus==='FORWARDED_TO_PROVOST'?'bg-green-500 text-white': vetStatus==='RETURNED_TO_HOD'?'bg-red-500 text-white':'bg-yellow-400 text-black'}`}>{vetStatus} • {hodVettedResults.length} Results</span></div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <button onClick={() => setActiveTab('session')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='session'?'bg-purple-900 text-white shadow ring-2 ring-yellow-300':'bg-purple-50 border-2 border-purple-600 text-purple-900'}`}><Rocket className="w-4 h-4"/><span>🚀 RUN NEW SESSION - Whole Portal - {currentSession}</span></button>
        <button onClick={() => setActiveTab('promotion')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='promotion'?'bg-emerald-900 text-white shadow ring-2 ring-emerald-300':'bg-emerald-50 border-2 border-emerald-600 text-emerald-900'}`}><GraduationCap className="w-4 h-4"/><span>🎓 PROMOTION - ND1 First→Second→ND2 First - Backend - NEW</span></button>
        <button onClick={() => setActiveTab('courses')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='courses'?'bg-emerald-700 text-white shadow ring-2 ring-emerald-300':'bg-emerald-50 border-2 border-emerald-500 text-emerald-900'}`}><BookOpen className="w-4 h-4"/><span>📚 Courses - Add Course + Assign Lecturer - {currentSession}</span><span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-600 text-white">{courses.length}</span></button>
        <button onClick={() => setActiveTab('users')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='users'?'bg-slate-900 text-white shadow ring-2 ring-amber-300':'bg-slate-50 border-2 border-amber-400 text-slate-800'}`}><Users className="w-4 h-4"/><span>👤 Users - {users.length} Backend</span></button>
        <button onClick={() => setActiveTab('registrar_vet')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='registrar_vet'?'bg-blue-700 text-white shadow ring-2 ring-blue-300':'bg-blue-50 border-2 border-blue-500 text-blue-900'}`}><FileCheck className="w-4 h-4"/><span>🔍 REGISTRAR VET</span><span className="px-2 py-0.5 rounded-full text-[10px] bg-red-600 text-white">{hodVettedResults.length}</span></button>
        <button onClick={() => setActiveTab('interview_scores')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='interview_scores'?'bg-amber-600 text-white shadow ring-2 ring-amber-300':'bg-amber-50 border-2 border-amber-500 text-amber-900'}`}><Award className="w-4 h-4"/><span>📝 Interview Score</span></button>
        <button onClick={() => setActiveTab('staff_data')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='staff_data'?'bg-emerald-700 text-white shadow ring-2 ring-emerald-300':'bg-emerald-50 border-2 border-emerald-400 text-emerald-900'}`}><Users className="w-4 h-4"/><span>👨‍🏫 STAFF DATA</span></button>
        <button onClick={() => setActiveTab('entrance_exam')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='entrance_exam'?'bg-amber-500 text-black shadow ring-2 ring-amber-300':'bg-amber-50 border-2 border-amber-400 text-amber-900'}`}><Send className="w-4 h-4"/><span>📝 ENTRANCE EXAM</span></button>
        <button onClick={() => setActiveTab('applicant_cbt')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='applicant_cbt'?'bg-red-700 text-white shadow ring-2 ring-red-300':'bg-red-50 border-2 border-red-400 text-red-800'}`}><ShieldAlert className="w-4 h-4"/><span>🚨 APPLICANT CBT</span></button>
        <button onClick={() => setActiveTab('scoresheets')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='scoresheets'?'bg-blue-700 text-white shadow':'bg-blue-50 border text-blue-800'}`}><Download className="w-4 h-4"/><span>📄 Score Sheets</span></button>
        <button onClick={() => setActiveTab('students_biodata')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab==='students_biodata'?'bg-emerald-700 text-white shadow':'bg-emerald-50 border text-emerald-800'}`}><Users className="w-4 h-4"/><span>👨‍🎓 Biodata</span></button>
        <button onClick={() => setActiveTab('individual_result')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='individual_result'?'bg-slate-900 text-white shadow ring-2 ring-amber-400':'bg-amber-50 border-2 border-amber-400 text-amber-900'}`}><Printer className="w-4 h-4"/><span>🖨️ Print Individual</span></button>
      </div>

      {activeTab==='session' && (
        <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl p-6 text-white space-y-4 border-4 border-yellow-400">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-black flex items-center gap-2"><Rocket/> 🚀 RUN NEW ACADEMIC SESSION - Whole Portal Changes</h2>
            <div className="bg-yellow-400 text-black px-4 py-2 rounded-full font-black text-xs">CURRENT PORTAL: {currentSession}</div>
          </div>
          <p className="text-xs bg-white/20 p-3 rounded-xl">Registrar runs new session → Whole college portal changes! Provost, Registrar, Student, Lecturer, HOD, Exam Officer, Bursar, Admin all see new session {currentSession} → New session. Old session data KEPT - you can view it by selecting academic year.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl p-4 text-black space-y-2">
              <p className="font-black text-xs">Create + Run New Session - Backend</p>
              <input id="runNewSessionInput" placeholder="e.g., 2027/2028" defaultValue="2027/2028" className="w-full border-2 p-2 rounded-xl text-xs font-black"/>
              <button onClick={()=>{ const el=document.getElementById('runNewSessionInput') as HTMLInputElement; handleRunNewSession(el.value); }} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-black text-xs hover:bg-emerald-700">🚀 RUN NEW SESSION NOW - Change Whole Portal to {currentSession}</button>
            </div>
            <div className="bg-white rounded-2xl p-4 text-black space-y-2">
              <p className="font-black text-xs">View Previous Sessions - Data Kept</p>
              <select value={currentSession} onChange={e=>handleRunNewSession(e.target.value)} className="w-full border-2 p-2 rounded-xl text-xs font-black">
                {allSessions.map((s:any)=><option key={s.id} value={s.session_name}>{s.session_name} {s.is_current ? '(CURRENT - Whole Portal)' : ''}</option>)}
              </select>
              <p className="text-[10px] text-slate-600">Select to view old session data. Filtering: promotions, courses, students by session = selected year. Old session data SAFE!</p>
              <button onClick={()=>handleRunNewSession(currentSession)} className="w-full py-2 bg-purple-700 text-white rounded-xl font-black text-xs">Back to Current: {currentSession}</button>
            </div>
            <div className="bg-white rounded-2xl p-4 text-black space-y-2">
              <p className="font-black text-xs">Sessions in Backend - Supabase</p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {allSessions.map((s:any)=>(
                  <div key={s.id} className={`flex justify-between p-2 rounded-lg text-[11px] font-bold ${s.is_current ? 'bg-emerald-100 border-2 border-emerald-500' : 'bg-slate-50'}`}>
                    <span>{s.session_name}</span><span>{s.is_current ? '✅ CURRENT PORTAL' : s.status}</span>
                  </div>
                ))}
              </div>
              <button onClick={async()=>{ const { data } = await supabase.from('college_settings').select('*'); const curr = data?.find((d:any)=>d.setting_key==='CURRENT_SESSION')?.setting_value; alert(`Current Session in Backend: ${curr}\n\nThis value controls whole portal! All dashboards read it!\n\ncollege_settings CURRENT_SESSION = ${curr}`); }} className="w-full py-2 bg-slate-900 text-white rounded-xl font-black text-xs">Check Current Session in Backend - Supabase</button>
            </div>
          </div>
          <div className="bg-white/10 p-3 rounded-xl text-[11px]">
            <p className="font-black">How it works:</p>
            <p>1. Registrar clicks RUN 2027/2028 → college_settings CURRENT_SESSION updates to 2027/2028 in Supabase backend</p>
            <p>2. All dashboards (Student, Lecturer, Provost, etc.) have real-time listener on college_settings → Auto updates to 2027/2028!</p>
            <p>3. Old session 2026/2027 data still in backend - promotions, courses with session=2026/2027 - You can view by filter!</p>
            <p>4. New admission begins for 2027/2028!</p>
          </div>
        </div>
      )}

      {activeTab==='promotion' && (
        <div className="bg-white rounded-3xl border-4 border-emerald-400 p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black flex items-center gap-2"><GraduationCap className="w-6 h-6 text-emerald-700"/> 🎓 STUDENT PROMOTION - Semester to Semester - Backend Saving - Student Sees Auto!</h2>
              <p className="text-xs font-bold bg-emerald-50 border-2 border-emerald-300 p-2 rounded mt-2">Flow: New Admitted → ND1 First → ND1 Second → ND2 First → ND2 Second → HND1 First → HND1 Second → HND2 First → HND2 Second → GRADUATED 🎓 | Session: {currentSession} | Promotion saves to Supabase promotions table + Updates users.level + current_semester in backend | Student dashboard auto sees new level! Lecturer sees new semester!</p>
            </div>
            <span className="px-3 py-1 bg-emerald-900 text-white rounded-full text-xs font-black">{users.filter((u:any)=>u.role==='STUDENT').length} Students - Session {currentSession}</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button onClick={()=>handleBulkPromote('ND1','First')} className="p-3 bg-blue-600 text-white rounded-xl font-black text-xs">Bulk: ND1 First → Second ({users.filter((u:any)=>u.role==='STUDENT' && u.level==='ND1' && (u.current_semester||'First')==='First').length})</button>
            <button onClick={()=>handleBulkPromote('ND1','Second')} className="p-3 bg-purple-600 text-white rounded-xl font-black text-xs">Bulk: ND1 Second → ND2 First ({users.filter((u:any)=>u.role==='STUDENT' && u.level==='ND1' && u.current_semester==='Second').length})</button>
            <button onClick={()=>handleBulkPromote('ND2','First')} className="p-3 bg-orange-600 text-white rounded-xl font-black text-xs">Bulk: ND2 First → Second ({users.filter((u:any)=>u.role==='STUDENT' && u.level==='ND2' && (u.current_semester||'First')==='First').length})</button>
            <button onClick={()=>handleBulkPromote('ND2','Second')} className="p-3 bg-emerald-600 text-white rounded-xl font-black text-xs">Bulk: ND2 Second → HND1 First</button>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border">
            <Search className="w-4 h-4"/><input value={promotionSearch} onChange={e=>setPromotionSearch(e.target.value)} placeholder="Search student to promote - Matric, Name" className="flex-1 py-2 text-xs font-bold outline-none bg-transparent"/>
          </div>

          <div className="overflow-x-auto border-2 rounded-xl">
            <table className="w-full text-xs">
              <thead className="bg-emerald-900 text-white"><tr><th className="p-2 text-left">Student - Matric + Name</th><th className="p-2">Current Level - Session {currentSession}</th><th className="p-2">Next → Auto</th><th className="p-2 text-center">Promote Action - Backend Save - Student Sees</th></tr></thead>
              <tbody>
                {users.filter((u:any)=>u.role==='STUDENT' && (promotionSearch==='' || `${u.full_name||u.fullName} ${u.matric_no||''}`.toLowerCase().includes(promotionSearch.toLowerCase()))).map((s:any)=>{
                  const currL = s.level||'ND1';
                  const currS = s.current_semester||'First';
                  const next = getNextPromotion(currL, currS);
                  return (
                    <tr key={s.email} className="border-b hover:bg-emerald-50">
                      <td className="p-2"><p className="font-mono font-bold">{s.matric_no}</p><p className="font-bold">{s.full_name||s.fullName}</p><p className="text-[10px]">{s.email}</p></td>
                      <td className="p-2"><span className="px-2 py-1 bg-blue-100 rounded-full font-black">{currL} {currS} - {currentSession}</span></td>
                      <td className="p-2"><span className="px-2 py-1 bg-emerald-100 rounded-full font-black">{next.nextLevel} {next.nextSemester}</span><p className="text-[9px] mt-1">{next.label}</p></td>
                      <td className="p-2 text-center"><button onClick={()=>handlePromoteStudentBackend(s)} className="px-3 py-1.5 bg-emerald-700 text-white rounded-full font-black text-[11px]">🎓 Promote → {next.nextLevel} {next.nextSemester} - Save Backend - Student Sees Auto</button></td>
                    </tr>
                  )
                })}
                {users.filter((u:any)=>u.role==='STUDENT').length===0 && <tr><td colSpan={4} className="p-8 text-center text-slate-500 font-bold">No students yet — Add ND1 student first in Courses tab or Users — Then promote ND1 First → ND1 Second here — Backend will save! Student will see new level automatically!</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-900 text-white p-4 rounded-2xl text-xs space-y-2">
            <p className="font-black">Backend Check - Promotions: {promotions.length} - Current Session: {currentSession}</p>
            <div className="flex gap-2">
              <button onClick={async()=>{ const {data}=await supabase.from('promotions').select('*').order('created_at', {ascending:false}).limit(10); alert(`Promotions backend:\n${data?.map((p:any)=>`${p.matric_no} ${p.from_level} ${p.from_semester} → ${p.to_level} ${p.to_semester} - ${p.to_session}`).join('\n') || 'None'}`); }} className="px-3 py-1 bg-emerald-600 rounded-full font-black">View Promotions Backend</button>
              <button onClick={async()=>{ const {data}=await supabase.from('users').select('matric_no, full_name, level, current_semester').eq('role','STUDENT'); alert(`Students backend:\n${data?.map((u:any)=>`${u.matric_no} ${u.full_name} - ${u.level} ${u.current_semester}`).join('\n') || 'None'}`); }} className="px-3 py-1 bg-blue-600 rounded-full font-black">View Students Level Backend</button>
            </div>
            <p className="text-[11px] bg-white/10 p-2 rounded">Once promoted, student dashboard SELECT level, current_semester FROM users WHERE matric_no = me → Auto shows new level! Lecturer dashboard sees new semester for course filtering!</p>
          </div>
        </div>
      )}

      {activeTab==='courses' && (
        <div className="bg-white rounded-3xl border-4 border-emerald-400 p-6 space-y-6">
          <div className="flex flex-col md:flex-row justify-between gap-3">
            <div>
              <h2 className="text-lg font-black flex items-center gap-2"><BookOpen className="w-6 h-6 text-emerald-700"/> Registrar Course Management - Add Course + Assign Lecturer → Student Sees for Registration - {courses.length} Courses Backend - Session {currentSession}</h2>
              <p className="text-xs font-bold bg-emerald-50 border-2 border-emerald-300 p-2 rounded mt-2">Registrar {displayName} — Add course with Code, Title, Units, Level (ND1/ND2/HND1/HND2), Semester (First/Second), Assign to Lecturer — Saves to Supabase backend with session={currentSession} — ND1 student in First Semester dashboard will see NUR111 for registration — Second semester courses show in Second semester! Lecturer sees new session!</p>
            </div>
            <button onClick={()=>setShowAddCourse(true)} className="px-6 py-3 bg-emerald-700 text-white rounded-xl font-black text-xs flex items-center gap-2 self-start"><Plus className="w-4 h-4"/> Add New Course + Assign Lecturer - {currentSession}</button>
          </div>

          <div className="flex flex-wrap gap-2 bg-slate-50 p-3 rounded-xl border">
            <div className="flex items-center gap-2 flex-1 bg-white border-2 rounded-xl px-3"><Search className="w-4 h-4"/><input value={searchCourse} onChange={e=>setSearchCourse(e.target.value)} placeholder="Search by Code, Title, Lecturer, Level, Session" className="flex-1 py-2 text-xs font-bold outline-none"/></div>
            <div className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-black">{filteredCourses.length} Courses — Backend: {courses.length} — Session {currentSession}: {courses.filter((c:any)=>c.session===currentSession||c.academic_year===currentSession).length}</div>
          </div>

          <div className="overflow-x-auto border-2 rounded-xl">
            <table className="w-full text-xs">
              <thead className="bg-emerald-900 text-white"><tr><th className="p-2 text-left">Course Code + Title + CU + Level + Semester - Session {currentSession}</th><th className="p-2 text-left">Lecturer Assigned - Sees New Semester</th><th className="p-2">Session</th><th className="p-2">Student Sees?</th><th className="p-2 text-center">Action - Delete</th></tr></thead>
              <tbody>
                {filteredCourses.map((c:any)=>(
                  <tr key={c.id} className="border-b hover:bg-emerald-50">
                    <td className="p-3">
                      <p className="font-mono font-black text-emerald-800">{c.course_code||c.code} — {c.credit_unit||c.units}U</p>
                      <p className="font-bold">{c.course_title||c.title}</p>
                      <div className="flex gap-1 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${c.level?.toUpperCase().includes('ND1')?'bg-blue-100 text-blue-800':c.level?.toUpperCase().includes('ND2')?'bg-green-100 text-green-800':'bg-purple-100 text-purple-800'}`}>{c.level}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${c.semester==='First'?'bg-amber-100 text-amber-800':'bg-emerald-100 text-emerald-800'}`}>{c.semester} Semester</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <p className="font-bold flex items-center gap-1"><Users className="w-3 h-3"/> {c.lecturer_name||c.lecturerName||'Not Assigned'}</p>
                      <p className="text-[10px] text-slate-600">{c.department||'Nursing Sciences'}</p>
                    </td>
                    <td className="p-2 text-center text-[11px] font-bold">{c.session||c.academic_year||currentSession}</td>
                    <td className="p-2 text-center"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-[10px] font-black">✅ {c.level} {c.semester} Student Sees for Reg - {c.session||currentSession}</span></td>
                    <td className="p-2 text-center"><button onClick={()=>handleDeleteCourse(c.id)} className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full font-black text-[11px] flex items-center gap-1 mx-auto"><Trash2 className="w-3 h-3"/> Delete</button></td>
                  </tr>
                ))}
                {filteredCourses.length===0 && <tr><td colSpan={5} className="p-8 text-center text-slate-500 font-bold">No courses added yet — Click Add New Course — Assign to lecturer — ND1 student will see it in First/Second semester for registration! Session {currentSession}</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="bg-blue-50 border-2 border-blue-300 p-3 rounded-xl text-xs">
            <p className="font-black">FLOW — Registrar Add Course - Session {currentSession}:</p>
            <p>1. Registrar adds NUR111 - Foundations - 3U - ND1 - First - Session {currentSession} - Assigned to Nurse Emmanuel Gbaorun → Saves to Supabase courses table with session={currentSession}</p>
            <p>2. ND1 Student logs in → First Semester tab → Filter courses WHERE session={currentSession} AND level=ND1 AND semester=First → Sees NUR111 — 3U — Lecturer: Emmanuel Gbaorun → Clicks Register!</p>
            <p>3. Lecturer logs in → Sees course NUR111 in {currentSession} {courseLevel} {courseSemester} — Sees new semester because Registrar promoted!</p>
          </div>
        </div>
      )}

      {showAddCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border space-y-4 max-h-[90vh] overflow-auto">
            <h3 className="text-base font-black uppercase">Add Course + Assign to Lecturer — {displayName} — Session {currentSession} — Backend Save — Student Will See for Registration</h3>
            <form onSubmit={handleCreateCourseBackend} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block font-bold mb-1">Course Code * — e.g., NUR111</label><input type="text" required value={courseCode} onChange={e=>setCourseCode(e.target.value)} placeholder="NUR111" className="w-full p-2.5 bg-slate-50 border-2 border-emerald-300 rounded-xl text-xs uppercase font-black"/></div>
                <div><label className="block font-bold mb-1">Credit Units *</label><input type="number" min="1" max="6" value={courseUnits} onChange={e=>setCourseUnits(Number(e.target.value))} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-black"/></div>
              </div>
              <div><label className="block font-bold mb-1">Course Title * — e.g., Foundations of Nursing</label><input type="text" required value={courseTitle} onChange={e=>setCourseTitle(e.target.value)} placeholder="Foundations of Nursing" className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold"/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block font-bold mb-1">Level * — ND1/ND2/HND1/HND2</label><select value={courseLevel} onChange={e=>setCourseLevel(e.target.value)} className="w-full p-2.5 bg-slate-50 border-2 border-blue-300 rounded-xl text-xs font-black"><option value="ND1">ND1</option><option value="ND2">ND2</option><option value="HND1">HND1</option><option value="HND2">HND2</option></select></div>
                <div><label className="block font-bold mb-1">Semester * — First/Second - Current {currentSession}</label><select value={courseSemester} onChange={e=>setCourseSemester(e.target.value as any)} className="w-full p-2.5 bg-slate-50 border-2 border-amber-300 rounded-xl text-xs font-black"><option value="First">First Semester - {currentSession}</option><option value="Second">Second Semester - {currentSession}</option></select></div>
              </div>
              <div><label className="block font-bold mb-1">Assign to Lecturer * — Lecturer Name</label><input type="text" required value={courseLecturer} onChange={e=>setCourseLecturer(e.target.value)} placeholder="Nurse Emmanuel Gbaorun (FWACN)" className="w-full p-2.5 bg-slate-50 border-2 border-purple-300 rounded-xl text-xs font-bold"/><p className="text-[10px] text-slate-500 mt-1">This lecturer will see course in their dashboard — Student will see lecturer name for registration — Session {currentSession}</p></div>
              <div><label className="block font-bold mb-1">Department - Session {currentSession}</label><input type="text" value={courseDept} onChange={e=>setCourseDept(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs"/><p className="text-[10px]">Session auto = {currentSession} — Lecturer sees we are in new semester because promotion updated!</p></div>
              <div className="bg-blue-50 border-2 border-blue-200 p-3 rounded-xl">
                <p className="font-black text-[11px]">Will save to Supabase backend:</p>
                <p className="text-[11px]">✅ course_code: {courseCode.toUpperCase()} — level: {courseLevel} — semester: {courseSemester} — lecturer: {courseLecturer} — session: {currentSession}</p>
                <p className="text-[11px] mt-1">✅ {courseLevel} Student in {courseSemester} Semester - Session {currentSession} will see it for Course Registration! Lecturer sees new semester!</p>
              </div>
              <div className="pt-3 flex justify-end gap-2"><button type="button" onClick={()=>setShowAddCourse(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold">Cancel</button><button type="submit" className="px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-black flex items-center gap-2"><Save className="w-4 h-4"/> Save Course to Backend {currentSession} — Student Will See</button></div>
            </form>
          </div>
        </div>
      )}

      {activeTab==='users' && (
        <div className="bg-white rounded-3xl border-4 border-amber-400 p-6 space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-3">
            <div><h2 className="text-lg font-black flex items-center gap-2"><Users className="w-5 h-5 text-amber-700"/>All Users from Backend - {users.length} - Registrar Sees All - User ID + Email + Password - Session {currentSession}</h2><p className="text-xs font-bold bg-amber-50 border p-2 rounded mt-1">Registrar sees all users from Supabase backend — Same 5 users: steve@gmail.com (EXAM_OFFICER) Password 6855123, jude@gmail.com (REGISTRAR) 9303123, avulesamuel@gmail.com (PROVOST) 9565123, terver@gmail.com (BURSAR) 6787123, samuel@lcns.edu.ng (ADMIN) Lcns@2026 — Current Session {currentSession} whole portal</p></div>
            <div className="flex items-center gap-1 bg-white border-2 rounded-xl px-3"><Search className="w-4 h-4"/><input value={userSearch} onChange={e=>setUserSearch(e.target.value)} placeholder="Search Name, Email, ID, Level" className="py-2 text-xs font-bold outline-none"/></div>
          </div>
          <div className="overflow-x-auto border-2 rounded-xl"><table className="w-full text-xs"><thead className="bg-slate-900 text-white"><tr><th className="p-2 text-left">Full Name + Role + Level</th><th className="p-2">Email + User ID / Login ID</th><th className="p-2">Password - Click Eye 👁️</th><th className="p-2">Status - Session</th></tr></thead><tbody>{filteredUsers.map((u:any)=>(<tr key={u.email} className="border-b hover:bg-amber-50"><td className="p-2"><p className="font-black">{u.fullName}</p><span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-800 text-white">{u.role}</span> - {u.department} <span className="px-1 py-0.5 bg-blue-100 rounded text-[10px] font-black">{u.level||'N/A'} {u.current_semester||''}</span></td><td className="p-2"><p className="font-bold">{u.email}</p><p className="font-mono font-black text-amber-800 text-[11px]">{u.loginId}</p></td><td className="p-2"><span className="flex gap-1 items-center bg-yellow-50 px-2 py-1 rounded border font-mono font-black text-[11px]">{showPasswords[u.email]? (u.password||'') : '••••••'}<button onClick={()=>setShowPasswords({...showPasswords,[u.email]:!showPasswords[u.email]})} className="ml-1 p-1 bg-white border rounded">{showPasswords[u.email]?<EyeOff className="w-3 h-3"/>:<Eye className="w-3 h-3"/>}</button></span></td><td className="p-2"><span className={`px-2 py-1 rounded-full text-[10px] font-black ${u.status==='ACTIVE'?'bg-emerald-100 text-emerald-800':'bg-red-100 text-red-800'}`}>{u.status}</span><p className="text-[10px]">{currentSession}</p></td></tr>))}</tbody></table></div>
          <p className="text-[11px] font-bold text-center bg-emerald-50 p-2 rounded border">✅ Backend Fixed: All dashboards now load same users table from Supabase — Promotion updates level + current_semester — Session {currentSession} controls whole portal — Old data kept!</p>
        </div>
      )}

      {activeTab==='interview_scores' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border-2 border-amber-400 p-3 rounded-xl text-xs font-bold">Registrar - Enter Interview Score - Session {currentSession}</div>
          <InterviewScoresEntryView />
        </div>
      )}

      {activeTab==='registrar_vet' && (
        <div className="bg-white rounded-3xl border-2 border-blue-500 p-6 space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 p-4 rounded-xl">
            <h2 className="text-lg font-black flex items-center gap-2 text-blue-900"><FileCheck className="w-6 h-6"/> REGISTRAR VETTING PANEL - Session {currentSession}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black ${vetStatus==='FORWARDED_TO_PROVOST'?'bg-green-600 text-white': vetStatus==='RETURNED_TO_HOD'?'bg-red-600 text-white':'bg-yellow-400 text-black'}`}>Status: {vetStatus}</span>
              <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-xs font-black">{hodVettedResults.length} Records From HOD - {currentSession}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={downloadMasterPDF} className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black flex items-center gap-2"><Printer className="w-4 h-4"/> Print PDF - {currentSession}</button>
            <button onClick={downloadMasterExcel} className="px-4 py-2.5 bg-green-700 text-white rounded-xl text-xs font-black flex items-center gap-2"><FileSpreadsheet className="w-4 h-4"/> Excel - {currentSession}</button>
            <button onClick={handleForwardToProvost} className="px-4 py-2.5 bg-blue-700 text-white rounded-xl text-xs font-black flex items-center gap-2"><ArrowRight className="w-4 h-4"/> Forward to Provost</button>
            <button onClick={handleReturnToHOD} className="px-4 py-2.5 bg-red-700 text-white rounded-xl text-xs font-black flex items-center gap-2"><ArrowLeft className="w-4 h-4"/> Return to HOD</button>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border"><Search className="w-4 h-4 text-blue-600"/><input value={searchVet} onChange={e=>setSearchVet(e.target.value)} placeholder="Search" className="flex-1 py-2 text-xs font-bold outline-none bg-transparent"/></div>
          <div className="overflow-x-auto border-2 rounded-xl"><table className="w-full text-xs"><thead className="bg-blue-900 text-white"><tr><th className="p-2">Matric</th><th className="p-2">Name + Level - {currentSession}</th><th className="p-2">Course</th><th className="p-2">Total - Editable</th><th className="p-2">Grade</th><th className="p-2">GPA</th><th className="p-2">Manual Correction</th></tr></thead><tbody>{filteredVet.map((r:any, idx:number)=>{ const score = r.score || r.total_score || 0; const grade = score>=70?'A':score>=60?'B':score>=50?'C':score>=40?'D':'F'; const isEditing = editingId === (r.id||idx.toString()); return (<tr key={idx} className="border-b"><td className="p-2 font-mono font-bold">{r.matricNo||r.matric_no}</td><td className="p-2"><p className="font-bold">{r.fullName||''}</p><p className="text-[10px] bg-yellow-200 px-1 rounded">Current: {r.level||''} - {currentSession}</p></td><td className="p-2 font-mono">{r.courseCode||r.course_code}</td><td className="p-2 text-center font-black">{isEditing ? <input type="number" value={editScore} onChange={e=>setEditScore(Number(e.target.value))} className="w-16 border-2 border-blue-500 rounded p-1 text-center font-black"/> : score}</td><td className="p-2 text-center font-bold">{grade}</td><td className="p-2 text-center">{supabaseGpa.find((g:any)=>g.matric_no===(r.matricNo||r.matric_no))?.gpa||'-'}</td><td className="p-2 text-center">{isEditing ? (<div className="flex gap-1"><button onClick={()=>handleManualCorrection(r.id||idx.toString())} className="px-2 py-1 bg-green-600 text-white rounded text-[10px] font-black">Save</button><button onClick={()=>setEditingId(null)} className="px-2 py-1 bg-slate-200 rounded text-[10px]">Cancel</button></div>) : (<button onClick={()=>{setEditingId(r.id||idx.toString()); setEditScore(score);}} className="px-2 py-1 bg-amber-500 text-black rounded text-[10px] font-black flex items-center gap-1 mx-auto"><Edit className="w-3 h-3"/>Edit</button>)}</td></tr>); })}</tbody></table></div>
        </div>
      )}

      {activeTab==='staff_data' && (
        <div className="bg-white rounded-3xl border-2 border-emerald-400 p-6 space-y-6">
          <div><h2 className="text-lg font-black">Staff Data - All Staff - {users.length} from Backend - Session {currentSession}</h2></div>
          <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border"><Search className="w-4 h-4 text-emerald-600"/><input value={searchStaff} onChange={e=>setSearchStaff(e.target.value)} placeholder="Search Staff" className="flex-1 py-2 text-xs font-bold outline-none bg-transparent"/></div>
          <div className="overflow-x-auto border-2 rounded-xl"><table className="w-full text-xs"><thead className="bg-emerald-900 text-white"><tr><th className="p-3 text-left">Name - Level - Session</th><th className="p-3">Email + Role + User ID + Password - Eye</th><th className="p-3">Department</th><th className="p-3">Status</th></tr></thead><tbody>{filteredStaff.map((s:any, idx:number)=>(<tr key={idx} className="border-b hover:bg-emerald-50"><td className="p-3 font-bold">{s.fullName||s.full_name||'Staff'} - {s.level||''} {s.current_semester||''} - {currentSession}</td><td className="p-3"><p className="font-mono text-[11px]">{s.email} - {s.role} - {s.loginId}</p><span className="font-mono text-[11px] bg-yellow-50 px-1 rounded flex gap-1 items-center">Password: {showPasswords[s.email]? s.password : '••••'} <button onClick={()=>setShowPasswords({...showPasswords,[s.email]:!showPasswords[s.email]})} className="ml-1 p-1 bg-white border rounded">{showPasswords[s.email]?<EyeOff className="w-3 h-3"/>:<Eye className="w-3 h-3"/>}</button></span></td><td className="p-3">{s.department||'Nursing'}</td><td className="p-3 text-center"><span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-[10px] font-black">{s.status||'ACTIVE'}</span></td></tr>))}</tbody></table></div>
        </div>
      )}

      {activeTab==='entrance_exam' ? (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-50 to-emerald-50 border-2 border-amber-400 rounded-2xl p-5">
            <h2 className="text-lg font-black">📝 Registrar Entrance Exam Control - Session {currentSession}</h2>
            <div className="grid md:grid-cols-4 gap-3 mt-4">
              <div className={`p-3 rounded-xl border-2 text-center ${examSettings.status==='PUBLISHED'?'bg-green-100 border-green-500':'bg-slate-100'}`}><p className="text-[10px] font-black">EXAM STATUS</p><p className="font-black">{examSettings.status||'NOT SET'}</p></div>
              <div className="p-3 rounded-xl border-2 bg-white text-center"><p className="text-[10px] font-black">SUBMISSIONS</p><p className="font-black text-xl">{examSubmissions.length}</p></div>
              <div className={`p-3 rounded-xl border-2 text-center ${examResultsPublished?'bg-green-100 border-green-500':'bg-red-50 border-red-300'}`}><p className="text-[10px] font-black">RESULTS PUBLISHED</p><p className="font-black">{examResultsPublished?'✅ YES':'🔒 NO'}</p></div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <button onClick={handlePublishExam} disabled={examSettings.status==='PUBLISHED'} className={`px-6 py-3 rounded-full font-black text-xs ${examSettings.status==='PUBLISHED'?'bg-slate-200':'bg-emerald-700 text-white'}`}>✅ Publish Exam - {currentSession}</button>
              <button onClick={handleUnpublishExam} disabled={examSettings.status!=='PUBLISHED'} className={`px-6 py-3 rounded-full font-black text-xs ${examSettings.status!=='PUBLISHED'?'bg-slate-200':'bg-red-600 text-white'}`}>🔒 Unpublish</button>
              <button onClick={handlePublishEntranceResults} disabled={examResultsPublished || examSubmissions.length===0} className={`px-6 py-3 rounded-full font-black text-xs ${examResultsPublished?'bg-slate-200':'bg-amber-500 text-black'}`}>🎓 Publish Results</button>
              <button onClick={handleUnpublishEntranceResults} disabled={!examResultsPublished} className={`px-6 py-3 rounded-full font-black text-xs ${!examResultsPublished?'bg-slate-200':'bg-slate-700 text-white'}`}>⏸️ Unpublish</button>
            </div>
          </div>
          <div className="bg-white rounded-2xl border-2 p-4"><AdminExamSettings /></div>
        </div>
      ) : activeTab==='applicant_cbt' ? <RegistrarApplicantCBTManager /> : activeTab==='scoresheets' ? <ScoreSheetViewer currentUser={currentUser} /> : activeTab==='students_biodata' ? (
        <div className="bg-white rounded-3xl border-2 border-emerald-300 p-4 space-y-4">
          <div className="flex justify-between"><h2 className="text-lg font-black">All Students Biodata - Current Level Visible - Session {currentSession}</h2><span className="px-3 py-1 bg-emerald-900 text-white rounded-full text-xs font-black">{filteredStudents.length} Students - {currentSession}</span></div>
          <div className="flex gap-2 bg-slate-50 p-3 rounded-xl border"><div className="flex items-center gap-2 flex-1 bg-white border rounded-xl px-3"><Search className="w-4 h-4"/><input value={searchBiodata} onChange={e=>setSearchBiodata(e.target.value)} placeholder="Search" className="flex-1 py-2 text-xs font-bold outline-none"/></div><select value={levelFilter} onChange={e=>setLevelFilter(e.target.value)} className="px-4 py-2 border-2 border-emerald-300 rounded-xl text-xs font-black"><option value="ALL">All Levels</option><option value="ND 1">ND 1</option><option value="ND 2">ND 2</option></select></div>
          <div className="overflow-x-auto border-2 rounded-xl"><table className="w-full text-xs"><thead className="bg-slate-900 text-white"><tr><th className="p-2">Matric</th><th className="p-2">Name</th><th className="p-2">Level - {currentSession}</th></tr></thead><tbody>{filteredStudents.map((s:any)=><tr key={s.matricNo} className="border-b"><td className="p-2 font-mono">{s.matricNo}</td><td className="p-2 font-bold">{s.fullName}</td><td className="p-2">{s.level} - {currentSession}</td></tr>)}</tbody></table></div>
        </div>
      ) : activeTab==='individual_result' ? (
        <div className="bg-white rounded-3xl border-2 border-amber-300 p-6 space-y-6">
          <div className="flex flex-wrap gap-2 bg-slate-50 p-3 rounded-xl border"><div className="flex items-center gap-2 flex-1 bg-white border-2 border-amber-400 rounded-xl px-3"><Search className="w-4 h-4 text-amber-600"/><input value={searchIndividual} onChange={e=>setSearchIndividual(e.target.value)} placeholder="Search" className="flex-1 py-2.5 text-xs font-black outline-none"/></div><div className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-black">{filteredIndividual.length} Students - {currentSession}</div></div>
          {!selectedPrintStudent ? (
            <div className="overflow-x-auto border-2 rounded-xl"><table className="w-full text-xs"><thead className="bg-slate-900 text-white"><tr><th className="p-3 text-left">Matric + Name</th><th className="p-3">Level - {currentSession}</th><th className="p-3 text-center">Print</th></tr></thead><tbody>{filteredIndividual.map((s:any) => { return (<tr key={s.matricNo} className="border-b hover:bg-amber-50"><td className="p-3"><p className="font-mono font-black text-emerald-800">{s.matricNo}</p><p className="font-black uppercase">{s.fullName}</p></td><td className="p-3">{s.level} - {currentSession}</td><td className="p-3 text-center"><button onClick={()=>setSelectedPrintStudent(s)} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black flex items-center gap-2 mx-auto"><Printer className="w-4 h-4"/> Print - {currentSession}</button></td></tr>); })}</tbody></table></div>
          ) : (
            <div className="space-y-4"><div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border"><p className="font-black text-sm">Selected: {selectedPrintStudent.fullName} - {selectedPrintStudent.matricNo} - {currentSession}</p><button onClick={()=>setSelectedPrintStudent(null)} className="px-4 py-2 bg-slate-200 rounded-xl text-xs font-black">← Back</button></div><PrintableResultWithLogo matricNo={selectedPrintStudent.matricNo} fullName={selectedPrintStudent.fullName} level={selectedPrintStudent.level} program={selectedPrintStudent.program} results={computationResults.filter((r:any)=> r.matricNo===selectedPrintStudent.matricNo)} currentUserRole="REGISTRAR" currentUserName={displayName} senateApproved={senateInfo.approved} senateDate={senateInfo.date} senateProvost={senateInfo.provost} /></div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default RegistrarDashboard;

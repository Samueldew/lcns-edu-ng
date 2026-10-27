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
import PrintableResultWithLogo from '../common/PrintableResultWithLogo';
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
  const [computationResults, setComputationResults] = useState<any[]>(() => { try { return JSON.parse(localStorage.getItem('lcns_results') || '[]'); } catch { return []; } });  const [senateInfo] = useState(() => { try { const logs = JSON.parse(localStorage.getItem('lcns_audit_logs') || '[]'); const ratLog = logs.find((l:any)=> l.action==='SENATE_RATIFICATION'); if (ratLog) return { approved: true, date: ratLog.timestamp, provost: ratLog.user || 'Mrs Terna Fiase - Provost' }; return { approved: localStorage.getItem('lcns_senate_approved')==='true', date: new Date().toISOString(), provost: 'Mrs Terna Fiase - Provost' }; } catch { return { approved: false, date: new Date().toISOString(), provost: 'Mrs Terna Fiase - Provost' }; } });
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

  const [currentSession, setCurrentSession] = useState<string>(COLLEGE_CONFIG.CURRENT_SESSION || '2026/2027');
  const [allSessions, setAllSessions] = useState<any[]>([]);
  const [promotionSearch, setPromotionSearch] = useState('');
  const [promotions, setPromotions] = useState<any[]>([]);

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
    const channel = supabase.channel('registrar-session-global')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'college_settings' }, (payload) => {
        if((payload.new as any)?.setting_key === 'CURRENT_SESSION'){
          setCurrentSession((payload.new as any).setting_value);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); }
  }, []);

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
      alert(`✅ PROMOTED & SAVED IN BACKEND!\n${promo.full_name}: ${currLevel} ${currSem} → ${next.nextLevel} ${next.nextSemester}`);
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

  const handleRunNewSession = async (newSessionName: string) => {
    if(!newSessionName) return alert('Enter session e.g., 2027/2028');
    if(!confirm(`🚀 RUN NEW SESSION ${newSessionName}?\nWhole portal ${currentSession} → ${newSessionName}`)) return;
    try {
      await supabase.from('academic_sessions').upsert([{ id: 'sess-'+newSessionName.replace('/','-'), session_name: newSessionName, is_current: true, status: 'ACTIVE', created_by: displayName, created_at: new Date().toISOString() }], { onConflict: 'id' });
      await supabase.from('academic_sessions').update({ is_current: false }).neq('session_name', newSessionName);
      await supabase.from('college_settings').upsert([{ id: 'setting-current-session', setting_key: 'CURRENT_SESSION', setting_value: newSessionName, updated_by: displayName, updated_at: new Date().toISOString() }], { onConflict: 'setting_key' });
      setCurrentSession(newSessionName);
      localStorage.setItem('lcns_current_session', newSessionName);
      alert(`✅ NEW SESSION RUN! Whole portal now ${newSessionName}!`);
      const { data } = await supabase.from('academic_sessions').select('*').order('session_name');
      if(data) setAllSessions(data);
    } catch(err:any){ alert('Failed: '+err.message); }
  };

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
      alert(`✅ Course ${courseCode.toUpperCase()} Saved to backend!`);
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
          <div><span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-blue-800 px-3 py-1 rounded-full">Office of the Registrar - {displayName} - PORTAL SESSION: {currentSession}</span><h1 className="text-2xl sm:text-3xl font-black uppercase mt-2">{displayName} - CURRENT: {currentSession}</h1></div>
          <div className="text-right"><span className="text-xs text-blue-300 font-semibold block">Academic Session</span><span className="text-lg font-black text-amber-400">{currentSession}</span></div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border">
        <button onClick={() => setActiveTab('session')} className={`px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='session'?'bg-purple-900 text-white':'bg-purple-50 border'}`}>🚀 RUN NEW SESSION - {currentSession}</button>
        <button onClick={() => setActiveTab('promotion')} className={`px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='promotion'?'bg-emerald-900 text-white':'bg-emerald-50 border'}`}>🎓 PROMOTION</button>
        <button onClick={() => setActiveTab('courses')} className={`px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='courses'?'bg-emerald-700 text-white':'bg-emerald-50 border'}`}>📚 Courses {courses.length}</button>
        <button onClick={() => setActiveTab('users')} className={`px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='users'?'bg-slate-900 text-white':'bg-slate-50 border'}`}>👤 Users {users.length}</button>
        <button onClick={() => setActiveTab('registrar_vet')} className={`px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='registrar_vet'?'bg-blue-700 text-white':'bg-blue-50 border'}`}>🔍 REGISTRAR VET {hodVettedResults.length}</button>
        <button onClick={() => setActiveTab('entrance_exam')} className={`px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='entrance_exam'?'bg-amber-500 text-black':'bg-amber-50 border'}`}>📝 ENTRANCE EXAM</button>
        <button onClick={() => setActiveTab('applicant_cbt')} className={`px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='applicant_cbt'?'bg-red-700 text-white':'bg-red-50 border'}`}>🚨 APPLICANT CBT</button>
        <button onClick={() => setActiveTab('individual_result')} className={`px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='individual_result'?'bg-slate-900 text-white':'bg-amber-50 border'}`}>🖨️ Print Individual</button>
      </div>

      {activeTab==='session' && (
        <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl p-6 text-white space-y-4 border-4 border-yellow-400">
          <h2 className="text-lg font-black">🚀 RUN NEW SESSION - Whole Portal Changes</h2>
          <div className="bg-white rounded-2xl p-4 text-black space-y-2">
            <p className="font-black text-xs">Create + Run New Session - Backend</p>
            <input id="runNewSessionInput" placeholder="e.g., 2027/2028" defaultValue="2027/2028" className="w-full border-2 p-2 rounded-xl text-xs font-black"/>
            <button onClick={()=>{ const el=document.getElementById('runNewSessionInput') as HTMLInputElement; handleRunNewSession(el.value); }} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-black text-xs">🚀 RUN NEW SESSION NOW</button>
          </div>
        </div>
      )}

      {activeTab==='promotion' && (
        <div className="bg-white rounded-3xl border-4 border-emerald-400 p-6 space-y-6">
          <h2 className="text-lg font-black">🎓 STUDENT PROMOTION - {currentSession}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button onClick={()=>handleBulkPromote('ND1','First')} className="p-3 bg-blue-600 text-white rounded-xl font-black text-xs">Bulk: ND1 First → Second</button>
            <button onClick={()=>handleBulkPromote('ND1','Second')} className="p-3 bg-purple-600 text-white rounded-xl font-black text-xs">Bulk: ND1 Second → ND2 First</button>
          </div>
          <div className="overflow-x-auto border-2 rounded-xl">
            <table className="w-full text-xs">
              <thead className="bg-emerald-900 text-white"><tr><th className="p-2 text-left">Student</th><th className="p-2">Current</th><th className="p-2">Next</th><th className="p-2">Action</th></tr></thead>
              <tbody>
                {users.filter((u:any)=>u.role==='STUDENT').map((s:any)=>{
                  const currL = s.level||'ND1';
                  const currS = s.current_semester||'First';
                  const next = getNextPromotion(currL, currS);
                  return (
                    <tr key={s.email} className="border-b">
                      <td className="p-2">{s.matric_no} - {s.full_name||s.fullName}</td>
                      <td className="p-2">{currL} {currS}</td>
                      <td className="p-2">{next.nextLevel} {next.nextSemester}</td>
                      <td className="p-2"><button onClick={()=>handlePromoteStudentBackend(s)} className="px-3 py-1.5 bg-emerald-700 text-white rounded-full font-black text-[11px]">Promote</button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab==='courses' && (
        <div className="bg-white rounded-3xl border-4 border-emerald-400 p-6 space-y-6">
          <h2 className="text-lg font-black">Registrar Course Management - {courses.length} Courses - {currentSession}</h2>
          <div className="overflow-x-auto border-2 rounded-xl">
            <table className="w-full text-xs">
              <thead className="bg-emerald-900 text-white"><tr><th className="p-2">Course</th><th className="p-2">Lecturer</th><th className="p-2">Session</th><th className="p-2">Action</th></tr></thead>
              <tbody>
                {filteredCourses.map((c:any)=>(
                  <tr key={c.id} className="border-b"><td className="p-3">{c.course_code||c.code} - {c.course_title||c.title} {c.level} {c.semester}</td><td className="p-2">{c.lecturer_name}</td><td className="p-2">{c.session}</td><td className="p-2"><button onClick={()=>handleDeleteCourse(c.id)} className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full font-black">Delete</button></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab==='users' && (
        <div className="bg-white rounded-3xl border-4 border-amber-400 p-6 space-y-4">
          <h2 className="text-lg font-black">All Users - {users.length} - {currentSession}</h2>
          <div className="overflow-x-auto border-2 rounded-xl"><table className="w-full text-xs"><thead className="bg-slate-900 text-white"><tr><th className="p-2">Name + Role</th><th className="p-2">Email</th><th className="p-2">Password</th></tr></thead><tbody>{filteredUsers.map((u:any)=>(<tr key={u.email} className="border-b"><td className="p-2">{u.fullName} - {u.role} - {u.level}</td><td className="p-2">{u.email}</td><td className="p-2">{u.password}</td></tr>))}</tbody></table></div>
        </div>
      )}

      {activeTab==='registrar_vet' && (
        <div className="bg-white rounded-3xl border-2 border-blue-500 p-6 space-y-6">
          <h2 className="text-lg font-black">REGISTRAR VETTING - {currentSession}</h2>
          <div className="flex gap-2">
            <button onClick={downloadMasterPDF} className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black">Print PDF</button>
            <button onClick={downloadMasterExcel} className="px-4 py-2.5 bg-green-700 text-white rounded-xl text-xs font-black">Excel</button>
            <button onClick={handleForwardToProvost} className="px-4 py-2.5 bg-blue-700 text-white rounded-xl text-xs font-black">Forward to Provost</button>
          </div>
          <div className="overflow-x-auto border-2 rounded-xl"><table className="w-full text-xs"><thead className="bg-blue-900 text-white"><tr><th className="p-2">Matric</th><th className="p-2">Name</th><th className="p-2">Course</th><th className="p-2">Total</th><th className="p-2">Grade</th></tr></thead><tbody>{filteredVet.map((r:any, idx:number)=>{ const score = r.score || r.total_score || 0; const grade = score>=70?'A':score>=60?'B':score>=50?'C':score>=40?'D':'F'; return (<tr key={idx} className="border-b"><td className="p-2">{r.matricNo||r.matric_no}</td><td className="p-2">{r.fullName}</td><td className="p-2">{r.courseCode||r.course_code}</td><td className="p-2">{score}</td><td className="p-2">{grade}</td></tr>); })}</tbody></table></div>
        </div>
      )}

      {activeTab==='entrance_exam' ? (
        <div className="space-y-6"><div className="bg-white rounded-2xl border-2 p-4"><AdminExamSettings /></div></div>
      ) : activeTab==='applicant_cbt' ? <RegistrarApplicantCBTManager /> : activeTab==='individual_result' ? (
        <div className="bg-white rounded-3xl border-2 border-amber-300 p-6 space-y-6">
          <div className="flex gap-2 bg-slate-50 p-3 rounded-xl border"><input value={searchIndividual} onChange={e=>setSearchIndividual(e.target.value)} placeholder="Search" className="flex-1 py-2.5 text-xs font-black outline-none bg-transparent"/></div>
          {!selectedPrintStudent ? (
            <div className="overflow-x-auto border-2 rounded-xl"><table className="w-full text-xs"><thead className="bg-slate-900 text-white"><tr><th className="p-3">Matric + Name</th><th className="p-3">Level</th><th className="p-3">Print</th></tr></thead><tbody>{filteredIndividual.map((s:any) => { return (<tr key={s.matricNo} className="border-b"><td className="p-3">{s.matricNo} - {s.fullName}</td><td className="p-3">{s.level}</td><td className="p-3"><button onClick={()=>setSelectedPrintStudent(s)} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black">Print</button></td></tr>); })}</tbody></table></div>
          ) : (
            <div className="space-y-4"><button onClick={()=>setSelectedPrintStudent(null)} className="px-4 py-2 bg-slate-200 rounded-xl text-xs font-black">← Back</button><PrintableResultWithLogo matricNo={selectedPrintStudent.matricNo} fullName={selectedPrintStudent.fullName} level={selectedPrintStudent.level} program={selectedPrintStudent.program} results={computationResults.filter((r:any)=> r.matricNo===selectedPrintStudent.matricNo)} currentUserRole="REGISTRAR" currentUserName={displayName} senateApproved={senateInfo.approved} senateDate={senateInfo.date} senateProvost={senateInfo.provost} /></div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default RegistrarDashboard;

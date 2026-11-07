import React, { useState, useEffect, useMemo } from 'react';
import { StorageService } from '../../services/storage';
import { Course, Student } from '../../types';
import {
  BookOpen, UserCheck, Plus, Users, CheckCircle2, GraduationCap, Search, Download, Printer, FileSpreadsheet, ArrowRight, ArrowLeft, Edit, Save,
} from 'lucide-react';
import { AdminAdmissionManager } from '../admin/AdminAdmissionManager';
import { ScoreSheetViewer } from './ScoreSheetViewer';
import { CourseRegistrationApproval } from './CourseRegistrationApproval';
import { PrintableResultWithLogo } from '../common/PrintableResultWithLogo';
import { supabase } from '@/lib/supabase';
import { ApiService } from '../../services/api';
import { getGradePoint, calculateGPA } from '../../utils/gpa';

export const ExamOfficerDashboard: React.FC = () => {
  const safeCurrentUser = (() => {
    try {
      const keys = ['lcns_erp_current_user', 'lcns-current-user', 'lcns_current_user', 'lcns_user'];
      for (const k of keys) { const v = localStorage.getItem(k); if (v) { const parsed = JSON.parse(v); if (parsed && parsed.email) return parsed; } } return StorageService.getCurrentUser();
    } catch { return null; }
  })();

  const currentUser = safeCurrentUser || { id: 'LCNS/2026/EO/001', email: 'steve@gmail.com', role: 'EXAM_OFFICER', fullName: 'Steve Joy', status: 'ACTIVE' };
  const displayName = (currentUser?.fullName || (currentUser as any)?.full_name || 'Steve Joy').toString().toUpperCase();
  const displayEmail = currentUser?.email || 'steve@gmail.com';
  const displayRole = currentUser?.role || 'EXAM_OFFICER';

  const [courses, setCourses] = useState<Course[]>(StorageService.getCourses());
  const [students] = useState<Student[]>(StorageService.getStudents());
  const [activeTab, setActiveTab] = useState<'courses' | 'biodata' | 'admissions_all' | 'scoresheets' | 'course_reg' | 'individual_result' | 'vet_result' | 'users' | 'from_lecturer' | 'carryover'>('from_lecturer');
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [units, setUnits] = useState(3);
  const [level, setLevel] = useState('ND 1');
  const [semester, setSemester] = useState<'First' | 'Second'>('First');
  const [lecturerName, setLecturerName] = useState('Nurse Emmanuel Gbaorun (FWACN)');
  const [searchBiodata, setSearchBiodata] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [searchIndividual, setSearchIndividual] = useState('');
  const [selectedPrintStudent, setSelectedPrintStudent] = useState<any>(null);
  const [computationResults, setComputationResults] = useState<any[]>(() => { try { return JSON.parse(localStorage.getItem('lcns_results') || '[]'); } catch { return []; } });
  const [senateInfo] = useState(() => { try { const logs = JSON.parse(localStorage.getItem('lcns_audit_logs') || '[]'); const ratLog = logs.find((l:any)=> l.action==='SENATE_RATIFICATION'); if (ratLog) return { approved: true, date: ratLog.timestamp, provost: ratLog.user || 'Mrs Terna Fiase - Provost' }; return { approved: localStorage.getItem('lcns_senate_approved')==='true', date: new Date().toISOString(), provost: 'Mrs Terna Fiase - Provost' }; } catch { return { approved: false, date: new Date().toISOString(), provost: 'Mrs Terna Fiase - Provost' }; } });
  const [examSubmissions, setExamSubmissions] = useState<any[]>(() => { try { const s1 = JSON.parse(localStorage.getItem('lcns_exam_officer_submitted') || '[]'); const s2 = JSON.parse(localStorage.getItem('lcns_results') || '[]'); return s1.length > 0 ? s1 : s2; } catch { return []; } });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editScore, setEditScore] = useState<number>(0);
  const [vetStatus, setVetStatus] = useState<string>(() => localStorage.getItem('lcns_exam_vet_status') || 'PENDING');
  const [searchVet, setSearchVet] = useState('');
  const [supabaseGpa, setSupabaseGpa] = useState<any[]>(() => { try { return JSON.parse(localStorage.getItem('lcns_supabase_gpa_cache') || '[]'); } catch { return []; } });
  const [users, setUsers] = useState<any[]>(() => { try { return JSON.parse(localStorage.getItem('lcns_users') || '[]'); } catch { return []; } });
  const [userSearch, setUserSearch] = useState('');
  const [selectedMatricForGPA, setSelectedMatricForGPA] = useState<string>('ALL');

  // ===== NEW: FROM LECTURER - WORKFLOW =====
  const [workflowRows, setWorkflowRows] = useState<any[]>([]);
  const [selectedWorkflowCourse, setSelectedWorkflowCourse] = useState<string>('');
  const [workflowSearch, setWorkflowSearch] = useState('');
  const [workflowLoading, setWorkflowLoading] = useState(false);
  const [workflowStatus, setWorkflowStatus] = useState<string|null>(null);

  // ===== NEW: CARRYOVER =====
  const [carryoverMap, setCarryoverMap] = useState<Record<string, any>>({});
  const [carryoverList, setCarryoverList] = useState<any[]>([]);
  const [carryoverSearch, setCarryoverSearch] = useState('');
  const [carryoverFilterCourse, setCarryoverFilterCourse] = useState('ALL');

  const getTitle = (c:any) => c.course_title || c.title || c.name || c.course_name || 'No Title';
  const getCode = (c:any) => c.course_code || c.code || c.course || '';
  const getUnit = (c:any) => c.credit_unit ?? c.unit ?? c.units ?? 3;
  const getLecturer = (c:any) => c.lecturer_name || c.lecturerName || c.lecturer || c.assigned_lecturer || 'Not Assigned Yet';

  const getUnitForResult = (r:any) => {
    if (r.credit_unit ?? r.unit ?? r.units) return Number(r.credit_unit ?? r.unit ?? r.units);
    const codeToFind = (r.courseCode || r.course_code || r.code || '').toString().toUpperCase().trim();
    const found = courses.find((c:any) => getCode(c).toString().toUpperCase().trim() === codeToFind);
    return found ? Number(getUnit(found)) : 3;
  };

  const gpaByMatric = useMemo(() => {
    const map: Record<string, any> = {};
    const grouped: Record<string, any[]> = {};
    examSubmissions.forEach((r:any) => {
      const matric = r.matricNo || r.matric_no || 'UNKNOWN';
      if (!grouped[matric]) grouped[matric] = [];
      grouped[matric].push({ ...r, credit_unit: getUnitForResult(r) });
    });
    Object.keys(grouped).forEach(matric => { map[matric] = calculateGPA(grouped[matric]); });
    return map;
  }, [examSubmissions, courses]);

  const uniqueMatrics = useMemo(() => Object.keys(gpaByMatric).sort(), [gpaByMatric]);

  // ===== LOAD FROM LECTURER: status = LECTURER_SUBMITTED =====
  const loadFromLecturer = async () => {
    setWorkflowLoading(true);
    try {
      const { data, error } = await supabase.from('student_results_workflow').select('*').eq('status', 'LECTURER_SUBMITTED').order('course_code').order('matric_no');
      if (error) throw error;
      setWorkflowRows(data || []);
      if (data && data.length > 0 && !selectedWorkflowCourse) {
        const first = data[0];
        setSelectedWorkflowCourse(`${first.course_code}|${first.level}|${first.session}|${first.semester}`);
      }
    } catch(e:any){ console.log('Load from lecturer failed', e); setWorkflowStatus('❌ Failed to load from Lecturer: ' + e.message); }
    setWorkflowLoading(false);
  };

  // ===== CARRYOVER: OLD F HISTORY - NEVER DELETE OLD F =====
  const loadCarryoverHistory = async () => {
    try {
      // Get ALL results to find who failed before - old F stays forever
      const { data, error } = await supabase.from('student_results_workflow').select('*').order('session', { ascending: true });
      if (error) throw error;
      const all = data || [];
      // Map for quick badge: matric|course -> old F sessions
      const map: Record<string, any> = {};
      all.forEach((r:any)=>{
        if (r.grade !== 'F') return;
        const key = `${r.matric_no}|${r.course_code}`;
        if(!map[key]) map[key] = { count: 0, sessions: [] };
        map[key].count += 1;
        if(!map[key].sessions.includes(r.session)) map[key].sessions.push(r.session);
      });
      setCarryoverMap(map);
      // Build carryover list: latest attempt per matric+course is F = still carryover
      const latest: Record<string, any> = {};
      all.forEach((r:any)=>{
        const k = `${r.matric_no}|${r.course_code}`;
        if(!latest[k] || r.session >= latest[k].session) latest[k] = r;
      });
      const stillCarry = Object.values(latest).filter((r:any)=> r.grade === 'F').map((r:any)=>{
        const key = `${r.matric_no}|${r.course_code}`;
        const hist = map[key];
        return { ...r, attempt: (hist?.count || 1), failedSessions: hist?.sessions || [r.session], isCarryover: true };
      });
      setCarryoverList(stillCarry);
    } catch(e){ console.log('Carryover load failed', e); }
  };

  const getCarryoverInfo = (matric_no:string, course_code:string, currentSession:string) => {
    const key = `${matric_no}|${course_code}`;
    const info = carryoverMap[key];
    if(!info) return null;
    const oldSessions = info.sessions.filter((s:string)=> s !== currentSession);
    if(oldSessions.length === 0) return null;
    return { attempt: oldSessions.length + 1, failedSessions: oldSessions };
  };

  // Group by course for the list on left
  const workflowGroups = useMemo(() => {
    const map: any = {};
    workflowRows.forEach((r:any)=>{
      const key = `${r.course_code}|${r.level}|${r.session}|${r.semester}`;
      if(!map[key]) map[key] = { key, course_code: r.course_code, course_title: r.course_title, level: r.level, session: r.session, semester: r.semester, count: 0, pass: 0, fail: 0, carry: 0 };
      map[key].count += 1;
      const total = Number(r.total_score ?? 0);
      if (total >= 40) map[key].pass += 1; else map[key].fail += 1;
      if (getCarryoverInfo(r.matric_no, r.course_code, r.session)) map[key].carry += 1;
    });
    return Object.values(map);
  }, [workflowRows, carryoverMap]);

  const workflowDetailRows = useMemo(() => {
    if(!selectedWorkflowCourse) return [];
    return workflowRows.filter((r:any)=> `${r.course_code}|${r.level}|${r.session}|${r.semester}` === selectedWorkflowCourse).filter((r:any)=>{
      if(!workflowSearch) return true;
      const t = workflowSearch.toLowerCase();
      return (r.matric_no||'').toLowerCase().includes(t) || (r.full_name||'').toLowerCase().includes(t);
    });
  }, [workflowRows, selectedWorkflowCourse, workflowSearch]);

  const filteredCarryovers = useMemo(()=>{
    return carryoverList.filter((r:any)=>{
      if(carryoverFilterCourse !== 'ALL' && r.course_code !== carryoverFilterCourse) return false;
      if(!carryoverSearch) return true;
      const t = carryoverSearch.toLowerCase();
      return (r.matric_no||'').toLowerCase().includes(t) || (r.full_name||'').toLowerCase().includes(t) || (r.course_code||'').toLowerCase().includes(t);
    });
  }, [carryoverList, carryoverSearch, carryoverFilterCourse]);

  const carryoverCourses = useMemo(()=>{
    const s = new Set(carryoverList.map((r:any)=> r.course_code));
    return Array.from(s).sort();
  }, [carryoverList]);

  // ===== EXAM OFFICER APPROVE ONE COURSE -> EXAM_OFFICER_APPROVED -> HOD =====
  const approveWorkflowCourse = async () => {
    if(!selectedWorkflowCourse) return;
    const [course_code, levelV, sessionV, semesterV] = selectedWorkflowCourse.split('|');
    if(!confirm(`Approve ALL ${workflowDetailRows.length} students for ${course_code} and send to HOD?`)) return;
    try {
      const { error } = await supabase.from('student_results_workflow').update({ status: 'EXAM_OFFICER_APPROVED' }).eq('course_code', course_code).eq('level', levelV).eq('session', sessionV).eq('semester', semesterV).eq('status', 'LECTURER_SUBMITTED');
      if(error) throw error;
      setWorkflowStatus(`✅ APPROVED ${course_code} - Sent to HOD!`);
      StorageService.logAction(displayEmail, displayRole,'EXAM_OFFICER_APPROVE',`Exam Officer ${displayName} approved ${course_code} ${levelV} ${sessionV} to HOD`);
      await loadFromLecturer();
      await loadCarryoverHistory();
      setSelectedWorkflowCourse('');
      setTimeout(()=>setWorkflowStatus(null), 5000);
      window.dispatchEvent(new Event('lcns_storage_update'));
    } catch(e:any){ setWorkflowStatus('❌ Approve failed: ' + e.message); }
  };

  // ===== EXAM OFFICER APPROVE ALL PENDING =====
  const approveAllWorkflow = async () => {
    if(workflowRows.length===0) return;
    if(!confirm(`Approve ALL ${workflowRows.length} results from Lecturer and send to HOD?`)) return;
    try {
      const { error } = await supabase.from('student_results_workflow').update({ status: 'EXAM_OFFICER_APPROVED' }).eq('status', 'LECTURER_SUBMITTED');
      if(error) throw error;
      setWorkflowStatus(`✅ APPROVED ALL ${workflowRows.length} results - Sent to HOD!`);
      await loadFromLecturer();
      await loadCarryoverHistory();
      setTimeout(()=>setWorkflowStatus(null), 5000);
      window.dispatchEvent(new Event('lcns_storage_update'));
    } catch(e:any){ setWorkflowStatus('❌ Approve all failed: ' + e.message); }
  };

  // ===== EXAM OFFICER REJECT ONE COURSE -> BACK TO LECTURER =====
  const rejectWorkflowCourse = async () => {
    if(!selectedWorkflowCourse) return;
    const reason = prompt('Enter reason to return to Lecturer (e.g. CA missing for 3 students):');
    if(!reason) return;
    const [course_code, levelV, sessionV, semesterV] = selectedWorkflowCourse.split('|');
    try {
      const { error } = await supabase.from('student_results_workflow').update({ status: 'REJECTED_BY_EXAM_OFFICER' }).eq('course_code', course_code).eq('level', levelV).eq('session', sessionV).eq('semester', semesterV).eq('status', 'LECTURER_SUBMITTED');
      if(error) throw error;
      localStorage.setItem('lcns_exam_return_reason', reason);
      setWorkflowStatus(`↩️ Returned ${course_code} to Lecturer. Reason: ${reason}`);
      StorageService.logAction(displayEmail, displayRole,'EXAM_OFFICER_RETURN_TO_LECTURER',`Exam Officer returned ${course_code}: ${reason}`);
      await loadFromLecturer();
      setSelectedWorkflowCourse('');
      setTimeout(()=>setWorkflowStatus(null), 5000);
      window.dispatchEvent(new Event('lcns_storage_update'));
    } catch(e:any){ setWorkflowStatus('❌ Reject failed: ' + e.message); }
  };

  // ===== EXAM OFFICER REJECT ONE STUDENT =====
  const rejectOneStudent = async (row:any) => {
    const reason = prompt(`Reject ${row.matric_no} - ${row.full_name}? Enter reason:`);
    if(!reason) return;
    try {
      const { error } = await supabase.from('student_results_workflow').update({ status: 'REJECTED_BY_EXAM_OFFICER' }).eq('id', row.id);
      if(error) throw error;
      setWorkflowStatus(`↩️ ${row.matric_no} returned to Lecturer: ${reason}`);
      await loadFromLecturer();
    } catch(e:any){ setWorkflowStatus('❌ Reject failed: ' + e.message); }
  };

  const loadVetData = async () => {
    try {
      const { data } = await supabase.from('student_gpa_view').select('*');
      if(data) setSupabaseGpa(data);
      const { data: scores } = await supabase.from('student_results_workflow').select('*').order('matric_no');
      if(scores && scores.length > 0) setExamSubmissions(scores);
      const { data: allUsers } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if(allUsers && allUsers.length>0){
        const formatted = allUsers.map((u:any)=>({ id: u.id, email: u.email, fullName: u.full_name||u.fullName, role: u.role, department: u.department, status: u.status||'ACTIVE', phone: u.phone, matricNumber: u.matric_no||u.matric_no, matric_no: u.matric_no||'', staffId: u.staff_id||'', level: u.level||'', createdAt: u.created_at, sex: u.sex||u.gender||'', stateOfOrigin: u.state_of_origin||'' }));
        setUsers(formatted);
        localStorage.setItem('lcns_users', JSON.stringify(formatted));
      }
      try {
        const supCourses = await ApiService.getAllCourses();
        const supAssignments = await ApiService.getAllAssignments();
        const map: any = {};
        (supAssignments || []).forEach((a:any)=>{ map[a.course_id] = a.lecturer_name; });
        if (supCourses && supCourses.length > 0) {
          const withLecturer = supCourses.map((c:any)=> ({ ...c, course_title: c.course_title || c.title, title: c.course_title || c.title, course_code: c.course_code || c.code, code: c.course_code || c.code, credit_unit: c.credit_unit ?? c.unit ?? 3, units: c.credit_unit ?? c.unit ?? 3, lecturer_name: map[c.id] || c.lecturer_name || 'Not Assigned Yet', lecturerName: map[c.id] || c.lecturer_name || 'Not Assigned Yet' }));
          setCourses(withLecturer as any);
          localStorage.setItem('lcns_courses', JSON.stringify(withLecturer));
        }
      } catch(e){ console.log('Exam Officer courses fallback', e); }
    } catch {}
  };
  useEffect(() => { loadVetData(); loadFromLecturer(); loadCarryoverHistory(); }, []);

  const handleManualCorrection = (id: string) => {
    const updated = examSubmissions.map((r:any) => r.id === id || r.scoreId === id ? {...r, score: editScore, totalScore: editScore, total_score: editScore} : r);
    localStorage.setItem('lcns_results', JSON.stringify(updated));
    localStorage.setItem('lcns_exam_officer_submitted', JSON.stringify(updated));
    setExamSubmissions(updated);
    setComputationResults(updated);
    setEditingId(null);
    StorageService.logAction(displayEmail, displayRole,'EXAM_OFFICER_MANUAL_CORRECTION',`Exam Officer ${displayName} corrected score ${id} to ${editScore}`);
    alert(`✅ Score corrected to ${editScore} and saved!`);
  };

  const handleForwardToRegistrar = () => {
    if(examSubmissions.length === 0) { alert('No results to forward'); return; }
    localStorage.setItem('lcns_exam_forwarded_to_hod', 'true');
    localStorage.setItem('lcns_exam_forwarded_date', new Date().toISOString());
    localStorage.setItem('lcns_exam_vet_status', 'FORWARDED_TO_HOD');
    localStorage.setItem('lcns_results_exam_vetted', JSON.stringify(examSubmissions));
    localStorage.setItem('lcns_results_hod_inbox', JSON.stringify(examSubmissions));
    localStorage.setItem('lcns_exam_officer_submitted', JSON.stringify(examSubmissions));
    setVetStatus('FORWARDED_TO_HOD');
    StorageService.logAction(displayEmail, displayRole,'EXAM_OFFICER_FORWARD_TO_HOD',`Exam Officer ${displayName} vetted and forwarded ${examSubmissions.length} results to HOD`);
    alert(`✅ Exam Officer Vetted OK! Forwarded ${examSubmissions.length} results to HOD.`);
    window.dispatchEvent(new Event('lcns_storage_update'));
  };

  const handleReturnToExamOfficer = () => {
    const reason = prompt('Enter reason to return to Lecturer:');
    if(!reason) return;
    localStorage.setItem('lcns_exam_vet_status', 'RETURNED_TO_LECTURER');
    localStorage.setItem('lcns_exam_return_reason', reason);
    localStorage.setItem('lcns_exam_return_date', new Date().toISOString());
    localStorage.setItem('lcns_results_returned_to_lecturer', JSON.stringify({reason, date: new Date().toISOString(), by: displayName}));
    setVetStatus('RETURNED_TO_LECTURER');
    StorageService.logAction(displayEmail, displayRole,'EXAM_OFFICER_RETURN_TO_LECTURER',`Exam Officer ${displayName} returned result to Lecturer: ${reason}`);
    alert(`↩️ Returned to Lecturer. Reason: ${reason}`);
  };

  const downloadMasterPDF = () => {
    const rows = examSubmissions.map((r:any)=>{
      const score = Number(r.score ?? r.total_score ?? 0);
      const unit = getUnitForResult(r);
      const { grade, point } = getGradePoint(score);
      const qp = (point * unit).toFixed(1);
      return `<tr><td>${r.matricNo||r.matric_no}</td><td>${r.fullName||''}</td><td>${r.courseCode||r.course_code}</td><td>${unit}</td><td><b>${score}</b></td><td>${grade}</td><td>${point.toFixed(1)}</td><td>${qp}</td><td>${gpaByMatric[r.matricNo||r.matric_no]?.gpa ?? '-'}</td></tr>`;
    }).join('');
    const html = `<html><head><style>body{font-family:Arial; font-size:10px;} table{width:100%; border-collapse:collapse;} th,td{border:1px solid #000; padding:4px; text-align:center;} th{background:#0a4d2e; color:#fff;} .header{text-align:center; border-bottom:3px solid #000;}</style></head><body><div class="header"><h2>LABE COLLEGE - EXAM OFFICER VETTED - ${levelFilter}</h2><p>Exam Officer: ${displayName} | Status: ${vetStatus} | Grading: NBTE 4.0 Scale (A=4.0, AB=3.5, B=3.0, BC=2.5, C=2.0, CD=1.5, D=1.0, F=0)</p></div><table><tr><th>Matric</th><th>Name</th><th>Course</th><th>Unit</th><th>Total</th><th>Grade</th><th>Point</th><th>QP</th><th>CGPA</th></tr>${rows}</table></body></html>`;
    const win = window.open('', '_blank'); if(win){ win.document.write(html); win.document.close(); win.focus(); setTimeout(()=>win.print(), 500); }
  };

  const downloadMasterExcel = () => {
    let csv = 'Matric,Name,Course,Unit,Total,Grade,GradePoint,QualityPoint,CGPA\n';
    examSubmissions.forEach((r:any)=>{
      const score = Number(r.score ?? r.total_score ?? 0);
      const unit = getUnitForResult(r);
      const { grade, point } = getGradePoint(score);
      const qp = point * unit;
      const cgpa = gpaByMatric[r.matricNo||r.matric_no]?.gpa ?? '';
      csv += `"${r.matricNo||r.matric_no}","${r.fullName||''}","${r.courseCode||r.course_code}","${unit}","${score}","${grade}","${point}","${qp}","${cgpa}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `ExamOfficer_Master_${new Date().toISOString().slice(0,10)}.csv`; document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const filteredVet = examSubmissions.filter((r:any)=>{
    if(selectedMatricForGPA !== 'ALL' && (r.matricNo||r.matric_no) !== selectedMatricForGPA) return false;
    if(!searchVet) return true;
    const term = searchVet.toLowerCase();
    return (r.matricNo||r.matric_no||'').toLowerCase().includes(term) || (r.fullName||'').toLowerCase().includes(term) || (r.courseCode||r.course_code||'').toLowerCase().includes(term);
  });
  const filteredStudents = students.filter((s: any) => { if (levelFilter !== 'ALL' && s.level !== levelFilter) return false; if (!searchBiodata) return true; return `${s.fullName} ${s.matricNo}`.toLowerCase().includes(searchBiodata.toLowerCase()); });
  const filteredIndividual = students.filter((s: any) => { if (!searchIndividual) return true; const term = searchIndividual.toLowerCase().trim(); return s.fullName.toLowerCase().includes(term) || s.matricNo.toLowerCase().includes(term); });
  const handleCreateCourse = (e: React.FormEvent) => { e.preventDefault(); if (!code || !title) return; const newCourse: Course = { id: 'crs-' + Date.now(), code: code.toUpperCase(), title, units, level, semester, department: 'Nursing Sciences', lecturerName, }; const updated = [...courses, newCourse]; StorageService.saveCourses(updated); setCourses(updated); StorageService.logAction(displayEmail, displayRole,'ADD_COURSE',`Allocated course ${code}: ${title} to ${lecturerName}`); setCode(''); setTitle(''); setShowAddCourse(false); };
  
  const filteredUsers = users.filter((u:any)=> u.role==='STUDENT').filter((u:any)=>{
    if(!userSearch) return true;
    const t=userSearch.toLowerCase();
    return (u.fullName||'').toLowerCase().includes(t) || (u.matricNumber||u.matric_no||'').toLowerCase().includes(t) || (u.phone||'').toLowerCase().includes(t) || (u.sex||'').toLowerCase().includes(t);
  });

  const currentGPA = selectedMatricForGPA === 'ALL' ? null : gpaByMatric[selectedMatricForGPA];

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-emerald-800 px-3 py-1 rounded-full">EXAM OFFICER • {displayRole} • {displayEmail} • Students: {filteredUsers.length} • Courses: {courses.length} • Carryovers: {carryoverList.length}</span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase mt-2">{displayName}</h1>
            <p className="text-xs text-emerald-200">Exam Officer — First Approval for Course Registration — First Vetting for Results — Then HOD — Backend: {users.length}</p>
            {workflowStatus && <div className="mt-3 p-3 bg-emerald-500/20 border border-emerald-400 rounded-xl text-xs font-bold">{workflowStatus}</div>}
          </div>
          <button onClick={() => setShowAddCourse(true)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl shadow-md"><Plus className="w-4 h-4"/><span>Allocate New Course</span></button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <button onClick={() => { loadFromLecturer(); loadCarryoverHistory(); setActiveTab('from_lecturer'); }} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='from_lecturer'?'bg-purple-700 text-white shadow ring-2 ring-purple-300':'bg-purple-50 border-2 border-purple-400 text-purple-800'}`}><Download className="w-4 h-4"/><span>📥 From Lecturer</span><span className="px-2 py-0.5 rounded-full text-[10px] bg-red-600 text-white">{workflowRows.length}</span></button>
        <button onClick={() => { loadCarryoverHistory(); setActiveTab('carryover'); }} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='carryover'?'bg-red-700 text-white shadow ring-2 ring-red-300':'bg-red-50 border-2 border-red-400 text-red-800'}`}><span>🔴 Carryovers</span><span className="px-2 py-0.5 rounded-full text-[10px] bg-red-600 text-white">{carryoverList.length}</span></button>
        <button onClick={() => setActiveTab('users')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='users'?'bg-slate-900 text-white shadow ring-2 ring-amber-300':'bg-slate-50 border-2 border-amber-400 text-slate-800'}`}><Users className="w-4 h-4"/><span>👤 Students - {filteredUsers.length}</span></button>
        <button onClick={() => setActiveTab('vet_result')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='vet_result'?'bg-orange-600 text-white shadow ring-2 ring-orange-300':'bg-orange-50 border-2 border-orange-400 text-orange-900'}`}><CheckCircle2 className="w-4 h-4"/><span>🔍 EXAM OFFICER VET RESULT</span><span className="px-2 py-0.5 rounded-full text-[10px] bg-red-600 text-white">{examSubmissions.length}</span></button>
        <button onClick={() => setActiveTab('course_reg')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='course_reg'?'bg-blue-700 text-white shadow ring-2 ring-blue-300':'bg-blue-50 border-2 border-blue-400 text-blue-800'}`}><BookOpen className="w-4 h-4"/><span>📚 Course Registration — First Approval</span></button>
        <button onClick={() => setActiveTab('scoresheets')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='scoresheets'?'bg-emerald-700 text-white shadow ring-2 ring-emerald-300':'bg-emerald-50 border-2 border-emerald-400 text-emerald-800'}`}><Download className="w-4 h-4"/><span>📄 Score Sheets</span></button>
        <button onClick={() => setActiveTab('biodata')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab==='biodata'?'bg-[#0a4d2e] text-white':'text-slate-600 hover:bg-slate-100'}`}><Users className="w-4 h-4"/><span>👨‍🎓 Biodata</span></button>
        <button onClick={() => setActiveTab('courses')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab==='courses'?'bg-[#0a4d2e] text-white':'text-slate-600 hover:bg-slate-100'}`}><BookOpen className="w-4 h-4"/><span>Courses - {courses.length}</span></button>
        <button onClick={() => setActiveTab('admissions_all')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab==='admissions_all'?'bg-purple-700 text-white':'bg-purple-50 border border-purple-300 text-purple-800'}`}><GraduationCap className="w-4 h-4"/><span>🎓 Applicants</span></button>
        <button onClick={() => setActiveTab('individual_result')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='individual_result'?'bg-slate-900 text-white shadow ring-2 ring-amber-400':'bg-amber-50 border-2 border-amber-400 text-amber-900'}`}><Printer className="w-4 h-4"/><span>🖨️ Print Result</span></button>
      </div>

      {activeTab==='carryover' && (
        <div className="bg-white rounded-3xl border-2 border-red-400 p-6 space-y-4">
          <div className="bg-red-50 border-2 border-red-300 p-4 rounded-xl">
            <h2 className="text-lg font-black text-red-900">🔴 CARRYOVERS — Latest Attempt is F — Must Re-register Next Year</h2>
            <p className="text-xs font-bold mt-1">Rule: Old F is NEVER deleted. New attempt is added. Latest attempt counts for CGPA. Student cannot graduate until all carryovers are passed.</p>
            <p className="text-xs mt-1">Total carryovers: <b>{carryoverList.length}</b> | Students affected: <b>{new Set(carryoverList.map((r:any)=>r.matric_no)).size}</b></p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={loadCarryoverHistory} className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black">🔄 Refresh Carryovers</button>
            <select value={carryoverFilterCourse} onChange={e=>setCarryoverFilterCourse(e.target.value)} className="px-3 py-2.5 border-2 rounded-xl text-xs font-black"><option value="ALL">All Courses</option>{carryoverCourses.map((c:string)=><option key={c} value={c}>{c}</option>)}</select>
            <div className="flex items-center gap-2 bg-slate-50 border rounded-xl px-3 flex-1 min-w-[200px]"><Search className="w-4 h-4"/><input value={carryoverSearch} onChange={e=>setCarryoverSearch(e.target.value)} placeholder="Search Matric / Name / Course" className="py-2 text-xs font-bold outline-none bg-transparent w-full"/></div>
          </div>
          {filteredCarryovers.length===0 && <div className="p-8 text-center text-gray-500 text-sm">✅ No carryovers — all students passed latest attempt.</div>}
          <div className="overflow-x-auto border-2 rounded-xl"><table className="w-full text-xs"><thead className="bg-red-900 text-white"><tr><th className="p-2">Matric</th><th className="p-2 text-left">Name</th><th className="p-2">Course</th><th className="p-2">Failed Session</th><th className="p-2">Total</th><th className="p-2">Attempt</th><th className="p-2">Action Needed</th></tr></thead><tbody>
            {filteredCarryovers.map((r:any)=>(
              <tr key={`${r.matric_no}-${r.course_code}`} className="border-b bg-red-50/50">
                <td className="p-2 font-mono font-bold">{r.matric_no}</td>
                <td className="p-2 font-bold">{r.full_name}<div><span className="px-2 py-0.5 bg-red-600 text-white rounded-full text-[10px] font-black">🔴 CARRYOVER - Attempt {r.attempt}</span></div></td>
                <td className="p-2 font-mono font-bold">{r.course_code}<div className="text-[10px] font-normal">{r.course_title}</div></td>
                <td className="p-2 text-center">{r.session} • {r.semester}</td>
                <td className="p-2 text-center font-black">{r.total_score} (F)</td>
                <td className="p-2 text-center font-black">{r.attempt}</td>
                <td className="p-2 text-center text-[11px] font-bold text-red-700">Re-register {r.course_code} next session</td>
              </tr>
            ))}
          </tbody></table></div>
        </div>
      )}

      {activeTab==='from_lecturer' && (
        <div className="bg-white rounded-3xl border-2 border-purple-400 p-6 space-y-4">
          <div className="bg-purple-50 border-2 border-purple-300 p-4 rounded-xl">
            <h2 className="text-lg font-black text-purple-900">📥 Scoresheets From Lecturer — Waiting For Exam Officer</h2>
            <p className="text-xs font-bold mt-1">Flow: Lecturer SUBMIT → Exam Officer APPROVES → HOD → Registrar → Published</p>
            <p className="text-xs mt-1">Total waiting: <b>{workflowRows.length} results</b> in <b>{workflowGroups.length} courses</b> | CA + Exam + Total + Grade auto-calculated by Supabase</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={()=>{loadFromLecturer(); loadCarryoverHistory();}} className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black">🔄 Refresh From Lecturer</button>
            <button onClick={approveAllWorkflow} disabled={workflowRows.length===0} className="px-4 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-black">✅ APPROVE ALL → Send to HOD ({workflowRows.length})</button>
          </div>
          {workflowLoading && <p className="text-xs font-bold">Loading...</p>}
          {workflowGroups.length===0 && !workflowLoading && <div className="p-8 text-center text-gray-500 text-sm">No scoresheet from Lecturer yet.<br/>Lecturer must click SEND TO EXAM OFFICER first.<br/>Check Supabase table <b>student_results_workflow</b> where status = LECTURER_SUBMITTED</div>}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-xs font-black">SELECT COURSE</p>
              {workflowGroups.map((g:any)=>(
                <button key={g.key} onClick={()=>setSelectedWorkflowCourse(g.key)} className={`w-full text-left p-3 rounded-xl border-2 text-xs ${selectedWorkflowCourse===g.key?'bg-purple-700 text-white border-purple-700':'bg-white border-purple-200'}`}>
                  <p className="font-mono font-black">{g.course_code} — {g.course_title}</p>
                  <p>{g.level} • {g.semester} • {g.session} • {g.count} students</p>
                  <p>✅ Pass: {g.pass} | ❌ Fail: {g.fail} | 🔴 Carryovers: {g.carry}</p>
                </button>
              ))}
            </div>
            <div className="md:col-span-2 space-y-3">
              {selectedWorkflowCourse && (
                <>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={approveWorkflowCourse} className="px-4 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-black">✅ APPROVE THIS COURSE → HOD</button>
                    <button onClick={rejectWorkflowCourse} className="px-4 py-2.5 bg-red-700 text-white rounded-xl text-xs font-black">↩️ REJECT THIS COURSE → Lecturer</button>
                    <div className="flex items-center gap-2 bg-slate-50 border rounded-xl px-3 flex-1"><Search className="w-4 h-4"/><input value={workflowSearch} onChange={e=>setWorkflowSearch(e.target.value)} placeholder="Search Matric / Name" className="py-2 text-xs font-bold outline-none bg-transparent w-full"/></div>
                  </div>
                  <div className="overflow-x-auto border-2 rounded-xl"><table className="w-full text-xs"><thead className="bg-purple-900 text-white"><tr><th className="p-2">Matric</th><th className="p-2 text-left">Name</th><th className="p-2">CA</th><th className="p-2">Exam</th><th className="p-2">Total</th><th className="p-2">Grade</th><th className="p-2">Point</th><th className="p-2">Action</th></tr></thead><tbody>
                    {workflowDetailRows.map((r:any)=>{
                      const co = getCarryoverInfo(r.matric_no, r.course_code, r.session);
                      return (
                      <tr key={r.id} className={`border-b ${r.grade==='F'?'bg-red-50': co?'bg-amber-50':''}`}>
                        <td className="p-2 font-mono font-bold">{r.matric_no}</td>
                        <td className="p-2 font-bold">{r.full_name}{co && <div className="mt-1"><span className="px-2 py-0.5 bg-red-600 text-white rounded-full text-[10px] font-black">🔴 CARRYOVER - Attempt {co.attempt} - Failed: {co.failedSessions.join(', ')}</span></div>}</td>
                        <td className="p-2 text-center">{r.ca_score}</td>
                        <td className="p-2 text-center">{r.exam_score}</td>
                        <td className="p-2 text-center font-black">{r.total_score}</td>
                        <td className="p-2 text-center font-black">{r.grade}</td>
                        <td className="p-2 text-center">{r.grade_point}</td>
                        <td className="p-2 text-center"><button onClick={()=>rejectOneStudent(r)} className="px-2 py-1 bg-red-600 text-white rounded text-[10px] font-black">Reject Student</button></td>
                      </tr>
                      );
                    })}
                  </tbody></table></div>
                </>
              )}
              {!selectedWorkflowCourse && workflowGroups.length>0 && <p className="text-xs text-gray-500 p-4">Select a course on the left to vet it.</p>}
            </div>
          </div>
        </div>
      )}

      {activeTab==='users' && (
        <div className="bg-white rounded-3xl border-4 border-amber-400 p-6 space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-3">
            <div>
              <h2 className="text-lg font-black flex items-center gap-2"><Users className="w-5 h-5 text-amber-700"/>Students - {filteredUsers.length} - Only Matric, Name, Sex, Phone</h2>
              <p className="text-xs font-bold bg-green-50 border border-green-300 p-2 rounded mt-1">✅ Exam Officer sees ONLY: Matric No + Full Name + Sex + Phone — No Password, No Email — Privacy Protected</p>
            </div>
            <div className="flex items-center gap-1 bg-white border-2 rounded-xl px-3"><Search className="w-4 h-4"/><input value={userSearch} onChange={e=>setUserSearch(e.target.value)} placeholder="Search Matric, Name, Sex, Phone" className="py-2 text-xs font-bold outline-none w-64"/></div>
          </div>
          <div className="overflow-x-auto border-2 rounded-xl">
            <table className="w-full text-xs">
              <thead className="bg-slate-900 text-white"><tr><th className="p-3 text-left">Matric Number</th><th className="p-3 text-left">Full Name</th><th className="p-2 text-center">Sex</th><th className="p-3 text-left">Phone</th><th className="p-3 text-center">CGPA</th></tr></thead>
              <tbody>
                {filteredUsers.map((u:any)=>{
                  const matric = u.matricNumber || u.matric_no;
                  const g = gpaByMatric[matric];
                  return (
                  <tr key={u.email} className="border-b hover:bg-amber-50">
                    <td className="p-3 font-mono font-black text-emerald-800 bg-emerald-50">{matric || '-'}</td>
                    <td className="p-3 font-black uppercase">{u.fullName}</td>
                    <td className="p-2 text-center"><span className={`px-2 py-1 rounded-full text-[10px] font-black ${u.sex==='FEMALE'?'bg-pink-100 text-pink-800':'bg-blue-100 text-blue-800'}`}>{u.sex || '-'}</span></td>
                    <td className="p-3 font-mono font-bold">{u.phone || '-'}</td>
                    <td className="p-3 text-center font-black text-emerald-700">{g ? g.gpa.toFixed(2) : '-'}</td>
                  </tr>
                  );
                })}
                {filteredUsers.length===0 && <tr><td colSpan={5} className="p-8 text-center font-bold text-slate-500">No students found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab==='vet_result' && (
        <div className="bg-white rounded-3xl border-2 border-orange-400 p-6 space-y-6">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300 p-4 rounded-xl">
            <h2 className="text-lg font-black flex items-center gap-2 text-orange-900"><CheckCircle2 className="w-6 h-6"/> EXAM OFFICER VETTING PANEL — FIRST VETTING</h2>
            <p className="text-xs font-bold mt-1">Flow: Lecturer submits → Exam Officer vets → Forward to HOD → HOD vets → Forward to Registrar → Provost / Senate</p>
            <p className="text-[11px] font-bold mt-1 text-slate-600">Grading: A (70+) = 4.0 | AB (60-69) = 3.5 | B (50-59) = 3.0 | BC (45-49) = 2.5 | C (40-44) = 2.0 | CD (35-39) = 1.5 | D (30-34) = 1.0 | F (0-29) = 0</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black ${vetStatus==='FORWARDED_TO_HOD'?'bg-green-600 text-white': vetStatus==='RETURNED_TO_LECTURER'?'bg-red-600 text-white':'bg-yellow-400 text-black'}`}>Status: {vetStatus}</span>
              <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-xs font-black">{examSubmissions.length} Records</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-emerald-900 text-white p-4 rounded-2xl">
              <p className="text-[10px] font-bold tracking-widest">SELECT STUDENT FOR GPA</p>
              <select value={selectedMatricForGPA} onChange={e=>setSelectedMatricForGPA(e.target.value)} className="mt-2 w-full p-2 rounded-lg text-slate-900 text-xs font-black">
                <option value="ALL">ALL STUDENTS — See CGPA List Below</option>
                {uniqueMatrics.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              {currentGPA && (
                <div className="mt-3 bg-white/10 p-3 rounded-xl">
                  <p className="text-3xl font-black">{currentGPA.gpa.toFixed(2)}</p>
                  <p className="text-[11px]">GPA / CGPA for {selectedMatricForGPA}</p>
                  <p className="text-[11px]">Quality Points: {currentGPA.totalPoints.toFixed(1)} / Units: {currentGPA.totalUnits}</p>
                  <p className="text-[11px]">Courses: {currentGPA.detailed.length} | Formula: QP ÷ Units</p>
                </div>
              )}
            </div>
            <div className="bg-white border-2 border-emerald-200 p-4 rounded-2xl col-span-2">
              <p className="text-xs font-black">CGPA LIST — ALL STUDENTS</p>
              <div className="mt-2 max-h-32 overflow-auto">
                <table className="w-full text-xs"><thead><tr><th className="text-left p-1">Matric</th><th className="p-1">Courses</th><th className="p-1">QP</th><th className="p-1">Units</th><th className="p-1">CGPA</th></tr></thead><tbody>
                  {uniqueMatrics.map(m => { const g = gpaByMatric[m]; return <tr key={m} className="border-b"><td className="p-1 font-mono font-bold">{m}</td><td className="p-1 text-center">{g.detailed.length}</td><td className="p-1 text-center">{g.totalPoints.toFixed(1)}</td><td className="p-1 text-center">{g.totalUnits}</td><td className="p-1 text-center font-black text-emerald-700">{g.gpa.toFixed(2)}</td></tr> }) }
                  {uniqueMatrics.length===0 && <tr><td colSpan={5} className="p-2 text-center text-slate-400">No results yet</td></tr>}
                </tbody></table>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={downloadMasterPDF} className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black flex items-center gap-2"><Printer className="w-4 h-4"/> Print PDF</button>
            <button onClick={downloadMasterExcel} className="px-4 py-2.5 bg-green-700 text-white rounded-xl text-xs font-black flex items-center gap-2"><FileSpreadsheet className="w-4 h-4"/> Excel</button>
            <button onClick={handleForwardToRegistrar} className="px-4 py-2.5 bg-blue-700 text-white rounded-xl text-xs font-black flex items-center gap-2"><ArrowRight className="w-4 h-4"/> Forward to HOD</button>
            <button onClick={handleReturnToExamOfficer} className="px-4 py-2.5 bg-red-700 text-white rounded-xl text-xs font-black flex items-center gap-2"><ArrowLeft className="w-4 h-4"/> Return to Lecturer</button>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border"><Search className="w-4 h-4 text-orange-600"/><input value={searchVet} onChange={e=>setSearchVet(e.target.value)} placeholder="Search by Matric, Name, Course" className="flex-1 py-2 text-xs font-bold outline-none bg-transparent"/></div>
          <div className="overflow-x-auto border-2 rounded-xl"><table className="w-full text-xs"><thead className="bg-orange-900 text-white"><tr><th className="p-2">Matric</th><th className="p-2">Name</th><th className="p-2">Course</th><th className="p-2">Unit</th><th className="p-2">Total</th><th className="p-2">Grade</th><th className="p-2">Point</th><th className="p-2">QP</th><th className="p-2">CGPA</th><th className="p-2">Manual</th></tr></thead><tbody>{filteredVet.map((r:any, idx:number)=>{ const score = Number(r.score ?? r.total_score ?? 0); const unit = getUnitForResult(r); const { grade, point } = getGradePoint(score); const qp = point * unit; const cgpa = gpaByMatric[r.matricNo||r.matric_no]?.gpa; const isEditing = editingId === (r.id||r.scoreId||idx.toString()); return (<tr key={idx} className={`border-b ${grade==='F'?'bg-red-50':''}`}><td className="p-2 font-mono font-bold">{r.matricNo||r.matric_no}</td><td className="p-2 font-bold">{r.fullName||''}</td><td className="p-2 font-mono">{r.courseCode||r.course_code}</td><td className="p-2 text-center">{unit}</td><td className="p-2 text-center font-black">{isEditing ? <input type="number" value={editScore} onChange={e=>setEditScore(Number(e.target.value))} className="w-16 border-2 border-blue-500 rounded p-1 text-center"/> : score}</td><td className="p-2 text-center font-bold">{grade}</td><td className="p-2 text-center">{point.toFixed(1)}</td><td className="p-2 text-center font-bold">{qp.toFixed(1)}</td><td className="p-2 text-center font-black text-emerald-700">{cgpa != null ? cgpa.toFixed(2) : '-'}</td><td className="p-2 text-center">{isEditing ? <div className="flex gap-1"><button onClick={()=>handleManualCorrection(r.id||r.scoreId||idx.toString())} className="px-2 py-1 bg-green-600 text-white rounded text-[10px] font-black">Save</button><button onClick={()=>setEditingId(null)} className="px-2 py-1 bg-slate-200 rounded text-[10px]">Cancel</button></div> : <button onClick={()=>{setEditingId(r.id||r.scoreId||idx.toString()); setEditScore(score);}} className="px-2 py-1 bg-amber-500 text-black rounded text-[10px] font-black">Edit</button>}</td></tr>); })}</tbody></table></div>
        </div>
      )}

      {activeTab==='individual_result' && (
        <div className="bg-white rounded-3xl border-2 border-amber-300 p-6 space-y-6">
          <div className="flex flex-wrap gap-2 bg-slate-50 p-3 rounded-xl border"><div className="flex items-center gap-2 flex-1 bg-white border-2 border-amber-400 rounded-xl px-3"><Search className="w-4 h-4 text-amber-600"/><input value={searchIndividual} onChange={e=>setSearchIndividual(e.target.value)} placeholder="Search by Name and Matric No" className="flex-1 py-2.5 text-xs font-black outline-none"/></div></div>
          {!selectedPrintStudent ? (<div className="overflow-x-auto border-2 rounded-xl"><table className="w-full text-xs"><thead className="bg-slate-900 text-white"><tr><th className="p-3 text-left">Matric + Name</th><th className="p-3">Level</th><th className="p-3">CGPA</th><th className="p-3 text-center">Print</th></tr></thead><tbody>{filteredIndividual.map((s:any) => { const g = gpaByMatric[s.matricNo]; return (<tr key={s.matricNo} className="border-b hover:bg-amber-50"><td className="p-3"><p className="font-mono font-black text-emerald-800">{s.matricNo}</p><p className="font-black uppercase">{s.fullName}</p></td><td className="p-3 font-bold">{s.level}</td><td className="p-3 text-center font-black text-emerald-700">{g ? g.gpa.toFixed(2) : '-'}</td><td className="p-3 text-center"><button onClick={()=>setSelectedPrintStudent(s)} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black flex items-center gap-2 mx-auto"><Printer className="w-4 h-4"/> Print</button></td></tr>) })}</tbody></table></div>) : (<div className="space-y-4"><div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border"><p className="font-black text-sm">Selected: {selectedPrintStudent.fullName} - {selectedPrintStudent.matricNo} | CGPA: {gpaByMatric[selectedPrintStudent.matricNo]?.gpa?.toFixed(2) ?? '-'}</p><button onClick={()=>setSelectedPrintStudent(null)} className="px-4 py-2 bg-slate-200 rounded-xl text-xs font-black">← Back</button></div><PrintableResultWithLogo matricNo={selectedPrintStudent.matricNo} fullName={selectedPrintStudent.fullName} level={selectedPrintStudent.level} program={selectedPrintStudent.program} results={computationResults.filter((r:any)=> r.matricNo===selectedPrintStudent.matricNo)} currentUserRole="EXAM_OFFICER" currentUserName={displayName} senateApproved={senateInfo.approved} senateDate={senateInfo.date} senateProvost={senateInfo.provost} /></div>)}
        </div>
      )}

      {activeTab==='course_reg' ? <CourseRegistrationApproval currentUser={currentUser} /> : activeTab==='scoresheets' ? <ScoreSheetViewer currentUser={currentUser} /> : activeTab==='biodata' ? (
        <div className="bg-white rounded-3xl border-2 border-emerald-300 p-4 space-y-4">
          <div className="flex items-center gap-2 bg-white border rounded-xl px-3"><Search className="w-4 h-4 text-slate-400"/><input value={searchBiodata} onChange={e=>setSearchBiodata(e.target.value)} placeholder="Search Name, Matric" className="flex-1 py-2 text-xs font-bold outline-none"/></div>
          <div className="overflow-x-auto border-2 rounded-xl"><table className="w-full text-xs"><thead className="bg-slate-900 text-white"><tr><th className="p-2">Matric</th><th className="p-2">Name</th><th className="p-2">Level</th></tr></thead><tbody>{filteredStudents.map((s:any)=><tr key={s.matricNo} className="border-b"><td className="p-2 font-mono">{s.matricNo}</td><td className="p-2 font-bold">{s.fullName}</td><td className="p-2">{s.level}</td></tr>)}</tbody></table></div>
        </div>
      ) : activeTab==='admissions_all' ? <AdminAdmissionManager currentUser={currentUser} /> : activeTab==='courses' ? (
        <div className="bg-white rounded-3xl border p-6">
          <p className="text-xs font-bold mb-3 bg-blue-50 border p-2 rounded">Courses from Admin + Registrar assignments — Title, Code, Unit, Lecturer</p>
          <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-900 text-white font-bold"><tr><th className="p-3">Code</th><th className="p-3">Title</th><th className="p-3 text-center">Units</th><th className="p-3">Level</th><th className="p-3">Semester</th><th className="p-3">Lecturer Assigned by Registrar</th></tr></thead><tbody>{courses.map((c:any)=><tr key={c.id} className="border-b"><td className="p-3 font-mono font-bold">{getCode(c)}</td><td className="p-3 font-bold">{getTitle(c)}</td><td className="p-3 text-center font-black">{getUnit(c)}</td><td className="p-3">{c.level}</td><td className="p-3">{c.semester}</td><td className="p-3">{getLecturer(c)}</td></tr>)}</tbody></table></div>
          {courses.length===0 && <p className="p-6 text-center text-gray-500">No courses yet — Admin needs to add courses, Registrar assigns lecturer.</p>}
        </div>
      ) : null}

      {showAddCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border space-y-4">
            <h3 className="text-base font-bold uppercase">Allocate Course - Exam Officer {displayName}</h3>
            <form onSubmit={handleCreateCourse} className="space-y-3 text-xs">
              <div><label className="block font-bold mb-1">Course Code *</label><input type="text" required value={code} onChange={e=>setCode(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs uppercase"/></div>
              <div><label className="block font-bold mb-1">Course Title *</label><input type="text" required value={title} onChange={e=>setTitle(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs"/></div>
              <div className="grid grid-cols-2 gap-3"><div><label className="block font-bold mb-1">Units</label><input type="number" min="1" max="6" value={units} onChange={e=>setUnits(Number(e.target.value))} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold"/></div><div><label className="block font-bold mb-1">Level</label><select value={level} onChange={e=>setLevel(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs"><option>ND 1</option><option>ND 2</option><option>HND 1</option><option>HND 2</option></select></div></div>
              <div><label className="block font-bold mb-1">Lecturer *</label><input type="text" required value={lecturerName} onChange={e=>setLecturerName(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs"/></div>
              <div className="pt-3 flex justify-end gap-2"><button type="button" onClick={()=>setShowAddCourse(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold">Cancel</button><button type="submit" className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold">Save</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ExamOfficerDashboard;

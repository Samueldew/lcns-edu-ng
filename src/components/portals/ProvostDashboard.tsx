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
  Printer,
  Download,
  FileSpreadsheet,
  Edit,
  ArrowLeft,
  Eye,
  EyeOff,
} from 'lucide-react';
import { CBTExamManager } from '../cbt/CBTExamManager';
import { AdmissionProcessingView } from './AdmissionProcessingView';
import { AdminAdmissionManager } from '../admin/AdminAdmissionManager';
import { AdminStudentsBiodata } from '../admin/AdminStudentsBiodata';
import { PrintableResultWithLogo } from '../common/PrintableResultWithLogo';
import { AdminExamSettings } from './AdminExamSettings';
import { supabase } from '@/lib/supabase';

export const ProvostDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'admissions' | 'admissions_all' | 'cbt' | 'students_biodata' | 'individual_result' | 'result_publish' | 'entrance_exam' | 'provost_vet' | 'semester_print'>('provost_vet');
  const students = StorageService.getStudents();
  const applicants = StorageService.getApplicants();
  const payments = StorageService.getPayments();
  const [senateApproved, setSenateApproved] = useState(() => {
    try {
      const saved = localStorage.getItem('lcns_senate_approved');
      if (saved === 'true') return true;
      const logs = JSON.parse(localStorage.getItem('lcns_audit_logs') || '[]');
      return !!logs.find((l:any)=> l.action==='SENATE_RATIFICATION');
    } catch { return false; }
  });

  const [searchIndividual, setSearchIndividual] = useState('');
  const [selectedPrintStudent, setSelectedPrintStudent] = useState<any>(null);
  const [computationResults, setComputationResults] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('lcns_results') || '[]'); } catch { return []; }
  });
  const [senateInfo, setSenateInfo] = useState(() => {
    try {
      const logs = JSON.parse(localStorage.getItem('lcns_audit_logs') || '[]');
      const ratLog = logs.find((l:any)=> l.action==='SENATE_RATIFICATION');
      if (ratLog) return { approved: true, date: ratLog.timestamp, provost: ratLog.user || 'Mrs Terna Fiase - Provost' };
      const saved = localStorage.getItem('lcns_senate_ratification');
      if (saved) { const p = JSON.parse(saved); return { approved: p.approved, date: p.date, provost: p.provostName }; }
      return { approved: localStorage.getItem('lcns_senate_approved')==='true', date: new Date().toISOString(), provost: 'Mrs Terna Fiase - Provost' };
    } catch { return { approved: false, date: new Date().toISOString(), provost: 'Mrs Terna Fiase - Provost' }; }
  });

  const [examSettings, setExamSettings] = useState<any>(() => { try { return JSON.parse(localStorage.getItem('lcns_exam_settings') || '{}'); } catch { return {}; } });
  const [examResultsPublished, setExamResultsPublished] = useState(() => { try { return localStorage.getItem('lcns_entrance_results_published') === 'true'; } catch { return false; } });
  const [examSubmissions, setExamSubmissions] = useState<any[]>(() => { try { return JSON.parse(localStorage.getItem('lcns_exam_submissions') || '[]'); } catch { return []; } });

  // ===== ADDED - PROVOST VETTING + BIODATA + SEMESTER PRINT =====
  const [registrarVetted, setRegistrarVetted] = useState<any[]>(() => {
    try { const v = JSON.parse(localStorage.getItem('lcns_results_registrar_vetted') || '[]'); const r = JSON.parse(localStorage.getItem('lcns_results') || '[]'); return v.length>0 ? v : r; } catch { return []; }
  });
  const [searchBiodata, setSearchBiodata] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [selectedBiodata, setSelectedBiodata] = useState<any>(null);
  const [selectedSession, setSelectedSession] = useState(COLLEGE_CONFIG.CURRENT_SESSION || '2026/2027');
  const [selectedSemester, setSelectedSemester] = useState<'First' | 'Second'>('First');
  const [supabaseGpa, setSupabaseGpa] = useState<any[]>([]);
  const [supabaseCgpa, setSupabaseCgpa] = useState<any[]>([]);
  const [vetStatus, setVetStatus] = useState(() => localStorage.getItem('lcns_provost_vet_status') || 'PENDING');
  const [searchVet, setSearchVet] = useState('');
  const [searchSemesterPrint, setSearchSemesterPrint] = useState('');

  const loadProvostData = async () => {
    try {
      const { data: gpa } = await supabase.from('student_gpa_view').select('*');
      if(gpa) setSupabaseGpa(gpa);
      const { data: cgpa } = await supabase.from('student_cgpa_view').select('*');
      if(cgpa) setSupabaseCgpa(cgpa);
      const { data: scores } = await supabase.from('student_results_workflow').select('*').order('matric_no');
      if(scores && scores.length>0) setRegistrarVetted(scores);
    } catch {}
  };
  useEffect(() => {
    loadProvostData();
    const iv = setInterval(() => {
      try {
        const s = JSON.parse(localStorage.getItem('lcns_exam_settings') || '{}'); setExamSettings(s);
        setExamResultsPublished(localStorage.getItem('lcns_entrance_results_published') === 'true');
        setExamSubmissions(JSON.parse(localStorage.getItem('lcns_exam_submissions') || '[]'));
        setRegistrarVetted(JSON.parse(localStorage.getItem('lcns_results_registrar_vetted') || localStorage.getItem('lcns_results') || '[]'));
      } catch {}
    }, 2000);
    return () => clearInterval(iv);
  }, []);

  const handlePublishExam = () => {
    if (!examSettings.examDate) { alert('Set Exam Date first!'); return; }
    if (!confirm(`Publish Entrance Exam? Date: ${examSettings.examDate}`)) return;
    const updated = { ...examSettings, status: 'PUBLISHED', publishedAt: new Date().toISOString(), publishedBy: displayName };
    localStorage.setItem('lcns_exam_settings', JSON.stringify(updated)); setExamSettings(updated); alert(`✅ ENTRANCE EXAM PUBLISHED`);
  };
  const handleUnpublishExam = () => {
    if (!confirm('Unpublish / Close Entrance Exam?')) return;
    const updated = { ...examSettings, status: 'CLOSED', closedAt: new Date().toISOString(), closedBy: displayName };
    localStorage.setItem('lcns_exam_settings', JSON.stringify(updated)); setExamSettings(updated); alert('🔒 CLOSED');
  };
  const handlePublishEntranceResults = () => {
    if (examSubmissions.length===0) { alert('No submissions'); return; }
    if (!confirm(`Publish ${examSubmissions.length} Entrance Results?`)) return;
    localStorage.setItem('lcns_entrance_results_published', 'true'); setExamResultsPublished(true); alert(`✅ Published ${examSubmissions.length}`);
  };
  const handleUnpublishEntranceResults = () => {
    if (!confirm('Unpublish Results?')) return;
    localStorage.setItem('lcns_entrance_results_published', 'false'); setExamResultsPublished(false); alert('🔒 Unpublished');
  };

  const handleForwardToSenate = () => {
    if(registrarVetted.length===0) { alert('No results'); return; }
    localStorage.setItem('lcns_provost_vet_status', 'FORWARDED_TO_SENATE');
    localStorage.setItem('lcns_results_provost_vetted', JSON.stringify(registrarVetted));
    setVetStatus('FORWARDED_TO_SENATE'); alert('✅ Forwarded to Senate');
  };
  const handleReturnToRegistrar = () => {
    const reason = prompt('Reason to return to Registrar:'); if(!reason) return;
    localStorage.setItem('lcns_provost_vet_status', 'RETURNED_TO_REGISTRAR'); localStorage.setItem('lcns_provost_return_reason', reason);
    setVetStatus('RETURNED_TO_REGISTRAR'); alert(`↩️ Returned to Registrar: ${reason}`);
  };

  const handleProvostPublishAll = () => {
    if (computationResults.length===0 && registrarVetted.length===0) { alert('No results to publish'); return; }
    if (!confirm(`Provost ${displayName} - Publish ALL results? Students will see CGPA, Class, Transcript. FINAL.`)) return;
    const source = registrarVetted.length>0 ? registrarVetted : computationResults;
    const updated = source.map((r:any) => ({ ...r, status: 'PROVOST_PUBLISHED', published_by_senate: true }));
    localStorage.setItem('lcns_results', JSON.stringify(updated)); setComputationResults(updated); setRegistrarVetted(updated);
    const now = new Date().toISOString(); const session = COLLEGE_CONFIG.CURRENT_SESSION || '2026/2027';
    const payload = { approved: true, date: now, timestamp: now, provostName: displayName, provostEmail: displayEmail, session, semester: 'First', action: 'SENATE_RATIFICATION' };
    try {
      localStorage.setItem('lcns_senate_approved', 'true'); localStorage.setItem('lcns_senate_ratification', JSON.stringify(payload));
      localStorage.setItem('lcns_senate_ratified', 'true'); localStorage.setItem(`lcns_senate_ratification_${session}_First`, JSON.stringify(payload));
      localStorage.setItem(`lcns_senate_ratification_${session}_Second`, JSON.stringify(payload)); localStorage.setItem(`lcns_senate_approved_${session}`, 'true');
      window.dispatchEvent(new Event('lcns_storage_update')); window.dispatchEvent(new Event('storage'));
    } catch {}
    setSenateApproved(true); setSenateInfo({ approved: true, date: now, provost: displayName }); setVetStatus('PUBLISHED');
    localStorage.setItem('lcns_provost_vet_status', 'PUBLISHED');
    StorageService.logAction(displayEmail, displayRole, 'SENATE_RATIFICATION', `Provost Published ${updated.length}`);
    alert(`✅ PROVOST FINAL PUBLISH - ${updated.length} results published. Students can now see results.`);
  };

  const downloadSemesterPDF = () => {
    const filtered = registrarVetted.filter((r:any) => {
      const sess = r.session || r.academic_session || selectedSession;
      const sem = r.semester || 'First';
      return sess === selectedSession && sem.toLowerCase().startsWith(selectedSemester.toLowerCase().slice(0,3).toLowerCase());
    });
    if(filtered.length===0) { alert(`No results for ${selectedSession} ${selectedSemester}`); return; }
    const html = `<html><head><style>body{font-family:Arial; font-size:10px;} table{width:100%; border-collapse:collapse;} th,td{border:1px solid #000; padding:4px; text-align:center;} th{background:#0a4d2e; color:#fff;} .header{text-align:center; border-bottom:3px solid #000;}</style></head><body><div class="header"><img src="/lcns-logo.png.jpg" style="width:80px; height:80px;"/><h2>LABE COLLEGE OF NURSING SCIENCES, GBOKO</h2><h3>SEMESTER RESULT - ${selectedSession} - ${selectedSemester} Semester - Provost Published</h3><p>Provost: ${displayName} | Date: ${new Date().toLocaleDateString()}</p></div><table><tr><th>Matric</th><th>Name</th><th>Current Level</th><th>Course</th><th>CU</th><th>CA</th><th>Exam</th><th>Total</th><th>Grade</th><th>GP</th><th>GPA</th><th>CGPA</th><th>CO</th></tr>${filtered.map((r:any)=>{ const score=r.score||r.total_score||0; const grade=score>=70?'A':score>=60?'B':score>=50?'C':score>=40?'D':'F'; const gp=(r.creditUnit||3)*(grade==='A'?4:grade==='B'?3:grade==='C'?2:grade==='D'?1:0); const gpaData=supabaseGpa.find((g:any)=>g.matric_no===(r.matricNo||r.matric_no)); const cgpaData=supabaseCgpa.find((g:any)=>g.matric_no===(r.matricNo||r.matric_no)); const stud=students.find((s:any)=>s.matricNo===(r.matricNo||r.matric_no)); return `<tr><td>${r.matricNo||r.matric_no}</td><td>${r.fullName||stud?.fullName||''}</td><td>${stud?.level||''}</td><td>${r.courseCode||r.course_code}</td><td>${r.creditUnit||3}</td><td>${r.ca_score||''}</td><td>${r.exam_score||''}</td><td><b>${score}</b></td><td>${grade}</td><td>${gp}</td><td>${gpaData?.gpa||'-'}</td><td>${cgpaData?.cgpa||'-'}</td><td>${grade==='F'?'REPEAT '+ (r.courseCode||r.course_code):'PASS'}</td></tr>`}).join('')}</table><div style="margin-top:40px; display:flex; justify-content:space-between; text-align:center;"><div style="border-top:2px solid #000; padding-top:10px;"><p>Provost: ${displayName}</p><p>Signature & Seal</p></div><div style="border-top:2px solid #000; padding-top:10px;"><p>Registrar</p></div><div style="border-top:2px solid #000; padding-top:10px;"><p>HOD</p></div></div></body></html>`;
    const win = window.open('', '_blank'); if(win){ win.document.write(html); win.document.close(); win.focus(); setTimeout(()=>win.print(), 500); }
  };

  const downloadSemesterExcel = () => {
    const filtered = registrarVetted.filter((r:any) => {
      const sess = r.session || r.academic_session || selectedSession;
      const sem = r.semester || 'First';
      return sess === selectedSession && sem.toLowerCase().startsWith(selectedSemester.toLowerCase().slice(0,3).toLowerCase());
    });
    if(filtered.length===0) { alert(`No results for ${selectedSession} ${selectedSemester}`); return; }
    let csv = `LABE COLLEGE OF NURSING SCIENCES, GBOKO - ${selectedSession} - ${selectedSemester} Semester - Provost: ${displayName}\nMatric No,Full Name,Current Level,Program,State,Phone,Course Code,Credit Unit,CA,Exam,Total,Grade,GP,GPA,CGPA,Status,Repeat\n`;
    filtered.forEach((r:any)=>{ const score=r.score||r.total_score||0; const grade=score>=70?'A':score>=60?'B':score>=50?'C':score>=40?'D':'F'; const gp=(r.creditUnit||3)*(grade==='A'?4:grade==='B'?3:grade==='C'?2:grade==='D'?1:0); const gpaData=supabaseGpa.find((g:any)=>g.matric_no===(r.matricNo||r.matric_no)); const cgpaData=supabaseCgpa.find((g:any)=>g.matric_no===(r.matricNo||r.matric_no)); const stud:any = students.find((s:any)=>s.matricNo===(r.matricNo||r.matric_no)); csv += `"${r.matricNo||r.matric_no}","${r.fullName||stud?.fullName||''}","${stud?.level||''}","${stud?.program||''}","${stud?.stateOfOrigin||''}","${stud?.phone||''}","${r.courseCode||r.course_code}","${r.creditUnit||3}","${r.ca_score||''}","${r.exam_score||''}","${score}","${grade}","${gp}","${gpaData?.gpa||''}","${cgpaData?.cgpa||''}","${grade==='F'?'CARRY OVER':'PASS'}","${grade==='F'?'REPEAT '+(r.courseCode||r.course_code):''}"\n`; });
    const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `Provost_${selectedSession}_${selectedSemester}_Semester_${new Date().toISOString().slice(0,10)}.csv`; document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const safeCurrentUser = (() => {
    try { const keys = ['lcns_erp_current_user', 'lcns-current-user', 'lcns_current_user', 'lcns_user']; for (const k of keys) { const v = localStorage.getItem(k); if (v) { const parsed = JSON.parse(v); if (parsed && parsed.email) return parsed; } } return StorageService.getCurrentUser(); } catch { return null; }
  })();
  const currentUser = safeCurrentUser || { id: 'LCNS/2026/PV/001', email: 'provost@lcns.edu.ng', role: 'PROVOST', fullName: 'Mrs Terna Fiase Msc, Bnsc, Dip Nursing Education, RNE,RM,RN', status: 'ACTIVE' };
  const displayName = (currentUser?.fullName || (currentUser as any)?.full_name || currentUser?.email || 'Mrs Terna Fiase').toString().toUpperCase();
  const displayEmail = currentUser?.email || 'provost@lcns.edu.ng';
  const displayRole = currentUser?.role || 'PROVOST';
  const totalRevenue = payments.filter((p) => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0);
  const filteredIndividual = students.filter((s: any) => { if (!searchIndividual) return true; const term = searchIndividual.toLowerCase().trim(); return s.fullName.toLowerCase().includes(term) || s.matricNo.toLowerCase().includes(term); });
  const filteredBiodata = students.filter((s:any)=>{ if(levelFilter!=='ALL' && s.level!==levelFilter) return false; if(!searchBiodata) return true; return `${s.fullName} ${s.matricNo} ${s.program} ${s.level} ${s.stateOfOrigin} ${s.phone}`.toLowerCase().includes(searchBiodata.toLowerCase()); });
  const filteredVet = registrarVetted.filter((r:any)=>{ if(!searchVet) return true; const term=searchVet.toLowerCase(); return (r.matricNo||r.matric_no||'').toLowerCase().includes(term) || (r.fullName||'').toLowerCase().includes(term); });
  const semesterFiltered = registrarVetted.filter((r:any)=>{ const sess = r.session || r.academic_session || selectedSession; const sem = r.semester || 'First'; const matchSession = sess === selectedSession; const matchSem = sem.toLowerCase().startsWith(selectedSemester.toLowerCase().slice(0,3).toLowerCase()); if(!searchSemesterPrint) return matchSession && matchSem; const term=searchSemesterPrint.toLowerCase(); return matchSession && matchSem && ((r.matricNo||r.matric_no||'').toLowerCase().includes(term) || (r.fullName||'').toLowerCase().includes(term)); });

  const handleSenateApproval = () => {
    const now = new Date().toISOString(); const session = COLLEGE_CONFIG.CURRENT_SESSION || '2026/2027';
    const payload = { approved: true, date: now, timestamp: now, provostName: displayName, provostEmail: displayEmail, session, semester: 'First', action: 'SENATE_RATIFICATION' };
    try { localStorage.setItem('lcns_senate_approved', 'true'); localStorage.setItem('lcns_senate_ratification', JSON.stringify(payload)); localStorage.setItem('lcns_senate_ratified', 'true'); window.dispatchEvent(new Event('lcns_storage_update')); } catch {}
    setSenateApproved(true); setSenateInfo({ approved: true, date: now, provost: displayName });
  };
  const handleRevokeApproval = () => {
    if (!confirm('Revoke Senate Approval?')) return;
    try { localStorage.removeItem('lcns_senate_approved'); localStorage.removeItem('lcns_senate_ratification'); const unpublished = computationResults.map((r:any) => ({ ...r, status: 'REGISTRAR_REVIEWED' })); localStorage.setItem('lcns_results', JSON.stringify(unpublished)); setComputationResults(unpublished); window.dispatchEvent(new Event('lcns_storage_update')); } catch {}
    setSenateApproved(false); setSenateInfo({ approved: false, date: new Date().toISOString(), provost: displayName });
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div><span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-emerald-800 px-3 py-1 rounded-full">Office of the College Provost - {displayRole} - Final Publisher - All Biodata + Semester Print</span><h1 className="text-2xl sm:text-3xl font-black uppercase mt-2">{displayName}</h1><p className="text-xs text-emerald-200">{displayEmail} - See all student biodata + Print individual + Print semester by academic year & semester + GPA/CGPA + CO - Provost MUST publish before student sees - Logged in as {displayName} - Status: {vetStatus}</p></div>
          <div className="text-right"><span className="text-xs text-emerald-300 font-semibold block">Academic Session</span><span className="text-lg font-black text-amber-400">{COLLEGE_CONFIG.CURRENT_SESSION}</span><span className={`block text-[10px] px-2 py-1 rounded-full mt-1 font-black ${senateApproved?'bg-emerald-500 text-white':'bg-red-500 text-white'}`}>{senateApproved?'✅ PUBLISHED':'🔒 NOT PUBLISHED'}</span><span className={`block text-[10px] px-2 py-1 rounded-full mt-1 font-black ${vetStatus==='PUBLISHED'?'bg-amber-400 text-black':''}`}>{vetStatus}</span></div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs no-print">
        <button onClick={() => setActiveTab('provost_vet')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='provost_vet'?'bg-emerald-700 text-white shadow ring-2 ring-emerald-300':'bg-emerald-50 border-2 border-emerald-400 text-emerald-900'}`}><FileCheck className="w-4 h-4"/><span>🔍 PROVOST VET - FROM REGISTRAR - PUBLISH FINAL - GPA/CGPA</span><span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px]">{registrarVetted.length}</span></button>
        <button onClick={() => setActiveTab('semester_print')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='semester_print'?'bg-blue-700 text-white shadow ring-2 ring-blue-300':'bg-blue-50 border-2 border-blue-400 text-blue-900'}`}><BookOpen className="w-4 h-4"/><span>🖨️ PRINT SEMESTER RESULT - Select Academic Year + Semester - Provost</span><span className="px-2 py-0.5 rounded-full bg-amber-400 text-black text-[10px]">NEW</span></button>
        <button onClick={() => setActiveTab('students_biodata')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='students_biodata'?'bg-emerald-700 text-white shadow-md':'bg-emerald-50 text-emerald-800 border-2 border-emerald-300'}`}><Users className="w-4 h-4"/><span>👨‍🎓 All Students Biodata + Current Level + Full Info + Print Individually</span></button>
        <button onClick={() => setActiveTab('individual_result')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='individual_result'?'bg-slate-900 text-white shadow ring-2 ring-amber-400':'bg-amber-50 text-amber-900 border-2 border-amber-400'}`}><Printer className="w-4 h-4"/><span>🖨️ Print Individual Result - School Full Name + Logo - Provost Final</span></button>
        <button onClick={() => setActiveTab('result_publish')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='result_publish'?'bg-red-700 text-white shadow ring-2 ring-red-300':'bg-red-50 text-red-800 border-2 border-red-400'}`}><FileCheck className="w-4 h-4"/><span>🎓 Publish Results - Final</span></button>
        <button onClick={() => setActiveTab('entrance_exam')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='entrance_exam'?'bg-amber-500 text-black shadow ring-2 ring-amber-300':'bg-amber-50 text-amber-900 border-2 border-amber-400'}`}><Send className="w-4 h-4"/><span>📝 Entrance Exam</span></button>
        <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab==='overview'?'bg-[#0a4d2e] text-white':'text-slate-600 hover:bg-slate-100'}`}><Building className="w-4 h-4"/><span>Overview</span></button>
      </div>

      {activeTab==='provost_vet' && (
        <div className="bg-white rounded-3xl border-2 border-emerald-700 p-6 space-y-6">
          <div className="bg-gradient-to-r from-emerald-50 to-amber-50 border-2 border-emerald-300 p-4 rounded-xl">
            <h2 className="text-lg font-black flex items-center gap-2 text-emerald-900"><FileCheck className="w-6 h-6"/> PROVOST VETTING PANEL - After Receiving From Registrar - Final Publisher - GPA/CGPA + CO</h2>
            <p className="text-xs font-bold mt-2">Provost {displayName} - You received {registrarVetted.length} results from Registrar (HOD → Registrar → Provost). You see all student biodata with current level + full info + staff verification. You can publish final. Students see ONLY after you publish. GPA/CGPA from views + CO as REPEAT.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black ${vetStatus==='PUBLISHED'?'bg-green-600 text-white': vetStatus==='FORWARDED_TO_SENATE'?'bg-blue-600 text-white': vetStatus==='RETURNED_TO_REGISTRAR'?'bg-red-600 text-white':'bg-yellow-400 text-black'}`}>Status: {vetStatus}</span>
              <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-xs font-black">{registrarVetted.length} Records From Registrar - With GPA/CGPA</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleProvostPublishAll} className="px-8 py-4 bg-red-700 hover:bg-red-800 text-white rounded-full font-black text-sm flex items-center gap-2 shadow-lg"><FileCheck className="w-5 h-5"/> 🎓 Provost Publish ALL - {registrarVetted.length} - Students See CGPA + Class + Transcript</button>
            <button onClick={handleForwardToSenate} className="px-6 py-3 bg-blue-700 text-white rounded-full font-black text-xs flex items-center gap-2"><Send className="w-4 h-4"/> Forward to Senate</button>
            <button onClick={handleReturnToRegistrar} className="px-6 py-3 bg-amber-600 text-white rounded-full font-black text-xs flex items-center gap-2"><ArrowLeft className="w-4 h-4"/> ↩️ Return to Registrar</button>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border"><Search className="w-4 h-4 text-emerald-600"/><input value={searchVet} onChange={e=>setSearchVet(e.target.value)} placeholder="Search by Matric, Name, Course - Provost Vet" className="flex-1 py-2 text-xs font-bold outline-none bg-transparent"/></div>
          <div className="overflow-x-auto border-2 rounded-xl"><table className="w-full text-xs"><thead className="bg-emerald-900 text-white"><tr><th className="p-2">Matric</th><th className="p-2">Name + Current Level</th><th className="p-2">Course</th><th className="p-2">CU</th><th className="p-2">Total</th><th className="p-2">Grade</th><th className="p-2">GP</th><th className="p-2">GPA</th><th className="p-2">CGPA</th><th className="p-2">CO</th><th className="p-2">Student Can See?</th></tr></thead><tbody>{filteredVet.map((r:any, idx:number)=>{ const score=r.score||r.total_score||0; const grade=score>=70?'A':score>=60?'B':score>=50?'C':score>=40?'D':'F'; const gp=(r.creditUnit||3)*(grade==='A'?4:grade==='B'?3:grade==='C'?2:grade==='D'?1:0); const gpaData=supabaseGpa.find((g:any)=>g.matric_no===(r.matricNo||r.matric_no)); const cgpaData=supabaseCgpa.find((g:any)=>g.matric_no===(r.matricNo||r.matric_no)); const stud:any=students.find((s:any)=>s.matricNo===(r.matricNo||r.matric_no)); return (<tr key={idx} className={`border-b ${grade==='F'?'bg-red-50':''}`}><td className="p-2 font-mono font-bold">{r.matricNo||r.matric_no}</td><td className="p-2"><p className="font-bold">{r.fullName||stud?.fullName||''}</p><p className="text-[10px] bg-yellow-200 px-1 rounded">Current: {stud?.level||''}</p></td><td className="p-2 font-mono">{r.courseCode||r.course_code}</td><td className="p-2 text-center">{r.creditUnit||3}</td><td className="p-2 text-center font-black">{score}</td><td className="p-2 text-center font-bold">{grade}</td><td className="p-2 text-center">{gp}</td><td className="p-2 text-center text-blue-700 font-bold">{gpaData?.gpa||'-'}</td><td className="p-2 text-center text-blue-900 font-black">{cgpaData?.cgpa||'-'}</td><td className="p-2 text-center font-bold text-red-700">{grade==='F'?`REPEAT ${r.courseCode||r.course_code}`:'PASS'}</td><td className="p-2 text-center"><span className={`px-2 py-1 rounded-full text-[10px] font-black ${senateApproved?'bg-green-100 text-green-800':'bg-red-100 text-red-800'}`}>{senateApproved?'✅ Student CAN see':'🔒 Locked'}</span></td></tr>); })}</tbody></table>{filteredVet.length===0 && <div className="p-8 text-center text-slate-500">No results from Registrar yet</div>}</div>
        </div>
      )}

      {activeTab==='semester_print' && (
        <div className="bg-white rounded-3xl border-2 border-blue-500 p-6 space-y-6">
          <div><h2 className="text-lg font-black flex items-center gap-2"><BookOpen className="w-5 h-5 text-blue-700"/> Print Result By Academic Year & Semester - Provost - {displayName}</h2><p className="text-xs font-bold bg-blue-50 border p-2 rounded mt-2">Provost {displayName} can select Academic Year (e.g., 2026/2027) and Semester (First/Second) then print all students result for that semester with GPA/CGPA + CO + School Full Name + Logo. Students see after Provost publishes.</p></div>
          <div className="grid md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border">
            <div><label className="text-[10px] font-black uppercase">Academic Year</label><select value={selectedSession} onChange={e=>setSelectedSession(e.target.value)} className="w-full px-3 py-2.5 border-2 rounded-xl text-xs font-black"><option>2026/2027</option><option>2025/2026</option><option>2024/2025</option></select></div>
            <div><label className="text-[10px] font-black uppercase">Semester</label><select value={selectedSemester} onChange={e=>setSelectedSemester(e.target.value as any)} className="w-full px-3 py-2.5 border-2 rounded-xl text-xs font-black"><option value="First">First Semester</option><option value="Second">Second Semester</option></select></div>
            <div className="flex items-end gap-2"><button onClick={downloadSemesterPDF} className="flex-1 px-4 py-3 bg-slate-900 text-white rounded-xl text-xs font-black flex items-center gap-2"><Printer className="w-4 h-4"/> Print PDF - {selectedSession} {selectedSemester}</button><button onClick={downloadSemesterExcel} className="flex-1 px-4 py-3 bg-green-700 text-white rounded-xl text-xs font-black flex items-center gap-2"><FileSpreadsheet className="w-4 h-4"/> Excel</button></div>
            <div className="flex items-end"><div className="w-full bg-white border-2 rounded-xl px-3 py-2 flex items-center gap-2"><Search className="w-4 h-4"/><input value={searchSemesterPrint} onChange={e=>setSearchSemesterPrint(e.target.value)} placeholder="Search Matric/Name in semester" className="flex-1 text-xs font-bold outline-none"/></div></div>
          </div>
          <div className="bg-amber-50 border-2 border-amber-300 p-3 rounded-xl text-xs font-bold flex justify-between"><span>Selected: {selectedSession} - {selectedSemester} Semester</span><span>{semesterFiltered.length} Records Found - With GPA/CGPA + CO - Provost: {displayName}</span></div>
          <div className="overflow-x-auto border-2 rounded-xl"><table className="w-full text-xs"><thead className="bg-blue-900 text-white"><tr><th className="p-2">Matric</th><th className="p-2">Name + Current Level</th><th className="p-2">Course</th><th className="p-2">CU</th><th className="p-2">Total</th><th className="p-2">Grade</th><th className="p-2">GP</th><th className="p-2">GPA</th><th className="p-2">CGPA</th><th className="p-2">CO</th></tr></thead><tbody>{semesterFiltered.map((r:any, idx:number)=>{ const score=r.score||r.total_score||0; const grade=score>=70?'A':score>=60?'B':score>=50?'C':score>=40?'D':'F'; const gp=(r.creditUnit||3)*(grade==='A'?4:grade==='B'?3:grade==='C'?2:grade==='D'?1:0); const gpaData=supabaseGpa.find((g:any)=>g.matric_no===(r.matricNo||r.matric_no)); const cgpaData=supabaseCgpa.find((g:any)=>g.matric_no===(r.matricNo||r.matric_no)); const stud:any=students.find((s:any)=>s.matricNo===(r.matricNo||r.matric_no)); return (<tr key={idx} className={`border-b ${grade==='F'?'bg-red-50':''}`}><td className="p-2 font-mono font-bold">{r.matricNo||r.matric_no}</td><td className="p-2"><p className="font-bold">{r.fullName||stud?.fullName||''}</p><p className="text-[10px] bg-yellow-200 px-1 rounded">Current: {stud?.level||''}</p></td><td className="p-2 font-mono">{r.courseCode||r.course_code}</td><td className="p-2 text-center">{r.creditUnit||3}</td><td className="p-2 text-center font-black">{score}</td><td className="p-2 text-center font-bold">{grade}</td><td className="p-2 text-center">{gp}</td><td className="p-2 text-center text-blue-700 font-bold">{gpaData?.gpa||'-'}</td><td className="p-2 text-center text-blue-900 font-black">{cgpaData?.cgpa||'-'}</td><td className="p-2 text-center font-bold text-red-700">{grade==='F'?`REPEAT ${r.courseCode||r.course_code}`:'PASS'}</td></tr>); })}</tbody></table>{semesterFiltered.length===0 && <div className="p-8 text-center text-slate-500 font-bold">No results for {selectedSession} {selectedSemester} - Check session/semester - Registrar must forward first</div>}</div>
        </div>
      )}

      {activeTab === 'entrance_exam' ? (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-50 to-emerald-50 border-2 border-amber-400 rounded-2xl p-5">
            <h2 className="text-lg font-black">📝 Entrance Exam Control</h2>
            <div className="grid md:grid-cols-4 gap-3 mt-4">
              <div className={`p-3 rounded-xl border-2 text-center ${examSettings.status==='PUBLISHED'?'bg-green-100 border-green-500':'bg-slate-100'}`}><p className="text-[10px] font-black">EXAM STATUS</p><p className="font-black">{examSettings.status||'NOT SET'}</p></div>
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
          <div className="bg-white rounded-2xl border-2 p-4"><AdminExamSettings /></div>
        </div>
      ) : activeTab === 'students_biodata' ? (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border-2 border-emerald-300 p-4 space-y-4">
            <div className="flex justify-between"><h2 className="text-lg font-black">All Students Biodata - Current Level - Provost View - {displayName}</h2><span className="px-3 py-1 bg-emerald-900 text-white rounded-full text-xs font-black">{filteredBiodata.length} Students</span></div>
            <div className="flex gap-2 bg-slate-50 p-3 rounded-xl border"><div className="flex items-center gap-2 flex-1 bg-white border rounded-xl px-3"><Search className="w-4 h-4"/><input value={searchBiodata} onChange={e=>setSearchBiodata(e.target.value)} placeholder="Search Name, Matric, State, Phone, Program" className="flex-1 py-2 text-xs font-bold outline-none"/></div><select value={levelFilter} onChange={e=>setLevelFilter(e.target.value)} className="px-4 py-2 border-2 border-emerald-300 rounded-xl text-xs font-black"><option value="ALL">All Levels ({students.length})</option><option value="ND 1">ND 1</option><option value="ND 2">ND 2</option><option value="HND 1">HND 1</option><option value="HND 2">HND 2</option></select></div>
            <div className="overflow-x-auto border-2 rounded-xl"><table className="w-full text-xs"><thead className="bg-slate-900 text-white"><tr><th className="p-2">Matric + Photo + Current Level</th><th className="p-2">Full Name + Biodata</th><th className="p-2">Program + Current Level + Session</th><th className="p-2">State + Contact + Parent + Hostel</th><th className="p-2">View + Print</th></tr></thead><tbody>{filteredBiodata.map((s:any)=><tr key={s.matricNo} className="border-b hover:bg-slate-50"><td className="p-2"><div className="flex items-center gap-2"><img src={s.photoUrl || 'https://via.placeholder.com/50'} className="w-10 h-12 object-cover rounded border"/><div><p className="font-mono font-black text-emerald-800">{s.matricNo}</p><span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-yellow-300 text-black">Current: {s.level}</span></div></div></td><td className="p-2"><p className="font-black uppercase">{s.fullName}</p><p className="text-[11px]">Blood: {s.bloodGroup} | {s.genotype}</p></td><td className="p-2"><p className="font-bold">{s.program}</p><p className="text-[11px]">Current Level: <b className="bg-yellow-200 px-1 rounded">{s.level}</b></p><p className="text-[11px]">Session: {s.session}</p></td><td className="p-2"><p className="text-[11px]">{s.stateOfOrigin} / {s.lga}</p><p className="text-[11px]">{s.phone} | {s.email}</p><p className="text-[11px]">Parent: {s.parentName||'N/A'} | Hostel: {s.hostel||'N/A'}</p></td><td className="p-2 text-center"><div className="flex flex-col gap-1"><button onClick={()=>setSelectedBiodata(s)} className="px-3 py-1.5 bg-blue-700 text-white rounded-lg font-black text-[11px]">View Full Biodata</button><button onClick={()=>{setSelectedPrintStudent(s); setActiveTab('individual_result');}} className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-black text-[11px] flex items-center gap-1"><Printer className="w-3 h-3"/> Print Result</button></div></td></tr>)}</tbody></table></div>
            {selectedBiodata && <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"><div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[80vh] overflow-auto"><div className="flex justify-between border-b pb-2"><h3 className="font-black">Full Biodata - {selectedBiodata.fullName} - Current Level: {selectedBiodata.level}</h3><button onClick={()=>setSelectedBiodata(null)} className="px-3 py-1 bg-slate-100 rounded-full font-black">X</button></div><div className="text-xs space-y-1 mt-3"><p><b>Matric:</b> {selectedBiodata.matricNo}</p><p><b>Program:</b> {selectedBiodata.program}</p><p><b>Current Level:</b> {selectedBiodata.level}</p><p><b>Session:</b> {selectedBiodata.session}</p><p><b>State:</b> {selectedBiodata.stateOfOrigin} / {selectedBiodata.lga}</p><p><b>Phone:</b> {selectedBiodata.phone}</p><p><b>Parent:</b> {selectedBiodata.parentName}</p><p><b>Hostel:</b> {selectedBiodata.hostel}</p></div><div className="flex gap-2 mt-4"><button onClick={()=>window.print()} className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-black">Print Biodata</button><button onClick={()=>{setSelectedPrintStudent(selectedBiodata); setSelectedBiodata(null); setActiveTab('individual_result');}} className="flex-1 py-3 bg-emerald-700 text-white rounded-xl font-black">Print Result with Logo</button></div></div></div>}
          </div>
        </div>
      ) : activeTab === 'admissions_all' ? (
        <div className="space-y-4"><div className="bg-purple-50 border-2 border-purple-300 p-3 rounded-xl text-xs font-bold">Provost All Applicants Records - {displayName}</div><AdminAdmissionManager currentUser={currentUser} /></div>
      ) : activeTab === 'admissions' ? <AdmissionProcessingView /> : activeTab === 'cbt' ? <CBTExamManager currentUser={currentUser} allowedTypes={['APPLICANT_SCREENING']} /> : activeTab === 'individual_result' ? (
        <div className="bg-white rounded-3xl border-2 border-amber-300 p-6 space-y-6">
          <div><h2 className="text-lg font-black flex items-center gap-2"><Printer className="w-5 h-5 text-amber-600"/> Print Individual Student Result - Provost Final - {displayName}</h2><p className="text-xs bg-amber-50 border-2 border-amber-300 p-2 rounded mt-1 font-bold">Provost Final Publisher - Search by Name and Matric No - Students see ONLY after Provost publishes - With LABE full name + Logo + CGPA + Class + Carry Over</p></div>
          <div className="bg-red-50 border-2 border-red-300 p-3 rounded-xl text-xs font-bold flex items-center gap-2"><span className={`px-3 py-1 rounded-full text-xs font-black ${senateApproved?'bg-green-600 text-white':'bg-red-600 text-white'}`}>{senateApproved ? `✅ Published by ${senateInfo.provost}` : '🔒 NOT PUBLISHED'}</span><span>{computationResults.length} results - Status: {senateApproved ? 'PROVOST_PUBLISHED' : 'Awaiting Publish'}</span></div>
          <div className="flex flex-wrap gap-2 bg-slate-50 p-3 rounded-xl border"><div className="flex items-center gap-2 flex-1 bg-white border-2 border-amber-400 rounded-xl px-3"><Search className="w-4 h-4 text-amber-600"/><input value={searchIndividual} onChange={e=>setSearchIndividual(e.target.value)} placeholder="🔍 Search by Name and Matric No" className="flex-1 py-2.5 text-xs font-black outline-none"/></div><div className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-black">{filteredIndividual.length} Students</div></div>
          {!selectedPrintStudent ? (
            <div className="overflow-x-auto border-2 rounded-xl"><table className="w-full text-xs"><thead className="bg-slate-900 text-white"><tr><th className="p-3 text-left">Matric No + Name</th><th className="p-3 text-left">Level + Current Level</th><th className="p-3 text-left">Results + CGPA</th><th className="p-3 text-center">Print - Provost Final</th></tr></thead><tbody>{filteredIndividual.map((s:any) => { const studResults = computationResults.filter((r:any)=> r.matricNo===s.matricNo); let cu=0, gp=0; studResults.forEach((r:any)=>{ const g = r.score>=70?4: r.score>=60?3: r.score>=50?2: r.score>=40?1:0; cu+=r.creditUnit||3; gp+=(r.creditUnit||3)*g; }); const cgpa = cu? (gp/cu).toFixed(2) : '0.00'; return (<tr key={s.matricNo} className="border-b hover:bg-amber-50"><td className="p-3"><p className="font-mono font-black text-emerald-800">{s.matricNo}</p><p className="font-black uppercase">{s.fullName}</p></td><td className="p-3"><p className="font-bold">Current: <span className="bg-yellow-200 px-1 rounded">{s.level}</span> - {s.program}</p></td><td className="p-3"><p className="text-[11px]">Courses: {studResults.length} | CGPA: {cgpa}</p></td><td className="p-3 text-center"><button onClick={()=>setSelectedPrintStudent(s)} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black flex items-center gap-2 mx-auto"><Printer className="w-4 h-4"/> Print {s.matricNo}</button></td></tr>); })}</tbody></table></div>
          ) : (
            <div className="space-y-4"><div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border"><p className="font-black text-sm">Selected: {selectedPrintStudent.fullName} - {selectedPrintStudent.matricNo} - Current Level: {selectedPrintStudent.level}</p><button onClick={()=>setSelectedPrintStudent(null)} className="px-4 py-2 bg-slate-200 rounded-xl text-xs font-black">← Back</button></div><PrintableResultWithLogo matricNo={selectedPrintStudent.matricNo} fullName={selectedPrintStudent.fullName} level={selectedPrintStudent.level} program={selectedPrintStudent.program} results={computationResults.filter((r:any)=> r.matricNo===selectedPrintStudent.matricNo)} currentUserRole="PROVOST - FINAL APPROVAL" currentUserName={displayName} senateApproved={senateApproved} senateDate={senateInfo.date} senateProvost={senateInfo.provost} /></div>
          )}
        </div>
      ) : activeTab === 'result_publish' ? (
        <div className="bg-white rounded-3xl border-2 border-red-400 p-6 space-y-6">
          <div><h2 className="text-xl font-black flex items-center gap-2"><FileCheck className="w-6 h-6 text-red-600"/> Provost Final Publish - MUST Publish Before Student Can See - {displayName}</h2><p className="text-xs bg-red-50 border-2 border-red-200 p-3 rounded mt-2 font-bold">Current status: {senateApproved ? '✅ Published' : '🔒 Not Published'} - Total: {computationResults.length} - After publishing, students can print Result Slip + Transcript</p></div>
          <div className="grid md:grid-cols-3 gap-4"><div className="bg-slate-900 text-white rounded-2xl p-4 text-center"><p className="text-[10px] text-slate-400">TOTAL RESULTS</p><p className="text-3xl font-black text-amber-400">{computationResults.length}</p></div><div className={`rounded-2xl p-4 text-center border-2 ${senateApproved?'bg-green-600 text-white border-green-700':'bg-red-600 text-white border-red-700'}`}><p className="text-[10px]">PUBLISH STATUS</p><p className="text-lg font-black">{senateApproved?'✅ PUBLISHED':'🔒 NOT PUBLISHED'}</p></div><div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-center"><p className="text-[10px] font-bold">PROVOST</p><p className="text-sm font-black">{displayName}</p></div></div>
          <div className="flex flex-wrap gap-3"><button onClick={handleProvostPublishAll} className="px-8 py-4 bg-red-700 hover:bg-red-800 text-white rounded-full font-black text-sm flex items-center gap-2 shadow-lg"><FileCheck className="w-5 h-5"/> 🎓 Provost Publish ALL Results - Students Can Now See</button><button onClick={handleSenateApproval} disabled={senateApproved} className={`px-6 py-4 rounded-full font-black text-sm flex items-center gap-2 ${senateApproved?'bg-emerald-100 text-emerald-800 border':'bg-emerald-700 text-white'}`}><CheckCircle2 className="w-5 h-5"/> {senateApproved?'✅ Senate Ratified':'Grant Senate Approval Only'}</button>{senateApproved && <button onClick={handleRevokeApproval} className="px-6 py-4 bg-slate-200 text-slate-800 rounded-full font-black text-sm">⏸️ Revoke</button>}</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"><div className="p-5 bg-white rounded-3xl border"><p className="text-xs font-bold uppercase">Total Enrolled</p><p className="text-2xl font-black">{students.length + 415}</p></div><div className="p-5 bg-white rounded-3xl border"><p className="text-xs font-bold uppercase">Applicants</p><p className="text-2xl font-black">{applicants.length + 185}</p></div><div className="p-5 bg-white rounded-3xl border"><p className="text-xs font-bold uppercase">Pass Rate</p><p className="text-2xl font-black text-emerald-800">94.8%</p></div><div className="p-5 bg-white rounded-3xl border"><p className="text-xs font-bold uppercase">Revenue</p><p className="text-2xl font-black">₦{(totalRevenue + 72400000).toLocaleString()}</p></div></div>
      )}
    </div>
  );
};

export default ProvostDashboard;

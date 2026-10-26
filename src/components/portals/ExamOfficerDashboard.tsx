import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import { ApiService } from '../../services/api';
import { ResultScore, COLLEGE_CONFIG, Student } from '../../types';
import {
  FileSpreadsheet,
  Award,
  Printer,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Download,
  Calculator,
  Users,
  GraduationCap,
  BookOpen,
  RotateCcw,
  UserCheck,
  School,
  Key,
  Eye,
  EyeOff,
  Rocket,
} from 'lucide-react';
import { AdminAdmissionManager } from '../admin/AdminAdmissionManager';
import { ScoreSheetViewer } from './ScoreSheetViewer';
import { CourseRegistrationApproval } from './CourseRegistrationApproval';
import { supabase } from '@/lib/supabase';

export const ExamOfficerDashboard: React.FC = () => {
  const [results, setResults] = useState<ResultScore[]>(StorageService.getResults());
  const [students] = useState<Student[]>(StorageService.getStudents());
  const [activeTab, setActiveTab] = useState<'broadsheet' | 'biodata' | 'admissions_all' | 'scoresheets' | 'course_reg' | 'lecturer_courses' | 'returned' | 'users'>('course_reg');
  const [selectedSession, setSelectedSession] = useState(COLLEGE_CONFIG.CURRENT_SESSION);
  const [selectedSemester, setSelectedSemester] = useState<'First' | 'Second'>('First');
  const [searchMatric, setSearchMatric] = useState('');
  const [searchBiodata, setSearchBiodata] = useState('');
  const [searchLecturerCourse, setSearchLecturerCourse] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [gpaResult, setGpaResult] = useState<{ matric: string; gpa: number; totalUnits: number } | null>(null);
  const [selectedBiodata, setSelectedBiodata] = useState<any>(null);
  const [selectedStudentForView, setSelectedStudentForView] = useState<string | null>(null);
  const [supabaseStudents, setSupabaseStudents] = useState<any[]>([]);
  const [supabaseCourses, setSupabaseCourses] = useState<any[]>([]);
  const [returnedResults, setReturnedResults] = useState<any[]>([]);
  const [supabaseResults, setSupabaseResults] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>(() => { try { return JSON.parse(localStorage.getItem('lcns_users') || '[]'); } catch { return []; } });
  const [showPasswords, setShowPasswords] = useState<{[k:string]:boolean}>({});
  const [userSearch, setUserSearch] = useState('');
  
  // ===== NEW - PROMOTION + SESSION + COURSE REG BACKEND =====
  const [currentPortalSession, setCurrentPortalSession] = useState<string>(COLLEGE_CONFIG.CURRENT_SESSION || '2026/2027');
  const [courseRegs, setCourseRegs] = useState<any[]>([]);
  const [regSearch, setRegSearch] = useState('');
  const [regStatusFilter, setRegStatusFilter] = useState('ALL');

  useEffect(() => {
    async function loadAll() {
      try {
        // 1. Current session - Whole portal controlled by Registrar - Old data kept!
        const { data: setting } = await supabase.from('college_settings').select('*').eq('setting_key','CURRENT_SESSION').single();
        if(setting?.setting_value){
          setCurrentPortalSession(setting.setting_value);
          setSelectedSession(setting.setting_value);
        }
        const { data: studs } = await supabase.from('students').select('*').order('created_at', { ascending: false });
        if(studs) setSupabaseStudents(studs);
        const { data: courses } = await supabase.from('courses').select('*');
        if(courses) setSupabaseCourses(courses);
        const { data: ret } = await supabase.from('student_results_workflow').select('*').eq('status','RETURNED_TO_EXAM_OFFICER');
        if(ret) setReturnedResults(ret);
        const { data: res } = await supabase.from('student_results_workflow').select('*').order('created_at',{ascending:false});
        if(res) setSupabaseResults(res);
        const { data: allUsers, error: userError } = await supabase.from('users').select('*').order('created_at', { ascending: false });
        if(!userError && allUsers && allUsers.length>0){
          const formatted = allUsers.map((u:any)=>({
            id: u.id, email: u.email, fullName: u.full_name||u.fullName, role: u.role, department: u.department,
            status: u.status||'ACTIVE', phone: u.phone, matricNumber: u.matric_no||'', staffId: u.staff_id||'',
            level: u.level||'', current_semester: u.current_semester||'First', createdAt: u.created_at, password: u.password||'', loginId: u.matric_no||u.staff_id||u.email
          }));
          setUsers(formatted);
          localStorage.setItem('lcns_users', JSON.stringify(formatted));
        }
        // 2. Course registrations backend - For approval with Exam Officer name + HOD name on print!
        const { data: regs } = await supabase.from('course_registrations').select('*').order('registered_at',{ascending:false});
        if(regs) setCourseRegs(regs);
      } catch {}
    }
    loadAll();

    // Real-time: When Registrar runs new session, adds course, promotes student, student registers -> Exam Officer sees live!
    const channel = supabase.channel('exam-officer-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'college_settings' }, (payload:any) => {
        if(payload.new?.setting_key==='CURRENT_SESSION'){
          setCurrentPortalSession(payload.new.setting_value);
          setSelectedSession(payload.new.setting_value);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'course_registrations' }, () => loadAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, () => loadAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => loadAll())
      .subscribe();
    return () => { supabase.removeChannel(channel); }
  }, []);

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
    id: 'LCNS/2026/EX/001', email: 'exam@lcns.edu.ng', role: 'EXAM_OFFICER', fullName: 'Dr. Emmanuel O. Agada', status: 'ACTIVE',
  };

  const displayName = (currentUser?.fullName || (currentUser as any)?.full_name || 'Dr. Emmanuel O. Agada').toString().toUpperCase();
  const displayEmail = currentUser?.email || 'exam@lcns.edu.ng';
  const displayRole = currentUser?.role || 'EXAM_OFFICER';

  // ===== COURSE REG APPROVAL - EXAM OFFICER APPROVES -> NAME REFLECTS ON PRINTED FORM =====
  const approveCourseReg = async (regId: string) => {
    if(!confirm('Approve this course registration? Your name will reflect on printed approved form!')) return;
    const { error } = await supabase.from('course_registrations').update({
      status: 'APPROVED_BY_EXAM_OFFICER',
      exam_officer_name: displayName,
      exam_officer_email: displayEmail,
      exam_officer_approved_at: new Date().toISOString()
    }).eq('id', regId);
    if(error){ alert('Error: '+error.message); return; }
    setCourseRegs(courseRegs.map((r:any)=> r.id===regId ? {...r, status:'APPROVED_BY_EXAM_OFFICER', exam_officer_name: displayName} : r));
    alert(`✅ Approved! ${displayName} name saved! Now HOD will approve -> Student prints form with your name + HOD name! Session: ${currentPortalSession}`);
  };

  const rejectCourseReg = async (regId: string) => {
    const reason = prompt('Reason for rejection?');
    if(!reason) return;
    await supabase.from('course_registrations').update({ status: 'REJECTED_BY_EXAM_OFFICER', rejection_reason: reason, exam_officer_name: displayName }).eq('id', regId);
    setCourseRegs(courseRegs.map((r:any)=> r.id===regId ? {...r, status:'REJECTED_BY_EXAM_OFFICER'} : r));
  };

  const printApprovedRegForm = (matricNo: string) => {
    const regs = courseRegs.filter((r:any)=> r.matric_no===matricNo && r.session===currentPortalSession);
    const approved = regs.filter((r:any)=> r.status.includes('APPROVED'));
    const html = `<html><head><style>body{font-family:Arial; font-size:11px;} table{width:100%; border-collapse:collapse;} th,td{border:1px solid #000; padding:5px;} th{background:#0f4c2e; color:#fff;}</style></head><body>
      <h2 style="text-align:center;">LABE COLLEGE - COURSE REG FORM - APPROVED - Session ${currentPortalSession}</h2>
      <p>Matric: ${matricNo} | Session: ${currentPortalSession} | Portal: ${currentPortalSession} - Whole portal controlled by Registrar - Old data kept!</p>
      <table><tr><th>Course</th><th>Title</th><th>CU</th><th>Level/Sem - Promotion</th><th>Status</th><th>Exam Officer Name</th><th>HOD Name</th></tr>
      ${regs.map((r:any)=>`<tr><td>${r.course_code}</td><td>${r.course_title}</td><td>${r.credit_unit}</td><td>${r.level} ${r.semester} - Promoted</td><td>${r.status}</td><td><b>${r.exam_officer_name||'Pending'}</b><br/>${r.exam_officer_email||''}<br/>${r.exam_officer_approved_at||''}</td><td><b>${r.hod_name||'Pending HOD'}</b></td></tr>`).join('')}
      </table>
      <div style="display:flex; justify-content:space-between; margin-top:40px;">
        <div style="text-align:center;"><p>__________________</p><p><b>${regs[0]?.exam_officer_name||displayName}</b><br/>Exam Officer<br/>Approved: ${regs[0]?.exam_officer_approved_at||''}</p></div>
        <div style="text-align:center;"><p>__________________</p><p><b>${regs[0]?.hod_name||'HOD Pending'}</b><br/>HOD Nursing Sciences</p></div>
        <div style="text-align:center;"><p>__________________</p><p><b>Student ${matricNo}</b><br/>Signature</p></div>
      </div>
      <p style="font-size:9px; text-align:center; margin-top:20px; border:1px dashed #000; padding:5px;">This approved form shows Exam Officer: <b>${regs[0]?.exam_officer_name||displayName}</b> + HOD: <b>${regs[0]?.hod_name||'Pending'}</b> names reflected - Session ${currentPortalSession} - Promotion: Student level auto updates when Registrar promotes ND1 First→Second</p>
      </body></html>`;
    const win=window.open('','_blank'); if(win){win.document.write(html); win.document.close(); win.focus(); setTimeout(()=>win.print(),500);}
  };

  const getGradeAndPoint = (total: number) => {
    if(total >= 70) return { grade: 'A', point: 4, remark: 'Excellent' };
    if(total >= 60) return { grade: 'B', point: 3, remark: 'Very Good' };
    if(total >= 50) return { grade: 'C', point: 2, remark: 'Good' };
    if(total >= 40) return { grade: 'D', point: 1, remark: 'Pass' };
    return { grade: 'F', point: 0, remark: 'Fail - Carry Over (CO)' };
  };

  const filteredResults = results.filter((r) => {
    const matchesSession = r.session === selectedSession;
    const matchesSemester = r.semester === selectedSemester;
    const matchesMatric = !searchMatric || r.matricNo.toLowerCase().includes(searchMatric.toLowerCase()) || (r.studentName && r.studentName.toLowerCase().includes(searchMatric.toLowerCase())) || r.courseCode.toLowerCase().includes(searchMatric.toLowerCase());
    return matchesSession && matchesSemester && matchesMatric;
  });

  const allBiodataStudents = [...students, ...supabaseStudents.map((s:any)=>({
    matricNo: s.matric_no, fullName: s.full_name, program: s.program || 'Nursing Sciences', level: s.level || s.current_level, stateOfOrigin: s.state || s.state_of_origin, phone: s.phone, email: s.email, session: s.session, photoUrl: s.photo_url
  } as any))];

  const filteredStudents = allBiodataStudents.filter((s: any) => {
    if (levelFilter !== 'ALL' && s.level !== levelFilter) return false;
    if (!searchBiodata) return true;
    return `${s.fullName} ${s.matricNo} ${s.program} ${s.level}`.toLowerCase().includes(searchBiodata.toLowerCase());
  });

  const filteredLecturerCourses = supabaseCourses.filter((c:any) => {
    if(!searchLecturerCourse) return true;
    return `${c.course_code} ${c.course_title} ${c.lecturer_name} ${c.lecturer_email} ${c.level} ${c.semester}`.toLowerCase().includes(searchLecturerCourse.toLowerCase());
  });

  const filteredCourseRegs = courseRegs.filter((r:any)=>{
    const matchesSearch = !regSearch || r.matric_no?.toLowerCase().includes(regSearch.toLowerCase()) || r.full_name?.toLowerCase().includes(regSearch.toLowerCase()) || r.course_code?.toLowerCase().includes(regSearch.toLowerCase());
    const matchesStatus = regStatusFilter==='ALL' || r.status===regStatusFilter;
    const matchesSession = r.session===currentPortalSession || !r.session;
    return matchesSearch && matchesStatus && matchesSession;
  });

  const handleComputeGPA = (matricNo: string) => {
    const computed = ApiService.calculateGPA(matricNo, selectedSemester, selectedSession);
    setGpaResult({ matric: matricNo, gpa: computed.gpa, totalUnits: computed.totalUnits });
  };

  const viewIndividualStudent = (matricNo: string) => {
    setSelectedStudentForView(matricNo);
    setTimeout(() => { document.getElementById('individual-student-view')?.scrollIntoView({ behavior: 'smooth' }); }, 100);
  };

  const correctAndResubmit = async (resultId: string) => {
    await supabase.from('student_results_workflow').update({ status: 'PENDING_HOD', correction_status: 'CORRECTED', return_reason: null }).eq('id', resultId);
    alert('✅ Corrected and re-submitted to HOD');
    const { data: ret } = await supabase.from('student_results_workflow').select('*').eq('status','RETURNED_TO_EXAM_OFFICER');
    setReturnedResults(ret || []);
  };

  const calculateAndForwardToHOD = async (matricNo: string) => {
    const { data: scores } = await supabase.from('student_results_workflow').select('*').eq('matric_no', matricNo).eq('status', 'PENDING_EXAM_OFFICER');
    if(!scores || scores.length===0) { alert('No scores from lecturer for ' + matricNo); return; }
    let totalCU=0, totalGP=0;
    scores.forEach((s:any) => {
      const total = (s.ca_score || 0) + (s.exam_score || 0);
      let point=0; if(total>=70) point=4; else if(total>=60) point=3; else if(total>=50) point=2; else if(total>=40) point=1;
      totalCU+=s.credit_unit||3; totalGP+=(s.credit_unit||3)*point;
    });
    const gpa = totalCU ? totalGP/totalCU : 0;
    await supabase.from('student_results_workflow').update({ status: 'PENDING_HOD', gpa_calculated: gpa, calculated_by: displayName, calculated_at: new Date().toISOString() }).eq('matric_no', matricNo).eq('status', 'PENDING_EXAM_OFFICER');
    alert(`✅ Calculated! GPA: ${gpa.toFixed(2)} | Total CU: ${totalCU} | Forwarded to HOD | Session: ${currentPortalSession}`);
  };

  const downloadMasterSheetPDF_Landscape = () => {
    const filtered = supabaseResults.length > 0 ? supabaseResults : filteredResults as any;
    if(filtered.length===0) { alert('No results to download'); return; }
    const grouped: any = {};
    filtered.forEach((r:any) => { const matric = r.matric_no || r.matricNo; if(!grouped[matric]) grouped[matric]=[]; grouped[matric].push(r); });
    let rowsHTML = '';
    Object.keys(grouped).forEach(matric => {
      const courses = grouped[matric];
      let totalCU=0, totalGP=0; let carryOvers: string[] = [];
      courses.forEach((c:any) => { const total=c.total_score||c.totalScore||0; const cu=c.credit_unit||c.units||3; const gd=getGradeAndPoint(total); if(gd.grade==='F') carryOvers.push(c.course_code||c.courseCode); totalCU+=cu; totalGP+=cu*gd.point; });
      const gpa = totalCU ? totalGP/totalCU : 0;
      const studentName = courses[0].full_name || courses[0].studentName || courses[0].student_name || matric;
      const courseDetails = courses.map((c:any) => { const total=c.total_score||c.totalScore||0; const cu=c.credit_unit||c.units||3; const gd=getGradeAndPoint(total); const code=c.course_code||c.courseCode; if(gd.grade==='F') return `${code}(${total})[${cu}U:${gd.grade}:${gd.point}pt:GP${cu*gd.point}] <b style="color:red">CO</b>`; return `${code}(${total})[${cu}U:${gd.grade}:${gd.point}pt:GP${cu*gd.point}]`; }).join('<br/>');
      const carryText = carryOvers.length>0 ? `<br/><span style="color:red; font-weight:bold; font-size:8px;">REPEAT: ${carryOvers.map(co=>`${co} (CO)`).join(', ')}</span>` : '';
      rowsHTML += `<tr><td>${matric}</td><td style="text-align:left; font-size:8px;">${studentName}${carryText}</td><td style="text-align:left; font-size:7px;">${courseDetails}</td><td><b>${totalCU}</b></td><td><b>${totalGP}</b></td><td><b>${gpa.toFixed(2)}</b></td><td style="font-size:7px;">${courses.map((c:any)=>{ const total=c.total_score||c.totalScore||0; const gd=getGradeAndPoint(total); return gd.grade==='F' ? `<span style="color:red">${c.course_code||c.courseCode}:F(CO)-REPEAT ${c.course_code||c.courseCode}</span>` : `${c.course_code||c.courseCode}:${gd.grade}`; }).join('<br/>')}</td><td style="color:${carryOvers.length>0?'red':'green'}; font-weight:bold; font-size:7px;">${carryOvers.length>0 ? `${carryOvers.length} CO<br/>REPEAT:<br/>${carryOvers.join('<br/>')}` : 'No CO<br/>Pass All'}</td><td>${courses[0].level||''}</td></tr>`;
    });
    const html = `<html><head><title>MASTER SHEET - LABE COLLEGE - ${currentPortalSession}</title><style>@page{size:landscape; margin:8mm;}body{font-family:Arial; font-size:8px;}table{width:100%; border-collapse:collapse;}th,td{border:1px solid #000; padding:3px; text-align:center; vertical-align:top;}th{background:#0a4d2e; color:#fff; font-size:8px; padding:5px 2px;}.header{text-align:center; margin-bottom:8px;}h2{margin:0; font-size:14px;}h3{margin:2px; font-size:10px;}.grading{background:#f0f0f0; border:1px solid #000; padding:4px; margin:5px 0; font-size:8px; text-align:left;}</style></head><body><div class="header"><h2>LABE COLLEGE OF NURSING SCIENCES, GBOKO</h2><h3>Catholic Diocese of Gboko - MASTER SHEET - ${selectedSemester} Semester - ${currentPortalSession} - Promotion: ND1 First→Second→ND2 First | Whole Portal Session: ${currentPortalSession}</h3><p>Exam Officer: ${displayName} | Session: ${currentPortalSession} | Shows: Total Credit Units, Course Code, Grading, Point, CO as REPEAT</p></div><div class="grading"><b>Grading:</b> 70-100=A(4pts), 60-69=B(3pts), 50-59=C(2pts), 40-49=D(1pt), 0-39=F(0pt:CO) | GP=CU×Point | GPA=Total GP/Total CU | CO=Carry Over - REPEAT Course Code</div><table><tr><th>Matric No</th><th>Full Name + CO</th><th>Course Code (Score) [CU:Grade:Point:GP]</th><th>Total CU</th><th>Total GP</th><th>GPA</th><th>Grade + CO Status</th><th>CO Summary</th><th>Level - Promotion</th></tr>${rowsHTML}</table><div style="margin-top:15px; display:flex; justify-content:space-between; font-size:9px;"><div style="text-align:center; border-top:2px solid #000; width:130px; padding-top:4px;"><b>Exam Officer</b><br/>${displayName}<br/>Session ${currentPortalSession}<br/>Calculated</div><div style="text-align:center; border-top:2px solid #000; width:130px; padding-top:4px;"><b>HOD</b><br/>Moderated<br/>CO Verified</div><div style="text-align:center; border-top:2px solid #000; width:130px; padding-top:4px;"><b>Registrar</b><br/>Verified<br/>Session ${currentPortalSession}</div><div style="text-align:center; border-top:2px solid #000; width:130px; padding-top:4px;"><b>Provost</b><br/>Senate Approved<br/>Seal</div></div></body></html>`;
    const win = window.open('', '_blank'); if(win) { win.document.write(html); win.document.close(); win.focus(); setTimeout(()=>win.print(), 600); }
  };

  const downloadMasterSheetExcel = () => {
    const filtered = supabaseResults.length > 0 ? supabaseResults : filteredResults as any;
    if(filtered.length===0) { alert('No results'); return; }
    let csv = `Matric No,Full Name,Course Code,Course Title,Lecturer Name,Credit Unit,CA,Exam,Total,Grade,Point,GP,Remark,CO Status,Repeat If CO,Level,Semester,Session ${currentPortalSession},Status,Calculated By\n`;
    filtered.forEach((r:any) => { const total=r.total_score||r.totalScore||0; const gd=getGradeAndPoint(total); const cu=r.credit_unit||r.units||3; const gp=cu*gd.point; const matric=r.matric_no||r.matricNo; const name=r.full_name||r.studentName||''; const courseCode=r.course_code||r.courseCode; const courseTitle=r.course_title||r.courseTitle||''; const lecturer=r.lecturer_name||supabaseCourses.find((c:any)=>c.course_code===courseCode)?.lecturer_name||'N/A'; const coStatus=gd.grade==='F' ? 'CO - REPEAT' : 'PASS'; const repeatCode=gd.grade==='F' ? `REPEAT ${courseCode}` : ''; csv+=`"${matric}","${name}","${courseCode}","${courseTitle}","${lecturer}","${cu}","${r.ca_score||''}","${r.exam_score||''}","${total}","${gd.grade}","${gd.point}","${gp}","${gd.remark}","${coStatus}","${repeatCode}","${r.level||''}","${r.semester||selectedSemester}","${currentPortalSession}","${r.status||''}","${displayName}"\n`; });
    const blob=new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`LABE_Master_Sheet_${currentPortalSession}_${selectedSemester}.csv`; document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const filteredUsers = users.filter((u:any)=>{
    if(!userSearch) return true;
    const t=userSearch.toLowerCase();
    return (u.fullName||'').toLowerCase().includes(t) || (u.email||'').toLowerCase().includes(t) || (u.matricNumber||'').toLowerCase().includes(t) || (u.staffId||'').toLowerCase().includes(t);
  });

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-amber-400">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-emerald-800 px-3 py-1 rounded-full">Exam & Records • {displayRole} • Session {currentPortalSession} • Course Reg {courseRegs.length} • Users {users.length} • Promotion ND1 First→Second • Run New Session {currentPortalSession}</span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase mt-2">{displayName} - Session {currentPortalSession} - Promotion Live!</h1>
            <p className="text-xs text-emerald-200">Portal Session: {currentPortalSession} — Whole portal controlled by Registrar — Old data kept by session filter! Promotion: When Registrar promotes ND1 First→Second, student sees new level, lecturer sees new semester, you see here! Course Reg: PENDING → APPROVED_BY_EXAM_OFFICER ({displayName}) → APPROVED_BY_HOD → Print with names!</p>
          </div>
          <div className="flex gap-2">
            <div className="bg-white text-emerald-900 px-3 py-2 rounded-xl font-black text-xs">{currentPortalSession}<br/><span className="text-[9px]">Portal Session</span></div>
            <button onClick={() => window.print()} className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl border border-emerald-600"><Printer className="w-4 h-4 inline"/> Print</button>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2 text-[10px]">
          <div className="bg-emerald-800 p-2 rounded-xl"><p className="font-bold">Portal Session</p><p className="font-black text-amber-300 text-sm">{currentPortalSession}</p><p>Registrar controls whole portal - Old kept</p></div>
          <div className="bg-blue-800 p-2 rounded-xl"><p className="font-bold">Course Reg Pending</p><p className="font-black text-amber-300 text-sm">{courseRegs.filter((r:any)=>r.status==='PENDING').length} PENDING</p><p>Approve → Your name on print</p></div>
          <div className="bg-purple-800 p-2 rounded-xl"><p className="font-bold">Promotion Live</p><p className="font-black text-amber-300 text-sm">{users.filter((u:any)=>u.role==='STUDENT').length} Students</p><p>ND1 First→Second→ND2 First</p></div>
          <div className="bg-slate-800 p-2 rounded-xl"><p className="font-bold">All Users Backend</p><p className="font-black text-amber-300 text-sm">{users.length} Users</p><p>Admin creates, you see</p></div>
        </div>
      </div>

      {returnedResults.length > 0 && (
        <div className="bg-red-50 border-4 border-red-400 p-5 rounded-2xl">
          <h3 className="font-black text-red-800 flex items-center gap-2"><RotateCcw className="w-5 h-5"/> ⚠️ RETURNED FOR CORRECTION - {returnedResults.length} - Session {currentPortalSession}</h3>
          <div className="grid md:grid-cols-2 gap-3 mt-3">
            {returnedResults.map((r:any) => (
              <div key={r.id} className="bg-white border-2 border-red-300 p-3 rounded-xl">
                <p className="text-xs"><b>Matric:</b> {r.matric_no} | <b>Course:</b> {r.course_code} | <b>Total:</b> {r.total_score} | <b>Session:</b> {r.session||currentPortalSession}</p>
                <p className="text-xs text-red-600 font-bold">Returned by {r.returned_from}: {r.return_reason}</p>
                <button onClick={()=>correctAndResubmit(r.id)} className="bg-green-600 text-white px-4 py-1.5 rounded-lg mt-2 text-xs font-black">✅ Correct & Re-submit</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border-2 border-slate-200 shadow">
        <button onClick={() => setActiveTab('course_reg')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='course_reg'?'bg-blue-700 text-white shadow ring-2 ring-blue-300':'bg-blue-50 border-2 border-blue-400 text-blue-800'}`}><BookOpen className="w-4 h-4"/><span>📚 Course Reg Approval - {courseRegs.length} - {currentPortalSession} - NEW FEATURE</span><span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-black">{courseRegs.filter((r:any)=>r.status==='PENDING').length} PENDING</span></button>
        <button onClick={() => setActiveTab('users')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='users'?'bg-slate-900 text-white shadow ring-2 ring-amber-300':'bg-slate-50 border-2 border-amber-400 text-slate-800'}`}><Users className="w-4 h-4"/><span>👤 All Users - {users.length} - {currentPortalSession}</span></button>
        <button onClick={() => setActiveTab('lecturer_courses')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='lecturer_courses'?'bg-purple-700 text-white shadow':'bg-purple-50 border-2 border-purple-400 text-purple-800'}`}><School className="w-4 h-4"/><span>👨‍🏫 Lecturer + Courses - {currentPortalSession} - Promotion</span></button>
        <button onClick={() => setActiveTab('biodata')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab==='biodata'?'bg-[#0a4d2e] text-white':'bg-emerald-50 border-2 border-emerald-300 text-emerald-800'}`}><Users className="w-4 h-4"/><span>👨‍🎓 Biodata - {currentPortalSession}</span></button>
        <button onClick={() => setActiveTab('broadsheet')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab==='broadsheet'?'bg-[#0a4d2e] text-white':'text-slate-600 hover:bg-slate-100'}`}><FileSpreadsheet className="w-4 h-4"/><span>Broadsheet + Master Sheet - {currentPortalSession}</span></button>
        <button onClick={() => setActiveTab('scoresheets')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='scoresheets'?'bg-emerald-700 text-white':'bg-emerald-50 border-2 border-emerald-300 text-emerald-800'}`}><Download className="w-4 h-4"/><span>📄 Score Sheets - {currentPortalSession}</span></button>
      </div>

      {/* ===== NEW FEATURE - COURSE REG APPROVAL WITH EXAM OFFICER NAME + HOD NAME ON PRINT - PROMOTION + SESSION ===== */}
      {activeTab==='course_reg' && (
        <div className="bg-white rounded-3xl border-4 border-blue-400 p-6 space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-3">
            <div>
              <h2 className="text-lg font-black flex items-center gap-2"><BookOpen className="w-5 h-5 text-blue-700"/>📚 Course Registration Approval - Exam Officer {displayName} - Session {currentPortalSession} - NEW FEATURE</h2>
              <p className="text-xs font-bold bg-blue-50 border-2 border-blue-200 p-2 rounded mt-1">Student registers course added by Registrar for {currentPortalSession} → Status PENDING → You approve → Status APPROVED_BY_EXAM_OFFICER + exam_officer_name = {displayName} → HOD approves → Student prints approved form with your name + HOD name reflected! Promotion: Student level {users.filter((u:any)=>u.role==='STUDENT').length>0 ? 'auto updates' : 'ND1 First→Second'} | Whole portal session: {currentPortalSession} - Old data kept!</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-white border-2 rounded-xl px-3"><Search className="w-4 h-4"/><input value={regSearch} onChange={e=>setRegSearch(e.target.value)} placeholder="Matric, Name, Course" className="py-2 text-xs font-bold outline-none w-32"/></div>
              <select value={regStatusFilter} onChange={e=>setRegStatusFilter(e.target.value)} className="px-3 py-2 border-2 rounded-xl text-xs font-black"><option value="ALL">All Status ({courseRegs.length})</option><option value="PENDING">PENDING ({courseRegs.filter((r:any)=>r.status==='PENDING').length})</option><option value="APPROVED_BY_EXAM_OFFICER">APPROVED BY YOU ({courseRegs.filter((r:any)=>r.status==='APPROVED_BY_EXAM_OFFICER').length})</option><option value="APPROVED">FULLY APPROVED ({courseRegs.filter((r:any)=>r.status==='APPROVED').length})</option></select>
              <select value={selectedSession} onChange={e=>setSelectedSession(e.target.value)} className="px-3 py-2 border-2 rounded-xl text-xs font-black"><option>{currentPortalSession}</option><option>2026/2027</option><option>2027/2028</option><option>2025/2026</option></select>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-blue-50 border-2 border-amber-400 rounded-xl p-3 text-xs grid md:grid-cols-3 gap-2">
            <div className="bg-white p-2 rounded border"><p className="font-black">FLOW: Registrar → Student → Exam Officer → HOD → Print</p><p>1. Registrar adds NUR111 {currentPortalSession} → Student registers → PENDING</p><p>2. You approve → APPROVED_BY_EXAM_OFFICER + exam_officer_name = {displayName}</p><p>3. HOD approves → APPROVED + hod_name → Student prints with both names!</p></div>
            <div className="bg-white p-2 rounded border"><p className="font-black">Promotion: ND1 First → Second → ND2 First</p><p>Registrar promotes → Student level auto changes → You see new level here → Lecturer sees new semester!</p><p>Example: test.nd1@lcns.edu.ng promoted ND1 First→Second → Shows ND1 Second here!</p></div>
            <div className="bg-white p-2 rounded border"><p className="font-black">Run New Session: {currentPortalSession} → Next Session</p><p>Registrar runs 2027/2028 → Whole portal {currentPortalSession}→2027/2028 → You, Student, Lecturer, HOD all see 2027/2028!</p><p>Old data kept by session filter! Select session above to view old!</p></div>
          </div>

          <div className="overflow-x-auto border-2 rounded-xl">
            <table className="w-full text-xs">
              <thead className="bg-blue-900 text-white"><tr><th className="p-2 text-left">Matric + Full Name + Session {currentPortalSession}</th><th className="p-2">Course Code + Title + CU</th><th className="p-2">Level/Sem - Promotion - Lecturer Sees New Sem</th><th className="p-2">Status + Exam Officer + HOD Name</th><th className="p-2 text-center">Action - Approve + Your Name on Print</th></tr></thead>
              <tbody>
                {filteredCourseRegs.length>0 ? filteredCourseRegs.map((r:any)=>(
                  <tr key={r.id} className="border-b hover:bg-blue-50">
                    <td className="p-2"><p className="font-mono font-black">{r.matric_no}</p><p className="font-bold">{r.full_name||r.email}</p><p className="text-[10px] bg-yellow-100 px-1 rounded">Session: {r.session||currentPortalSession} - Portal: {currentPortalSession}</p></td>
                    <td className="p-2"><p className="font-mono font-black text-blue-800">{r.course_code} - {r.credit_unit}U</p><p className="font-bold">{r.course_title}</p><p className="text-[10px]">Lecturer: {r.lecturer_name}</p></td>
                    <td className="p-2 text-center"><span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">{r.level}</span><span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 ml-1">{r.semester}</span><p className="text-[9px] mt-1">Promotion: {r.level} {r.semester} - Lecturer sees {r.semester} sem!</p></td>
                    <td className="p-2"><span className={`px-2 py-1 rounded-full text-[10px] font-black ${r.status==='PENDING'?'bg-yellow-100 text-yellow-800':r.status==='APPROVED_BY_EXAM_OFFICER'?'bg-blue-100 text-blue-800':r.status==='APPROVED'?'bg-green-100 text-green-800':'bg-red-100 text-red-800'}`}>{r.status}</span><p className="text-[10px] mt-1">Exam Officer: <b>{r.exam_officer_name||'Pending - You approve!'}</b></p><p className="text-[10px]">HOD: <b>{r.hod_name||'Pending after you'}</b></p><p className="text-[9px]">{r.exam_officer_approved_at ? new Date(r.exam_officer_approved_at).toLocaleString() : ''}</p></td>
                    <td className="p-2 text-center flex flex-col gap-1">
                      {r.status==='PENDING' ? (
                        <>
                          <button onClick={()=>approveCourseReg(r.id)} className="px-3 py-1.5 bg-green-600 text-white rounded-full font-black text-[11px]">✅ Approve - Your Name {displayName} on Print</button>
                          <button onClick={()=>rejectCourseReg(r.id)} className="px-3 py-1 bg-red-100 text-red-700 rounded-full font-bold text-[10px]">Reject</button>
                        </>
                      ) : (
                        <>
                          <span className="text-[10px] font-bold text-green-700">✅ Approved by {r.exam_officer_name||displayName}</span>
                          <button onClick={()=>printApprovedRegForm(r.matric_no)} className="px-2 py-1 bg-slate-900 text-white rounded-full text-[10px] font-bold">🖨️ Print Approved Form with {r.exam_officer_name||displayName} + {r.hod_name||'HOD'} Names</button>
                        </>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="p-8 text-center"><p className="font-bold">No course registrations yet for session {currentPortalSession}</p><p className="text-xs">Student registers course added by Registrar for {currentPortalSession} → Appears here PENDING → You approve → Your name {displayName} will reflect on printed approved form + HOD name after HOD approval!</p><p className="text-[11px] mt-2 bg-amber-50 p-2 rounded border">Promotion: When Registrar promotes ND1 First→Second, student level changes → Lecturer sees new semester → You see new level here! Run New Session: When Registrar runs 2027/2028, whole portal {currentPortalSession}→2027/2028, old data kept by session!</p></td></tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] font-bold text-center bg-emerald-50 p-2 rounded border">✅ Exam Officer Approval Feature: You approve → exam_officer_name = {displayName} + exam_officer_email = {displayEmail} + date saved → Student prints approved form with your name + HOD name reflected! Session {currentPortalSession} - Promotion live - Lecturer sees new semester after promotion!</p>
        </div>
      )}

      {activeTab==='users' && (
        <div className="bg-white rounded-3xl border-4 border-amber-400 p-6 space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-3">
            <div>
              <h2 className="text-lg font-black flex items-center gap-2"><Users className="w-5 h-5 text-amber-700"/>All Users - {users.length} - Session {currentPortalSession} - Promotion: Level + Semester Visible</h2>
              <p className="text-xs font-bold bg-amber-50 border p-2 rounded mt-1">Exam Officer sees all users from Supabase — Level + current_semester shows promotion status — Portal session {currentPortalSession} — When Registrar promotes ND1 First→Second, level changes here! When Registrar runs new session {currentPortalSession}→2027/2028, whole portal changes!</p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1 bg-white border-2 rounded-xl px-3"><Search className="w-4 h-4"/><input value={userSearch} onChange={e=>setUserSearch(e.target.value)} placeholder="Search Name, Email, ID, Level" className="py-2 text-xs font-bold outline-none"/></div>
              <select value={selectedSession} onChange={e=>setSelectedSession(e.target.value)} className="px-3 py-2 border-2 rounded-xl text-xs font-black"><option>{currentPortalSession}</option><option>2026/2027</option><option>2027/2028</option></select>
            </div>
          </div>
          <div className="overflow-x-auto border-2 rounded-xl"><table className="w-full text-xs"><thead className="bg-slate-900 text-white"><tr><th className="p-2 text-left">Full Name + Role + Promotion Level</th><th className="p-2">Email + User ID + Session {currentPortalSession}</th><th className="p-2">Password - Eye</th><th className="p-2">Status + Promotion</th><th className="p-2">Created At</th></tr></thead><tbody>{filteredUsers.map((u:any)=>(<tr key={u.email} className="border-b hover:bg-amber-50"><td className="p-2"><p className="font-black">{u.fullName}</p><span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-800 text-white">{u.role}</span> - {u.department} - <span className="bg-yellow-200 px-1 rounded font-bold">{u.level||'STAFF'} {u.current_semester||''}</span> {u.role==='STUDENT' && <span className="text-[9px] bg-green-100 px-1 rounded">Promotion: {u.level} {u.current_semester}</span>}</td><td className="p-2"><p className="font-bold">{u.email}</p><p className="font-mono font-black text-amber-800 text-[11px]">{u.loginId||u.staffId||u.matricNumber}</p><p className="text-[9px]">Session: {currentPortalSession}</p></td><td className="p-2"><span className="flex gap-1 items-center bg-yellow-50 px-2 py-1 rounded border font-mono font-black text-[11px]">{showPasswords[u.email]? (u.password||'123456') : '••••••'}<button onClick={()=>setShowPasswords({...showPasswords,[u.email]:!showPasswords[u.email]})} className="ml-1 p-1 bg-white border rounded">{showPasswords[u.email]?<EyeOff className="w-3 h-3"/>:<Eye className="w-3 h-3"/>}</button></span></td><td className="p-2"><span className={`px-2 py-1 rounded-full text-[10px] font-black ${u.status==='ACTIVE'?'bg-emerald-100 text-emerald-800':'bg-red-100 text-red-800'}`}>{u.status}</span><p className="text-[10px] mt-1">{u.role==='STUDENT' ? `Promotion: ${u.level} ${u.current_semester} - Session ${currentPortalSession}` : `STAFF - Session ${currentPortalSession}`}</p></td><td className="p-2 text-[11px]">{new Date(u.createdAt).toLocaleDateString()}<br/><span className="text-[9px]">{currentPortalSession}</span></td></tr>))}</tbody></table></div>
        </div>
      )}

      {activeTab==='lecturer_courses' ? (
        <div className="bg-white rounded-3xl border-2 border-purple-300 p-6 space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-3"><div><h2 className="text-lg font-black flex items-center gap-2"><School className="w-5 h-5 text-purple-700"/>Lecturer + Course - Semester {selectedSemester} - Session {currentPortalSession} - Promotion: Lecturer Sees New Semester!</h2><p className="text-xs bg-purple-50 border p-2 rounded mt-1">When Registrar promotes student ND1 First→Second, lecturer handling ND1 Second courses sees new students! Session {currentPortalSession} — Whole portal controlled by Registrar!</p></div><div className="flex gap-2"><div className="flex items-center gap-1 bg-white border rounded-xl px-3"><Search className="w-4 h-4"/><input value={searchLecturerCourse} onChange={e=>setSearchLecturerCourse(e.target.value)} placeholder="Search lecturer, course" className="py-2 text-xs font-bold outline-none"/></div><button onClick={()=>window.print()} className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-black">Print - {currentPortalSession}</button></div></div>
          <div className="overflow-x-auto border-2 rounded-xl"><table className="w-full text-xs"><thead className="bg-purple-900 text-white"><tr><th className="p-2 text-left">Course + CU - Session {currentPortalSession}</th><th className="p-2 text-left">Lecturer - Promotion: Sees New Sem</th><th className="p-2">Level - Promotion</th><th className="p-2">Semester - Lecturer Sees New After Promotion</th><th className="p-2">Session - Whole Portal</th><th className="p-2">Students Reg - {currentPortalSession}</th></tr></thead><tbody>{filteredLecturerCourses.length>0 ? filteredLecturerCourses.map((c:any)=>(<tr key={c.id} className="border-b hover:bg-purple-50"><td className="p-2"><p className="font-mono font-black text-purple-800">{c.course_code} - {c.credit_unit||3}U - Session {c.session||currentPortalSession}</p><p className="font-bold">{c.course_title}</p></td><td className="p-2"><p className="font-bold flex items-center gap-1"><UserCheck className="w-3 h-3"/> {c.lecturer_name||'Not Assigned'}</p><p className="text-[11px]">{c.lecturer_email||''} - Promotion: After student promoted, lecturer sees new semester {c.semester} students!</p></td><td className="p-2 text-center font-bold">{c.level} - Promotion: {c.level}</td><td className="p-2 text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${c.semester==='First'?'bg-blue-100 text-blue-800':'bg-green-100 text-green-800'}`}>{c.semester} - Lecturer sees after promotion!</span></td><td className="p-2 text-center text-[11px]">{c.session||currentPortalSession} - Whole portal</td><td className="p-2 text-center font-bold">{courseRegs.filter((r:any)=>r.course_code===c.course_code && r.session===currentPortalSession).length} regs - {currentPortalSession}</td></tr>)) : (<tr><td colSpan={6} className="p-8 text-center"><p className="font-bold">No courses for session {currentPortalSession} yet - Registrar adds courses for {currentPortalSession} with session field - Lecturer sees new semester after promotion!</p></td></tr>)}</tbody></table></div>
        </div>
      ) : activeTab==='biodata' ? (
        <div className="bg-white rounded-3xl border-2 border-emerald-300 p-4 space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-3"><div><h2 className="text-lg font-black flex items-center gap-2"><Users className="w-5 h-5 text-emerald-700"/>Biodata - Session {currentPortalSession} - Promotion: {users.filter((u:any)=>u.role==='STUDENT').length} Students - Level Visible</h2><p className="text-xs font-bold bg-emerald-50 border p-2 rounded mt-1">Promotion: ND1 First→Second→ND2 First - Student sees new level, lecturer sees new semester - Session {currentPortalSession} - Whole portal</p></div><button onClick={()=>window.print()} className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-black">Print - {currentPortalSession}</button></div>
          <div className="overflow-x-auto border-2 rounded-xl"><table className="w-full text-xs"><thead className="bg-slate-900 text-white"><tr><th className="p-2 text-left">Matric + Level - Promotion + Session {currentPortalSession}</th><th className="p-2 text-left">Full Name</th><th className="p-2 text-left">Program + Level + Promotion</th><th className="p-2 text-left">State + Contact</th><th className="p-2 text-left">Lecturer Course + Session {currentPortalSession}</th><th className="p-2">Action</th></tr></thead><tbody>{filteredStudents.map((s:any)=>(<tr key={s.matricNo} className="border-b hover:bg-slate-50"><td className="p-2"><p className="font-mono font-black text-emerald-800">{s.matricNo}</p><span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">{s.level}</span><p className="text-[9px]">Session {currentPortalSession} - Promotion: {s.level}</p></td><td className="p-2"><p className="font-black uppercase">{s.fullName}</p></td><td className="p-2"><p className="font-bold">{s.program}</p><p className="text-[11px]">Level: <b className="bg-yellow-200 px-1 rounded">{s.level}</b> - Promotion live - Session {currentPortalSession}</p></td><td className="p-2"><p className="text-[11px]">{s.stateOfOrigin||''}</p><p className="text-[11px]">{s.phone||'N/A'}</p></td><td className="p-2"><p className="text-[11px] font-bold">{supabaseCourses.filter((c:any)=>c.level===s.level && (c.session===currentPortalSession || !c.session)).map((c:any)=>`${c.course_code}(${c.credit_unit||3}U)`).join(', ') || 'Courses for '+s.level+' Session '+currentPortalSession}</p></td><td className="p-2 text-center"><button onClick={()=>setSelectedBiodata(s)} className="px-3 py-1.5 bg-blue-700 text-white rounded-lg font-black text-[11px]">View - {currentPortalSession}</button></td></tr>))}</tbody></table></div>
        </div>
      ) : activeTab==='admissions_all' ? (
        <div className="space-y-3"><div className="bg-purple-50 border-2 border-purple-300 p-3 rounded-xl text-xs font-bold">All Applicants - Session {currentPortalSession} - Promotion + Run New Session - Whole Portal {currentPortalSession}</div><AdminAdmissionManager currentUser={currentUser} /></div>
      ) : activeTab!=='users' && activeTab!=='course_reg' && activeTab!=='lecturer_courses' && activeTab!=='biodata' && activeTab!=='admissions_all' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80"><Search className="w-4 h-4 text-slate-400 absolute left-3 top-3"/><input type="text" value={searchMatric} onChange={(e) => setSearchMatric(e.target.value)} placeholder={`Search Matric - Session ${currentPortalSession}`} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600"/></div>
            <div className="flex items-center gap-3"><select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value as any)} className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-emerald-950"><option value="First">First Semester - {currentPortalSession}</option><option value="Second">Second Semester - {currentPortalSession}</option></select><select value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)} className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"><option>{currentPortalSession}</option><option>2026/2027</option><option>2027/2028</option></select></div>
          </div>
          <div className="flex flex-wrap gap-2 bg-blue-50 border-2 border-blue-300 p-3 rounded-xl">
            <button onClick={downloadMasterSheetPDF_Landscape} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black flex items-center gap-2"><Printer className="w-4 h-4"/> 📄 Master Sheet PDF - {currentPortalSession} - Promotion Live</button>
            <button onClick={downloadMasterSheetExcel} className="px-5 py-2.5 bg-green-700 text-white rounded-xl text-xs font-black flex items-center gap-2"><FileSpreadsheet className="w-4 h-4"/> 📊 Excel - {currentPortalSession}</button>
          </div>
          <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-emerald-900 text-white font-bold uppercase"><tr><th className="p-3">Matric + Session {currentPortalSession}</th><th className="p-3">Course + CU - Promotion</th><th className="p-3 text-center">Total</th><th className="p-3 text-center">Grade</th><th className="p-3 text-center">GP - Session {currentPortalSession}</th><th className="p-3">CO Status</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredResults.map((r) => { const gd=getGradeAndPoint(r.totalScore); return (<tr key={r.id} className="hover:bg-slate-50"><td className="p-3"><span className="font-mono-code font-bold text-emerald-900 block">{r.matricNo} - {currentPortalSession}</span><span className="text-[11px]">{r.studentName}</span></td><td className="p-3"><span className="font-bold">{r.courseCode} - {r.units}U - Session {currentPortalSession}</span></td><td className="p-3 text-center font-bold">{r.totalScore}</td><td className="p-3 text-center"><span className="font-black">{gd.grade}</span></td><td className="p-3 text-center">{(r.units||3)*gd.point}</td><td className="p-3">{gd.grade==='F' ? `CO - REPEAT ${r.courseCode}` : 'PASS'}</td></tr>); })}</tbody></table></div>
        </div>
      )}
    </div>
  );
};

export default ExamOfficerDashboard;

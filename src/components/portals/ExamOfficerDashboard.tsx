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
} from 'lucide-react';
import { AdminAdmissionManager } from '../admin/AdminAdmissionManager';
import { ScoreSheetViewer } from './ScoreSheetViewer';
import { CourseRegistrationApproval } from './CourseRegistrationApproval';
import { supabase } from '@/lib/supabase';

export const ExamOfficerDashboard: React.FC = () => {
  const [results, setResults] = useState<ResultScore[]>(StorageService.getResults());
  const [students] = useState<Student[]>(StorageService.getStudents());
  const [activeTab, setActiveTab] = useState<'broadsheet' | 'biodata' | 'admissions_all' | 'scoresheets' | 'course_reg' | 'lecturer_courses' | 'returned'>('course_reg');
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

  useEffect(() => {
    async function loadAll() {
      try {
        const { data: studs } = await supabase.from('students').select('*').order('created_at', { ascending: false });
        if(studs) setSupabaseStudents(studs);
        const { data: courses } = await supabase.from('courses').select('*');
        if(courses) setSupabaseCourses(courses);
        const { data: ret } = await supabase.from('student_results_workflow').select('*').eq('status','RETURNED_TO_EXAM_OFFICER');
        if(ret) setReturnedResults(ret);
        const { data: res } = await supabase.from('student_results_workflow').select('*').order('created_at',{ascending:false});
        if(res) setSupabaseResults(res);
      } catch {}
    }
    loadAll();
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
    id: 'LCNS/2026/EX/001',
    email: 'exam@lcns.edu.ng',
    role: 'EXAM_OFFICER',
    fullName: 'Dr. Emmanuel O. Agada',
    status: 'ACTIVE',
  };

  const displayName = (currentUser?.fullName || currentUser?.full_name || 'Dr. Emmanuel O. Agada').toString().toUpperCase();
  const displayEmail = currentUser?.email || 'exam@lcns.edu.ng';
  const displayRole = currentUser?.role || 'EXAM_OFFICER';

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
    alert(`✅ Calculated! GPA: ${gpa.toFixed(2)} | Total CU: ${totalCU} | Forwarded to HOD`);
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
    const html = `<html><head><title>MASTER SHEET - LABE COLLEGE - WITH CU, GRADING, POINT, CO</title><style>@page{size:landscape; margin:8mm;}body{font-family:Arial; font-size:8px;}table{width:100%; border-collapse:collapse;}th,td{border:1px solid #000; padding:3px; text-align:center; vertical-align:top;}th{background:#0a4d2e; color:#fff; font-size:8px; padding:5px 2px;}.header{text-align:center; margin-bottom:8px;}h2{margin:0; font-size:14px;}h3{margin:2px; font-size:10px;}.grading{background:#f0f0f0; border:1px solid #000; padding:4px; margin:5px 0; font-size:8px; text-align:left;}</style></head><body><div class="header"><h2>LABE COLLEGE OF NURSING SCIENCES, GBOKO</h2><h3>Catholic Diocese of Gboko - MASTER SHEET - ${selectedSemester} Semester - ${selectedSession}</h3><p>Exam Officer: ${displayName} | Shows: Total Credit Units, Course Code, Grading, Point, CO (Carry Over) as REPEAT</p></div><div class="grading"><b>Grading:</b> 70-100=A(4pts:Excellent), 60-69=B(3pts:Very Good), 50-59=C(2pts:Good), 40-49=D(1pt:Pass), 0-39=F(0pt:CO-Carry Over-REPEAT Course) | <b>GP = CU × Point</b> | <b>GPA = Total GP / Total CU</b> | <b>CO = Carry Over - Must Repeat Course Code e.g. REPEAT NUR123</b></div><table><tr><th>Matric No</th><th>Full Name (Biodata by Admin) + Carry Over</th><th>Course Code (Score) [CU:Grade:Point:GP] - If F=CO</th><th>Total CU</th><th>Total GP</th><th>GPA</th><th>Grade + CO Status<br/>If F=Show REPEAT Course Code</th><th>CO Summary<br/>Repeat List</th><th>Level</th></tr>${rowsHTML}</table><div style="margin-top:15px; display:flex; justify-content:space-between; font-size:9px;"><div style="text-align:center; border-top:2px solid #000; width:130px; padding-top:4px;"><b>Exam Officer</b><br/>${displayName}<br/>Calculated<br/>Total CU, Grading, Point</div><div style="text-align:center; border-top:2px solid #000; width:130px; padding-top:4px;"><b>HOD</b><br/>Moderated<br/>CO Verified<br/>Signature</div><div style="text-align:center; border-top:2px solid #000; width:130px; padding-top:4px;"><b>Registrar</b><br/>Verified<br/>Carry Over List<br/>Signature</div><div style="text-align:center; border-top:2px solid #000; width:130px; padding-top:4px;"><b>Provost</b><br/>Senate Approved<br/>Official Seal</div></div><p style="font-size:7px; margin-top:8px;">Generated: ${new Date().toLocaleString()} | Total Students: ${Object.keys(grouped).length} | Grading: A=4, B=3, C=2, D=1, F=0(CO) | If CO, student must REPEAT course code e.g. REPEAT NUR123 | GP=CU×Point | GPA=Total GP/Total CU</p></body></html>`;
    const win = window.open('', '_blank'); if(win) { win.document.write(html); win.document.close(); win.focus(); setTimeout(()=>win.print(), 600); }
  };

  const downloadMasterSheetExcel = () => {
    const filtered = supabaseResults.length > 0 ? supabaseResults : filteredResults as any;
    if(filtered.length===0) { alert('No results'); return; }
    let csv = 'Matric No,Full Name (Biodata by Admin),Course Code,Course Title,Lecturer Name,Credit Unit (CU),CA Score,Exam Score,Total Score,Grade,Grade Point (0-4),GP (CU×Point),Remark,CO Status,Repeat Course Code If CO,Level,Semester,Session,Status,Calculated By\n';
    filtered.forEach((r:any) => { const total=r.total_score||r.totalScore||0; const gd=getGradeAndPoint(total); const cu=r.credit_unit||r.units||3; const gp=cu*gd.point; const matric=r.matric_no||r.matricNo; const name=r.full_name||r.studentName||r.student_name||''; const courseCode=r.course_code||r.courseCode; const courseTitle=r.course_title||r.courseTitle||''; const lecturer=r.lecturer_name||supabaseCourses.find((c:any)=>c.course_code===courseCode)?.lecturer_name||'N/A'; const coStatus=gd.grade==='F' ? 'CO - CARRY OVER - MUST REPEAT' : 'PASS - No CO'; const repeatCode=gd.grade==='F' ? `REPEAT ${courseCode}` : ''; csv+=`"${matric}","${name.replace(/"/g,'""')}","${courseCode}","${courseTitle.replace(/"/g,'""')}","${lecturer}","${cu}","${r.ca_score||r.caScore||''}","${r.exam_score||r.examScore||''}","${total}","${gd.grade}","${gd.point}","${gp}","${gd.remark}","${coStatus}","${repeatCode}","${r.level||''}","${r.semester||selectedSemester}","${r.session||selectedSession}","${r.status||''}","${displayName}"\n`; });
    csv+='\n\nSUMMARY - PER STUDENT - TOTAL CU, GPA, CARRY OVER LIST\nMatric No,Full Name,Total Courses,Total Credit Units (CU),Total GP,GPA,CGPA,Carry Over Count,Carry Over Courses (CO),Repeat List (e.g. REPEAT NUR123),Class,Status\n';
    const grouped: any = {}; filtered.forEach((r:any) => { const matric=r.matric_no||r.matricNo; if(!grouped[matric]) grouped[matric]=[]; grouped[matric].push(r); });
    Object.keys(grouped).forEach(matric => { const courses=grouped[matric]; let totalCU=0, totalGP=0, carryCodes: string[]=[]; courses.forEach((c:any)=>{ const total=c.total_score||c.totalScore||0; const gd=getGradeAndPoint(total); const cu=c.credit_unit||c.units||3; totalCU+=cu; totalGP+=cu*gd.point; if(gd.grade==='F') carryCodes.push(c.course_code||c.courseCode); }); const gpa=totalCU?totalGP/totalCU:0; const carryList=carryCodes.length>0?carryCodes.join('; '):'No CO'; const repeatList=carryCodes.length>0?carryCodes.map(co=>`REPEAT ${co}`).join('; '):'No Repeat'; csv+=`"${matric}","${courses[0].full_name||courses[0].studentName||''}","${courses.length}","${totalCU}","${totalGP}","${gpa.toFixed(2)}","${gpa.toFixed(2)}","${carryCodes.length}","${carryList}","${repeatList}","N/A","Calculated & Forwarded to HOD - Shows CU, Grade, Point, CO"\n`; });
    csv+='\n\nGRADING SYSTEM\nScore Range,Grade,Point,Remark,GP Formula,CO Status\n70-100,A,4,Excellent,CU×4,PASS\n60-69,B,3,Very Good,CU×3,PASS\n50-59,C,2,Good,CU×2,PASS\n40-49,D,1,Pass,CU×1,PASS\n0-39,F,0,Fail - Carry Over (CO),CU×0,CO - REPEAT Course Code e.g. REPEAT NUR123\n';
    const blob=new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`LABE_Master_Sheet_CU_Grading_Point_CO_${selectedSession}_${selectedSemester}_${new Date().toISOString().slice(0,10)}.csv`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-emerald-800 px-3 py-1 rounded-full">Examination & Records Unit • {displayRole} • Course Registration + Score Sheets + Master Sheet + CO</span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase font-serif-crest mt-2">{displayName}</h1>
            <p className="text-xs text-emerald-200">{displayEmail} - Receives scores from lecturer - Calculates GPA/CGPA with CU, Grade, Point - Shows CO as REPEAT - Forwards to HOD - Download Master Sheet Landscape PDF + Excel</p>
          </div>
          <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl border border-emerald-600 shadow-md self-start sm:self-auto"><Printer className="w-4 h-4"/><span>Print</span></button>
        </div>
        <div className="mt-6 pt-5 border-t border-emerald-800/80 flex flex-wrap items-center justify-between gap-4 text-xs"><div className="flex items-center gap-2"><Calculator className="w-4 h-4 text-amber-400"/><span className="text-emerald-200">Grading: A=4 B=3 C=2 D=1 F=0(CO) | GP=CU×Point | If CO → REPEAT Course Code e.g. REPEAT NUR123</span></div><div className="flex gap-2"><span className="bg-red-600 px-3 py-1 rounded-full font-bold">↩️ Returned: {returnedResults.length}</span><span className="bg-blue-600 px-3 py-1 rounded-full font-bold">Biodata: {allBiodataStudents.length}</span><span className="bg-purple-600 px-3 py-1 rounded-full font-bold">Courses: {supabaseCourses.length}</span></div></div>
      </div>

      {returnedResults.length > 0 && (
        <div className="bg-red-50 border-4 border-red-400 p-5 rounded-2xl">
          <h3 className="font-black text-red-800 flex items-center gap-2"><RotateCcw className="w-5 h-5"/> ⚠️ RETURNED FOR CORRECTION FROM HOD/REGISTRAR/PROVOST - {returnedResults.length} Results - Return to Exam Officer</h3>
          <div className="grid md:grid-cols-2 gap-3 mt-3">
            {returnedResults.map((r:any) => (
              <div key={r.id} className="bg-white border-2 border-red-300 p-3 rounded-xl">
                <p className="text-xs"><b>Matric:</b> {r.matric_no} | <b>Course:</b> {r.course_code} | <b>Total:</b> {r.total_score} | <b>CU:</b> {r.credit_unit} | <b>Grade:</b> {getGradeAndPoint(r.total_score||0).grade} | <b>Point:</b> {getGradeAndPoint(r.total_score||0).point}</p>
                <p className="text-xs text-red-600 font-bold">Returned by {r.returned_from} ({r.returned_by}): {r.return_reason}</p>
                <button onClick={()=>correctAndResubmit(r.id)} className="bg-green-600 text-white px-4 py-1.5 rounded-lg mt-2 text-xs font-black">✅ Correct & Re-submit to HOD</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <button onClick={() => setActiveTab('course_reg')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='course_reg'?'bg-blue-700 text-white shadow ring-2 ring-blue-300':'bg-blue-50 border-2 border-blue-400 text-blue-800'}`}><BookOpen className="w-4 h-4"/><span>📚 Course Reg Approval</span><span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-black">CREDIT</span></button>
        <button onClick={() => setActiveTab('lecturer_courses')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='lecturer_courses'?'bg-purple-700 text-white shadow':'bg-purple-50 border-2 border-purple-400 text-purple-800'}`}><School className="w-4 h-4"/><span>👨‍🏫 Lecturer + Courses in Semester</span></button>
        <button onClick={() => setActiveTab('biodata')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab==='biodata'?'bg-[#0a4d2e] text-white':'bg-emerald-50 border-2 border-emerald-300 text-emerald-800'}`}><Users className="w-4 h-4"/><span>👨‍🎓 Biodata Created by Admin</span></button>
        <button onClick={() => setActiveTab('returned')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='returned'?'bg-red-700 text-white':'bg-red-50 border-2 border-red-400 text-red-800'}`}><RotateCcw className="w-4 h-4"/><span>↩️ Returned ({returnedResults.length})</span></button>
        <button onClick={() => setActiveTab('scoresheets')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='scoresheets'?'bg-emerald-700 text-white':'bg-emerald-50 border-2 border-emerald-300 text-emerald-800'}`}><Download className="w-4 h-4"/><span>📄 Score Sheets - Download PDF</span></button>
        <button onClick={() => setActiveTab('broadsheet')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab==='broadsheet'?'bg-[#0a4d2e] text-white':'text-slate-600 hover:bg-slate-100'}`}><FileSpreadsheet className="w-4 h-4"/><span>Broadsheet + Master Sheet + CO</span></button>
        <button onClick={() => setActiveTab('admissions_all')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab==='admissions_all'?'bg-purple-700 text-white':'bg-purple-50 border border-purple-300 text-purple-800'}`}><GraduationCap className="w-4 h-4"/><span>🎓 All Applicants</span></button>
      </div>

      {selectedStudentForView && (
        <div id="individual-student-view" className="bg-white border-4 border-blue-500 p-6 rounded-2xl space-y-4">
          {(() => {
            const matricNo = selectedStudentForView;
            const studentCourses = supabaseResults.filter((r:any) => (r.matric_no||r.matricNo)===matricNo);
            const localCourses = filteredResults.filter((r:any) => r.matricNo===matricNo);
            const allCourses = studentCourses.length>0 ? studentCourses : localCourses as any;
            if(allCourses.length===0) return <p>No courses for {matricNo}</p>;
            const studentName = allCourses[0].full_name || allCourses[0].studentName || matricNo;
            let totalCU=0, totalGP=0; let carryOvers: string[] = [];
            allCourses.forEach((c:any) => { const total=c.total_score||c.totalScore||0; const gd=getGradeAndPoint(total); const cu=c.credit_unit||c.units||3; totalCU+=cu; totalGP+=cu*gd.point; if(gd.grade==='F') carryOvers.push(c.course_code||c.courseCode); });
            const gpa = totalCU ? totalGP/totalCU : 0;
            return (
              <>
                <div className="flex justify-between items-center bg-blue-900 text-white p-3 rounded-xl"><h3 className="font-black">Individual View - {matricNo} - {studentName} - Total CU: {totalCU} - GPA: {gpa.toFixed(2)} - {carryOvers.length>0 ? `CO: ${carryOvers.length}` : 'No CO'}</h3><button onClick={()=>setSelectedStudentForView(null)} className="bg-white text-blue-900 px-3 py-1 rounded-full font-black">X Close</button></div>
                <div className="grid md:grid-cols-3 gap-3 text-xs"><div className="bg-slate-900 text-white p-3 rounded-xl text-center"><p className="text-[10px]">Total Credit Units</p><p className="text-2xl font-black">{totalCU}</p></div><div className="bg-emerald-900 text-white p-3 rounded-xl text-center"><p className="text-[10px]">Total GP (CU×Point)</p><p className="text-2xl font-black">{totalGP}</p><p className="text-[10px]">GPA: {gpa.toFixed(2)}</p></div><div className={`p-3 rounded-xl text-center border-2 ${carryOvers.length>0?'bg-red-100 border-red-400 text-red-800':'bg-green-100 border-green-400 text-green-800'}`}><p className="text-[10px] font-bold">Carry Over (CO)</p><p className="font-black">{carryOvers.length>0 ? `${carryOvers.length} CO - REPEAT: ${carryOvers.join(', ')}` : 'No CO - Pass All'}</p></div></div>
                <div className="overflow-x-auto border-2 rounded-xl"><table className="w-full text-xs"><thead className="bg-slate-900 text-white"><tr><th className="p-2">Course Code</th><th className="p-2">Title + Lecturer</th><th className="p-2">CU</th><th className="p-2">CA</th><th className="p-2">Exam</th><th className="p-2">Total</th><th className="p-2">Grade</th><th className="p-2">Point</th><th className="p-2">GP</th><th className="p-2">Remark + CO</th></tr></thead><tbody>{allCourses.map((c:any, i:number) => { const total=c.total_score||c.totalScore||0; const gd=getGradeAndPoint(total); const cu=c.credit_unit||c.units||3; const lecturer=c.lecturer_name||supabaseCourses.find((s:any)=>s.course_code===(c.course_code||c.courseCode))?.lecturer_name||'N/A'; return (<tr key={i} className={gd.grade==='F' ? 'bg-red-50' : 'hover:bg-slate-50'}><td className="p-2 font-mono font-bold border">{c.course_code||c.courseCode}</td><td className="p-2 border"><p className="font-bold">{c.course_title||c.courseTitle||''}</p><p className="text-[10px]">Lecturer: {lecturer}</p></td><td className="p-2 text-center font-bold border">{cu}</td><td className="p-2 text-center border">{c.ca_score||c.caScore||''}</td><td className="p-2 text-center border">{c.exam_score||c.examScore||''}</td><td className="p-2 text-center font-bold border">{total}</td><td className={`p-2 text-center font-black border ${gd.grade==='F'?'bg-red-600 text-white':'bg-emerald-100'}`}>{gd.grade}{gd.grade==='F'?' (CO)':''}</td><td className="p-2 text-center font-bold border">{gd.point}</td><td className="p-2 text-center font-bold border">{cu*gd.point}</td><td className={`p-2 border text-[11px] ${gd.grade==='F'?'text-red-700 font-bold':''}`}>{gd.remark}{gd.grade==='F' ? ` - REPEAT ${c.course_code||c.courseCode}` : ''}</td></tr>); })}</tbody><tfoot className="bg-blue-100 font-black"><tr><td colSpan={2} className="p-2 text-right">TOTAL:</td><td className="p-2 text-center">{totalCU}</td><td colSpan={3} className="p-2 text-center"></td><td colSpan={2} className="p-2 text-center">GP: {totalGP}</td><td className="p-2 text-center">GPA: {gpa.toFixed(2)}</td><td className="p-2">{carryOvers.length>0 ? `CO: ${carryOvers.length} - ${carryOvers.map(co=>`REPEAT ${co}`).join(', ')}` : 'No CO'}</td></tr></tfoot></table></div>
                {carryOvers.length>0 && (<div className="bg-red-50 border-2 border-red-400 p-3 rounded-xl"><p className="font-black text-red-800 text-xs">⚠️ CARRY OVER (CO) - Student Must Repeat:</p><p className="text-xs font-bold mt-1">{carryOvers.map(co=>`REPEAT ${co} (CO)`).join(', ')} - Total {carryOvers.length} course(s)</p></div>)}
                <div className="flex flex-wrap gap-2"><button onClick={()=>window.print()} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black">🖨️ Print This Student - CU, Grade, Point, CO</button><button onClick={()=>calculateAndForwardToHOD(matricNo)} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black">➡️ Calculate & Forward to HOD - GPA: {gpa.toFixed(2)}</button><button onClick={()=>setSelectedStudentForView(null)} className="px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-black">✅ Done</button></div>
              </>
            );
          })()}
        </div>
      )}

      {activeTab==='lecturer_courses' ? (
        <div className="bg-white rounded-3xl border-2 border-purple-300 p-6 space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-3"><div><h2 className="text-lg font-black flex items-center gap-2"><School className="w-5 h-5 text-purple-700"/>Lecturer + Course Taken in Semester - {selectedSemester} {selectedSession}</h2><p className="text-xs bg-purple-50 border p-2 rounded mt-1">Exam Officer sees which lecturer handling which course this semester - Biodata created by Admin</p></div><div className="flex gap-2"><div className="flex items-center gap-1 bg-white border rounded-xl px-3"><Search className="w-4 h-4"/><input value={searchLecturerCourse} onChange={e=>setSearchLecturerCourse(e.target.value)} placeholder="Search lecturer, course" className="py-2 text-xs font-bold outline-none"/></div><button onClick={()=>window.print()} className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-black">Print</button></div></div>
          <div className="overflow-x-auto border-2 rounded-xl"><table className="w-full text-xs"><thead className="bg-purple-900 text-white"><tr><th className="p-2 text-left">Course Code + Title + CU + Grading</th><th className="p-2 text-left">Lecturer Name + Email</th><th className="p-2">Level</th><th className="p-2">Semester</th><th className="p-2">Session</th><th className="p-2">Students Reg</th><th className="p-2">Action</th></tr></thead><tbody>{filteredLecturerCourses.length>0 ? filteredLecturerCourses.map((c:any)=>(<tr key={c.id} className="border-b hover:bg-purple-50"><td className="p-2"><p className="font-mono font-black text-purple-800">{c.course_code || c.code} - {c.credit_unit||c.units||3}U</p><p className="font-bold">{c.course_title || c.title}</p><p className="text-[10px]">Grading: A=4 B=3 C=2 D=1 F=0(CO)</p></td><td className="p-2"><p className="font-bold flex items-center gap-1"><UserCheck className="w-3 h-3"/> {c.lecturer_name || c.lecturerName || 'Not Assigned'}</p><p className="text-[11px] text-slate-600">{c.lecturer_email || ''}</p></td><td className="p-2 text-center font-bold">{c.level}</td><td className="p-2 text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${c.semester==='First'?'bg-blue-100 text-blue-800':'bg-green-100 text-green-800'}`}>{c.semester || selectedSemester}</span></td><td className="p-2 text-center text-[11px]">{c.session || selectedSession}</td><td className="p-2 text-center font-bold">{supabaseResults.filter((r:any)=>r.course_code===c.course_code).length} students</td><td className="p-2 text-center"><button onClick={()=>alert('View scores for '+c.course_code)} className="px-2 py-1 bg-blue-600 text-white rounded text-[10px] font-bold">View Scores - CU, Grade, Point</button></td></tr>)) : (<tr><td colSpan={7} className="p-8 text-center"><p className="font-bold">No courses in Supabase yet - Showing local courses with CU, Grading, Point</p><div className="mt-3 grid md:grid-cols-2 gap-2">{StorageService.getCourses().map((c:any)=>(<div key={c.id} className="border p-2 rounded text-left"><p className="font-bold">{c.code} - {c.title} - {c.units||3}U - Grade: A=4 B=3 C=2 D=1 F=0(CO)</p><p className="text-[11px]">Lecturer: {c.lecturerName} | Level: {c.level}</p></div>))}</div></td></tr>)}</tbody></table></div>
        </div>
      ) : activeTab==='returned' ? (
        <div className="bg-white rounded-3xl border-4 border-red-300 p-6 space-y-4">
          <h2 className="text-lg font-black flex items-center gap-2"><RotateCcw className="w-5 h-5 text-red-700"/>Returned for Correction - From HOD / Registrar / Provost → Exam Officer - Shows CU, Grade, Point, CO</h2>
          {returnedResults.length===0 ? (<div className="border-2 border-dashed p-12 text-center rounded-2xl"><p className="font-bold">No returned results — All good! ✅</p><p className="text-xs text-slate-500">When HOD/Registrar/Provost finds error, they return → Appears here</p></div>) : (<div className="space-y-3">{returnedResults.map((r:any)=>{ const gd=getGradeAndPoint(r.total_score||0); return (<div key={r.id} className="border-2 border-red-300 p-4 rounded-xl bg-red-50"><div className="flex justify-between"><div className="text-xs space-y-1"><p><b>Matric:</b> {r.matric_no} | <b>Course:</b> {r.course_code} | <b>CU:</b> {r.credit_unit} | <b>Score:</b> {r.total_score} | <b>Grade:</b> {gd.grade} | <b>Point:</b> {gd.point} | <b>GP:</b> {(r.credit_unit||3)*gd.point} {gd.grade==='F'? ' - CO - REPEAT '+r.course_code : ''}</p><p className="text-red-700"><b>Returned by {r.returned_from}:</b> {r.return_reason}</p></div><div className="flex flex-col gap-2"><button onClick={()=>correctAndResubmit(r.id)} className="px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-black">✅ Correct & Re-submit to HOD</button><button onClick={async()=>{const newCA=prompt('Enter new CA', r.ca_score); const newExam=prompt('Enter new Exam', r.exam_score); if(newCA&&newExam){const total=parseInt(newCA)+parseInt(newExam); await supabase.from('student_results_workflow').update({ca_score:newCA, exam_score:newExam, total_score:total}).eq('id', r.id); alert('Updated - Shows new Grade, Point, CO if F - Now re-submit')}}} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">✏️ Edit Scores - Recalc Grade, Point, CO</button></div></div></div>); })}</div>)}
        </div>
      ) : activeTab==='course_reg' ? (
        <CourseRegistrationApproval currentUser={currentUser} />
      ) : activeTab==='scoresheets' ? (
        <ScoreSheetViewer currentUser={currentUser} />
      ) : activeTab==='biodata' ? (
        <div className="bg-white rounded-3xl border-2 border-emerald-300 p-4 space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-3"><div><h2 className="text-lg font-black flex items-center gap-2"><Users className="w-5 h-5 text-emerald-700"/>All Students Biodata Created by Admin - Current Level Visible - {displayName} View</h2><p className="text-xs font-bold bg-emerald-50 border p-2 rounded mt-1">Exam Officer sees all biodata created by Admin — Shows Matric, Level, CU, Lecturer Courses</p></div><button onClick={()=>window.print()} className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-black flex items-center gap-1 self-start"><Download className="w-4 h-4"/>Print Biodata</button></div>
          <div className="flex flex-wrap gap-2 bg-slate-50 p-3 rounded-xl border"><div className="flex items-center gap-2 flex-1 bg-white border rounded-xl px-3"><Search className="w-4 h-4 text-slate-400"/><input value={searchBiodata} onChange={e=>setSearchBiodata(e.target.value)} placeholder="Search Name, Matric No, Program, Level" className="flex-1 py-2 text-xs font-bold outline-none"/></div><select value={levelFilter} onChange={e=>setLevelFilter(e.target.value)} className="px-4 py-2 border-2 border-emerald-300 rounded-xl text-xs font-black"><option value="ALL">All Levels ({allBiodataStudents.length})</option><option value="ND 1">ND 1</option><option value="ND 2">ND 2</option><option value="HND 1">HND 1</option><option value="HND 2">HND 2</option><option value="ND1">ND1</option><option value="ND2">ND2</option></select><div className="px-3 py-2 bg-emerald-900 text-white rounded-xl text-xs font-black">{filteredStudents.length} Students (Admin Created)</div></div>
          <div className="overflow-x-auto border-2 rounded-xl"><table className="w-full text-xs"><thead className="bg-slate-900 text-white"><tr><th className="p-2 text-left">Matric No + Level (Biodata by Admin)</th><th className="p-2 text-left">Full Name</th><th className="p-2 text-left">Program + Current Level</th><th className="p-2 text-left">State + Contact</th><th className="p-2 text-left">Lecturer Course This Sem + CU</th><th className="p-2">Action</th></tr></thead><tbody>{filteredStudents.map((s:any)=>(<tr key={s.matricNo} className="border-b hover:bg-slate-50"><td className="p-2"><p className="font-mono font-black text-emerald-800">{s.matricNo}</p><span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${s.level?.includes('ND 1')||s.level==='ND1'?'bg-blue-100 text-blue-800':s.level?.includes('ND 2')||s.level==='ND2'?'bg-green-100 text-green-800':s.level?.includes('HND 1')||s.level==='HND1'?'bg-purple-100 text-purple-800':'bg-amber-100 text-amber-900'}`}>{s.level}</span><p className="text-[9px] text-slate-500">Created by Admin</p></td><td className="p-2"><p className="font-black uppercase">{s.fullName}</p><p className="text-[11px]">{s.bloodGroup || ''} / {s.genotype || ''}</p></td><td className="p-2"><p className="font-bold">{s.program}</p><p className="text-[11px]">Current Level: <b className="bg-yellow-200 px-1 rounded">{s.level}</b> | {s.session || selectedSession}</p></td><td className="p-2"><p className="text-[11px]">{s.stateOfOrigin || (s as any).state || ''} - {s.lga || ''}</p><p className="text-[11px]">{s.phone || 'N/A'} | {s.email || ''}</p></td><td className="p-2"><p className="text-[11px] font-bold">{supabaseCourses.filter((c:any)=>c.level===s.level).map((c:any)=>`${c.course_code}(${c.credit_unit||3}U)`).join(', ') || 'All courses for ' + s.level}</p><p className="text-[9px]">Lecturers: {supabaseCourses.filter((c:any)=>c.level===s.level).map((c:any)=>c.lecturer_name).join(', ').slice(0,30) || 'Assigned'}</p></td><td className="p-2 text-center"><button onClick={()=>setSelectedBiodata(s)} className="px-3 py-1.5 bg-blue-700 text-white rounded-lg font-black text-[11px]">View Full Biodata</button><button onClick={()=>viewIndividualStudent(s.matricNo)} className="mt-1 px-3 py-1 bg-green-600 text-white rounded-lg font-black text-[10px]">View Result - CU, Grade, Point, CO</button></td></tr>))}</tbody></table></div>
          {selectedBiodata && (<div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"><div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-3"><div className="flex justify-between border-b pb-2"><h3 className="font-black">Biodata - {selectedBiodata.fullName} - Level: {selectedBiodata.level} - Created by Admin</h3><button onClick={()=>setSelectedBiodata(null)} className="px-3 py-1 bg-slate-100 rounded-full font-black">X</button></div><div className="text-xs space-y-1"><p>Matric: {selectedBiodata.matricNo}</p><p>Full Name: {selectedBiodata.fullName}</p><p>Program: {selectedBiodata.program}</p><p>Current Level: <b className="bg-yellow-300 px-2 rounded">{selectedBiodata.level}</b></p><p>State: {selectedBiodata.stateOfOrigin || (selectedBiodata as any).state}</p><p>Phone: {selectedBiodata.phone}</p><p>Email: {selectedBiodata.email}</p><p className="mt-2 font-bold">Lecturer Courses This Semester ({selectedSemester}) - With CU, Grade, Point:</p><p className="text-[11px]">{supabaseCourses.filter((c:any)=>c.level===selectedBiodata.level).map((c:any)=>`${c.course_code}(${c.credit_unit||3}U) - ${c.lecturer_name}`).join(', ') || 'All level courses'}</p></div><button onClick={()=>window.print()} className="w-full py-3 bg-slate-900 text-white rounded-xl font-black">Print</button></div></div>)}
        </div>
      ) : activeTab==='admissions_all' ? (
        <div className="space-y-3"><div className="bg-purple-50 border-2 border-purple-300 p-3 rounded-xl text-xs font-bold">Exam Officer {displayName} - All Applicants Records Link - CBT + Interview Scores</div><AdminAdmissionManager currentUser={currentUser} /></div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80"><Search className="w-4 h-4 text-slate-400 absolute left-3 top-3"/><input type="text" value={searchMatric} onChange={(e) => setSearchMatric(e.target.value)} placeholder="Search by Matric No or Course Code - Shows CU, Grade, Point, CO" className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600"/></div>
            <div className="flex items-center gap-3"><select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value as any)} className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-emerald-950"><option value="First">First Semester</option><option value="Second">Second Semester</option></select><select value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)} className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"><option value="2026/2027">2026/2027</option><option value="2025/2026">2025/2026</option></select></div>
          </div>

          <div className="flex flex-wrap gap-2 bg-blue-50 border-2 border-blue-300 p-3 rounded-xl">
            <button onClick={downloadMasterSheetPDF_Landscape} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black flex items-center gap-2"><Printer className="w-4 h-4"/> 📄 Master Sheet PDF LANDSCAPE - CU, Grade, Point, CO=REPEAT Course</button>
            <button onClick={downloadMasterSheetExcel} className="px-5 py-2.5 bg-green-700 text-white rounded-xl text-xs font-black flex items-center gap-2"><FileSpreadsheet className="w-4 h-4"/> 📊 Master Sheet EXCEL - CU, Grade, Point, CO, REPEAT List</button>
            <button onClick={()=>{ if(confirm(`Forward all ${supabaseResults.filter((r:any)=>r.status==='PENDING_EXAM_OFFICER').length} results to HOD?`)) { supabase.from('student_results_workflow').update({ status: 'PENDING_HOD' }).eq('status', 'PENDING_EXAM_OFFICER').then(()=>alert('✅ All forwarded to HOD - With CU, Grade, Point, CO')); } }} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black">➡️ Forward All Calculated to HOD - Shows Total CU, GPA, CO</button>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-400 p-3 rounded-xl text-xs"><p className="font-black">Grading: 70-100=A(4pts), 60-69=B(3pts), 50-59=C(2pts), 40-49=D(1pt), 0-39=F(0pt=CO) | GP=CU×Point | If F → CO → REPEAT Course Code e.g. REPEAT NUR123 | Exam Officer Views Individual → Sees CU, Grade, Point, CO</p></div>

          {gpaResult && (<div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 flex items-center justify-between"><div><span className="text-xs text-slate-600">GPA for:</span><strong className="ml-2 font-mono-code">{gpaResult.matric}</strong><span className="text-xs text-slate-500 ml-3">({gpaResult.totalUnits} Units - Total CU)</span></div><div className="text-right"><span className="text-xs text-slate-500 block">Semester GPA</span><span className="text-2xl font-black text-emerald-900 font-mono-code">{gpaResult.gpa.toFixed(2)}</span></div></div>)}
          
          <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-emerald-900 text-white font-bold uppercase"><tr><th className="p-3">Matric No & Student (Biodata by Admin)</th><th className="p-3">Course + Lecturer + CU</th><th className="p-3 text-center">Total CU</th><th className="p-3 text-center">CA (30)</th><th className="p-3 text-center">Exam (70)</th><th className="p-3 text-center">Total (100)</th><th className="p-3 text-center">Grade</th><th className="p-3 text-center">Point</th><th className="p-3 text-center">GP (CU×Pt)</th><th className="p-3">CO Status</th><th className="p-3 text-right no-print">Actions - View Individual</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredResults.map((r) => { const gd=getGradeAndPoint(r.totalScore); const gp=(r.units||3)*gd.point; const coStatus=gd.grade==='F' ? `CO - REPEAT ${r.courseCode}` : 'PASS'; return (<tr key={r.id} className={`hover:bg-slate-50 ${gd.grade==='F'?'bg-red-50':''}`}><td className="p-3"><span className="font-mono-code font-bold text-emerald-900 block">{r.matricNo}</span><span className="text-slate-600 font-semibold text-[11px]">{r.studentName} - Biodata by Admin</span></td><td className="p-3"><span className="font-bold text-slate-800">{r.courseCode} - {r.units}U</span><span className="block text-[10px] text-slate-500">{r.courseTitle}</span><span className="block text-[9px] bg-yellow-100 px-1 rounded">Lecturer: {StorageService.getCourses().find((c:any)=>c.code===r.courseCode)?.lecturerName || supabaseCourses.find((c:any)=>c.course_code===r.courseCode)?.lecturer_name || 'N/A'}</span></td><td className="p-3 text-center font-bold bg-blue-50">{r.units}U</td><td className="p-3 text-center font-mono-code">{r.caScore}</td><td className="p-3 text-center font-mono-code">{r.examScore}</td><td className="p-3 text-center font-mono-code font-bold text-sm">{r.totalScore}</td><td className="p-3 text-center"><span className={`inline-block font-black text-xs px-2 py-0.5 rounded ${gd.grade==='A'?'bg-emerald-100 text-emerald-800':gd.grade==='B'?'bg-teal-100 text-teal-900':gd.grade==='C'?'bg-amber-100 text-amber-800':gd.grade==='D'?'bg-orange-100 text-orange-800':'bg-red-600 text-white'}`}>{gd.grade}{gd.grade==='F'?' (CO)':''}</span></td><td className="p-3 text-center font-mono-code font-bold">{gd.point}</td><td className="p-3 text-center font-mono-code font-bold bg-green-50">{gp}</td><td className="p-3"><span className={`text-[11px] font-bold ${gd.grade==='F'?'text-red-700':''}`}>{coStatus}</span></td><td className="p-3 text-right no-print flex gap-1"><button onClick={() => handleComputeGPA(r.matricNo)} className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 text-emerald-900 border rounded text-[11px] font-bold">Calc GPA</button><button onClick={()=>viewIndividualStudent(r.matricNo)} className="px-2.5 py-1 bg-blue-600 text-white rounded text-[11px] font-bold">👁️ View</button></td></tr>); })}</tbody></table></div>
        </div>
      )}
    </div>
  );
};

export default ExamOfficerDashboard;

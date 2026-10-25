import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { Course, Student } from '../../types';
import {
  BookOpen,
  UserCheck,
  Plus,
  Users,
  CheckCircle2,
  GraduationCap,
  Search,
  Download,
  Printer,
  FileSpreadsheet,
  ArrowRight,
  ArrowLeft,
  Edit,
  Save,
} from 'lucide-react';
import { AdminAdmissionManager } from '../admin/AdminAdmissionManager';
import { ScoreSheetViewer } from './ScoreSheetViewer';
import { CourseRegistrationApproval } from './CourseRegistrationApproval';
import { PrintableResultWithLogo } from '../common/PrintableResultWithLogo';
import { supabase } from '@/lib/supabase';

export const HODDashboard: React.FC = () => {
  // ===== SINGLE USER DECLARATION - FIXED DUPLICATE =====
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
    id: 'LCNS/2026/HOD/001',
    email: 'hod.nursing@lcns.edu.ng',
    role: 'HOD',
    fullName: 'Dr. (Mrs) Rebecca M. Chia',
    status: 'ACTIVE',
  };

  const displayName = (currentUser?.fullName || (currentUser as any)?.full_name || 'Dr. (Mrs) Rebecca M. Chia').toString().toUpperCase();
  const displayEmail = currentUser?.email || 'hod.nursing@lcns.edu.ng';
  const displayRole = currentUser?.role || 'HOD';

  const [courses, setCourses] = useState<Course[]>(StorageService.getCourses());
  const [students] = useState<Student[]>(StorageService.getStudents());
  const [activeTab, setActiveTab] = useState<'courses' | 'biodata' | 'admissions_all' | 'scoresheets' | 'course_reg' | 'individual_result' | 'vet_result'>('course_reg');
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [units, setUnits] = useState(3);
  const [level, setLevel] = useState('ND 1');
  const [semester, setSemester] = useState<'First' | 'Second'>('First');
  const [lecturerName, setLecturerName] = useState('Nurse Emmanuel Gbaorun (FWACN)');
  const [searchBiodata, setSearchBiodata] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [selectedBiodata, setSelectedBiodata] = useState<any>(null);
  const [searchIndividual, setSearchIndividual] = useState('');
  const [selectedPrintStudent, setSelectedPrintStudent] = useState<any>(null);
  const [computationResults, setComputationResults] = useState<any[]>(() => {
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

  const [examSubmissions, setExamSubmissions] = useState<any[]>(() => {
    try { 
      const s1 = JSON.parse(localStorage.getItem('lcns_exam_officer_submitted') || '[]');
      const s2 = JSON.parse(localStorage.getItem('lcns_results') || '[]');
      return s1.length > 0 ? s1 : s2; 
    } catch { return []; }
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editScore, setEditScore] = useState<number>(0);
  const [vetStatus, setVetStatus] = useState<string>(() => localStorage.getItem('lcns_hod_vet_status') || 'PENDING');
  const [searchVet, setSearchVet] = useState('');
  const [supabaseGpa, setSupabaseGpa] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('lcns_supabase_gpa_cache') || '[]'); } catch { return []; }
  });

  const loadVetData = async () => {
    try {
      const { data } = await supabase.from('student_gpa_view').select('*');
      if(data) setSupabaseGpa(data);
      const { data: scores } = await supabase.from('student_results_workflow').select('*').order('matric_no');
      if(scores && scores.length > 0) setExamSubmissions(scores);
    } catch {}
  };

  React.useEffect(() => { loadVetData(); }, []);

  const handleManualCorrection = (id: string) => {
    const updated = examSubmissions.map((r:any) => r.id === id || r.scoreId === id ? {...r, score: editScore, totalScore: editScore, total_score: editScore} : r);
    localStorage.setItem('lcns_results', JSON.stringify(updated));
    localStorage.setItem('lcns_exam_officer_submitted', JSON.stringify(updated));
    setExamSubmissions(updated);
    setComputationResults(updated);
    setEditingId(null);
    StorageService.logAction(displayEmail, displayRole,'HOD_MANUAL_CORRECTION',`HOD ${displayName} corrected score ${id} to ${editScore}`);
    alert(`✅ Score corrected to ${editScore} and saved!`);
  };

  const handleForwardToRegistrar = () => {
    if(examSubmissions.length === 0) { alert('No results to forward'); return; }
    localStorage.setItem('lcns_hod_forwarded_to_registrar', 'true');
    localStorage.setItem('lcns_hod_forwarded_date', new Date().toISOString());
    localStorage.setItem('lcns_hod_vet_status', 'FORWARDED_TO_REGISTRAR');
    localStorage.setItem('lcns_results_hod_vetted', JSON.stringify(examSubmissions));
    setVetStatus('FORWARDED_TO_REGISTRAR');
    StorageService.logAction(displayEmail, displayRole,'HOD_FORWARD_TO_REGISTRAR',`HOD ${displayName} vetted and forwarded ${examSubmissions.length} results to Registrar`);
    alert(`✅ HOD Vetted OK! Forwarded ${examSubmissions.length} results to Registrar for vetting.`);
  };

  const handleReturnToExamOfficer = () => {
    const reason = prompt('Enter reason to return to Exam Officer:');
    if(!reason) return;
    localStorage.setItem('lcns_hod_vet_status', 'RETURNED_TO_EXAM_OFFICER');
    localStorage.setItem('lcns_hod_return_reason', reason);
    localStorage.setItem('lcns_hod_return_date', new Date().toISOString());
    localStorage.setItem('lcns_results_returned_to_exam', JSON.stringify({reason, date: new Date().toISOString(), by: displayName}));
    setVetStatus('RETURNED_TO_EXAM_OFFICER');
    StorageService.logAction(displayEmail, displayRole,'HOD_RETURN_TO_EXAM_OFFICER',`HOD ${displayName} returned result to Exam Officer: ${reason}`);
    alert(`↩️ Returned to Exam Officer. Reason: ${reason}`);
  };

  const downloadMasterPDF = () => {
    const html = `
      <html><head><style>
        body{font-family:Arial; font-size:10px;} table{width:100%; border-collapse:collapse;} th,td{border:1px solid #000; padding:4px; text-align:center;} th{background:#0a4d2e; color:#fff;} .header{text-align:center; border-bottom:3px solid #000; padding-bottom:10px;}
        .carry{color:red; font-weight:bold;}
      </style></head><body>
      <div class="header">
        <img src="/lcns-logo.png.jpg" style="width:80px; height:80px;" onerror="this.src='/lcns-logo.png'"/>
        <h2>LABE COLLEGE OF NURSING SCIENCES, GBOKO - Catholic Diocese of Gboko</h2>
        <h3>MASTER SCORE SHEET - HOD VETTED - ${levelFilter} - ${new Date().toLocaleDateString()}</h3>
        <p>HOD: ${displayName} | Status: ${vetStatus} | GPA/CGPA Included</p>
      </div>
      <table><tr><th>Matric</th><th>Name</th><th>Course</th><th>CA</th><th>Exam</th><th>Total</th><th>CU</th><th>Grade</th><th>Point</th><th>GP</th><th>CGPA</th><th>Remark</th></tr>
      ${examSubmissions.map((r:any)=>{ 
        const score = r.score || r.total_score || r.totalScore || 0;
        const grade = score>=70?'A':score>=60?'B':score>=50?'C':score>=40?'D':'F';
        const point = score>=70?4:score>=60?3:score>=50?2:score>=40?1:0;
        const gp = (r.creditUnit||3)*point;
        const cgpaData = supabaseGpa.find((g:any)=>g.matric_no===r.matricNo);
        return `<tr><td>${r.matricNo||r.matric_no}</td><td>${r.fullName||''}</td><td>${r.courseCode||r.course_code}</td><td>${r.ca_score||''}</td><td>${r.exam_score||''}</td><td><b>${score}</b></td><td>${r.creditUnit||r.credit_unit||3}</td><td>${grade}</td><td>${point}</td><td>${gp}</td><td>${cgpaData?.gpa || cgpaData?.cgpa || ''}</td><td class="${grade==='F'?'carry':''}">${grade==='F'?'REPEAT '+ (r.courseCode||r.course_code):'PASS'}</td></tr>`
      }).join('')}
      </table>
      <div style="margin-top:40px; display:flex; justify-content:space-between; text-align:center;">
        <div style="border-top:2px solid #000; padding-top:10px;"><p>HOD Signature: ${displayName}</p><p>Date: ${new Date().toLocaleDateString()}</p></div>
        <div style="border-top:2px solid #000; padding-top:10px;"><p>Exam Officer</p></div>
        <div style="border-top:2px solid #000; padding-top:10px;"><p>Registrar</p></div>
      </div>
      </body></html>`;
    const win = window.open('', '_blank'); if(win){ win.document.write(html); win.document.close(); win.focus(); setTimeout(()=>win.print(), 500); }
  };

  const downloadMasterExcel = () => {
    let csv = 'Matric No,Full Name,Course Code,Credit Unit,CA,Exam,Total,Grade,Grade Point,GP,Semester GPA,CGPA,Status,Repeat Course\n';
    examSubmissions.forEach((r:any)=>{
      const score = r.score || r.total_score || r.totalScore || 0;
      const grade = score>=70?'A':score>=60?'B':score>=50?'C':score>=40?'D':'F';
      const point = score>=70?4:score>=60?3:score>=50?2:score>=40?1:0;
      const gp = (r.creditUnit||r.credit_unit||3)*point;
      const cgpaData = supabaseGpa.find((g:any)=>g.matric_no===r.matricNo || g.matric_no===r.matric_no);
      csv += `"${r.matricNo||r.matric_no}","${r.fullName||''}","${r.courseCode||r.course_code}","${r.creditUnit||r.credit_unit||3}","${r.ca_score||''}","${r.exam_score||''}","${score}","${grade}","${point}","${gp}","${cgpaData?.gpa||''}","${cgpaData?.cgpa||''}","${grade==='F'?'CARRY OVER':'PASS'}","${grade==='F'?'REPEAT '+(r.courseCode||r.course_code):''}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `HOD_Master_Sheet_${displayName}_${new Date().toISOString().slice(0,10)}.csv`; document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const filteredVet = examSubmissions.filter((r:any)=>{
    if(!searchVet) return true;
    const term = searchVet.toLowerCase();
    return (r.matricNo||r.matric_no||'').toLowerCase().includes(term) || (r.fullName||'').toLowerCase().includes(term) || (r.courseCode||r.course_code||'').toLowerCase().includes(term);
  });

  const filteredStudents = students.filter((s: any) => {
    if (levelFilter !== 'ALL' && s.level !== levelFilter) return false;
    if (!searchBiodata) return true;
    return `${s.fullName} ${s.matricNo} ${s.program} ${s.level}`.toLowerCase().includes(searchBiodata.toLowerCase());
  });

  const filteredIndividual = students.filter((s: any) => {
    if (!searchIndividual) return true;
    const term = searchIndividual.toLowerCase().trim();
    return s.fullName.toLowerCase().includes(term) || s.matricNo.toLowerCase().includes(term);
  });

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !title) return;
    const newCourse: Course = {
      id: 'crs-' + Date.now(),
      code: code.toUpperCase(),
      title,
      units,
      level,
      semester,
      department: 'Nursing Sciences',
      lecturerName,
    };
    const updated = [...courses, newCourse];
    StorageService.saveCourses(updated);
    setCourses(updated);
    StorageService.logAction(displayEmail, displayRole,'ADD_COURSE',`Allocated course ${code}: ${title} to ${lecturerName}`);
    setCode(''); setTitle(''); setShowAddCourse(false);
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-emerald-800 px-3 py-1 rounded-full">Head of Department • {displayRole} • Course Registration Approval + HOD VET RESULT</span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase mt-2">{displayName}</h1>
            <p className="text-xs text-emerald-200">VET RESULT FROM EXAM OFFICER AND FORWARD TO REGISTRAR - Status: {vetStatus}</p>
          </div>
          <button onClick={() => setShowAddCourse(true)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl shadow-md self-start sm:self-auto"><Plus className="w-4 h-4"/><span>Allocate New Course</span></button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <button onClick={() => setActiveTab('vet_result')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='vet_result'?'bg-orange-600 text-white shadow ring-2 ring-orange-300':'bg-orange-50 border-2 border-orange-400 text-orange-900'}`}><CheckCircle2 className="w-4 h-4"/><span>🔍 HOD VET RESULT - FROM EXAM OFFICER</span><span className="px-2 py-0.5 rounded-full text-[10px] bg-red-600 text-white">{examSubmissions.length}</span></button>
        <button onClick={() => setActiveTab('course_reg')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='course_reg'?'bg-blue-700 text-white shadow ring-2 ring-blue-300':'bg-blue-50 border-2 border-blue-400 text-blue-800'}`}><BookOpen className="w-4 h-4"/><span>📚 Course Registration</span></button>
        <button onClick={() => setActiveTab('scoresheets')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='scoresheets'?'bg-emerald-700 text-white shadow ring-2 ring-emerald-300':'bg-emerald-50 border-2 border-emerald-400 text-emerald-800'}`}><Download className="w-4 h-4"/><span>📄 Score Sheets</span></button>
        <button onClick={() => setActiveTab('biodata')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab==='biodata'?'bg-[#0a4d2e] text-white':'text-slate-600 hover:bg-slate-100'}`}><Users className="w-4 h-4"/><span>👨‍🎓 Biodata</span></button>
        <button onClick={() => setActiveTab('courses')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab==='courses'?'bg-[#0a4d2e] text-white':'text-slate-600 hover:bg-slate-100'}`}><BookOpen className="w-4 h-4"/><span>Courses</span><span className="ml-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">{courses.length}</span></button>
        <button onClick={() => setActiveTab('admissions_all')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab==='admissions_all'?'bg-purple-700 text-white':'bg-purple-50 border border-purple-300 text-purple-800'}`}><GraduationCap className="w-4 h-4"/><span>🎓 Applicants</span></button>
        <button onClick={() => setActiveTab('individual_result')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='individual_result'?'bg-slate-900 text-white shadow ring-2 ring-amber-400':'bg-amber-50 border-2 border-amber-400 text-amber-900'}`}><Printer className="w-4 h-4"/><span>🖨️ Print Individual Result</span></button>
      </div>

      {activeTab==='vet_result' && (
        <div className="bg-white rounded-3xl border-2 border-orange-400 p-6 space-y-6">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300 p-4 rounded-xl">
            <h2 className="text-lg font-black flex items-center gap-2 text-orange-900"><CheckCircle2 className="w-6 h-6"/> HOD VETTING PANEL - After Receiving From Exam Officer</h2>
            <p className="text-xs font-bold mt-2">HOD {displayName} - You received results from Exam Officer. Vet: If OK forward to Registrar, If NOT OK return to Exam Officer. You can manually correct scores, print master sheet PDF/Excel with GPA/CGPA.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black ${vetStatus==='FORWARDED_TO_REGISTRAR'?'bg-green-600 text-white': vetStatus==='RETURNED_TO_EXAM_OFFICER'?'bg-red-600 text-white':'bg-yellow-400 text-black'}`}>Status: {vetStatus}</span>
              <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-xs font-black">{examSubmissions.length} Records</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={downloadMasterPDF} className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black flex items-center gap-2"><Printer className="w-4 h-4"/> Print Master Sheet PDF</button>
            <button onClick={downloadMasterExcel} className="px-4 py-2.5 bg-green-700 text-white rounded-xl text-xs font-black flex items-center gap-2"><FileSpreadsheet className="w-4 h-4"/> Download Excel</button>
            <button onClick={handleForwardToRegistrar} className="px-4 py-2.5 bg-blue-700 text-white rounded-xl text-xs font-black flex items-center gap-2"><ArrowRight className="w-4 h-4"/> ✅ Forward to Registrar</button>
            <button onClick={handleReturnToExamOfficer} className="px-4 py-2.5 bg-red-700 text-white rounded-xl text-xs font-black flex items-center gap-2"><ArrowLeft className="w-4 h-4"/> ↩️ Return to Exam Officer</button>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border">
            <Search className="w-4 h-4 text-orange-600"/>
            <input value={searchVet} onChange={e=>setSearchVet(e.target.value)} placeholder="Search by Matric, Name, Course" className="flex-1 py-2 text-xs font-bold outline-none bg-transparent"/>
          </div>
          <div className="overflow-x-auto border-2 rounded-xl">
            <table className="w-full text-xs">
              <thead className="bg-orange-900 text-white"><tr><th className="p-2">Matric</th><th className="p-2">Name</th><th className="p-2">Course</th><th className="p-2">CA</th><th className="p-2">Exam</th><th className="p-2">Total - Editable</th><th className="p-2">CU</th><th className="p-2">Grade</th><th className="p-2">GP</th><th className="p-2">CO</th><th className="p-2">Manual Correction</th></tr></thead>
              <tbody>
                {filteredVet.map((r:any, idx:number)=>{
                  const score = r.score || r.total_score || r.totalScore || 0;
                  const grade = score>=70?'A':score>=60?'B':score>=50?'C':score>=40?'D':'F';
                  const point = score>=70?4:score>=60?3:score>=50?2:score>=40?1:0;
                  const gp = (r.creditUnit||r.credit_unit||3)*point;
                  const isEditing = editingId === (r.id||r.scoreId||idx.toString());
                  return (
                    <tr key={idx} className={`border-b ${grade==='F'?'bg-red-50':''}`}>
                      <td className="p-2 font-mono font-bold">{r.matricNo||r.matric_no}</td>
                      <td className="p-2 font-bold">{r.fullName||''}</td>
                      <td className="p-2 font-mono">{r.courseCode||r.course_code}</td>
                      <td className="p-2 text-center">{r.ca_score||'-'}</td>
                      <td className="p-2 text-center">{r.exam_score||'-'}</td>
                      <td className="p-2 text-center font-black">{isEditing ? <input type="number" value={editScore} onChange={e=>setEditScore(Number(e.target.value))} className="w-16 border-2 border-blue-500 rounded p-1 text-center font-black"/> : score}</td>
                      <td className="p-2 text-center">{r.creditUnit||r.credit_unit||3}</td>
                      <td className="p-2 text-center font-bold">{grade}</td>
                      <td className="p-2 text-center">{gp}</td>
                      <td className="p-2 text-center font-bold text-red-700">{grade==='F' ? `REPEAT ${r.courseCode||r.course_code}` : 'PASS'}</td>
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
            {filteredVet.length===0 && <div className="p-8 text-center text-slate-500 font-bold">No results from Exam Officer yet</div>}
          </div>
        </div>
      )}

      {activeTab==='individual_result' && (
        <div className="bg-white rounded-3xl border-2 border-amber-300 p-6 space-y-6">
          <div className="flex flex-wrap gap-2 bg-slate-50 p-3 rounded-xl border">
            <div className="flex items-center gap-2 flex-1 bg-white border-2 border-amber-400 rounded-xl px-3">
              <Search className="w-4 h-4 text-amber-600"/>
              <input value={searchIndividual} onChange={e=>setSearchIndividual(e.target.value)} placeholder="🔍 Search by Name and Matric No" className="flex-1 py-2.5 text-xs font-black outline-none"/>
            </div>
            <div className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-black">{filteredIndividual.length} Students</div>
          </div>
          {!selectedPrintStudent ? (
            <div className="overflow-x-auto border-2 rounded-xl">
              <table className="w-full text-xs">
                <thead className="bg-slate-900 text-white"><tr><th className="p-3 text-left">Matric No + Name</th><th className="p-3 text-left">Level</th><th className="p-3 text-left">CGPA + Carry Over</th><th className="p-3 text-center">Print</th></tr></thead>
                <tbody>
                  {filteredIndividual.map((s:any) => {
                    const studResults = computationResults.filter((r:any)=> r.matricNo===s.matricNo);
                    let cu=0, gp=0; studResults.forEach((r:any)=>{ const g = r.score>=70?4: r.score>=60?3: r.score>=50?2: r.score>=40?1:0; cu+=r.creditUnit||3; gp+=(r.creditUnit||3)*g; });
                    const cgpa = cu? (gp/cu).toFixed(2) : '0.00';
                    return (
                      <tr key={s.matricNo} className="border-b hover:bg-amber-50">
                        <td className="p-3"><p className="font-mono font-black text-emerald-800">{s.matricNo}</p><p className="font-black uppercase">{s.fullName}</p></td>
                        <td className="p-3"><p className="font-bold">{s.level}</p></td>
                        <td className="p-3"><p className="text-[11px]">CGPA: {cgpa}</p></td>
                        <td className="p-3 text-center"><button onClick={()=>setSelectedPrintStudent(s)} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black flex items-center gap-2 mx-auto"><Printer className="w-4 h-4"/> Print</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border">
                <p className="font-black text-sm">Selected: {selectedPrintStudent.fullName} - {selectedPrintStudent.matricNo}</p>
                <button onClick={()=>setSelectedPrintStudent(null)} className="px-4 py-2 bg-slate-200 rounded-xl text-xs font-black">← Back</button>
              </div>
              <PrintableResultWithLogo
                matricNo={selectedPrintStudent.matricNo}
                fullName={selectedPrintStudent.fullName}
                level={selectedPrintStudent.level}
                program={selectedPrintStudent.program}
                results={computationResults.filter((r:any)=> r.matricNo===selectedPrintStudent.matricNo)}
                currentUserRole="HOD"
                currentUserName={displayName}
                senateApproved={senateInfo.approved}
                senateDate={senateInfo.date}
                senateProvost={senateInfo.provost}
              />
            </div>
          )}
        </div>
      )}

      {activeTab==='course_reg' ? <CourseRegistrationApproval currentUser={currentUser} /> : activeTab==='scoresheets' ? <ScoreSheetViewer currentUser={currentUser} /> : activeTab==='biodata' ? (
        <div className="bg-white rounded-3xl border-2 border-emerald-300 p-4 space-y-4">
          <div className="flex items-center gap-2 bg-white border rounded-xl px-3"><Search className="w-4 h-4 text-slate-400"/><input value={searchBiodata} onChange={e=>setSearchBiodata(e.target.value)} placeholder="Search Name, Matric" className="flex-1 py-2 text-xs font-bold outline-none"/></div>
          <div className="overflow-x-auto border-2 rounded-xl">
            <table className="w-full text-xs"><thead className="bg-slate-900 text-white"><tr><th className="p-2">Matric</th><th className="p-2">Name</th><th className="p-2">Level</th></tr></thead><tbody>{filteredStudents.map((s:any)=><tr key={s.matricNo} className="border-b"><td className="p-2 font-mono">{s.matricNo}</td><td className="p-2 font-bold">{s.fullName}</td><td className="p-2">{s.level}</td></tr>)}</tbody></table>
          </div>
        </div>
      ) : activeTab==='admissions_all' ? <AdminAdmissionManager currentUser={currentUser} /> : activeTab==='courses' ? (
        <div className="bg-white rounded-3xl border p-6"><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50 font-bold"><tr><th className="p-3">Code</th><th className="p-3">Title</th><th className="p-3">Units</th><th className="p-3">Level</th><th className="p-3">Lecturer</th></tr></thead><tbody>{courses.map((c)=><tr key={c.id} className="border-b"><td className="p-3 font-mono font-bold">{c.code}</td><td className="p-3 font-bold">{c.title}</td><td className="p-3 text-center">{c.units}</td><td className="p-3">{c.level}</td><td className="p-3">{c.lecturerName}</td></tr>)}</tbody></table></div></div>
      ) : null}

      {showAddCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border space-y-4">
            <h3 className="text-base font-bold uppercase">Allocate Course to Lecturer - HOD {displayName}</h3>
            <form onSubmit={handleCreateCourse} className="space-y-3 text-xs">
              <div><label className="block font-bold mb-1">Course Code *</label><input type="text" required value={code} onChange={e=>setCode(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs uppercase"/></div>
              <div><label className="block font-bold mb-1">Course Title *</label><input type="text" required value={title} onChange={e=>setTitle(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs"/></div>
              <div className="grid grid-cols-2 gap-3"><div><label className="block font-bold mb-1">Credit Units</label><input type="number" min="1" max="6" value={units} onChange={e=>setUnits(Number(e.target.value))} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold"/></div><div><label className="block font-bold mb-1">Level</label><select value={level} onChange={e=>setLevel(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs"><option>ND 1</option><option>ND 2</option><option>HND 1</option><option>HND 2</option></select></div></div>
              <div><label className="block font-bold mb-1">Lecturer in Charge *</label><input type="text" required value={lecturerName} onChange={e=>setLecturerName(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs"/></div>
              <div className="pt-3 flex justify-end gap-2"><button type="button" onClick={()=>setShowAddCourse(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold">Cancel</button><button type="submit" className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold">Save Course Allocation</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ===== FIX FOR PORTAL SHELL - BOTH EXPORTS NEEDED =====
export default HODDashboard;

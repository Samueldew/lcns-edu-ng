import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { Course, Student } from '../../types';
import {
  BookOpen,
  UserCheck,
  Stethoscope,
  Plus,
  Users,
  CheckCircle2,
  Calendar,
  Building,
  GraduationCap,
  Search,
  Download,
  Printer,
} from 'lucide-react';
import { AdminAdmissionManager } from '../admin/AdminAdmissionManager';
import { ScoreSheetViewer } from './ScoreSheetViewer';
import { CourseRegistrationApproval } from './CourseRegistrationApproval';
// ADDED - Individual Result Print with School Full Name + Logo - FOR HOD, EXAM OFFICER, REGISTRAR, ADMIN, PROVOST
import { PrintableResultWithLogo } from '../common/PrintableResultWithLogo';

export const HODDashboard: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>(StorageService.getCourses());
  const [students] = useState<Student[]>(StorageService.getStudents());
  const [activeTab, setActiveTab] = useState<'courses' | 'biodata' | 'admissions_all' | 'scoresheets' | 'course_reg' | 'individual_result'>('course_reg');
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

  const displayName = (currentUser?.fullName || currentUser?.full_name || 'Dr. (Mrs) Rebecca M. Chia').toString().toUpperCase();
  const displayEmail = currentUser?.email || 'hod.nursing@lcns.edu.ng';
  const displayRole = currentUser?.role || 'HOD';

  const filteredStudents = students.filter((s: any) => {
    if (levelFilter !== 'ALL' && s.level !== levelFilter) return false;
    if (!searchBiodata) return true;
    return `${s.fullName} ${s.matricNo} ${s.program} ${s.level}`.toLowerCase().includes(searchBiodata.toLowerCase());
  });

  // ADDED - Search by Name and Matric No
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
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-emerald-800 px-3 py-1 rounded-full">Head of Department • {displayRole} • Course Registration Approval - Credit Units Check + Score Sheets + Individual Result Print</span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase font-serif-crest mt-2">{displayName}</h1>
            <p className="text-xs text-emerald-200">{displayEmail} - Approve Course Registration - If credit units exceed limit - MUST DISAPPROVE + See Lecturers Score Sheets - Download PDF with SCHOOL NAME + LOGO + Print Individual Result with School Full Name Labe College of Nursing Sciences, Gboko + Logo - Logged in as {displayName}</p>
          </div>
          <button onClick={() => setShowAddCourse(true)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl shadow-md self-start sm:self-auto"><Plus className="w-4 h-4"/><span>Allocate New Course</span></button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <button onClick={() => setActiveTab('course_reg')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='course_reg'?'bg-blue-700 text-white shadow ring-2 ring-blue-300':'bg-blue-50 border-2 border-blue-400 text-blue-800'}`}><BookOpen className="w-4 h-4"/><span>📚 Course Registration Approval - HOD - If Units Exceed - DISAPPROVE - NEW</span><span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-black">CREDIT</span></button>
        <button onClick={() => setActiveTab('scoresheets')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='scoresheets'?'bg-emerald-700 text-white shadow ring-2 ring-emerald-300':'bg-emerald-50 border-2 border-emerald-400 text-emerald-800'}`}><Download className="w-4 h-4"/><span>📄 Score Sheets - Lecturers Submitted - Download PDF</span></button>
        <button onClick={() => setActiveTab('biodata')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab==='biodata'?'bg-[#0a4d2e] text-white':'text-slate-600 hover:bg-slate-100'}`}><Users className="w-4 h-4"/><span>👨‍🎓 All Students Biodata</span></button>
        <button onClick={() => setActiveTab('courses')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab==='courses'?'bg-[#0a4d2e] text-white':'text-slate-600 hover:bg-slate-100'}`}><BookOpen className="w-4 h-4"/><span>Course Allocations</span><span className="ml-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">{courses.length}</span></button>
        <button onClick={() => setActiveTab('admissions_all')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab==='admissions_all'?'bg-purple-700 text-white':'bg-purple-50 border border-purple-300 text-purple-800'}`}><GraduationCap className="w-4 h-4"/><span>🎓 All Applicants</span></button>
        {/* ADDED - Individual Result Print - NO DELETE */}
        <button onClick={() => setActiveTab('individual_result')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='individual_result'?'bg-slate-900 text-white shadow ring-2 ring-amber-400':'bg-amber-50 border-2 border-amber-400 text-amber-900'}`}><Printer className="w-4 h-4"/><span>🖨️ Print Individual Result - School Full Name + Logo - HOD/Exam Officer/Registrar/Admin/Provost</span><span className="px-2 py-0.5 rounded-full text-[10px] bg-red-600 text-white">NEW</span></button>
      </div>

      {/* ADDED - Individual Result Tab - HOD CAN PRINT */}
      {activeTab==='individual_result' && (
        <div className="bg-white rounded-3xl border-2 border-amber-300 p-6 space-y-6">
          <div>
            <h2 className="text-lg font-black flex items-center gap-2"><Printer className="w-5 h-5 text-amber-600"/> Print Individual Student Result with School Full Name & Logo - HOD View - {displayName}</h2>
            <p className="text-xs bg-amber-50 border p-2 rounded mt-1 font-bold">HOD {displayName} can print individual student result - With LABE COLLEGE OF NURSING SCIENCES, GBOKO full name + Logo + CGPA + Class of Diploma + Carry Over Auto Reflect - Search by Name and Matric No - Same format for Exam Officer, Registrar, Admin, Provost Final</p>
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
                <thead className="bg-slate-900 text-white"><tr><th className="p-3 text-left">Matric No + Name</th><th className="p-3 text-left">Level + Program</th><th className="p-3 text-left">Results + CGPA + Carry Over</th><th className="p-3 text-center">Print with School Name + Logo - HOD</th></tr></thead>
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
                        <td className="p-3 text-center"><button onClick={()=>setSelectedPrintStudent(s)} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black flex items-center gap-2 mx-auto"><Printer className="w-4 h-4"/> Print {s.matricNo} - School Full Name + Logo - HOD</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border">
                <p className="font-black text-sm">Selected: {selectedPrintStudent.fullName} - {selectedPrintStudent.matricNo} - Printing as HOD - {displayName}</p>
                <button onClick={()=>setSelectedPrintStudent(null)} className="px-4 py-2 bg-slate-200 rounded-xl text-xs font-black">← Back to List</button>
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

      {activeTab==='course_reg' ? (
        <CourseRegistrationApproval currentUser={currentUser} />
      ) : activeTab==='scoresheets' ? (
        <ScoreSheetViewer currentUser={currentUser} />
      ) : activeTab==='biodata' ? (
        <div className="bg-white rounded-3xl border-2 border-emerald-300 p-4 space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-3">
            <div><h2 className="text-lg font-black flex items-center gap-2"><Users className="w-5 h-5 text-emerald-700"/>All Students Biodata - Current Level ND1 ND2 HND1 HND2 - HOD View - {displayName}</h2><p className="text-xs font-bold bg-emerald-50 border p-2 rounded mt-1">HOD {displayName} see all student biodata + approve course registration - If credit units exceed limit - MUST DISAPPROVE - Print with SCHOOL FULL NAME + LOGO</p></div>
            <button onClick={()=>window.print()} className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-black flex items-center gap-1 self-start"><Download className="w-4 h-4"/>Print Biodata</button>
          </div>
          <div className="flex flex-wrap gap-2 bg-slate-50 p-3 rounded-xl border">
            <div className="flex items-center gap-2 flex-1 bg-white border rounded-xl px-3"><Search className="w-4 h-4 text-slate-400"/><input value={searchBiodata} onChange={e=>setSearchBiodata(e.target.value)} placeholder="Search Name, Matric No, Program" className="flex-1 py-2 text-xs font-bold outline-none"/></div>
            <select value={levelFilter} onChange={e=>setLevelFilter(e.target.value)} className="px-4 py-2 border-2 border-emerald-300 rounded-xl text-xs font-black"><option value="ALL">All Levels ({students.length})</option><option value="ND 1">ND 1</option><option value="ND 2">ND 2</option><option value="HND 1">HND 1</option><option value="HND 2">HND 2</option></select>
            <div className="px-3 py-2 bg-emerald-900 text-white rounded-xl text-xs font-black">{filteredStudents.length} Students</div>
          </div>
          <div className="overflow-x-auto border-2 rounded-xl">
            <table className="w-full text-xs">
              <thead className="bg-slate-900 text-white"><tr><th className="p-2 text-left">Matric No + Photo + Level</th><th className="p-2 text-left">Full Name + Biodata</th><th className="p-2 text-left">Program + Current Level</th><th className="p-2 text-left">State + Contact</th><th className="p-2">View Full Biodata</th></tr></thead>
              <tbody>
                {filteredStudents.map((s:any)=>(
                  <tr key={s.matricNo} className="border-b hover:bg-slate-50">
                    <td className="p-2"><div className="flex items-center gap-2"><img src={s.photoUrl || 'https://via.placeholder.com/50'} alt="p" className="w-10 h-12 object-cover rounded border"/><div><p className="font-mono font-black text-emerald-800">{s.matricNo}</p><span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${s.level.includes('ND 1')?'bg-blue-100 text-blue-800':s.level.includes('ND 2')?'bg-green-100 text-green-800':s.level.includes('HND 1')?'bg-purple-100 text-purple-800':'bg-amber-100 text-amber-900'}`}>{s.level}</span></div></div></td>
                    <td className="p-2"><p className="font-black uppercase">{s.fullName}</p><p className="text-[11px]">Blood: {s.bloodGroup} | {s.genotype}</p></td>
                    <td className="p-2"><p className="font-bold">{s.program}</p><p className="text-[11px]">Current Level: <b className="bg-yellow-200 px-1 rounded">{s.level}</b></p><p className="text-[11px]">Session: {s.session}</p></td>
                    <td className="p-2"><p className="text-[11px]">{s.stateOfOrigin} / {s.lga}</p><p className="text-[11px]">{s.phone || 'N/A'}</p></td>
                    <td className="p-2 text-center"><button onClick={()=>setSelectedBiodata(s)} className="px-3 py-1.5 bg-blue-700 text-white rounded-lg font-black text-[11px]">View Full Biodata</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {selectedBiodata && (<div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"><div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-3"><div className="flex justify-between border-b pb-2"><h3 className="font-black">Biodata - {selectedBiodata.fullName} - Current Level: {selectedBiodata.level}</h3><button onClick={()=>setSelectedBiodata(null)} className="px-3 py-1 bg-slate-100 rounded-full font-black">X</button></div><div className="text-xs space-y-1"><p>Matric: {selectedBiodata.matricNo}</p><p>Program: {selectedBiodata.program}</p><p>Level: {selectedBiodata.level}</p><p>Session: {selectedBiodata.session}</p><p>State: {selectedBiodata.stateOfOrigin}</p></div><button onClick={()=>window.print()} className="w-full py-3 bg-slate-900 text-white rounded-xl font-black">Print Biodata</button></div></div>)}
        </div>
      ) : activeTab==='admissions_all' ? (
        <div className="space-y-3"><div className="bg-purple-50 border-2 border-purple-300 p-3 rounded-xl text-xs font-bold">HOD View All Applicants Records - {displayName} - Link</div><AdminAdmissionManager currentUser={currentUser} /></div>
      ) : activeTab==='courses' ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between"><div><h3 className="font-bold text-slate-900 text-base uppercase">Semester Course Allocations & Academic Staff - {displayName}</h3><p className="text-xs text-slate-500">Accredited courses assigned to lecturers. HOD: {displayName}</p></div><span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">{courses.length} Active Courses</span></div>
          <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50 text-slate-700 font-bold uppercase border-b"><tr><th className="p-3">Course Code</th><th className="p-3">Course Title</th><th className="p-3 text-center">Units</th><th className="p-3">Level / Semester</th><th className="p-3">Assigned Staff</th><th className="p-3">Department</th></tr></thead><tbody className="divide-y divide-slate-100">{courses.map((c)=>(<tr key={c.id} className="hover:bg-slate-50"><td className="p-3 font-mono font-bold text-emerald-900">{c.code}</td><td className="p-3 font-bold text-slate-900">{c.title}</td><td className="p-3 text-center font-bold">{c.units} Units</td><td className="p-3 text-slate-600"><span className="font-semibold text-slate-800">{c.level}</span><span className="block text-[10px] text-slate-500">{c.semester} Semester</span></td><td className="p-3 font-semibold text-emerald-950 flex items-center gap-1.5"><UserCheck className="w-3.5 h-3.5 text-emerald-700"/><span>{c.lecturerName}</span></td><td className="p-3 text-slate-500">{c.department}</td></tr>))}</tbody></table></div>
        </div>
      ) : null}

      {showAddCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border space-y-4">
            <h3 className="text-base font-bold uppercase">Allocate Course to Lecturer - HOD {displayName}</h3>
            <form onSubmit={handleCreateCourse} className="space-y-3 text-xs">
              <div><label className="block font-bold mb-1">Course Code *</label><input type="text" required value={code} onChange={e=>setCode(e.target.value)} placeholder="e.g. NSC 201" className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs uppercase font-mono-code"/></div>
              <div><label className="block font-bold mb-1">Course Title *</label><input type="text" required value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Medical-Surgical Nursing I" className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs"/></div>
              <div className="grid grid-cols-2 gap-3"><div><label className="block font-bold mb-1">Credit Units</label><input type="number" min="1" max="6" value={units} onChange={e=>setUnits(Number(e.target.value))} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold"/></div><div><label className="block font-bold mb-1">Level</label><select value={level} onChange={e=>setLevel(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs"><option value="ND 1">ND 1</option><option value="ND 2">ND 2</option><option value="HND 1">HND 1</option><option value="HND 2">HND 2</option></select></div></div>
              <div><label className="block font-bold mb-1">Lecturer in Charge *</label><input type="text" required value={lecturerName} onChange={e=>setLecturerName(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs"/></div>
              <div className="pt-3 flex justify-end gap-2"><button type="button" onClick={()=>setShowAddCourse(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold">Cancel</button><button type="submit" className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold">Save Course Allocation</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HODDashboard;

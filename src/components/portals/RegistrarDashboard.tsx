import React, { useState, useEffect } from 'react';
import { AdmissionProcessingView } from './AdmissionProcessingView';
import { AdminStudentsBiodata } from '../admin/AdminStudentsBiodata';
import { CourseManagerView } from '../common/CourseManagerView';
import { StorageService } from '../../services/storage';
import { supabase } from '@/lib/supabase';
import { COLLEGE_CONFIG } from '../../types';
import { ApiService } from '../../services/api';

const RegistrarDashboard = () => {
  const [tab, setTab] = useState<'admissions'|'biodata'|'hod_results'|'promotion'|'session'|'assign'>('assign');
  
  const [hodInbox, setHodInbox] = useState<any[]>(()=> JSON.parse(localStorage.getItem('lcns_results_registrar_inbox')|| localStorage.getItem('lcns_hod_forwarded')||'[]'));
  const [searchResult, setSearchResult] = useState('');
  const [students, setStudents] = useState<any[]>(()=> JSON.parse(localStorage.getItem('lcns_users')||'[]').filter((u:any)=>u.role==='STUDENT'));
  const [selectedLevel, setSelectedLevel] = useState('ND1');
  const [promoteTo, setPromoteTo] = useState('ND2');
  const [currentSession, setCurrentSession] = useState(localStorage.getItem('lcns_current_session')|| COLLEGE_CONFIG.CURRENT_SESSION || '2026/2027');
  const [newSession, setNewSession] = useState('2027/2028');
  const [courses, setCourses] = useState<any[]>(()=> JSON.parse(localStorage.getItem('lcns_courses')||'[]'));
  const [lecturers, setLecturers] = useState<any[]>(()=> JSON.parse(localStorage.getItem('lcns_users')||'[]').filter((u:any)=>u.role==='LECTURER' || u.role==='HOD'));
  const [assignCourse, setAssignCourse] = useState('');
  const [assignLecturer, setAssignLecturer] = useState('');
  const [assignments, setAssignments] = useState<any[]>([]);
  
  // NEW: Level + Semester filters for Assign
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [filterSemester, setFilterSemester] = useState('ALL');

  // ===== HELPERS - FIX TITLE / CODE / UNIT - Supabase uses course_title, course_code, credit_unit =====
  const getTitle = (c:any) => c.course_title || c.title || c.name || c.course_name || 'No Title';
  const getCode = (c:any) => c.course_code || c.code || c.course || '';
  const getUnit = (c:any) => c.credit_unit ?? c.unit ?? c.units ?? c.creditUnit ?? 2;
  const getLevel = (c:any) => c.level || 'ND1';
  const getSemester = (c:any) => c.semester || c.sem || 'First';
  const getCourseId = (c:any) => c.id || getCode(c);
  // Get assigned lecturer name for a course - from Supabase assignments OR localStorage
  const getAssignedName = (c:any) => {
    const a = assignments.find((x:any)=> x.course_id === c.id || x.course_code === getCode(c) || x.course === getCode(c));
    if (a) return a.lecturer_name || a.lecturer || a.lecturer_email || '';
    // Fallback to old localStorage field on course itself
    return c.lecturer_name || c.lecturer || c.lecturer_email || c.assigned_lecturer || '';
  };

  // ===== LOAD FROM SUPABASE - Registrar sees Admin courses + Lecturers =====
  const loadFromSupabase = async () => {
    try {
      const supCourses = await ApiService.getAllCourses();
      if (supCourses && supCourses.length > 0) {
        setCourses(supCourses);
        localStorage.setItem('lcns_courses', JSON.stringify(supCourses));
      }
    } catch(e){ console.log('courses fallback to localStorage', e); }
    try {
      const supLecturers = await ApiService.getAllLecturers();
      if (supLecturers && supLecturers.length > 0) {
        // Also include HODs as lecturers like before
        const allUsers = JSON.parse(localStorage.getItem('lcns_users')||'[]');
        const hods = allUsers.filter((u:any)=>u.role==='HOD');
        const merged = [...supLecturers, ...hods.filter((h:any)=> !supLecturers.find((s:any)=>s.id===h.id))];
        setLecturers(merged);
      }
    } catch(e){ console.log('lecturers fallback', e); }
    try {
      const supAssignments = await ApiService.getAllAssignments();
      setAssignments(supAssignments || []);
      if (supAssignments && supAssignments.length > 0) {
        const localMap = supAssignments.map((a:any)=> ({ course_code: a.course_id, course: a.course_id, lecturer_email: a.lecturer_id, lecturer: a.lecturer_name, lecturer_name: a.lecturer_name }));
        localStorage.setItem('lcns_lecturer_courses', JSON.stringify(localMap));
      }
    } catch(e){ console.log('assignments fallback', e); }
  };

  useEffect(()=>{ loadFromSupabase(); },[]);

  useEffect(()=>{
    const iv = setInterval(()=>{
      setHodInbox(JSON.parse(localStorage.getItem('lcns_results_registrar_inbox')|| localStorage.getItem('lcns_hod_forwarded')||'[]'));
      setStudents(JSON.parse(localStorage.getItem('lcns_users')||'[]').filter((u:any)=>u.role==='STUDENT'));
      // Don't overwrite Supabase courses with localStorage every 3s - only refresh lecturers
      setLecturers((prev)=>{
        const localLecs = JSON.parse(localStorage.getItem('lcns_users')||'[]').filter((u:any)=>u.role==='LECTURER' || u.role==='HOD');
        return localLecs.length > prev.length ? localLecs : prev;
      });
    },3000);
    return ()=>clearInterval(iv);
  },[]);

  const handleVetAndForwardToProvost = () => {
    if(hodInbox.length===0) return alert('No results from HOD');
    if(!confirm(`Vet ${hodInbox.length} results and Forward to Provost?`)) return;
    const vetted = hodInbox.map((r:any)=> ({...r, status: 'REGISTRAR_VETTED', vettedBy: 'Registrar', vettedAt: new Date().toISOString(), session: currentSession }));
    localStorage.setItem('lcns_results_registrar_vetted', JSON.stringify(vetted));
    localStorage.setItem('lcns_results_provost_inbox', JSON.stringify(vetted));
    localStorage.setItem('lcns_provost_vet_status', 'PENDING');
    localStorage.removeItem('lcns_results_registrar_inbox');
    localStorage.removeItem('lcns_hod_forwarded');
    setHodInbox([]);
    alert(`✅ Vetted & Forwarded ${vetted.length} to Provost`);
    window.dispatchEvent(new Event('lcns_storage_update'));
  };

  const handleReturnToHod = () => {
    if(hodInbox.length===0) return alert('No results');
    const reason = prompt('Reason to return to HOD:'); if(!reason) return;
    const returned = hodInbox.map((r:any)=> ({...r, status: 'RETURNED_TO_HOD', returnReason: reason, returnedAt: new Date().toISOString()}));
    localStorage.setItem('lcns_returned_to_hod', JSON.stringify(returned));
    localStorage.setItem('lcns_return_reason', reason);
    localStorage.removeItem('lcns_results_registrar_inbox');
    localStorage.removeItem('lcns_hod_forwarded');
    setHodInbox([]);
    alert(`↩️ Returned ${returned.length} to HOD: ${reason}`);
  };

  const handlePromote = async () => {
    if(!confirm(`Promote ALL ${selectedLevel} to ${promoteTo}?`)) return;
    const allUsers = JSON.parse(localStorage.getItem('lcns_users')||'[]');
    const updatedAll = allUsers.map((u:any)=> u.level===selectedLevel && u.role==='STUDENT' ? {...u, level: promoteTo} : u);
    localStorage.setItem('lcns_users', JSON.stringify(updatedAll));
    setStudents(updatedAll.filter((u:any)=>u.role==='STUDENT'));
    try { await supabase.from('users').update({ level: promoteTo }).eq('level', selectedLevel); } catch {}
    alert(`✅ Promoted ${selectedLevel} → ${promoteTo}`);
  };

  const handlePromoteOne = async (matric: string, to: string) => {
    const allUsers = JSON.parse(localStorage.getItem('lcns_users')||'[]');
    const updatedAll = allUsers.map((u:any)=> (u.matricNumber===matric || u.matric_no===matric) ? {...u, level: to} : u);
    localStorage.setItem('lcns_users', JSON.stringify(updatedAll));
    setStudents(updatedAll.filter((u:any)=>u.role==='STUDENT'));
    try { await supabase.from('users').update({ level: to }).eq('matric_no', matric); } catch {}
  };

  const handleSetSession = () => {
    if(!newSession) return;
    localStorage.setItem('lcns_current_session', newSession);
    localStorage.setItem('lcns_academic_year', newSession);
    const cfg = JSON.parse(localStorage.getItem('lcns_college_config')||'{}');
    cfg.CURRENT_SESSION = newSession;
    localStorage.setItem('lcns_college_config', JSON.stringify(cfg));
    setCurrentSession(newSession);
    alert(`✅ Academic Year Changed to ${newSession}`);
    window.dispatchEvent(new Event('lcns_storage_update'));
  };

  // ===== FIXED ASSIGN - Supabase + localStorage (so Lecturer sees it both ways) =====
  const handleAssignCourse = async () => {
    if(!assignCourse || !assignLecturer) { alert('Select Course and Lecturer'); return; }
    const courseObj = courses.find((c:any)=> getCode(c)===assignCourse || c.id===assignCourse);
    const title = courseObj ? getTitle(courseObj) : assignCourse;
    const level = courseObj ? getLevel(courseObj) : 'ND1';
    const semester = courseObj ? getSemester(courseObj) : 'First';
    const lecturerObj = lecturers.find((l:any)=> l.email===assignLecturer || l.id===assignLecturer);
    const lecturerName = lecturerObj?.full_name || lecturerObj?.fullName || assignLecturer;
    const lecturerId = lecturerObj?.id || assignLecturer;

    try {
      if (courseObj?.id) {
        await ApiService.assignLecturer(courseObj.id, lecturerId, lecturerName);
      }
    } catch(e:any){ console.log('Supabase assign failed, using localStorage only', e.message); }

    // Keep localStorage for Lecturer dashboard that still reads localStorage
    const mapping = JSON.parse(localStorage.getItem('lcns_lecturer_courses')||'[]');
    const filtered = mapping.filter((m:any)=>(m.course_code||m.course)!==assignCourse);
    filtered.push({ course_code: assignCourse, course: assignCourse, title, level, semester, lecturer_email: assignLecturer, lecturer: lecturerName, lecturer_name: lecturerName, lecturer_id: lecturerId, assignedBy: 'Registrar', date: new Date().toISOString() });
    localStorage.setItem('lcns_lecturer_courses', JSON.stringify(filtered));
    const updatedCourses = courses.map((c:any)=> getCode(c)===assignCourse ? {...c, lecturer: lecturerName, lecturer_email: assignLecturer, assigned_lecturer: lecturerName, lecturer_name: lecturerName} : c);
    localStorage.setItem('lcns_courses', JSON.stringify(updatedCourses));
    setCourses(updatedCourses);
    loadFromSupabase();
    alert(`✅ Assigned ${assignCourse} - ${title} to ${lecturerName}`);
  };

  const handleAssignFromTable = async (course:any, lecturerEmailOrId:string) => {
    if(!lecturerEmailOrId) return;
    const lecturerObj = lecturers.find((l:any)=> l.email===lecturerEmailOrId || l.id===lecturerEmailOrId);
    const lecturerName = lecturerObj?.full_name || lecturerObj?.fullName || lecturerEmailOrId;
    const lecturerId = lecturerObj?.id || lecturerEmailOrId;
    const code = getCode(course);
    const title = getTitle(course);

    try {
      if (course.id) await ApiService.assignLecturer(course.id, lecturerId, lecturerName);
    } catch(e:any){ console.log('Supabase assign failed', e.message); }

    const updated = courses.map((cc:any)=> getCode(cc)===code ? {...cc, lecturer: lecturerName, lecturer_email: lecturerEmailOrId, assigned_lecturer: lecturerName, lecturer_name: lecturerName} : cc);
    localStorage.setItem('lcns_courses', JSON.stringify(updated));
    setCourses(updated);
    const map = JSON.parse(localStorage.getItem('lcns_lecturer_courses')||'[]');
    const filtered = map.filter((m:any)=>(m.course_code||m.course)!==code);
    filtered.push({course_code: code, course: code, title, level: getLevel(course), semester: getSemester(course), lecturer_email: lecturerEmailOrId, lecturer: lecturerName, lecturer_name: lecturerName, lecturer_id: lecturerId, assignedBy: 'Registrar', date: new Date().toISOString()});
    localStorage.setItem('lcns_lecturer_courses', JSON.stringify(filtered));
    window.dispatchEvent(new Event('lcns_storage_update'));
    loadFromSupabase();
  };

  const handleUnassignFromTable = async (course:any) => {
    const assigned = assignments.find((a:any)=> a.course_id===course.id);
    if (assigned) {
      try { await ApiService.unassignLecturer(assigned.id); } catch {}
    }
    const code = getCode(course);
    const updated = courses.map((cc:any)=> getCode(cc)===code ? {...cc, lecturer: '', lecturer_email: '', assigned_lecturer: '', lecturer_name: ''} : cc);
    localStorage.setItem('lcns_courses', JSON.stringify(updated));
    setCourses(updated);
    const map = JSON.parse(localStorage.getItem('lcns_lecturer_courses')||'[]');
    localStorage.setItem('lcns_lecturer_courses', JSON.stringify(map.filter((m:any)=>(m.course_code||m.course)!==code)));
    loadFromSupabase();
  };

  // NEW: Filter courses by Level + Semester
  const filteredCoursesByLevelSem = courses.filter((c:any)=>{
    const lvl = getLevel(c);
    const sem = getSemester(c).toString();
    if(filterLevel!=='ALL' && lvl!==filterLevel) return false;
    if(filterSemester!=='ALL' && !sem.toLowerCase().startsWith(filterSemester.toLowerCase().slice(0,3))) return false;
    return true;
  });

  const countByLevel = (lvl:string) => courses.filter((c:any)=>getLevel(c)===lvl).length;
  const filteredByLevel = students.filter((s:any)=> s.level===selectedLevel);
  const filteredHodInbox = hodInbox.filter((r:any)=> !searchResult || r.matric_no?.toLowerCase().includes(searchResult.toLowerCase()) || r.fullName?.toLowerCase().includes(searchResult.toLowerCase()));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-black p-4 bg-white rounded-xl border border-green-700">REGISTRAR - LCNS - All Courses + Assign</h1>
      
      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-xl border">
        <button onClick={()=>setTab('assign')} className={`px-3 py-2 rounded text-xs font-black ${tab==='assign'?'bg-purple-700 text-white shadow ring-2 ring-purple-300':'bg-purple-100 text-purple-800 border-2 border-purple-400'}`}>👨‍🏫 All Courses & Assign - {courses.length}</button>
        <button onClick={()=>setTab('hod_results')} className={`px-3 py-2 rounded text-xs font-black ${tab==='hod_results'?'bg-blue-700 text-white shadow ring-2 ring-blue-300':'bg-blue-100 text-blue-800 border-2 border-blue-400'}`}>📥 HOD Results - {hodInbox.length}</button>
        <button onClick={()=>setTab('admissions')} className={`px-3 py-2 rounded text-xs font-black ${tab==='admissions'?'bg-green-700 text-white':'bg-gray-100'}`}>Admissions</button>
        <button onClick={()=>setTab('biodata')} className={`px-3 py-2 rounded text-xs font-black ${tab==='biodata'?'bg-green-700 text-white':'bg-gray-100'}`}>Biodata</button>
        <button onClick={()=>setTab('promotion')} className={`px-3 py-2 rounded text-xs font-black ${tab==='promotion'?'bg-blue-700 text-white':'bg-blue-100 text-blue-800'}`}>🎓 Promote</button>
        <button onClick={()=>setTab('session')} className={`px-3 py-2 rounded text-xs font-black ${tab==='session'?'bg-amber-600 text-white':'bg-amber-100'}`}>📅 New Session</button>
      </div>

      <div className="bg-white p-4 rounded-xl border min-h-[500px]">
        {tab==='admissions' && <AdmissionProcessingView />}
        {tab==='biodata' && <AdminStudentsBiodata />}
        
        {tab==='hod_results' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border-2 border-blue-300 p-3 rounded-xl">
              <h2 className="font-black">HOD Forwarded Results - Registrar Vetting</h2>
              <p className="text-xs">HOD forward → Registrar Vet → Forward to Provost OR Return to HOD</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleVetAndForwardToProvost} className="px-5 py-2.5 bg-green-700 text-white rounded-xl font-black text-xs">✅ Vet & Forward to Provost → {hodInbox.length}</button>
              <button onClick={handleReturnToHod} className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-black text-xs">↩️ Return to HOD - Not OK</button>
              <input value={searchResult} onChange={e=>setSearchResult(e.target.value)} placeholder="Search Matric / Name" className="ml-auto p-2 border rounded text-xs w-48" />
            </div>
            <div className="border rounded-xl overflow-x-auto">
              <table className="w-full text-xs"><thead className="bg-slate-900 text-white"><tr><th className="p-2">Matric</th><th>Name</th><th>Course</th><th>Score</th><th>Status</th></tr></thead>
              <tbody>{filteredHodInbox.map((r:any,i:number)=><tr key={i} className="border-b hover:bg-blue-50"><td className="p-2 font-mono font-bold">{r.matric_no||r.matricNo}</td><td className="p-2 font-bold">{r.fullName}</td><td className="p-2">{r.course_code||r.courseCode}</td><td className="p-2 text-center font-black">{r.score||r.total_score}</td><td className="p-2"><span className="bg-yellow-200 px-2 py-1 rounded text-[10px] font-black">{r.status}</span></td></tr>)}
              {filteredHodInbox.length===0 && <tr><td colSpan={5} className="p-8 text-center text-gray-400 font-bold">No results from HOD yet</td></tr>}
              </tbody></table>
            </div>
          </div>
        )}

        {tab==='promotion' && (
          <div className="space-y-4">
            <h2 className="font-black text-lg">Promote Student - ND1 → ND2 → HND1 → HND2</h2>
            <div className="grid md:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border">
              <div><label className="text-xs font-bold">From Level</label><select value={selectedLevel} onChange={e=>setSelectedLevel(e.target.value)} className="w-full p-2 border rounded"><option>ND1</option><option>ND2</option><option>HND1</option><option>HND2</option></select></div>
              <div><label className="text-xs font-bold">To Level</label><select value={promoteTo} onChange={e=>setPromoteTo(e.target.value)} className="w-full p-2 border rounded"><option>ND2</option><option>HND1</option><option>HND2</option><option>GRADUATED</option></select></div>
              <div className="flex items-end"><button onClick={handlePromote} className="w-full bg-blue-700 text-white p-2 rounded font-black">Promote ALL {filteredByLevel.length} Students</button></div>
            </div>
            <div className="border rounded-xl overflow-x-auto"><table className="w-full text-xs"><thead className="bg-slate-900 text-white"><tr><th className="p-2">Matric</th><th className="p-2">Name</th><th className="p-2">Current</th><th className="p-2">Promote To</th></tr></thead><tbody>{filteredByLevel.map((s:any)=><tr key={s.matricNumber||s.matric_no} className="border-b"><td className="p-2 font-mono">{s.matricNumber||s.matric_no}</td><td className="p-2 font-bold">{s.fullName}</td><td className="p-2"><span className="bg-yellow-200 px-2 py-1 rounded font-black">{s.level}</span></td><td className="p-2"><select onChange={e=>handlePromoteOne(s.matricNumber||s.matric_no, e.target.value)} defaultValue={s.level} className="p-1 border rounded"><option>ND1</option><option>ND2</option><option>HND1</option><option>HND2</option><option>GRADUATED</option></select></td></tr>)}</tbody></table></div>
          </div>
        )}

        {tab==='session' && (
          <div className="space-y-4">
            <h2 className="font-black text-lg">Set New Academic Year</h2>
            <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-xl">
              <p className="text-sm">Current Session: <span className="font-black text-lg bg-slate-900 text-white px-3 py-1 rounded">{currentSession}</span></p>
              <div className="flex gap-2 mt-4">
                <input value={newSession} onChange={e=>setNewSession(e.target.value)} placeholder="2027/2028" className="flex-1 p-3 border-2 rounded-xl font-black" />
                <button onClick={handleSetSession} className="px-6 bg-amber-600 text-white rounded-xl font-black">Set New Year</button>
              </div>
            </div>
          </div>
        )}

        {tab==='assign' && (
          <div className="space-y-4">
            <div className="bg-purple-50 border-2 border-purple-400 p-3 rounded-xl">
              <h2 className="font-black text-purple-900 text-lg">All Courses by Level + Semester — Admin → Registrar → Lecturer</h2>
              <p className="text-xs">Total: {courses.length} courses | Lecturers: {lecturers.length} | Filter then Assign</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-2 py-1 bg-white border rounded-full text-[10px]">ND1: {countByLevel('ND1')}</span>
                <span className="px-2 py-1 bg-white border rounded-full text-[10px]">ND2: {countByLevel('ND2')}</span>
                <span className="px-2 py-1 bg-white border rounded-full text-[10px]">HND1: {countByLevel('HND1')}</span>
                <span className="px-2 py-1 bg-white border rounded-full text-[10px]">HND2: {countByLevel('HND2')}</span>
              </div>
            </div>

            {/* FILTERS */}
            <div className="grid md:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border-2">
              <div><label className="text-[10px] font-black uppercase">Filter Level</label>
                <select value={filterLevel} onChange={e=>setFilterLevel(e.target.value)} className="w-full p-2.5 border-2 border-purple-300 rounded-xl text-xs font-black">
                  <option value="ALL">All Levels ({courses.length})</option>
                  <option value="ND1">ND1 ({countByLevel('ND1')})</option>
                  <option value="ND2">ND2 ({countByLevel('ND2')})</option>
                  <option value="HND1">HND1 ({countByLevel('HND1')})</option>
                  <option value="HND2">HND2 ({countByLevel('HND2')})</option>
                </select>
              </div>
              <div><label className="text-[10px] font-black uppercase">Filter Semester</label>
                <select value={filterSemester} onChange={e=>setFilterSemester(e.target.value)} className="w-full p-2.5 border-2 border-purple-300 rounded-xl text-xs font-black">
                  <option value="ALL">All Semesters</option>
                  <option value="First">First Semester</option>
                  <option value="Second">Second Semester</option>
                </select>
              </div>
              <div className="flex items-end"><div className="w-full p-2.5 bg-white border-2 rounded-xl text-xs font-black text-center">Showing: {filteredCoursesByLevelSem.length} courses</div></div>
              <div className="flex items-end"><div className="w-full p-2.5 bg-purple-700 text-white rounded-xl text-xs font-black text-center">{lecturers.length} Lecturers Available</div></div>
            </div>

            {/* QUICK ASSIGN DROPDOWNS */}
            <div className="grid md:grid-cols-3 gap-3 bg-purple-50 p-4 rounded-xl border-2 border-purple-300">
              <div><label className="text-xs font-bold">Select Course (from Admin)</label><select value={assignCourse} onChange={e=>setAssignCourse(e.target.value)} className="w-full p-2 border rounded"><option value="">-- Choose Course --</option>{courses.map((c:any)=><option key={getCourseId(c)} value={getCode(c)}>{getCode(c)} - {getTitle(c)} - {getUnit(c)} Units</option>)}</select></div>
              <div><label className="text-xs font-bold">Select Lecturer (from Admin)</label><select value={assignLecturer} onChange={e=>setAssignLecturer(e.target.value)} className="w-full p-2 border rounded"><option value="">-- Choose Lecturer --</option>{lecturers.map((l:any)=><option key={l.id||l.email} value={l.email}>{l.full_name || l.fullName} - {l.email}</option>)}</select></div>
              <div className="flex items-end"><button onClick={handleAssignCourse} className="w-full bg-purple-700 text-white p-3 rounded-xl font-black">Assign Course → Lecturer Sees</button></div>
            </div>

            {/* FULL TABLE - TITLE + CODE + UNIT + LEVEL + SEMESTER + ASSIGN */}
            <div className="border-2 rounded-xl overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-900 text-white"><tr><th className="p-3 text-left">Code</th><th className="p-3 text-left">Title</th><th className="p-2 text-center">Unit</th><th className="p-2 text-center">Level</th><th className="p-2 text-center">Semester</th><th className="p-3 text-left min-w-[220px]">Lecturer - Assign</th><th className="p-2 text-center">Status</th><th className="p-2 text-center">Remove</th></tr></thead>
                <tbody>
                  {filteredCoursesByLevelSem.map((c:any, idx:number)=>{
                    const code = getCode(c);
                    const title = getTitle(c);
                    const unit = getUnit(c);
                    const level = getLevel(c);
                    const sem = getSemester(c);
                    const curr = getAssignedName(c);
                    const currLecturer = lecturers.find((l:any)=> (l.full_name===curr || l.fullName===curr || l.email===curr));
                    const selectValue = currLecturer ? currLecturer.email : '';
                    return (
                      <tr key={c.id || idx} className="border-b hover:bg-purple-50">
                        <td className="p-3 font-black">{code}</td>
                        <td className="p-3 font-medium">{title}</td>
                        <td className="p-2 text-center font-black">{unit}</td>
                        <td className="p-2 text-center"><span className="px-2 py-1 bg-yellow-200 rounded-full text-[10px] font-black">{level}</span></td>
                        <td className="p-2 text-center"><span className={`px-2 py-1 rounded-full text-[10px] font-black ${sem.toLowerCase().includes('first')?'bg-blue-100 text-blue-800':'bg-green-100 text-green-800'}`}>{sem}</span></td>
                        <td className="p-2">
                          <select value={selectValue} onChange={e=>handleAssignFromTable(c, e.target.value)} className="w-full p-2 border-2 border-purple-300 rounded-lg text-xs font-bold">
                            <option value="">-- Select Lecturer --</option>
                            {lecturers.map((l:any)=><option key={l.id||l.email} value={l.email}>{l.full_name || l.fullName}</option>)}
                          </select>
                          {curr && <div className="text-[10px] mt-1 font-bold text-green-700">✅ {curr}</div>}
                        </td>
                        <td className="p-2 text-center">{curr ? <span className="px-2 py-1 bg-green-600 text-white rounded-full text-[10px]">ASSIGNED</span> : <span className="px-2 py-1 bg-red-500 text-white rounded-full text-[10px]">NOT</span>}</td>
                        <td className="p-2 text-center">{curr && <button onClick={()=>handleUnassignFromTable(c)} className="px-2 py-1 bg-red-100 text-red-700 rounded text-[10px] font-black">✕ Remove</button>}</td>
                      </tr>
                    )
                  })}
                  {filteredCoursesByLevelSem.length===0 && <tr><td colSpan={8} className="p-8 text-center font-bold text-gray-400">No courses for {filterLevel} - {filterSemester}</td></tr>}
                </tbody>
              </table>
            </div>

            <div className="border rounded-xl p-3"><h3 className="font-bold text-xs mb-2">Current Assignments - Lecturer will see</h3><div className="space-y-1 text-xs">{assignments.map((m:any, i:number)=><div key={i} className="flex justify-between bg-slate-50 p-2 rounded"><span className="font-bold">{getCode({course_code: m.course_id}) || m.course_id}</span><span>{m.lecturer_name}</span></div>)}{assignments.length===0 && JSON.parse(localStorage.getItem('lcns_lecturer_courses')||'[]').map((m:any, i:number)=><div key={i} className="flex justify-between bg-slate-50 p-2 rounded"><span className="font-bold">{m.course_code} - {m.level} - {m.semester}</span><span>{m.lecturer_email||m.lecturer}</span></div>)}</div></div>
          </div>
        )}
      </div>
    </div>
  );
};
export default RegistrarDashboard;

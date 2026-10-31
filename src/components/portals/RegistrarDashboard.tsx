import React, { useState, useEffect } from 'react';
import { AdmissionProcessingView } from './AdmissionProcessingView';
import { AdminStudentsBiodata } from '../admin/AdminStudentsBiodata';
import { CourseManagerView } from '../common/CourseManagerView';
import { StorageService } from '../../services/storage';
import { supabase } from '@/lib/supabase';
import { COLLEGE_CONFIG } from '../../types';

const RegistrarDashboard = () => {
  const [tab, setTab] = useState<'admissions'|'biodata'|'hod_results'|'promotion'|'session'|'assign'>('admissions');
  
  // --- HOD RESULTS WORKFLOW ---
  const [hodInbox, setHodInbox] = useState<any[]>(()=> JSON.parse(localStorage.getItem('lcns_results_registrar_inbox')|| localStorage.getItem('lcns_hod_forwarded')||'[]'));
  const [searchResult, setSearchResult] = useState('');

  // --- PROMOTION STATE ---
  const [students, setStudents] = useState<any[]>(()=> JSON.parse(localStorage.getItem('lcns_users')||'[]').filter((u:any)=>u.role==='STUDENT'));
  const [selectedLevel, setSelectedLevel] = useState('ND1');
  const [promoteTo, setPromoteTo] = useState('ND2');

  // --- SESSION STATE ---
  const [currentSession, setCurrentSession] = useState(localStorage.getItem('lcns_current_session')|| COLLEGE_CONFIG.CURRENT_SESSION || '2026/2027');
  const [newSession, setNewSession] = useState('2027/2028');

  // --- ASSIGN COURSE STATE - FROM ADMIN ---
  const [courses, setCourses] = useState<any[]>(()=> JSON.parse(localStorage.getItem('lcns_courses')||'[]'));
  const [lecturers, setLecturers] = useState<any[]>(()=> JSON.parse(localStorage.getItem('lcns_users')||'[]').filter((u:any)=>u.role==='LECTURER' || u.role==='HOD'));
  const [assignCourse, setAssignCourse] = useState('');
  const [assignLecturer, setAssignLecturer] = useState('');

  useEffect(()=>{
    const iv = setInterval(()=>{
      setHodInbox(JSON.parse(localStorage.getItem('lcns_results_registrar_inbox')|| localStorage.getItem('lcns_hod_forwarded')||'[]'));
      setCourses(JSON.parse(localStorage.getItem('lcns_courses')||'[]'));
      setLecturers(JSON.parse(localStorage.getItem('lcns_users')||'[]').filter((u:any)=>u.role==='LECTURER' || u.role==='HOD'));
    },3000);
    return ()=>clearInterval(iv);
  },[]);

  // --- HOD RESULT ACTIONS ---
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

  // --- PROMOTION ---
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

  // --- SESSION ---
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

  // --- ASSIGN COURSE - ADMIN COURSES TO ADMIN LECTURERS ---
  const handleAssignCourse = () => {
    if(!assignCourse || !assignLecturer) { alert('Select Course and Lecturer'); return; }
    const mapping = JSON.parse(localStorage.getItem('lcns_lecturer_courses')||'[]');
    mapping.push({ course_code: assignCourse, lecturer_email: assignLecturer, course: assignCourse, lecturer: assignLecturer, assignedBy: 'Registrar', date: new Date().toISOString() });
    localStorage.setItem('lcns_lecturer_courses', JSON.stringify(mapping));
    const updatedCourses = courses.map((c:any)=> (c.code===assignCourse || c.course_code===assignCourse) ? {...c, lecturer: assignLecturer, lecturer_email: assignLecturer, assigned_lecturer: assignLecturer} : c);
    localStorage.setItem('lcns_courses', JSON.stringify(updatedCourses));
    setCourses(updatedCourses);
    alert(`✅ Assigned ${assignCourse} to ${assignLecturer} - Lecturer will now see it in his portal`);
  };

  const filteredByLevel = students.filter((s:any)=> s.level===selectedLevel);
  const filteredHodInbox = hodInbox.filter((r:any)=> !searchResult || r.matric_no?.toLowerCase().includes(searchResult.toLowerCase()) || r.fullName?.toLowerCase().includes(searchResult.toLowerCase()));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-black p-4 bg-white rounded-xl border border-green-700">REGISTRAR - LCNS - HOD→Registrar→Provost</h1>
      
      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-xl border">
        <button onClick={()=>setTab('admissions')} className={`px-3 py-2 rounded text-xs font-black ${tab==='admissions'?'bg-green-700 text-white':'bg-gray-100'}`}>Admissions</button>
        <button onClick={()=>setTab('biodata')} className={`px-3 py-2 rounded text-xs font-black ${tab==='biodata'?'bg-green-700 text-white':'bg-gray-100'}`}>Biodata</button>
        <button onClick={()=>setTab('hod_results')} className={`px-3 py-2 rounded text-xs font-black ${tab==='hod_results'?'bg-blue-700 text-white shadow ring-2 ring-blue-300':'bg-blue-100 text-blue-800 border-2 border-blue-400'}`}>📥 HOD Results - {hodInbox.length}</button>
        <button onClick={()=>setTab('promotion')} className={`px-3 py-2 rounded text-xs font-black ${tab==='promotion'?'bg-blue-700 text-white':'bg-blue-100 text-blue-800'}`}>🎓 Promote</button>
        <button onClick={()=>setTab('session')} className={`px-3 py-2 rounded text-xs font-black ${tab==='session'?'bg-amber-600 text-white':'bg-amber-100'}`}>📅 New Academic Year</button>
        <button onClick={()=>setTab('assign')} className={`px-3 py-2 rounded text-xs font-black ${tab==='assign'?'bg-purple-700 text-white':'bg-purple-100 text-purple-800 border-2 border-purple-400'}`}>👨‍🏫 Assign Course (Admin→Lecturer)</button>
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
              {filteredHodInbox.length===0 && <tr><td colSpan={5} className="p-8 text-center text-gray-400 font-bold">No results from HOD yet - Waiting for HOD to forward</td></tr>}
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
            <h2 className="font-black text-lg">Assign Course (Added by Admin) to Lecturer (Created by Admin)</h2>
            <div className="bg-purple-50 border-2 border-purple-300 p-3 rounded-xl text-xs">
              <b>Flow:</b> Admin adds course → Admin creates Lecturer → Registrar assigns here → Lecturer sees course in his dashboard
            </div>
            <div className="grid md:grid-cols-3 gap-3 bg-purple-50 p-4 rounded-xl border-2 border-purple-300">
              <div><label className="text-xs font-bold">Select Course (from Admin)</label><select value={assignCourse} onChange={e=>setAssignCourse(e.target.value)} className="w-full p-2 border rounded"><option value="">-- Choose Course --</option>{courses.map((c:any)=><option key={c.code||c.course_code} value={c.code||c.course_code}>{c.code||c.course_code} - {c.name||c.title}</option>)}</select></div>
              <div><label className="text-xs font-bold">Select Lecturer (from Admin)</label><select value={assignLecturer} onChange={e=>setAssignLecturer(e.target.value)} className="w-full p-2 border rounded"><option value="">-- Choose Lecturer --</option>{lecturers.map((l:any)=><option key={l.email} value={l.email}>{l.fullName} - {l.email}</option>)}</select></div>
              <div className="flex items-end"><button onClick={handleAssignCourse} className="w-full bg-purple-700 text-white p-3 rounded-xl font-black">Assign Course → Lecturer Sees</button></div>
            </div>
            <div className="border rounded-xl p-3"><h3 className="font-bold text-xs mb-2">Current Assignments - Lecturer Portal will show</h3><div className="space-y-1 text-xs">{JSON.parse(localStorage.getItem('lcns_lecturer_courses')||'[]').map((m:any, i:number)=><div key={i} className="flex justify-between bg-slate-50 p-2 rounded"><span className="font-bold">{m.course_code||m.course}</span><span>{m.lecturer_email||m.lecturer}</span></div>)}</div></div>
            <div className="bg-white border p-3 rounded"><CourseManagerView portalRole="Registrar - Assign Courses" /></div>
          </div>
        )}
      </div>
    </div>
  );
};
export default RegistrarDashboard;

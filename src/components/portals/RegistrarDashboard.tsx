import React, { useState, useEffect } from 'react';
import { AdmissionProcessingView } from './AdmissionProcessingView';
import { AdminStudentsBiodata } from '../admin/AdminStudentsBiodata';
import { CourseManagerView } from '../common/CourseManagerView';
import { StorageService } from '../../services/storage';
import { supabase } from '@/lib/supabase';
import { COLLEGE_CONFIG } from '../../types';

const RegistrarDashboard = () => {
  const [tab, setTab] = useState<'admissions'|'biodata'|'hod_results'|'promotion'|'session'|'assign'>('assign');
  
  // --- HOD RESULTS ---
  const [hodInbox, setHodInbox] = useState<any[]>(()=> JSON.parse(localStorage.getItem('lcns_results_registrar_inbox')|| localStorage.getItem('lcns_hod_forwarded')||'[]'));
  const [searchResult, setSearchResult] = useState('');

  // --- STUDENTS PROMOTION ---
  const [students, setStudents] = useState<any[]>(()=> JSON.parse(localStorage.getItem('lcns_users')||'[]').filter((u:any)=>u.role==='STUDENT'));
  const [selectedLevel, setSelectedLevel] = useState('ND1');
  const [promoteTo, setPromoteTo] = useState('ND2');

  // --- SESSION ---
  const [currentSession, setCurrentSession] = useState(localStorage.getItem('lcns_current_session')|| COLLEGE_CONFIG.CURRENT_SESSION || '2026/2027');
  const [newSession, setNewSession] = useState('2027/2028');

  // --- COURSES + LECTURERS + FILTERS ---
  const [courses, setCourses] = useState<any[]>(()=> JSON.parse(localStorage.getItem('lcns_courses')||'[]'));
  const [lecturers, setLecturers] = useState<any[]>(()=> JSON.parse(localStorage.getItem('lcns_users')||'[]').filter((u:any)=>u.role==='LECTURER' || u.role==='HOD'));
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [filterSemester, setFilterSemester] = useState('ALL');

  useEffect(()=>{
    const load = () => {
      setHodInbox(JSON.parse(localStorage.getItem('lcns_results_registrar_inbox')|| localStorage.getItem('lcns_hod_forwarded')||'[]'));
      setCourses(JSON.parse(localStorage.getItem('lcns_courses')||'[]'));
      setLecturers(JSON.parse(localStorage.getItem('lcns_users')||'[]').filter((u:any)=>u.role==='LECTURER' || u.role==='HOD'));
      setStudents(JSON.parse(localStorage.getItem('lcns_users')||'[]').filter((u:any)=>u.role==='STUDENT'));
    };
    load();
    const iv = setInterval(load, 2000);
    return ()=>clearInterval(iv);
  },[]);

  const handleVetAndForwardToProvost = () => {
    if(hodInbox.length===0) return alert('No results');
    if(!confirm(`Forward ${hodInbox.length} to Provost?`)) return;
    const vetted = hodInbox.map((r:any)=> ({...r, status: 'REGISTRAR_VETTED', vettedAt: new Date().toISOString()}));
    localStorage.setItem('lcns_results_registrar_vetted', JSON.stringify(vetted));
    localStorage.setItem('lcns_results_provost_inbox', JSON.stringify(vetted));
    localStorage.removeItem('lcns_results_registrar_inbox');
    localStorage.removeItem('lcns_hod_forwarded');
    setHodInbox([]);
    alert(`✅ Forwarded to Provost`);
  };

  const handleReturnToHod = () => {
    const reason = prompt('Reason to return to HOD:'); if(!reason) return;
    localStorage.setItem('lcns_returned_to_hod', JSON.stringify(hodInbox));
    localStorage.removeItem('lcns_results_registrar_inbox');
    localStorage.removeItem('lcns_hod_forwarded');
    setHodInbox([]);
    alert(`↩️ Returned to HOD`);
  };

  const handlePromote = async () => {
    if(!confirm(`Promote ALL ${selectedLevel} to ${promoteTo}?`)) return;
    const allUsers = JSON.parse(localStorage.getItem('lcns_users')||'[]');
    const updatedAll = allUsers.map((u:any)=> u.level===selectedLevel && u.role==='STUDENT' ? {...u, level: promoteTo} : u);
    localStorage.setItem('lcns_users', JSON.stringify(updatedAll));
    setStudents(updatedAll.filter((u:any)=>u.role==='STUDENT'));
    try { await supabase.from('users').update({ level: promoteTo }).eq('level', selectedLevel); } catch {}
    alert(`✅ Promoted`);
  };

  const handleSetSession = () => {
    localStorage.setItem('lcns_current_session', newSession);
    localStorage.setItem('lcns_college_config', JSON.stringify({CURRENT_SESSION: newSession}));
    setCurrentSession(newSession);
    alert(`✅ New Session: ${newSession}`);
  };

  // Filter courses by Level + Semester
  const filteredCourses = courses.filter((c:any)=>{
    const level = c.level || 'ND1';
    const sem = (c.semester || c.sem || 'First').toString();
    if(filterLevel!=='ALL' && level!==filterLevel) return false;
    if(filterSemester!=='ALL' && !sem.toLowerCase().startsWith(filterSemester.toLowerCase().slice(0,3))) return false;
    return true;
  });

  // Count per level/semester
  const countByLevel = (lvl:string) => courses.filter((c:any)=>(c.level||'ND1')===lvl).length;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-black p-4 bg-white rounded-xl border border-green-700">REGISTRAR - All Courses by Level & Semester - Assign Lecturer</h1>
      
      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-xl border">
        <button onClick={()=>setTab('assign')} className={`px-3 py-2 rounded text-xs font-black ${tab==='assign'?'bg-purple-700 text-white shadow ring-2':'bg-purple-100 border-2 border-purple-400'}`}>👨‍🏫 All Courses & Assign - {courses.length}</button>
        <button onClick={()=>setTab('hod_results')} className={`px-3 py-2 rounded text-xs font-black ${tab==='hod_results'?'bg-blue-700 text-white':'bg-blue-50'}`}>📥 HOD Results - {hodInbox.length}</button>
        <button onClick={()=>setTab('admissions')} className={`px-3 py-2 rounded text-xs font-black ${tab==='admissions'?'bg-green-700 text-white':'bg-gray-100'}`}>Admissions</button>
        <button onClick={()=>setTab('biodata')} className={`px-3 py-2 rounded text-xs font-black ${tab==='biodata'?'bg-green-700 text-white':'bg-gray-100'}`}>Biodata</button>
        <button onClick={()=>setTab('promotion')} className={`px-3 py-2 rounded text-xs font-black ${tab==='promotion'?'bg-green-700 text-white':'bg-gray-100'}`}>Promote</button>
        <button onClick={()=>setTab('session')} className={`px-3 py-2 rounded text-xs font-black ${tab==='session'?'bg-amber-600 text-white':'bg-amber-100'}`}>New Session</button>
      </div>

      <div className="bg-white p-4 rounded-xl border min-h-[500px]">
        {tab==='admissions' && <AdmissionProcessingView />}
        {tab==='biodata' && <AdminStudentsBiodata />}

        {tab==='hod_results' && (
          <div className="space-y-3">
            <div className="flex gap-2"><button onClick={handleVetAndForwardToProvost} className="px-4 py-2 bg-green-700 text-white rounded font-black text-xs">✅ Vet & Forward to Provost</button><button onClick={handleReturnToHod} className="px-4 py-2 bg-red-600 text-white rounded font-black text-xs">↩️ Return to HOD</button></div>
            <table className="w-full text-xs"><thead className="bg-slate-900 text-white"><tr><th className="p-2">Matric</th><th>Name</th><th>Course</th><th>Score</th></tr></thead><tbody>{hodInbox.map((r:any,i:number)=><tr key={i} className="border-b"><td className="p-2 font-mono">{r.matric_no||r.matricNo}</td><td>{r.fullName}</td><td>{r.course_code}</td><td className="text-center font-black">{r.score}</td></tr>)}</tbody></table>
          </div>
        )}

        {tab==='assign' && (
          <div className="space-y-4">
            <div className="bg-purple-50 border-2 border-purple-400 p-4 rounded-xl">
              <h2 className="font-black text-purple-900 text-lg">All Courses Added by Admin - By Level & Semester</h2>
              <p className="text-xs mt-1">Filter by Level & Semester → Assign Lecturer → Lecturer will see course in his portal</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-xs font-black">TOTAL: {courses.length}</span>
                <span className="px-2 py-1 bg-white border rounded-full text-xs">ND1: {countByLevel('ND1')}</span>
                <span className="px-2 py-1 bg-white border rounded-full text-xs">ND2: {countByLevel('ND2')}</span>
                <span className="px-2 py-1 bg-white border rounded-full text-xs">HND1: {countByLevel('HND1')}</span>
                <span className="px-2 py-1 bg-white border rounded-full text-xs">HND2: {countByLevel('HND2')}</span>
              </div>
            </div>

            {/* FILTERS */}
            <div className="grid md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border-2">
              <div>
                <label className="text-[10px] font-black uppercase">Filter by Level</label>
                <select value={filterLevel} onChange={e=>setFilterLevel(e.target.value)} className="w-full p-2.5 border-2 border-purple-300 rounded-xl text-xs font-black">
                  <option value="ALL">All Levels - {courses.length}</option>
                  <option value="ND1">ND1 - {countByLevel('ND1')} courses</option>
                  <option value="ND2">ND2 - {countByLevel('ND2')} courses</option>
                  <option value="HND1">HND1 - {countByLevel('HND1')} courses</option>
                  <option value="HND2">HND2 - {countByLevel('HND2')} courses</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase">Filter by Semester</label>
                <select value={filterSemester} onChange={e=>setFilterSemester(e.target.value)} className="w-full p-2.5 border-2 border-purple-300 rounded-xl text-xs font-black">
                  <option value="ALL">All Semesters</option>
                  <option value="First">First Semester</option>
                  <option value="Second">Second Semester</option>
                </select>
              </div>
              <div className="flex items-end">
                <div className="w-full p-2.5 bg-white border-2 rounded-xl text-xs font-black text-center">
                  Showing: {filteredCourses.length} courses
                </div>
              </div>
              <div className="flex items-end">
                <div className="w-full p-2.5 bg-purple-700 text-white rounded-xl text-xs font-black text-center">
                  Lecturers: {lecturers.length} available
                </div>
              </div>
            </div>

            {/* COURSES TABLE - LIKE YOUR SCREENSHOT + LECTURER ASSIGN */}
            <div className="border-2 rounded-xl overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-900 text-white">
                  <tr>
                    <th className="p-3 text-left">Code</th>
                    <th className="p-3 text-left">Title</th>
                    <th className="p-2 text-center">Unit</th>
                    <th className="p-2 text-center">Level</th>
                    <th className="p-2 text-center">Semester</th>
                    <th className="p-3 text-left min-w-[220px]">Lecturer - Assign</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((c:any, idx:number)=>{
                    const code = c.code || c.course_code || c.courseCode;
                    const title = c.name || c.title || c.course_name;
                    const unit = c.unit || c.units || 2;
                    const level = c.level || 'ND1';
                    const semester = c.semester || c.sem || 'First';
                    const currentLect = c.lecturer || c.lecturer_email || c.assigned_lecturer || '';
                    return (
                      <tr key={idx} className="border-b hover:bg-purple-50">
                        <td className="p-3 font-black text-emerald-800">{code}</td>
                        <td className="p-3 font-bold">{title}</td>
                        <td className="p-2 text-center">{unit}</td>
                        <td className="p-2 text-center"><span className="px-2 py-1 bg-yellow-200 rounded-full text-[10px] font-black">{level}</span></td>
                        <td className="p-2 text-center"><span className={`px-2 py-1 rounded-full text-[10px] font-black ${semester.toLowerCase().includes('first')?'bg-blue-100 text-blue-800':'bg-green-100 text-green-800'}`}>{semester}</span></td>
                        <td className="p-2">
                          <select 
                            value={currentLect} 
                            onChange={(e)=>{
                              const newEmail = e.target.value;
                              const updated = courses.map((cc:any)=> (cc.code===code || cc.course_code===code) ? {...cc, lecturer: newEmail, lecturer_email: newEmail, assigned_lecturer: newEmail} : cc);
                              localStorage.setItem('lcns_courses', JSON.stringify(updated));
                              setCourses(updated);
                              const map = JSON.parse(localStorage.getItem('lcns_lecturer_courses')||'[]');
                              const filtered = map.filter((m:any)=> (m.course_code||m.course)!==code);
                              filtered.push({course_code: code, course: code, title, lecturer_email: newEmail, lecturer: newEmail, level, semester, assignedBy: 'Registrar', date: new Date().toISOString()});
                              localStorage.setItem('lcns_lecturer_courses', JSON.stringify(filtered));
                              window.dispatchEvent(new Event('lcns_storage_update'));
                            }}
                            className="w-full p-2 border-2 border-purple-300 rounded-lg text-xs font-bold bg-white"
                          >
                            <option value="">-- Select Lecturer --</option>
                            {lecturers.map((l:any)=><option key={l.email} value={l.email}>{l.fullName} ({l.email})</option>)}
                          </select>
                          {currentLect && <p className="text-[10px] text-green-700 font-bold mt-1">✓ {currentLect}</p>}
                        </td>
                        <td className="p-2 text-center">
                          {currentLect ? <span className="px-2 py-1 bg-green-600 text-white rounded-full text-[10px] font-black">ASSIGNED</span> : <span className="px-2 py-1 bg-red-500 text-white rounded-full text-[10px] font-black">NOT ASSIGNED</span>}
                        </td>
                      </tr>
                    )
                  })}
                  {filteredCourses.length===0 && <tr><td colSpan={7} className="p-10 text-center font-bold text-gray-400">No courses for {filterLevel} - {filterSemester}. Add courses in Admin first!</td></tr>}
                </tbody>
              </table>
            </div>

            <div className="bg-white border-2 border-green-300 p-3 rounded-xl">
              <h3 className="font-black text-xs">Assigned Summary - Lecturer Portal will show these:</h3>
              <div className="grid md:grid-cols-2 gap-2 mt-2">
                {JSON.parse(localStorage.getItem('lcns_lecturer_courses')||'[]').map((m:any, i:number)=><div key={i} className="flex justify-between bg-slate-50 p-2 rounded text-xs border"><span className="font-black">{m.course_code} - {m.level} - {m.semester}</span><span className="text-purple-700 font-bold">{m.lecturer_email}</span></div>)}
              </div>
            </div>
          </div>
        )}

        {tab==='promotion' && (
          <div className="space-y-3">
            <div className="flex gap-2"><select value={selectedLevel} onChange={e=>setSelectedLevel(e.target.value)} className="p-2 border rounded"><option>ND1</option><option>ND2</option><option>HND1</option><option>HND2</option></select><span>→</span><select value={promoteTo} onChange={e=>setPromoteTo(e.target.value)} className="p-2 border rounded"><option>ND2</option><option>HND1</option><option>HND2</option><option>GRADUATED</option></select><button onClick={handlePromote} className="px-4 bg-blue-700 text-white rounded font-black">Promote ALL</button></div>
            <p className="text-xs">{students.filter((s:any)=>s.level===selectedLevel).length} students in {selectedLevel}</p>
          </div>
        )}

        {tab==='session' && (
          <div className="space-y-3"><p>Current: <span className="font-black bg-slate-900 text-white px-3 py-1 rounded">{currentSession}</span></p><div className="flex gap-2"><input value={newSession} onChange={e=>setNewSession(e.target.value)} className="p-2 border rounded flex-1" /><button onClick={handleSetSession} className="px-4 bg-amber-600 text-white rounded font-black">Set New Academic Year</button></div></div>
        )}
      </div>
    </div>
  );
};
export default RegistrarDashboard;

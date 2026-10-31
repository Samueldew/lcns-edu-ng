import React, { useState, useEffect } from 'react';
import { AdmissionProcessingView } from './AdmissionProcessingView';
import { AdminStudentsBiodata } from '../admin/AdminStudentsBiodata';
import { CourseManagerView } from '../common/CourseManagerView';
import { StorageService } from '../../services/storage';
import { supabase } from '@/lib/supabase';
import { COLLEGE_CONFIG } from '../../types';

const RegistrarDashboard = () => {
  const [tab, setTab] = useState<'admissions'|'biodata'|'promotion'|'session'|'assign'>('admissions');
  
  // --- PROMOTION STATE ---
  const [students, setStudents] = useState<any[]>(()=> JSON.parse(localStorage.getItem('lcns_users')||'[]').filter((u:any)=>u.role==='STUDENT'));
  const [selectedLevel, setSelectedLevel] = useState('ND1');
  const [promoteTo, setPromoteTo] = useState('ND2');

  // --- SESSION STATE ---
  const [currentSession, setCurrentSession] = useState(COLLEGE_CONFIG.CURRENT_SESSION || '2026/2027');
  const [newSession, setNewSession] = useState('2027/2028');

  // --- ASSIGN COURSE STATE ---
  const [courses, setCourses] = useState<any[]>(()=> JSON.parse(localStorage.getItem('lcns_courses')||'[]'));
  const [lecturers, setLecturers] = useState<any[]>(()=> JSON.parse(localStorage.getItem('lcns_users')||'[]').filter((u:any)=>u.role==='LECTURER' || u.role==='HOD'));
  const [assignCourse, setAssignCourse] = useState('');
  const [assignLecturer, setAssignLecturer] = useState('');

  const handlePromote = async () => {
    if(!confirm(`Promote ALL ${selectedLevel} to ${promoteTo}?`)) return;
    const updated = students.map((s:any)=> s.level===selectedLevel ? {...s, level: promoteTo} : s);
    localStorage.setItem('lcns_users', JSON.stringify([...JSON.parse(localStorage.getItem('lcns_users')||'[]').filter((u:any)=>u.role!=='STUDENT'), ...updated]));
    setStudents(updated);
    // Update Supabase
    try { await supabase.from('users').update({ level: promoteTo }).eq('level', selectedLevel); } catch {}
    alert(`✅ Promoted ${selectedLevel} → ${promoteTo}`);
  };

  const handlePromoteOne = async (matric: string, to: string) => {
    const updated = students.map((s:any)=> (s.matricNumber===matric || s.matric_no===matric) ? {...s, level: to} : s);
    localStorage.setItem('lcns_users', JSON.stringify([...JSON.parse(localStorage.getItem('lcns_users')||'[]').filter((u:any)=>u.role!=='STUDENT'), ...updated]));
    setStudents(updated);
    try { await supabase.from('users').update({ level: to }).eq('matric_no', matric); } catch {}
  };

  const handleSetSession = () => {
    if(!newSession) return;
    localStorage.setItem('lcns_current_session', newSession);
    localStorage.setItem('lcns_academic_year', newSession);
    // Save to college config
    const cfg = JSON.parse(localStorage.getItem('lcns_college_config')||'{}');
    cfg.CURRENT_SESSION = newSession;
    localStorage.setItem('lcns_college_config', JSON.stringify(cfg));
    setCurrentSession(newSession);
    alert(`✅ Academic Year Changed to ${newSession} - All portals will see new year`);
    window.dispatchEvent(new Event('lcns_storage_update'));
  };

  const handleAssignCourse = () => {
    if(!assignCourse || !assignLecturer) { alert('Select Course and Lecturer'); return; }
    const mapping = JSON.parse(localStorage.getItem('lcns_lecturer_courses')||'[]');
    mapping.push({ course: assignCourse, lecturer: assignLecturer, assignedBy: 'Registrar', date: new Date().toISOString() });
    localStorage.setItem('lcns_lecturer_courses', JSON.stringify(mapping));
    // Update course itself
    const updatedCourses = courses.map((c:any)=> c.code===assignCourse ? {...c, lecturer: assignLecturer} : c);
    localStorage.setItem('lcns_courses', JSON.stringify(updatedCourses));
    setCourses(updatedCourses);
    alert(`✅ Assigned ${assignCourse} to ${assignLecturer} - Lecturer will now see it`);
  };

  const filteredByLevel = students.filter((s:any)=> s.level===selectedLevel);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-black p-4 bg-white rounded-xl border border-green-700">REGISTRAR - LCNS - Promotion + Session + Assign</h1>
      
      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-xl border">
        <button onClick={()=>setTab('admissions')} className={`px-3 py-2 rounded text-xs font-black ${tab==='admissions'?'bg-green-700 text-white':'bg-gray-100'}`}>Admissions</button>
        <button onClick={()=>setTab('biodata')} className={`px-3 py-2 rounded text-xs font-black ${tab==='biodata'?'bg-green-700 text-white':'bg-gray-100'}`}>Biodata</button>
        <button onClick={()=>setTab('promotion')} className={`px-3 py-2 rounded text-xs font-black ${tab==='promotion'?'bg-blue-700 text-white':'bg-blue-100 text-blue-800'}`}>🎓 Promote Student</button>
        <button onClick={()=>setTab('session')} className={`px-3 py-2 rounded text-xs font-black ${tab==='session'?'bg-amber-600 text-white':'bg-amber-100'}`}>📅 New Academic Year</button>
        <button onClick={()=>setTab('assign')} className={`px-3 py-2 rounded text-xs font-black ${tab==='assign'?'bg-purple-700 text-white':'bg-purple-100 text-purple-800'}`}>👨‍🏫 Assign Lecturer Course</button>
      </div>

      <div className="bg-white p-4 rounded-xl border min-h-[500px]">
        {tab==='admissions' && <AdmissionProcessingView />}
        {tab==='biodata' && <AdminStudentsBiodata />}
        
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
              <p className="text-xs mt-2 text-gray-600">This will update for ALL students, lecturers, bursar, provost</p>
            </div>
          </div>
        )}

        {tab==='assign' && (
          <div className="space-y-4">
            <h2 className="font-black text-lg">Assign Lecturer Course - Lecturer will see course</h2>
            <div className="grid md:grid-cols-3 gap-3 bg-purple-50 p-4 rounded-xl border-2 border-purple-300">
              <div><label className="text-xs font-bold">Select Course</label><select value={assignCourse} onChange={e=>setAssignCourse(e.target.value)} className="w-full p-2 border rounded"><option value="">-- Choose Course --</option>{courses.map((c:any)=><option key={c.code} value={c.code}>{c.code} - {c.name||c.title}</option>)}</select></div>
              <div><label className="text-xs font-bold">Select Lecturer</label><select value={assignLecturer} onChange={e=>setAssignLecturer(e.target.value)} className="w-full p-2 border rounded"><option value="">-- Choose Lecturer --</option>{lecturers.map((l:any)=><option key={l.email} value={l.email}>{l.fullName} - {l.email}</option>)}</select></div>
              <div className="flex items-end"><button onClick={handleAssignCourse} className="w-full bg-purple-700 text-white p-3 rounded-xl font-black">Assign Course</button></div>
            </div>
            <div className="border rounded-xl p-3"><h3 className="font-bold text-xs mb-2">Current Assignments</h3><div className="space-y-1 text-xs">{JSON.parse(localStorage.getItem('lcns_lecturer_courses')||'[]').map((m:any, i:number)=><div key={i} className="flex justify-between bg-slate-50 p-2 rounded"><span>{m.course}</span><span className="font-bold">{m.lecturer}</span></div>)}</div></div>
            <div className="bg-white border p-3 rounded"><CourseManagerView portalRole="Registrar - Assign Courses" /></div>
          </div>
        )}
      </div>
    </div>
  );
};
export default RegistrarDashboard;

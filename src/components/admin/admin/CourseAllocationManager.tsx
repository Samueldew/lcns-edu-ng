import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import { getSupabase } from '../../lib/supabase';
import { BookOpen, Users, Plus, Trash2, Search, GraduationCap } from 'lucide-react';

interface AllocatedCourse {
  id: string;
  code: string;
  title: string;
  units: number;
  level: string;
  semester: 'First' | 'Second';
  session: string;
  lecturerId: string;
  lecturerName: string;
  lecturerEmail: string;
  department: string;
  createdBy: string;
  createdAt: string;
}

export const CourseAllocationManager: React.FC<{ currentUser?: any }> = ({ currentUser }) => {
  const [courses, setCourses] = useState<AllocatedCourse[]>([]);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  
  const [form, setForm] = useState({
    code: '',
    title: '',
    units: 3,
    level: 'ND 1',
    semester: 'First' as 'First' | 'Second',
    session: localStorage.getItem('lcns_current_session') || '2025/2026',
    lecturerId: '',
    department: 'Department of Nursing Sciences',
  });

  const load = () => {
    const saved = JSON.parse(localStorage.getItem('lcns_allocated_courses') || '[]');
    setCourses(saved);
    const allUsers = StorageService.getUsers();
    const lecs = allUsers.filter((u:any)=> u.role==='LECTURER' || u.role==='HOD');
    setLecturers(lecs);
  };

  useEffect(()=>{ load(); }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.title || !form.lecturerId) { alert('Fill all fields + select lecturer'); return; }
    const selectedLect = lecturers.find(l=> l.id===form.lecturerId || l.email===form.lecturerId);
    if (!selectedLect) { alert('Select valid lecturer registered on portal'); return; }

    const newCourse: AllocatedCourse = {
      id: 'crs-'+Date.now(),
      code: form.code.toUpperCase(),
      title: form.title,
      units: Number(form.units),
      level: form.level,
      semester: form.semester,
      session: form.session,
      lecturerId: selectedLect.id,
      lecturerName: selectedLect.fullName,
      lecturerEmail: selectedLect.email,
      department: form.department,
      createdBy: currentUser?.fullName || 'Admin/Registrar',
      createdAt: new Date().toISOString(),
    };
    const updated = [newCourse, ...courses];
    localStorage.setItem('lcns_allocated_courses', JSON.stringify(updated));
    setCourses(updated);
    // Also save to main courses for HOD
    const mainCourses = StorageService.getCourses();
    StorageService.saveCourses([...mainCourses, { id: newCourse.id, code: newCourse.code, title: newCourse.title, units: newCourse.units, level: newCourse.level, semester: newCourse.semester, department: newCourse.department, lecturerName: newCourse.lecturerName } as any]);

    StorageService.logAction(currentUser?.email || 'admin@lcns.edu.ng', currentUser?.role || 'ADMIN', 'ALLOCATE_COURSE', `Allocated ${newCourse.code} - ${newCourse.title} to ${newCourse.lecturerName} (${newCourse.lecturerEmail}) for ${newCourse.semester} Semester ${newCourse.session}`);
    alert(`Course Allocated Successfully!\n${newCourse.code} - ${newCourse.title}\nAssigned to: ${newCourse.lecturerName}\nLecturer will see it on portal when they login!`);
    setForm({ code:'', title:'', units:3, level:'ND 1', semester:'First', session: form.session, lecturerId:'', department:'Department of Nursing Sciences' });
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this course allocation? Lecturer will no longer see it.')) return;
    const updated = courses.filter(c=> c.id!==id);
    localStorage.setItem('lcns_allocated_courses', JSON.stringify(updated));
    setCourses(updated);
  };

  const filtered = courses.filter(c => !search || `${c.code} ${c.title} ${c.lecturerName} ${c.level} ${c.semester}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white rounded-3xl border-2 border-emerald-200 p-5 space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-3">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2"><BookOpen className="w-6 h-6 text-emerald-700"/>Course Allocation - Admin & Registrar Add Course Manually & Assign Lecturer</h2>
          <p className="text-xs font-bold bg-emerald-50 border p-2 rounded mt-1">Admin/Registrar add course manually + select lecturer registered on portal (from Users LECTURER role) + Lecturer once opens portal sees their course taken for semester - Stored in lcns_allocated_courses + sync to supabase later</p>
        </div>
        <button onClick={()=>setShowAdd(true)} className="px-5 py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-black text-xs flex items-center gap-2 self-start"><Plus className="w-4 h-4"/>Allocate New Course to Lecturer</button>
      </div>

      <div className="flex flex-wrap gap-2 bg-slate-50 p-3 rounded-xl border">
        <div className="flex items-center gap-2 flex-1 bg-white border rounded-xl px-3"><Search className="w-4 h-4 text-slate-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Code, Title, Lecturer, Level, Semester" className="flex-1 py-2 text-xs font-bold outline-none"/></div>
        <div className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-black flex items-center gap-2"><GraduationCap className="w-4 h-4"/>{filtered.length} Courses Allocated | {lecturers.length} Lecturers Registered</div>
      </div>

      <div className="overflow-x-auto border-2 rounded-xl">
        <table className="w-full text-xs">
          <thead className="bg-emerald-900 text-white"><tr><th className="p-2 text-left">Course Code</th><th className="p-2 text-left">Course Title + Units</th><th className="p-2 text-left">Level / Semester / Session</th><th className="p-2 text-left">Assigned Lecturer (Registered)</th><th className="p-2 text-left">Department + Allocated By</th><th className="p-2">Delete</th></tr></thead>
          <tbody>
            {filtered.map(c=>(
              <tr key={c.id} className="border-b hover:bg-emerald-50/50">
                <td className="p-2 font-mono font-black text-emerald-900">{c.code}</td>
                <td className="p-2"><p className="font-bold">{c.title}</p><p className="text-[11px]">{c.units} Units</p></td>
                <td className="p-2"><p className="font-bold">{c.level}</p><p className="text-[11px]">{c.semester} Semester</p><p className="text-[11px]">{c.session}</p></td>
                <td className="p-2"><p className="font-black text-blue-800 flex items-center gap-1"><Users className="w-3 h-3"/>{c.lecturerName}</p><p className="text-[11px]">{c.lecturerEmail}</p><p className="text-[10px] bg-blue-100 px-1 rounded w-fit">Lecturer sees this on login</p></td>
                <td className="p-2"><p className="text-[11px]">{c.department}</p><p className="text-[10px] text-slate-500">By: {c.createdBy}</p></td>
                <td className="p-2 text-center"><button onClick={()=>handleDelete(c.id)} className="p-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100"><Trash2 className="w-4 h-4"/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length===0 && <div className="p-12 text-center border-2 border-dashed rounded-xl font-black text-slate-400">No courses allocated yet - Click Allocate New Course to Lecturer - Select lecturer registered on portal - Lecturer will see course on their portal</div>}

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="font-black text-lg uppercase">Add Course Manually & Assign Lecturer Registered on Portal</h3>
            <p className="text-xs bg-amber-50 border border-amber-200 p-2 rounded font-bold">Lecturer must be registered: Admin → Users → Create User → Role LECTURER - Then they appear in dropdown - Once you allocate, lecturer sees course taken for semester when they open portal</p>
            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block font-bold mb-1">Course Code *</label><input required value={form.code} onChange={e=>setForm({...form, code:e.target.value})} placeholder="NSC 201" className="w-full p-2.5 border rounded-xl font-mono font-bold uppercase"/></div>
                <div><label className="block font-bold mb-1">Units *</label><input type="number" min={1} max={6} required value={form.units} onChange={e=>setForm({...form, units:Number(e.target.value)})} className="w-full p-2.5 border rounded-xl font-bold"/></div>
              </div>
              <div><label className="block font-bold mb-1">Course Title *</label><input required value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="Medical-Surgical Nursing I" className="w-full p-2.5 border rounded-xl"/></div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block font-bold mb-1">Level *</label><select value={form.level} onChange={e=>setForm({...form, level:e.target.value})} className="w-full p-2.5 border rounded-xl"><option>ND 1</option><option>ND 2</option><option>HND 1</option><option>HND 2</option></select></div>
                <div><label className="block font-bold mb-1">Semester *</label><select value={form.semester} onChange={e=>setForm({...form, semester:e.target.value as any})} className="w-full p-2.5 border rounded-xl"><option>First</option><option>Second</option></select></div>
                <div><label className="block font-bold mb-1">Session *</label><input value={form.session} onChange={e=>setForm({...form, session:e.target.value})} className="w-full p-2.5 border rounded-xl"/></div>
              </div>
              <div><label className="block font-bold mb-1">Select Lecturer (Registered on Portal) *</label><select required value={form.lecturerId} onChange={e=>setForm({...form, lecturerId:e.target.value})} className="w-full p-3 border-2 border-blue-300 rounded-xl font-bold bg-blue-50"><option value="">-- Select Lecturer Registered --</option>{lecturers.map(l=>(<option key={l.id} value={l.id}>{l.fullName} - {l.email} - {l.department || 'Nursing'}</option>))}</select><p className="text-[11px] mt-1 text-blue-700 font-bold">{lecturers.length} lecturers registered - If not showing, go to Admin → Users → Create LECTURER account</p></div>
              <div><label className="block font-bold mb-1">Department</label><input value={form.department} onChange={e=>setForm({...form, department:e.target.value})} className="w-full p-2.5 border rounded-xl"/></div>
              <div className="flex gap-2 pt-2"><button type="button" onClick={()=>setShowAdd(false)} className="flex-1 py-3 bg-slate-100 rounded-xl font-black">Cancel</button><button type="submit" className="flex-1 py-3 bg-emerald-800 text-white rounded-xl font-black">Allocate Course to Lecturer - Lecturer Will See on Portal</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseAllocationManager;

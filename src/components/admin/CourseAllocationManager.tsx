import React, { useState, useEffect } from 'react';
import { getSupabase } from '../../lib/supabase';

type AllocatedCourse = {
  id: string;
  code: string;
  title: string;
  units: number;
  level: string;
  semester: string;
  session: string;
  lecturerId: string;
  lecturerName: string;
  lecturerEmail: string;
  department: string;
  createdBy: string;
  createdAt: string;
};

export const CourseAllocationManager: React.FC<{ currentUser?: any }> = ({ currentUser }) => {
  const [courses, setCourses] = useState<AllocatedCourse[]>([]);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    code: '', title: '', units: 3, level: 'ND 1', semester: 'First', session: '2025/2026', lecturerId: '', department: 'Nursing Sciences'
  });

  const loadData = async () => {
    try {
      const sb = getSupabase();
      let lecs: any[] = [];
      if (sb) {
        const { data } = await sb.from('lcns_users').select('*').eq('role', 'LECTURER');
        if (data && data.length > 0) lecs = data.map((u:any)=> ({ id: u.id, fullName: u.full_name || u.fullName, email: u.email }));
      }
      if (lecs.length === 0) {
        lecs = JSON.parse(localStorage.getItem('lcns_users')||'[]').filter((u:any)=> u.role==='LECTURER' || u.role==='HOD');
      }
      setLecturers(lecs);
      const crs = JSON.parse(localStorage.getItem('lcns_allocated_courses')||'[]');
      setCourses(crs);
    } catch {}
  };

  useEffect(()=>{ loadData(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const lec = lecturers.find((l:any)=> l.id===form.lecturerId);
    if (!lec) { alert('Select lecturer'); return; }
    const newC: AllocatedCourse = {
      id: 'crs-'+Date.now(),
      code: form.code.toUpperCase().trim(),
      title: form.title.trim(),
      units: Number(form.units),
      level: form.level,
      semester: form.semester,
      session: form.session,
      lecturerId: lec.id,
      lecturerName: lec.fullName || lec.full_name,
      lecturerEmail: lec.email,
      department: form.department,
      createdBy: currentUser?.fullName || 'Admin',
      createdAt: new Date().toISOString()
    };
    const updated = [newC, ...courses];
    localStorage.setItem('lcns_allocated_courses', JSON.stringify(updated));
    setCourses(updated);
    alert(`Allocated ${newC.code} to ${newC.lecturerName} - Lecturer will see on portal!`);
    setShowModal(false);
    setForm({ code: '', title: '', units: 3, level: 'ND 1', semester: 'First', session: '2025/2026', lecturerId: '', department: 'Nursing Sciences' });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete allocation?')) return;
    const updated = courses.filter(c=> c.id!==id);
    localStorage.setItem('lcns_allocated_courses', JSON.stringify(updated));
    setCourses(updated);
  };

  const filtered = courses.filter(c=> 
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.lecturerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-3xl border-2 border-emerald-200 p-5 space-y-4">
      <div className="flex justify-between gap-4">
        <div>
          <h2 className="text-xl font-black">📚 Course Allocation - Admin Assigns to Lecturer</h2>
          <p className="text-xs text-slate-500 mt-1">Lecturer sees on portal - {courses.length} courses - {lecturers.length} lecturers found</p>
        </div>
        <button onClick={()=>setShowModal(true)} className="px-5 py-3 bg-emerald-800 text-white rounded-xl text-xs font-black">+ Allocate Course</button>
      </div>

      <input type="text" placeholder="Search code, title, lecturer..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full max-w-sm px-4 py-2.5 text-xs rounded-xl border focus:ring-2 focus:ring-emerald-600"/>

      <div className="overflow-x-auto border rounded-xl">
        <table className="w-full text-xs text-left">
          <thead className="bg-emerald-900 text-white"><tr><th className="p-3">Code</th><th className="p-3">Title</th><th className="p-3">Level/Sem</th><th className="p-3">Lecturer</th><th className="p-3 text-right">Action</th></tr></thead>
          <tbody>
            {filtered.map(c=>(
              <tr key={c.id} className="border-b hover:bg-emerald-50">
                <td className="p-3 font-mono font-black">{c.code}</td>
                <td className="p-3 font-bold">{c.title} ({c.units})</td>
                <td className="p-3">{c.level} | {c.semester}</td>
                <td className="p-3 font-black text-blue-800">{c.lecturerName}<div className="text-[10px] text-slate-500">{c.lecturerEmail}</div></td>
                <td className="p-3 text-right"><button onClick={()=>handleDelete(c.id)} className="text-red-600 text-xs font-bold">Delete</button></td>
              </tr>
            ))}
            {filtered.length===0 && <tr><td colSpan={5} className="p-8 text-center text-slate-400 font-bold">No courses - Click + Allocate - Create LECTURER accounts first</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4">
            <h3 className="font-black text-lg">Allocate Course to Lecturer</h3>
            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="Code e.g. NSC 201" value={form.code} onChange={e=>setForm({...form, code:e.target.value})} className="p-2.5 border-2 border-emerald-200 rounded-xl"/>
                <input required type="number" min={1} max={6} placeholder="Units" value={form.units} onChange={e=>setForm({...form, units: Number(e.target.value)})} className="p-2.5 border rounded-xl"/>
              </div>
              <input required placeholder="Title e.g. Anatomy" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} className="w-full p-2.5 border rounded-xl"/>
              <select required value={form.lecturerId} onChange={e=>setForm({...form, lecturerId:e.target.value})} className="w-full p-3 border-2 border-blue-300 rounded-xl bg-blue-50 font-bold">
                <option value="">-- Select Lecturer --</option>
                {lecturers.map((l:any)=>(<option key={l.id} value={l.id}>{l.fullName || l.full_name} - {l.email}</option>))}
              </select>
              {lecturers.length===0 && <p className="text-[10px] text-red-600 font-bold">No lecturers - Create user with role LECTURER!</p>}
              <div className="flex gap-2"><button type="button" onClick={()=>setShowModal(false)} className="flex-1 py-3 bg-slate-100 rounded-xl font-black">Cancel</button><button type="submit" className="flex-1 py-3 bg-emerald-800 text-white rounded-xl font-black">Allocate</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseAllocationManager;

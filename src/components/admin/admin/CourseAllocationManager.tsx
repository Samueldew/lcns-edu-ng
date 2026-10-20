import React, { useState, useEffect } from 'react';

export const CourseAllocationManager: React.FC<{ currentUser?: any }> = ({ currentUser }) => {
  const [courses, setCourses] = useState<any[]>([]);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({code:'', title:'', units:3, level:'ND 1', semester:'First', session:'2025/2026', lecturerId:'', department:'Nursing Sciences'});

  const load = () => {
    setCourses(JSON.parse(localStorage.getItem('lcns_allocated_courses')||'[]'));
    setLecturers(JSON.parse(localStorage.getItem('lcns_users')||'[]').filter((u:any)=>u.role==='LECTURER' || u.role==='HOD'));
  };
  useEffect(()=>{load();},[]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const lec = lecturers.find((l:any)=> l.id===form.lecturerId);
    if(!lec){ alert('Select lecturer'); return; }
    const newC = { id:'crs-'+Date.now(), code:form.code.toUpperCase(), title:form.title, units:Number(form.units), level:form.level, semester:form.semester, session:form.session, lecturerId:lec.id, lecturerName:lec.fullName, lecturerEmail:lec.email, department:form.department, createdBy: currentUser?.fullName||'Admin', createdAt: new Date().toISOString() };
    const up = [newC, ...courses];
    localStorage.setItem('lcns_allocated_courses', JSON.stringify(up));
    setCourses(up);
    alert(`Allocated ${newC.code} to ${newC.lecturerName} - Lecturer will see on portal!`);
    setShow(false);
    setForm({code:'', title:'', units:3, level:'ND 1', semester:'First', session:'2025/2026', lecturerId:'', department:'Nursing Sciences'});
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-emerald-200 p-5 space-y-4">
      <div className="flex justify-between"><h2 className="font-black">📚 Course Allocation - Admin/Registrar Add Course & Assign Lecturer</h2><button onClick={()=>setShow(true)} className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-black">+ Allocate Course</button></div>
      <div className="overflow-x-auto border rounded-xl"><table className="w-full text-xs"><thead className="bg-emerald-900 text-white"><tr><th className="p-2">Code</th><th className="p-2">Title</th><th className="p-2">Level/Sem</th><th className="p-2">Lecturer</th></tr></thead><tbody>{courses.map((c:any)=>(<tr key={c.id} className="border-b"><td className="p-2 font-mono font-bold">{c.code}</td><td className="p-2">{c.title} ({c.units} Units)</td><td className="p-2">{c.level} - {c.semester}</td><td className="p-2 font-black text-blue-800">{c.lecturerName} - {c.lecturerEmail}</td></tr>))}</tbody></table></div>
      {show && <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"><div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-3"><h3 className="font-black">Allocate Course</h3><form onSubmit={handleAdd} className="space-y-3 text-xs"><input required placeholder="Code e.g. NSC 201" value={form.code} onChange={e=>setForm({...form, code:e.target.value})} className="w-full p-2.5 border rounded-xl"/><input required placeholder="Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} className="w-full p-2.5 border rounded-xl"/><div className="grid grid-cols-3 gap-2"><select value={form.level} onChange={e=>setForm({...form, level:e.target.value})} className="p-2.5 border rounded-xl"><option>ND 1</option><option>ND 2</option><option>HND 1</option><option>HND 2</option></select><select value={form.semester} onChange={e=>setForm({...form, semester:e.target.value})} className="p-2.5 border rounded-xl"><option>First</option><option>Second</option></select><input type="number" value={form.units} onChange={e=>setForm({...form, units:Number(e.target.value)})} className="p-2.5 border rounded-xl"/></div><select required value={form.lecturerId} onChange={e=>setForm({...form, lecturerId:e.target.value})} className="w-full p-3 border-2 border-blue-300 rounded-xl bg-blue-50 font-bold"><option value="">Select Lecturer</option>{lecturers.map((l:any)=>(<option key={l.id} value={l.id}>{l.fullName} - {l.email}</option>))}</select><div className="flex gap-2"><button type="button" onClick={()=>setShow(false)} className="flex-1 py-3 bg-slate-100 rounded-xl font-black">Cancel</button><button type="submit" className="flex-1 py-3 bg-emerald-800 text-white rounded-xl font-black">Allocate</button></div></form></div></div>}
    </div>
  );
};

export default CourseAllocationManager;

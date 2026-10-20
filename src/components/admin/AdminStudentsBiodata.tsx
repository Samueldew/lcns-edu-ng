import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import { Student } from '../../types';
import { getSupabase } from '../../lib/supabase';
import { Search, Users, GraduationCap, Download } from 'lucide-react';

export const AdminStudentsBiodata: React.FC<{ currentUser?: any, roleLabel?: string }> = ({ currentUser, roleLabel = 'All Students Biodata' }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [selected, setSelected] = useState<Student | null>(null);

  const load = async () => {
    const local = StorageService.getStudents();
    setStudents(local);
    const sb = getSupabase();
    try {
      if (sb) {
        const { data } = await sb.from('lcns_students').select('*').limit(500);
        if (data && data.length) {
          // Map supabase to Student type if needed
          setStudents(data as any);
        }
      }
    } catch {}
  };

  useEffect(() => { load(); }, []);

  const filtered = students.filter(s => {
    if (levelFilter !== 'ALL' && s.level !== levelFilter) return false;
    if (!search) return true;
    return `${s.fullName} ${s.matricNo} ${s.program} ${s.level} ${s.stateOfOrigin} ${s.phone}`.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow p-4 space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-3">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2"><GraduationCap className="w-6 h-6 text-emerald-700"/> {roleLabel} - All Student Biodata with Current Level - {currentUser?.role || 'STAFF'}</h2>
          <p className="text-xs bg-emerald-50 p-2 rounded border mt-1 font-bold">Provost and Registrar, Exam Officer, HOD see all student biodata on dashboard with their current level - Full Name, Matric No, Program, Level ND1 ND2 HND1 HND2, Session, State/LGA, Phone, Email, Blood Genotype, Guardian, Address, Photo, Current Level, CGPA, Status</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-black">Refresh</button>
          <button onClick={()=>window.print()} className="px-3 py-2 bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1"><Download className="w-4 h-4"/> Print Biodata</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 bg-slate-50 p-3 rounded-xl border">
        <div className="flex items-center gap-2 flex-1 bg-white border rounded-xl px-3"><Search className="w-4 h-4 text-slate-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Full Name, Matric No, Program, Phone, State" className="flex-1 py-2 text-xs font-bold text-black outline-none"/></div>
        <select value={levelFilter} onChange={e=>setLevelFilter(e.target.value)} className="px-4 py-2 border-2 border-emerald-300 rounded-xl text-xs font-black text-black">
          <option value="ALL">All Levels ({students.length})</option>
          <option value="ND 1">ND 1</option>
          <option value="ND 2">ND 2</option>
          <option value="HND 1">HND 1</option>
          <option value="HND 2">HND 2</option>
          <option value="ND1">ND1</option>
          <option value="ND2">ND2</option>
          <option value="HND1">HND1</option>
          <option value="HND2">HND2</option>
        </select>
        <div className="px-3 py-2 bg-emerald-900 text-white rounded-xl text-xs font-black">{filtered.length} Students Found</div>
      </div>

      <div className="overflow-x-auto border-2 rounded-xl">
        <table className="w-full text-xs">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="p-2 text-left">Photo + Matric No</th>
              <th className="p-2 text-left">Full Name + Biodata</th>
              <th className="p-2 text-left">Program + Current Level</th>
              <th className="p-2 text-left">Contact + State</th>
              <th className="p-2 text-left">Academic</th>
              <th className="p-2">Action View Full Biodata</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.matricNo} className="border-b hover:bg-slate-50">
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <img src={(s as any).photoUrl || (s as any).passportUrl || 'https://via.placeholder.com/50'} alt="passport" className="w-12 h-14 object-cover rounded border-2 border-black"/>
                    <div>
                      <p className="font-mono font-black text-emerald-800">{s.matricNo}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${s.level.includes('ND 1') || s.level==='ND1' ? 'bg-blue-100 text-blue-800' : s.level.includes('ND 2') || s.level==='ND2' ? 'bg-green-100 text-green-800' : s.level.includes('HND 1') || s.level==='HND1' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-900'}`}>{s.level}</span>
                    </div>
                  </div>
                </td>
                <td className="p-2">
                  <p className="font-black uppercase">{s.fullName}</p>
                  <p className="text-[11px]">Gender: {(s as any).gender || 'N/A'} | DOB: {(s as any).dob || (s as any).dateOfBirth || 'N/A'}</p>
                  <p className="text-[11px]">Blood: {s.bloodGroup} | Genotype: {s.genotype}</p>
                </td>
                <td className="p-2">
                  <p className="font-bold">{s.program}</p>
                  <p className="text-[11px]">Level: <b className="bg-yellow-200 px-1 rounded">{s.level}</b> | Session: {s.session}</p>
                  <p className="text-[11px]">Current Level: <b>{s.level}</b></p>
                </td>
                <td className="p-2">
                  <p className="text-[11px]">Phone: {s.phone || (s as any).phoneNumber || 'N/A'}</p>
                  <p className="text-[11px]">Email: {(s as any).email || 'N/A'}</p>
                  <p className="text-[11px]">State: {s.stateOfOrigin} | LGA: {s.lga}</p>
                  <p className="text-[11px] truncate max-w-[150px]">Address: {(s as any).address || (s as any).contactAddress || 'N/A'}</p>
                </td>
                <td className="p-2">
                  <p className="text-[11px]">CGPA: {(s as any).cgpa || (s as any).gpa || 'N/A'}</p>
                  <p className="text-[11px]">Status: <span className="bg-green-100 px-1 rounded">{s.status || 'ACTIVE'}</span></p>
                  <p className="text-[11px]">Guardian: {(s as any).guardianName || (s as any).nextOfKin || 'N/A'}</p>
                </td>
                <td className="p-2 text-center">
                  <button onClick={()=>setSelected(s)} className="px-3 py-1.5 bg-blue-700 text-white rounded-lg font-black text-[11px]">View Full Biodata</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length===0 && <div className="p-12 text-center border-2 border-dashed rounded-xl text-slate-400 font-black">No students found - Add students via Admin → Users → Create or via Admission → Admit</div>}

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-auto p-6 space-y-4">
            <div className="flex justify-between border-b pb-3">
              <h3 className="font-black text-lg">Full Student Biodata - {selected.fullName} - {selected.matricNo} - Current Level: {selected.level}</h3>
              <button onClick={()=>setSelected(null)} className="px-3 py-1 bg-slate-100 rounded-full font-black">X</button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <img src={(selected as any).photoUrl || (selected as any).passportUrl || 'https://via.placeholder.com/150'} alt="passport" className="w-32 h-40 object-cover rounded-xl border-2 border-black mx-auto"/>
                <div className="bg-slate-50 p-3 rounded-xl border text-xs space-y-1">
                  <p><b>Matric No:</b> {selected.matricNo}</p>
                  <p><b>Full Name:</b> {selected.fullName}</p>
                  <p><b>Current Level:</b> <span className="bg-yellow-300 px-2 py-0.5 rounded font-black">{selected.level}</span></p>
                  <p><b>Program:</b> {selected.program}</p>
                  <p><b>Session:</b> {selected.session}</p>
                  <p><b>Status:</b> {selected.status}</p>
                </div>
              </div>
              <div className="md:col-span-2 space-y-3">
                <div className="bg-blue-50 p-3 rounded-xl border-2 border-blue-200">
                  <h4 className="font-black text-xs">Personal Biodata</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                    <p>Gender: {(selected as any).gender || 'N/A'}</p>
                    <p>DOB: {(selected as any).dob || (selected as any).dateOfBirth || 'N/A'}</p>
                    <p>State: {selected.stateOfOrigin}</p>
                    <p>LGA: {selected.lga}</p>
                    <p>Blood: {selected.bloodGroup}</p>
                    <p>Genotype: {selected.genotype}</p>
                    <p>Phone: {selected.phone || 'N/A'}</p>
                    <p>Email: {(selected as any).email || 'N/A'}</p>
                  </div>
                </div>
                <div className="bg-amber-50 p-3 rounded-xl border-2 border-amber-200">
                  <h4 className="font-black text-xs">Contact & Guardian</h4>
                  <div className="text-xs mt-2 space-y-1">
                    <p>Address: {(selected as any).address || (selected as any).contactAddress || 'N/A'}</p>
                    <p>Guardian: {(selected as any).guardianName || (selected as any).nextOfKin || 'N/A'} - {(selected as any).guardianPhone || 'N/A'}</p>
                  </div>
                </div>
                <div className="bg-emerald-50 p-3 rounded-xl border-2 border-emerald-200">
                  <h4 className="font-black text-xs">Academic - Current Level: {selected.level}</h4>
                  <div className="text-xs mt-2">
                    <p>Program: {selected.program} | Level: {selected.level} | Session: {selected.session}</p>
                    <p>CGPA: {(selected as any).cgpa || 'N/A'} | Entry Mode: {(selected as any).entryMode || 'UTME'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>window.print()} className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-black">🖨️ Print Biodata with Current Level</button>
                  <button onClick={()=>setSelected(null)} className="px-6 py-3 bg-slate-100 rounded-xl font-black">Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudentsBiodata;

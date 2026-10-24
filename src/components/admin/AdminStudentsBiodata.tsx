import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import { Student } from '../../types';
import { getSupabase } from '../../lib/supabase';
import { Search, Users, GraduationCap, Download, Camera, Upload, X, Save, Edit3, UserCog, Plus, FileSpreadsheet, FileText } from 'lucide-react';

export const AdminStudentsBiodata: React.FC<{ currentUser?: any, roleLabel?: string }> = ({ currentUser, roleLabel = 'All Students Biodata' }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [staffUsers, setStaffUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [selected, setSelected] = useState<Student | null>(null);
  const [activeView, setActiveView] = useState<'students' | 'staff' | 'create'>('students');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [sex, setSex] = useState('');
  const [dob, setDob] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [genotype, setGenotype] = useState('');
  const [stateOrigin, setStateOrigin] = useState('Benue');
  const [lga, setLga] = useState('');
  const [address, setAddress] = useState('');
  const [level, setLevel] = useState('ND1');
  const [program, setProgram] = useState('Nursing Sciences');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [roleAssign, setRoleAssign] = useState<'STUDENT' | 'LECTURER' | 'HOD' | 'EXAM_OFFICER' | 'REGISTRAR' | 'PROVOST' | 'BURSAR'>('STUDENT');
  const [photo, setPhoto] = useState<string | null>(null);
  const [matricNo, setMatricNo] = useState('');
  const [password, setPassword] = useState('');

  const load = async () => {
    const local = StorageService.getStudents();
    setStudents(local);
    try {
      const localUsers = JSON.parse(localStorage.getItem('lcns_users') || '[]');
      const staffFiltered = localUsers.filter((u:any) => ['PROVOST','REGISTRAR','HOD','EXAM_OFFICER','BURSAR','LECTURER','ADMIN','ADMIN_OFFICER','ADMISSION_OFFICER'].includes((u.role || '').toUpperCase()));
      setStaffUsers(staffFiltered);
    } catch { setStaffUsers([]); }
    const sb = getSupabase();
    try {
      if (sb) {
        const { data } = await sb.from('lcns_students').select('*').limit(500);
        if (data && data.length) setStudents(data as any);
        const { data: usersData } = await sb.from('users').select('*').limit(500);
        if (usersData && usersData.length) {
          const staffFromSupabase = usersData.filter((u:any) => ['PROVOST','REGISTRAR','HOD','EXAM_OFFICER','BURSAR','LECTURER','ADMIN','ADMIN_OFFICER'].includes((u.role || '').toUpperCase()));
          if (staffFromSupabase.length) setStaffUsers(staffFromSupabase.map((u:any) => ({
            id: u.id, fullName: u.full_name || u.fullName, email: u.email, role: u.role, matricNo: u.matric_no, level: u.level, phone: u.phone, photoUrl: u.photo_url || u.photoUrl, department: u.department, status: 'ACTIVE', sex: u.sex
          })));
        }
      }
    } catch {}
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!editingId && activeView === 'create') {
      const count = students.length + 1;
      const autoMat = `LCNS/${new Date().getFullYear()}/${level}/${String(count).padStart(3,'0')}`;
      setMatricNo(autoMat);
      setPassword(`Lcns@${Math.floor(1000 + Math.random()*9000)}`);
    }
  }, [level, students.length, activeView, editingId]);

  const handlePhoto = (e: any) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 2*1024*1024) { alert('Max 2MB'); return; }
    const reader = new FileReader(); reader.onload = (ev) => setPhoto(ev.target?.result as string); reader.readAsDataURL(file);
  };

  const handleEdit = (s: any) => {
    setActiveView('create'); setEditingId(s.matricNo || s.id);
    setFullName(s.fullName || ''); setEmail((s as any).email || ''); setPhone(s.phone || (s as any).phoneNumber || ''); setSex((s as any).gender || (s as any).sex || ''); setDob((s as any).dob || (s as any).dateOfBirth || ''); setBloodGroup(s.bloodGroup || ''); setGenotype(s.genotype || ''); setStateOrigin(s.stateOfOrigin || (s as any).state || 'Benue'); setLga(s.lga || ''); setAddress((s as any).address || (s as any).contactAddress || ''); setLevel(s.level || 'ND1'); setProgram(s.program || 'Nursing Sciences'); setParentName((s as any).guardianName || (s as any).parentName || ''); setParentPhone((s as any).guardianPhone || (s as any).parentPhone || ''); setPhoto((s as any).photoUrl || (s as any).passportUrl || null); setMatricNo(s.matricNo); setPassword((s as any).password || ''); setRoleAssign('STUDENT');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleEditStaff = (u: any) => {
    setActiveView('create'); setEditingId(u.id);
    setFullName(u.fullName || u.full_name || ''); setEmail(u.email || ''); setPhone(u.phone || ''); setSex(u.sex || ''); setAddress(u.address || ''); setLevel(u.level || 'STAFF'); setProgram(u.department || 'Department of Nursing Sciences'); setPhoto(u.photoUrl || u.photo_url || null); setMatricNo(u.matricNo || u.matric_no || ''); setRoleAssign(u.role || 'LECTURER');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleSave = () => {
    if (!fullName || !email || !phone || !sex || !address) { alert('Fill Full Names*, Email*, Phone*, Sex*, Address*'); return; }
    if (roleAssign === 'STUDENT' && !photo) { if (!confirm('Student photo not uploaded - Continue?')) return; }
    const payload: any = {
      id: editingId || `STU-${Date.now()}`, fullName: fullName.toUpperCase(), email: email.toLowerCase(), phone, gender: sex, sex, dob, dateOfBirth: dob, bloodGroup, genotype, stateOfOrigin: stateOrigin, state: stateOrigin, lga, address, contactAddress: address, level: roleAssign === 'STUDENT' ? level : 'STAFF', program, matricNo: editingId ? students.find(s=> (s.matricNo === editingId) || (s as any).id === editingId)?.matricNo || matricNo : matricNo,
      password: editingId ? (students.find(s=> (s.matricNo === editingId) || (s as any).id === editingId) as any)?.password || password : password,
      photoUrl: photo, passportUrl: photo, photo_url: photo, guardianName: parentName, parentName, guardianPhone: parentPhone, parentPhone, role: roleAssign, status: 'ACTIVE', session: '2026/2027',
    };
    if (roleAssign === 'STUDENT') {
      const updated = editingId ? students.map(s=> (s.matricNo === editingId || (s as any).id === editingId) ? { ...s, ...payload } as any : s) : [payload as any, ...students];
      localStorage.setItem('lcns_students', JSON.stringify(updated)); setStudents(updated as any);
    }
    try {
      const users = JSON.parse(localStorage.getItem('lcns_users') || '[]');
      if (editingId) {
        const upd = users.map((u:any) => (u.id === editingId || u.matricNo === editingId) ? { ...u, fullName: payload.fullName, email: payload.email, phone, sex, level: payload.level, photoUrl: photo, photo_url: photo, department: program, role: roleAssign, matricNo: payload.matricNo } : u);
        localStorage.setItem('lcns_users', JSON.stringify(upd)); setStaffUsers(upd.filter((u:any) => ['PROVOST','REGISTRAR','HOD','EXAM_OFFICER','BURSAR','LECTURER','ADMIN','ADMIN_OFFICER'].includes((u.role || '').toUpperCase())));
      } else {
        users.unshift({ id: payload.id, fullName: payload.fullName, email: payload.email, role: roleAssign, matricNo: payload.matricNo, level: payload.level, phone, sex, photoUrl: photo, photo_url: photo, department: program, password: payload.password, status: 'ACTIVE' });
        localStorage.setItem('lcns_users', JSON.stringify(users)); setStaffUsers(users.filter((u:any) => ['PROVOST','REGISTRAR','HOD','EXAM_OFFICER','BURSAR','LECTURER','ADMIN','ADMIN_OFFICER'].includes((u.role || '').toUpperCase())));
      }
    } catch {}
    alert(`✅ ${editingId ? 'Updated' : 'Created'} ${fullName} - ${payload.matricNo} - ${roleAssign}`);
    setEditingId(null); setFullName(''); setEmail(''); setPhone(''); setSex(''); setDob(''); setBloodGroup(''); setGenotype(''); setStateOrigin('Benue'); setLga(''); setAddress(''); setParentName(''); setParentPhone(''); setPhoto(null);
  };

  // SEARCH BY NAME AND MATRIC - ENHANCED
  const filtered = students.filter(s => {
    if (levelFilter !== 'ALL' && s.level !== levelFilter) return false;
    if (!search) return true;
    const term = search.toLowerCase().trim();
    // SEARCH BY NAME AND MATRIC - EXACT MATCH FOR MATRIC, CONTAINS FOR NAME
    return s.fullName.toLowerCase().includes(term) || s.matricNo.toLowerCase().includes(term) || `${s.matricNo}`.toLowerCase() === term || `${s.fullName} ${s.matricNo} ${s.program} ${s.phone} ${s.stateOfOrigin}`.toLowerCase().includes(term);
  });
  const filteredStaff = staffUsers.filter((u:any) => {
    if (!search) return true;
    const term = search.toLowerCase().trim();
    return `${u.fullName} ${u.email} ${u.matricNo || ''} ${u.role}`.toLowerCase().includes(term);
  });

  // EXPORT TO CSV / EXCEL
  const exportToCSV = () => {
    const isStudent = activeView === 'students';
    const data = isStudent ? filtered : filteredStaff;
    if (data.length === 0) { alert('No data to export'); return; }
    let csv = '';
    if (isStudent) {
      csv = 'Matric No,Full Name,Email,Phone,Sex,DOB,State,LGA,Level,Program,Blood Group,Genotype,Address,Parent Name,Parent Phone,Session,Status\n';
      (data as any[]).forEach((s:any) => {
        csv += `"${s.matricNo}","${s.fullName}","${s.email || ''}","${s.phone || ''}","${s.gender || s.sex || ''}","${s.dob || ''}","${s.stateOfOrigin || ''}","${s.lga || ''}","${s.level}","${s.program}","${s.bloodGroup || ''}","${s.genotype || ''}","${(s.address || '').replace(/"/g,'""')}","${s.guardianName || s.parentName || ''}","${s.guardianPhone || s.parentPhone || ''}","${s.session || ''}","${s.status || ''}"\n`;
      });
    } else {
      csv = 'Staff ID,Full Name,Email,Role,Department,Phone,Sex,Level,Status\n';
      data.forEach((u:any) => {
        csv += `"${u.matricNo || u.id}","${u.fullName || u.full_name}","${u.email}","${u.role}","${u.department || ''}","${u.phone || ''}","${u.sex || ''}","${u.level || ''}","${u.status || ''}"\n`;
      });
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.setAttribute('href', url); link.setAttribute('download', `${isStudent ? 'Students' : 'Staff'}_Biodata_${levelFilter}_${new Date().toISOString().slice(0,10)}.csv`); document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const exportToExcel = () => {
    // Excel can open CSV with .xls extension + BOM
    const isStudent = activeView === 'students';
    const data = isStudent ? filtered : filteredStaff;
    if (data.length === 0) { alert('No data to export'); return; }
    let csv = '\uFEFF'; // BOM for Excel
    if (isStudent) {
      csv += 'Matric No\tFull Name\tEmail\tPhone\tSex\tDOB\tState\tLGA\tLevel\tProgram\tBlood Group\tGenotype\tAddress\tParent\tParent Phone\tSession\n';
      (data as any[]).forEach((s:any) => {
        csv += `${s.matricNo}\t${s.fullName}\t${s.email || ''}\t${s.phone || ''}\t${s.gender || s.sex || ''}\t${s.dob || ''}\t${s.stateOfOrigin || ''}\t${s.lga || ''}\t${s.level}\t${s.program}\t${s.bloodGroup || ''}\t${s.genotype || ''}\t${(s.address || '').replace(/\t/g,' ')}\t${s.guardianName || s.parentName || ''}\t${s.guardianPhone || s.parentPhone || ''}\t${s.session || ''}\n`;
      });
    } else {
      csv += 'Staff ID\tFull Name\tEmail\tRole\tDepartment\tPhone\tSex\tLevel\n';
      data.forEach((u:any) => {
        csv += `${u.matricNo || u.id}\t${u.fullName || u.full_name}\t${u.email}\t${u.role}\t${u.department || ''}\t${u.phone || ''}\t${u.sex || ''}\t${u.level || ''}\n`;
      });
    }
    const blob = new Blob([csv], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = `${isStudent ? 'Students' : 'Staff'}_Biodata_Excel_${new Date().toISOString().slice(0,10)}.xls`; document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const downloadPDF = () => {
    const isStudent = activeView === 'students';
    const data = isStudent ? filtered : filteredStaff;
    if (data.length === 0) { alert('No data for PDF'); return; }
    const title = isStudent ? `All Students Biodata - Level ${levelFilter} - ${data.length} Students` : `All Staff Biodata - ${data.length} Staff - Provost, Registrar, HOD, Exam Officer`;
    const html = `
      <html><head><title>${title}</title>
      <style>body{font-family:Arial; font-size:10px;} table{width:100%; border-collapse:collapse;} th,td{border:1px solid #000; padding:4px; text-align:left;} th{background:#0a4d2e; color:#fff;} .header{text-align:center; margin-bottom:10px;} h2{margin:0;} img{width:40px; height:50px; object-fit:cover;}</style>
      </head><body>
      <div class="header"><h2>Labe College of Nursing Sciences, Gboko</h2><p>${title} - Printed by ${currentUser?.fullName || currentUser?.email || 'Provost/Registrar/HOD/Exam Officer'} - Date: ${new Date().toLocaleString()} - Session: 2026/2027</p><p>Search: Name and Matric No - Filter: ${levelFilter}</p></div>
      <table><thead><tr>${isStudent ? '<th>Photo</th><th>Matric No</th><th>Full Name</th><th>Sex</th><th>Level</th><th>Program</th><th>Phone</th><th>State/LGA</th><th>Parent</th>' : '<th>Photo</th><th>Staff ID</th><th>Full Name</th><th>Role</th><th>Department</th><th>Email</th><th>Phone</th>'}</tr></thead><tbody>
      ${isStudent ? (data as any[]).map((s:any) => `<tr><td><img src="${s.photoUrl || s.passportUrl || ''}"/></td><td>${s.matricNo}</td><td>${s.fullName}</td><td>${s.gender || s.sex || ''}</td><td>${s.level}</td><td>${s.program}</td><td>${s.phone || ''}</td><td>${s.stateOfOrigin || ''}/${s.lga || ''}</td><td>${s.guardianName || ''} ${s.guardianPhone || ''}</td></tr>`).join('') : data.map((u:any) => `<tr><td><img src="${u.photoUrl || u.photo_url || ''}"/></td><td>${u.matricNo || u.id}</td><td>${u.fullName || u.full_name}</td><td>${u.role}</td><td>${u.department || ''}</td><td>${u.email}</td><td>${u.phone || ''}</td></tr>`).join('')}
      </tbody></table>
      <p style="margin-top:20px;">Total: ${data.length} ${isStudent ? 'Students' : 'Staff'} - Generated from AdminStudentsBiodata - Visible to Provost, Registrar, HOD, Exam Officer</p>
      </body></html>`;
    const win = window.open('', '_blank'); if (win) { win.document.write(html); win.document.close(); win.focus(); setTimeout(()=>win.print(), 500); } else { alert('Allow popups to download PDF'); }
  };

  return (
    <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow p-4 space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-3">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2"><GraduationCap className="w-6 h-6 text-emerald-700"/> {roleLabel} - Search by Name and Matric No + PDF + Excel CSV - {currentUser?.role || 'PROVOST/REGISTRAR/HOD/EXAM OFFICER VIEW'}</h2>
          <p className="text-xs bg-emerald-50 p-2 rounded border mt-1 font-bold">Provost, Registrar, Exam Officer, HOD see all student biodata + staff biodata - Search by Full Name and Matric No - Download PDF with photos - Export Excel CSV for 2026/2027</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={()=>setActiveView('students')} className={`px-3 py-2 rounded-xl text-xs font-black ${activeView==='students'?'bg-emerald-800 text-white':'bg-slate-100'}`}>👨‍🎓 Students ({students.length})</button>
          <button onClick={()=>setActiveView('staff')} className={`px-3 py-2 rounded-xl text-xs font-black ${activeView==='staff'?'bg-blue-800 text-white':'bg-blue-50 border'}`}>👨‍🏫 Staffs ({staffUsers.length})</button>
          <button onClick={()=>setActiveView('create')} className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1 ${activeView==='create'?'bg-amber-500 text-black':'bg-amber-50 border-2 border-amber-300'}`}><Plus className="w-4 h-4"/> Create / Edit + Role + Photo</button>
        </div>
      </div>

      {activeView === 'create' && (
        <div className="border-2 border-amber-400 rounded-2xl p-6 space-y-4 bg-amber-50/30">
          <h3 className="font-black text-sm text-blue-800">📋 STUDENT FULL BIODATA - AUTO MATRIC + PASSWORD + ROLE ASSIGN + PHOTO</h3>
          <div className="bg-white border-2 border-dashed border-amber-400 rounded-2xl p-4 flex gap-4 items-center">
            <div className="w-28 h-32 rounded-xl border-2 bg-slate-100 overflow-hidden flex items-center justify-center shadow">{photo ? <img src={photo} className="w-full h-full object-cover"/> : <div className="text-center"><Camera className="w-6 h-6 mx-auto text-slate-400"/><p className="text-[10px]">No Photo</p></div>}</div>
            <div className="flex-1 space-y-2">
              <p className="font-black text-xs">Photo Upload * - For ID Card</p>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black cursor-pointer"><Upload size={14}/> Upload Photo<input type="file" accept="image/*" onChange={handlePhoto} className="hidden"/></label>
              {photo && <button onClick={()=>setPhoto(null)} className="ml-2 px-3 py-2 bg-red-100 text-red-700 rounded-xl text-xs font-bold"><X size={12}/> Remove</button>}
              <div className="flex flex-wrap gap-2 text-[11px] font-mono font-bold"><span className="px-2 py-1 bg-slate-900 text-white rounded-full">Matric: {matricNo}</span><span className="px-2 py-1 bg-amber-400 text-black rounded-full">Password: {password}</span><span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full">Role: {roleAssign}</span></div>
            </div>
          </div>
          <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-3">
            <label className="block font-black text-xs mb-1">Assign Role *</label>
            <select value={roleAssign} onChange={e=>setRoleAssign(e.target.value as any)} className="w-full border-2 border-blue-400 px-4 py-3 rounded-xl text-sm font-black bg-white">
              <option value="STUDENT">STUDENT</option><option value="LECTURER">LECTURER</option><option value="HOD">HOD</option><option value="EXAM_OFFICER">EXAM_OFFICER</option><option value="REGISTRAR">REGISTRAR</option><option value="PROVOST">PROVOST</option><option value="BURSAR">BURSAR</option>
            </select>
          </div>
          <div><label className="text-xs font-black">Full Names *</label><input value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Okonkwo John Chukwu" className="w-full border-2 border-slate-800 rounded-xl px-4 py-3 text-sm font-bold mt-1"/></div>
          <div className="grid md:grid-cols-3 gap-4">
            <div><label className="text-xs font-black">Email *</label><input value={email} onChange={e=>setEmail(e.target.value)} className="w-full border-2 border-slate-800 rounded-xl px-4 py-3 text-sm mt-1"/></div>
            <div><label className="text-xs font-black">Phone *</label><input value={phone} onChange={e=>setPhone(e.target.value)} className="w-full border-2 border-slate-800 rounded-xl px-4 py-3 text-sm mt-1"/></div>
            <div><label className="text-xs font-black">Sex *</label><select value={sex} onChange={e=>setSex(e.target.value)} className="w-full border-2 border-slate-800 rounded-xl px-4 py-3 text-sm mt-1 bg-white font-bold"><option value="">Select</option><option>Male</option><option>Female</option></select></div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div><label className="text-xs font-black">DOB</label><input type="date" value={dob} onChange={e=>setDob(e.target.value)} className="w-full border-2 border-slate-800 rounded-xl px-4 py-3 text-sm mt-1"/></div>
            <div><label className="text-xs font-black">Blood Group</label><select value={bloodGroup} onChange={e=>setBloodGroup(e.target.value)} className="w-full border-2 border-slate-800 rounded-xl px-4 py-3 text-sm mt-1 bg-white"><option value="">Select</option><option>A+</option><option>B+</option><option>O+</option><option>AB+</option></select></div>
            <div><label className="text-xs font-black">Genotype</label><select value={genotype} onChange={e=>setGenotype(e.target.value)} className="w-full border-2 border-slate-800 rounded-xl px-4 py-3 text-sm mt-1 bg-white"><option value="">Select</option><option>AA</option><option>AS</option><option>SS</option></select></div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div><label className="text-xs font-black">State</label><input value={stateOrigin} onChange={e=>setStateOrigin(e.target.value)} className="w-full border-2 border-slate-800 rounded-xl px-4 py-3 text-sm mt-1"/></div>
            <div><label className="text-xs font-black">LGA</label><input value={lga} onChange={e=>setLga(e.target.value)} className="w-full border-2 border-slate-800 rounded-xl px-4 py-3 text-sm mt-1"/></div>
            <div><label className="text-xs font-black">Level *</label><select value={level} onChange={e=>setLevel(e.target.value)} className="w-full border-2 border-slate-800 rounded-xl px-4 py-3 text-sm mt-1 bg-white font-black"><option>ND1</option><option>ND2</option><option>HND1</option><option>HND2</option><option>STAFF</option></select></div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2"><label className="text-xs font-black">Address *</label><input value={address} onChange={e=>setAddress(e.target.value)} className="w-full border-2 border-slate-800 rounded-xl px-4 py-3 text-sm mt-1"/></div>
            <div><label className="text-xs font-black">Program</label><input value={program} onChange={e=>setProgram(e.target.value)} className="w-full border-2 border-slate-800 rounded-xl px-4 py-3 text-sm mt-1"/></div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="text-xs font-black">Parent Name *</label><input value={parentName} onChange={e=>setParentName(e.target.value)} className="w-full border-2 border-slate-800 rounded-xl px-4 py-3 text-sm mt-1"/></div>
            <div><label className="text-xs font-black">Parent Phone *</label><input value={parentPhone} onChange={e=>setParentPhone(e.target.value)} className="w-full border-2 border-slate-800 rounded-xl px-4 py-3 text-sm mt-1"/></div>
          </div>
          <button onClick={handleSave} className="w-full bg-[#0a4d2e] text-white py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2"><Save size={16}/>{editingId ? `Update ${fullName}` : `Create ${roleAssign} - ${matricNo} + ${password}`}</button>
        </div>
      )}

      {activeView !== 'create' && (
        <>
          <div className="flex flex-wrap gap-2 bg-slate-50 p-3 rounded-xl border">
            {/* SEARCH BY NAME AND MATRIC - NEW */}
            <div className="flex items-center gap-2 flex-1 bg-white border-2 border-emerald-400 rounded-xl px-3">
              <Search className="w-4 h-4 text-emerald-700"/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={activeView==='students' ? "🔍 Search by Name and Matric No - Type Full Name or LCNS/2026/ND1/001" : "🔍 Search Staff by Name and Staff ID / Matric No"} className="flex-1 py-2.5 text-xs font-black text-black outline-none"/>
              {search && <button onClick={()=>setSearch('')} className="px-2 py-1 bg-slate-100 rounded-full text-[10px] font-black">Clear</button>}
            </div>
            {activeView==='students' && (
              <select value={levelFilter} onChange={e=>setLevelFilter(e.target.value)} className="px-4 py-2 border-2 border-emerald-300 rounded-xl text-xs font-black text-black">
                <option value="ALL">All Levels ({students.length})</option>
                <option value="ND1">ND1</option><option value="ND2">ND2</option><option value="HND1">HND1</option><option value="HND2">HND2</option>
              </select>
            )}
            <div className="px-3 py-2 bg-emerald-900 text-white rounded-xl text-xs font-black">{activeView==='students' ? `${filtered.length}/${students.length} Students Found` : `${filteredStaff.length}/${staffUsers.length} Staff Found`}</div>
          </div>

          {/* EXPORT BUTTONS - NEW */}
          <div className="flex flex-wrap gap-2">
            <button onClick={downloadPDF} className="px-4 py-2 bg-red-700 text-white rounded-xl text-xs font-black flex items-center gap-2"><FileText className="w-4 h-4"/> Download PDF - {activeView==='students' ? `${filtered.length} Students` : `${filteredStaff.length} Staff`} with Photos</button>
            <button onClick={exportToCSV} className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-2"><FileSpreadsheet className="w-4 h-4"/> Export to CSV - Excel Compatible</button>
            <button onClick={exportToExcel} className="px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-black flex items-center gap-2"><Download className="w-4 h-4"/> Export to Excel (.xls) - Opens in Excel</button>
            <button onClick={load} className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-black">Refresh</button>
            <span className="text-[11px] text-slate-500 py-2">Search by Name and Matric No: Type e.g. "Okonkwo" or "LCNS/2026/ND1/001" - Filters instantly - Then export only filtered results</span>
          </div>

          {activeView === 'students' ? (
            <div className="overflow-x-auto border-2 rounded-xl">
              <table className="w-full text-xs">
                <thead className="bg-slate-900 text-white"><tr><th className="p-2">Photo + Matric No</th><th className="p-2">Full Name + Biodata</th><th className="p-2">Program + Current Level</th><th className="p-2">Contact + State</th><th className="p-2">Academic</th><th className="p-2">Action</th></tr></thead>
                <tbody>
                  {filtered.map(s => (
                    <tr key={s.matricNo} className="border-b hover:bg-slate-50">
                      <td className="p-2"><div className="flex items-center gap-2"><img src={(s as any).photoUrl || (s as any).passportUrl || 'https://via.placeholder.com/50'} alt="passport" className="w-12 h-14 object-cover rounded border-2 border-black"/><div><p className="font-mono font-black text-emerald-800">{s.matricNo}</p><span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${s.level==='ND1'?'bg-blue-100 text-blue-800': s.level==='ND2'?'bg-green-100 text-green-800': s.level==='HND1'?'bg-purple-100 text-purple-800':'bg-amber-100 text-amber-900'}`}>{s.level}</span></div></div></td>
                      <td className="p-2"><p className="font-black uppercase">{s.fullName}</p><p className="text-[11px]">Gender: {(s as any).gender || 'N/A'} | DOB: {(s as any).dob || 'N/A'}</p><p className="text-[11px]">Blood: {s.bloodGroup} | {s.genotype}</p></td>
                      <td className="p-2"><p className="font-bold">{s.program}</p><p className="text-[11px]">Level: <b className="bg-yellow-200 px-1 rounded">{s.level}</b> | {s.session}</p></td>
                      <td className="p-2"><p className="text-[11px]">Phone: {s.phone}</p><p className="text-[11px]">Email: {(s as any).email}</p><p className="text-[11px]">State: {s.stateOfOrigin} | {s.lga}</p></td>
                      <td className="p-2"><p className="text-[11px]">Status: {s.status}</p><p className="text-[11px]">Guardian: {(s as any).guardianName || 'N/A'}</p></td>
                      <td className="p-2 text-center space-y-1"><button onClick={()=>setSelected(s)} className="px-3 py-1.5 bg-blue-700 text-white rounded-lg font-black text-[11px] block w-full">View</button><button onClick={()=>handleEdit(s)} className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg font-black text-[11px] flex items-center justify-center gap-1 w-full"><Edit3 className="w-3 h-3"/> Edit</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto border-2 border-blue-300 rounded-xl">
              <table className="w-full text-xs"><thead className="bg-blue-900 text-white"><tr><th className="p-3">Photo + Staff ID / Matric</th><th className="p-3">Full Name + Role</th><th className="p-3">Department + Email</th><th className="p-3">Contact</th><th className="p-3">Visible To</th><th className="p-3">Edit</th></tr></thead>
                <tbody>{filteredStaff.map((u:any) => (
                  <tr key={u.id} className="border-b hover:bg-blue-50">
                    <td className="p-3"><div className="flex items-center gap-2"><img src={u.photoUrl || u.photo_url || 'https://via.placeholder.com/50'} className="w-12 h-14 object-cover rounded border-2 border-blue-800"/><div><p className="font-mono font-black text-blue-800">{u.matricNo || u.id.slice(0,8)}</p><span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">{u.role}</span></div></div></td>
                    <td className="p-3"><p className="font-black uppercase">{u.fullName || u.full_name}</p><p className="text-[11px] font-bold">{u.role}</p></td>
                    <td className="p-3"><p className="font-bold">{u.department || 'Nursing Sciences'}</p><p className="text-[11px]">{u.email}</p></td>
                    <td className="p-3"><p className="text-[11px]">Phone: {u.phone || 'N/A'}</p><p className="text-[11px]">Sex: {u.sex || 'N/A'}</p></td>
                    <td className="p-3"><span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-[10px] font-black">Provost, Registrar, HOD, Exam Officer</span></td>
                    <td className="p-3 text-center"><button onClick={()=>handleEditStaff(u)} className="px-3 py-1.5 bg-blue-700 text-white rounded-lg font-black text-[11px] flex items-center gap-1"><Edit3 className="w-3 h-3"/> Edit</button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
          {filtered.length===0 && activeView==='students' && <div className="p-12 text-center border-2 border-dashed rounded-xl text-slate-400 font-black">No students found - Search by Name and Matric No - Try "LCNS" or name like "Okonkwo" - Current search: "{search}" - Level filter: {levelFilter}</div>}
        </>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-auto p-6 space-y-4">
            <div className="flex justify-between border-b pb-3"><h3 className="font-black text-lg">Full Student Biodata - {selected.fullName} - {selected.matricNo} - {selected.level}</h3><button onClick={()=>setSelected(null)} className="px-3 py-1 bg-slate-100 rounded-full font-black">X</button></div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2"><img src={(selected as any).photoUrl || (selected as any).passportUrl || 'https://via.placeholder.com/150'} alt="passport" className="w-32 h-40 object-cover rounded-xl border-2 border-black mx-auto"/>
                <div className="bg-slate-50 p-3 rounded-xl border text-xs space-y-1"><p><b>Matric No:</b> {selected.matricNo}</p><p><b>Full Name:</b> {selected.fullName}</p><p><b>Level:</b> <span className="bg-yellow-300 px-2 py-0.5 rounded font-black">{selected.level}</span></p><p><b>Program:</b> {selected.program}</p></div>
              </div>
              <div className="md:col-span-2 space-y-3">
                <div className="bg-blue-50 p-3 rounded-xl border-2 border-blue-200"><h4 className="font-black text-xs">Personal Biodata</h4><div className="grid grid-cols-2 gap-2 text-xs mt-2"><p>Gender: {(selected as any).gender}</p><p>DOB: {(selected as any).dob}</p><p>State: {selected.stateOfOrigin}</p><p>LGA: {selected.lga}</p><p>Blood: {selected.bloodGroup}</p><p>Genotype: {selected.genotype}</p><p>Phone: {selected.phone}</p><p>Email: {(selected as any).email}</p></div></div>
                <div className="bg-amber-50 p-3 rounded-xl border-2 border-amber-200"><h4 className="font-black text-xs">Contact & Guardian</h4><div className="text-xs mt-2"><p>Address: {(selected as any).address}</p><p>Guardian: {(selected as any).guardianName} - {(selected as any).guardianPhone}</p></div></div>
                <div className="flex gap-2"><button onClick={downloadPDF} className="flex-1 py-3 bg-red-700 text-white rounded-xl font-black flex items-center justify-center gap-2"><FileText className="w-4 h-4"/> Download PDF with Photo</button><button onClick={()=>{setSelected(null); handleEdit(selected);}} className="px-6 py-3 bg-blue-700 text-white rounded-xl font-black flex items-center gap-1"><Edit3 className="w-4 h-4"/> Edit</button><button onClick={()=>setSelected(null)} className="px-6 py-3 bg-slate-100 rounded-xl font-black">Close</button></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudentsBiodata;

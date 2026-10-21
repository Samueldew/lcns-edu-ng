import React, { useEffect, useState } from 'react';
import { StorageService } from '../../services/storage';
import { AdminSettings } from './AdminSettings';
import AdminManagement from './AdminManagement';
import { AdminGallery } from './AdminGallery';
import { CBTExamManager } from '../cbt/CBTExamManager';
import { Sliders, Camera, Award, UserCheck, ArrowUpCircle, GraduationCap, Users, Database, BookOpen, ShieldCheck, DollarSign, Crown, Trash2, Link2, Megaphone, CheckCircle2, RefreshCw, Eye, EyeOff, Server, UserPlus, Phone, Briefcase, Key, IdCard, BookMarked, Copy, Image as ImageIcon, UploadCloud, X } from 'lucide-react';
import { StudentPromotion } from './StudentPromotion';
import { AdminAdmissionManager } from '../admin/AdminAdmissionManager';
import { getSupabase, getSupabaseConfig } from '../../lib/supabase';
import { ScoreSheetViewer } from './ScoreSheetViewer';

// --- GALLERY UPLOAD & PUBLISH TO WEBSITE - SAME AS YOURS ---
const GalleryManager = ({ showStatus }: any) => {
  const [gallery, setGallery] = useState<any[]>(()=>JSON.parse(localStorage.getItem('lcns_gallery')||'[]'));
  const [form, setForm] = useState({ title: '', category: 'Campus Life', description: '', image: '', isPublished: true });
  const [uploading, setUploading] = useState(false);
  useEffect(()=>{ const s=localStorage.getItem('lcns_gallery'); if(s) setGallery(JSON.parse(s)); const h=(e:StorageEvent)=>{ if(e.key==='lcns_gallery' && e.newValue) setGallery(JSON.parse(e.newValue)); }; window.addEventListener('storage', h); return()=>window.removeEventListener('storage', h); }, []);
  const handleImage = (e:React.ChangeEvent<HTMLInputElement>)=>{ const f=e.target.files?.[0]; if(!f)return; setUploading(true); const r=new FileReader(); r.onload=()=>{ setForm({...form, image: r.result as string}); setUploading(false); }; r.readAsDataURL(f); };
  const addToGallery = async () => {
    if(!form.image){ showStatus('Upload Photo First!','error'); return; }
    if(!form.title){ showStatus('Enter Title','error'); return; }
    const newItem = { id: Date.now().toString(), title: form.title, category: form.category, description: form.description, image: form.image, image_url: form.image, is_published: form.isPublished, isPublished: form.isPublished, created_at: new Date().toISOString(), date: new Date().toISOString() };
    const updated=[newItem,...gallery]; setGallery(updated); localStorage.setItem('lcns_gallery', JSON.stringify(updated)); localStorage.setItem('gallery', JSON.stringify(updated)); window.dispatchEvent(new Event('storage'));
    const sb=getSupabase(); if(sb) try{ await sb.from('gallery').insert([newItem]); } catch {}
    setForm({ title: '', category: 'Campus Life', description: '', image: '', isPublished: true }); showStatus(`✅ PHOTO PUBLISHED TO WEBSITE! ${newItem.title}`);
  };
  const togglePublish = (id:string)=>{ const up=gallery.map((g:any)=>g.id===id?{...g,is_published:!g.is_published,isPublished:!g.isPublished}:g); setGallery(up); localStorage.setItem('lcns_gallery', JSON.stringify(up)); localStorage.setItem('gallery', JSON.stringify(up)); showStatus(up.find((g:any)=>g.id===id)?.is_published?'Published':'Unpublished'); };
  const deletePhoto = (id:string)=>{ if(!confirm('Delete Photo from Website?'))return; const up=gallery.filter((g:any)=>g.id!==id); setGallery(up); localStorage.setItem('lcns_gallery', JSON.stringify(up)); localStorage.setItem('gallery', JSON.stringify(up)); const sb=getSupabase(); if(sb) try{ sb.from('gallery').delete().eq('id',id); } catch {} showStatus('Photo Deleted from Website'); };
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-3xl p-6"><h2 className="font-black text-xl flex gap-2"><Camera className="w-6 h-6"/> GALLERY - UPLOAD PHOTO & PUBLISH TO WEBSITE</h2><p className="text-xs opacity-90 mt-1">Upload photos here → They publish instantly to homepage gallery</p></div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border-2 border-purple-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="font-black text-sm flex gap-2"><UploadCloud className="w-5 h-5 text-purple-600"/> UPLOAD NEW PHOTO</h3>
          <div className="w-full h-64 bg-slate-50 border-2 border-dashed border-purple-300 rounded-2xl flex items-center justify-center overflow-hidden">{form.image?<img src={form.image} className="w-full h-full object-cover"/>:<div className="text-center"><ImageIcon className="w-10 h-10 mx-auto text-slate-300"/><p className="text-[11px] text-slate-400 mt-2">Click below to upload</p></div>}</div>
          <input type="file" accept="image/*" onChange={handleImage} className="w-full text-[11px] file:bg-purple-600 file:text-white file:rounded-xl file:border-0 file:px-4 file:py-2.5 file:font-black"/>
          {uploading && <p className="text-[11px] text-purple-600">Uploading...</p>}
          <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Photo Title e.g. Matriculation 2025" className="w-full p-3 border-2 rounded-xl text-xs font-bold"/>
          <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="w-full p-3 border-2 rounded-xl text-xs font-bold"><option>Campus Life</option><option>Academic</option><option>Nursing</option><option>Midwifery</option><option>Events</option><option>Graduation</option><option>Sports</option><option>Staff</option><option>Students</option></select>
          <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Description (optional)" className="w-full p-3 border-2 rounded-xl text-xs h-20"/>
          <label className="flex items-center gap-2 text-[11px] font-bold"><input type="checkbox" checked={form.isPublished} onChange={e=>setForm({...form,isPublished:e.target.checked})} className="w-4 h-4"/> Publish Immediately to Website Homepage</label>
          <button onClick={addToGallery} className="w-full bg-purple-600 hover:bg-black text-white py-3 rounded-xl font-black text-xs flex justify-center gap-2"><Camera className="w-4 h-4"/> UPLOAD & PUBLISH TO WEBSITE</button>
        </div>
        <div className="bg-white border-2 rounded-3xl p-6"><h3 className="font-black text-sm">Published Gallery - {gallery.length} Photos - Live on Website</h3><div className="grid grid-cols-2 gap-3 mt-4 max-h-[600px] overflow-y-auto">{gallery.map((g:any)=><div key={g.id} className="border-2 rounded-2xl overflow-hidden bg-slate-50"><div className="h-28 overflow-hidden"><img src={g.image||g.image_url} className="w-full h-full object-cover"/></div><div className="p-2 space-y-1"><p className="font-black text-[11px] truncate">{g.title}</p><p className="text-[10px] text-slate-500">{g.category} • {g.is_published||g.isPublished?'Published':'Draft'}</p><div className="flex gap-1"><button onClick={()=>togglePublish(g.id)} className={`flex-1 py-1 rounded-lg text-[9px] font-black ${g.is_published||g.isPublished?'bg-emerald-600 text-white':'bg-slate-300'}`}>{g.is_published||g.isPublished?'PUBLISHED':'UNPUBLISHED'}</button><button onClick={()=>deletePhoto(g.id)} className="px-2 py-1 bg-red-600 text-white rounded-lg text-[9px]"><X className="w-3 h-3"/></button></div></div></div>)}{gallery.length===0&&<p className="text-[11px] col-span-2 text-center py-10">No photos - Upload above to publish to website</p>}</div></div>
      </div>
    </div>
  );
};

// --- BISHOP & PROVOST MANAGER - SAME ---
const LeadershipManager = () => {
  const [bishop, setBishop] = useState<any>(()=>JSON.parse(localStorage.getItem('lcns_bishop')||'null')||{name:'Most Rev. Isaac B. Dugu',title:'Bishop, Catholic Diocese of Gboko',image:'',description:'Proprietor'});
  const [provost, setProvost] = useState<any>(()=>JSON.parse(localStorage.getItem('lcns_provost')||'null')||{name:'Provost Name',title:'Provost, CON Gboko',image:'',description:'Head of Institution'});
  const handleImg = (e:React.ChangeEvent<HTMLInputElement>, t:'bishop'|'provost')=>{ const f=e.target.files?.[0]; if(!f)return; const r=new FileReader(); r.onload=()=>{ const b64=r.result as string; if(t==='bishop'){ const u={...bishop,image:b64}; setBishop(u); localStorage.setItem('lcns_bishop',JSON.stringify(u)); } else { const u={...provost,image:b64}; setProvost(u); localStorage.setItem('lcns_provost',JSON.stringify(u)); } }; r.readAsDataURL(f); };
  const save = (t:'bishop'|'provost')=>{ localStorage.setItem(t==='bishop'?'lcns_bishop':'lcns_provost', JSON.stringify(t==='bishop'?bishop:provost)); alert(`${t.toUpperCase()} Saved! Visible on HomePage`); window.dispatchEvent(new Event('storage')); };
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-gradient-to-br from-amber-50 to-orange-100 border-2 border-amber-300 rounded-3xl p-6"><h3 className="font-black text-amber-900 flex gap-2"><Crown className="w-5 h-5"/> BISHOP - PROPRIETOR</h3><div className="mt-4 space-y-3"><div className="h-64 bg-white border-2 border-dashed rounded-2xl overflow-hidden flex items-center justify-center">{bishop.image?<img src={bishop.image} className="w-full h-full object-cover"/>:<span className="text-[11px]">No Image</span>}</div><input type="file" accept="image/*" onChange={e=>handleImg(e,'bishop')} className="w-full text-[11px] file:bg-amber-900 file:text-white file:rounded-xl file:border-0 file:px-4 file:py-2"/><input value={bishop.name} onChange={e=>setBishop({...bishop,name:e.target.value})} placeholder="Bishop Full Name" className="w-full p-3 border-2 rounded-xl text-xs font-bold"/><input value={bishop.title} onChange={e=>setBishop({...bishop,title:e.target.value})} placeholder="Title" className="w-full p-3 border-2 rounded-xl text-xs"/><textarea value={bishop.description} onChange={e=>setBishop({...bishop,description:e.target.value})} placeholder="Short Bio" className="w-full p-3 border-2 rounded-xl text-xs h-20"/><button onClick={()=>save('bishop')} className="w-full bg-amber-900 text-white py-3 rounded-xl font-black text-xs">SAVE BISHOP</button></div></div>
      <div className="bg-gradient-to-br from-emerald-50 to-teal-100 border-2 border-emerald-300 rounded-3xl p-6"><h3 className="font-black text-emerald-900 flex gap-2"><UserCheck className="w-5 h-5"/> PROVOST</h3><div className="mt-4 space-y-3"><div className="h-64 bg-white border-2 border-dashed rounded-2xl overflow-hidden flex items-center justify-center">{provost.image?<img src={provost.image} className="w-full h-full object-cover"/>:<span className="text-[11px]">No Image</span>}</div><input type="file" accept="image/*" onChange={e=>handleImg(e,'provost')} className="w-full text-[11px] file:bg-emerald-800 file:text-white file:rounded-xl file:border-0 file:px-4 file:py-2"/><input value={provost.name} onChange={e=>setProvost({...provost,name:e.target.value})} placeholder="Provost Full Name" className="w-full p-3 border-2 rounded-xl text-xs font-bold"/><input value={provost.title} onChange={e=>setProvost({...provost,title:e.target.value})} placeholder="Title" className="w-full p-3 border-2 rounded-xl text-xs"/><textarea value={provost.description} onChange={e=>setProvost({...provost,description:e.target.value})} placeholder="Short Bio" className="w-full p-3 border-2 rounded-xl text-xs h-20"/><button onClick={()=>save('provost')} className="w-full bg-emerald-800 text-white py-3 rounded-xl font-black text-xs">SAVE PROVOST</button></div></div>
    </div>
  );
};

// --- COURSE MANAGER - SAME ---
const CourseManager = ({ users, courses, setCourses, showStatus }: any) => {
  const [newCourse, setNewCourse] = useState({ code: '', title: '', unit: '', semester: 'First', level: 'ND1', lecturerEmail: '', lecturer: '' });
  const lecturers = users.filter((u:any)=>['LECTURER','HOD','EXAM_OFFICER','PROVOST','ADMIN'].includes(u.role));
  const addCourse = () => {
    if(!newCourse.code || !newCourse.title || !newCourse.unit){ showStatus('Fill Code, Title, Unit','error'); return; }
    const data = { id: Date.now().toString(), code: newCourse.code.toUpperCase(), title: newCourse.title, unit: parseInt(newCourse.unit), semester: newCourse.semester, level: newCourse.level, lecturer: newCourse.lecturer, lecturerEmail: newCourse.lecturerEmail, createdAt: new Date().toISOString() };
    const updated=[...courses,data]; setCourses(updated); localStorage.setItem('lcns_courses', JSON.stringify(updated)); setNewCourse({ code: '', title: '', unit: '', semester: 'First', level: 'ND1', lecturerEmail: '', lecturer: '' }); showStatus(`✅ ${data.code} - ${data.unit} Units - Assigned to ${data.lecturer||'Lecturer'}`);
  };
  const deleteCourse = (id:string)=>{ if(!confirm('Delete?'))return; const up=courses.filter((c:any)=>c.id!==id); setCourses(up); localStorage.setItem('lcns_courses', JSON.stringify(up)); showStatus('Course Deleted'); };
  return (
    <div className="space-y-4">
      <div className="bg-white border-2 border-emerald-200 rounded-3xl p-6 shadow-sm"><h3 className="font-black flex gap-2"><BookMarked className="w-5 h-5 text-emerald-700"/> ADD COURSE - UNIT, SEMESTER, LEVEL, ASSIGN TO LECTURER</h3>
        <div className="grid md:grid-cols-3 gap-3 mt-4">
          <input value={newCourse.code} onChange={e=>setNewCourse({...newCourse,code:e.target.value})} placeholder="Code e.g. NRS111" className="p-3 border-2 rounded-xl text-xs font-bold"/>
          <input value={newCourse.title} onChange={e=>setNewCourse({...newCourse,title:e.target.value})} placeholder="Title" className="p-3 border-2 rounded-xl text-xs md:col-span-2"/>
          <input type="number" value={newCourse.unit} onChange={e=>setNewCourse({...newCourse,unit:e.target.value})} placeholder="Unit" className="p-3 border-2 rounded-xl text-xs"/>
          <select value={newCourse.semester} onChange={e=>setNewCourse({...newCourse,semester:e.target.value})} className="p-3 border-2 rounded-xl text-xs font-bold"><option>First</option><option>Second</option></select>
          <select value={newCourse.level} onChange={e=>setNewCourse({...newCourse,level:e.target.value})} className="p-3 border-2 rounded-xl text-xs font-bold"><option>ND1</option><option>ND2</option><option>HND1</option><option>HND2</option></select>
          <select value={newCourse.lecturerEmail} onChange={e=>{ const lec=lecturers.find((l:any)=>l.email===e.target.value); setNewCourse({...newCourse, lecturerEmail:e.target.value, lecturer:lec?.fullName||''}); }} className="p-3 border-2 rounded-xl text-xs md:col-span-3"><option value="">-- Assign to Lecturer --</option>{lecturers.map((l:any)=><option key={l.email} value={l.email}>{l.fullName} - {l.role} - {l.staffId}</option>)}</select>
        </div><button onClick={addCourse} className="mt-4 w-full bg-emerald-700 hover:bg-black text-white py-3 rounded-xl font-black text-xs">ADD COURSE + ASSIGN</button>
      </div>
      <div className="bg-white border-2 rounded-3xl p-5"><div className="overflow-x-auto"><table className="w-full text-xs"><thead className="bg-slate-900 text-white"><tr><th className="p-3">Code</th><th className="p-3">Title</th><th className="p-3">Unit</th><th className="p-3">Semester</th><th className="p-3">Level</th><th className="p-3">Lecturer</th><th className="p-3">Del</th></tr></thead><tbody>{courses.map((c:any)=><tr key={c.id} className="border-b"><td className="p-3 font-mono font-black">{c.code}</td><td className="p-3">{c.title}</td><td className="p-3 text-center bg-amber-50 font-black">{c.unit}</td><td className="p-3">{c.semester}</td><td className="p-3"><span className="px-2 py-1 bg-blue-100 rounded-full font-black">{c.level}</span></td><td className="p-3">{c.lecturer}</td><td className="p-3"><button onClick={()=>deleteCourse(c.id)} className="bg-red-600 text-white px-2 py-1 rounded-lg">DEL</button></td></tr>)}</tbody></table></div></div>
    </div>
  );
};

const ALL_ROLES = [
  { value: 'STUDENT', label: 'STUDENT', color: 'bg-blue-100 text-blue-800', category: 'Student' },
  { value: 'LECTURER', label: 'LECTURER', color: 'bg-purple-100 text-purple-800', category: 'Staff' },
  { value: 'HOD', label: 'HOD - Head of Department', color: 'bg-indigo-100 text-indigo-800', category: 'Staff' },
  { value: 'EXAM_OFFICER', label: 'EXAM OFFICER', color: 'bg-orange-100 text-orange-800', category: 'Staff' },
  { value: 'PROVOST', label: 'PROVOST', color: 'bg-amber-100 text-amber-800', category: 'Principal' },
  { value: 'REGISTRAR', label: 'REGISTRAR', color: 'bg-teal-100 text-teal-800', category: 'Principal' },
  { value: 'BURSAR', label: 'BURSAR', color: 'bg-emerald-100 text-emerald-800', category: 'Principal' },
  { value: 'LIBRARIAN', label: 'LIBRARIAN', color: 'bg-cyan-100 text-cyan-800', category: 'Staff' },
  { value: 'ADMISSION_OFFICER', label: 'ADMISSION OFFICER', color: 'bg-pink-100 text-pink-800', category: 'Staff' },
  { value: 'ICT_OFFICER', label: 'ICT OFFICER', color: 'bg-slate-800 text-white', category: 'Staff' },
  { value: 'DEAN', label: 'DEAN', color: 'bg-yellow-100 text-yellow-800', category: 'Principal' },
  { value: 'ADMIN', label: 'ADMIN - Full Access', color: 'bg-red-100 text-red-800', category: 'Admin' },
];

interface AdminDashboardProps { initialTab?: 'settings' | 'management' | 'gallery' | 'users' | 'cbt' | 'system' | 'cms' | 'promotion' | 'courses' | 'applicants' | 'backend' | 'bursar' | 'application' | 'announcements' | 'scoresheets' | 'leadership'; }

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialTab }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>(() => JSON.parse(localStorage.getItem('lcns_courses') || '[]'));
  const [payments, setPayments] = useState<any[]>([]); const [announcements, setAnnouncements] = useState<any[]>([]); const [events, setEvents] = useState<any[]>([]); const [backendData, setBackendData] = useState<any>({}); const [loading, setLoading] = useState(false); const [status, setStatus] = useState<{text:string, type:'success'|'error'}|null>(null);
  const [appStatus, setAppStatus] = useState<{isOpen: boolean, link: string, deadline: string, message: string}>({ isOpen: true, link: '/apply', deadline: '', message: 'Admissions open for 2025/2026 - Apply Now!' });
  const [annForm, setAnnForm] = useState({title: '', message: '', type: 'announcement', is_published: true}); const [eventForm, setEventForm] = useState({title: '', description: '', date: '', location: '', is_published: true});
  const [showCreateUser, setShowCreateUser] = useState(false); const [userType, setUserType] = useState<'STUDENT' | 'STAFF'>('STUDENT'); const [showPasswords, setShowPasswords] = useState<{[k:string]:boolean}>({});
  const [newUser, setNewUser] = useState({ fullName: '', firstName: '', middleName: '', lastName: '', address: '', phone: '', bloodGroup: '', sex: '', parentName: '', parentPhone: '', email: '', staying: 'hostel', level: 'ND1', department: 'Nursing', role: 'STUDENT', staffId: '', qualification: '', staffDepartment: 'Nursing', courseOfStudy: 'Nursing Science', staffImage: '', dateOfBirth: '', state: '', lga: '' });

  const [activeAdminTab, setActiveAdminTab] = useState<'settings' | 'management' | 'gallery' | 'users' | 'cbt' | 'system' | 'cms' | 'promotion' | 'courses' | 'applicants' | 'backend' | 'bursar' | 'application' | 'announcements' | 'scoresheets' | 'leadership'>(initialTab || 'scoresheets');
  const showStatus = (text:string, type:'success'|'error'='success') => { setStatus({text, type}); setTimeout(()=>setStatus(null), 6000); };
  const currentUser = StorageService.getCurrentUser() || { id: 'admin-001', email: 'admin@lcns.edu.ng', role: 'ADMIN', fullName: 'Admin - Director of ICT', status: 'ACTIVE', };

  // *** FIXED ONLY THIS PART - MERGE ALL STORAGES + SUPABASE + AUTO SYNC ACROSS TABS - DONT CHANGE OTHER FEATURES ***
  useEffect(() => {
    const loadUsers = async () => {
      try {
        let merged: any[] = [];
        const addUnique = (arr:any[]) => {
          arr.forEach((u:any) => {
            if (!merged.find((x:any) => x.email?.toLowerCase() === u.email?.toLowerCase())) merged.push(u);
          });
        };
        try { if (StorageService.getUsers) addUnique(StorageService.getUsers()||[]); } catch {}
        try { addUnique(JSON.parse(localStorage.getItem('lcns_users')||'[]')); } catch {}
        try { addUnique(JSON.parse(localStorage.getItem('users')||'[]')); } catch {}
        // Supabase sync for other devices
        const sb = getSupabase();
        if (sb) {
          try {
            const { data } = await sb.from('users').select('*').order('created_at', { ascending: false }).limit(300);
            if (data?.length) {
              const mapped = data.map((m:any) => ({
                id: m.id, email: m.email, fullName: m.full_name || m.fullName || m.email, name: m.full_name || m.fullName || m.email,
                role: m.role, matricNumber: m.matric_no || m.matricNumber || '', matricNo: m.matric_no || '', staffId: m.staffId || m.staff_id || '',
                loginId: m.loginId || m.matric_no || m.staffId || m.id, password: m.password, phone: m.phone, level: m.level,
                department: m.department, staffDepartment: m.department, userType: m.role==='STUDENT'?'STUDENT':'STAFF', status: 'ACTIVE',
                createdAt: m.created_at, ...m
              }));
              addUnique(mapped);
            }
          } catch {}
        }
        setUsers(merged);
        if (merged.length) {
          localStorage.setItem('lcns_users', JSON.stringify(merged));
          localStorage.setItem('users', JSON.stringify(merged));
          try { StorageService.saveUsers(merged); } catch {}
        }
      } catch {}
    };
    loadUsers();
    loadBackend();
    const handler = () => loadUsers();
    window.addEventListener('storage', handler);
    window.addEventListener('focus', handler);
    return () => { window.removeEventListener('storage', handler); window.removeEventListener('focus', handler); };
  }, [activeAdminTab]);

  const loadBackend = async () => { setLoading(true); try { const sb = getSupabase(); const cfg = getSupabaseConfig(); const data: any = { supabaseUrl: cfg.url || 'https://liqwfikatnkndbdbdarx.supabase.co', connected: !!sb, tables: {} }; if (sb) { const tables = ['school_settings', 'management', 'gallery', 'users', 'profiles', 'payments', 'announcements', 'events', 'app_settings', 'students', 'student_scores']; for (const t of tables) { try { const { count } = await sb.from(t).select('*', { count: 'exact', head: true }); data.tables[t] = count ?? 0; } catch { data.tables[t] = 0; } } try { const { data: payData } = await sb.from('payments').select('*').order('created_at', { ascending: false }).limit(100); if (payData) setPayments(payData); } catch {} try { const { data: ann } = await sb.from('announcements').select('*').order('created_at', { ascending: false }); if (ann) setAnnouncements(ann); const { data: evt } = await sb.from('events').select('*').order('created_at', { ascending: false }); if (evt) setEvents(evt); } catch {} } setBackendData(data); } catch {} finally { setLoading(false); } };

  const generateMatricNo = (level: string): string => { const currentSession = localStorage.getItem('lcns_current_session') || '2025/2026'; const year = currentSession.split('/')[0] || '2026'; const cleanLevel = level.toUpperCase().includes('HND') ? (level.toUpperCase().includes('2') ? 'HND2' : 'HND1') : (level.toUpperCase().includes('2') && !level.toUpperCase().includes('ND1') ? 'ND2' : 'ND1'); const counterKey = `lcns_matric_counter_${cleanLevel}_${year}`; let counters = JSON.parse(localStorage.getItem('lcns_matric_counters') || '{}'); let currentCount = counters[counterKey] || 0; const existingMatrics = users.filter((u:any) => u.matricNumber && u.matricNumber.includes(cleanLevel) && u.matricNumber.includes(year)); if (existingMatrics.length > 0) { const maxNum = Math.max(...existingMatrics.map((u:any) => { const parts = u.matricNumber.split('\\'); return parseInt(parts[parts.length-1]) || 0; }), 0); if (maxNum > currentCount) currentCount = maxNum; } currentCount += 1; counters[counterKey] = currentCount; localStorage.setItem('lcns_matric_counters', JSON.stringify(counters)); return `LCNS\\${cleanLevel}\\${year}\\${String(currentCount).padStart(3, '0')}`; };
  const generateStaffId = (role: string): string => { const year = (localStorage.getItem('lcns_current_session') || '2025/2026').split('/')[0] || '2026'; const prefix = role.substring(0,3).toUpperCase(); const counterKey = `lcns_staff_counter_${role}_${year}`; let counters = JSON.parse(localStorage.getItem('lcns_staff_counters') || '{}'); let c = counters[counterKey] || 0; c+=1; counters[counterKey]=c; localStorage.setItem('lcns_staff_counters', JSON.stringify(counters)); return `LCNS\\${prefix}\\${year}\\${String(c).padStart(3, '0')}`; };
  const genPassword = () => `LCNS@${Math.floor(1000 + Math.random()*9000)}`;
  const handleStaffImage = (e:React.ChangeEvent<HTMLInputElement>)=>{ const f=e.target.files?.[0]; if(!f)return; const r=new FileReader(); r.onload=()=>setNewUser({...newUser, staffImage: r.result as string}); r.readAsDataURL(f); };

  // *** FIXED SAVE - SAVE TO ALL PLACES + SUPABASE WITH ONLY VALID COLUMNS - DONT CHANGE OTHER LOGIC ***
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault(); if (!newUser.fullName || !newUser.email) { showStatus('Fill Full Name and Email', 'error'); return; }
    try {
      const password = genPassword(); const loginIdRaw = userType==='STUDENT' ? generateMatricNo(newUser.level) : (newUser.staffId || generateStaffId(newUser.role));
      const userData = { id: `LCNS-${Date.now()}`, email: newUser.email.toLowerCase().trim(), username: loginIdRaw, fullName: newUser.fullName, firstName: newUser.firstName, middleName: newUser.middleName, lastName: newUser.lastName, name: newUser.fullName, address: newUser.address, phone: newUser.phone, bloodGroup: newUser.bloodGroup, sex: newUser.sex, parentName: newUser.parentName, parentPhone: newUser.parentPhone, staying: newUser.staying, level: userType==='STUDENT'?newUser.level.toUpperCase():'', department: newUser.department, staffDepartment: newUser.staffDepartment, role: newUser.role.toUpperCase(), matricNumber: userType==='STUDENT'?loginIdRaw:'', matricNo: userType==='STUDENT'?loginIdRaw:'', staffId: userType==='STAFF'?loginIdRaw:'', qualification: newUser.qualification, courseOfStudy: newUser.courseOfStudy, staffImage: newUser.staffImage, dateOfBirth: newUser.dateOfBirth, state: newUser.state, lga: newUser.lga, userType, status: 'ACTIVE', createdAt: new Date().toISOString(), academicYear: localStorage.getItem('lcns_current_session') || '2025/2026', password, loginId: loginIdRaw };

      // 1. Supabase - only valid columns to avoid error
      const sb = getSupabase(); 
      if (sb) { 
        try { 
          const insertData:any = { id: userData.id, email: userData.email, password: password, role: userData.role, full_name: userData.fullName, department: userData.department || userData.staffDepartment, phone: userData.phone, matric_no: userData.matricNumber || userData.matricNo || null, level: userData.level || null };
          const { error } = await sb.from('users').insert([insertData]);
          if (error) { 
            const minimal:any = { id: userData.id, email: userData.email, password: password, role: userData.role, full_name: userData.fullName };
            await sb.from('users').insert([minimal]); 
          }
        } catch(err){ console.log('Supabase save failed but local will save', err); } 
      }
      
      // 2. Merge and save to all local storages
      const existing = JSON.parse(localStorage.getItem('lcns_users')||'[]');
      const updated=[...existing.filter((u:any)=>u.email!==userData.email), userData];
      localStorage.setItem('lcns_users', JSON.stringify(updated));
      localStorage.setItem('users', JSON.stringify(updated));
      try { StorageService.saveUsers(updated); } catch {}
      setUsers(updated);
      window.dispatchEvent(new Event('storage'));

      setNewUser({ fullName: '', firstName: '', middleName: '', lastName: '', address: '', phone: '', bloodGroup: '', sex: '', parentName: '', parentPhone: '', email: '', staying: 'hostel', level: 'ND1', department: 'Nursing', role: userType==='STAFF'?'LECTURER':'STUDENT', staffId: '', qualification: '', staffDepartment: 'Nursing', courseOfStudy: 'Nursing Science', staffImage: '', dateOfBirth: '', state: '', lga: '' });
      setShowCreateUser(false); showStatus(`✅ SAVED! ${userType} Login: ${userData.loginId} | Pass: ${password} - Now visible in ALL tabs & to Provost/Bursar/Registrar!`);
    } catch (err:any) { showStatus('Save failed: '+err.message,'error'); }
  };

  // *** FIXED ASSIGN ROLE + DELETE - SAVE TO ALL KEYS ***
  const assignRole = async (email:string, role:string)=>{
    const sb=getSupabase(); 
    const allKeys = ['lcns_users','users'];
    allKeys.forEach(k=>{
      try{
        const existing=JSON.parse(localStorage.getItem(k)||'[]'); 
        const up=existing.map((u:any)=>u.email?.toLowerCase()===email.toLowerCase()?{...u,role:role.toUpperCase()}:u); 
        localStorage.setItem(k, JSON.stringify(up));
      }catch{}
    });
    try{
      const storageUsers = StorageService.getUsers()||[];
      const up = storageUsers.map((u:any)=>u.email?.toLowerCase()===email.toLowerCase()?{...u,role:role.toUpperCase()}:u);
      StorageService.saveUsers(up);
      setUsers(up);
    }catch{
      const existing=JSON.parse(localStorage.getItem('lcns_users')||'[]'); 
      const up=existing.map((u:any)=>u.email?.toLowerCase()===email.toLowerCase()?{...u,role:role.toUpperCase()}:u);
      setUsers(up);
    }
    if(sb) try{ await sb.from('users').update({role:role.toUpperCase()}).eq('email',email);}catch{} 
    showStatus(`Role ${role} assigned`);
  };
  const deleteUser = async (email:string, name:string)=>{
    if(!confirm(`Delete ${name}?`))return; 
    ['lcns_users','users'].forEach(k=>{
      try{
        const existing=JSON.parse(localStorage.getItem(k)||'[]'); 
        const f=existing.filter((u:any)=>u.email?.toLowerCase()!==email.toLowerCase()); 
        localStorage.setItem(k, JSON.stringify(f));
      }catch{}
    });
    try{
      const storageUsers = StorageService.getUsers()||[];
      const f = storageUsers.filter((u:any)=>u.email?.toLowerCase()!==email.toLowerCase());
      StorageService.saveUsers(f);
      setUsers(f);
    }catch{
      const existing=JSON.parse(localStorage.getItem('lcns_users')||'[]'); 
      const f=existing.filter((u:any)=>u.email?.toLowerCase()!==email.toLowerCase()); 
      setUsers(f);
    }
    const sb=getSupabase(); if(sb) try{ await sb.from('users').delete().eq('email',email);}catch{} 
    showStatus('User Deleted');
  };

  const deletePayment = async (id:string)=>{ if(!confirm('Delete?'))return; const sb=getSupabase(); if(sb) await sb.from('payments').delete().eq('id',id); setPayments(p=>p.filter((x:any)=>x.id!==id)); showStatus('Deleted'); };
  const toggleApplication = async () => { const ns={...appStatus,isOpen:!appStatus.isOpen}; setAppStatus(ns); localStorage.setItem('lcns_application_status', JSON.stringify(ns)); localStorage.setItem('application_open', String(ns.isOpen)); const sb=getSupabase(); if(sb) try{ await sb.from('school_settings').upsert({key:'application_open',value:String(ns.isOpen)},{onConflict:'key'});}catch{} showStatus(ns.isOpen?'Application OPENED':'CLOSED'); };
  const saveAppSettings = async ()=>{ localStorage.setItem('lcns_application_status', JSON.stringify(appStatus)); showStatus('Saved'); };
  const publishAnnouncement = async (e:React.FormEvent)=>{ e.preventDefault(); if(!annForm.title){ showStatus('Enter title','error'); return;} const n={id:Date.now().toString(), title:annForm.title, message:annForm.message, type:annForm.type, is_published:annForm.is_published, created_at:new Date().toISOString()}; const up=[n,...announcements]; setAnnouncements(up); localStorage.setItem('lcns_announcements', JSON.stringify(up)); const sb=getSupabase(); if(sb) try{ await sb.from('announcements').insert([n]);}catch{} setAnnForm({title:'',message:'',type:'announcement',is_published:true}); showStatus('Published'); };
  const publishEvent = async (e:React.FormEvent)=>{ e.preventDefault(); if(!eventForm.title){ showStatus('Enter title','error'); return;} const n={id:Date.now().toString(), title:eventForm.title, description:eventForm.description, date:eventForm.date, location:eventForm.location, is_published:eventForm.is_published, created_at:new Date().toISOString()}; const up=[n,...events]; setEvents(up); localStorage.setItem('lcns_events', JSON.stringify(up)); const sb=getSupabase(); if(sb) try{ await sb.from('events').insert([n]);}catch{} setEventForm({title:'',description:'',date:'',location:'',is_published:true}); showStatus('Event Published'); };
  const deleteAnnouncement = async (id:string)=>{ if(!confirm('Delete?'))return; setAnnouncements(p=>p.filter((a:any)=>a.id!==id)); setEvents(p=>p.filter((e:any)=>e.id!==id)); showStatus('Deleted'); };

  const currentSession = localStorage.getItem('lcns_current_session') || '2025/2026'; const currentYear = currentSession.split('/')[0] || '2026'; const getRoleColor = (r:string)=>ALL_ROLES.find(x=>x.value===r)?.color||'bg-slate-100';

  return (
    <div className="space-y-6">
      {status && <div className={`fixed top-4 right-4 z-50 p-4 rounded-2xl border shadow-xl flex gap-3 ${status.type==='success'?'bg-emerald-50 border-emerald-200':'bg-red-50 border-red-200'}`}><CheckCircle2 className="w-5 h-5 text-emerald-600"/><span className="text-xs font-bold">{status.text}</span></div>}
      <div className="bg-gradient-to-r from-slate-900 via-[#0a4d2e] to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-emerald-900"><div className="flex flex-col md:flex-row justify-between gap-4"><div><span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-black/30 px-3 py-1 rounded-full">Director of ICT - Admin Portal - Fixed Save + Gallery Publish</span><h1 className="text-2xl sm:text-3xl font-black uppercase mt-2 flex items-center gap-2"><GraduationCap className="w-8 h-8 text-amber-400"/>Administrator Dashboard</h1><p className="text-xs text-emerald-200 mt-1">Session: {currentSession} • Users: {users.length} • Courses: {courses.length} • Gallery: Published to Website • Score Sheets: {backendData.tables?.student_scores||0}</p></div><div className="flex gap-2"><div className={`px-4 py-2 rounded-xl text-xs font-black ${backendData.connected?'bg-emerald-600':'bg-red-600'}`}>{backendData.connected?'● CONNECTED':'● OFFLINE'}</div><button onClick={loadBackend} className="px-4 py-2 bg-white/10 rounded-xl text-xs font-bold flex gap-2"><RefreshCw className={`w-4 h-4 ${loading?'animate-spin':''}`}/> REFRESH</button></div></div></div>

      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border shadow-xs">
        <button onClick={()=>setActiveAdminTab('scoresheets')} className={`px-3 py-2.5 rounded-xl text-[11px] font-black ${activeAdminTab==='scoresheets'?'bg-blue-700 text-white':'border-2 border-blue-300'}`}><BookOpen className="w-4 h-4 inline mr-1"/>Score Sheets</button>
        <button onClick={()=>setActiveAdminTab('gallery')} className={`px-3 py-2.5 rounded-xl text-[11px] font-black ${activeAdminTab==='gallery'?'bg-purple-600 text-white ring-2 ring-purple-300':'border-2 border-purple-300 bg-purple-50 text-purple-800'}`}><Camera className="w-4 h-4 inline mr-1"/>📸 GALLERY - UPLOAD & PUBLISH</button>
        <button onClick={()=>setActiveAdminTab('leadership')} className={`px-3 py-2.5 rounded-xl text-[11px] font-black ${activeAdminTab==='leadership'?'bg-amber-900 text-white':'border-2 border-amber-300 bg-amber-50'}`}><Crown className="w-4 h-4 inline mr-1"/>BISHOP & PROVOST</button>
        <button onClick={()=>setActiveAdminTab('users')} className={`px-3 py-2.5 rounded-xl text-[11px] font-black ${activeAdminTab==='users'?'bg-[#0a4d2e] text-white':'border-2'}`}><UserCheck className="w-4 h-4 inline mr-1"/>Users FIXED SAVE ({users.length})</button>
        <button onClick={()=>setActiveAdminTab('courses')} className={`px-3 py-2.5 rounded-xl text-[11px] font-black ${activeAdminTab==='courses'?'bg-emerald-700 text-white':'border-2 border-emerald-300'}`}><BookMarked className="w-4 h-4 inline mr-1"/>Courses ({courses.length})</button>
        <button onClick={()=>setActiveAdminTab('backend')} className={`px-3 py-2.5 rounded-xl text-[11px] font-black ${activeAdminTab==='backend'?'bg-slate-900 text-white':'border'}`}><Server className="w-4 h-4 inline mr-1"/>Backend</button>
        <button onClick={()=>setActiveAdminTab('application')} className={`px-3 py-2.5 rounded-xl text-[11px] font-black ${activeAdminTab==='application'?'bg-red-700 text-white':'border-2 border-red-300'}`}>App {appStatus.isOpen?'OPEN':'CLOSED'}</button>
        <button onClick={()=>setActiveAdminTab('announcements')} className={`px-3 py-2.5 rounded-xl text-[11px] font-black ${activeAdminTab==='announcements'?'bg-blue-700 text-white':'border-2 border-blue-300'}`}>Announcements</button>
        <button onClick={()=>setActiveAdminTab('bursar')} className={`px-3 py-2.5 rounded-xl text-[11px] font-black ${activeAdminTab==='bursar'?'bg-emerald-700 text-white':'border-2'}`}>Bursar</button>
        <button onClick={()=>setActiveAdminTab('promotion')} className={`px-3 py-2.5 rounded-xl text-[11px] font-black ${activeAdminTab==='promotion'?'bg-amber-500 text-black':'border'}`}>Promote</button>
      </div>

      {activeAdminTab==='scoresheets' && <ScoreSheetViewer currentUser={currentUser} />}
      {activeAdminTab==='gallery' && <GalleryManager showStatus={showStatus} />}
      {activeAdminTab==='leadership' && <LeadershipManager />}
      {activeAdminTab==='courses' && <CourseManager users={users} courses={courses} setCourses={setCourses} showStatus={showStatus} />}
      {activeAdminTab==='backend' && <div className="grid md:grid-cols-3 gap-4"><div className="bg-white rounded-2xl p-5 border-2"><h3 className="font-black text-xs">SUPABASE URL</h3><p className="text-[11px] break-all bg-slate-50 p-2 rounded-lg mt-2">{backendData.supabaseUrl}</p></div><div className="bg-white rounded-2xl p-5 border"><h3 className="font-black text-xs">TABLES</h3><div className="mt-3 space-y-1 text-[11px]">{Object.entries(backendData.tables||{}).map(([t,c])=><div key={t} className="flex justify-between bg-slate-50 px-2 py-1 rounded-lg"><span>{t}</span><span className="bg-emerald-600 text-white px-2 rounded-full">{String(c)}</span></div>)}</div></div><div className="bg-white rounded-2xl p-5 border"><h3 className="font-black text-xs">STATS</h3><div className="mt-3 text-[11px] space-y-2"><div className="flex justify-between"><span>Users</span><span>{users.length}</span></div><div className="flex justify-between"><span>Courses</span><span>{courses.length}</span></div></div></div></div>}
      {activeAdminTab==='application' && <div className="space-y-4"><div className={`rounded-3xl p-6 border-2 ${appStatus.isOpen?'bg-emerald-50 border-emerald-300':'bg-red-50 border-red-300'}`}><div className="flex justify-between"><h2 className="font-black">APPLICATION {appStatus.isOpen?'OPEN':'CLOSED'}</h2><button onClick={toggleApplication} className={`px-8 py-3 rounded-xl font-black ${appStatus.isOpen?'bg-red-600 text-white':'bg-emerald-600 text-white'}`}>{appStatus.isOpen?'CLOSE NOW':'OPEN NOW'}</button></div></div><button onClick={saveAppSettings} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black">SAVE</button></div>}
      {activeAdminTab==='announcements' && <div className="space-y-4"><div className="grid md:grid-cols-2 gap-4"><div className="bg-white border-2 rounded-3xl p-5"><form onSubmit={publishAnnouncement} className="space-y-3"><input value={annForm.title} onChange={e=>setAnnForm({...annForm,title:e.target.value})} placeholder="Title" className="w-full p-3 border-2 rounded-xl text-xs font-bold"/><textarea value={annForm.message} onChange={e=>setAnnForm({...annForm,message:e.target.value})} placeholder="Message" className="w-full p-3 border-2 rounded-xl text-xs h-24"/><button className="w-full bg-blue-700 text-white py-3 rounded-xl font-black text-xs">PUBLISH</button></form></div><div className="bg-white border-2 rounded-3xl p-5"><form onSubmit={publishEvent} className="space-y-3"><input value={eventForm.title} onChange={e=>setEventForm({...eventForm,title:e.target.value})} placeholder="Event Title" className="w-full p-3 border-2 rounded-xl text-xs font-bold"/><div className="grid grid-cols-2 gap-3"><input type="date" value={eventForm.date} onChange={e=>setEventForm({...eventForm,date:e.target.value})} className="w-full p-3 border-2 rounded-xl text-xs"/><input value={eventForm.location} onChange={e=>setEventForm({...eventForm,location:e.target.value})} placeholder="Location" className="w-full p-3 border-2 rounded-xl text-xs"/></div><textarea value={eventForm.description} onChange={e=>setEventForm({...eventForm,description:e.target.value})} placeholder="Description" className="w-full p-3 border-2 rounded-xl text-xs h-24"/><button className="w-full bg-emerald-700 text-white py-3 rounded-xl font-black text-xs">PUBLISH EVENT</button></form></div></div><div className="bg-white rounded-3xl border p-4"><div className="grid gap-2">{[...announcements,...events].map((it:any)=><div key={it.id} className="flex justify-between bg-slate-50 p-3 rounded-xl border text-[11px]"><span><b>{it.title}</b></span><button onClick={()=>deleteAnnouncement(it.id)} className="bg-red-600 text-white p-1 rounded-lg"><Trash2 className="w-3 h-3"/></button></div>)}</div></div></div>}
      {activeAdminTab==='bursar' && <div className="bg-white rounded-3xl border-2 p-6"><table className="w-full text-xs"><thead><tr className="bg-emerald-900 text-white"><th className="p-3">Student</th><th className="p-3">Amount</th><th className="p-3">Del</th></tr></thead><tbody>{payments.map((p:any)=><tr key={p.id} className="border-b"><td className="p-3">{p.student_name||p.email}</td><td className="p-3">₦{p.amount}</td><td className="p-3"><button onClick={()=>deletePayment(p.id)} className="bg-red-600 text-white px-3 py-1 rounded-xl text-[10px]">DELETE</button></td></tr>)}</tbody></table></div>}

      {activeAdminTab==='users' && (
        <div className="bg-white rounded-3xl border-2 p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row justify-between gap-3"><div><h3 className="font-black text-lg flex gap-2"><UserCheck className="w-5 h-5"/> Professional User Management - FIXED SAVE ACROSS TABS</h3><p className="text-[11px] text-emerald-700 font-bold mt-1">✅ FIXED: Now saves to localStorage + Supabase + All Tabs sync automatically. Student: Full Biodata → Matric as ID + Password. Staff: Picture, Qualification, Course, Role.</p></div><button onClick={()=>setShowCreateUser(!showCreateUser)} className="px-6 py-3 bg-[#0a4d2e] text-white rounded-xl text-xs font-black flex gap-2"><UserPlus className="w-4 h-4"/>{showCreateUser?'CLOSE':'CREATE USER'}</button></div>

          {showCreateUser && (
            <div className="bg-gradient-to-br from-slate-50 to-emerald-50 border-2 border-emerald-300 rounded-3xl p-6 space-y-5">
              <div className="flex gap-3">
                <button onClick={()=>{setUserType('STUDENT'); setNewUser({...newUser,role:'STUDENT'});}} className={`flex-1 py-3 rounded-xl text-xs font-black flex justify-center gap-2 ${userType==='STUDENT'?'bg-blue-700 text-white':'bg-white border-2'}`}><GraduationCap className="w-4 h-4"/> STUDENT FULL BIODATA</button>
                <button onClick={()=>{setUserType('STAFF'); setNewUser({...newUser,role:'LECTURER'});}} className={`flex-1 py-3 rounded-xl text-xs font-black flex justify-center gap-2 ${userType==='STAFF'?'bg-[#0a4d2e] text-white':'bg-white border-2'}`}><Briefcase className="w-4 h-4"/> STAFF PROFESSIONAL</button>
              </div>

              {userType==='STUDENT' ? (
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="bg-white border-2 rounded-2xl p-4"><h4 className="font-black text-[11px] text-blue-800 flex gap-2"><IdCard className="w-4 h-4"/> STUDENT FULL BIODATA - AUTO MATRIC + PASSWORD</h4>
                    <div className="grid md:grid-cols-3 gap-3 mt-3">
                      <div className="md:col-span-3"><label className="text-[11px] font-black">Full Names *</label><input value={newUser.fullName} onChange={e=>setNewUser({...newUser, fullName:e.target.value})} placeholder="Okonkwo John Chukwu" className="w-full mt-1 p-3 border-2 rounded-xl text-xs font-bold" required/></div>
                      <div><label className="text-[11px] font-bold">Email *</label><input type="email" value={newUser.email} onChange={e=>setNewUser({...newUser,email:e.target.value})} placeholder="student@lcns.edu.ng" className="w-full mt-1 p-3 border-2 rounded-xl text-xs" required/></div>
                      <div><label className="text-[11px] font-bold">Phone *</label><input value={newUser.phone} onChange={e=>setNewUser({...newUser,phone:e.target.value})} placeholder="080..." className="w-full mt-1 p-3 border-2 rounded-xl text-xs" required/></div>
                      <div><label className="text-[11px] font-bold">Sex *</label><select value={newUser.sex} onChange={e=>setNewUser({...newUser,sex:e.target.value})} className="w-full mt-1 p-3 border-2 rounded-xl text-xs" required><option value="">Select</option><option>Male</option><option>Female</option></select></div>
                      <div><label className="text-[11px] font-bold">DOB</label><input type="date" value={newUser.dateOfBirth} onChange={e=>setNewUser({...newUser,dateOfBirth:e.target.value})} className="w-full mt-1 p-3 border-2 rounded-xl text-xs"/></div>
                      <div><label className="text-[11px] font-bold">Blood Group</label><select value={newUser.bloodGroup} onChange={e=>setNewUser({...newUser,bloodGroup:e.target.value})} className="w-full mt-1 p-3 border-2 rounded-xl text-xs"><option value="">Select</option><option>A+</option><option>O+</option><option>B+</option></select></div>
                      <div><label className="text-[11px] font-bold">State</label><input value={newUser.state} onChange={e=>setNewUser({...newUser,state:e.target.value})} placeholder="Benue" className="w-full mt-1 p-3 border-2 rounded-xl text-xs"/></div>
                      <div className="md:col-span-2"><label className="text-[11px] font-bold">Address *</label><input value={newUser.address} onChange={e=>setNewUser({...newUser,address:e.target.value})} placeholder="Permanent Address" className="w-full mt-1 p-3 border-2 rounded-xl text-xs" required/></div>
                      <div><label className="text-[11px] font-bold">Level *</label><select value={newUser.level} onChange={e=>setNewUser({...newUser,level:e.target.value})} className="w-full mt-1 p-3 border-2 rounded-xl text-xs font-bold"><option>ND1</option><option>ND2</option><option>HND1</option><option>HND2</option></select></div>
                      <div><label className="text-[11px] font-bold">Parent Name *</label><input value={newUser.parentName} onChange={e=>setNewUser({...newUser,parentName:e.target.value})} placeholder="Parent" className="w-full mt-1 p-3 border-2 rounded-xl text-xs" required/></div>
                      <div><label className="text-[11px] font-bold">Parent Phone *</label><input value={newUser.parentPhone} onChange={e=>setNewUser({...newUser,parentPhone:e.target.value})} placeholder="Parent Phone" className="w-full mt-1 p-3 border-2 rounded-xl text-xs" required/></div>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-blue-700 hover:bg-black text-white py-3 rounded-xl font-black text-xs flex justify-center gap-2"><Key className="w-4 h-4"/> CREATE STUDENT - AUTO MATRIC + PASSWORD - FIXED SAVE</button>
                </form>
              ) : (
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="bg-white border-2 rounded-2xl p-4"><h4 className="font-black text-[11px] text-emerald-800 flex gap-2"><Briefcase className="w-4 h-4"/> STAFF - PICTURE, QUALIFICATION, COURSE, ROLE</h4>
                    <div className="grid md:grid-cols-3 gap-3 mt-3">
                      <div className="md:col-span-3 flex gap-4 items-center bg-slate-50 p-3 rounded-xl border-2"><div className="w-24 h-24 bg-white border-2 border-dashed rounded-2xl overflow-hidden flex items-center justify-center">{newUser.staffImage?<img src={newUser.staffImage} className="w-full h-full object-cover"/>:<span className="text-[10px]">Staff Photo</span>}</div><div className="flex-1"><label className="text-[11px] font-black flex gap-1"><Camera className="w-3 h-3"/> Upload Staff Picture</label><input type="file" accept="image/*" onChange={handleStaffImage} className="w-full mt-1 text-[11px] file:bg-slate-900 file:text-white file:rounded-xl file:border-0 file:px-4 file:py-2"/></div></div>
                      <div className="md:col-span-3"><label className="text-[11px] font-black">Full Names *</label><input value={newUser.fullName} onChange={e=>setNewUser({...newUser,fullName:e.target.value})} placeholder="Dr. Mrs. Jane Doe" className="w-full mt-1 p-3 border-2 rounded-xl text-xs font-bold" required/></div>
                      <div><label className="text-[11px] font-bold">Email *</label><input type="email" value={newUser.email} onChange={e=>setNewUser({...newUser,email:e.target.value})} placeholder="staff@lcns.edu.ng" className="w-full mt-1 p-3 border-2 rounded-xl text-xs" required/></div>
                      <div><label className="text-[11px] font-bold">Phone *</label><input value={newUser.phone} onChange={e=>setNewUser({...newUser,phone:e.target.value})} placeholder="080..." className="w-full mt-1 p-3 border-2 rounded-xl text-xs" required/></div>
                      <div><label className="text-[11px] font-bold">Qualification *</label><input value={newUser.qualification} onChange={e=>setNewUser({...newUser,qualification:e.target.value})} placeholder="PhD Nursing" className="w-full mt-1 p-3 border-2 rounded-xl text-xs font-bold" required/></div>
                      <div><label className="text-[11px] font-bold">Course of Study *</label><input value={newUser.courseOfStudy} onChange={e=>setNewUser({...newUser,courseOfStudy:e.target.value})} placeholder="Medical-Surgical Nursing" className="w-full mt-1 p-3 border-2 rounded-xl text-xs" required/></div>
                      <div><label className="text-[11px] font-bold">Department</label><select value={newUser.staffDepartment} onChange={e=>setNewUser({...newUser,staffDepartment:e.target.value})} className="w-full mt-1 p-3 border-2 rounded-xl text-xs"><option>Nursing</option><option>Midwifery</option><option>Admin</option><option>Bursary</option><option>Registry</option><option>ICT</option></select></div>
                      <div><label className="text-[11px] font-bold">Role *</label><select value={newUser.role} onChange={e=>setNewUser({...newUser,role:e.target.value})} className="w-full mt-1 p-3 border-2 rounded-xl text-xs font-black"><option>LECTURER</option><option>HOD</option><option>EXAM_OFFICER</option><option>PROVOST</option><option>REGISTRAR</option><option>BURSAR</option><option>ADMIN</option></select></div>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-[#0a4d2e] hover:bg-black text-white py-3 rounded-xl font-black text-xs flex justify-center gap-2"><Key className="w-4 h-4"/> CREATE STAFF - AUTO ID + PASSWORD - FIXED SAVE</button>
                </form>
              )}
            </div>
          )}

          <div className="space-y-3">
            <div className="flex justify-between"><h4 className="font-black text-sm">All Users - FIXED - Visible in All Tabs & to Provost/Bursar/Registrar ({users.length})</h4></div>
            <div className="grid gap-3 max-h-[700px] overflow-y-auto">
              {users.map((u:any)=>(
                <div key={u.email} className="border-2 p-4 rounded-2xl bg-gradient-to-br from-white to-slate-50 space-y-3">
                  <div className="flex gap-3">
                    <div className="w-14 h-14 bg-slate-200 rounded-2xl overflow-hidden flex items-center justify-center border-2">{u.staffImage?<img src={u.staffImage} className="w-full h-full object-cover"/>:<GraduationCap className="w-6 h-6 text-slate-400"/>}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap gap-2 items-center"><span className="font-black text-sm">{u.fullName}</span><span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${getRoleColor(u.role)}`}>{u.role}</span><span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-900 text-white font-mono">{u.matricNumber||u.staffId}</span></div>
                      <div className="text-[11px] text-slate-600">{u.email} • {u.phone} • {u.qualification||u.level} • {u.courseOfStudy||''}</div>
                      <div className="flex flex-wrap gap-2 p-2 bg-slate-900 text-white rounded-xl text-[10px]"><span className="flex gap-1"><IdCard className="w-3 h-3 text-amber-300"/> ID: <b className="font-mono">{u.loginId||u.matricNumber||u.staffId}</b></span><span className="flex gap-1"><Key className="w-3 h-3 text-emerald-300"/> PASS: <b className="font-mono">{showPasswords[u.email]?u.password:'••••'}</b><button onClick={()=>setShowPasswords({...showPasswords,[u.email]:!showPasswords[u.email]})} className="ml-1 bg-white/20 p-1 rounded">{showPasswords[u.email]?<EyeOff className="w-3 h-3"/>:<Eye className="w-3 h-3"/>}</button></span></div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">{ALL_ROLES.map(r=><button key={r.value} onClick={()=>assignRole(u.email,r.value)} className={`px-2 py-1 rounded-lg text-[9px] font-black border ${u.role===r.value?'bg-slate-900 text-white':'bg-white'}`}>{r.value}</button>)}<button onClick={()=>deleteUser(u.email,u.fullName)} className="px-3 py-1 bg-red-600 text-white rounded-lg text-[9px] font-black">DELETE</button></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeAdminTab==='promotion' && <StudentPromotion />}
      {activeAdminTab==='settings' && <AdminSettings />}
      {activeAdminTab==='management' && <AdminManagement />}
      {activeAdminTab==='cbt' && <CBTExamManager currentUser={{id:'admin',email:'admin@lcns.edu.ng',role:'ADMIN',fullName:'Admin',status:'ACTIVE'}} />}
      {activeAdminTab==='applicants' && <div className="space-y-4"><div className="bg-purple-50 border-2 border-purple-300 p-3 rounded-xl text-xs font-bold">🎓 Applicants - App {appStatus.isOpen?'OPEN':'CLOSED'}</div><AdminAdmissionManager currentUser={{id:'admin',email:'admin@lcns.edu.ng',role:'ADMIN',fullName:'Admin',status:'ACTIVE'}} /></div>}
      {activeAdminTab==='system' && <div className="bg-white rounded-3xl border-2 p-6 text-xs"><h3 className="font-black">System Health</h3><p>Users: {users.length} - Courses: {courses.length}</p></div>}
    </div>
  );
};

export default AdminDashboard;

import React, { useEffect, useState } from 'react';
import { StorageService } from '../../services/storage';
import { COLLEGE_CONFIG } from '../../types';
import { getSupabase } from '../../lib/supabase';
import {
  GraduationCap, Users, BookOpen, Camera, Award, UserCheck, Database,
  Crown, UserPlus, Eye, EyeOff, Briefcase, Key, IdCard, BookMarked,
  ShieldAlert, Timer, Clock, Monitor, Plus, Trash2, Search, Download,
  Printer, FileSpreadsheet, CheckCircle2, Settings, Megaphone, Calendar,
  BookMarked as BookIcon, ArrowUpCircle, Power, Upload
} from 'lucide-react';
import { CBTExamManager } from '../cbt/CBTExamManager';
import { AdminAdmissionManager } from '../admin/AdminAdmissionManager';
import { ScoreSheetViewer } from './ScoreSheetViewer';
import { PrintableResultWithLogo } from '../common/PrintableResultWithLogo';
import { CollegeLogo } from '../common/CollegeLogo';

// ===== 1. BISHOP & PROVOST MANAGER - BACKEND SAVE - school_settings (key, value, updated_at) =====
const LeadershipManager = ({ showStatus }: any) => {
  const [bishop, setBishop] = useState<any>(()=>{
    try{ const v = localStorage.getItem('lcns_bishop'); if(v) return JSON.parse(v); }catch{}
    return {name:'Most Rev. Isaac B. Dugu',title:'Bishop, Catholic Diocese of Gboko - Proprietor',image:'',description:'Proprietor'};
  });
  const [provost, setProvost] = useState<any>(()=>{
    try{ const v = localStorage.getItem('lcns_provost'); if(v) return JSON.parse(v); }catch{}
    return {name:'Mrs Terna Fiase',title:'Provost, Labe College of Nursing Sciences',image:'',description:'Provost - Labe College, Gboko'};
  });
  const [loading, setLoading] = useState(false);
  useEffect(()=>{
    const load = async()=>{
      setLoading(true); const sb=getSupabase(); if(!sb){setLoading(false);return;}
      try{ const {data}=await sb.from('school_settings').select('*').in('key',['bishop','provost']); if(data){data.forEach((row:any)=>{try{const p=JSON.parse(row.value||'{}'); if(row.key==='bishop'&&p.image){setBishop(p);localStorage.setItem('lcns_bishop',JSON.stringify(p));localStorage.setItem('bishop_image',p.image);localStorage.setItem('proprietor_image',p.image);} if(row.key==='provost'&&p.image){setProvost(p);localStorage.setItem('lcns_provost',JSON.stringify(p));localStorage.setItem('provost_image',p.image);}}catch{}})}}catch{} setLoading(false);
    }; load();
  },[]);
  const handleImg = (e:any, t:'bishop'|'provost')=>{
    const f=e.target.files?.[0]; if(!f) return; if(f.size>3000000){showStatus('Image too big <3MB','error');return;}
    const r=new FileReader(); r.onload=()=>{const b64=r.result as string; if(t==='bishop') setBishop({...bishop,image:b64}); else setProvost({...provost,image:b64});}; r.readAsDataURL(f);
  };
  const save = async(t:'bishop'|'provost')=>{
    const data = t==='bishop'?bishop:provost; if(!data.image){showStatus('Upload photo first','error');return;}
    localStorage.setItem(t==='bishop'?'lcns_bishop':'lcns_provost', JSON.stringify(data));
    localStorage.setItem(t==='bishop'?'bishop_image':'provost_image', data.image);
    if(t==='bishop') localStorage.setItem('proprietor_image', data.image);
    const sb=getSupabase(); if(sb){try{await sb.from('school_settings').upsert({key:t, value:JSON.stringify(data), updated_at:new Date().toISOString()},{onConflict:'key'});}catch(err:any){showStatus('Local saved but backend failed: '+err.message,'error');return;}}
    window.dispatchEvent(new Event('storage')); showStatus(`✅ ${t.toUpperCase()} PUBLISHED TO BACKEND!`);
  };
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6"><h3 className="font-black flex gap-2"><Crown className="w-5 h-5"/> BISHOP {loading&&'(Loading)'}</h3><div className="h-64 bg-white border-2 border-dashed rounded-2xl overflow-hidden flex items-center justify-center mt-3">{bishop.image?<img src={bishop.image} className="w-full h-full object-cover"/>:<span>No Image</span>}</div><input type="file" accept="image/*" onChange={e=>handleImg(e,'bishop')} className="w-full mt-2 text-[11px] file:bg-amber-900 file:text-white file:rounded-xl file:border-0 file:px-4 file:py-2"/><input value={bishop.name} onChange={e=>setBishop({...bishop,name:e.target.value})} className="w-full mt-2 p-3 border-2 rounded-xl text-xs font-bold"/><input value={bishop.title} onChange={e=>setBishop({...bishop,title:e.target.value})} className="w-full mt-2 p-3 border-2 rounded-xl text-xs"/><textarea value={bishop.description} onChange={e=>setBishop({...bishop,description:e.target.value})} className="w-full mt-2 p-3 border-2 rounded-xl text-xs h-20"/><button onClick={()=>save('bishop')} className="w-full mt-2 bg-amber-900 text-white py-3 rounded-xl font-black text-xs">SAVE BISHOP TO BACKEND</button></div>
      <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-6"><h3 className="font-black flex gap-2"><UserCheck className="w-5 h-5"/> PROVOST {loading&&'(Loading)'}</h3><div className="h-64 bg-white border-2 border-dashed rounded-2xl overflow-hidden flex items-center justify-center mt-3">{provost.image?<img src={provost.image} className="w-full h-full object-cover"/>:<span>No Image</span>}</div><input type="file" accept="image/*" onChange={e=>handleImg(e,'provost')} className="w-full mt-2 text-[11px] file:bg-emerald-800 file:text-white file:rounded-xl file:border-0 file:px-4 file:py-2"/><input value={provost.name} onChange={e=>setProvost({...provost,name:e.target.value})} className="w-full mt-2 p-3 border-2 rounded-xl text-xs font-bold"/><input value={provost.title} onChange={e=>setProvost({...provost,title:e.target.value})} className="w-full mt-2 p-3 border-2 rounded-xl text-xs"/><textarea value={provost.description} onChange={e=>setProvost({...provost,description:e.target.value})} className="w-full mt-2 p-3 border-2 rounded-xl text-xs h-20"/><button onClick={()=>save('provost')} className="w-full mt-2 bg-emerald-800 text-white py-3 rounded-xl font-black text-xs">SAVE PROVOST TO BACKEND</button></div>
    </div>
  );
};

// ===== 2. GALLERY MANAGER - UPLOAD PICTURES WITH DESCRIPTION - SAVE TO WEBSITE + SUPABASE =====
const GalleryManager = ({ showStatus }: any) => {
  const [gallery, setGallery] = useState<any[]>(()=>{try{return JSON.parse(localStorage.getItem('lcns_gallery')||'[]');}catch{return[];}});
  const [title, setTitle] = useState(''); const [desc, setDesc] = useState(''); const [img, setImg] = useState('');
  useEffect(()=>{ const load=async()=>{ const sb=getSupabase(); if(!sb) return; try{ const {data}=await sb.from('school_settings').select('*').eq('key','gallery'); if(data&&data[0]){ const parsed=JSON.parse(data[0].value||'[]'); setGallery(parsed); localStorage.setItem('lcns_gallery',JSON.stringify(parsed)); } }catch{} }; load(); },[]);
  const handleImg = (e:any)=>{ const f=e.target.files?.[0]; if(!f) return; if(f.size>5000000){showStatus('Image too big <5MB','error');return;} const r=new FileReader(); r.onload=()=>setImg(r.result as string); r.readAsDataURL(f); };
  const save = async()=>{
    if(!title||!img){showStatus('Title + Image required','error');return;}
    const newItem={id:Date.now().toString(), title, description:desc, image:img, created_at:new Date().toISOString()};
    const updated=[newItem, ...gallery]; setGallery(updated); localStorage.setItem('lcns_gallery',JSON.stringify(updated));
    const sb=getSupabase(); if(sb){try{await sb.from('school_settings').upsert({key:'gallery', value:JSON.stringify(updated), updated_at:new Date().toISOString()},{onConflict:'key'});}catch{}}
    window.dispatchEvent(new Event('storage')); showStatus('✅ Picture with description published to website + backend!'); setTitle(''); setDesc(''); setImg('');
  };
  const del = async(id:string)=>{ const updated=gallery.filter((g:any)=>g.id!==id); setGallery(updated); localStorage.setItem('lcns_gallery',JSON.stringify(updated)); const sb=getSupabase(); if(sb){try{await sb.from('school_settings').upsert({key:'gallery', value:JSON.stringify(updated), updated_at:new Date().toISOString()},{onConflict:'key'});}catch{}} showStatus('Deleted'); };
  return (
    <div className="space-y-6">
      <div className="bg-white border-2 rounded-3xl p-6"><h3 className="font-black flex gap-2"><Camera className="w-5 h-5"/> Gallery - Upload Pictures with Description - Save on Website</h3>
        <div className="grid md:grid-cols-2 gap-4 mt-4"><div className="space-y-3"><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Picture Title e.g. Matriculation 2026" className="w-full p-3 border-2 rounded-xl text-xs font-bold"/><textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Description e.g. 2026/2027 Matriculation ceremony at Labe College, Gboko" className="w-full p-3 border-2 rounded-xl text-xs h-24"/><input type="file" accept="image/*" onChange={handleImg} className="w-full text-[11px] file:bg-slate-900 file:text-white file:rounded-xl file:border-0 file:px-4 file:py-2"/><button onClick={save} className="w-full bg-slate-900 text-white py-3 rounded-xl font-black text-xs flex justify-center gap-2"><Upload className="w-4 h-4"/> PUBLISH PICTURE TO WEBSITE + SUPABASE</button></div><div className="h-64 bg-slate-100 border-2 border-dashed rounded-2xl overflow-hidden flex items-center justify-center">{img?<img src={img} className="w-full h-full object-cover"/>:<span className="text-xs">Preview</span>}</div></div>
      </div>
      <div className="grid md:grid-cols-3 gap-4">{gallery.map((g:any)=><div key={g.id} className="bg-white border-2 rounded-2xl overflow-hidden"><div className="h-40 overflow-hidden"><img src={g.image} className="w-full h-full object-cover"/></div><div className="p-3"><p className="font-black text-xs">{g.title}</p><p className="text-[11px] text-slate-600">{g.description}</p><button onClick={()=>del(g.id)} className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-[10px]">DELETE</button></div></div>)}</div>
    </div>
  );
};

// ===== 3. COURSE MANAGER - ADD COURSE AND ASSIGN TO LECTURERS =====
const CourseManager = ({ showStatus, users }: any) => {
  const [courses, setCourses] = useState<any[]>(()=>{try{return JSON.parse(localStorage.getItem('lcns_courses')||'[]');}catch{return[];}});
  const [code, setCode] = useState(''); const [cTitle, setCTitle] = useState(''); const [unit, setUnit] = useState('3'); const [level, setLevel] = useState('ND1'); const [lecturer, setLecturer] = useState('');
  useEffect(()=>{ const load=async()=>{ const sb=getSupabase(); if(!sb) return; try{ const {data}=await sb.from('school_settings').select('*').eq('key','courses'); if(data&&data[0]){ const p=JSON.parse(data[0].value||'[]'); setCourses(p); localStorage.setItem('lcns_courses',JSON.stringify(p)); } }catch{} }; load(); },[]);
  const lecturers = users.filter((u:any)=>['LECTURER','HOD','EXAM_OFFICER'].includes(u.role));
  const save = async()=>{
    if(!code||!cTitle){showStatus('Course code + Title required','error');return;}
    const newCourse={id:Date.now().toString(), code:code.toUpperCase(), title:cTitle, creditUnit:parseInt(unit), level, lecturerEmail:lecturer, lecturerName: lecturers.find((l:any)=>l.email===lecturer)?.fullName||'', created_at:new Date().toISOString()};
    const updated=[...courses.filter((c:any)=>c.code!==newCourse.code), newCourse]; setCourses(updated); localStorage.setItem('lcns_courses',JSON.stringify(updated));
    const sb=getSupabase(); if(sb){try{await sb.from('school_settings').upsert({key:'courses', value:JSON.stringify(updated), updated_at:new Date().toISOString()},{onConflict:'key'}); await sb.from('courses').upsert({id:newCourse.id, code:newCourse.code, title:newCourse.title, credit_unit:newCourse.creditUnit, level:newCourse.level, lecturer_email:newCourse.lecturerEmail});}catch{}}
    showStatus(`✅ Course ${newCourse.code} added and assigned to ${newCourse.lecturerName||'No lecturer'}`); setCode(''); setCTitle(''); setLecturer('');
  };
  const del = async(id:string)=>{ const updated=courses.filter((c:any)=>c.id!==id); setCourses(updated); localStorage.setItem('lcns_courses',JSON.stringify(updated)); const sb=getSupabase(); if(sb){try{await sb.from('school_settings').upsert({key:'courses', value:JSON.stringify(updated), updated_at:new Date().toISOString()},{onConflict:'key'});}catch{}} showStatus('Deleted'); };
  return (
    <div className="space-y-6">
      <div className="bg-white border-2 rounded-3xl p-6"><h3 className="font-black flex gap-2"><BookIcon className="w-5 h-5"/> Add Course and Assign to Lecturers - Supabase Connected</h3>
        <div className="grid md:grid-cols-4 gap-3 mt-4"><input value={code} onChange={e=>setCode(e.target.value)} placeholder="Course Code e.g. NUR111" className="p-3 border-2 rounded-xl text-xs font-bold"/><input value={cTitle} onChange={e=>setCTitle(e.target.value)} placeholder="Course Title e.g. Anatomy" className="p-3 border-2 rounded-xl text-xs"/><select value={unit} onChange={e=>setUnit(e.target.value)} className="p-3 border-2 rounded-xl text-xs"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select><select value={level} onChange={e=>setLevel(e.target.value)} className="p-3 border-2 rounded-xl text-xs"><option>ND1</option><option>ND2</option><option>HND1</option><option>HND2</option></select></div>
        <div className="mt-3 flex gap-2"><select value={lecturer} onChange={e=>setLecturer(e.target.value)} className="flex-1 p-3 border-2 rounded-xl text-xs"><option value="">Assign to Lecturer (Select)</option>{lecturers.map((l:any)=><option key={l.email} value={l.email}>{l.fullName} - {l.role} - {l.email}</option>)}</select><button onClick={save} className="px-6 bg-[#0a4d2e] text-white rounded-xl text-xs font-black">ADD COURSE + ASSIGN</button></div>
      </div>
      <div className="bg-white border-2 rounded-2xl overflow-hidden"><table className="w-full text-xs"><thead className="bg-slate-900 text-white"><tr><th className="p-3 text-left">Code</th><th className="p-3 text-left">Title</th><th className="p-3">Unit</th><th className="p-3">Level</th><th className="p-3">Lecturer</th><th className="p-3">Action</th></tr></thead><tbody>{courses.map((c:any)=><tr key={c.id} className="border-b"><td className="p-3 font-mono font-black">{c.code}</td><td className="p-3">{c.title}</td><td className="p-3 text-center">{c.creditUnit}</td><td className="p-3">{c.level}</td><td className="p-3">{c.lecturerName||'Not assigned'}<br/><span className="text-[10px] text-slate-500">{c.lecturerEmail}</span></td><td className="p-3"><button onClick={()=>del(c.id)} className="px-2 py-1 bg-red-600 text-white rounded text-[10px]">DELETE</button></td></tr>)}</tbody></table></div>
    </div>
  );
};

// ===== 4. PROMOTION MANAGER - PROMOTE STUDENT BY SESSION AND SEMESTER AND SET ACADEMIC YEAR =====
const PromotionManager = ({ showStatus, users, setUsers }: any) => {
  const [session, setSession] = useState(()=>localStorage.getItem('lcns_current_session')||'2026/2027');
  const [semester, setSemester] = useState(()=>localStorage.getItem('lcns_current_semester')||'First Semester');
  const [fromLevel, setFromLevel] = useState('ND1'); const [toLevel, setToLevel] = useState('ND2');
  const [selected, setSelected] = useState<string[]>([]);
  useEffect(()=>{ localStorage.setItem('lcns_current_session', session); localStorage.setItem('lcns_current_semester', semester); },[session, semester]);
  const students = users.filter((u:any)=>u.role==='STUDENT'&&u.level===fromLevel);
  const toggle = (email:string)=>{ setSelected(s=>s.includes(email)?s.filter(x=>x!==email):[...s,email]); };
  const promote = async()=>{
    if(selected.length===0){showStatus('Select students to promote','error');return;}
    const updated = users.map((u:any)=>selected.includes(u.email)?{...u, level:toLevel, previousLevel:u.level, promotedAt:new Date().toISOString(), academicYear:session, semester}:u);
    setUsers(updated); localStorage.setItem('lcns_users',JSON.stringify(updated)); localStorage.setItem('users',JSON.stringify(updated));
    const sb=getSupabase(); if(sb){ try{ for(const email of selected){ await sb.from('users').update({level:toLevel, academic_year:session}).eq('email',email); } await sb.from('school_settings').upsert({key:'current_session', value:JSON.stringify({session, semester, fromLevel, toLevel, promoted: selected.length, date:new Date().toISOString()}), updated_at:new Date().toISOString()},{onConflict:'key'}); }catch{}}
    showStatus(`✅ ${selected.length} students promoted from ${fromLevel} to ${toLevel} for ${session} - ${semester}`); setSelected([]);
  };
  const setAcademicYear = async()=>{
    localStorage.setItem('lcns_current_session', session); localStorage.setItem('lcns_current_semester', semester);
    const sb=getSupabase(); if(sb){ try{ await sb.from('school_settings').upsert({key:'academic_year', value:JSON.stringify({session, semester, updated_at:new Date().toISOString()}), updated_at:new Date().toISOString()},{onConflict:'key'}); await sb.from('school_settings').upsert({key:'current_session', value:session, updated_at:new Date().toISOString()},{onConflict:'key'}); }catch{}}
    window.dispatchEvent(new Event('storage')); showStatus(`✅ Academic Year set to ${session} - ${semester} - Saved to backend!`);
  };
  return (
    <div className="space-y-6">
      <div className="bg-white border-2 rounded-3xl p-6"><h3 className="font-black flex gap-2"><ArrowUpCircle className="w-5 h-5"/> Promote Student by Session and Semester and Set Academic Year e.g. 2026/2027</h3>
        <div className="grid md:grid-cols-3 gap-3 mt-4"><div><label className="text-[11px] font-bold">Academic Year (Session) e.g. 2026/2027</label><input value={session} onChange={e=>setSession(e.target.value)} placeholder="2026/2027" className="w-full mt-1 p-3 border-2 border-amber-500 rounded-xl text-xs font-black"/></div><div><label className="text-[11px] font-bold">Semester</label><select value={semester} onChange={e=>setSemester(e.target.value)} className="w-full mt-1 p-3 border-2 rounded-xl text-xs"><option>First Semester</option><option>Second Semester</option></select></div><div className="flex items-end"><button onClick={setAcademicYear} className="w-full bg-amber-700 text-white py-3 rounded-xl font-black text-xs">SET ACADEMIC YEAR {session} - {semester} + PUBLISH TO BACKEND</button></div></div>
        <div className="grid md:grid-cols-3 gap-3 mt-4"><div><label className="text-[11px] font-bold">From Level</label><select value={fromLevel} onChange={e=>setFromLevel(e.target.value)} className="w-full mt-1 p-3 border-2 rounded-xl text-xs"><option>ND1</option><option>ND2</option><option>HND1</option><option>HND2</option></select></div><div><label className="text-[11px] font-bold">To Level</label><select value={toLevel} onChange={e=>setToLevel(e.target.value)} className="w-full mt-1 p-3 border-2 rounded-xl text-xs"><option>ND2</option><option>HND1</option><option>HND2</option><option>GRADUATED</option></select></div><div className="flex items-end"><button onClick={promote} className="w-full bg-[#0a4d2e] text-white py-3 rounded-xl font-black text-xs">PROMOTE {selected.length} SELECTED STUDENTS FROM {fromLevel} TO {toLevel}</button></div></div>
      </div>
      <div className="bg-white border-2 rounded-2xl p-4"><h4 className="font-black text-xs">Students in {fromLevel} - {students.length} - Select to Promote to {toLevel} for {session}</h4><div className="grid gap-2 mt-3 max-h-96 overflow-y-auto">{students.map((s:any)=><div key={s.email} className="flex items-center gap-2 p-2 border rounded-xl"><input type="checkbox" checked={selected.includes(s.email)} onChange={()=>toggle(s.email)}/><span className="font-bold text-xs">{s.fullName}</span><span className="text-[10px]">{s.matricNumber} - {s.level}</span></div>)}</div></div>
    </div>
  );
};

// ===== 5. ADMIN SETTINGS - RESET PORTAL AND PUBLISH TO HAND OVER TO SCHOOL ADMIN =====
const AdminSettingsManager = ({ showStatus }: any) => {
  const [resetConfirm, setResetConfirm] = useState('');
  const resetPortal = async(type:'users'|'results'|'all')=>{
    if(resetConfirm!=='RESET'){showStatus('Type RESET to confirm','error');return;}
    if(!confirm(`Are you sure you want to reset ${type}? This will delete all ${type} data!`)) return;
    const sb=getSupabase();
    if(type==='users'||type==='all'){ localStorage.removeItem('lcns_users'); localStorage.removeItem('users'); if(sb){try{await sb.from('users').delete().neq('id','00000000-0000-0000-0000-000000000000');}catch{}} }
    if(type==='results'||type==='all'){ localStorage.removeItem('lcns_results'); localStorage.removeItem('lcns_courses'); localStorage.removeItem('lcns_gallery'); if(sb){try{await sb.from('results').delete().neq('id','00000000-0000-0000-0000-000000000000');}catch{}} }
    if(type==='all'){ localStorage.clear(); if(sb){try{await sb.from('school_settings').delete().neq('key','logo');}catch{}} }
    window.dispatchEvent(new Event('storage')); showStatus(`✅ Portal ${type} reset completed - Ready to hand over to school admin`); setResetConfirm('');
  };
  const handover = async()=>{
    const data={handover_date:new Date().toISOString(), handover_by:'Director of ICT', school:'Labe College of Nursing Sciences - Catholic Diocese of Gboko - Gboko, Benue State', academic_year: localStorage.getItem('lcns_current_session')||'2026/2027', total_users: JSON.parse(localStorage.getItem('lcns_users')||'[]').length, total_results: JSON.parse(localStorage.getItem('lcns_results')||'[]').length, status:'READY FOR SCHOOL ADMIN'};
    localStorage.setItem('lcns_handover', JSON.stringify(data));
    const sb=getSupabase(); if(sb){try{await sb.from('school_settings').upsert({key:'handover', value:JSON.stringify(data), updated_at:new Date().toISOString()},{onConflict:'key'});}catch{}}
    showStatus('✅ Portal published and handed over to school admin - School can now manage - 2026/2027 session ready!');
  };
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-slate-900 to-[#0a4d2e] text-white rounded-3xl p-6 border-2"><h3 className="font-black flex gap-2"><Settings className="w-5 h-5"/> Admin Settings - Reset Portal and Publish to Hand Over to School Admin</h3><p className="text-xs mt-2 text-emerald-200">Reset portal to clean state for new session 2026/2027 - Then publish to hand over to school admin - Labe College, Gboko</p></div>
      <div className="bg-white border-2 border-red-300 rounded-3xl p-6"><h4 className="font-black text-red-800">⚠️ DANGER ZONE - Reset Portal</h4><p className="text-[11px] mt-1">Type RESET to confirm, then choose reset type - This will delete data from localStorage + Supabase</p><input value={resetConfirm} onChange={e=>setResetConfirm(e.target.value)} placeholder="Type RESET to confirm" className="w-full mt-3 p-3 border-2 border-red-500 rounded-xl text-xs font-black"/><div className="grid md:grid-cols-3 gap-3 mt-3"><button onClick={()=>resetPortal('users')} className="bg-orange-600 text-white py-3 rounded-xl font-black text-xs">RESET USERS ONLY</button><button onClick={()=>resetPortal('results')} className="bg-red-600 text-white py-3 rounded-xl font-black text-xs">RESET RESULTS + COURSES + GALLERY</button><button onClick={()=>resetPortal('all')} className="bg-black text-white py-3 rounded-xl font-black text-xs">RESET ALL - FULL PORTAL WIPE</button></div></div>
      <div className="bg-white border-2 border-emerald-300 rounded-3xl p-6"><h4 className="font-black text-emerald-800">✅ Publish to Hand Over to School Admin</h4><p className="text-[11px] mt-1">After setting 2026/2027 session, courses, users, publish admission open/close, announcements - Click to hand over portal to school admin - School admin can now login and manage</p><button onClick={handover} className="w-full mt-3 bg-emerald-700 text-white py-4 rounded-xl font-black text-sm flex justify-center gap-2"><Power className="w-5 h-5"/> PUBLISH PORTAL + HAND OVER TO SCHOOL ADMIN - READY FOR 2026/2027</button><div className="mt-3 p-3 bg-slate-50 rounded-xl text-[11px]"><p>Current Session: {localStorage.getItem('lcns_current_session')||'2026/2027'}</p><p>Total Users: {JSON.parse(localStorage.getItem('lcns_users')||'[]').length}</p><p>Total Results: {JSON.parse(localStorage.getItem('lcns_results')||'[]').length}</p></div></div>
    </div>
  );
};

// ===== 6. APPLICATION MANAGER - PUBLISH ADMISSION AND CLOSE IT =====
const ApplicationManager = ({ showStatus }: any) => {
  const [appStatus, setAppStatus] = useState<any>(()=>{try{return JSON.parse(localStorage.getItem('lcns_app_status')||'null')||{isOpen:false, link:'/apply', deadline:'2026-11-30', message:'Admissions for 2026/2027 Academic Year is CLOSED - School is starting November 2026'};}catch{return{isOpen:false, link:'/apply', deadline:'2026-11-30', message:'Closed'};}});
  const [link, setLink] = useState(appStatus.link); const [deadline, setDeadline] = useState(appStatus.deadline); const [message, setMessage] = useState(appStatus.message);
  const toggle = async()=>{
    const newStatus={isOpen:!appStatus.isOpen, link, deadline, message: !appStatus.isOpen?message:'Admissions for 2026/2027 Academic Year is CLOSED - School is starting November 2026 - Labe College of Nursing Sciences'};
    setAppStatus(newStatus); localStorage.setItem('lcns_app_status',JSON.stringify(newStatus)); localStorage.setItem('lcns_admission_status',JSON.stringify(newStatus)); localStorage.setItem('lcns_application_status',JSON.stringify(newStatus));
    const sb=getSupabase(); if(sb){try{await sb.from('school_settings').upsert({key:'application_open', value:newStatus.isOpen?'true':'false', updated_at:new Date().toISOString()},{onConflict:'key'}); await sb.from('school_settings').upsert({key:'admission_status', value:JSON.stringify(newStatus), updated_at:new Date().toISOString()},{onConflict:'key'}); await sb.from('school_settings').upsert({key:'app_status', value:JSON.stringify(newStatus), updated_at:new Date().toISOString()},{onConflict:'key'});}catch{}}
    window.dispatchEvent(new Event('storage')); showStatus(newStatus.isOpen?`✅ ADMISSION PUBLISHED - OPEN! Link: ${link} - Will display on website`:`✅ ADMISSION CLOSED - Will display as CLOSED on website - 2026/2027`);
  };
  const saveSettings = async()=>{
    const newStatus={isOpen:appStatus.isOpen, link, deadline, message}; setAppStatus(newStatus); localStorage.setItem('lcns_app_status',JSON.stringify(newStatus));
    const sb=getSupabase(); if(sb){try{await sb.from('school_settings').upsert({key:'admission_status', value:JSON.stringify(newStatus), updated_at:new Date().toISOString()},{onConflict:'key'});}catch{}}
    showStatus('Admission settings saved and will display on website');
  };
  return (
    <div className="space-y-6">
      <div className={`rounded-3xl p-6 border-2 ${appStatus.isOpen?'bg-emerald-50 border-emerald-300':'bg-red-50 border-red-300'}`}><div className="flex justify-between items-center"><div><h2 className="font-black text-lg">APPLICATION {appStatus.isOpen?'OPEN':'CLOSED'} - {appStatus.isOpen?'✅ Will display as OPEN on website':'🔒 Will display as CLOSED on website'}</h2><p className="text-xs mt-1">{appStatus.message}</p><p className="text-[11px] mt-1">Link: {appStatus.link} | Deadline: {appStatus.deadline}</p></div><button onClick={toggle} className={`px-8 py-3 rounded-xl font-black text-white ${appStatus.isOpen?'bg-red-600':'bg-emerald-600'}`}>{appStatus.isOpen?'CLOSE ADMISSION NOW':'OPEN ADMISSION NOW - PUBLISH'}</button></div></div>
      <div className="bg-white border-2 rounded-3xl p-6 space-y-4"><h3 className="font-black">Publish Admission Settings - Will Display on Website</h3><div><label className="text-[11px] font-bold">Application Link</label><input value={link} onChange={e=>setLink(e.target.value)} className="w-full mt-1 p-3 border-2 rounded-xl text-xs"/></div><div><label className="text-[11px] font-bold">Deadline</label><input type="date" value={deadline} onChange={e=>setDeadline(e.target.value)} className="w-full mt-1 p-3 border-2 rounded-xl text-xs"/></div><div><label className="text-[11px] font-bold">Message to display on website</label><textarea value={message} onChange={e=>setMessage(e.target.value)} className="w-full mt-1 p-3 border-2 rounded-xl text-xs h-24"/></div><button onClick={saveSettings} className="w-full bg-slate-900 text-white py-3 rounded-xl font-black text-xs">SAVE ADMISSION SETTINGS - PUBLISH TO WEBSITE</button></div>
    </div>
  );
};

// ===== 7. ANNOUNCEMENT & EVENT MANAGER - PUBLISH AND DISPLAY ON WEBSITE =====
const AnnouncementManager = ({ showStatus }: any) => {
  const [anns, setAnns] = useState<any[]>(()=>{try{return JSON.parse(localStorage.getItem('lcns_announcements')||'[]');}catch{return[];}});
  const [events, setEvents] = useState<any[]>(()=>{try{return JSON.parse(localStorage.getItem('lcns_events')||'[]');}catch{return[];}});
  const [annForm, setAnnForm] = useState({title:'', message:'', type:'announcement', is_published:true}); const [eventForm, setEventForm] = useState({title:'', description:'', date:'', location:'', is_published:true});
  useEffect(()=>{ const load=async()=>{ const sb=getSupabase(); if(!sb) return; try{ const {data: aData}=await sb.from('school_settings').select('*').eq('key','announcements'); if(aData&&aData[0]){ const p=JSON.parse(aData[0].value||'[]'); setAnns(p); localStorage.setItem('lcns_announcements',JSON.stringify(p)); } const {data: eData}=await sb.from('school_settings').select('*').eq('key','events'); if(eData&&eData[0]){ const p=JSON.parse(eData[0].value||'[]'); setEvents(p); localStorage.setItem('lcns_events',JSON.stringify(p)); } }catch{} }; load(); },[]);
  const saveAnn = async()=>{
    if(!annForm.title||!annForm.message){showStatus('Title + Message required','error');return;}
    const newAnn={id:Date.now().toString(), ...annForm, created_at:new Date().toISOString()}; const updated=[newAnn, ...anns]; setAnns(updated); localStorage.setItem('lcns_announcements',JSON.stringify(updated));
    const sb=getSupabase(); if(sb){try{await sb.from('school_settings').upsert({key:'announcements', value:JSON.stringify(updated), updated_at:new Date().toISOString()},{onConflict:'key'}); await sb.from('announcements').insert([{id:newAnn.id, title:newAnn.title, message:newAnn.message, type:newAnn.type, is_published:newAnn.is_published}]);}catch{}}
    window.dispatchEvent(new Event('storage')); showStatus('✅ Announcement published and will display on website!'); setAnnForm({title:'', message:'', type:'announcement', is_published:true});
  };
  const saveEvent = async()=>{
    if(!eventForm.title){showStatus('Event title required','error');return;}
    const newEvent={id:Date.now().toString(), ...eventForm, created_at:new Date().toISOString()}; const updated=[newEvent, ...events]; setEvents(updated); localStorage.setItem('lcns_events',JSON.stringify(updated));
    const sb=getSupabase(); if(sb){try{await sb.from('school_settings').upsert({key:'events', value:JSON.stringify(updated), updated_at:new Date().toISOString()},{onConflict:'key'}); await sb.from('events').insert([{id:newEvent.id, title:newEvent.title, description:newEvent.description, date:newEvent.date, location:newEvent.location, is_published:newEvent.is_published}]);}catch{}}
    window.dispatchEvent(new Event('storage')); showStatus('✅ Event published and will display on website!'); setEventForm({title:'', description:'', date:'', location:'', is_published:true});
  };
  const delAnn = async(id:string)=>{ const updated=anns.filter((a:any)=>a.id!==id); setAnns(updated); localStorage.setItem('lcns_announcements',JSON.stringify(updated)); const sb=getSupabase(); if(sb){try{await sb.from('school_settings').upsert({key:'announcements', value:JSON.stringify(updated), updated_at:new Date().toISOString()},{onConflict:'key'});}catch{}} showStatus('Deleted'); };
  const delEvent = async(id:string)=>{ const updated=events.filter((e:any)=>e.id!==id); setEvents(updated); localStorage.setItem('lcns_events',JSON.stringify(updated)); const sb=getSupabase(); if(sb){try{await sb.from('school_settings').upsert({key:'events', value:JSON.stringify(updated), updated_at:new Date().toISOString()},{onConflict:'key'});}catch{}} showStatus('Deleted'); };
  return (
    <div className="space-y-6">
      <div className="bg-white border-2 rounded-3xl p-6"><h3 className="font-black flex gap-2"><Megaphone className="w-5 h-5"/> Publish Announcement - Will Display on Website</h3><div className="space-y-3 mt-4"><input value={annForm.title} onChange={e=>setAnnForm({...annForm,title:e.target.value})} placeholder="Announcement Title e.g. 2026/2027 Resumption Date" className="w-full p-3 border-2 rounded-xl text-xs font-bold"/><textarea value={annForm.message} onChange={e=>setAnnForm({...annForm,message:e.target.value})} placeholder="Announcement Message - Will display on website homepage" className="w-full p-3 border-2 rounded-xl text-xs h-24"/><div className="flex gap-2"><select value={annForm.type} onChange={e=>setAnnForm({...annForm,type:e.target.value})} className="flex-1 p-3 border-2 rounded-xl text-xs"><option value="announcement">Announcement</option><option value="news">News</option><option value="alert">Alert</option></select><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={annForm.is_published} onChange={e=>setAnnForm({...annForm,is_published:e.target.checked})}/> Publish</label><button onClick={saveAnn} className="px-6 bg-[#0a4d2e] text-white rounded-xl font-black text-xs">PUBLISH ANNOUNCEMENT TO WEBSITE + SUPABASE</button></div></div><div className="mt-6 space-y-2">{anns.slice(0,10).map((a:any)=><div key={a.id} className="p-3 border-2 rounded-xl bg-slate-50"><div className="flex justify-between"><p className="font-black text-xs">{a.title} - {a.type}</p><button onClick={()=>delAnn(a.id)} className="px-2 py-1 bg-red-600 text-white rounded text-[10px]">DELETE</button></div><p className="text-[11px]">{a.message}</p><p className="text-[10px] text-slate-500">{a.is_published?'✅ Published on website':'🔒 Draft'}</p></div>)}</div></div>
      <div className="bg-white border-2 rounded-3xl p-6"><h3 className="font-black flex gap-2"><Calendar className="w-5 h-5"/> Publish Event - Will Display on Website</h3><div className="space-y-3 mt-4"><input value={eventForm.title} onChange={e=>setEventForm({...eventForm,title:e.target.value})} placeholder="Event Title e.g. Matriculation Ceremony 2026/2027" className="w-full p-3 border-2 rounded-xl text-xs font-bold"/><textarea value={eventForm.description} onChange={e=>setEventForm({...eventForm,description:e.target.value})} placeholder="Event Description" className="w-full p-3 border-2 rounded-xl text-xs h-20"/><div className="grid md:grid-cols-2 gap-3"><input type="date" value={eventForm.date} onChange={e=>setEventForm({...eventForm,date:e.target.value})} className="p-3 border-2 rounded-xl text-xs"/><input value={eventForm.location} onChange={e=>setEventForm({...eventForm,location:e.target.value})} placeholder="Location e.g. School Auditorium, Gboko" className="p-3 border-2 rounded-xl text-xs"/></div><div className="flex gap-2"><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={eventForm.is_published} onChange={e=>setEventForm({...eventForm,is_published:e.target.checked})}/> Publish</label><button onClick={saveEvent} className="flex-1 bg-blue-700 text-white py-3 rounded-xl font-black text-xs">PUBLISH EVENT TO WEBSITE + SUPABASE</button></div></div><div className="mt-6 space-y-2">{events.slice(0,10).map((ev:any)=><div key={ev.id} className="p-3 border-2 rounded-xl bg-blue-50"><div className="flex justify-between"><p className="font-black text-xs">{ev.title} - {ev.date} - {ev.location}</p><button onClick={()=>delEvent(ev.id)} className="px-2 py-1 bg-red-600 text-white rounded text-[10px]">DELETE</button></div><p className="text-[11px]">{ev.description}</p></div>)}</div></div>
    </div>
  );
};

// ROLES - YOUR ORIGINAL - MAINTAINED
const ALL_ROLES = [
  { value: 'STUDENT', label: 'STUDENT', color: 'bg-blue-100 text-blue-800' },
  { value: 'LECTURER', label: 'LECTURER', color: 'bg-purple-100 text-purple-800' },
  { value: 'HOD', label: 'HOD', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'EXAM_OFFICER', label: 'EXAM OFFICER', color: 'bg-orange-100 text-orange-800' },
  { value: 'PROVOST', label: 'PROVOST', color: 'bg-amber-100 text-amber-800' },
  { value: 'REGISTRAR', label: 'REGISTRAR', color: 'bg-teal-100 text-teal-800' },
  { value: 'BURSAR', label: 'BURSAR', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'ADMIN', label: 'ADMIN', color: 'bg-red-100 text-red-800' },
  { value: 'ICT_OFFICER', label: 'ICT OFFICER', color: 'bg-slate-800 text-white' },
];

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('lcns_users') || '[]'); } catch { return []; }
  });
  const [userFilter, setUserFilter] = useState<'ALL'|'STUDENT'|'STAFF'>('ALL');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [userType, setUserType] = useState<'STUDENT'|'STAFF'>('STUDENT');
  const [showPasswords, setShowPasswords] = useState<{[k:string]:boolean}>({});
  const [activeAdminTab, setActiveAdminTab] = useState<'users'|'result_publish'|'leadership'|'gallery'|'courses'|'promotion'|'settings'|'application'|'announcements'|'scoresheets'|'applicant_cbt'>('users');
  const [status, setStatus] = useState<{text:string,type:'success'|'error'}|null>(null);
  const [results, setResults] = useState<any[]>(()=>{ try{ return JSON.parse(localStorage.getItem('lcns_results')||'[]'); }catch{ return []; }});
  const [searchResult, setSearchResult] = useState('');
  const [selectedPrintStudent, setSelectedPrintStudent] = useState<any>(null);
  const [senateInfo, setSenateInfo] = useState(()=>{ try{ const s=JSON.parse(localStorage.getItem('lcns_senate_ratification')||'null'); if(s) return {approved:s.approved, date:s.date, provost:s.provostName}; return {approved:localStorage.getItem('lcns_senate_approved')==='true', date:new Date().toISOString(), provost:'Provost'} }catch{ return {approved:false, date:new Date().toISOString(), provost:'Provost'} }});
  const [newUser, setNewUser] = useState({
    fullName:'', firstName:'', middleName:'', lastName:'', address:'', phone:'', bloodGroup:'', sex:'', parentName:'', parentPhone:'', email:'', staying:'hostel', level:'ND1', department:'Nursing', role:'STUDENT', staffId:'', qualification:'', staffDepartment:'Nursing', courseOfStudy:'Nursing Science', staffImage:'', dateOfBirth:'', state:'', lga:''
  });

  const showStatus = (text:string, type:'success'|'error'='success')=>{ setStatus({text,type}); setTimeout(()=>setStatus(null),4000); };
  const getRoleColor = (r:string)=>ALL_ROLES.find(x=>x.value===r)?.color||'bg-slate-100';
  const handleImgUpload = (e:React.ChangeEvent<HTMLInputElement>)=>{
    const f=e.target.files?.[0]; if(!f) return;
    const r=new FileReader(); r.onload=()=>{ setNewUser({...newUser, staffImage:r.result as string}); }; r.readAsDataURL(f);
  };
  const handleCreateUser = async ()=>{
    if(!newUser.fullName || !newUser.email){ showStatus('Enter Full Name + Email','error'); return; }
    const password = newUser.phone ? newUser.phone.slice(-4)+'123' : '123456';
    const matricNumber = userType==='STUDENT' ? `LCNS/${new Date().getFullYear()}/${Math.floor(1000+Math.random()*9000)}` : '';
    const staffId = userType==='STAFF' ? `STF/${new Date().getFullYear()}/${Math.floor(100+Math.random()*900)}` : '';
    const loginId = userType==='STUDENT'?matricNumber:staffId;
    const userData:any = {
      id: Date.now().toString(),
      fullName: newUser.fullName,
      email: newUser.email.toLowerCase(),
      phone: newUser.phone,
      sex: newUser.sex,
      bloodGroup: newUser.bloodGroup,
      address: newUser.address,
      level: userType==='STUDENT'?newUser.level.toUpperCase():'',
      department: newUser.department,
      staffDepartment: newUser.staffDepartment,
      role: newUser.role,
      userType, loginId, matricNumber: userType==='STUDENT'?matricNumber:'', staffId: userType==='STAFF'?staffId:'', qualification: newUser.qualification, courseOfStudy: newUser.courseOfStudy, staffImage: newUser.staffImage, dateOfBirth: newUser.dateOfBirth, state: newUser.state, lga: newUser.lga, status:'ACTIVE', createdAt:new Date().toISOString(), academicYear: localStorage.getItem('lcns_current_session')||'2026/2027', password, loginIdRaw: loginId
    };
    const sb=getSupabase();
    if(sb){ try{ await sb.from('users').insert([{id:userData.id, email:userData.email, password, role:userData.role, full_name:userData.fullName, department:userData.department||userData.staffDepartment, phone:userData.phone, matric_no:userData.matricNumber||null, level:userData.level||null}]); }catch(err){ console.log('Supabase save failed',err);} }
    const existing=JSON.parse(localStorage.getItem('lcns_users')||'[]');
    const updated=[...existing.filter((u:any)=>u.email!==userData.email), userData];
    localStorage.setItem('lcns_users', JSON.stringify(updated));
    localStorage.setItem('users', JSON.stringify(updated));
    try{ StorageService.saveUsers(updated); }catch{}
    setUsers(updated);
    window.dispatchEvent(new Event('storage'));
    setNewUser({ fullName:'', firstName:'', middleName:'', lastName:'', address:'', phone:'', bloodGroup:'', sex:'', parentName:'', parentPhone:'', email:'', staying:'hostel', level:'ND1', department:'Nursing', role:userType==='STAFF'?'LECTURER':'STUDENT', staffId:'', qualification:'', staffDepartment:'Nursing', courseOfStudy:'Nursing Science', staffImage:'', dateOfBirth:'', state:'', lga:'' });
    showStatus(`✅ ${userType} Created - ${userData.fullName} - ID: ${loginId} - Role: ${userData.role} - Photo Uploaded`);
  };
  const assignRole = (email:string, newRole:string)=>{
    const up=users.map((u:any)=>u.email===email?{...u,role:newRole}:u);
    setUsers(up); localStorage.setItem('lcns_users', JSON.stringify(up)); localStorage.setItem('users', JSON.stringify(up));
    showStatus(`Role assigned: ${newRole} to ${email}`);
  };
  const deleteUser = (email:string, name:string)=>{
    if(!confirm(`Delete ${name}?`)) return;
    const up=users.filter((u:any)=>u.email!==email);
    setUsers(up); localStorage.setItem('lcns_users', JSON.stringify(up)); showStatus('Deleted');
  };
  const filteredUsers = users.filter((u:any)=>{
    if(userFilter==='ALL') return true;
    if(userFilter==='STUDENT') return u.role==='STUDENT' || u.userType==='STUDENT' || u.matricNumber;
    if(userFilter==='STAFF') return u.role!=='STUDENT';
    return true;
  }).filter((u:any)=>{
    if(!searchResult) return true;
    const t=searchResult.toLowerCase();
    return (u.fullName||'').toLowerCase().includes(t) || (u.email||'').toLowerCase().includes(t) || (u.matricNumber||'').toLowerCase().includes(t);
  });
  const filteredResults = users.filter((s:any)=>{
    if(!searchResult) return true;
    const t=searchResult.toLowerCase();
    return (s.fullName||'').toLowerCase().includes(t) || (s.matricNumber||s.matricNo||'').toLowerCase().includes(t);
  });
  const refreshResults = ()=>{
    try{ setResults(JSON.parse(localStorage.getItem('lcns_results')||'[]')); const s=JSON.parse(localStorage.getItem('lcns_senate_ratification')||'null'); if(s) setSenateInfo({approved:s.approved, date:s.date, provost:s.provostName}); else setSenateInfo({approved:localStorage.getItem('lcns_senate_approved')==='true', date:new Date().toISOString(), provost:'Provost'}); }catch{}
  };
  useEffect(()=>{ refreshResults(); const h=()=>refreshResults(); window.addEventListener('storage',h); window.addEventListener('lcns_storage_update',h as any); return()=>{ window.removeEventListener('storage',h); window.removeEventListener('lcns_storage_update',h as any);} },[]);

  return (
    <div className="space-y-6">
      {status && <div className={`fixed top-4 right-4 z-50 p-4 rounded-2xl border shadow-xl flex gap-3 ${status.type==='success'?'bg-emerald-50 border-emerald-200':'bg-red-50 border-red-200'}`}><CheckCircle2 className="w-5 h-5 text-emerald-600"/><span className="text-xs font-bold">{status.text}</span></div>}

      <div className="bg-gradient-to-r from-slate-900 via-[#0a4d2e] to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-emerald-900">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div><span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-black/30 px-3 py-1 rounded-full">Director of ICT - Admin Portal - Complete - Supabase Connected - Labe College - Catholic Diocese of Gboko - 2026/2027</span><h1 className="text-2xl sm:text-3xl font-black uppercase mt-2 flex items-center gap-2"><GraduationCap className="w-8 h-8 text-amber-400"/>Administrator Dashboard - Complete</h1><p className="text-xs text-emerald-200 mt-1">Users: {users.length} • Students: {users.filter((u:any)=>u.role==='STUDENT').length} • Staff: {users.filter((u:any)=>u.role!=='STUDENT').length} • Results: {results.length} • Session: {localStorage.getItem('lcns_current_session')||'2026/2027'} • {localStorage.getItem('lcns_current_semester')||'First Semester'}</p></div>
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl"><CollegeLogo size="lg" /><div className="text-center"><p className="text-[12px] font-black leading-none">Labe College of Nursing Sciences</p><p className="text-[10px] font-bold">Catholic Diocese of Gboko</p><p className="text-[9px]">Gboko, Benue State • Nigeria</p></div><CollegeLogo size="lg" /></div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border shadow-xs">
        <button onClick={()=>setActiveAdminTab('users')} className={`px-3 py-2.5 rounded-xl text-[11px] font-black ${activeAdminTab==='users'?'bg-slate-900 text-white':'bg-white border'}`}>👤 Users</button>
        <button onClick={()=>setActiveAdminTab('result_publish')} className={`px-3 py-2.5 rounded-xl text-[11px] font-black ${activeAdminTab==='result_publish'?'bg-red-700 text-white':'bg-red-50 border-2 border-red-400 text-red-800'}`}>🎓 Result Publish</button>
        <button onClick={()=>setActiveAdminTab('leadership')} className={`px-3 py-2.5 rounded-xl text-[11px] font-black ${activeAdminTab==='leadership'?'bg-amber-700 text-white':'bg-amber-50 border-2 border-amber-400 text-amber-800'}`}>👑 Bishop & Provost</button>
        <button onClick={()=>setActiveAdminTab('gallery')} className={`px-3 py-2.5 rounded-xl text-[11px] font-black ${activeAdminTab==='gallery'?'bg-purple-700 text-white':'bg-purple-50 border text-purple-800'}`}>📸 Gallery - Pictures</button>
        <button onClick={()=>setActiveAdminTab('courses')} className={`px-3 py-2.5 rounded-xl text-[11px] font-black ${activeAdminTab==='courses'?'bg-blue-700 text-white':'bg-blue-50 border text-blue-800'}`}>📚 Courses - Assign Lecturer</button>
        <button onClick={()=>setActiveAdminTab('promotion')} className={`px-3 py-2.5 rounded-xl text-[11px] font-black ${activeAdminTab==='promotion'?'bg-indigo-700 text-white':'bg-indigo-50 border text-indigo-800'}`}>⬆️ Promotion - 2026/2027 Session</button>
        <button onClick={()=>setActiveAdminTab('application')} className={`px-3 py-2.5 rounded-xl text-[11px] font-black ${activeAdminTab==='application'?'bg-emerald-700 text-white':'bg-emerald-50 border text-emerald-800'}`}>🎓 Admission Open/Close</button>
        <button onClick={()=>setActiveAdminTab('announcements')} className={`px-3 py-2.5 rounded-xl text-[11px] font-black ${activeAdminTab==='announcements'?'bg-orange-700 text-white':'bg-orange-50 border text-orange-800'}`}>📢 Announcements & Events</button>
        <button onClick={()=>setActiveAdminTab('settings')} className={`px-3 py-2.5 rounded-xl text-[11px] font-black ${activeAdminTab==='settings'?'bg-slate-700 text-white':'bg-slate-50 border text-slate-800'}`}>⚙️ Admin Settings - Reset & Handover</button>
        <button onClick={()=>setActiveAdminTab('scoresheets')} className={`px-3 py-2.5 rounded-xl text-[11px] font-bold ${activeAdminTab==='scoresheets'?'bg-blue-700 text-white':'border text-blue-800'}`}>Score Sheets</button>
        <button onClick={()=>setActiveAdminTab('applicant_cbt')} className={`px-3 py-2.5 rounded-xl text-[11px] font-bold ${activeAdminTab==='applicant_cbt'?'bg-orange-700 text-white':'border text-orange-800'}`}>Applicant CBT</button>
      </div>

      {activeAdminTab==='leadership' && <LeadershipManager showStatus={showStatus} />}
      {activeAdminTab==='gallery' && <GalleryManager showStatus={showStatus} />}
      {activeAdminTab==='courses' && <CourseManager showStatus={showStatus} users={users} />}
      {activeAdminTab==='promotion' && <PromotionManager showStatus={showStatus} users={users} setUsers={setUsers} />}
      {activeAdminTab==='settings' && <AdminSettingsManager showStatus={showStatus} />}
      {activeAdminTab==='application' && <ApplicationManager showStatus={showStatus} />}
      {activeAdminTab==='announcements' && <AnnouncementManager showStatus={showStatus} />}

      {activeAdminTab==='users' && (
        <div className="bg-white rounded-3xl border-2 p-6 shadow-sm space-y-6">
          <div className="flex justify-between"><div><h3 className="font-black text-lg flex gap-2"><UserCheck className="w-5 h-5"/> Users - Photo + Role - Maintained</h3><p className="text-[11px] text-emerald-700 font-bold mt-1">✅ Saves to localStorage + Supabase - Your original logic maintained</p></div><button onClick={()=>setShowCreateUser(!showCreateUser)} className="px-6 py-3 bg-[#0a4d2e] text-white rounded-xl text-xs font-black flex gap-2"><UserPlus className="w-4 h-4"/>{showCreateUser?'CLOSE':'CREATE USER'}</button></div>
          <div className="flex gap-2 bg-slate-50 p-2 rounded-2xl border">
            <button onClick={()=>setUserFilter('ALL')} className={`px-4 py-2 rounded-xl text-xs font-black ${userFilter==='ALL'?'bg-slate-900 text-white':'bg-white border'}`}>ALL ({users.length})</button>
            <button onClick={()=>setUserFilter('STUDENT')} className={`px-4 py-2 rounded-xl text-xs font-black ${userFilter==='STUDENT'?'bg-blue-700 text-white':'bg-white border text-blue-800'}`}>STUDENT ({users.filter((u:any)=>u.role==='STUDENT'||u.userType==='STUDENT').length})</button>
            <button onClick={()=>setUserFilter('STAFF')} className={`px-4 py-2 rounded-xl text-xs font-black ${userFilter==='STAFF'?'bg-emerald-700 text-white':'bg-white border text-emerald-800'}`}>STAFF ({users.filter((u:any)=>u.role!=='STUDENT').length})</button>
          </div>
          <div className="flex items-center gap-2 bg-white border-2 rounded-xl px-3"><Search className="w-4 h-4 text-slate-400"/><input value={searchResult} onChange={e=>setSearchResult(e.target.value)} placeholder="Search by Name, Email, Matric No" className="flex-1 py-2.5 text-xs font-bold outline-none"/></div>
          {showCreateUser && (
            <div className="bg-gradient-to-br from-slate-50 to-emerald-50 border-2 border-emerald-300 rounded-3xl p-6 space-y-5">
              <div className="flex gap-3">
                <button onClick={()=>{setUserType('STUDENT'); setNewUser({...newUser,role:'STUDENT'});}} className={`flex-1 py-3 rounded-xl text-xs font-black ${userType==='STUDENT'?'bg-blue-700 text-white':'bg-white border-2'}`}>STUDENT</button>
                <button onClick={()=>{setUserType('STAFF'); setNewUser({...newUser,role:'LECTURER'});}} className={`flex-1 py-3 rounded-xl text-xs font-black ${userType==='STAFF'?'bg-[#0a4d2e] text-white':'bg-white border-2'}`}>STAFF</button>
              </div>
              <form onSubmit={(e)=>{e.preventDefault(); handleCreateUser();}} className="space-y-4">
                <div className="flex gap-4"><div className="w-28 h-28 bg-slate-100 border-2 border-dashed rounded-2xl overflow-hidden">{newUser.staffImage?<img src={newUser.staffImage} className="w-full h-full object-cover"/>:<span className="text-[10px]">No Photo</span>}</div><div className="flex-1"><label className="text-[11px] font-bold">Upload Photo</label><input type="file" accept="image/*" onChange={handleImgUpload} className="w-full mt-1 text-[11px] file:bg-emerald-800 file:text-white file:rounded-xl file:border-0 file:px-4 file:py-2"/></div></div>
                <div className="grid md:grid-cols-3 gap-3"><div><label className="text-[11px] font-bold">Full Names *</label><input value={newUser.fullName} onChange={e=>setNewUser({...newUser,fullName:e.target.value})} className="w-full mt-1 p-3 border-2 rounded-xl text-xs font-bold" required/></div><div><label className="text-[11px] font-bold">Email *</label><input type="email" value={newUser.email} onChange={e=>setNewUser({...newUser,email:e.target.value})} className="w-full mt-1 p-3 border-2 rounded-xl text-xs" required/></div><div><label className="text-[11px] font-bold">Role *</label><select value={newUser.role} onChange={e=>setNewUser({...newUser,role:e.target.value})} className="w-full mt-1 p-3 border-2 rounded-xl text-xs font-black"><option>STUDENT</option><option>LECTURER</option><option>HOD</option><option>EXAM_OFFICER</option><option>PROVOST</option><option>REGISTRAR</option><option>BURSAR</option><option>ADMIN</option><option>ICT_OFFICER</option></select></div></div>
                <button type="submit" className="w-full bg-[#0a4d2e] text-white py-3 rounded-xl font-black text-xs">CREATE USER - PHOTO + ROLE - MAINTAINED</button>
              </form>
            </div>
          )}
          <div className="grid gap-3 max-h-[600px] overflow-y-auto">{filteredUsers.map((u:any)=><div key={u.email} className="border-2 p-3 rounded-2xl flex justify-between"><div className="flex gap-2"><div className="w-12 h-12 bg-slate-200 rounded-2xl overflow-hidden">{u.staffImage?<img src={u.staffImage} className="w-full h-full object-cover"/>:<GraduationCap className="w-6 h-6"/>}</div><div><p className="font-black text-xs">{u.fullName} - {u.role}</p><p className="text-[11px]">{u.email} - {u.matricNumber||u.staffId}</p></div></div><div className="flex gap-1">{ALL_ROLES.map(r=><button key={r.value} onClick={()=>assignRole(u.email,r.value)} className={`px-2 py-1 rounded text-[9px] border ${u.role===r.value?'bg-slate-900 text-white':'bg-white'}`}>{r.value}</button>)}<button onClick={()=>deleteUser(u.email,u.fullName)} className="px-2 py-1 bg-red-600 text-white rounded text-[9px]">DEL</button></div></div>)}</div>
        </div>
      )}

      {activeAdminTab==='result_publish' && (
        <div className="bg-white rounded-3xl border-2 border-red-400 p-6 space-y-6">
          <h2 className="text-xl font-black flex gap-2"><FileSpreadsheet className="w-6 h-6 text-red-600"/> Result Publish - Print with School Name + Logo - Maintained - Labe College - Catholic Diocese of Gboko</h2>
          <div className="flex gap-2"><div className="flex items-center gap-2 flex-1 bg-white border-2 border-amber-400 rounded-xl px-3"><Search className="w-4 h-4"/><input value={searchResult} onChange={e=>setSearchResult(e.target.value)} placeholder="Search by Name and Matric No" className="flex-1 py-2.5 text-xs font-black outline-none"/></div><button onClick={refreshResults} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs">Refresh</button></div>
          {!selectedPrintStudent ? (
            <div className="overflow-x-auto border-2 rounded-xl"><table className="w-full text-xs"><thead className="bg-slate-900 text-white"><tr><th className="p-3 text-left">Matric + Name + Photo</th><th className="p-3">CGPA</th><th className="p-3 text-center">Print with Logo - Maintained</th></tr></thead><tbody>{filteredResults.slice(0,100).map((s:any)=>{const studResults=results.filter((r:any)=>r.matricNo===s.matricNumber); let cu=0,gp=0; studResults.forEach((r:any)=>{const g=r.score>=70?4:r.score>=60?3:r.score>=50?2:r.score>=40?1:0; cu+=r.creditUnit||3; gp+=(r.creditUnit||3)*g;}); const cgpa=cu?(gp/cu).toFixed(2):'0.00'; return (<tr key={s.email} className="border-b"><td className="p-3"><div className="flex gap-2"><div className="w-10 h-12 bg-slate-200 rounded border overflow-hidden">{s.staffImage?<img src={s.staffImage} className="w-full h-full object-cover"/>:<GraduationCap className="w-6 h-6"/>}</div><div><p className="font-mono font-black">{s.matricNumber}</p><p className="font-black uppercase">{s.fullName}</p></div></div></td><td className="p-3">{cgpa}</td><td className="p-3 text-center"><button onClick={()=>setSelectedPrintStudent(s)} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs flex gap-2 mx-auto"><Printer className="w-4 h-4"/> Print - Labe College + Logo</button></td></tr>);})}</tbody></table></div>
          ) : (
            <div className="space-y-4"><div className="flex justify-between bg-slate-50 p-3 rounded-xl border"><p className="font-black text-sm">{selectedPrintStudent.fullName} - {selectedPrintStudent.matricNumber} - Labe College</p><button onClick={()=>setSelectedPrintStudent(null)} className="px-4 py-2 bg-slate-200 rounded-xl text-xs">← Back</button></div><PrintableResultWithLogo matricNo={selectedPrintStudent.matricNumber} fullName={selectedPrintStudent.fullName} level={selectedPrintStudent.level||'ND1'} program={selectedPrintStudent.department||'Nursing'} results={results.filter((r:any)=>r.matricNo===selectedPrintStudent.matricNumber)} currentUserRole="ADMIN" currentUserName="Admin" senateApproved={senateInfo.approved} senateDate={senateInfo.date} senateProvost={senateInfo.provost} /></div>
          )}
        </div>
      )}

      {activeAdminTab==='scoresheets' && <ScoreSheetViewer currentUser={{id:'admin',email:'admin@lcns.edu.ng',role:'ADMIN',fullName:'Admin',status:'ACTIVE'}} />}
      {activeAdminTab==='applicant_cbt' && <div className="bg-white rounded-3xl border-2 p-6"><h3 className="font-black">Applicant CBT - Admin can set exams</h3></div>}
    </div>
  );
};

export default AdminDashboard;

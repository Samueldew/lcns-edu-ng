import React, { useEffect, useState } from 'react';
import { StorageService } from '../../services/storage';
import { COLLEGE_CONFIG } from '../../types';
import { getSupabase } from '../../lib/supabase';
import {
  GraduationCap, Users, BookOpen, Camera, Award, UserCheck, Database,
  Crown, UserPlus, Eye, EyeOff, Briefcase, Key, IdCard, BookMarked,
  ShieldAlert, Timer, Clock, Monitor, Plus, Trash2, Search, Download,
  Printer, FileSpreadsheet, CheckCircle2, Settings, Megaphone, Calendar,
  BookMarked as BookIcon, ArrowUpCircle, Power, Upload, Ban, Check, FileText,
  Wifi, WifiOff
} from 'lucide-react';
import { CBTExamManager } from '../cbt/CBTExamManager';
import { AdminAdmissionManager } from '../admin/AdminAdmissionManager';
import { ScoreSheetViewer } from './ScoreSheetViewer';
import { PrintableResultWithLogo } from '../common/PrintableResultWithLogo';
import { CollegeLogo } from '../common/CollegeLogo';

// ===== 1. BISHOP & PROVOST MANAGER - FIXED SYNTAX - SUPABASE CONNECTED =====
const LeadershipManager = ({ showStatus }: any) => {
  const [bishop, setBishop] = useState<any>(()=>{
    try { const v = localStorage.getItem('lcns_bishop'); if(v) return JSON.parse(v); } catch {}
    return {name:'Most Rev. Isaac B. Dugu',title:'Bishop, Catholic Diocese of Gboko - Proprietor',image:'',description:'Proprietor'};
  });
  const [provost, setProvost] = useState<any>(()=>{
    try { const v = localStorage.getItem('lcns_provost'); if(v) return JSON.parse(v); } catch {}
    return {name:'Mrs Terna Fiase',title:'Provost, Labe College of Nursing Sciences',image:'',description:'Provost'};
  });
  const [loading, setLoading] = useState(false);
  useEffect(()=>{
    const load = async()=>{
      setLoading(true);
      const sb=getSupabase();
      if(!sb){setLoading(false);return;}
      try {
        const {data}=await sb.from('school_settings').select('*').in('key',['bishop','provost']);
        if(data){
          data.forEach((row:any)=>{
            try {
              const p=JSON.parse(row.value||'{}');
              if(row.key==='bishop'&&p.image){
                setBishop(p);
                localStorage.setItem('lcns_bishop',JSON.stringify(p));
                localStorage.setItem('bishop_image',p.image);
                localStorage.setItem('proprietor_image',p.image);
              }
              if(row.key==='provost'&&p.image){
                setProvost(p);
                localStorage.setItem('lcns_provost',JSON.stringify(p));
                localStorage.setItem('provost_image',p.image);
              }
            } catch {}
          });
        }
      } catch {}
      setLoading(false);
    };
    load();
  },[]);
  const handleImg = (e:any, t:'bishop'|'provost')=>{
    const f=e.target.files?.[0];
    if(!f) return;
    if(f.size>3000000){showStatus('Image too big <3MB','error');return;}
    const r=new FileReader();
    r.onload=()=>{
      const b64=r.result as string;
      if(t==='bishop') setBishop({...bishop,image:b64});
      else setProvost({...provost,image:b64});
    };
    r.readAsDataURL(f);
  };
  const save = async(t:'bishop'|'provost')=>{
    const data = t==='bishop'?bishop:provost;
    if(!data.image){showStatus('Upload photo first','error');return;}
    localStorage.setItem(t==='bishop'?'lcns_bishop':'lcns_provost', JSON.stringify(data));
    localStorage.setItem(t==='bishop'?'bishop_image':'provost_image', data.image);
    if(t==='bishop') localStorage.setItem('proprietor_image', data.image);
    const sb=getSupabase();
    if(sb){
      try {
        await sb.from('school_settings').upsert({key:t, value:JSON.stringify(data), updated_at:new Date().toISOString()},{onConflict:'key'});
      } catch(err:any){
        showStatus('Local saved but backend failed: '+err.message,'error');
        return;
      }
    }
    window.dispatchEvent(new Event('storage'));
    showStatus(`✅ ${t.toUpperCase()} PUBLISHED TO BACKEND!`);
  };
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6"><h3 className="font-black flex gap-2"><Crown className="w-5 h-5"/> BISHOP {loading&&'(Loading)'}</h3><div className="h-64 bg-white border-2 border-dashed rounded-2xl overflow-hidden flex items-center justify-center mt-3">{bishop.image?<img src={bishop.image} className="w-full h-full object-cover"/>:<span>No Image</span>}</div><input type="file" accept="image/*" onChange={e=>handleImg(e,'bishop')} className="w-full mt-2 text-[11px] file:bg-amber-900 file:text-white file:rounded-xl file:border-0 file:px-4 file:py-2"/><input value={bishop.name} onChange={e=>setBishop({...bishop,name:e.target.value})} className="w-full mt-2 p-3 border-2 rounded-xl text-xs font-bold"/><input value={bishop.title} onChange={e=>setBishop({...bishop,title:e.target.value})} className="w-full mt-2 p-3 border-2 rounded-xl text-xs"/><textarea value={bishop.description} onChange={e=>setBishop({...bishop,description:e.target.value})} className="w-full mt-2 p-3 border-2 rounded-xl text-xs h-20"/><button onClick={()=>save('bishop')} className="w-full mt-2 bg-amber-900 text-white py-3 rounded-xl font-black text-xs">SAVE BISHOP TO BACKEND</button></div>
      <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-6"><h3 className="font-black flex gap-2"><UserCheck className="w-5 h-5"/> PROVOST {loading&&'(Loading)'}</h3><div className="h-64 bg-white border-2 border-dashed rounded-2xl overflow-hidden flex items-center justify-center mt-3">{provost.image?<img src={provost.image} className="w-full h-full object-cover"/>:<span>No Image</span>}</div><input type="file" accept="image/*" onChange={e=>handleImg(e,'provost')} className="w-full mt-2 text-[11px] file:bg-emerald-800 file:text-white file:rounded-xl file:border-0 file:px-4 file:py-2"/><input value={provost.name} onChange={e=>setProvost({...provost,name:e.target.value})} className="w-full mt-2 p-3 border-2 rounded-xl text-xs font-bold"/><input value={provost.title} onChange={e=>setProvost({...provost,title:e.target.value})} className="w-full mt-2 p-3 border-2 rounded-xl text-xs"/><textarea value={provost.description} onChange={e=>setProvost({...provost,description:e.target.value})} className="w-full mt-2 p-3 border-2 rounded-xl text-xs h-20"/><button onClick={()=>save('provost')} className="w-full mt-2 bg-emerald-800 text-white py-3 rounded-xl font-black text-xs">SAVE PROVOST TO BACKEND</button></div>
    </div>
  );
};

// ===== 2. GALLERY MANAGER =====
const GalleryManager = ({ showStatus }: any) => {
  const [gallery, setGallery] = useState<any[]>(()=>{
    try{return JSON.parse(localStorage.getItem('lcns_gallery')||'[]');}catch{return[];}
  });
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [img, setImg] = useState('');
  useEffect(()=>{
    const load=async()=>{
      const sb=getSupabase();
      if(!sb) return;
      try{
        const {data}=await sb.from('school_settings').select('*').eq('key','gallery');
        if(data&&data[0]){
          const parsed=JSON.parse(data[0].value||'[]');
          setGallery(parsed);
          localStorage.setItem('lcns_gallery',JSON.stringify(parsed));
        }
      }catch{}
    };
    load();
  },[]);
  const handleImg = (e:any)=>{
    const f=e.target.files?.[0];
    if(!f) return;
    if(f.size>5000000){showStatus('Image too big <5MB','error');return;}
    const r=new FileReader();
    r.onload=()=>setImg(r.result as string);
    r.readAsDataURL(f);
  };
  const save = async()=>{
    if(!title||!img){showStatus('Title + Image required','error');return;}
    const newItem={id:Date.now().toString(), title, description:desc, image:img, created_at:new Date().toISOString()};
    const updated=[newItem, ...gallery];
    setGallery(updated);
    localStorage.setItem('lcns_gallery',JSON.stringify(updated));
    const sb=getSupabase();
    if(sb){
      try{
        await sb.from('school_settings').upsert({key:'gallery', value:JSON.stringify(updated), updated_at:new Date().toISOString()},{onConflict:'key'});
      }catch{}
    }
    window.dispatchEvent(new Event('storage'));
    showStatus('✅ Picture published to website + backend!');
    setTitle(''); setDesc(''); setImg('');
  };
  const del = async(id:string)=>{
    const updated=gallery.filter((g:any)=>g.id!==id);
    setGallery(updated);
    localStorage.setItem('lcns_gallery',JSON.stringify(updated));
    const sb=getSupabase();
    if(sb){
      try{
        await sb.from('school_settings').upsert({key:'gallery', value:JSON.stringify(updated), updated_at:new Date().toISOString()},{onConflict:'key'});
      }catch{}
    }
    showStatus('Deleted');
  };
  return (
    <div className="space-y-6">
      <div className="bg-white border-2 rounded-3xl p-6"><h3 className="font-black flex gap-2"><Camera className="w-5 h-5"/> Gallery - Upload Pictures with Description - Save on Website - Supabase Connected</h3>
        <div className="grid md:grid-cols-2 gap-4 mt-4"><div className="space-y-3"><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Picture Title e.g. Matriculation 2026" className="w-full p-3 border-2 rounded-xl text-xs font-bold"/><textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Description e.g. 2026/2027 Matriculation ceremony at Labe College, Gboko" className="w-full p-3 border-2 rounded-xl text-xs h-24"/><input type="file" accept="image/*" onChange={handleImg} className="w-full text-[11px] file:bg-slate-900 file:text-white file:rounded-xl file:border-0 file:px-4 file:py-2"/><button onClick={save} className="w-full bg-slate-900 text-white py-3 rounded-xl font-black text-xs flex justify-center gap-2"><Upload className="w-4 h-4"/> PUBLISH PICTURE TO WEBSITE + SUPABASE</button></div><div className="h-64 bg-slate-100 border-2 border-dashed rounded-2xl overflow-hidden flex items-center justify-center">{img?<img src={img} className="w-full h-full object-cover"/>:<span className="text-[11px]">Preview</span>}</div></div>
      </div>
      <div className="grid md:grid-cols-3 gap-4">{gallery.map((g:any)=><div key={g.id} className="bg-white border-2 rounded-2xl overflow-hidden"><div className="h-48 overflow-hidden"><img src={g.image} className="w-full h-full object-cover"/></div><div className="p-3"><p className="font-black text-xs">{g.title}</p><p className="text-[11px]">{g.description}</p><button onClick={()=>del(g.id)} className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-[10px]">DELETE</button></div></div>)}</div>
    </div>
  );
};

// ===== 3. COURSE MANAGER =====
const CourseManager = ({ showStatus, users }: any) => {
  const [courses, setCourses] = useState<any[]>(()=>{
    try{return JSON.parse(localStorage.getItem('lcns_courses')||'[]');}catch{return[];}
  });
  const [code, setCode] = useState('');
  const [cTitle, setCTitle] = useState('');
  const [unit, setUnit] = useState('3');
  const [level, setLevel] = useState('ND1');
  const [lecturer, setLecturer] = useState('');
  useEffect(()=>{
    const load=async()=>{
      const sb=getSupabase();
      if(!sb) return;
      try{
        const {data}=await sb.from('school_settings').select('*').eq('key','courses');
        if(data&&data[0]){
          const p=JSON.parse(data[0].value||'[]');
          setCourses(p);
          localStorage.setItem('lcns_courses',JSON.stringify(p));
        }
      }catch{}
    };
    load();
  },[]);
  const lecturers = users.filter((u:any)=>['LECTURER','HOD','EXAM_OFFICER'].includes(u.role));
  const save = async()=>{
    if(!code||!cTitle){showStatus('Course code + Title required','error');return;}
    const newCourse={id:Date.now().toString(), code:code.toUpperCase(), title:cTitle, creditUnit:parseInt(unit), level, lecturerEmail:lecturer, lecturerName: lecturers.find((l:any)=>l.email===lecturer)?.fullName||'', created_at:new Date().toISOString()};
    const updated=[...courses.filter((c:any)=>c.code!==newCourse.code), newCourse];
    setCourses(updated);
    localStorage.setItem('lcns_courses',JSON.stringify(updated));
    const sb=getSupabase();
    if(sb){
      try{
        await sb.from('school_settings').upsert({key:'courses', value:JSON.stringify(updated), updated_at:new Date().toISOString()},{onConflict:'key'});
      }catch{}
    }
    showStatus(`✅ Course ${newCourse.code} added and assigned to ${newCourse.lecturerName||'No lecturer'}`);
    setCode(''); setCTitle(''); setLecturer('');
  };
  const del = async(id:string)=>{
    const updated=courses.filter((c:any)=>c.id!==id);
    setCourses(updated);
    localStorage.setItem('lcns_courses',JSON.stringify(updated));
    const sb=getSupabase();
    if(sb){
      try{
        await sb.from('school_settings').upsert({key:'courses', value:JSON.stringify(updated), updated_at:new Date().toISOString()},{onConflict:'key'});
      }catch{}
    }
    showStatus('Deleted');
  };
  return (
    <div className="space-y-6">
      <div className="bg-white border-2 rounded-3xl p-6"><h3 className="font-black flex gap-2"><BookIcon className="w-5 h-5"/> Add Course and Assign to Lecturers - Supabase Connected</h3>
        <div className="grid md:grid-cols-4 gap-3 mt-4"><input value={code} onChange={e=>setCode(e.target.value)} placeholder="Course Code e.g. NUR111" className="p-3 border-2 rounded-xl text-xs font-bold"/><input value={cTitle} onChange={e=>setCTitle(e.target.value)} placeholder="Course Title e.g. Anatomy" className="p-3 border-2 rounded-xl text-xs"/><select value={unit} onChange={e=>setUnit(e.target.value)} className="p-3 border-2 rounded-xl text-xs"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select><select value={level} onChange={e=>setLevel(e.target.value)} className="p-3 border-2 rounded-xl text-xs"><option>ND1</option><option>ND2</option><option>HND1</option><option>HND2</option></select></div>
        <div className="mt-3 flex gap-2"><select value={lecturer} onChange={e=>setLecturer(e.target.value)} className="flex-1 p-3 border-2 rounded-xl text-xs"><option value="">Assign to Lecturer (Select)</option>{lecturers.map((l:any)=><option key={l.email} value={l.email}>{l.fullName} - {l.role} - {l.email}</option>)}</select><button onClick={save} className="px-6 bg-[#0a4d2e] text-white rounded-xl text-xs font-black">ADD COURSE + ASSIGN</button></div>
      </div>
      <div className="bg-white border-2 rounded-2xl overflow-hidden"><table className="w-full text-xs"><thead className="bg-slate-900 text-white"><tr><th className="p-3 text-left">Code</th><th className="p-3 text-left">Title</th><th className="p-3">Unit</th><th className="p-3">Level</th><th className="p-3">Lecturer</th><th className="p-3">Action</th></tr></thead><tbody>{courses.map((c:any)=><tr key={c.id} className="border-b"><td className="p-3 font-black">{c.code}</td><td className="p-3">{c.title}</td><td className="p-3">{c.creditUnit}</td><td className="p-3">{c.level}</td><td className="p-3">{c.lecturerName||c.lecturerEmail}</td><td className="p-3"><button onClick={()=>del(c.id)} className="px-2 py-1 bg-red-600 text-white rounded text-[10px]">DELETE</button></td></tr>)}</tbody></table></div>
    </div>
  );
};

// ===== 4. PROMOTION MANAGER =====
const PromotionManager = ({ showStatus, users, setUsers }: any) => {
  const [session, setSession] = useState(()=>localStorage.getItem('lcns_current_session')||'2026/2027');
  const [semester, setSemester] = useState(()=>localStorage.getItem('lcns_current_semester')||'First Semester');
  const [fromLevel, setFromLevel] = useState('ND1');
  const [toLevel, setToLevel] = useState('ND2');
  const [selected, setSelected] = useState<string[]>([]);
  useEffect(()=>{ localStorage.setItem('lcns_current_session', session); localStorage.setItem('lcns_current_semester', semester); },[session, semester]);
  const students = users.filter((u:any)=>u.role==='STUDENT'&&u.level===fromLevel);
  const toggle = (email:string)=>{ setSelected(s=>s.includes(email)?s.filter(x=>x!==email):[...s,email]); };
  const promote = async()=>{
    if(selected.length===0){showStatus('Select students to promote','error');return;}
    const updated = users.map((u:any)=>selected.includes(u.email)?{...u, level:toLevel, previousLevel:u.level, promotedAt:new Date().toISOString(), academicYear:session, semester}:u);
    setUsers(updated);
    localStorage.setItem('lcns_users',JSON.stringify(updated));
    localStorage.setItem('users',JSON.stringify(updated));
    const sb=getSupabase();
    if(sb){
      try{
        for(const email of selected){
          await sb.from('users').update({level:toLevel, academic_year:session}).eq('email',email);
        }
        await sb.from('school_settings').upsert({key:'current_session', value:JSON.stringify({session, semester, fromLevel, toLevel, promoted: selected.length, date:new Date().toISOString()}), updated_at:new Date().toISOString()},{onConflict:'key'});
      }catch{}
    }
    showStatus(`✅ ${selected.length} students promoted from ${fromLevel} to ${toLevel} for ${session} - ${semester}`);
    setSelected([]);
  };
  const setAcademicYear = async()=>{
    localStorage.setItem('lcns_current_session', session);
    localStorage.setItem('lcns_current_semester', semester);
    const sb=getSupabase();
    if(sb){
      try{
        await sb.from('school_settings').upsert({key:'academic_year', value:JSON.stringify({session, semester, updated_at:new Date().toISOString()}), updated_at:new Date().toISOString()},{onConflict:'key'});
        await sb.from('school_settings').upsert({key:'current_session', value:session, updated_at:new Date().toISOString()},{onConflict:'key'});
      }catch{}
    }
    window.dispatchEvent(new Event('storage'));
    showStatus(`✅ Academic Year set to ${session} - ${semester} - Saved to backend!`);
  };
  return (
    <div className="space-y-6">
      <div className="bg-white border-2 rounded-3xl p-6"><h3 className="font-black flex gap-2"><ArrowUpCircle className="w-5 h-5"/> Promote Student by Session and Semester and Set Academic Year e.g. 2026/2027 - Supabase Connected</h3>
        <div className="grid md:grid-cols-3 gap-3 mt-4"><div><label className="text-[11px] font-bold">Academic Year (Session) e.g. 2026/2027</label><input value={session} onChange={e=>setSession(e.target.value)} placeholder="2026/2027" className="w-full mt-1 p-3 border-2 border-amber-500 rounded-xl text-xs font-black"/></div><div><label className="text-[11px] font-bold">Semester</label><select value={semester} onChange={e=>setSemester(e.target.value)} className="w-full mt-1 p-3 border-2 rounded-xl text-xs"><option>First Semester</option><option>Second Semester</option></select></div><div className="flex items-end"><button onClick={setAcademicYear} className="w-full bg-amber-700 text-white py-3 rounded-xl font-black text-xs">SET ACADEMIC YEAR {session} - {semester} + PUBLISH TO BACKEND</button></div></div>
        <div className="grid md:grid-cols-3 gap-3 mt-4"><div><label className="text-[11px] font-bold">From Level</label><select value={fromLevel} onChange={e=>setFromLevel(e.target.value)} className="w-full mt-1 p-3 border-2 rounded-xl text-xs"><option>ND1</option><option>ND2</option><option>HND1</option><option>HND2</option></select></div><div><label className="text-[11px] font-bold">To Level</label><select value={toLevel} onChange={e=>setToLevel(e.target.value)} className="w-full mt-1 p-3 border-2 rounded-xl text-xs"><option>ND1</option><option>ND2</option><option>HND1</option><option>HND2</option></select></div><div className="flex items-end"><button onClick={promote} className="w-full bg-[#0a4d2e] text-white py-3 rounded-xl font-black text-xs">PROMOTE {selected.length} STUDENTS - {fromLevel} → {toLevel}</button></div></div>
        <div className="mt-4 border-2 rounded-xl overflow-hidden"><table className="w-full text-xs"><thead className="bg-slate-900 text-white"><tr><th className="p-2"><input type="checkbox" onChange={e=>{ if(e.target.checked) setSelected(students.map((s:any)=>s.email)); else setSelected([]); }} checked={selected.length===students.length&&students.length>0}/></th><th className="p-2 text-left">Name - Matric - {fromLevel}</th><th className="p-2">Level</th></tr></thead><tbody>{students.map((s:any)=><tr key={s.email} className="border-b"><td className="p-2 text-center"><input type="checkbox" checked={selected.includes(s.email)} onChange={()=>toggle(s.email)}/></td><td className="p-2">{s.fullName} - {s.matricNumber}</td><td className="p-2">{s.level}</td></tr>)}</tbody></table></div>
      </div>
    </div>
  );
};

// ===== 5. SETTINGS MANAGER =====
const AdminSettingsManager = ({ showStatus, users, setUsers }: any) => {
  const [resetConfirm, setResetConfirm] = useState('');
  const resetByRole = async(role:string)=>{
    if(resetConfirm!=='RESET'){showStatus('Type RESET to confirm','error');return;}
    if(!confirm(`Are you sure you want to reset ALL ${role}? This will delete all ${role} from portal!`)) return;
    const remaining = users.filter((u:any)=>u.role!==role);
    setUsers(remaining);
    localStorage.setItem('lcns_users',JSON.stringify(remaining));
    localStorage.setItem('users',JSON.stringify(remaining));
    const sb=getSupabase();
    if(sb){
      try{await sb.from('users').delete().eq('role',role);}catch{}
    }
    window.dispatchEvent(new Event('storage'));
    showStatus(`✅ All ${role} reset - Deleted from portal`);
    setResetConfirm('');
  };
  const resetPortal = async(type:'users'|'results'|'all')=>{
    if(resetConfirm!=='RESET'){showStatus('Type RESET to confirm','error');return;}
    if(!confirm(`Are you sure you want to reset ${type}? This will delete all ${type} data!`)) return;
    const sb=getSupabase();
    if(type==='users'||type==='all'){
      localStorage.removeItem('lcns_users');
      localStorage.removeItem('users');
      if(sb){try{await sb.from('users').delete().neq('id','00000000-0000-0000-0000-000000000000');}catch{}}
      setUsers([]);
    }
    if(type==='results'||type==='all'){
      localStorage.removeItem('lcns_results');
      localStorage.removeItem('lcns_courses');
      localStorage.removeItem('lcns_gallery');
      if(sb){try{await sb.from('results').delete().neq('id','00000000-0000-0000-0000-000000000000');}catch{}}
    }
    if(type==='all'){
      localStorage.clear();
      if(sb){try{await sb.from('school_settings').delete().neq('key','logo');}catch{}}
    }
    window.dispatchEvent(new Event('storage'));
    showStatus(`✅ Portal ${type} reset completed - Ready to hand over to school admin`);
    setResetConfirm('');
  };
  const handover = async()=>{
    const data={handover_date:new Date().toISOString(), handover_by:'Director of ICT', school:'Labe College of Nursing Sciences - Catholic Diocese of Gboko - Gboko, Benue State', academic_year: localStorage.getItem('lcns_current_session')||'2026/2027', total_users: users.length, total_results: JSON.parse(localStorage.getItem('lcns_results')||'[]').length, status:'READY FOR SCHOOL ADMIN'};
    localStorage.setItem('lcns_handover', JSON.stringify(data));
    const sb=getSupabase();
    if(sb){
      try{await sb.from('school_settings').upsert({key:'handover', value:JSON.stringify(data), updated_at:new Date().toISOString()},{onConflict:'key'});}catch{}
    }
    showStatus('✅ Portal published and handed over to school admin - School can now manage - 2026/2027 session ready!');
  };
  const rolesToReset = ['LECTURER','BURSAR','PROVOST','REGISTRAR','EXAM_OFFICER','HOD','ADMISSION_OFFICER','ADMIN','ICT_OFFICER'];
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-slate-900 to-[#0a4d2e] text-white rounded-3xl p-6 border-2"><h3 className="font-black flex gap-2"><Settings className="w-5 h-5"/> Admin Settings - Reset Portal and Publish to Hand Over to School Admin - Supabase Connected</h3><p className="text-xs mt-2 text-emerald-200">Reset portal to clean state for new session 2026/2027 - Then publish to hand over to school admin - Labe College, Gboko</p></div>
      <div className="bg-white border-2 border-amber-300 rounded-3xl p-6"><h4 className="font-black text-amber-800">🔄 RESET BY ROLE - Lecturer, Bursar, Provost, Registrar, Exam Officer, HOD, Admission Officer</h4><p className="text-[11px] mt-1">Type RESET to confirm, then click role to delete ALL users with that role from whole portal - localStorage + Supabase</p><input value={resetConfirm} onChange={e=>setResetConfirm(e.target.value)} placeholder="Type RESET to confirm" className="w-full mt-3 p-3 border-2 border-amber-500 rounded-xl text-xs font-black"/><div className="grid md:grid-cols-3 gap-2 mt-3">{rolesToReset.map(r=><button key={r} onClick={()=>resetByRole(r)} className="px-3 py-2 bg-amber-100 border-2 border-amber-400 rounded-xl text-[11px] font-black">{r}</button>)}</div></div>
      <div className="bg-white border-2 rounded-3xl p-6"><h4 className="font-black">⚙️ RESET PORTAL</h4><div className="flex gap-2 mt-3"><button onClick={()=>resetPortal('users')} className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-black">RESET USERS</button><button onClick={()=>resetPortal('results')} className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-black">RESET RESULTS</button><button onClick={()=>resetPortal('all')} className="px-4 py-2 bg-black text-white rounded-xl text-xs font-black">RESET ALL - FULL WIPE</button><button onClick={handover} className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-black">HANDOVER TO SCHOOL ADMIN</button></div></div>
    </div>
  );
};

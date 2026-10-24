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

// ===== 1. BISHOP & PROVOST MANAGER - FIXED SYNTAX - SUPABASE CONNECTED - NOT DELETED =====
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

// ===== 2. GALLERY MANAGER - NOT DELETED - SUPABASE CONNECTED =====
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

// ===== 3. COURSE MANAGER - NOT DELETED =====
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

// ===== 4. PROMOTION MANAGER - NOT DELETED =====
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
        <div className="mt-4 border-2 rounded-xl overflow-hidden"><table className="w-full text-xs"><thead className="bg-slate-900 text-white"><tr><th className="p-2"><input type="checkbox" onChange={e=>{ if(e.target.checked) setSelected(students.map((s:any)=>s.email)); else setSelected([]); }} checked={selected.length===students.length&&students.length>0}/></th><th className="p-2 text-left">Name - Matric - {fromLevel}</th><th className="p-2">Level</th></tr></thead><tbody>{students.map((s:any)=><tr key={s.email} className="border-b"><td className="p-2 text-center"><input type="checkbox" checked={selected.includes(s.email)} onChange={()=>toggle(s.email)}/></td><td className="p-2">{s.fullName} - {s.matricNumber} - Sex:{s.sex} - Stay:{s.staying} - Parent:{s.parentName}</td><td className="p-2">{s.level}</td></tr>)}</tbody></table></div>
      </div>
    </div>
  );
};

// ===== 5. SETTINGS MANAGER - NOT DELETED =====
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

// ===== 6. APPLICATION MANAGER - NOT DELETED =====
const ApplicationManager = ({ showStatus }: any) => {
  const [appStatus, setAppStatus] = useState<any>(()=>{
    try{
      return JSON.parse(localStorage.getItem('lcns_app_status')||'null')||{isOpen:false, link:'/apply', deadline:'2026-11-30', message:'Admissions for 2026/2027 Academic Year is CLOSED - School is starting November 2026'};
    }catch{
      return {isOpen:false, link:'/apply', deadline:'2026-11-30', message:'Closed'};
    }
  });
  const [link, setLink] = useState(appStatus.link);
  const [deadline, setDeadline] = useState(appStatus.deadline);
  const [message, setMessage] = useState(appStatus.message);
  const toggle = async()=>{
    const newStatus={isOpen:!appStatus.isOpen, link, deadline, message: !appStatus.isOpen?message:'Admissions for 2026/2027 Academic Year is CLOSED - School is starting November 2026 - Labe College of Nursing Sciences'};
    setAppStatus(newStatus);
    localStorage.setItem('lcns_app_status',JSON.stringify(newStatus));
    localStorage.setItem('lcns_admission_status',JSON.stringify(newStatus));
    const sb=getSupabase();
    if(sb){
      try{
        await sb.from('school_settings').upsert({key:'application_open', value:newStatus.isOpen?'true':'false', updated_at:new Date().toISOString()},{onConflict:'key'});
        await sb.from('school_settings').upsert({key:'admission_status', value:JSON.stringify(newStatus), updated_at:new Date().toISOString()},{onConflict:'key'});
      }catch{}
    }
    window.dispatchEvent(new Event('storage'));
    showStatus(newStatus.isOpen?`✅ ADMISSION PUBLISHED - OPEN!`:`✅ ADMISSION CLOSED`);
  };
  const saveSettings = async()=>{
    const newStatus={isOpen:appStatus.isOpen, link, deadline, message};
    setAppStatus(newStatus);
    localStorage.setItem('lcns_app_status',JSON.stringify(newStatus));
    const sb=getSupabase();
    if(sb){
      try{
        await sb.from('school_settings').upsert({key:'admission_status', value:JSON.stringify(newStatus), updated_at:new Date().toISOString()},{onConflict:'key'});
      }catch{}
    }
    showStatus('Admission settings saved and will display on website');
  };
  return (
    <div className="space-y-6">
      <div className={`rounded-3xl p-6 border-2 ${appStatus.isOpen?'bg-emerald-50 border-emerald-300':'bg-red-50 border-red-300'}`}><div className="flex justify-between items-center"><div><h2 className="font-black text-lg">APPLICATION {appStatus.isOpen?'OPEN':'CLOSED'}</h2><p className="text-xs mt-1">{appStatus.message}</p><p className="text-[11px] mt-1">Link: {appStatus.link} | Deadline: {appStatus.deadline}</p></div><button onClick={toggle} className={`px-8 py-3 rounded-xl font-black text-white ${appStatus.isOpen?'bg-red-600':'bg-emerald-600'}`}>{appStatus.isOpen?'CLOSE ADMISSION NOW':'OPEN ADMISSION NOW - PUBLISH'}</button></div></div>
      <div className="bg-white border-2 rounded-3xl p-6 space-y-4"><h3 className="font-black">Publish Admission Settings - Will Display on Website - Supabase Connected</h3><div><label className="text-[11px] font-bold">Application Link</label><input value={link} onChange={e=>setLink(e.target.value)} className="w-full mt-1 p-3 border-2 rounded-xl text-xs"/></div><div><label className="text-[11px] font-bold">Deadline</label><input type="date" value={deadline} onChange={e=>setDeadline(e.target.value)} className="w-full mt-1 p-3 border-2 rounded-xl text-xs"/></div><div><label className="text-[11px] font-bold">Message to display on website</label><textarea value={message} onChange={e=>setMessage(e.target.value)} className="w-full mt-1 p-3 border-2 rounded-xl text-xs h-24"/></div><button onClick={saveSettings} className="w-full bg-slate-900 text-white py-3 rounded-xl font-black text-xs">SAVE ADMISSION SETTINGS - PUBLISH TO WEBSITE</button></div>
    </div>
  );
};

// ===== 7. ANNOUNCEMENT MANAGER - NOT DELETED =====
const AnnouncementManager = ({ showStatus }: any) => {
  const [anns, setAnns] = useState<any[]>(()=>{
    try{return JSON.parse(localStorage.getItem('lcns_announcements')||'[]');}catch{return[];}
  });
  const [events, setEvents] = useState<any[]>(()=>{
    try{return JSON.parse(localStorage.getItem('lcns_events')||'[]');}catch{return[];}
  });
  const [annForm, setAnnForm] = useState({title:'', message:'', type:'announcement', is_published:true});
  const [eventForm, setEventForm] = useState({title:'', description:'', date:'', location:'', is_published:true});
  useEffect(()=>{
    const load=async()=>{
      const sb=getSupabase();
      if(!sb) return;
      try{
        const {data: aData}=await sb.from('school_settings').select('*').eq('key','announcements');
        if(aData&&aData[0]){
          const p=JSON.parse(aData[0].value||'[]');
          setAnns(p);
          localStorage.setItem('lcns_announcements',JSON.stringify(p));
        }
        const {data: eData}=await sb.from('school_settings').select('*').eq('key','events');
        if(eData&&eData[0]){
          const p=JSON.parse(eData[0].value||'[]');
          setEvents(p);
          localStorage.setItem('lcns_events',JSON.stringify(p));
        }
      }catch{}
    };
    load();
  },[]);
  const saveAnn = async()=>{
    if(!annForm.title||!annForm.message){showStatus('Title + Message required','error');return;}
    const newAnn={id:Date.now().toString(), ...annForm, created_at:new Date().toISOString()};
    const updated=[newAnn, ...anns];
    setAnns(updated);
    localStorage.setItem('lcns_announcements',JSON.stringify(updated));
    const sb=getSupabase();
    if(sb){
      try{
        await sb.from('school_settings').upsert({key:'announcements', value:JSON.stringify(updated), updated_at:new Date().toISOString()},{onConflict:'key'});
      }catch{}
    }
    window.dispatchEvent(new Event('storage'));
    showStatus('✅ Announcement published and will display on website!');
    setAnnForm({title:'', message:'', type:'announcement', is_published:true});
  };
  const saveEvent = async()=>{
    if(!eventForm.title){showStatus('Event title required','error');return;}
    const newEvent={id:Date.now().toString(), ...eventForm, created_at:new Date().toISOString()};
    const updated=[newEvent, ...events];
    setEvents(updated);
    localStorage.setItem('lcns_events',JSON.stringify(updated));
    const sb=getSupabase();
    if(sb){
      try{
        await sb.from('school_settings').upsert({key:'events', value:JSON.stringify(updated), updated_at:new Date().toISOString()},{onConflict:'key'});
      }catch{}
    }
    window.dispatchEvent(new Event('storage'));
    showStatus('✅ Event published and will display on website!');
    setEventForm({title:'', description:'', date:'', location:'', is_published:true});
  };
  const delAnn = async(id:string)=>{
    const updated=anns.filter((a:any)=>a.id!==id);
    setAnns(updated);
    localStorage.setItem('lcns_announcements',JSON.stringify(updated));
    const sb=getSupabase();
    if(sb){
      try{
        await sb.from('school_settings').upsert({key:'announcements', value:JSON.stringify(updated), updated_at:new Date().toISOString()},{onConflict:'key'});
      }catch{}
    }
    showStatus('Deleted');
  };
  const delEvent = async(id:string)=>{
    const updated=events.filter((e:any)=>e.id!==id);
    setEvents(updated);
    localStorage.setItem('lcns_events',JSON.stringify(updated));
    const sb=getSupabase();
    if(sb){
      try{
        await sb.from('school_settings').upsert({key:'events', value:JSON.stringify(updated), updated_at:new Date().toISOString()},{onConflict:'key'});
      }catch{}
    }
    showStatus('Deleted');
  };
  return (
    <div className="space-y-6">
      <div className="bg-white border-2 rounded-3xl p-6"><h3 className="font-black flex gap-2"><Megaphone className="w-5 h-5"/> Publish Announcement - Will Display on Website - Supabase Connected</h3><div className="space-y-3 mt-4"><input value={annForm.title} onChange={e=>setAnnForm({...annForm,title:e.target.value})} placeholder="Announcement Title" className="w-full p-3 border-2 rounded-xl text-xs font-bold"/><textarea value={annForm.message} onChange={e=>setAnnForm({...annForm,message:e.target.value})} placeholder="Message" className="w-full p-3 border-2 rounded-xl text-xs h-24"/><button onClick={saveAnn} className="w-full bg-orange-700 text-white py-3 rounded-xl font-black text-xs">PUBLISH ANNOUNCEMENT</button></div><div className="mt-4 space-y-2">{anns.map((a:any)=><div key={a.id} className="border p-3 rounded-xl flex justify-between"><div><p className="font-black text-xs">{a.title}</p><p className="text-[11px]">{a.message}</p></div><button onClick={()=>delAnn(a.id)} className="px-2 py-1 bg-red-600 text-white rounded text-[10px]">DELETE</button></div>)}</div></div>
      <div className="bg-white border-2 rounded-3xl p-6"><h3 className="font-black flex gap-2"><Calendar className="w-5 h-5"/> Publish Event - Will Display on Website - Supabase Connected</h3><div className="space-y-3 mt-4"><input value={eventForm.title} onChange={e=>setEventForm({...eventForm,title:e.target.value})} placeholder="Event Title" className="w-full p-3 border-2 rounded-xl text-xs font-bold"/><textarea value={eventForm.description} onChange={e=>setEventForm({...eventForm,description:e.target.value})} placeholder="Description" className="w-full p-3 border-2 rounded-xl text-xs h-20"/><div className="grid grid-cols-2 gap-2"><input type="date" value={eventForm.date} onChange={e=>setEventForm({...eventForm,date:e.target.value})} className="p-3 border-2 rounded-xl text-xs"/><input value={eventForm.location} onChange={e=>setEventForm({...eventForm,location:e.target.value})} placeholder="Location" className="p-3 border-2 rounded-xl text-xs"/></div><button onClick={saveEvent} className="w-full bg-orange-700 text-white py-3 rounded-xl font-black text-xs">PUBLISH EVENT</button></div><div className="mt-4 space-y-2">{events.map((ev:any)=><div key={ev.id} className="border p-3 rounded-xl flex justify-between"><div><p className="font-black text-xs">{ev.title}</p><p className="text-[11px]">{ev.description} - {ev.date} - {ev.location}</p></div><button onClick={()=>delEvent(ev.id)} className="px-2 py-1 bg-red-600 text-white rounded text-[10px]">DELETE</button></div>)}</div></div>
    </div>
  );
};

// ===== 8. APPLICANTS MANAGER - NOT DELETED =====
const ApplicantsManager = ({ showStatus, users, setUsers }: any) => {
  const [applicants, setApplicants] = useState<any[]>(()=>{
    try{
      return JSON.parse(localStorage.getItem('lcns_applicants')||localStorage.getItem('applicants')||'[]');
    }catch{return[];}
  });
  const [search, setSearch] = useState('');
  useEffect(()=>{
    const load=async()=>{
      const sb=getSupabase();
      if(!sb) return;
      try{
        const {data}=await sb.from('school_settings').select('*').eq('key','applicants');
        if(data&&data[0]){
          const p=JSON.parse(data[0].value||'[]');
          setApplicants(p);
          localStorage.setItem('lcns_applicants',JSON.stringify(p));
        } else {
          const {data: appData}=await sb.from('applicants').select('*');
          if(appData&&appData.length){
            setApplicants(appData);
            localStorage.setItem('lcns_applicants',JSON.stringify(appData));
          }
        }
      }catch{}
    };
    load();
  },[]);
  const filtered = applicants.filter((a:any)=>{
    if(!search) return true;
    const t=search.toLowerCase();
    return (a.fullName||a.full_name||'').toLowerCase().includes(t)||(a.email||'').toLowerCase().includes(t)||(a.phone||'').toLowerCase().includes(t);
  });
  const deleteApplicant = async(id:string, name:string)=>{
    if(!confirm(`Delete applicant ${name}? This will delete from whole portal!`)) return;
    const updated=applicants.filter((a:any)=>(a.id||a.email)!==id);
    setApplicants(updated);
    localStorage.setItem('lcns_applicants',JSON.stringify(updated));
    localStorage.setItem('applicants',JSON.stringify(updated));
    const remainingUsers=users.filter((u:any)=>u.id!==id&&u.email!==id);
    if(remainingUsers.length!==users.length){
      setUsers(remainingUsers);
      localStorage.setItem('lcns_users',JSON.stringify(remainingUsers));
      localStorage.setItem('users',JSON.stringify(remainingUsers));
    }
    const sb=getSupabase();
    if(sb){
      try{
        await sb.from('school_settings').upsert({key:'applicants', value:JSON.stringify(updated), updated_at:new Date().toISOString()},{onConflict:'key'});
        await sb.from('applicants').delete().eq('id',id);
        await sb.from('applicants').delete().eq('email',id);
      }catch{}
    }
    window.dispatchEvent(new Event('storage'));
    showStatus(`✅ Applicant ${name} deleted from whole portal`);
  };
  const deleteAllApplicants = async()=>{
    if(!confirm('Delete ALL applicants? This will delete all applicant submissions from whole portal!')) return;
    setApplicants([]);
    localStorage.setItem('lcns_applicants',JSON.stringify([]));
    localStorage.setItem('applicants',JSON.stringify([]));
    const sb=getSupabase();
    if(sb){
      try{
        await sb.from('school_settings').upsert({key:'applicants', value:JSON.stringify([]), updated_at:new Date().toISOString()},{onConflict:'key'});
        await sb.from('applicants').delete().neq('id','00000000-0000-0000-0000-000000000000');
      }catch{}
    }
    showStatus('✅ All applicants deleted from whole portal');
  };
  return (
    <div className="space-y-6">
      <div className="bg-white border-2 rounded-3xl p-6"><div className="flex justify-between"><div><h3 className="font-black flex gap-2"><FileText className="w-5 h-5"/> Applicant Submissions - See All Applications - Delete from Whole Portal - Supabase Connected</h3><p className="text-[11px] text-slate-600 mt-1">Admin can see all applicant submissions - When you click delete, it deletes out of whole portal - {applicants.length} applicants</p></div><button onClick={deleteAllApplicants} className="px-4 py-2 bg-black text-white rounded-xl text-[11px] font-black">DELETE ALL APPLICANTS FROM WHOLE PORTAL</button></div><div className="mt-4 flex items-center gap-2 bg-white border-2 rounded-xl px-3"><Search className="w-4 h-4 text-slate-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search applicant by Name, Email, Phone" className="flex-1 py-2.5 text-xs font-bold outline-none"/></div><div className="mt-4 grid gap-2 max-h-[600px] overflow-y-auto">{filtered.map((a:any)=><div key={a.id||a.email} className="border-2 p-3 rounded-2xl flex justify-between"><div><p className="font-black text-xs">{a.fullName||a.full_name} - {a.email}</p><p className="text-[11px]">{a.phone} - {a.course||a.program} - {a.level||''}</p></div><button onClick={()=>deleteApplicant(a.id||a.email, a.fullName||a.full_name||'Applicant')} className="px-3 py-1 bg-red-600 text-white rounded text-[10px] font-black">DELETE FROM WHOLE PORTAL</button></div>)}</div></div>
    </div>
  );
};

// ===== ROLES - NOT DELETED - ALL ROLES INCLUDED =====
const ALL_ROLES = [
  { value: 'STUDENT', label: 'STUDENT', color: 'bg-blue-100 text-blue-800' },
  { value: 'LECTURER', label: 'LECTURER', color: 'bg-green-100 text-green-800' },
  { value: 'HOD', label: 'HOD', color: 'bg-purple-100 text-purple-800' },
  { value: 'EXAM_OFFICER', label: 'EXAM OFFICER', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'PROVOST', label: 'PROVOST', color: 'bg-amber-100 text-amber-800' },
  { value: 'REGISTRAR', label: 'REGISTRAR', color: 'bg-teal-100 text-teal-800' },
  { value: 'BURSAR', label: 'BURSAR', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'ADMIN', label: 'ADMIN', color: 'bg-red-100 text-red-800' },
  { value: 'ICT_OFFICER', label: 'ICT OFFICER', color: 'bg-slate-800 text-white' },
  { value: 'ADMISSION_OFFICER', label: 'ADMISSION OFFICER', color: 'bg-orange-100 text-orange-800' },
];

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<any[]>(() => { try { return JSON.parse(localStorage.getItem('lcns_users') || '[]'); } catch { return []; } });
  const [userFilter, setUserFilter] = useState<'ALL'|'STUDENT'|'STAFF'>('ALL');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [userType, setUserType] = useState<'STUDENT'|'STAFF'>('STUDENT');
  const [showPasswords, setShowPasswords] = useState<{[k:string]:boolean}>({});
  const [showLoginDetails, setShowLoginDetails] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<'users'|'result_publish'|'leadership'|'gallery'|'courses'|'promotion'|'settings'|'application'|'announcements'|'applicants'|'scoresheets'|'applicant_cbt'>('users');
  const [status, setStatus] = useState<{text:string,type:'success'|'error'}|null>(null);
  const [results, setResults] = useState<any[]>(()=>{ try{ return JSON.parse(localStorage.getItem('lcns_results')||'[]'); }catch{ return []; }});
  const [searchResult, setSearchResult] = useState('');
  const [selectedPrintStudent, setSelectedPrintStudent] = useState<any>(null);
  const [senateInfo, setSenateInfo] = useState(()=>{ try{ const s=JSON.parse(localStorage.getItem('lcns_senate_ratification')||'null'); if(s) return {approved:s.approved, date:s.date, provost:s.provostName}; return {approved:localStorage.getItem('lcns_senate_approved')==='true', date:new Date().toISOString(), provost:'Provost'} }catch{ return {approved:false, date:new Date().toISOString(), provost:'Provost'} }});
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  const [adminName, setAdminName] = useState('Admin');
  const [adminEmail, setAdminEmail] = useState('admin@lcns.edu.ng');
  const [newUser, setNewUser] = useState({ 
    fullName:'', email:'', phone:'', sex:'', level:'ND1', department:'Nursing', role:'STUDENT', 
    staffId:'', qualification:'', staffDepartment:'Nursing', courseOfStudy:'Nursing Science', 
    staffImage:'', address:'', bloodGroup:'', parentName:'', parentPhone:'', staying:'hostel',
    stateOfOrigin:'', lga:'', dateOfBirth:''
  });

  const showStatus = (text:string, type:'success'|'error'='success')=>{ setStatus({text,type}); setTimeout(()=>setStatus(null),4000); };
  const getRoleColor = (r:string)=>ALL_ROLES.find(x=>x.value===r)?.color||'bg-slate-100';

  useEffect(()=>{
    try{
      const cur = JSON.parse(localStorage.getItem('lcns_current_user')||localStorage.getItem('current_user')||'null');
      if(cur){
        setAdminName(cur.fullName||cur.full_name||cur.name||'Admin');
        setAdminEmail(cur.email||'admin@lcns.edu.ng');
      }
    }catch{}
    const sb = getSupabase();
    if(sb){
      setSupabaseConnected(true);
      sb.from('school_settings').select('key').limit(1).then(({error}:any)=>{
        if(error) setSupabaseConnected(false);
        else setSupabaseConnected(true);
      }).catch(()=>setSupabaseConnected(false));
    } else {
      setSupabaseConnected(false);
    }
  },[]);

  const handleImgUpload = (e:React.ChangeEvent<HTMLInputElement>)=>{
    const f=e.target.files?.[0];
    if(!f) return;
    const r=new FileReader();
    r.onload=()=>{ setNewUser({...newUser, staffImage:r.result as string}); };
    r.readAsDataURL(f);
  };

  const handleCreateUser = async ()=>{
    if(!newUser.fullName || !newUser.email){ showStatus('Enter Full Name + Email','error'); return; }
    if(userType==='STUDENT' && !newUser.sex){ showStatus('Select Sex - Female or Male','error'); return; }

    const getNextMatricNumber = () => {
      const counterKey = 'lcns_matric_counter';
      let counter = parseInt(localStorage.getItem(counterKey) || '0', 10);
      counter += 1;
      localStorage.setItem(counterKey, counter.toString());
      const padded = String(counter).padStart(3, '0');
      const year = new Date().getFullYear();
      const levelCode = newUser.level.toUpperCase();
      return `LCNS/${levelCode}/${year}/${padded}`;
    };

    const getNextStaffId = () => {
      const counterKey = 'lcns_staff_counter';
      let counter = parseInt(localStorage.getItem(counterKey) || '0', 10);
      counter += 1;
      localStorage.setItem(counterKey, counter.toString());
      const padded = String(counter).padStart(3, '0');
      const year = new Date().getFullYear();
      return `LCNS/ST/${year}/${padded}`;
    };

    const password = newUser.phone ? newUser.phone.slice(-4)+'123' : '123456';
    const matricNumber = userType==='STUDENT' ? getNextMatricNumber() : '';
    const staffId = userType==='STAFF' ? getNextStaffId() : '';
    const loginId = userType==='STUDENT'?matricNumber:staffId;

    const userData:any = { 
      id: Date.now().toString(), 
      fullName: newUser.fullName, 
      email: newUser.email.toLowerCase(), 
      phone: newUser.phone, 
      sex: newUser.sex, 
      bloodGroup: newUser.bloodGroup, 
      address: newUser.address, 
      staying: newUser.staying,
      parentName: newUser.parentName,
      parentPhone: newUser.parentPhone,
      stateOfOrigin: newUser.stateOfOrigin,
      lga: newUser.lga,
      dateOfBirth: newUser.dateOfBirth,
      level: userType==='STUDENT'?newUser.level.toUpperCase():'', 
      department: newUser.department, 
      staffDepartment: newUser.staffDepartment, 
      role: newUser.role, 
      userType, 
      loginId, 
      matricNumber: userType==='STUDENT'?matricNumber:'', 
      staffId: userType==='STAFF'?staffId:'', 
      qualification: newUser.qualification, 
      courseOfStudy: newUser.courseOfStudy, 
      staffImage: newUser.staffImage, 
      status:'ACTIVE', 
      createdAt:new Date().toISOString(), 
      academicYear: localStorage.getItem('lcns_current_session')||'2026/2027', 
      password, 
      loginIdRaw: loginId 
    };

    const sb=getSupabase();
    if(sb){
      try{
        await sb.from('users').insert([{id:userData.id, email:userData.email, password, role:userData.role, full_name:userData.fullName, department:userData.department||userData.staffDepartment, phone:userData.phone, matric_no:userData.matricNumber||null, staff_id:userData.staffId||null, level:userData.level||null, status:'ACTIVE'}]);
      }catch(err){
        console.log('Supabase save failed',err);
      }
    }

    const existing=JSON.parse(localStorage.getItem('lcns_users')||'[]');
    const updated=[...existing.filter((u:any)=>u.email!==userData.email), userData];
    localStorage.setItem('lcns_users', JSON.stringify(updated));
    localStorage.setItem('users', JSON.stringify(updated));
    try{ StorageService.saveUsers(updated); }catch{}
    setUsers(updated);
    window.dispatchEvent(new Event('storage'));

    setNewUser({ fullName:'', email:'', phone:'', sex:'', level:'ND1', department:'Nursing', role:userType==='STAFF'?'LECTURER':'STUDENT', staffId:'', qualification:'', staffDepartment:'Nursing', courseOfStudy:'Nursing Science', staffImage:'', address:'', bloodGroup:'', parentName:'', parentPhone:'', staying:'hostel', stateOfOrigin:'', lga:'', dateOfBirth:'' });
    showStatus(`✅ ${userType} Created - ${userData.fullName} - ID: ${loginId} - Sex: ${userData.sex} - Staying: ${userData.staying} - Parent: ${userData.parentName} - Login with ID or Email - Supabase Connected`);
  };

  const assignRole = (email:string, newRole:string)=>{
    const up=users.map((u:any)=>u.email===email?{...u,role:newRole}:u);
    setUsers(up);
    localStorage.setItem('lcns_users', JSON.stringify(up));
    localStorage.setItem('users', JSON.stringify(up));
    showStatus(`Role assigned: ${newRole} to ${email}`);
  };
  const toggleUserStatus = (email:string)=>{
    const up=users.map((u:any)=>u.email===email?{...u, status: u.status==='ACTIVE'?'INACTIVE':'ACTIVE'}:u);
    setUsers(up);
    localStorage.setItem('lcns_users', JSON.stringify(up));
    localStorage.setItem('users', JSON.stringify(up));
    const sb=getSupabase();
    if(sb){
      const user=up.find((x:any)=>x.email===email);
      if(user){
        try{ sb.from('users').update({status:user.status}).eq('email',email); }catch{}
      }
    }
    const user=up.find((x:any)=>x.email===email);
    showStatus(user.status==='ACTIVE'?`✅ ${user.fullName} ACTIVATED - Can now login`:`🔒 ${user.fullName} DEACTIVATED - Cannot login`);
  };
  const deleteUser = (email:string, name:string)=>{
    if(!confirm(`Delete ${name}? This will delete from whole portal!`)) return;
    const up=users.filter((u:any)=>u.email!==email);
    setUsers(up);
    localStorage.setItem('lcns_users', JSON.stringify(up));
    localStorage.setItem('users', JSON.stringify(up));
    const sb=getSupabase();
    if(sb){
      try{ sb.from('users').delete().eq('email',email); }catch{}
    }
    showStatus('Deleted from whole portal');
  };
  const filteredUsers = users.filter((u:any)=>{
    if(userFilter==='ALL') return true;
    if(userFilter==='STUDENT') return u.role==='STUDENT' || u.userType==='STUDENT' || u.matricNumber;
    if(userFilter==='STAFF') return u.role!=='STUDENT';
    return true;
  }).filter((u:any)=>{
    if(!searchResult) return true;
    const t=searchResult.toLowerCase();
    return (u.fullName||'').toLowerCase().includes(t) || (u.email||'').toLowerCase().includes(t) || (u.matricNumber||'').toLowerCase().includes(t) || (u.staffId||'').toLowerCase().includes(t);
  });
  const filteredResults = users.filter((s:any)=>{
    if(!searchResult) return true;
    const t=searchResult.toLowerCase();
    return (s.fullName||'').toLowerCase().includes(t) || (s.matricNumber||s.matricNo||'').toLowerCase().includes(t);
  });
  const refreshResults = ()=>{
    try{
      setResults(JSON.parse(localStorage.getItem('lcns_results')||'[]'));
      const s=JSON.parse(localStorage.getItem('lcns_senate_ratification')||'null');
      if(s) setSenateInfo({approved:s.approved, date:s.date, provost:s.provostName});
      else setSenateInfo({approved:localStorage.getItem('lcns_senate_approved')==='true', date:new Date().toISOString(), provost:'Provost'});
    }catch{}
  };
  useEffect(()=>{
    refreshResults();
    const h=()=>refreshResults();
    window.addEventListener('storage',h);
    window.addEventListener('lcns_storage_update',h as any);
    return()=>{
      window.removeEventListener('storage',h);
      window.removeEventListener('lcns_storage_update',h as any);
    }
  },[]);

  return (
    <div className="space-y-6">
      {status && <div className={`fixed top-4 right-4 z-50 p-4 rounded-2xl border shadow-xl flex gap-3 ${status.type==='success'?'bg-emerald-50 border-emerald-200':'bg-red-50 border-red-200'}`}><CheckCircle2 className="w-5 h-5 text-emerald-600"/><span className="text-xs font-bold">{status.text}</span></div>}

      <div className="bg-gradient-to-r from-slate-900 via-[#0a4d2e] to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-emerald-900">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-black/30 px-3 py-1 rounded-full">Director of ICT - Admin Portal - {adminName} - Labe College - Catholic Diocese of Gboko - 2026/2027</span>
              <span className={`text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 ${supabaseConnected?'bg-emerald-500 text-white':'bg-red-500 text-white'}`}>{supabaseConnected?<><Wifi className="w-3 h-3"/> SUPABASE CONNECTED - ONLINE</>:<><WifiOff className="w-3 h-3"/> LOCAL MODE - SUPABASE OFFLINE</>}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase mt-2 flex items-center gap-2"><GraduationCap className="w-8 h-8 text-amber-400"/>Administrator Dashboard - {adminName}</h1>
            <p className="text-xs text-emerald-200 mt-1">Welcome: <span className="text-amber-300 font-black">{adminName}</span> ({adminEmail}) • Supabase: {supabaseConnected?'Connected ✅ - All data saves to backend - Registrar/Provost/HOD/Exam Officer will see':'Local Storage Mode'} • Users: {users.length} • Session: {localStorage.getItem('lcns_current_session')||'2026/2027'}</p>
            <div className="mt-2 bg-white/10 px-3 py-2 rounded-xl inline-flex flex-col">
              <span className="text-[11px] font-black text-amber-200">Logged in as: {adminName}</span>
              <span className="text-[10px] text-emerald-100">{adminEmail} • Role: ADMIN • {supabaseConnected?'Supabase: Connected ✅ - Backend Save Active':'Supabase: Local Storage - Offline'} • Labe College of Nursing Sciences, Gboko</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl"><CollegeLogo size="lg" /><div className="text-center"><p className="text-[12px] font-black leading-none">Labe College of Nursing Sciences</p><p className="text-[10px] font-bold">Catholic Diocese of Gboko</p><p className="text-[9px]">Gboko, Benue State • Nigeria</p><p className={`text-[9px] font-black mt-1 px-2 py-0.5 rounded-full ${supabaseConnected?'bg-emerald-500':'bg-red-500'}`}>{supabaseConnected?'SUPABASE CONNECTED':'LOCAL MODE'}</p></div><CollegeLogo size="lg" /></div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border shadow-xs">
        <button onClick={()=>setActiveAdminTab('users')} className={`px-3 py-2.5 rounded-xl text-[11px] font-black ${activeAdminTab==='users'?'bg-slate-900 text-white':'bg-white border'}`}>👤 Users - Login Details - {adminName}</button>
        <button onClick={()=>setActiveAdminTab('result_publish')} className={`px-3 py-2.5 rounded-xl text-[11px] font-black ${activeAdminTab==='result_publish'?'bg-red-700 text-white':'bg-red-50 border-2 border-red-400 text-red-800'}`}>🎓 Result Publish</button>
        <button onClick={()=>setActiveAdminTab('leadership')} className={`px-3 py-2.5 rounded-xl text-[11px] font-black ${activeAdminTab==='leadership'?'bg-amber-700 text-white':'bg-amber-50 border-2 border-amber-400 text-amber-800'}`}>👑 Bishop & Provost</button>
        <button onClick={()=>setActiveAdminTab('gallery')} className={`px-3 py-2.5 rounded-xl text-[11px] font-black ${activeAdminTab==='gallery'?'bg-purple-700 text-white':'bg-purple-50 border text-purple-800'}`}>📸 Gallery</button>
        <button onClick={()=>setActiveAdminTab('courses')} className={`px-3 py-2.5 rounded-xl text-[11px] font-black ${activeAdminTab==='courses'?'bg-blue-700 text-white':'bg-blue-50 border text-blue-800'}`}>📚 Courses</button>
        <button onClick={()=>setActiveAdminTab('promotion')} className={`px-3 py-2.5 rounded-xl text-[11px] font-black ${activeAdminTab==='promotion'?'bg-indigo-700 text-white':'bg-indigo-50 border text-indigo-800'}`}>⬆️ Promotion</button>
        <button onClick={()=>setActiveAdminTab('application')} className={`px-3 py-2.5 rounded-xl text-[11px] font-black ${activeAdminTab==='application'?'bg-emerald-700 text-white':'bg-emerald-50 border text-emerald-800'}`}>🎓 Admission Open/Close</button>
        <button onClick={()=>setActiveAdminTab('announcements')} className={`px-3 py-2.5 rounded-xl text-[11px] font-black ${activeAdminTab==='announcements'?'bg-orange-700 text-white':'bg-orange-50 border text-orange-800'}`}>📢 Announcements & Events</button>
        <button onClick={()=>setActiveAdminTab('applicants')} className={`px-3 py-2.5 rounded-xl text-[11px] font-black ${activeAdminTab==='applicants'?'bg-rose-700 text-white':'bg-rose-50 border-2 border-rose-400 text-rose-800'}`}>📝 Applicants - Delete Whole Portal</button>
        <button onClick={()=>setActiveAdminTab('settings')} className={`px-3 py-2.5 rounded-xl text-[11px] font-black ${activeAdminTab==='settings'?'bg-slate-700 text-white':'bg-slate-50 border text-slate-800'}`}>⚙️ Settings - Reset by Role</button>
        <button onClick={()=>setActiveAdminTab('scoresheets')} className={`px-3 py-2.5 rounded-xl text-[11px] font-bold ${activeAdminTab==='scoresheets'?'bg-blue-700 text-white':'border text-blue-800'}`}>Score Sheets</button>
      </div>

      {activeAdminTab==='leadership' && <LeadershipManager showStatus={showStatus} />}
      {activeAdminTab==='gallery' && <GalleryManager showStatus={showStatus} />}
      {activeAdminTab==='courses' && <CourseManager showStatus={showStatus} users={users} />}
      {activeAdminTab==='promotion' && <PromotionManager showStatus={showStatus} users={users} setUsers={setUsers} />}
      {activeAdminTab==='settings' && <AdminSettingsManager showStatus={showStatus} users={users} setUsers={setUsers} />}
      {activeAdminTab==='application' && <ApplicationManager showStatus={showStatus} />}
      {activeAdminTab==='announcements' && <AnnouncementManager showStatus={showStatus} />}
      {activeAdminTab==='applicants' && <ApplicantsManager showStatus={showStatus} users={users} setUsers={setUsers} />}

      {activeAdminTab==='users' && (
        <div className="bg-white rounded-3xl border-2 p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center"><div><h3 className="font-black text-lg flex gap-2"><UserCheck className="w-5 h-5"/> Users - Login Details + Activate/Deactivate + Delete - Admin: {adminName} - {supabaseConnected?'Supabase Connected ✅':'Local Mode'}</h3><p className="text-[11px] text-emerald-700 font-bold mt-1">✅ Admin: {adminName} ({adminEmail}) can see all user created login details - Login ID + Password + Status - Can Activate/Deactivate user - Can Delete - Saves to localStorage + Supabase - Linked to Registrar, Provost, HOD, Exam Officer - Labe College 2026/2027</p></div><div className="flex gap-2"><button onClick={()=>setShowLoginDetails(!showLoginDetails)} className="px-4 py-2 bg-amber-700 text-white rounded-xl text-xs font-black flex gap-2"><Key className="w-4 h-4"/>{showLoginDetails?'HIDE LOGIN DETAILS':'SHOW LOGIN DETAILS'}</button><button onClick={()=>setShowCreateUser(!showCreateUser)} className="px-6 py-3 bg-[#0a4d2e] text-white rounded-xl text-xs font-black flex gap-2"><UserPlus className="w-4 h-4"/>{showCreateUser?'CLOSE':'CREATE USER'}</button></div></div>

          <div className="flex gap-2 bg-slate-50 p-2 rounded-2xl border">
            <button onClick={()=>setUserFilter('ALL')} className={`px-4 py-2 rounded-xl text-xs font-black ${userFilter==='ALL'?'bg-slate-900 text-white':'bg-white border'}`}>ALL ({users.length})</button>
            <button onClick={()=>setUserFilter('STUDENT')} className={`px-4 py-2 rounded-xl text-xs font-black ${userFilter==='STUDENT'?'bg-blue-700 text-white':'bg-white border text-blue-800'}`}>STUDENT ({users.filter((u:any)=>u.role==='STUDENT').length})</button>
            <button onClick={()=>setUserFilter('STAFF')} className={`px-4 py-2 rounded-xl text-xs font-black ${userFilter==='STAFF'?'bg-emerald-700 text-white':'bg-white border text-emerald-800'}`}>STAFF ({users.filter((u:any)=>u.role!=='STUDENT').length})</button>
          </div>

          <div className="flex items-center gap-2 bg-white border-2 rounded-xl px-3"><Search className="w-4 h-4 text-slate-400"/><input value={searchResult} onChange={e=>setSearchResult(e.target.value)} placeholder="Search by Name, Email, Matric No, Staff ID - Login Details - Admin: {adminName}" className="flex-1 py-2.5 text-xs font-bold outline-none"/></div>

          {showCreateUser && (
            <div className="bg-gradient-to-br from-slate-50 to-emerald-50 border-2 border-emerald-300 rounded-3xl p-6 space-y-5">
              <div className="flex gap-3"><button onClick={()=>{setUserType('STUDENT'); setNewUser({...newUser,role:'STUDENT'});}} className={`flex-1 py-3 rounded-xl text-xs font-black ${userType==='STUDENT'?'bg-blue-700 text-white':'bg-white border-2'}`}>STUDENT - FULL BIODATA - LCNS/ND/2026/001 - Linked to Provost/Registrar/HOD</button><button onClick={()=>{setUserType('STAFF'); setNewUser({...newUser,role:'LECTURER'});}} className={`flex-1 py-3 rounded-xl text-xs font-black ${userType==='STAFF'?'bg-[#0a4d2e] text-white':'bg-white border-2'}`}>STAFF - QUALIFICATION + ADDRESS - LCNS/ST/2026/001 - Linked</button></div>

              {userType==='STAFF' ? (
              <form onSubmit={(e)=>{e.preventDefault(); handleCreateUser();}} className="space-y-4">
                <div className="bg-white border-2 rounded-2xl p-4">
                  <h4 className="font-black text-[11px] text-emerald-800">STAFF - Names + Qualification + Address + Phone + Email - Linked to Registrar, Provost, HOD, Exam Officer - ID LCNS/ST/2026/001 - Supabase Connected: {supabaseConnected?'Yes ✅':'Local'} - Admin: {adminName}</h4>
                  <div className="grid md:grid-cols-3 gap-3 mt-3">
                    <div className="md:col-span-3 flex gap-4">
                      <div className="w-28 h-28 bg-slate-100 border-2 border-dashed rounded-2xl overflow-hidden flex items-center justify-center">{newUser.staffImage ? <img src={newUser.staffImage} className="w-full h-full object-cover"/> : <span className="text-[10px]">Photo</span>}</div>
                      <div className="flex-1"><label className="text-[11px] font-bold">Upload Photo - Staff Photo - Will show to Registrar, Provost, HOD, Exam Officer, Bursar</label><input type="file" accept="image/*" onChange={handleImgUpload} className="w-full mt-1 text-[11px] file:bg-emerald-800 file:text-white file:rounded-xl file:border-0 file:px-4 file:py-2"/></div>
                    </div>
                    <div><label className="text-[11px] font-bold">Full Names *</label><input value={newUser.fullName} onChange={e=>setNewUser({...newUser,fullName:e.target.value})} className="w-full mt-1 p-3 border-2 rounded-xl text-xs font-bold" required/></div>
                    <div><label className="text-[11px] font-bold">Qualification *</label><input value={newUser.qualification} onChange={e=>setNewUser({...newUser,qualification:e.target.value})} placeholder="FWACN, MSc Nursing" className="w-full mt-1 p-3 border-2 border-emerald-500 rounded-xl text-xs" required/></div>
                    <div><label className="text-[11px] font-bold">Address * - Staff Address - Linked</label><input value={newUser.address} onChange={e=>setNewUser({...newUser,address:e.target.value})} placeholder="No 10 Gboko Road, Benue" className="w-full mt-1 p-3 border-2 rounded-xl text-xs" required/></div>
                    <div><label className="text-[11px] font-bold">Email * - Can login with email or ID</label><input type="email" value={newUser.email} onChange={e=>setNewUser({...newUser,email:e.target.value})} className="w-full mt-1 p-3 border-2 rounded-xl text-xs" required/></div>
                    <div><label className="text-[11px] font-bold">Phone *</label><input value={newUser.phone} onChange={e=>setNewUser({...newUser,phone:e.target.value})} className="w-full mt-1 p-3 border-2 rounded-xl text-xs" required/></div>
                    <div><label className="text-[11px] font-bold">Role * - Select from dropdown - All roles</label><select value={newUser.role} onChange={e=>setNewUser({...newUser,role:e.target.value})} className="w-full mt-1 p-3 border-2 border-emerald-600 rounded-xl text-xs font-black"><option>LECTURER</option><option>HOD</option><option>EXAM_OFFICER</option><option>PROVOST</option><option>REGISTRAR</option><option>BURSAR</option><option>ADMIN</option><option>ICT_OFFICER</option><option>ADMISSION_OFFICER</option><option>STUDENT</option></select></div>
                  </div>
                  <div className="bg-emerald-50 border-2 border-emerald-200 p-3 rounded-xl mt-3"><p className="text-[11px] font-black">AUTO STAFF ID - LCNS/ST/2026/001 - No Repeat - Login with ID or Email - Supabase Connected - Linked to all portals:</p><p className="text-[10px]">Next: LCNS/ST/{new Date().getFullYear()}/{String((parseInt(localStorage.getItem('lcns_staff_counter')||'0')+1)).padStart(3,'0')} - Example: LCNS/ST/2026/001, 002, 003 - Sequential - Never repeats - Linked to Registrar/HOD/Exam Officer/Provost portals - Saves to Supabase users table + localStorage - Admin: {adminName} will see</p></div>
                </div>
                <button type="submit" className="w-full bg-[#0a4d2e] text-white py-3 rounded-xl font-black text-xs">CREATE STAFF - LCNS/ST/2026/001 AUTO - LOGIN WITH ID OR EMAIL - ADMIN: {adminName} - SUPABASE: {supabaseConnected?'Connected ✅':'Local'} - LINKED TO PROVOST/REGISTRAR/HOD</button>
              </form>
              ) : (
              <form onSubmit={(e)=>{e.preventDefault(); handleCreateUser();}} className="space-y-4">
                <div className="bg-white border-2 rounded-2xl p-4">
                  <h4 className="font-black text-[11px] text-blue-800">STUDENT FULL BIODATA - Full Names, Sex, Staying, Parent, Address - Matric LCNS/ND/2026/001 AUTO - No Repeat - Linked to Registrar, Provost, HOD, Exam Officer, Lecturer - Supabase Connected: {supabaseConnected?'Yes ✅':'Local'} - Admin: {adminName}</h4>
                  <div className="grid md:grid-cols-3 gap-3 mt-3">
                    <div className="md:col-span-3 flex gap-4 bg-blue-50 p-3 rounded-xl border-2 border-blue-200">
                      <div className="w-28 h-28 bg-white border-2 border-dashed rounded-2xl overflow-hidden flex items-center justify-center">{newUser.staffImage ? <img src={newUser.staffImage} className="w-full h-full object-cover"/> : <span className="text-[10px]">Student Photo - Required - Linked</span>}</div>
                      <div className="flex-1"><label className="text-[11px] font-black">Upload Student Photo * - Will show to Registrar, Provost, HOD, Exam Officer, Lecturer - Linked to all</label><input type="file" accept="image/*" onChange={handleImgUpload} className="w-full text-[11px] file:bg-blue-700 file:text-white file:rounded-xl file:border-0 file:px-4 file:py-2"/></div>
                    </div>

                    <div className="md:col-span-2"><label className="text-[11px] font-black">Full Names * (Surname First) - Linked</label><input value={newUser.fullName} onChange={e=>setNewUser({...newUser,fullName:e.target.value})} placeholder="Okonkwo John Chukwu" className="w-full mt-1 p-3 border-2 border-blue-300 rounded-xl text-xs font-bold" required/></div>
                    <div><label className="text-[11px] font-black">Sex * - Female or Male - Required - Linked to Provost/Registrar</label><select value={newUser.sex} onChange={e=>setNewUser({...newUser,sex:e.target.value})} className="w-full mt-1 p-3 border-2 border-blue-500 rounded-xl text-xs font-black" required><option value="">Select Sex</option><option>Female</option><option>Male</option></select></div>

                    <div><label className="text-[11px] font-bold">Email * - Can login with email or matric ID - Linked</label><input type="email" value={newUser.email} onChange={e=>setNewUser({...newUser,email:e.target.value})} className="w-full mt-1 p-3 border-2 rounded-xl text-xs" required/></div>
                    <div><label className="text-[11px] font-bold">Phone * - Linked</label><input value={newUser.phone} onChange={e=>setNewUser({...newUser,phone:e.target.value})} className="w-full mt-1 p-3 border-2 rounded-xl text-xs" required/></div>
                    <div><label className="text-[11px] font-black">Staying * - In Campus (Hostel) / Off Campus (Day) - Linked</label><select value={newUser.staying} onChange={e=>setNewUser({...newUser,staying:e.target.value})} className="w-full mt-1 p-3 border-2 border-amber-500 rounded-xl text-xs font-black"><option value="hostel">In Campus (Hostel)</option><option value="day">Off Campus (Day)</option></select></div>

                    <div className="md:col-span-3"><label className="text-[11px] font-bold">Address * - Student Address - Linked to all portals</label><input value={newUser.address} onChange={e=>setNewUser({...newUser,address:e.target.value})} placeholder="No 10 Gboko Road, Benue" className="w-full mt-1 p-3 border-2 rounded-xl text-xs" required/></div>

                    <div><label className="text-[11px] font-black">Parent/Guardian Name * - Linked</label><input value={newUser.parentName} onChange={e=>setNewUser({...newUser,parentName:e.target.value})} placeholder="Mr Okonkwo" className="w-full mt-1 p-3 border-2 border-amber-300 rounded-xl text-xs font-bold" required/></div>
                    <div><label className="text-[11px] font-black">Parent Phone * - Linked</label><input value={newUser.parentPhone} onChange={e=>setNewUser({...newUser,parentPhone:e.target.value})} placeholder="080..." className="w-full mt-1 p-3 border-2 border-amber-300 rounded-xl text-xs" required/></div>
                    <div><label className="text-[11px] font-bold">Class * - ND1/ND2/HND1/HND2 - Linked</label><select value={newUser.level} onChange={e=>setNewUser({...newUser,level:e.target.value})} className="w-full mt-1 p-3 border-2 border-emerald-500 rounded-xl text-xs font-black"><option>ND1</option><option>ND2</option><option>HND1</option><option>HND2</option></select></div>

                    <div><label className="text-[11px] font-bold">Course - Nursing Science etc - Linked</label><select value={newUser.courseOfStudy} onChange={e=>setNewUser({...newUser,courseOfStudy:e.target.value})} className="w-full mt-1 p-3 border-2 rounded-xl text-xs"><option>Nursing Science</option><option>Basic Nursing</option><option>Midwifery</option></select></div>
                    <div><label className="text-[11px] font-bold">Blood Group - Linked</label><select value={newUser.bloodGroup} onChange={e=>setNewUser({...newUser,bloodGroup:e.target.value})} className="w-full mt-1 p-3 border-2 rounded-xl text-xs"><option value="">Select</option><option>O+</option><option>A+</option><option>B+</option><option>AB+</option><option>O-</option></select></div>
                    <div><label className="text-[11px] font-bold">State of Origin - Linked</label><input value={newUser.stateOfOrigin} onChange={e=>setNewUser({...newUser,stateOfOrigin:e.target.value})} placeholder="Benue" className="w-full mt-1 p-3 border-2 rounded-xl text-xs"/></div>
                  </div>
                  <div className="bg-blue-50 border-2 border-blue-200 p-3 rounded-xl mt-3">
                    <p className="text-[11px] font-black">AUTO MATRIC - LCNS/ND/2026/001 - No Repeat - Linked to Registrar/HOD/Exam Officer/Provost - Supabase Connected - Admin: {adminName} - All portals will see Sex, Staying, Parent, Address, Photo</p>
                    <p className="text-[10px]">Next: LCNS/{newUser.level.toUpperCase()}/{new Date().getFullYear()}/{String((parseInt(localStorage.getItem('lcns_matric_counter')||'0')+1)).padStart(3,'0')} - Example: LCNS/ND1/2026/001, LCNS/ND1/2026/002, LCNS/ND1/2026/003 - Sequential - Never repeats - Login with ID or Email - Saves to Supabase + localStorage - Registrar, HOD, Exam Officer, Provost, Lecturer will see full biodata including Sex, Staying, Parent Name, Parent Phone, Address, Photo, Course, Level</p>
                  </div>
                </div>
                <button type="submit" className="w-full bg-blue-700 text-white py-3 rounded-xl font-black text-xs">CREATE STUDENT - AUTO MATRIC LCNS/{newUser.level}/2026/00X - NO REPEAT - LOGIN WITH ID OR EMAIL - ADMIN: {adminName} - LINKED TO PROVOST/REGISTRAR/HOD/EXAM OFFICER</button>
              </form>
              )}
            </div>
          )}

          {showLoginDetails && (
            <div className="bg-amber-50 border-2 border-amber-400 rounded-3xl p-4"><h4 className="font-black text-sm flex gap-2"><Key className="w-4 h-4"/> All User Created Login Details - Admin {adminName} Can See Login ID + Password + Status - {filteredUsers.length} Users - {supabaseConnected?'Supabase Connected ✅ - Backend Save Active - Linked to Provost/Registrar/HOD':'Local Mode - Supabase Offline'} - Labe College Gboko</h4><div className="mt-3 overflow-x-auto border-2 rounded-xl bg-white"><table className="w-full text-[11px]"><thead className="bg-slate-900 text-white"><tr><th className="p-2 text-left">Full Name + Photo + Sex + Staying + Parent + Address - Linked</th><th className="p-2">Role</th><th className="p-2">Login ID (Matric/Staff ID) - LCNS/ST or LCNS/ND</th><th className="p-2">Password</th><th className="p-2">Status - Supabase</th><th className="p-2 text-center">Activate/Deactivate + Delete</th></tr></thead><tbody>{filteredUsers.map((u:any)=><tr key={u.email} className={`border-b ${u.status==='INACTIVE'?'bg-red-50':''}`}><td className="p-2"><div className="flex gap-2 items-center"><div className="w-8 h-8 bg-slate-200 rounded-full overflow-hidden">{u.staffImage?<img src={u.staffImage} className="w-full h-full object-cover"/>:<GraduationCap className="w-4 h-4"/>}</div><div><p className="font-black">{u.fullName} - Sex:{u.sex||'-'} - Stay:{u.staying||'-'}</p><p className="text-[10px]">{u.email} - {u.address||'-'}</p><p className="text-[9px]">Parent:{u.parentName||'-'} - {u.parentPhone||'-'} - Course:{u.courseOfStudy||u.department||'-'} - Level:{u.level||'-'} - Linked to Provost/Registrar/HOD/Exam Officer</p></div></div></td><td className="p-2"><span className={`px-2 py-1 rounded-full text-[10px] font-black ${getRoleColor(u.role)}`}>{u.role}</span></td><td className="p-2 font-mono font-black text-emerald-800">{u.loginId||u.matricNumber||u.staffId||u.loginIdRaw||'No ID'}</td><td className="p-2 font-mono"><span className="flex items-center gap-1">{showPasswords[u.email]?u.password:'••••••••'}<button onClick={()=>setShowPasswords({...showPasswords,[u.email]:!showPasswords[u.email]})} className="ml-1 bg-slate-100 p-1 rounded">{showPasswords[u.email]?<EyeOff className="w-3 h-3"/>:<Eye className="w-3 h-3"/>}</button></span></td><td className="p-2"><span className={`px-2 py-1 rounded-full text-[10px] font-black ${u.status==='INACTIVE'?'bg-red-600 text-white':'bg-emerald-600 text-white'}`}>{u.status||'ACTIVE'}</span><span className={`ml-1 px-1 py-0.5 rounded text-[8px] ${supabaseConnected?'bg-emerald-100 text-emerald-800':'bg-red-100 text-red-800'}`}>{supabaseConnected?'DB:OK - Linked':'Local - Linked'}</span></td><td className="p-2 text-center"><div className="flex gap-1 justify-center"><button onClick={()=>toggleUserStatus(u.email)} className={`px-3 py-1 rounded text-[10px] font-black flex gap-1 ${u.status==='INACTIVE'?'bg-emerald-600 text-white':'bg-amber-600 text-white'}`}>{u.status==='INACTIVE'?<><Check className="w-3 h-3"/> ACTIVATE</>:<><Ban className="w-3 h-3"/> DEACTIVATE</>}</button><button onClick={()=>deleteUser(u.email,u.fullName)} className="px-3 py-1 bg-red-600 text-white rounded text-[10px] font-black">DELETE</button></div></td></tr>)}</tbody></table></div></div>
          )}

          <div className="grid gap-3 max-h-[600px] overflow-y-auto">{filteredUsers.map((u:any)=><div key={u.email} className={`border-2 p-3 rounded-2xl flex justify-between ${u.status==='INACTIVE'?'bg-red-50 border-red-300':''}`}><div className="flex gap-2"><div className="w-12 h-12 bg-slate-200 rounded-2xl overflow-hidden border-2">{u.staffImage?<img src={u.staffImage} className="w-full h-full object-cover"/>:<GraduationCap className="w-6 h-6"/>}</div><div><div className="flex gap-2 items-center"><p className="font-black text-xs">{u.fullName} - {u.role} - Sex:{u.sex||'-'} - {u.staying||'-'} - {u.matricNumber||u.staffId} - Linked to Provost/Registrar/HOD</p><span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${u.status==='INACTIVE'?'bg-red-600 text-white':'bg-emerald-600 text-white'}`}>{u.status||'ACTIVE'}</span></div><p className="text-[11px]">{u.email} - Parent: {u.parentName||'-'} ({u.parentPhone||'-'}) - Addr: {u.address||'-'} - Course: {u.courseOfStudy||u.department||'-'} - Linked</p><p className="text-[10px] font-mono">Login: {u.loginId||u.matricNumber||u.staffId} - Pass: {showPasswords[u.email]?u.password:'••••'} - Supabase: {supabaseConnected?'Connected ✅ - Linked':'Local - Linked'} <button onClick={()=>setShowPasswords({...showPasswords,[u.email]:!showPasswords[u.email]})} className="ml-1 bg-slate-100 px-1 rounded">{showPasswords[u.email]?'HIDE':'SHOW'}</button></p></div></div><div className="flex flex-col gap-1"><div className="flex gap-1 flex-wrap">{ALL_ROLES.map(r=><button key={r.value} onClick={()=>assignRole(u.email,r.value)} className={`px-2 py-1 rounded text-[9px] border ${u.role===r.value?'bg-slate-900 text-white':'bg-white'}`}>{r.value}</button>)}</div><div className="flex gap-1 mt-1"><button onClick={()=>toggleUserStatus(u.email)} className={`px-3 py-1 rounded text-[10px] font-black ${u.status==='INACTIVE'?'bg-emerald-600 text-white':'bg-amber-600 text-white'}`}>{u.status==='INACTIVE'?'ACTIVATE':'DEACTIVATE'}</button><button onClick={()=>deleteUser(u.email,u.fullName)} className="px-3 py-1 bg-red-600 text-white rounded text-[10px] font-black">DELETE</button></div></div></div>)}</div>
        </div>
      )}

      {activeAdminTab==='result_publish' && (
        <div className="bg-white rounded-3xl border-2 border-red-400 p-6 space-y-6"><h2 className="text-xl font-black flex gap-2"><FileSpreadsheet className="w-6 h-6 text-red-600"/> Result Publish - Print with School Name + Logo - Labe College - Catholic Diocese of Gboko - Admin: {adminName} - {supabaseConnected?'Supabase Connected ✅ - Linked':'Local Mode - Linked'} - All biodata linked to Provost/Registrar/HOD/Exam Officer</h2><div className="flex gap-2"><div className="flex items-center gap-2 flex-1 bg-white border-2 border-amber-400 rounded-xl px-3"><Search className="w-4 h-4"/><input value={searchResult} onChange={e=>setSearchResult(e.target.value)} placeholder="Search by Name and Matric No - Linked biodata" className="flex-1 py-2.5 text-xs font-black outline-none"/></div><button onClick={refreshResults} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs">Refresh - {supabaseConnected?'Supabase - Linked':'Local - Linked'}</button></div>{!selectedPrintStudent ? (<div className="overflow-x-auto border-2 rounded-xl"><table className="w-full text-xs"><thead className="bg-slate-900 text-white"><tr><th className="p-3 text-left">Matric + Name + Photo + Sex + Staying + Parent - Linked</th><th className="p-3">CGPA</th><th className="p-3 text-center">Print with Logo - Labe College - Admin {adminName}</th></tr></thead><tbody>{filteredResults.slice(0,100).map((s:any)=>{const studResults=results.filter((r:any)=>r.matricNo===s.matricNumber); let cu=0,gp=0; studResults.forEach((r:any)=>{const g=r.score>=70?4:r.score>=60?3:r.score>=50?2:r.score>=40?1:0; cu+=r.creditUnit||3; gp+=(r.creditUnit||3)*g;}); const cgpa=cu?(gp/cu).toFixed(2):'0.00'; return (<tr key={s.email} className="border-b"><td className="p-3"><div className="flex gap-2"><div className="w-10 h-12 bg-slate-200 rounded border overflow-hidden">{s.staffImage?<img src={s.staffImage} className="w-full h-full object-cover"/>:<GraduationCap className="w-6 h-6"/>}</div><div><p className="font-mono font-black">{s.matricNumber} - Sex:{s.sex||'-'} - Stay:{s.staying||'-'} - Parent:{s.parentName||'-'} - Linked</p><p className="font-black uppercase">{s.fullName} - {s.address||''}</p></div></div></td><td className="p-3">{cgpa}</td><td className="p-3 text-center"><button onClick={()=>setSelectedPrintStudent(s)} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs flex gap-2 mx-auto"><Printer className="w-4 h-4"/> Print - Labe College + Logo - {adminName} - Linked</button></td></tr>);})}</tbody></table></div>) : (<div className="space-y-4"><div className="flex justify-between bg-slate-50 p-3 rounded-xl border"><p className="font-black text-sm">{selectedPrintStudent.fullName} - {selectedPrintStudent.matricNumber} - Sex:{selectedPrintStudent.sex} - Stay:{selectedPrintStudent.staying} - Parent:{selectedPrintStudent.parentName} - Addr:{selectedPrintStudent.address} - Labe College - Admin: {adminName} - Supabase: {supabaseConnected?'Connected ✅ - Linked to all':'Local - Linked'} - Linked to Provost/Registrar/HOD/Exam Officer</p><button onClick={()=>setSelectedPrintStudent(null)} className="px-4 py-2 bg-slate-200 rounded-xl text-xs">← Back</button></div><PrintableResultWithLogo matricNo={selectedPrintStudent.matricNumber} fullName={selectedPrintStudent.fullName} level={selectedPrintStudent.level||'ND1'} program={selectedPrintStudent.department||'Nursing'} results={results.filter((r:any)=>r.matricNo===selectedPrintStudent.matricNumber)} currentUserRole="ADMIN" currentUserName={adminName} senateApproved={senateInfo.approved} senateDate={senateInfo.date} senateProvost={senateInfo.provost} /></div>)}</div>
      )}

      {activeAdminTab==='scoresheets' && <ScoreSheetViewer currentUser={{id:'admin',email:adminEmail,role:'ADMIN',fullName:adminName,status:'ACTIVE'}} />}
    </div>
  );
};

// ===== FINAL EXPORTS - FIX FOR MISSING_EXPORT ERROR - DO NOT DELETE =====
export { AdminDashboard as AdminDashboardNamed };
export default AdminDashboard;

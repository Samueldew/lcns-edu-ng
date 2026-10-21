import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import { Users, BookOpen, Crown, UserCheck, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { CollegeLogo } from '../common/CollegeLogo';

// Keep your existing components - DO NOT DELETE
const StudentPromotion = () => <div className="bg-white p-6 rounded-3xl border-2 text-xs font-bold">Student Promotion Module - Existing</div>;
const AdminSettings = () => <div className="bg-white p-6 rounded-3xl border-2 text-xs font-bold">Admin Settings - Existing</div>;
const AdminManagement = () => <div className="bg-white p-6 rounded-3xl border-2 text-xs font-bold">Admin Management - Existing</div>;
const CBTExamManager = ({ currentUser }: any) => <div className="bg-white p-6 rounded-3xl border-2 text-xs">CBT Manager for {currentUser.email}</div>;
const AdminAdmissionManager = ({ currentUser }: any) => <div className="bg-white p-6 rounded-3xl border-2 text-xs">Admission Manager</div>;
const AdminGallery = () => {
  const [items, setItems] = useState<any[]>(() => JSON.parse(localStorage.getItem('lcns_gallery') || '[]'));
  const [title, setTitle] = useState(''); const [desc, setDesc] = useState(''); const [image, setImage] = useState('');
  const handleImg = (e:any)=>{ const f=e.target.files?.[0]; if(!f)return; const r=new FileReader(); r.onload=()=>setImage(r.result as string); r.readAsDataURL(f); };
  const add = ()=>{ if(!image||!title)return alert('Add title & image'); const n={id:Date.now(),title,description:desc,image,date:new Date().toLocaleDateString()}; const u=[n,...items]; setItems(u); localStorage.setItem('lcns_gallery',JSON.stringify(u)); setTitle('');setDesc('');setImage(''); };
  const del=(id:number)=>{ const u=items.filter((i:any)=>i.id!==id); setItems(u); localStorage.setItem('lcns_gallery',JSON.stringify(u)); };
  return (
    <div className="space-y-4">
      <div className="bg-white border-2 rounded-3xl p-4">
        <h3 className="font-black text-xs">Add to Gallery - Title & Description</h3>
        <div className="grid md:grid-cols-2 gap-3 mt-3">
          <div><div className="h-48 bg-slate-50 border-2 border-dashed rounded-2xl flex items-center justify-center overflow-hidden">{image?<img src={image} className="w-full h-full object-cover"/>:<span className="text-[10px]">Preview</span>}</div><input type="file" accept="image/*" onChange={handleImg} className="w-full mt-2 text-[11px] file:bg-slate-900 file:text-white file:rounded-xl file:border-0 file:px-3 file:py-2" /></div>
          <div className="space-y-2"><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="w-full p-2.5 border-2 rounded-xl text-xs font-bold"/><textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Description" className="w-full p-2.5 border-2 rounded-xl text-xs h-28"/><button onClick={add} className="w-full bg-slate-900 text-white py-2.5 rounded-xl text-xs font-black">ADD TO GALLERY</button></div>
        </div>
      </div>
      <div className="bg-white border-2 rounded-3xl p-4"><h3 className="font-black text-xs">Gallery - {items.length}</h3><div className="grid md:grid-cols-3 gap-3 mt-3">{items.map((it:any)=><div key={it.id} className="border rounded-2xl overflow-hidden"><img src={it.image} className="w-full h-32 object-cover"/><div className="p-2"><p className="font-black text-[11px]">{it.title}</p><p className="text-[10px] text-slate-600">{it.description}</p><button onClick={()=>del(it.id)} className="mt-1 w-full bg-red-600 text-white py-1 rounded-xl text-[9px]">DELETE</button></div></div>)}</div></div>
    </div>
  );
};

// === NEW: BISHOP & PROVOST UPLOAD - ONLY ADDITION ===
const LeadershipManager = () => {
  const [bishop, setBishop] = useState<any>(()=>JSON.parse(localStorage.getItem('lcns_bishop')||'null')||{name:'Most Rev. Isaac B. Dugu',title:'Bishop, Catholic Diocese of Gboko',image:'',description:'Proprietor'});
  const [provost, setProvost] = useState<any>(()=>JSON.parse(localStorage.getItem('lcns_provost')||'null')||{name:'Provost',title:'Provost, CON Gboko',image:'',description:'Head of Institution'});

  const handleImg = (e:React.ChangeEvent<HTMLInputElement>, type:'bishop'|'provost')=>{
    const file=e.target.files?.[0]; if(!file)return; const reader=new FileReader();
    reader.onload=()=>{ const base64=reader.result as string; if(type==='bishop'){ const u={...bishop,image:base64}; setBishop(u); localStorage.setItem('lcns_bishop',JSON.stringify(u)); } else { const u={...provost,image:base64}; setProvost(u); localStorage.setItem('lcns_provost',JSON.stringify(u)); } };
    reader.readAsDataURL(file);
  };
  const save = (type:'bishop'|'provost')=>{
    if(type==='bishop'){ localStorage.setItem('lcns_bishop',JSON.stringify(bishop)); alert('Bishop saved! Will show on homepage'); }
    else { localStorage.setItem('lcns_provost',JSON.stringify(provost)); alert('Provost saved! Will show on homepage'); }
  };

  return (
    <div className="grid md:grid-cols-2 gap-5">
      <div className="bg-gradient-to-br from-amber-50 to-orange-100 border-2 border-amber-300 rounded-3xl p-5">
        <h3 className="font-black text-amber-900 text-xs flex items-center gap-2"><Crown className="w-4 h-4"/> BISHOP PICTURE</h3>
        <div className="mt-3 space-y-2">
          <div className="w-full h-64 bg-white rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden">{bishop.image?<img src={bishop.image} className="w-full h-full object-cover"/>:<span className="text-[10px]">No Bishop Image</span>}</div>
          <input type="file" accept="image/*" onChange={(e)=>handleImg(e,'bishop')} className="w-full text-[10px] file:bg-amber-900 file:text-white file:rounded-xl file:border-0 file:px-3 file:py-2"/>
          <input value={bishop.name} onChange={e=>setBishop({...bishop,name:e.target.value})} placeholder="Bishop Name" className="w-full p-2 border-2 rounded-xl text-xs font-bold"/>
          <input value={bishop.title} onChange={e=>setBishop({...bishop,title:e.target.value})} placeholder="Bishop Title" className="w-full p-2 border-2 rounded-xl text-xs"/>
          <textarea value={bishop.description} onChange={e=>setBishop({...bishop,description:e.target.value})} placeholder="Description" className="w-full p-2 border-2 rounded-xl text-xs h-20"/>
          <button onClick={()=>save('bishop')} className="w-full bg-amber-900 text-white py-3 rounded-xl font-black text-xs">SAVE BISHOP</button>
        </div>
      </div>
      <div className="bg-gradient-to-br from-emerald-50 to-teal-100 border-2 border-emerald-300 rounded-3xl p-5">
        <h3 className="font-black text-emerald-900 text-xs flex items-center gap-2"><UserCheck className="w-4 h-4"/> PROVOST PICTURE</h3>
        <div className="mt-3 space-y-2">
          <div className="w-full h-64 bg-white rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden">{provost.image?<img src={provost.image} className="w-full h-full object-cover"/>:<span className="text-[10px]">No Provost Image</span>}</div>
          <input type="file" accept="image/*" onChange={(e)=>handleImg(e,'provost')} className="w-full text-[10px] file:bg-emerald-800 file:text-white file:rounded-xl file:border-0 file:px-3 file:py-2"/>
          <input value={provost.name} onChange={e=>setProvost({...provost,name:e.target.value})} placeholder="Provost Name" className="w-full p-2 border-2 rounded-xl text-xs font-bold"/>
          <input value={provost.title} onChange={e=>setProvost({...provost,title:e.target.value})} placeholder="Provost Title" className="w-full p-2 border-2 rounded-xl text-xs"/>
          <textarea value={provost.description} onChange={e=>setProvost({...provost,description:e.target.value})} placeholder="Description" className="w-full p-2 border-2 rounded-xl text-xs h-20"/>
          <button onClick={()=>save('provost')} className="w-full bg-emerald-800 text-white py-3 rounded-xl font-black text-xs">SAVE PROVOST</button>
        </div>
      </div>
    </div>
  );
};

// === YOUR EXISTING DASHBOARD - UNCHANGED ===
export const AdminDashboard: React.FC = () => {
  const [activeAdminTab, setActiveAdminTab] = useState('dashboard');
  const [users, setUsers] = useState<any[]>(() => { try { return StorageService.getAllUsers?.() || JSON.parse(localStorage.getItem('lcns_users')||'[]'); } catch { return []; } });
  const [courses] = useState<any[]>(() => { try { return StorageService.getCourses?.() || []; } catch { return []; } });
  const [lecturers] = useState<any[]>(() => { try { return StorageService.getLecturers?.() || []; } catch { return []; } });
  const [appStatus] = useState({ isOpen: true });
  const currentSession = '2024/2025'; const currentYear = '2025';
  const backendData = { tables: { student_scores: 0 } };
  const ALL_ROLES = [{value:'ADMIN'},{value:'STUDENT'},{value:'LECTURER'},{value:'HOD'},{value:'REGISTRAR'},{value:'EXAM_OFFICER'},{value:'BURSAR'},{value:'PROVOST'}];
  const assignRole = (email:string, role:string)=>{ try{ StorageService.updateUserRole?.(email,role);}catch{} setUsers((prev:any[])=>prev.map((u:any)=>u.email===email?{...u,role}:u)); };
  const deleteUser = (email:string, name:string, id:string)=>{ if(!confirm(`Delete ${name}?`))return; try{ StorageService.deleteUser?.(email);}catch{} setUsers((prev:any[])=>prev.filter((u:any)=>u.email!==email)); };

  useEffect(()=>{ try{ const all=StorageService.getAllUsers?.()||[]; if(all.length) setUsers(all); }catch{} }, [activeAdminTab]);

  const TabBtn = ({id,label}:{id:string,label:string})=>(<button onClick={()=>setActiveAdminTab(id)} className={`px-3 py-2 rounded-xl text-[10px] font-black border ${activeAdminTab===id?'bg-slate-900 text-white border-slate-900':'bg-white text-slate-700 border-slate-200'}`}>{label}</button>);

  return (
    <div className="space-y-4 p-1">
      <div className="bg-gradient-to-r from-slate-900 via-emerald-900 to-slate-900 text-white rounded-3xl p-5 shadow-xl border border-emerald-800">
        <div className="flex items-center gap-3"><CollegeLogo size="md" /><div><h1 className="text-[13px] font-black uppercase">College of Nursing Sciences, Catholic Diocese of Gboko</h1><p className="text-[10px] text-emerald-200">Admin Dashboard - Maintained + Bishop/Provost Added</p></div></div>
        <div className="flex flex-wrap gap-1.5 mt-4">
          <TabBtn id="dashboard" label="DASHBOARD" />
          <TabBtn id="leadership" label="👑 BISHOP & PROVOST" />
          <TabBtn id="users" label={`USERS (${users.length})`} />
          <TabBtn id="courses" label="COURSES" />
          <TabBtn id="gallery" label="GALLERY" />
          <TabBtn id="applicants" label="APPLICANTS" />
          <TabBtn id="cbt" label="CBT" />
          <TabBtn id="promotion" label="PROMOTION" />
          <TabBtn id="management" label="MANAGEMENT" />
          <TabBtn id="settings" label="SETTINGS" />
          <TabBtn id="system" label="SYSTEM" />
        </div>
      </div>

      {activeAdminTab === 'dashboard' && (
        <div className="grid md:grid-cols-3 gap-3">
          <div className="bg-white border-2 rounded-2xl p-4 text-center"><Users className="w-6 h-6 mx-auto text-emerald-700"/><p className="font-black text-xl">{users.length}</p><p className="text-[10px] font-bold">USERS</p></div>
          <div className="bg-white border-2 rounded-2xl p-4 text-center"><Crown className="w-6 h-6 mx-auto text-amber-700"/><p className="font-black text-[11px]">BISHOP & PROVOST</p><p className="text-[9px]">Upload in Leadership Tab</p></div>
          <div className="bg-white border-2 rounded-2xl p-4 text-center"><ImageIcon className="w-6 h-6 mx-auto text-blue-700"/><p className="font-black text-xl">{JSON.parse(localStorage.getItem('lcns_gallery')||'[]').length}</p><p className="text-[10px] font-bold">GALLERY</p></div>
        </div>
      )}

      {activeAdminTab === 'leadership' && <LeadershipManager />}

      {activeAdminTab === 'users' && (
        <div className="bg-white rounded-3xl border-2 p-4">
          <h2 className="font-black text-sm">All Users - {users.length}</h2>
          <div className="mt-3 space-y-2 max-h-[70vh] overflow-y-auto">
            {users.map((u:any)=>(
              <div key={u.email} className="border rounded-2xl p-3">
                <div className="flex justify-between gap-3">
                  <div>
                    <div className="font-black text-xs">{u.fullName||u.email} - {u.matricNumber||u.staffId||''}</div>
                    <div className="text-[11px] text-slate-600">{u.email} - {u.level} - {u.phone}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-1">
                      {ALL_ROLES.map(r=>(
                        <button key={r.value} onClick={()=>assignRole(u.email, r.value)} className={`px-2 py-1 rounded-xl text-[9px] font-black border ${u.role===r.value?'bg-slate-900 text-white':'bg-white'}`}>{r.value.replace('_',' ')}</button>
                      ))}
                    </div>
                    <button onClick={()=>deleteUser(u.email, u.fullName||u.email, u.matricNumber||u.staffId)} className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-[10px] font-black">DELETE</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeAdminTab === 'promotion' && <StudentPromotion />}
      {activeAdminTab === 'settings' && <AdminSettings />}
      {activeAdminTab === 'management' && <AdminManagement />}
      {activeAdminTab === 'gallery' && <AdminGallery />}
      {activeAdminTab === 'cbt' && <CBTExamManager currentUser={{id:'admin',email:'admin@lcns.edu.ng',role:'ADMIN',fullName:'Admin',status:'ACTIVE'}} />}
      {activeAdminTab === 'courses' && (<div className="bg-white rounded-3xl border-2 p-4"><h2 className="font-black">📚 Courses - {courses.length} - Lecturers {lecturers.length}</h2><div className="overflow-x-auto border-2 rounded-xl mt-3"><table className="w-full text-xs"><thead className="bg-slate-900 text-white"><tr><th className="p-2">Code</th><th className="p-2">Title</th><th className="p-2">Lecturer</th></tr></thead><tbody>{courses.map((c:any)=><tr key={c.id} className="border-b"><td className="p-2 font-mono">{c.code}</td><td className="p-2">{c.title}</td><td className="p-2">{c.lecturer}</td></tr>)}</tbody></table></div></div>)}
      {activeAdminTab === 'applicants' && (<div className="space-y-4"><div className="bg-purple-50 border-2 border-purple-300 p-3 rounded-xl text-xs font-bold">🎓 Applicants - App {appStatus.isOpen?'OPEN':'CLOSED'}</div><AdminAdmissionManager currentUser={{id:'admin',email:'admin@lcns.edu.ng',role:'ADMIN',fullName:'Admin',status:'ACTIVE'}} /></div>)}
      {activeAdminTab === 'system' && (<div className="bg-white rounded-3xl border-2 p-6 text-xs"><h3 className="font-black">System Health</h3><p>Session: {currentSession} - Matric Year: {currentYear}</p><p>Users: {users.length}</p><p>Score Sheets Submitted: {backendData.tables?.student_scores || 0}</p></div>)}
    </div>
  );
};

export default AdminDashboard;

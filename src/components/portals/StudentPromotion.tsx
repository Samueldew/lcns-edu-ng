import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import { User } from '../../types';
import { ArrowUpCircle, GraduationCap, Search, Users, Award, Calendar, Plus, CheckCircle, Settings } from 'lucide-react';

type Level = 'ND1' | 'ND2' | 'HND1' | 'HND2';
type Semester = 'First' | 'Second';
interface StudentRecord extends User {
  level?: Level; semester?: Semester; session?: string; status?: string; matricNo?: string;
}
interface AcademicSession { id: string; name: string; isCurrent: boolean; startDate: string; endDate: string; createdAt: string; }

const getNext = (level: Level, sem: Semester) => {
  if(level==='ND1' && sem==='First') return {level:'ND1', semester:'Second'};
  if(level==='ND1' && sem==='Second') return {level:'ND2', semester:'First'};
  if(level==='ND2' && sem==='First') return {level:'ND2', semester:'Second'};
  if(level==='ND2' && sem==='Second') return {level:'HND1', semester:'First'};
  if(level==='HND1' && sem==='First') return {level:'HND1', semester:'Second'};
  if(level==='HND1' && sem==='Second') return {level:'HND2', semester:'First'};
  if(level==='HND2' && sem==='First') return {level:'HND2', semester:'Second'};
  if(level==='HND2' && sem==='Second') return {level:'GRADUATED', semester:'Second'};
  return null;
};

export const StudentPromotion: React.FC = () => {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [filterLevel, setFilterLevel] = useState<any>('ALL');
  const [filterSem, setFilterSem] = useState<any>('ALL');
  const [filterSession, setFilterSession] = useState('2025/2026');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [currentSession, setCurrentSession] = useState('2025/2026');
  const [targetSession, setTargetSession] = useState('2026/2027');
  const [newSessionName, setNewSessionName] = useState('');
  const [showSessionManager, setShowSessionManager] = useState(true);

  const SESS_KEY = 'lcns_academic_sessions'; const CURR_SESS_KEY = 'lcns_current_session';

  useEffect(()=>{
    const saved = JSON.parse(localStorage.getItem(SESS_KEY) || '[]');
    if(saved.length===0){
      const defaults = [
        {id:'1', name:'2024/2025', isCurrent:false, startDate:'2024-09-01', endDate:'2025-07-31', createdAt:new Date().toISOString()},
        {id:'2', name:'2025/2026', isCurrent:true, startDate:'2025-09-01', endDate:'2026-07-31', createdAt:new Date().toISOString()},
        {id:'3', name:'2026/2027', isCurrent:false, startDate:'2026-09-01', endDate:'2027-07-31', createdAt:new Date().toISOString()},
      ];
      localStorage.setItem(SESS_KEY, JSON.stringify(defaults)); setSessions(defaults);
    } else { setSessions(saved); const cur=saved.find((s:any)=>s.isCurrent); if(cur) setCurrentSession(cur.name); }
    const curr=localStorage.getItem(CURR_SESS_KEY); if(curr) setCurrentSession(curr);
    const users = (StorageService.getUsers() as any[]).filter(u=>u.role==='STUDENT').map(u=>({ ...u, level:u.level||'ND1', semester:u.semester||'First', session:u.session||'2025/2026', status:u.status||'active', matricNo:u.matricNo||u.id }));
    setStudents(users);
  }, []);

  const saveSessions = (list: AcademicSession[]) => { localStorage.setItem(SESS_KEY, JSON.stringify(list)); setSessions(list); const cur=list.find(s=>s.isCurrent); if(cur){ localStorage.setItem(CURR_SESS_KEY, cur.name); setCurrentSession(cur.name);} };

  const handleCreateSession = () => {
    if(!newSessionName.trim() || !/^\d{4}\/\d{4}$/.test(newSessionName.trim())) return alert('Enter e.g. 2026/2027');
    if(sessions.some(s=>s.name===newSessionName.trim())) return alert('Session exists');
    const newSess = {id:Date.now().toString(), name:newSessionName.trim(), isCurrent:false, startDate:`${newSessionName.split('/')[0]}-09-01`, endDate:`${newSessionName.split('/')[1]}-07-31`, createdAt:new Date().toISOString()};
    saveSessions([...sessions, newSess].sort((a,b)=>a.name.localeCompare(b.name))); setNewSessionName(''); alert(`✅ ${newSess.name} created!`);
  };
  const handleSetCurrent = (name: string) => {
    if(!confirm(`Set ${name} as CURRENT session?`)) return;
    saveSessions(sessions.map(s=>({...s, isCurrent:s.name===name}))); setCurrentSession(name); setFilterSession(name); setTargetSession(name);
    try{ const adm=JSON.parse(localStorage.getItem('lcns_admission_settings')||'{}'); adm.session=name; localStorage.setItem('lcns_admission_settings', JSON.stringify(adm)); }catch{}
    alert(`✅ Current Session now ${name}`);
  };

  const filtered = students.filter(s=>{
    if(s.status==='graduated') return false;
    if(filterLevel!=='ALL' && s.level!==filterLevel) return false;
    if(filterSem!=='ALL' && s.semester!==filterSem) return false;
    if(filterSession && s.session!==filterSession) return false;
    if(search && !`${s.fullName} ${s.matricNo}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggleSelect = (id:string)=>{ const ns=new Set(selected); if(ns.has(id)) ns.delete(id); else ns.add(id); setSelected(ns); };
  const selectAll = ()=>{ if(selected.size===filtered.length) setSelected(new Set()); else setSelected(new Set(filtered.map(s=>s.id))); };

  const promoteSelected = (type:any='AUTO')=>{
    if(selected.size===0) return alert('Select students'); if(!confirm(`Promote ${selected.size} to ${targetSession}?`)) return;
    const users = StorageService.getUsers() as any[]; const updated = users.map(u=>{
      if(!selected.has(u.id)) return u;
      if(type==='GRADUATE') return {...u, status:'graduated', graduatedAt:new Date().toISOString(), session:targetSession};
      const next=getNext(u.level||'ND1', u.semester||'First') as any; if(!next) return u;
      if(next.level==='GRADUATED') return {...u, status:'graduated', graduatedAt:new Date().toISOString(), session:targetSession};
      return {...u, level:next.level, semester:next.semester, session:targetSession, status:'active'};
    });
    localStorage.setItem('lcns_users', JSON.stringify(updated)); try{ (StorageService as any).saveUsers(updated);}catch{}
    setSelected(new Set()); setStudents(updated.filter((u:any)=>u.role==='STUDENT').map((u:any)=>({ ...u, level:u.level||'ND1', semester:u.semester||'First', session:u.session||currentSession, status:u.status||'active', matricNo:u.matricNo||u.id })));
    alert(`✅ Promoted to ${targetSession}`);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 bg-white rounded-xl shadow space-y-4">
      <div className="flex flex-wrap justify-between gap-3 border-b pb-3">
        <h2 className="text-xl font-black text-emerald-900 flex items-center gap-2"><ArrowUpCircle className="text-emerald-600"/> Student Promotion & Academic Year 2026/2027</h2>
        <span className="bg-emerald-900 text-white px-3 py-1 rounded-full text-xs font-black flex items-center gap-1"><Calendar className="w-3 h-3"/> Current: {currentSession}</span>
      </div>

      <div className="bg-emerald-50 border-2 border-emerald-200 p-4 rounded-xl">
        <h3 className="font-black text-sm">Academic Session Management - Admin & Registrar</h3>
        <div className="mt-3 flex flex-wrap gap-2 items-end bg-white p-3 rounded-xl border">
          <div className="flex-1 min-w-[140px]"><label className="text-[11px] font-bold">New Session e.g. 2026/2027</label><input value={newSessionName} onChange={e=>setNewSessionName(e.target.value)} placeholder="2026/2027" className="w-full mt-1 px-3 py-2 border rounded-lg text-sm font-black text-black"/></div>
          <button onClick={handleCreateSession} className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-black flex items-center gap-1"><Plus className="w-4 h-4"/> Create</button>
          <div className="flex-1 min-w-[140px]"><label className="text-[11px] font-bold">Promote To Session</label><select value={targetSession} onChange={e=>setTargetSession(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm font-black text-black">{sessions.map(s=><option key={s.id} value={s.name}>{s.name}</option>)}</select></div>
        </div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
          {sessions.map(s=>(
            <div key={s.id} className={`p-3 rounded-xl border-2 flex justify-between items-center ${s.isCurrent?'bg-green-100 border-green-400':'bg-white'}`}>
              <div><p className="font-black text-sm text-black">{s.isCurrent && <CheckCircle className="w-4 h-4 inline text-green-600"/>} {s.name}</p><p className="text-[10px]">{s.startDate} to {s.endDate}</p></div>
              {!s.isCurrent ? <button onClick={()=>handleSetCurrent(s.name)} className="px-3 py-1 bg-slate-800 text-white rounded-lg text-[11px]">Set Current</button> : <span className="text-[11px] font-bold text-green-700">Active</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 bg-slate-50 p-3 rounded-xl border">
        <select value={filterLevel} onChange={e=>setFilterLevel(e.target.value)} className="px-2 py-2 border rounded-lg text-xs font-bold text-black"><option value="ALL">All Levels</option><option value="ND1">ND1</option><option value="ND2">ND2</option><option value="HND1">HND1</option><option value="HND2">HND2</option></select>
        <select value={filterSem} onChange={e=>setFilterSem(e.target.value)} className="px-2 py-2 border rounded-lg text-xs font-bold text-black"><option value="ALL">All Sems</option><option value="First">First</option><option value="Second">Second</option></select>
        <select value={filterSession} onChange={e=>setFilterSession(e.target.value)} className="px-2 py-2 border rounded-lg text-xs font-bold text-black">{sessions.map(s=><option key={s.id} value={s.name}>{s.name}</option>)}</select>
        <select value={targetSession} onChange={e=>setTargetSession(e.target.value)} className="px-2 py-2 border-2 border-amber-400 rounded-lg text-xs font-black bg-amber-50 text-black">{sessions.map(s=><option key={s.id} value={s.name}>→ {s.name}</option>)}</select>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name" className="px-2 py-2 border rounded-lg text-xs text-black"/>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={selectAll} className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold">{selected.size===filtered.length?'Deselect':'Select All'}</button>
        <button onClick={()=>promoteSelected('AUTO')} disabled={selected.size===0} className="px-4 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-black disabled:bg-gray-300">Auto Promote → {targetSession}</button>
        <button onClick={()=>promoteSelected('GRADUATE')} disabled={selected.size===0} className="px-4 py-1.5 bg-amber-500 text-black rounded-lg text-xs font-black disabled:bg-gray-300">Graduate in {targetSession}</button>
        <span className="text-xs ml-auto bg-emerald-100 px-2 py-1 rounded-full font-bold"><Users className="w-3 h-3 inline"/> {filtered.length} in {filterSession} | {selected.size} selected</span>
      </div>

      <div className="overflow-x-auto border rounded-xl">
        <table className="w-full text-xs">
          <thead className="bg-emerald-900 text-white text-[11px] uppercase"><tr><th className="p-2"><input type="checkbox" checked={selected.size===filtered.length && filtered.length>0} onChange={selectAll}/></th><th className="p-2 text-left">Matric</th><th className="p-2 text-left">Name</th><th className="p-2">Level</th><th className="p-2">Sem</th><th className="p-2">Session</th><th className="p-2">Next</th><th className="p-2">Action</th></tr></thead>
          <tbody>{filtered.map(s=>{ const next=getNext(s.level as any, s.semester as any) as any; return (<tr key={s.id} className="border-b"><td className="p-2 text-center"><input type="checkbox" checked={selected.has(s.id)} onChange={()=>toggleSelect(s.id)}/></td><td className="p-2 font-bold">{s.matricNo}</td><td className="p-2 font-bold">{s.fullName}</td><td className="p-2 text-center"><span className="bg-emerald-100 px-2 py-0.5 rounded-full font-black">{s.level}</span></td><td className="p-2 text-center">{s.semester}</td><td className="p-2 text-center">{s.session}</td><td className="p-2 text-center">{next ? next.level==='GRADUATED' ? <span className="bg-amber-200 px-2 py-0.5 rounded-full font-black"><Award className="w-3 h-3 inline"/> GRADUATE</span> : <span className="bg-blue-100 px-2 py-0.5 rounded-full font-bold">{next.level} {next.semester}</span> : '-'}</td><td className="p-2 text-center"><button onClick={()=>{ setSelected(new Set([s.id])); setTimeout(()=>promoteSelected('AUTO'),200); }} className="px-2 py-1 bg-emerald-600 text-white rounded text-[11px]">Promote</button></td></tr>); })}{filtered.length===0 && <tr><td colSpan={8} className="p-8 text-center text-slate-400">No students in {filterSession}</td></tr>}</tbody>
        </table>
      </div>
    </div>
  );
};

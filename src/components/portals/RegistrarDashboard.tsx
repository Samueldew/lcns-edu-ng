import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import { COLLEGE_CONFIG } from '../../types';
import { Award, Users, FileCheck, Send, BookOpen, Search, Printer, FileSpreadsheet, ArrowLeft, Building } from 'lucide-react';
import { CBTExamManager } from '../cbt/CBTExamManager';
import { AdmissionProcessingView } from './AdmissionProcessingView';
import { AdminAdmissionManager } from '../admin/AdminAdmissionManager';
import { PrintableResultWithLogo } from '../common/PrintableResultWithLogo';
import { AdminExamSettings } from './AdminExamSettings';
import { InterviewScoresEntryView } from '../admin/InterviewScoresEntryView';
import { supabase } from '@/lib/supabase';
import { ProvostCBTManager } from "./ProvostCBTManager";
import { CheckCircle2 } from 'lucide-react';

export const ProvostDashboard: React.FC = () => {
  const safeCurrentUser = (() => {
    try { const keys = ['lcns_erp_current_user', 'lcns-current-user', 'lcns_current_user', 'lcns_user']; for (const k of keys) { const v = localStorage.getItem(k); if (v) { const parsed = JSON.parse(v); if (parsed && parsed.email) return parsed; } } return StorageService.getCurrentUser(); } catch { return null; }
  })();
  const currentUser = safeCurrentUser || { email: 'provost@lcns.edu.ng', role: 'PROVOST', fullName: 'Mrs Terna Fiase' };
  const displayName = (currentUser?.fullName || currentUser?.email || 'Mrs Terna Fiase').toString().toUpperCase();
  const displayEmail = currentUser?.email || 'provost@lcns.edu.ng';

  const [activeTab, setActiveTab] = useState('provost_vet');
  const students = StorageService.getStudents();
  const applicants = StorageService.getApplicants();
  const [users, setUsers] = useState<any[]>(() => { try { return JSON.parse(localStorage.getItem('lcns_users') || '[]'); } catch { return []; } });
  const [userSearch, setUserSearch] = useState('');
  const [computationResults, setComputationResults] = useState<any[]>(() => { try { return JSON.parse(localStorage.getItem('lcns_results') || '[]'); } catch { return []; } });
  const [registrarVetted, setRegistrarVetted] = useState<any[]>(() => { try { return JSON.parse(localStorage.getItem('lcns_results_registrar_vetted') || localStorage.getItem('lcns_results') || '[]'); } catch { return []; } });
  const [searchIndividual, setSearchIndividual] = useState('');
  const [selectedPrintStudent, setSelectedPrintStudent] = useState<any>(null);
  const [searchBiodata, setSearchBiodata] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [selectedSession, setSelectedSession] = useState(COLLEGE_CONFIG.CURRENT_SESSION || '2026/2027');
  const [selectedSemester, setSelectedSemester] = useState<'First' | 'Second'>('First');
  const [supabaseGpa, setSupabaseGpa] = useState<any[]>([]);
  const [supabaseCgpa, setSupabaseCgpa] = useState<any[]>([]);
  const [vetStatus, setVetStatus] = useState(() => localStorage.getItem('lcns_provost_vet_status') || 'PENDING');
  const [searchVet, setSearchVet] = useState('');
  const [searchSemesterPrint, setSearchSemesterPrint] = useState('');
  const [senateApproved, setSenateApproved] = useState(() => localStorage.getItem('lcns_senate_approved')==='true');
  const [examSettings, setExamSettings] = useState<any>(() => { try { return JSON.parse(localStorage.getItem('lcns_exam_settings') || '{}'); } catch { return {}; } });
  const [examResultsPublished, setExamResultsPublished] = useState(() => localStorage.getItem('lcns_entrance_results_published') === 'true');
  const [examSubmissions, setExamSubmissions] = useState<any[]>(() => { try { return JSON.parse(localStorage.getItem('lcns_exam_submissions') || '[]'); } catch { return []; } });
  const [senateInfo, setSenateInfo] = useState<any>(() => ({ approved: false, date: new Date().toISOString(), provost: displayName }));

  const getCurrentLevel = (matricNo: string, fallbackLevel: string = '') => {
    try { const found = users.find((u: any) => (u.matricNumber || u.matric_no || '').toUpperCase() === matricNo.toUpperCase()); if (found && found.level) return found.level; return fallbackLevel; } catch { return fallbackLevel; }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const { data: allUsers } = await supabase.from('users').select('*').order('created_at', { ascending: false });
        if(allUsers && allUsers.length>0){
          const formatted = allUsers.map((u:any)=>({
            fullName: u.full_name||u.fullName, email: u.email, role: u.role, phone: u.phone||'', level: u.level||'', sex: u.sex||u.gender||'', department: u.department, matricNumber: u.matric_no||'', matric_no: u.matric_no||'',
          }));
          setUsers(formatted);
          localStorage.setItem('lcns_users', JSON.stringify(formatted));
        }
      } catch {}
    };
    load();
  }, []);

  // PRIVACY: Only STUDENT, only 5 fields
  const filteredUsers = users.filter((u:any)=> u.role==='STUDENT').filter((u:any)=>{ if(!userSearch) return true; const t=userSearch.toLowerCase(); return (u.fullName||'').toLowerCase().includes(t) || (u.email||'').toLowerCase().includes(t) || (u.level||'').toLowerCase().includes(t) || (u.phone||'').toLowerCase().includes(t) || (u.sex||'').toLowerCase().includes(t); });

  const filteredIndividual = students.filter((s: any) => { if (!searchIndividual) return true; const term = searchIndividual.toLowerCase().trim(); return s.fullName.toLowerCase().includes(term) || s.matricNo.toLowerCase().includes(term); });
  const filteredBiodata = students.filter((s:any)=>{ if(levelFilter!=='ALL' && getCurrentLevel(s.matricNo, s.level)!==levelFilter) return false; if(!searchBiodata) return true; return `${s.fullName} ${s.matricNo} ${getCurrentLevel(s.matricNo, s.level)}`.toLowerCase().includes(searchBiodata.toLowerCase()); });
  const filteredVet = registrarVetted.filter((r:any)=>{ if(!searchVet) return true; const term=searchVet.toLowerCase(); return (r.matricNo||r.matric_no||'').toLowerCase().includes(term) || (r.fullName||'').toLowerCase().includes(term); });
  const semesterFiltered = registrarVetted.filter((r:any)=>{ const sess = r.session || r.academic_session || selectedSession; const sem = r.semester || 'First'; const matchSession = sess === selectedSession; const matchSem = sem.toLowerCase().startsWith(selectedSemester.toLowerCase().slice(0,3).toLowerCase()); if(!searchSemesterPrint) return matchSession && matchSem; const term=searchSemesterPrint.toLowerCase(); return matchSession && matchSem && ((r.matricNo||r.matric_no||'').toLowerCase().includes(term) || (r.fullName||'').toLowerCase().includes(term)); });

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white rounded-3xl p-6 shadow-xl">
        <div className="flex justify-between"><div><span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-emerald-800 px-3 py-1 rounded-full">Provost - Privacy Mode - Only Name, Sex, Level, Email, Phone</span><h1 className="text-2xl font-black uppercase mt-2">{displayName}</h1><p className="text-xs text-emerald-200">{displayEmail} - Students: {filteredUsers.length}</p></div><div className="text-right"><span className="text-xs text-emerald-300 block">Academic Session</span><span className="text-lg font-black text-amber-400">{COLLEGE_CONFIG.CURRENT_SESSION}</span></div></div>
      </div>

      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border">
        <button onClick={() => setActiveTab('users')} className={`px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='users'?'bg-slate-900 text-white':'bg-slate-50 border-2 border-amber-400'}`}>👤 Students - {filteredUsers.length} - Only 5 Fields</button>
        <button onClick={() => setActiveTab('provost_vet')} className={`px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='provost_vet'?'bg-emerald-700 text-white':'bg-emerald-50 border'}`}>🔍 PROVOST VET</button>
        <button onClick={() => setActiveTab('cbt_batched')} className={`px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='cbt_batched'?'bg-purple-900 text-white':'bg-purple-50 border'}`}>📝 CBT Batch 35/hr</button>
        <button onClick={() => setActiveTab('individual_result')} className={`px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='individual_result'?'bg-slate-900 text-white':'bg-amber-50 border'}`}>🖨️ Individual Result</button>
        <button onClick={() => setActiveTab('result_publish')} className={`px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='result_publish'?'bg-red-700 text-white':'bg-red-50 border'}`}>🎓 Publish</button>
        <button onClick={() => setActiveTab('entrance_exam')} className={`px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='entrance_exam'?'bg-amber-500 text-black':'bg-amber-50 border'}`}>📝 Entrance Exam</button>
      </div>

      {activeTab==='users' && (
        <div className="bg-white rounded-3xl border-4 border-amber-400 p-6 space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-3">
            <div>
              <h2 className="text-lg font-black flex items-center gap-2"><Users className="w-5 h-5"/>Students List - {filteredUsers.length} - Only Name, Sex, Level, Phone, Email</h2>
              <p className="text-xs font-bold bg-green-50 border border-green-300 p-2 rounded mt-1">✅ Privacy Protected: Provost sees ONLY 5 columns — Full Name + Sex + Level + Email + Phone — No Password, No Matric, No Login</p>
            </div>
            <div className="flex items-center gap-1 bg-white border-2 rounded-xl px-3"><Search className="w-4 h-4"/><input value={userSearch} onChange={e=>setUserSearch(e.target.value)} placeholder="Search Name, Sex, Level, Email, Phone" className="py-2 text-xs font-bold outline-none w-64"/></div>
          </div>
          <div className="overflow-x-auto border-2 rounded-xl">
            <table className="w-full text-xs">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="p-3 text-left">Full Name</th>
                  <th className="p-2 text-center">Sex</th>
                  <th className="p-2 text-center">Level</th>
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-left">Phone</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u:any)=>(
                  <tr key={u.email} className="border-b hover:bg-amber-50">
                    <td className="p-3 font-black">{u.fullName}</td>
                    <td className="p-2 text-center"><span className={`px-2 py-1 rounded-full text-[10px] font-black ${u.sex==='FEMALE'?'bg-pink-100 text-pink-800':'bg-blue-100 text-blue-800'}`}>{u.sex || '-'}</span></td>
                    <td className="p-2 text-center"><span className="px-2 py-1 rounded-full text-[10px] font-black bg-yellow-300 text-black">{u.level||'N/A'}</span></td>
                    <td className="p-2 font-bold text-[11px]">{u.email}</td>
                    <td className="p-2 font-mono text-[11px]">{u.phone||'-'}</td>
                  </tr>
                ))}
                {filteredUsers.length===0 && <tr><td colSpan={5} className="p-8 text-center font-bold text-slate-500">No students found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab==='provost_vet' && <div className="bg-white rounded-3xl border-2 p-6"><h2 className="font-black">Provost Vetting - {registrarVetted.length} records</h2><div className="flex gap-2 mt-3"><input value={searchVet} onChange={e=>setSearchVet(e.target.value)} placeholder="Search Matric/Name" className="flex-1 border-2 rounded-xl p-2 text-xs"/></div><div className="overflow-x-auto border-2 rounded-xl mt-3"><table className="w-full text-xs"><thead className="bg-emerald-900 text-white"><tr><th className="p-2">Matric</th><th className="p-2">Name + Level</th><th className="p-2">Course</th><th className="p-2">Total</th></tr></thead><tbody>{filteredVet.map((r:any,i:number)=><tr key={i} className="border-b"><td className="p-2 font-mono">{r.matricNo||r.matric_no}</td><td className="p-2 font-bold">{r.fullName} - {getCurrentLevel(r.matricNo||r.matric_no, '')}</td><td className="p-2">{r.courseCode||r.course_code}</td><td className="p-2 text-center font-black">{r.score||r.total_score}</td></tr>)}</tbody></table></div></div>}

      {activeTab==='cbt_batched' && <div className="space-y-4"><div className="bg-purple-50 border-2 border-purple-400 p-3 rounded-xl text-xs font-bold">CBT Batch 35/hr</div><ProvostCBTManager /></div>}

      {activeTab==='individual_result' && <div className="bg-white rounded-3xl border-2 border-amber-300 p-6 space-y-4"><div className="flex gap-2 bg-slate-50 p-3 rounded-xl border"><div className="flex items-center gap-2 flex-1 bg-white border-2 rounded-xl px-3"><Search className="w-4 h-4"/><input value={searchIndividual} onChange={e=>setSearchIndividual(e.target.value)} placeholder="Search Name/Matric" className="flex-1 py-2.5 text-xs font-black outline-none"/></div></div>{!selectedPrintStudent ? <div className="overflow-x-auto border-2 rounded-xl"><table className="w-full text-xs"><thead className="bg-slate-900 text-white"><tr><th className="p-3 text-left">Matric + Name</th><th className="p-3">Level</th><th className="p-3 text-center">Print</th></tr></thead><tbody>{filteredIndividual.map((s:any)=>{ const cl=getCurrentLevel(s.matricNo, s.level); return <tr key={s.matricNo} className="border-b"><td className="p-3"><p className="font-mono font-black">{s.matricNo}</p><p className="font-black uppercase">{s.fullName}</p></td><td className="p-3 font-black">{cl}</td><td className="p-3 text-center"><button onClick={()=>setSelectedPrintStudent({...s, level: cl})} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black">Print</button></td></tr>})}</tbody></table></div> : <div><button onClick={()=>setSelectedPrintStudent(null)} className="px-4 py-2 bg-slate-200 rounded-xl text-xs font-black">← Back</button><div className="mt-4"><PrintableResultWithLogo matricNo={selectedPrintStudent.matricNo} fullName={selectedPrintStudent.fullName} level={selectedPrintStudent.level} program={selectedPrintStudent.program} results={computationResults.filter((r:any)=> r.matricNo===selectedPrintStudent.matricNo)} currentUserRole="PROVOST" currentUserName={displayName} senateApproved={senateApproved} senateDate={senateInfo.date} senateProvost={senateInfo.provost} /></div></div>}</div>}

      {activeTab==='result_publish' && <div className="bg-white rounded-3xl border-2 border-red-400 p-6"><h2 className="text-xl font-black">Provost Final Publish - {computationResults.length} results</h2><p className="text-xs mt-2 font-bold">{senateApproved ? '✅ Published' : '🔒 Not Published'}</p></div>}

      {activeTab==='entrance_exam' && <div className="bg-white rounded-2xl border-2 p-4"><AdminExamSettings /></div>}
    </div>
  );
};

export default ProvostDashboard;

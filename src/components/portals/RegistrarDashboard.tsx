import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { COLLEGE_CONFIG } from '../../types';
import {
  Award,
  Users,
  GraduationCap,
  TrendingUp,
  CheckCircle2,
  Clock,
  Building,
  FileCheck,
  Send,
  BookOpen,
  Search,
  Download,
} from 'lucide-react';

import { CBTExamManager } from '../cbt/CBTExamManager';
import { AdmissionProcessingView } from './AdmissionProcessingView';
import { AdminAdmissionManager } from '../admin/AdminAdmissionManager';

export const ProvostDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'admissions' | 'admissions_all' | 'cbt' | 'students_biodata'>('overview');
  const students = StorageService.getStudents();
  const applicants = StorageService.getApplicants();
  const payments = StorageService.getPayments();
  const [senateApproved, setSenateApproved] = useState(false);
  const [searchBiodata, setSearchBiodata] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [selectedBiodata, setSelectedBiodata] = useState<any>(null);

  const currentUser = StorageService.getCurrentUser() || {
    id: 'LCNS/2026/PV/001',
    email: 'provost@lcns.edu.ng',
    role: 'PROVOST',
    fullName: 'Mrs Terna Fiase Msc, Bnsc, Dip Nursing Education, RNE,RM,RN',
    status: 'ACTIVE',
  };

  const totalRevenue = payments.filter((p) => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0);

  const filteredStudents = students.filter((s: any) => {
    if (levelFilter !== 'ALL' && s.level !== levelFilter) return false;
    if (!searchBiodata) return true;
    return `${s.fullName} ${s.matricNo} ${s.program} ${s.level} ${s.stateOfOrigin} ${s.phone}`.toLowerCase().includes(searchBiodata.toLowerCase());
  });

  const handleSenateApproval = () => {
    setSenateApproved(true);
    StorageService.logAction('provost@lcns.edu.ng','PROVOST','SENATE_RATIFICATION','Senate Ratification granted');
    alert('Senate Ratification Granted!');
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-emerald-800 px-3 py-1 rounded-full">Office of the College Provost</span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase font-serif-crest mt-2">Mrs Terna Fiase Msc, Bnsc, Dip Nursing Education, RNE,RM,RN</h1>
            <p className="text-xs text-emerald-200">Executive Overview + All Students Biodata with Current Level + All Applicants CBT Interview Admit - Super Fine</p>
          </div>
          <div className="text-right"><span className="text-xs text-emerald-300 font-semibold block">Academic Session</span><span className="text-lg font-black text-amber-400 font-mono-code">{COLLEGE_CONFIG.CURRENT_SESSION}</span></div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs no-print">
        <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab==='overview'?'bg-[#0a4d2e] text-white':'text-slate-600 hover:bg-slate-100'}`}><Building className="w-4 h-4 text-emerald-400"/><span>Overview & Senate</span></button>
        <button onClick={() => setActiveTab('students_biodata')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='students_biodata'?'bg-emerald-700 text-white shadow ring-2 ring-emerald-300':'bg-emerald-50 border-2 border-emerald-300 text-emerald-800'}`}><Users className="w-4 h-4"/><span>👨‍🎓 All Students Biodata with Current Level - Provost/Registrar/Exam Officer/HOD</span><span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-black">NEW</span></button>
        <button onClick={() => setActiveTab('admissions_all')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='admissions_all'?'bg-purple-700 text-white shadow ring-2 ring-purple-300':'bg-purple-50 border-2 border-purple-300 text-purple-800'}`}><GraduationCap className="w-4 h-4"/><span>🎓 All Applicants - CBT + Interview + Admit - SUPER FINE LINK</span><span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-black">SUPER FINE</span></button>
        <button onClick={() => setActiveTab('admissions')} className={`px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab==='admissions'?'bg-[#0a4d2e] text-white':'text-slate-600 hover:bg-slate-100'}`}>Admissions Old</button>
        <button onClick={() => setActiveTab('cbt')} className={`px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab==='cbt'?'bg-[#0a4d2e] text-white':'text-slate-600 hover:bg-slate-100'}`}>CBT Old</button>
      </div>

      {activeTab==='students_biodata' ? (
        <div className="bg-white rounded-3xl border-2 border-emerald-300 p-4 space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-3">
            <div>
              <h2 className="text-lg font-black flex items-center gap-2"><Users className="w-5 h-5 text-emerald-700"/>All Students Biodata - Current Level Visible - Provost / Registrar / Exam Officer / HOD</h2>
              <p className="text-xs font-bold bg-emerald-50 border p-2 rounded mt-1">All student biodata with their current level: Full Name, Matric No, Photo, Program, Current Level ND1 ND2 HND1 HND2, Session, State/LGA, Phone, Blood Genotype, Guardian - Search + Filter by Level</p>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>window.print()} className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-black flex items-center gap-1"><Download className="w-4 h-4"/>Print</button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 bg-slate-50 p-3 rounded-xl border">
            <div className="flex items-center gap-2 flex-1 bg-white border rounded-xl px-3"><Search className="w-4 h-4 text-slate-400"/><input value={searchBiodata} onChange={e=>setSearchBiodata(e.target.value)} placeholder="Search Name, Matric No, Program, Phone, State" className="flex-1 py-2 text-xs font-bold outline-none"/></div>
            <select value={levelFilter} onChange={e=>setLevelFilter(e.target.value)} className="px-4 py-2 border-2 border-emerald-300 rounded-xl text-xs font-black">
              <option value="ALL">All Levels ({students.length})</option>
              <option value="ND 1">ND 1</option><option value="ND 2">ND 2</option><option value="HND 1">HND 1</option><option value="HND 2">HND 2</option>
            </select>
            <div className="px-3 py-2 bg-emerald-900 text-white rounded-xl text-xs font-black">{filteredStudents.length} Found</div>
          </div>
          <div className="overflow-x-auto border-2 rounded-xl">
            <table className="w-full text-xs">
              <thead className="bg-slate-900 text-white"><tr><th className="p-2 text-left">Matric No + Photo</th><th className="p-2 text-left">Full Name + Biodata</th><th className="p-2 text-left">Program + Current Level</th><th className="p-2 text-left">Contact + State</th><th className="p-2 text-left">Academic</th><th className="p-2">View Full Biodata</th></tr></thead>
              <tbody>
                {filteredStudents.map((s:any)=>(
                  <tr key={s.matricNo} className="border-b hover:bg-slate-50">
                    <td className="p-2"><div className="flex items-center gap-2"><img src={s.photoUrl || s.passportUrl || 'https://via.placeholder.com/50'} alt="passport" className="w-10 h-12 object-cover rounded border"/><div><p className="font-mono font-black text-emerald-800">{s.matricNo}</p><span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${s.level.includes('ND 1')?'bg-blue-100 text-blue-800':s.level.includes('ND 2')?'bg-green-100 text-green-800':s.level.includes('HND 1')?'bg-purple-100 text-purple-800':'bg-amber-100 text-amber-900'}`}>{s.level}</span></div></div></td>
                    <td className="p-2"><p className="font-black uppercase">{s.fullName}</p><p className="text-[11px]">Blood: {s.bloodGroup} | {s.genotype}</p><p className="text-[11px]">Gender: {s.gender || 'N/A'}</p></td>
                    <td className="p-2"><p className="font-bold">{s.program}</p><p className="text-[11px]">Level: <b className="bg-yellow-200 px-1 rounded">{s.level}</b></p><p className="text-[11px]">Session: {s.session}</p><p className="text-[11px] font-black">Current Level: {s.level}</p></td>
                    <td className="p-2"><p className="text-[11px]">Phone: {s.phone || 'N/A'}</p><p className="text-[11px]">State: {s.stateOfOrigin}</p><p className="text-[11px]">LGA: {s.lga}</p></td>
                    <td className="p-2"><p className="text-[11px]">Status: {s.status}</p><p className="text-[11px]">CGPA: {s.cgpa || s.gpa || 'N/A'}</p></td>
                    <td className="p-2 text-center"><button onClick={()=>setSelectedBiodata(s)} className="px-3 py-1.5 bg-blue-700 text-white rounded-lg font-black text-[11px]">View Full Biodata</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredStudents.length===0 && <div className="p-8 text-center border-2 border-dashed rounded-xl text-slate-400 font-black">No students found</div>}
          {selectedBiodata && (
            <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"><div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-3"><div className="flex justify-between border-b pb-2"><h3 className="font-black">Full Biodata - {selectedBiodata.fullName} - {selectedBiodata.matricNo} - Current Level: {selectedBiodata.level}</h3><button onClick={()=>setSelectedBiodata(null)} className="px-3 py-1 bg-slate-100 rounded-full font-black">X</button></div><div className="text-xs space-y-1"><p><b>Full Name:</b> {selectedBiodata.fullName}</p><p><b>Matric No:</b> {selectedBiodata.matricNo}</p><p><b>Program:</b> {selectedBiodata.program}</p><p><b>Current Level:</b> <span className="bg-yellow-300 px-2 rounded font-black">{selectedBiodata.level}</span></p><p><b>Session:</b> {selectedBiodata.session}</p><p><b>State/LGA:</b> {selectedBiodata.stateOfOrigin} / {selectedBiodata.lga}</p><p><b>Phone:</b> {selectedBiodata.phone}</p><p><b>Blood/Genotype:</b> {selectedBiodata.bloodGroup} / {selectedBiodata.genotype}</p></div><button onClick={()=>window.print()} className="w-full py-3 bg-slate-900 text-white rounded-xl font-black">Print Biodata</button></div></div>
          )}
        </div>
      ) : activeTab==='admissions_all' ? (
        <div className="space-y-4">
          <div className="bg-purple-50 border-2 border-purple-300 p-3 rounded-xl text-xs font-bold">Provost All Applicants Records - CBT + Interview + Admit Link - Congratulation + JAMB CBT center instruction</div>
          <AdminAdmissionManager currentUser={currentUser} />
        </div>
      ) : activeTab==='admissions' ? <AdmissionProcessingView /> : activeTab==='cbt' ? <CBTExamManager currentUser={{id:'LCNS/2026/PV/001',email:'provost@lcns.edu.ng',role:'PROVOST',fullName:'Mrs Terna Fiase',status:'ACTIVE'}} allowedTypes={['APPLICANT_SCREENING']} /> : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-3xl border shadow-sm"><p className="text-xs font-bold uppercase">Total Enrolled</p><p className="text-2xl font-black">{students.length + 415}</p></div>
            <div className="p-5 bg-white rounded-3xl border shadow-sm"><p className="text-xs font-bold uppercase">2026/2027 Applicants</p><p className="text-2xl font-black">{applicants.length + 185}</p></div>
            <div className="p-5 bg-white rounded-3xl border shadow-sm"><p className="text-xs font-bold uppercase">Pass Rate</p><p className="text-2xl font-black text-emerald-800">94.8%</p></div>
            <div className="p-5 bg-white rounded-3xl border shadow-sm"><p className="text-xs font-bold uppercase">Revenue</p><p className="text-2xl font-black">₦{(totalRevenue + 72400000).toLocaleString()}</p></div>
          </div>
          <div className="bg-white rounded-3xl border-2 border-emerald-700/40 p-6 shadow-sm">
            <button onClick={handleSenateApproval} disabled={senateApproved} className={`px-5 py-3 rounded-xl text-xs font-black uppercase flex items-center gap-2 ${senateApproved?'bg-emerald-100 text-emerald-800 border':'bg-emerald-800 text-white'}`}><CheckCircle2 className="w-4 h-4 text-amber-300"/><span>{senateApproved?'Senate Ratified':'Grant Senate Final Approval'}</span></button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProvostDashboard;

import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { ApiService } from '../../services/api';
import { ResultScore, COLLEGE_CONFIG, Student } from '../../types';
import {
  FileSpreadsheet,
  Award,
  Printer,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Download,
  Calculator,
  Users,
  GraduationCap,
} from 'lucide-react';
import { AdminAdmissionManager } from '../admin/AdminAdmissionManager';

export const ExamOfficerDashboard: React.FC = () => {
  const [results, setResults] = useState<ResultScore[]>(StorageService.getResults());
  const [students] = useState<Student[]>(StorageService.getStudents());
  const [activeTab, setActiveTab] = useState<'broadsheet' | 'biodata' | 'admissions_all'>('biodata');
  const [selectedSession, setSelectedSession] = useState(COLLEGE_CONFIG.CURRENT_SESSION);
  const [selectedSemester, setSelectedSemester] = useState<'First' | 'Second'>('First');
  const [searchMatric, setSearchMatric] = useState('');
  const [searchBiodata, setSearchBiodata] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [gpaResult, setGpaResult] = useState<{ matric: string; gpa: number; totalUnits: number } | null>(null);
  const [selectedBiodata, setSelectedBiodata] = useState<any>(null);

  const currentUser = StorageService.getCurrentUser() || {
    id: 'LCNS/2026/EX/001',
    email: 'exam@lcns.edu.ng',
    role: 'EXAM_OFFICER',
    fullName: 'Dr. Emmanuel O. Agada',
    status: 'ACTIVE',
  };

  const filteredResults = results.filter((r) => {
    const matchesSession = r.session === selectedSession;
    const matchesSemester = r.semester === selectedSemester;
    const matchesMatric = !searchMatric || r.matricNo.toLowerCase().includes(searchMatric.toLowerCase()) || (r.studentName && r.studentName.toLowerCase().includes(searchMatric.toLowerCase())) || r.courseCode.toLowerCase().includes(searchMatric.toLowerCase());
    return matchesSession && matchesSemester && matchesMatric;
  });

  const filteredStudents = students.filter((s: any) => {
    if (levelFilter !== 'ALL' && s.level !== levelFilter) return false;
    if (!searchBiodata) return true;
    return `${s.fullName} ${s.matricNo} ${s.program} ${s.level}`.toLowerCase().includes(searchBiodata.toLowerCase());
  });

  const handleComputeGPA = (matricNo: string) => {
    const computed = ApiService.calculateGPA(matricNo, selectedSemester, selectedSession);
    setGpaResult({ matric: matricNo, gpa: computed.gpa, totalUnits: computed.totalUnits });
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-emerald-800 px-3 py-1 rounded-full">Examination & Records Unit • Exam Officer • All Students Biodata</span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase font-serif-crest mt-2">Dr. Emmanuel O. Agada</h1>
            <p className="text-xs text-emerald-200">Score Moderation + All Students Biodata with Current Level ND1 ND2 HND1 HND2 + Broadsheets</p>
          </div>
          <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl border border-emerald-600 shadow-md self-start sm:self-auto"><Printer className="w-4 h-4"/><span>Print Broadsheet</span></button>
        </div>
        <div className="mt-6 pt-5 border-t border-emerald-800/80 flex flex-wrap items-center justify-between gap-4 text-xs"><div className="flex items-center gap-2"><Calculator className="w-4 h-4 text-amber-400"/><span className="text-emerald-200">NMCN 5-Point Scale: 70-100% (A=5.0) | 60-69% (B=4.0) | 50-59% (C=3.0) | 40-49% (D=2.0) | 0-39% (F=0.0)</span></div><span className="font-bold text-amber-300">Minimum Pass Mark: 50% for Nursing Core</span></div>
      </div>

      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <button onClick={() => setActiveTab('biodata')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='biodata'?'bg-emerald-700 text-white shadow ring-2 ring-emerald-300':'bg-emerald-50 border-2 border-emerald-300 text-emerald-800'}`}><Users className="w-4 h-4"/><span>👨‍🎓 All Students Biodata with Current Level - Exam Officer / Provost / Registrar / HOD</span><span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-black">NEW</span></button>
        <button onClick={() => setActiveTab('broadsheet')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab==='broadsheet'?'bg-[#0a4d2e] text-white':'text-slate-600 hover:bg-slate-100'}`}><FileSpreadsheet className="w-4 h-4"/><span>Broadsheet Scores</span></button>
        <button onClick={() => setActiveTab('admissions_all')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab==='admissions_all'?'bg-purple-700 text-white':'bg-purple-50 border border-purple-300 text-purple-800'}`}><GraduationCap className="w-4 h-4"/><span>🎓 All Applicants Link</span></button>
      </div>

      {activeTab==='biodata' ? (
        <div className="bg-white rounded-3xl border-2 border-emerald-300 p-4 space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-3">
            <div><h2 className="text-lg font-black flex items-center gap-2"><Users className="w-5 h-5 text-emerald-700"/>All Students Biodata - Current Level Visible - Exam Officer View</h2><p className="text-xs font-bold bg-emerald-50 border p-2 rounded mt-1">Provost and Registrar, Exam Officer, HOD see all student biodata on dashboard with their current level: Full Name, Matric No, Photo, Program, Current Level ND1 ND2 HND1 HND2, Session, State/LGA, Phone, Blood Genotype, Guardian, CGPA</p></div>
            <button onClick={()=>window.print()} className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-black flex items-center gap-1 self-start"><Download className="w-4 h-4"/>Print Biodata</button>
          </div>
          <div className="flex flex-wrap gap-2 bg-slate-50 p-3 rounded-xl border">
            <div className="flex items-center gap-2 flex-1 bg-white border rounded-xl px-3"><Search className="w-4 h-4 text-slate-400"/><input value={searchBiodata} onChange={e=>setSearchBiodata(e.target.value)} placeholder="Search Name, Matric No, Program, Level" className="flex-1 py-2 text-xs font-bold outline-none"/></div>
            <select value={levelFilter} onChange={e=>setLevelFilter(e.target.value)} className="px-4 py-2 border-2 border-emerald-300 rounded-xl text-xs font-black"><option value="ALL">All Levels ({students.length})</option><option value="ND 1">ND 1</option><option value="ND 2">ND 2</option><option value="HND 1">HND 1</option><option value="HND 2">HND 2</option></select>
            <div className="px-3 py-2 bg-emerald-900 text-white rounded-xl text-xs font-black">{filteredStudents.length} Students</div>
          </div>
          <div className="overflow-x-auto border-2 rounded-xl">
            <table className="w-full text-xs">
              <thead className="bg-slate-900 text-white"><tr><th className="p-2 text-left">Matric No + Level</th><th className="p-2 text-left">Full Name</th><th className="p-2 text-left">Program + Current Level</th><th className="p-2 text-left">State + Contact</th><th className="p-2">Action</th></tr></thead>
              <tbody>
                {filteredStudents.map((s:any)=>(
                  <tr key={s.matricNo} className="border-b hover:bg-slate-50">
                    <td className="p-2"><p className="font-mono font-black text-emerald-800">{s.matricNo}</p><span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${s.level.includes('ND 1')?'bg-blue-100 text-blue-800':s.level.includes('ND 2')?'bg-green-100 text-green-800':s.level.includes('HND 1')?'bg-purple-100 text-purple-800':'bg-amber-100 text-amber-900'}`}>{s.level}</span></td>
                    <td className="p-2"><p className="font-black uppercase">{s.fullName}</p><p className="text-[11px]">{s.bloodGroup} / {s.genotype}</p></td>
                    <td className="p-2"><p className="font-bold">{s.program}</p><p className="text-[11px]">Current Level: <b className="bg-yellow-200 px-1 rounded">{s.level}</b> | {s.session}</p></td>
                    <td className="p-2"><p className="text-[11px]">{s.stateOfOrigin} - {s.lga}</p><p className="text-[11px]">{s.phone || 'N/A'}</p></td>
                    <td className="p-2 text-center"><button onClick={()=>setSelectedBiodata(s)} className="px-3 py-1.5 bg-blue-700 text-white rounded-lg font-black text-[11px]">View Full Biodata</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {selectedBiodata && (<div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"><div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-3"><div className="flex justify-between border-b pb-2"><h3 className="font-black">Biodata - {selectedBiodata.fullName} - Level: {selectedBiodata.level}</h3><button onClick={()=>setSelectedBiodata(null)} className="px-3 py-1 bg-slate-100 rounded-full font-black">X</button></div><div className="text-xs space-y-1"><p>Matric: {selectedBiodata.matricNo}</p><p>Program: {selectedBiodata.program}</p><p>Current Level: <b className="bg-yellow-300 px-2 rounded">{selectedBiodata.level}</b></p><p>State: {selectedBiodata.stateOfOrigin}</p><p>Phone: {selectedBiodata.phone}</p></div><button onClick={()=>window.print()} className="w-full py-3 bg-slate-900 text-white rounded-xl font-black">Print</button></div></div>)}
        </div>
      ) : activeTab==='admissions_all' ? (
        <div className="space-y-3"><div className="bg-purple-50 border-2 border-purple-300 p-3 rounded-xl text-xs font-bold">Exam Officer - All Applicants Records Link - CBT + Interview Scores</div><AdminAdmissionManager currentUser={currentUser} /></div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80"><Search className="w-4 h-4 text-slate-400 absolute left-3 top-3"/><input type="text" value={searchMatric} onChange={(e) => setSearchMatric(e.target.value)} placeholder="Search by Matric No or Course Code..." className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600"/></div>
            <div className="flex items-center gap-3"><select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value as any)} className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-emerald-950"><option value="First">First Semester</option><option value="Second">Second Semester</option></select><select value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)} className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"><option value="2026/2027">2026/2027</option><option value="2025/2026">2025/2026</option></select></div>
          </div>
          {gpaResult && (<div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 flex items-center justify-between"><div><span className="text-xs text-slate-600">GPA for:</span><strong className="ml-2 font-mono-code">{gpaResult.matric}</strong><span className="text-xs text-slate-500 ml-3">({gpaResult.totalUnits} Units)</span></div><div className="text-right"><span className="text-xs text-slate-500 block">Semester GPA</span><span className="text-2xl font-black text-emerald-900 font-mono-code">{gpaResult.gpa.toFixed(2)}</span></div></div>)}
          <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-emerald-900 text-white font-bold uppercase"><tr><th className="p-3">Matric No & Student</th><th className="p-3">Course</th><th className="p-3 text-center">Units</th><th className="p-3 text-center">CA (30)</th><th className="p-3 text-center">Exam (70)</th><th className="p-3 text-center">Total (100)</th><th className="p-3 text-center">Grade</th><th className="p-3 text-center">Points</th><th className="p-3">Remarks</th><th className="p-3 text-right no-print">Quick Calc</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredResults.map((r) => (<tr key={r.id} className="hover:bg-slate-50"><td className="p-3"><span className="font-mono-code font-bold text-emerald-900 block">{r.matricNo}</span><span className="text-slate-600 font-semibold text-[11px]">{r.studentName}</span></td><td className="p-3"><span className="font-bold text-slate-800">{r.courseCode}</span><span className="block text-[10px] text-slate-500">{r.courseTitle}</span></td><td className="p-3 text-center font-bold">{r.units}</td><td className="p-3 text-center font-mono-code">{r.caScore}</td><td className="p-3 text-center font-mono-code">{r.examScore}</td><td className="p-3 text-center font-mono-code font-bold text-sm">{r.totalScore}</td><td className="p-3 text-center"><span className={`inline-block font-black text-xs px-2 py-0.5 rounded ${r.grade==='A'?'bg-emerald-100 text-emerald-800':r.grade==='B'?'bg-teal-100 text-teal-900':r.grade==='C'?'bg-amber-100 text-amber-800':r.grade==='D'?'bg-orange-100 text-orange-800':'bg-red-100 text-red-800'}`}>{r.grade}</span></td><td className="p-3 text-center font-mono-code font-bold">{r.point}.0</td><td className="p-3"><span className="text-[11px] font-semibold">{r.remark}</span></td><td className="p-3 text-right no-print"><button onClick={() => handleComputeGPA(r.matricNo)} className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 text-emerald-900 border rounded text-[11px] font-bold">Calc GPA</button></td></tr>))}</tbody></table></div>
        </div>
      )}
    </div>
  );
};

export default ExamOfficerDashboard;

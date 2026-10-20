import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { Student, COLLEGE_CONFIG } from '../../types';
import {
  FileText, Search, Users, Award, CheckCircle2, Printer, Download, Filter, UserCheck, ArrowUpCircle, Calendar, GraduationCap,
} from 'lucide-react';

import { CBTExamManager } from '../cbt/CBTExamManager';
import { AdmissionProcessingView } from './AdmissionProcessingView';
import { StudentPromotion } from './StudentPromotion';
// ✅ LINK - Registrar and Admin to Applicant CBT and Interview Exams and Scores
import { AdminAdmissionManager } from '../admin/AdminAdmissionManager';

export const RegistrarDashboard: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(StorageService.getStudents());
  const [activeTab, setActiveTab] = useState<'students' | 'admissions' | 'admissions_all' | 'cbt' | 'promotion'>('admissions_all');
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [selectedStudentForLetter, setSelectedStudentForLetter] = useState<Student | null>(null);
  const [letterType, setLetterType] = useState<'attestation' | 'english' | 'indexing'>('attestation');

  const currentUser = StorageService.getCurrentUser() || {
    id: 'LCNS/2026/RG/001',
    email: 'registrar@lcns.edu.ng',
    role: 'REGISTRAR',
    fullName: 'Barr. Timothy J. Iorbee',
    status: 'ACTIVE',
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.matricNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.program.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === 'ALL' || s.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const handlePrintLetter = () => { window.print(); };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-emerald-800 px-3 py-1 rounded-full">
              Academic Registry • Office of the Registrar • {localStorage.getItem('lcns_current_session') || '2025/2026'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase font-serif-crest mt-2">Barr. Timothy J. Iorbee</h1>
            <p className="text-xs text-emerald-200">Student Records + All Applicants Records + CBT + Interview + Admission Linked - Super Fine</p>
          </div>
          <div className="bg-emerald-950/80 p-3 rounded-2xl border border-emerald-800 text-center">
            <span className="text-[10px] text-emerald-300 uppercase block font-bold">Total Matriculated</span>
            <span className="text-xl font-mono-code font-black text-amber-400">{students.length} Records</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs no-print">
        <button onClick={() => setActiveTab('admissions_all')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab==='admissions_all'?'bg-blue-700 text-white shadow-md ring-2 ring-blue-300':'bg-blue-50 text-blue-800 border-2 border-blue-300 hover:bg-blue-100'}`}><GraduationCap className="w-4 h-4"/><span>🎓 All Applicants Records - CBT + Interview + Admission - Link Registrar/Admin to Applicant</span><span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-black font-black">SUPER FINE - LINKED</span></button>
        <button onClick={() => setActiveTab('promotion')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='promotion'?'bg-amber-500 text-black shadow-md':'text-slate-600 hover:bg-amber-50 border border-amber-200'}`}><ArrowUpCircle className="w-4 h-4"/><span>Promote ND1→HND2 & Set 2026/2027</span></button>
        <button onClick={() => setActiveTab('students')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab==='students'?'bg-[#0a4d2e] text-white shadow-sm':'text-slate-600 hover:bg-slate-100'}`}><Users className="w-4 h-4 text-emerald-400"/><span>Matriculated Students</span></button>
        <button onClick={() => setActiveTab('cbt')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab==='cbt'?'bg-[#0a4d2e] text-white shadow-sm':'text-slate-600 hover:bg-slate-100'}`}><Award className="w-4 h-4 text-amber-400"/><span>CBT Screening Old</span></button>
      </div>

      {activeTab === 'promotion' ? (
        <StudentPromotion />
      ) : activeTab === 'admissions_all' ? (
        <div className="space-y-4">
          <div className="bg-blue-50 border-2 border-blue-300 p-3 rounded-xl text-xs font-bold">
            LINK EXPLAINED: Registrar/Admin sets CBT exams from Registrar/Admin → JAMB scores display on board with JAMB registration number → admission in progress → CBT test score publish by Registrar/Admin → interview scores publish → If admitted congratulation full name + kindly proceed to JAMB CBT center and print admission number and returns back to school - All linked to Applicant Dashboard via Supabase lcns_applicants
          </div>
          <AdminAdmissionManager currentUser={currentUser} />
        </div>
      ) : activeTab === 'cbt' ? (
        <CBTExamManager
          currentUser={{
            id: 'LCNS/2026/RG/001',
            email: 'registrar@lcns.edu.ng',
            role: 'REGISTRAR',
            fullName: 'Barr. Timothy J. Iorbee',
            status: 'ACTIVE',
          }}
          allowedTypes={['APPLICANT_SCREENING']}
        />
      ) : (
        <>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80"><Search className="w-4 h-4 text-slate-400 absolute left-3 top-3"/><input type="text" value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} placeholder="Search by Matric No, Name or Program..." className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600"/></div>
              <div className="flex items-center gap-2 w-full sm:w-auto"><Filter className="w-4 h-4 text-slate-500"/><select value={levelFilter} onChange={(e)=>setLevelFilter(e.target.value)} className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"><option value="ALL">All Levels</option><option value="ND 1">ND 1</option><option value="ND 2">ND 2</option><option value="HND 1">HND 1</option><option value="HND 2">HND 2</option></select></div>
            </div>
            <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-emerald-50 text-emerald-950 font-bold uppercase tracking-wider border-b border-emerald-200"><tr><th className="p-3">Matric No</th><th className="p-3">Student Name</th><th className="p-3">Programme & Level</th><th className="p-3">Status</th><th className="p-3 text-right">Letters</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredStudents.map((s)=> (<tr key={s.matricNo} className="hover:bg-slate-50"><td className="p-3 font-mono font-bold text-emerald-900">{s.matricNo}</td><td className="p-3 font-bold uppercase">{s.fullName}</td><td className="p-3"><span className="font-semibold">{s.program}</span><span className="block text-[10px] text-slate-500">{s.level} • {s.session}</span></td><td className="p-3"><span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3"/> Matriculated</span></td><td className="p-3 text-right"><button onClick={()=>setSelectedStudentForLetter(s)} className="px-3 py-1 bg-emerald-800 text-white font-bold rounded-lg text-[11px]">Issue Letter</button></td></tr>))}</tbody></table></div>
          </div>
        </>
      )}
    </div>
  );
};

export default RegistrarDashboard;

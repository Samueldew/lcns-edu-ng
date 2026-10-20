import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { Student, COLLEGE_CONFIG } from '../../types';
import {
  FileText, Search, Users, Award, CheckCircle2, Printer, Download, Filter, UserCheck, ArrowUpCircle, Calendar, GraduationCap,
} from 'lucide-react';

import { CBTExamManager } from '../cbt/CBTExamManager';
import { AdmissionProcessingView } from './AdmissionProcessingView';
import { StudentPromotion } from './StudentPromotion';
// ✅ NEW SUPER FINE APPLICANT MANAGER - All applicants + CBT + Interview + Admission linked
import { AdminAdmissionManager } from '../admin/AdminAdmissionManager';

export const RegistrarDashboard: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(StorageService.getStudents());
  const [activeTab, setActiveTab] = useState<'students' | 'admissions' | 'admissions_all' | 'cbt' | 'promotion'>('students');
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
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-emerald-800 px-3 py-1 rounded-full">
              Academic Registry • Office of the Registrar • {localStorage.getItem('lcns_current_session') || '2025/2026'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase font-serif-crest mt-2">Barr. Timothy J. Iorbee</h1>
            <p className="text-xs text-emerald-200">Student Records, Matriculation Roll, Promotion & CBT Screening Office - Now with All Applicants Records + CBT + Interview + Admission</p>
          </div>
          <div className="bg-emerald-950/80 p-3 rounded-2xl border border-emerald-800 text-center">
            <span className="text-[10px] text-emerald-300 uppercase block font-bold">Total Matriculated</span>
            <span className="text-xl font-mono-code font-black text-amber-400">{students.length} Records</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs - UPGRADED */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs no-print">
        <button onClick={() => setActiveTab('promotion')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='promotion'?'bg-amber-500 text-black shadow-md':'text-slate-600 hover:bg-amber-50 border border-amber-200'}`}><ArrowUpCircle className="w-4 h-4"/><span>Promote ND1→HND2 & Set 2026/2027</span><span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-black text-amber-400">NEW</span></button>
        <button onClick={() => setActiveTab('students')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab==='students'?'bg-[#0a4d2e] text-white shadow-sm':'text-slate-600 hover:bg-slate-100'}`}><Users className="w-4 h-4 text-emerald-400"/><span>Matriculated Students & Attestations</span></button>
        
        {/* ✅ NEW SUPER FINE - All Applicants + CBT + Interview + Admission Linked Together */}
        <button onClick={() => setActiveTab('admissions_all')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab==='admissions_all'?'bg-blue-700 text-white shadow-md ring-2 ring-blue-300':'bg-blue-50 text-blue-800 border-2 border-blue-300 hover:bg-blue-100'}`}><GraduationCap className="w-4 h-4"/><span>🎓 All Applicants Records - Apply/Return - CBT + Interview + Admission - Provost/Registrar/Admin/Admission Officer</span><span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-black font-black">SUPER FINE</span></button>

        <button onClick={() => setActiveTab('admissions')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab==='admissions'?'bg-[#0a4d2e] text-white shadow-sm':'text-slate-600 hover:bg-slate-100'}`}><CheckCircle2 className="w-4 h-4 text-emerald-400"/><span>Admissions Committee (Old)</span></button>
        <button onClick={() => setActiveTab('cbt')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab==='cbt'?'bg-[#0a4d2e] text-white shadow-sm':'text-slate-600 hover:bg-slate-100'}`}><Award className="w-4 h-4 text-amber-400"/><span>CBT Screening</span></button>
      </div>

      {activeTab === 'promotion' ? (
        <StudentPromotion />
      ) : activeTab === 'admissions_all' ? (
        /* ✅ SUPER FINE APPLICANT MANAGER - This shows all applicants from Supabase lcns_applicants, with biodata, JAMB reg + score, secondary school, subjects grading, 2 sittings, uploads, bursar clearance, CBT exam set by Registrar/Admin, CBT score publish, Interview scores publish, Admission congratulation + JAMB CBT center instruction */
        <div className="space-y-4">
          <div className="bg-blue-50 border-2 border-blue-300 p-3 rounded-xl text-xs">
            <p className="font-black">📋 Super Fine Flow: Applicant Apply Online (Biodata → Academics: secondary school name, WACE/NECO/NABTEB exam number year if two seating indicates baths, Mathematics English Chemistry Biology Physics compulsory + 4 others grading → JAMB reg number scores institution first choice Labe College year Course ND/HND → Upload result WACE if two seating one box optional + passport + proof of Payments → Review confirmation notice → Dashboard displayed download biodata with application number exam number attached instruction kindly come with form on aptitude test day with passport attached pending bursar clearance → After bursar clearance use application number to return → Dashboard open showing biodata form, CBT exams set from Registrar/Admin, JAMB scores display on board with JAMB reg number, admission in progress, CBT test score publish by Registrar/Admin, interview scores publish → If admitted congratulation full name + kindly proceed to JAMB CBT center and print admission number and returns back to school)</p>
          </div>
          <AdminAdmissionManager currentUser={currentUser} />
        </div>
      ) : activeTab === 'admissions' ? (
        <AdmissionProcessingView />
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
              <div className="flex items-center gap-2 w-full sm:w-auto"><Filter className="w-4 h-4 text-slate-500"/><select value={levelFilter} onChange={(e)=>setLevelFilter(e.target.value)} className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"><option value="ALL">All Collegiate Levels (4 Years)</option><option value="ND 1">ND 1</option><option value="ND 2">ND 2</option><option value="HND 1">HND 1</option><option value="HND 2">HND 2</option></select></div>
            </div>
            <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-emerald-50 text-emerald-950 font-bold uppercase tracking-wider border-b border-emerald-200"><tr><th className="p-3">Matric No</th><th className="p-3">Student Name</th><th className="p-3">Programme & Level</th><th className="p-3">State / LGA</th><th className="p-3">Blood / Genotype</th><th className="p-3">Status</th><th className="p-3 text-right">Letters</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredStudents.map((s)=> (<tr key={s.matricNo} className="hover:bg-slate-50"><td className="p-3 font-mono font-bold text-emerald-900">{s.matricNo}</td><td className="p-3 font-bold uppercase">{s.fullName}</td><td className="p-3"><span className="font-semibold">{s.program}</span><span className="block text-[10px] text-slate-500">{s.level} • {s.session}</span></td><td className="p-3 text-slate-600">{s.stateOfOrigin} ({s.lga})</td><td className="p-3 font-mono">{s.bloodGroup} / {s.genotype}</td><td className="p-3"><span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3"/> Matriculated</span></td><td className="p-3 text-right"><button onClick={()=>setSelectedStudentForLetter(s)} className="px-3 py-1 bg-emerald-800 text-white font-bold rounded-lg text-[11px]">Issue Letter</button></td></tr>))}</tbody></table></div>
          </div>
          {selectedStudentForLetter && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto"><div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4 my-8"><div className="flex items-center justify-between no-print border-b pb-3"><div className="flex items-center gap-2"><span className="font-bold text-sm">Select Document:</span><select value={letterType} onChange={(e)=>setLetterType(e.target.value as any)} className="p-1.5 border rounded text-xs font-bold text-emerald-900"><option value="attestation">Letter of Attestation & Bonafide Student</option><option value="english">English Language Proficiency</option><option value="indexing">NMCN Council Indexing Verification</option></select></div><div className="flex items-center gap-2"><button onClick={handlePrintLetter} className="px-3 py-1.5 bg-emerald-800 text-white text-xs font-bold rounded-lg flex items-center gap-1"><Printer className="w-3.5 h-3.5"/><span>Print</span></button><button onClick={()=>setSelectedStudentForLetter(null)} className="px-3 py-1.5 bg-slate-100 text-xs font-bold rounded-lg">Close</button></div></div><div className="border-2 border-emerald-900 p-8 rounded-xl bg-white shadow-sm print-page space-y-4 text-xs"><div className="text-center pb-4 border-b-2 border-emerald-900"><h2 className="text-lg font-black uppercase">Labe College of Nursing Sciences, Gboko</h2><p className="text-[11px] font-bold uppercase">Academic Registry • P.M.B. 104, Gboko</p></div><div className="text-center font-bold text-sm uppercase underline py-2">{letterType==='attestation'&&'LETTER OF ATTESTATION & BONAFIDE STUDENT STATUS'}{letterType==='english'&&'CERTIFICATE OF ENGLISH LANGUAGE PROFICIENCY'}{letterType==='indexing'&&'NURSING & MIDWIFERY COUNCIL INDEXING CLEARANCE'}</div><div className="space-y-3 text-justify"><p>This is to certify that <strong>{selectedStudentForLetter.fullName.toUpperCase()}</strong> with Matriculation Number <strong>{selectedStudentForLetter.matricNo}</strong> is a registered bonafide student of Labe College of Nursing Sciences.</p><p>The student is presently in <strong>{selectedStudentForLetter.level}</strong> pursuing the accredited programme in <strong>{selectedStudentForLetter.program}</strong> (Session: {selectedStudentForLetter.session}).</p></div><div className="pt-8 flex justify-between items-end"><div><div className="w-36 border-b mb-1 font-bold text-emerald-900">Barr. T. J. Iorbee</div><p className="font-bold">Barr. Timothy J. Iorbee</p><p className="text-[10px]">Registrar • LCNS Gboko</p></div><div className="w-20 h-20 border border-emerald-900 rounded-full flex flex-col items-center justify-center text-[8px] font-bold uppercase text-center"><span>Seal of Registry</span><span>LCNS GBOKO</span></div></div></div></div></div>
          )}
        </>
      )}
    </div>
  );
};

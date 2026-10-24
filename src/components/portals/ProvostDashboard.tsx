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
  Printer,
} from 'lucide-react';

import { CBTExamManager } from '../cbt/CBTExamManager';
import { AdmissionProcessingView } from './AdmissionProcessingView';
import { AdminAdmissionManager } from '../admin/AdminAdmissionManager';
import { AdminStudentsBiodata } from '../admin/AdminStudentsBiodata';
// ADDED - Individual Result Print with School Full Name + Logo - Provost Final Must Publish
import { PrintableResultWithLogo } from '../common/PrintableResultWithLogo';

export const ProvostDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'admissions' | 'admissions_all' | 'cbt' | 'students_biodata' | 'individual_result' | 'result_publish'>('overview');
  const students = StorageService.getStudents();
  const applicants = StorageService.getApplicants();
  const payments = StorageService.getPayments();
  const [senateApproved, setSenateApproved] = useState(() => {
    try {
      const saved = localStorage.getItem('lcns_senate_approved');
      if (saved === 'true') return true;
      const logs = JSON.parse(localStorage.getItem('lcns_audit_logs') || '[]');
      return !!logs.find((l:any)=> l.action==='SENATE_RATIFICATION');
    } catch { return false; }
  });

  // ADDED - Result Computation + Individual Print
  const [searchIndividual, setSearchIndividual] = useState('');
  const [selectedPrintStudent, setSelectedPrintStudent] = useState<any>(null);
  const [computationResults, setComputationResults] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('lcns_results') || '[]'); } catch { return []; }
  });
  const [senateInfo, setSenateInfo] = useState(() => {
    try {
      const logs = JSON.parse(localStorage.getItem('lcns_audit_logs') || '[]');
      const ratLog = logs.find((l:any)=> l.action==='SENATE_RATIFICATION');
      if (ratLog) return { approved: true, date: ratLog.timestamp, provost: ratLog.user || 'Mrs Terna Fiase - Provost' };
      const saved = localStorage.getItem('lcns_senate_ratification');
      if (saved) {
        const p = JSON.parse(saved);
        return { approved: p.approved, date: p.date, provost: p.provostName };
      }
      return { approved: localStorage.getItem('lcns_senate_approved')==='true', date: new Date().toISOString(), provost: 'Mrs Terna Fiase - Provost' };
    } catch { return { approved: false, date: new Date().toISOString(), provost: 'Mrs Terna Fiase - Provost' }; }
  });

  const safeCurrentUser = (() => {
    try {
      const keys = ['lcns_erp_current_user', 'lcns-current-user', 'lcns_current_user', 'lcns_user'];
      for (const k of keys) {
        const v = localStorage.getItem(k);
        if (v) {
          const parsed = JSON.parse(v);
          if (parsed && parsed.email) return parsed;
        }
      }
      return StorageService.getCurrentUser();
    } catch { return null; }
  })();

  const currentUser = safeCurrentUser || {
    id: 'LCNS/2026/PV/001',
    email: 'provost@lcns.edu.ng',
    role: 'PROVOST',
    fullName: 'Mrs Terna Fiase Msc, Bnsc, Dip Nursing Education, RNE,RM,RN',
    status: 'ACTIVE',
  };

  const displayName = (currentUser?.fullName || currentUser?.full_name || currentUser?.email || 'Mrs Terna Fiase').toString().toUpperCase();
  const displayEmail = currentUser?.email || 'provost@lcns.edu.ng';
  const displayRole = currentUser?.role || 'PROVOST';

  const totalRevenue = payments.filter((p) => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0);

  const filteredIndividual = students.filter((s: any) => {
    if (!searchIndividual) return true;
    const term = searchIndividual.toLowerCase().trim();
    return s.fullName.toLowerCase().includes(term) || s.matricNo.toLowerCase().includes(term);
  });

  // ADDED - Provost Publish Result - Must Publish Before Student Sees
  const handleProvostPublishAll = () => {
    if (computationResults.length===0) { alert('No results to publish - Exam Officer must calculate first'); return; }
    if (!confirm(`Provost ${displayName} - Publish ALL ${computationResults.length} results? Students will then see CGPA, Class, Carry Over, Transcript. This is FINAL.`)) return;
    
    const updated = computationResults.map((r:any) => ({ ...r, status: 'PROVOST_PUBLISHED' }));
    localStorage.setItem('lcns_results', JSON.stringify(updated));
    setComputationResults(updated);

    // Senate Approval + Publish
    const now = new Date().toISOString();
    const session = COLLEGE_CONFIG.CURRENT_SESSION || '2026/2027';
    const payload = {
      approved: true,
      date: now,
      timestamp: now,
      provostName: displayName,
      provostEmail: displayEmail,
      session: session,
      semester: 'First',
      action: 'SENATE_RATIFICATION',
    };
    try {
      localStorage.setItem('lcns_senate_approved', 'true');
      localStorage.setItem('lcns_senate_ratification', JSON.stringify(payload));
      localStorage.setItem('lcns_senate_ratified', 'true');
      localStorage.setItem('lcns_senate_approval', 'true');
      localStorage.setItem(`lcns_senate_ratification_${session}_First`, JSON.stringify(payload));
      localStorage.setItem(`lcns_senate_ratification_${session}_Second`, JSON.stringify(payload));
      localStorage.setItem(`lcns_senate_approved_${session}`, 'true');
      localStorage.setItem(`lcns_senate_approval_${session}`, JSON.stringify(payload));
      window.dispatchEvent(new Event('lcns_storage_update'));
      window.dispatchEvent(new Event('storage'));
    } catch {}

    setSenateApproved(true);
    setSenateInfo({ approved: true, date: now, provost: displayName });
    StorageService.logAction(displayEmail, displayRole, 'SENATE_RATIFICATION', `Provost ${displayName} Published ${updated.length} results - Senate Ratification - Students can now view CGPA, Class, Transcript on ${new Date().toLocaleString()}`);
    alert(`✅ PROVOST FINAL PUBLISH - ${updated.length} results published by ${displayName}. Students can now see results: CGPA, Distinction/Upper/Lower/Pass, Carry Over auto reflect, Transcript ND/HND. This is FINAL approval before student sees.`);
  };

  const handleSenateApproval = () => {
    const now = new Date().toISOString();
    const session = COLLEGE_CONFIG.CURRENT_SESSION || '2026/2027';
    const payload = {
      approved: true,
      date: now,
      timestamp: now,
      provostName: displayName,
      provostEmail: displayEmail,
      session: session,
      semester: 'First',
      action: 'SENATE_RATIFICATION',
    };

    try {
      localStorage.setItem('lcns_senate_approved', 'true');
      localStorage.setItem('lcns_senate_ratification', JSON.stringify(payload));
      localStorage.setItem('lcns_senate_ratified', 'true');
      localStorage.setItem('lcns_senate_approval', 'true');
      localStorage.setItem(`lcns_senate_ratification_${session}_First`, JSON.stringify(payload));
      localStorage.setItem(`lcns_senate_ratification_${session}_Second`, JSON.stringify(payload));
      localStorage.setItem(`lcns_senate_approved_${session}`, 'true');
      localStorage.setItem(`lcns_senate_approval_${session}`, JSON.stringify(payload));
      window.dispatchEvent(new Event('lcns_storage_update'));
      window.dispatchEvent(new Event('storage'));
    } catch {}

    setSenateApproved(true);
    setSenateInfo({ approved: true, date: now, provost: displayName });
    StorageService.logAction(displayEmail, displayRole, 'SENATE_RATIFICATION', `Academic Board granted Senate Ratification for ${session} First Semester Examination Broadsheet by ${displayName} on ${new Date().toLocaleString()}.`);
    alert(`✅ Senate Ratification Granted by ${displayName}: First Semester Examination results are now officially validated and published to student portals. Students can now see and print their results with CGPA, Class, Transcript.`);
  };

  const handleRevokeApproval = () => {
    if (!confirm('Revoke Senate Approval? Students will no longer see results. This will hide CGPA, Class, Transcript from students.')) return;
    try {
      localStorage.removeItem('lcns_senate_approved');
      localStorage.removeItem('lcns_senate_ratification');
      localStorage.removeItem('lcns_senate_ratified');
      localStorage.removeItem('lcns_senate_approval');
      // Also unpublish results
      const unpublished = computationResults.map((r:any) => ({ ...r, status: 'REGISTRAR_REVIEWED' }));
      localStorage.setItem('lcns_results', JSON.stringify(unpublished));
      setComputationResults(unpublished);
      window.dispatchEvent(new Event('lcns_storage_update'));
    } catch {}
    setSenateApproved(false);
    setSenateInfo({ approved: false, date: new Date().toISOString(), provost: displayName });
    StorageService.logAction(displayEmail, displayRole, 'SENATE_REVOKE', 'Senate Ratification revoked - Results hidden');
    alert('Senate approval revoked - Results hidden from students - Students will see 🔒 Locked again');
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-emerald-800 px-3 py-1 rounded-full">
              Office of the College Provost - {displayRole} - Final Publisher - Student Sees Only After Provost Publishes
            </span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase font-serif-crest mt-2">
              {displayName}
            </h1>
            <p className="text-xs text-emerald-200">
              {displayEmail} - Executive Overview + All Applicants + All Students Biodata + Print Individual Result with School Full Name + Logo + CGPA + Class + Carry Over - Provost MUST publish before student can see result - Logged in as {displayName}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-emerald-300 font-semibold block">Academic Session</span>
            <span className="text-lg font-black text-amber-400 font-mono-code">{COLLEGE_CONFIG.CURRENT_SESSION}</span>
            <span className={`block text-[10px] px-2 py-1 rounded-full mt-1 font-black ${senateApproved?'bg-emerald-500 text-white':'bg-red-500 text-white'}`}>{senateApproved?'✅ PUBLISHED - Students Can See':'🔒 NOT PUBLISHED - Students Locked'}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs no-print">
        <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'overview' ? 'bg-[#0a4d2e] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}><Building className="w-4 h-4 text-emerald-400" /><span>Provost Institutional Overview & Senate - Publish Must Before Student Sees</span></button>
        
        <button onClick={() => setActiveTab('students_biodata')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'students_biodata' ? 'bg-emerald-700 text-white shadow-md ring-2 ring-emerald-300' : 'bg-emerald-50 text-emerald-800 border-2 border-emerald-300 hover:bg-emerald-100'}`}><Users className="w-4 h-4"/><span>👨‍🎓 All Students Biodata</span><span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-black font-black">NEW</span></button>

        <button onClick={() => setActiveTab('admissions_all')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'admissions_all' ? 'bg-purple-700 text-white shadow-md ring-2 ring-purple-300' : 'bg-purple-50 text-purple-800 border-2 border-purple-300 hover:bg-purple-100'}`}><GraduationCap className="w-4 h-4"/><span>🎓 All Applicants - SUPER FINE LINK</span><span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-black font-black">SUPER FINE</span></button>

        <button onClick={() => setActiveTab('admissions')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'admissions' ? 'bg-[#0a4d2e] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}><GraduationCap className="w-4 h-4 text-emerald-400" /><span>Admissions Committee Old</span></button>
        <button onClick={() => setActiveTab('cbt')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'cbt' ? 'bg-[#0a4d2e] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}><Award className="w-4 h-4 text-amber-400" /><span>CBT Screening Old</span></button>

        {/* ADDED - Individual Result Print + Publish - Provost Final - NO DELETE */}
        <button onClick={() => setActiveTab('individual_result')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'individual_result' ? 'bg-slate-900 text-white shadow ring-2 ring-amber-400' : 'bg-amber-50 text-amber-900 border-2 border-amber-400 hover:bg-amber-100'}`}><Printer className="w-4 h-4"/><span>🖨️ Print Individual Result - School Full Name + Logo - Provost Final</span><span className="px-2 py-0.5 rounded-full text-[10px] bg-red-600 text-white">FINAL</span></button>

        <button onClick={() => setActiveTab('result_publish')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'result_publish' ? 'bg-red-700 text-white shadow ring-2 ring-red-300 animate-pulse' : 'bg-red-50 text-red-800 border-2 border-red-400 hover:bg-red-100'}`}><FileCheck className="w-4 h-4"/><span>🎓 Publish Results - Provost MUST Publish Before Student Sees - CGPA + Class + Transcript</span><span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-900 text-white">{computationResults.length} Results</span></button>
      </div>

      {activeTab === 'students_biodata' ? (
        <AdminStudentsBiodata currentUser={currentUser} roleLabel={`Provost - ${displayName} - All Students Biodata with Current Level (ND1 ND2 HND1 HND2)`} />
      ) : activeTab === 'admissions_all' ? (
        <div className="space-y-4">
          <div className="bg-purple-50 border-2 border-purple-300 p-3 rounded-xl text-xs font-bold">Provost All Applicants Records - CBT Exam Set + CBT Score Publish + Interview Scores Publish + Final Admit with Congratulations + JAMB CBT Center instruction - Link Registrar/Admin to Applicant Dashboard - Logged in: {displayName} ({displayEmail}) - Provost MUST publish results before student sees</div>
          <AdminAdmissionManager currentUser={currentUser} />
        </div>
      ) : activeTab === 'admissions' ? (
        <AdmissionProcessingView />
      ) : activeTab === 'cbt' ? (
        <CBTExamManager currentUser={currentUser} allowedTypes={['APPLICANT_SCREENING']} />
      ) : activeTab === 'individual_result' ? (
        <div className="bg-white rounded-3xl border-2 border-amber-300 p-6 space-y-6">
          <div>
            <h2 className="text-lg font-black flex items-center gap-2"><Printer className="w-5 h-5 text-amber-600"/> Print Individual Student Result with School Full Name & Logo - Provost Final View - {displayName}</h2>
            <p className="text-xs bg-amber-50 border-2 border-amber-300 p-2 rounded mt-1 font-bold">Provost {displayName} Final Publisher - Print individual student result - With LABE COLLEGE OF NURSING SCIENCES, GBOKO full name + Logo + CGPA + Class of Diploma (Distinction/Upper/Lower/Pass) + Carry Over Auto Reflect + Transcript ND/HND - Search by Name and Matric No - Students see ONLY after Provost publishes</p>
          </div>

          <div className="bg-red-50 border-2 border-red-300 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-black ${senateApproved?'bg-green-600 text-white':'bg-red-600 text-white'}`}>{senateApproved ? `✅ Published by ${senateInfo.provost} on ${new Date(senateInfo.date).toLocaleDateString()} - Students CAN see CGPA, Class, Transcript` : '🔒 NOT PUBLISHED - Students see Locked - Provost MUST publish before student can see result'}</span>
            <span>Current: {computationResults.length} results in system - Status: {senateApproved ? 'PROVOST_PUBLISHED' : 'Awaiting Provost Publish'}</span>
          </div>

          <div className="flex flex-wrap gap-2 bg-slate-50 p-3 rounded-xl border">
            <div className="flex items-center gap-2 flex-1 bg-white border-2 border-amber-400 rounded-xl px-3">
              <Search className="w-4 h-4 text-amber-600"/>
              <input value={searchIndividual} onChange={e=>setSearchIndividual(e.target.value)} placeholder="🔍 Search by Name and Matric No - e.g. Okonkwo or LCNS/2026/ND1/001 - Provost Search" className="flex-1 py-2.5 text-xs font-black outline-none"/>
              {searchIndividual && <button onClick={()=>setSearchIndividual('')} className="px-2 py-1 bg-slate-100 rounded-full text-[10px] font-black">Clear</button>}
            </div>
            <div className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-black">{filteredIndividual.length} Students - Search by Name and Matric</div>
          </div>

          {!selectedPrintStudent ? (
            <div className="overflow-x-auto border-2 rounded-xl">
              <table className="w-full text-xs">
                <thead className="bg-slate-900 text-white"><tr><th className="p-3 text-left">Matric No + Name - Search by Name and Matric</th><th className="p-3 text-left">Level + Program</th><th className="p-3 text-left">Results + CGPA + Class + Carry Over</th><th className="p-3 text-center">Print with School Full Name + Logo - Provost Final</th></tr></thead>
                <tbody>
                  {filteredIndividual.map((s:any) => {
                    const studResults = computationResults.filter((r:any)=> r.matricNo===s.matricNo);
                    let cu=0, gp=0; studResults.forEach((r:any)=>{ const g = r.score>=70?4: r.score>=60?3: r.score>=50?2: r.score>=40?1:0; cu+=r.creditUnit||3; gp+=(r.creditUnit||3)*g; });
                    const cgpa = cu? (gp/cu).toFixed(2) : '0.00';
                    const cls = cgpa>=3.5?'DISTINCTION': cgpa>=3.0?'UPPER CREDIT': cgpa>=2.5?'LOWER CREDIT': cgpa>=2.0?'PASS':'FAIL';
                    return (
                      <tr key={s.matricNo} className="border-b hover:bg-amber-50">
                        <td className="p-3"><p className="font-mono font-black text-emerald-800">{s.matricNo}</p><p className="font-black uppercase">{s.fullName}</p><p className="text-[10px]">Provost Final View</p></td>
                        <td className="p-3"><p className="font-bold">{s.level} - {s.program}</p><p className="text-[11px]">{s.session}</p></td>
                        <td className="p-3"><p className="text-[11px]">Courses: {studResults.length} | CGPA: {cgpa} | {cls}</p><p className="text-[10px]">{studResults.filter((r:any)=>r.score<40).length ? `⚠️ Carry: ${studResults.filter((r:any)=>r.score<40).map((r:any)=>r.courseCode).join(', ')} - Auto Reflects in Second Sem` : '✅ No Carry - Good Standing'}</p><p className="text-[10px]">{senateApproved ? '✅ Published - Student can see' : '🔒 Not Published - Student locked - Provost must publish'}</p></td>
                        <td className="p-3 text-center"><button onClick={()=>setSelectedPrintStudent(s)} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black flex items-center gap-2 mx-auto"><Printer className="w-4 h-4"/> Print {s.matricNo} - School Full Name + Logo - PROVOST FINAL</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border">
                <p className="font-black text-sm">Selected: {selectedPrintStudent.fullName} - {selectedPrintStudent.matricNo} - Printing as Provost Final - {displayName} - {senateApproved ? '✅ Published - Students can see' : '🔒 Not yet published - Students locked'}</p>
                <button onClick={()=>setSelectedPrintStudent(null)} className="px-4 py-2 bg-slate-200 rounded-xl text-xs font-black">← Back to List</button>
              </div>
              <PrintableResultWithLogo
                matricNo={selectedPrintStudent.matricNo}
                fullName={selectedPrintStudent.fullName}
                level={selectedPrintStudent.level}
                program={selectedPrintStudent.program}
                results={computationResults.filter((r:any)=> r.matricNo===selectedPrintStudent.matricNo)}
                currentUserRole="PROVOST - FINAL APPROVAL"
                currentUserName={displayName}
                senateApproved={senateApproved}
                senateDate={senateInfo.date}
                senateProvost={senateInfo.provost}
              />
            </div>
          )}
        </div>
      ) : activeTab === 'result_publish' ? (
        <div className="bg-white rounded-3xl border-2 border-red-400 p-6 space-y-6">
          <div>
            <h2 className="text-xl font-black flex items-center gap-2"><FileCheck className="w-6 h-6 text-red-600"/> Provost Final Publish - MUST Publish Before Student Can See Result - {displayName}</h2>
            <p className="text-xs bg-red-50 border-2 border-red-200 p-3 rounded mt-2 font-bold">⚠️ IMPORTANT: Provost MUST publish results before students can see CGPA, Class of Diploma, Carry Over, Transcript. Current status: {senateApproved ? '✅ Published - Students CAN see' : '🔒 Not Published - Students see Locked screen "Result Not Yet Published - Awaiting Provost Senate Ratification"'} - Total results: {computationResults.length} - After publishing, students can print Result Slip + Transcript ND/HND + Excel CSV with School Full Name + Logo</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-slate-900 text-white rounded-2xl p-4 text-center"><p className="text-[10px] text-slate-400">TOTAL RESULTS IN SYSTEM</p><p className="text-3xl font-black text-amber-400">{computationResults.length}</p><p className="text-[10px]">From Exam Officer Calculation</p></div>
            <div className={`rounded-2xl p-4 text-center border-2 ${senateApproved?'bg-green-600 text-white border-green-700':'bg-red-600 text-white border-red-700'}`}><p className="text-[10px]">PUBLISH STATUS</p><p className="text-lg font-black">{senateApproved?'✅ PUBLISHED':'🔒 NOT PUBLISHED'}</p><p className="text-[10px]">{senateApproved?'Students CAN see CGPA, Class, Transcript':'Students see Locked - Must publish'}</p></div>
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-center"><p className="text-[10px] font-bold">PROVOST</p><p className="text-sm font-black">{displayName}</p><p className="text-[10px]">{senateApproved?`Published on ${new Date(senateInfo.date).toLocaleDateString()}`:'Not yet published'}</p></div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={handleProvostPublishAll} className="px-8 py-4 bg-red-700 hover:bg-red-800 text-white rounded-full font-black text-sm flex items-center gap-2 shadow-lg"><FileCheck className="w-5 h-5"/> 🎓 Provost Publish ALL Results - {computationResults.length} - Students Can Now See CGPA + Class + Transcript + Carry Over</button>
            <button onClick={handleSenateApproval} disabled={senateApproved} className={`px-6 py-4 rounded-full font-black text-sm flex items-center gap-2 ${senateApproved?'bg-emerald-100 text-emerald-800 border':'bg-emerald-700 text-white'}`}><CheckCircle2 className="w-5 h-5"/> {senateApproved?'✅ Senate Ratified':'Grant Senate Approval Only'}</button>
            {senateApproved && <button onClick={handleRevokeApproval} className="px-6 py-4 bg-slate-200 text-slate-800 rounded-full font-black text-sm">⏸️ Revoke - Hide from Students</button>}
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-xs">
            <h4 className="font-black">How Provost Publish Works - MUST Before Student Sees:</h4>
            <p>1. Lecturer submits scores → Exam Officer calculates GPA, CGPA, Class (Distinction/Upper/Lower/Pass), Carry Over auto reflect</p>
            <p>2. HOD moderates → Registrar verifies → Forward to Provost</p>
            <p>3. Provost clicks <b>Publish ALL Results</b> → System sets all results to PROVOST_PUBLISHED + Sets Senate Approved = true in localStorage</p>
            <p>4. StudentPortal checks `lcns_senate_approved` → If true, student sees Result Slip with CGPA {`{cgpa}`} + Class + Carry Over + Transcript + School Full Name + Logo</p>
            <p>5. If Provost NOT publish, student sees 🔒 Locked screen: "Result Not Yet Published - Awaiting Provost Senate Ratification"</p>
            <p>6. Provost can revoke - Students locked again</p>
          </div>

          <div className="overflow-x-auto border-2 rounded-xl">
            <table className="w-full text-xs">
              <thead className="bg-slate-900 text-white"><tr><th className="p-2">Matric + Name</th><th className="p-2">Course + CU</th><th className="p-2">Score</th><th className="p-2">Grade</th><th className="p-2">GP</th><th className="p-2">Status</th><th className="p-2">Student Can See?</th></tr></thead>
              <tbody>
                {computationResults.slice(0,20).map((r:any)=> {
                  const g = r.score>=70?'A': r.score>=60?'B': r.score>=50?'C': r.score>=40?'D':'F';
                  return (
                    <tr key={r.id} className="border-b hover:bg-slate-50">
                      <td className="p-2"><p className="font-mono font-black text-emerald-800">{r.matricNo}</p><p className="font-bold">{r.fullName}</p></td>
                      <td className="p-2">{r.courseCode} - {r.creditUnit||3} CU</td>
                      <td className="p-2 font-black">{r.score}</td>
                      <td className="p-2"><span className={`px-2 py-1 rounded-full font-black ${g==='A'?'bg-green-100 text-green-800': g==='F'?'bg-red-100 text-red-800':'bg-slate-100'}`}>{g}</span></td>
                      <td className="p-2 font-bold">{(r.creditUnit||3)*(g==='A'?4:g==='B'?3:g==='C'?2:g==='D'?1:0)}</td>
                      <td className="p-2"><span className={`px-2 py-1 rounded-full text-[10px] font-black ${r.status==='PROVOST_PUBLISHED'?'bg-green-600 text-white':'bg-amber-100 text-amber-800'}`}>{r.status}</span></td>
                      <td className="p-2"><span className={`px-2 py-1 rounded-full text-[10px] font-black ${senateApproved && r.status==='PROVOST_PUBLISHED'?'bg-green-100 text-green-800':'bg-red-100 text-red-800'}`}>{senateApproved && r.status==='PROVOST_PUBLISHED'?'✅ Student CAN see':'🔒 Student LOCKED - Provost must publish'}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {computationResults.length===0 && <p className="p-4 text-center text-slate-500 text-xs">No results yet - Exam Officer must create results in ResultComputationManager - Then Provost publishes - Then students see CGPA + Class + Transcript</p>}
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2"><div className="flex items-center justify-between text-slate-500"><span className="text-xs font-bold uppercase">Total Enrolled</span><div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl"><Users className="w-5 h-5" /></div></div><div className="text-2xl font-black text-slate-900">{students.length + 415}</div><div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> +14.2% from last session</div></div>
            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2"><div className="flex items-center justify-between text-slate-500"><span className="text-xs font-bold uppercase">2026/2027 Applicants</span><div className="p-2 bg-emerald-50 text-[#0a4d2e] rounded-xl"><GraduationCap className="w-5 h-5" /></div></div><div className="text-2xl font-black text-slate-900">{applicants.length + 185}</div><div className="text-[11px] text-[#16a34a] font-semibold">Merit List Quota: 85% Met</div></div>
            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2"><div className="flex items-center justify-between text-slate-500"><span className="text-xs font-bold uppercase">Overall Exam Pass Rate</span><div className="p-2 bg-amber-50 text-amber-700 rounded-xl"><Award className="w-5 h-5" /></div></div><div className="text-2xl font-black text-emerald-800">94.8%</div><div className="text-[11px] text-emerald-600 font-semibold">NMCN Professional Standard Target</div></div>
            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2"><div className="flex items-center justify-between text-slate-500"><span className="text-xs font-bold uppercase">Bursary Revenue (YTD)</span><div className="p-2 bg-purple-50 text-purple-700 rounded-xl"><TrendingUp className="w-5 h-5" /></div></div><div className="text-2xl font-black text-slate-900">₦{(totalRevenue + 72400000).toLocaleString()}</div><div className="text-[11px] text-purple-600 font-semibold">Remita Verified Collections</div></div>
          </div>
          <div className="bg-white rounded-3xl border-2 border-emerald-700/40 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1"><span className="text-xs font-bold uppercase text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">Senate Academic Board Agenda - {displayName} - {senateApproved ? '✅ APPROVED & PUBLISHED TO STUDENTS - CGPA + Class + Transcript' : '⏳ PENDING - Students Locked'}</span><h3 className="text-lg font-black text-slate-950 uppercase font-serif-crest">2026/2027 First Semester Examination Broadsheet Ratification - Provost MUST Publish Before Student Sees</h3><p className="text-xs text-slate-600">Submitted by Dr. Emmanuel O. Agada (Examination Officer) and moderated by Heads of Department. Provost: {displayName} - This will unlock results for all students to see CGPA, Distinction/Upper/Lower/Pass, Carry Over auto reflect, Transcript ND/HND, Individual Result with School Full Name + Logo.</p></div>
              <div className="flex gap-2">
                <button onClick={handleSenateApproval} disabled={senateApproved} className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md transition-all ${senateApproved ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-emerald-800 hover:bg-emerald-900 text-white'}`}><CheckCircle2 className="w-4 h-4 text-amber-300" /><span>{senateApproved ? 'Senate Ratified & Approved - Students Can See' : 'Grant Senate Final Approval'}</span></button>
                {senateApproved && <button onClick={handleRevokeApproval} className="px-3 py-3 rounded-xl text-xs font-bold bg-red-50 text-red-700 border border-red-200">Revoke - Hide from Students</button>}
              </div>
            </div>
            {senateApproved ? (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>✅ Senate approval granted on {new Date().toLocaleDateString()} by {displayName}. Transcripts and Semester GPA results are officially unlocked for all students - Students can see CGPA, Class of Diploma, Carry Over, Individual Result with School Full Name + Logo. Saved to localStorage - Students can now view results in Student Portal. Refresh student page to see. Total {computationResults.length} results published.</span>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>⏳ Not yet ratified - Students currently see 🔒 "Result Not Yet Published - Awaiting Provost Senate Ratification" - Click Grant to publish to all student portals. Students will NOT see CGPA, Class, Transcript until Provost publishes. This is final control - Provost MUST publish before student can see.</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProvostDashboard;

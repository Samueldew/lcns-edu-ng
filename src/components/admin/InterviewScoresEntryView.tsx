import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import { Applicant, ScreeningScore } from '../../types';
import { getSupabase } from '../../lib/supabase';
import { Search, CheckCircle2, Award, Save, Eye, EyeOff, FileText } from 'lucide-react';

export const InterviewScoresEntryView: React.FC = () => {
  const [applicants, setApplicants] = useState<Applicant[]>(StorageService.getApplicants());
  const [scores, setScores] = useState<ScreeningScore[]>(StorageService.getScreeningScores());
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<{ [formNo: string]: Partial<ScreeningScore> }>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setApplicants(StorageService.getApplicants());
      setScores(StorageService.getScreeningScores());
    };
    window.addEventListener('lcns_storage_update', handleUpdate);
    return () => window.removeEventListener('lcns_storage_update', handleUpdate);
  }, []);

  const filtered = applicants.filter(a => 
    (a.fullName.toLowerCase().includes(search.toLowerCase()) ||
    a.formNo.toLowerCase().includes(search.toLowerCase()) ||
    (a.exam_number?.toLowerCase().includes(search.toLowerCase()) || a.examNumber?.toLowerCase().includes(search.toLowerCase()))) 
  ).filter(a => a.bursar_cleared || a.bursarCleared || a.status === 'BURSAR_CLEARED' || a.status === 'ADMISSION_IN_PROGRESS' || a.status === 'ADMITTED');

  const getScoreFor = (formNo: string) => scores.find(s => s.application_number.toLowerCase() === formNo.toLowerCase());

  const handleChange = (formNo: string, field: keyof ScreeningScore, value: any) => {
    setEditing(prev => ({
      ...prev,
      [formNo]: { ...(prev[formNo] || getScoreFor(formNo) || { application_number: formNo } as any), [field]: value }
    }));
  };

  const handleSave = async (formNo: string) => {
    setSavingId(formNo);
    const existing = getScoreFor(formNo);
    const editData = editing[formNo] || {};
    
    const interviewScore = Number(editData.interview_score ?? existing?.interview_score ?? 0);
    const screeningScore = Number(editData.screening_score ?? existing?.screening_score ?? 0);
    const totalScore = editData.total_score ? Number(editData.total_score) : Math.round((screeningScore + interviewScore) / 2);
    const remarks = (editData.remarks ?? existing?.remarks ?? (totalScore >= 50 ? 'PASSED' : 'FAILED')) as string;

    const newScore: ScreeningScore = {
      id: existing?.id || `scr-${Date.now()}-${formNo}`,
      application_number: formNo,
      exam_number: applicants.find(a => a.formNo === formNo)?.exam_number || applicants.find(a => a.formNo === formNo)?.examNumber || '',
      screening_score: screeningScore,
      interview_score: interviewScore,
      total_score: totalScore,
      remarks: remarks,
      is_published: (editData.is_published ?? existing?.is_published ?? false) as boolean,
      scored_by: 'Provost / Registrar / Admission Officer',
      created_at: new Date().toISOString(),
    } as any;

    const updated = existing ? scores.map(s => s.application_number.toLowerCase() === formNo.toLowerCase() ? newScore : s) : [...scores, newScore];
    setScores(updated);
    StorageService.saveScreeningScores(updated);

    // ===== NEW - FIX FOR APPLICANT DASHBOARD TO SEE IT =====
    // 1. Save individual key that ApplicantDashboard reads
    const finalResultPayload = {
      applicationNumber: formNo,
      application_number: formNo,
      formNo: formNo,
      form_no: formNo,
      examNumber: newScore.exam_number,
      exam_number: newScore.exam_number,
      cbtScore: 0, // CBT is separate, but keep for compatibility
      cbt_score: 0,
      screeningScore: screeningScore,
      screening_score: screeningScore,
      interviewScore: interviewScore,
      interview_score: interviewScore,
      totalScore: totalScore,
      total_score: totalScore,
      remarks: remarks,
      is_published: newScore.is_published,
      published: newScore.is_published,
      publishedBy: newScore.scored_by,
      published_by: newScore.scored_by,
      publishedAt: new Date().toISOString(),
      published_at: new Date().toISOString(),
    };
    localStorage.setItem(`lcns_applicant_final_result_${formNo}`, JSON.stringify(finalResultPayload));
    if (newScore.exam_number) {
      localStorage.setItem(`lcns_applicant_final_result_${newScore.exam_number}`, JSON.stringify(finalResultPayload));
    }
    // 2. Save to global arrays that ApplicantDashboard checks
    const globalKeys = ['lcns_interview_scores', 'lcns_applicant_interview_scores', 'lcns_final_admission_scores', 'lcns_applicant_final_results'];
    globalKeys.forEach(k => {
      try {
        const existingArr = JSON.parse(localStorage.getItem(k) || '[]');
        const filteredArr = existingArr.filter((x:any) => (x.applicationNumber || x.application_number || x.formNo) !== formNo);
        filteredArr.push(finalResultPayload);
        localStorage.setItem(k, JSON.stringify(filteredArr));
      } catch {}
    });
    // 3. Also save applicant_results style for ApplicantDashboard
    try {
      const applicantResults = JSON.parse(localStorage.getItem('applicant_results') || '[]');
      const filteredResults = applicantResults.filter((x:any) => x.application_number !== formNo);
      filteredResults.push(finalResultPayload);
      localStorage.setItem('applicant_results', JSON.stringify(filteredResults));
    } catch {}
    window.dispatchEvent(new Event('lcns_storage_update'));

    try {
      const sb = getSupabase();
      if (sb) {
        await sb.from('screening_scores').upsert([newScore as any], { onConflict: 'application_number' });
        // Also try applicant_results table if exists
        await sb.from('applicant_results').upsert([finalResultPayload as any], { onConflict: 'application_number' });
      }
    } catch (e) { console.warn(e); }

    setEditing(prev => { const { [formNo]: _, ...rest } = prev; return rest; });
    setSavingId(null);
    alert(`✅ Saved for ${formNo}: Interview ${interviewScore}% | Total ${totalScore}% | Remarks: ${remarks} | ${newScore.is_published ? 'PUBLISHED' : 'Saved as draft - Click Publish to show to applicant'}`);
  };

  const handleTogglePublish = async (formNo: string) => {
    const existing = getScoreFor(formNo);
    if (!existing) return alert('Enter Interview Score first!');
    const updated = { ...existing, is_published: !existing.is_published };
    const newList = scores.map(s => s.application_number.toLowerCase() === formNo.toLowerCase() ? updated : s);
    setScores(newList);
    StorageService.saveScreeningScores(newList);
    
    // NEW - Update all final result keys with publish status
    try {
      const finalKey = `lcns_applicant_final_result_${formNo}`;
      const existingFinal = JSON.parse(localStorage.getItem(finalKey) || '{}');
      const updatedFinal = { ...existingFinal, is_published: updated.is_published, published: updated.is_published, publishedAt: new Date().toISOString() };
      localStorage.setItem(finalKey, JSON.stringify(updatedFinal));
      if (existing.exam_number) {
        localStorage.setItem(`lcns_applicant_final_result_${existing.exam_number}`, JSON.stringify(updatedFinal));
      }
      ['lcns_interview_scores', 'lcns_applicant_interview_scores', 'lcns_final_admission_scores'].forEach(k => {
        try {
          const arr = JSON.parse(localStorage.getItem(k) || '[]');
          const newArr = arr.map((x:any) => (x.applicationNumber === formNo || x.application_number === formNo) ? {...x, is_published: updated.is_published, published: updated.is_published} : x);
          localStorage.setItem(k, JSON.stringify(newArr));
        } catch {}
      });
    } catch {}
    
    window.dispatchEvent(new Event('lcns_storage_update'));
    try { const sb = getSupabase(); if (sb) await sb.from('screening_scores').update({ is_published: updated.is_published }).eq('application_number', formNo); } catch {}
    alert(updated.is_published ? '✅ PUBLISHED - Applicant can now see in dashboard!' : '⏸️ UNPUBLISHED - Hidden from applicant');
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-950 via-[#0a4d2e] to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-emerald-800">
        <span className="px-3 py-1 bg-amber-400 text-slate-950 font-black text-[10px] rounded-full uppercase">2. Provost / Registrar / Admission Officer Panel</span>
        <h1 className="text-2xl font-black uppercase mt-2 font-serif">Enter Interview Score + Total + Remarks</h1>
        <p className="text-xs text-emerald-200 mt-1">Enter interview scores set by Provost / Registrar / Admission Officer. Total auto-calculates. Publish so applicant can see in dashboard Section D.</p>
        <div className="mt-3 flex gap-2 text-[11px] flex-wrap">
          <span className="px-2.5 py-1 bg-white/10 rounded-full">Candidates: {filtered.length}</span>
          <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-400 rounded-full">Published: {scores.filter(s => s.is_published).length}</span>
          <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-400 rounded-full">Awaiting Publish: {scores.filter(s => !s.is_published).length}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border flex gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search candidate by name, form no, exam no..." className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-xl text-xs" />
        </div>
      </div>

      <div className="bg-white rounded-3xl border shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 font-bold uppercase border-b text-slate-700">
            <tr>
              <th className="p-3">Candidate</th>
              <th className="p-3">Interview Score (100%) - Provost/Registrar/Admission Officer</th>
              <th className="p-3">Total Score (%)</th>
              <th className="p-3">Remarks / Board Decision</th>
              <th className="p-3">Publish to Applicant</th>
              <th className="p-3">Save</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map(app => {
              const existing = getScoreFor(app.formNo);
              const edit = editing[app.formNo] || {};
              const interviewVal = edit.interview_score ?? existing?.interview_score ?? '';
              const screeningVal = edit.screening_score ?? existing?.screening_score ?? '';
              const totalVal = edit.total_score ?? existing?.total_score ?? (interviewVal !== '' && screeningVal !== '' ? Math.round((Number(screeningVal) + Number(interviewVal)) / 2) : '');
              const remarksVal = edit.remarks ?? existing?.remarks ?? '';

              return (
                <tr key={app.id} className="hover:bg-emerald-50/50">
                  <td className="p-3">
                    <div className="font-bold uppercase text-slate-900">{app.fullName}</div>
                    <div className="font-mono text-[11px] text-emerald-800">{app.formNo}</div>
                    <div className="text-[10px] text-slate-500">Exam: {app.exam_number || app.examNumber || 'Pending'} • JAMB: {app.jambScore}</div>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <div>
                        <span className="text-[9px] font-bold uppercase text-slate-500 block">Screening % (optional)</span>
                        <input type="number" min="0" max="100" value={screeningVal} onChange={(e) => handleChange(app.formNo, 'screening_score', e.target.value)} placeholder="Screen" className="w-20 p-2 border rounded-lg bg-slate-50 font-bold" />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold uppercase text-emerald-700 block">Interview % *</span>
                        <input type="number" min="0" max="100" value={interviewVal} onChange={(e) => handleChange(app.formNo, 'interview_score', e.target.value)} placeholder="0-100" className="w-24 p-2.5 border-2 border-emerald-300 rounded-xl bg-emerald-50 font-black text-emerald-900 focus:ring-2 focus:ring-emerald-600" />
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-[9px] font-bold uppercase text-purple-700 block">Total % (auto / edit)</span>
                    <input type="number" min="0" max="100" value={totalVal} onChange={(e) => handleChange(app.formNo, 'total_score', e.target.value)} placeholder="Total" className="w-20 p-2.5 border-2 border-purple-300 rounded-xl bg-purple-50 font-black text-purple-900" />
                    <span className="text-[10px] text-slate-500 block mt-0.5">Composite</span>
                  </td>
                  <td className="p-3">
                    <input value={remarksVal} onChange={(e) => handleChange(app.formNo, 'remarks', e.target.value)} placeholder="e.g. Excellent, PASSED, FAILED, Admitted..." className="w-44 p-2.5 border rounded-xl text-xs" />
                  </td>
                  <td className="p-3">
                    {existing ? (
                      <button onClick={() => handleTogglePublish(app.formNo)} className={`px-3 py-2 rounded-xl text-[11px] font-bold flex items-center gap-1 ${existing.is_published ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        {existing.is_published ? <><Eye className="w-3.5 h-3.5" />Published - Applicant can see</> : <><EyeOff className="w-3.5 h-3.5" />Hidden - Click to Publish</>}
                      </button>
                    ) : <span className="text-[11px] text-slate-400">Save first</span>}
                  </td>
                  <td className="p-3"><button disabled={savingId === app.formNo} onClick={() => handleSave(app.formNo)} className="px-4 py-2 bg-[#0a4d2e] text-white rounded-xl font-bold text-xs flex items-center gap-1 hover:bg-[#073822]"><Save className="w-4 h-4" />{savingId === app.formNo ? 'Saving...' : 'Save Scores'}</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="p-10 text-center text-slate-500 text-xs">No BURSAR_CLEARED applicants yet. Bursar must clear first.</div>}
      </div>

      <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-xs text-amber-900">
        <strong>How it works for Provost / Registrar / Admission Officer:</strong><br/>
                1. Search candidate → Enter <strong>Interview Score (%)</strong> (main score) + Screening % (if needed) → Total auto-calculates but you fit edit Total manually → Enter Remarks (e.g. PASSED / FAILED)<br/>
                2. Click <strong>Save Scores</strong> → Click <strong>Publish</strong> → Applicant go immediately see for dashboard: <em>Interview Score, Total, Remarks</em> + Official badge. Key saved as <code>lcns_applicant_final_result_{"{formNo}"}</code> so applicant dashboard reads am.
      </div>
    </div>
  );
};

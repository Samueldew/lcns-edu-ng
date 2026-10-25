import React, { useState, useEffect } from 'react';
import { getSupabase } from '../../lib/supabase';
import { CollegeLogo } from '../common/CollegeLogo';

export const AdminExamSettings: React.FC = () => {
  const [examDate, setExamDate] = useState('');
  const [examTitle, setExamTitle] = useState('2026/2027 Entrance Examination - ND/HND 4Years');
  const [venue, setVenue] = useState('Online - lcns.edu.ng/exam');
  const [status, setStatus] = useState('SCHEDULED');
  const [maxPerBatch, setMaxPerBatch] = useState(100);

  const currentUser = (() => {
    try {
      const v = localStorage.getItem('lcns_erp_current_user') || localStorage.getItem('lcns-current-user') || '';
      if (v) return JSON.parse(v);
    } catch {}
    return { role: 'ADMIN', fullName: 'Admin', email: 'admin@lcns.edu.ng' };
  })();

  const role = (currentUser?.role || 'ADMIN').toUpperCase();
  const email = (currentUser?.email || '').toLowerCase();
  const fullName = currentUser?.fullName || 'Admin';
  const isAllowed = ['PROVOST','REGISTRAR','ADMIN','SUPER_ADMIN','EXAM_OFFICER'].some(r => role.includes(r));

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('lcns_exam_settings') || '{}');
    if (saved.examDate) setExamDate(saved.examDate);
    if (saved.examTitle) setExamTitle(saved.examTitle);
    if (saved.venue) setVenue(saved.venue);
    if (saved.status) setStatus(saved.status);
    if (saved.maxPerBatch) setMaxPerBatch(saved.maxPerBatch);
  }, []);

  const handleSave = async () => {
    if (!isAllowed){ alert('Only Provost, Registrar and Admin can set exam! Your role: '+role); return; }
    if (!examDate){ alert('Set Exam Date first!'); return; }
    const settings = { examDate, examTitle, venue, status, maxPerBatch, setBy: fullName, setByRole: role, updatedAt: new Date().toISOString() };
    localStorage.setItem('lcns_exam_settings', JSON.stringify(settings));
    const sb = getSupabase();
    try {
      if (sb){
        await sb.from('college_exam_settings').insert({
          exam_date: examDate, exam_title: examTitle, venue: venue, status: status,
          set_by: fullName, set_by_email: email, set_by_role: role, max_per_batch: maxPerBatch,
          batches: [
            {batch:'A', from:1, to:100, start:'09:00', end:'10:00'},
            {batch:'B', from:101, to:200, start:'10:00', end:'11:00'},
            {batch:'C', from:201, to:300, start:'11:00', end:'12:00'},
            {batch:'D', from:301, to:400, start:'12:00', end:'13:00'},
            {batch:'E', from:401, to:500, start:'13:00', end:'14:00'},
            {batch:'F', from:501, to:600, start:'14:00', end:'15:00'},
            {batch:'G', from:1, to:600, start:'15:00', end:'16:00'},
          ]
        });
      }
    } catch {}
    alert(`✅ EXAM DATE SET BY ${role} ${fullName}! Date: ${examDate} - Max per batch: ${maxPerBatch} - Rolling Batch - Only for Applicants!`);
  };

  if (!isAllowed){
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-8 text-center">
          <h2 className="font-black text-red-900">❌ Only Provost/Registrar/Admin can set exam</h2>
          <p className="text-sm">Your Role: {role}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="bg-gradient-to-r from-emerald-950 to-slate-900 text-white rounded-2xl p-5 flex gap-3 items-center">
        <CollegeLogo size="sm" />
        <div>
          <h2 className="text-lg font-black uppercase">Provost / Registrar / Admin - Set Exam Date</h2>
          <p className="text-xs text-amber-300 font-black">Only 3 roles can set - System auto gives time to applicants - Rolling Batch</p>
          <p className="text-[11px] text-emerald-200">{fullName} - {role} - {email}</p>
        </div>
      </div>
      <div className="bg-white border-2 rounded-2xl p-6 space-y-4">
        <div><label className="text-xs font-black uppercase">Exam Title</label><input value={examTitle} onChange={e=>setExamTitle(e.target.value)} className="w-full border-2 px-4 py-2.5 rounded-xl font-bold mt-1" /></div>
        <div><label className="text-xs font-black uppercase">Exam Date - SET ONCE</label><input type="date" value={examDate} onChange={e=>setExamDate(e.target.value)} className="w-full border-2 border-emerald-500 px-4 py-3 rounded-xl font-black mt-1 bg-emerald-50" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs font-black uppercase">Venue</label><input value={venue} onChange={e=>setVenue(e.target.value)} className="w-full border px-4 py-2.5 rounded-xl font-bold mt-1" /></div>
          <div><label className="text-xs font-black uppercase">Max Per Batch - Admin Controls</label><input type="number" value={maxPerBatch} onChange={e=>setMaxPerBatch(parseInt(e.target.value)||100)} className="w-full border-2 border-amber-400 px-4 py-2.5 rounded-xl font-black mt-1" /></div>
        </div>
        <div className="bg-slate-900 text-white rounded-xl p-4 text-xs space-y-1">
          <p className="font-black text-amber-300">Rolling Batch 1 Hour Interval - 9AM Start:</p>
          <p>1-100 → {examDate} 9-10AM Batch A</p>
          <p>101-200 → {examDate} 10-11AM Batch B</p>
          <p>201-300 → {examDate} 11-12PM Batch C</p>
          <p>301-400 → {examDate} 12-1PM Batch D</p>
          <p>401-500 → {examDate} 1-2PM Batch E</p>
          <p>501-600 → {examDate} 2-3PM Batch F - 600 target</p>
          <p>3-4PM → {examDate} Final Mop-up - All missed can join</p>
          <p className="text-emerald-300 mt-2">Miss Batch A → Join Batch B → Join Batch C → Till final - Admin controls max {maxPerBatch}</p>
        </div>
        <button onClick={handleSave} className="w-full bg-emerald-700 text-white py-3 rounded-xl font-black text-sm">✅ SAVE AS {role} {fullName} - Date {examDate} - Max {maxPerBatch} - Only Applicants System</button>
      </div>
    </div>
  );
};
export default AdminExamSettings;

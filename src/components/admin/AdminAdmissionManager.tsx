import React, { useState, useEffect } from 'react';
import { getSupabase } from '../../lib/supabase';
import { Search, X } from 'lucide-react';

export const AdminAdmissionManager: React.FC<{ currentUser:any }> = ({ currentUser }) => {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [filter, setFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;
  const [totalCount, setTotalCount] = useState(0);
  
  const load = async ()=>{
    const sb=getSupabase();
    try{
      if(sb){ 
        let query = sb.from('lcns_applicants').select('*', { count: 'exact' }).order('created_at', {ascending:false}).range(page * PAGE_SIZE, (page+1)*PAGE_SIZE -1);
        if(filter === 'PENDING_BURSAR') query = query.eq('bursar_cleared', false);
        if(filter === 'ADMITTED') query = query.eq('admission_status', 'ADMITTED');
        if(filter === 'CLEARED') query = query.eq('bursar_cleared', true);
        if(filter === 'CBT_PUBLISHED') query = query.eq('cbt_published', true);
        if(search){
          query = query.or(`full_name.ilike.%${search}%,application_number.ilike.%${search}%,jamb_reg_number.ilike.%${search}%,exam_number.ilike.%${search}%`);
        }
        const { data, count } = await query;
        if(data) setApplicants(data);
        if(count !== null) setTotalCount(count);
      } else { 
        const local=JSON.parse(localStorage.getItem('lcns_applicants')||'[]'); 
        setApplicants(local.slice(page*PAGE_SIZE, (page+1)*PAGE_SIZE));
        setTotalCount(local.length);
      }
    }catch(e){ console.log(e); }
  };
  
  useEffect(()=>{ load(); }, [filter, page, search]);

  // ADDED: Cross-tab sync for admission
  useEffect(() => {
    const handler = () => load();
    window.addEventListener('storage', (e) => {
      if (e.key === 'lcns_applicants' || e.key === 'lcns_last_update') handler();
    });
    window.addEventListener('lcns_applicants_update', handler);
    return () => {
      window.removeEventListener('storage', handler as any);
      window.removeEventListener('lcns_applicants_update', handler);
    };
  }, []);
  
  const updateApplicant = async (id:string, updates:any)=>{
    const sb=getSupabase();
    try{ if(sb) await sb.from('lcns_applicants').update({...updates, updated_at: new Date().toISOString()}).eq('id', id); }catch{}
    const updated=applicants.map(a=> a.id===id ? {...a, ...updates} : a);
    setApplicants(updated); 
    localStorage.setItem('lcns_applicants', JSON.stringify(updated));
    localStorage.setItem('lcns_last_update', Date.now().toString());
    window.dispatchEvent(new Event('lcns_applicants_update'));
    if(selected?.id===id) setSelected({...selected, ...updates});
  };
  
  const filtered = applicants;

  return (
    <div className="max-w-7xl mx-auto p-4 bg-white rounded-xl shadow space-y-4">
      <h2 className="text-xl font-black">🎓 All Applicants - {totalCount} Total - Visible to: PROVOST, REGISTRAR, HOD, EXAM_OFFICER, BURSAR, ADMIN</h2>
      <p className="text-xs bg-blue-50 p-2 rounded border">Logged as: <b>{currentUser?.fullName} - {currentUser?.role}</b> | Cross-tab sync ON | 50 per page | JAMB Reg No + Score visible</p>
      
      <div className="flex flex-wrap gap-2 bg-slate-50 p-2 rounded-xl border text-xs font-bold">
        <div className="flex items-center gap-2 flex-1 min-w-[250px]"><Search className="w-4 h-4"/><input value={search} onChange={e=>{setSearch(e.target.value); setPage(0);}} placeholder="Search name, app no, JAMB reg, exam no" className="flex-1 px-3 py-2 border rounded-lg text-black"/></div>
        <select value={filter} onChange={e=>{setFilter(e.target.value); setPage(0);}} className="px-3 py-2 border rounded-lg text-black">
          <option value="ALL">All ({totalCount})</option>
          <option value="PENDING_BURSAR">Pending Bursar</option>
          <option value="CLEARED">Bursar Cleared</option>
          <option value="CBT_PUBLISHED">CBT Published</option>
          <option value="ADMITTED">Admitted</option>
        </select>
        <button onClick={()=>{setPage(0); load();}} className="px-3 py-2 bg-slate-800 text-white rounded-lg">Refresh</button>
      </div>

      <div className="flex gap-2 text-xs font-bold items-center">
        <button disabled={page===0} onClick={()=>setPage(p=>Math.max(0,p-1))} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-30">← Prev</button>
        <span className="px-3 py-1 bg-blue-600 text-white rounded">Page {page+1} — {filtered.length} of {totalCount}</span>
        <button onClick={()=>setPage(p=>p+1)} className="px-3 py-1 bg-gray-200 rounded">Next →</button>
      </div>
      
      <div className="overflow-x-auto border rounded-xl"><table className="w-full text-xs"><thead className="bg-slate-900 text-white"><tr><th className="p-2 text-left">App No / Exam No</th><th className="p-2 text-left">Name + Passport</th><th>JAMB Reg + Score</th><th>Course</th><th>Bursar</th><th>CBT</th><th>Interview</th><th>Admission</th><th>Action</th></tr></thead><tbody>{filtered.map(a=><tr key={a.id} className="border-b"><td className="p-2 font-mono text-[11px]"><b>{a.application_number}</b><br/>{a.exam_number}</td><td className="p-2"><div className="flex items-center gap-2"><img src={a.passport_url} alt="" className="w-10 h-10 rounded object-cover border"/><span className="font-bold">{a.full_name}</span></div></td><td className="p-2 font-mono"><b>{a.jamb_reg_number}</b><br/>Score: <span className="font-black text-blue-700">{a.jamb_score}</span></td><td className="p-2 text-[11px]">{a.course_applying}</td><td className="p-2 text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${a.bursar_cleared?'bg-green-600 text-white':'bg-red-100 text-red-800'}`}>{a.bursar_cleared?'CLEARED':'PENDING'}</span></td><td className="p-2 text-center">{a.cbt_published ? <span className="font-black text-blue-700">{a.cbt_score}/{a.cbt_total}</span> : <span className="text-slate-400">{a.cbt_exam_date||'Not set'}</span>}</td><td className="p-2 text-center">{a.interview_published ? <span className="font-black text-purple-700">{a.interview_score}</span> : <span className="text-slate-400">{a.interview_date||'Not set'}</span>}</td><td className="p-2 text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${a.admission_status==='ADMITTED'?'bg-green-600 text-white':'bg-amber-400 text-black'}`}>{a.admission_status}</span></td><td className="p-2 text-center"><button onClick={()=>setSelected(a)} className="px-2 py-1 bg-blue-600 text-white rounded text-[11px]">Manage</button></td></tr>)}</tbody></table></div>
      
      {filtered.length===0 && <div className="p-12 text-center border-2 border-dashed rounded-xl text-slate-400">No applicants — Total: {totalCount} — Try search or ALL filter. Apply as applicant to create first applicant.</div>}

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto"><div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto p-4 space-y-4">
          <div className="flex justify-between border-b pb-2"><h3 className="font-black text-sm">{selected.full_name} - {selected.application_number} - JAMB: {selected.jamb_reg_number} Score: {selected.jamb_score}</h3><button onClick={()=>setSelected(null)} className="p-2 bg-slate-100 rounded-full"><X className="w-5 h-5"/></button></div>
          <div className="grid md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border"><p>App No: <b>{selected.application_number}</b> Exam No: <b>{selected.exam_number}</b></p><p>School: {selected.secondary_school_name}</p><p>JAMB Reg: <b>{selected.jamb_reg_number}</b> Score: <b>{selected.jamb_score}</b> Year: {selected.jamb_year} Course: {selected.course_applying}</p><div className="flex gap-2 mt-2"><img src={selected.passport_url} alt="" className="w-24 h-24 object-cover border"/><a href={selected.result_upload_1_url} target="_blank" className="px-2 py-1 bg-blue-100 rounded">View Result</a><a href={selected.payment_proof_url} target="_blank" className="px-2 py-1 bg-red-100 rounded">View Payment</a></div></div>
            <div className="bg-amber-50 p-3 rounded-xl border"><h4 className="font-black">Bursar Clearance</h4><p>Status: {selected.bursar_cleared ? '✅ CLEARED' : '⏳ PENDING'}</p><button onClick={()=>updateApplicant(selected.id, { bursar_cleared:true, status:'ADMISSION_IN_PROGRESS', bursar_cleared_at:new Date().toISOString() })} className="mt-2 px-3 py-2 bg-green-600 text-white rounded font-black">✅ Clear Bursar</button></div>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200 space-y-2"><h4 className="font-black text-sm">CBT Exam — Set by Registrar/Admin</h4><div className="grid md:grid-cols-3 gap-2"><input type="date" defaultValue={selected.cbt_exam_date} onChange={e=>selected.cbt_exam_date=e.target.value} className="px-2 py-2 border rounded text-black"/><input placeholder="Venue" defaultValue={selected.cbt_exam_venue} onChange={e=>selected.cbt_exam_venue=e.target.value} className="px-2 py-2 border rounded text-black"/><input type="time" defaultValue={selected.cbt_exam_time} onChange={e=>selected.cbt_exam_time=e.target.value} className="px-2 py-2 border rounded text-black"/></div><div className="grid md:grid-cols-3 gap-2 mt-2"><input type="number" placeholder="CBT Score 75" defaultValue={selected.cbt_score} onChange={e=>selected.cbt_score=parseInt(e.target.value)} className="px-2 py-2 border-2 border-blue-300 rounded font-black text-black"/><button onClick={()=>{ updateApplicant(selected.id, { cbt_exam_date:selected.cbt_exam_date, cbt_exam_venue:selected.cbt_exam_venue, cbt_exam_time:selected.cbt_exam_time, cbt_score:selected.cbt_score, cbt_total:100, cbt_published:true, cbt_published_by:currentUser?.fullName||'Registrar', cbt_published_at:new Date().toISOString(), status:'CBT_COMPLETED' }); alert('✅ CBT Published'); }} className="px-3 py-2 bg-blue-600 text-white rounded font-black">📢 Publish CBT</button></div></div>
          <div className="bg-purple-50 p-4 rounded-xl border-2 border-purple-200 space-y-2"><h4 className="font-black text-sm">Interview — Published by Registrar/Admin</h4><div className="grid md:grid-cols-3 gap-2"><input type="date" defaultValue={selected.interview_date} onChange={e=>selected.interview_date=e.target.value} className="px-2 py-2 border rounded text-black"/><input placeholder="Venue" defaultValue={selected.interview_venue} onChange={e=>selected.interview_venue=e.target.value} className="px-2 py-2 border rounded text-black"/><input type="time" defaultValue={selected.interview_time} onChange={e=>selected.interview_time=e.target.value} className="px-2 py-2 border rounded text-black"/></div><div className="grid md:grid-cols-3 gap-2 mt-2"><input type="number" placeholder="Interview Score 80" defaultValue={selected.interview_score} onChange={e=>selected.interview_score=parseInt(e.target.value)} className="px-2 py-2 border-2 border-purple-300 rounded font-black text-black"/><button onClick={()=>{ updateApplicant(selected.id, { interview_date:selected.interview_date, interview_venue:selected.interview_venue, interview_time:selected.interview_time, interview_score:selected.interview_score, interview_total:100, interview_published:true, interview_published_by:currentUser?.fullName||'Registrar', interview_published_at:new Date().toISOString(), status:'INTERVIEW_COMPLETED' }); alert('✅ Interview Published'); }} className="px-3 py-2 bg-purple-600 text-white rounded font-black">📢 Publish Interview</button></div></div>
          <div className="bg-green-50 p-4 rounded-xl border-2 border-green-300"><h4 className="font-black text-sm">Final Admission — Provost / Registrar / Admin</h4><div className="flex gap-2 mt-2"><button onClick={()=>{ updateApplicant(selected.id, { admission_status:'ADMITTED', status:'ADMITTED' }); alert('🎉 Admitted!'); }} className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-black">🎉 ADMIT</button><button onClick={()=>{ updateApplicant(selected.id, { admission_status:'NOT_ADMITTED', status:'NOT_ADMITTED' }); }} className="px-4 py-3 bg-red-600 text-white rounded-xl font-black">❌ NOT ADMITTED</button></div></div>
        </div></div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { getSupabase } from '../../lib/supabase';
export const AdminAdmissionManager: React.FC<{ currentUser?: any }> = ({ currentUser }) => {
  const [applicants, setApplicants] = useState<any[]>([]);
  useEffect(()=>{ const load=async()=>{ try{ const sb=getSupabase(); if(!sb) return; const {data}=await sb.from('lcns_applicants').select('*').limit(100); setApplicants(data||[]);}catch(e){} }; load(); },[]);
  return <div className="bg-white rounded-3xl border-2 border-purple-200 p-5"><h2 className="font-black">🎓 All Applicants - {applicants.length} Records</h2><div className="overflow-x-auto mt-3 border rounded-xl"><table className="w-full text-xs"><thead className="bg-purple-900 text-white"><tr><th className="p-2">Name</th><th className="p-2">Email</th><th className="p-2">Status</th></tr></thead><tbody>{applicants.map((a:any)=>(<tr key={a.id} className="border-b"><td className="p-2">{a.full_name||a.fullName}</td><td className="p-2">{a.email}</td><td className="p-2">{a.status}</td></tr>))}</tbody></table></div></div>;
};
export default AdminAdmissionManager;

import React, { useState, useEffect } from 'react';
import { getSupabase } from '../../lib/supabase';
import jsPDF from 'jspdf';

export const CourseRegistrationApproval: React.FC<{ currentUser: any }> = ({ currentUser }) => {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [filterLevel, setFilterLevel] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [creditLimits, setCreditLimits] = useState<any>({ 'ND 1': 24, 'ND 2': 26, 'HND 1': 28, 'HND 2': 28 });
  const [search, setSearch] = useState('');
  const schoolFullName = "COLLEGE OF NURSING SCIENCES, CATHOLIC DIOCESE OF GBOKO";

  useEffect(()=>{ loadRegs(); loadLimits(); }, []);
  const loadLimits = () => {
    const saved = JSON.parse(localStorage.getItem('lcns_credit_limits') || '{}');
    if(Object.keys(saved).length>0) setCreditLimits({...creditLimits, ...saved});
  };
  const saveLimits = () => {
    localStorage.setItem('lcns_credit_limits', JSON.stringify(creditLimits));
    alert(`Saved! ND1:${creditLimits['ND 1']} ND2:${creditLimits['ND 2']} HND1:${creditLimits['HND 1']} HND2:${creditLimits['HND 2']}`);
  };
  const loadRegs = async () => {
    const sb = getSupabase();
    let all:any[]=[];
    if(sb){ const {data}=await sb.from('course_registrations').select('*').order('created_at',{ascending:false}); if(data && data.length>0) all=data; }
    if(all.length===0) all=JSON.parse(localStorage.getItem('lcns_course_registrations') || '[]');
    setRegistrations(all); setFiltered(all);
  };
  const applyFilter = () => {
    let f=registrations;
    if(filterLevel) f=f.filter((r:any)=> r.level===filterLevel);
    if(filterStatus) f=f.filter((r:any)=> r.status===filterStatus);
    if(search) f=f.filter((r:any)=> `${r.student_name} ${r.matric_number} ${r.level}`.toLowerCase().includes(search.toLowerCase()));
    setFiltered(f);
  };
  useEffect(()=>{ applyFilter(); }, [filterLevel, filterStatus, search]);

  const approveReg = async (reg:any) => {
    const limit = creditLimits[reg.level] || 24;
    if(reg.total_units > limit){
      alert(`CANNOT APPROVE! ${reg.total_units} exceeds ${limit} for ${reg.level}! MUST DISAPPROVE!`);
      return;
    }
    const updatedReg = { ...reg, status: 'APPROVED', approved_by: `${currentUser.role} - ${currentUser.fullName}`, approved_at: new Date().toISOString() };
    const all = JSON.parse(localStorage.getItem('lcns_course_registrations') || '[]');
    const newAll = all.map((r:any)=> r.id===reg.id ? updatedReg : r);
    localStorage.setItem('lcns_course_registrations', JSON.stringify(newAll));
    setRegistrations(newAll);
    const sb = getSupabase();
    if(sb){ try{ await sb.from('course_registrations').update({ status: 'APPROVED', approved_by: updatedReg.approved_by, approved_at: updatedReg.approved_at }).eq('id', reg.id); }catch(e){} }
  };
  const disapproveReg = async (reg:any, reason:string) => {
    const updatedReg = { ...reg, status: 'DISAPPROVED', approved_by: `${currentUser.role} - Reason: ${reason}`, approved_at: new Date().toISOString() };
    const all = JSON.parse(localStorage.getItem('lcns_course_registrations') || '[]');
    const newAll = all.map((r:any)=> r.id===reg.id ? updatedReg : r);
    localStorage.setItem('lcns_course_registrations', JSON.stringify(newAll));
    setRegistrations(newAll);
    const sb = getSupabase();
    if(sb){ try{ await sb.from('course_registrations').update({ status: 'DISAPPROVED', approved_by: updatedReg.approved_by, approved_at: updatedReg.approved_at }).eq('id', reg.id); }catch(e){} }
  };
  const printForm = (reg:any) => {
    const doc = new jsPDF('p','mm','a4');
    doc.setFontSize(14); doc.setFont('helvetica','bold');
    doc.text(schoolFullName, 105, 15, {align:'center'});
    doc.setFontSize(11); doc.text(`COURSE REGISTRATION - ${reg.status}`, 105, 22, {align:'center'});
    doc.setFontSize(9); doc.setFont('helvetica','normal');
    doc.text(`Student: ${reg.student_name} (${reg.matric_number}) Level: ${reg.level}`, 15, 32);
    doc.text(`Units: ${reg.total_units} / Max: ${creditLimits[reg.level]} Session: ${reg.session}`, 15, 38);
    let y=50; reg.courses.forEach((c:any,i:number)=>{ doc.text(`${i+1}. ${c.code} - ${c.title} - ${c.units} units`, 15, y); y+=6; });
    doc.save(`CourseReg_${reg.matric_number}.pdf`);
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 text-white rounded-2xl p-5">
        <h1 className="font-black text-sm">COURSE REGISTRATION APPROVAL - {currentUser.role}</h1>
        <p className="text-xs mt-1">Total: {registrations.length} | Pending: {registrations.filter((r:any)=>r.status.includes('PENDING')).length} | Saves permanently on portal</p>
      </div>
      <div className="bg-white border-2 rounded-2xl p-4 grid grid-cols-4 gap-3">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search" className="border-2 rounded-xl p-2 text-xs"/>
        <select value={filterLevel} onChange={e=>setFilterLevel(e.target.value)} className="border-2 rounded-xl p-2 text-xs"><option value="">All Levels</option><option value="ND 1">ND 1</option><option value="ND 2">ND 2</option><option value="HND 1">HND 1</option><option value="HND 2">HND 2</option></select>
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="border-2 rounded-xl p-2 text-xs"><option value="">All Status</option><option value="PENDING">PENDING</option><option value="APPROVED">APPROVED</option><option value="DISAPPROVED">DISAPPROVED</option></select>
        <button onClick={loadRegs} className="bg-slate-900 text-white rounded-xl text-xs font-black">REFRESH</button>
      </div>
      <div className="space-y-3">
        {filtered.map((reg:any)=>{
          const limit = creditLimits[reg.level] || 24;
          const exceed = reg.total_units > limit;
          return (
            <div key={reg.id} className={`border-2 rounded-xl p-4 ${exceed?'bg-red-50 border-red-300':'bg-white'}`}>
              <div className="flex justify-between">
                <div className="text-xs"><p className="font-black">{reg.student_name} - {reg.matric_number} - {reg.level}</p><p>Units: {reg.total_units} / {limit} {exceed && <span className="bg-red-600 text-white px-2 rounded-full">EXCEEDS - MUST DISAPPROVE</span>} Status: {reg.status}</p><p>{reg.courses.map((c:any)=>c.code).join(', ')}</p></div>
                <div className="flex flex-col gap-2">
                  {reg.status.includes('PENDING') && !exceed && <button onClick={()=>approveReg(reg)} className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-black">APPROVE</button>}
                  <button onClick={()=>disapproveReg(reg, exceed ? `Exceeds ${reg.total_units} > ${limit}` : 'Disapproved')} className="px-4 py-2 bg-red-700 text-white rounded-xl text-xs font-black">DISAPPROVE {exceed && `EXCEEDS`}</button>
                  <button onClick={()=>printForm(reg)} className="px-4 py-2 bg-blue-700 text-white rounded-xl text-xs">PRINT {schoolFullName}</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CourseRegistrationApproval;

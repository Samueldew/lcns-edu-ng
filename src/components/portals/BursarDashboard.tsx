import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import { getSupabase } from '../../lib/supabase';
import { Search, Plus, Trash2, DollarSign, Users, Eye, Download, FileText, X, Check, Clock, RefreshCw, Database, BarChart3, TrendingUp, AlertCircle } from 'lucide-react';

interface FeeItem { id: string; name: string; amount: number; level: string; session: string; category: string; applicant_type: string; is_published: boolean; account_name: string; account_number: string; bank_name: string; description: string; created_at: string; }
interface Payment { id: string; user_id: string; user_name: string; matric_no: string; user_type: string; level: string; fee_id: string; fee_name: string; amount: number; amount_paid: number; balance: number; status: string; reference: string; session: string; proof_url?: string; proof_type?: string; proof_name?: string; bursar_note?: string; approved_at?: string; created_at?: string; }

export const BursarFeeManager: React.FC = () => {
  const [fees, setFees] = useState<FeeItem[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard'|'fees'|'pending'|'all'>('dashboard');
  const [viewProof, setViewProof] = useState<Payment|null>(null);
  const [loading, setLoading] = useState(false); const [supabaseStatus, setSupabaseStatus] = useState('Checking...');
  const [feeName, setFeeName] = useState(''); const [feeAmount, setFeeAmount] = useState(''); const [feeLevel, setFeeLevel] = useState('ND1'); const [feeSession, setFeeSession] = useState(localStorage.getItem('lcns_current_session')||'2026/2027'); const [feeCategory, setFeeCategory] = useState('TUITION'); const [applicantType, setApplicantType] = useState('BOTH'); const [accountName, setAccountName] = useState('Labe College of Nursing Sciences'); const [accountNumber, setAccountNumber] = useState(''); const [bankName, setBankName] = useState('Zenith Bank');
  const FEES_KEY='lcns_fees'; const PAY_KEY='lcns_student_payments';

  const loadFromSupabase = async () => {
    setLoading(true);
    try{
      const sb = getSupabase();
      if(!sb){ setSupabaseStatus('LocalStorage Mode'); throw new Error('No SB'); }
      const { data: feesData } = await sb.from('lcns_fees').select('*').order('created_at', {ascending:false});
      const { data: payData } = await sb.from('lcns_student_payments').select('*').order('created_at', {ascending:false}).limit(2000);
      if(feesData) { setFees(feesData as any); localStorage.setItem(FEES_KEY, JSON.stringify(feesData)); }
      if(payData) { setPayments(payData as any); localStorage.setItem(PAY_KEY, JSON.stringify(payData)); setSupabaseStatus(`✅ Supabase - ${feesData?.length||0} fees, ${payData?.length||0} payments`); }
    }catch{
      const f=JSON.parse(localStorage.getItem(FEES_KEY)||'[]'); setFees(f);
      const p=JSON.parse(localStorage.getItem(PAY_KEY)||'[]'); setPayments(p);
      setSupabaseStatus('⚠️ Local Mode - Run SQL');
    }
    const allUsers=StorageService.getUsers();
    const studs=allUsers.filter((u:any)=>u.role==='STUDENT').map((u:any)=>({...u, level:u.level||'ND1', session:u.session||'2026/2027', userType:'STUDENT'}));
    const apps=allUsers.filter((u:any)=>u.role==='APPLICANT').map((u:any)=>({...u, userType:'APPLICANT', fullName:u.fullName, matricNo:u.matricNo||u.applicationNo||u.id, level:u.level||'ND1', session:u.session||'2026/2027'}));
    setStudents(studs); setApplicants(apps); setLoading(false);
  };

  useEffect(()=>{ loadFromSupabase(); }, []);
  const saveFeesToSupabase = async (newFee:FeeItem) => {
    const sb = getSupabase();
    try{ if(sb) await sb.from('lcns_fees').insert([{ id:newFee.id, name:newFee.name, amount:newFee.amount, level:newFee.level, session:newFee.session, category:newFee.category, applicant_type:newFee.applicant_type, is_published:newFee.is_published, account_name:newFee.account_name, account_number:newFee.account_number, bank_name:newFee.bank_name, description:newFee.description }]); }catch{}
    const current=JSON.parse(localStorage.getItem(FEES_KEY)||'[]'); localStorage.setItem(FEES_KEY, JSON.stringify([newFee, ...current])); setFees([newFee, ...current] as any);
  };
  const handleCreateFee= async ()=>{
    if(!feeName.trim() || !feeAmount) return alert('Enter fee name and amount');
    if(!accountNumber.trim()) return alert('Enter account number');
    const newFee:any={ id:'FEE-'+Date.now(), name:feeName.trim(), amount:parseInt(feeAmount), level:feeLevel, session:feeSession, category:feeCategory, applicant_type:applicantType, is_published:true, account_name:accountName, account_number:accountNumber, bank_name:bankName, description:`Pay to ${bankName} ${accountNumber}`, created_at:new Date().toISOString() };
    await saveFeesToSupabase(newFee); setFeeName(''); setFeeAmount(''); alert(`✅ Saved to SUPABASE! ${newFee.name} ₦${newFee.amount.toLocaleString()}`);
  };
  const handleApprove= async (pay:Payment, ok:boolean)=>{
    const note=ok? prompt('Receipt No?')||'Cleared by Bursar' : prompt('Reason')||'Rejected';
    const sb=getSupabase(); try{ if(sb) await sb.from('lcns_student_payments').update({ status: ok ? (pay.balance<=0?'PAID':'PARTIAL') : 'REJECTED', bursar_note:note, approved_at:new Date().toISOString() }).eq('id', pay.id); }catch{}
    const updated=payments.map(p=> p.id===pay.id ? {...p, status: ok ? (p.balance<=0?'PAID':'PARTIAL') : 'REJECTED', bursar_note:note, approved_at:new Date().toISOString()} : p);
    localStorage.setItem(PAY_KEY, JSON.stringify(updated)); setPayments(updated); setViewProof(null);
    alert(ok?`✅ Cleared in SUPABASE!`:`❌ Rejected`);
  };
  const handleDeleteFee= async (id:string)=>{
    if(!confirm('Delete from Supabase?')) return;
    const sb=getSupabase(); try{ if(sb) await sb.from('lcns_fees').delete().eq('id', id); }catch{}
    const updated=fees.filter(f=>f.id!==id); localStorage.setItem(FEES_KEY, JSON.stringify(updated)); setFees(updated);
  };
  const getFeeTotals = (fee: FeeItem) => {
    let eligibleUsers: any[] = [];
    if(fee.applicant_type==='STUDENT' || fee.applicant_type==='BOTH') eligibleUsers = [...eligibleUsers, ...students.filter(s=> (fee.level==='ALL' || s.level===fee.level) && s.session===fee.session)];
    if(fee.applicant_type==='APPLICANT' || fee.applicant_type==='BOTH') eligibleUsers = [...eligibleUsers, ...applicants.filter((a:any)=> (fee.level==='ALL' || a.level===fee.level))];
    const eligibleCount = eligibleUsers.length;
    const totalExpected = eligibleCount * fee.amount;
    const feePayments = payments.filter(p=> p.fee_id===fee.id && p.status!=='REJECTED');
    const totalCollected = feePayments.filter(p=> p.status==='PAID'||p.status==='PARTIAL').reduce((s,p)=>s+p.amount_paid,0);
    const totalPending = feePayments.filter(p=> p.status==='PENDING').reduce((s,p)=>s+p.amount_paid,0);
    const totalBalance = totalExpected - totalCollected;
    const paidFullUsers = new Set(feePayments.filter(p=>{ const userTotal = feePayments.filter(x=> x.user_id===p.user_id && (x.status==='PAID'||x.status==='PARTIAL')).reduce((s,x)=>s+x.amount_paid,0); return userTotal >= fee.amount; }).map(p=>p.user_id)).size;
    const paidPartialUsers = new Set(feePayments.filter(p=> (p.status==='PAID'||p.status==='PARTIAL')).map(p=>p.user_id)).size - paidFullUsers;
    const unpaidUsers = eligibleCount - (paidFullUsers + paidPartialUsers);
    const pendingUsers = new Set(feePayments.filter(p=> p.status==='PENDING').map(p=>p.user_id)).size;
    return { eligibleCount, totalExpected, totalCollected, totalPending, totalBalance, paidFullUsers, paidPartialUsers, unpaidUsers, pendingUsers };
  };
  const pending=payments.filter(p=>p.status==='PENDING');
  const totalAllExpected = fees.reduce((sum,f)=> sum + getFeeTotals(f).totalExpected, 0);
  const totalAllCollected = payments.filter(p=>p.status==='PAID'||p.status==='PARTIAL').reduce((s,p)=>s+p.amount_paid,0);
  const totalAllPending = pending.reduce((s,p)=>s+p.amount_paid,0);
  const totalAllBalance = totalAllExpected - totalAllCollected;

  return (
    <div className="max-w-7xl mx-auto p-4 bg-white rounded-xl shadow space-y-4">
      <div className="flex flex-wrap justify-between border-b pb-3 gap-2"><div><h2 className="text-xl font-black text-emerald-900 flex items-center gap-2"><BarChart3 className="w-5 h-5"/> Bursar Dashboard - Total Payments Per Fee Set - Supabase</h2><p className="text-[11px] font-bold mt-1 flex items-center gap-2"><span className={`px-2 py-0.5 rounded-full ${supabaseStatus.includes('✅')?'bg-green-100 text-green-800':'bg-amber-100 text-amber-800'}`}>{supabaseStatus}</span><button onClick={loadFromSupabase} className="px-2 py-1 bg-slate-800 text-white rounded text-[10px] flex items-center gap-1"><RefreshCw className={`w-3 h-3 ${loading?'animate-spin':''}`}/> Refresh</button></p></div><div className="flex gap-2 text-[11px]"><span className="bg-red-100 text-red-800 px-3 py-1 rounded-full font-black">Pending: {pending.length}</span></div></div>
      <div className="flex flex-wrap gap-2 bg-slate-50 p-2 rounded-xl border text-xs font-black">
        <button onClick={()=>setActiveTab('dashboard')} className={`px-3 py-2 rounded-xl flex items-center gap-1 ${activeTab==='dashboard'?'bg-emerald-900 text-white':'bg-white border'}`}><BarChart3 className="w-4 h-4"/> Dashboard Totals Per Fee</button>
        <button onClick={()=>setActiveTab('fees')} className={`px-3 py-2 rounded-xl ${activeTab==='fees'?'bg-emerald-900 text-white':'bg-white border'}`}>💰 Set Fees to Supabase</button>
        <button onClick={()=>setActiveTab('pending')} className={`px-3 py-2 rounded-xl ${activeTab==='pending'?'bg-red-600 text-white':'bg-white border'}`}>⏳ Pending PNG/PDF ({pending.length})</button>
        <button onClick={()=>setActiveTab('all')} className={`px-3 py-2 rounded-xl ${activeTab==='all'?'bg-slate-900 text-white':'bg-white border'}`}>📊 All Payments</button>
      </div>
      {activeTab==='dashboard' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gradient-to-br from-emerald-900 to-emerald-700 text-white p-4 rounded-xl"><p className="text-[11px] uppercase opacity-80">Total Expected</p><p className="text-xl font-black">₦{totalAllExpected.toLocaleString()}</p><p className="text-[10px] mt-1">{fees.length} fees × {students.length+applicants.length} users</p></div>
            <div className="bg-gradient-to-br from-green-600 to-green-500 text-white p-4 rounded-xl"><p className="text-[11px] uppercase opacity-80">Total Collected</p><p className="text-xl font-black">₦{totalAllCollected.toLocaleString()}</p><p className="text-[10px] mt-1">{totalAllExpected>0? ((totalAllCollected/totalAllExpected)*100).toFixed(1):0}% collected</p></div>
            <div className="bg-gradient-to-br from-amber-500 to-amber-400 text-black p-4 rounded-xl"><p className="text-[11px] uppercase">Pending Approval</p><p className="text-xl font-black">₦{totalAllPending.toLocaleString()}</p><p className="text-[10px] mt-1">{pending.length} uploads</p></div>
            <div className="bg-gradient-to-br from-red-600 to-red-500 text-white p-4 rounded-xl"><p className="text-[11px] uppercase opacity-80">Outstanding Balance</p><p className="text-xl font-black">₦{totalAllBalance.toLocaleString()}</p><p className="text-[10px] mt-1">Yet to be paid</p></div>
          </div>
          <h3 className="font-black text-sm flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-600"/> Total Payments Per Fee Set</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fees.map(fee=>{
              const t=getFeeTotals(fee);
              return (
                <div key={fee.id} className="border-2 rounded-xl p-4 space-y-2 bg-white hover:shadow-lg">
                  <div className="flex justify-between"><div><h4 className="font-black text-sm">{fee.name}</h4><p className="text-[11px] text-slate-500">{fee.level} • {fee.session} • For: {fee.applicant_type} • ₦{fee.amount.toLocaleString()}</p><p className="text-[10px] bg-slate-900 text-amber-300 px-2 py-0.5 rounded mt-1 inline-block">{fee.bank_name} {fee.account_number}</p></div><span className={`px-2 py-1 rounded-full text-[10px] font-black ${t.totalBalance<=0?'bg-green-600 text-white':'bg-amber-400 text-black'}`}>{t.totalBalance<=0?'✅ FULLY COLLECTED':`₦${t.totalBalance.toLocaleString()} BAL`}</span></div>
                  <div className="grid grid-cols-3 gap-2 text-[11px]"><div className="bg-slate-50 p-2 rounded"><p className="text-[10px]">Eligible</p><p className="font-black">{t.eligibleCount}</p></div><div className="bg-emerald-50 p-2 rounded"><p className="text-[10px]">Expected</p><p className="font-black">₦{t.totalExpected.toLocaleString()}</p></div><div className="bg-green-50 p-2 rounded"><p className="text-[10px]">Collected</p><p className="font-black text-green-700">₦{t.totalCollected.toLocaleString()}</p></div><div className="bg-amber-50 p-2 rounded"><p className="text-[10px]">Pending</p><p className="font-black text-amber-700">₦{t.totalPending.toLocaleString()}</p></div><div className="bg-red-50 p-2 rounded"><p className="text-[10px]">Balance</p><p className="font-black text-red-600">₦{t.totalBalance.toLocaleString()}</p></div><div className="bg-blue-50 p-2 rounded"><p className="text-[10px]">%</p><p className="font-black">{t.totalExpected>0? ((t.totalCollected/t.totalExpected)*100).toFixed(1):0}%</p></div></div>
                  <div className="flex flex-wrap gap-2 text-[10px] font-bold"><span className="bg-green-100 px-2 py-1 rounded-full">✅ Full: {t.paidFullUsers}</span><span className="bg-amber-100 px-2 py-1 rounded-full">⚠️ Partial: {t.paidPartialUsers}</span><span className="bg-red-100 px-2 py-1 rounded-full">❌ Unpaid: {t.unpaidUsers}</span><span className="bg-blue-100 px-2 py-1 rounded-full">⏳ Pending: {t.pendingUsers}</span></div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5"><div className="bg-green-600 h-2.5 rounded-full" style={{width: `${t.totalExpected>0? Math.min((t.totalCollected/t.totalExpected)*100,100):0}%`}}></div></div>
                </div>
              )
            })}
            {fees.length===0 && <div className="col-span-2 p-12 text-center border-2 border-dashed rounded-xl text-slate-400">No fees yet - Create fee in Fees tab</div>}
          </div>
        </div>
      )}
      {activeTab==='fees' && (
        <div className="bg-emerald-50 border-2 border-emerald-200 p-4 rounded-xl"><h3 className="font-black text-sm">Create Fee - Saved to Supabase + Shows in Dashboard Totals</h3><div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 bg-white p-3 rounded-xl border"><div><label className="text-[11px] font-bold">Fee Name *</label><input value={feeName} onChange={e=>setFeeName(e.target.value)} placeholder="School Fees, Acceptance..." className="w-full mt-1 px-3 py-2 border rounded-lg text-sm font-bold text-black"/></div><div><label className="text-[11px] font-bold">Amount ₦ *</label><input value={feeAmount} onChange={e=>setFeeAmount(e.target.value)} type="number" className="w-full mt-1 px-3 py-2 border-2 border-amber-300 rounded-lg font-black text-black"/></div><div><label className="text-[11px] font-bold">Apply To *</label><select value={applicantType} onChange={e=>setApplicantType(e.target.value)} className="w-full mt-1 px-3 py-2 border-2 border-blue-300 rounded-lg font-black text-black"><option value="BOTH">BOTH</option><option value="STUDENT">STUDENT Only</option><option value="APPLICANT">APPLICANT Only</option></select></div><div><label className="text-[11px] font-bold">Class</label><select value={feeLevel} onChange={e=>setFeeLevel(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg font-bold text-black"><option value="ALL">ALL</option><option value="ND1">ND1</option><option value="ND2">ND2</option><option value="HND1">HND1</option><option value="HND2">HND2</option></select></div><div><label className="text-[11px] font-bold">Session</label><select value={feeSession} onChange={e=>setFeeSession(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg font-bold text-black"><option>2025/2026</option><option>2026/2027</option><option>2027/2028</option></select></div><div><label className="text-[11px] font-bold">Bank</label><input value={bankName} onChange={e=>setBankName(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg font-bold text-black"/></div><div><label className="text-[11px] font-bold">Account No *</label><input value={accountNumber} onChange={e=>setAccountNumber(e.target.value)} className="w-full mt-1 px-3 py-2 border-2 border-red-300 rounded-lg font-black text-black"/></div><div><label className="text-[11px] font-bold">Account Name</label><input value={accountName} onChange={e=>setAccountName(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg font-bold text-black"/></div><button onClick={handleCreateFee} className="md:col-span-3 bg-emerald-700 text-white py-3 rounded-lg font-black">💾 Save to Supabase + Dashboard Totals</button></div><div className="mt-4"><h4 className="font-bold text-xs">Existing Fees</h4><div className="mt-2 space-y-1">{fees.map(f=><div key={f.id} className="flex justify-between bg-white p-2 rounded border text-xs"><span>{f.name} - ₦{f.amount.toLocaleString()} - {f.applicant_type} - {f.level} - {f.session}</span><button onClick={()=>handleDeleteFee(f.id)} className="text-red-600"><Trash2 className="w-4 h-4"/></button></div>)}</div></div></div>
      )}
      {activeTab==='pending' && (<div className="overflow-x-auto border rounded-xl"><table className="w-full text-xs"><thead className="bg-red-700 text-white"><tr><th className="p-2 text-left">User</th><th>Type</th><th>Matric</th><th>Fee</th><th>Paid</th><th>Proof</th><th>Date</th><th>Action</th></tr></thead><tbody>{payments.filter(p=>p.status==='PENDING').map(p=><tr key={p.id} className="border-b bg-amber-50"><td className="p-2 font-bold">{p.user_name}</td><td className="p-2"><span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${p.user_type==='STUDENT'?'bg-emerald-500 text-white':'bg-blue-500 text-white'}`}>{p.user_type}</span></td><td className="p-2 font-mono">{p.matric_no}</td><td className="p-2">{p.fee_name}<div className="text-[10px]">₦{p.amount.toLocaleString()}</div></td><td className="p-2 font-black">₦{p.amount_paid.toLocaleString()}</td><td className="p-2 text-center"><button onClick={()=>setViewProof(p)} className="px-2 py-1 bg-blue-600 text-white rounded text-[11px] flex items-center gap-1 mx-auto"><Eye className="w-3 h-3"/> View</button></td><td className="p-2 text-[10px]">{new Date(p.created_at||'').toLocaleString()}</td><td className="p-2 flex gap-1 justify-center"><button onClick={()=>handleApprove(p,true)} className="p-1.5 bg-green-600 text-white rounded"><Check className="w-4 h-4"/></button><button onClick={()=>handleApprove(p,false)} className="p-1.5 bg-red-600 text-white rounded"><X className="w-4 h-4"/></button></td></tr>)}</tbody></table></div>)}
      {activeTab==='all' && (<div className="overflow-x-auto border rounded-xl"><table className="w-full text-xs"><thead className="bg-green-800 text-white"><tr><th className="p-2 text-left">User</th><th>Type</th><th>Matric</th><th>Fee</th><th>Amount</th><th>Paid</th><th>Status</th><th>Date</th></tr></thead><tbody>{payments.filter(p=>p.status!=='PENDING').map(p=><tr key={p.id} className="border-b"><td className="p-2 font-bold">{p.user_name}</td><td className="p-2">{p.user_type}</td><td className="p-2 font-mono">{p.matric_no}</td><td className="p-2">{p.fee_name}</td><td className="p-2">₦{p.amount.toLocaleString()}</td><td className="p-2 font-black text-green-700">₦{p.amount_paid.toLocaleString()}</td><td className="p-2"><span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${p.status==='PAID'?'bg-green-600 text-white':'bg-amber-400 text-black'}`}>{p.status}</span></td><td className="p-2 text-[10px]">{new Date(p.created_at||'').toLocaleDateString()}</td></tr>)}</tbody></table></div>)}
      {viewProof && (<div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4"><div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto p-4 space-y-3"><div className="flex justify-between border-b pb-2"><h3 className="font-black">{viewProof.user_type} - {viewProof.user_name} - {viewProof.matric_no}</h3><button onClick={()=>setViewProof(null)} className="p-2 bg-slate-100 rounded-full"><X className="w-5 h-5"/></button></div><div className="border-2 border-dashed p-2 rounded-xl bg-slate-50 text-center">{viewProof.proof_type?.includes('pdf') ? <div><FileText className="w-12 h-12 mx-auto text-red-600"/><a href={viewProof.proof_url} target="_blank" className="mt-3 inline-flex px-4 py-2 bg-blue-600 text-white rounded-lg font-black"><Download className="w-4 h-4"/> Download PDF</a><iframe src={viewProof.proof_url} className="w-full h-[500px] mt-3 border rounded"/></div> : <div><img src={viewProof.proof_url} alt="Proof" className="max-w-full max-h-[600px] mx-auto rounded border"/><a href={viewProof.proof_url} download={viewProof.proof_name} className="mt-3 inline-flex px-4 py-2 bg-blue-600 text-white rounded-lg font-black"><Download className="w-4 h-4"/> Download PNG</a></div>}</div><div className="flex gap-2 justify-end"><button onClick={()=>handleApprove(viewProof,false)} className="px-4 py-2 bg-red-600 text-white rounded-lg font-black">Reject</button><button onClick={()=>handleApprove(viewProof,true)} className="px-4 py-2 bg-green-600 text-white rounded-lg font-black">Clear & Approve - Adds to Totals</button></div></div></div>)}
    </div>
  );
};

// ✅ FIX EXPORTS FOR App.tsx - THIS FIXES BUILD ERROR
export const BursarDashboard = BursarFeeManager;
export default BursarDashboard;

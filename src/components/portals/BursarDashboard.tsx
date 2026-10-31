import React, { useState, useEffect } from 'react';
import { supabase, getSupabase } from '../../lib/supabase';
import { StorageService } from '../../services/storage';
import { COLLEGE_CONFIG } from '../../types';

interface FeeItem { name: string; amount: number; }
interface FeeConfig {
  id: string; name: string; amount: number; type: 'APPLICATION' | 'SCREENING' | 'INTERVIEW' | 'SCHOOL';
  bank: string; accountName: string; accountNumber: string;
  level?: string; session?: string; semester?: 'FIRST' | 'SECOND' | 'SESSION';
  items?: FeeItem[];
  nonRefundableNote?: string;
}
interface StudentUser { id: string; fullName: string; matricNumber: string; level: string; sex: string; stateOfOrigin: string; lga: string; staffImage: string; department: string; phone: string; email: string; created_by: string; }

const SCHOOL_LOGO = "https://liqwfikatnkndbdbdarx.supabase.co/storage/v1/object/public/school-assets/logo-main-1792311488006.jpg";
const SUPABASE_URL = "https://liqwfikatnkndbdbdarx.supabase.co";
const BUCKET = "lcns-files";

export const BursarFeeManager: React.FC = () => {
  const [tab, setTab] = useState<'students' | 'application_fee' | 'screening_fee' | 'cleared' | 'all' | 'set_fees' | 'manual_pay'>('students');
  const [applicants, setApplicants] = useState<any[]>([]);
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [search, setSearch] = useState('');
  const [searchStudent, setSearchStudent] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);
  const [fetchError, setFetchError] = useState('');
  const [manualMatric, setManualMatric] = useState('');
  const [manualLevel, setManualLevel] = useState('ND1');
  const [manualSemester, setManualSemester] = useState<'FIRST'|'SECOND'|'SESSION'>('SESSION');
  const [manualFeeType, setManualFeeType] = useState<'SCHOOL'|'APPLICATION'|'SCREENING'|'INTERVIEW'>('SCHOOL');

  const [fees, setFees] = useState<FeeConfig[]>(() => {
    const saved = localStorage.getItem('lcns_fee_config_v3');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'app', name: 'Application Form Fee', amount: 10000, type: 'APPLICATION', bank: 'Zenith Bank', accountName: 'Labe College of Nursing Sciences', accountNumber: '1018894231', nonRefundableNote: 'Non-Refundable', items: [{name:'Form Fee', amount:10000}] },
      { id: 'screen', name: 'Screening & CBT Fee', amount: 15000, type: 'SCREENING', bank: 'Zenith Bank', accountName: 'Labe College of Nursing Sciences', accountNumber: '1018894231', nonRefundableNote: 'Non-Refundable', items: [{name:'CBT Fee', amount:8000},{name:'Screening Fee', amount:7000}] },
      { id: 'interview', name: 'Interview Fee', amount: 5000, type: 'INTERVIEW', bank: 'Zenith Bank', accountName: 'Labe College of Nursing Sciences', accountNumber: '1018894231', nonRefundableNote: 'Non-Refundable', items: [{name:'Interview Fee', amount:5000}] },
      { id: 'nd1_first', name: 'ND1 First Semester', amount: 95000, type: 'SCHOOL', bank: 'Zenith Bank', accountName: 'Labe College of Nursing Sciences', accountNumber: '1018894231', level: 'ND1', session: '2026/2027', semester: 'FIRST', items: [{name:'Tuition', amount:50000},{name:'ICT Fee', amount:10000},{name:'Exam Fee', amount:15000},{name:'Clinical Fee', amount:15000},{name:'ID Card', amount:5000}], nonRefundableNote: 'ICT & Exam Fee Non-Refundable' },
      { id: 'nd1_second', name: 'ND1 Second Semester', amount: 65000, type: 'SCHOOL', bank: 'Zenith Bank', accountName: 'Labe College of Nursing Sciences', accountNumber: '1018894231', level: 'ND1', session: '2026/2027', semester: 'SECOND', items: [{name:'Tuition', amount:40000},{name:'Exam Fee', amount:15000},{name:'Lab Fee', amount:10000}], nonRefundableNote: 'Exam Fee Non-Refundable' },
      { id: 'nd1_session', name: 'ND1 Full Session Total', amount: 160000, type: 'SCHOOL', bank: 'Zenith Bank', accountName: 'Labe College of Nursing Sciences', accountNumber: '1018894231', level: 'ND1', session: '2026/2027', semester: 'SESSION', items: [{name:'First Semester', amount:95000},{name:'Second Semester', amount:65000}], nonRefundableNote: 'Total Session Fee' },
    ];
  });

  const saveFees = (nf: FeeConfig[]) => { setFees(nf); localStorage.setItem('lcns_fee_config_v3', JSON.stringify(nf)); localStorage.setItem('lcns_fee_config_v2', JSON.stringify(nf)); };

  const currentUser = (() => { try { return StorageService.getCurrentUser() || { fullName: 'Bursar', email: 'bursar@lcns.edu.ng' }; } catch { return { fullName: 'Bursar', email: 'bursar@lcns.edu.ng' }; } })();
  const bursarName = (currentUser?.fullName || 'BURSAR').toString().toUpperCase();
  const bursarEmail = (currentUser as any)?.email || 'bursar@lcns.edu.ng';
  const currentSession = localStorage.getItem('lcns_current_session') || COLLEGE_CONFIG.CURRENT_SESSION || '2026/2027';

  const buildUrl = (raw: string) => {
    if (!raw) return "";
    if (raw.startsWith("http") || raw.startsWith("data:")) return raw;
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${raw.replace(/^\//, "")}`;
  };

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('lcns_applicants').select('*').order('created_at', { ascending: false }).limit(200);
      if (error) throw error;
      setApplicants(data || []);
    } catch (e: any) {
      setFetchError(e.message);
    }
    try {
      const sb = getSupabase();
      const { data: usersData } = await sb!.from('users').select('*').eq('role', 'STUDENT').order('created_at', { ascending: false });
      if (usersData) {
        const mapped = usersData.map((u: any) => ({
          id: u.id, fullName: u.full_name || u.fullName, matricNumber: u.matric_no || u.matricnumber || u.matricNumber || '', level: u.level || 'ND1',
          sex: u.sex || '', stateOfOrigin: u.state_of_origin || '', lga: u.lga || '', staffImage: u.staff_image || '', department: u.department || 'Nursing', phone: u.phone || '', email: u.email || '', created_by: u.created_by || 'ADMIN'
        }));
        setStudents(mapped);
      }
    } catch {}
    try { const p = JSON.parse(localStorage.getItem('lcns_school_fees_payments') || '[]'); setPayments(p); } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const hasPaid = (matric: string) => { return payments.find((p: any) => p.matric_no === matric); };

  const printReceiptWithBursar = (payment: any, studentOrApp: any, feeConfig: FeeConfig) => {
    const win = window.open('', '_blank'); if (!win) return;
    const itemsHtml = (feeConfig.items || [{name: feeConfig.name, amount: feeConfig.amount}]).map((it:any)=>`<tr><td style="padding:6px;border:1px solid #ccc;">${it.name}</td><td style="padding:6px;border:1px solid #ccc;text-align:right;font-weight:800;">₦${it.amount.toLocaleString()}</td></tr>`).join('');
    const photo = studentOrApp.staffImage || studentOrApp.photo_url || studentOrApp.passport_url || '';
    const photoHtml = photo ? `<img src="${buildUrl(photo)}" style="width:100px;height:120px;object-fit:cover;border:3px solid #0a4d2e;border-radius:10px;" />` : `<div style="width:100px;height:120px;background:#eee;border:2px dashed #999;display:flex;align-items:center;justify-content:center;font-size:10px;">NO PHOTO</div>`;

    win.document.write(`<html><head><title>${payment.receipt_no}</title><style>
      @page{size:A4 portrait;margin:10mm} body{font-family:Arial,sans-serif;margin:0;background:#f8fafc} .receipt{max-width:800px;margin:20px auto;background:white;border:3px solid #0a4d2e;border-radius:16px;overflow:hidden}
      .header{background:linear-gradient(135deg,#0a4d2e,#064e3b);color:white;padding:18px;text-align:center} .header-top{display:flex;justify-content:space-between;align-items:center} .logo-img{width:75px;height:75px;background:white;border-radius:50%;padding:5px;object-fit:contain}
      .college-info h1{font-size:19px;font-weight:900;margin:0} .college-info h2{font-size:12px;color:#fbbf24;margin:2px 0} .college-info p{font-size:10px;margin:1px 0}
      .badge{background:rgba(0,0,0,0.3);padding:6px 14px;border-radius:20px;font-size:11px;font-weight:900;margin-top:8px;display:inline-block}
      .body{padding:20px} .receipt-bar{background:#0a4d2e;color:white;padding:10px 15px;border-radius:10px;display:flex;justify-content:space-between;font-size:11px;font-weight:900}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:15px 0} .field{background:#f8fafc;border:1px solid #e2e8f0;padding:10px;border-radius:8px} .field-label{font-size:9px;font-weight:900;color:#64748b;text-transform:uppercase} .field-value{font-size:12px;font-weight:800}
      .amount-box{background:#f0fdf4;border:2px solid #0a4d2e;border-radius:12px;padding:12px;text-align:center;margin:15px 0} .amount{font-size:26px;font-weight:900;color:#0a4d2e}
      .footer{display:flex;justify-content:space-between;margin-top:20px;border-top:2px dashed #e2e8f0;padding-top:15px} .sig{width:160px;text-align:center;font-size:10px} .sig-line{border-top:1.5px solid #000;margin-top:40px;padding-top:5px;font-weight:700}
      @media print{button{display:none}}
    </style></head><body><div class="receipt">
      <div class="header">
        <div class="header-top">
          <img src="${SCHOOL_LOGO}" class="logo-img" />
          <div class="college-info">
            <h1>Labe College of Nursing Sciences, Gboko</h1>
            <h2>Catholic Diocese of Gboko, Benue State</h2>
            <p>Motto: Knowledge, Faith & Service | Accredited by NMCN & NBTE</p>
          </div>
          <img src="${SCHOOL_LOGO}" class="logo-img" />
        </div>
        <div class="badge">OFFICIAL RECEIPT - ${feeConfig.type} FEE - BURSARY - ${payment.session || currentSession}</div>
      </div>
      <div class="body">
        <div class="receipt-bar"><span>Receipt No: ${payment.receipt_no}</span><span>Date: ${new Date(payment.created_at).toLocaleString()}</span><span>Bursar: ${bursarName}</span></div>
        <div style="display:flex;gap:15px;margin-top:15px;">
          <div style="flex:1">
            <div class="grid">
              <div class="field"><div class="field-label">Student Full Name</div><div class="field-value" style="text-transform:uppercase;font-size:13px;">${payment.user_name}</div></div>
              <div class="field"><div class="field-label">Matric No</div><div class="field-value" style="font-family:monospace;color:#0a4d2e">${payment.matric_no}</div></div>
              <div class="field"><div class="field-label">Level</div><div class="field-value">${payment.level}</div></div>
              <div class="field"><div class="field-label">Session / Semester</div><div class="field-value">${payment.session} - ${payment.semester}</div></div>
              <div class="field"><div class="field-label">Payment Type</div><div class="field-value">${feeConfig.name}</div></div>
              <div class="field"><div class="field-label">Bursar Full Name</div><div class="field-value" style="color:#0a4d2e">${bursarName}</div></div>
            </div>
            <table style="width:100%;border-collapse:collapse;margin:10px 0;font-size:12px;"><tr style="background:#0a4d2e;color:white;"><th style="padding:6px;text-align:left;">Fee Breakdown</th><th style="padding:6px;text-align:right;">Amount</th></tr>${itemsHtml}<tr style="background:#f0fdf4;font-weight:900;"><td style="padding:8px;border:1px solid #0a4d2e;">TOTAL</td><td style="padding:8px;border:1px solid #0a4d2e;text-align:right;">₦${payment.amount.toLocaleString()}</td></tr></table>
            <div class="amount-box"><div class="amount">₦${payment.amount.toLocaleString()}</div><div style="font-size:10px;font-weight:700;">Status: ${payment.status} | Bursar: ${bursarName}</div></div>
          </div>
          <div style="width:120px;text-align:center;"><div style="font-size:9px;font-weight:900;">Photo</div><div style="margin-top:5px;">${photoHtml}</div></div>
        </div>
        <div style="text-align:center;margin-top:15px;"><button onclick="window.print()" style="background:#0a4d2e;color:white;padding:10px 24px;border-radius:20px;border:none;font-weight:900;cursor:pointer;">🖨️ Print Receipt</button></div>
      </div>
    </div></body></html>`);
    win.document.close();
  };

  const handlePay = async (studentOrApp: any, feeConfig: FeeConfig, sem: 'FIRST'|'SECOND'|'SESSION' = 'SESSION') => {
    const matric = studentOrApp.matricNumber || studentOrApp.matric_no || studentOrApp.application_number || manualMatric || `LCNS/ND/2026/001`;
    const name = studentOrApp.fullName || studentOrApp.full_name || studentOrApp.user_name || 'Student';
    const level = studentOrApp.level || manualLevel || feeConfig.level || 'ND1';
    if (!confirm(`Pay ${feeConfig.name}?\nName: ${name}\nMatric: ${matric}\nAmount: ₦${feeConfig.amount.toLocaleString()}\nSemester: ${sem}\nBursar: ${bursarName}`)) return;
    const receiptNo = `LCNS/${feeConfig.type}/${sem}/${new Date().getFullYear()}/${matric.replace(/\//g,'-')}/${Date.now().toString().slice(-5)}`;
    const payment = { id: Date.now().toString(), user_name: name, matric_no: matric, level: level, session: currentSession, semester: sem, fee_name: feeConfig.name, amount: feeConfig.amount, status: 'PAID', receipt_no: receiptNo, payment_type: feeConfig.type, bursar_name: bursarName, bursar_email: bursarEmail, created_at: new Date().toISOString(), items: feeConfig.items, bank: feeConfig.bank, accountName: feeConfig.accountName, accountNumber: feeConfig.accountNumber };
    const updated = [payment, ...payments]; setPayments(updated); localStorage.setItem('lcns_school_fees_payments', JSON.stringify(updated));
    try { await supabase.from('school_fees_payments').insert(payment); } catch {}
    alert(`✅ Paid by Bursar ${bursarName}\nReceipt: ${receiptNo}`);
    printReceiptWithBursar(payment, studentOrApp, feeConfig);
  };

  const currentList = tab==='application_fee' ? applicants.filter(a=>a.bursar_status!=='CLEARED') : tab==='screening_fee' ? applicants.filter(a=>a.proof_url) : tab==='cleared' ? applicants.filter(a=>a.bursar_status==='CLEARED') : applicants;
  const filteredApplicants = currentList.filter(a=>!search || `${a.application_number} ${a.full_name}`.toLowerCase().includes(search.toLowerCase()));
  const filteredStudents = students.filter(s=>!searchStudent || `${s.fullName} ${s.matricNumber} ${s.level}`.toLowerCase().includes(searchStudent.toLowerCase()));

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Bursar...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 bg-white rounded-2xl shadow space-y-4 border">
      <div className="bg-gradient-to-r from-emerald-950 to-slate-900 text-white rounded-2xl p-5 flex justify-between">
        <div><h2 className="text-xl font-black uppercase">Bursar Dashboard - Bursar: {bursarName}</h2><p className="text-xs text-emerald-200">Students: {students.length} - Only Students, Matric, Level — Session: {currentSession}</p></div>
        <button onClick={load} className="px-4 py-2 bg-amber-400 text-slate-900 rounded-xl font-black text-xs">Refresh</button>
      </div>

      <div className="flex flex-wrap gap-2 text-xs font-black">
        <button onClick={()=>setTab('students')} className={`px-4 py-2.5 rounded-xl ${tab==='students'?'bg-[#0a4d2e] text-white ring-2 ring-amber-300':'bg-emerald-50 border-2 border-emerald-400'}`}>🎓 Students {students.length} - Matric + Level</button>
        <button onClick={()=>setTab('application_fee')} className={`px-4 py-2.5 rounded-xl ${tab==='application_fee'?'bg-blue-700 text-white':'bg-blue-50 border'}`}>📄 App Fee Pending</button>
        <button onClick={()=>setTab('screening_fee')} className={`px-4 py-2.5 rounded-xl ${tab==='screening_fee'?'bg-amber-600 text-white':'bg-amber-50 border'}`}>🧾 Screening Pending</button>
        <button onClick={()=>setTab('cleared')} className={`px-4 py-2.5 rounded-xl ${tab==='cleared'?'bg-emerald-700 text-white':'bg-emerald-50 border'}`}>✅ Cleared</button>
        <button onClick={()=>setTab('set_fees')} className={`px-4 py-2.5 rounded-xl ${tab==='set_fees'?'bg-slate-900 text-white ring-2':'bg-white border-2 border-slate-900'}`}>⚙️ Set Fees + Account</button>
        <button onClick={()=>setTab('manual_pay')} className={`px-4 py-2.5 rounded-xl ${tab==='manual_pay'?'bg-purple-700 text-white':'bg-purple-50 border-2 border-purple-400'}`}>💰 Manual Pay by Matric</button>
      </div>

      {/* ===== NEW: STUDENTS TAB - ONLY STUDENTS, LEVEL AND MATRIC ===== */}
      {tab==='students' && (
        <div className="bg-white rounded-2xl border-4 border-emerald-400 p-5 space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-3">
            <div>
              <h3 className="font-black text-lg flex gap-2">🎓 Students List - {filteredStudents.length} - Only Matric + Level</h3>
              <p className="text-xs font-bold bg-green-50 border border-green-300 p-2 rounded mt-1">Bursar sees ONLY: Full Name + Matric Number (LCNS/ND/2026/001) + Level (ND1/ND2) + Phone + Email — No Password — For Fees Collection</p>
            </div>
            <input value={searchStudent} onChange={e=>setSearchStudent(e.target.value)} placeholder="Search Name, Matric LCNS/ND/2026/001, Level ND1" className="border-2 px-4 py-2.5 rounded-xl text-sm font-bold w-full md:w-80"/>
          </div>
          <div className="overflow-x-auto border-2 rounded-xl">
            <table className="w-full text-xs">
              <thead className="bg-[#0a4d2e] text-white"><tr><th className="p-3 text-left">Full Name</th><th className="p-3 text-left">Matric Number - LCNS/ND/2026/001</th><th className="p-3 text-center">Level</th><th className="p-3 text-left">Phone / Email</th><th className="p-3 text-center">Fee Status</th><th className="p-3 text-center">Action</th></tr></thead>
              <tbody>
                {filteredStudents.map((s)=>(
                  <tr key={s.id} className="border-b hover:bg-emerald-50">
                    <td className="p-3 font-black">{s.fullName}</td>
                    <td className="p-3 font-mono font-black text-amber-800 bg-amber-50 rounded">{s.matricNumber || '-'}</td>
                    <td className="p-3 text-center"><span className="px-3 py-1 rounded-full text-[11px] font-black bg-yellow-300 text-black">{s.level}</span></td>
                    <td className="p-3"><div className="font-bold text-[11px]">{s.email}</div><div className="font-mono text-[11px]">{s.phone}</div><div className="text-[10px]">{s.sex} {s.stateOfOrigin}/{s.lga}</div></td>
                    <td className="p-3 text-center">{hasPaid(s.matricNumber) ? <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black">PAID - {hasPaid(s.matricNumber)?.receipt_no?.slice(-5)}</span> : <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-black">NOT PAID</span>}</td>
                    <td className="p-3 text-center"><button onClick={()=>{ const fee=getFeeForLevel(s.level); handlePay(s, fee as any, 'SESSION'); }} className="px-3 py-1.5 bg-[#0a4d2e] text-white rounded-lg text-[11px] font-black">Pay Fee</button></td>
                  </tr>
                ))}
                {filteredStudents.length===0 && <tr><td colSpan={6} className="p-8 text-center font-bold">No students found — Create students from Admin — LCNS/ND/2026/001 format</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab==='set_fees' && (
        <div className="bg-slate-50 border-2 p-5 rounded-2xl space-y-4">
          <h3 className="font-black uppercase">⚙️ Set Fees - With Account Details + Breakdown</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {fees.map((f, idx)=>(
              <div key={f.id} className="bg-white p-4 rounded-xl border-2 space-y-3">
                <div className="flex justify-between"><span className="text-[11px] font-black uppercase bg-[#0a4d2e] text-white px-2 py-1 rounded">{f.type} - {f.semester} - {f.level}</span><button onClick={()=>{ const nf=fees.filter(x=>x.id!==f.id); saveFees(nf); }} className="text-[10px] bg-red-100 text-red-600 px-2 rounded">Delete</button></div>
                <input value={f.name} onChange={e=>{ const nf=[...fees]; nf[idx].name=e.target.value; saveFees(nf); }} className="w-full border px-3 py-2 rounded-lg text-sm font-bold"/>
                <div className="grid grid-cols-2 gap-2"><input type="number" value={f.amount} onChange={e=>{ const nf=[...fees]; nf[idx].amount=parseInt(e.target.value)||0; saveFees(nf); }} className="border-2 border-amber-400 px-3 py-2 rounded-xl font-black"/><select value={f.type} onChange={e=>{ const nf=[...fees]; nf[idx].type=e.target.value as any; saveFees(nf); }} className="border px-2 py-2 rounded-xl text-xs font-bold"><option>APPLICATION</option><option>SCREENING</option><option>INTERVIEW</option><option>SCHOOL</option></select></div>
                <div className="grid grid-cols-3 gap-2"><input value={f.bank} onChange={e=>{ const nf=[...fees]; nf[idx].bank=e.target.value; saveFees(nf); }} className="border px-2 py-2 rounded-lg text-[11px]" placeholder="Bank"/><input value={f.accountName} onChange={e=>{ const nf=[...fees]; nf[idx].accountName=e.target.value; saveFees(nf); }} className="border px-2 py-2 rounded-lg text-[11px]" placeholder="Account Name"/><input value={f.accountNumber} onChange={e=>{ const nf=[...fees]; nf[idx].accountNumber=e.target.value; saveFees(nf); }} className="border px-2 py-2 rounded-lg text-[11px] font-mono" placeholder="Account No"/></div>
              </div>
            ))}
          </div>
          <button onClick={()=>{ const id=`fee_${Date.now()}`; const nf=[...fees, {id, name:'New Fee', amount:0, type:'SCHOOL' as any, bank:'Zenith Bank', accountName:'Labe College', accountNumber:'1018894231', level:'ND1', session:'2026/2027', semester:'FIRST' as any, items:[{name:'Tuition', amount:0}]}]; saveFees(nf); }} className="w-full py-3 bg-[#0a4d2e] text-white rounded-xl font-black">+ Create New Fee</button>
        </div>
      )}

      {tab==='manual_pay' && (
        <div className="bg-purple-50 border-2 border-purple-400 p-5 rounded-2xl space-y-4">
          <h3 className="font-black uppercase">💰 Manual Payment - Bursar: {bursarName}</h3>
          <div className="grid md:grid-cols-4 gap-3">
            <input value={manualMatric} onChange={e=>setManualMatric(e.target.value)} placeholder="Matric e.g. LCNS/ND/2026/001" className="border-2 px-3 py-3 rounded-xl font-mono text-sm"/>
            <select value={manualLevel} onChange={e=>setManualLevel(e.target.value)} className="border-2 px-3 py-3 rounded-xl"><option>ND1</option><option>ND2</option><option>HND1</option><option>HND2</option></select>
            <select value={manualSemester} onChange={e=>setManualSemester(e.target.value as any)} className="border-2 px-3 py-3 rounded-xl"><option value="FIRST">First Semester</option><option value="SECOND">Second Semester</option><option value="SESSION">Full Session</option></select>
            <select value={manualFeeType} onChange={e=>setManualFeeType(e.target.value as any)} className="border-2 px-3 py-3 rounded-xl"><option value="SCHOOL">School Fees</option><option value="APPLICATION">Application</option><option value="SCREENING">Screening</option><option value="INTERVIEW">Interview</option></select>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            {fees.filter(f=>f.type===manualFeeType).map(f=>(
              <div key={f.id} className="bg-white p-3 rounded-xl border-2 flex justify-between items-center"><div><div className="font-black text-sm">{f.name}</div><div className="text-xs">₦{f.amount.toLocaleString()} - {f.level}</div></div><button onClick={()=>handlePay({matricNumber: manualMatric, fullName: manualMatric, level: manualLevel}, f, manualSemester)} className="px-4 py-2 bg-[#0a4d2e] text-white rounded-xl font-black text-xs">Pay</button></div>
            ))}
          </div>
        </div>
      )}

      {tab!=='set_fees' && tab!=='manual_pay' && tab!=='students' && (
        <>
          <div className="flex gap-2"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Applicant" className="flex-1 border-2 px-4 py-2.5 rounded-xl text-sm font-bold"/><button onClick={load} className="px-4 py-2 bg-slate-800 text-white rounded-xl font-black text-xs">Refresh</button></div>
          <div className="overflow-x-auto bg-white rounded-xl border-2">
            <table className="w-full text-xs">
              <thead className="bg-[#0a4d2e] text-white"><tr><th className="p-3 text-left">Passport</th><th className="p-3 text-left">Full Name</th><th className="p-3">Application / Matric</th><th className="p-3">Fee Type</th><th className="p-3">Status</th><th className="p-3">Action</th></tr></thead>
              <tbody>
                {filteredApplicants.map((a:any)=>{
                  const photo = buildUrl(a.photo_url || a.passport_url || '');
                  return (
                    <tr key={a.id} className="border-b hover:bg-slate-50">
                      <td className="p-2">{photo ? <img src={photo} className="w-12 h-12 rounded-lg object-cover border" /> : <div className="w-12 h-12 bg-slate-200 rounded-lg" />}</td>
                      <td className="p-3"><div className="font-black uppercase text-[13px]">{a.full_name}</div><div className="text-[11px]">{a.phone}</div></td>
                      <td className="p-3 font-mono font-bold text-xs">{a.application_number}</td>
                      <td className="p-3"><span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-black">SCREENING</span></td>
                      <td className="p-3"><span className={`px-2 py-1 rounded-full text-[10px] font-black ${a.bursar_status==='CLEARED'?'bg-emerald-100 text-emerald-700':'bg-amber-100 text-amber-700'}`}>{a.bursar_status || a.status}</span></td>
                      <td className="p-3"><button onClick={()=>{ setSelected(a); setShowModal(true); }} className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[11px] font-bold">View & Clear</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showModal && selected && (
        <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto p-5">
            <div className="flex justify-between"><h3 className="font-black">{selected.full_name} - {selected.application_number}</h3><button onClick={()=>setShowModal(false)} className="bg-slate-100 px-3 py-1 rounded">X</button></div>
            <div className="mt-4 flex gap-2">
              <button onClick={async()=>{ await supabase.from('lcns_applicants').update({bursar_status:'CLEARED', status:'BURSAR_CLEARED'}).eq('id', selected.id); alert('Cleared by '+bursarName); load(); setShowModal(false); }} className="px-5 py-3 bg-emerald-600 text-white rounded-xl font-black">Clear by {bursarName}</button>
              <button onClick={async()=>{ await supabase.from('lcns_applicants').update({bursar_status:'CLEARED', status:'ADMITTED', admission_status:'ADMITTED'}).eq('id', selected.id); alert('Cleared + Admitted'); load(); setShowModal(false); }} className="px-5 py-3 bg-[#0a4d2e] text-amber-300 rounded-xl font-black">Clear + Admit</button>
            </div>
            {selected.proof_url && <img src={buildUrl(selected.proof_url)} className="mt-4 w-full max-h-[400px] object-contain border rounded-xl" />}
          </div>
        </div>
      )}
    </div>
  );

  const getFeeForLevel = (level: string) => { return fees.find(f=>f.level===level && f.type==='SCHOOL') || fees.find(f=>f.type==='SCHOOL') || { amount: 150000, name: `${level} Fees`, bank: 'Zenith Bank', accountName: 'Labe College', accountNumber: '1018894231' } as FeeConfig; };
};
export const BursarDashboard = BursarFeeManager;
export default BursarDashboard;

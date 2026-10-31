import React, { useState, useEffect } from 'react';
import { supabase, getSupabase } from '../../lib/supabase';
import { StorageService } from '../../services/storage';
import { COLLEGE_CONFIG } from '../../types';

interface FeeItem { name: string; amount: number; }
interface FeeConfig {
  id: string; name: string; amount: number; type: 'APPLICATION' | 'SCREENING' | 'INTERVIEW' | 'SCHOOL';
  bank: string; accountName: string; accountNumber: string;
  level?: string; session?: string; semester?: 'FIRST' | 'SECOND' | 'SESSION';
  items?: FeeItem[]; // for breakdown like ICT, Exam, etc
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
  const [selectedStudent, setSelectedStudent] = useState<StudentUser | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showStudentPayModal, setShowStudentPayModal] = useState(false);
  const [modalType, setModalType] = useState<'APPLICATION' | 'SCREENING' | 'INTERVIEW'>('APPLICATION');
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
  const currentSemester = localStorage.getItem('lcns_current_semester') || 'First Semester';

  const buildUrl = (raw: string) => {
    if (!raw) return "";
    if (raw.startsWith("http") || raw.startsWith("data:")) return raw;
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${raw.replace(/^\//, "")}`;
  };

  const load = async () => {
    setLoading(true);
    try {
      // FIX: real table is lcns_applicants, not college_applications
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
          id: u.id, fullName: u.full_name || u.fullName, matricNumber: u.matric_no || u.matricNumber || '', level: u.level || 'ND1',
          sex: u.sex || '', stateOfOrigin: u.state_of_origin || '', lga: u.lga || '', staffImage: u.staff_image || '', department: u.department || 'Nursing', phone: u.phone || '', email: u.email || '', created_by: u.created_by || 'ADMIN'
        }));
        setStudents(mapped);
      }
    } catch {}
    try { const p = JSON.parse(localStorage.getItem('lcns_school_fees_payments') || '[]'); setPayments(p); } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const getFeeForLevel = (level: string, semester: 'FIRST'|'SECOND'|'SESSION' = 'SESSION', type: FeeConfig['type'] = 'SCHOOL') => {
    if (type !== 'SCHOOL') return fees.find(f=>f.type===type) || fees[0];
    return fees.find(f=>f.level===level && f.semester===semester && f.type==='SCHOOL') || fees.find(f=>f.level===level && f.type==='SCHOOL') || { amount: 150000, name: `${level} Fees`, bank: 'Zenith Bank', accountName: 'Labe College', accountNumber: '1018894231', items: [{name:'School Fee', amount:150000}] } as FeeConfig;
  };

  const hasPaid = (matric: string, level: string, session: string, sem?: string) => {
    return payments.find((p: any) => p.matric_no === matric && p.session === session && (sem ? p.semester===sem : true));
  };

  // === RECEIPT TEMPLATE WITH BURSAR FULL NAME + ACCOUNT + LOGO + CATHOLIC DIOCESE ===
  const printReceiptWithBursar = (payment: any, studentOrApp: any, feeConfig: FeeConfig) => {
    const win = window.open('', '_blank'); if (!win) return;
    const itemsHtml = (feeConfig.items || [{name: feeConfig.name, amount: feeConfig.amount}]).map((it:any)=>`<tr><td style="padding:6px;border:1px solid #ccc;">${it.name}</td><td style="padding:6px;border:1px solid #ccc;text-align:right;font-weight:800;">₦${it.amount.toLocaleString()}</td></tr>`).join('');
    const photo = studentOrApp.staffImage || studentOrApp.photo_url || studentOrApp.passport_url || '';
    const photoHtml = photo ? `<img src="${buildUrl(photo)}" style="width:100px;height:120px;object-fit:cover;border:3px solid #0a4d2e;border-radius:10px;" />` : `<div style="width:100px;height:120px;background:#eee;border:2px dashed #999;display:flex;align-items:center;justify-content:center;font-size:10px;">NO PHOTO</div>`;

    win.document.write(`<html><head><title>${payment.receipt_no}</title><style>
      @page{size:A4 portrait;margin:10mm} body{font-family:Arial,sans-serif;margin:0;background:#f8fafc} .receipt{max-width:800px;margin:20px auto;background:white;border:3px solid #0a4d2e;border-radius:16px;overflow:hidden}
      .header{background:linear-gradient(135deg,#0a4d2e,#064e3b);color:white;padding:18px;text-align:center;position:relative}
      .header-top{display:flex;justify-content:space-between;align-items:center} .logo-img{width:75px;height:75px;background:white;border-radius:50%;padding:5px;object-fit:contain}
      .college-info h1{font-size:19px;font-weight:900;margin:0;text-transform:uppercase} .college-info h2{font-size:12px;color:#fbbf24;margin:2px 0} .college-info p{font-size:10px;margin:1px 0}
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
            <p>Km 2, Gboko-Aliade Road, P.M.B. 101, Gboko | info@labecollege.edu.ng</p>
          </div>
          <img src="${SCHOOL_LOGO}" class="logo-img" />
        </div>
        <div class="badge">OFFICIAL RECEIPT - ${feeConfig.type} FEE - BURSARY DEPARTMENT - ${payment.session || currentSession}</div>
      </div>
      <div class="body">
        <div class="receipt-bar"><span>Receipt No: ${payment.receipt_no}</span><span>Date: ${new Date(payment.created_at).toLocaleString()}</span><span>Bursar: ${bursarName}</span></div>
        <div style="display:flex;gap:15px;margin-top:15px;">
          <div style="flex:1">
            <div class="grid">
              <div class="field"><div class="field-label">Student / Applicant Full Name</div><div class="field-value" style="text-transform:uppercase;font-size:13px;">${payment.user_name}</div></div>
              <div class="field"><div class="field-label">Matric / Application No</div><div class="field-value" style="font-family:monospace;color:#0a4d2e">${payment.matric_no}</div></div>
              <div class="field"><div class="field-label">Level / Program</div><div class="field-value">${payment.level}</div></div>
              <div class="field"><div class="field-label">Session / Semester</div><div class="field-value">${payment.session} - ${payment.semester || manualSemester}</div></div>
              <div class="field"><div class="field-label">Payment Type</div><div class="field-value">${feeConfig.name}</div></div>
              <div class="field"><div class="field-label">Bursar Full Name (Responsible)</div><div class="field-value" style="color:#0a4d2e">${bursarName} - ${bursarEmail}</div></div>
            </div>
            <div style="background:#fffbeb;border:1px solid #fbbf24;border-radius:8px;padding:8px;font-size:11px;margin:10px 0;">
              <b>Bank Details:</b> ${feeConfig.bank} | <b>Account Name:</b> ${feeConfig.accountName} | <b>Account No:</b> ${feeConfig.accountNumber} | <b>Note:</b> ${feeConfig.nonRefundableNote || 'Non-Refundable'}
            </div>
            <table style="width:100%;border-collapse:collapse;margin:10px 0;font-size:12px;"><tr style="background:#0a4d2e;color:white;"><th style="padding:6px;text-align:left;">Fee Breakdown</th><th style="padding:6px;text-align:right;">Amount</th></tr>${itemsHtml}<tr style="background:#f0fdf4;font-weight:900;"><td style="padding:8px;border:1px solid #0a4d2e;">TOTAL - ${payment.semester || 'SESSION'}</td><td style="padding:8px;border:1px solid #0a4d2e;text-align:right;">₦${payment.amount.toLocaleString()}</td></tr></table>
            <div class="amount-box"><div style="font-size:10px;font-weight:900;text-transform:uppercase;color:#0a4d2e;">Amount Paid & Verified by Bursar</div><div class="amount">₦${payment.amount.toLocaleString()}</div><div style="font-size:10px;font-weight:700;">Status: ${payment.status} | Balance: ₦${payment.balance || 0} | ${feeConfig.nonRefundableNote || ''}</div></div>
          </div>
          <div style="width:120px;text-align:center;"><div style="font-size:9px;font-weight:900;">Photo</div><div style="margin-top:5px;">${photoHtml}</div></div>
        </div>
        <div class="footer">
          <div class="sig"><div style="font-size:8px;text-transform:uppercase;color:#64748b;font-weight:900;">Bursar Signature & Stamp</div><div class="sig-line">${bursarName}<br/>Bursar - LCNS<br/>${new Date().toLocaleDateString()}</div></div>
          <div class="sig"><div style="width:80px;height:80px;border:2px dashed #0a4d2e;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto;font-size:9px;font-weight:900;color:#0a4d2e">LCNS<br/>SEAL</div></div>
          <div class="sig"><div style="font-size:8px;text-transform:uppercase;color:#64748b;font-weight:900;">Student Signature</div><div class="sig-line">${payment.user_name}<br/>${payment.matric_no}</div></div>
        </div>
        <div style="text-align:center;margin-top:15px;" class="no-print"><button onclick="window.print()" style="background:#0a4d2e;color:white;padding:10px 24px;border-radius:20px;border:none;font-weight:900;cursor:pointer;">🖨️ Print Receipt - Bursar: ${bursarName}</button></div>
      </div>
    </div></body></html>`);
    win.document.close();
  };

  const handlePay = async (studentOrApp: any, feeConfig: FeeConfig, sem: 'FIRST'|'SECOND'|'SESSION' = 'SESSION') => {
    const matric = studentOrApp.matricNumber || studentOrApp.matric_no || studentOrApp.application_number || studentOrApp.form_no || manualMatric || `LCNS/${feeConfig.level || 'ND1'}/${new Date().getFullYear()}/0001`;
    const name = studentOrApp.fullName || studentOrApp.full_name || studentOrApp.user_name || 'Student';
    const level = studentOrApp.level || manualLevel || feeConfig.level || 'ND1';
    if (!confirm(`Pay ${feeConfig.name}?\nName: ${name}\nMatric: ${matric}\nAmount: ₦${feeConfig.amount.toLocaleString()}\nSemester: ${sem}\nBursar: ${bursarName}`)) return;
    const receiptNo = `LCNS/${feeConfig.type}/${sem}/${new Date().getFullYear()}/${matric.replace(/\//g,'-')}/${Date.now().toString().slice(-5)}`;
    const payment = {
      id: Date.now().toString(), user_name: name, matric_no: matric, level: level, session: currentSession, semester: sem, fee_name: feeConfig.name, amount: feeConfig.amount, amount_paid: feeConfig.amount, status: 'PAID', receipt_no: receiptNo, payment_type: feeConfig.type, balance: 0, bursar_name: bursarName, bursar_email: bursarEmail, created_at: new Date().toISOString(), items: feeConfig.items, bank: feeConfig.bank, accountName: feeConfig.accountName, accountNumber: feeConfig.accountNumber
    };
    const updated = [payment, ...payments];
    setPayments(updated);
    localStorage.setItem('lcns_school_fees_payments', JSON.stringify(updated));
    try { await supabase.from('school_fees_payments').insert(payment); } catch {}
    alert(`✅ Paid by Bursar ${bursarName}\nReceipt: ${receiptNo}`);
    printReceiptWithBursar(payment, studentOrApp, feeConfig);
    setShowStudentPayModal(false);
  };

  const currentList = tab==='application_fee' ? applicants.filter(a=>a.bursar_status!=='CLEARED') : tab==='screening_fee' ? applicants.filter(a=>a.proof_url) : tab==='cleared' ? applicants.filter(a=>a.bursar_status==='CLEARED') : applicants;
  const filteredApplicants = currentList.filter(a=>!search || `${a.application_number} ${a.full_name}`.toLowerCase().includes(search.toLowerCase()));
  const filteredStudents = students.filter(s=>!searchStudent || `${s.fullName} ${s.matricNumber}`.toLowerCase().includes(searchStudent.toLowerCase()));

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Bursar...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 bg-white rounded-2xl shadow space-y-4 border">
      <div className="bg-gradient-to-r from-emerald-950 to-slate-900 text-white rounded-2xl p-5 flex justify-between">
        <div><h2 className="text-xl font-black uppercase">Bursar Dashboard - Bursar: {bursarName}</h2><p className="text-xs text-emerald-200">All receipts will show Bursar full name, Catholic Diocese of Gboko, Benue State | Account details on receipt | Session: {currentSession}</p></div>
        <button onClick={load} className="px-4 py-2 bg-amber-400 text-slate-900 rounded-xl font-black text-xs">Refresh</button>
      </div>

      <div className="flex flex-wrap gap-2 text-xs font-black">
        <button onClick={()=>setTab('students')} className={`px-4 py-2.5 rounded-xl ${tab==='students'?'bg-[#0a4d2e] text-white ring-2':'bg-emerald-50 border'}`}>🎓 Students {students.length}</button>
        <button onClick={()=>setTab('application_fee')} className={`px-4 py-2.5 rounded-xl ${tab==='application_fee'?'bg-blue-700 text-white':'bg-blue-50 border'}`}>📄 App Fee Pending</button>
        <button onClick={()=>setTab('screening_fee')} className={`px-4 py-2.5 rounded-xl ${tab==='screening_fee'?'bg-amber-600 text-white':'bg-amber-50 border'}`}>🧾 Screening Pending</button>
        <button onClick={()=>setTab('cleared')} className={`px-4 py-2.5 rounded-xl ${tab==='cleared'?'bg-emerald-700 text-white':'bg-emerald-50 border'}`}>✅ Cleared</button>
        <button onClick={()=>setTab('set_fees')} className={`px-4 py-2.5 rounded-xl ${tab==='set_fees'?'bg-slate-900 text-white ring-2':'bg-white border-2 border-slate-900'}`}>⚙️ Set Fees + Account</button>
        <button onClick={()=>setTab('manual_pay')} className={`px-4 py-2.5 rounded-xl ${tab==='manual_pay'?'bg-purple-700 text-white':'bg-purple-50 border-2 border-purple-400'}`}>💰 Manual Pay by Matric</button>
      </div>

      {tab==='set_fees' && (
        <div className="bg-slate-50 border-2 p-5 rounded-2xl space-y-4">
          <h3 className="font-black uppercase">⚙️ Set Fees - With Account Details + Breakdown + Non-Refundable + Semester/Session</h3>
          <p className="text-xs font-bold text-slate-600">Bursar can create ICT fee, Exam fee, etc. They sum to total. Set First Semester, Second Semester, Session Total. All receipts show Bursar full name: {bursarName}</p>
          <div className="grid md:grid-cols-2 gap-4">
            {fees.map((f, idx)=>(
              <div key={f.id} className="bg-white p-4 rounded-xl border-2 space-y-3">
                <div className="flex justify-between"><span className="text-[11px] font-black uppercase bg-[#0a4d2e] text-white px-2 py-1 rounded">{f.type} - {f.semester || 'N/A'} - {f.level || 'ALL'}</span><button onClick={()=>{ const nf=fees.filter(x=>x.id!==f.id); saveFees(nf); }} className="text-[10px] bg-red-100 text-red-600 px-2 rounded">Delete</button></div>
                <input value={f.name} onChange={e=>{ const nf=[...fees]; nf[idx].name=e.target.value; saveFees(nf); }} className="w-full border px-3 py-2 rounded-lg text-sm font-bold" placeholder="Fee Name e.g. ND1 First Semester"/>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" value={f.amount} onChange={e=>{ const nf=[...fees]; nf[idx].amount=parseInt(e.target.value)||0; saveFees(nf); }} className="border-2 border-amber-400 px-3 py-2 rounded-xl font-black text-lg" placeholder="Total Amount"/>
                  <select value={f.type} onChange={e=>{ const nf=[...fees]; nf[idx].type=e.target.value as any; saveFees(nf); }} className="border px-2 py-2 rounded-xl text-xs font-bold"><option>APPLICATION</option><option>SCREENING</option><option>INTERVIEW</option><option>SCHOOL</option></select>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <select value={f.level||''} onChange={e=>{ const nf=[...fees]; nf[idx].level=e.target.value; saveFees(nf); }} className="border px-2 py-2 rounded-lg text-xs"><option value="">ALL Level</option><option>ND1</option><option>ND2</option><option>HND1</option><option>HND2</option></select>
                  <select value={f.semester||'SESSION'} onChange={e=>{ const nf=[...fees]; nf[idx].semester=e.target.value as any; saveFees(nf); }} className="border px-2 py-2 rounded-lg text-xs"><option>FIRST</option><option>SECOND</option><option>SESSION</option></select>
                  <input value={f.session||'2026/2027'} onChange={e=>{ const nf=[...fees]; nf[idx].session=e.target.value; saveFees(nf); }} className="border px-2 py-2 rounded-lg text-xs" placeholder="Session"/>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input value={f.bank} onChange={e=>{ const nf=[...fees]; nf[idx].bank=e.target.value; saveFees(nf); }} className="border px-2 py-2 rounded-lg text-[11px]" placeholder="Bank Name"/>
                  <input value={f.accountName} onChange={e=>{ const nf=[...fees]; nf[idx].accountName=e.target.value; saveFees(nf); }} className="border px-2 py-2 rounded-lg text-[11px]" placeholder="Account Name"/>
                  <input value={f.accountNumber} onChange={e=>{ const nf=[...fees]; nf[idx].accountNumber=e.target.value; saveFees(nf); }} className="border px-2 py-2 rounded-lg text-[11px] font-mono" placeholder="Account Number"/>
                </div>
                <input value={f.nonRefundableNote||''} onChange={e=>{ const nf=[...fees]; nf[idx].nonRefundableNote=e.target.value; saveFees(nf); }} className="w-full border px-2 py-1 rounded text-[11px]" placeholder="Non-Refundable Note e.g. ICT Fee Non-Refundable"/>
                <div className="space-y-1">
                  <div className="flex justify-between items-center"><span className="text-[10px] font-black">Breakdown Items (ICT, Exam, etc) - Auto Total</span><button onClick={()=>{ const nf=[...fees]; nf[idx].items=[...(nf[idx].items||[]), {name:'New Fee', amount:0}]; const total=nf[idx].items!.reduce((s,i)=>s+i.amount,0); nf[idx].amount=total; saveFees(nf); }} className="text-[10px] bg-emerald-600 text-white px-2 py-1 rounded">+ Add ICT/Exam Fee</button></div>
                  {(f.items||[]).map((it, j)=>(
                    <div key={j} className="flex gap-2"><input value={it.name} onChange={e=>{ const nf=[...fees]; nf[idx].items![j].name=e.target.value; saveFees(nf); }} className="flex-1 border px-2 py-1 rounded text-xs" placeholder="Fee Name e.g. ICT Fee"/><input type="number" value={it.amount} onChange={e=>{ const nf=[...fees]; nf[idx].items![j].amount=parseInt(e.target.value)||0; nf[idx].amount=nf[idx].items!.reduce((s,x)=>s+x.amount,0); saveFees(nf); }} className="w-24 border px-2 py-1 rounded text-xs font-bold" /><button onClick={()=>{ const nf=[...fees]; nf[idx].items=nf[idx].items!.filter((_,k)=>k!==j); nf[idx].amount=nf[idx].items!.reduce((s,x)=>s+x.amount,0); saveFees(nf); }} className="text-red-500 text-xs">x</button></div>
                  ))}
                  <div className="text-xs font-black">Total: ₦{f.amount.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={()=>{ const id=`fee_${Date.now()}`; const nf=[...fees, {id, name:'New Fee', amount:0, type:'SCHOOL' as any, bank:'Zenith Bank', accountName:'Labe College of Nursing Sciences', accountNumber:'1018894231', level:'ND1', session:'2026/2027', semester:'FIRST' as any, items:[{name:'Tuition', amount:0}], nonRefundableNote:'Non-Refundable'}]; saveFees(nf); }} className="w-full py-3 bg-[#0a4d2e] text-white rounded-xl font-black">+ Create New Fee (ICT, Exam, Interview etc)</button>
        </div>
      )}

      {tab==='manual_pay' && (
        <div className="bg-purple-50 border-2 border-purple-400 p-5 rounded-2xl space-y-4">
          <h3 className="font-black uppercase">💰 Manual Payment - Enter Matric / Level / Pay by Bursar: {bursarName}</h3>
          <div className="grid md:grid-cols-4 gap-3">
            <input value={manualMatric} onChange={e=>setManualMatric(e.target.value)} placeholder="Enter Matric or App No e.g. LCNS/ND1/2026/0001" className="border-2 px-3 py-3 rounded-xl font-mono text-sm"/>
            <select value={manualLevel} onChange={e=>setManualLevel(e.target.value)} className="border-2 px-3 py-3 rounded-xl"><option>ND1</option><option>ND2</option><option>HND1</option><option>HND2</option></select>
            <select value={manualSemester} onChange={e=>setManualSemester(e.target.value as any)} className="border-2 px-3 py-3 rounded-xl"><option value="FIRST">First Semester</option><option value="SECOND">Second Semester</option><option value="SESSION">Full Session Total</option></select>
            <select value={manualFeeType} onChange={e=>setManualFeeType(e.target.value as any)} className="border-2 px-3 py-3 rounded-xl"><option value="SCHOOL">School Fees</option><option value="APPLICATION">Application Fee</option><option value="SCREENING">Screening Fee</option><option value="INTERVIEW">Interview Fee</option></select>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            {fees.filter(f=>f.type===manualFeeType && (f.type!=='SCHOOL' || f.level===manualLevel) && (f.type!=='SCHOOL' || f.semester===manualSemester || manualFeeType!=='SCHOOL')).map(f=>(
              <div key={f.id} className="bg-white p-3 rounded-xl border-2 flex justify-between items-center">
                <div><div className="font-black text-sm">{f.name}</div><div className="text-xs">₦{f.amount.toLocaleString()} - {f.semester} - {f.level}</div><div className="text-[10px] text-slate-500">{f.bank} {f.accountNumber}</div></div>
                <button onClick={()=>handlePay({matricNumber: manualMatric, fullName: manualMatric ? `Student ${manualMatric}` : 'Manual Student', level: manualLevel}, f, manualSemester)} className="px-4 py-2 bg-[#0a4d2e] text-white rounded-xl font-black text-xs">Pay ₦{f.amount.toLocaleString()}</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab!=='set_fees' && tab!=='manual_pay' && (
        <>
          <div className="flex gap-2"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Full Name, Form No, Date" className="flex-1 border-2 px-4 py-2.5 rounded-xl text-sm font-bold uppercase"/><button onClick={load} className="px-4 py-2 bg-slate-800 text-white rounded-xl font-black text-xs">Refresh</button></div>
          <div className="overflow-x-auto bg-white rounded-xl border-2">
            <table className="w-full text-xs">
              <thead className="bg-[#0a4d2e] text-white"><tr><th className="p-3 text-left">Passport</th><th className="p-3 text-left">Full Name + Date & Time</th><th className="p-3">Application / Matric</th><th className="p-3">Fee Type</th><th className="p-3">Status</th><th className="p-3">Action by Bursar</th></tr></thead>
              <tbody>
                {filteredApplicants.map((a:any)=>{
                  const photo = buildUrl(a.photo_url || a.passport_url || '');
                  const dateObj = a.created_at ? new Date(a.created_at) : new Date();
                  const dateTime = `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString()}`;
                  return (
                    <tr key={a.id} className="border-b hover:bg-slate-50">
                      <td className="p-2">{photo ? <img src={photo} className="w-12 h-12 rounded-lg object-cover border" /> : <div className="w-12 h-12 bg-slate-200 rounded-lg" />}</td>
                      <td className="p-3"><div className="font-black uppercase text-[13px]">{a.full_name}</div><div className="text-[11px] bg-slate-100 px-2 py-1 rounded-full inline-block mt-1">{dateTime}</div><div className="text-[11px] text-slate-500">{a.phone}</div></td>
                      <td className="p-3 font-mono font-bold text-xs">{a.application_number}</td>
                      <td className="p-3"><span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-black">SCREENING ₦{fees.find(f=>f.type==='SCREENING')?.amount.toLocaleString()}</span></td>
                      <td className="p-3"><span className={`px-2 py-1 rounded-full text-[10px] font-black ${a.bursar_status==='CLEARED'?'bg-emerald-100 text-emerald-700':'bg-amber-100 text-amber-700'}`}>{a.bursar_status || a.status}</span></td>
                      <td className="p-3"><button onClick={()=>{ setSelected(a); setShowModal(true); }} className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[11px] font-bold">View & Clear by {bursarName}</button></td>
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
            <p className="text-xs">Date: {selected.created_at ? new Date(selected.created_at).toLocaleString() : ''} | Bursar: {bursarName}</p>
            <div className="mt-4 flex gap-2">
              <button onClick={async()=>{ await supabase.from('lcns_applicants').update({bursar_status:'CLEARED', status:'BURSAR_CLEARED'}).eq('id', selected.id); alert('Cleared by '+bursarName); load(); setShowModal(false); }} className="px-5 py-3 bg-emerald-600 text-white rounded-xl font-black">Clear by {bursarName}</button>
              <button onClick={async()=>{ await supabase.from('lcns_applicants').update({bursar_status:'CLEARED', status:'ADMITTED', admission_status:'ADMITTED'}).eq('id', selected.id); alert('Cleared + Admitted by '+bursarName); load(); setShowModal(false); }} className="px-5 py-3 bg-[#0a4d2e] text-amber-300 rounded-xl font-black">Clear + Admit by {bursarName}</button>
            </div>
            {selected.proof_url && <img src={buildUrl(selected.proof_url)} className="mt-4 w-full max-h-[400px] object-contain border rounded-xl" />}
          </div>
        </div>
      )}
    </div>
  );
};
export const BursarDashboard = BursarFeeManager;
export default BursarDashboard;

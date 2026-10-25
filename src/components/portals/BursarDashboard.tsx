import React, { useState, useEffect } from 'react';
import { getSupabase } from '../../lib/supabase';
import { StorageService } from '../../services/storage';
import { COLLEGE_CONFIG } from '../../types';
import { CollegeLogo } from '../common/CollegeLogo';
import { ApiService } from '../../services/api'; // ADDED

interface FeeItem { id: string; name: string; amount: number; level: string; session: string; category: string; applicant_type: string; account_number: string; bank_name: string; created_at: string; }
interface Payment { id: string; user_name: string; matric_no: string; user_type: string; fee_name: string; amount: number; amount_paid: number; status: string; proof_url?: string; created_at?: string; academic_year?: string; semester?: string; level?: string; bursar_name?: string; bursar_email?: string; payment_type?: string; balance?: number; receipt_no?: string; }

export const BursarFeeManager: React.FC = () => {
  const [fees, setFees] = useState<FeeItem[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tab, setTab] = useState('dashboard');
  const [feeName, setFeeName] = useState(''); const [feeAmount, setFeeNameAmount] = useState(''); const [accNo, setAccNo] = useState(''); const [bank, setBank] = useState('Zenith Bank'); const [applyTo, setApplyTo] = useState('BOTH'); const [level, setLevel] = useState('ND1');

  // ADDED - APPLICANTS STATE FOR BURSAR
  const [applicants, setApplicants] = useState<any[]>([]);
  const [searchApplicant, setSearchApplicant] = useState('');

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
  const currentUser = safeCurrentUser || { fullName: 'Bursar - LCNS', email: 'bursar@lcns.edu.ng', role: 'BURSAR' };
  const bursarDisplayName = (currentUser?.fullName || currentUser?.full_name || 'Bursar - LCNS').toString().toUpperCase();
  const bursarEmail = currentUser?.email || 'bursar@lcns.edu.ng';

  const [manualMatric, setManualMatric] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualFeeId, setManualFeeId] = useState('');
  const [manualAmountPaid, setManualAmountPaid] = useState('');
  const [manualSession, setManualSession] = useState(localStorage.getItem('lcns_current_session') || '2026/2027');
  const [manualSemester, setManualSemester] = useState('First Semester');
  const [manualLevel, setManualLevel] = useState('ND1');
  const [lastReceipt, setLastReceipt] = useState<Payment | null>(null);
  const [searchStudent, setSearchStudent] = useState('');

  const allUsersRaw = (() => { try { return JSON.parse(localStorage.getItem('lcns_users') || '[]'); } catch { return []; } })();
  
  const allUsers = allUsersRaw.filter((u: any) => {
    const r = (u.role || '').toUpperCase();
    const isStaffRole = r.includes('STAFF') || r.includes('LECTURER') || r.includes('ADMIN') || r.includes('BURSAR') || r.includes('HOD') || r.includes('REGISTRAR') || r.includes('PROVOST') || r.includes('CHIEF') || r.includes('EXAM_OFFICER') || r.includes('LIBRARIAN');
    const isStudentRole = r.includes('STUDENT') || r === 'ND1' || r === 'ND2' || r === 'HND1' || r === 'HND2' || r.includes('ND') || r.includes('HND');
    const hasMatric = !!(u.matricNumber || u.matric_number || u.matricNo || u.matric_no || u.level);
    if (isStaffRole) return false;
    if (isStudentRole) return true;
    if (hasMatric) return true;
    return false;
  });

  const filteredStudentsForPay = allUsers.filter((u:any) => {
    if (!searchStudent) return true;
    return `${u.fullName || u.name || ''} ${u.matricNumber || u.matric_number || u.matricNo || ''} ${u.email || ''}`.toLowerCase().includes(searchStudent.toLowerCase());
  }).slice(0,20);

  // ADDED - FILTER APPLICANTS FOR BURSAR
  const filteredApplicants = applicants.filter((a:any) => {
    if (!searchApplicant) return true;
    const txt = `${a.fullName || ''} ${a.formNo || ''} ${a.email || ''} ${a.program || ''}`.toLowerCase();
    return txt.includes(searchApplicant.toLowerCase());
  });

  const load = async () => {
    const sb = getSupabase();
    try {
      if (sb) {
        const { data: f } = await sb.from('lcns_fees').select('*').order('created_at', { ascending: false });
        const { data: p } = await sb.from('lcns_student_payments').select('*').order('created_at', { ascending: false });
        if (f) setFees(f as any); 
        if (p) {
          const studentPayments = (p as any).filter((pay: any) => {
            const mt = (pay.matric_no || pay.user_type || '').toUpperCase();
            if (mt.includes('LCNS/ST/')) return false;
            if ((pay.user_type || '').toUpperCase().includes('STAFF')) return false;
            return true;
          });
          setPayments(studentPayments);
        }
      }
    } catch {}
    const lf = JSON.parse(localStorage.getItem('lcns_fees') || '[]'); if (lf.length && fees.length===0) setFees(lf);
    const lp = JSON.parse(localStorage.getItem('lcns_student_payments') || '[]'); 
    if (lp.length && payments.length===0) {
      const filtered = lp.filter((pay: any) => {
        const mt = (pay.matric_no || '').toUpperCase();
        if (mt.includes('LCNS/ST/')) return false;
        return true;
      });
      setPayments(filtered);
    }

    // ADDED - LOAD APPLICANTS FOR BURSAR
    try {
      const apps = await ApiService.getApplicants();
      console.log("Bursar loaded applicants:", apps);
      setApplicants(apps);
    } catch (e) {
      console.warn("Failed to load applicants", e);
      const localApps = JSON.parse(localStorage.getItem('lcns_applicants') || '[]');
      setApplicants(localApps);
    }
  };
  useEffect(() => { load(); }, []);

  const createFee = async () => {
    if (!feeName || !feeAmount || !accNo) return alert('Enter fee name, amount, account no');
    const nf: any = { id: 'FEE-' + Date.now(), name: feeName, amount: parseInt(feeAmount), level, session: '2026/2027', category: 'TUITION', applicant_type: applyTo, is_published: true, account_name: 'Labe College - Catholic Diocese of Gboko', account_number: accNo, bank_name: bank, description: bank + ' ' + accNo, created_at: new Date().toISOString() };
    const sb = getSupabase(); try { if (sb) await sb.from('lcns_fees').insert([nf]); } catch {}
    const cur = JSON.parse(localStorage.getItem('lcns_fees') || '[]'); localStorage.setItem('lcns_fees', JSON.stringify([nf, ...cur])); setFees([nf, ...cur]); setFeeName(''); setFeeNameAmount(''); alert('Saved to Supabase - For STUDENTS only');
  };

  const pending = payments.filter(p => p.status === 'PENDING');
  const totalExpected = fees.reduce((s, f) => s + (f.amount * 50), 0);
  const totalCollected = payments.filter(p => p.status !== 'REJECTED' && p.status !== 'PENDING').reduce((s, p) => s + p.amount_paid, 0);

  const handleManualPay = async () => {
    if (!manualMatric || !manualName || !manualFeeId || !manualAmountPaid) return alert('Fill Matric, Name, Fee, Amount Paid');
    if (manualMatric.toUpperCase().includes('LCNS/ST/')) {
      return alert('❌ BURSAR CAN ONLY RECORD STUDENT PAYMENTS! Staff ID LCNS/ST/ not allowed. Use LCNS/ND or LCNS/HND or Student Matric only.');
    }
    const feeObj = fees.find(f=>f.id===manualFeeId) || fees.find(f=>f.name===manualFeeId) || { name: manualFeeId, amount: parseInt(manualAmountPaid) } as any;
    const amount = parseInt(manualAmountPaid);
    const totalFee = (feeObj as any).amount || amount;
    const balance = Math.max(totalFee - amount, 0);
    const paymentStatus = amount >= totalFee ? 'COMPLETE PAYMENT' : amount >= totalFee/2 ? 'HALF PAYMENT - PARTIAL' : 'PART PAYMENT';
    const isComplete = amount >= totalFee;
    const receiptNo = `LCNS/RCT/${new Date().getFullYear()}/${Date.now().toString().slice(-6)}`;
    const newPay: Payment = {
      id: 'PAY-' + Date.now(), user_name: manualName.toUpperCase(), matric_no: manualMatric.toUpperCase(),
      user_type: 'STUDENT', fee_name: (feeObj as any).name, amount: totalFee, amount_paid: amount, balance,
      status: isComplete ? 'PAID' : 'PART_PAID', payment_type: paymentStatus, academic_year: manualSession,
      semester: manualSemester, level: manualLevel, bursar_name: bursarDisplayName, bursar_email: bursarEmail,
      receipt_no: receiptNo, created_at: new Date().toISOString(),
    };
    const cur = JSON.parse(localStorage.getItem('lcns_student_payments') || '[]');
    localStorage.setItem('lcns_student_payments', JSON.stringify([newPay, ...cur]));
    setPayments([newPay, ...cur]);
    const sb = getSupabase(); try { if (sb) await sb.from('lcns_student_payments').insert([newPay as any]); } catch {}
    try {
      const allPaymentsLegacy = JSON.parse(localStorage.getItem('lcns_payments') || '[]');
      allPaymentsLegacy.push({ id: newPay.id, matricOrFormNo: newPay.matric_no, feeType: newPay.fee_name, amount: newPay.amount_paid, status: 'PAID', receiptNo, rrr: receiptNo, paymentDate: new Date().toISOString(), bursarName: bursarDisplayName, academicYear: manualSession, semester: manualSemester, level: manualLevel, paymentType: paymentStatus, balance });
      localStorage.setItem('lcns_payments', JSON.stringify(allPaymentsLegacy));
    } catch {}
    setLastReceipt(newPay);
    alert(`✅ Payment Recorded by ${bursarDisplayName}! ${newPay.user_name} - ${paymentStatus} - Receipt: ${receiptNo} - Balance: ₦${balance.toLocaleString()}`);
    window.dispatchEvent(new Event('lcns_storage_update'));
  };

  const printReceipt = (pay: Payment) => {
    const win = window.open('', '_blank'); if (!win) return;
    win.document.write(`<html><head><title>Receipt ${pay.receipt_no}</title><style>body{font-family: Arial; padding:20px; } .header{text-align:center; border-bottom:4px double #0f4c2e; padding-bottom:15px;} .logo{width:80px; height:80px; background:#0f4c2e; color:#fbbf24; display:inline-flex; align-items:center; justify-content:center; border-radius:50%; font-weight:900; font-size:28px;} h1{font-size:20px; color:#0f4c2e; margin:10px 0 2px; text-transform:uppercase;} .sub{font-size:11px; color:#555;} .badge{display:inline-block; padding:4px 12px; border-radius:20px; font-size:10px; font-weight:900; margin-top:8px;} .complete{background:#0f4c2e; color:white;} .half{background:#f59e0b; color:black;} .part{background:#ef4444; color:white;} .grid{display:grid; grid-template-columns:1fr 1fr; gap:10px; margin:15px 0; background:#f8fafc; padding:15px; border-radius:12px; border:1px solid #e2e8f0;} .row{display:flex; justify-content:space-between; border-bottom:1px dashed #e2e8f0; padding:6px 0; font-size:13px;} .label{color:#64748b; font-size:11px; text-transform:uppercase; font-weight:700;} .value{font-weight:800;} .footer{margin-top:20px; display:flex; justify-content:space-between; font-size:11px;} .sig{border-top:1px solid #000; padding-top:5px; margin-top:40px; width:180px; text-align:center;} @media print{button{display:none;}}</style></head><body><div class="header"><div class="logo">LCNS</div><h1>Labe College of Nursing Sciences, Gboko</h1><div class="sub">Catholic Diocese of Gboko, Benue State | Motto: Learn, Serve & Save | www.lcns.edu.ng | info@lcns.edu.ng</div><div class="sub">Bursary Department - Official Tuition Fee Receipt - STUDENT ONLY</div><div class="badge ${pay.status==='PAID'?'complete': pay.payment_type?.includes('HALF') ? 'half' : 'part'}">${pay.payment_type || pay.status} - ${pay.status}</div></div><div style="text-align:center; margin:15px 0;"><span style="background:#0f4c2e; color:white; padding:6px 16px; border-radius:20px; font-size:12px; font-weight:900;">Receipt No: ${pay.receipt_no} | Academic Year: ${pay.academic_year} | Semester: ${pay.semester} | Level: ${pay.level}</span></div><div class="grid"><div><div class="label">Student Full Name</div><div class="value">${pay.user_name}</div></div><div><div class="label">Matriculation No</div><div class="value" style="font-family:monospace; color:#0f4c2e;">${pay.matric_no}</div></div><div><div class="label">Fee Type</div><div class="value">${pay.fee_name}</div></div><div><div class="label">Academic Session / Level</div><div class="value">${pay.academic_year} - ${pay.semester} - ${pay.level}</div></div></div><div style="border:1px solid #0f4c2e; border-radius:12px; padding:0; overflow:hidden; margin:15px 0;"><div style="display:flex; background:#0f4c2e; color:white; font-size:11px; font-weight:900; text-transform:uppercase;"><div style="flex:1; padding:10px;">Description</div><div style="width:140px; padding:10px; text-align:right;">Amount</div></div><div class="row"><span>Total Fee Amount</span><span class="value">₦${pay.amount.toLocaleString()}</span></div><div class="row"><span>Amount Paid Now</span><span class="value" style="color:#0f4c2e;">₦${pay.amount_paid.toLocaleString()}</span></div><div class="row"><span>Outstanding Balance</span><span class="value" style="color:${(pay.balance||0)===0?'#0f4c2e':'#dc2626'};">₦${(pay.balance||0).toLocaleString()} ${(pay.balance||0)===0?'(COMPLETE)':'(INCOMPLETE)'}</span></div><div class="row" style="background:#f0fdf4; font-weight:900;"><span>Payment Status</span><span>${pay.payment_type} - ${ (pay.balance||0)===0 ? 'COMPLETE PAYMENT - NO BALANCE' : pay.amount_paid >= pay.amount/2 ? 'HALF PAYMENT - ADMITTED' : 'PART PAYMENT - INCOMPLETE' }</span></div></div><div style="font-size:11px; background:#fffbeb; border:1px solid #fbbf24; padding:10px; border-radius:8px;"><b>Note:</b> This receipt is official. ${ (pay.balance||0)===0 ? 'Student has completed payment and is eligible for course registration & exam.' : 'Student has paid ' + pay.payment_type + ' - Balance ₦' + (pay.balance||0).toLocaleString() + ' must be cleared before final exam.' } </div><div class="footer"><div><div class="label">Received By (Bursar)</div><div class="value" style="margin-top:40px; border-top:1px solid #000; padding-top:5px;">${pay.bursar_name}<br/><span style="font-size:10px; font-weight:400;">${pay.bursar_email} - Bursary Dept - Catholic Diocese of Gboko - STUDENT ACCOUNTS ONLY</span></div></div><div><div class="label">Date & Time</div><div class="value" style="margin-top:40px;">${new Date(pay.created_at||'').toLocaleString()}</div></div><div><div class="label">Student Signature</div><div class="sig">Signature</div></div></div><div style="text-align:center; margin-top:25px; font-size:10px; color:#64748b;">This is a computer-generated official receipt of Labe College of Nursing Sciences, Catholic Diocese of Gboko. Verify via Bursary - ${pay.receipt_no} - STUDENT COPY</div><div style="text-align:center; margin-top:15px;"><button onclick="window.print()" style="background:#0f4c2e; color:white; padding:10px 24px; border-radius:20px; border:none; font-weight:900; cursor:pointer;">🖨️ Print Official Receipt - Catholic Diocese of Gboko</button></div></body></html>`);
    win.document.close();
  };

  return (
    <div className="max-w-7xl mx-auto p-4 bg-white rounded-xl shadow space-y-4">
      <div className="bg-gradient-to-r from-emerald-950 to-slate-900 text-white rounded-2xl p-5 flex justify-between">
        <div><h2 className="text-xl font-black">Bursar Dashboard - {bursarDisplayName} - STUDENT ACCOUNTS ONLY</h2><p className="text-xs text-emerald-200">{bursarEmail} - Catholic Diocese of Gboko - Only Student Payments - No Staff - {bursarDisplayName} as Cashier - Students: {allUsers.length} | Applicants: {applicants.length}</p></div>
        <div className="text-right"><p className="text-[10px] text-amber-300">Academic Session</p><p className="font-black text-amber-400">{COLLEGE_CONFIG.CURRENT_SESSION}</p></div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs font-bold">
        <button onClick={() => setTab('dashboard')} className={`px-3 py-2 rounded-xl ${tab==='dashboard'?'bg-emerald-900 text-white':'bg-white border'}`}>Dashboard Totals Per Fee (Students Only)</button>
        <button onClick={() => setTab('applicants')} className={`px-3 py-2 rounded-xl ${tab==='applicants'?'bg-purple-700 text-white ring-2':'bg-purple-50 border-2 border-purple-400 text-purple-800'}`}>🎓 Applicants - Bursar Verify - {applicants.length} Found</button>
        <button onClick={() => setTab('fees')} className={`px-3 py-2 rounded-xl ${tab==='fees'?'bg-emerald-900 text-white':'bg-white border'}`}>Set Fees to Supabase (Students)</button>
        <button onClick={() => setTab('manual_pay')} className={`px-3 py-2 rounded-xl ${tab==='manual_pay'?'bg-blue-700 text-white ring-2 ring-blue-300 animate-pulse':'bg-blue-50 border-2 border-blue-400 text-blue-800'}`}>💰 Manual Pay Student + Print Receipt - {bursarDisplayName}</button>
        <button onClick={() => setTab('pending')} className={`px-3 py-2 rounded-xl ${tab==='pending'?'bg-red-600 text-white':'bg-white border'}`}>Pending PNG/PDF Student Only ({pending.length})</button>
        <button onClick={load} className="px-3 py-2 bg-slate-800 text-white rounded-xl">Refresh Student + Applicant Records</button>
      </div>

      {tab==='applicants' && (
        <div className="space-y-3 bg-purple-50 border-2 border-purple-300 p-4 rounded-2xl">
          <h3 className="font-black text-purple-900">🎓 BURSAR - APPLICANT VERIFICATION - {applicants.length} Applications - From college_applications table</h3>
          <div className="flex gap-2">
            <input value={searchApplicant} onChange={e=>setSearchApplicant(e.target.value)} placeholder="Search Applicant - Form No / Name / Email" className="flex-1 border-2 border-purple-300 px-4 py-2 rounded-xl text-sm font-bold"/>
            <button onClick={load} className="px-4 py-2 bg-purple-700 text-white rounded-xl font-black">Reload</button>
          </div>
          <div className="overflow-x-auto bg-white rounded-xl border">
            <table className="w-full text-xs">
              <thead className="bg-purple-900 text-white"><tr><th className="p-3 text-left">Form No</th><th className="p-3 text-left">Applicant Name</th><th className="p-3">Email / Phone</th><th className="p-3">Program</th><th className="p-3">Status</th><th className="p-3">Payment</th><th className="p-3">Date</th><th className="p-3">Action</th></tr></thead>
              <tbody>
                {filteredApplicants.map((a:any) => (
                  <tr key={a.id} className="border-b hover:bg-purple-50">
                    <td className="p-3 font-mono font-black text-purple-800">{a.formNo}</td>
                    <td className="p-3 font-bold">{a.fullName}</td>
                    <td className="p-3 text-[11px]"><div>{a.email}</div><div className="font-mono">{a.phone}</div></td>
                    <td className="p-3 text-[11px]">{a.program}<br/>{a.courseChoice1?.slice(0,40)}</td>
                    <td className="p-3"><span className={`px-2 py-1 rounded-full text-[10px] font-black ${a.status?.includes('PENDING')?'bg-amber-100 text-amber-800':'bg-emerald-100 text-emerald-800'}`}>{a.status}</span></td>
                    <td className="p-3"><span className={`px-2 py-1 rounded-full text-[10px] font-black ${a.bursarStatus?.includes('PENDING')||a.payment_status?.includes('PENDING')?'bg-red-100 text-red-800':'bg-green-100 text-green-800'}`}>{a.bursarStatus || a.payment_status || a.status}</span></td>
                    <td className="p-3 text-[10px]">{new Date(a.createdAt||'').toLocaleDateString()}</td>
                    <td className="p-3"><button onClick={async()=>{
                      const sb=getSupabase();
                      try{
                        if(sb) await sb.from('college_applications').update({status:'APPROVED', payment_status:'PAID'}).eq('id', a.id);
                      }catch{}
                      alert(`✅ Applicant ${a.fullName} approved by ${bursarDisplayName}`);
                      load();
                    }} className="px-3 py-1 bg-emerald-700 text-white rounded-lg font-black text-[11px]">Approve</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredApplicants.length===0 && <div className="p-10 text-center text-slate-400 font-bold">No applicants found - Submit one from homepage with fixed api.ts - {applicants.length} total loaded - Check console.log</div>}
          </div>
        </div>
      )}

      {tab==='dashboard' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-emerald-900 text-white p-4 rounded-xl"><p className="text-xs">Total Expected (Students)</p><p className="font-black text-xl">₦{totalExpected.toLocaleString()}</p></div>
            <div className="bg-green-600 text-white p-4 rounded-xl"><p className="text-xs">Total Collected (Students Only)</p><p className="font-black text-xl">₦{totalCollected.toLocaleString()}</p></div>
            <div className="bg-amber-400 text-black p-4 rounded-xl"><p className="text-xs">Pending Student Proofs</p><p className="font-black text-xl">{pending.length} proofs</p></div>
            <div className="bg-purple-600 text-white p-4 rounded-xl"><p className="text-xs">Applicants Pending Bursar</p><p className="font-black text-xl">{applicants.filter(a=>a.status?.includes('PENDING')).length} applicants</p></div>
          </div>
          <h3 className="font-black">Total Payments Per Fee Set - Students Only - Catholic Diocese of Gboko</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {fees.map(fee => {
              const fp = payments.filter(p=>p.fee_name===fee.name || p.fee_name?.includes(fee.name));
              const coll = fp.filter(p=>p.status!=='REJECTED' && p.status!=='PENDING').reduce((s,p)=>s+p.amount_paid,0);
              return <div key={fee.id} className="border-2 p-3 rounded-xl"><p className="font-black">{fee.name} - ₦{fee.amount.toLocaleString()} - {fee.bank_name} {fee.account_number} - For {fee.applicant_type} - Students Only</p><p className="text-xs">Collected: ₦{coll.toLocaleString()} | Expected: ₦{(fee.amount*50).toLocaleString()} | Students Paid: {fp.length}</p><div className="w-full bg-slate-200 h-2 rounded mt-2"><div className="bg-green-600 h-2 rounded" style={{width:`${Math.min((coll/(fee.amount*50||1))*100,100)}%`}}></div></div></div>
            })}
            {fees.length===0 && <div className="p-8 border-2 border-dashed rounded-xl text-center text-slate-400">No fees - Go to Set Fees tab - Student fees only</div>}
          </div>
        </div>
      )}

      {tab==='fees' && (
        <div className="bg-emerald-50 border-2 p-4 rounded-xl space-y-2">
          <h3 className="font-black">Create Fee - Saved to Supabase + Dashboard Totals - Bursar: {bursarDisplayName} - STUDENT ONLY - No Staff Fees</h3>
          <div className="grid md:grid-cols-3 gap-2 bg-white p-3 rounded border">
            <input value={feeName} onChange={e=>setFeeName(e.target.value)} placeholder="Fee Name e.g. School Fees" className="border px-3 py-2 rounded text-black"/>
            <input value={feeAmount} onChange={e=>setFeeNameAmount(e.target.value)} type="number" placeholder="Amount ₦" className="border-2 border-amber-300 px-3 py-2 rounded font-black text-black"/>
            <select value={applyTo} onChange={e=>setApplyTo(e.target.value)} className="border-2 border-blue-300 px-3 py-2 rounded font-black text-black"><option value="BOTH">BOTH - Student + Applicant</option><option value="STUDENT">STUDENT Only</option><option value="APPLICANT">APPLICANT Only</option></select>
            <select value={level} onChange={e=>setLevel(e.target.value)} className="border px-3 py-2 rounded text-black"><option>ALL</option><option>ND1</option><option>ND2</option><option>HND1</option><option>HND2</option></select>
            <input value={bank} onChange={e=>setBank(e.target.value)} placeholder="Bank Name" className="border px-3 py-2 rounded text-black"/>
            <input value={accNo} onChange={e=>setAccNo(e.target.value)} placeholder="Account Number *" className="border-2 border-red-300 px-3 py-2 rounded font-black text-black"/>
          </div>
          <button onClick={createFee} className="w-full bg-emerald-700 text-white py-3 rounded font-black">💾 Save Fee to Supabase - Shows in Dashboard Totals - Student Fees</button>
          <div className="space-y-1 mt-3">{fees.map(f=><div key={f.id} className="flex justify-between bg-white p-2 border rounded text-xs"><span>{f.name} ₦{f.amount.toLocaleString()} {f.account_number} - Student Only</span><button onClick={async()=>{ const sb=getSupabase(); try{if(sb) await sb.from('lcns_fees').delete().eq('id',f.id);}catch{} const u=fees.filter(x=>x.id!==f.id); localStorage.setItem('lcns_fees', JSON.stringify(u)); setFees(u); }} className="text-red-600 font-black">Delete</button></div>)}</div>
        </div>
      )}

      {tab==='manual_pay' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border-2 border-blue-400 rounded-2xl p-5 space-y-4">
            <h3 className="font-black text-blue-900 flex items-center gap-2">💰 Bursar Manual Payment - {bursarDisplayName} - STUDENT ONLY - Auto Half/Complete + Receipt - Catholic Diocese of Gboko - No Staff Allowed</h3>
            <p className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 p-2 rounded">⚠️ BURSAR RESTRICTED TO STUDENTS ONLY: Staff records (LCNS/ST/) are blocked. Only Student Matric No LCNS/ND, LCNS/HND, or Student Email allowed.</p>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="space-y-3 bg-white p-4 rounded-xl border-2">
                <label className="text-[11px] font-black uppercase">Search Student Only (Matric / Name) - {allUsers.length} Students Found - No Staff</label>
                <input value={searchStudent} onChange={e=>setSearchStudent(e.target.value)} placeholder="Type Student Matric No or Name - Staff filtered out" className="w-full border-2 px-3 py-2 rounded-xl text-xs font-bold"/>
                <div className="max-h-32 overflow-auto border rounded-xl divide-y">
                  {filteredStudentsForPay.map((u:any)=><button key={u.email} onClick={()=>{setManualMatric(u.matricNumber||u.matric_number||u.matricNo||''); setManualName(u.fullName||u.name||''); setManualLevel(u.level||u.currentLevel||'ND1');}} className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-blue-50 flex justify-between"><span>{u.fullName} - {u.matricNumber||u.matric_number} - STUDENT</span><span className="font-mono">{u.level||''}</span></button>)}
                  {filteredStudentsForPay.length===0 && <div className="p-3 text-center text-slate-400 text-xs">No student found - Search only shows STUDENT role - Staff blocked</div>}
                </div>
                <input value={manualMatric} onChange={e=>setManualMatric(e.target.value)} placeholder="Student Matric No * e.g. LCNS/ND/2026/001 - No LCNS/ST/" className="w-full border-2 border-emerald-300 px-3 py-2.5 rounded-xl text-xs font-black uppercase"/>
                <input value={manualName} onChange={e=>setManualName(e.target.value)} placeholder="Student Full Name * - Student Only" className="w-full border px-3 py-2.5 rounded-xl text-xs font-bold"/>
                <select value={manualFeeId} onChange={e=>setManualFeeId(e.target.value)} className="w-full border-2 border-amber-300 px-3 py-2.5 rounded-xl text-xs font-bold"><option value="">Select Fee Structure * - Student Fees</option>{fees.map(f=><option key={f.id} value={f.id}>{f.name} - ₦{f.amount.toLocaleString()} - {f.level||'ALL'} - {f.bank_name} - Student</option>)}</select>
                <input value={manualAmountPaid} onChange={e=>setManualAmountPaid(e.target.value)} type="number" placeholder="Amount Paid Now * e.g. 50000 - Student Payment" className="w-full border-2 border-green-400 px-3 py-2.5 rounded-xl text-sm font-black"/>
              </div>
              <div className="space-y-3 bg-white p-4 rounded-xl border-2">
                <label className="text-[11px] font-black uppercase">Academic Details - For Student Receipt - Catholic Diocese</label>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-[10px] font-bold">Academic Year</label><select value={manualSession} onChange={e=>setManualSession(e.target.value)} className="w-full border px-2 py-2 rounded-xl text-xs font-bold"><option>2026/2027</option><option>2025/2026</option><option>2024/2025</option></select></div>
                  <div><label className="text-[10px] font-bold">Semester</label><select value={manualSemester} onChange={e=>setManualSemester(e.target.value)} className="w-full border px-2 py-2 rounded-xl text-xs font-bold"><option>First Semester</option><option>Second Semester</option></select></div>
                  <div><label className="text-[10px] font-bold">Level (Student Only)</label><select value={manualLevel} onChange={e=>setManualLevel(e.target.value)} className="w-full border px-2 py-2 rounded-xl text-xs font-bold"><option>ND1</option><option>ND2</option><option>HND1</option><option>HND2</option></select></div>
                  <div><label className="text-[10px] font-bold">Bursar (Cashier - Student Accounts)</label><input value={bursarDisplayName} disabled className="w-full border bg-slate-100 px-2 py-2 rounded-xl text-xs font-black"/></div>
                </div>
                <button onClick={handleManualPay} className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-xl font-black text-sm">💾 Record Student Payment - {bursarDisplayName} - Generate Student Receipt Only</button>
                {lastReceipt && <button onClick={()=>printReceipt(lastReceipt)} className="w-full bg-emerald-700 text-white py-3 rounded-xl font-black text-sm">🖨️ Print Last Student Receipt - {lastReceipt.receipt_no}</button>}
              </div>
            </div>
          </div>
          <div className="bg-white border-2 rounded-2xl p-4">
            <h3 className="font-black text-sm">Recent Student Manual Payments by {bursarDisplayName} - {payments.length} Records</h3>
            <div className="overflow-x-auto border rounded-xl mt-3">
              <table className="w-full text-xs"><thead className="bg-slate-900 text-white"><tr><th className="p-2 text-left">Receipt No</th><th className="p-2 text-left">Student - Matric</th><th className="p-2">Fee</th><th className="p-2">Paid / Total / Balance</th><th className="p-2">Status</th><th className="p-2">Bursar</th><th className="p-2">Print</th></tr></thead>
                <tbody>{payments.filter(p=>p.bursar_name).slice(0,30).map(p=><tr key={p.id} className="border-b hover:bg-slate-50"><td className="p-2 font-mono font-black">{p.receipt_no}</td><td className="p-2"><p className="font-bold">{p.user_name}</p><p className="font-mono text-[11px]">{p.matric_no}</p></td><td className="p-2">{p.fee_name}</td><td className="p-2 font-bold">₦{p.amount_paid.toLocaleString()} / ₦{p.amount.toLocaleString()} / <span className={p.balance===0?'text-emerald-600':'text-red-600'}>₦{(p.balance||0).toLocaleString()}</span></td><td className="p-2"><span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${p.status==='PAID'?'bg-emerald-100 text-emerald-800':p.payment_type?.includes('HALF')?'bg-amber-100 text-amber-800':'bg-red-100 text-red-800'}`}>{p.payment_type}</span></td><td className="p-2 text-[11px] font-bold">{p.bursar_name}</td><td className="p-2"><button onClick={()=>printReceipt(p)} className="px-2 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-bold">Print Student Receipt</button></td></tr>)}</tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab==='pending' && (
        <div className="overflow-x-auto border rounded"><table className="w-full text-xs"><thead className="bg-red-700 text-white"><tr><th className="p-2 text-left">Student (Only)</th><th>Fee</th><th>Paid</th><th>Proof</th><th>Action</th></tr></thead><tbody>{pending.map(p=><tr key={p.id} className="border-b"><td className="p-2">{p.user_name} {p.matric_no} - STUDENT ONLY</td><td className="p-2">{p.fee_name}</td><td className="p-2 font-black">₦{p.amount_paid.toLocaleString()}</td><td className="p-2"><a href={p.proof_url} target="_blank" className="text-blue-600 underline">View PNG/PDF</a></td><td className="p-2"><button onClick={async()=>{ const sb=getSupabase(); try{if(sb) await sb.from('lcns_student_payments').update({status:'PAID'}).eq('id',p.id);}catch{} const u=payments.map(x=>x.id===p.id?{...x,status:'PAID'}:x); localStorage.setItem('lcns_student_payments', JSON.stringify(u)); setPayments(u); }} className="bg-green-600 text-white px-2 py-1 rounded">Approve Student - Adds to Totals</button></td></tr>)}</tbody></table></div>
      )}
    </div>
  );
};

export const BursarDashboard = BursarFeeManager;
export default BursarDashboard;

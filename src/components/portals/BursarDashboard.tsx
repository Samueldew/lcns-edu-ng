import React, { useState, useEffect } from 'react';
import { getSupabase, supabase } from '../../lib/supabase';
import { StorageService } from '../../services/storage';
import { COLLEGE_CONFIG } from '../../types';

interface FeeConfig { id: string; name: string; amount: number; type: 'APPLICATION' | 'SCREENING' | 'STUDENT'; bank: string; account: string; }
interface Payment { id: string; user_name: string; matric_no: string; fee_name: string; amount: number; amount_paid: number; status: string; proof_url?: string; created_at?: string; receipt_no?: string; payment_type?: string; balance?: number; bursar_name?: string; }

export const BursarFeeManager: React.FC = () => {
  const [tab, setTab] = useState<'application_fee' | 'screening_fee' | 'cleared' | 'all' | 'set_fees' | 'students'>('application_fee');
  const [applicants, setApplicants] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'APPLICATION' | 'SCREENING'>('APPLICATION');
  const [loading, setLoading] = useState(true);

  // VARIABLE FEES - NOT FIXED 15000
  const [fees, setFees] = useState<FeeConfig[]>(() => {
    const saved = localStorage.getItem('lcns_fee_config_v2');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'app', name: 'Application Form Fee', amount: 10000, type: 'APPLICATION', bank: 'Zenith Bank', account: '1018894231' },
      { id: 'screen', name: 'Screening & CBT Fee', amount: 15000, type: 'SCREENING', bank: 'Zenith Bank', account: '1018894231' }
    ];
  });

  const saveFees = (nf: FeeConfig[]) => { setFees(nf); localStorage.setItem('lcns_fee_config_v2', JSON.stringify(nf)); localStorage.setItem('lcns_fee_config', JSON.stringify(nf)); };

  const appFee = fees.find(f => f.type === 'APPLICATION') || fees[0];
  const screenFee = fees.find(f => f.type === 'SCREENING') || fees[1];

  const currentUser = (() => { try { return StorageService.getCurrentUser() || { fullName: 'Bursar', email: 'bursar@lcns.edu.ng' }; } catch { return { fullName: 'Bursar', email: 'bursar@lcns.edu.ng' }; } })();
  const bursarName = (currentUser?.fullName || 'BURSAR').toString().toUpperCase();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('college_applications').select('*').order('created_at', { ascending: false }).limit(200);
      if (data) {
        const real = data.filter((a: any) => {
          const f = (a.form_no || '').toUpperCase();
          if (f.includes('LCNS/ST/')) return false;
          if (f.includes('STAFF')) return false;
          return true;
        });
        setApplicants(real);
      }
    } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const applicationFeePending = applicants.filter(a => {
    const hasApp = a.full_application?.paymentReceiptPdfUrl || a.payment_receipt_url || a.application_fee_snap;
    const isPending = a.status === 'PENDING' || a.status === 'PENDING_BURSAR' || a.bursar_status === 'PENDING' || a.bursar_status === 'PENDING_BURSAR' || !a.bursar_status;
    return (hasApp || isPending) && a.bursar_status !== 'CLEARED' && a.status !== 'BURSAR_CLEARED' && a.status !== 'ADMITTED';
  });

  const screeningFeePending = applicants.filter(a => {
    const hasScreen = a.screening_fee_snap || (a as any).screening_fee_snap || a.full_application?.screeningFeeSnap;
    return !!hasScreen;
  });

  const clearedList = applicants.filter(a => a.bursar_status === 'CLEARED' || a.bursar_cleared || a.status === 'BURSAR_CLEARED' || a.status === 'ADMITTED' || a.status === 'ADMISSION_IN_PROGRESS');

  const filtered = applicants.filter(a => !search || `${a.form_no} ${a.full_name} ${a.email}`.toLowerCase().includes(search.toLowerCase()));
  const currentList = tab === 'application_fee' ? applicationFeePending : tab === 'screening_fee' ? screeningFeePending : tab === 'cleared' ? clearedList : filtered;

  const printReceipt = (app: any, type: 'APPLICATION' | 'SCREENING') => {
    const config = type === 'APPLICATION' ? appFee : screenFee;
    const amount = config.amount;
    const feeName = config.name;
    const description = type === 'APPLICATION' ? `FORM FEE - Application Form - ${feeName}` : `SCREENING FEE - Screening & CBT - ${feeName}`;
    const snapUrl = type === 'APPLICATION' ? (app.payment_receipt_url || app.full_application?.paymentReceiptPdfUrl || app.application_fee_snap) : (app.screening_fee_snap || (app as any).screening_fee_snap || app.full_application?.screeningFeeSnap);
    const receiptNo = `LCNS/${type === 'APPLICATION' ? 'FORM' : 'SCREEN'}/${new Date().getFullYear()}/${app.form_no.replace(/\//g,'-')}/${Date.now().toString().slice(-4)}`;

    const win = window.open('', '_blank'); if (!win) return;
    win.document.write(`<html><head><title>${receiptNo}</title><style>body{font-family:Arial;padding:20px}.header{text-align:center;border-bottom:4px double #0a4d2e;padding-bottom:12px}.logo{width:70px;height:70px;background:#0a4d2e;color:#fbbf24;display:flex;align-items:center;justify-content:center;border-radius:50%;font-weight:900;font-size:24px;margin:0 auto}h1{font-size:18px;color:#0a4d2e;text-transform:uppercase}.badge{background:#0a4d2e;color:white;padding:6px 14px;border-radius:20px;font-size:11px;font-weight:900;margin-top:8px;display:inline-block}.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:15px 0;background:#f8fafc;padding:15px;border-radius:12px;border:1px solid #e2e8f0}.row{display:flex;justify-content:space-between;border-bottom:1px dashed #e2e8f0;padding:6px 0;font-size:13px}.label{color:#64748b;font-size:11px;text-transform:uppercase;font-weight:700}.value{font-weight:800}.snap{border:2px solid #0a4d2e;border-radius:12px;padding:8px;text-align:center;margin:15px 0}.snap img{max-width:100%;max-height:450px;border-radius:8px}.footer{margin-top:20px;display:flex;justify-content:space-between;font-size:11px}.sig{border-top:1px solid #000;padding-top:5px;margin-top:40px;width:180px;text-align:center}@media print{button{display:none}}</style></head><body>
      <div class="header"><div class="logo">LCNS</div><h1>Labe College of Nursing Sciences, Gboko</h1><div style="font-size:10px;color:#555">Catholic Diocese of Gboko | Bursary Department | Official Receipt</div><div class="badge">${type} - ${description}</div></div>
      <div style="text-align:center;margin:12px 0"><span style="background:#0a4d2e;color:white;padding:6px 16px;border-radius:20px;font-size:12px;font-weight:900">Receipt No: ${receiptNo} | ${new Date().toLocaleString()} | ${COLLEGE_CONFIG.CURRENT_SESSION}</span></div>
      <div class="grid">
        <div><div class="label">Applicant Name</div><div class="value">${app.full_name}</div></div>
        <div><div class="label">Application Number</div><div class="value" style="font-family:monospace;color:#0a4d2e">${app.form_no}</div></div>
        <div><div class="label">Description - Fee Type</div><div class="value">${description}</div></div>
        <div><div class="label">Amount Paid</div><div class="value" style="font-size:16px;color:#0a4d2e">₦${amount.toLocaleString()} - Variable Amount Set By Bursar</div></div>
        <div><div class="label">Program</div><div class="value">${app.program || ''}</div></div>
        <div><div class="label">Exam Number</div><div class="value">${app.exam_number || 'To be generated after screening fee clearance'}</div></div>
        <div><div class="label">Payment Status</div><div class="value">PAID & VERIFIED - ${type} FEE</div></div>
        <div><div class="label">Bursar</div><div class="value">${bursarName}</div></div>
      </div>
      <div class="snap"><div class="label" style="margin-bottom:8px">Uploaded Proof - ${app.form_no} - ${description} - ₦${amount.toLocaleString()}</div>${snapUrl ? `<img src="${snapUrl}" />` : `<div style="padding:40px;background:#f1f5f9">No image uploaded - Verified manually by Bursar - ${app.form_no}</div>`}<p style="font-size:10px;color:#64748b;margin-top:6px">This is the exact proof uploaded by applicant with application number ${app.form_no} - Bursar verified before clearance</p></div>
      <div style="font-size:11px;background:#f0fdf4;border:1px solid #0a4d2e;padding:10px;border-radius:8px"><b>Note:</b> Official receipt for <b>${description}</b> for Application No <b>${app.form_no}</b>. Amount <b>₦${amount.toLocaleString()}</b> is variable amount set by Bursar - Not must ₦15,000 - Applicant cleared for ${type==='APPLICATION'?'application processing':'CBT aptitude test'}.</div>
      <div class="footer"><div><div class="label">Bursar Signature</div><div class="sig">Dr. Isaac M. Agber<br/>Bursar - LCNS</div></div><div><div class="label">Date</div><div style="margin-top:40px;font-weight:800">${new Date().toLocaleString()}</div></div><div><div class="label">Applicant Signature</div><div class="sig">Signature</div></div></div>
      <div style="text-align:center;margin-top:15px"><button onclick="window.print()" style="background:#0a4d2e;color:white;padding:10px 24px;border-radius:20px;border:none;font-weight:900;cursor:pointer">🖨️ Print ${type} Receipt - ${app.form_no} - ₦${amount.toLocaleString()} - ${description}</button></div>
    </body></html>`);
    win.document.close();
  };

  const handleClear = async (app: any, type: 'APPLICATION' | 'SCREENING') => {
    const config = type === 'APPLICATION' ? appFee : screenFee;
    const newExamNo = app.exam_number || `LCNS/${new Date().getFullYear()}/EXM/${Math.floor(1000 + Math.random()*9000)}`;
    if (!confirm(`Clear ${type} FEE for ${app.full_name} (${app.form_no})?\nFee: ${config.name} - ₦${config.amount.toLocaleString()} - Variable\nDescription: ${type==='APPLICATION'?'FORM':'SCREENING'} FEE\n${type==='SCREENING'? 'Exam No will be: '+newExamNo : 'Will allow screening fee upload'}\n\nConfirm with Application Number ${app.form_no}?`)) return;
    try {
      const updates = type === 'APPLICATION' ? { bursar_status: 'APPLICATION_CLEARED', status: 'APPLICATION_CLEARED' } : { bursar_status: 'CLEARED', status: 'BURSAR_CLEARED', bursar_cleared: true, exam_number: newExamNo, bursar_cleared_date: new Date().toISOString() };
      await supabase.from('college_applications').update(updates).eq('id', app.id);
      alert(`✅ ${type} FEE CLEARED!\nApplicant: ${app.full_name}\nForm No: ${app.form_no}\nFee: ${config.name} - ₦${config.amount.toLocaleString()}\n${type==='SCREENING'? 'Exam No: '+newExamNo+'\nReceipt can be printed now with description SCREENING FEE' : 'Receipt can be printed with description FORM FEE'}`);
      load(); setShowModal(false);
    } catch { alert('Failed - check Supabase'); }
  };

  const openModal = (app: any, type: 'APPLICATION' | 'SCREENING') => { setSelected(app); setModalType(type); setShowModal(true); };

  return (
    <div className="max-w-7xl mx-auto p-4 bg-white rounded-2xl shadow space-y-4 border">
      <div className="bg-gradient-to-r from-emerald-950 to-slate-900 text-white rounded-2xl p-5 flex justify-between">
        <div><h2 className="text-xl font-black uppercase">Bursar Dashboard - REAL APPLICANTS ONLY - Variable Fees</h2><p className="text-xs text-emerald-200">No LCNS/ST/ fake - Only college_applications | Form Fee: ₦{appFee.amount.toLocaleString()} | Screening Fee: ₦{screenFee.amount.toLocaleString()} - Can be less | Total Applicants: {applicants.length} | {bursarName}</p></div>
        <button onClick={load} className="px-4 py-2 bg-amber-400 text-slate-900 rounded-xl font-black text-xs">Refresh</button>
      </div>

      <div className="flex flex-wrap gap-2 text-xs font-black">
        <button onClick={()=>setTab('set_fees')} className={`px-4 py-2.5 rounded-xl ${tab==='set_fees'?'bg-slate-900 text-white ring-2':'bg-white border-2 border-slate-900'}`}>⚙️ Set Fee Amounts - Variable - Not Must ₦15k</button>
        <button onClick={()=>setTab('application_fee')} className={`px-4 py-2.5 rounded-xl ${tab==='application_fee'?'bg-blue-700 text-white ring-2':'bg-blue-50 border-2 border-blue-300 text-blue-800'}`}>📄 Application Fee (FORM) - ₦{appFee.amount.toLocaleString()} - Pending ({applicationFeePending.length})</button>
        <button onClick={()=>setTab('screening_fee')} className={`px-4 py-2.5 rounded-xl ${tab==='screening_fee'?'bg-amber-600 text-white ring-2':'bg-amber-50 border-2 border-amber-400 text-amber-900'}`}>🧾 Screening Fee (SCREENING) - ₦{screenFee.amount.toLocaleString()} - Pending ({screeningFeePending.length})</button>
        <button onClick={()=>setTab('cleared')} className={`px-4 py-2.5 rounded-xl ${tab==='cleared'?'bg-emerald-700 text-white':'bg-emerald-50 border'}`}>✅ Cleared + Exam No ({clearedList.length})</button>
        <button onClick={()=>setTab('all')} className={`px-3 py-2 rounded-xl ${tab==='all'?'bg-slate-800 text-white':'bg-white border'}`}>All ({applicants.length})</button>
      </div>

      {tab==='set_fees' && (
        <div className="bg-slate-50 border-2 p-5 rounded-2xl space-y-4">
          <h3 className="font-black text-sm uppercase">⚙️ Set Variable Fee Amounts - Form Fee & Screening Fee Can Be Less - Not Must ₦15,000</h3>
          <p className="text-xs bg-amber-100 border border-amber-300 p-3 rounded-xl font-bold">Bursar can set Application Form Fee to ₦5,000 or ₦8,000 and Screening Fee to ₦7,000 or ₦10,000. The amount you set here will appear on Applicant Dashboard and on printed receipt with description FORM or SCREENING and Application Number.</p>
          <div className="grid md:grid-cols-2 gap-4">
            {fees.map((f, idx)=>(
              <div key={f.id} className="bg-white p-4 rounded-xl border-2 space-y-2">
                <label className="text-[11px] font-black uppercase">{f.type} Fee Name - Description for Receipt</label>
                <input value={f.name} onChange={e=>{ const nf=[...fees]; nf[idx].name=e.target.value; saveFees(nf); }} className="w-full border px-3 py-2 rounded-lg text-sm font-bold"/>
                <label className="text-[11px] font-black uppercase">Amount - Variable - Can be Less - Not Must ₦15,000</label>
                <input type="number" value={f.amount} onChange={e=>{ const nf=[...fees]; nf[idx].amount=parseInt(e.target.value)||0; saveFees(nf); }} className="w-full border-2 border-amber-400 px-3 py-2.5 rounded-xl font-black text-lg" placeholder="5000, 7000, 10000"/>
                <p className="text-[11px] text-emerald-700 font-bold">Current: ₦{f.amount.toLocaleString()} - Will show on dashboard as: {f.type} FEE - {f.name} - ₦{f.amount.toLocaleString()} - For {f.type==='APPLICATION'?'FORM':'SCREENING'}</p>
                <div className="flex gap-2"><span className="text-[10px] bg-slate-100 px-2 py-1 rounded-full font-bold">{f.type}</span><span className="text-[10px] bg-emerald-100 px-2 py-1 rounded-full font-bold">{f.bank} {f.account}</span></div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={()=>{ const nf=[...fees, {id:Date.now().toString(), name:'New Fee', amount:5000, type:'SCREENING', bank:'Zenith Bank', account:'1018894231'}]; saveFees(nf); }} className="px-4 py-2 bg-emerald-700 text-white rounded-lg font-black text-xs">+ Add New Fee - Any Amount</button>
            <button onClick={()=>{ if(confirm('Reset to default 10k and 15k?')) saveFees([{id:'app',name:'Application Form Fee',amount:10000,type:'APPLICATION',bank:'Zenith Bank',account:'1018894231'},{id:'screen',name:'Screening & CBT Fee',amount:15000,type:'SCREENING',bank:'Zenith Bank',account:'1018894231'}]); }} className="px-4 py-2 bg-slate-200 rounded-lg font-black text-xs">Reset</button>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by Application Number e.g. LCNS/2026/8902 - For Bursar Clearance" className="flex-1 border-2 border-slate-300 px-4 py-2.5 rounded-xl text-sm font-bold uppercase"/>
        <button onClick={load} className="px-4 py-2 bg-slate-800 text-white rounded-xl font-black text-xs">Search</button>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl border-2">
        <table className="w-full text-xs">
          <thead className={`${tab==='application_fee'?'bg-blue-900':tab==='screening_fee'?'bg-amber-600':'bg-emerald-900'} text-white`}><tr><th className="p-3 text-left">Application No</th><th className="p-3 text-left">Applicant</th><th className="p-3">Fee Description - FORM or SCREENING</th><th className="p-3">View Receipt</th><th className="p-3">Status</th><th className="p-3">Action - View / Clear / Print</th></tr></thead>
          <tbody>
            {currentList.map((a:any)=>{
              const hasApp = a.full_application?.paymentReceiptPdfUrl || a.payment_receipt_url;
              const hasScreen = a.screening_fee_snap || (a as any).screening_fee_snap || a.full_application?.screeningFeeSnap;
              const feeType = tab==='screening_fee' ? 'SCREENING' : tab==='application_fee' ? 'APPLICATION' : hasScreen ? 'SCREENING' : 'APPLICATION';
              const config = feeType==='APPLICATION' ? appFee : screenFee;
              const receiptUrl = feeType==='SCREENING' ? hasScreen : hasApp;
              return (
                <tr key={a.id} className="border-b hover:bg-slate-50">
                  <td className="p-3 font-mono font-black text-blue-800">{a.form_no}</td>
                  <td className="p-3"><div className="font-bold uppercase">{a.full_name}</div><div className="text-[11px] text-slate-500">{a.email} | {a.phone}</div></td>
                  <td className="p-3"><span className={`px-2 py-1 rounded-full font-black text-[10px] ${feeType==='APPLICATION'?'bg-blue-100 text-blue-800':'bg-amber-100 text-amber-800'}`}>{feeType} FEE - {config.name}</span><div className="text-[11px] font-black mt-1">₦{config.amount.toLocaleString()} - Variable - App No: {a.form_no}</div><div className="text-[10px] text-slate-500">{feeType==='APPLICATION'?'FORM FEE - For Application Form':'SCREENING FEE - For CBT'}</div></td>
                  <td className="p-3 text-center">{receiptUrl ? <button onClick={()=>openModal(a, feeType as any)} className="px-3 py-1.5 bg-slate-800 text-white rounded-lg font-black text-[11px]">📄 View {feeType} Receipt</button> : <span className="text-slate-400 text-[11px]">No {feeType} upload</span>}</td>
                  <td className="p-3"><span className={`px-2 py-1 rounded-full text-[10px] font-black ${a.bursar_status==='CLEARED'?'bg-emerald-100 text-emerald-800':'bg-amber-100 text-amber-800'}`}>{a.bursar_status || a.status}</span><div className="text-[10px] font-mono">{a.exam_number || 'No Exam No yet'}</div></td>
                  <td className="p-3"><div className="flex flex-wrap gap-1"><button onClick={()=>openModal(a, feeType as any)} className="px-2 py-1 bg-blue-600 text-white rounded text-[10px] font-black">View {feeType}</button>{receiptUrl && <button onClick={()=>printReceipt(a, feeType as any)} className="px-2 py-1 bg-slate-900 text-white rounded text-[10px] font-black">Print {feeType} - ₦{config.amount.toLocaleString()}</button>}{receiptUrl && tab!=='cleared' && <button onClick={()=>handleClear(a, feeType as any)} className="px-3 py-1 bg-emerald-700 text-white rounded text-[10px] font-black">Clear {feeType} - {a.form_no}</button>}</div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {currentList.length===0 && <div className="p-10 text-center text-slate-400 font-bold">No {tab} records - Fake LCNS/ST/ removed - Only real college_applications - Application Number required for clearance</div>}
      </div>

      {showModal && selected && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] overflow-auto shadow-2xl">
            <div className={`sticky top-0 ${modalType==='APPLICATION'?'bg-blue-900':'bg-amber-600'} text-white p-4 rounded-t-2xl flex justify-between`}>
              <div><h3 className="font-black text-lg">{modalType} FEE - Application No: {selected.form_no} - ₦{(modalType==='APPLICATION'?appFee:screenFee).amount.toLocaleString()} - Variable</h3><p className="text-xs opacity-90">{selected.full_name} - Description: {modalType==='APPLICATION'?'FORM FEE':'SCREENING FEE'} - {(modalType==='APPLICATION'?appFee:screenFee).name} - Bursar: {bursarName} - Must view before clear</p></div>
              <button onClick={()=>setShowModal(false)} className="bg-white/20 px-3 py-1.5 rounded-xl font-black">✕ Close</button>
            </div>
            <div className="p-5 grid md:grid-cols-2 gap-5">
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border text-xs">
                <h4 className="font-black uppercase">Applicant Details - Application Number Required</h4>
                <p><b>Application No:</b> {selected.form_no} - Use this for clearance and receipt</p>
                <p><b>Name:</b> {selected.full_name}</p>
                <p><b>Email:</b> {selected.email} | <b>Phone:</b> {selected.phone}</p>
                <p><b>Program:</b> {selected.program}</p>
                <p><b>Fee Type Description:</b> {modalType==='APPLICATION'?'FORM FEE - Application Form Fee':'SCREENING FEE - Screening & CBT Fee'} - {(modalType==='APPLICATION'?appFee:screenFee).name}</p>
                <p><b>Amount - Variable:</b> ₦{(modalType==='APPLICATION'?appFee:screenFee).amount.toLocaleString()} - Can be less - Not must ₦15,000 - Set by Bursar</p>
                <p><b>Status:</b> {selected.status} | {selected.bursar_status}</p>
                <p><b>Exam No:</b> {selected.exam_number || 'To be generated after SCREENING fee clearance'}</p>
                {selected.full_application?.passportPhotoUrl && <img src={selected.full_application.passportPhotoUrl} className="w-32 h-40 object-cover rounded-xl border-2 mt-3" alt="Passport"/>}
              </div>
              <div className="space-y-3">
                <h4 className="font-black uppercase text-sm">📄 Uploaded {modalType} Fee Receipt - Application No: {selected.form_no} - Bursar Must View Before Clear</h4>
                {(() => {
                  const url = modalType==='APPLICATION' ? (selected.payment_receipt_url || selected.full_application?.paymentReceiptPdfUrl) : (selected.screening_fee_snap || (selected as any).screening_fee_snap || selected.full_application?.screeningFeeSnap);
                  if (!url) return <div className="p-10 border-2 border-dashed rounded-xl text-center"><p className="font-bold text-slate-500">No {modalType} receipt uploaded for {selected.form_no}</p><p className="text-xs text-slate-400">Applicant has not uploaded {modalType==='APPLICATION'?'FORM (Application Form)':'SCREENING (CBT)'} fee proof on dashboard - Ask applicant to upload with Application Number {selected.form_no}</p></div>;
                  const isPdf = url.includes('.pdf') || url.startsWith('data:application/pdf');
                  return <div className="space-y-3"><div className="border-2 rounded-xl overflow-hidden bg-white p-2">{isPdf ? <iframe src={url} className="w-full h-[450px]" title="Receipt"/> : <img src={url} alt={`${modalType} Receipt - ${selected.form_no}`} className="w-full max-h-[500px] object-contain mx-auto rounded"/>}</div><div className="flex gap-2"><a href={url} target="_blank" rel="noopener noreferrer" className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black text-center">Open {modalType} Receipt - {selected.form_no}</a><button onClick={()=>printReceipt(selected, modalType)} className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black">🖨️ Print {modalType} - ₦{(modalType==='APPLICATION'?appFee:screenFee).amount.toLocaleString()}</button></div><p className="text-[11px] bg-amber-50 border p-2 rounded font-bold">Receipt for {selected.form_no} - {modalType} FEE - {modalType==='APPLICATION'?'FORM FEE - Application Form':'SCREENING FEE - Screening & CBT'} - ₦{(modalType==='APPLICATION'?appFee:screenFee).amount.toLocaleString()} - Variable - Application Number: {selected.form_no} will be printed on official receipt</p></div>;
                })()}
              </div>
            </div>
            <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end gap-2 rounded-b-2xl">
              <button onClick={()=>setShowModal(false)} className="px-5 py-2.5 bg-slate-200 rounded-xl font-black text-xs">Close</button>
              <button onClick={()=>printReceipt(selected, modalType)} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-black text-xs">🖨️ Print {modalType} Receipt - {selected.form_no} - ₦{(modalType==='APPLICATION'?appFee:screenFee).amount.toLocaleString()}</button>
              <button onClick={()=>handleClear(selected, modalType)} className="px-6 py-2.5 bg-emerald-700 text-white rounded-xl font-black text-xs">✅ Clear {modalType} Fee - App No: {selected.form_no} - ₦{(modalType==='APPLICATION'?appFee:screenFee).amount.toLocaleString()}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const BursarDashboard = BursarFeeManager;
export default BursarDashboard;

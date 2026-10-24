import React, { useState, useEffect } from 'react';
import { getSupabase } from '../../lib/supabase';
import { ApiService } from '../../services/api';
import { StorageService } from '../../services/storage';
import { CollegeLogo } from '../common/CollegeLogo';

export const BursarApplicantManager: React.FC = () => {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [tab, setTab] = useState<'PENDING' | 'CLEARED'>('PENDING');
  const [selected, setSelected] = useState<any>(null);
  const [search, setSearch] = useState('');

  const safeCurrentUser = (() => {
    try {
      const keys = ['lcns_erp_current_user', 'lcns-current-user', 'lcns_current_user'];
      for (const k of keys) {
        const v = localStorage.getItem(k);
        if (v) {
          const p = JSON.parse(v);
          if (p?.email) return p;
        }
      }
      return StorageService.getCurrentUser();
    } catch { return null; }
  })();
  const bursarName = (safeCurrentUser?.fullName || safeCurrentUser?.full_name || 'Bursar - LCNS').toString();
  const bursarEmail = safeCurrentUser?.email || 'bursar@lcns.edu.ng';

  const loadApplicants = async () => {
    try {
      const data = await ApiService.getApplicants();
      if (data && data.length > 0) {
        setApplicants(data);
        return;
      }
    } catch (e) {}
    try {
      const local = JSON.parse(localStorage.getItem('lcns_applicants') || '[]');
      if (local.length > 0) {
        setApplicants(local);
        return;
      }
      const old = JSON.parse(localStorage.getItem('lcns_applicants_storage') || localStorage.getItem('applicants') || '[]');
      setApplicants(old);
    } catch {}
  };

  useEffect(() => {
    loadApplicants();
    const h = () => loadApplicants();
    window.addEventListener('lcns_storage_update', h);
    window.addEventListener('storage', h);
    return () => {
      window.removeEventListener('lcns_storage_update', h);
      window.removeEventListener('storage', h);
    };
  }, []);

  const pendingList = applicants.filter((a: any) => {
    const s = (a.status || a.bursarStatus || '').toUpperCase();
    return s.includes('PENDING') || s === 'PENDING_BURSAR';
  });
  const clearedList = applicants.filter((a: any) => {
    const s = (a.status || a.bursarStatus || '').toUpperCase();
    return s.includes('CLEARED') || s === 'BURSAR_CLEARED' || s === 'ADMITTED';
  });

  const list = tab === 'PENDING' ? pendingList : clearedList;
  const filtered = list.filter((a: any) => {
    if (!search) return true;
    const txt = `${a.fullName || a.full_name || ''} ${a.formNo || a.form_no || ''} ${a.email || ''} ${a.phone || ''}`.toLowerCase();
    return txt.includes(search.toLowerCase());
  });

  const handleClear = async (app: any) => {
    if (!confirm(`Clear ${app.fullName || app.full_name} - ${app.formNo || app.form_no}? Catholic Diocese receipt will be generated!`)) return;
    const now = new Date().toISOString();
    const today = now.split('T')[0];
    const updated = {
      ...app,
      status: 'BURSAR_CLEARED',
      bursarStatus: 'CLEARED',
      bursarClearedBy: bursarName,
      bursarClearedEmail: bursarEmail,
      bursarClearedDate: today,
      bursarClearedAt: now,
      bursar_cleared_by: bursarName,
      bursar_cleared_date: today,
    };
    const newAll = applicants.map((x: any) => (x.formNo === app.formNo || x.form_no === app.form_no || x.id === app.id) ? updated : x);
    setApplicants(newAll);
    localStorage.setItem('lcns_applicants', JSON.stringify(newAll));
    localStorage.setItem('lcns_last_update', Date.now().toString());
    const sb = getSupabase();
    try {
      if (sb) {
        await sb.from('college_applications').update({
          status: 'BURSAR_CLEARED',
          bursar_status: 'CLEARED',
          bursar_cleared_by: bursarName,
          bursar_cleared_date: today,
          full_application: updated.full_application || updated,
        }).eq('form_no', app.formNo || app.form_no);
        if (app.id) {
          await sb.from('college_applications').update({ status: 'BURSAR_CLEARED', bursar_status: 'CLEARED' }).eq('id', app.id);
        }
      }
    } catch (e) {}
    window.dispatchEvent(new Event('lcns_storage_update'));
    alert(`✅ BURSAR CLEARED! ${app.fullName} - Now you can PRINT receipt with applicant name, paid date, Catholic Diocese logo!`);
    setSelected(updated);
  };

  // === ADDED - PRINT BURSAR CLEARANCE RECEIPT PDF WITH SCHOOL FULL NAME + LOGO + APPLICANT NAME + PAID DATE ===
  const printBursarReceipt = (app: any) => {
    const fullName = (app.fullName || app.full_name || app.full_application?.fullName || 'APPLICANT').toUpperCase();
    const formNo = app.formNo || app.form_no || app.full_application?.formNo || 'LCNS/2026/XXXX';
    const course = app.courseChoice1 || app.course_choice_1 || app.full_application?.courseChoice1 || 'ND/HND Nursing Sciences - 4 Years Collegiate';
    const email = app.email || app.full_application?.email || '';
    const phone = app.phone || app.full_application?.phone || '';
    const jamb = app.jambRegNo || app.jamb_reg_no || app.full_application?.jambRegNo || '';
    const jambScore = app.jambScore || app.jamb_score || app.full_application?.jambScore || '';
    const paidDate = app.bursarClearedDate || app.bursar_cleared_date || new Date().toISOString().split('T')[0];
    const clearedBy = app.bursarClearedBy || app.bursar_cleared_by || bursarName;
    const receiptName = app.paymentReceiptName || app.full_application?.paymentReceiptName || 'Bank Teller / Remita';
    const passport = app.passportPhotoUrl || app.full_application?.passportPhotoUrl || '';
    const session = '2026/2027';

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>Bursar Receipt - ${formNo} - ${fullName}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Inter:wght@400;600;700;900&display=swap');
        body{font-family: Inter, Arial, sans-serif; padding:0; margin:0; background:white; color:#0f172a;}
        .page{max-width:800px; margin:20px auto; border:3px solid #0a4d2e; border-radius:16px; overflow:hidden;}
        .header{background: linear-gradient(135deg, #0a4d2e 0%, #042114 100%); color:white; padding:18px 20px; text-align:center; position:relative;}
        .logo-circle{width:70px; height:70px; background: radial-gradient(circle, #fbbf24, #d97706); border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-weight:900; font-size:22px; color:#042114; border:3px solid white; box-shadow:0 4px 12px rgba(0,0,0,0.3);}
        h1{font-family: Merriweather, serif; font-size:20px; font-weight:900; margin:10px 0 2px; text-transform:uppercase; letter-spacing:0.5px;}
        .diocese{font-size:14px; font-weight:900; color:#fbbf24; text-transform:uppercase; letter-spacing:1px; margin:2px 0;}
        .motto{font-size:11px; color:#86efac; margin-top:2px; letter-spacing:0.5px;}
        .badge-title{display:inline-block; background:white; color:#0a4d2e; padding:6px 18px; border-radius:20px; font-size:12px; font-weight:900; margin-top:10px; text-transform:uppercase;}
        .body{padding:20px;}
        .grid{display:grid; grid-template-columns:1fr 140px; gap:20px; align-items:start;}
        .info-table{width:100%; border-collapse:collapse; font-size:13px;}
        .info-table tr{border-bottom:1px solid #e2e8f0;}
        .info-table td{padding:8px 6px; vertical-align:top;}
        .label{color:#64748b; font-size:11px; font-weight:700; text-transform:uppercase; width:160px;}
        .value{font-weight:700; color:#0f172a;}
        .formNo{font-family:monospace; font-weight:900; color:#0a4d2e; font-size:15px; background:#f0fdf4; padding:2px 8px; border-radius:6px; border:1px solid #bbf7d0;}
        .passport{width:130px; height:160px; border:3px solid #0a4d2e; border-radius:12px; overflow:hidden; background:#f1f5f9; display:flex; align-items:center; justify-content:center;}
        .passport img{width:100%; height:100%; object-fit:cover;}
        .stamp-box{border:3px dashed #0a4d2e; border-radius:16px; padding:14px; background:#f0fdf4; display:flex; justify-content:space-between; align-items:center; margin:18px 0;}
        .stamp{border:4px solid #0a4d2e; border-radius:12px; padding:10px 14px; text-align:center; background:#ecfdf5; transform:rotate(-2deg); min-width:220px;}
        .stamp-title{font-size:10px; font-weight:900; letter-spacing:1px; color:#0a4d2e;}
        .stamp-diocese{font-size:9px; font-weight:900; letter-spacing:0.8px; color:#0a4d2e; margin-top:2px;}
        .stamp-paid{font-size:14px; font-weight:900; color:#065f46; margin:4px 0; background:white; padding:3px 10px; border-radius:20px; border:2px solid #059669;}
        .payment-box{background:#0f172a; color:white; border-radius:12px; padding:14px; margin:16px 0;}
        .payment-row{display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px dashed #334155; font-size:13px;}
        .payment-row:last-child{border-bottom:none;}
        .footer{display:flex; justify-content:space-between; margin-top:24px; font-size:11px;}
        .sig{width:180px; text-align:center; border-top:1px solid #000; padding-top:6px; margin-top:40px;}
        .note{background:#fffbeb; border:1px solid #f59e0b; border-radius:10px; padding:10px; font-size:11px; margin-top:16px;}
        @media print{button{display:none;} .page{border:none; margin:0;} body{padding:0;}}
      </style></head><body>
        <div class="page">
          <div class="header">
            <div class="logo-circle">LCNS</div>
            <h1>Labe College of Nursing Sciences, Gboko</h1>
            <div class="diocese">Catholic Diocese of Gboko, Benue State, Nigeria</div>
            <div class="motto">Motto: Learn, Serve & Save | Catholic Institution | www.lcns.edu.ng | info@lcns.edu.ng | ICT: 08126799565</div>
            <div class="badge-title">Bursary Department - Official Application Payment Clearance Receipt - ${session}</div>
          </div>
          <div class="body">
            <div style="text-align:center; margin-bottom:14px;">
              <span style="background:#0a4d2e; color:white; padding:6px 16px; border-radius:20px; font-size:11px; font-weight:900;">ND/HND Nursing Sciences - 4 Years Collegiate Program - Applicant Payment Verified</span>
            </div>
            <div class="grid">
              <div>
                <table class="info-table">
                  <tr><td class="label">Applicant Full Name</td><td class="value" style="text-transform:uppercase; font-size:15px; color:#0a4d2e;">${fullName}</td></tr>
                  <tr><td class="label">Application Form No</td><td><span class="formNo">${formNo}</span></td></tr>
                  <tr><td class="label">Course Applied</td><td class="value">${course}</td></tr>
                  <tr><td class="label">Program Type</td><td class="value" style="color:#0a4d2e; font-weight:900;">ND/HND Nursing Sciences (4 Years) - Catholic Diocese of Gboko</td></tr>
                  <tr><td class="label">Email / Phone</td><td class="value">${email} | ${phone}</td></tr>
                  <tr><td class="label">JAMB Reg No / Score</td><td class="value">${jamb} | Score: ${jambScore}</td></tr>
                  <tr><td class="label">Payment Document</td><td class="value">${receiptName}</td></tr>
                  <tr><td class="label">Academic Session</td><td class="value">${session}</td></tr>
                </table>
              </div>
              <div style="text-align:center;">
                <div class="passport">${passport ? `<img src="${passport}" />` : `<div style="font-size:10px; color:#64748b; padding:20px;">PASSPORT<br/>PHOTO<br/><br/>${fullName.split(' ')[0]}</div>`}</div>
                <div style="font-size:9px; font-weight:700; color:#64748b; margin-top:6px; text-transform:uppercase;">Official Passport - ${fullName.split(' ')[0]}</div>
              </div>
            </div>

            <div class="stamp-box">
              <div>
                <div style="font-size:11px; font-weight:900; color:#0a4d2e; text-transform:uppercase;">Payment Verification Details:</div>
                <div class="payment-box" style="margin:8px 0 0; padding:10px;">
                  <div class="payment-row"><span>Application Form Fee Status</span><span style="font-weight:900; color:#22c55e;">PAID & VERIFIED ✓</span></div>
                  <div class="payment-row"><span>Amount Verified</span><span style="font-weight:900;">Application Fee - Cleared in College Account</span></div>
                  <div class="payment-row"><span>Date Paid Verified</span><span style="font-weight:900; color:#fbbf24;">${paidDate}</span></div>
                  <div class="payment-row"><span>Verified By (Bursar)</span><span style="font-weight:900;">${clearedBy.toUpperCase()}</span></div>
                  <div class="payment-row"><span>Bursar Email</span><span style="font-size:11px;">${bursarEmail}</span></div>
                  <div class="payment-row"><span>Receipt No / Form No</span><span style="font-family:monospace; font-weight:900;">${formNo} / LCNS/BUR/${paidDate.replace(/-/g,'')}/${formNo.slice(-4)}</span></div>
                </div>
              </div>
              <div class="stamp">
                <div class="stamp-title">LABE COLLEGE OF NURSING SCIENCES</div>
                <div class="stamp-diocese">CATHOLIC DIOCESE OF GBOKO, BENUE STATE</div>
                <div class="stamp-paid">★ BURSAR CLEARED • PAID ★</div>
                <div style="font-size:10px; font-weight:700; font-family:monospace; color:#0a4d2e;">DATE: ${paidDate}</div>
                <div style="font-size:9px; font-weight:700; margin-top:4px;">${clearedBy.toUpperCase()}</div>
                <div style="font-size:8px; font-style:italic; color:#065f46; margin-top:2px;">Authorized Bursary Signature & Stamp<br/>Catholic Diocese of Gboko</div>
              </div>
            </div>

            <div class="note">
              <b style="color:#0a4d2e;">Official Notice - Catholic Diocese of Gboko:</b><br/>
              This is to certify that <b>${fullName}</b> with Form No <b>${formNo}</b> has paid the prescribed application fee for <b>ND/HND Nursing Sciences - 4 Years Collegiate Program</b> for ${session} academic session at Labe College of Nursing Sciences, Gboko, Catholic Diocese of Gboko, Benue State. Payment has been verified and reconciled in the College bank account by the Bursary Department on <b>${paidDate}</b>. The applicant is hereby cleared to proceed for physical screening and to print official acknowledgement slip bearing Bursar Cleared stamp.<br/><br/>
              <b>Venue for Screening:</b> College ICT & Auditorium Complex, Labe College of Nursing Sciences, Catholic Diocese of Gboko, Benue State.
            </div>

            <div class="footer">
              <div>
                <div style="color:#64748b; font-weight:700; text-transform:uppercase; font-size:10px;">Cleared & Verified By (Bursar)</div>
                <div class="sig"><b>${clearedBy.toUpperCase()}</b><br/><span style="font-size:9px;">${bursarEmail}<br/>Bursary Dept, LCNS<br/>Catholic Diocese of Gboko</span></div>
              </div>
              <div>
                <div style="color:#64748b; font-weight:700; text-transform:uppercase; font-size:10px;">Date & Official Stamp</div>
                <div class="sig">${paidDate}<br/><span style="font-size:9px;">Official Date of Clearance</span><br/><br/><div style="border:2px solid #0a4d2e; border-radius:8px; padding:6px; font-size:8px; font-weight:900;">LCNS - CATHOLIC DIOCESE<br/>BURSARY SEAL</div></div>
              </div>
              <div>
                <div style="color:#64748b; font-weight:700; text-transform:uppercase; font-size:10px;">Applicant Signature</div>
                <div class="sig">${fullName}<br/><span style="font-size:9px;">${formNo}</span></div>
              </div>
            </div>

            <div style="text-align:center; margin-top:20px; font-size:9px; color:#64748b; border-top:1px dashed #cbd5e1; padding-top:10px;">
              This is a computer-generated official Bursar clearance receipt of Labe College of Nursing Sciences, Gboko, Catholic Diocese of Gboko, Benue State, Nigeria. 
              Verify via Bursary Department: info@lcns.edu.ng | 08126799565 | Form No: ${formNo} | Receipt: LCNS/BUR/${paidDate.replace(/-/g,'')}/${formNo.slice(-4)} | Generated: ${new Date().toLocaleString()}<br/>
              <b style="color:#0a4d2e;">ND/HND Nursing Sciences - 4 Years Collegiate (ND Years 1-2 + HND Years 3-4) - Catholic Institution</b>
            </div>

            <div style="text-align:center; margin-top:16px;">
              <button onclick="window.print()" style="background:#0a4d2e; color:white; padding:10px 28px; border-radius:24px; border:none; font-weight:900; cursor:pointer; font-size:13px; box-shadow:0 4px 12px rgba(10,77,46,0.3);">🖨️ Print Official Bursar Clearance Receipt - ${fullName} - ${formNo} - Catholic Diocese</button>
            </div>
          </div>
        </div>
      </div>
      </body></html>
    `);
    win.document.close();
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">
      <div className="bg-gradient-to-r from-emerald-950 to-slate-900 text-white rounded-2xl p-5 flex flex-col md:flex-row justify-between gap-3">
        <div className="flex items-center gap-3">
          <CollegeLogo size="sm" />
          <div>
            <h2 className="text-xl font-black uppercase">Bursar - Applicant Clearance & Receipt Printing</h2>
            <p className="text-xs text-emerald-200 font-bold">Labe College of Nursing Sciences, Gboko</p>
            <p className="text-xs text-amber-300 font-black uppercase">Catholic Diocese of Gboko, Benue State - ND/HND 4Years - Applicant Name Saved for Receipt</p>
            <p className="text-[11px] text-emerald-300">{bursarName} - {bursarEmail} - Print with Full Name + Paid + Date + Logo</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setTab('PENDING')} className={`px-4 py-2 rounded-xl text-xs font-black ${tab==='PENDING'?'bg-amber-400 text-black':'bg-white/10 text-white border'}`}>⏳ PENDING ({pendingList.length})</button>
          <button onClick={() => setTab('CLEARED')} className={`px-4 py-2 rounded-xl text-xs font-black ${tab==='CLEARED'?'bg-emerald-500 text-white':'bg-white/10 text-white border'}`}>✅ CLEARED - Can Print ({clearedList.length})</button>
        </div>
      </div>

      <div className="flex gap-2">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Applicant Name, Form No LCNS/2026/XXXX, Email..." className="flex-1 border-2 border-emerald-300 px-4 py-2.5 rounded-xl text-sm font-bold" />
        <button onClick={loadApplicants} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black">Refresh Applicants - Name Saved</button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-1 bg-white border-2 rounded-2xl overflow-hidden">
          <div className="bg-slate-900 text-white p-3 text-xs font-black uppercase">{tab} - ND/HND 4Years - Name Saved for PDF</div>
          <div className="max-h-[700px] overflow-auto divide-y">
            {filtered.map((app: any) => (
              <button key={app.id || app.formNo} onClick={()=>setSelected(app)} className={`w-full text-left p-3 hover:bg-emerald-50 flex gap-3 ${selected?.id===app.id?'bg-emerald-100 border-l-4 border-emerald-700':''}`}>
                <div className="w-12 h-14 bg-slate-100 rounded-lg overflow-hidden border shrink-0">
                  {app.passportPhotoUrl || app.full_application?.passportPhotoUrl ? <img src={app.passportPhotoUrl || app.full_application?.passportPhotoUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px]">No Photo</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black uppercase truncate">{app.fullName || app.full_name || app.full_application?.fullName}</p>
                  <p className="text-[11px] font-mono font-bold text-emerald-800">{app.formNo || app.form_no}</p>
                  <p className="text-[10px] text-slate-600 truncate">ND/HND 4Years - Catholic Diocese</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${tab==='PENDING'?'bg-amber-200 text-amber-900':'bg-emerald-200 text-emerald-900'}`}>{app.status || app.bursarStatus} - Name Saved</span>
                </div>
              </button>
            ))}
            {filtered.length===0 && <div className="p-8 text-center text-slate-400 text-xs">No {tab} applicants - Submit ND/HND application first</div>}
          </div>
        </div>

        <div className="md:col-span-2 bg-white border-2 rounded-2xl p-5">
          {!selected ? (
            <div className="p-10 text-center text-slate-400 text-sm">
              <p className="font-black text-slate-700">Select applicant - Name saved automatically for Bursar PDF receipt with logo & paid date</p>
              <div className="mt-4 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl text-left text-xs space-y-1">
                <p className="font-black text-emerald-900">PDF Receipt Contains - Full School Name + Logo + Catholic Diocese:</p>
                <p>✓ Applicant Full Name saved - {`{applicant.fullName}`}</p>
                <p>✓ Form No: LCNS/2026/XXXX</p>
                <p>✓ ND/HND Nursing 4Years - Catholic Diocese of Gboko</p>
                <p>✓ About Paid: PAID & VERIFIED - Date: {new Date().toISOString().split('T')[0]}</p>
                <p>✓ School Full Name: Labe College of Nursing Sciences, Gboko + Logo LCNS</p>
                <p>✓ Catholic Diocese of Gboko, Benue State</p>
                <p>✓ Bursar Name & Signature</p>
                <p>✓ Passport Photo</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="w-24 h-28 border-2 border-emerald-700 rounded-xl overflow-hidden bg-slate-100">
                    {selected.passportPhotoUrl || selected.full_application?.passportPhotoUrl ? <img src={selected.passportPhotoUrl || selected.full_application?.passportPhotoUrl} className="w-full h-full object-cover" /> : <div className="p-2 text-[10px] text-center">No Passport</div>}
                  </div>
                  <div>
                    <h3 className="font-black text-lg uppercase">{selected.fullName || selected.full_name || selected.full_application?.fullName} - Name Saved for PDF</h3>
                    <p className="font-mono font-black text-emerald-800">{selected.formNo || selected.form_no}</p>
                    <p className="text-xs font-bold text-emerald-900">ND/HND Nursing Sciences - 4 Years Collegiate - Catholic Diocese of Gboko</p>
                    <p className="text-xs">Labe College of Nursing Sciences, Gboko - Full Name + Logo</p>
                  </div>
                </div>
                <button onClick={()=>setSelected(null)} className="px-2 py-1 bg-slate-100 rounded text-xs">Close</button>
              </div>

              <div className="border-2 border-dashed border-emerald-400 rounded-xl p-3 bg-emerald-50">
                <p className="text-xs font-black uppercase mb-2">Proof of Payment - Applicant Uploaded - Verify & Clear:</p>
                <div className="bg-white rounded-lg border p-2 min-h-[180px] flex items-center justify-center">
                  {selected.paymentReceiptPdfUrl || selected.full_application?.paymentReceiptPdfUrl ? (
                    (selected.paymentReceiptPdfUrl || selected.full_application?.paymentReceiptPdfUrl || '').startsWith('data:image') ? 
                      <img src={selected.paymentReceiptPdfUrl || selected.full_application?.paymentReceiptPdfUrl} className="max-h-80 mx-auto" /> :
                      <iframe src={selected.paymentReceiptPdfUrl || selected.full_application?.paymentReceiptPdfUrl} className="w-full h-80 border-0" title="Payment Receipt" />
                  ) : <div className="text-xs text-slate-400">No receipt found in full_application</div>}
                </div>
              </div>

              {tab === 'PENDING' ? (
                <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-black text-amber-900 uppercase">Bursar Action - Clear & Save Applicant Name for PDF Receipt:</p>
                  <p className="text-[11px] text-amber-800">Applicant Name: <strong>{selected.fullName || selected.full_name}</strong> will be saved in receipt with paid date and Catholic Diocese logo. Click clear to save.</p>
                  <button onClick={()=>handleClear(selected)} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-3 rounded-xl font-black text-sm">✅ BURSAR CLEAR - Save Name {selected.fullName || selected.full_name} - ND/HND 4Years - Generate PDF with Paid Date</button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-4 text-center space-y-2">
                    <p className="text-sm font-black text-emerald-900 uppercase">✅ Bursar Cleared - Applicant Name Saved - Ready to Print PDF</p>
                    <div className="inline-block border-4 border-emerald-700 rounded-xl p-3 bg-white">
                      <p className="text-[10px] font-black">LABE COLLEGE OF NURSING SCIENCES</p>
                      <p className="text-[9px] font-black">CATHOLIC DIOCESE OF GBOKO, BENUE STATE</p>
                      <p className="text-xs font-black text-emerald-800">★ BURSAR CLEARED • PAID ★</p>
                      <p className="text-[10px] font-mono">{selected.bursarClearedDate || selected.bursar_cleared_date} - {selected.bursarClearedBy || selected.bursar_cleared_by}</p>
                      <p className="text-[10px] font-black uppercase mt-1">{selected.fullName || selected.full_name}</p>
                    </div>
                  </div>
                  {/* PRINT BUTTON - MAIN REQUEST */}
                  <button onClick={()=>printBursarReceipt(selected)} className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg">
                    🖨️ PRINT OFFICIAL BURSAR RECEIPT PDF - {selected.fullName || selected.full_name} - {selected.formNo || selected.form_no} - With School Full Name + Logo + Catholic Diocese + Paid Date: {selected.bursarClearedDate || selected.bursar_cleared_date}
                  </button>
                  <button onClick={()=>printBursarReceipt(selected)} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-3 rounded-xl font-black text-xs">
                    📄 Print Duplicate - Applicant Copy - {selected.fullName} - Paid on {selected.bursarClearedDate}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const BursarDashboardApplicant = BursarApplicantManager;
export default BursarApplicantManager;

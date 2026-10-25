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
  
  // BURSAR NAME SHOW ON DASHBOARD + RECEIPT
  const bursarName = (safeCurrentUser?.fullName || safeCurrentUser?.full_name || 'Bursar - LCNS').toString();
  const bursarEmail = safeCurrentUser?.email || 'bursar@lcns.edu.ng';
  const bursarId = safeCurrentUser?.id || '';

  const loadApplicants = async () => {
    let realApplicants: any[] = [];
    const sb = getSupabase();

    // 1. LOAD ONLY REAL APPLICATIONS FROM BACKEND - NO DUMMY 304
    try {
      if (sb) {
        // Try both tables
        const { data: app1 } = await sb.from('college_applications').select('*').order('created_at', { ascending: false }).limit(200);
        if (app1 && app1.length > 0) realApplicants = [...app1];

        const { data: app2 } = await sb.from('applications').select('*').order('created_at', { ascending: false }).limit(200);
        if (app2 && app2.length > 0) {
          const mapped = app2.map((r: any) => ({
            id: r.id,
            formNo: r.id,
            form_no: r.id,
            fullName: r.applicant_name,
            full_name: r.applicant_name,
            email: r.email,
            phone: r.phone,
            status: r.status,
            courseChoice1: r.choice_one,
            full_application: r.full_data || r,
            created_at: r.created_at
          }));
          realApplicants = [...realApplicants, ...mapped];
        }
      }
    } catch {}

    // 2. Fallback to ApiService only if backend empty
    if (realApplicants.length === 0) {
      try {
        const data = await ApiService.getApplicants();
        if (data && data.length > 0) realApplicants = data;
      } catch {}
    }

    // 3. FILTER OUT STAFF & DUMMY STUDENTS - ONLY REAL APPLICANTS WITH FORM NO
    // Remove anything that is Staff, Admin, or Student created by admin with LCNS/ST or LCNS-REG
    const filteredOnlyApplicants = realApplicants.filter((a: any) => {
      const id = (a.id || a.formNo || a.form_no || '').toString().toUpperCase();
      const role = (a.role || '').toUpperCase();
      // Exclude Staff ids like LCNS-REG-04, LCNS/ST/2026, ADMIN, BURSAR, REGISTRAR etc
      if (role && ['ADMIN','BURSAR','REGISTRAR','LECTURER','HOD','PROVOST'].includes(role)) return false;
      if (id.startsWith('LCNS-REG') || id.startsWith('LCNS/ST/') || id.startsWith('LCNS/2026/AD')) return false;
      if (id.startsWith('LCNS-')) return false; // block old demo users
      // Only allow applicant form numbers like LCNS-2026-xxxx or LCNS/EXAM or real submitted ids
      return true;
    });

    // Remove duplicates by id/formNo
    const unique = Array.from(new Map(filteredOnlyApplicants.map((a: any) => [a.id || a.formNo || a.form_no, a])).values());
    
    setApplicants(unique);
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
    const s = (a.status || a.bursarStatus || a.bursar_status || '').toUpperCase();
    return s.includes('PENDING') || s === 'SUBMITTED' || s === 'PENDING_BURSAR' || s === 'SUBMITTED';
  });
  const clearedList = applicants.filter((a: any) => {
    const s = (a.status || a.bursarStatus || a.bursar_status || '').toUpperCase();
    return s.includes('CLEARED') || s === 'BURSAR_CLEARED' || s === 'ADMITTED';
  });

  const list = tab === 'PENDING' ? pendingList : clearedList;
  const filtered = list.filter((a: any) => {
    if (!search) return true;
    const txt = `${a.fullName || a.full_name || a.full_application?.fullName || ''} ${a.formNo || a.form_no || ''} ${a.email || ''} ${a.phone || ''}`.toLowerCase();
    return txt.includes(search.toLowerCase());
  });

  const handleClear = async (app: any) => {
    if (!confirm(`Clear ${app.fullName || app.full_name} - Receipt will carry YOUR name: ${bursarName}?`)) return;
    const now = new Date().toISOString();
    const today = now.split('T')[0];
    const updated = {
      ...app,
      status: 'BURSAR_CLEARED',
      bursarStatus: 'CLEARED',
      bursarClearedBy: bursarName,
      bursarClearedEmail: bursarEmail,
      bursarClearedId: bursarId,
      bursarClearedDate: today,
      bursarClearedAt: now,
      bursar_cleared_by: bursarName,
      bursar_cleared_date: today,
      bursar_cleared_id: bursarId,
    };
    const newAll = applicants.map((x: any) => (x.formNo === app.formNo || x.form_no === app.form_no || x.id === app.id) ? updated : x);
    setApplicants(newAll);
    const sb = getSupabase();
    try {
      if (sb) {
        await sb.from('college_applications').update({
          status: 'BURSAR_CLEARED',
          bursar_status: 'CLEARED',
          bursar_cleared_by: bursarName,
          bursar_cleared_email: bursarEmail,
          bursar_cleared_date: today,
          full_application: updated.full_application || updated,
        }).eq('form_no', app.formNo || app.form_no);
        await sb.from('applications').update({ status: 'BURSAR_CLEARED' }).eq('id', app.id);
      }
    } catch (e) {}
    window.dispatchEvent(new Event('lcns_storage_update'));
    alert(`✅ BURSAR CLEARED by ${bursarName}! Receipt will carry your name: ${bursarName}`);
    setSelected(updated);
  };

  const printBursarReceipt = (app: any) => {
    const fullName = (app.fullName || app.full_name || app.full_application?.fullName || 'APPLICANT').toUpperCase();
    const formNo = app.formNo || app.form_no || 'LCNS/2026/XXXX';
    const course = app.courseChoice1 || app.course_choice_1 || app.full_application?.courseChoice1 || 'ND/HND Nursing Sciences - 4 Years Collegiate';
    const email = app.email || app.full_application?.email || '';
    const phone = app.phone || app.full_application?.phone || '';
    const paidDate = app.bursarClearedDate || app.bursar_cleared_date || new Date().toISOString().split('T')[0];
    const clearedBy = app.bursarClearedBy || app.bursar_cleared_by || bursarName;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>Bursar Receipt - ${formNo}</title>
      <style>body{font-family:Arial; padding:20px;} .header{background:#0a4d2e;color:white;padding:20px;text-align:center;border-radius:12px;}
      .logo{width:70px;height:70px;background:#fbbf24;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-weight:900;color:#042114;}
      .stamp{border:4px solid #0a4d2e;border-radius:12px;padding:12px;text-align:center;background:#ecfdf5;transform:rotate(-2deg);}
      </style></head><body>
        <div class="header">
          <div class="logo">LCNS</div>
          <h1>Labe College of Nursing Sciences, Gboko</h1>
          <p>Catholic Diocese of Gboko</p>
          <p>Bursary - Cleared by ${clearedBy.toUpperCase()} (${bursarEmail}) - ID: ${bursarId}</p>
        </div>
        <div style="padding:20px;">
          <h2>Applicant: ${fullName} - Form: ${formNo}</h2>
          <p>Course: ${course}</p>
          <p>Email: ${email} | Phone: ${phone}</p>
          <p>Paid Date Verified: ${paidDate}</p>
          <p>Cleared By Bursar: <strong>${clearedBy.toUpperCase()} - ${bursarEmail}</strong></p>
          <div class="stamp">
            <p>LABE COLLEGE OF NURSING SCIENCES</p>
            <p>CATHOLIC DIOCESE OF GBOKO</p>
            <p>★ BURSAR CLEARED • PAID ★</p>
            <p>DATE: ${paidDate}</p>
            <p>BURSAR: ${clearedBy.toUpperCase()}</p>
            <p>ID: ${bursarId}</p>
          </div>
          <p style="margin-top:20px;">This receipt carries Bursar name: ${clearedBy} who cleared it.</p>
          <button onclick="window.print()">Print Receipt with Bursar Name ${clearedBy}</button>
        </div>
      </body></html>
    `);
    win.document.close();
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">
      {/* BURSAR NAME SHOW ON DASHBOARD - TOP */}
      <div className="bg-gradient-to-r from-emerald-950 to-slate-900 text-white rounded-2xl p-5 flex flex-col md:flex-row justify-between gap-3">
        <div className="flex items-center gap-3">
          <CollegeLogo size="sm" />
          <div>
            <h2 className="text-xl font-black uppercase">Bursar Dashboard - {bursarName.toUpperCase()}</h2>
            <p className="text-xs text-amber-300 font-black">Logged in as: {bursarName} | {bursarEmail} | {bursarId}</p>
            <p className="text-xs text-emerald-200">Labe College of Nursing Sciences, Gboko - Catholic Diocese of Gboko</p>
            <p className="text-[11px] text-emerald-300">All documents printed will carry YOUR name: {bursarName}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-[10px] uppercase font-black">Bursar Name on All Receipts</p>
            <p className="text-sm font-black text-amber-300">{bursarName}</p>
            <p className="text-[10px]">{bursarEmail}</p>
            <p className="text-[10px] font-mono">{bursarId}</p>
          </div>
          <div className="flex gap-2 mt-2">
            <button onClick={() => setTab('PENDING')} className={`px-4 py-2 rounded-xl text-xs font-black ${tab==='PENDING'?'bg-amber-400 text-black':'bg-white/10 text-white border'}`}>⏳ PENDING ({pendingList.length}) - Only Real Applicants</button>
            <button onClick={() => setTab('CLEARED')} className={`px-4 py-2 rounded-xl text-xs font-black ${tab==='CLEARED'?'bg-emerald-500 text-white':'bg-white/10 text-white border'}`}>✅ CLEARED by {bursarName.split(' ')[0]} ({clearedList.length})</button>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Real Applicant Name, Form No..." className="flex-1 border-2 border-emerald-300 px-4 py-2.5 rounded-xl text-sm font-bold" />
        <button onClick={loadApplicants} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black">Refresh - Only Real Applicants (No 304 Dummy)</button>
      </div>

      <div className="bg-white border-2 rounded-2xl p-3">
        <p className="text-xs font-bold text-slate-600">Showing ONLY applicants submitted via website - No Staff - No Admin-created Students - Count: {filtered.length} real applicants</p>
        {filtered.length===0 && <p className="text-center py-10 text-slate-400">No real applicants yet - Submit new application to test. Old 304 dummy removed.</p>}
        <div className="grid md:grid-cols-2 gap-2 mt-2">
          {filtered.map((app:any)=>(
            <div key={app.id||app.formNo} className="border rounded-xl p-3 flex justify-between items-center">
              <div>
                <p className="font-black uppercase text-sm">{app.fullName||app.full_name}</p>
                <p className="font-mono text-xs text-emerald-800">{app.formNo||app.form_no}</p>
                <p className="text-[11px]">{app.email}</p>
                <p className="text-[10px]">Status: {app.status}</p>
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={()=>setSelected(app)} className="px-3 py-1 bg-slate-800 text-white rounded text-[11px]">View</button>
                {tab==='PENDING' && <button onClick={()=>handleClear(app)} className="px-3 py-1 bg-emerald-700 text-white rounded text-[11px]">Clear as {bursarName.split(' ')[0]}</button>}
                {tab==='CLEARED' && <button onClick={()=>printBursarReceipt(app)} className="px-3 py-1 bg-amber-500 text-black rounded text-[11px] font-black">Print with {bursarName.split(' ')[0]} name</button>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <div className="bg-white border-2 rounded-2xl p-5">
          <h3 className="font-black uppercase">{selected.fullName||selected.full_name} - Cleared by {bursarName}</h3>
          <p className="text-xs">Form: {selected.formNo||selected.form_no}</p>
          <p className="text-xs">Bursar who cleared: <strong>{selected.bursarClearedBy||bursarName} - {bursarEmail}</strong></p>
          <div className="flex gap-2 mt-3">
            <button onClick={()=>printBursarReceipt(selected)} className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-black text-sm">🖨️ Print Receipt Carrying Bursar Name: {bursarName}</button>
            <button onClick={()=>setSelected(null)} className="px-4 py-3 bg-gray-200 rounded-xl text-xs">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BursarApplicantManager;

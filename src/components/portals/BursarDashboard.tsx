import React, { useState, useEffect } from 'react';
import { getSupabase, supabase } from '../../lib/supabase';
import { StorageService } from '../../services/storage';
import { COLLEGE_CONFIG } from '../../types';

interface FeeConfig { id: string; name: string; amount: number; type: 'APPLICATION' | 'SCREENING' | 'STUDENT' | 'SCHOOL'; bank: string; account: string; level?: string; session?: string; }
interface StudentUser { id: string; fullName: string; matricNumber: string; level: string; sex: string; stateOfOrigin: string; lga: string; staffImage: string; department: string; phone: string; email: string; created_by: string; }

export const BursarFeeManager: React.FC = () => {
  const [tab, setTab] = useState<'students' | 'application_fee' | 'screening_fee' | 'cleared' | 'all' | 'set_fees'>('students');
  const [applicants, setApplicants] = useState<any[]>([]);
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [search, setSearch] = useState('');
  const [searchStudent, setSearchStudent] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentUser | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showStudentPayModal, setShowStudentPayModal] = useState(false);
  const [modalType, setModalType] = useState<'APPLICATION' | 'SCREENING' | 'SCHOOL'>('APPLICATION');
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);

  // VARIABLE FEES - INCLUDING SCHOOL FEES
  const [fees, setFees] = useState<FeeConfig[]>(() => {
    const saved = localStorage.getItem('lcns_fee_config_v2');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'app', name: 'Application Form Fee', amount: 10000, type: 'APPLICATION', bank: 'Zenith Bank', account: '1018894231' },
      { id: 'screen', name: 'Screening & CBT Fee', amount: 15000, type: 'SCREENING', bank: 'Zenith Bank', account: '1018894231' },
      { id: 'nd1_fees', name: 'ND1 School Fees - First Year', amount: 150000, type: 'SCHOOL', bank: 'Zenith Bank', account: '1018894231', level: 'ND1', session: '2026/2027' },
      { id: 'nd2_fees', name: 'ND2 School Fees - Second Year', amount: 120000, type: 'SCHOOL', bank: 'Zenith Bank', account: '1018894231', level: 'ND2', session: '2026/2027' },
      { id: 'hnd1_fees', name: 'HND1 School Fees', amount: 130000, type: 'SCHOOL', bank: 'Zenith Bank', account: '1018894231', level: 'HND1', session: '2026/2027' },
      { id: 'hnd2_fees', name: 'HND2 School Fees', amount: 110000, type: 'SCHOOL', bank: 'Zenith Bank', account: '1018894231', level: 'HND2', session: '2026/2027' },
    ];
  });

  const saveFees = (nf: FeeConfig[]) => { setFees(nf); localStorage.setItem('lcns_fee_config_v2', JSON.stringify(nf)); localStorage.setItem('lcns_fee_config', JSON.stringify(nf)); };

  const appFee = fees.find(f => f.type === 'APPLICATION') || fees[0];
  const screenFee = fees.find(f => f.type === 'SCREENING') || fees[1];
  const schoolFees = fees.filter(f => f.type === 'SCHOOL');

  const currentUser = (() => { try { return StorageService.getCurrentUser() || { fullName: 'Bursar', email: 'bursar@lcns.edu.ng' }; } catch { return { fullName: 'Bursar', email: 'bursar@lcns.edu.ng' }; } })();
  const bursarName = (currentUser?.fullName || 'BURSAR').toString().toUpperCase();
  const currentSession = localStorage.getItem('lcns_current_session') || COLLEGE_CONFIG.CURRENT_SESSION || '2026/2027';
  const currentSemester = localStorage.getItem('lcns_current_semester') || 'First Semester';

  const load = async () => {
    setLoading(true);
    try {
      // Load Applicants
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
      // Load Students - Only students created by ADMIN with current level
      const sb = getSupabase();
      if (sb) {
        const { data: usersData, error } = await sb.from('users').select('*').eq('role', 'STUDENT').order('created_at', { ascending: false });
        if (!error && usersData) {
          const filteredStudents = usersData
            .filter((u: any) => (u.created_by || 'ADMIN') === 'ADMIN')
            .map((u: any) => ({
              id: u.id,
              fullName: u.full_name || u.fullName,
              matricNumber: u.matric_no || u.matricNumber || '',
              level: u.level || 'ND1',
              sex: u.sex || '',
              stateOfOrigin: u.state_of_origin || u.stateOfOrigin || '',
              lga: u.lga || '',
              staffImage: u.staff_image || u.staffImage || '',
              department: u.department || 'Nursing',
              phone: u.phone || '',
              email: u.email || '',
              created_by: u.created_by || 'ADMIN'
            }));
          setStudents(filteredStudents);
        }
      } else {
        // Fallback local
        try {
          const localUsers = JSON.parse(localStorage.getItem('lcns_users') || '[]');
          const s = localUsers.filter((u: any) => u.role === 'STUDENT' && (u.created_by || 'ADMIN') === 'ADMIN').map((u: any) => ({
            id: u.id, fullName: u.fullName, matricNumber: u.matricNumber, level: u.level, sex: u.sex, stateOfOrigin: u.stateOfOrigin, lga: u.lga, staffImage: u.staffImage, department: u.department, phone: u.phone, email: u.email, created_by: u.created_by || 'ADMIN'
          }));
          setStudents(s);
        } catch {}
      }
      // Load payments
      try {
        const p = JSON.parse(localStorage.getItem('lcns_school_fees_payments') || '[]');
        setPayments(p);
      } catch {}
    } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  // BURSAR STUDENT SCHOOL FEES LOGIC
  const getFeeForLevel = (level: string) => {
    return schoolFees.find(f => f.level === level) || schoolFees[0] || { amount: 150000, name: `${level} School Fees` };
  };

  const hasPaid = (matric: string, level: string, session: string) => {
    return payments.find((p: any) => p.matric_no === matric && p.level === level && p.session === session);
  };

  const handlePaySchoolFees = async (student: StudentUser) => {
    const feeConfig = getFeeForLevel(student.level);
    const session = currentSession;
    const existing = hasPaid(student.matricNumber, student.level, session);
    if (existing) {
      if (!confirm(`Student ${student.fullName} (${student.matricNumber}) already paid for ${student.level} - ${session}\nReceipt: ${existing.receipt_no}\nPay again?`)) return;
    }
    if (!confirm(`Pay School Fees for:\nName: ${student.fullName}\nMatric: ${student.matricNumber}\nLevel: ${student.level} (Current Level)\nSession: ${session}\nFee: ${feeConfig.name} - ₦${feeConfig.amount.toLocaleString()}\n\nConfirm?`)) return;

    const receiptNo = `LCNS/FEES/${student.level}/${new Date().getFullYear()}/${student.matricNumber.replace(/\//g,'-')}/${Date.now().toString().slice(-5)}`;
    const payment = {
      id: Date.now().toString(),
      user_name: student.fullName,
      matric_no: student.matricNumber,
      level: student.level,
      session: session,
      semester: currentSemester,
      fee_name: feeConfig.name,
      amount: feeConfig.amount,
      amount_paid: feeConfig.amount,
      status: 'PAID',
      receipt_no: receiptNo,
      payment_type: 'SCHOOL_FEES',
      balance: 0,
      bursar_name: bursarName,
      created_at: new Date().toISOString(),
      sex: student.sex,
      state: student.stateOfOrigin,
      lga: student.lga,
      department: student.department
    };
    const updated = [payment, ...payments];
    setPayments(updated);
    localStorage.setItem('lcns_school_fees_payments', JSON.stringify(updated));
    
    // Save to Supabase if available
    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from('school_settings').upsert({
          key: `payment_${receiptNo}`,
          value: JSON.stringify(payment),
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });
      } catch {}
    }
    alert(`✅ School Fees Paid!\n${student.fullName}\n${student.matricNumber}\nLevel: ${student.level}\nSession: ${session}\nAmount: ₦${feeConfig.amount.toLocaleString()}\nReceipt: ${receiptNo}`);
    printStudentReceipt(payment, student);
    setShowStudentPayModal(false);
  };

  const printStudentReceipt = (payment: any, student: StudentUser | any) => {
    const win = window.open('', '_blank'); if (!win) return;
    win.document.write(`<html><head><title>${payment.receipt_no}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        body{font-family:'Inter',Arial,sans-serif;padding:0;margin:0;background:#f8fafc}
        .receipt{max-width:800px;margin:20px auto;background:white;border:3px solid #0a4d2e;border-radius:16px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.1)}
        .header{background:linear-gradient(135deg,#0a4d2e 0%,#064e3b 100%);color:white;padding:20px;text-align:center;position:relative}
        .header-top{display:flex;justify-content:space-between;align-items:center}
        .logo{width:80px;height:80px;background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#0a4d2e;display:flex;align-items:center;justify-content:center;border-radius:50%;font-weight:900;font-size:28px;border:4px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.2)}
        .college-info{text-align:center;flex:1}
        .college-info h1{font-size:20px;font-weight:900;margin:0;text-transform:uppercase;letter-spacing:1px}
        .college-info h2{font-size:12px;font-weight:700;margin:4px 0;color:#fbbf24}
        .college-info p{font-size:10px;margin:2px 0;opacity:0.9}
        .receipt-title{margin-top:15px;background:rgba(0,0,0,0.2);padding:8px 20px;border-radius:30px;display:inline-block;font-size:12px;font-weight:900;letter-spacing:1px}
        .body{padding:24px}
        .receipt-no-bar{background:#0a4d2e;color:white;padding:10px 20px;border-radius:12px;text-align:center;font-weight:900;font-size:12px;margin-bottom:20px;display:flex;justify-content:space-between}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:15px 0}
        .field{background:#f8fafc;border:1px solid #e2e8f0;padding:12px;border-radius:10px}
        .field-label{font-size:9px;text-transform:uppercase;font-weight:900;color:#64748b;letter-spacing:0.5px;margin-bottom:4px}
        .field-value{font-size:13px;font-weight:800;color:#0f172a}
        .field-value.highlight{color:#0a4d2e;font-size:16px}
        .amount-box{background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:2px solid #0a4d2e;border-radius:12px;padding:15px;text-align:center;margin:20px 0}
        .amount-box .label{font-size:10px;font-weight:900;color:#0a4d2e;text-transform:uppercase}
        .amount-box .amount{font-size:28px;font-weight:900;color:#0a4d2e;margin:5px 0}
        .student-photo{width:100px;height:120px;border:3px solid #0a4d2e;border-radius:12px;object-fit:cover}
        .photo-placeholder{width:100px;height:120px;background:#e2e8f0;border:3px dashed #94a3b8;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#64748b;text-align:center}
        .footer{margin-top:25px;display:flex;justify-content:space-between;padding-top:20px;border-top:2px dashed #e2e8f0}
        .sig{width:160px;text-align:center}
        .sig-line{border-top:1.5px solid #0f172a;margin-top:45px;padding-top:6px;font-size:10px;font-weight:700}
        .sig-title{font-size:8px;color:#64748b;text-transform:uppercase;font-weight:900}
        .verified{position:absolute;top:15px;right:15px;background:#fbbf24;color:#0a4d2e;padding:6px 14px;border-radius:20px;font-size:10px;font-weight:900;transform:rotate(8deg);border:2px solid white}
        .watermark{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);font-size:100px;font-weight:900;color:rgba(10,77,46,0.04);pointer-events:none;z-index:0}
        @media print{body{background:white}.receipt{box-shadow:none;border:2px solid #0a4d2e;margin:0;max-width:100%}button{display:none}.no-print{display:none}}
      </style></head><body>
      <div class="receipt">
        <div class="header">
          <div class="verified">✓ VERIFIED & PAID</div>
          <div class="header-top">
            <div class="logo">LCNS</div>
            <div class="college-info">
              <h1>Labe College of Nursing Sciences</h1>
              <h2>Catholic Diocese of Gboko</h2>
              <p>Km 2, Gboko - Aliade Road, P.M.B. 101, Gboko, Benue State</p>
              <p>Email: info@labecollege.edu.ng | Website: www.labecollege.edu.ng | Tel: +234 803 123 4567</p>
              <p>Motto: Knowledge, Faith & Service | Accredited by NMCN & NBTE</p>
            </div>
            <div class="logo">LCNS</div>
          </div>
          <div class="receipt-title">OFFICIAL SCHOOL FEES RECEIPT - BURSARY DEPARTMENT - ${payment.session} ACADEMIC SESSION</div>
        </div>
        <div class="body" style="position:relative">
          <div class="watermark">LCNS PAID</div>
          <div class="receipt-no-bar">
            <span>Receipt No: ${payment.receipt_no}</span>
            <span>Date: ${new Date(payment.created_at).toLocaleString()}</span>
            <span>Session: ${payment.session} | ${payment.semester}</span>
          </div>
          
          <div style="display:flex;gap:20px">
            <div style="flex:1">
              <div class="grid">
                <div class="field"><div class="field-label">Student Full Name</div><div class="field-value">${payment.user_name}</div></div>
                <div class="field"><div class="field-label">Matric Number (Auto LCNS/LEVEL/YEAR/ID)</div><div class="field-value" style="font-family:monospace;color:#0a4d2e">${payment.matric_no}</div></div>
                <div class="field"><div class="field-label">Level - Current Level After Promotion</div><div class="field-value highlight">${payment.level}</div></div>
                <div class="field"><div class="field-label">Department / Program</div><div class="field-value">${payment.department || 'Nursing Sciences'}</div></div>
                <div class="field"><div class="field-label">Sex</div><div class="field-value">${payment.sex || student.sex || ''}</div></div>
                <div class="field"><div class="field-label">State of Origin / LGA</div><div class="field-value">${payment.state || student.stateOfOrigin || ''} / ${payment.lga || student.lga || ''}</div></div>
                <div class="field"><div class="field-label">Academic Session & Semester</div><div class="field-value">${payment.session} - ${payment.semester}</div></div>
                <div class="field"><div class="field-label">Payment Type</div><div class="field-value">SCHOOL FEES - ${payment.fee_name}</div></div>
              </div>
              
              <div class="amount-box">
                <div class="label">Amount Paid - School Fees - Bursar Verified</div>
                <div class="amount">₦${payment.amount.toLocaleString()}</div>
                <div class="label" style="margin-top:5px">Payment Status: ${payment.status} | Balance: ₦${payment.balance?.toLocaleString() || '0'} | Bursar: ${payment.bursar_name}</div>
              </div>

              <div style="background:#fffbeb;border:1px solid #fbbf24;padding:12px;border-radius:10px;font-size:11px;line-height:1.5">
                <b style="color:#92400e">Note:</b> This is official receipt for <b>${payment.fee_name}</b> for <b>${payment.level}</b> - <b>${payment.session}</b>. Student <b>${payment.user_name}</b> with Matric <b>${payment.matric_no}</b> has paid school fees of <b>₦${payment.amount.toLocaleString()}</b>. This receipt is valid for academic clearance, hostel allocation, and examination entry. Keep this receipt safe. Reprint available at Bursary Department.
              </div>
            </div>
            
            <div style="width:120px;text-align:center">
              <div style="font-size:9px;font-weight:900;text-transform:uppercase;color:#64748b;margin-bottom:8px">Student Photo</div>
              ${student.staffImage ? `<img src="${student.staffImage}" class="student-photo" />` : `<div class="photo-placeholder">NO PHOTO<br/>${payment.user_name.charAt(0)}</div>`}
              <div style="margin-top:10px;font-size:8px;background:#0a4d2e;color:white;padding:4px 8px;border-radius:20px;font-weight:900">${payment.level} - ${payment.session}</div>
              <div style="margin-top:8px;font-size:9px;font-weight:700">${payment.matric_no}</div>
            </div>
          </div>

          <div class="footer">
            <div class="sig"><div class="sig-title">Bursar Signature & Stamp</div><div class="sig-line">Dr. Isaac M. Agber<br/>Bursar - LCNS<br/>${new Date().toLocaleDateString()}</div></div>
            <div class="sig"><div class="sig-title">College Seal</div><div style="margin-top:10px;width:80px;height:80px;border:2px dashed #0a4d2e;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-left:auto;margin-right:auto;font-size:10px;font-weight:900;color:#0a4d2e">LCNS<br/>OFFICIAL<br/>SEAL</div></div>
            <div class="sig"><div class="sig-title">Student Signature</div><div class="sig-line">Signature<br/>${payment.user_name}<br/>${payment.matric_no}</div></div>
          </div>
          
          <div style="text-align:center;margin-top:20px" class="no-print">
            <button onclick="window.print()" style="background:#0a4d2e;color:white;padding:12px 28px;border-radius:30px;border:none;font-weight:900;cursor:pointer;font-size:12px;box-shadow:0 4px 12px rgba(10,77,46,0.3)">🖨️ Print Official Receipt - ${payment.matric_no} - ${payment.level} - ₦${payment.amount.toLocaleString()} - ${payment.session}</button>
            <p style="font-size:9px;color:#64748b;margin-top:8px">Printed: ${new Date().toLocaleString()} | Receipt: ${payment.receipt_no} | Bursar: ${payment.bursar_name} | LCNS Bursary System - ${payment.session}</p>
          </div>
        </div>
      </div>
    </body></html>`);
    win.document.close();
  };

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
      <div style="text-align:center;margin:12px 0"><span style="background:#0a4d2e;color:white;padding:6px 16px;border-radius:20px;font-size:12px;font-weight:900">Receipt No: ${receiptNo} | ${new Date().toLocaleString()} | ${currentSession}</span></div>
      <div class="grid">
        <div><div class="label">Applicant Name</div><div class="value">${app.full_name}</div></div>
        <div><div class="label">Application Number</div><div class="value" style="font-family:monospace;color:#0a4d2e">${app.form_no}</div></div>
        <div><div class="label">Description - Fee Type</div><div class="value">${description}</div></div>
        <div><div class="label">Amount Paid</div><div class="value" style="font-size:16px;color:#0a4d2e">₦${amount.toLocaleString()}</div></div>
        <div><div class="label">Program</div><div class="value">${app.program || ''}</div></div>
        <div><div class="label">Exam Number</div><div class="value">${app.exam_number || 'To be generated after screening fee clearance'}</div></div>
        <div><div class="label">Payment Status</div><div class="value">PAID & VERIFIED - ${type} FEE</div></div>
        <div><div class="label">Bursar</div><div class="value">${bursarName}</div></div>
      </div>
      <div class="snap"><div class="label" style="margin-bottom:8px">Uploaded Proof - ${app.form_no} - ${description} - ₦${amount.toLocaleString()}</div>${snapUrl ? `<img src="${snapUrl}" />` : `<div style="padding:40px;background:#f1f5f9">No image uploaded - Verified manually by Bursar - ${app.form_no}</div>`}</div>
      <div class="footer"><div><div class="label">Bursar Signature</div><div class="sig">Dr. Isaac M. Agber<br/>Bursar - LCNS</div></div><div><div class="label">Date</div><div style="margin-top:40px;font-weight:800">${new Date().toLocaleString()}</div></div><div><div class="label">Applicant Signature</div><div class="sig">Signature</div></div></div>
      <div style="text-align:center;margin-top:15px"><button onclick="window.print()" style="background:#0a4d2e;color:white;padding:10px 24px;border-radius:20px;border:none;font-weight:900;cursor:pointer">🖨️ Print ${type} Receipt</button></div>
    </body></html>`);
    win.document.close();
  };

  const handleClear = async (app: any, type: 'APPLICATION' | 'SCREENING') => {
    const config = type === 'APPLICATION' ? appFee : screenFee;
    const newExamNo = app.exam_number || `LCNS/${new Date().getFullYear()}/EXM/${Math.floor(1000 + Math.random()*9000)}`;
    if (!confirm(`Clear ${type} FEE for ${app.full_name} (${app.form_no})? Fee: ${config.name} - ₦${config.amount.toLocaleString()}`)) return;
    try {
      const updates = type === 'APPLICATION' ? { bursar_status: 'APPLICATION_CLEARED', status: 'APPLICATION_CLEARED' } : { bursar_status: 'CLEARED', status: 'BURSAR_CLEARED', bursar_cleared: true, exam_number: newExamNo, bursar_cleared_date: new Date().toISOString() };
      await supabase.from('college_applications').update(updates).eq('id', app.id);
      alert(`✅ ${type} FEE CLEARED!`);
      load(); setShowModal(false);
    } catch { alert('Failed'); }
  };

  const openModal = (app: any, type: 'APPLICATION' | 'SCREENING') => { setSelected(app); setModalType(type as any); setShowModal(true); };
  const openStudentPay = (student: StudentUser) => { setSelectedStudent(student); setShowStudentPayModal(true); };

  const applicationFeePending = applicants.filter(a => {
    const hasApp = a.full_application?.paymentReceiptPdfUrl || a.payment_receipt_url || a.application_fee_snap;
    const isPending = a.status === 'PENDING' || a.status === 'PENDING_BURSAR' || a.bursar_status === 'PENDING' || a.bursar_status === 'PENDING_BURSAR' || !a.bursar_status;
    return (hasApp || isPending) && a.bursar_status !== 'CLEARED' && a.status !== 'BURSAR_CLEARED' && a.status !== 'ADMITTED';
  });
  const screeningFeePending = applicants.filter(a => a.screening_fee_snap || (a as any).screening_fee_snap || a.full_application?.screeningFeeSnap);
  const clearedList = applicants.filter(a => a.bursar_status === 'CLEARED' || a.bursar_cleared || a.status === 'BURSAR_CLEARED' || a.status === 'ADMITTED');
  const filteredApplicants = applicants.filter(a => !search || `${a.form_no} ${a.full_name} ${a.email}`.toLowerCase().includes(search.toLowerCase()));
  const filteredStudents = students.filter(s => !searchStudent || `${s.fullName} ${s.matricNumber} ${s.level}`.toLowerCase().includes(searchStudent.toLowerCase()));
  const currentList = tab === 'application_fee' ? applicationFeePending : tab === 'screening_fee' ? screeningFeePending : tab === 'cleared' ? clearedList : filteredApplicants;

  return (
    <div className="max-w-7xl mx-auto p-4 bg-white rounded-2xl shadow space-y-4 border">
      <div className="bg-gradient-to-r from-emerald-950 to-slate-900 text-white rounded-2xl p-5 flex justify-between">
        <div><h2 className="text-xl font-black uppercase">Bursar Dashboard - Students + Applicants - Current Level</h2><p className="text-xs text-emerald-200">Students Created by ADMIN Only - Hide Login Details - Only Name + Level - Current Session: {currentSession} - {currentSemester} | Students: {students.length} | Bursar: {bursarName}</p></div>
        <button onClick={load} className="px-4 py-2 bg-amber-400 text-slate-900 rounded-xl font-black text-xs">Refresh</button>
      </div>

      <div className="flex flex-wrap gap-2 text-xs font-black">
        <button onClick={()=>setTab('students')} className={`px-5 py-3 rounded-xl ${tab==='students'?'bg-[#0a4d2e] text-white ring-4 ring-amber-300':'bg-emerald-50 border-2 border-emerald-600 text-emerald-900'}`}>🎓 Students - Pay School Fees - {students.length} - Name + Level Only - Current Level</button>
        <button onClick={()=>setTab('set_fees')} className={`px-4 py-2.5 rounded-xl ${tab==='set_fees'?'bg-slate-900 text-white ring-2':'bg-white border-2 border-slate-900'}`}>⚙️ Set Fees - School + Form + Screening</button>
        <button onClick={()=>setTab('application_fee')} className={`px-4 py-2.5 rounded-xl ${tab==='application_fee'?'bg-blue-700 text-white ring-2':'bg-blue-50 border-2 border-blue-300 text-blue-800'}`}>📄 Application Fee - Pending ({applicationFeePending.length})</button>
        <button onClick={()=>setTab('screening_fee')} className={`px-4 py-2.5 rounded-xl ${tab==='screening_fee'?'bg-amber-600 text-white ring-2':'bg-amber-50 border-2 border-amber-400 text-amber-900'}`}>🧾 Screening Fee - Pending ({screeningFeePending.length})</button>
        <button onClick={()=>setTab('cleared')} className={`px-4 py-2.5 rounded-xl ${tab==='cleared'?'bg-emerald-700 text-white':'bg-emerald-50 border'}`}>✅ Cleared ({clearedList.length})</button>
      </div>

      {tab==='students' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-amber-50 to-emerald-50 border-2 border-amber-300 p-4 rounded-2xl">
            <h3 className="font-black text-sm uppercase flex items-center gap-2">🎓 Students Created by ADMIN - Current Level - Hide Login Details - Name + Level Only - Pick and Pay School Fees</h3>
            <p className="text-xs mt-1 font-bold text-emerald-800">Bursar sees only students created by ADMIN with current level after promotion (ND1→ND2→HND1→HND2). No password, no email login details. Only Name + Level + Matric + Photo. Pick student → Pay School Fees → Print Receipt with Logo + Complete School Information + Session {currentSession} + Bursar Signature + College Seal.</p>
            <div className="mt-3 flex gap-2">
              <input value={searchStudent} onChange={e=>setSearchStudent(e.target.value)} placeholder="Search Student by Name, Matric Number, Level e.g. ND1, ND2..." className="flex-1 border-2 border-emerald-500 px-4 py-3 rounded-xl text-sm font-bold uppercase" />
              <div className="px-4 py-2 bg-[#0a4d2e] text-white rounded-xl text-xs font-black flex items-center">Total: {filteredStudents.length} / {students.length} Students - Session {currentSession}</div>
            </div>
          </div>

          <div className="overflow-x-auto bg-white rounded-xl border-2">
            <table className="w-full text-xs">
              <thead className="bg-[#0a4d2e] text-white"><tr><th className="p-3 text-left">Photo + Student Name (No Login Details)</th><th className="p-3">Matric No (Auto)</th><th className="p-3">Level Current - After Promotion</th><th className="p-3">Sex / State / LGA (No Password)</th><th className="p-3">Fee Status - {currentSession}</th><th className="p-3 text-center">Action - Pay School Fees + Print Receipt</th></tr></thead>
              <tbody>
                {filteredStudents.map((s)=>{
                  const feeConfig = getFeeForLevel(s.level);
                  const paid = hasPaid(s.matricNumber, s.level, currentSession);
                  return (
                    <tr key={s.id} className={`border-b hover:bg-emerald-50 ${paid?'bg-green-50':''}`}>
                      <td className="p-3">
                        <div className="flex gap-3 items-center">
                          {s.staffImage ? <img src={s.staffImage} className="w-12 h-14 object-cover rounded-xl border-2 border-emerald-700" /> : <div className="w-12 h-14 bg-slate-200 rounded-xl flex items-center justify-center font-black text-[10px]">{s.fullName.charAt(0)}</div>}
                          <div><div className="font-black text-sm uppercase">{s.fullName}</div><div className="text-[10px] text-slate-500 font-bold">{s.department} - Created by ADMIN - Hide Email/Phone Login</div></div>
                        </div>
                      </td>
                      <td className="p-3 font-mono font-black text-[11px] text-emerald-800">{s.matricNumber}<br/><span className="text-[9px] text-slate-500">ID: {s.id.slice(0,6)}</span></td>
                      <td className="p-3 text-center"><span className="px-3 py-1.5 bg-[#0a4d2e] text-white rounded-full font-black text-[11px]">{s.level}</span><div className="text-[10px] mt-1 font-bold text-emerald-700">Current Level - {currentSession}</div><div className="text-[9px] text-slate-500">{s.sex}</div></td>
                      <td className="p-3 text-[11px]"><div className="font-bold">{s.sex}</div><div>{s.stateOfOrigin} / {s.lga}</div><div className="text-[10px] text-slate-400">Login Details Hidden</div></td>
                      <td className="p-3 text-center">
                        {paid ? <div><span className="px-2 py-1 bg-emerald-600 text-white rounded-full text-[10px] font-black">PAID - ₦{paid.amount.toLocaleString()}</span><div className="text-[9px] mt-1 font-mono">{paid.receipt_no.slice(-10)}</div><button onClick={()=>printStudentReceipt(paid, s)} className="mt-1 px-2 py-1 bg-slate-900 text-white rounded text-[9px] font-black">Re-Print</button></div> : <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-[10px] font-black">UNPAID - ₦{feeConfig.amount.toLocaleString()}</span>}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex flex-col gap-1">
                          <button onClick={()=>openStudentPay(s)} className="px-3 py-2 bg-[#0a4d2e] text-white rounded-xl font-black text-[11px] hover:bg-emerald-800">💰 Pay Fees - {s.level} - ₦{feeConfig.amount.toLocaleString()}</button>
                          {paid && <button onClick={()=>printStudentReceipt(paid, s)} className="px-3 py-1.5 bg-amber-600 text-white rounded-xl font-black text-[10px]">🖨️ Print Receipt + Logo + School Info</button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredStudents.length===0 && <div className="p-10 text-center text-slate-400 font-bold">No Students - Only students created by ADMIN will appear here - Current Session {currentSession} - Level Current after promotion</div>}
          </div>

          <div className="bg-slate-50 border-2 p-4 rounded-xl">
            <h4 className="font-black text-xs uppercase">Recent School Fees Payments - Receipts with Logo + Full School Info - {currentSession}</h4>
            <div className="mt-2 grid md:grid-cols-2 gap-2">
              {payments.slice(0,10).map((p:any)=><div key={p.id} className="bg-white border p-3 rounded-xl text-[11px] flex justify-between"><div><b>{p.user_name}</b> - {p.matric_no} - {p.level} - {p.session}<br/>₦{p.amount.toLocaleString()} - {p.receipt_no}</div><button onClick={()=>{ const st = students.find(s=>s.matricNumber===p.matric_no); if(st) printStudentReceipt(p, st); else printStudentReceipt(p, {fullName:p.user_name, matricNumber:p.matric_no, level:p.level, sex:p.sex, stateOfOrigin:p.state, lga:p.lga, staffImage:''}); }} className="px-2 py-1 bg-slate-900 text-white rounded text-[10px]">Print</button></div>)}
              {payments.length===0 && <p className="text-[11px] text-slate-400">No payments yet - Pick student above and pay school fees - Receipt will have logo + complete school information</p>}
            </div>
          </div>
        </div>
      )}

      {tab==='set_fees' && (
        <div className="bg-slate-50 border-2 p-5 rounded-2xl space-y-4">
          <h3 className="font-black text-sm uppercase">⚙️ Set Variable Fee Amounts - School Fees per Level - Form + Screening + School Fees</h3>
          <p className="text-xs bg-emerald-100 border border-emerald-300 p-3 rounded-xl font-bold">Bursar can set ND1 School Fees ₦150k, ND2 ₦120k, HND1 ₦130k, HND2 ₦110k. Each level has different amount. Receipt will show Level Current + Session {currentSession} + Logo + Complete School Information + Bursar Signature + College Seal.</p>
          <div className="grid md:grid-cols-2 gap-4">
            {fees.map((f, idx)=>(
              <div key={f.id} className="bg-white p-4 rounded-xl border-2 space-y-2">
                <label className="text-[11px] font-black uppercase">{f.type} Fee - Level {f.level || 'ALL'} - Name for Receipt</label>
                <input value={f.name} onChange={e=>{ const nf=[...fees]; nf[idx].name=e.target.value; saveFees(nf); }} className="w-full border px-3 py-2 rounded-lg text-sm font-bold"/>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-[10px] font-bold">Amount - Variable</label><input type="number" value={f.amount} onChange={e=>{ const nf=[...fees]; nf[idx].amount=parseInt(e.target.value)||0; saveFees(nf); }} className="w-full border-2 border-amber-400 px-3 py-2.5 rounded-xl font-black text-lg" /></div>
                  <div><label className="text-[10px] font-bold">Level (for SCHOOL)</label><select value={f.level||''} onChange={e=>{ const nf=[...fees]; nf[idx].level=e.target.value; saveFees(nf); }} className="w-full border px-3 py-2.5 rounded-xl text-xs"><option value="">ALL</option><option>ND1</option><option>ND2</option><option>HND1</option><option>HND2</option></select></div>
                </div>
                <p className="text-[11px] text-emerald-700 font-bold">Current: ₦{f.amount.toLocaleString()} - Level: {f.level || 'ALL'} - Session: {currentSession} - Receipt with Logo + School Info</p>
                <div className="flex gap-2"><span className="text-[10px] bg-slate-100 px-2 py-1 rounded-full font-bold">{f.type}</span><span className="text-[10px] bg-emerald-100 px-2 py-1 rounded-full font-bold">{f.bank}</span></div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={()=>{ const nf=[...fees, {id:Date.now().toString(), name:'ND1 School Fees', amount:150000, type:'SCHOOL', bank:'Zenith Bank', account:'1018894231', level:'ND1', session: currentSession}]; saveFees(nf); }} className="px-4 py-2 bg-emerald-700 text-white rounded-lg font-black text-xs">+ Add School Fee for Level</button>
            <button onClick={()=>{ if(confirm('Reset fees?')) saveFees([{id:'app',name:'Application Form Fee',amount:10000,type:'APPLICATION',bank:'Zenith Bank',account:'1018894231'},{id:'screen',name:'Screening & CBT Fee',amount:15000,type:'SCREENING',bank:'Zenith Bank',account:'1018894231'},{id:'nd1_fees',name:'ND1 School Fees - First Year',amount:150000,type:'SCHOOL',bank:'Zenith Bank',account:'1018894231',level:'ND1',session:currentSession},{id:'nd2_fees',name:'ND2 School Fees - Second Year',amount:120000,type:'SCHOOL',bank:'Zenith Bank',account:'1018894231',level:'ND2',session:currentSession}]); }} className="px-4 py-2 bg-slate-200 rounded-lg font-black text-xs">Reset</button>
          </div>
        </div>
      )}

      {tab!=='students' && tab!=='set_fees' && (
        <>
          <div className="flex gap-2">
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by Application Number for Bursar Clearance" className="flex-1 border-2 border-slate-300 px-4 py-2.5 rounded-xl text-sm font-bold uppercase"/>
            <button onClick={load} className="px-4 py-2 bg-slate-800 text-white rounded-xl font-black text-xs">Search</button>
          </div>
          <div className="overflow-x-auto bg-white rounded-xl border-2">
            <table className="w-full text-xs">
              <thead className={`${tab==='application_fee'?'bg-blue-900':tab==='screening_fee'?'bg-amber-600':'bg-emerald-900'} text-white`}><tr><th className="p-3 text-left">Application No</th><th className="p-3 text-left">Applicant</th><th className="p-3">Fee Description</th><th className="p-3">View Receipt</th><th className="p-3">Status</th><th className="p-3">Action</th></tr></thead>
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
                      <td className="p-3"><span className={`px-2 py-1 rounded-full font-black text-[10px] ${feeType==='APPLICATION'?'bg-blue-100 text-blue-800':'bg-amber-100 text-amber-800'}`}>{feeType} FEE - {config.name}</span><div className="text-[11px] font-black mt-1">₦{config.amount.toLocaleString()} - App No: {a.form_no}</div></td>
                      <td className="p-3 text-center">{receiptUrl ? <button onClick={()=>openModal(a, feeType as any)} className="px-3 py-1.5 bg-slate-800 text-white rounded-lg font-black text-[11px]">📄 View</button> : <span className="text-slate-400 text-[11px]">No upload</span>}</td>
                      <td className="p-3"><span className={`px-2 py-1 rounded-full text-[10px] font-black ${a.bursar_status==='CLEARED'?'bg-emerald-100 text-emerald-800':'bg-amber-100 text-amber-800'}`}>{a.bursar_status || a.status}</span><div className="text-[10px] font-mono">{a.exam_number || 'No Exam No'}</div></td>
                      <td className="p-3"><div className="flex flex-wrap gap-1"><button onClick={()=>openModal(a, feeType as any)} className="px-2 py-1 bg-blue-600 text-white rounded text-[10px] font-black">View</button>{receiptUrl && <button onClick={()=>printReceipt(a, feeType as any)} className="px-2 py-1 bg-slate-900 text-white rounded text-[10px] font-black">Print - ₦{config.amount.toLocaleString()}</button>}{receiptUrl && tab!=='cleared' && <button onClick={()=>handleClear(a, feeType as any)} className="px-3 py-1 bg-emerald-700 text-white rounded text-[10px] font-black">Clear</button>}</div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {currentList.length===0 && <div className="p-10 text-center text-slate-400 font-bold">No {tab} records</div>}
          </div>
        </>
      )}

      {showModal && selected && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] overflow-auto shadow-2xl">
            <div className={`sticky top-0 ${modalType==='APPLICATION'?'bg-blue-900':'bg-amber-600'} text-white p-4 rounded-t-2xl flex justify-between`}>
              <div><h3 className="font-black text-lg">{modalType} FEE - {selected.form_no} - ₦{(modalType==='APPLICATION'?appFee:screenFee).amount.toLocaleString()}</h3><p className="text-xs opacity-90">{selected.full_name} - Bursar: {bursarName}</p></div>
              <button onClick={()=>setShowModal(false)} className="bg-white/20 px-3 py-1.5 rounded-xl font-black">✕ Close</button>
            </div>
            <div className="p-5 grid md:grid-cols-2 gap-5">
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border text-xs">
                <h4 className="font-black uppercase">Applicant Details</h4>
                <p><b>Application No:</b> {selected.form_no}</p>
                <p><b>Name:</b> {selected.full_name}</p>
                <p><b>Email:</b> {selected.email} | <b>Phone:</b> {selected.phone}</p>
                <p><b>Program:</b> {selected.program}</p>
                <p><b>Fee:</b> {modalType==='APPLICATION'?appFee.name:screenFee.name} - ₦{(modalType==='APPLICATION'?appFee:screenFee).amount.toLocaleString()}</p>
                <p><b>Status:</b> {selected.status} | {selected.bursar_status}</p>
                {selected.full_application?.passportPhotoUrl && <img src={selected.full_application.passportPhotoUrl} className="w-32 h-40 object-cover rounded-xl border-2 mt-3" alt="Passport"/>}
              </div>
              <div className="space-y-3">
                <h4 className="font-black uppercase text-sm">📄 {modalType} Fee Receipt - {selected.form_no}</h4>
                {(() => {
                  const url = modalType==='APPLICATION' ? (selected.payment_receipt_url || selected.full_application?.paymentReceiptPdfUrl) : (selected.screening_fee_snap || (selected as any).screening_fee_snap || selected.full_application?.screeningFeeSnap);
                  if (!url) return <div className="p-10 border-2 border-dashed rounded-xl text-center"><p className="font-bold text-slate-500">No receipt uploaded</p></div>;
                  const isPdf = url.includes('.pdf') || url.startsWith('data:application/pdf');
                  return <div className="space-y-3"><div className="border-2 rounded-xl overflow-hidden bg-white p-2">{isPdf ? <iframe src={url} className="w-full h-[450px]" title="Receipt"/> : <img src={url} alt={`${modalType} Receipt`} className="w-full max-h-[500px] object-contain mx-auto rounded"/>}</div><div className="flex gap-2"><a href={url} target="_blank" rel="noopener noreferrer" className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black text-center">Open Receipt</a><button onClick={()=>printReceipt(selected, modalType as any)} className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black">🖨️ Print Receipt</button></div></div>;
                })()}
              </div>
            </div>
            <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end gap-2 rounded-b-2xl">
              <button onClick={()=>setShowModal(false)} className="px-5 py-2.5 bg-slate-200 rounded-xl font-black text-xs">Close</button>
              <button onClick={()=>printReceipt(selected, modalType as any)} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-black text-xs">🖨️ Print Receipt</button>
              <button onClick={()=>handleClear(selected, modalType as any)} className="px-6 py-2.5 bg-emerald-700 text-white rounded-xl font-black text-xs">✅ Clear Fee</button>
            </div>
          </div>
        </div>
      )}

      {showStudentPayModal && selectedStudent && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border-2 border-emerald-700 overflow-hidden">
            <div className="bg-[#0a4d2e] text-white p-5 flex justify-between">
              <div><h3 className="font-black text-lg">💰 Pay School Fees - {selectedStudent.level} - Current Level</h3><p className="text-xs text-emerald-200">{selectedStudent.fullName} - {selectedStudent.matricNumber} - Hide Login Details - Only Name + Level</p></div>
              <button onClick={()=>setShowStudentPayModal(false)} className="bg-white/20 px-3 py-1.5 rounded-xl font-black">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-4">
                {selectedStudent.staffImage ? <img src={selectedStudent.staffImage} className="w-24 h-28 object-cover rounded-xl border-2 border-emerald-700" /> : <div className="w-24 h-28 bg-slate-200 rounded-xl flex items-center justify-center font-black">{selectedStudent.fullName.charAt(0)}</div>}
                <div className="flex-1 text-xs space-y-2">
                  <p><b>Student Name:</b> {selectedStudent.fullName} (No Login Details)</p>
                  <p><b>Matric Number:</b> <span className="font-mono font-black text-emerald-800">{selectedStudent.matricNumber}</span></p>
                  <p><b>Level Current:</b> <span className="px-2 py-1 bg-[#0a4d2e] text-white rounded-full font-black">{selectedStudent.level}</span> - After Promotion - Session {currentSession}</p>
                  <p><b>Sex / State / LGA:</b> {selectedStudent.sex} - {selectedStudent.stateOfOrigin} / {selectedStudent.lga}</p>
                  <p><b>Department:</b> {selectedStudent.department}</p>
                </div>
              </div>
              {(() => {
                const feeConfig = getFeeForLevel(selectedStudent.level);
                const paid = hasPaid(selectedStudent.matricNumber, selectedStudent.level, currentSession);
                return (
                  <div className="space-y-3">
                    <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-xl">
                      <p className="text-[11px] font-black uppercase text-amber-800">Fee Details - {currentSession} - {currentSemester}</p>
                      <p className="font-black text-lg mt-1">{feeConfig.name}</p>
                      <p className="text-3xl font-black text-[#0a4d2e] mt-2">₦{feeConfig.amount.toLocaleString()}</p>
                      <p className="text-[11px] mt-2">Bank: {feeConfig.bank} - Account: {feeConfig.account} - Level: {selectedStudent.level} Current</p>
                      {paid && <div className="mt-2 bg-emerald-100 border border-emerald-400 p-2 rounded-lg text-[11px] font-bold text-emerald-800">✅ Already Paid on {new Date(paid.created_at).toLocaleString()} - Receipt: {paid.receipt_no} - Bursar: {paid.bursar_name}</div>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={()=>setShowStudentPayModal(false)} className="flex-1 py-3 bg-slate-200 rounded-xl font-black text-xs">Cancel</button>
                      {!paid ? <button onClick={()=>handlePaySchoolFees(selectedStudent)} className="flex-1 py-3 bg-[#0a4d2e] text-white rounded-xl font-black text-xs">✅ Confirm Pay - ₦{feeConfig.amount.toLocaleString()} - Print Receipt + Logo</button> : <button onClick={()=>{ const p=paid; printStudentReceipt(p, selectedStudent); }} className="flex-1 py-3 bg-amber-600 text-white rounded-xl font-black text-xs">🖨️ Re-Print Receipt - Logo + School Info</button>}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const BursarDashboard = BursarFeeManager;
export default BursarDashboard;

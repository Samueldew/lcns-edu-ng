import React from 'react';
import { CollegeLogo } from './CollegeLogo';

export const gradeSystem = (score: number) => {
  if (score >= 70) return { grade: 'A', point: 4, remark: 'Excellent' };
  if (score >= 60) return { grade: 'B', point: 3, remark: 'Very Good' };
  if (score >= 50) return { grade: 'C', point: 2, remark: 'Good' };
  if (score >= 40) return { grade: 'D', point: 1, remark: 'Pass' };
  return { grade: 'F', point: 0, remark: 'Fail - Carry Over' };
};

export const getClassOfDiploma = (cgpa: number) => {
  if (cgpa >= 3.5) return { class: 'DISTINCTION', desc: 'Distinction 3.50-4.00' };
  if (cgpa >= 3.0) return { class: 'UPPER CREDIT', desc: 'Upper Credit 3.00-3.49' };
  if (cgpa >= 2.5) return { class: 'LOWER CREDIT', desc: 'Lower Credit 2.50-2.99 - Qualified for HND' };
  if (cgpa >= 2.0) return { class: 'PASS', desc: 'Pass 2.00-2.49' };
  return { class: 'FAIL - SPILL OVER', desc: 'Fail Below 2.00 - Spill Over' };
};

export const PrintableResultWithLogo: React.FC<{
  matricNo: string;
  fullName: string;
  level: string;
  program?: string;
  results: any[];
  currentUserRole?: string;
  currentUserName?: string;
  senateApproved?: boolean;
  senateDate?: string;
  senateProvost?: string;
}> = ({ matricNo, fullName, level, program = 'Nursing Sciences', results, currentUserRole = 'EXAM_OFFICER', currentUserName = 'Staff', senateApproved = false, senateDate, senateProvost }) => {

  const calcCGPA = () => {
    let totalCU = 0, totalGP = 0;
    results.forEach((r:any) => {
      const g = gradeSystem(r.score || 0);
      totalCU += r.creditUnit || 3;
      totalGP += (r.creditUnit || 3) * g.point;
    });
    const cgpa = totalCU ? totalGP / totalCU : 0;
    return { cgpa, totalCU, totalGP, classification: getClassOfDiploma(cgpa) };
  };

  const calcSemester = (sem: 'FIRST' | 'SECOND') => {
    const filtered = results.filter((r:any) => (r.semester === sem || r.semester === sem.slice(0,5) || (sem==='FIRST' && r.semester==='First') || (sem==='SECOND' && r.semester==='Second')));
    let cu = 0, gp = 0, carry: any[] = [];
    filtered.forEach((r:any) => {
      const g = gradeSystem(r.score || 0);
      if (g.grade === 'F') carry.push(r);
      cu += r.creditUnit || 3;
      gp += (r.creditUnit || 3) * g.point;
    });
    return { gpa: cu ? gp/cu : 0, cu, gp, carry, courses: filtered };
  };

  const cgpaData = calcCGPA();
  const firstSem = calcSemester('FIRST');
  const secondSem = calcSemester('SECOND');

  const printResult = () => {
    const printContent = document.getElementById(`printable-${matricNo}`)?.innerHTML;
    if (!printContent) return;
    const win = window.open('', '_blank');
    if (!win) { alert('Allow popups'); return; }
    win.document.write(`
      <html><head><title>Result - ${matricNo} - ${fullName}</title>
      <style>
        @page { size: portrait; margin: 15mm; }
        body{font-family:Arial; font-size:11px; color:#000;}
        table{width:100%; border-collapse:collapse; margin-bottom:10px;}
        th,td{border:1px solid #000; padding:5px; text-align:left;}
        th{background:#0a4d2e; color:#fff; text-align:center;}
        .header{text-align:center; border-bottom:3px double #0a4d2e; padding-bottom:10px; margin-bottom:10px;}
        .logo{display:flex; align-items:center; justify-content:center; gap:20px;}
        .carry{color:red; font-weight:bold;}
        .badge{padding:4px 8px; border-radius:12px; font-weight:bold; font-size:10px;}
        .footer{display:flex; justify-content:space-between; margin-top:30px; text-align:center; font-size:10px;}
        .stamp{border:2px dashed #0a4d2e; padding:10px; text-align:center; background:#f0faf0;}
      </style>
      </head><body>${printContent}</body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(()=>win.print(), 600);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button onClick={printResult} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black flex items-center gap-2">
          🖨️ Print Individual Result - {currentUserRole} - {matricNo} - Labe College of Nursing Sciences - Catholic Diocese of Gboko - Logo
        </button>
        <span className="px-3 py-2 bg-emerald-50 border rounded-xl text-[10px] font-bold">
          {currentUserRole} can print - {fullName} - CGPA {cgpaData.cgpa.toFixed(2)} - {cgpaData.classification.class}
        </span>
      </div>

      <div id={`printable-${matricNo}`} className="bg-white border-4 border-double border-emerald-900 rounded-2xl p-6 space-y-4">
        {/* CORRECTED SCHOOL NAME + LOGO APPEARS - ALL PRINTED DOCUMENTS */}
        <div className="header">
          <div className="logo">
            <CollegeLogo size="lg" />
            <div className="text-center">
              <h1 className="text-[20px] font-black uppercase text-emerald-950 leading-none">Labe College of Nursing Sciences</h1>
              <h2 className="text-[14px] font-bold uppercase text-emerald-800 leading-tight mt-1">Catholic Diocese of Gboko</h2>
              <p className="text-[12px] font-black text-slate-800 mt-1">Gboko, Benue State • Nigeria</p>
              <p className="text-[10px] font-bold text-slate-600 mt-1">P.M.B 102, Gboko | Motto: "Learn, Serve & Save" | Email: info@lcns.edu.ng | Website: www.lcns.edu.ng</p>
              <p className="text-[9px] font-semibold text-slate-500">Accredited by Nursing and Midwifery Council of Nigeria & NBTE - ND/HND Nursing Sciences (Non-Terminal)</p>
            </div>
            <CollegeLogo size="lg" />
          </div>
          <div className="mt-3 flex justify-center gap-2 flex-wrap">
            <span className="bg-emerald-900 text-white px-4 py-1 rounded-full text-xs font-black">STUDENT ACADEMIC RESULT - INDIVIDUAL</span>
            <span className="bg-amber-400 text-black px-3 py-1 rounded-full text-xs font-black">Matric: {matricNo}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-black ${cgpaData.classification.class.includes('DISTINCTION')?'bg-green-600 text-white': cgpaData.classification.class.includes('UPPER')?'bg-blue-600 text-white': cgpaData.classification.class.includes('LOWER')?'bg-yellow-500 text-black':'bg-slate-800 text-white'}`}>{cgpaData.classification.class} - CGPA {cgpaData.cgpa.toFixed(2)}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${senateApproved?'bg-emerald-100 text-emerald-800 border-2 border-emerald-600':'bg-red-50 text-red-700 border-2 border-red-300'}`}>{senateApproved?`✅ Senate Approved by ${senateProvost||'Provost'} on ${senateDate?new Date(senateDate).toLocaleDateString():''}`:'🔒 Awaiting Senate Ratification'}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border text-xs">
          <div><span className="text-[10px] text-slate-500 block">Student Name:</span><strong className="uppercase text-sm">{fullName}</strong></div>
          <div><span className="text-[10px] text-slate-500 block">Matric No:</span><strong className="font-mono text-emerald-800">{matricNo}</strong></div>
          <div><span className="text-[10px] text-slate-500 block">Level / Program:</span><strong>{level} - {program}</strong></div>
          <div><span className="text-[10px] text-slate-500 block">Printed By Role:</span><strong className="uppercase">{currentUserRole} - {currentUserName}</strong></div>
          <div><span className="text-[10px] text-slate-500 block">First Sem GPA:</span><strong>{firstSem.gpa.toFixed(2)} - CU: {firstSem.cu}</strong></div>
          <div><span className="text-[10px] text-slate-500 block">Second Sem GPA:</span><strong>{secondSem.gpa.toFixed(2)} - CU: {secondSem.cu}</strong></div>
          <div><span className="text-[10px] text-slate-500 block">CGPA:</span><strong className="text-emerald-800 text-sm">{cgpaData.cgpa.toFixed(2)} / 4.00</strong></div>
          <div><span className="text-[10px] text-slate-500 block">Class of Diploma:</span><strong className={cgpaData.classification.class.includes('FAIL')?'text-red-600':'text-emerald-800'}>{cgpaData.classification.class}</strong></div>
        </div>

        <div>
          <h4 className="font-black text-sm bg-emerald-900 text-white px-3 py-1 rounded">FIRST SEMESTER - GPA {firstSem.gpa.toFixed(2)} - Carry Overs: {firstSem.carry.length || 'None'}</h4>
          <table><thead><tr><th>Course Code</th><th>Course Title</th><th>CU</th><th>Score</th><th>Grade</th><th>Point</th><th>GP</th><th>Remark</th></tr></thead>
            <tbody>
              {firstSem.courses.map((r:any)=>{const g=gradeSystem(r.score||0); return (<tr key={r.id||r.courseCode}><td className="font-mono font-bold">{r.courseCode}</td><td>{r.courseTitle||r.title||''}</td><td className="text-center">{r.creditUnit||3}</td><td className="text-center font-bold">{r.score||0}</td><td className="text-center font-black">{g.grade}</td><td className="text-center">{g.point}</td><td className="text-center font-bold">{(r.creditUnit||3)*g.point}</td><td className={g.grade==='F'?'carry':''}>{g.remark}</td></tr>);})}
              {firstSem.courses.length===0 && <tr><td colSpan={8} className="text-center text-slate-400">No courses for First Semester</td></tr>}
            </tbody>
          </table>
        </div>

        <div>
          <h4 className="font-black text-sm bg-blue-900 text-white px-3 py-1 rounded">SECOND SEMESTER - GPA {secondSem.gpa.toFixed(2)} - Carry Over from First Auto Reflects</h4>
          <table><thead><tr><th>Course Code</th><th>Course Title</th><th>CU</th><th>Score</th><th>Grade</th><th>Point</th><th>GP</th><th>Remark</th></tr></thead>
            <tbody>
              {secondSem.courses.map((r:any)=>{const g=gradeSystem(r.score||0); return (<tr key={r.id||r.courseCode}><td className="font-mono font-bold">{r.courseCode}</td><td>{r.courseTitle||r.title||''}</td><td className="text-center">{r.creditUnit||3}</td><td className="text-center font-bold">{r.score||0}</td><td className="text-center font-black">{g.grade}</td><td className="text-center">{g.point}</td><td className="text-center font-bold">{(r.creditUnit||3)*g.point}</td><td className={g.grade==='F'?'carry':''}>{g.remark}</td></tr>);})}
              {firstSem.carry.length>0 && <tr><td colSpan={8} className="carry">⚠️ CARRY OVER FROM FIRST SEMESTER AUTO REFLECTS HERE: {firstSem.carry.map((c:any)=>`${c.courseCode} - Score ${c.score} - F`).join(', ')} - Student must retake</td></tr>}
              {secondSem.courses.length===0 && <tr><td colSpan={8} className="text-center text-slate-400">No courses for Second Semester</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="stamp">
          <h3 className="font-black">FINAL CGPA & CLASSIFICATION - ND/HND NURSING - Labe College of Nursing Sciences - Catholic Diocese of Gboko - Gboko, Benue State • Nigeria</h3>
          <p>Total Credit Units: {cgpaData.totalCU} | Total Grade Points: {cgpaData.totalGP} | CGPA: {cgpaData.cgpa.toFixed(2)} / 4.00</p>
          <p style={{ background: cgpaData.classification.class.includes('DISTINCTION')?'#166534': cgpaData.classification.class.includes('UPPER')?'#1e40af': cgpaData.classification.class.includes('LOWER')?'#854d0e':'#000', color:'#fff', padding:'8px', fontWeight:'bold', marginTop:'5px' }}>CLASS OF DIPLOMA: {cgpaData.classification.class} - {cgpaData.classification.desc}</p>
          <p className="text-[10px] mt-2">Labe College of Nursing Sciences - Catholic Diocese of Gboko - Gboko, Benue State • Nigeria | Distinction 3.50-4.00, Upper Credit 3.00-3.49, Lower Credit 2.50-2.99 (Qualified for HND), Pass 2.00-2.49</p>
        </div>

        <div className="footer">
          <div><div style={{ borderTop:'1px solid #000', width:'150px', paddingTop:'5px' }}><b>Exam Officer</b><br/><span>Dr. Emmanuel Agada</span><br/><span style={{ fontSize:'8px' }}>Compiled Broadsheet - GPA Calculated</span></div></div>
          <div><div style={{ borderTop:'1px solid #000', width:'150px', paddingTop:'5px' }}><b>HOD</b><br/><span>Head of Department</span><br/><span style={{ fontSize:'8px' }}>Moderated Result</span></div></div>
          <div><div style={{ borderTop:'1px solid #000', width:'150px', paddingTop:'5px' }}><b>Registrar</b><br/><span>College Registrar</span><br/><span style={{ fontSize:'8px' }}>Verified & Forwarded to Senate</span></div></div>
          <div><div style={{ borderTop:'1px solid #000', width:'150px', paddingTop:'5px' }}><b>Provost - Final Approval</b><br/><span>{senateProvost||'Mrs Terna Fiase'}</span><br/><span style={{ fontSize:'8px' }}>{senateApproved?`Senate Approved on ${senateDate?new Date(senateDate).toLocaleDateString():''}`:'Awaiting Senate Ratification'}</span></div></div>
        </div>

        <p className="text-[9px] text-center text-slate-500 mt-4">This individual result slip with school name Labe College of Nursing Sciences - Catholic Diocese of Gboko - Gboko, Benue State • Nigeria and logo appears is officially printed by {currentUserRole} ({currentUserName}) - Matric: {matricNo} - {fullName} - CGPA {cgpaData.cgpa.toFixed(2)} - {cgpaData.classification.class} - Printed on {new Date().toLocaleString()} - Valid only when Senate Approved by Provost</p>
      </div>
    </div>
  );
};

export default PrintableResultWithLogo;

import React, { useState, useEffect } from 'react';
import { Search, Download, CheckCircle, Send, Calculator, FileText, Award, GraduationCap } from 'lucide-react';

// GRADING - POLYTECHNIC - 70-100=A, 60-69=B, 50-59=C, 40-49=D, 0-39=F
export const gradeSystem = (score: number) => {
  if (score >= 70) return { grade: 'A', point: 4, remark: 'Excellent', class: 'Distinction' };
  if (score >= 60) return { grade: 'B', point: 3, remark: 'Very Good', class: 'Upper Credit' };
  if (score >= 50) return { grade: 'C', point: 2, remark: 'Good', class: 'Lower Credit' };
  if (score >= 40) return { grade: 'D', point: 1, remark: 'Pass', class: 'Pass' };
  return { grade: 'F', point: 0, remark: 'Fail - Carry Over', class: 'Fail' };
};

// CGPA CLASSIFICATION - NBTE FOR ND/HND NURSING
export const getClassOfDiploma = (cgpa: number) => {
  if (cgpa >= 3.5) return { class: 'DISTINCTION', color: 'bg-green-600 text-white', desc: 'Distinction - 3.50 - 4.00' };
  if (cgpa >= 3.0) return { class: 'UPPER CREDIT', color: 'bg-blue-600 text-white', desc: 'Upper Credit - 3.00 - 3.49' };
  if (cgpa >= 2.5) return { class: 'LOWER CREDIT', color: 'bg-yellow-500 text-black', desc: 'Lower Credit - 2.50 - 2.99 - Qualified for HND' };
  if (cgpa >= 2.0) return { class: 'PASS', color: 'bg-orange-500 text-white', desc: 'Pass - 2.00 - 2.49' };
  return { class: 'FAIL - SPILL OVER', color: 'bg-red-600 text-white', desc: 'Fail - Below 2.00 - Spill Over' };
};

type CourseResult = {
  id: string; matricNo: string; fullName: string; courseCode: string; courseTitle: string;
  creditUnit: number; score: number; semester: 'FIRST' | 'SECOND'; level: string;
  session: string; status: 'LECTURER_SUBMITTED' | 'EXAM_OFFICER_CALCULATED' | 'HOD_REVIEWED' | 'REGISTRAR_REVIEWED' | 'PROVOST_PUBLISHED';
};

export const ResultComputationManager: React.FC<{ currentUser?: any }> = ({ currentUser }) => {
  const role = (currentUser?.role || 'EXAM_OFFICER').toUpperCase();
  const [results, setResults] = useState<CourseResult[]>(() => {
    try { return JSON.parse(localStorage.getItem('lcns_results') || '[]'); } catch { return []; }
  });
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [semesterFilter, setSemesterFilter] = useState<'ALL' | 'FIRST' | 'SECOND'>('ALL');

  const save = (data: CourseResult[]) => {
    localStorage.setItem('lcns_results', JSON.stringify(data));
    setResults(data);
  };

  useEffect(() => {
    if (results.length === 0) {
      const sample: CourseResult[] = [
        { id: '1', matricNo: 'LCNS/2026/ND1/001', fullName: 'OKONKWO JOHN CHUKWU', courseCode: 'NUR111', courseTitle: 'Foundation of Nursing I', creditUnit: 3, score: 75, semester: 'FIRST', level: 'ND1', session: '2026/2027', status: 'LECTURER_SUBMITTED' },
        { id: '2', matricNo: 'LCNS/2026/ND1/001', fullName: 'OKONKWO JOHN CHUKWU', courseCode: 'ANA112', courseTitle: 'Anatomy and Physiology I', creditUnit: 3, score: 35, semester: 'FIRST', level: 'ND1', session: '2026/2027', status: 'LECTURER_SUBMITTED' },
        { id: '3', matricNo: 'LCNS/2026/ND1/001', fullName: 'OKONKWO JOHN CHUKWU', courseCode: 'NUR121', courseTitle: 'Medical Surgical Nursing I', creditUnit: 3, score: 62, semester: 'SECOND', level: 'ND1', session: '2026/2027', status: 'LECTURER_SUBMITTED' },
        { id: '4', matricNo: 'LCNS/2026/ND1/001', fullName: 'OKONKWO JOHN CHUKWU', courseCode: 'NUR122', courseTitle: 'Community Health Nursing', creditUnit: 2, score: 58, semester: 'SECOND', level: 'ND1', session: '2026/2027', status: 'LECTURER_SUBMITTED' },
      ];
      save(sample);
    }
  }, []);

  const calculateStudentResult = (matricNo: string, level: string, semester?: 'FIRST' | 'SECOND') => {
    let filtered = results.filter(r => r.matricNo === matricNo && r.level === level);
    if (semester) filtered = filtered.filter(r => r.semester === semester);
    
    let totalCredit = 0, totalPoint = 0;
    let carryOvers: CourseResult[] = [];
    filtered.forEach(r => {
      const g = gradeSystem(r.score);
      if (g.grade === 'F') carryOvers.push(r);
      totalCredit += r.creditUnit;
      totalPoint += r.creditUnit * g.point;
    });
    const gpa = totalCredit > 0 ? totalPoint / totalCredit : 0;
    return { gpa, totalCredit, totalPoint, carryOvers, count: filtered.length };
  };

  const calculateCGPA = (matricNo: string) => {
    const allLevels = ['ND1', 'ND2', 'HND1', 'HND2'];
    let totalCredit = 0, totalPoint = 0, allCourses: CourseResult[] = [];
    allLevels.forEach(lvl => {
      const res = results.filter(r => r.matricNo === matricNo && r.level === lvl);
      res.forEach(r => {
        const g = gradeSystem(r.score);
        totalCredit += r.creditUnit;
        totalPoint += r.creditUnit * g.point;
        allCourses.push(r);
      });
    });
    const cgpa = totalCredit > 0 ? totalPoint / totalCredit : 0;
    const classification = getClassOfDiploma(cgpa);
    return { cgpa, totalCredit, totalPoint, classification, allCourses };
  };

  const handleExamOfficerCalculate = () => {
    const updated = results.map(r => r.status === 'LECTURER_SUBMITTED' ? { ...r, status: 'EXAM_OFFICER_CALCULATED' as const } : r);
    save(updated);
    alert(`✅ Exam Officer Calculated - GPA, CGPA, Class of Diploma (Distinction/Upper/Lower/Pass) Auto Calculated - Carry Over Auto Reflect`);
  };

  const handleForward = (to: CourseResult['status']) => {
    let from: CourseResult['status'] | null = null;
    if (to === 'HOD_REVIEWED') from = 'EXAM_OFFICER_CALCULATED';
    if (to === 'REGISTRAR_REVIEWED') from = 'HOD_REVIEWED';
    if (to === 'PROVOST_PUBLISHED') from = 'REGISTRAR_REVIEWED';
    if (!from) return;
    const updated = results.map(r => r.status === from ? { ...r, status: to } : r);
    save(updated);
    alert(`✅ Forwarded to ${to}`);
  };

  // MASTER SHEET PDF LANDSCAPE + CLASSIFICATION
  const downloadMasterSheetPDF = () => {
    const filteredData = results.filter(r => {
      if (levelFilter !== 'ALL' && r.level !== levelFilter) return false;
      if (semesterFilter !== 'ALL' && r.semester !== semesterFilter) return false;
      if (search && !`${r.matricNo} ${r.fullName} ${r.courseCode}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    const grouped: Record<string, CourseResult[]> = {};
    filteredData.forEach(r => { if (!grouped[r.matricNo]) grouped[r.matricNo] = []; grouped[r.matricNo].push(r); });

    const html = `
      <html><head><title>Master Sheet + Classification</title>
      <style>@page{size:landscape;} body{font-family:Arial; font-size:9px;} table{width:100%; border-collapse:collapse;} th,td{border:1px solid #000; padding:3px; text-align:center;} th{background:#0a4d2e; color:#fff;} .header{text-align:center;} .carry{color:red; font-weight:bold;}</style>
      </head><body>
      <div class="header"><h2>LABE COLLEGE OF NURSING SCIENCES, GBOKO - ND/HND NURSING</h2><h3>MASTER SHEET - ${levelFilter} - ${semesterFilter} - Grading: 70=A, 60=B, 50=C, 40=D, 0-39=F</h3><p>Printed by ${role} - ${new Date().toLocaleString()} - ${Object.keys(grouped).length} Students</p></div>
      <table><thead><tr><th>S/N</th><th>Matric</th><th>Name</th><th>Course</th><th>Title</th><th>CU</th><th>Score</th><th>Grade</th><th>Point</th><th>GP</th><th>Remark</th><th>Carry Over</th><th>Status</th></tr></thead><tbody>
      ${Object.entries(grouped).map(([matric, courses], idx) => courses.map((r,cIdx) => { const g = gradeSystem(r.score); const calc = calculateStudentResult(matric, r.level, r.semester); const cgpaCalc = calculateCGPA(matric); return `<tr><td>${cIdx===0?idx+1:''}</td><td>${cIdx===0?matric:''}</td><td style="text-align:left">${cIdx===0?courses[0].fullName:''} ${cIdx===0?`<br/>GPA:${calc.gpa.toFixed(2)} CGPA:${cgpaCalc.cgpa.toFixed(2)} ${cgpaCalc.classification.class}`:''}</td><td>${r.courseCode}</td><td style="text-align:left">${r.courseTitle}</td><td>${r.creditUnit}</td><td>${r.score}</td><td>${g.grade}</td><td>${g.point}</td><td>${r.creditUnit*g.point}</td><td class="${g.grade==='F'?'carry':''}">${g.remark}</td><td class="carry">${g.grade==='F'?'CARRY OVER - Reflects Next Sem':''}</td><td>${r.status}</td></tr>`; }).join('')).join('')}
      </tbody></table>
      <p>CGPA Classification: Distinction=3.50-4.00, Upper Credit=3.00-3.49, Lower Credit=2.50-2.99 (Qualified for HND), Pass=2.00-2.49</p>
      </body></html>`;
    const win = window.open('', '_blank'); if (win) { win.document.write(html); win.document.close(); win.focus(); setTimeout(()=>win.print(), 600); }
  };

  // STUDENT RESULT SLIP WITH CGPA + CLASS
  const downloadStudentResultPDF = (matricNo: string) => {
    const studentCourses = results.filter(r => r.matricNo === matricNo && r.status === 'PROVOST_PUBLISHED');
    const anyCourses = results.filter(r => r.matricNo === matricNo);
    if (anyCourses.length === 0) { alert('No result for student'); return; }
    if (studentCourses.length === 0 && role === 'STUDENT') { alert('Result not yet published by Provost'); return; }
    const coursesToShow = role === 'STUDENT' ? studentCourses : anyCourses;
    
    const levels = [...new Set(coursesToShow.map(c=>c.level))];
    const cgpaData = calculateCGPA(matricNo);
    
    let semesterTables = '';
    levels.forEach(lvl => {
      ['FIRST','SECOND'].forEach(sem => {
        const semCourses = coursesToShow.filter(r=>r.level===lvl && r.semester===sem);
        if (semCourses.length===0) return;
        const calc = calculateStudentResult(matricNo, lvl, sem as any);
        const firstCarry = results.filter(r=>r.matricNo===matricNo && r.level===lvl && r.semester==='FIRST' && gradeSystem(r.score).grade==='F');
        semesterTables += `<h4>${lvl} - ${sem} SEMESTER - GPA: ${calc.gpa.toFixed(2)} - Credit: ${calc.totalCredit}</h4>
          <table><tr><th>Course Code</th><th>Course Title</th><th>Credit Unit</th><th>Score</th><th>Grade</th><th>Grade Point</th><th>GP</th><th>Remark</th></tr>
          ${semCourses.map(r=>{const g=gradeSystem(r.score); return `<tr><td>${r.courseCode}</td><td>${r.courseTitle}</td><td>${r.creditUnit}</td><td>${r.score}</td><td>${g.grade}</td><td>${g.point}</td><td>${r.creditUnit*g.point}</td><td class="${g.grade==='F'?'carry':''}">${g.remark}</td></tr>`}).join('')}
          ${sem==='SECOND' && firstCarry.length>0 ? `<tr><td colspan="8" style="color:red; font-weight:bold;">CARRY OVER FROM FIRST SEMESTER: ${firstCarry.map(c=>`${c.courseCode} - ${c.score} - F`).join(', ')} - Auto Reflects Here - Must Retake</td></tr>` : ''}
          </table><br/>`;
      });
    });

    const html = `
      <html><head><style>body{font-family:Arial; font-size:11px;} table{width:100%; border-collapse:collapse; margin-bottom:10px;} th,td{border:1px solid #000; padding:4px;} th{background:#0a4d2e; color:#fff;} .header{text-align:center;} .carry{color:red; font-weight:bold;} .distinction{background:#166534; color:#fff; padding:5px;}</style></head><body>
      <div class="header"><h2>LABE COLLEGE OF NURSING SCIENCES, GBOKO</h2><h3>ND/HND NURSING - STUDENT RESULT SLIP</h3><p>Matric: ${matricNo} - Name: ${coursesToShow[0].fullName} - Session: 2026/2027</p>
      <p>Grading: 70-100=A(4), 60-69=B(3), 50-59=C(2), 40-49=D(1), 0-39=F(0)</p></div>
      ${semesterTables}
      <div style="border:2px solid #000; padding:10px; margin-top:15px;">
        <h3>CGPA & CLASS OF DIPLOMA - ND/HND</h3>
        <p><b>Total Credit Units:</b> ${cgpaData.totalCredit} | <b>Total Grade Points:</b> ${cgpaData.totalPoint} | <b>CGPA:</b> ${cgpaData.cgpa.toFixed(2)} / 4.00</p>
        <p class="${cgpaData.classification.color}" style="padding:8px; font-size:14px; font-weight:bold; text-align:center;">CLASS OF DIPLOMA: ${cgpaData.classification.class} - ${cgpaData.classification.desc}</p>
        <p><b>Distinction:</b> 3.50-4.00 | <b>Upper Credit:</b> 3.00-3.49 | <b>Lower Credit:</b> 2.50-2.99 (Qualified for HND) | <b>Pass:</b> 2.00-2.49 | <b>Below 2.00 = Spill Over</b></p>
        ${cgpaData.cgpa < 2.5 && cgpaData.allCourses.some(c=>['ND1','ND2'].includes(c.level)) ? '<p style="color:red; font-weight:bold;">Note: Minimum CGPA 2.50 (Lower Credit) required to proceed to HND</p>' : ''}
        <p style="color:red; font-weight:bold;">Note: Carry Over from First Semester automatically reflects in Second Semester. If CGPA below 2.00, student is on spill over. ND certificate not awarded until HND completion (72-80 CU required).</p>
      </div>
      <p style="margin-top:20px;">Exam Officer: ________________ HOD: ________________ Registrar: ________________ Provost: ________________ Date: ${new Date().toLocaleDateString()}</p>
      <p>Published by Provost - Student can print - This result slip is valid for ND/HND Nursing - Labe College</p>
      </body></html>`;
    const win = window.open('', '_blank'); if (win) { win.document.write(html); win.document.close(); win.focus(); setTimeout(()=>win.print(), 500); }
  };

  // TRANSCRIPT PDF - FULL ND/HND 4 YEARS
  const downloadTranscriptPDF = (matricNo: string) => {
    const allCourses = results.filter(r=>r.matricNo===matricNo);
    if (allCourses.length===0) { alert('No courses'); return; }
    const cgpaData = calculateCGPA(matricNo);
    const levels = ['ND1','ND2','HND1','HND2'];

    let transcriptTables = '';
    levels.forEach(lvl => {
      const lvlCourses = allCourses.filter(r=>r.level===lvl);
      if (lvlCourses.length===0) return;
      const lvlCalc = calculateStudentResult(matricNo, lvl);
      transcriptTables += `<h4>${lvl} - Total Credit: ${lvlCalc.totalCredit} - GPA: ${lvlCalc.gpa.toFixed(2)}</h4>
        <table><tr><th>Course Code</th><th>Course Title</th><th>CU</th><th>Score</th><th>Grade</th><th>Point</th><th>GP</th><th>Semester</th><th>Remark</th></tr>
        ${lvlCourses.map(r=>{const g=gradeSystem(r.score); return `<tr><td>${r.courseCode}</td><td>${r.courseTitle}</td><td>${r.creditUnit}</td><td>${r.score}</td><td>${g.grade}</td><td>${g.point}</td><td>${r.creditUnit*g.point}</td><td>${r.semester}</td><td>${g.remark}</td></tr>`}).join('')}
        </table><br/>`;
    });

    const html = `
      <html><head><style>@page{size:landscape;} body{font-family:Arial; font-size:9px;} table{width:100%; border-collapse:collapse;} th,td{border:1px solid #000; padding:3px; text-align:center;} th{background:#0a4d2e; color:#fff;} .header{text-align:center;}</style></head><body>
      <div class="header"><h2>LABE COLLEGE OF NURSING SCIENCES, GBOKO</h2><h3>ACADEMIC TRANSCRIPT - ND/HND NURSING (NON-TERMINAL) - 4 YEARS</h3><p>Matric: ${matricNo} - Name: ${allCourses[0].fullName} - Program: ND/HND Nursing Sciences - Session: 2026/2027 - 72-80 Credit Units Required</p></div>
      ${transcriptTables}
      <div style="border:2px solid #000; padding:10px;">
        <h3>FINAL CGPA & CLASSIFICATION</h3>
        <p>Total Credit: ${cgpaData.totalCredit} | Total GP: ${cgpaData.totalPoint} | CGPA: ${cgpaData.cgpa.toFixed(2)} / 4.00</p>
        <h2 style="text-align:center; background:${cgpaData.classification.color.includes('green')?'#166534': cgpaData.classification.color.includes('blue')?'#1e40af':'#854d0e'}; color:#fff; padding:10px;">CLASS OF DIPLOMA: ${cgpaData.classification.class}</h2>
        <p>ND Certificate not awarded until HND completion - Distinction 3.50-4.00, Upper Credit 3.00-3.49, Lower Credit 2.50-2.99, Pass 2.00-2.49</p>
        <p>Minimum 2.50 required for HND progression - Minimum 2.00 required for graduation</p>
      </div>
      <p>Registrar: ________________ Provost: ________________ Date: ${new Date().toLocaleDateString()}</p>
      </body></html>`;
    const win = window.open('', '_blank'); if (win) { win.document.write(html); win.document.close(); win.focus(); setTimeout(()=>win.print(), 700); }
  };

  const filtered = results.filter(r => {
    if (levelFilter !== 'ALL' && r.level !== levelFilter) return false;
    if (semesterFilter !== 'ALL' && r.semester !== semesterFilter) return false;
    if (!search) return true;
    return `${r.matricNo} ${r.fullName} ${r.courseCode} ${r.courseTitle}`.toLowerCase().includes(search.toLowerCase());
  });

  const uniqueStudents = [...new Set(filtered.map(r=>r.matricNo))];

  return (
    <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow p-4 space-y-4">
      <div className="flex justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2"><Calculator className="w-6 h-6 text-emerald-700"/> Result Computation - ND/HND - Grading + CGPA + Class of Diploma - {role}</h2>
          <p className="text-xs bg-emerald-50 p-2 rounded border mt-1 font-bold">Grading: 70=A, 60=B, 50=C, 40=D, 0-39=F | CGPA = Total GP / Total CU | Distinction=3.50-4.00 Upper=3.00-3.49 Lower=2.50-2.99 Pass=2.00-2.49 | Carry Over Auto Reflect | Lecturer → Exam Officer Calculate → HOD → Registrar → Provost Publish → Student View | Master Sheet Landscape + Transcript ND/HND</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {role === 'EXAM_OFFICER' && <button onClick={handleExamOfficerCalculate} className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-black flex items-center gap-2"><Calculator className="w-4 h-4"/> Exam Officer Calculate - GPA CGPA Class</button>}
          {role === 'EXAM_OFFICER' && <button onClick={()=>handleForward('HOD_REVIEWED')} className="px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-black flex items-center gap-2"><Send className="w-4 h-4"/> Forward to HOD</button>}
          {role === 'HOD' && <button onClick={()=>handleForward('REGISTRAR_REVIEWED')} className="px-4 py-2 bg-purple-700 text-white rounded-xl text-xs font-black">HOD → Registrar</button>}
          {role === 'REGISTRAR' && <button onClick={()=>handleForward('PROVOST_PUBLISHED')} className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-black">Registrar → Provost</button>}
          {role === 'PROVOST' && <button onClick={()=>{ const upd = results.map(r=>r.status==='REGISTRAR_REVIEWED' ? {...r, status:'PROVOST_PUBLISHED' as const} : r); save(upd); alert('✅ Provost Published - Students can view/print with Class of Diploma'); }} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black flex items-center gap-2"><CheckCircle className="w-4 h-4"/> Provost Publish - Student View</button>}
          <button onClick={downloadMasterSheetPDF} className="px-4 py-2 bg-red-700 text-white rounded-xl text-xs font-black flex items-center gap-2"><FileText className="w-4 h-4"/> Master Sheet PDF Landscape</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 bg-slate-50 p-3 rounded-xl border">
        <div className="flex items-center gap-2 flex-1 bg-white border-2 border-emerald-400 rounded-xl px-3"><Search className="w-4 h-4 text-emerald-700"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by Name and Matric No - e.g. LCNS/2026/ND1/001 or Okonkwo" className="flex-1 py-2.5 text-xs font-black outline-none"/></div>
        <select value={levelFilter} onChange={e=>setLevelFilter(e.target.value)} className="px-3 py-2 border-2 rounded-xl text-xs font-black"><option value="ALL">All Levels ND/HND</option><option>ND1</option><option>ND2</option><option>HND1</option><option>HND2</option></select>
        <select value={semesterFilter} onChange={e=>setSemesterFilter(e.target.value)} className="px-3 py-2 border-2 rounded-xl text-xs font-black"><option value="ALL">All Semesters</option><option value="FIRST">FIRST</option><option value="SECOND">SECOND - Shows Carry Over</option></select>
        <div className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-black">{uniqueStudents.length} Students | {filtered.length} Results</div>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        {uniqueStudents.slice(0,6).map(matric => {
          const cgpaData = calculateCGPA(matric);
          const first = filtered.find(r=>r.matricNo===matric);
          return (
            <div key={matric} className="border-2 rounded-xl p-3 space-y-2 bg-slate-50">
              <p className="font-mono font-black text-emerald-800 text-xs">{matric} - {first?.fullName}</p>
              <p className="text-xs">CGPA: <b>{cgpaData.cgpa.toFixed(2)}</b> / 4.00 | CU: {cgpaData.totalCredit}</p>
              <span className={`px-2 py-1 rounded-full text-[10px] font-black ${cgpaData.classification.color}`}>{cgpaData.classification.class}</span>
              <p className="text-[10px]">{cgpaData.classification.desc}</p>
              <div className="flex gap-1">
                <button onClick={()=>downloadStudentResultPDF(matric)} className="flex-1 py-1.5 bg-blue-700 text-white rounded-lg text-[10px] font-black">Result Slip + Class</button>
                <button onClick={()=>downloadTranscriptPDF(matric)} className="flex-1 py-1.5 bg-emerald-700 text-white rounded-lg text-[10px] font-black flex items-center justify-center gap-1"><GraduationCap className="w-3 h-3"/> Transcript ND/HND</button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="overflow-x-auto border-2 rounded-xl">
        <table className="w-full text-xs">
          <thead className="bg-slate-900 text-white"><tr><th className="p-2">Matric + Name + CGPA + Class</th><th className="p-2">Course + CU</th><th className="p-2">Score</th><th className="p-2">Grade</th><th className="p-2">GP</th><th className="p-2">Remark + Carry Over Auto</th><th className="p-2">Status</th><th className="p-2">Action PDF</th></tr></thead>
          <tbody>
            {filtered.map(r => {
              const g = gradeSystem(r.score);
              const cgpaData = calculateCGPA(r.matricNo);
              const studentCarry = results.filter(x => x.matricNo === r.matricNo && x.semester === 'FIRST' && gradeSystem(x.score).grade === 'F');
              return (
                <tr key={r.id} className="border-b hover:bg-slate-50">
                  <td className="p-2"><p className="font-mono font-black text-emerald-800">{r.matricNo}</p><p className="font-bold">{r.fullName}</p><p className="text-[10px]">{r.level} - {r.semester} | CGPA {cgpaData.cgpa.toFixed(2)} - <span className={`px-1 rounded ${cgpaData.classification.color}`}>{cgpaData.classification.class}</span></p></td>
                  <td className="p-2"><p className="font-bold">{r.courseCode} - {r.creditUnit} CU</p><p className="text-[11px]">{r.courseTitle}</p></td>
                  <td className="p-2 font-black">{r.score}</td>
                  <td className="p-2"><span className={`px-2 py-1 rounded-full font-black ${g.grade==='A'?'bg-green-100 text-green-800': g.grade==='F'?'bg-red-100 text-red-800':'bg-slate-100'}`}>{g.grade} ({g.point})</span></td>
                  <td className="p-2 font-black">{r.creditUnit * g.point}</td>
                  <td className="p-2"><p className={g.grade==='F' ? 'text-red-600 font-black' : ''}>{g.remark}</p>{r.semester==='SECOND' && studentCarry.length>0 && <p className="text-[10px] text-red-600 font-bold">Carry from 1st: {studentCarry.map(c=>c.courseCode).join(', ')} auto reflects</p>}</td>
                  <td className="p-2"><span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black">{r.status}</span></td>
                  <td className="p-2 space-y-1"><button onClick={()=>downloadStudentResultPDF(r.matricNo)} className="px-2 py-1 bg-blue-700 text-white rounded-lg text-[10px] font-black w-full">Result Slip</button><button onClick={()=>downloadTranscriptPDF(r.matricNo)} className="px-2 py-1 bg-emerald-700 text-white rounded-lg text-[10px] font-black w-full">Transcript</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 text-xs">
        <h4 className="font-black flex items-center gap-2"><Award className="w-4 h-4"/> ND/HND Classification - Labe College:</h4>
        <p>• <b>Distinction:</b> CGPA 3.50 - 4.00 (First Class Equivalent) - Green</p>
        <p>• <b>Upper Credit:</b> CGPA 3.00 - 3.49 - Blue</p>
        <p>• <b>Lower Credit:</b> CGPA 2.50 - 2.99 - Yellow - Minimum to proceed to HND - If ND CGPA below 2.50, student cannot proceed to HND</p>
        <p>• <b>Pass:</b> CGPA 2.00 - 2.49 - Orange - Can graduate ND but not proceed to HND</p>
        <p>• <b>Below 2.00:</b> Spill Over - Must retake failed courses - ND certificate not awarded until HND completion (72-80 CU)</p>
        <p>• <b>Carry Over:</b> Score 0-39 = F - Auto reflects in Second Semester - Spill Over auto displays</p>
        <p>• <b>Transcript:</b> Full 4 years ND1, ND2, HND1, HND2 with CGPA + Class of Diploma - Download for each student</p>
      </div>
    </div>
  );
};

export default ResultComputationManager;

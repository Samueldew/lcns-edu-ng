import React, { useState } from 'react';
import { getSupabase } from '../../lib/supabase';
import { Save, Printer, Users, BookOpen, CheckCircle2 } from 'lucide-react';
import jsPDF from 'jspdf';

export const LecturerScoreEntry: React.FC<{ currentUser: any }> = ({ currentUser }) => {
  const [courses] = useState<any[]>(() => JSON.parse(localStorage.getItem('lcns_courses') || '[]'));
  const [users] = useState<any[]>(() => JSON.parse(localStorage.getItem('lcns_users') || '[]'));
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('ND1');
  const [selectedSession, setSelectedSession] = useState(localStorage.getItem('lcns_current_session') || '2025/2026');
  const [selectedSemester, setSelectedSemester] = useState('First Semester');
  const [students, setStudents] = useState<any[]>([]);
  const [status, setStatus] = useState<string|null>(null);

  const loadStudentsForCourse = () => {
    const filtered = users.filter((u:any) => (u.level === selectedLevel || u.currentLevel === selectedLevel) && u.role === 'STUDENT').map((u:any) => ({
      student_email: u.email, student_name: u.fullName || u.name, matric_number: u.matricNumber || 'No Matric', assessment: 0, exam: 0, total: 0
    }));
    setStudents(filtered);
    setStatus(`Loaded ${filtered.length} students`);
    setTimeout(()=>setStatus(null), 4000);
  };

  const updateScore = (i:number, field:'assessment'|'exam', v:number) => {
    if(field==='assessment' && v>40) return;
    if(field==='exam' && v>60) return;
    const up=[...students];
    up[i]={...up[i], [field]:v, total: field==='assessment'? v+up[i].exam : up[i].assessment+v};
    setStudents(up);
  };

  const submitScores = async () => {
    const toSave = students.map(s=>({
      id: `${selectedCourse}-${s.student_email}-${Date.now()}`, course_code: selectedCourse, course_title: courses.find((c:any)=>c.code===selectedCourse)?.title || selectedCourse,
      level: selectedLevel, session: selectedSession, semester: selectedSemester,
      student_email: s.student_email, student_name: s.student_name, matric_number: s.matric_number,
      assessment: s.assessment, exam: s.exam, total: s.total, grade: s.total>=70?'A':s.total>=60?'B':s.total>=50?'C':s.total>=40?'D':'F',
      lecturer_email: currentUser.email, lecturer_name: currentUser.fullName, submitted_at: new Date().toISOString()
    }));
    const existing = JSON.parse(localStorage.getItem('lcns_scores') || '[]');
    const filtered = existing.filter((x:any)=>!(x.course_code===selectedCourse && x.level===selectedLevel && x.session===selectedSession && x.semester===selectedSemester));
    localStorage.setItem('lcns_scores', JSON.stringify([...filtered, ...toSave]));
    const sb = getSupabase();
    if(sb) try{ await sb.from('student_scores').delete().eq('course_code', selectedCourse).eq('level', selectedLevel); await sb.from('student_scores').insert(toSave); }catch{}
    setStatus(`✅ Submitted! ${students.length} students - Exam Officer/HOD/Admin/Provost/Registrar can view!`);
  };

  const printPDF = () => {
    const doc = new jsPDF('l','mm','a4');
    doc.setFontSize(16); doc.setFont('helvetica','bold');
    doc.text('COLLEGE OF NURSING SCIENCES, CATHOLIC DIOCESE OF GBOKO',148,15,{align:'center'});
    doc.setFontSize(13); doc.text('ASSESSMENT SHEET / SCORE SHEET',148,22,{align:'center'});
    doc.setFontSize(10); doc.setFont('helvetica','normal');
    doc.text(`Course: ${selectedCourse}`,15,30); doc.text(`Level: ${selectedLevel}`,15,35);
    doc.text(`Session: ${selectedSession}`,100,30); doc.text(`Semester: ${selectedSemester}`,100,35);
    let y=45; doc.setFontSize(9); doc.setFont('helvetica','bold');
    doc.text('S/N',15,y); doc.text('Matric No',25,y); doc.text('Names',55,y); doc.text('Assess(40)',110,y); doc.text('Exam(60)',145,y); doc.text('Total(100)',175,y); doc.text('Grade',205,y);
    doc.setFont('helvetica','normal'); y+=7;
    students.forEach((s,i)=>{ doc.text(`${i+1}`,15,y); doc.text(`${s.matric_number}`,25,y); doc.text(`${s.student_name.substring(0,30)}`,55,y); doc.text(`${s.assessment}`,115,y); doc.text(`${s.exam}`,150,y); doc.text(`${s.total}`,180,y); doc.text(`${s.total>=40?'Pass':'Fail'}`,207,y); y+=6; });
    doc.save(`ScoreSheet_${selectedCourse}_${selectedLevel}_${selectedSession}_${selectedSemester}.pdf`);
  };

  return (
    <div className="space-y-4">
      {status && <div className="p-3 bg-emerald-50 border rounded-xl text-xs font-bold">{status}</div>}
      <div className="bg-slate-900 text-white rounded-2xl p-5"><h1 className="font-black">LECTURER - ENTER SCORES 40+60</h1><p className="text-xs text-emerald-200">College of Nursing Sciences, Gboko - ND1,N2,HND1,HND2, Session, Semester</p></div>
      <div className="bg-white border-2 rounded-2xl p-4 grid grid-cols-5 gap-3">
        <select value={selectedCourse} onChange={e=>setSelectedCourse(e.target.value)} className="border-2 rounded-xl p-2 text-xs"><option value="">Course</option>{(courses.length?courses:[{code:'NUR101',title:'Nursing'}]).map((c:any)=><option key={c.code} value={c.code}>{c.code}</option>)}</select>
        <select value={selectedLevel} onChange={e=>setSelectedLevel(e.target.value)} className="border-2 rounded-xl p-2 text-xs"><option>ND1</option><option>ND2</option><option>HND1</option><option>HND2</option></select>
        <select value={selectedSession} onChange={e=>setSelectedSession(e.target.value)} className="border-2 rounded-xl p-2 text-xs"><option>2025/2026</option><option>2026/2027</option></select>
        <select value={selectedSemester} onChange={e=>setSelectedSemester(e.target.value)} className="border-2 rounded-xl p-2 text-xs"><option>First Semester</option><option>Second Semester</option></select>
        <button onClick={loadStudentsForCourse} className="bg-slate-900 text-white rounded-xl text-xs font-black">LOAD STUDENTS</button>
      </div>
      {students.length>0 && <div className="bg-white border-2 rounded-2xl p-4"><div className="flex gap-2 mb-3"><button onClick={submitScores} className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-black">SUBMIT ONLINE</button><button onClick={printPDF} className="px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-black">PRINT PDF</button></div><table className="w-full text-xs"><thead className="bg-slate-900 text-white"><tr><th className="p-2">Matric</th><th className="p-2">Name</th><th className="p-2">Assess 40</th><th className="p-2">Exam 60</th><th className="p-2">Total</th></tr></thead><tbody>{students.map((s,i)=><tr key={s.student_email} className="border-b"><td className="p-2 font-mono">{s.matric_number}</td><td className="p-2">{s.student_name}</td><td className="p-2"><input type="number" max={40} value={s.assessment} onChange={e=>updateScore(i,'assessment',parseInt(e.target.value)||0)} className="w-16 border-2 rounded p-1 text-center"/></td><td className="p-2"><input type="number" max={60} value={s.exam} onChange={e=>updateScore(i,'exam',parseInt(e.target.value)||0)} className="w-16 border-2 rounded p-1 text-center"/></td><td className="p-2 font-black">{s.total}</td></tr>)}</tbody></table></div>}
    </div>
  );
};

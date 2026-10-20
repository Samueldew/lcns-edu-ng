import React, { useState, useEffect } from 'react';
import { getSupabase } from '../../lib/supabase';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';

export const ScoreSheetViewer: React.FC<{ currentUser: any }> = ({ currentUser }) => {
  const [scores, setScores] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [filterCourse, setFilterCourse] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterSession, setFilterSession] = useState('');

  useEffect(()=>{ loadScores(); }, []);
  const loadScores = async () => {
    const sb = getSupabase();
    let all:any[]=[];
    if(sb){ const {data}=await sb.from('student_scores').select('*').order('submitted_at',{ascending:false}); if(data) all=data; }
    if(all.length===0) all=JSON.parse(localStorage.getItem('lcns_scores')||'[]');
    setScores(all); setFiltered(all);
  };
  const applyFilter = () => {
    let f=scores;
    if(filterCourse) f=f.filter((s:any)=>s.course_code===filterCourse);
    if(filterLevel) f=f.filter((s:any)=>s.level===filterLevel);
    if(filterSession) f=f.filter((s:any)=>s.session===filterSession);
    setFiltered(f);
  };
  const downloadPDF = (course:string, level:string, session:string, semester:string) => {
    const list = filtered.filter((s:any)=>s.course_code===course && s.level===level && s.session===session && s.semester===semester);
    const doc = new jsPDF('l','mm','a4');
    doc.setFontSize(16); doc.setFont('helvetica','bold');
    doc.text('COLLEGE OF NURSING SCIENCES, CATHOLIC DIOCESE OF GBOKO',148,15,{align:'center'});
    doc.setFontSize(13); doc.text('ASSESSMENT SHEET / SCORE SHEET - OFFICIAL',148,22,{align:'center'});
    doc.setFontSize(10); doc.setFont('helvetica','normal');
    doc.text(`Course: ${course} Level: ${level} Session: ${session} Semester: ${semester}`,15,32);
    doc.text(`Viewed by: ${currentUser.role} ${currentUser.fullName||currentUser.email}`,200,32);
    let y=45; doc.setFontSize(9); doc.setFont('helvetica','bold');
    doc.text('S/N',15,y); doc.text('Matric',25,y); doc.text('Name',55,y); doc.text('Assess 40',110,y); doc.text('Exam 60',145,y); doc.text('Total',175,y); doc.text('Grade',205,y);
    doc.setFont('helvetica','normal'); y+=7;
    list.forEach((s:any,i:number)=>{ doc.text(`${i+1}`,15,y); doc.text(`${s.matric_number}`,25,y); doc.text(`${s.student_name.substring(0,30)}`,55,y); doc.text(`${s.assessment}`,115,y); doc.text(`${s.exam}`,150,y); doc.text(`${s.total}`,180,y); doc.text(`${s.total>=40?'Pass':'Fail'}`,207,y); y+=6; if(y>190){doc.addPage(); y=20;}});
    doc.save(`ScoreSheet_${course}_${level}_${session}_${semester}.pdf`);
  };
  const uniqueCourses=[...new Set(scores.map((s:any)=>s.course_code))];
  const uniqueLevels=[...new Set(scores.map((s:any)=>s.level))];
  const uniqueSessions=[...new Set(scores.map((s:any)=>s.session))];
  return (
    <div className="space-y-4">
      <div className="bg-slate-900 text-white rounded-2xl p-5"><h1 className="font-black">SCORE SHEETS - {currentUser.role} VIEW - EXAM OFFICER/HOD/ADMIN/PROVOST/REGISTRAR</h1><p className="text-xs text-emerald-200">Total: {scores.length} - Filtered: {filtered.length} - Download PDF with College header</p></div>
      <div className="bg-white border-2 rounded-2xl p-4 grid grid-cols-4 gap-3">
        <select value={filterCourse} onChange={e=>setFilterCourse(e.target.value)} className="border-2 rounded-xl p-2 text-xs"><option value="">All Courses</option>{uniqueCourses.map((c:any)=><option key={c} value={c}>{c}</option>)}</select>
        <select value={filterLevel} onChange={e=>setFilterLevel(e.target.value)} className="border-2 rounded-xl p-2 text-xs"><option value="">All Levels</option>{uniqueLevels.map((l:any)=><option key={l} value={l}>{l}</option>)}</select>
        <select value={filterSession} onChange={e=>setFilterSession(e.target.value)} className="border-2 rounded-xl p-2 text-xs"><option value="">All Sessions</option>{uniqueSessions.map((s:any)=><option key={s} value={s}>{s}</option>)}</select>
        <button onClick={applyFilter} className="bg-slate-900 text-white rounded-xl text-xs font-black">FILTER</button>
      </div>
      <div className="bg-white border-2 rounded-2xl p-4 overflow-x-auto"><table className="w-full text-xs"><thead className="bg-slate-900 text-white"><tr><th className="p-2">Course</th><th className="p-2">Level</th><th className="p-2">Session</th><th className="p-2">Semester</th><th className="p-2">Student Matric</th><th className="p-2">Total</th><th className="p-2">PDF</th></tr></thead><tbody>{filtered.map((s:any)=><tr key={s.id} className="border-b"><td className="p-2">{s.course_code}</td><td className="p-2">{s.level}</td><td className="p-2">{s.session}</td><td className="p-2">{s.semester}</td><td className="p-2">{s.student_name}<br/><span className="font-mono text-[10px]">{s.matric_number}</span></td><td className="p-2 font-black">{s.total}</td><td className="p-2"><button onClick={()=>downloadPDF(s.course_code,s.level,s.session,s.semester)} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[10px]">PDF</button></td></tr>)}</tbody></table></div>
    </div>
  );
};

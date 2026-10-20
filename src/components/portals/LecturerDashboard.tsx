import React, { useState, useEffect } from 'react';
import { getSupabase } from '../../lib/supabase';
import jsPDF from 'jspdf';

export const LecturerDashboard: React.FC = () => {
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'my_courses' | 'scores' | 'submitted'>('my_courses');
  
  // Bulk Score Entry
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('ND1');
  const [selectedSession, setSelectedSession] = useState(localStorage.getItem('lcns_current_session') || '2025/2026');
  const [selectedSemester, setSelectedSemester] = useState('First Semester');
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [scores, setScores] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState<string|null>(null);

  const load = () => {
    try {
      const userStr = localStorage.getItem('lcns_current_user') || localStorage.getItem('lcns_user');
      let user = null;
      if (userStr) { user = JSON.parse(userStr); setCurrentUser(user); }
      else {
        const allUsers = JSON.parse(localStorage.getItem('lcns_users') || '[]');
        user = allUsers.find((u:any)=> ['LECTURER','HOD'].includes(u.role)) || { fullName: 'Nurse Emmanuel Gbaorun', email: 'lecturer@lcns.edu.ng', id: 'lec-1', role:'LECTURER' };
        setCurrentUser(user);
      }
      const all = JSON.parse(localStorage.getItem('lcns_allocated_courses') || '[]');
      const mine = all.filter((c:any)=> !user || !user.email ? true : (c.lecturerEmail === user.email || c.lecturerId === user.id));
      const display = mine.length > 0 ? mine : all;
      setMyCourses(display);
      if (display.length > 0 && !selectedCourse) {
        setSelectedCourse(display[0].code);
        setSelectedLevel(display[0].level || 'ND1');
        setSelectedSession(display[0].session || selectedSession);
        setSelectedSemester(display[0].semester?.includes('Second') ? 'Second Semester' : 'First Semester');
      }
      const res = JSON.parse(localStorage.getItem('lcns_scores') || '[]');
      setResults(res);
    } catch(e) { console.log(e); }
  };

  useEffect(()=>{ load(); }, []);

  // LOAD STUDENTS OFFERING THIS COURSE - BY LEVEL
  const loadStudentsOfferingCourse = () => {
    if(!selectedCourse) { setStatus('Select course'); return; }
    const allUsers = JSON.parse(localStorage.getItem('lcns_users') || '[]');
    // Students in this level
    const filtered = allUsers.filter((u:any) => 
      (u.role === 'STUDENT' || u.userType === 'STUDENT') &&
      (u.level === selectedLevel || u.currentLevel === selectedLevel || !u.level) // show all if level not set
    ).map((u:any) => ({
      matricNo: u.matricNumber || u.matric_number || u.id,
      fullName: u.fullName || u.name || u.email,
      email: u.email,
      assessment: 0,
      exam: 0,
      total: 0
    }));

    // Load existing scores for this course/level/session/semester
    const existing = results.filter((r:any) => r.course_code === selectedCourse && r.level === selectedLevel && r.session === selectedSession && r.semester === selectedSemester);
    const merged = filtered.map((s:any) => {
      const ex = existing.find((e:any) => e.student_email === s.email || e.matric_number === s.matricNo);
      if(ex) return {...s, assessment: ex.assessment, exam: ex.exam, total: ex.total };
      return s;
    });

    setStudentsList(merged);
    setScores(merged);
    setStatus(`Loaded ${merged.length} students offering ${selectedCourse} - ${selectedLevel} - ${selectedSession} - ${selectedSemester}`);
    setTimeout(()=>setStatus(null), 5000);
  };

  const updateScore = (idx:number, field:'assessment'|'exam', val:number) => {
    if(field==='assessment' && (val<0 || val>40)) return;
    if(field==='exam' && (val<0 || val>60)) return;
    const up=[...scores];
    const total = field==='assessment' ? val + up[idx].exam : up[idx].assessment + val;
    up[idx] = {...up[idx], [field]:val, total };
    setScores(up);
  };

  const getGrade = (t:number) => {
    if (t>=70) return 'A';
    if (t>=60) return 'B';
    if (t>=50) return 'C';
    if (t>=40) return 'D';
    if (t>=30) return 'E';
    return 'F';
  };

  // SUBMIT ONLINE - EXAM OFFICER/HOD/ADMIN/PROVOST/REGISTRAR CAN SEE
  const submitAllScores = async () => {
    if(scores.length===0) { setStatus('No students loaded'); return; }
    try {
      const toSave = scores.map(s=>({
        id: `${selectedCourse}-${s.email}-${selectedLevel}-${selectedSession}-${selectedSemester}-${Date.now()}`.replace(/\s/g,''),
        course_code: selectedCourse,
        course_title: myCourses.find((c:any)=>c.code===selectedCourse)?.title || selectedCourse,
        level: selectedLevel,
        session: selectedSession,
        semester: selectedSemester,
        student_email: s.email,
        student_name: s.fullName,
        matric_number: s.matricNo,
        assessment: s.assessment,
        exam: s.exam,
        total: s.total,
        grade: getGrade(s.total),
        lecturer_email: currentUser?.email,
        lecturer_name: currentUser?.fullName || currentUser?.email,
        submitted_at: new Date().toISOString(),
        status: 'submitted'
      }));

      // localStorage for offline + for viewer
      const existingAll = JSON.parse(localStorage.getItem('lcns_scores') || '[]');
      const filtered = existingAll.filter((x:any)=> !(x.course_code===selectedCourse && x.level===selectedLevel && x.session===selectedSession && x.semester===selectedSemester));
      const newAll = [...filtered, ...toSave];
      localStorage.setItem('lcns_scores', JSON.stringify(newAll));
      setResults(newAll);

      // Supabase
      const sb = getSupabase();
      if(sb) {
        try {
          await sb.from('student_scores').delete().eq('course_code', selectedCourse).eq('level', selectedLevel).eq('session', selectedSession).eq('semester', selectedSemester);
          const {error} = await sb.from('student_scores').insert(toSave);
          if(error) console.warn(error);
        } catch(e){ console.log(e); }
      }

      setSaved(true);
      setStatus(`✅ SUBMITTED ONLINE! ${scores.length} students - Course ${selectedCourse} - ${selectedLevel} - ${selectedSession} - ${selectedSemester} - Now Exam Officer/HOD/Admin/Provost/Registrar can view & download PDF!`);
      setTimeout(()=>{setSaved(false); setStatus(null);}, 6000);
      window.dispatchEvent(new Event('lcns_storage_update'));
    } catch(e:any){ setStatus('Submit failed: '+e.message); }
  };

  // PRINT PDF SCORESHEET - COLLEGE OF NURSING SCIENCES, CATHOLIC DIOCESE OF GBOKO
  const printPDF = () => {
    if(scores.length===0) return;
    const doc = new jsPDF('l','mm','a4');
    // HEADER
    doc.setFontSize(16); doc.setFont('helvetica','bold');
    doc.text('COLLEGE OF NURSING SCIENCES, CATHOLIC DIOCESE OF GBOKO',148,15,{align:'center'});
    doc.setFontSize(13);
    doc.text('ASSESSMENT SHEET / RESULT SCORESHEET',148,22,{align:'center'});
    doc.setFontSize(10); doc.setFont('helvetica','normal');
    const courseTitle = myCourses.find((c:any)=>c.code===selectedCourse)?.title || selectedCourse;
    doc.text(`Course: ${selectedCourse} - ${courseTitle}`,15,30);
    doc.text(`Level: ${selectedLevel}`,15,35);
    doc.text(`Academic Session: ${selectedSession}`,100,30);
    doc.text(`Semester: ${selectedSemester}`,100,35);
    doc.text(`Lecturer: ${currentUser?.fullName || currentUser?.email}`,200,30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`,200,35);
    doc.setFontSize(9); doc.setFont('helvetica','bold');
    let y=45;
    doc.text('S/N',10,y); doc.text('Matric No',20,y); doc.text('Full Names',50,y); doc.text('Assessment (40)',105,y); doc.text('Exam (60)',140,y); doc.text('Total (100)',170,y); doc.text('Grade',200,y); doc.text('Remark',220,y);
    doc.setFont('helvetica','normal'); y+=7;
    scores.forEach((s,i)=>{
      if(y>190){ doc.addPage(); y=20; }
      doc.text(`${i+1}`,10,y);
      doc.text(`${s.matricNo}`,20,y);
      doc.text(`${s.fullName.substring(0,35)}`,50,y);
      doc.text(`${s.assessment}`,115,y);
      doc.text(`${s.exam}`,150,y);
      doc.text(`${s.total}`,178,y);
      doc.text(`${getGrade(s.total)}`,202,y);
      doc.text(`${s.total>=40?'Pass':'Fail'}`,220,y);
      y+=6;
    });
    y+=10;
    doc.setFont('helvetica','bold'); doc.setFontSize(9);
    doc.text('_________________________',15,y); doc.text('_________________________',100,y); doc.text('_________________________',200,y);
    y+=5; doc.setFontSize(8); doc.text('Lecturer Signature & Date',15,y); doc.text('HOD Signature & Date',100,y); doc.text('Provost/Registrar Signature',200,y);
    y+=8; doc.setFontSize(7); doc.setFont('helvetica','italic');
    doc.text('This scoresheet is official document of College of Nursing Sciences, Gboko. Assessment 40% + Exam 60% = 100%',15,y);
    doc.save(`ScoreSheet_${selectedCourse}_${selectedLevel}_${selectedSession}_${selectedSemester}.pdf`);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div className="bg-gradient-to-r from-blue-900 to-emerald-900 text-white rounded-3xl p-6 shadow-xl">
        <h1 className="text-2xl font-black uppercase">Lecturer Portal - {currentUser?.fullName || 'Academic Staff'}</h1>
        <p className="text-xs text-blue-200 mt-1">{currentUser?.email} - {currentUser?.role} - College of Nursing Sciences, Catholic Diocese of Gboko</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <div className="bg-white/10 p-3 rounded-2xl border border-white/20">
            <p className="text-[10px] uppercase font-bold text-amber-300">My Courses This Semester</p>
            <p className="text-2xl font-black">{myCourses.length} Courses</p>
            <p className="text-[11px]">{myCourses.map((c:any)=>c.code).join(', ') || 'No allocation yet'}</p>
          </div>
          <button onClick={load} className="px-4 py-2 bg-white text-blue-900 rounded-xl text-xs font-black">Refresh Courses</button>
        </div>
        {status && <div className="mt-3 p-3 bg-emerald-500/20 border border-emerald-400 rounded-xl text-xs font-bold">{status}</div>}
      </div>

      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border shadow-sm">
        <button onClick={()=>setActiveTab('my_courses')} className={`px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='my_courses'?'bg-blue-700 text-white':'bg-blue-50 border-2 border-blue-300 text-blue-800'}`}>📚 My Courses ({myCourses.length})</button>
        <button onClick={()=>setActiveTab('scores')} className={`px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='scores'?'bg-emerald-700 text-white ring-2 ring-emerald-300':'bg-emerald-50 border-2 border-emerald-300 text-emerald-800'}`}>📝 Enter Scores - 40 + 60 - Bulk by Name</button>
        <button onClick={()=>setActiveTab('submitted')} className={`px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab==='submitted'?'bg-slate-900 text-white':'bg-slate-50 border text-slate-600'}`}>📄 Submitted Score Sheets ({results.length})</button>
      </div>

      {activeTab==='my_courses' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border-2 border-blue-300 p-3 rounded-xl text-xs font-bold">Admin/Registrar → Course Allocation → Select Lecturer ({currentUser?.fullName}) → Allocate → Lecturer sees here. Then click Enter Scores</div>
          {myCourses.length===0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed p-12 text-center">
              <p className="font-black text-slate-600">No courses allocated yet</p>
              <p className="text-xs mt-2 bg-amber-50 border p-2 rounded font-bold">Admin must allocate course to: {currentUser?.email}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {myCourses.map((c:any)=>(
                <div key={c.id} className="border-2 border-emerald-200 rounded-2xl p-5 bg-white shadow-sm space-y-3">
                  <div className="flex justify-between">
                    <span className="font-mono font-black bg-emerald-50 px-3 py-1 rounded-xl border-2 border-emerald-200">{c.code}</span>
                    <span className="text-[11px] font-black bg-blue-700 text-white px-3 py-1 rounded-full">{c.level} • {c.semester} • {c.session}</span>
                  </div>
                  <h3 className="font-black text-sm">{c.title}</h3>
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-3 rounded-xl border">
                    <p><b>Units:</b> {c.units}</p><p><b>Session:</b> {c.session}</p><p><b>Dept:</b> {c.department}</p><p><b>By:</b> {c.createdBy}</p>
                  </div>
                  <button onClick={()=>{setSelectedCourse(c.code); setSelectedLevel(c.level||'ND1'); setSelectedSession(c.session||selectedSession); setSelectedSemester(c.semester?.includes('Second')?'Second Semester':'First Semester'); setActiveTab('scores');}} className="w-full py-2.5 bg-emerald-800 text-white rounded-xl text-[11px] font-black">Enter Scores for {c.code} - {c.level} - 40+60</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab==='scores' && (
        <div className="bg-white rounded-3xl border-2 p-6 space-y-4">
          <h3 className="font-black uppercase text-sm flex justify-between">Score Entry - Bulk - Students Offering Course - Assessment 40 + Exam 60 = 100 <span className="text-[10px] bg-amber-100 px-2 py-1 rounded">Session {selectedSession} - {selectedSemester}</span></h3>
          {saved && <div className="p-3 bg-emerald-50 border-2 border-emerald-300 rounded-xl text-xs font-black text-emerald-800">✅ Scores Saved Online! Exam Officer/HOD/Admin/Provost/Registrar can now view & download PDF!</div>}

          <div className="grid md:grid-cols-5 gap-3 bg-slate-50 p-4 rounded-2xl border-2">
            <div><label className="text-[10px] font-black">Course *</label><select value={selectedCourse} onChange={e=>setSelectedCourse(e.target.value)} className="w-full p-2.5 border-2 rounded-xl text-xs font-bold"><option value="">Select</option>{myCourses.map((c:any)=>(<option key={c.id} value={c.code}>{c.code} - {c.title}</option>))}<option value="NSC 101">NSC 101</option><option value="NSC 102">NSC 102</option></select></div>
            <div><label className="text-[10px] font-black">Level ND1/N2/HND1/HND2 *</label><select value={selectedLevel} onChange={e=>setSelectedLevel(e.target.value)} className="w-full p-2.5 border-2 rounded-xl text-xs font-bold"><option value="ND1">ND1</option><option value="ND2">ND2 (N2)</option><option value="HND1">HND1</option><option value="HND2">HND2</option></select></div>
            <div><label className="text-[10px] font-black">Academic Session *</label><select value={selectedSession} onChange={e=>setSelectedSession(e.target.value)} className="w-full p-2.5 border-2 rounded-xl text-xs font-bold"><option value="2025/2026">2025/2026</option><option value="2026/2027">2026/2027</option><option value="2024/2025">2024/2025</option></select></div>
            <div><label className="text-[10px] font-black">Semester *</label><select value={selectedSemester} onChange={e=>setSelectedSemester(e.target.value)} className="w-full p-2.5 border-2 rounded-xl text-xs font-bold"><option value="First Semester">First Semester</option><option value="Second Semester">Second Semester</option></select></div>
            <div className="flex items-end"><button onClick={loadStudentsOfferingCourse} className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-black">LOAD STUDENTS OFFERING COURSE</button></div>
          </div>

          {scores.length>0 && (
            <>
              <div className="flex flex-wrap gap-2">
                <button onClick={submitAllScores} className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black flex gap-2">💾 SUBMIT SCORES ONLINE - {scores.length} Students</button>
                <button onClick={printPDF} className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-black flex gap-2">🖨️ PRINT / DOWNLOAD PDF - COLLEGE OF NURSING SCIENCES GBOKO - ASSESSMENT SHEET {selectedLevel} {selectedSession} {selectedSemester}</button>
              </div>

              <div className="bg-amber-50 border-2 border-amber-200 p-3 rounded-xl text-[11px] font-bold">
                <p>College: COLLEGE OF NURSING SCIENCES, CATHOLIC DIOCESE OF GBOKO | Assessment Sheet | Level: {selectedLevel} | Session: {selectedSession} | Semester: {selectedSemester} | Course: {selectedCourse} | Total Students: {scores.length}</p>
                <p className="mt-1">Enter Assessment (max 40) + Exam (max 60) = Total 100. After scoring, click SUBMIT ONLINE so Exam Officer/HOD/Admin/Provost/Registrar can see and download PDF.</p>
              </div>

              <div className="overflow-x-auto border-2 rounded-xl">
                <table className="w-full text-xs">
                  <thead className="bg-slate-900 text-white uppercase text-[10px]"><tr><th className="p-2 text-left">S/N</th><th className="p-2 text-left">Matric No</th><th className="p-2 text-left">Full Names - Student Offering Course</th><th className="p-2">Assessment (40)</th><th className="p-2">Exam (60)</th><th className="p-2">Total (100)</th><th className="p-2">Grade</th><th className="p-2">Remark</th></tr></thead>
                  <tbody>{scores.map((s:any, idx:number)=><tr key={s.email} className="border-b hover:bg-emerald-50/50"><td className="p-2">{idx+1}</td><td className="p-2 font-mono font-black">{s.matricNo}</td><td className="p-2 font-bold">{s.fullName}</td><td className="p-2"><input type="number" min={0} max={40} value={s.assessment} onChange={e=>updateScore(idx,'assessment', parseInt(e.target.value)||0)} className="w-20 p-1.5 border-2 rounded-lg text-center font-black"/></td><td className="p-2"><input type="number" min={0} max={60} value={s.exam} onChange={e=>updateScore(idx,'exam', parseInt(e.target.value)||0)} className="w-20 p-1.5 border-2 rounded-lg text-center font-black"/></td><td className="p-2 font-black text-center bg-slate-50">{s.total}</td><td className="p-2 text-center"><span className={`px-2 py-0.5 rounded-full font-black text-[10px] ${s.total>=40?'bg-emerald-100 text-emerald-800':'bg-red-100 text-red-800'}`}>{getGrade(s.total)}</span></td><td className="p-2 text-center text-[10px]">{s.total>=40?'Pass':'Fail'}</td></tr>)}</tbody>
                </table>
              </div>
            </>
          )}
          {scores.length===0 && <p className="text-center text-xs py-8 bg-slate-50 border-2 border-dashed rounded-xl">Click LOAD STUDENTS OFFERING COURSE to see students in {selectedLevel} - Then enter Assessment 40 + Exam 60 for each name</p>}
        </div>
      )}

      {activeTab==='submitted' && (
        <div className="bg-white rounded-3xl border-2 p-6 space-y-3">
          <h3 className="font-black text-sm">Submitted Score Sheets - Visible to Exam Officer/HOD/Admin/Provost/Registrar - {results.length} records</h3>
          <div className="overflow-x-auto border-2 rounded-xl">
            <table className="w-full text-xs"><thead className="bg-slate-900 text-white"><tr><th className="p-2">Course</th><th className="p-2">Level</th><th className="p-2">Session</th><th className="p-2">Semester</th><th className="p-2">Matric</th><th className="p-2">Student</th><th className="p-2">Ass 40</th><th className="p-2">Exam 60</th><th className="p-2">Total</th><th className="p-2">Grade</th></tr></thead><tbody>{results.slice(0,100).map((r:any)=><tr key={r.id} className="border-b"><td className="p-2 font-bold">{r.course_code}</td><td className="p-2">{r.level}</td><td className="p-2">{r.session}</td><td className="p-2">{r.semester}</td><td className="p-2 font-mono">{r.matric_number}</td><td className="p-2">{r.student_name}</td><td className="p-2">{r.assessment}</td><td className="p-2">{r.exam}</td><td className="p-2 font-black">{r.total}</td><td className="p-2">{r.grade}</td></tr>)}</tbody></table>
          </div>
        </div>
      )}
    </div>
  );
};

export default LecturerDashboard;

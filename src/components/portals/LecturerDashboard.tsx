import React, { useState, useEffect } from 'react';

export const LecturerDashboard: React.FC = () => {
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'my_courses' | 'scores'>('my_courses');
  
  // Score entry
  const [selectedCourse, setSelectedCourse] = useState('');
  const [matricNo, setMatricNo] = useState('');
  const [caScore, setCaScore] = useState(0);
  const [examScore, setExamScore] = useState(0);
  const [results, setResults] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [saved, setSaved] = useState(false);

  const load = () => {
    try {
      const userStr = localStorage.getItem('lcns_current_user') || localStorage.getItem('lcns_user');
      let user = null;
      if (userStr) { user = JSON.parse(userStr); setCurrentUser(user); }
      else {
        const allUsers = JSON.parse(localStorage.getItem('lcns_users') || '[]');
        user = allUsers.find((u:any)=> u.role==='LECTURER') || { fullName: 'Nurse Emmanuel Gbaorun', email: 'lecturer@lcns.edu.ng', id: 'lec-1' };
        setCurrentUser(user);
      }
      const all = JSON.parse(localStorage.getItem('lcns_allocated_courses') || '[]');
      const mine = all.filter((c:any)=> 
        !user || !user.email ? true : (c.lecturerEmail === user.email || c.lecturerId === user.id)
      );
      // If no user match, show all for testing
      const display = mine.length > 0 ? mine : all;
      setMyCourses(display);
      if (display.length > 0 && !selectedCourse) setSelectedCourse(display[0].code);

      const studs = JSON.parse(localStorage.getItem('lcns_students') || '[]');
      setStudents(studs);
      if (studs.length > 0 && !matricNo) setMatricNo(studs[0].matricNo);
      
      const res = JSON.parse(localStorage.getItem('lcns_results') || '[]');
      setResults(res);
    } catch(e) { console.log(e); }
  };

  useEffect(()=>{ load(); }, []);

  const totalScore = Math.min(100, caScore + examScore);
  const getGrade = (t:number) => {
    if (t>=70) return {grade:'A', point:5, remark:'Excellent'};
    if (t>=60) return {grade:'B', point:4, remark:'Very Good'};
    if (t>=50) return {grade:'C', point:3, remark:'Good'};
    if (t>=40) return {grade:'D', point:2, remark:'Pass'};
    return {grade:'F', point:0, remark:'Fail'};
  };
  const gradeInfo = getGrade(totalScore);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const stud = students.find((s:any)=> s.matricNo===matricNo);
    const course = myCourses.find((c:any)=> c.code===selectedCourse);
    const newRes = {
      id: 'res-'+Date.now(),
      matricNo,
      studentName: stud?.fullName || 'Student',
      courseCode: selectedCourse,
      courseTitle: course?.title || selectedCourse,
      units: course?.units || 3,
      caScore,
      examScore,
      totalScore,
      grade: gradeInfo.grade,
      point: gradeInfo.point,
      remark: gradeInfo.remark,
      semester: course?.semester || 'First',
      session: course?.session || '2025/2026',
      status: 'SUBMITTED',
    };
    const filtered = results.filter((r:any)=> !(r.matricNo===matricNo && r.courseCode===selectedCourse));
    const updated = [newRes, ...filtered];
    localStorage.setItem('lcns_results', JSON.stringify(updated));
    setResults(updated);
    setSaved(true);
    setTimeout(()=>setSaved(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="bg-gradient-to-r from-blue-900 to-emerald-900 text-white rounded-3xl p-6 shadow-xl">
        <h1 className="text-2xl font-black uppercase">Lecturer Portal - {currentUser?.fullName || 'Academic Staff'}</h1>
        <p className="text-xs text-blue-200 mt-1">{currentUser?.email} - My Courses Taken for Semester - Assigned by Admin/Registrar</p>
        <div className="mt-3 flex gap-3">
          <div className="bg-white/10 p-3 rounded-2xl border border-white/20">
            <p className="text-[10px] uppercase font-bold text-amber-300">My Courses This Semester</p>
            <p className="text-2xl font-black">{myCourses.length} Courses</p>
            <p className="text-[11px]">{myCourses.map((c:any)=>c.code).join(', ') || 'No allocation yet'}</p>
          </div>
          <button onClick={load} className="px-4 py-2 bg-white text-blue-900 rounded-xl text-xs font-black">Refresh Courses</button>
        </div>
      </div>

      <div className="flex gap-2 bg-white p-2 rounded-2xl border shadow-sm">
        <button onClick={()=>setActiveTab('my_courses')} className={`px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='my_courses'?'bg-blue-700 text-white':'bg-blue-50 border-2 border-blue-300 text-blue-800'}`}>📚 My Courses Taken ({myCourses.length})</button>
        <button onClick={()=>setActiveTab('scores')} className={`px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab==='scores'?'bg-emerald-700 text-white':'bg-slate-50 border text-slate-600'}`}>📊 Score Entry</button>
      </div>

      {activeTab==='my_courses' ? (
        <div className="space-y-4">
          <div className="bg-blue-50 border-2 border-blue-300 p-3 rounded-xl text-xs font-bold">Admin/Registrar → Course Allocation → Add Course Manually → Select Lecturer ({currentUser?.fullName} - {currentUser?.email}) → Allocate → Lecturer sees here when opens portal</div>
          {myCourses.length===0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed p-12 text-center">
              <p className="font-black text-slate-600">No courses allocated yet</p>
              <p className="text-xs text-slate-500 mt-2">Your email: {currentUser?.email}</p>
              <p className="text-xs mt-2 bg-amber-50 border p-2 rounded font-bold">Admin must allocate course to your email: {currentUser?.email}</p>
              <div className="mt-4 text-left bg-slate-900 text-green-400 p-3 rounded-xl font-mono text-[11px]">
                <p>Debug Info:</p>
                <p>localStorage lcns_allocated_courses: {localStorage.getItem('lcns_allocated_courses')?.substring(0,100) || 'EMPTY'}</p>
                <p>Current User: {JSON.stringify(currentUser)?.substring(0,150)}</p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {myCourses.map((c:any)=>(
                <div key={c.id} className="border-2 border-emerald-200 rounded-2xl p-5 bg-white shadow-sm space-y-3">
                  <div className="flex justify-between">
                    <span className="font-mono font-black bg-emerald-50 px-3 py-1 rounded-xl border-2 border-emerald-200">{c.code}</span>
                    <span className="text-[11px] font-black bg-blue-700 text-white px-3 py-1 rounded-full">{c.level} • {c.semester}</span>
                  </div>
                  <h3 className="font-black text-sm">{c.title}</h3>
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-3 rounded-xl border">
                    <p><b>Units:</b> {c.units}</p><p><b>Session:</b> {c.session}</p><p><b>Dept:</b> {c.department}</p><p><b>By:</b> {c.createdBy}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>{setSelectedCourse(c.code); setActiveTab('scores');}} className="flex-1 py-2.5 bg-emerald-800 text-white rounded-xl text-[11px] font-black">Enter Scores for {c.code}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border p-6 space-y-4">
          <h3 className="font-black uppercase">Score Entry - {selectedCourse}</h3>
          {saved && <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800">Score Saved!</div>}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid md:grid-cols-4 gap-3">
              <div><label className="text-xs font-bold">Course *</label><select value={selectedCourse} onChange={e=>setSelectedCourse(e.target.value)} className="w-full p-2.5 border rounded-xl text-xs font-bold">{myCourses.map((c:any)=>(<option key={c.id} value={c.code}>{c.code} - {c.title}</option>))}<option value="NSC 101">NSC 101 - Foundations</option></select></div>
              <div><label className="text-xs font-bold">Matric No *</label><select value={matricNo} onChange={e=>setMatricNo(e.target.value)} className="w-full p-2.5 border rounded-xl text-xs font-mono font-bold">{students.map((s:any)=>(<option key={s.matricNo} value={s.matricNo}>{s.matricNo} - {s.fullName}</option>))}</select></div>
              <div><label className="text-xs font-bold">CA /30 *</label><input type="number" min={0} max={30} value={caScore} onChange={e=>setCaScore(Number(e.target.value))} className="w-full p-2.5 border rounded-xl text-xs font-bold"/></div>
              <div><label className="text-xs font-bold">Exam /70 *</label><input type="number" min={0} max={70} value={examScore} onChange={e=>setExamScore(Number(e.target.value))} className="w-full p-2.5 border rounded-xl text-xs font-bold"/></div>
            </div>
            <div className="p-3 bg-emerald-50 border rounded-xl flex justify-between items-center">
              <div><span className="text-[10px] uppercase font-bold">Total / Grade</span><div className="flex items-center gap-2"><span className="text-xl font-black">{totalScore}</span><span className="font-black bg-white px-2 py-0.5 rounded border">{gradeInfo.grade} ({gradeInfo.point}.0)</span><span className="text-xs">{gradeInfo.remark}</span></div></div>
              <button type="submit" className="px-5 py-2.5 bg-emerald-800 text-white rounded-xl text-xs font-black">Save Score</button>
            </div>
          </form>
          <div className="overflow-x-auto border rounded-xl">
            <table className="w-full text-xs"><thead className="bg-slate-50 font-bold uppercase border-b"><tr><th className="p-2">Matric</th><th className="p-2">Student</th><th className="p-2">Course</th><th className="p-2">CA</th><th className="p-2">Exam</th><th className="p-2">Total</th><th className="p-2">Grade</th></tr></thead><tbody>{results.filter((r:any)=> r.courseCode===selectedCourse).map((r:any)=>(<tr key={r.id} className="border-b"><td className="p-2 font-mono font-bold">{r.matricNo}</td><td className="p-2">{r.studentName}</td><td className="p-2">{r.courseCode}</td><td className="p-2">{r.caScore}</td><td className="p-2">{r.examScore}</td><td className="p-2 font-bold">{r.totalScore}</td><td className="p-2"><span className="bg-emerald-100 px-2 py-0.5 rounded font-bold">{r.grade}</span></td></tr>))}</tbody></table>
          </div>
        </div>
      )}
    </div>
  );
};

export default LecturerDashboard;

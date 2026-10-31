import React, { useState, useEffect } from 'react';
import { getSupabase } from '../../lib/supabase';
import jsPDF from 'jspdf';

export const LecturerDashboard: React.FC = () => {
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'my_courses' | 'scores' | 'submitted' | 'cbt_create'>('my_courses');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('ND1');
  const [selectedSession, setSelectedSession] = useState(localStorage.getItem('lcns_current_session') || '2025/2026');
  const [selectedSemester, setSelectedSemester] = useState('First Semester');
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [scores, setScores] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState<string|null>(null);

  const [cbtExams, setCbtExams] = useState<any[]>(() => { try { return JSON.parse(localStorage.getItem('lcns_cbt_exams') || '[]'); } catch { return []; } });
  const [cbtAttempts, setCbtAttempts] = useState<any[]>(() => { try { return JSON.parse(localStorage.getItem('lcns_cbt_attempts') || '[]'); } catch { return []; } });
  const [newCbt, setNewCbt] = useState<any>({
    title: '', course_code: '', level: 'ND1', session: '2025/2026', semester: 'First Semester',
    duration_minutes: 40, total_marks: 100, pass_mark: 40, is_published: false,
    anti_cheat_enabled: true, max_warnings: 5,
    questions: [{ id: Date.now().toString(), question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A', marks: 10 }]
  });

  const load = () => {
    try {
      const keys = ['lcns_erp_current_user', 'lcns-current-user', 'lcns_current_user', 'lcns_user'];
      let user = null;
      for (const k of keys) { const v = localStorage.getItem(k); if (v) { try { user = JSON.parse(v); break; } catch {} } }
      if (!user) {
        const allUsers = JSON.parse(localStorage.getItem('lcns_users') || '[]');
        user = allUsers.find((u:any)=> ['LECTURER','HOD'].includes(u.role)) || { fullName: 'Nurse Emmanuel Gbaorun', email: 'lecturer@lcns.edu.ng', id: 'lec-1', role:'LECTURER' };
      }
      setCurrentUser(user);
      const all = JSON.parse(localStorage.getItem('lcns_allocated_courses') || '[]');
      const mine = all.filter((c:any)=> !user || !user.email ? true : (c.lecturerEmail === user.email || c.lecturerId === user.id || c.lecturer_email === user.email));
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
      setCbtExams(JSON.parse(localStorage.getItem('lcns_cbt_exams') || '[]'));
      setCbtAttempts(JSON.parse(localStorage.getItem('lcns_cbt_attempts') || '[]'));
    } catch(e) { console.log(e); }
  };

  useEffect(()=>{ load(); const h = () => load(); window.addEventListener('lcns_storage_update', h); return () => window.removeEventListener('lcns_storage_update', h); }, []);

  // FIXED - LOAD ONLY STUDENTS WHO REGISTERED THIS COURSE - NOT ALL BY LEVEL
  const loadStudentsOfferingCourse = async () => {
    if(!selectedCourse) { setStatus('Select course'); return; }
    try {
      const sb = getSupabase();
      let registeredMatrics: string[] = [];

      if(sb){
        // Try Supabase course_registrations - ONLY REGISTERED
        const { data: regs } = await sb.from('course_registrations').select('matric_no').eq('course_code', selectedCourse).eq('session', selectedSession).eq('semester', selectedSemester);
        if(regs && regs.length>0) registeredMatrics = regs.map((r:any)=>r.matric_no);
      }
      
      // Fallback to local course_registrations
      if(registeredMatrics.length===0){
        const localRegs = JSON.parse(localStorage.getItem('lcns_course_registrations') || '[]').filter((r:any)=> r.course_code===selectedCourse && r.session===selectedSession && r.semester===selectedSemester);
        if(localRegs.length>0) registeredMatrics = localRegs.map((r:any)=>r.matric_no);
      }

      let filtered:any[] = [];
      if(registeredMatrics.length>0){
        // ONLY REGISTERED STUDENTS - CORRECT LOGIC
        const allUsers = JSON.parse(localStorage.getItem('lcns_users') || '[]');
        filtered = allUsers.filter((u:any) => registeredMatrics.includes(u.matricNumber || u.matric_number || u.matric_no) && (u.role==='STUDENT')).map((u:any) => ({
          matricNo: u.matricNumber || u.matric_number || u.matricNo || u.id,
          fullName: u.fullName || u.name || u.email,
          email: u.email,
          sex: u.sex || u.gender || '',
          level: u.level || selectedLevel,
          assessment: 0, exam: 0, total: 0
        }));
        setStatus(`✅ Loaded ${filtered.length} students WHO REGISTERED ${selectedCourse} - ${selectedLevel} - ${selectedSession} - ${selectedSemester} - Correct! Not all ${selectedLevel} students`);
      } else {
        // If no registration data yet (old system) - Fallback to level but warn
        const allUsers = JSON.parse(localStorage.getItem('lcns_users') || '[]');
        filtered = allUsers.filter((u:any) => (u.role === 'STUDENT') && (u.level === selectedLevel)).map((u:any) => ({
          matricNo: u.matricNumber || u.matric_number || u.matricNo || u.id,
          fullName: u.fullName || u.name || u.email,
          email: u.email, sex: u.sex || '', level: u.level || selectedLevel, assessment: 0, exam: 0, total: 0
        }));
        setStatus(`⚠️ No registration record found for ${selectedCourse} - Showing all ${selectedLevel} students (${filtered.length}) as fallback - But should be ONLY registered students! Implement course_registrations table`);
      }

      const existing = results.filter((r:any) => r.course_code === selectedCourse && r.level === selectedLevel && r.session === selectedSession && r.semester === selectedSemester);
      const merged = filtered.map((s:any) => {
        const ex = existing.find((e:any) => e.student_email === s.email || e.matric_number === s.matricNo);
        if(ex) return {...s, assessment: ex.assessment, exam: ex.exam, total: ex.total };
        return s;
      });

      setStudentsList(merged);
      setScores(merged);
      setTimeout(()=>setStatus(null), 8000);
    } catch(e:any){ setStatus('Load failed: '+e.message); }
  };

  const updateScore = (idx:number, field:'assessment'|'exam', val:number) => {
    if(field==='assessment' && (val<0 || val>40)) return;
    if(field==='exam' && (val<0 || val>60)) return;
    const up=[...scores];
    const total = field==='assessment' ? val + up[idx].exam : up[idx].assessment + val;
    up[idx] = {...up[idx], [field]:val, total };
    setScores(up);
  };
  const getGrade = (t:number) => { if (t>=70) return 'A'; if (t>=60) return 'B'; if (t>=50) return 'C'; if (t>=40) return 'D'; if (t>=30) return 'E'; return 'F'; };

  const submitAllScores = async () => {
    if(scores.length===0) { setStatus('No students loaded'); return; }
    try {
      const toSave = scores.map(s=>({
        id: `${selectedCourse}-${s.email}-${selectedLevel}-${selectedSession}-${selectedSemester}-${Date.now()}`.replace(/\s/g,''),
        course_code: selectedCourse, course_title: myCourses.find((c:any)=>c.code===selectedCourse)?.title || selectedCourse,
        level: selectedLevel, session: selectedSession, semester: selectedSemester,
        student_email: s.email, student_name: s.fullName, matric_number: s.matricNo,
        assessment: s.assessment, exam: s.exam, total: s.total, grade: getGrade(s.total),
        lecturer_email: currentUser?.email, lecturer_name: currentUser?.fullName || currentUser?.email,
        submitted_at: new Date().toISOString(), status: 'submitted'
      }));
      const existingAll = JSON.parse(localStorage.getItem('lcns_scores') || '[]');
      const filtered = existingAll.filter((x:any)=> !(x.course_code===selectedCourse && x.level===selectedLevel && x.session===selectedSession && x.semester===selectedSemester));
      const newAll = [...filtered, ...toSave];
      localStorage.setItem('lcns_scores', JSON.stringify(newAll));
      setResults(newAll);
      const sb = getSupabase();
      if(sb) { try { await sb.from('student_scores').delete().eq('course_code', selectedCourse).eq('level', selectedLevel).eq('session', selectedSession).eq('semester', selectedSemester); const {error} = await sb.from('student_scores').insert(toSave); if(error) console.warn(error); } catch(e){ console.log(e); } }
      setSaved(true);
      setStatus(`✅ SUBMITTED ONLINE! ${scores.length} students - Course ${selectedCourse} - Only registered students! - ${selectedSession}`);
      setTimeout(()=>{setSaved(false); setStatus(null);}, 6000);
      window.dispatchEvent(new Event('lcns_storage_update'));
    } catch(e:any){ setStatus('Submit failed: '+e.message); }
  };

  const printPDF = () => {
    if(scores.length===0) return;
    const doc = new jsPDF('l','mm','a4');
    doc.setFontSize(16); doc.setFont('helvetica','bold'); doc.text('COLLEGE OF NURSING SCIENCES, CATHOLIC DIOCESE OF GBOKO',148,15,{align:'center'});
    doc.setFontSize(13); doc.text('ASSESSMENT SHEET / RESULT SCORESHEET - ONLY REGISTERED STUDENTS',148,22,{align:'center'});
    doc.setFontSize(10); doc.setFont('helvetica','normal');
    const courseTitle = myCourses.find((c:any)=>c.code===selectedCourse)?.title || selectedCourse;
    doc.text(`Course: ${selectedCourse} - ${courseTitle}`,15,30);
    doc.text(`Level: ${selectedLevel}`,15,35);
    doc.text(`Session: ${selectedSession}`,100,30);
    doc.text(`Semester: ${selectedSemester}`,100,35);
    doc.text(`Lecturer: ${currentUser?.fullName || currentUser?.email}`,200,30);
    doc.text(`Total Registered: ${scores.length} Students Only`,200,35);
    doc.setFontSize(9); doc.setFont('helvetica','bold'); let y=45;
    doc.text('S/N',10,y); doc.text('Matric No',20,y); doc.text('Full Names - Registered Only',50,y); doc.text('Assessment (40)',115,y); doc.text('Exam (60)',150,y); doc.text('Total (100)',178,y); doc.text('Grade',202,y); doc.text('Remark',220,y);
    doc.setFont('helvetica','normal'); y+=7;
    scores.forEach((s,i)=>{ if(y>190){ doc.addPage(); y=20; } doc.text(`${i+1}`,10,y); doc.text(`${s.matricNo}`,20,y); doc.text(`${s.fullName.substring(0,35)}`,50,y); doc.text(`${s.assessment}`,115,y); doc.text(`${s.exam}`,150,y); doc.text(`${s.total}`,178,y); doc.text(`${getGrade(s.total)}`,202,y); doc.text(`${s.total>=40?'Pass':'Fail'}`,220,y); y+=6; });
    y+=10; doc.setFont('helvetica','bold'); doc.setFontSize(9);
    doc.text('_________________________',15,y); doc.text('_________________________',100,y); doc.text('_________________________',200,y);
    y+=5; doc.setFontSize(8); doc.text('Lecturer Signature & Date',15,y); doc.text('HOD Signature & Date',100,y); doc.text('Provost/Registrar Signature',200,y);
    doc.save(`ScoreSheet_${selectedCourse}_${selectedLevel}_${selectedSession}_${selectedSemester}_Registered_Only_${scores.length}.pdf`);
  };

  const addQuestion = () => { setNewCbt({...newCbt, questions: [...newCbt.questions, { id: Date.now().toString(), question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A', marks: 10 }]}); };
  const updateQuestion = (idx:number, field:string, val:string) => { const qs = [...newCbt.questions]; (qs[idx] as any)[field] = val; setNewCbt({...newCbt, questions: qs}); };
  const removeQuestion = (idx:number) => { if(newCbt.questions.length===1) return; setNewCbt({...newCbt, questions: newCbt.questions.filter((_:any,i:number)=>i!==idx)}); };
  const saveCbtExam = () => {
    if(!newCbt.title || !newCbt.course_code || newCbt.questions.some((q:any)=>!q.question_text || !q.option_a || !q.option_b)) { setStatus('Fill title, course and all questions with options A & B'); return; }
    const exam = { id: `CBT-${Date.now()}`, ...newCbt, lecturer_email: currentUser?.email, lecturer_name: currentUser?.fullName || currentUser?.email, created_at: new Date().toISOString(), attempts: 0, };
    const all = [...cbtExams, exam];
    localStorage.setItem('lcns_cbt_exams', JSON.stringify(all));
    const compatQs = exam.questions.map((q:any)=>({ id: q.id, question_text: q.question_text, option_a: q.option_a, option_b: q.option_b, option_c: q.option_c, option_d: q.option_d, correct_option: q.correct_option, marks: q.marks, exam_id: exam.id }));
    const oldQs = JSON.parse(localStorage.getItem('lcns_cbt_questions') || '[]');
    localStorage.setItem('lcns_cbt_questions', JSON.stringify([...oldQs, ...compatQs]));
    setCbtExams(all);
    setStatus(`✅ CBT Exam "${exam.title}" created!`);
    setNewCbt({ title: '', course_code: '', level: 'ND1', session: '2025/2026', semester: 'First Semester', duration_minutes: 40, total_marks: 100, pass_mark: 40, is_published: false, anti_cheat_enabled: true, max_warnings: 5, questions: [{ id: Date.now().toString(), question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A', marks: 10 }]});
    window.dispatchEvent(new Event('lcns_storage_update'));
    setTimeout(()=>setStatus(null), 5000);
  };
  const togglePublish = (id:string) => {
    const upd = cbtExams.map((e:any)=> e.id===id ? {...e, is_published: !e.is_published} : e);
    localStorage.setItem('lcns_cbt_exams', JSON.stringify(upd));
    setCbtExams(upd);
    setStatus(upd.find((e:any)=>e.id===id)?.is_published ? '✅ Exam Published' : '⏸️ Exam Unpublished');
    window.dispatchEvent(new Event('lcns_storage_update'));
    setTimeout(()=>setStatus(null), 4000);
  };
  const deleteCbt = (id:string) => { if(!confirm('Delete this CBT exam?')) return; const upd = cbtExams.filter((e:any)=>e.id!==id); localStorage.setItem('lcns_cbt_exams', JSON.stringify(upd)); setCbtExams(upd); setStatus('Exam deleted'); };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div className="bg-gradient-to-r from-blue-900 to-emerald-900 text-white rounded-3xl p-6 shadow-xl">
        <h1 className="text-2xl font-black uppercase">Lecturer Portal - {currentUser?.fullName || 'Academic Staff'} - {selectedSession}</h1>
        <p className="text-xs text-blue-200 mt-1">{currentUser?.email} - Score Sheet Shows ONLY Registered Students - {selectedCourse} - {selectedLevel}</p>
        {status && <div className="mt-3 p-3 bg-emerald-500/20 border border-emerald-400 rounded-xl text-xs font-bold">{status}</div>}
      </div>
      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border shadow-sm">
        <button onClick={()=>setActiveTab('my_courses')} className={`px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='my_courses'?'bg-blue-700 text-white':'bg-blue-50 border-2 border-blue-300 text-blue-800'}`}>📚 My Courses ({myCourses.length})</button>
        <button onClick={()=>setActiveTab('scores')} className={`px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='scores'?'bg-emerald-700 text-white ring-2 ring-emerald-300':'bg-emerald-50 border-2 border-emerald-300 text-emerald-800'}`}>📝 Enter Scores - Only Registered ({scores.length})</button>
        <button onClick={()=>setActiveTab('cbt_create')} className={`px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='cbt_create'?'bg-yellow-500 text-slate-900 ring-2 ring-yellow-300':'bg-yellow-50 border-2 border-yellow-400 text-yellow-800'}`}>🎓 Create CBT ({cbtExams.length})</button>
      </div>

      {activeTab==='my_courses' && (
        <div className="grid md:grid-cols-2 gap-4">{myCourses.map((c:any)=>(<div key={c.id} className="border-2 border-emerald-200 rounded-2xl p-5 bg-white shadow-sm"><div className="flex justify-between"><span className="font-mono font-black bg-emerald-50 px-3 py-1 rounded-xl border-2">{c.code}</span><span className="text-[11px] font-black bg-blue-700 text-white px-3 py-1 rounded-full">{c.level} • {c.semester} • {c.session}</span></div><h3 className="font-black text-sm mt-2">{c.title}</h3><button onClick={()=>{setSelectedCourse(c.code); setSelectedLevel(c.level||'ND1'); setSelectedSession(c.session||selectedSession); setSelectedSemester(c.semester?.includes('Second')?'Second Semester':'First Semester'); setActiveTab('scores');}} className="w-full mt-3 py-2.5 bg-emerald-800 text-white rounded-xl text-[11px] font-black">Enter Scores - Only Registered Students</button></div>))}</div>
      )}

      {activeTab==='scores' && (
        <div className="bg-white rounded-3xl border-2 p-6 space-y-4">
          <h3 className="font-black uppercase text-sm">Score Entry - ONLY Students Who Registered {selectedCourse} - {selectedLevel} - {selectedSession}</h3>
          {saved && <div className="p-3 bg-emerald-50 border-2 border-emerald-300 rounded-xl text-xs font-black text-emerald-800">✅ Saved Online! Only registered students!</div>}
          <div className="grid md:grid-cols-5 gap-3 bg-slate-50 p-4 rounded-2xl border-2">
            <div><label className="text-[10px] font-black">Course *</label><select value={selectedCourse} onChange={e=>setSelectedCourse(e.target.value)} className="w-full p-2.5 border-2 rounded-xl text-xs font-bold"><option value="">Select</option>{myCourses.map((c:any)=>(<option key={c.id} value={c.code}>{c.code} - {c.title}</option>))}</select></div>
            <div><label className="text-[10px] font-black">Level *</label><select value={selectedLevel} onChange={e=>setSelectedLevel(e.target.value)} className="w-full p-2.5 border-2 rounded-xl text-xs font-bold"><option>ND1</option><option>ND2</option><option>HND1</option><option>HND2</option></select></div>
            <div><label className="text-[10px] font-black">Session *</label><select value={selectedSession} onChange={e=>setSelectedSession(e.target.value)} className="w-full p-2.5 border-2 rounded-xl text-xs font-bold"><option>2025/2026</option><option>2026/2027</option></select></div>
            <div><label className="text-[10px] font-black">Semester *</label><select value={selectedSemester} onChange={e=>setSelectedSemester(e.target.value)} className="w-full p-2.5 border-2 rounded-xl text-xs font-bold"><option>First Semester</option><option>Second Semester</option></select></div>
            <div className="flex items-end"><button onClick={loadStudentsOfferingCourse} className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-black">LOAD ONLY REGISTERED STUDENTS FOR {selectedCourse}</button></div>
          </div>

          {scores.length>0 && (
            <>
              <div className="flex flex-wrap gap-2"><button onClick={submitAllScores} className="px-6 py-3 bg-emerald-700 text-white rounded-xl text-xs font-black">💾 SUBMIT - {scores.length} Registered Students Only</button><button onClick={printPDF} className="px-6 py-3 bg-blue-700 text-white rounded-xl text-xs font-black">🖨️ PRINT PDF - Only Registered {selectedCourse}</button></div>
              <div className="overflow-x-auto border-2 rounded-xl"><table className="w-full text-xs"><thead className="bg-slate-900 text-white uppercase text-[10px]"><tr><th className="p-2">S/N</th><th className="p-2 text-left">Matric - Registered Only</th><th className="p-2 text-left">Full Name - Sex - Level</th><th className="p-2">CA (40)</th><th className="p-2">Exam (60)</th><th className="p-2">Total</th><th className="p-2">Grade</th></tr></thead><tbody>{scores.map((s:any, idx:number)=><tr key={s.email} className="border-b hover:bg-emerald-50/50"><td className="p-2">{idx+1}</td><td className="p-2 font-mono font-black">{s.matricNo}</td><td className="p-2 font-bold">{s.fullName} - {s.sex} - {s.level}</td><td className="p-2"><input type="number" min={0} max={40} value={s.assessment} onChange={e=>updateScore(idx,'assessment', parseInt(e.target.value)||0)} className="w-20 p-1.5 border-2 rounded-lg text-center font-black"/></td><td className="p-2"><input type="number" min={0} max={60} value={s.exam} onChange={e=>updateScore(idx,'exam', parseInt(e.target.value)||0)} className="w-20 p-1.5 border-2 rounded-lg text-center font-black"/></td><td className="p-2 font-black text-center bg-slate-50">{s.total}</td><td className="p-2 text-center"><span className={`px-2 py-0.5 rounded-full font-black text-[10px] ${s.total>=40?'bg-emerald-100 text-emerald-800':'bg-red-100 text-red-800'}`}>{getGrade(s.total)}</span></td></tr>)}</tbody></table></div>
            </>
          )}
        </div>
      )}

      {activeTab==='cbt_create' && (
        <div className="bg-white rounded-3xl border-2 border-yellow-300 p-6 space-y-4">
          <h3 className="font-black">Create CBT - Anti-Cheat {newCbt.max_warnings} Warnings</h3>
          <div className="grid md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border-2">
            <input value={newCbt.title} onChange={e=>setNewCbt({...newCbt, title: e.target.value})} placeholder="Title e.g. NSC 101 Test 1" className="p-2.5 border-2 rounded-xl text-xs font-bold"/>
            <select value={newCbt.course_code} onChange={e=>setNewCbt({...newCbt, course_code: e.target.value})} className="p-2.5 border-2 rounded-xl text-xs font-bold"><option value="">Course</option>{myCourses.map((c:any)=><option key={c.id} value={c.code}>{c.code}</option>)}<option value="GENERAL">GENERAL</option></select>
            <input type="number" value={newCbt.duration_minutes} onChange={e=>setNewCbt({...newCbt, duration_minutes: parseInt(e.target.value)||40})} className="p-2.5 border-2 rounded-xl text-xs font-bold"/>
            <button onClick={saveCbtExam} className="px-4 py-2.5 bg-[#0f4c2e] text-white rounded-xl font-black text-xs">💾 SAVE CBT</button>
          </div>
          <div className="space-y-2">{newCbt.questions.map((q:any, idx:number)=>(<div key={q.id} className="border-2 rounded-2xl p-3 bg-slate-50"><input value={q.question_text} onChange={e=>updateQuestion(idx, 'question_text', e.target.value)} placeholder={`Q${idx+1} text`} className="w-full p-2 border-2 rounded-xl text-xs font-bold"/><div className="grid grid-cols-2 gap-2 mt-2"><input value={q.option_a} onChange={e=>updateQuestion(idx, 'option_a', e.target.value)} placeholder="A" className="p-2 border rounded-xl text-xs"/><input value={q.option_b} onChange={e=>updateQuestion(idx, 'option_b', e.target.value)} placeholder="B" className="p-2 border rounded-xl text-xs"/><input value={q.option_c} onChange={e=>updateQuestion(idx, 'option_c', e.target.value)} placeholder="C" className="p-2 border rounded-xl text-xs"/><input value={q.option_d} onChange={e=>updateQuestion(idx, 'option_d', e.target.value)} placeholder="D" className="p-2 border rounded-xl text-xs"/></div><div className="flex gap-2 mt-2">{['A','B','C','D'].map(o=><label key={o} className={`px-3 py-1 rounded-full border-2 text-xs font-bold ${q.correct_option===o?'bg-emerald-600 text-white':''}`}><input type="radio" checked={q.correct_option===o} onChange={()=>updateQuestion(idx, 'correct_option', o)} className="hidden"/>{o}</label>)}</div></div>))}<button onClick={addQuestion} className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold">+ Add Question</button></div>
          <div className="grid md:grid-cols-2 gap-3">{cbtExams.filter((e:any)=>e.lecturer_email===currentUser?.email).map((ex:any)=>(<div key={ex.id} className={`border-2 rounded-2xl p-4 ${ex.is_published?'border-emerald-300 bg-emerald-50':'border-amber-200 bg-amber-50'}`}><h4 className="font-black text-sm">{ex.title} - {ex.course_code}</h4><p className="text-[11px]">{ex.questions.length} Qs - {ex.duration_minutes} mins</p><div className="flex gap-2 mt-2"><button onClick={()=>togglePublish(ex.id)} className={`px-3 py-1.5 rounded-xl text-[11px] font-black ${ex.is_published?'bg-amber-600 text-white':'bg-emerald-700 text-white'}`}>{ex.is_published?'Unpublish':'Publish'}</button><button onClick={()=>deleteCbt(ex.id)} className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-[11px]">Delete</button></div></div>))}</div>
        </div>
      )}
    </div>
  );
};
export default LecturerDashboard;

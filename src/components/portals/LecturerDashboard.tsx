import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import { ApiService } from '../../services/api';
import { ResultScore, COLLEGE_CONFIG } from '../../types';
import {
  FileEdit,
  Save,
  CheckCircle2,
  BookOpen,
  Users,
  Award,
  Plus,
  RefreshCw,
  Search,
  GraduationCap,
  Calendar,
} from 'lucide-react';

import { CBTExamManager } from '../cbt/CBTExamManager';

export const LecturerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'my_courses' | 'cbt' | 'scores'>('my_courses');
  const [results, setResults] = useState<ResultScore[]>(StorageService.getResults());
  const students = StorageService.getStudents();
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Score Entry State
  const [selectedCourse, setSelectedCourse] = useState('NSC 101');
  const [matricNo, setMatricNo] = useState('LCNS/2026/ND/014');
  const [caScore, setCaScore] = useState<number>(26);
  const [examScore, setExamScore] = useState<number>(56);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const totalScore = Math.min(100, Math.max(0, (caScore || 0) + (examScore || 0)));
  const gradeInfo = ApiService.getGradeAndPoint(totalScore);

  const loadMyCourses = () => {
    const user = StorageService.getCurrentUser();
    setCurrentUser(user);
    const all = JSON.parse(localStorage.getItem('lcns_allocated_courses') || '[]');
    const mine = all.filter((c:any)=> 
      c.lecturerEmail === user?.email || 
      c.lecturerId === user?.id || 
      c.lecturerName === user?.fullName ||
      // Also include legacy courses assigned via HOD table
      c.lecturerName?.toLowerCase().includes((user?.fullName || '').toLowerCase().substring(0,10))
    );
    setMyCourses(mine);
    if (mine.length > 0 && selectedCourse === 'NSC 101') {
      setSelectedCourse(mine[0].code);
    }
  };

  useEffect(()=>{ loadMyCourses(); const i=setInterval(loadMyCourses, 3000); return()=>clearInterval(i); }, []);

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matricNo) return;
    const studentObj = students.find((s) => s.matricNo === matricNo);
    const studentName = studentObj ? studentObj.fullName : 'Nursing Student';
    const courseObj = myCourses.find(c=>c.code===selectedCourse);
    const newScore: ResultScore = {
      id: 'res-' + Date.now(),
      matricNo,
      studentName,
      courseCode: selectedCourse,
      courseTitle: courseObj?.title || (selectedCourse === 'NSC 101' ? 'Foundations of Nursing Practice I' : 'Medical Microbiology'),
      units: courseObj?.units || (selectedCourse === 'NSC 101' ? 3 : 2),
      caScore,
      examScore,
      totalScore,
      grade: gradeInfo.grade,
      point: gradeInfo.point,
      remark: gradeInfo.remark,
      semester: courseObj?.semester || 'First',
      session: courseObj?.session || COLLEGE_CONFIG.CURRENT_SESSION,
      status: 'SUBMITTED',
    };
    const filtered = results.filter((r) => !(r.matricNo === matricNo && r.courseCode === selectedCourse));
    const updated = [newScore, ...filtered];
    StorageService.saveResults(updated);
    setResults(updated);
    StorageService.logAction('lecturer@lcns.edu.ng','LECTURER','SCORE_ENTRY',`Entered score for ${matricNo} in ${selectedCourse}: Total ${totalScore} (${gradeInfo.grade})`);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const myCourseResults = results.filter((r) => r.courseCode === selectedCourse);

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-emerald-800 px-3 py-1 rounded-full">Department of Nursing Sciences • Academic Staff • {currentUser?.email}</span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase font-serif-crest mt-2">{currentUser?.fullName || 'Nurse Emmanuel Gbaorun (FWACN)'}</h1>
            <p className="text-xs text-emerald-200">My Courses Taken for Semester: {myCourses.length} Courses Assigned by Admin/Registrar - Once they allocate you see here</p>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl border border-white/20 text-center">
            <span className="text-[10px] text-amber-300 uppercase block font-bold">My Courses This Semester</span>
            <span className="text-2xl font-black">{myCourses.length} Courses</span>
            <span className="text-[11px] block text-emerald-200">{myCourses.map(c=>c.code).join(', ') || 'No allocation yet'}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs no-print">
        <button onClick={() => setActiveTab('my_courses')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black ${activeTab==='my_courses'?'bg-blue-700 text-white shadow ring-2 ring-blue-300':'bg-blue-50 border-2 border-blue-300 text-blue-800'}`}><BookOpen className="w-4 h-4"/><span>📚 My Courses Taken for Semester - Assigned by Admin/Registrar</span><span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-black">{myCourses.length}</span></button>
        <button onClick={() => setActiveTab('cbt')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab==='cbt'?'bg-[#0a4d2e] text-white':'text-slate-600 hover:bg-slate-100'}`}><Award className="w-4 h-4 text-amber-400"/><span>CBT Tests</span></button>
        <button onClick={() => setActiveTab('scores')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab==='scores'?'bg-[#0a4d2e] text-white':'text-slate-600 hover:bg-slate-100'}`}><FileEdit className="w-4 h-4 text-emerald-400"/><span>Score Entry</span></button>
      </div>

      {activeTab==='my_courses' ? (
        <div className="space-y-4">
          <div className="bg-blue-50 border-2 border-blue-300 p-3 rounded-xl text-xs font-bold">✅ FEATURE: Admin and Registrar can add course manually and assign lecturer registered on the portal - Once they open portal they see their course taken for semester - Your login: {currentUser?.email} - Admin must allocate using same email</div>
          {myCourses.length===0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed p-12 text-center">
              <GraduationCap className="w-12 h-12 mx-auto text-slate-300 mb-3"/>
              <p className="font-black text-slate-600">No courses allocated yet</p>
              <p className="text-xs text-slate-500 mt-2">Admin/Registrar → Course Allocation Manager → Add Course Manually → Select Lecturer ({currentUser?.fullName} - {currentUser?.email}) → Allocate</p>
              <p className="text-xs mt-3 bg-amber-50 border p-3 rounded-xl font-bold">Ask Admin to allocate course to: {currentUser?.email}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {myCourses.map((c:any)=>(
                <div key={c.id} className="border-2 border-emerald-200 rounded-2xl p-5 bg-white shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="font-mono font-black text-emerald-900 text-sm bg-emerald-50 px-3 py-1 rounded-xl border-2 border-emerald-200">{c.code}</span>
                    <span className="text-[11px] font-black bg-blue-700 text-white px-3 py-1 rounded-full">{c.level} • {c.semester} Sem</span>
                  </div>
                  <h3 className="font-black text-sm leading-tight">{c.title}</h3>
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-3 rounded-xl border">
                    <p><b>Units:</b> {c.units}</p><p><b>Session:</b> {c.session}</p><p><b>Dept:</b> {c.department}</p><p><b>By:</b> {c.createdBy}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>{setSelectedCourse(c.code); setActiveTab('scores');}} className="flex-1 py-2.5 bg-emerald-800 text-white rounded-xl text-[11px] font-black">Enter Scores for {c.code}</button>
                    <button onClick={()=>{setSelectedCourse(c.code); setActiveTab('cbt');}} className="px-3 py-2 bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-[11px] font-black">CBT</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'cbt' ? (
        <CBTExamManager currentUser={{ id: currentUser?.id || 'LCNS/2026/LC/001', email: currentUser?.email || 'lecturer@lcns.edu.ng', role: 'LECTURER', fullName: currentUser?.fullName || 'Nurse Emmanuel Gbaorun (FWACN)', status: 'ACTIVE' }} allowedTypes={['COURSE_TEST']} />
      ) : (
        <>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2"><div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl"><FileEdit className="w-5 h-5"/></div><div><h3 className="font-bold text-slate-900 text-base uppercase">CA & Semester Exam Score Input - {selectedCourse}</h3><p className="text-xs text-slate-500">Auto computed NMCN 5-point scale</p></div></div>
              <div className="flex items-center gap-2"><span className="text-xs font-bold text-slate-600">Active Course:</span><select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="p-2 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-950"><option value="NSC 101">NSC 101: Foundations (3 Units)</option>{myCourses.map((c:any)=>(<option key={c.id} value={c.code}>{c.code}: {c.title} ({c.units} Units) - {c.level} {c.semester}</option>))}</select></div>
            </div>
            {savedSuccess && (<div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2 font-bold"><CheckCircle2 className="w-4 h-4 text-emerald-600"/><span>Score recorded and synced!</span></div>)}
            <form onSubmit={handleSaveScore} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div><label className="block text-xs font-bold mb-1">Matric No *</label><select value={matricNo} onChange={(e) => setMatricNo(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-mono font-bold">{students.map((s) => (<option key={s.matricNo} value={s.matricNo}>{s.matricNo} - {s.fullName}</option>))}</select></div>
                <div><label className="block text-xs font-bold mb-1">CA / 30 *</label><input type="number" min="0" max="30" value={caScore} onChange={(e) => setCaScore(Number(e.target.value))} className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm font-bold font-mono-code" required/></div>
                <div><label className="block text-xs font-bold mb-1">Exam / 70 *</label><input type="number" min="0" max="70" value={examScore} onChange={(e) => setExamScore(Number(e.target.value))} className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm font-bold font-mono-code" required/></div>
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between"><div><span className="text-[10px] uppercase font-bold block">Total / Grade</span><span className="text-xl font-black font-mono-code">{totalScore}</span><span className="ml-2 text-sm font-black bg-white px-2 py-0.5 rounded">{gradeInfo.grade} ({gradeInfo.point}.0)</span></div><button type="submit" className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"><Save className="w-4 h-4 text-amber-300"/><span>Save</span></button></div>
              </div>
            </form>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4"><h3 className="font-bold text-base uppercase">Submitted Score Sheet for {selectedCourse}</h3><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50 font-bold uppercase border-b"><tr><th className="p-3">Matric No</th><th className="p-3">Student Name</th><th className="p-3 text-center">CA</th><th className="p-3 text-center">Exam</th><th className="p-3 text-center">Total</th><th className="p-3 text-center">Grade</th><th className="p-3">Remark</th><th className="p-3 text-center">Status</th></tr></thead><tbody className="divide-y">{myCourseResults.map((r) => (<tr key={r.id} className="hover:bg-slate-50"><td className="p-3 font-mono font-bold text-emerald-900">{r.matricNo}</td><td className="p-3 font-semibold">{r.studentName}</td><td className="p-3 text-center">{r.caScore}</td><td className="p-3 text-center">{r.examScore}</td><td className="p-3 text-center font-bold">{r.totalScore}</td><td className="p-3 text-center"><span className="font-bold text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">{r.grade}</span></td><td className="p-3">{r.remark}</td><td className="p-3 text-center"><span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 justify-center"><CheckCircle2 className="w-3 h-3"/>Submitted</span></td></tr>))}</tbody></table></div></div>
        </>
      )}
    </div>
  );
};

export default LecturerDashboard;

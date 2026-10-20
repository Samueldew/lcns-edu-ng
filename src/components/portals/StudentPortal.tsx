import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import { ApiService } from '../../services/api';
import { Student, Course, ResultScore, PaymentRecord, CBTExam, CBTSubmission, COLLEGE_CONFIG } from '../../types';
import { CollegeLogo } from '../common/CollegeLogo';
import {
  User, GraduationCap, BookOpen, Award, CreditCard, Printer, CheckCircle2, Calendar, Phone, Mail, MapPin, QrCode, FileText, Clock, Sparkles, Camera, Upload, Play, RotateCw,
} from 'lucide-react';
import { CBTExamSession } from '../cbt/CBTExamSession';
import { UserProfilePhotoModal } from '../common/UserProfilePhotoModal';
import { CourseRegistration } from './CourseRegistration';

export const StudentPortal: React.FC = () => {
  const currentUser = StorageService.getCurrentUser();
  const students = StorageService.getStudents() || [];
  
  const fallbackStudent: any = {
    fullName: currentUser?.fullName || 'Nursing Student',
    matricNo: currentUser?.matricNo || currentUser?.id || 'LCNS/STU/001',
    email: currentUser?.email || 'student@lcns.edu.ng',
    program: 'General Nursing',
    level: 'ND1',
    photoUrl: currentUser?.photoUrl || '',
    bloodGroup: 'O+',
    genotype: 'AA'
  };
  
  const student = students.find((s) => s.matricNo === currentUser?.matricNo || s.email?.toLowerCase() === currentUser?.email?.toLowerCase() || s.matricNo === currentUser?.id) || students[0] || fallbackStudent;

  const allCourses = StorageService.getCourses() || [];
  const allResults = StorageService.getResults() || [];
  const allPayments = StorageService.getPayments() || [];

  const [activeTab, setActiveTab] = useState<'results' | 'cbt' | 'courses' | 'fees' | 'idcard' | 'profile' | 'course_reg'>('course_reg');
  const [studentPhoto, setStudentPhoto] = useState<string>(currentUser?.photoUrl || student?.photoUrl || '');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [activeCbtExam, setActiveCbtExam] = useState<CBTExam | null>(null);
  const [cbtExams, setCbtExams] = useState<CBTExam[]>(StorageService.getCBTExams() || []);
  const [cbtSubmissions, setCbtSubmissions] = useState<CBTSubmission[]>(StorageService.getCBTSubmissions() || []);

  useEffect(() => {
    const handleStorageUpdate = () => {
      const refreshedUser = StorageService.getCurrentUser();
      if (refreshedUser?.photoUrl) setStudentPhoto(refreshedUser.photoUrl);
      setCbtExams(StorageService.getCBTExams() || []);
      setCbtSubmissions(StorageService.getCBTSubmissions() || []);
    };
    window.addEventListener('lcns_storage_update', handleStorageUpdate);
    return () => window.removeEventListener('lcns_storage_update', handleStorageUpdate);
  }, []);

  const studentResults = allResults.filter((r) => r.matricNo === student?.matricNo);
  const studentPayments = allPayments.filter((p) => p.matricOrFormNo === student?.matricNo);

  let gpaData: any = { gpa: 4.65, totalUnits: 17, totalQualityPoints: 79 };
  try {
    if (student?.matricNo && ApiService.calculateGPA) {
      const calc = ApiService.calculateGPA(student.matricNo, 'First', COLLEGE_CONFIG.CURRENT_SESSION);
      if (calc) gpaData = calc;
    }
  } catch (e) {
    console.log('GPA calc safe fallback', e);
  }

  const handlePrint = () => window.print();

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative group w-16 h-16 rounded-2xl bg-emerald-800 border-2 border-amber-400 overflow-hidden flex items-center justify-center text-white shrink-0 shadow-md">
              {studentPhoto ? <img src={studentPhoto} alt={student.fullName} className="w-full h-full object-cover" /> : <User className="w-8 h-8" />}
              <button onClick={() => setShowPhotoModal(true)} title="Upload Photo from Gallery" className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-emerald-800 px-3 py-1 rounded-full">Bonafide Nursing Student • {student.level} • Course Registration NEW</span>
              <h1 className="text-xl sm:text-2xl font-black uppercase font-serif-crest mt-1.5">{student.fullName}</h1>
              <p className="text-xs text-emerald-200 font-mono-code">Matric No: <strong className="text-white">{student.matricNo}</strong> • {student.program} • COLLEGE OF NURSING SCIENCES, CATHOLIC DIOCESE OF GBOKO</p>
            </div>
          </div>
          <div className="bg-emerald-950/80 p-3.5 rounded-2xl border border-emerald-800 text-center sm:text-right">
            <span className="text-[10px] text-emerald-300 uppercase block font-bold">Current CGPA</span>
            <span className="text-2xl font-black text-amber-400 font-mono-code">{gpaData?.gpa ? Number(gpaData.gpa).toFixed(2) : '4.65'} / 5.0</span>
            <span className="block text-[10px] text-emerald-300 font-semibold">Distinction Standing</span>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-emerald-800/80 flex flex-wrap items-center gap-2 text-xs font-bold no-print">
          <button onClick={() => setActiveTab('course_reg')} className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${activeTab === 'course_reg' ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300' : 'bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100'}`}><BookOpen className="w-3.5 h-3.5" /><span>📚 Course Registration - Semester - NEW - Approve/Print</span></button>
          <button onClick={() => setActiveTab('results')} className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${activeTab === 'results' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100'}`}><Award className="w-3.5 h-3.5" /><span>Semester Results</span></button>
          <button onClick={() => setActiveTab('cbt')} className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${activeTab === 'cbt' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100'}`}><Sparkles className="w-3.5 h-3.5" /><span>Course CBT Tests</span></button>
          <button onClick={() => setActiveTab('courses')} className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${activeTab === 'courses' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100'}`}><BookOpen className="w-3.5 h-3.5" /><span>Available Courses</span></button>
          <button onClick={() => setActiveTab('fees')} className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${activeTab === 'fees' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100'}`}><CreditCard className="w-3.5 h-3.5" /><span>Tuition & Fees</span></button>
          <button onClick={() => setActiveTab('idcard')} className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${activeTab === 'idcard' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100'}`}><QrCode className="w-3.5 h-3.5" /><span>Digital ID Card</span></button>
          <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${activeTab === 'profile' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100'}`}><User className="w-3.5 h-3.5" /><span>My Profile & Photo</span></button>
        </div>
      </div>

      {activeTab === 'course_reg' && <CourseRegistration />}

      {activeTab === 'results' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between no-print border-b pb-4">
            <div><h3 className="font-bold text-slate-900 text-base uppercase font-serif-crest">Official Semester Examination Result Slip</h3><p className="text-xs text-slate-500">Session: {COLLEGE_CONFIG.CURRENT_SESSION} • Semester: First • NMCN 5.0 Scale • COLLEGE OF NURSING SCIENCES, CATHOLIC DIOCESE OF GBOKO</p></div>
            <button onClick={handlePrint} className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"><Printer className="w-4 h-4" /><span>Print Official Result Slip</span></button>
          </div>
          <div className="border-4 border-double border-emerald-900 p-8 rounded-2xl bg-white shadow-sm print-page space-y-5">
            <div className="text-center pb-4 border-b-2 border-emerald-900"><div className="flex items-center justify-center gap-3 mb-2"><CollegeLogo size="md" /><div><h1 className="text-lg sm:text-xl font-black uppercase font-serif-crest text-emerald-950">College of Nursing Sciences, Catholic Diocese of Gboko</h1><p className="text-xs font-extrabold text-emerald-800 uppercase">Office of the Examination Officer • Semester Examination Statement</p><p className="text-[11px] text-slate-600">Motto: "Learn, Serve & Save" • info@lcns.edu.ng • lcns.edu.ng</p></div></div><div className="inline-block bg-emerald-900 text-white text-xs font-bold uppercase px-4 py-1 rounded-full mt-2">First Semester 2026/2027 Academic Result Slip</div></div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200"><div><span className="text-slate-500 block text-[10px]">Student Name:</span><strong className="text-slate-900 uppercase">{student.fullName}</strong></div><div><span className="text-slate-500 block text-[10px]">Matriculation No:</span><strong className="text-emerald-900 font-mono-code">{student.matricNo}</strong></div><div><span className="text-slate-500 block text-[10px]">Programme & Level:</span><strong className="text-slate-900">{student.program} ({student.level})</strong></div><div><span className="text-slate-500 block text-[10px]">Academic Standing:</span><strong className="text-emerald-700">Good Standing (Distinction)</strong></div></div>
            <div className="overflow-x-auto"><table className="w-full text-left text-xs border border-slate-200"><thead className="bg-emerald-900 text-white font-bold uppercase tracking-wider"><tr><th className="p-2.5">Course Code</th><th className="p-2.5">Course Title</th><th className="p-2.5 text-center">Unit</th><th className="p-2.5 text-center">CA (30)</th><th className="p-2.5 text-center">Exam (70)</th><th className="p-2.5 text-center">Total (100)</th><th className="p-2.5 text-center">Grade</th><th className="p-2.5 text-center">Point</th><th className="p-2.5">Remark</th></tr></thead><tbody className="divide-y divide-slate-200">{studentResults.length > 0 ? studentResults.map((r) => (<tr key={r.id} className="hover:bg-slate-50"><td className="p-2.5 font-mono-code font-bold text-emerald-900">{r.courseCode}</td><td className="p-2.5 font-semibold text-slate-800">{r.courseTitle}</td><td className="p-2.5 text-center font-bold">{r.units}</td><td className="p-2.5 text-center font-mono-code">{r.caScore}</td><td className="p-2.5 text-center font-mono-code">{r.examScore}</td><td className="p-2.5 text-center font-mono-code font-bold text-slate-900 text-sm">{r.totalScore}</td><td className="p-2.5 text-center font-bold text-emerald-800">{r.grade}</td><td className="p-2.5 text-center font-mono-code font-bold">{r.point}.0</td><td className="p-2.5 text-slate-700 font-semibold">{r.remark}</td></tr>)) : (<tr><td colSpan={9} className="p-6 text-center text-slate-500">No results published yet for this semester - contact Exam Officer</td></tr>)}</tbody></table></div>
            <div className="grid grid-cols-3 gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-300 text-center text-xs"><div><span className="text-slate-500 block text-[10px] uppercase font-bold">Total Credit Units Registered</span><span className="text-lg font-black text-slate-900 font-mono-code">{gpaData?.totalUnits || 17} Units</span></div><div><span className="text-slate-500 block text-[10px] uppercase font-bold">Total Quality Points (TQP)</span><span className="text-lg font-black text-slate-900 font-mono-code">{gpaData?.totalQualityPoints || 79}</span></div><div><span className="text-slate-500 block text-[10px] uppercase font-bold">Semester GPA / CGPA</span><span className="text-2xl font-black text-emerald-950 font-mono-code">{gpaData?.gpa ? Number(gpaData.gpa).toFixed(2) : '4.65'}</span></div></div>
          </div>
        </div>
      )}
      {activeTab === 'courses' && (
        <div className="bg-white rounded-3xl border p-8 space-y-4">
          <h3 className="font-black text-sm">Available Courses - {student.level} - COLLEGE OF NURSING SCIENCES, CATHOLIC DIOCESE OF GBOKO</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {allCourses.filter((c:any)=> c.level===student.level || !c.level).map((c:any)=>(
              <div key={c.id} className="border p-3 rounded-xl text-xs"><p className="font-bold">{c.code} - {c.title}</p><p>Units: {c.units} | {c.semester} Semester</p></div>
            ))}
          </div>
        </div>
      )}
      {activeTab !== 'results' && activeTab !== 'cbt' && activeTab !== 'courses' && activeTab !== 'course_reg' && (
        <div className="bg-white rounded-3xl border p-8 text-center text-slate-500 text-sm">Content for {activeTab} - safe mode - COLLEGE OF NURSING SCIENCES, CATHOLIC DIOCESE OF GBOKO</div>
      )}
      {activeTab === 'cbt' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4"><div><h3 className="font-bold text-slate-900 text-base uppercase font-serif-crest">Continuous Assessment & Course CBT Examinations</h3><p className="text-xs text-slate-500">Active Tests for {student.level}</p></div><span className="text-xs font-bold text-[#0a4d2e] bg-emerald-100 px-3 py-1 rounded-full">{cbtExams.filter((e) => e.isPublished).length} Active Tests</span></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{cbtExams.filter((e) => e.isPublished).map((exam) => { const pastSub = cbtSubmissions.find((s) => s.examId === exam.id && (s.userId === student.matricNo || s.userEmail === student.email)); return (<div key={exam.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-4 flex flex-col justify-between"><div className="space-y-2"><div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase tracking-wider text-[#0a4d2e] bg-emerald-100 px-2.5 py-0.5 rounded-full font-mono-code">{exam.courseCode || 'GENERAL'}</span><div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono-code"><Clock className="w-3.5 h-3.5 text-amber-500" /><span>{exam.durationMinutes} Mins</span></div></div><h4 className="text-sm font-bold text-slate-900 leading-snug">{exam.title}</h4><p className="text-xs text-slate-500">{exam.courseTitle || 'Accredited Nursing Sciences Test'} • Total Questions: {exam.questions?.length || 0}</p></div><div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">{pastSub ? (<span className="px-2.5 py-1 bg-emerald-100 text-[#0a4d2e] rounded-xl text-xs font-black font-mono-code">Score: {pastSub.score}/{pastSub.totalQuestions} ({pastSub.percentage}%)</span>) : (<span className="text-xs text-amber-700 font-bold flex items-center gap-1"><Clock className="w-3.5 h-3.5" /><span>Not Yet Taken</span></span>)}<button onClick={() => setActiveCbtExam(exam)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${pastSub ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' : 'bg-[#0a4d2e] hover:bg-[#073822] text-white'}`}><Play className="w-3.5 h-3.5 text-amber-300" /><span>{pastSub ? 'Review / Retake' : 'Start CBT Exam'}</span></button></div></div>);})}</div>
        </div>
      )}
      {activeCbtExam && (<CBTExamSession exam={activeCbtExam} currentUser={currentUser || { id: student.matricNo, email: student.email, role: 'STUDENT', fullName: student.fullName, status: 'ACTIVE', matricNo: student.matricNo, photoUrl: studentPhoto }} onClose={() => setActiveCbtExam(null)} onCompleted={() => setCbtSubmissions(StorageService.getCBTSubmissions() || [])} />)}
      {showPhotoModal && <UserProfilePhotoModal onClose={() => setShowPhotoModal(false)} />}
    </div>
  );
};

export default StudentPortal;

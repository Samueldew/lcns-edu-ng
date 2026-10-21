import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import { CollegeLogo } from '../common/CollegeLogo';
import { BookOpen, Plus, Trash2, Printer, AlertTriangle, Clock } from 'lucide-react';

interface CourseReg {
  id: string;
  matricNo: string;
  fullName: string;
  email: string;
  level: string;
  session: string;
  semester: string;
  courses: { code: string; title: string; units: number }[];
  totalUnits: number;
  status: 'PENDING' | 'APPROVED' | 'DISAPPROVED' | 'PENDING_EXCEED';
  createdAt: string;
}

export const CourseRegistration: React.FC = () => {
  const currentUser = StorageService.getCurrentUser();
  const allCourses = StorageService.getCourses() || [];
  const students = StorageService.getStudents() || [];
  const student = students.find((s:any) => s.email?.toLowerCase() === currentUser?.email?.toLowerCase() || s.matricNo === currentUser?.matricNo) || { fullName: currentUser?.fullName || 'Student', matricNo: currentUser?.matricNo || 'LCNS/STU/001', level: 'ND 1', email: currentUser?.email };

  const [selectedCourses, setSelectedCourses] = useState<{ code: string; title: string; units: number }[]>([]);
  const [semester, setSemester] = useState<'First' | 'Second'>('First');
  const [myRegs, setMyRegs] = useState<CourseReg[]>([]);
  const [status, setStatus] = useState('');

  const creditLimits = {
    ND1: parseInt(localStorage.getItem('lcns_credit_ND1') || '24'),
    ND2: parseInt(localStorage.getItem('lcns_credit_ND2') || '26'),
    HND1: parseInt(localStorage.getItem('lcns_credit_HND1') || '28'),
    HND2: parseInt(localStorage.getItem('lcns_credit_HND2') || '28'),
  };

  const getLimit = () => {
    const l = (student.level || 'ND 1').toUpperCase().replace(' ', '');
    if (l.includes('ND1')) return creditLimits.ND1;
    if (l.includes('ND2')) return creditLimits.ND2;
    if (l.includes('HND1')) return creditLimits.HND1;
    return creditLimits.HND2;
  };

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem('lcns_course_registrations') || '[]') as CourseReg[];
    setMyRegs(all.filter(r => r.matricNo === student.matricNo || r.email?.toLowerCase() === student.email?.toLowerCase()));
  }, []);

  const totalUnits = selectedCourses.reduce((s, c) => s + c.units, 0);
  const limit = getLimit();
  const exceeds = totalUnits > limit;

  const addCourse = (course: any) => {
    if (selectedCourses.find(c => c.code === course.code)) return;
    setSelectedCourses([...selectedCourses, { code: course.code, title: course.title, units: course.units }]);
  };

  const removeCourse = (code: string) => {
    setSelectedCourses(selectedCourses.filter(c => c.code !== code));
  };

  const handleSubmit = () => {
    if (selectedCourses.length === 0) { setStatus('Select at least one course'); return; }
    const newReg: CourseReg = {
      id: 'reg-' + Date.now(),
      matricNo: student.matricNo,
      fullName: student.fullName,
      email: student.email,
      level: student.level,
      session: localStorage.getItem('lcns_current_session') || '2025/2026',
      semester,
      courses: selectedCourses,
      totalUnits,
      status: exceeds ? 'PENDING_EXCEED' : 'PENDING',
      createdAt: new Date().toISOString(),
    };
    const all = JSON.parse(localStorage.getItem('lcns_course_registrations') || '[]');
    all.push(newReg);
    localStorage.setItem('lcns_course_registrations', JSON.stringify(all));
    setMyRegs([...myRegs, newReg]);
    setSelectedCourses([]);
    setStatus(exceeds ? 'Submitted with ' + totalUnits + ' units - EXCEEDS limit ' + limit + ' - MUST DISAPPROVE' : 'Submitted ' + totalUnits + ' units - Pending approval');
    window.dispatchEvent(new Event('lcns_storage_update'));
  };

  const filteredCourses = allCourses.filter((c:any) => !c.level || c.level === student.level || c.level.replace(' ','') === student.level.replace(' ', ''));

  return (
    <div className="bg-white rounded-3xl border-4 border-blue-300 p-6 space-y-6">
      <div className="text-center border-b-4 border-double border-emerald-900 pb-3">
        <div className="flex items-center justify-center gap-3"><CollegeLogo size="md"/><div><h1 className="text-lg font-black uppercase">College of Nursing Sciences, Catholic Diocese of Gboko</h1><p className="text-xs font-bold">Course Registration Form - Student Portal</p><p className="text-[10px]">{student.fullName} - {student.matricNo} - {student.level} - Max Units: {limit}</p></div></div>
      </div>

      {status && <div className="p-3 rounded-xl text-xs font-bold text-center border-2 bg-amber-50">{status}</div>}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="font-black text-sm">Available Courses - {student.level}</h3>
          <div className="flex gap-2"><select value={semester} onChange={e=>setSemester(e.target.value as any)} className="px-3 py-2 border-2 rounded-xl text-xs font-bold"><option value="First">First Semester</option><option value="Second">Second Semester</option></select><div className="px-3 py-2 rounded-xl text-xs font-black bg-emerald-600 text-white">Total: {totalUnits} / {limit} {exceeds ? 'EXCEEDS' : ''}</div></div>
          <div className="border-2 rounded-xl max-h-80 overflow-y-auto">
            {filteredCourses.map((c:any)=>(
              <div key={c.id} className="flex justify-between items-center p-2 border-b hover:bg-slate-50 text-xs"><div><p className="font-bold">{c.code} - {c.title}</p><p className="text-[10px]">{c.units} Units</p></div><button onClick={()=>addCourse(c)} className="px-2 py-1 bg-blue-600 text-white rounded-lg font-black text-[10px]">Add</button></div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-black text-sm">Selected Courses - {selectedCourses.length}</h3>
          {exceeds && <div className="bg-red-50 border-2 border-red-400 rounded-xl p-2 flex gap-2 text-xs font-bold text-red-700"><AlertTriangle className="w-4 h-4"/> EXCEEDS limit {totalUnits} is greater than {limit} - MUST DISAPPROVE</div>}
          <div className="border-2 rounded-xl p-2 space-y-1 min-h-40">
            {selectedCourses.length===0 ? <p className="text-xs text-center py-8 text-slate-400">No courses selected</p> : selectedCourses.map(c=>(
              <div key={c.code} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg text-xs"><span className="font-bold">{c.code} - {c.title} ({c.units})</span><button onClick={()=>removeCourse(c.code)} className="w-6 h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center"><Trash2 className="w-3 h-3"/></button></div>
            ))}
          </div>
          <button onClick={handleSubmit} disabled={selectedCourses.length===0} className="w-full py-3 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white rounded-xl font-black text-sm">Submit Registration - {totalUnits} Units</button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-black text-sm flex items-center gap-2"><Clock className="w-4 h-4"/>My Registrations</h3>
        {myRegs.length===0 ? <p className="text-xs text-slate-500">No registrations yet</p> : myRegs.map(reg=>(
          <div key={reg.id} className="border-2 rounded-xl p-3 text-xs bg-slate-50">
            <div className="flex justify-between"><span className="font-bold">{reg.semester} Semester - {reg.totalUnits} Units - {reg.session}</span><span className="px-2 py-0.5 rounded-full font-black text-[10px] bg-amber-200">{reg.status}</span></div>
            <p className="mt-1">{reg.courses.map(c=>c.code).join(', ')}</p>
            {reg.status==='APPROVED' && <button onClick={()=>window.print()} className="mt-2 w-full py-2 bg-slate-900 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1"><Printer className="w-4 h-4"/>Print Approved Form</button>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseRegistration;

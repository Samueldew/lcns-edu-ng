import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import { getSupabase } from '../../lib/supabase';
import jsPDF from 'jspdf';

export const CourseRegistration: React.FC = () => {
  const currentUser = StorageService.getCurrentUser() || { email: 'student@lcns.edu.ng', fullName: 'Student Name', level: 'ND 1', id: 'stu-1' };
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<any[]>([]);
  const [session, setSession] = useState(localStorage.getItem('lcns_current_session') || '2025/2026');
  const [semester, setSemester] = useState<'First' | 'Second'>('First');
  const [level, setLevel] = useState(currentUser.level || 'ND 1');
  const [myRegistrations, setMyRegistrations] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const [maxUnits, setMaxUnits] = useState(24); // Set by Admin

  const schoolFullName = "COLLEGE OF NURSING SCIENCES, CATHOLIC DIOCESE OF GBOKO";
  const schoolLogo = "/lcns-logo.png.jpg"; // Your logo

  useEffect(()=>{
    const allCourses = JSON.parse(localStorage.getItem('lcns_courses') || '[]');
    setCourses(allCourses);
    const regs = JSON.parse(localStorage.getItem('lcns_course_registrations') || '[]');
    setMyRegistrations(regs.filter((r:any)=> r.student_email === currentUser.email));
    const limits = JSON.parse(localStorage.getItem('lcns_credit_limits') || '{}');
    if(limits[level]) setMaxUnits(limits[level]);
  }, []);

  const filteredCourses = courses.filter((c:any)=> 
    (c.level === level || c.level?.replace(' ','') === level.replace(' ','') || !c.level) && 
    (c.semester === semester || !c.semester)
  );

  const toggleCourse = (course:any) => {
    const exists = selectedCourses.find((sc:any)=> sc.code === course.code || sc.id === course.id);
    if(exists){
      setSelectedCourses(selectedCourses.filter((sc:any)=> (sc.code||sc.id) !== (course.code||course.id)));
    } else {
      setSelectedCourses([...selectedCourses, course]);
    }
  };

  const totalUnits = selectedCourses.reduce((sum:any, c:any)=> sum + (parseInt(c.units)||0), 0);
  const isExceed = totalUnits > maxUnits;

  const handleSubmitRegistration = async () => {
    if(selectedCourses.length===0){ setStatus('Select at least 1 course'); return; }
    const newReg = {
      id: 'reg-'+Date.now(),
      student_email: currentUser.email,
      student_name: currentUser.fullName,
      matric_number: currentUser.matricNumber || currentUser.id,
      level,
      session,
      semester,
      courses: selectedCourses,
      total_units: totalUnits,
      max_allowed: maxUnits,
      status: isExceed ? 'PENDING_EXCEED' : 'PENDING',
      exceed_units: isExceed,
      created_at: new Date().toISOString(),
      approved_by: null,
      approved_at: null
    };
    const allRegs = JSON.parse(localStorage.getItem('lcns_course_registrations') || '[]');
    const updated = [...allRegs.filter((r:any)=> !(r.student_email===currentUser.email && r.session===session && r.semester===semester)), newReg];
    localStorage.setItem('lcns_course_registrations', JSON.stringify(updated));
    setMyRegistrations(updated.filter((r:any)=> r.student_email === currentUser.email));
    
    const sb = getSupabase();
    if(sb){ try{ await sb.from('course_registrations').insert([newReg]); }catch(e){ console.log(e); } }
    
    setStatus(isExceed ? `⚠️ SUBMITTED BUT EXCEEDS LIMIT! ${totalUnits} > ${maxUnits} - Exam Officer/HOD MUST DISAPPROVE!` : `✅ SUBMITTED! ${selectedCourses.length} courses - ${totalUnits} units - Waiting Exam Officer/HOD Approval`);
    setSelectedCourses([]);
  };

  const printApprovedForm = (reg:any) => {
    if(reg.status !== 'APPROVED'){ alert('Only APPROVED forms can be printed!'); return; }
    const doc = new jsPDF('p','mm','a4');
    // LOGO + SCHOOL NAME
    doc.setFontSize(16); doc.setFont('helvetica','bold');
    doc.text(schoolFullName, 105, 15, {align:'center'});
    doc.setFontSize(12); doc.text('COURSE REGISTRATION FORM - APPROVED', 105, 22, {align:'center'});
    doc.setFontSize(10); doc.setFont('helvetica','normal');
    doc.text(`Student: ${reg.student_name} (${reg.matric_number})`, 15, 32);
    doc.text(`Level: ${reg.level} | Session: ${reg.session} | Semester: ${reg.semester}`, 15, 38);
    doc.text(`Total Units: ${reg.total_units} / Max Allowed: ${reg.max_allowed} | Status: ${reg.status}`, 15, 44);
    doc.text(`Approved By: ${reg.approved_by || 'Exam Officer/HOD'} on ${reg.approved_at ? new Date(reg.approved_at).toLocaleDateString() : ''}`, 15, 50);
    
    let y=60; doc.setFont('helvetica','bold'); doc.setFontSize(9);
    doc.text('S/N',10,y); doc.text('Course Code',20,y); doc.text('Course Title',50,y); doc.text('Units',150,y); doc.text('Level/Sem',170,y);
    doc.setFont('helvetica','normal'); y+=7;
    reg.courses.forEach((c:any,i:number)=>{
      if(y>270){ doc.addPage(); y=20; }
      doc.text(`${i+1}`,10,y); doc.text(`${c.code}`,20,y); doc.text(`${(c.title||c.name||'').substring(0,50)}`,50,y); doc.text(`${c.units}`,152,y); doc.text(`${c.level||reg.level} / ${c.semester||reg.semester}`,170,y); y+=6;
    });
    y+=10; doc.setFont('helvetica','bold');
    doc.text('_________________________',15,y); doc.text('_________________________',80,y); doc.text('_________________________',150,y);
    y+=5; doc.setFontSize(8); doc.text('Student Signature & Date',15,y); doc.text('Exam Officer Signature',80,y); doc.text('HOD Signature & Date',150,y);
    y+=8; doc.setFontSize(7); doc.setFont('helvetica','italic');
    doc.text(`Official Document - ${schoolFullName} - Academic Session ${reg.session}`,15,y);
    doc.save(`CourseRegistration_${reg.matric_number}_${reg.level}_${reg.session}_${reg.semester}_APPROVED.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-900 to-emerald-900 text-white rounded-3xl p-6">
        <h1 className="text-xl font-black uppercase">{schoolFullName}</h1>
        <p className="text-xs text-blue-200">Course Registration - Semester - Student Portal - {currentUser.fullName} - {currentUser.email}</p>
        <p className="text-[11px] mt-2 bg-white/20 p-2 rounded-xl">Select courses for semester - Total units must NOT exceed {maxUnits} - If exceed, Exam Officer/HOD will DISAPPROVE</p>
        {status && <div className="mt-3 p-3 bg-white text-slate-900 rounded-xl text-xs font-bold">{status}</div>}
      </div>

      <div className="bg-white border-2 rounded-2xl p-4 grid md:grid-cols-4 gap-3">
        <div><label className="text-[10px] font-black">Level</label><select value={level} onChange={e=>setLevel(e.target.value)} className="w-full p-2.5 border-2 rounded-xl text-xs font-bold"><option value="ND 1">ND 1</option><option value="ND 2">ND 2</option><option value="HND 1">HND 1</option><option value="HND 2">HND 2</option></select></div>
        <div><label className="text-[10px] font-black">Session</label><select value={session} onChange={e=>setSession(e.target.value)} className="w-full p-2.5 border-2 rounded-xl text-xs font-bold"><option value="2025/2026">2025/2026</option><option value="2026/2027">2026/2027</option><option value="2024/2025">2024/2025</option></select></div>
        <div><label className="text-[10px] font-black">Semester</label><select value={semester} onChange={e=>setSemester(e.target.value as any)} className="w-full p-2.5 border-2 rounded-xl text-xs font-bold"><option value="First">First Semester</option><option value="Second">Second Semester</option></select></div>
        <div className="flex flex-col justify-end"><div className={`p-2.5 rounded-xl text-center font-black text-xs ${isExceed?'bg-red-600 text-white':'bg-emerald-100 text-emerald-800'}`}>{totalUnits} / {maxUnits} Units {isExceed?'⚠️ EXCEED!':'✅ OK'}</div></div>
      </div>

      <div className="bg-white rounded-3xl border-2 p-4 space-y-3">
        <h3 className="font-black text-sm flex justify-between">Available Courses - {level} - {semester} Semester - {filteredCourses.length} courses <button onClick={handleSubmitRegistration} disabled={selectedCourses.length===0} className="px-5 py-2 bg-slate-900 disabled:bg-slate-300 text-white rounded-xl text-xs font-black">SUBMIT REGISTRATION - {selectedCourses.length} courses - {totalUnits} Units</button></h3>
        {isExceed && <div className="p-3 bg-red-50 border-2 border-red-300 rounded-xl text-xs font-black text-red-800">⚠️ CREDIT UNITS EXCEEDS LIMIT! You selected {totalUnits} units but max allowed for {level} is {maxUnits} - Exam Officer and HOD will DISAPPROVE! Remove some courses!</div>}
        <div className="grid md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
          {filteredCourses.map((c:any)=> {
            const selected = selectedCourses.find((sc:any)=> (sc.code||sc.id) === (c.code||c.id));
            return (
              <div key={c.id||c.code} className={`border-2 rounded-xl p-3 flex justify-between items-center ${selected?'bg-emerald-50 border-emerald-400':'bg-white'}`}>
                <div><p className="font-mono font-black text-xs">{c.code} - {c.title||c.name}</p><p className="text-[11px]">Units: {c.units} | Level: {c.level} | Sem: {c.semester}</p></div>
                <button onClick={()=>toggleCourse(c)} className={`px-3 py-1.5 rounded-xl text-[11px] font-black ${selected?'bg-red-600 text-white':'bg-slate-900 text-white'}`}>{selected?'REMOVE':'ADD'}</button>
              </div>
            );
          })}
          {filteredCourses.length===0 && <p className="text-xs text-center py-8">No courses for {level} - {semester} - Ask HOD to allocate courses</p>}
        </div>
      </div>

      <div className="bg-white rounded-3xl border-2 p-4 space-y-3">
        <h3 className="font-black text-sm">My Registrations - {myRegistrations.length} - Print Approved Form</h3>
        <div className="grid gap-3">
          {myRegistrations.map((reg:any)=>(
            <div key={reg.id} className="border-2 rounded-xl p-4 flex justify-between items-center bg-slate-50">
              <div className="text-xs space-y-1"><p className="font-black">{reg.level} - {reg.session} - {reg.semester} Semester - {reg.courses.length} courses - {reg.total_units} Units / Max {reg.max_allowed}</p><p>Status: <span className={`px-2 py-0.5 rounded-full font-black text-[10px] ${reg.status==='APPROVED'?'bg-emerald-600 text-white':reg.status==='DISAPPROVED'?'bg-red-600 text-white':'bg-amber-400 text-black'}`}>{reg.status}</span> {reg.exceed_units && <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-[10px]">EXCEEDS {reg.total_units} > {reg.max_allowed}</span>} | By: {reg.approved_by||'Pending'}</p><p className="text-[11px]">{reg.courses.map((c:any)=>c.code).join(', ')}</p></div>
              <div className="flex flex-col gap-2">
                {reg.status==='APPROVED' && <button onClick={()=>printApprovedForm(reg)} className="px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-black">🖨️ PRINT APPROVED FORM - WITH SCHOOL NAME & LOGO</button>}
                {reg.status==='DISAPPROVED' && <p className="text-[11px] font-black text-red-600">DISAPPROVED - Reason: Exceeds credit units - Re-register!</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseRegistration;

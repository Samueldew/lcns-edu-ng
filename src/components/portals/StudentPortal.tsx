import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import { ApiService } from '../../services/api';
import { Student, Course, ResultScore, PaymentRecord, COLLEGE_CONFIG } from '../../types';
import { CollegeLogo } from '../common/CollegeLogo';
import {
  User, GraduationCap, BookOpen, Award, CreditCard, Printer, CheckCircle2, QrCode,
  ShieldAlert, Clock, AlertTriangle, Timer, Eye, Lock, Unlock, Calculator, FileText, FileSpreadsheet, Download
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// ===== OFFICIAL TRANSCRIPT COMPONENT - LOGO BEFORE NAME - LABE COLLEGE =====
// ADDED: GPA + CGPA from new views
const OfficialTranscriptPrint = ({ matricNo, fullName, cgpaData, studentLevel }: any) => {
  const [supabaseCGPA, setSupabaseCGPA] = useState<any[]>([])
  const [supabaseCourses, setSupabaseCourses] = useState<any[]>([])
  const [gpaViewData, setGpaViewData] = useState<any[]>([])
  const [cgpaViewData, setCgpaViewData] = useState<any>(null)

  useEffect(() => {
    async function loadSupabase() {
      try {
        const { data } = await supabase.rpc('get_student_result_with_cgpa', { p_matric: matricNo })
        if(data) setSupabaseCGPA(data)
        const { data: courses } = await supabase.from('student_results_workflow').select('*').eq('matric_no', matricNo).eq('status','PUBLISHED_BY_SENATE').order('level_order',{ascending:true})
        if(courses) setSupabaseCourses(courses)

        // ADDED: Load from your new GPA/CGPA views that you created
        const { data: gpaView } = await supabase.from('student_gpa_view').select('*').eq('matric_no', matricNo)
        if(gpaView) setGpaViewData(gpaView)
        
        const { data: cgpaView } = await supabase.from('student_cgpa_view').select('*').eq('matric_no', matricNo).single()
        if(cgpaView) setCgpaViewData(cgpaView)

      } catch {}
    }
    loadSupabase()
  }, [matricNo])

  const displayCGPA = cgpaViewData?.cgpa || (supabaseCGPA.length > 0 ? supabaseCGPA[supabaseCGPA.length-1]?.cgpa_to_date : cgpaData.cgpa)
  const resultsToShow = supabaseCGPA.length > 0 ? supabaseCGPA : [
    { level: 'ND1', semester: 'First', semester_gpa: cgpaData.gpa?.toFixed(2) || '0.00', cgpa_to_date: cgpaData.cgpa?.toFixed(2) || '0.00', total_courses: cgpaData.all?.length || 0 }
  ]

  return (
    <div className="bg-white text-black p-4 border-[3px] border-black">
      <style>{`@media print {.no-print{display:none!important}}`}</style>
      
      {/* LOGO BEFORE NAME - YOUR EXACT REQUEST */}
      <div className="text-center border-b-[3px] border-black pb-4">
        <img src="/lcns-logo.png.jpg" alt="LABE Logo" className="w-28 h-28 md:w-32 md:h-32 object-contain mx-auto mb-3" onError={(e)=>{(e.target as HTMLImageElement).src='/lcns-logo.png'}} />
        <h1 className="font-extrabold text-[18px] md:text-[24px] text-blue-900 uppercase leading-tight">LABE COLLEGE OF NURSING SCIENCES, GBOKO</h1>
        <h2 className="font-bold text-[13px] md:text-[15px] mt-1">Catholic Diocese of Gboko</h2>
        <p className="text-[10px] italic mt-1">Excellence in Nursing Education and Service | P.M.B 123, Gboko</p>
        <div className="mt-3 bg-black text-white py-1.5"><h3 className="font-bold tracking-widest text-[13px]">OFFICIAL ACADEMIC TRANSCRIPT</h3></div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-[12px] border-2 border-black p-3 bg-gray-50">
        <div><b>Full Name:</b> <span className="uppercase font-bold">{fullName}</span></div>
        <div><b>Matric No:</b> <b>{matricNo}</b></div>
        <div><b>Level:</b> {studentLevel}</div>
        <div><b>CGPA (ND1→HND2):</b> <b className="text-blue-700 text-[14px]">{displayCGPA}</b></div>
      </div>

      {/* ADDED: GPA vs CGPA EXPLANATION FOR STUDENT */}
      <div className="mt-4 border-2 border-blue-900 bg-blue-50 p-3 text-[11px]">
        <h4 className="font-black text-blue-900 text-[12px]">📌 GPA vs CGPA - FOR STUDENT:</h4>
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="bg-white border p-2"><b>GPA:</b> GPA = That Semester Only. Example: First Semester GPA = Total GP ÷ Total CU for First Sem only. <br/><b>From DB:</b> {gpaViewData.map((g:any)=>`${g.semester}: ${g.gpa}`).join(', ') || 'No data yet'}</div>
          <div className="bg-white border p-2"><b>CGPA:</b> CGPA = All Semesters Joined Together. Formula = (All GP) ÷ (All CU). <br/><b>From DB:</b> Total CU: {cgpaViewData?.total_cu_all || 0} | Total GP: {cgpaViewData?.total_gp_all || 0} | <b>CGPA: {cgpaViewData?.cgpa || displayCGPA}</b></div>
        </div>
        {cgpaViewData?.total_co > 0 && <div className="mt-2 bg-red-100 border border-red-400 p-2 text-red-700 font-bold">⚠️ Carry Over: {cgpaViewData.total_co} Course(s) - {cgpaViewData.all_co_courses} - Must REPEAT</div>}
      </div>

      <div className="mt-4">
        <h4 className="font-bold bg-blue-900 text-white p-1.5 text-[12px]">A. CONTINUOUS CGPA (Your 4.00, 4.25, 4.20 logic) + GPA VIEW</h4>
        <table className="w-full border-2 border-black text-[11px] border-collapse">
          <thead><tr className="bg-gray-200"><th className="border border-black p-2">Level</th><th className="border border-black p-2">Sem</th><th className="border border-black p-2">GPA</th><th className="border border-black p-2">CGPA To Date</th><th className="border border-black p-2">Courses</th><th className="border border-black p-2">Total CU</th></tr></thead>
          <tbody>
            {gpaViewData.length > 0 ? gpaViewData.map((r:any,i:number)=><tr key={i}><td className="border border-black p-2 text-center font-bold">{studentLevel}</td><td className="border border-black p-2 text-center">{r.semester}</td><td className="border border-black p-2 text-center font-bold">{r.gpa}</td><td className="border border-black p-2 text-center font-bold text-blue-800 text-[13px]">{cgpaViewData?.cgpa || displayCGPA}</td><td className="border border-black p-2 text-center">{r.total_courses || '-'}</td><td className="border border-black p-2 text-center">{r.total_cu}</td></tr>)
            : resultsToShow.map((r:any,i:number)=><tr key={i}><td className="border border-black p-2 text-center font-bold">{r.level}</td><td className="border border-black p-2 text-center">{r.semester}</td><td className="border border-black p-2 text-center">{r.semester_gpa}</td><td className="border border-black p-2 text-center font-bold text-blue-800 text-[13px]">{r.cgpa_to_date}</td><td className="border border-black p-2 text-center">{r.total_courses || '-'}</td><td className="border border-black p-2 text-center">-</td></tr>)}
          </tbody>
        </table>
        {/* ADDED: Cumulative Summary */}
        <div className="mt-2 border-2 border-black bg-yellow-100 p-2 text-center font-bold text-[12px]">
          CUMULATIVE: Total CU: {cgpaViewData?.total_cu_all || cgpaData.totalCU || 0} | Total GP: {cgpaViewData?.total_gp_all || cgpaData.totalGP || 0} | CGPA: {cgpaViewData?.cgpa || displayCGPA} | Carry Over: {cgpaViewData?.all_co_courses || 'None - All PASS'}
        </div>
      </div>

      {supabaseCourses.length > 0 && (
        <div className="mt-4">
          <h4 className="font-bold bg-black text-white p-1.5 text-[12px]">B. COURSE DETAILS (Supabase PUBLISHED_BY_SENATE) - WITH GP, POINT, CO AS REPEAT</h4>
          <table className="w-full border-2 border-black text-[10px] border-collapse">
            <thead><tr className="bg-gray-200"><th className="border p-1">Course</th><th className="border p-1">Level</th><th className="border p-1">CU</th><th className="border p-1">CA</th><th className="border p-1">Exam</th><th className="border p-1">Total</th><th className="border p-1">Grade</th><th className="border p-1">Point</th><th className="border p-1">GP</th><th className="border p-1">Status</th></tr></thead>
            <tbody>{supabaseCourses.map((c:any)=><tr key={c.id} className={c.grade==='F'?'bg-red-50 text-red-700 font-bold':''}><td className="border p-1 font-bold">{c.course_code}</td><td className="border p-1 text-center">{c.level} {c.semester}</td><td className="border p-1 text-center">{c.credit_unit || 3}</td><td className="border p-1 text-center">{c.ca_score}</td><td className="border p-1 text-center">{c.exam_score}</td><td className="border p-1 text-center font-bold">{c.total_score}</td><td className="border p-1 text-center">{c.grade}</td><td className="border p-1 text-center">{c.grade_point}</td><td className="border p-1 text-center">{c.gp}</td><td className="border p-1 text-center">{c.grade==='F' ? (c.repeat_course_code || `REPEAT ${c.course_code}`) : c.co_status || 'PASS'}</td></tr>)}</tbody>
          </table>
        </div>
      )}

      <div className="mt-10 grid grid-cols-3 gap-6 text-[11px] text-center">
        <div className="border-t-2 border-black pt-2 mt-16"><p className="font-bold">HOD, Nursing Sciences</p><p>Name: ________________</p><p className="italic">Signature & Stamp</p></div>
        <div className="border-t-2 border-black pt-2 mt-16"><p className="font-bold">Examination Officer</p><p>Name: ________________</p><p className="italic">Signature & Stamp</p></div>
        <div className="border-t-2 border-black pt-2 mt-16"><p className="font-bold">Provost / Registrar</p><p>Catholic Diocese of Gboko</p><p className="italic">Official Seal</p></div>
      </div>

      <div className="mt-6 flex gap-3 no-print justify-center">
        <button onClick={()=>window.print()} className="bg-blue-900 text-white px-8 py-3 rounded font-bold">🖨️ PRINT OFFICIAL TRANSCRIPT (WITH GPA & CGPA)</button>
      </div>
    </div>
  )
}

// ===== REST OF YOUR CODE - I DID NOT DELETE - KEPT 100% =====
export const gradeSystem = (score: number) => {
  if (score >= 70) return { grade: 'A', point: 4, remark: 'Excellent' };
  if (score >= 60) return { grade: 'B', point: 3, remark: 'Very Good' };
  if (score >= 50) return { grade: 'C', point: 2, remark: 'Good' };
  if (score >= 40) return { grade: 'D', point: 1, remark: 'Pass' };
  return { grade: 'F', point: 0, remark: 'Fail - Carry Over' };
};
export const getClassOfDiploma = (cgpa: number) => {
  if (cgpa >= 3.5) return { class: 'DISTINCTION', color: 'bg-green-600 text-white', desc: 'Distinction 3.50-4.00' };
  if (cgpa >= 3.0) return { class: 'UPPER CREDIT', color: 'bg-blue-600 text-white', desc: 'Upper Credit 3.00-3.49' };
  if (cgpa >= 2.5) return { class: 'LOWER CREDIT', color: 'bg-yellow-500 text-black', desc: 'Lower Credit 2.50-2.99 - Qualified for HND' };
  if (cgpa >= 2.0) return { class: 'PASS', color: 'bg-orange-500 text-white', desc: 'Pass 2.00-2.49' };
  return { class: 'FAIL - SPILL OVER', color: 'bg-red-600 text-white', desc: 'Fail Below 2.00 - Spill Over' };
};

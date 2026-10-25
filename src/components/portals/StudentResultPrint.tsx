import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function StudentResultPrint() {
  const matric_no = 'LCNS/STU/001'
  const [results, setResults] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [student, setStudent] = useState<any>(null)

  useEffect(() => {
    async function load() {
      const { data: cgpaData } = await supabase.rpc('get_student_result_with_cgpa', { p_matric: matric_no })
      setResults(cgpaData || [])
      const { data: fullData } = await supabase.from('student_results_workflow').select('*').eq('matric_no', matric_no).eq('status','PUBLISHED_BY_SENATE').order('level_order',{ascending:true})
      setCourses(fullData || [])
      const { data: stud } = await supabase.from('students').select('*').eq('matric_no', matric_no).single()
      if(stud) setStudent(stud)
    }
    load()
  }, [])

  const currentCGPA = results[results.length-1]?.cgpa_to_date || 0
  const fullName = student?.full_name || 'LCNS TEST STUDENT'

  return (
    <div className="bg-white min-h-screen text-black p-4">
      <div className="max-w-5xl mx-auto border-[3px] border-black p-6 bg-white">
        
        <div className="text-center border-b-[3px] border-black pb-4">
          <img src="/lcns-logo.png.jpg" alt="Logo" className="w-32 h-32 object-contain mx-auto mb-3" />
          <h1 className="font-extrabold text-[20px] md:text-[26px] text-blue-900 uppercase leading-tight">LABE COLLEGE OF NURSING SCIENCES, GBOKO</h1>
          <h2 className="font-bold text-[14px] mt-1">Catholic Diocese of Gboko</h2>
          <div className="mt-3 bg-black text-white py-1"><h3 className="font-bold tracking-widest text-[13px]">OFFICIAL ACADEMIC TRANSCRIPT</h3></div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-[12px] border-2 border-black p-3">
          <div><b>Full Name:</b> <span className="uppercase font-bold">{fullName}</span></div>
          <div><b>Matric:</b> {matric_no}</div>
          <div><b>Dept:</b> Nursing Sciences</div>
          <div><b>CGPA:</b> <b className="text-blue-700">{currentCGPA}</b></div>
        </div>

        <div className="mt-4">
          <table className="w-full border-2 border-black text-[11px] border-collapse">
            <thead><tr className="bg-gray-200"><th className="border border-black p-2">Level</th><th className="border border-black p-2">Sem</th><th className="border border-black p-2">GPA</th><th className="border border-black p-2">CGPA</th></tr></thead>
            <tbody>{results.map((r,i)=><tr key={i}><td className="border border-black p-2 text-center font-bold">{r.level}</td><td className="border border-black p-2 text-center">{r.semester}</td><td className="border border-black p-2 text-center">{r.semester_gpa}</td><td className="border border-black p-2 text-center font-bold text-blue-800 text-[13px]">{r.cgpa_to_date}</td></tr>)}</tbody>
          </table>
        </div>

        <div className="mt-4">
          <table className="w-full border-2 border-black text-[10px] border-collapse">
            <thead><tr className="bg-gray-200"><th className="border p-1">Course</th><th className="border p-1">CA</th><th className="border p-1">Exam</th><th className="border p-1">Total</th><th className="border p-1">Grade</th></tr></thead>
            <tbody>{courses.map((c:any)=><tr key={c.id}><td className="border p-1 font-bold">{c.course_code}</td><td className="border p-1 text-center">{c.ca_score}</td><td className="border p-1 text-center">{c.exam_score}</td><td className="border p-1 text-center font-bold">{c.total_score}</td><td className="border p-1 text-center">{c.grade}</td></tr>)}</tbody>
          </table>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-6 text-[11px] text-center">
          <div className="border-t-2 border-black pt-2 mt-16"><p className="font-bold">HOD</p><p>Name: ___________</p><p>Signature</p></div>
          <div className="border-t-2 border-black pt-2 mt-16"><p className="font-bold">Exam Officer</p><p>Name: ___________</p><p>Signature</p></div>
          <div className="border-t-2 border-black pt-2 mt-16"><p className="font-bold">Provost</p><p>Catholic Diocese of Gboko</p><p>Seal</p></div>
        </div>

        <div className="mt-6 text-center"><button onClick={()=>window.print()} className="bg-blue-900 text-white px-8 py-3 rounded font-bold">🖨️ PRINT</button></div>
      </div>
    </div>
  )
}

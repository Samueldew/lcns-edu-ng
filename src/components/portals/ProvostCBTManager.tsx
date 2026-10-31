import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export function ProvostCBTManager() {
  const [title, setTitle] = useState("2026/2027 Nursing Aptitude Test");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState(30);
  const [questions, setQuestions] = useState<any[]>([
    { question: "What is the normal adult heart rate?", options: ["60-100 bpm", "100-120 bpm", "40-60 bpm", "120-140 bpm"], answer: 0 },
    { question: "Which organ filters blood?", options: ["Heart", "Kidney", "Lung", "Liver"], answer: 1 },
  ]);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadExams = async () => {
    const { data } = await supabase.from("cbt_exams").select("*").order("created_at", { ascending: false });
    setExams(data || []);
  };
  useEffect(()=>{ loadExams(); }, []);

  const addQuestion = () => setQuestions([...questions, { question: "", options: ["","","",""], answer: 0 }]);

  const saveExam = async () => {
    if(questions.some(q=>!q.question)) { alert("Fill all questions"); return; }
    setLoading(true);
    const id = Date.now().toString();
    const { error } = await supabase.from("cbt_exams").insert([{
      id, title, exam_date: date, duration_minutes: duration, questions, status: "ACTIVE", assigned_to: "ALL_CLEARED"
    }]);
    if(error) alert(error.message); else {
      // Assign to all bursar cleared applicants
      await supabase.from("college_applications").update({ aptitude_status: "SCHEDULED", exam_date: date }).eq("bursar_status", "BURSAR_CLEARED");
      await supabase.from("college_applications").update({ aptitude_status: "SCHEDULED", exam_date: date }).eq("bursar_status", "CLEARED");
      await supabase.from("lcns_applicants").update({ aptitude_status: "SCHEDULED", exam_date: date }).eq("bursar_status", "BURSAR_CLEARED");
      alert(`✅ CBT Exam Set! Assigned to ALL Bursar Cleared Applicants\nDate: ${date}\nDuration: ${duration} mins\nQuestions: ${questions.length}`);
      loadExams();
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 bg-white rounded-2xl shadow border space-y-4">
      <div className="bg-gradient-to-r from-purple-900 to-slate-900 text-white p-5 rounded-2xl">
        <h1 className="text-xl font-black uppercase">Provost / Registrar - Set CBT Exam for Applicants</h1>
        <p className="text-xs text-purple-200">Set aptitude test - Bursar cleared applicants will see it in their dashboard - They write CBT - Score auto - If pass, invite for interview</p>
      </div>

      <div className="grid md:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border-2">
        <div><label className="text-[11px] font-black">Exam Title</label><input value={title} onChange={e=>setTitle(e.target.value)} className="w-full border-2 px-3 py-2 rounded-xl font-bold" /></div>
        <div><label className="text-[11px] font-black">Exam Date</label><input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full border-2 px-3 py-2 rounded-xl font-bold" /></div>
        <div><label className="text-[11px] font-black">Duration (Minutes)</label><input type="number" value={duration} onChange={e=>setDuration(parseInt(e.target.value))} className="w-full border-2 border-amber-400 px-3 py-2 rounded-xl font-black text-lg" /></div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between"><h3 className="font-black">Questions ({questions.length})</h3><button onClick={addQuestion} className="px-4 py-2 bg-purple-700 text-white rounded-xl font-black text-xs">+ Add Question</button></div>
        {questions.map((q, qi)=>(
          <div key={qi} className="bg-white border-2 p-4 rounded-xl space-y-2">
            <div className="flex gap-2"><span className="font-black">{qi+1}.</span><input placeholder="Question" value={q.question} onChange={e=>{ const n=[...questions]; n[qi].question=e.target.value; setQuestions(n); }} className="flex-1 border px-3 py-2 rounded-lg font-bold" /></div>
            <div className="grid grid-cols-2 gap-2">
              {q.options.map((opt:string, oi:number)=>(
                <div key={oi} className="flex gap-1 items-center"><input type="radio" name={`ans-${qi}`} checked={q.answer===oi} onChange={()=>{ const n=[...questions]; n[qi].answer=oi; setQuestions(n); }} /><input value={opt} onChange={e=>{ const n=[...questions]; n[qi].options[oi]=e.target.value; setQuestions(n); }} placeholder={`Option ${String.fromCharCode(65+oi)}`} className={`flex-1 border px-2 py-1 rounded text-xs ${q.answer===oi?'border-green-600 bg-green-50 font-bold':''}`} /></div>
              ))}
            </div>
            <button onClick={()=>setQuestions(questions.filter((_,i)=>i!==qi))} className="text-[10px] text-red-600 font-bold">Remove Question</button>
          </div>
        ))}
      </div>

      <button onClick={saveExam} disabled={loading} className="w-full py-4 bg-gradient-to-r from-purple-900 to-emerald-700 text-white rounded-2xl font-black text-lg">{loading?"Saving...":"✅ SAVE & ASSIGN TO ALL BURSAR CLEARED APPLICANTS"}</button>

      <div className="bg-slate-50 border-2 p-4 rounded-xl">
        <h3 className="font-black text-sm">Previous Exams</h3>
        {exams.map(ex=>(
          <div key={ex.id} className="bg-white border p-3 rounded-xl mt-2 flex justify-between text-xs"><div><b>{ex.title}</b> - {ex.exam_date} - {ex.duration_minutes} mins - {ex.questions?.length} Qs - {ex.status}</div><button onClick={async()=>{ await supabase.from("college_applications").update({ aptitude_status: "SCHEDULED", exam_date: ex.exam_date }).eq("bursar_status", "BURSAR_CLEARED"); alert("Re-assigned to cleared applicants"); }} className="px-3 py-1 bg-emerald-700 text-white rounded-lg font-black">Re-Assign</button></div>
        ))}
      </div>
    </div>
  );
}
export default ProvostCBTManager;

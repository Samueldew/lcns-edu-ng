import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

const BATCH_SIZE = 35;
const START_HOUR = 9; // 9am start

export function ProvostCBTManager() {
  const [title, setTitle] = useState("2026/2027 Nursing Aptitude Test");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState(60);
  const [questions, setQuestions] = useState<any[]>([
    { question: "Normal adult heart rate?", options: ["60-100 bpm","100-120 bpm","40-60 bpm","120-140 bpm"], answer: 0 }
  ]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAll = async () => {
    const { data: apps } = await supabase.from("college_applications").select("*").order("created_at",{ascending:true}).limit(500);
    const { data: res } = await supabase.from("cbt_results").select("*").order("created_at",{ascending:false});
    setApplicants(apps||[]); setResults(res||[]);
  };
  useEffect(()=>{ loadAll(); }, []);

  const assignBatches = (apps: any[], examDate: string) => {
    const sorted = [...apps].sort((a,b)=> new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    return sorted.map((app, idx) => {
      const batchNo = Math.floor(idx / BATCH_SIZE);
      const batchLetter = String.fromCharCode(65 + batchNo); // A,B,C
      const startHour = START_HOUR + batchNo; // 9,10,11
      const endHour = startHour + 1;
      const timeSlot = `${String(startHour).padStart(2,'0')}:00 - ${String(endHour).padStart(2,'0')}:00`;
      const batchName = `Batch ${batchLetter} (${timeSlot})`;
      return { ...app, exam_batch: batchName, exam_batch_no: batchNo, exam_time_slot: timeSlot, exam_start_hour: startHour, exam_date: examDate };
    });
  };

  const publishAndBatch = async () => {
    setLoading(true);
    const id = Date.now().toString();
    await supabase.from("cbt_exams").insert([{ id, title, exam_date: date, duration_minutes: duration, questions, status: "ACTIVE" }]);
    
    const { data: cleared } = await supabase.from("college_applications").select("*").in("bursar_status", ["CLEARED","BURSAR_CLEARED","APPLICATION_CLEARED"]).order("created_at",{ascending:true});
    if(!cleared || cleared.length===0){ alert("No bursar cleared applicants yet. Exam saved, but no batches assigned. Clear applicants first."); setLoading(false); return; }

    const batched = assignBatches(cleared, date);
    for(const b of batched){
      await supabase.from("college_applications").update({ 
        aptitude_status: "SCHEDULED", exam_date: date, exam_batch: b.exam_batch, exam_batch_no: b.exam_batch_no, exam_time_slot: b.exam_time_slot, exam_start_hour: b.exam_start_hour
      }).eq("id", b.id);
    }
    alert(`✅ Published!\n${cleared.length} applicants -> ${Math.ceil(cleared.length/BATCH_SIZE)} batches of ${BATCH_SIZE}\nBatch A 9-10am, B 10-11am, C 11-12pm...\nApplicant will see batch in dashboard. If miss, can join next batch.`);
    setLoading(false); loadAll();
  };

  const exportExcel = () => {
    let csv = "S/N,Form No,Name,Phone,Batch,Time Slot,Date,Score,Percentage,Status\n";
    applicants.filter(a=>a.exam_batch).forEach((a:any,i:number)=>{
      const r = results.find((x:any)=>x.application_number===a.form_no);
      csv += `${i+1},${a.form_no},"${a.full_name}",${a.phone},${a.exam_batch},${a.exam_time_slot},${a.exam_date},${r?.score||0},${r?.percentage||0}%,${r?.status||a.aptitude_status}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download=`LCNS_BATCHED_${date}.csv`; a.click();
  };

  return (
    <div className="space-y-4">
      <div className="bg-amber-100 border-2 border-amber-500 p-3 rounded-xl text-xs font-bold">
        Free Supabase Protection: {BATCH_SIZE} per hour. 9-10am Batch A, 10-11am Batch B, 11-12pm Batch C... till finish. If applicant misses batch (network/light), can join NEXT batch (later), not earlier batch.
      </div>

      <div className="bg-white p-5 rounded-2xl border-2 space-y-3">
        <div className="grid md:grid-cols-3 gap-3">
          <div><label className="text-[11px] font-black">Exam Title</label><input value={title} onChange={e=>setTitle(e.target.value)} className="w-full border-2 px-3 py-2 rounded-xl font-bold"/></div>
          <div><label className="text-[11px] font-black">Exam Date (1 Day)</label><input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full border-2 px-3 py-2 rounded-xl font-bold"/></div>
          <div><label className="text-[11px] font-black">Duration (60 = 1 hour per batch)</label><input type="number" value={duration} onChange={e=>setDuration(parseInt(e.target.value))} className="w-full border-2 border-amber-400 px-3 py-2 rounded-xl font-black"/></div>
        </div>

        <div className="flex gap-2">
          <button onClick={publishAndBatch} disabled={loading} className="flex-1 py-4 bg-purple-900 text-white rounded-2xl font-black text-lg">{loading?"Publishing & Batching...":"✅ PUBLISH & AUTO BATCH 35 PER HOUR"}</button>
          <button onClick={exportExcel} className="px-6 py-4 bg-emerald-700 text-white rounded-2xl font-black text-xs">📥 EXCEL</button>
        </div>

        <div className="text-xs bg-slate-50 p-3 rounded-xl">Cleared: {applicants.filter(a=>a.bursar_status?.includes("CLEARED")).length} | Batches needed: {Math.ceil(applicants.filter(a=>a.bursar_status?.includes("CLEARED")).length / BATCH_SIZE)} | Batched already: {applicants.filter(a=>a.exam_batch).length}</div>
      </div>

      <div className="bg-white p-4 rounded-2xl border-2 overflow-x-auto">
        <h3 className="font-black mb-2">All Batched Applicants - Who writes when</h3>
        <table className="w-full text-xs"><thead className="bg-slate-900 text-white"><tr><th className="p-2">S/N</th><th className="p-2">Form No</th><th className="p-2">Name</th><th className="p-2">Batch</th><th className="p-2">Time</th><th className="p-2">Score</th></tr></thead><tbody>{applicants.filter(a=>a.exam_batch).map((a:any,i:number)=>{ const r=results.find((x:any)=>x.application_number===a.form_no); return <tr key={a.id} className="border-b"><td className="p-2">{i+1}</td><td className="p-2 font-mono">{a.form_no}</td><td className="p-2">{a.full_name}</td><td className="p-2 font-black">{a.exam_batch}</td><td className="p-2">{a.exam_time_slot}</td><td className="p-2">{r?.percentage?`${r.percentage}%`:a.exam_score?`${a.exam_score}%`:'Not written'}</td></tr> })}</tbody></table>
        {applicants.filter(a=>a.exam_batch).length===0 && <p className="text-center p-6 text-slate-400">No batches yet. Click Publish button above.</p>}
      </div>
    </div>
  );
}

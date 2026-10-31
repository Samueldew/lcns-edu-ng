import { useState } from "react";
import { getSupabase } from "../../lib/supabase";

export function AdmissionCheckerModal({ open, onClose }: any) {
  const [formNo, setFormNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const check = async () => {
    if (!formNo.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    const sb = getSupabase();
    const clean = formNo.trim().toUpperCase();

    try {
      // Try both tables - college_applications is your main table
      let found: any = null;

      // 1. Check college_applications (form_no)
      let { data: c1 } = await sb!.from("college_applications").select("*").eq("form_no", clean).limit(1).maybeSingle();
      if (!c1) {
        const { data: c2 } = await sb!.from("college_applications").select("*").ilike("form_no", `%${clean}%`).limit(1);
        if (c2 && c2.length > 0) c1 = c2[0];
      }
      if (c1) found = c1;

      // 2. If not found, check lcns_applicants (application_number)
      if (!found) {
        let { data: l1 } = await sb!.from("lcns_applicants").select("*").eq("application_number", clean).limit(1).maybeSingle();
        if (!l1) {
          const { data: l2 } = await sb!.from("lcns_applicants").select("*").ilike("application_number", `%${clean}%`).limit(1);
          if (l2 && l2.length > 0) l1 = l2[0];
        }
        if (l1) found = l1;
      }

      if (found) {
        // Normalize photo url - this fixes passport not showing
        const photo = 
          found.photo_url || 
          found.passport_url || 
          found.passportPhotoUrl || 
          found.full_application?.passportPhotoUrl || 
          found.full_application?.passport_url || 
          found.application_data?.passportPhotoUrl ||
          found.passport || null;

        // Normalize fields
        const normalized = {
          ...found,
          id: found.id,
          full_name: found.full_name || found.applicant_name || found.name,
          application_number: found.application_number || found.form_no,
          form_no: found.form_no || found.application_number,
          exam_no: found.exam_no || found.exam_number || "-",
          course: found.course || found.program || found.course_applied || "Nursing",
          photo_url: photo,
          bursar_status: found.bursar_status || "PENDING",
          exam_date: found.exam_date || "Not set yet - Provost will set",
          exam_batch: found.exam_batch || "Not batched yet - Wait for Provost to assign 35 per hour",
          exam_time_slot: found.exam_time_slot || "Pending",
          aptitude_status: found.aptitude_status || "PENDING",
          exam_score: found.exam_score || null,
        };
        setResult(normalized);
      } else {
        setError(`No record found for ${clean}. Check Form Number. Example: LCNS/2026/8902`);
      }
    } catch (e: any) {
      setError("Error: " + e.message);
    }
    setLoading(false);
  };

  const printSlip = () => {
    if (!result) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html>
      <head><title>LCNS Admission Slip - ${result.form_no}</title>
      <style>
        body{font-family:Arial;padding:20px;max-width:800px;margin:auto}
        .header{background:#0a3326;color:white;padding:20px;text-align:center;border-radius:12px}
        .card{border:2px solid #0a3326;border-radius:12px;padding:20px;margin-top:20px;display:flex;gap:20px}
        .photo{width:140px;height:170px;object-fit:cover;border:3px solid #facc15;border-radius:10px;background:#eee}
        .info p{margin:4px 0;font-size:14px}
        .badge{display:inline-block;padding:4px 10px;border-radius:20px;font-weight:900;font-size:11px;margin:2px}
        .footer{margin-top:20px;text-align:center;font-size:11px;color:#666}
        @media print { button{display:none} }
      </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin:0">LABE COLLEGE OF NURSING SCIENCES, GBOKO</h1>
          <p style="margin:4px 0">2026/2027 ADMISSION CHECKING SLIP</p>
        </div>
        <div class="card">
          ${result.photo_url ? `<img src="${result.photo_url}" class="photo" onerror="this.src='https://via.placeholder.com/140x170?text=No+Photo'" />` : `<div class="photo" style="display:flex;align-items:center;justify-content:center">No Photo</div>`}
          <div class="info">
            <p><b>Full Name:</b> ${result.full_name}</p>
            <p><b>Form No:</b> ${result.form_no}</p>
            <p><b>Application No:</b> ${result.application_number}</p>
            <p><b>Exam No:</b> ${result.exam_no}</p>
            <p><b>Course:</b> ${result.course}</p>
            <p><b>Bursar Status:</b> <span class="badge" style="background:${result.bursar_status.includes('CLEARED')?'#dcfce7':'#fef9c3'}">${result.bursar_status}</span></p>
            <p><b>Exam Date:</b> ${result.exam_date}</p>
            <p><b>Batch:</b> <span class="badge" style="background:#facc15">${result.exam_batch}</span></p>
            <p><b>Time Slot:</b> <span class="badge" style="background:#e0e7ff">${result.exam_time_slot}</span></p>
            <p><b>CBT Status:</b> ${result.aptitude_status} ${result.exam_score ? `- ${result.exam_score}%` : ''}</p>
            <p style="margin-top:10px;font-size:11px;background:#fffbeb;border:1px solid #facc15;padding:8px;border-radius:8px">If you miss your batch (network/light), you can join NEXT batch (later), not earlier batch. Example: Batch A 9-10am misses, can write 10-11am, 11-12pm etc.</p>
          </div>
        </div>
        <div class="footer">
          <p>Printed on ${new Date().toLocaleString()} | LCNS Gboko | This slip must be presented at exam centre</p>
          <button onclick="window.print()" style="margin-top:10px;padding:10px 20px;background:#0a3326;color:white;border:none;border-radius:8px;font-weight:900;cursor:pointer">🖨️ PRINT NOW</button>
        </div>
      </body>
      </html>
    `);
    w.document.close();
  };

  if (!open) return null;

  return (
    <div style={{position:"fixed",inset:0,zIndex:99999,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"white",borderRadius:16,maxWidth:480,width:"100%",border:"3px solid #facc15",overflow:"hidden",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{background:"#0a3326",color:"white",padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <h3 style={{margin:0,fontWeight:900,fontSize:13}}>CHECK ADMISSION STATUS</h3>
          <button onClick={onClose} style={{background:"none",border:"none",color:"white",fontSize:24,cursor:"pointer"}}>×</button>
        </div>
        <div style={{padding:20}}>
          <label style={{fontSize:11,fontWeight:800,color:"#334155",display:"block",marginBottom:8}}>ENTER APPLICATION / FORM NUMBER</label>
          <input value={formNo} onChange={e=>setFormNo(e.target.value)} placeholder="LCNS/2026/8342" style={{width:"100%",padding:12,borderRadius:10,border:"1.5px solid #cbd5e1",fontWeight:700}} onKeyDown={e=> e.key==='Enter' && check()} />
          <p style={{fontSize:10,color:"#94a3b8",marginTop:4}}>Example: LCNS/2026/8902 - Works for both tables</p>
          
          {error && <div style={{marginTop:12,background:"#fef2f2",border:"1px solid #fca5a5",color:"#b91c1c",padding:10,borderRadius:8,fontSize:11,fontWeight:600}}>{error}</div>}
          
          {result && (
            <div style={{marginTop:14,background:"#f0fdf4",border:"2px solid #16a34a",padding:14,borderRadius:12}}>
              <div style={{display:"flex",gap:12}}>
                {result.photo_url ? (
                  <img src={result.photo_url} style={{width:80,height:100,objectFit:"cover",borderRadius:8,border:"2px solid #16a34a",background:"#eee"}} alt="passport" onError={(e:any)=>e.target.src="https://via.placeholder.com/80x100?text=No+Photo"} />
                ) : (
                  <div style={{width:80,height:100,borderRadius:8,border:"2px dashed #94a3b8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#94a3b8"}}>No Photo</div>
                )}
                <div style={{flex:1}}>
                  <p style={{margin:0,fontWeight:900,fontSize:14}}>{result.full_name}</p>
                  <p style={{margin:"2px 0",fontSize:11}}><b>Form:</b> {result.form_no}</p>
                  <p style={{margin:"2px 0",fontSize:11}}><b>Exam No:</b> {result.exam_no}</p>
                  <p style={{margin:"2px 0",fontSize:11}}><b>Course:</b> {result.course}</p>
                  <p style={{margin:"2px 0",fontSize:10}}><b>Batch:</b> <span style={{background:"#facc15",padding:"2px 6px",borderRadius:10,fontWeight:900}}>{result.exam_batch}</span></p>
                  <p style={{margin:"2px 0",fontSize:10}}><b>Time:</b> {result.exam_time_slot}</p>
                  <p style={{margin:"2px 0",fontSize:10}}><b>Date:</b> {result.exam_date}</p>
                </div>
              </div>
              <button onClick={printSlip} style={{display:"block",width:"100%",textAlign:"center",marginTop:12,padding:12,background:"#052e16",color:"white",fontWeight:900,borderRadius:10,border:"none",cursor:"pointer"}}>🖨️ PRINT SLIP WITH PASSPORT</button>
              <a href={`/applicant/dashboard?app_no=${result.application_number}`} style={{display:"block",textAlign:"center",marginTop:8,padding:10,background:"#facc15",color:"#052e16",fontWeight:900,borderRadius:10,textDecoration:"none",fontSize:12}}>🚀 OPEN DASHBOARD - WRITE CBT</a>
            </div>
          )}
          <button onClick={check} disabled={loading} style={{width:"100%",marginTop:14,padding:12,background:"#0a4d2e",color:"white",fontWeight:900,border:"none",borderRadius:10,cursor:"pointer"}}>{loading?"Checking...":"Check Status"}</button>
        </div>
      </div>
    </div>
  );
}
export default AdmissionCheckerModal;

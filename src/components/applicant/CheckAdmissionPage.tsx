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
    const clean = formNo.trim();
    
    const { data } = await sb!.from("lcns_applicants").select("*").ilike("application_number", `%${clean}%`).limit(1);
    
    if (data && data.length > 0) {
      setResult(data[0]);
    } else {
      setError(`No record found for ${clean}. Please check your Form Number. Example: LCNS/2026/8902`);
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div style={{position:"fixed",inset:0,zIndex:99999,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"white",borderRadius:16,maxWidth:460,width:"100%",border:"3px solid #facc15",overflow:"hidden"}}>
        <div style={{background:"#0a3326",color:"white",padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <h3 style={{margin:0,fontWeight:900,fontSize:13}}>CHECK ADMISSION STATUS</h3>
          <button onClick={onClose} style={{background:"none",border:"none",color:"white",fontSize:24,cursor:"pointer"}}>×</button>
        </div>
        <div style={{padding:20}}>
          <label style={{fontSize:11,fontWeight:800,color:"#334155",display:"block",marginBottom:8}}>ENTER APPLICATION / FORM NUMBER</label>
          <input value={formNo} onChange={e=>setFormNo(e.target.value)} placeholder="LCNS/2026/8342" style={{width:"100%",padding:12,borderRadius:10,border:"1.5px solid #cbd5e1",fontWeight:700}} />
          <p style={{fontSize:10,color:"#94a3b8",marginTop:4}}>Example: LCNS/2026/8902</p>
          {error && <div style={{marginTop:12,background:"#fef2f2",border:"1px solid #fca5a5",color:"#b91c1c",padding:10,borderRadius:8,fontSize:11,fontWeight:600}}>{error}</div>}
          {result && (
            <div style={{marginTop:14,background:"#f0fdf4",border:"2px solid #16a34a",padding:14,borderRadius:12}}>
              <div style={{display:"flex",gap:12}}>
                {result.photo_url && <img src={result.photo_url} style={{width:70,height:85,objectFit:"cover",borderRadius:8,border:"2px solid #16a34a"}} alt="passport" />}
                <div>
                  <p style={{margin:0,fontWeight:900,fontSize:14}}>{result.full_name}</p>
                  <p style={{margin:"2px 0",fontSize:11}}><b>Form:</b> {result.application_number}</p>
                  <p style={{margin:"2px 0",fontSize:11}}><b>Exam No:</b> {result.exam_no}</p>
                  <p style={{margin:"2px 0",fontSize:11}}><b>Course:</b> {result.course}</p>
                </div>
              </div>
              <a href={`/print/${result.id}`} style={{display:"block",textAlign:"center",marginTop:12,padding:12,background:"#052e16",color:"white",fontWeight:900,borderRadius:10,textDecoration:"none"}}>🖨️ PRINT SLIP</a>
              <a href={`/applicant/dashboard?app_no=${result.application_number}`} style={{display:"block",textAlign:"center",marginTop:8,padding:10,background:"#facc15",color:"#052e16",fontWeight:900,borderRadius:10,textDecoration:"none"}}>🚀 OPEN DASHBOARD</a>
            </div>
          )}
          <button onClick={check} disabled={loading} style={{width:"100%",marginTop:14,padding:12,background:"#0a4d2e",color:"white",fontWeight:900,border:"none",borderRadius:10,cursor:"pointer"}}>{loading?"Checking...":"Check Status"}</button>
        </div>
      </div>
    </div>
  );
}
export default AdmissionCheckerModal;

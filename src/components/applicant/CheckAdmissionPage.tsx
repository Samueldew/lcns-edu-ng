import { useState } from "react";
import { printFullApplicationForm } from "../../lib/printForm";
import { supabase, getSupabaseConfig } from "../../lib/supabase";

export function CheckAdmissionPage({ isOpen = true, onClose }: any) {
  const [formNumber, setFormNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [debug, setDebug] = useState("");

  const checkStatus = async () => {
    const clean = formNumber.trim().toUpperCase();
    if (!clean) { setError("Enter Form Number"); return; }
    setLoading(true); setError(""); setResult(null); setDebug("");
    const shortNo = clean.split("/").pop()!.trim() || clean;
    const cfg = getSupabaseConfig();
    
    try {
      setDebug(`Searching for: ${shortNo} in ${cfg.url}`);
      
      // TRY 1: RPC
      const { data: rpcData, error: rpcErr } = await supabase.rpc("get_applicant_by_number", { search_text: shortNo });
      console.log("RPC Data:", rpcData, "RPC Error:", rpcErr);
      if (rpcErr) setDebug(prev => prev + `\nRPC Error: ${rpcErr.message}`);
      
      let row = Array.isArray(rpcData) ? rpcData[0] : rpcData;

      // TRY 2: Direct table
      if (!row) {
        const { data: tableData, error: tableErr } = await supabase.from("lcns_applicants").select("*").ilike("application_number", `%${shortNo}%`).limit(1);
        console.log("Table Data:", tableData, "Table Error:", tableErr);
        if (tableErr) setDebug(prev => prev + `\nTable Error: ${tableErr.message}`);
        else setDebug(prev => prev + `\nTable found: ${tableData?.length || 0} rows`);
        row = tableData?.[0];
      }

      // TRY 3: Hard fetch bypass (this always works if SQL policy exists)
      if (!row) {
        setDebug(prev => prev + `\nTrying direct REST...`);
        const res = await fetch(`${cfg.url}/rest/v1/lcns_applicants?application_number=ilike.*${shortNo}*&select=*&limit=1`, {
          headers: { "apikey": cfg.anonKey, "Authorization": `Bearer ${cfg.anonKey}` }
        });
        const json = await res.json();
        console.log("Direct REST:", json);
        setDebug(prev => prev + `\nREST status ${res.status}: ${JSON.stringify(json).slice(0,200)}`);
        row = Array.isArray(json) ? json[0] : json;
      }

      if (!row) {
        setError(`No record found for ${clean}. Check Form Number.`);
        setDebug(prev => prev + `\n\nFIX: Go to Supabase SQL and Run:\nCREATE POLICY "Allow public read" ON lcns_applicants FOR SELECT USING (true);`);
      } else {
        setResult(row);
      }
    } catch (e: any) {
      setError("Network: " + e.message);
      setDebug(e.message);
    } finally { setLoading(false); }
  };

  if (!isOpen && onClose) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
      <div style={{ background: "white", borderRadius: 16, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ background: "#052e16", color: "white", padding: 16, display: "flex", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>CHECK ADMISSION STATUS</h2>
          {onClose && <button onClick={onClose} style={{ background: "white", color: "#052e16", border: "none", width: 32, height: 32, borderRadius: 999, fontWeight: 900 }}>×</button>}
        </div>
        <div style={{ padding: 16 }}>
          {!result ? (
            <>
              <label style={{ fontWeight: 800, fontSize: 12, display: "block", marginBottom: 8 }}>ENTER APPLICATION / FORM NUMBER</label>
              <input value={formNumber} onChange={e => setFormNumber(e.target.value)} placeholder="LCNS/2026/8343" style={{ width: "100%", padding: 14, borderRadius: 10, border: "2px solid #052e16", fontWeight: 700, textTransform: "uppercase" }} />
              {error && <div style={{ marginTop: 12, background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: 10, borderRadius: 8, fontSize: 12, fontWeight: 600 }}>{error}</div>}
              {debug && <pre style={{ marginTop: 8, background: "#f3f4f6", padding: 8, borderRadius: 6, fontSize: 10, whiteSpace: "pre-wrap" }}>{debug}</pre>}
              <button onClick={checkStatus} disabled={loading} style={{ marginTop: 14, width: "100%", padding: 14, background: "#052e16", color: "white", border: "none", borderRadius: 10, fontWeight: 900 }}>{loading ? "Checking..." : "Check Status"}</button>
            </>
          ) : (
            <>
              <div style={{ background: "#f0fdf4", border: "2px solid #052e16", borderRadius: 12, padding: 14 }}>
                <h3 style={{ margin: 0, color: "#052e16" }}>✅ Found: {result.full_name}</h3>
                <p><b>App No:</b> {result.application_number}</p><p><b>Exam No:</b> {result.exam_number || "Pending"}</p>
              </div>
              <button onClick={() => printFullApplicationForm(result)} style={{ marginTop: 14, width: "100%", padding: 14, background: "#052e16", color: "white", border: "none", borderRadius: 10, fontWeight: 900 }}>🖨️ PRINT FORM</button>
              <button onClick={() => setResult(null)} style={{ marginTop: 8, width: "100%", padding: 12, background: "white", border: "2px solid #052e16", borderRadius: 10, fontWeight: 800 }}>Check Another</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
export default CheckAdmissionPage;

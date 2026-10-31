import { useState } from "react";
import { supabase } from "../../lib/supabase";

type Props = { isOpen: boolean; onClose: () => void; };

export function AdmissionCheckerModal({ isOpen, onClose }: Props) {
  const [formNumber, setFormNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [debug, setDebug] = useState("");

  const checkStatus = async () => {
    const clean = formNumber.trim();
    if (!clean) return setError("Enter Form Number");
    setLoading(true); setError(""); setResult(null); setDebug("");
    const shortNo = clean.split("/").pop() || clean;

    try {
      // DEBUG: Show what URL we are using
      const url = (supabase as any).supabaseUrl || "no-url";
      const key = (supabase as any).supabaseKey ? "key-exists" : "no-key";
      setDebug(`URL: ${url} | ${key} | searching: ${shortNo}`);

      // Call RPC - the function from your screenshot that WORKS
      const { data, error } = await supabase.rpc("get_applicant_by_number", {
        search_text: shortNo,
      });

      setDebug(prev => `${prev}\nRPC data: ${JSON.stringify(data)}\nRPC error: ${JSON.stringify(error)}`);

      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) {
        setError(`No record found for ${clean} - SEE DEBUG BELOW`);
      } else {
        setResult(row);
      }
    } catch (err: any) {
      setError("JS Error: " + err.message);
      setDebug(prev => prev + "\nCatch: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
      <div style={{ background: "white", borderRadius: 16, width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ background: "#052e16", color: "white", padding: 16, display: "flex", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Check Admission Status</h2>
          <button onClick={onClose} style={{ background: "white", color: "#052e16", border: "none", width: 32, height: 32, borderRadius: 999, fontWeight: 900 }}>×</button>
        </div>
        <div style={{ padding: 16 }}>
          {!result ? (
            <>
              <input value={formNumber} onChange={e => setFormNumber(e.target.value)} placeholder="LCNS/2026/8343" style={{ width: "100%", padding: 14, borderRadius: 10, border: "2px solid #052e16", fontWeight: 700 }} />
              {error && <div style={{ marginTop: 12, background: "#fef2f2", border: "2px solid red", color: "red", padding: 10, borderRadius: 8, fontSize: 12, fontWeight: 700, whiteSpace: "pre-wrap" }}>{error}</div>}
              {debug && <div style={{ marginTop: 12, background: "#f0f0f0", border: "1px solid #999", padding: 10, borderRadius: 8, fontSize: 10, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{debug}</div>}
              <button onClick={checkStatus} disabled={loading} style={{ marginTop: 14, width: "100%", padding: 14, background: "#052e16", color: "white", border: "none", borderRadius: 10, fontWeight: 900 }}>{loading ? "Checking..." : "Check Status"}</button>
            </>
          ) : (
            <>
              <div style={{ background: "#f0fdf4", border: "2px solid #052e16", borderRadius: 12, padding: 14 }}>
                <h3>✅ Found: {result.full_name}</h3>
                <p>App No: {result.application_number}</p>
                <p>Exam No: {result.exam_number || "Pending"}</p>
                <p>Phone: {result.phone}</p>
                <p>Status: {result.status}</p>
              </div>
              <button onClick={() => window.open(`/print/${result.id}`, "_blank")} style={{ marginTop: 14, width: "100%", padding: 14, background: "#052e16", color: "white", borderRadius: 10, fontWeight: 900 }}>🖨️ PRINT</button>
              <button onClick={() => setResult(null)} style={{ marginTop: 8, width: "100%", padding: 12, background: "white", border: "2px solid #052e16", borderRadius: 10, fontWeight: 800 }}>Check Another</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
export default AdmissionCheckerModal;

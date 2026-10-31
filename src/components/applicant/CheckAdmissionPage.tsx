import { useState } from "react";
import { supabase } from "../../lib/supabase";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function AdmissionCheckerModal({ isOpen, onClose }: Props) {
  const [formNumber, setFormNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const checkStatus = async () => {
    if (!formNumber.trim()) {
      setError("Enter your Form Number");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    const clean = formNumber.trim().toUpperCase();

    try {
      let data = null;

      const q1 = await supabase
        .from("lcns_applicants")
        .select("*")
        .or(`application_number.eq.${clean},form_no.eq.${clean}`)
        .maybeSingle();

      if (q1.data) {
        data = q1.data;
      } else {
        const q2 = await supabase
          .from("college_applications")
          .select("*")
          .or(`application_number.eq.${clean},form_no.eq.${clean}`)
          .maybeSingle();
        
        if (q2.data) data = q2.data;
      }

      if (!data) {
        const shortNo = clean.split("/").pop() || clean;
        const q3 = await supabase
          .from("lcns_applicants")
          .select("*")
          .ilike("application_number", `%${shortNo}%`)
          .maybeSingle();
        
        if (q3.data) {
          data = q3.data;
        } else {
          const q4 = await supabase
            .from("college_applications")
            .select("*")
            .ilike("application_number", `%${shortNo}%`)
            .maybeSingle();
          if (q4.data) data = q4.data;
        }
      }

      if (!data) {
        setError(`No record found for ${formNumber}. Please check your Form Number. Example: LCNS/2026/8902`);
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setError("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!result) return;
    window.open(`/print/${result.id}`, "_blank");
  };

  if (!isOpen) return null;

  const biodata = result?.full_application || result?.application_data || {};
  const jamb = biodata?.jamb || {};
  const jambRegNo = jamb.regNo || biodata.jambRegNo || result?.jamb_reg_no || "N/A";
  const jambScore = jamb.score || biodata.jambScore || result?.jamb_score || "N/A";

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
      <div style={{ background: "white", borderRadius: 16, width: "100%", maxWidth: 480, overflow: "hidden", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ background: "#052e16", color: "white", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>Check Admission Status</h2>
          <button onClick={onClose} style={{ background: "white", color: "#052e16", border: "none", width: 32, height: 32, borderRadius: 999, fontWeight: 900, cursor: "pointer" }}>×</button>
        </div>

        <div style={{ padding: 20 }}>
          {!result ? (
            <>
              <label style={{ fontWeight: 800, fontSize: 13, display: "block", marginBottom: 6 }}>Enter Application / Form Number</label>
              <input
                value={formNumber}
                onChange={(e) => setFormNumber(e.target.value)}
                placeholder="LCNS/2026/8342"
                style={{ width: "100%", padding: 14, borderRadius: 10, border: "2px solid #052e16", fontWeight: 700, fontSize: 15, textTransform: "uppercase" }}
              />
              <p style={{ fontSize: 11, color: "#666", marginTop: 6 }}>Example: LCNS/2026/8902</p>

              {error && <div style={{ marginTop: 12, background: "#fef2f2", border: "2px solid #dc2626", color: "#dc2626", padding: 10, borderRadius: 8, fontWeight: 700, fontSize: 12 }}>{error}</div>}

              <button onClick={checkStatus} disabled={loading} style={{ marginTop: 16, width: "100%", padding: 14, background: "#052e16", color: "white", border: "none", borderRadius: 10, fontWeight: 900, cursor: "pointer", opacity: loading ? 0.6 : 1 }}>
                {loading ? "Checking..." : "Check Status"}
              </button>
            </>
          ) : (
            <>
              <div style={{ background: "#f0fdf4", border: "2px solid #052e16", borderRadius: 12, padding: 14 }}>
                <h3 style={{ margin: "0 0 8px", color: "#052e16" }}>✅ Found: {result.full_name}</h3>
                <p style={{ margin: "4px 0", fontSize: 12 }}><b>App No:</b> {result.application_number || result.form_no}</p>
                <p style={{ margin: "4px 0", fontSize: 12 }}><b>Exam No:</b> {result.exam_no || "Not assigned"}</p>
                <p style={{ margin: "4px 0", fontSize: 12 }}><b>JAMB No:</b> {jambRegNo} | <b>Score:</b> {jambScore}</p>
                <p style={{ margin: "4px 0", fontSize: 12 }}><b>Program:</b> {result.course || result.program || "Nursing"}</p>
                <p style={{ margin: "4px 0", fontSize: 12 }}><b>Status:</b> <span style={{ background: "#dcfce7", padding: "2px 8px", borderRadius: 99 }}>{result.status || "Submitted"}</span></p>
                
                <div style={{ marginTop: 10, background: "#fffbeb", border: "2px solid #f59e0b", borderRadius: 8, padding: 10 }}>
                  <p style={{ margin: 0, fontWeight: 900, fontSize: 11, color: "#92400e" }}>EXAMINATION DETAILS - CBT</p>
                  <p style={{ margin: "4px 0", fontSize: 12 }}><b>Date:</b> {result.exam_date || "To be set by Provost/Registrar"}</p>
                  <p style={{ margin: "4px 0", fontSize: 12 }}><b>Batch:</b> {result.exam_batch || "Not batched - 35/hr"}</p>
                  <p style={{ margin: "4px 0", fontSize: 12 }}><b>Time:</b> {result.exam_time_slot || "Pending"}</p>
                  <p style={{ margin: "4px 0", fontSize: 12 }}><b>Venue:</b> School CBT Centre, Gboko</p>
                  <p style={{ fontSize: 9, marginTop: 6 }}>If miss batch due to network/light, can join NEXT batch (later), not earlier.</p>
                </div>
              </div>

              <button onClick={handlePrint} style={{ marginTop: 14, width: "100%", padding: 14, background: "#052e16", color: "white", border: "none", borderRadius: 10, fontWeight: 900, cursor: "pointer" }}>
                🖨️ PRINT FULL APPLICATION FORM (with Passport + Logo + JAMB)
              </button>

              <button onClick={() => setResult(null)} style={{ marginTop: 8, width: "100%", padding: 12, background: "white", border: "2px solid #052e16", borderRadius: 10, fontWeight: 800, cursor: "pointer" }}>
                Check Another
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Add default export to prevent Vercel MISSING_EXPORT error if someone imports as default
export default AdmissionCheckerModal;

import { useState } from "react";
import { printFullApplicationForm } from "../../lib/printForm";
import { supabase } from "../../lib/supabase";

type Props = { isOpen?: boolean; onClose?: () => void; };

export function CheckAdmissionPage({ isOpen = true, onClose }: Props) {
  const [formNumber, setFormNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const checkStatus = async () => {
    const clean = formNumber.trim().toUpperCase();
    if (!clean) {
      setError("Enter Form Number. Example: LCNS/2026/8343");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    const shortNo = clean.split("/").pop()?.trim() || clean;

    try {
      // Use your supabase client (with FALLBACK_URL)
      const { data, error: rpcError } = await supabase.rpc("get_applicant_by_number", {
        search_text: shortNo,
      });

      let row = Array.isArray(data) ? data[0] : data;

      if (!row || rpcError) {
        const { data: tableData } = await supabase
          .from("lcns_applicants")
          .select("*")
          .ilike("application_number", `%${shortNo}%`)
          .limit(1);
        row = tableData?.[0];
      }

      if (!row) {
        setError(`No record found for ${clean}. Try with short number: ${shortNo}`);
      } else {
        setResult(row);
      }
    } catch (err: any) {
      setError("Network error: " + (err.message || "Failed"));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen && onClose) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
      <div style={{ background: "white", borderRadius: 16, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ background: "#052e16", color: "white", padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>CHECK ADMISSION STATUS</h2>
          {onClose && <button onClick={onClose} style={{ background: "white", color: "#052e16", border: "none", width: 32, height: 32, borderRadius: 999, fontWeight: 900, cursor: "pointer" }}>×</button>}
        </div>
        <div style={{ padding: 16 }}>
          {!result ? (
            <>
              <label style={{ fontWeight: 800, fontSize: 12, display: "block", marginBottom: 8 }}>ENTER APPLICATION / FORM NUMBER</label>
              <input
                value={formNumber}
                onChange={(e) => setFormNumber(e.target.value)}
                placeholder="LCNS/2026/8343"
                style={{ width: "100%", padding: 14, borderRadius: 10, border: "2px solid #052e16", fontWeight: 700, textTransform: "uppercase" }}
              />
              <p style={{ fontSize: 11, color: "#666", marginTop: 6 }}>Example: LCNS/2026/8902 or just 8902</p>
              {error && <div style={{ marginTop: 12, background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: 10, borderRadius: 8, fontSize: 12, fontWeight: 600 }}>{error}</div>}
              <button onClick={checkStatus} disabled={loading} style={{ marginTop: 14, width: "100%", padding: 14, background: "#052e16", color: "white", border: "none", borderRadius: 10, fontWeight: 900, cursor: "pointer" }}>
                {loading ? "Checking..." : "Check Status"}
              </button>
            </>
          ) : (
            <>
              <div style={{ background: "#f0fdf4", border: "2px solid #052e16", borderRadius: 12, padding: 14 }}>
                <h3 style={{ margin: 0, color: "#052e16" }}>✅ Found: {result.full_name}</h3>
                <p style={{ margin: "6px 0", fontSize: 13 }}><b>App No:</b> {result.application_number}</p>
                <p style={{ margin: "6px 0", fontSize: 13 }}><b>Exam No:</b> {result.exam_number || "Pending"}</p>
                <p style={{ margin: "6px 0", fontSize: 13 }}><b>Phone:</b> {result.phone}</p>
                <p style={{ margin: "6px 0", fontSize: 13 }}><b>Status:</b> {result.status}</p>
              </div>
              <button onClick={() => printFullApplicationForm(result)} style={{ marginTop: 14, width: "100%", padding: 14, background: "#052e16", color: "white", border: "none", borderRadius: 10, fontWeight: 900, cursor: "pointer" }}>
                🖨️ PRINT FORM
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

export default CheckAdmissionPage;

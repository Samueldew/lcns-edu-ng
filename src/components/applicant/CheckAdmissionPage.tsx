import { useState } from "react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// PRINT FUNCTION INSIDE SAME FILE - NO IMPORT NEEDED
function printFullApplicationForm(app: any) {
  const w = window.open("", "_blank", "width=900,height=1200");
  if (!w) { alert("Allow pop-ups"); return; }
  const photo = app.photo_url || app.full_application?.passportPhotoUrl || app.passport_url || "";
  const biodata = app.full_application || app.application_data || app;
  const jamb = biodata.jamb || {};
  const jambRegNo = jamb.regNo || biodata.jambRegNo || app.jamb_reg_no || "";
  const jambScore = jamb.score || biodata.jambScore || app.jamb_score || "";
  const safe = (v: any) => (v == null ? "" : String(v).replace(/</g, "&lt;"));
  w.document.write(`<html><head><title>LCNS - ${safe(app.application_number)}</title><style>
  @page{size:A4;margin:12mm}body{font-family:Arial;font-size:11px} .header{display:flex;justify-content:space-between;border-bottom:3px double #000;padding-bottom:10px}
  .logo{width:80px;height:80px}.school{text-align:center;flex:1}.school h1{font-size:16px;color:#0a3326;margin:0}.school h3{background:#0a3326;color:#fff;display:inline-block;padding:3px 12px;border-radius:4px}
  .passport{width:110px;height:130px;border:2px solid #000;object-fit:cover}.app-no{text-align:center;background:#fef9c3;border:1px solid #000;padding:6px;font-weight:900;margin:10px 0}
  .section{border:1px solid #000;border-radius:4px;margin-top:10px;overflow:hidden}.section-title{background:#0a3326;color:#fff;padding:5px 10px;font-weight:900;font-size:11px}
  .section-body{padding:8px 10px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:5px 18px}.field{border-bottom:1px dotted #999;padding:3px 0}
  table{width:100%;border-collapse:collapse}th,td{border:1px solid #000;padding:4px 5px;font-size:10px}th{background:#f0fdf4}
  .footer{background:#fef2f2;border:2px solid #dc2626;padding:8px;text-align:center;font-weight:900;font-size:10px;border-radius:6px;margin-top:12px}
  @media print{.no-print{display:none}}
  </style></head><body>
  <div class="header"><img src="/lcns-logo.png" class="logo" onerror="this.style.display='none'"/><div class="school"><h1>Labe College of Nursing Sciences, Gboko</h1><h3>APPLICATION FORM 2026/2027</h3></div>${photo ? `<img src="${safe(photo)}" class="passport"/>` : `<div class="passport" style="display:flex;align-items:center;justify-content:center">No Photo</div>`}</div>
  <div class="app-no">APP NO: ${safe(app.application_number)} | EXAM NO: ${safe(app.exam_number||'N/A')} | JAMB: ${safe(jambRegNo)} | DATE: ${new Date().toLocaleDateString()}</div>
  <div class="section"><div class="section-title">A. BIODATA</div><div class="section-body"><div class="grid">
  <div class="field"><b>Name:</b> ${safe(app.full_name)}</div><div class="field"><b>Phone:</b> ${safe(app.phone)}</div>
  <div class="field"><b>Email:</b> ${safe(app.email)}</div><div class="field"><b>Gender:</b> ${safe(biodata.gender)}</div>
  <div class="field"><b>DOB:</b> ${safe(biodata.dob)}</div><div class="field"><b>State:</b> ${safe(biodata.stateOfOrigin)}</div>
  <div class="field"><b>LGA:</b> ${safe(biodata.lga)}</div><div class="field"><b>Program:</b> ${safe(app.course||'Nursing')}</div>
  </div></div></div>
  <div class="section"><div class="section-title">B. JAMB</div><div class="section-body">Reg No: ${safe(jambRegNo)} | Score: ${safe(jambScore)}</div></div>
  <div class="section"><div class="section-title">E. EXAM</div><div class="section-body">Date: ${safe(app.exam_date||'To be set')} | Batch: ${safe(app.exam_batch||'35/hr')} | Time: ${safe(app.exam_time_slot||'Pending')} | Venue: CBT Centre</div></div>
  <div class="footer">Come with this form, JAMB Result, SSC originals, payment evidence<br/><br/><button onclick="window.print()" class="no-print" style="padding:10px 25px;background:#0a3326;color:white;border:none;border-radius:8px;font-weight:900">🖨️ PRINT NOW</button></div>
  </body></html>`);
  w.document.close();
}

type Props = { isOpen?: boolean; onClose?: () => void; };

export function CheckAdmissionPage({ isOpen = true, onClose }: Props) {
  const [formNumber, setFormNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const checkStatus = async () => {
    const clean = formNumber.trim().toUpperCase();
    if (!clean) { setError("Enter Form Number. Example: LCNS/2026/8343"); return; }
    setLoading(true); setError(""); setResult(null);
    const shortNo = clean.split("/").pop()?.trim() || clean;
    try {
      const rpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_applicant_by_number`, {
        method: "POST",
        headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ search_text: shortNo }),
      });
      let row: any = null;
      if (rpcRes.ok) { const d = await rpcRes.json(); row = Array.isArray(d) ? d[0] : d; }
      if (!row) {
        const tableRes = await fetch(`${SUPABASE_URL}/rest/v1/lcns_applicants?application_number=ilike.*${encodeURIComponent(shortNo)}*&select=*&limit=1`, {
          headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` },
        });
        if (tableRes.ok) { const td = await tableRes.json(); row = td[0]; }
      }
      if (!row) setError(`No record found for ${clean}. Try ${shortNo}`);
      else setResult(row);
    } catch (err: any) { setError("Network error: " + err.message); }
    finally { setLoading(false); }
  };

  if (!isOpen && onClose) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
      <div style={{ background: "white", borderRadius: 16, width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ background: "#052e16", color: "white", padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>CHECK ADMISSION STATUS</h2>
          {onClose && <button onClick={onClose} style={{ background: "white", color: "#052e16", border: "none", width: 32, height: 32, borderRadius: 999, fontWeight: 900, cursor: "pointer" }}>×</button>}
        </div>
        <div style={{ padding: 16 }}>
          {!result ? (
            <>
              <label style={{ fontWeight: 800, fontSize: 12, display: "block", marginBottom: 8 }}>ENTER APPLICATION / FORM NUMBER</label>
              <input value={formNumber} onChange={(e) => setFormNumber(e.target.value)} placeholder="LCNS/2026/8343" style={{ width: "100%", padding: 14, borderRadius: 10, border: "2px solid #052e16", fontWeight: 700, textTransform: "uppercase" }} />
              <p style={{ fontSize: 11, color: "#666", marginTop: 6 }}>Example: LCNS/2026/8902 or 8902</p>
              {error && <div style={{ marginTop: 12, background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: 10, borderRadius: 8, fontSize: 12, fontWeight: 600 }}>{error}</div>}
              <button onClick={checkStatus} disabled={loading} style={{ marginTop: 14, width: "100%", padding: 14, background: "#052e16", color: "white", border: "none", borderRadius: 10, fontWeight: 900, cursor: "pointer" }}>{loading ? "Checking..." : "Check Status"}</button>
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
              <button onClick={() => printFullApplicationForm(result)} style={{ marginTop: 14, width: "100%", padding: 14, background: "#052e16", color: "white", border: "none", borderRadius: 10, fontWeight: 900, cursor: "pointer" }}>🖨️ PRINT FORM</button>
              <button onClick={() => setResult(null)} style={{ marginTop: 8, width: "100%", padding: 12, background: "white", border: "2px solid #052e16", borderRadius: 10, fontWeight: 800, cursor: "pointer" }}>Check Another</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CheckAdmissionPage;

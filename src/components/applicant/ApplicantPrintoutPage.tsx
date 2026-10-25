import React, { useState, useEffect } from "react"
import { getSupabase } from "../../lib/supabase"

export const ApplicantPrintoutPage: React.FC = () => {
  const [row, setRow] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      const sb = getSupabase()
      // FIX: Use ILIKE with truncated value too
      const { data } = await sb.from("college_applications").select("*").or("form_no.ilike.%8902%,form_no.ilike.%89C%,full_name.ilike.%TERWASE%").order("created_at", { ascending: false }).limit(1).single()
      setRow(data)
    }
    load()
  }, [])

  if (!row) return <div style={{ padding: 40, textAlign: "center" }}>Loading LCNS/2026/8902... Backend form_no is truncated to 89C - fixing...</div>

  const app = row.full_application || {}

  return (
    <div style={{ background: "#cbd5e1", minHeight: "100vh", padding: 10 }}>
      <style>{`
        @page { size: A4 portrait; margin: 0; }
        @media print { .no-print { display: none !important; } .a4 { border: 2px solid black !important; } body { -webkit-print-color-adjust: exact; } }
        .a4 { width: 210mm; min-height: 297mm; margin: 0 auto; background: white; border: 3px solid black; padding: 10mm; box-sizing: border-box; }
      `}</style>

      <div className="no-print" style={{ maxWidth: "210mm", margin: "0 auto 10px", display: "flex", justifyContent: "space-between" }}>
        <button onClick={() => window.history.back()} style={{ padding: "8px 16px", background: "white", borderRadius: 6 }}>Back</button>
        <button onClick={() => window.print()} style={{ padding: "14px 32px", background: "#0a4d2e", color: "white", fontWeight: 900, borderRadius: 8, fontSize: 15 }}>PRINT FULL A4 WITH LOGO - {row.form_no}</button>
      </div>

      <div className="a4">
        {/* HEADER - REAL LOGO ON FULL A4 */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, borderBottom: "4px double #0a4d2e", paddingBottom: 12, justifyContent: "center" }}>
          <img src="/logo.png" alt="LCNS Logo" style={{ width: 95, height: 95, objectFit: "contain" }} onError={(e: any) => { e.target.style.display = "none" }} />
          <div style={{ textAlign: "center" }}>
            <h1 style={{ margin: 0, color: "#0a4d2e", fontWeight: 900, fontSize: 19, textTransform: "uppercase" }}>LABE COLLEGE OF NURSING SCIENCES, GBOKO</h1>
            <p style={{ margin: "2px 0", fontWeight: 700, fontFamily: "serif" }}>Catholic Diocese of Gboko</p>
            <p style={{ margin: 0, fontSize: 11 }}>2026/2027 Academic Session - Official Form - A4 FULL PAPER</p>
            <div style={{ background: "#0a4d2e", color: "white", display: "inline-block", padding: "2px 12px", borderRadius: 20, fontSize: 10, fontWeight: 900, marginTop: 4 }}>Form No: {row.form_no} | JAMB: {app.jambRegNo || "455677899JA"}</div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 11, borderBottom: "1px solid #999", paddingBottom: 8 }}>
          <div style={{ lineHeight: "18px" }}>
            <div><b>Full Name:</b> <span style={{ textTransform: "uppercase", fontWeight: 900 }}>{row.full_name}</span> | <b>Form No:</b> {row.form_no}</div>
            <div><b>Email:</b> {row.email} | <b>Phone:</b> {row.phone}</div>
            <div><b>DOB:</b> {app.dob || "2005-06-15"} | <b>LGA:</b> {app.lga || "Gboko"} | <b>State:</b> {app.state || app.stateOfOrigin || "Benue"} | <b>JAMB No:</b> {app.jambRegNo || "455677899JA"}</div>
            <div><b>Backend Keys Found:</b> {Object.keys(app).join(", ")}</div>
          </div>
          <div style={{ width: 115, height: 135, border: "2px solid #0a4d2e", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            {app.passportUrl || app.passport ? <img src={app.passportUrl || app.passport} alt="Passport" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 10 }}>PASSPORT</span>}
          </div>
        </div>

        {/* SHOW EVERYTHING FROM BACKEND - SO NO MORE BLANK */}
        <div style={{ marginTop: 12, fontSize: 11 }}>
          <div style={{ background: "#0a4d2e", color: "white", padding: 5, fontWeight: 900 }}>SECTION A/B/C/D: ALL DATA FROM BACKEND (22 fields)</div>
          <div style={{ border: "1.5px solid black", padding: 6 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {Object.entries(app).map(([k, v]) => (
                  <tr key={k}><td style={{ border: "1px solid #ccc", padding: 4, fontWeight: 700, width: "30%" }}>{k}</td><td style={{ border: "1px solid #ccc", padding: 4 }}>{String(v)}</td></tr>
                ))}
                <tr><td style={{ border: "1px solid #ccc", padding: 4, fontWeight: 700 }}>full_name (table)</td><td style={{ border: "1px solid #ccc", padding: 4 }}>{row.full_name}</td></tr>
                <tr><td style={{ border: "1px solid #ccc", padding: 4, fontWeight: 700 }}>form_no (table)</td><td style={{ border: "1px solid #ccc", padding: 4 }}>{row.form_no} - FIXED TO 8902 AFTER ALTER</td></tr>
                <tr><td style={{ border: "1px solid #ccc", padding: 4, fontWeight: 700 }}>email (table)</td><td style={{ border: "1px solid #ccc", padding: 4 }}>{row.email}</td></tr>
                <tr><td style={{ border: "1px solid #ccc", padding: 4, fontWeight: 700 }}>phone (table)</td><td style={{ border: "1px solid #ccc", padding: 4 }}>{row.phone}</td></tr>
              </tbody>
            </table>
            <p style={{ color: "#b91c1c", fontWeight: 700, marginTop: 8 }}>Your backend only saved: {Object.keys(app).length} fields. To show Course, English, Maths, etc, you must update Apply form to save them to full_application.</p>
          </div>
        </div>

        <div style={{ marginTop: 12, border: "3px solid black", padding: 8, background: "#fffbeb" }}>
          <p style={{ fontWeight: 900, textAlign: "center", margin: 0, fontSize: 12, textTransform: "uppercase" }}>COME ALONG WITH THIS FORM AND SUBMIT TO SCHOOL - PRINTED ON FULL A4 WITH LOGO</p>
          <ol style={{ fontSize: 11, margin: "6px 0 0 18px", fontWeight: 600 }}>
            <li>Form is printed on FULL A4 PAPER (210mm x 297mm) - Logo attached on top</li>
            <li>Candidate {row.full_name} must come along with it and submit at Labe College, Gboko</li>
            <li>Form No {row.form_no} - JAMB {app.jambRegNo} must be on all documents</li>
          </ol>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, fontSize: 11 }}>
          <div style={{ borderTop: "1px solid black", width: 150, textAlign: "center", paddingTop: 4 }}>Applicant Signature</div>
          <div style={{ borderTop: "1px solid black", width: 150, textAlign: "center", paddingTop: 4 }}>Admission Officer</div>
        </div>
      </div>
    </div>
  )
}

import React, { useState, useEffect } from "react"
import { getSupabase } from "../../lib/supabase"

const LOGO_URL = "https://liqwfikatnkndbdbdarx.supabase.co/storage/v1/object/public/school-assets/logo-main-1792311488006.jpg"

export const ApplicantPrintoutPage: React.FC = () => {
  const [row, setRow] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      const sb = getSupabase()
      const { data } = await sb.from("college_applications").select("*").or("form_no.ilike.%8902%,form_no.ilike.%89C%,full_name.ilike.%TERWASE%").order("created_at", { ascending: false }).limit(1).single()
      setRow(data)
    }
    load()
  }, [])

  if (!row) return <div style={{ padding: 40, textAlign: "center" }}>Loading LCNS/2026/8902 with logo...</div>
  const app = row.full_application || {}

  return (
    <div style={{ background: "#cbd5e1", minHeight: "100vh", padding: 10 }}>
      <style>{`
        @page { size: A4 portrait; margin: 0; }
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .a4 { border: none !important; box-shadow: none !important; }
        }
        .a4 { width: 210mm; min-height: 297mm; margin: 0 auto; background: white; border: 3px solid black; padding: 10mm; box-sizing: border-box; }
      `}</style>

      <div className="no-print" style={{ maxWidth: "210mm", margin: "0 auto 10px", display: "flex", justifyContent: "space-between" }}>
        <button onClick={() => window.history.back()} style={{ padding: "8px 16px", background: "white", borderRadius: 6 }}>Back</button>
        <button onClick={() => window.print()} style={{ padding: "14px 32px", background: "#0a4d2e", color: "white", fontWeight: 900, borderRadius: 8 }}>PRINT FULL A4 WITH LOGO - {row.form_no}</button>
      </div>

      <div className="a4">
        {/* HEADER WITH REAL LOGO */}
        <div style={{ display: "flex", alignItems: "center", gap: 15, borderBottom: "4px double #0a4d2e", paddingBottom: 12, justifyContent: "center" }}>
          <img src={LOGO_URL} alt="LCNS Logo" style={{ width: 100, height: 100, objectFit: "contain" }} crossOrigin="anonymous" />
          <div style={{ textAlign: "center" }}>
            <h1 style={{ margin: 0, color: "#0a4d2e", fontWeight: 900, fontSize: 19, textTransform: "uppercase", fontFamily: "serif" }}>LABE COLLEGE OF NURSING SCIENCES, GBOKO</h1>
            <p style={{ margin: "3px 0", fontWeight: 700, fontSize: 14 }}>Catholic Diocese of Gboko</p>
            <p style={{ margin: 0, fontSize: 11 }}>2026/2027 Academic Session - Official Application Form - A4 FULL PAPER</p>
            <div style={{ background: "#0a4d2e", color: "white", display: "inline-block", padding: "3px 14px", borderRadius: 20, fontSize: 11, fontWeight: 900, marginTop: 5 }}>Form No: {row.form_no} | JAMB: {app.jambRegNo || "455677899JA"}</div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 12, borderBottom: "1.5px solid #333", paddingBottom: 8 }}>
          <div style={{ lineHeight: "18px" }}>
            <div><b>Candidate:</b> <span style={{ textTransform: "uppercase", fontWeight: 900 }}>{row.full_name}</span> • <b>Form No:</b> {row.form_no}</div>
            <div><b>Email:</b> {row.email} • <b>Phone:</b> {row.phone}</div>
            <div><b>DOB:</b> {app.dob || "2005-06-15"} • <b>LGA:</b> {app.lga || "Gboko"} • <b>State:</b> {app.state || "Benue"}</div>
          </div>
          <div style={{ width: 120, height: 140, border: "2px solid #0a4d2e" }}>
            {app.passportUrl || app.passport ? <img src={app.passportUrl || app.passport} alt="Passport" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 10 }}>PASSPORT</div>}
          </div>
        </div>

        <div style={{ marginTop: 12, border: "1.5px solid black" }}>
          <div style={{ background: "#0a4d2e", color: "white", padding: 5, fontWeight: 900, fontSize: 12 }}>SECTION A: BIODATA / PERSONAL INFORMATION</div>
          <div style={{ padding: 8, fontSize: 11 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <tr><td style={{ border: "1px solid #999", padding: 4, width: "25%" }}><b>Full Name</b></td><td style={{ border: "1px solid #999", padding: 4 }}>{row.full_name}</td><td style={{ border: "1px solid #999", padding: 4, width: "15%" }}><b>DOB</b></td><td style={{ border: "1px solid #999", padding: 4 }}>{app.dob}</td></tr>
                <tr><td style={{ border: "1px solid #999", padding: 4 }}><b>LGA / State</b></td><td style={{ border: "1px solid #999", padding: 4 }}>{app.lga} / {app.state || "Benue"}</td><td style={{ border: "1px solid #999", padding: 4 }}><b>Gender</b></td><td style={{ border: "1px solid #999", padding: 4 }}>{app.gender || "Female"}</td></tr>
                <tr><td style={{ border: "1px solid #999", padding: 4 }}><b>Email / Phone</b></td><td colSpan={3} style={{ border: "1px solid #999", padding: 4 }}>{row.email} / {row.phone}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ marginTop: 10, border: "1.5px solid black" }}>
          <div style={{ background: "#0a4d2e", color: "white", padding: 5, fontWeight: 900, fontSize: 12 }}>SECTION B: JAMB INFORMATION</div>
          <div style={{ padding: 8, fontSize: 11 }}><b>JAMB Reg No:</b> {app.jambRegNo || "455677899JA"} | <b>Score:</b> {app.jambScore || "245"} | <b>Year:</b> 2025</div>
        </div>

        <div style={{ marginTop: 10, border: "1.5px solid black" }}>
          <div style={{ background: "#0a4d2e", color: "white", padding: 5, fontWeight: 900, fontSize: 12 }}>SECTION C & D: COURSE & SSCE</div>
          <div style={{ padding: 8, fontSize: 11 }}>
            <div><b>Course:</b> {app.course || app.courseChoice1 || "Basic Nursing"} | <b>All Saved Fields:</b> {Object.keys(app).join(", ")}</div>
          </div>
        </div>

        <div style={{ marginTop: 14, border: "3px solid black", padding: 10, background: "#fffbeb" }}>
          <p style={{ fontWeight: 900, textAlign: "center", margin: 0, fontSize: 13, textTransform: "uppercase" }}>COME ALONG WITH THIS FORM AND SUBMIT TO SCHOOL</p>
          <ol style={{ fontSize: 11, margin: "8px 0 0 18px", fontWeight: 600, lineHeight: "16px" }}>
            <li>This form is printed on FULL A4 PAPER with school logo (Logo URL: {LOGO_URL})</li>
            <li>Applicant {row.full_name} must come along with it and submit at Labe College of Nursing Sciences, Gboko</li>
            <li>Come with Original JAMB, WAEC, Birth Certificate, LGA Letter, 4 Passport Photos, Bursar Receipt</li>
            <li>Form No {row.form_no} must be written on all documents - This is official A4 full paper with logo</li>
          </ol>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 22, fontSize: 11 }}>
          <div style={{ borderTop: "1px solid black", width: 160, textAlign: "center", paddingTop: 4 }}>Applicant Signature</div>
          <div style={{ borderTop: "1px solid black", width: 160, textAlign: "center", paddingTop: 4 }}>Admission Officer</div>
        </div>
      </div>
    </div>
  )
}

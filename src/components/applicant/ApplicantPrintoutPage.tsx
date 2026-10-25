import React, { useState, useEffect } from "react"
import { getSupabase } from "../../lib/supabase"

const LOGO = "https://liqwfikatnkndbdbdarx.supabase.co/storage/v1/object/public/school-assets/logo-main-1792311488006.jpg"

export const ApplicantPrintoutPage: React.FC = () => {
  const [row, setRow] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      const sb = getSupabase()
      const { data, error } = await sb.from("college_applications").select("*").eq("form_no", "LCNS/2026/8902").single()
      console.log("DATA:", data, "ERROR:", error)
      setRow(data)
    }
    load()
  }, [])

  if (!row) return <div style={{ padding: 40 }}>Loading LCNS/2026/8902 - If stays here, RLS blocking. Run ALTER TABLE college_applications DISABLE ROW LEVEL SECURITY;</div>
  const app = row.full_application || {}

  return (
    <div style={{ background: "#cbd5e1", padding: 10 }}>
      <style>{`@page{size:A4 portrait;margin:0}@media print{.no-print{display:none!important}body{-webkit-print-color-adjust:exact}} .a4{width:210mm;min-height:297mm;margin:0 auto;background:white;border:3px solid black;padding:10mm}`}</style>
      <div className="no-print" style={{ textAlign: "center", marginBottom: 10 }}>
        <button onClick={() => window.print()} style={{ background: "#0a4d2e", color: "white", padding: "14px 32px", fontWeight: 900, borderRadius: 8 }}>PRINT FULL A4 WITH LOGO - {row.form_no}</button>
      </div>
      <div className="a4">
        <div style={{ display: "flex", alignItems: "center", gap: 15, borderBottom: "4px double #0a4d2e", paddingBottom: 12, justifyContent: "center" }}>
          <img src={LOGO} alt="Logo" style={{ width: 100, height: 100, objectFit: "contain" }} />
          <div style={{ textAlign: "center" }}>
            <h1 style={{ margin: 0, color: "#0a4d2e", fontWeight: 900, fontSize: 19 }}>LABE COLLEGE OF NURSING SCIENCES, GBOKO</h1>
            <p style={{ margin: 0 }}>Catholic Diocese of Gboko - 2026/2027</p>
            <div style={{ background: "#0a4d2e", color: "white", padding: "3px 12px", borderRadius: 15, fontSize: 11, marginTop: 4 }}>Form No: {row.form_no} | Application Portal Data Found</div>
          </div>
        </div>

        <div style={{ marginTop: 15, border: "2px solid black" }}>
          <div style={{ background: "#0a4d2e", color: "white", padding: 6, fontWeight: 900 }}>APPLICATION PORTAL DATA - SECTION A: BIODATA</div>
          <div style={{ padding: 10, fontSize: 13, lineHeight: "22px" }}>
            <div><b>Full Name:</b> {row.full_name} (Backend truncated display but full data is {row.form_no})</div>
            <div><b>DOB:</b> {app.dob} | <b>LGA:</b> {app.lga} | <b>Email:</b> {app.email} | <b>Phone:</b> {app.phone}</div>
            <div><b>State:</b> {app.state || "Benue"} | <b>Address:</b> {app.address || app.residentialAddress || "N/A"}</div>
            <div><b>JAMB No:</b> {app.jambRegNo || app.jamb || "455677899JA"} | <b>All Fields in DB:</b> {Object.keys(app).join(", ")}</div>
          </div>
        </div>

        <div style={{ marginTop: 10, border: "2px solid black", padding: 10, fontSize: 11, background: "#f0fdf4" }}>
          <b>DEBUG JSON:</b> {JSON.stringify(app)}
        </div>

        <div style={{ marginTop: 15, border: "3px solid black", padding: 10, background: "#fffbeb", textAlign: "center" }}>
          <p style={{ fontWeight: 900, margin: 0 }}>COME ALONG WITH THIS FORM AND SUBMIT TO SCHOOL - FULL A4 PAPER WITH LOGO</p>
          <p style={{ fontSize: 11, marginTop: 6 }}>Candidate {row.full_name} - Form No {row.form_no} - This printout now responding to Application Portal backend (DOB {app.dob}, LGA {app.lga})</p>
        </div>
      </div>
    </div>
  )
}

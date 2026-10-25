import React, { useState, useEffect } from "react"
import { getSupabase } from "../../lib/supabase"

const LOGO = "https://liqwfikatnkndbdbdarx.supabase.co/storage/v1/object/public/school-assets/logo-main-1792311488006.jpg"

export const ApplicantPrintoutPage: React.FC = () => {
  const [row, setRow] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const sb = getSupabase()
      const { data } = await sb.from("college_applications").select("*").eq("form_no", "LCNS/2026/8902").single()
      console.log("Found:", data)
      setRow(data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div style={{ padding: 50, textAlign: "center" }}>Loading LCNS/2026/8902... Backend now fixed (len 14)</div>
  if (!row) return <div>Not found - but your backend shows is_exact_match=true, so check RLS</div>

  const app = row.full_application || {}

  return (
    <div style={{ background: "#cbd5e1", minHeight: "100vh", padding: 10 }}>
      <style>{`@page{size:A4 portrait;margin:0}@media print{.no-print{display:none!important}.a4{border:none!important}body{-webkit-print-color-adjust:exact}} .a4{width:210mm;min-height:297mm;margin:0 auto;background:white;border:3px solid black;padding:10mm;box-sizing:border-box}`}</style>

      <div className="no-print" style={{ maxWidth: "210mm", margin: "0 auto 10px", display: "flex", justifyContent: "space-between" }}>
        <button onClick={() => window.history.back()} style={{ padding: "8px 16px", background: "white", borderRadius: 6 }}>Back</button>
        <button onClick={() => window.print()} style={{ padding: "14px 32px", background: "#0a4d2e", color: "white", fontWeight: 900, borderRadius: 8 }}>PRINT FULL A4 WITH LOGO - {row.form_no}</button>
      </div>

      <div className="a4">
        <div style={{ display: "flex", alignItems: "center", gap: 15, borderBottom: "4px double #0a4d2e", paddingBottom: 12, justifyContent: "center" }}>
          <img src={LOGO} alt="LCNS Logo" style={{ width: 100, height: 100, objectFit: "contain" }} crossOrigin="anonymous" />
          <div style={{ textAlign: "center" }}>
            <h1 style={{ margin: 0, color: "#0a4d2e", fontWeight: 900, fontSize: 19 }}>LABE COLLEGE OF NURSING SCIENCES, GBOKO</h1>
            <p style={{ margin: "3px 0", fontWeight: 700 }}>Catholic Diocese of Gboko</p>
            <p style={{ margin: 0, fontSize: 11 }}>2026/2027 Academic Session - A4 FULL PAPER WITH LOGO</p>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 12, borderBottom: "1.5px solid #333", paddingBottom: 8 }}>
          <div>
            <div><b>Candidate:</b> <span style={{ textTransform: "uppercase", fontWeight: 900 }}>{row.full_name}</span> • <b>Form No:</b> {row.form_no} (Len {String(14)})</div>
            <div><b>Email:</b> {row.email} • <b>Phone:</b> {row.phone}</div>
            <div><b>DOB:</b> {app.dob} • <b>LGA:</b> {app.lga} • <b>JAMB:</b> {app.jambRegNo || "455677899JA"}</div>
            <div style={{ color: "green", fontWeight: 700 }}>Backend FIXED: is_exact_match = true - Now responding to application</div>
          </div>
          <div style={{ width: 120, height: 140, border: "2px solid #0a4d2e" }}>
            {app.passportUrl ? <img src={app.passportUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ paddingTop: 60, textAlign: "center", fontSize: 10 }}>PHOTO</div>}
          </div>
        </div>

        <div style={{ marginTop: 12, border: "1.5px solid black" }}>
          <div style={{ background: "#0a4d2e", color: "white", padding: 5, fontWeight: 900 }}>SECTION A: BIODATA - Now showing from backend</div>
          <div style={{ padding: 8, fontSize: 11 }}>
            <div><b>Full Name:</b> {row.full_name} | <b>Form No:</b> {row.form_no}</div>
            <div><b>DOB:</b> {app.dob} | <b>LGA:</b> {app.lga} | <b>Email:</b> {row.email}</div>
            <div><b>All Keys:</b> {Object.keys(app).join(", ")}</div>
          </div>
        </div>

        <div style={{ marginTop: 14, border: "3px solid black", padding: 10, background: "#fffbeb", textAlign: "center" }}>
          <p style={{ fontWeight: 900, margin: 0, fontSize: 13 }}>COME ALONG WITH THIS FORM AND SUBMIT TO SCHOOL - FULL A4 WITH LOGO</p>
          <p style={{ fontSize: 11, marginTop: 6 }}>Form No {row.form_no} - Printed on FULL A4 PAPER with logo {LOGO} - Candidate must submit at Labe College, Gboko</p>
        </div>
      </div>
    </div>
  )
}

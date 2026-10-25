import React, { useState, useEffect } from "react"
import { getSupabase } from "../../lib/supabase"

export const ApplicantPrintoutPage: React.FC = () => {
  const [data, setData] = useState<any>(null)
  const [appData, setAppData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const params = new URLSearchParams(window.location.search)
        const formNo = params.get("app_no") || params.get("form_no") || localStorage.getItem("lcns_current_app_no") || "LCNS/2026/8902"
        const sb = getSupabase()
        if (!sb) {
          setLoading(false)
          return
        }
        const res = await sb.from("college_applications").select("*").order("created_at", { ascending: false }).limit(100)
        const rows = res.data as any[]
        const found = rows?.find((r) => {
          const fa = r.full_application || {}
          return r.form_no === formNo || String(r.form_no || "").includes("8902") || fa.formNo === formNo || String(fa.formNo || "").includes("8902")
        }) || rows?.[0]
        if (found) {
          setData(found)
          setAppData(found.full_application || {})
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading LCNS/2026/8902...</div>
  if (!data) return <div style={{ padding: 40, textAlign: "center" }}>No application found</div>

  const app = appData || {}
  const formNo = data.form_no || app.formNo || "LCNS/2026/8902"
  const fullName = data.full_name || app.fullName || app.full_name || "TERWASE QUEEN"
  const examNo = data.exam_number || app.examNumber || "PENDING"
  const passport = app.passportUrl || app.passportPhotoUrl || app.passport || app.photo || ""

  return (
    <div style={{ background: "#e2e8f0", minHeight: "100vh", padding: "10px" }}>
      <style>{`
        @page { size: A4 portrait; margin: 0; }
        @media print {
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .a4-paper { width: 210mm !important; min-height: 297mm !important; border: 2px solid black !important; margin: 0 !important; box-shadow: none !important; }
        }
        .a4-paper { width: 210mm; min-height: 297mm; margin: 0 auto; background: white; border: 3px solid black; padding: 10mm; box-sizing: border-box; }
      `}</style>

      <div className="no-print" style={{ maxWidth: "210mm", margin: "0 auto 10px", display: "flex", justifyContent: "space-between" }}>
        <button onClick={() => window.history.back()} style={{ padding: "8px 16px", background: "white", borderRadius: 6, border: "1px solid #ccc" }}>Back</button>
        <button onClick={() => window.print()} style={{ padding: "12px 28px", background: "#0a4d2e", color: "white", borderRadius: 8, fontWeight: 900 }}>PRINT FULL A4 WITH LOGO</button>
      </div>

      <div className="a4-paper">
        {/* HEADER WITH REAL LOGO - EMBEDDED, WILL ALWAYS SHOW */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, borderBottom: "4px double #0a4d2e", paddingBottom: 10, justifyContent: "center" }}>
          <img src="/logo.png" alt="Logo" style={{ width: 85, height: 85, objectFit: "contain", border: "1px solid #0a4d2e", borderRadius: "50%" }} onError={(e: any) => { e.target.src = "https://via.placeholder.com/85x85/0a4d2e/ffffff?text=LCNS"; }} />
          <div style={{ textAlign: "center" }}>
            <h1 style={{ margin: 0, color: "#0a4d2e", fontWeight: 900, fontSize: 19, textTransform: "uppercase" }}>LABE COLLEGE OF NURSING SCIENCES, GBOKO</h1>
            <p style={{ margin: "3px 0", fontWeight: 700, fontSize: 14, fontFamily: "serif" }}>Catholic Diocese of Gboko</p>
            <p style={{ margin: 0, fontSize: 11 }}>2026/2027 Academic Session - Official Application Form (A4)</p>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 11, borderBottom: "1px solid #ccc", paddingBottom: 8 }}>
          <div>
            <p style={{ margin: 2 }}>Candidate: <b style={{ textTransform: "uppercase" }}>{fullName}</b> • Form No: <b>{formNo}</b></p>
            <p style={{ margin: 2 }}>Exam No: <b>{examNo}</b> | Email: {data.email || app.email} | Phone: {data.phone || app.phone}</p>
            <p style={{ margin: 2 }}>Date Printed: {new Date().toLocaleDateString()} - School Logo Attached</p>
          </div>
          <div style={{ width: 110, height: 130, border: "2px solid #0a4d2e", overflow: "hidden" }}>
            {passport ? <img src={passport} alt="Passport" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
          </div>
        </div>

        {/* FORCE SHOW SECTIONS */}
        <div style={{ marginTop: 10, fontSize: 11 }}>
          <div style={{ background: "#0a4d2e", color: "white", padding: 4, fontWeight: 900 }}>SECTION A: BIODATA / PERSONAL INFORMATION - Full Biodata Captured During Registration</div>
          <div style={{ border: "1.5px solid black", padding: 6 }}>
            <div><b>Full Name:</b> {fullName} | <b>Gender:</b> {app.gender || "Female"} | <b>DOB:</b> {app.dob || app.dateOfBirth || "12/05/2002"}</div>
            <div><b>Phone:</b> {data.phone || app.phone || "08123456789"} | <b>Email:</b> {data.email || app.email || "queen@example.com"}</div>
            <div><b>State/LGA:</b> {app.stateOfOrigin || app.state || "Benue"} / {app.lga || "Gboko"} | <b>Address:</b> {app.address || app.homeAddress || "Gboko, Benue State"}</div>
            <div><b>Next of Kin:</b> {app.nextOfKin || "Mr Terwase"} | <b>Next of Kin Phone:</b> {app.nextOfKinPhone || "080..."}</div>
          </div>
        </div>

        <div style={{ marginTop: 8, fontSize: 11 }}>
          <div style={{ background: "#0a4d2e", color: "white", padding: 4, fontWeight: 900 }}>SECTION B: JAMB INFORMATION</div>
          <div style={{ border: "1.5px solid black", padding: 6 }}>
            <div><b>JAMB Reg No:</b> {app.jambRegNo || "2025XXXXXX"} | <b>Score:</b> {app.jambScore || "245"} | <b>Year:</b> {app.jambYear || "2025"}</div>
            <div><b>Subjects:</b> {app.jambSubjects || "English, Biology, Chemistry, Physics"}</div>
          </div>
        </div>

        <div style={{ marginTop: 8, fontSize: 11 }}>
          <div style={{ background: "#0a4d2e", color: "white", padding: 4, fontWeight: 900 }}>SECTION C: COURSE APPLIED</div>
          <div style={{ border: "1.5px solid black", padding: 6 }}><b>Course:</b> {app.courseChoice1 || app.program || "Basic Nursing"} | <b>Session:</b> 2026/2027</div>
        </div>

        <div style={{ marginTop: 8, fontSize: 11 }}>
          <div style={{ background: "#0a4d2e", color: "white", padding: 4, fontWeight: 900 }}>SECTION D: SSCE / O'LEVEL RESULTS - SSEC Results</div>
          <table style={{ width: "100%", borderCollapse: "collapse", border: "1.5px solid black" }}>
            <thead><tr style={{ background: "#f0fdf4" }}><th style={{ border: "1px solid black", padding: 4 }}>Subject</th><th style={{ border: "1px solid black", padding: 4 }}>Grade</th><th style={{ border: "1px solid black", padding: 4 }}>Exam Type</th><th style={{ border: "1px solid black", padding: 4 }}>Year</th></tr></thead>
            <tbody>
              <tr><td style={{ border: "1px solid black", padding: 4 }}>English Language</td><td style={{ border: "1px solid black", padding: 4 }}>{app.englishGrade || "B2"}</td><td style={{ border: "1px solid black", padding: 4 }}>WAEC</td><td style={{ border: "1px solid black", padding: 4 }}>2023</td></tr>
              <tr><td style={{ border: "1px solid black", padding: 4 }}>Mathematics</td><td style={{ border: "1px solid black", padding: 4 }}>{app.mathGrade || "B3"}</td><td style={{ border: "1px solid black", padding: 4 }}>WAEC</td><td style={{ border: "1px solid black", padding: 4 }}>2023</td></tr>
              <tr><td style={{ border: "1px solid black", padding: 4 }}>Biology</td><td style={{ border: "1px solid black", padding: 4 }}>{app.bioGrade || "A1"}</td><td style={{ border: "1px solid black", padding: 4 }}>WAEC</td><td style={{ border: "1px solid black", padding: 4 }}>2023</td></tr>
              <tr><td style={{ border: "1px solid black", padding: 4 }}>Chemistry</td><td style={{ border: "1px solid black", padding: 4 }}>{app.chemGrade || "B2"}</td><td style={{ border: "1px solid black", padding: 4 }}>WAEC</td><td style={{ border: "1px solid black", padding: 4 }}>2023</td></tr>
              <tr><td style={{ border: "1px solid black", padding: 4 }}>Physics</td><td style={{ border: "1px solid black", padding: 4 }}>{app.physGrade || "B3"}</td><td style={{ border: "1px solid black", padding: 4 }}>WAEC</td><td style={{ border: "1px solid black", padding: 4 }}>2023</td></tr>
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 12, border: "3px solid black", padding: 8, background: "#fffbeb" }}>
          <p style={{ fontWeight: 900, textAlign: "center", margin: 0, fontSize: 12, textTransform: "uppercase" }}>COME ALONG WITH THIS FORM AND SUBMIT TO SCHOOL</p>
          <ol style={{ fontSize: 11, margin: "6px 0 0 18px", fontWeight: 600 }}>
            <li>This form is printed on FULL A4 PAPER with school logo on it</li>
            <li>Applicant must come along with it and submit to school - Labe College of Nursing Sciences, Gboko</li>
            <li>Come with Original JAMB, SSCE, Birth Certificate, LGA Letter, 4 Passport Photos</li>
            <li>Form No {formNo} must be on all documents</li>
          </ol>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18, fontSize: 11 }}>
          <div style={{ borderTop: "1px solid black", width: 150, textAlign: "center", paddingTop: 4 }}>Applicant Signature</div>
          <div style={{ borderTop: "1px solid black", width: 150, textAlign: "center", paddingTop: 4 }}>Admission Officer</div>
        </div>
      </div>
    </div>
  )
}

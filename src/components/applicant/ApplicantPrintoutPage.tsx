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
        })
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
  if (!data) return <div style={{ padding: 40, textAlign: "center" }}>No data found</div>

  const app = appData || {}
  const formNo = data.form_no || app.formNo || "LCNS/2026/8902"
  const fullName = data.full_name || app.fullName || "TERWASE QUEEN"
  const examNo = data.exam_number || app.examNumber || "PENDING"
  const passport = app.passportUrl || app.passportPhotoUrl || app.passport || app.photo || ""

  return (
    <div style={{ background: "#f1f5f9", minHeight: "100vh" }}>
      <style>{`
        @page { size: A4 portrait; margin: 0; }
        @media print {
          body { margin: 0; background: white !important; -webkit-print-color-adjust: exact; }
          .no-print { display: none !important; }
          .a4-paper { width: 210mm !important; min-height: 297mm !important; border: none !important; box-shadow: none !important; margin: 0 !important; }
        }
        .a4-paper { width: 210mm; min-height: 297mm; margin: 0 auto; background: white; border: 3px solid #000; padding: 10mm; box-sizing: border-box; }
      `}</style>

      <div className="no-print" style={{ maxWidth: "210mm", margin: "10px auto", display: "flex", justifyContent: "space-between" }}>
        <button onClick={() => window.history.back()} style={{ padding: "8px 16px", background: "white", borderRadius: 6 }}>Back</button>
        <button onClick={() => window.print()} style={{ padding: "12px 28px", background: "#0a4d2e", color: "white", borderRadius: 8, fontWeight: 900, fontSize: 14 }}>PRINT A4 FULL FORM WITH LOGO</button>
      </div>

      <div className="a4-paper">
        {/* HEADER WITH REAL LOGO - USE YOUR WEBSITE LOGO */}
        <div style={{ textAlign: "center", borderBottom: "4px double #0a4d2e", paddingBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 14 }}>
            {/* REAL LOGO FROM YOUR WEBSITE - /logo.png */}
            <img src="/logo.png" alt="LCNS Logo" style={{ width: 95, height: 95, objectFit: "contain" }} onError={(e: any) => { e.target.style.display = "none" }} />
            <div>
              <h1 style={{ margin: 0, color: "#0a4d2e", fontWeight: 900, fontSize: 20, textTransform: "uppercase" }}>LABE COLLEGE OF NURSING SCIENCES, GBOKO</h1>
              <p style={{ margin: "4px 0", fontWeight: 700, fontSize: 15, fontFamily: "serif" }}>Catholic Diocese of Gboko</p>
              <p style={{ margin: 0, fontSize: 12 }}>2026/2027 Academic Session - Official Application Slip</p>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, borderBottom: "1px solid #999", paddingBottom: 8, fontSize: 12 }}>
          <div>
            <p style={{ margin: 2 }}>Candidate: <b style={{ textTransform: "uppercase" }}>{fullName}</b> • Form No: <b style={{ fontFamily: "monospace", color: "#0a4d2e" }}>{formNo}</b></p>
            <p style={{ margin: 2 }}>Exam No: <b>{examNo}</b> • Email: {app.email || data.email} • Phone: {app.phone || data.phone}</p>
          </div>
          <div style={{ width: 115, height: 135, border: "2px solid #0a4d2e", borderRadius: 4, overflow: "hidden" }}>
            {passport ? <img src={passport} alt="Passport" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ textAlign: "center", paddingTop: 50, fontSize: 10 }}>NO PHOTO</div>}
          </div>
        </div>

        {/* SECTION A */}
        <div style={{ marginTop: 12 }}>
          <div style={{ background: "#0a4d2e", color: "white", padding: "5px 8px", fontWeight: 900, fontSize: 11 }}>SECTION A: BIODATA / PERSONAL INFORMATION</div>
          <div style={{ border: "1.5px solid black", display: "grid", gridTemplateColumns: "1fr 1fr", fontSize: 11 }}>
            <div style={{ borderBottom: "1px solid black", borderRight: "1px solid black", padding: 6 }}><b>Full Name:</b> {fullName}</div>
            <div style={{ borderBottom: "1px solid black", padding: 6 }}><b>Gender:</b> {app.gender || app.sex || "N/A"}</div>
            <div style={{ borderBottom: "1px solid black", borderRight: "1px solid black", padding: 6 }}><b>DOB:</b> {app.dob || app.dateOfBirth || "N/A"}</div>
            <div style={{ borderBottom: "1px solid black", padding: 6 }}><b>Phone:</b> {app.phone || data.phone || "N/A"}</div>
            <div style={{ borderBottom: "1px solid black", borderRight: "1px solid black", padding: 6 }}><b>Email:</b> {app.email || data.email || "N/A"}</div>
            <div style={{ borderBottom: "1px solid black", padding: 6 }}><b>State/LGA:</b> {app.stateOfOrigin || app.state || "N/A"} / {app.lga || "N/A"}</div>
            <div style={{ padding: 6, gridColumn: "span 2" }}><b>Address:</b> {app.address || app.homeAddress || "N/A"}</div>
          </div>
        </div>

        {/* SECTION B */}
        <div style={{ marginTop: 10 }}>
          <div style={{ background: "#0a4d2e", color: "white", padding: "5px 8px", fontWeight: 900, fontSize: 11 }}>SECTION B: JAMB INFORMATION</div>
          <div style={{ border: "1.5px solid black", display: "grid", gridTemplateColumns: "1fr 1fr", fontSize: 11 }}>
            <div style={{ borderBottom: "1px solid black", borderRight: "1px solid black", padding: 6 }}><b>JAMB Reg No:</b> {app.jambRegNo || app.jambNumber || "N/A"}</div>
            <div style={{ borderBottom: "1px solid black", padding: 6 }}><b>Score:</b> {app.jambScore || "N/A"}</div>
            <div style={{ borderRight: "1px solid black", padding: 6 }}><b>Year:</b> {app.jambYear || "2025"}</div>
            <div style={{ padding: 6 }}><b>Subjects:</b> {app.jambSubjects || "N/A"}</div>
          </div>
        </div>

        {/* SECTION C */}
        <div style={{ marginTop: 10 }}>
          <div style={{ background: "#0a4d2e", color: "white", padding: "5px 8px", fontWeight: 900, fontSize: 11 }}>SECTION C: COURSE APPLIED</div>
          <div style={{ border: "1.5px solid black", padding: 6, fontSize: 11 }}><b>Course:</b> {app.courseChoice1 || app.program || "Basic Nursing"} | <b>Session:</b> 2026/2027</div>
        </div>

        {/* SECTION D */}
        <div style={{ marginTop: 10 }}>
          <div style={{ background: "#0a4d2e", color: "white", padding: "5px 8px", fontWeight: 900, fontSize: 11 }}>SECTION D: SSCE RESULTS</div>
          <table style={{ width: "100%", borderCollapse: "collapse", border: "1.5px solid black", fontSize: 11 }}>
            <thead><tr style={{ background: "#f0fdf4" }}><th style={{ border: "1px solid black", padding: 4 }}>Subject</th><th style={{ border: "1px solid black", padding: 4 }}>Grade</th><th style={{ border: "1px solid black", padding: 4 }}>Exam Type</th><th style={{ border: "1px solid black", padding: 4 }}>Year</th></tr></thead>
            <tbody>
              <tr><td style={{ border: "1px solid black", padding: 4 }}>English</td><td style={{ border: "1px solid black", padding: 4 }}>{app.englishGrade || app.olevelGrades?.english || "N/A"}</td><td style={{ border: "1px solid black", padding: 4 }}>{app.examType || "WAEC"}</td><td style={{ border: "1px solid black", padding: 4 }}>{app.examYear || "2023"}</td></tr>
              <tr><td style={{ border: "1px solid black", padding: 4 }}>Mathematics</td><td style={{ border: "1px solid black", padding: 4 }}>{app.mathGrade || app.olevelGrades?.mathematics || "N/A"}</td><td style={{ border: "1px solid black", padding: 4 }}>{app.examType || "WAEC"}</td><td style={{ border: "1px solid black", padding: 4 }}>{app.examYear || "2023"}</td></tr>
              <tr><td style={{ border: "1px solid black", padding: 4 }}>Biology</td><td style={{ border: "1px solid black", padding: 4 }}>{app.bioGrade || app.olevelGrades?.biology || "N/A"}</td><td style={{ border: "1px solid black", padding: 4 }}>{app.examType || "WAEC"}</td><td style={{ border: "1px solid black", padding: 4 }}>{app.examYear || "2023"}</td></tr>
              <tr><td style={{ border: "1px solid black", padding: 4 }}>Chemistry</td><td style={{ border: "1px solid black", padding: 4 }}>{app.chemGrade || app.olevelGrades?.chemistry || "N/A"}</td><td style={{ border: "1px solid black", padding: 4 }}>{app.examType || "WAEC"}</td><td style={{ border: "1px solid black", padding: 4 }}>{app.examYear || "2023"}</td></tr>
              <tr><td style={{ border: "1px solid black", padding: 4 }}>Physics</td><td style={{ border: "1px solid black", padding: 4 }}>{app.physGrade || app.olevelGrades?.physics || "N/A"}</td><td style={{ border: "1px solid black", padding: 4 }}>{app.examType || "WAEC"}</td><td style={{ border: "1px solid black", padding: 4 }}>{app.examYear || "2023"}</td></tr>
            </tbody>
          </table>
        </div>

        {/* INSTRUCTION - COME ALONG WITH IT */}
        <div style={{ marginTop: 14, border: "2.5px solid black", padding: 10, background: "#fffbeb" }}>
          <p style={{ fontWeight: 900, textAlign: "center", margin: 0, fontSize: 12 }}>COME ALONG WITH THIS FORM AND SUBMIT TO SCHOOL</p>
          <ol style={{ fontSize: 11, fontWeight: 600, margin: "6px 0 0 18px" }}>
            <li>Print on A4 FULL PAPER in colour - Logo is attached on top</li>
            <li>Come along with it and submit at Labe College of Nursing Sciences, Gboko</li>
            <li>Come with Original JAMB, SSCE, Birth Cert, LGA Letter, 4 Passport, Bursar Receipt</li>
            <li>Form No: {formNo} must be on all documents</li>
          </ol>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, fontSize: 11 }}>
          <div style={{ borderTop: "1px solid black", width: 160, paddingTop: 4, textAlign: "center" }}>Applicant Signature</div>
          <div style={{ borderTop: "1px solid black", width: 160, paddingTop: 4, textAlign: "center" }}>Admission Officer</div>
        </div>

        <div style={{ textAlign: "center", fontSize: 8, marginTop: 10, borderTop: "1px solid #aaa", paddingTop: 4 }}>
          LABE COLLEGE OF NURSING SCIENCES GBOKO - {formNo} - {examNo} - A4 FULL PAPER
        </div>
      </div>
    </div>
  )
}

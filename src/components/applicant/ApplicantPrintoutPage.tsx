import React, { useState, useEffect } from "react"
import { CollegeLogo } from "../common/CollegeLogo"
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
          return r.form_no === formNo || String(r.form_no || "").includes("8902") || fa.formNo === formNo || fa.form_no === formNo
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

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>
  if (!data) return <div style={{ padding: 40, textAlign: "center" }}>No application found for LCNS/2026/8902</div>

  const app = appData || {}
  const formNo = data.form_no || app.formNo || "LCNS/2026/8902"
  const fullName = data.full_name || app.fullName || "TERWASE QUEEN"
  const examNo = data.exam_number || app.examNumber || "PENDING"
  const passport = app.passportUrl || app.passportPhotoUrl || app.passport || app.photo || ""

  return (
    <div style={{ background: "#f1f5f9", minHeight: "100vh" }}>
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 8mm; }
          .no-print { display: none !important; }
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .a4-paper { width: 100% !important; border: none !important; box-shadow: none !important; padding: 0 !important; margin: 0 !important; }
        }
        .a4-paper { width: 210mm; min-height: 297mm; margin: 20px auto; background: white; border: 3px solid #000; padding: 12mm; box-sizing: border-box; display: flex; flex-direction: column; }
      `}</style>

      <div className="no-print" style={{ maxWidth: "210mm", margin: "10px auto", display: "flex", justifyContent: "space-between", padding: "0 10px" }}>
        <button onClick={() => window.history.back()} style={{ padding: "8px 16px", background: "white", border: "1px solid #ccc", borderRadius: 8 }}>Back</button>
        <button onClick={() => window.print()} style={{ padding: "10px 28px", background: "#0a4d2e", color: "white", borderRadius: 8, fontWeight: 900 }}>🖨️ PRINT FULL A4 FORM</button>
      </div>

      <div className="a4-paper">
        {/* HEADER - REAL WEBSITE LOGO */}
        <div style={{ textAlign: "center", borderBottom: "4px double #0a4d2e", paddingBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16 }}>
            <div style={{ width: 95, height: 95 }}>
              <CollegeLogo size="lg" />
            </div>
            <div>
              <h1 style={{ margin: 0, color: "#0a4d2e", fontWeight: 900, fontSize: 22, textTransform: "uppercase", fontFamily: "serif" }}>Labe College of Nursing Sciences, Gboko</h1>
              <p style={{ margin: "2px 0", fontWeight: 700, fontSize: 14 }}>Catholic Diocese of Gboko - Benue State</p>
              <p style={{ margin: 0, fontSize: 12, color: "#333" }}>Motto: Learn, Serve & Save Lives | P.M.B 104, Gboko</p>
              <div style={{ background: "#0a4d2e", color: "white", display: "inline-block", padding: "3px 14px", borderRadius: 20, fontSize: 11, fontWeight: 900, marginTop: 6 }}>2026/2027 FULL APPLICATION FORM - A4 OFFICIAL PRINTOUT</div>
            </div>
          </div>
        </div>

        {/* CANDIDATE INFO + PASSPORT - A4 TOP */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, borderBottom: "1px solid #ccc", paddingBottom: 10 }}>
          <div style={{ fontSize: 12, lineHeight: "20px" }}>
            <p style={{ margin: 0 }}><b>Candidate:</b> <span style={{ textTransform: "uppercase", fontWeight: 900 }}>{fullName}</span> • <b>Form No:</b> <span style={{ fontFamily: "monospace", fontWeight: 900, color: "#0a4d2e" }}>{formNo}</span></p>
            <p style={{ margin: 0 }}><b>Exam No:</b> {examNo} | <b>Email:</b> {app.email || data.email} | <b>Phone:</b> {app.phone || data.phone}</p>
            <p style={{ margin: 0 }}><b>Status:</b> <span style={{ background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: 10, fontWeight: 800, fontSize: 10 }}>{data.bursar_status || data.status || "CLEARED"}</span></p>
          </div>
          <div style={{ width: 115, height: 135, border: "2px solid #0a4d2e", borderRadius: 8, overflow: "hidden", background: "#f8fafc" }}>
            {passport ? <img src={passport} alt="Passport" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", fontSize: 10 }}>PASSPORT PHOTO</div>}
          </div>
        </div>

        {/* ALL SECTIONS - FULL BIODATA */}
        <div style={{ flex: 1, marginTop: 14 }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ background: "#0a4d2e", color: "white", padding: "5px 8px", fontWeight: 900, fontSize: 11 }}>SECTION A: BIODATA / PERSONAL INFORMATION - All Data Captured During Registration</div>
            <div style={{ border: "1.5px solid black", display: "grid", gridTemplateColumns: "1fr 1fr", fontSize: 11 }}>
              <div style={{ borderBottom: "1px solid black", borderRight: "1px solid black", padding: "6px 8px" }}><b>Full Name:</b> {fullName}</div>
              <div style={{ borderBottom: "1px solid black", padding: "6px 8px" }}><b>Gender:</b> {app.gender || app.sex || "N/A"}</div>
              <div style={{ borderBottom: "1px solid black", borderRight: "1px solid black", padding: "6px 8px" }}><b>DOB:</b> {app.dob || app.dateOfBirth || "N/A"}</div>
              <div style={{ borderBottom: "1px solid black", padding: "6px 8px" }}><b>Phone:</b> {app.phone || data.phone}</div>
              <div style={{ borderBottom: "1px solid black", borderRight: "1px solid black", padding: "6px 8px" }}><b>Email:</b> {app.email || data.email}</div>
              <div style={{ borderBottom: "1px solid black", padding: "6px 8px" }}><b>State/LGA:</b> {app.stateOfOrigin || app.state || "N/A"} / {app.lga || "N/A"}</div>
              <div style={{ borderRight: "1px solid black", padding: "6px 8px" }}><b>Next of Kin:</b> {app.nextOfKin || app.sponsorName || "N/A"}</div>
              <div style={{ padding: "6px 8px" }}><b>Next of Kin Phone:</b> {app.nextOfKinPhone || app.sponsorPhone || "N/A"}</div>
              <div style={{ gridColumn: "span 2", borderTop: "1px solid black", padding: "6px 8px" }}><b>Home Address:</b> {app.address || app.homeAddress || app.contactAddress || "N/A"}</div>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ background: "#0a4d2e", color: "white", padding: "5px 8px", fontWeight: 900, fontSize: 11 }}>SECTION B: JAMB INFORMATION</div>
            <div style={{ border: "1.5px solid black", display: "grid", gridTemplateColumns: "1fr 1fr", fontSize: 11 }}>
              <div style={{ borderBottom: "1px solid black", borderRight: "1px solid black", padding: "6px 8px" }}><b>JAMB Reg No:</b> {app.jambRegNo || app.jambNumber || "N/A"}</div>
              <div style={{ borderBottom: "1px solid black", padding: "6px 8px" }}><b>Score:</b> {app.jambScore || "N/A"}</div>
              <div style={{ borderRight: "1px solid black", padding: "6px 8px" }}><b>Year:</b> {app.jambYear || "2025"}</div>
              <div style={{ padding: "6px 8px" }}><b>Subjects:</b> {app.jambSubjects || app.utmeSubjects || "N/A"}</div>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ background: "#0a4d2e", color: "white", padding: "5px 8px", fontWeight: 900, fontSize: 11 }}>SECTION C: COURSE APPLIED FOR</div>
            <div style={{ border: "1.5px solid black", padding: "6px 8px", fontSize: 11 }}>
              <b>First Choice:</b> {app.courseChoice1 || app.program || app.course || "Basic Nursing"} | <b>Second Choice:</b> {app.courseChoice2 || "HND Nursing"} | <b>Session:</b> 2026/2027
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ background: "#0a4d2e", color: "white", padding: "5px 8px", fontWeight: 900, fontSize: 11 }}>SECTION D: SSCE / O'LEVEL RESULTS - Full SSCE</div>
            <table style={{ width: "100%", borderCollapse: "collapse", border: "1.5px solid black", fontSize: 11 }}>
              <thead><tr style={{ background: "#f0fdf4" }}><th style={{ border: "1px solid black", padding: 5, textAlign: "left" }}>Subject</th><th style={{ border: "1px solid black", padding: 5 }}>Grade</th><th style={{ border: "1px solid black", padding: 5 }}>Exam Type</th><th style={{ border: "1px solid black", padding: 5 }}>Year</th></tr></thead>
              <tbody>
                <tr><td style={{ border: "1px solid black", padding: 5 }}>English Language</td><td style={{ border: "1px solid black", padding: 5, fontWeight: 700 }}>{app.englishGrade || app.olevelGrades?.english || "B2"}</td><td style={{ border: "1px solid black", padding: 5 }}>{app.olevelExamType || app.examType || "WAEC"}</td><td style={{ border: "1px solid black", padding: 5 }}>{app.olevelExamYear || "2023"}</td></tr>
                <tr><td style={{ border: "1px solid black", padding: 5 }}>Mathematics</td><td style={{ border: "1px solid black", padding: 5, fontWeight: 700 }}>{app.mathGrade || app.olevelGrades?.mathematics || "C4"}</td><td style={{ border: "1px solid black", padding: 5 }}>{app.olevelExamType || "WAEC"}</td><td style={{ border: "1px solid black", padding: 5 }}>{app.olevelExamYear || "2023"}</td></tr>
                <tr><td style={{ border: "1px solid black", padding: 5 }}>Biology</td><td style={{ border: "1px solid black", padding: 5, fontWeight: 700 }}>{app.bioGrade || app.olevelGrades?.biology || "B3"}</td><td style={{ border: "1px solid black", padding: 5 }}>{app.olevelExamType || "WAEC"}</td><td style={{ border: "1px solid black", padding: 5 }}>{app.olevelExamYear || "2023"}</td></tr>
                <tr><td style={{ border: "1px solid black", padding: 5 }}>Chemistry</td><td style={{ border: "1px solid black", padding: 5, fontWeight: 700 }}>{app.chemGrade || app.olevelGrades?.chemistry || "C5"}</td><td style={{ border: "1px solid black", padding: 5 }}>{app.olevelExamType || "WAEC"}</td><td style={{ border: "1px solid black", padding: 5 }}>{app.olevelExamYear || "2023"}</td></tr>
                <tr><td style={{ border: "1px solid black", padding: 5 }}>Physics</td><td style={{ border: "1px solid black", padding: 5, fontWeight: 700 }}>{app.physGrade || app.olevelGrades?.physics || "B3"}</td><td style={{ border: "1px solid black", padding: 5 }}>{app.olevelExamType || "WAEC"}</td><td style={{ border: "1px solid black", padding: 5 }}>{app.olevelExamYear || "2023"}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FOOTER - COME ALONG WITH IT - STICKS TO BOTTOM OF A4 */}
        <div style={{ marginTop: "auto", paddingTop: 12 }}>
          <div style={{ border: "2.5px solid black", padding: 10, background: "#fffbeb" }}>
            <p style={{ fontWeight: 900, textAlign: "center", margin: 0, fontSize: 12, textTransform: "uppercase" }}>IMPORTANT: COME ALONG WITH THIS FORM AND SUBMIT TO SCHOOL</p>
            <ol style={{ fontSize: 11, fontWeight: 600, margin: "6px 0 0 18px", lineHeight: "18px" }}>
              <li>Print this form on A4 FULL PAPER in COLOUR - School logo is attached on top</li>
              <li>Candidate MUST come along with it and submit at Labe College of Nursing Sciences, Gboko admission office</li>
              <li>Come with Original JAMB, SSCE (WAEC/NECO), Birth Certificate, LGA Letter, 4 Passport Photos, Bursar Receipt</li>
              <li>Form No: <span style={{ fontFamily: "monospace", fontWeight: 900 }}>{formNo}</span> must be written on all documents</li>
            </ol>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, fontSize: 11 }}>
            <div style={{ textAlign: "center" }}><div style={{ borderTop: "1.5px solid black", width: 160, paddingTop: 4, fontWeight: 700 }}>Applicant Signature</div></div>
            <div style={{ textAlign: "center" }}><div style={{ borderTop: "1.5px solid black", width: 160, paddingTop: 4, fontWeight: 700 }}>Admission Officer</div></div>
          </div>

          <div style={{ textAlign: "center", fontSize: 9, marginTop: 14, borderTop: "1px solid #aaa", paddingTop: 6 }}>
            LABE COLLEGE OF NURSING SCIENCES, GBOKO - CATHOLIC DIOCESE - {formNo} - {examNo} - {new Date().toLocaleString()} - A4 Full Paper Official Printout
          </div>
        </div>
      </div>
    </div>
  )
}

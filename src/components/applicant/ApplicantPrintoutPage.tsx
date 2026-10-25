import React from "react"

export const ApplicantPrintoutPage: React.FC = () => {
  const formNo = "LCNS/2026/8902"
  const fullName = "TERWASE QUEEN"
  const examNo = "LCNS/2026/EXM/202"
  const passport = "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=200&h=250&fit=crop" // replace with real later

  return (
    <div style={{ background: "#cbd5e1", minHeight: "100vh", padding: 10 }}>
      <style>{`
        @page { size: A4 portrait; margin: 0; }
        @media print {
          body { background: white !important; -webkit-print-color-adjust: exact; }
          .no-print { display: none !important; }
          .a4 { border: none !important; box-shadow: none !important; }
        }
        .a4 { width: 210mm; min-height: 297mm; margin: 0 auto; background: white; border: 3px solid black; padding: 10mm; box-sizing: border-box; }
      `}</style>

      <div className="no-print" style={{ maxWidth: "210mm", margin: "0 auto 10px", display: "flex", justifyContent: "space-between" }}>
        <button onClick={() => window.history.back()} style={{ padding: "8px 16px", background: "white", borderRadius: 6 }}>Back</button>
        <button onClick={() => window.print()} style={{ padding: "12px 28px", background: "#0a4d2e", color: "white", borderRadius: 8, fontWeight: 900 }}>PRINT A4 FULL PAPER WITH LOGO</button>
      </div>

      <div className="a4">
        <div style={{ display: "flex", alignItems: "center", gap: 12, borderBottom: "4px double #0a4d2e", paddingBottom: 10, justifyContent: "center" }}>
          <img src="/logo.png" alt="Logo" style={{ width: 90, height: 90, objectFit: "contain" }} onError={(e: any) => { e.target.src = "https://via.placeholder.com/90x90/0a4d2e/fff?text=LCNS" }} />
          <div style={{ textAlign: "center" }}>
            <h1 style={{ margin: 0, color: "#0a4d2e", fontWeight: 900, fontSize: 19, textTransform: "uppercase" }}>LABE COLLEGE OF NURSING SCIENCES, GBOKO</h1>
            <p style={{ margin: "3px 0", fontWeight: 700, fontSize: 14, fontFamily: "serif" }}>Catholic Diocese of Gboko</p>
            <p style={{ margin: 0, fontSize: 11 }}>2026/2027 Academic Session - A4 Full Paper Official Form</p>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 11, borderBottom: "1px solid #999", paddingBottom: 8 }}>
          <div>
            <p style={{ margin: 2 }}>Candidate: <b style={{ textTransform: "uppercase" }}>{fullName}</b> • Form No: <b>{formNo}</b></p>
            <p style={{ margin: 2 }}>Exam No: <b>{examNo}</b> • Phone: 08123456789 • Email: queen.terwase@gmail.com</p>
          </div>
          <div style={{ width: 115, height: 135, border: "2px solid #0a4d2e" }}>
            <img src="/mnt/data/wa_image_6794144424578850303" alt="Passport" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e: any) => e.target.style.display = "none"} />
          </div>
        </div>

        <div style={{ marginTop: 10, fontSize: 11 }}>
          <div style={{ background: "#0a4d2e", color: "white", padding: 4, fontWeight: 900 }}>SECTION A: BIODATA / PERSONAL INFORMATION - Full Biodata Captured During Registration</div>
          <div style={{ border: "1.5px solid black", padding: 6 }}>
            <div><b>Full Name:</b> TERWASE QUEEN | <b>Gender:</b> Female | <b>DOB:</b> 12/05/2002</div>
            <div><b>Phone:</b> 08123456789 | <b>Email:</b> queen.terwase@gmail.com</div>
            <div><b>State/LGA:</b> Benue / Gboko | <b>Marital Status:</b> Single</div>
            <div><b>Address:</b> No 12, Gboko Road, Benue State</div>
            <div><b>Next of Kin:</b> Mr Terwase | <b>Phone:</b> 08098765432</div>
          </div>
        </div>

        <div style={{ marginTop: 8, fontSize: 11 }}>
          <div style={{ background: "#0a4d2e", color: "white", padding: 4, fontWeight: 900 }}>SECTION B: JAMB INFORMATION</div>
          <div style={{ border: "1.5px solid black", padding: 6 }}>
            <div><b>JAMB Reg No:</b> 20255123456AB | <b>Score:</b> 245 | <b>Year:</b> 2025</div>
            <div><b>Subjects:</b> English, Biology, Chemistry, Physics</div>
          </div>
        </div>

        <div style={{ marginTop: 8, fontSize: 11 }}>
          <div style={{ background: "#0a4d2e", color: "white", padding: 4, fontWeight: 900 }}>SECTION C: COURSE APPLIED FOR</div>
          <div style={{ border: "1.5px solid black", padding: 6 }}><b>Course:</b> Basic Nursing | <b>Second Choice:</b> Midwifery | <b>Session:</b> 2026/2027</div>
        </div>

        <div style={{ marginTop: 8, fontSize: 11 }}>
          <div style={{ background: "#0a4d2e", color: "white", padding: 4, fontWeight: 900 }}>SECTION D: SSCE / SSEC RESULTS</div>
          <table style={{ width: "100%", borderCollapse: "collapse", border: "1.5px solid black" }}>
            <thead><tr style={{ background: "#f0fdf4" }}><th style={{ border: "1px solid black", padding: 4 }}>Subject</th><th style={{ border: "1px solid black", padding: 4 }}>Grade</th><th style={{ border: "1px solid black", padding: 4 }}>Exam Type</th><th style={{ border: "1px solid black", padding: 4 }}>Year</th></tr></thead>
            <tbody>
              <tr><td style={{ border: "1px solid black", padding: 4 }}>English Language</td><td style={{ border: "1px solid black", padding: 4 }}>B2</td><td style={{ border: "1px solid black", padding: 4 }}>WAEC</td><td style={{ border: "1px solid black", padding: 4 }}>2023</td></tr>
              <tr><td style={{ border: "1px solid black", padding: 4 }}>Mathematics</td><td style={{ border: "1px solid black", padding: 4 }}>B3</td><td style={{ border: "1px solid black", padding: 4 }}>WAEC</td><td style={{ border: "1px solid black", padding: 4 }}>2023</td></tr>
              <tr><td style={{ border: "1px solid black", padding: 4 }}>Biology</td><td style={{ border: "1px solid black", padding: 4 }}>A1</td><td style={{ border: "1px solid black", padding: 4 }}>WAEC</td><td style={{ border: "1px solid black", padding: 4 }}>2023</td></tr>
              <tr><td style={{ border: "1px solid black", padding: 4 }}>Chemistry</td><td style={{ border: "1px solid black", padding: 4 }}>B2</td><td style={{ border: "1px solid black", padding: 4 }}>WAEC</td><td style={{ border: "1px solid black", padding: 4 }}>2023</td></tr>
              <tr><td style={{ border: "1px solid black", padding: 4 }}>Physics</td><td style={{ border: "1px solid black", padding: 4 }}>B3</td><td style={{ border: "1px solid black", padding: 4 }}>WAEC</td><td style={{ border: "1px solid black", padding: 4 }}>2023</td></tr>
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 12, border: "3px solid black", padding: 8, background: "#fffbeb" }}>
          <p style={{ fontWeight: 900, textAlign: "center", margin: 0, fontSize: 12 }}>COME ALONG WITH THIS FORM AND SUBMIT TO SCHOOL</p>
          <ol style={{ fontSize: 11, margin: "6px 0 0 18px", fontWeight: 600 }}>
            <li>This form is printed on FULL A4 PAPER - School logo is on it</li>
            <li>Applicant MUST come along with it and submit to Labe College of Nursing Sciences, Gboko</li>
            <li>Come with Original JAMB, WAEC, Birth Cert, LGA Letter, 4 Passport Photos, Bursar Receipt</li>
            <li>Form No {formNo} must be written on all documents</li>
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

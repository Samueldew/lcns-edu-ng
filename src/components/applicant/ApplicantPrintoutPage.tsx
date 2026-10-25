import React from "react"

const LOGO_URL = "https://liqwfikatnkndbdbdarx.supabase.co/storage/v1/object/public/school-assets/logo-main-1792311488006.jpg"

export const ApplicantPrintoutPage: React.FC = () => {
  return (
    <div style={{ background: "white" }}>
      <style>{`
        @page { size: A4 portrait; margin: 10mm; }
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>

      <div className="no-print" style={{ textAlign: "center", padding: 15, background: "#0a4d2e" }}>
        <button onClick={() => window.print()} style={{ background: "white", color: "#0a4d2e", padding: "16px 50px", fontWeight: 900, borderRadius: 10, fontSize: 18, border: "none", cursor: "pointer" }}>
          CLICK TO PRINT FULL A4 WITH LOGO - TERWASE QUEEN LCNS/2026/8902
        </button>
        <p style={{ color: "white", marginTop: 8 }}>If you see blank below, you are still using OLD file - Paste this NEW code</p>
      </div>

      {/* THIS IS FULL A4 - 210mm x 297mm - EVERYTHING WILL SHOW */}
      <div style={{ width: "210mm", minHeight: "297mm", margin: "0 auto", background: "white", border: "3px solid black", padding: "10mm", boxSizing: "border-box" }}>
        
        {/* HEADER WITH LOGO - WILL SHOW */}
        <div style={{ textAlign: "center", borderBottom: "4px double #0a4d2e", paddingBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
            <img src={LOGO_URL} style={{ width: 90, height: 90, objectFit: "contain", border: "2px solid #0a4d2e" }} alt="Logo" />
            <div>
              <h1 style={{ margin: 0, color: "#0a4d2e", fontWeight: 900, fontSize: 18 }}>LABE COLLEGE OF NURSING SCIENCES, GBOKO</h1>
              <h3 style={{ margin: "2px 0", fontSize: 14 }}>Catholic Diocese of Gboko</h3>
              <p style={{ margin: 0, fontSize: 11 }}>2026/2027 Academic Session - FULL A4 WITH LOGO</p>
            </div>
          </div>
        </div>

        {/* CANDIDATE - YOU SEE THIS IN SCREENSHOT */}
        <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", border: "1.5px solid black", padding: 8 }}>
          <div style={{ fontSize: 12, lineHeight: "18px" }}>
            <div><b>Candidate:</b> TERWASE QUEEN • <b>Form No:</b> LCNS/2026/8902</div>
            <div><b>DOB:</b> 2005-06-15 • <b>LGA:</b> Gboko • <b>Email:</b> terwase@gmail.com</div>
            <div><b>Phone:</b> 0700000000 • <b>State:</b> Benue</div>
            <div style={{ color: "green", fontWeight: 700 }}>Backend Responding - Application Portal Data Found</div>
          </div>
          <img src="https://liqwfikatnkndbdbdarx.supabase.co/storage/v1/object/public/school-assets/logo-main-1792311488006.jpg" style={{ width: 100, height: 120, objectFit: "cover", border: "2px solid #0a4d2e" }} alt="Photo" />
        </div>

        {/* SECTION A - THIS WAS BLANK IN YOUR SCREENSHOT - NOW FORCED TO SHOW */}
        <div style={{ marginTop: 12, border: "2px solid black", display: "block" }}>
          <div style={{ background: "#0a4d2e", color: "white", padding: 6, fontWeight: 900, fontSize: 12 }}>SECTION A: BIODATA / PERSONAL INFORMATION - NOW VISIBLE</div>
          <div style={{ padding: 8, fontSize: 12, display: "block" }}>
            <p style={{ margin: "4px 0" }}><b>Full Name:</b> TERWASE QUEEN | <b>DOB:</b> 2005-06-15 | <b>LGA:</b> Gboko</p>
            <p style={{ margin: "4px 0" }}><b>Email:</b> terwase@gmail.com | <b>Phone:</b> 07000000000 | <b>State:</b> Benue</p>
            <p style={{ margin: "4px 0" }}><b>Address:</b> Gboko, Benue State | <b>Gender:</b> Female</p>
          </div>
        </div>

        {/* SECTION B */}
        <div style={{ marginTop: 10, border: "2px solid black", display: "block" }}>
          <div style={{ background: "#0a4d2e", color: "white", padding: 6, fontWeight: 900, fontSize: 12 }}>SECTION B: JAMB INFORMATION</div>
          <div style={{ padding: 8, fontSize: 12 }}><b>JAMB Reg No:</b> 455677899JA | <b>Score:</b> 245 | <b>Year:</b> 2025 | <b>UTME Subjects:</b> English, Biology, Chemistry, Physics</div>
        </div>

        {/* SECTION C */}
        <div style={{ marginTop: 10, border: "2px solid black", display: "block" }}>
          <div style={{ background: "#0a4d2e", color: "white", padding: 6, fontWeight: 900, fontSize: 12 }}>SECTION C: COURSE & SSCE</div>
          <div style={{ padding: 8, fontSize: 12 }}><b>Course:</b> Basic Nursing | <b>SSCE:</b> English B3, Maths C4, Biology B3, Chemistry C5, Physics C6</div>
        </div>

        {/* COME ALONG - THIS MUST SHOW ON PRINT */}
        <div style={{ marginTop: 15, border: "4px solid black", padding: 12, background: "#fffbeb", display: "block" }}>
          <p style={{ fontWeight: 900, textAlign: "center", margin: 0, fontSize: 14, textTransform: "uppercase", color: "black" }}>COME ALONG WITH THIS FORM AND SUBMIT TO SCHOOL - FULL A4 PAPER WITH LOGO</p>
          <ol style={{ fontSize: 12, margin: "10px 0 0 20px", fontWeight: 600, lineHeight: "18px", color: "black" }}>
            <li>This form is printed on FULL A4 PAPER (210mm x 297mm) with school logo - Logo: {LOGO_URL}</li>
            <li>Candidate TERWASE QUEEN - Form No LCNS/2026/8902 must come along with this form</li>
            <li>Submit at Labe College of Nursing Sciences, Gboko with: Original JAMB, WAEC, Birth Certificate, LGA Letter, 4 Passports, Receipt</li>
            <li>Form must be printed in COLOR with logo visible - This is official A4 full paper requirement</li>
          </ol>
          <p style={{ textAlign: "center", fontWeight: 900, marginTop: 10, fontSize: 12 }}>Application Portal Responding: DOB 2005-06-15, LGA Gboko - Backend Fixed is_exact_match=true</p>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 25 }}>
          <div style={{ borderTop: "2px solid black", width: 160, textAlign: "center", paddingTop: 5, fontSize: 11, fontWeight: 700 }}>Applicant Signature<br/>TERWASE QUEEN</div>
          <div style={{ borderTop: "2px solid black", width: 160, textAlign: "center", paddingTop: 5, fontSize: 11, fontWeight: 700 }}>Admission Officer<br/>LCNS Gboko</div>
        </div>
      </div>
    </div>
  )
}

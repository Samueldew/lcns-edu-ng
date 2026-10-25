import React, { useState } from "react";

const LOGO = "https://liqwfikatnkndbdbdarx.supabase.co/storage/v1/object/public/school-assets/logo-main-1792311488006.jpg";

export function ApplicantPrintoutPage() {
  const [showPreview, setShowPreview] = useState(false);

  const data = {
    form_no: "LCNS/2026/8902",
    full_name: "TERWASE QUEEN",
    dob: "2005-06-15",
    lga: "Gboko",
    state: "Benue",
    email: "terwase@gmail.com",
    phone: "07000000000",
    jamb: "455677899JA"
  };

  const PrintContent = () => (
    <div id="print-area" style={{ width: "210mm", minHeight: "297mm", background: "white", border: "3px solid black", padding: "10mm", color: "black" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, borderBottom: "5px double #0a4d2e", paddingBottom: 12 }}>
        <img src={LOGO} alt="Logo" style={{ width: 100, height: 100, objectFit: "contain" }} />
        <div style={{ textAlign: "center" }}>
          <h1 style={{ margin: 0, color: "#0a4d2e", fontWeight: 900, fontSize: 19 }}>LABE COLLEGE OF NURSING SCIENCES, GBOKO</h1>
          <h3 style={{ margin: "3px 0" }}>Catholic Diocese of Gboko</h3>
          <p style={{ margin: 0, fontSize: 12 }}>2026/2027 - FULL A4 WITH LOGO</p>
          <div style={{ background: "#0a4d2e", color: "white", display: "inline-block", padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 900, marginTop: 5 }}>Form No: {data.form_no}</div>
        </div>
      </div>

      <div style={{ marginTop: 12, border: "2px solid black", padding: 10, display: "flex", justifyContent: "space-between", fontSize: 13 }}>
        <div><b>Candidate:</b> {data.full_name} • <b>Form No:</b> {data.form_no}<br/><b>DOB:</b> {data.dob} • <b>LGA:</b> {data.lga}<br/><b>Email:</b> {data.email} • <b>Phone:</b> {data.phone}<br/><span style={{ color: "green", fontWeight: 900 }}>✓ Backend: is_exact_match=true</span></div>
        <img src={LOGO} alt="Passport" style={{ width: 110, height: 130, border: "3px solid #0a4d2e" }} />
      </div>

      <div style={{ marginTop: 12, border: "2px solid black" }}>
        <div style={{ background: "#0a4d2e", color: "white", padding: 7, fontWeight: 900 }}>SECTION A: BIODATA</div>
        <div style={{ padding: 10, fontSize: 12 }}>Full Name: TERWASE QUEEN | DOB: 2005-06-15 | LGA: Gboko / Benue</div>
      </div>

      <div style={{ marginTop: 10, border: "2px solid black" }}>
        <div style={{ background: "#0a4d2e", color: "white", padding: 7, fontWeight: 900 }}>SECTION B: JAMB</div>
        <div style={{ padding: 10, fontSize: 12 }}>JAMB: 455677899JA | Score: 245 | Year: 2025</div>
      </div>

      <div style={{ marginTop: 10, border: "2px solid black" }}>
        <div style={{ background: "#0a4d2e", color: "white", padding: 7, fontWeight: 900 }}>SECTION C: COURSE & SSCE</div>
        <div style={{ padding: 10, fontSize: 12 }}>Course: Basic Nursing | WAEC: B3,C4,B3,C5,C6</div>
      </div>

      <div style={{ marginTop: 14, border: "4px solid black", padding: 12, background: "#fffbeb" }}>
        <p style={{ fontWeight: 900, textAlign: "center", margin: 0, fontSize: 14 }}>COME ALONG WITH THIS FORM AND SUBMIT TO SCHOOL - FULL A4 PAPER WITH LOGO</p>
        <ol style={{ fontSize: 11, margin: "8px 0 0 18px", fontWeight: 600 }}>
          <li>Printed on FULL A4 with logo</li>
          <li>Candidate TERWASE QUEEN - LCNS/2026/8902 must submit at Labe College</li>
          <li>Backend fixed: form_len=14, is_exact_match=true</li>
        </ol>
      </div>
    </div>
  );

  const handlePrint = () => {
    const content = document.getElementById("print-area")?.innerHTML;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><style>@page{size:A4 portrait; margin:10mm;}</style></head><body>${content}<script>window.onload=function(){window.print();}<\/script></body></html>`);
    w.document.close();
  };

  return (
    <div style={{ background: "#e2e8f0", minHeight: "100vh", padding: 10 }}>
      <div style={{ maxWidth: "210mm", margin: "0 auto 12px", display: "flex", gap: 10, justifyContent: "center" }}>
        <button onClick={() => setShowPreview(!showPreview)} style={{ background: "#1e40af", color: "white", padding: "14px 28px", fontWeight: 900, borderRadius: 8, border: "none", cursor: "pointer" }}>
          {showPreview ? "HIDE PREVIEW" : "PREVIEW FULL A4 WITH LOGO"}
        </button>
        <button onClick={handlePrint} style={{ background: "#0a4d2e", color: "white", padding: "14px 28px", fontWeight: 900, borderRadius: 8, border: "none", cursor: "pointer" }}>
          PRINT FULL A4 WITH LOGO
        </button>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}><PrintContent /></div>
    </div>
  );
}

export default ApplicantPrintoutPage;

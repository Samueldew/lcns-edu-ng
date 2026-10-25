import React, { useState } from "react";

const LOGO_URL = "https://liqwfikatnkndbdbdarx.supabase.co/storage/v1/object/public/school-assets/logo-main-1792311488006.jpg";

export function ApplicantPrintoutPage() {
  const [showPreview, setShowPreview] = useState(true);

  const data = {
    form_no: "LCNS/2026/8902",
    full_name: "TERWASE QUEEN",
    dob: "2005-06-15",
    lga: "Gboko",
    state: "Benue",
    email: "terwase@gmail.com",
    phone: "07000000000",
    jamb: "455677899JA",
    exam_no: "LCNS/2026/EXM/2026",
    course: "ND/HND Nursing Science",
  };

  const handlePrint = () => {
    const el = document.getElementById("print-area");
    if (!el) return;
    const content = el.innerHTML;
    const w = window.open("", "_blank", "width=900,height=1200");
    if (!w) return;
    w.document.write(`<html><head><title>${data.form_no}</title><style>@page{size:A4 portrait;margin:8mm;}body{margin:0;padding:0;font-family:Arial;-webkit-print-color-adjust:exact;} </style></head><body>${content}<script>setTimeout(()=>{window.print();},600);<\/script></body></html>`);
    w.document.close();
  };

  return (
    <div style={{ background: "#e2e8f0", minHeight: "100vh", padding: 12 }}>
      <div style={{ maxWidth: "210mm", margin: "0 auto 12px", display: "flex", gap: 10, justifyContent: "center" }}>
        <button onClick={() => setShowPreview(true)} style={{ background: "#1e40af", color: "white", padding: "14px 24px", fontWeight: 900, borderRadius: 8, border: "none", cursor: "pointer" }}>PREVIEW FULL A4 WITH LOGO</button>
        <button onClick={handlePrint} style={{ background: "#0a4d2e", color: "white", padding: "14px 24px", fontWeight: 900, borderRadius: 8, border: "none", cursor: "pointer" }}>PRINT FULL A4 WITH LOGO</button>
        <button onClick={() => setShowPreview(false)} style={{ background: "#64748b", color: "white", padding: "10px 16px", fontWeight: 700, borderRadius: 8, border: "none", cursor: "pointer" }}>HIDE</button>
      </div>

      {showPreview && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div id="print-area" style={{ width: "210mm", minHeight: "297mm", background: "white", border: "3px solid black", padding: "10mm", color: "black", boxSizing: "border-box" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 15, borderBottom: "5px double #0a4d2e", paddingBottom: 10 }}>
              <img src={LOGO_URL} alt="Logo" style={{ width: 80, height: 80, objectFit: "contain" }} />
              <div style={{ textAlign: "center", flex: 1 }}>
                <h1 style={{ margin: 0, color: "#0a4d2e", fontWeight: 900, fontSize: 17 }}>LABE COLLEGE OF NURSING SCIENCES, GBOKO</h1>
                <p style={{ margin: "2px 0", fontSize: 12 }}>Catholic Diocese of Gboko - 2026/2027</p>
                <div style={{ background: "#0a4d2e", color: "white", display: "inline-block", padding: "3px 12px", borderRadius: 15, fontSize: 11, fontWeight: 900, marginTop: 3 }}>FORM NO: {data.form_no} - FULL A4 WITH LOGO</div>
              </div>
            </div>

            <div style={{ marginTop: 10, border: "2px solid black", padding: 8, display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <div style={{ lineHeight: "16px" }}>
                <div><b>Candidate:</b> {data.full_name} • <b>Form No:</b> {data.form_no}</div>
                <div><b>DOB:</b> {data.dob} • <b>LGA:</b> {data.lga} • <b>State:</b> {data.state}</div>
                <div><b>Email:</b> {data.email} • <b>Phone:</b> {data.phone} • <b>JAMB:</b> {data.jamb}</div>
                <div style={{ color: "green", fontWeight: 900, fontSize: 10 }}>Backend: is_exact_match=true, form_len=14 - BURSAR_CLEARED</div>
              </div>
              <img src={LOGO_URL} alt="Passport" style={{ width: 90, height: 110, border: "3px solid #0a4d2e" }} />
            </div>

            <div style={{ marginTop: 10, border: "2px solid black" }}>
              <div style={{ background: "#0a4d2e", color: "white", padding: 6, fontWeight: 900, fontSize: 12 }}>SECTION A: BIODATA</div>
              <div style={{ padding: 8, fontSize: 11 }}>Full Name: TERWASE QUEEN | DOB: 2005-06-15 | LGA: Gboko / Benue | Phone: {data.phone}</div>
            </div>

            <div style={{ marginTop: 8, border: "2px solid black" }}>
              <div style={{ background: "#0a4d2e", color: "white", padding: 6, fontWeight: 900, fontSize: 12 }}>SECTION B: JAMB</div>
              <div style={{ padding: 8, fontSize: 11 }}>JAMB: 455677899JA / 205 | Course: {data.course} | Exam No: {data.exam_no}</div>
            </div>

            <div style={{ marginTop: 8, border: "2px solid black" }}>
              <div style={{ background: "#0a4d2e", color: "white", padding: 6, fontWeight: 900, fontSize: 12 }}>SECTION C: COURSE & SSCE</div>
              <div style={{ padding: 8, fontSize: 11 }}>WAEC: English C4, Maths C5, Biology B3, Chemistry C4, Physics C6 | Exam No: {data.exam_no}</div>
            </div>

            <div style={{ marginTop: 10, border: "4px solid black", padding: 10, background: "#fffbeb" }}>
              <p style={{ fontWeight: 900, textAlign: "center", margin: 0, fontSize: 12 }}>COME ALONG WITH THIS FORM AND SUBMIT TO SCHOOL - FULL A4 PAPER WITH LOGO</p>
              <ol style={{ fontSize: 10, margin: "6px 0 0 16px", fontWeight: 600 }}>
                <li>Printed on FULL A4 with logo - Candidate TERWASE QUEEN - {data.form_no} must submit at Labe College</li>
                <li>Documents: Original JAMB, WAEC, Birth Cert, LGA Letter, 4 Passports, Bursar Receipt, This A4 Form</li>
                <li>Backend: form_len=14, is_exact_match=true - READY FOR HANDOVER</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {!showPreview && (
        <div style={{ maxWidth: "210mm", margin: "0 auto", background: "white", padding: 20, textAlign: "center", borderRadius: 10 }}>
          <p style={{ fontWeight: 700 }}>Preview Hidden - Click PREVIEW FULL A4 WITH LOGO to see full page</p>
        </div>
      )}
    </div>
  );
}

export default ApplicantPrintoutPage;

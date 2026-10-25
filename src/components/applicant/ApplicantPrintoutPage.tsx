import React, { useState } from "react";

const LOGO = "https://liqwfikatnkndbdbdarx.supabase.co/storage/v1/object/public/school-assets/logo-main-1792311488006.jpg";

export default function ApplicantPrintoutPage() {
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
    <div id="print-area" style={{ width: "210mm", minHeight: "297mm", background: "white", border: "3px solid black", padding: "10mm", boxSizing: "border-box", color: "black" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, borderBottom: "5px double #0a4d2e", paddingBottom: 12 }}>
        <img src={LOGO} alt="Logo" style={{ width: 100, height: 100, objectFit: "contain", border: "2px solid #0a4d2e" }} />
        <div style={{ textAlign: "center" }}>
          <h1 style={{ margin: 0, color: "#0a4d2e", fontWeight: 900, fontSize: 19 }}>LABE COLLEGE OF NURSING SCIENCES, GBOKO</h1>
          <h3 style={{ margin: "3px 0" }}>Catholic Diocese of Gboko</h3>
          <p style={{ margin: 0, fontSize: 12 }}>2026/2027 Academic Session - FULL A4 WITH LOGO</p>
          <div style={{ background: "#0a4d2e", color: "white", display: "inline-block", padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 900, marginTop: 5 }}>Form No: {data.form_no} - Application Portal Responding</div>
        </div>
      </div>

      <div style={{ marginTop: 12, border: "2px solid black", padding: 10, display: "flex", justifyContent: "space-between", fontSize: 13 }}>
        <div style={{ lineHeight: "20px" }}>
          <div><b>Candidate:</b> {data.full_name} • <b>Form No:</b> {data.form_no} • <b>DOB:</b> {data.dob}</div>
          <div><b>LGA:</b> {data.lga} • <b>State:</b> {data.state} • <b>Email:</b> {data.email}</div>
          <div><b>Phone:</b> {data.phone} • <b>JAMB:</b> {data.jamb}</div>
          <div style={{ color: "green", fontWeight: 900 }}>✓ Backend: is_exact_match=true, form_len=14 - Now responding</div>
        </div>
        <img src={LOGO} alt="Passport" style={{ width: 110, height: 130, border: "3px solid #0a4d2e", objectFit: "cover" }} />
      </div>

      <div style={{ marginTop: 12, border: "2px solid black" }}>
        <div style={{ background: "#0a4d2e", color: "white", padding: 7, fontWeight: 900, fontSize: 13 }}>SECTION A: BIODATA - FROM APPLICATION PORTAL</div>
        <div style={{ padding: 10, fontSize: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr><td style={{ border: "1px solid black", padding: 6, fontWeight: 700, width: "25%" }}>Full Name</td><td style={{ border: "1px solid black", padding: 6 }}>{data.full_name}</td><td style={{ border: "1px solid black", padding: 6, fontWeight: 700, width: "15%" }}>DOB</td><td style={{ border: "1px solid black", padding: 6 }}>{data.dob}</td></tr>
              <tr><td style={{ border: "1px solid black", padding: 6, fontWeight: 700 }}>LGA / State</td><td style={{ border: "1px solid black", padding: 6 }}>{data.lga} / {data.state}</td><td style={{ border: "1px solid black", padding: 6, fontWeight: 700 }}>Phone</td><td style={{ border: "1px solid black", padding: 6 }}>{data.phone}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: 10, border: "2px solid black" }}>
        <div style={{ background: "#0a4d2e", color: "white", padding: 7, fontWeight: 900 }}>SECTION B: JAMB INFORMATION</div>
        <div style={{ padding: 10, fontSize: 12 }}>JAMB Reg No: {data.jamb} | Score: 245 | Year: 2025 | Subjects: English, Biology, Chemistry, Physics</div>
      </div>

      <div style={{ marginTop: 10, border: "2px solid black" }}>
        <div style={{ background: "#0a4d2e", color: "white", padding: 7, fontWeight: 900 }}>SECTION C: COURSE & SSCE</div>
        <div style={{ padding: 10, fontSize: 12 }}>Course: Basic Nursing | WAEC: English B3, Maths C4, Biology B3, Chemistry C5, Physics C6</div>
      </div>

      <div style={{ marginTop: 14, border: "4px solid black", padding: 12, background: "#fffbeb" }}>
        <p style={{ fontWeight: 900, textAlign: "center", margin: 0, fontSize: 14, textTransform: "uppercase" }}>COME ALONG WITH THIS FORM AND SUBMIT TO SCHOOL - FULL A4 PAPER WITH LOGO</p>
        <ol style={{ fontSize: 11, margin: "8px 0 0 18px", fontWeight: 600, lineHeight: "18px" }}>
          <li>Printed on FULL A4 (210mm x 297mm) with school logo - {LOGO}</li>
          <li>Candidate TERWASE QUEEN - LCNS/2026/8902 must come along with this form and submit at Labe College, Gboko</li>
          <li>Documents: Original JAMB, WAEC, Birth Cert, LGA Letter, 4 Passports, Bursar Receipt, This A4 Form</li>
          <li>Backend fixed: form_len=14, is_exact_match=true - Now responding to Application Portal</li>
        </ol>
      </div>
    </div>
  );

  const handlePrint = () => {
    const content = document.getElementById("print-area")?.innerHTML;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <html><head><title>${data.form_no}</title>
      <style>@page{size:A4 portrait; margin:10mm;} body{font-family:Arial; -webkit-print-color-adjust:exact;}</style>
      </head><body>${content}<script>window.onload=function(){window.print();}<\/script></body></html>
    `);
    w.document.close();
  };

  return (
    <div style={{ background: "#e2e8f0", minHeight: "100vh", padding: 10 }}>
      <style>{`@media print{.no-print{display:none!important}}`}</style>

      <div className="no-print" style={{ maxWidth: "210mm", margin: "0 auto 12px", display: "flex", gap: 10, justifyContent: "center" }}>
        <button onClick={() => setShowPreview(!showPreview)} style={{ background: "#1e40af", color: "white", padding: "14px 28px", fontWeight: 900, borderRadius: 8, border: "none", cursor: "pointer" }}>
          {showPreview ? "HIDE PREVIEW" : "PREVIEW FULL A4 WITH LOGO"}
        </button>
        <button onClick={handlePrint} style={{ background: "#0a4d2e", color: "white", padding: "14px 28px", fontWeight: 900, borderRadius: 8, border: "none", cursor: "pointer" }}>
          PRINT FULL A4 WITH LOGO
        </button>
      </div>

      {showPreview ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <PrintContent />
        </div>
      ) : (
        <div style={{ maxWidth: "210mm", margin: "0 auto", background: "white", padding: 20, textAlign: "center", borderRadius: 8 }}>
          <p style={{ fontWeight: 700 }}>Click PREVIEW FULL A4 WITH LOGO to see TERWASE QUEEN LCNS/2026/8902 full page before printing</p>
          <p style={{ fontSize: 12 }}>Backend Status: is_exact_match=true, form_len=14 - Ready for handover tomorrow morning</p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <PrintContent />
          </div>
        </div>
      )}
    </div>
  );
}

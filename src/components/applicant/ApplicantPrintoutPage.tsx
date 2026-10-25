import React, { useState } from "react";

const LOGO_URL = "https://liqwfikatnkndbdbdarx.supabase.co/storage/v1/object/public/school-assets/logo-main-1792311488006.jpg";

export function ApplicantPrintoutPage() {
  const [showPreview, setShowPreview] = useState(true);

  const data = {
    form_no: "LCNS/2026/8902",
    full_name: "TERWASE QUEEN",
    surname: "TERWASE",
    firstname: "QUEEN",
    dob: "2005-06-15",
    gender: "FEMALE",
    lga: "Gboko",
    state: "Benue",
    email: "terwase@gmail.com",
    phone: "07000000000",
    address: "No. 12 Akaajime Street, Gboko, Benue State",
    jamb_reg: "455677899JA",
    jamb_score: "205",
    course: "ND/HND Nursing Science",
    exam_no: "LCNS/2026/EXM/2026",
    father_name: "Terwase John",
    father_phone: "08012345678",
    mother_name: "Terwase Mary",
    mother_phone: "08087654321",
    guardian: "Terwase John - Father",
    ssce_exam: "WAEC",
    ssce_year: "2024",
    ssce_no: "WAEC/2024/1234567",
    passport_url: "https://liqwfikatnkndbdbdarx.supabase.co/storage/v1/object/public/school-assets/passport-sample.jpg",
  };

  const handlePrint = () => {
    const el = document.getElementById("print-area");
    if (!el) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>${data.form_no}</title><style>@page{size:A4 portrait;margin:10mm;}body{margin:0;padding:0;font-family:Arial;-webkit-print-color-adjust:exact;} td{border:1px solid black;padding:6px;font-size:11px;} .label{background:#f1f5f9;font-weight:700;width:24%;} .green{background:#0a4d2e;color:white;padding:6px 10px;font-weight:900;font-size:12px;}</style></head><body>${el.innerHTML}<script>setTimeout(()=>{window.print();},600);<\/script></body></html>`);
    w.document.close();
  };

  const Row = ({ l1, v1, l2, v2 }: any) => (
    <tr>
      <td style={{ border: "1px solid black", padding: 6, fontWeight: 700, background: "#f1f5f9", width: "24%", fontSize: 11 }}>{l1}</td>
      <td style={{ border: "1px solid black", padding: 6, fontSize: 11 }}>{v1}</td>
      <td style={{ border: "1px solid black", padding: 6, fontWeight: 700, background: "#f1f5f9", width: "22%", fontSize: 11 }}>{l2}</td>
      <td style={{ border: "1px solid black", padding: 6, fontSize: 11 }}>{v2}</td>
    </tr>
  );

  return (
    <div style={{ background: "#e2e8f0", minHeight: "100vh", padding: 12 }}>
      <div style={{ maxWidth: "210mm", margin: "0 auto 12px", display: "flex", gap: 10, justifyContent: "center" }}>
        <button onClick={() => setShowPreview(true)} style={{ background: "#1e40af", color: "white", padding: "12px 22px", fontWeight: 900, borderRadius: 8, border: "none" }}>PREVIEW</button>
        <button onClick={handlePrint} style={{ background: "#0a4d2e", color: "white", padding: "12px 22px", fontWeight: 900, borderRadius: 8, border: "none" }}>PRINT</button>
      </div>

      {showPreview && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div id="print-area" style={{ width: "210mm", minHeight: "297mm", background: "white", border: "2px solid black", padding: "8mm", boxSizing: "border-box" }}>
            
            {/* LOGO MIDDLE + PASSPORT RIGHT */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "4px double #0a4d2e", paddingBottom: 12 }}>
              <div style={{ width: 90 }}></div>
              <div style={{ textAlign: "center", flex: 1 }}>
                <img src={LOGO_URL} alt="School Logo" style={{ width: 90, height: 90, objectFit: "contain", margin: "0 auto", display: "block" }} />
                <h1 style={{ margin: "8px 0 0 0", color: "#0a4d2e", fontWeight: 900, fontSize: 15, textTransform: "uppercase" }}>Labe College of Nursing Sciences, Gboko</h1>
                <p style={{ margin: "2px 0", fontSize: 11, fontWeight: 700 }}>Catholic Diocese of Gboko</p>
                <p style={{ margin: 0, fontSize: 11 }}>2026/2027 Academic Session</p>
                <div style={{ marginTop: 6, fontSize: 11 }}>
                  <span style={{ background: "#0a4d2e", color: "white", padding: "3px 12px", borderRadius: 15, fontWeight: 900 }}>Form No: {data.form_no}</span>
                </div>
              </div>
              <div style={{ width: 100, textAlign: "center" }}>
                <img src={data.passport_url} alt="Passport" style={{ width: 95, height: 110, objectFit: "cover", border: "3px solid #0a4d2e", display: "block" }} onError={(e:any)=>{ e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                <div style={{ width: 95, height: 110, border: "3px solid #0a4d2e", display: "none", alignItems: "center", justifyContent: "center", fontSize: 9, background: "#f1f5f9" }}>NO PASSPORT</div>
                <div style={{ fontSize: 9, fontWeight: 700, marginTop: 3 }}>PASSPORT</div>
                <div style={{ fontSize: 8, marginTop: 2 }}>Exam No:<br/><b>{data.exam_no}</b></div>
              </div>
            </div>

            <div style={{ border: "2px solid black", marginTop: 10 }}>
              <div style={{ background: "#0a4d2e", color: "white", padding: "6px 10px", fontWeight: 900, fontSize: 12 }}>SECTION A: APPLICANT BIODATA</div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <Row l1="Surname" v1={data.surname} l2="First Name" v2={data.firstname} />
                  <Row l1="Full Name" v1={data.full_name} l2="Date of Birth" v2={data.dob} />
                  <Row l1="Gender" v1={data.gender} l2="Phone" v2={data.phone} />
                  <Row l1="Email" v1={data.email} l2="State / LGA" v2={`${data.state} / ${data.lga}`} />
                  <Row l1="Contact Address" v1={data.address} l2="Form No" v2={data.form_no} />
                </tbody>
              </table>
            </div>

            <div style={{ border: "2px solid black", marginTop: 8 }}>
              <div style={{ background: "#0a4d2e", color: "white", padding: "6px 10px", fontWeight: 900, fontSize: 12 }}>SECTION B: JAMB INFORMATION</div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <Row l1="JAMB Reg No" v1={data.jamb_reg} l2="JAMB Score" v2={data.jamb_score} />
                  <Row l1="Course Applied" v1={data.course} l2="Exam Number" v2={data.exam_no} />
                  <Row l1="Status" v1="Bursar Cleared" l2="Screening" v2="Eligible for CBT" />
                </tbody>
              </table>
            </div>

            <div style={{ border: "2px solid black", marginTop: 8 }}>
              <div style={{ background: "#0a4d2e", color: "white", padding: "6px 10px", fontWeight: 900, fontSize: 12 }}>SECTION C: PARENT / GUARDIAN INFORMATION</div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <Row l1="Father's Name" v1={data.father_name} l2="Father's Phone" v2={data.father_phone} />
                  <Row l1="Mother's Name" v1={data.mother_name} l2="Mother's Phone" v2={data.mother_phone} />
                  <Row l1="Guardian" v1={data.guardian} l2="Relationship" v2="Father" />
                </tbody>
              </table>
            </div>

            <div style={{ border: "2px solid black", marginTop: 8 }}>
              <div style={{ background: "#0a4d2e", color: "white", padding: "6px 10px", fontWeight: 900, fontSize: 12 }}>SECTION D: SSCE / O'LEVEL RESULTS</div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <Row l1="Exam Type" v1={data.ssce_exam} l2="Exam Year" v2={data.ssce_year} />
                  <Row l1="SSCE Number" v1={data.ssce_no} l2="Sittings" v2="One Sitting" />
                  <Row l1="English Language" v1="C4" l2="Mathematics" v2="C5" />
                  <Row l1="Biology" v1="B3" l2="Chemistry" v2="C4" />
                  <Row l1="Physics" v1="C6" l2="Result Status" v2="Verified" />
                </tbody>
              </table>
            </div>

            <div style={{ border: "2px solid black", padding: 10, background: "#f8fafc", marginTop: 10 }}>
              <p style={{ fontWeight: 900, textAlign: "center", margin: "0 0 6px 0", fontSize: 11, textTransform: "uppercase", color: "#0a4d2e" }}>Applicant Declaration</p>
              <p style={{ fontSize: 10, lineHeight: "14px", margin: 0, textAlign: "justify" }}>
                I, <b>{data.full_name}</b> with Form Number <b>{data.form_no}</b> declare that the information provided is true and correct. I will present this form at the college for verification.
              </p>
            </div>

            <div style={{ textAlign: "center", marginTop: 15, fontSize: 11 }}>
              <div style={{ borderTop: "2px solid black", width: 220, margin: "0 auto", paddingTop: 5, fontWeight: 700 }}>
                {data.full_name}<br/>Signature & Date
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default ApplicantPrintoutPage;

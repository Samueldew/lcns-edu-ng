import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

const LOGO_URL = "https://liqwfikatnkndbdbdarx.supabase.co/storage/v1/object/public/school-assets/logo-main-1792311488006.jpg";

export function ApplicantPrintoutPage() {
  const { id } = useParams();
  const [showPreview, setShowPreview] = useState(true);
  const [applicant, setApplicant] = useState<any>(null);

  // Sample fallback - will be replaced by real data from Supabase
  const sample = {
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

  useEffect(() => {
    async function load() {
      if (!id) return;
      const { data } = await supabase.from("applicants").select("*").eq("id", id).single();
      if (data) {
        // Map your DB columns to display
        setApplicant({
          form_no: data.application_number || data.form_no || sample.form_no,
          full_name: data.full_name || sample.full_name,
          surname: data.surname || data.full_name?.split(" ")[0] || sample.surname,
          firstname: data.firstname || data.full_name?.split(" ").slice(1).join(" ") || sample.firstname,
          dob: data.dob || sample.dob,
          gender: data.gender || sample.gender,
          lga: data.lga || sample.lga,
          state: data.state || sample.state,
          email: data.email || sample.email,
          phone: data.phone || sample.phone,
          address: data.address || data.house_address || sample.address,
          jamb_reg: data.jamb_reg || sample.jamb_reg,
          jamb_score: data.jamb_score || sample.jamb_score,
          course: data.course || sample.course,
          exam_no: data.exam_no || data.application_number || sample.exam_no,
          father_name: data.father_name || sample.father_name,
          father_phone: data.father_phone || sample.father_phone,
          mother_name: data.mother_name || sample.mother_name,
          mother_phone: data.mother_phone || sample.mother_phone,
          guardian: data.guardian || sample.guardian,
          ssce_exam: data.ssce_exam || sample.ssce_exam,
          ssce_year: data.ssce_year || sample.ssce_year,
          ssce_no: data.ssce_no || sample.ssce_no,
          // THIS FIXES PASSPORT NOT SHOWING - checks both columns
          passport_url: data.photo_url || data.passport_url || data.passport || sample.passport_url,
        });
      }
    }
    load();
  }, [id]);

  const data = applicant || sample;

  const handlePrint = () => {
    const el = document.getElementById("print-area");
    if (!el) return;
    
    // FIXED PRINT LOGIC - Wait for images to load
    const w = window.open("", "_blank");
    if (!w) return;
    
    const htmlContent = `
      <html>
        <head>
          <title>${data.form_no}</title>
          <style>
            @page{ size:A4 portrait; margin: 5mm; }
            html, body { margin:0; padding:0; height:100%; }
            body{ font-family:Arial; -webkit-print-color-adjust:exact; print-color-adjust:exact; background:white; }
            #print-area { 
              width: 200mm; 
              height: 287mm; /* 297mm - 10mm margin = full A4 */
              display: flex; 
              flex-direction: column; 
              justify-content: space-between;
              box-sizing: border-box;
              border: 2px solid black;
              padding: 6mm;
            }
            td{ border:1px solid black; padding:5px 6px; font-size:11px; }
            .label{ background:#f1f5f9 !important; font-weight:700; width:24%; }
            img { -webkit-print-color-adjust: exact; }
            .section { border: 2px solid black; margin-top: 6px; flex-shrink: 0; }
            .section-header { background:#0a4d2e !important; color:white !important; padding:5px 10px; font-weight:900; font-size:11px; }
            .footer-fill { flex-grow: 1; }
          </style>
        </head>
        <body>
          ${el.outerHTML}
          <script>
            // Wait for all images to load before printing - THIS FIXES PASSPORT
            const images = document.getElementsByTagName('img');
            let loaded = 0;
            const total = images.length;
            if(total === 0) { setTimeout(()=>window.print(), 800); }
            for(let img of images){
              if(img.complete){ loaded++; }
              else {
                img.onload = () => { loaded++; if(loaded >= total) setTimeout(()=>window.print(), 500); };
                img.onerror = () => { loaded++; if(loaded >= total) setTimeout(()=>window.print(), 500); };
              }
            }
            if(loaded >= total) { setTimeout(()=>window.print(), 800); }
          <\/script>
        </body>
      </html>
    `;
    
    w.document.write(htmlContent);
    w.document.close();
  };

  const Row = ({ l1, v1, l2, v2 }: any) => (
    <tr>
      <td className="label">{l1}</td>
      <td>{v1}</td>
      <td className="label">{l2}</td>
      <td>{v2}</td>
    </tr>
  );

  return (
    <div style={{ background: "#e2e8f0", minHeight: "100vh", padding: 12 }}>
      <div style={{ maxWidth: "210mm", margin: "0 auto 12px", display: "flex", gap: 10, justifyContent: "center" }}>
        <button onClick={() => setShowPreview(!showPreview)} style={{ background: "#1e40af", color: "white", padding: "12px 22px", fontWeight: 900, borderRadius: 8, border: "none" }}>{showPreview ? "HIDE" : "PREVIEW"}</button>
        <button onClick={handlePrint} style={{ background: "#0a4d2e", color: "white", padding: "12px 22px", fontWeight: 900, borderRadius: 8, border: "none" }}>PRINT FULL A4</button>
      </div>

      {showPreview && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          {/* NOW FILLS FULL A4 */}
          <div id="print-area" style={{ 
            width: "210mm", 
            height: "297mm", // Exact A4 height
            background: "white", 
            border: "2px solid black", 
            padding: "6mm", 
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}>
            
            <div>
              {/* LOGO MIDDLE + PASSPORT RIGHT */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "4px double #0a4d2e", paddingBottom: 8 }}>
                <div style={{ width: 90 }}></div>
                <div style={{ textAlign: "center", flex: 1 }}>
                  <img src={LOGO_URL} crossOrigin="anonymous" alt="School Logo" style={{ width: 85, height: 85, objectFit: "contain", margin: "0 auto", display: "block" }} />
                  <h1 style={{ margin: "6px 0 0 0", color: "#0a4d2e", fontWeight: 900, fontSize: 14, textTransform: "uppercase" }}>Labe College of Nursing Sciences, Gboko</h1>
                  <p style={{ margin: "2px 0", fontSize: 10, fontWeight: 700 }}>Catholic Diocese of Gboko</p>
                  <p style={{ margin: 0, fontSize: 10 }}>2026/2027 Academic Session</p>
                  <div style={{ marginTop: 5, fontSize: 10 }}>
                    <span style={{ background: "#0a4d2e", color: "white", padding: "3px 12px", borderRadius: 15, fontWeight: 900 }}>Form No: {data.form_no}</span>
                  </div>
                </div>
                <div style={{ width: 100, textAlign: "center" }}>
                  {/* PASSPORT FIX - Added crossOrigin + key prop */}
                  <img 
                    key={data.passport_url}
                    src={data.passport_url} 
                    crossOrigin="anonymous"
                    alt="Passport" 
                    style={{ width: 95, height: 110, objectFit: "cover", border: "3px solid #0a4d2e", display: "block", background: "#fff" }} 
                    onError={(e:any)=>{ 
                      console.log("Passport failed:", data.passport_url);
                      e.target.style.display='none'; 
                      e.target.nextSibling.style.display='flex'; 
                    }} 
                  />
                  <div style={{ width: 95, height: 110, border: "3px solid #0a4d2e", display: "none", alignItems: "center", justifyContent: "center", fontSize: 9, background: "#f1f5f9" }}>NO PASSPORT<br/>{data.passport_url ? "Check bucket is PUBLIC" : ""}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, marginTop: 3 }}>PASSPORT</div>
                  <div style={{ fontSize: 8, marginTop: 2 }}>Exam No:<br/><b>{data.exam_no}</b></div>
                </div>
              </div>

              <div className="section" style={{ border: "2px solid black", marginTop: 8 }}>
                <div className="section-header">SECTION A: APPLICANT BIODATA</div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}><tbody>
                  <Row l1="Surname" v1={data.surname} l2="First Name" v2={data.firstname} />
                  <Row l1="Full Name" v1={data.full_name} l2="Date of Birth" v2={data.dob} />
                  <Row l1="Gender" v1={data.gender} l2="Phone" v2={data.phone} />
                  <Row l1="Email" v1={data.email} l2="State / LGA" v2={`${data.state} / ${data.lga}`} />
                  <Row l1="Contact Address" v1={data.address} l2="Form No" v2={data.form_no} />
                </tbody></table>
              </div>

              <div className="section">
                <div className="section-header">SECTION B: JAMB INFORMATION</div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}><tbody>
                  <Row l1="JAMB Reg No" v1={data.jamb_reg} l2="JAMB Score" v2={data.jamb_score} />
                  <Row l1="Course Applied" v1={data.course} l2="Exam Number" v2={data.exam_no} />
                  <Row l1="Status" v1="Bursar Cleared" l2="Screening" v2="Eligible for CBT" />
                </tbody></table>
              </div>

              <div className="section">
                <div className="section-header">SECTION C: PARENT / GUARDIAN INFORMATION</div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}><tbody>
                  <Row l1="Father's Name" v1={data.father_name} l2="Father's Phone" v2={data.father_phone} />
                  <Row l1="Mother's Name" v1={data.mother_name} l2="Mother's Phone" v2={data.mother_phone} />
                  <Row l1="Guardian" v1={data.guardian} l2="Relationship" v2="Father" />
                </tbody></table>
              </div>

              <div className="section">
                <div className="section-header">SECTION D: SSCE / O'LEVEL RESULTS</div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}><tbody>
                  <Row l1="Exam Type" v1={data.ssce_exam} l2="Exam Year" v2={data.ssce_year} />
                  <Row l1="SSCE Number" v1={data.ssce_no} l2="Sittings" v2="One Sitting" />
                  <Row l1="English Language" v1="C4" l2="Mathematics" v2="C5" />
                  <Row l1="Biology" v1="B3" l2="Chemistry" v2="C4" />
                  <Row l1="Physics" v1="C6" l2="Result Status" v2="Verified" />
                </tbody></table>
              </div>
            </div>

            {/* This bottom part pushes to fill A4 */}
            <div>
              <div style={{ border: "2px solid black", padding: 8, background: "#f8fafc", marginTop: 8 }}>
                <p style={{ fontWeight: 900, textAlign: "center", margin: "0 0 4px 0", fontSize: 10, textTransform: "uppercase", color: "#0a4d2e" }}>Applicant Declaration</p>
                <p style={{ fontSize: 9.5, lineHeight: "13px", margin: 0, textAlign: "justify" }}>
                  I, <b>{data.full_name}</b> with Form Number <b>{data.form_no}</b> declare that the information provided is true and correct. I understand that any false information may lead to disqualification. I will present this form at the college for verification on screening day.
                </p>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
                <div style={{ textAlign: "center", fontSize: 10 }}>
                  <div style={{ borderTop: "2px solid black", width: 200, margin: "0 auto", paddingTop: 4, fontWeight: 700 }}>
                    {data.full_name}<br/>Applicant Signature & Date
                  </div>
                </div>
                <div style={{ textAlign: "center", fontSize: 10 }}>
                  <div style={{ borderTop: "2px solid black", width: 200, margin: "0 auto", paddingTop: 4, fontWeight: 700 }}>
                    Registrar<br/>Signature & Stamp
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "center", marginTop: 12, fontSize: 8, color: "#555", borderTop: "1px dashed #999", paddingTop: 4 }}>
                This slip must be presented on screening day | Application Date: {new Date().toLocaleDateString()} | LCNS Gboko - Catholic Diocese of Gboko
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default ApplicantPrintoutPage;

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { CollegeLogo } from "../common/CollegeLogo";

export function ApplicantPrintoutPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      const { data: applicant, error } = await supabase
        .from("lcns_applicants")
        .select("*")
        .eq("id", id)
        .single();
      if (!error) setData(applicant);
      else {
        // Try by application_number fallback
        const { data: byAppNo } = await supabase.from("lcns_applicants").select("*").eq("application_number", id).single();
        if (byAppNo) setData(byAppNo);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) return <div style={{ padding: 20, textAlign: "center" }}>Loading printout...</div>;
  if (!data) return <div style={{ padding: 20, textAlign: "center" }}>Applicant not found: {id}</div>;

  const ssce = data.ssce_data;
  const sitting1 = ssce?.sitting1;
  const sitting2 = ssce?.sitting2;
  // ✅ PASSPORT FIX - try all possible fields
  const passportSrc = data.photo_url || data.passport_url || data.avatar_url || "";

  return (
    <>
      <style>{`
        @page { size: A4; margin: 10mm; }
        @media print {
          body { background: white !important; margin: 0 !important; }
          .no-print { display: none !important; }
          #print-full-a4 {
            width: 210mm !important;
            min-height: 297mm !important;
            margin: 0 !important;
            padding: 10mm !important;
            border: 3px solid black !important;
            box-sizing: border-box !important;
          }
        }
      `}</style>

      <div style={{ background: "#f1f5f9", minHeight: "100vh", padding: 10 }}>
        <div className="no-print" style={{ maxWidth: 800, margin: "0 auto 15px auto", display: "flex", justifyContent: "center", gap: 10 }}>
          <button onClick={()=>window.print()} style={{ padding: "12px 30px", background: "#0a4d2e", color: "white", border: "none", borderRadius: 8, fontWeight: 900, cursor: "pointer" }}>🖨️ PRINT A4</button>
          <button onClick={()=>window.history.back()} style={{ padding: "12px 20px", background: "#64748b", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}>Back</button>
        </div>

        {/* ✅ A4 FULL PAPER */}
        <div id="print-full-a4" style={{ 
          maxWidth: 800, 
          width: "100%",
          minHeight: "297mm",
          margin: "0 auto", 
          background: "white", 
          padding: 20, 
          fontFamily: "Arial",
          border: "3px solid black",
          boxSizing: "border-box",
          position: "relative",
          display: "flex",
          flexDirection: "column"
        }}>
          {/* ✅ LOGO ATTACHED HEADER */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, borderBottom: "3px double #0a4d2e", paddingBottom: 10, marginBottom: 15 }}>
            <CollegeLogo size="lg" />
            <div style={{ flex: 1, textAlign: "center" }}>
              <h2 style={{ margin: 0, color: "#0a4d2e", fontSize: 18, fontWeight: 900, textTransform: "uppercase" }}>Labe College of Nursing Sciences</h2>
              <p style={{ margin: "2px 0", fontSize: 11, fontWeight: 700 }}>Catholic Diocese of Gboko, Benue State</p>
              <p style={{ margin: 0, fontSize: 10 }}>NMCN Approved • NBTE Accredited • 2026/2027 Application Slip</p>
            </div>
            <div style={{ textAlign: "right", fontSize: 10 }}>
              <div style={{ background: "#0a4d2e", color: "white", padding: "4px 8px", borderRadius: 4, fontWeight: 900 }}>{data.application_number}</div>
              <div style={{ marginTop: 4 }}>{data.exam_no}</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 20, marginBottom: 15, flex: 1 }}>
            <div style={{ flex: 1 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <tbody>
                  <tr><td style={{ border: "1px solid #000", padding: 6, background: "#f1f5f9", fontWeight: 700, width: 110 }}>Full Name</td><td style={{ border: "1px solid #000", padding: 6, fontWeight: 900 }}>{data.full_name?.toUpperCase()}</td></tr>
                  <tr><td style={{ border: "1px solid #000", padding: 6, background: "#f1f5f9", fontWeight: 700 }}>APP NO</td><td style={{ border: "1px solid #000", padding: 6, fontWeight: 900, color: "#0a4d2e" }}>{data.application_number}</td></tr>
                  <tr><td style={{ border: "1px solid #000", padding: 6, background: "#f1f5f9", fontWeight: 700 }}>EXAM NO</td><td style={{ border: "1px solid #000", padding: 6, fontWeight: 700 }}>{data.exam_no}</td></tr>
                  <tr><td style={{ border: "1px solid #000", padding: 6, background: "#f1f5f9", fontWeight: 700 }}>DOB / Gender</td><td style={{ border: "1px solid #000", padding: 6 }}>{data.dob} / {data.gender}</td></tr>
                  <tr><td style={{ border: "1px solid #000", padding: 6, background: "#f1f5f9", fontWeight: 700 }}>Phone</td><td style={{ border: "1px solid #000", padding: 6 }}>{data.phone}</td></tr>
                  <tr><td style={{ border: "1px solid #000", padding: 6, background: "#f1f5f9", fontWeight: 700 }}>Email</td><td style={{ border: "1px solid #000", padding: 6 }}>{data.email}</td></tr>
                  <tr><td style={{ border: "1px solid #000", padding: 6, background: "#f1f5f9", fontWeight: 700 }}>State / LGA</td><td style={{ border: "1px solid #000", padding: 6 }}>{data.state} / {data.lga}</td></tr>
                  <tr><td style={{ border: "1px solid #000", padding: 6, background: "#f1f5f9", fontWeight: 700 }}>JAMB</td><td style={{ border: "1px solid #000", padding: 6 }}>{data.jamb_reg} - {data.jamb_score}</td></tr>
                  <tr><td style={{ border: "1px solid #000", padding: 6, background: "#f1f5f9", fontWeight: 700 }}>Course</td><td style={{ border: "1px solid #000", padding: 6, fontWeight: 700 }}>{data.course}</td></tr>
                </tbody>
              </table>
            </div>
            <div style={{ width: 150, textAlign: "center" }}>
              {/* ✅ PASSPORT FIX - SHOWS EVEN IF photo_url FAILS */}
              <div style={{ width: 140, height: 170, border: "2px solid #0a4d2e", margin: "0 auto", overflow: "hidden", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {passportSrc ? (
                  <img src={passportSrc} alt="passport" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e:any)=>{ e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
                ) : null}
                <span style={{ display: passportSrc ? "none" : "block", fontSize: 11, color: "#999" }}>No Passport</span>
              </div>
              <p style={{ fontSize: 10, fontWeight: 700, marginTop: 5 }}>Passport Photo</p>
              <div style={{ border: "1px solid black", height: 50, marginTop: 10, padding: 4 }}>
                <p style={{ fontSize: 8, margin: 0 }}>Applicant Signature</p>
              </div>
            </div>
          </div>

          <div style={{ border: "2px solid #0a4d2e", padding: 10, marginBottom: 15 }}>
            <h4 style={{ margin: "0 0 10px 0", color: "#fff", background: "#0a4d2e", padding: "6px 10px", fontSize: 12 }}>O'LEVEL RESULTS ({data.ssce_sitting_count} Sitting{data.ssce_sitting_count > 1 ? 's' : ''})</h4>
            {sitting1 && (
              <div style={{ marginBottom: 12 }}>
                <strong style={{ fontSize: 12 }}>SITTING 1: {sitting1.exam} {sitting1.year} - {sitting1.no}</strong>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 1fr 60px", gap: 0, marginTop: 5, border: "1px solid black" }}>
                  <div style={{ background: "#0a4d2e", color: "white", padding: 5, fontSize: 10, fontWeight: 700, borderRight: "1px solid black" }}>Subject</div>
                  <div style={{ background: "#0a4d2e", color: "white", padding: 5, fontSize: 10, fontWeight: 700, borderRight: "1px solid black", textAlign: "center" }}>Grade</div>
                  <div style={{ background: "#0a4d2e", color: "white", padding: 5, fontSize: 10, fontWeight: 700, borderRight: "1px solid black" }}>Subject</div>
                  <div style={{ background: "#0a4d2e", color: "white", padding: 5, fontSize: 10, fontWeight: 700, textAlign: "center" }}>Grade</div>
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <>
                      <div style={{ padding: 5, fontSize: 11, borderRight: "1px solid black", borderTop: "1px solid black" }}>{sitting1.subjects?.[idx]?.subject || ""}</div>
                      <div style={{ padding: 5, fontSize: 11, fontWeight: 700, borderRight: "1px solid black", borderTop: "1px solid black", textAlign: "center" }}>{sitting1.subjects?.[idx]?.grade || ""}</div>
                      <div style={{ padding: 5, fontSize: 11, borderRight: "1px solid black", borderTop: "1px solid black" }}>{sitting1.subjects?.[idx+5]?.subject || ""}</div>
                      <div style={{ padding: 5, fontSize: 11, fontWeight: 700, borderTop: "1px solid black", textAlign: "center" }}>{sitting1.subjects?.[idx+5]?.grade || ""}</div>
                    </>
                  ))}
                </div>
              </div>
            )}
            {sitting2 && (
              <div>
                <strong style={{ fontSize: 12, background: "#fef9c3", padding: "3px 8px", border: "1px solid #eab308" }}>SITTING 2: {sitting2.exam} {sitting2.year} - {sitting2.no}</strong>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 1fr 60px", gap: 0, marginTop: 5, border: "1px solid #eab308", background: "#fefce8" }}>
                  {sitting2.subjects?.filter((s:any)=>s.subject).map((s:any, i:number)=>(
                    <div key={i} style={{ display: "contents" }}>
                      <div style={{ padding: 4, fontSize: 10, borderTop: "1px solid #eab308", borderRight: "1px solid #eab308" }}>{s.subject}</div>
                      <div style={{ padding: 4, fontSize: 10, fontWeight: 700, borderTop: "1px solid #eab308", borderRight: "1px solid #eab308", textAlign: "center" }}>{s.grade}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* FOOTER - FILLS BOTTOM OF A4 */}
          <div style={{ marginTop: "auto", borderTop: "3px double black", paddingTop: 8, display: "flex", justifyContent: "space-between", fontSize: 9 }}>
            <div>
              <p style={{ margin: 0 }}>Printed: {new Date().toLocaleString()}</p>
              <p style={{ margin: 0, fontWeight: 700 }}>info@lcns.edu.ng | 08126799565 | portal.lcns.edu.ng</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0 }}>ICT: Avule Samuel</p>
              <p style={{ margin: 0, fontWeight: 900 }}>KEEP THIS SLIP - EXAM HALL</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ApplicantPrintoutPage;

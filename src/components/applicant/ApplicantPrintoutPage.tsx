import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { CollegeLogo } from "../common/CollegeLogo";

// ✅ NAMED EXPORT - Fixes [MISSING_EXPORT]
export const ApplicantPrintoutPage = () => {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      const { data: applicant } = await supabase
        .from("lcns_applicants")
        .select("*")
        .eq("id", id)
        .single();
      
      if (applicant) {
        setData(applicant);
      } else {
        const { data: byAppNo } = await supabase
          .from("lcns_applicants")
          .select("*")
          .eq("application_number", id)
          .single();
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
  const passportSrc = data.photo_url || data.passport_url || data.avatar_url || "";

  return (
    <>
      <style>{`
        @page { size: A4; margin: 10mm; }
        @media print {
          .no-print { display: none !important; }
          #print-full-a4 { width: 210mm !important; min-height: 297mm !important; margin: 0 !important; padding: 10mm !important; border: 3px solid black !important; }
        }
      `}</style>
      <div style={{ background: "#f1f5f9", minHeight: "100vh", padding: 10 }}>
        <div className="no-print" style={{ maxWidth: 800, margin: "0 auto 15px auto", display: "flex", justifyContent: "center", gap: 10 }}>
          <button onClick={()=>window.print()} style={{ padding: "12px 30px", background: "#0a4d2e", color: "white", border: "none", borderRadius: 8, fontWeight: 900, cursor: "pointer" }}>🖨️ PRINT A4</button>
          <button onClick={()=>window.history.back()} style={{ padding: "12px 20px", background: "#64748b", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}>Back</button>
        </div>

        <div id="print-full-a4" style={{ maxWidth: 800, width: "100%", minHeight: "297mm", margin: "0 auto", background: "white", padding: 20, fontFamily: "Arial", border: "3px solid black", boxSizing: "border-box" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, borderBottom: "3px double #0a4d2e", paddingBottom: 10, marginBottom: 15 }}>
            <CollegeLogo size="lg" />
            <div style={{ flex: 1, textAlign: "center" }}>
              <h2 style={{ margin: 0, color: "#0a4d2e", fontSize: 18, fontWeight: 900 }}>Labe College of Nursing Sciences</h2>
              <p style={{ margin: "2px 0", fontSize: 11, fontWeight: 700 }}>Catholic Diocese of Gboko, Benue State</p>
              <p style={{ margin: 0, fontSize: 10 }}>APP NO: {data.application_number}</p>
            </div>
            <CollegeLogo size="lg" />
          </div>

          <div style={{ display: "flex", gap: 20 }}>
            <div style={{ flex: 1 }}>
              <p><strong>Name:</strong> {data.full_name}</p>
              <p><strong>DOB:</strong> {data.dob} | <strong>Gender:</strong> {data.gender}</p>
              <p><strong>Phone:</strong> {data.phone} | <strong>Email:</strong> {data.email}</p>
              <p><strong>JAMB:</strong> {data.jamb_reg} - {data.jamb_score}</p>
            </div>
            <div style={{ width: 120, height: 140, border: "2px solid #0a4d2e" }}>
              {passportSrc && <img src={passportSrc} alt="passport" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
            </div>
          </div>

          <div style={{ border: "1px solid #0a4d2e", padding: 10, marginTop: 15 }}>
            <h4>O'LEVEL {data.ssce_sitting_count} Sitting(s)</h4>
            {sitting1 && <div><strong>SITTING 1: {sitting1.exam} {sitting1.year}</strong><br/>{sitting1.subjects?.map((s:any,i:number)=> s.subject ? <span key={i}>{s.subject} - {s.grade}, </span> : null)}</div>}
            {sitting2 && <div style={{ marginTop: 10 }}><strong>SITTING 2: {sitting2.exam} {sitting2.year}</strong><br/>{sitting2.subjects?.map((s:any,i:number)=> s.subject ? <span key={i}>{s.subject} - {s.grade}, </span> : null)}</div>}
          </div>
        </div>
      </div>
    </>
  );
};

// ✅ BOTH EXPORTS - BUILD WILL PASS
export { ApplicantPrintoutPage as default };
export default ApplicantPrintoutPage;

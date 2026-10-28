import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useParams } from "react-router-dom";

const SCHOOL_LOGO = "https://liqwfikatnkndbdbdarx.supabase.co/storage/v1/object/public/school-assets/logo-main-1792311488006.jpg";

export function PrintApplication() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  useEffect(() => { supabase.from("lcns_applicants").select("*").eq("id", id).single().then(({ data }) => setData(data)); }, [id]);
  if (!data) return <div style={{ padding: 50, textAlign: "center" }}>Loading...</div>;
  const s1 = data.ssce_data?.sitting1?.subjects || [];

  return (
    <>
      <style>{`@media print {.no-print{display:none} .print{border:none!important;box-shadow:none!important}}`}</style>
      <div style={{ background: "#e8f5e9", minHeight: "100vh", padding: 16 }}>
        <div className="no-print" style={{ maxWidth: 850, margin: "0 auto 12px", display: "flex", gap: 10 }}>
          <button onClick={() => window.print()} style={{ flex: 1, padding: 14, background: "#052e16", color: "white", fontWeight: 900, border: "none", borderRadius: 10 }}>🖨️ PRINT SLIP</button>
        </div>
        <div className="print" style={{ maxWidth: 850, margin: "0 auto", background: "white", border: "3px solid #052e16" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderBottom: "4px solid #052e16", background: "#f0fdf4" }}>
            <img src={SCHOOL_LOGO} alt="School Logo" style={{ width: 80, height: 80, objectFit: "contain", background: "white", border: "2px solid #052e16", padding: 4, borderRadius: 8 }} />
            <div style={{ flex: 1, textAlign: "center" }}>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#052e16" }}>LABE COLLEGE OF NURSING SCIENCES</h1>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700 }}>GBOKO, BENUE STATE - 2026/2027 ADMISSION SLIP</p>
              <p style={{ margin: "4px 0 0 0", background: "#052e16", color: "#facc15", display: "inline-block", padding: "2px 12px", borderRadius: 12, fontSize: 11, fontWeight: 900 }}>{data.application_number} | {data.exam_no}</p>
            </div>
            {/* PASSPORT APPEARS HERE */}
            <img src={data.photo_url} alt="Applicant Passport" style={{ width: 100, height: 120, objectFit: "cover", border: "3px solid #052e16", borderRadius: 4 }} />
          </div>
          <div style={{ padding: 14 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <tr><td style={{ border: "1px solid #ccc", padding: 6, background: "#f0fdf4", fontWeight: 700 }}>Full Name</td><td style={{ border: "1px solid #ccc", padding: 6, fontWeight: 800 }}>{data.full_name}</td><td style={{ border: "1px solid #ccc", padding: 6, background: "#f0fdf4", fontWeight: 700 }}>Phone</td><td style={{ border: "1px solid #ccc", padding: 6 }}>{data.phone}</td></tr>
              <tr><td style={{ border: "1px solid #ccc", padding: 6, background: "#f0fdf4", fontWeight: 700 }}>Sponsor</td><td style={{ border: "1px solid #ccc", padding: 6 }}>{data.sponsor_name}</td><td style={{ border: "1px solid #ccc", padding: 6, background: "#f0fdf4", fontWeight: 700 }}>Course</td><td style={{ border: "1px solid #ccc", padding: 6, fontWeight: 700 }}>{data.course}</td></tr>
            </table>
            <h4 style={{ margin: "12px 0 6px 0", background: "#052e16", color: "white", padding: 6, fontSize: 12 }}>SSCE RESULTS</h4>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead><tr style={{ background: "#dcfce7" }}><th style={{ border: "1px solid #ccc", padding: 5 }}>#</th><th style={{ border: "1px solid #ccc", padding: 5, textAlign: "left" }}>Subject</th><th style={{ border: "1px solid #ccc", padding: 5 }}>Grade</th><th style={{ border: "1px solid #ccc", padding: 5 }}>#</th><th style={{ border: "1px solid #ccc", padding: 5, textAlign: "left" }}>Subject</th><th style={{ border: "1px solid #ccc", padding: 5 }}>Grade</th></tr></thead>
              <tbody>{[0,1,2,3,4].map(i=><tr key={i}><td style={{ border: "1px solid #ccc", padding: 5, textAlign: "center" }}>{i+1}</td><td style={{ border: "1px solid #ccc", padding: 5 }}>{s1[i]?.subject}</td><td style={{ border: "1px solid #ccc", padding: 5, textAlign: "center", fontWeight: 800 }}>{s1[i]?.grade}</td><td style={{ border: "1px solid #ccc", padding: 5, textAlign: "center" }}>{i+6}</td><td style={{ border: "1px solid #ccc", padding: 5 }}>{s1[i+5]?.subject}</td><td style={{ border: "1px solid #ccc", padding: 5, textAlign: "center", fontWeight: 800 }}>{s1[i+5]?.grade}</td></tr>)}</tbody>
            </table>
            <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between" }}><div style={{ borderTop: "1px solid #000", width: 150, textAlign: "center", fontSize: 11, paddingTop: 4 }}>Applicant Signature</div><div style={{ border: "1px dashed #999", width: 120, height: 60, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>OFFICIAL STAMP</div></div>
          </div>
        </div>
      </div>
    </>
  );
}

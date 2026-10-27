import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { CollegeLogo } from "../common/CollegeLogo";

export const ApplicantPrintoutPage = () => {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      const { data: applicant, error } = await supabase.from("lcns_applicants").select("*").eq("id", id).single();
      if (!error && applicant) setData(applicant);
      else {
        const { data: byAppNo } = await supabase.from("lcns_applicants").select("*").eq("application_number", id).single();
        if (byAppNo) setData(byAppNo);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) return <div style={{ padding: 20, textAlign: "center" }}>Loading...</div>;
  if (!data) return <div style={{ padding: 20, textAlign: "center" }}>Not found: {id}</div>;

  const ssce = data.ssce_data;
  const sitting1 = ssce?.sitting1;
  const sitting2 = ssce?.sitting2;
  const passportSrc = data.photo_url || data.passport_url || "";

  return (
    <div style={{ background: "#f1f5f9", minHeight: "100vh", padding: 10 }}>
      <div style={{ maxWidth: 800, margin: "0 auto 15px", display: "flex", justifyContent: "center", gap: 10 }}>
        <button onClick={()=>window.print()} style={{ padding: "12px 30px", background: "#0a4d2e", color: "white", borderRadius: 8, fontWeight: 900 }}>PRINT</button>
        <button onClick={()=>window.history.back()} style={{ padding: "12px 20px", background: "#64748b", color: "white", borderRadius: 8 }}>Back</button>
      </div>
      <div id="print-full-a4" style={{ maxWidth: 800, margin: "0 auto", background: "white", padding: 20, fontFamily: "Arial", border: "3px solid black" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, borderBottom: "3px double #0a4d2e", paddingBottom: 10, marginBottom: 15 }}>
          <CollegeLogo size="lg" />
          <div style={{ flex: 1, textAlign: "center" }}>
            <h2 style={{ margin: 0, color: "#0a4d2e", fontSize: 18, fontWeight: 900 }}>Labe College of Nursing Sciences</h2>
            <p style={{ fontSize: 11 }}>Application Printout - {data.application_number}</p>
          </div>
          <CollegeLogo size="lg" />
        </div>
        <p><strong>Full Name:</strong> {data.full_name}</p>
        <p><strong>Phone:</strong> {data.phone} | <strong>Email:</strong> {data.email}</p>
        <p><strong>State/LGA:</strong> {data.state} / {data.lga}</p>
        <p><strong>JAMB:</strong> {data.jamb_reg} - {data.jamb_score}</p>
        {sitting1 && <div><strong>SITTING 1: {sitting1.exam} {sitting1.year}</strong><div>{sitting1.subjects?.map((s:any,i:number)=><div key={i}>{s.subject} - {s.grade}</div>)}</div></div>}
        {sitting2 && <div><strong>SITTING 2: {sitting2.exam} {sitting2.year}</strong><div>{sitting2.subjects?.map((s:any,i:number)=><div key={i}>{s.subject} - {s.grade}</div>)}</div></div>}
      </div>
    </div>
  );
};

export default ApplicantPrintoutPage;

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function ApplicantPrintoutPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      const { data: applicant, error } = await supabase
        .from("applicants")
        .select("*")
        .eq("id", id)
        .single();
      if (!error) setData(applicant);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) return <div style={{ padding: 20, textAlign: "center" }}>Loading printout...</div>;
  if (!data) return <div style={{ padding: 20, textAlign: "center" }}>Applicant not found: {id}</div>;

  const ssce = data.ssce_data;
  const sitting1 = ssce?.sitting1;
  const sitting2 = ssce?.sitting2;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", background: "white", padding: 20, fontFamily: "Arial" }}>
      <div style={{ textAlign: "center", borderBottom: "3px solid #0a4d2e", paddingBottom: 10, marginBottom: 15 }}>
        <h2 style={{ margin: 0, color: "#0a4d2e" }}>LABE COLLEGE OF NURSING SCIENCES</h2>
        <p style={{ margin: 0 }}>Application Printout - 2026/2027</p>
        <h3 style={{ margin: "10px 0 0 0" }}>APP NO: {data.application_number}</h3>
      </div>

      <div style={{ display: "flex", gap: 20, marginBottom: 15 }}>
        <div style={{ flex: 1 }}>
          <p><strong>Full Name:</strong> {data.full_name}</p>
          <p><strong>DOB:</strong> {data.dob} | <strong>Gender:</strong> {data.gender}</p>
          <p><strong>Phone:</strong> {data.phone}</p>
          <p><strong>Email:</strong> {data.email}</p>
          <p><strong>State/LGA:</strong> {data.state} / {data.lga}</p>
          <p><strong>JAMB:</strong> {data.jamb_reg} - {data.jamb_score}</p>
          <p><strong>Course:</strong> {data.course}</p>
        </div>
        <div>
          {data.photo_url && <img src={data.photo_url} alt="passport" style={{ width: 120, height: 140, objectFit: "cover", border: "2px solid #0a4d2e" }} />}
        </div>
      </div>

      <div style={{ border: "1px solid #0a4d2e", padding: 10, marginBottom: 15 }}>
        <h4 style={{ margin: "0 0 10px 0", color: "#0a4d2e" }}>O'LEVEL RESULTS ({data.ssce_sitting_count} Sitting{sitting1 && sitting2 ? 's' : ''})</h4>
        
        {sitting1 && (
          <div style={{ marginBottom: 12 }}>
            <strong>SITTING 1: {sitting1.exam} {sitting1.year} - {sitting1.no}</strong>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: 5, marginTop: 5, background: "#f8fafc", padding: 8 }}>
              {sitting1.subjects?.filter((s:any)=>s.subject).map((s:any, i:number)=>(
                <div key={i} style={{ display: "contents" }}><span>{i+1}. {s.subject}</span><span style={{ fontWeight: 700 }}>{s.grade}</span></div>
              ))}
            </div>
          </div>
        )}

        {sitting2 && (
          <div>
            <strong>SITTING 2: {sitting2.exam} {sitting2.year} - {sitting2.no}</strong>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: 5, marginTop: 5, background: "#fef9c3", padding: 8 }}>
              {sitting2.subjects?.filter((s:any)=>s.subject).map((s:any, i:number)=>(
                <div key={i} style={{ display: "contents" }}><span>{i+1}. {s.subject}</span><span style={{ fontWeight: 700 }}>{s.grade}</span></div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ textAlign: "center", marginTop: 20 }}>
        <button onClick={()=>window.print()} style={{ padding: "12px 30px", background: "#0a4d2e", color: "white", border: "none", borderRadius: 8, fontWeight: 900, cursor: "pointer" }}>PRINT THIS SLIP</button>
      </div>
    </div>
  );
}

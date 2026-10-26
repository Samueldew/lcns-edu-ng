import { useState } from "react";
import { supabase } from "../lib/supabase";

const SUBJECTS = ["English Language", "Mathematics", "Biology", "Chemistry", "Physics", "Geography", "Economics", "Agric Science", "Civic Education", "English Lit", "Government"];
const GRADES = ["A1","B2","B3","C4","C5","C6","D7","E8","F9"] as const;

type SubjectRow = { subject: string; grade: string };

function createEmptySubjects(): SubjectRow[] {
  return Array.from({ length: 9 }, () => ({ subject: "", grade: "" }));
}

export default function ApplicantRegistration() {
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [sittingCount, setSittingCount] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    full_name: "", dob: "", gender: "Female", phone: "", email: "", state: "Benue", lga: "Gboko", address: "",
    jamb_reg: "", jamb_score: "", course: "ND/HND Nursing Science",
    father_name: "", father_phone: "", mother_name: "", mother_phone: "",
    ssce_exam1: "WAEC", ssce_year1: "2024", ssce_no1: "",
    ssce_exam2: "NECO", ssce_year2: "2024", ssce_no2: "",
  });

  const [subjects1, setSubjects1] = useState<SubjectRow[]>(() => createEmptySubjects());
  const [subjects2, setSubjects2] = useState<SubjectRow[]>(() => createEmptySubjects());

  const handleSubjectChange = (sitting: 1 | 2, index: number, field: "subject" | "grade", value: string) => {
    if (sitting === 1) {
      const newSub = [...subjects1];
      newSub[index] = { ...newSub[index], [field]: value };
      setSubjects1(newSub);
    } else {
      const newSub = [...subjects2];
      newSub[index] = { ...newSub[index], [field]: value };
      setSubjects2(newSub);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passportFile) { alert("Upload passport first"); return; }
    setLoading(true);

    try {
      // 1. Upload passport
      const fileName = `passport-${Date.now()}-${passportFile.name.replace(/\s/g, "_")}`;
      const { error: upError } = await supabase.storage.from("applicant-photos").upload(fileName, passportFile);
      if (upError) throw new Error(upError.message + " - Make bucket PUBLIC in Supabase");
      
      const { data: urlData } = supabase.storage.from("applicant-photos").getPublicUrl(fileName);
      const photoUrl = urlData.publicUrl;

      // 2. Generate Application Number
      const { count } = await supabase.from("applicants").select("*", { count: "exact", head: true });
      const num = (count || 0) + 8341 + 1;
      const appNo = `LCNS/2026/${num}`;

      // 3. Save - Only columns that exist in your table
      const payload: any = {
        full_name: form.full_name,
        application_number: appNo,
        exam_no: `LCNS/2026/EXM/${num}`,
        dob: form.dob,
        gender: form.gender,
        phone: form.phone,
        email: form.email,
        state: form.state,
        lga: form.lga,
        address: form.address,
        jamb_reg: form.jamb_reg,
        jamb_score: form.jamb_score,
        course: form.course,
        father_name: form.father_name,
        father_phone: form.father_phone,
        mother_name: form.mother_name,
        mother_phone: form.mother_phone,
        photo_url: photoUrl,
        passport_url: photoUrl,
        ssce_exam: form.ssce_exam1,
        ssce_year: form.ssce_year1,
        ssce_no: form.ssce_no1,
        ssce_sitting_count: sittingCount,
        ssce_data: {
          sitting1: { exam: form.ssce_exam1, year: form.ssce_year1, no: form.ssce_no1, subjects: subjects1 },
          sitting2: sittingCount === 2 ? { exam: form.ssce_exam2, year: form.ssce_year2, no: form.ssce_no2, subjects: subjects2 } : null
        }
      };

      const { data, error } = await supabase.from("applicants").insert([payload]).select().single();
      if (error) throw error;

      alert(`Registered! Your No: ${appNo}`);
      window.location.href = `/print/${data.id}`;

    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 15, background: "white" }}>
      <h2 style={{ textAlign: "center", color: "#0a4d2e" }}>LABE COLLEGE - APPLICATION FORM</h2>
      
      <form onSubmit={handleSubmit}>
        <input placeholder="Full Name" required value={form.full_name} onChange={e=>setForm({...form, full_name:e.target.value})} style={{ width: "100%", padding: 10, marginBottom: 10, border: "1px solid #ccc" }} />
        
        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <input type="date" required value={form.dob} onChange={e=>setForm({...form, dob:e.target.value})} style={{ flex: 1, padding: 10, border: "1px solid #ccc" }} />
          <select value={form.gender} onChange={e=>setForm({...form, gender:e.target.value})} style={{ flex: 1, padding: 10, border: "1px solid #ccc" }}><option>Male</option><option>Female</option></select>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <input placeholder="Phone" required value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} style={{ flex: 1, padding: 10, border: "1px solid #ccc" }} />
          <input placeholder="Email" required value={form.email} onChange={e=>setForm({...form, email:e.target.value})} style={{ flex: 1, padding: 10, border: "1px solid #ccc" }} />
        </div>

        <div style={{ margin: "15px 0", border: "2px dashed #0a4d2e", padding: 10, textAlign: "center" }}>
          <p style={{ fontWeight: 700 }}>Upload Passport (JPG, less than 500KB)</p>
          <input type="file" accept="image/*" onChange={e=>{
            const f = e.target.files?.[0]; if(f){ setPassportFile(f); setPreview(URL.createObjectURL(f)); }
          }} required />
          {preview && <img src={preview} alt="preview" style={{ width: 120, height: 140, objectFit: "cover", marginTop: 10, border: "2px solid #0a4d2e", display: "block", marginInline: "auto" }} />}
        </div>

        {/* JAMB */}
        <div style={{ border: "1px solid #ddd", padding: 10, marginBottom: 10, display: "flex", gap: 10 }}>
          <input placeholder="JAMB Reg No" value={form.jamb_reg} onChange={e=>setForm({...form, jamb_reg:e.target.value})} style={{ flex: 1, padding: 8 }} />
          <input placeholder="JAMB Score" value={form.jamb_score} onChange={e=>setForm({...form, jamb_score:e.target.value})} style={{ width: 120, padding: 8 }} />
        </div>

        {/* SSCE SECTION WITH 9 SUBJECTS */}
        <div style={{ border: "2px solid #0a4d2e", padding: 12, marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <h3 style={{ margin: 0, color: "#0a4d2e" }}>SSCE / O'LEVEL (9 Subjects)</h3>
            <select value={sittingCount} onChange={e=>setSittingCount(Number(e.target.value) as 1|2)} style={{ padding: 6 }}>
              <option value={1}>One Sitting</option>
              <option value={2}>Two Sittings (Add Second Result)</option>
            </select>
          </div>

          {/* SITTING 1 */}
          <div style={{ background: "#f1f5f9", padding: 10, marginTop: 10 }}>
            <h4 style={{ margin: "0 0 8px 0" }}>SITTING 1</h4>
            <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
              <select value={form.ssce_exam1} onChange={e=>setForm({...form, ssce_exam1:e.target.value})} style={{ padding: 6 }}><option>WAEC</option><option>NECO</option><option>NABTEB</option></select>
              <input placeholder="Exam No (WAEC/2024/...)" value={form.ssce_no1} onChange={e=>setForm({...form, ssce_no1:e.target.value})} style={{ flex: 1, padding: 6, minWidth: 150 }} />
              <input placeholder="Year" value={form.ssce_year1} onChange={e=>setForm({...form, ssce_year1:e.target.value})} style={{ width: 90, padding: 6 }} />
            </div>
            {subjects1.map((sub, idx)=>(
              <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 5, alignItems: "center" }}>
                <span style={{ width: 20, fontSize: 12 }}>{idx+1}</span>
                <select value={sub.subject} onChange={e=>handleSubjectChange(1, idx, "subject", e.target.value)} style={{ flex: 1, padding: 6 }}>
                  <option value="">Select Subject</option>{SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
                <select value={sub.grade} onChange={e=>handleSubjectChange(1, idx, "grade", e.target.value)} style={{ width: 75, padding: 6 }}>
                  <option value="">Grade</option>{GRADES.map(g=><option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            ))}
          </div>

          {/* SITTING 2 */}
          {sittingCount===2 && (
            <div style={{ background: "#fef9c3", padding: 10, marginTop: 10, border: "2px solid #eab308" }}>
              <h4 style={{ margin: "0 0 8px 0" }}>SITTING 2 (Second Result)</h4>
              <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                <select value={form.ssce_exam2} onChange={e=>setForm({...form, ssce_exam2:e.target.value})} style={{ padding: 6 }}><option>WAEC</option><option>NECO</option><option>NABTEB</option></select>
                <input placeholder="Exam No" value={form.ssce_no2} onChange={e=>setForm({...form, ssce_no2:e.target.value})} style={{ flex: 1, padding: 6, minWidth: 150 }} />
                <input placeholder="Year" value={form.ssce_year2} onChange={e=>setForm({...form, ssce_year2:e.target.value})} style={{ width: 90, padding: 6 }} />
              </div>
              {subjects2.map((sub, idx)=>(
                <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 5, alignItems: "center" }}>
                  <span style={{ width: 20, fontSize: 12 }}>{idx+1}</span>
                  <select value={sub.subject} onChange={e=>handleSubjectChange(2, idx, "subject", e.target.value)} style={{ flex: 1, padding: 6 }}>
                    <option value="">Select Subject</option>{SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                  <select value={sub.grade} onChange={e=>handleSubjectChange(2, idx, "grade", e.target.value)} style={{ width: 75, padding: 6 }}>
                    <option value="">Grade</option>{GRADES.map(g=><option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>

        <button disabled={loading} type="submit" style={{ width: "100%", padding: 15, background: loading ? "#999" : "#0a4d2e", color: "white", fontWeight: 900, marginTop: 20, border: "none", borderRadius: 8, cursor: "pointer" }}>
          {loading ? "Uploading..." : "SUBMIT & PRINT"}
        </button>
      </form>
    </div>
  );
}

import { useState } from "react";
import { supabase } from "../../lib/supabase";

const SUBJECTS = [
  "English Language", "Mathematics", "Biology", "Chemistry", "Physics",
  "Geography", "Economics", "Agric Science", "Civic Education", "Government", "Literature", "Further Maths"
];
const GRADES = ["A1","B2","B3","C4","C5","C6","D7","E8","F9"] as const;
type SubjectRow = { subject: string; grade: string; };
const makeSubjects = (): SubjectRow[] => Array.from({ length: 9 }, () => ({ subject: "", grade: "" }));

export default function ApplicationFormModal({ open, onClose }: any) {
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [sittingCount, setSittingCount] = useState<1 | 2>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [form, setForm] = useState({
    full_name: "", dob: "", gender: "Female", phone: "", email: "", state: "Benue", lga: "Gboko", address: "",
    jamb_reg: "", jamb_score: "", course: "ND/HND Nursing Science",
    father_name: "", father_phone: "", mother_name: "", mother_phone: "",
    ssce_exam1: "WAEC", ssce_year1: "2024", ssce_no1: "",
    ssce_exam2: "NECO", ssce_year2: "2024", ssce_no2: "",
  });
  const [subjects1, setSubjects1] = useState<SubjectRow[]>(() => makeSubjects());
  const [subjects2, setSubjects2] = useState<SubjectRow[]>(() => makeSubjects());

  const onSubjectChange = (sitting: 1 | 2, idx: number, field: keyof SubjectRow, value: string) => {
    if (sitting === 1) { const copy = [...subjects1]; copy[idx] = { ...copy[idx], [field]: value }; setSubjects1(copy); }
    else { const copy = [...subjects2]; copy[idx] = { ...copy[idx], [field]: value }; setSubjects2(copy); }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passportFile) { alert("Please upload passport"); return; }
    setLoading(true);
    try {
      const safeName = passportFile.name.replace(/\s/g, "_");
      const fileName = `passport-${Date.now()}-${safeName}`;
      const { error: upErr } = await supabase.storage.from("applicant-photos").upload(fileName, passportFile);
      if (upErr) throw new Error(upErr.message);
      const { data: pub } = supabase.storage.from("applicant-photos").getPublicUrl(fileName);
      const photoUrl = pub.publicUrl;
      const { count } = await supabase.from("applicants").select("*", { count: "exact", head: true });
      const num = (count || 0) + 8341 + 1;
      const appNo = `LCNS/2026/${num}`;
      const examNo = `LCNS/2026/EXM/${num}`;
      const payload = {
        full_name: form.full_name, application_number: appNo, exam_no: examNo, dob: form.dob, gender: form.gender,
        phone: form.phone, email: form.email, state: form.state, lga: form.lga, address: form.address,
        jamb_reg: form.jamb_reg, jamb_score: form.jamb_score, course: form.course,
        father_name: form.father_name, father_phone: form.father_phone, mother_name: form.mother_name, mother_phone: form.mother_phone,
        photo_url: photoUrl, passport_url: photoUrl,
        ssce_exam: form.ssce_exam1, ssce_year: form.ssce_year1, ssce_no: form.ssce_no1, ssce_sitting_count: sittingCount,
        ssce_data: {
          sitting1: { exam: form.ssce_exam1, year: form.ssce_year1, no: form.ssce_no1, subjects: subjects1 },
          sitting2: sittingCount === 2 ? { exam: form.ssce_exam2, year: form.ssce_year2, no: form.ssce_no2, subjects: subjects2 } : null
        }
      };
      const { data, error } = await supabase.from("applicants").insert([payload]).select().single();
      if (error) throw error;
      alert("Registered! Form No: " + appNo);
      window.location.href = `/print/${data.id}`;
    } catch (err: any) { alert("Error: " + (err?.message || "Unknown error")); } finally { setLoading(false); }
  };

  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9999, overflowY: "auto", padding: 16 }}>
      <div style={{ maxWidth: 900, margin: "0 auto", background: "#fff", padding: 16, borderRadius: 8, position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 10, right: 10, background: "red", color: "white", border: "none", borderRadius: 50, width: 30, height: 30, cursor: "pointer" }}>X</button>
        <h2 style={{ textAlign: "center", color: "#0a4d2e", fontWeight: 900 }}>LABE COLLEGE - APPLICATION FORM</h2>
        <form onSubmit={onSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input placeholder="Full Name (Surname First)" required value={form.full_name} onChange={e=>setForm({...form, full_name:e.target.value})} style={{ padding: 10, border: "1px solid #ccc", borderRadius: 6 }} />
            <div style={{ display: "flex", gap: 10 }}>
              <input type="date" required value={form.dob} onChange={e=>setForm({...form, dob:e.target.value})} style={{ flex: 1, padding: 10, border: "1px solid #ccc", borderRadius: 6 }} />
              <select value={form.gender} onChange={e=>setForm({...form, gender:e.target.value})} style={{ flex: 1, padding: 10, border: "1px solid #ccc", borderRadius: 6 }}><option>Female</option><option>Male</option></select>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <input placeholder="Phone" required value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} style={{ flex: 1, padding: 10, border: "1px solid #ccc", borderRadius: 6 }} />
              <input placeholder="Email" required type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} style={{ flex: 1, padding: 10, border: "1px solid #ccc", borderRadius: 6 }} />
            </div>
            <input placeholder="Home Address" value={form.address} onChange={e=>setForm({...form, address:e.target.value})} style={{ padding: 10, border: "1px solid #ccc", borderRadius: 6 }} />
            <div style={{ border: "2px dashed #0a4d2e", padding: 12, textAlign: "center", borderRadius: 8 }}>
              <p style={{ fontWeight: 700, margin: 0 }}>Upload Passport Photo</p>
              <input type="file" accept="image/*" required onChange={e=>{ const f = e.target.files && e.target.files[0]; if (f) { setPassportFile(f); setPreview(URL.createObjectURL(f)); } }} />
              {preview && <img src={preview} alt="preview" style={{ width: 120, height: 140, objectFit: "cover", marginTop: 10, border: "2px solid #0a4d2e", display: "block", marginLeft: "auto", marginRight: "auto" }} />}
            </div>
            <div style={{ border: "2px solid #0a4d2e", padding: 12, borderRadius: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, color: "#0a4d2e" }}>SSCE - 9 Subjects</h3>
                <select value={sittingCount} onChange={e=>setSittingCount(Number(e.target.value) as 1|2)}><option value={1}>One Sitting</option><option value={2}>Two Sittings</option></select>
              </div>
              <div style={{ background: "#f1f5f9", padding: 10, marginTop: 12, borderRadius: 6 }}>
                <strong>SITTING 1</strong>
                <div style={{ display: "flex", gap: 8, marginTop: 8, marginBottom: 10 }}>
                  <select value={form.ssce_exam1} onChange={e=>setForm({...form, ssce_exam1:e.target.value})}><option>WAEC</option><option>NECO</option><option>NABTEB</option></select>
                  <input placeholder="Exam No" value={form.ssce_no1} onChange={e=>setForm({...form, ssce_no1:e.target.value})} style={{ flex: 1, padding: 6, border: "1px solid #ccc" }} />
                  <input placeholder="Year" value={form.ssce_year1} onChange={e=>setForm({...form, ssce_year1:e.target.value})} style={{ width: 90, padding: 6, border: "1px solid #ccc" }} />
                </div>
                {subjects1.map((row, i)=>(
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                    <span style={{ width: 18 }}>{i+1}</span>
                    <select value={row.subject} onChange={e=>onSubjectChange(1, i, "subject", e.target.value)} style={{ flex: 1, padding: 6 }}><option value="">Select Subject</option>{SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}</select>
                    <select value={row.grade} onChange={e=>onSubjectChange(1, i, "grade", e.target.value)} style={{ width: 80, padding: 6 }}><option value="">Grade</option>{GRADES.map(g=><option key={g} value={g}>{g}</option>)}</select>
                  </div>
                ))}
              </div>
              {sittingCount===2 && (
                <div style={{ background: "#fef9c3", padding: 10, marginTop: 12, borderRadius: 6, border: "2px solid #eab308" }}>
                  <strong>SITTING 2</strong>
                  <div style={{ display: "flex", gap: 8, marginTop: 8, marginBottom: 10 }}>
                    <select value={form.ssce_exam2} onChange={e=>setForm({...form, ssce_exam2:e.target.value})}><option>WAEC</option><option>NECO</option><option>NABTEB</option></select>
                    <input placeholder="Exam No" value={form.ssce_no2} onChange={e=>setForm({...form, ssce_no2:e.target.value})} style={{ flex: 1, padding: 6, border: "1px solid #ccc" }} />
                    <input placeholder="Year" value={form.ssce_year2} onChange={e=>setForm({...form, ssce_year2:e.target.value})} style={{ width: 90, padding: 6, border: "1px solid #ccc" }} />
                  </div>
                  {subjects2.map((row, i)=>(
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                      <span style={{ width: 18 }}>{i+1}</span>
                      <select value={row.subject} onChange={e=>onSubjectChange(2, i, "subject", e.target.value)} style={{ flex: 1, padding: 6 }}><option value="">Select Subject</option>{SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}</select>
                      <select value={row.grade} onChange={e=>onSubjectChange(2, i, "grade", e.target.value)} style={{ width: 80, padding: 6 }}><option value="">Grade</option>{GRADES.map(g=><option key={g} value={g}>{g}</option>)}</select>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button disabled={loading} type="submit" style={{ width: "100%", padding: 14, background: "#0a4d2e", color: "white", fontWeight: 900, border: "none", borderRadius: 8, marginTop: 10 }}>{loading ? "UPLOADING..." : "SUBMIT & PRINT"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

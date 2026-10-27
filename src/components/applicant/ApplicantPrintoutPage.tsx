import { useState } from "react";
import { supabase } from "../../lib/supabase";

const SUBJECTS = [
  "English Language", "Mathematics", "Biology", "Chemistry", "Physics",
  "Geography", "Economics", "Agric Science", "Civic Education", "Government", "Literature", "Further Maths", "Animal Husbandry", "Marketing", "Commerce", "CRS", "IRS"
];
const GRADES = ["A1","B2","B3","C4","C5","C6","D7","E8","F9"] as const;
const EXAM_TYPES = ["WAEC", "NECO", "NABTEB", "NBAIS", "GCE"] as const;

type SubjectRow = { subject: string; grade: string; };
const makeSubjects = (): SubjectRow[] => Array.from({ length: 9 }, () => ({ subject: "", grade: "" }));
const DEFAULT_SUBJECTS = ["English Language", "Mathematics", "Biology", "Chemistry", "Physics", "Geography", "Economics", "Civic Education", "Agric Science"];

export function ApplicationFormModal({ open, isOpen, onClose, onOpenAdmissionChecker }: any) {
  const isModalOpen = open ?? isOpen;
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [resultFile1, setResultFile1] = useState<File | null>(null);
  const [resultFile2, setResultFile2] = useState<File | null>(null);
  const [resultPreview1, setResultPreview1] = useState<string>("");
  const [resultPreview2, setResultPreview2] = useState<string>("");
  const [combineResult, setCombineResult] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    full_name: "", dob: "", gender: "Female", phone: "", email: "", state: "Benue", lga: "Gboko", address: "",
    jamb_reg: "", jamb_score: "", course: "ND/HND Nursing Science",
    ssce_exam1: "WAEC" as typeof EXAM_TYPES[number], ssce_year1: "2024", ssce_no1: "",
    ssce_exam2: "NECO" as typeof EXAM_TYPES[number], ssce_year2: "2023", ssce_no2: "",
  });
  const [subjects1, setSubjects1] = useState<SubjectRow[]>(() => makeSubjects());
  const [subjects2, setSubjects2] = useState<SubjectRow[]>(() => makeSubjects());

  const autoFillAll = (sitting: 1 | 2) => {
    const filled = DEFAULT_SUBJECTS.map(s => ({ subject: s, grade: "" }));
    if (sitting === 1) setSubjects1(filled);
    else setSubjects2(filled);
  };

  const onSubjectChange = (sitting: 1 | 2, idx: number, field: keyof SubjectRow, value: string) => {
    if (sitting === 1) { const copy = [...subjects1]; copy[idx] = { ...copy[idx], [field]: value }; setSubjects1(copy); }
    else { const copy = [...subjects2]; copy[idx] = { ...copy[idx], [field]: value }; setSubjects2(copy); }
  };

  const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passportFile) { alert("Please upload passport"); return; }
    setLoading(true);
    try {
      let photoUrl = "";
      try {
        const safeName = passportFile.name.replace(/\s/g, "_");
        const fileName = `passport-${Date.now()}-${safeName}`;
        const { error } = await supabase.storage.from("applicant-photos").upload(fileName, passportFile);
        if (error) throw error;
        const { data: pub } = supabase.storage.from("applicant-photos").getPublicUrl(fileName);
        photoUrl = pub.publicUrl;
      } catch { photoUrl = await fileToBase64(passportFile); }

      let resultUrl1 = "";
      let resultUrl2 = "";
      if (resultFile1) { try { const fn = `result1-${Date.now()}-${resultFile1.name}`; const { error } = await supabase.storage.from("applicant-results").upload(fn, resultFile1); if (!error) { const { data } = supabase.storage.from("applicant-results").getPublicUrl(fn); resultUrl1 = data.publicUrl; } else { resultUrl1 = await fileToBase64(resultFile1); } } catch { resultUrl1 = await fileToBase64(resultFile1); } }
      if (resultFile2) { try { const fn = `result2-${Date.now()}-${resultFile2.name}`; const { error } = await supabase.storage.from("applicant-results").upload(fn, resultFile2); if (!error) { const { data } = supabase.storage.from("applicant-results").getPublicUrl(fn); resultUrl2 = data.publicUrl; } else { resultUrl2 = await fileToBase64(resultFile2); } } catch { resultUrl2 = await fileToBase64(resultFile2); } }

      const { count } = await supabase.from("lcns_applicants").select("*", { count: "exact", head: true });
      const num = (count || 0) + 8341 + 1;
      const appNo = `LCNS/2026/${num}`;
      const examNo = `LCNS/2026/EXM/${num}`;

      const payload = {
        full_name: form.full_name, application_number: appNo, exam_no: examNo, dob: form.dob, gender: form.gender,
        phone: form.phone, email: form.email, state: form.state, lga: form.lga, address: form.address,
        jamb_reg: form.jamb_reg, jamb_score: form.jamb_score, course: form.course,
        photo_url: photoUrl, passport_url: photoUrl,
        ssce_exam: form.ssce_exam1, ssce_year: form.ssce_year1, ssce_no: form.ssce_no1,
        ssce_sitting_count: combineResult ? 2 : 1,
        result_url_1: resultUrl1, result_url_2: resultUrl2,
        ssce_data: {
          sitting1: { exam: form.ssce_exam1, year: form.ssce_year1, no: form.ssce_no1, subjects: subjects1, result_url: resultUrl1 },
          sitting2: combineResult ? { exam: form.ssce_exam2, year: form.ssce_exam2, no: form.ssce_no2, subjects: subjects2, result_url: resultUrl2 } : null,
          combine: combineResult
        }
      };
      const { data, error } = await supabase.from("lcns_applicants").insert([payload]).select().single();
      if (error) throw error;
      alert("✅ Registered! Form No: " + appNo);
      onClose?.();
      if (onOpenAdmissionChecker) onOpenAdmissionChecker(appNo);
      else window.location.href = `/print/${data.id}`;
    } catch (err: any) { alert("Error: " + (err?.message || "Unknown")); } finally { setLoading(false); }
  };

  if (!isModalOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 9999, overflowY: "auto", padding: 12 }}>
      <div style={{ maxWidth: 960, margin: "0 auto", background: "#fff", padding: 16, borderRadius: 10, position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 10, right: 10, background: "red", color: "white", border: "none", borderRadius: 50, width: 32, height: 32, cursor: "pointer", fontWeight: 900 }}>X</button>
        <h2 style={{ textAlign: "center", color: "#0a4d2e", fontWeight: 900, margin: "0 0 10px 0" }}>LABE COLLEGE - APPLICATION FORM 2026/2027</h2>
        
        <form onSubmit={onSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* PERSONAL */}
            <input placeholder="Full Name (Surname First)" required value={form.full_name} onChange={e=>setForm({...form, full_name:e.target.value})} style={{ padding: 10, border: "1px solid #ccc", borderRadius: 6 }} />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input type="date" required value={form.dob} onChange={e=>setForm({...form, dob:e.target.value})} style={{ flex: 1, padding: 10, border: "1px solid #ccc", borderRadius: 6, minWidth: 140 }} />
              <select value={form.gender} onChange={e=>setForm({...form, gender:e.target.value})} style={{ flex: 1, padding: 10, border: "1px solid #ccc", borderRadius: 6, minWidth: 100 }}><option>Female</option><option>Male</option></select>
              <input placeholder="Phone" required value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} style={{ flex: 1, padding: 10, border: "1px solid #ccc", borderRadius: 6, minWidth: 140 }} />
            </div>
            <input placeholder="Email" required type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} style={{ padding: 10, border: "1px solid #ccc", borderRadius: 6 }} />

            {/* PASSPORT */}
            <div style={{ border: "2px dashed #0a4d2e", padding: 10, textAlign: "center", borderRadius: 8, background: "#f0fdf4" }}>
              <p style={{ fontWeight: 800, margin: "0 0 6px 0", color: "#0a4d2e" }}>📸 Upload Passport Photo</p>
              <input type="file" accept="image/*" required onChange={e=>{ const f = e.target.files?.[0]; if (f) { setPassportFile(f); setPreview(URL.createObjectURL(f)); } }} />
              {preview && <img src={preview} alt="preview" style={{ width: 110, height: 130, objectFit: "cover", marginTop: 8, border: "2px solid #0a4d2e", display: "block", marginLeft: "auto", marginRight: "auto" }} />}
            </div>

            {/* COMBINE RESULT CHECKBOX */}
            <div style={{ background: "#fef9c3", border: "2px solid #eab308", padding: 10, borderRadius: 8, display: "flex", alignItems: "center", gap: 10 }}>
              <input type="checkbox" id="combine" checked={combineResult} onChange={e=>setCombineResult(e.target.checked)} style={{ width: 20, height: 20 }} />
              <label htmlFor="combine" style={{ fontWeight: 900, cursor: "pointer", color: "#854d0e" }}>🔗 COMBINE RESULT? (Use 2 Sittings - WAEC + NECO etc)</label>
              {combineResult && <span style={{ fontSize: 11, background: "#eab308", color: "black", padding: "2px 8px", borderRadius: 4, fontWeight: 800 }}>2 SITTINGS ACTIVE</span>}
            </div>

            {/* SITTING 1 - ALL IN ONE BOX */}
            <div style={{ border: "3px solid #0a4d2e", padding: 12, borderRadius: 10, background: "#f8fafc" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                <h3 style={{ margin: 0, color: "#0a4d2e", fontWeight: 900 }}>📘 SITTING 1 - O'LEVEL RESULT</h3>
                <button type="button" onClick={()=>autoFillAll(1)} style={{ padding: "6px 12px", background: "#ca8a04", color: "black", fontWeight: 900, border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>⚡ AUTO-FILL 9 SUBJECTS</button>
              </div>

              {/* EXAM TYPE + YEAR + NUMBER + UPLOAD - IN ONE ROW */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10, background: "white", padding: 10, borderRadius: 8, border: "1px solid #ccc" }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800 }}>Exam Type</label>
                  <select value={form.ssce_exam1} onChange={e=>setForm({...form, ssce_exam1: e.target.value as any})} style={{ width: "100%", padding: 8, border: "2px solid #0a4d2e", borderRadius: 6, fontWeight: 700 }}>
                    {EXAM_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800 }}>Year</label>
                  <input placeholder="2024" value={form.ssce_year1} onChange={e=>setForm({...form, ssce_year1:e.target.value})} style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 6 }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800 }}>Exam No</label>
                  <input placeholder="e.g. 1234567890" value={form.ssce_no1} onChange={e=>setForm({...form, ssce_no1:e.target.value})} style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 6 }} />
                </div>
                <div style={{ gridColumn: "1 / span 3" }}>
                  <label style={{ fontSize: 11, fontWeight: 800 }}>📤 Upload Result (Sitting 1) - WAEC/NECO/NABTEB Slip</label>
                  <input type="file" accept="image/*,.pdf" onChange={e=>{ const f = e.target.files?.[0]; if (f) { setResultFile1(f); setResultPreview1(f.type.startsWith("image/") ? URL.createObjectURL(f) : ""); } }} style={{ width: "100%", padding: 6, border: "1px dashed #0a4d2e", borderRadius: 6, background: "#fff" }} />
                  {resultPreview1 && <img src={resultPreview1} style={{ width: 100, marginTop: 6, border: "1px solid #ccc" }} />}
                </div>
              </div>

              {/* ALL SUBJECTS + GRADES IN ONE BOX */}
              <div style={{ background: "white", padding: 10, borderRadius: 8, border: "2px solid #0a4d2e" }}>
                <div style={{ display: "grid", gridTemplateColumns: "30px 1fr 100px", gap: 6, marginBottom: 6, fontWeight: 900, fontSize: 12, color: "#0a4d2e" }}>
                  <div>#</div><div>SUBJECT</div><div>GRADE</div>
                </div>
                {subjects1.map((row, i)=>(
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "30px 1fr 100px", gap: 6, marginBottom: 6 }}>
                    <span style={{ paddingTop: 8, fontWeight: 700 }}>{i+1}</span>
                    <select value={row.subject} onChange={e=>onSubjectChange(1, i, "subject", e.target.value)} style={{ padding: 8, border: row.subject ? "2px solid #0a4d2e" : "1px solid #ccc", borderRadius: 6, fontWeight: row.subject ? 700 : 400 }}><option value="">-- Select Subject --</option>{SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}</select>
                    <select value={row.grade} onChange={e=>onSubjectChange(1, i, "grade", e.target.value)} style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6, fontWeight: 700 }}><option value="">Grade</option>{GRADES.map(g=><option key={g} value={g}>{g}</option>)}</select>
                  </div>
                ))}
              </div>
            </div>

            {/* SITTING 2 - ONLY IF COMBINE CHECKED */}
            {combineResult && (
              <div style={{ border: "3px solid #eab308", padding: 12, borderRadius: 10, background: "#fefce8" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                  <h3 style={{ margin: 0, color: "#854d0e", fontWeight: 900 }}>📙 SITTING 2 - COMBINED RESULT</h3>
                  <button type="button" onClick={()=>autoFillAll(2)} style={{ padding: "6px 12px", background: "#eab308", color: "black", fontWeight: 900, border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>⚡ AUTO-FILL SITTING 2</button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10, background: "white", padding: 10, borderRadius: 8, border: "1px solid #eab308" }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800 }}>Exam Type (Sitting 2)</label>
                    <select value={form.ssce_exam2} onChange={e=>setForm({...form, ssce_exam2: e.target.value as any})} style={{ width: "100%", padding: 8, border: "2px solid #eab308", borderRadius: 6, fontWeight: 700 }}>
                      {EXAM_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800 }}>Year</label>
                    <input placeholder="2023" value={form.ssce_year2} onChange={e=>setForm({...form, ssce_year2:e.target.value})} style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 6 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800 }}>Exam No</label>
                    <input placeholder="Exam No" value={form.ssce_no2} onChange={e=>setForm({...form, ssce_no2:e.target.value})} style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 6 }} />
                  </div>
                  <div style={{ gridColumn: "1 / span 3" }}>
                    <label style={{ fontSize: 11, fontWeight: 800 }}>📤 Upload Result (Sitting 2)</label>
                    <input type="file" accept="image/*,.pdf" onChange={e=>{ const f = e.target.files?.[0]; if (f) { setResultFile2(f); setResultPreview2(f.type.startsWith("image/") ? URL.createObjectURL(f) : ""); } }} style={{ width: "100%", padding: 6, border: "1px dashed #eab308", borderRadius: 6, background: "#fff" }} />
                    {resultPreview2 && <img src={resultPreview2} style={{ width: 100, marginTop: 6, border: "1px solid #ccc" }} />}
                  </div>
                </div>

                <div style={{ background: "white", padding: 10, borderRadius: 8, border: "2px solid #eab308" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "30px 1fr 100px", gap: 6, marginBottom: 6, fontWeight: 900, fontSize: 12, color: "#854d0e" }}>
                    <div>#</div><div>SUBJECT</div><div>GRADE</div>
                  </div>
                  {subjects2.map((row, i)=>(
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "30px 1fr 100px", gap: 6, marginBottom: 6 }}>
                      <span style={{ paddingTop: 8, fontWeight: 700 }}>{i+1}</span>
                      <select value={row.subject} onChange={e=>onSubjectChange(2, i, "subject", e.target.value)} style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }}><option value="">-- Select Subject --</option>{SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}</select>
                      <select value={row.grade} onChange={e=>onSubjectChange(2, i, "grade", e.target.value)} style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }}><option value="">Grade</option>{GRADES.map(g=><option key={g} value={g}>{g}</option>)}</select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button disabled={loading} type="submit" style={{ width: "100%", padding: 14, background: "#0a4d2e", color: "white", fontWeight: 900, border: "none", borderRadius: 8, marginTop: 10, fontSize: 16 }}>{loading ? "UPLOADING..." : "✅ SUBMIT & PRINT A4 SLIP"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default ApplicationFormModal;

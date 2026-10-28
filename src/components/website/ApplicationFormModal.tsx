import { useState } from "react";
import { supabase } from "../../lib/supabase";

const SUBJECTS = [
  "English Language","Mathematics","Biology","Chemistry","Physics",
  "Civic Education","Economics","Geography","Government","Literature in English",
  "Commerce","Financial Accounting","Agricultural Science","Further Mathematics",
  "Christian Religious Studies","Islamic Religious Studies","History","Marketing",
  "Computer Studies","Data Processing","Agric Science","Yoruba Language","Igbo Language","Hausa Language","French","Fine Arts","Animal Husbandry"
];
const GRADES = ["A1","B2","B3","C4","C5","C6","D7","E8","F9"] as const;
type SubjectRow = { subject: string; grade: string; };
const makeSubjects = (): SubjectRow[] => Array.from({ length: 9 }, () => ({ subject: "", grade: "" }));
const DEFAULT_SUBJECTS = ["English Language","Mathematics","Biology","Chemistry","Physics","Civic Education","Economics","Geography","Agric Science"];

export function ApplicationFormModal({ open, isOpen, onClose, onOpenAdmissionChecker }: any) {
  const isModalOpen = open ?? isOpen;
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [sittingCount, setSittingCount] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [form, setForm] = useState({
    full_name: "", dob: "", gender: "Female", phone: "", email: "", state: "Benue", lga: "Gboko", address: "",
    jamb_reg: "", jamb_score: "", jamb_year: "2024", course: "ND/HND Nursing Science",
    father_name: "", father_phone: "", mother_name: "", mother_phone: "",
    ssce_exam1: "WAEC", ssce_year1: "2024", ssce_no1: "",
    ssce_exam2: "NECO", ssce_year2: "2024", ssce_no2: "",
  });

  const [subjects1, setSubjects1] = useState<SubjectRow[]>(() => makeSubjects());
  const [subjects2, setSubjects2] = useState<SubjectRow[]>(() => makeSubjects());

  const autoFillAll = (sitting: 1 | 2) => {
    const filled = DEFAULT_SUBJECTS.map(s => ({ subject: s, grade: "" }));
    if (sitting === 1) setSubjects1(filled); else setSubjects2(filled);
  };
  const onSubjectChange = (sitting: 1 | 2, idx: number, field: keyof SubjectRow, value: string) => {
    const list = sitting === 1 ? subjects1 : subjects2;
    const setter = sitting === 1 ? setSubjects1 : setSubjects2;
    const copy = [...list]; copy[idx] = { ...copy[idx], [field]: value }; setter(copy);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passportFile) { alert("Please upload passport"); return; }
    if (!agreed) { alert("Please accept declaration"); return; }
    setLoading(true);
    try {
      const fileName = `passport-${Date.now()}-${passportFile.name.replace(/\s/g, "_")}`;
      const { error: upErr } = await supabase.storage.from("applicant-photos").upload(fileName, passportFile);
      if (upErr) throw new Error(upErr.message);
      const { data: pub } = supabase.storage.from("applicant-photos").getPublicUrl(fileName);
      const photoUrl = pub.publicUrl;
      const { count } = await supabase.from("lcns_applicants").select("*", { count: "exact", head: true });
      const num = (count || 0) + 8341 + 1;
      const appNo = `LCNS/2026/${num}`;
      const examNo = `LCNS/2026/EXM/${num}`;
      const payload = {
        full_name: form.full_name, application_number: appNo, exam_no: examNo,
        dob: form.dob, gender: form.gender, phone: form.phone, email: form.email,
        state: form.state, lga: form.lga, address: form.address,
        jamb_reg: form.jamb_reg, jamb_score: form.jamb_score, jamb_year: form.jamb_year, course: form.course,
        father_name: form.father_name, father_phone: form.father_phone, mother_name: form.mother_name, mother_phone: form.mother_phone,
        photo_url: photoUrl, passport_url: photoUrl,
        ssce_exam: form.ssce_exam1, ssce_year: form.ssce_year1, ssce_no: form.ssce_no1, ssce_sitting_count: sittingCount,
        ssce_data: {
          sitting1: { exam: form.ssce_exam1, year: form.ssce_year1, no: form.ssce_no1, subjects: subjects1 },
          sitting2: sittingCount === 2 ? { exam: form.ssce_exam2, year: form.ssce_year2, no: form.ssce_no2, subjects: subjects2 } : null
        }
      };
      const { data, error } = await supabase.from("lcns_applicants").insert([payload]).select().single();
      if (error) throw error;
      alert("Registered! Form No: " + appNo);
      onClose?.();
      if (onOpenAdmissionChecker) onOpenAdmissionChecker(appNo); else window.location.href = `/print/${data.id}`;
    } catch (err: any) { alert("Error: " + (err?.message || "Unknown")); } finally { setLoading(false); }
  };

  if (!isModalOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 9999, overflowY: "auto", padding: 16 }}>
      <div style={{ maxWidth: 900, margin: "0 auto", background: "#fff", padding: 20, borderRadius: 10, position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 10, right: 10, background: "red", color: "white", border: "none", borderRadius: 50, width: 32, height: 32, cursor: "pointer" }}>X</button>
        <h2 style={{ textAlign: "center", color: "#0a4d2e", fontWeight: 900, marginBottom: 20 }}>LABE COLLEGE - APPLICATION FORM</h2>
        
        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* 1. BIODATA */}
          <div style={{ border: "2px solid #0a4d2e", padding: 16, borderRadius: 8 }}>
            <h3 style={{ margin: "0 0 12px 0", color: "#0a4d2e", borderBottom: "2px solid #0a4d2e", paddingBottom: 6 }}>1. BIODATA INFORMATION</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input placeholder="Full Name (Surname First) *" required value={form.full_name} onChange={e=>setForm({...form, full_name:e.target.value})} style={{ padding: 12, border: "1px solid #ccc", borderRadius: 6 }} />
              <div style={{ display: "flex", gap: 10 }}>
                <input type="date" required value={form.dob} onChange={e=>setForm({...form, dob:e.target.value})} style={{ flex: 1, padding: 12, border: "1px solid #ccc", borderRadius: 6 }} />
                <select value={form.gender} onChange={e=>setForm({...form, gender:e.target.value})} style={{ flex: 1, padding: 12, border: "1px solid #ccc", borderRadius: 6 }}><option>Female</option><option>Male</option></select>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <input placeholder="Phone Number *" required value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} style={{ flex: 1, padding: 12, border: "1px solid #ccc", borderRadius: 6 }} />
                <input placeholder="Email *" required type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} style={{ flex: 1, padding: 12, border: "1px solid #ccc", borderRadius: 6 }} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <input placeholder="State of Origin" value={form.state} onChange={e=>setForm({...form, state:e.target.value})} style={{ flex: 1, padding: 12, border: "1px solid #ccc", borderRadius: 6 }} />
                <input placeholder="LGA" value={form.lga} onChange={e=>setForm({...form, lga:e.target.value})} style={{ flex: 1, padding: 12, border: "1px solid #ccc", borderRadius: 6 }} />
              </div>
              <input placeholder="Home Address" value={form.address} onChange={e=>setForm({...form, address:e.target.value})} style={{ padding: 12, border: "1px solid #ccc", borderRadius: 6 }} />
              <div style={{ display: "flex", gap: 10 }}>
                <input placeholder="Father's Name" value={form.father_name} onChange={e=>setForm({...form, father_name:e.target.value})} style={{ flex: 1, padding: 12, border: "1px solid #ccc", borderRadius: 6 }} />
                <input placeholder="Father's Phone" value={form.father_phone} onChange={e=>setForm({...form, father_phone:e.target.value})} style={{ flex: 1, padding: 12, border: "1px solid #ccc", borderRadius: 6 }} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <input placeholder="Mother's Name" value={form.mother_name} onChange={e=>setForm({...form, mother_name:e.target.value})} style={{ flex: 1, padding: 12, border: "1px solid #ccc", borderRadius: 6 }} />
                <input placeholder="Mother's Phone" value={form.mother_phone} onChange={e=>setForm({...form, mother_phone:e.target.value})} style={{ flex: 1, padding: 12, border: "1px solid #ccc", borderRadius: 6 }} />
              </div>
              <div style={{ border: "2px dashed #0a4d2e", padding: 12, textAlign: "center", borderRadius: 8, background: "#f0fdf4" }}>
                <p style={{ fontWeight: 700, margin: "0 0 6px 0" }}>Upload Passport Photo *</p>
                <input type="file" accept="image/*" required onChange={e=>{ const f = e.target.files?.[0]; if(f){ setPassportFile(f); setPreview(URL.createObjectURL(f)); } }} />
                {preview && <img src={preview} alt="preview" style={{ width: 120, height: 140, objectFit: "cover", marginTop: 10, border: "2px solid #0a4d2e", display: "block", marginLeft: "auto", marginRight: "auto" }} />}
              </div>
            </div>
          </div>

          {/* 2. SSCE INFORMATION */}
          <div style={{ border: "2px solid #0a4d2e", padding: 16, borderRadius: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #0a4d2e", paddingBottom: 6, marginBottom: 12 }}>
              <h3 style={{ margin: 0, color: "#0a4d2e" }}>2. SSCE INFORMATION</h3>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={()=>autoFillAll(1)} style={{ padding: "6px 12px", background: "#ca8a04", color: "#000", fontWeight: 900, border: "none", borderRadius: 6, cursor: "pointer" }}>⚡ AUTO-FILL</button>
                <select value={sittingCount} onChange={e=>setSittingCount(Number(e.target.value) as 1|2)} style={{ padding: 6, borderRadius: 6 }}><option value={1}>One Sitting</option><option value={2}>Two Sittings</option></select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <select value={form.ssce_exam1} onChange={e=>setForm({...form, ssce_exam1:e.target.value})} style={{ flex: 1, padding: 10, border: "1px solid #ccc", borderRadius: 6 }}><option>WAEC</option><option>NECO</option><option>NABTEB</option></select>
              <input placeholder="Exam Year" value={form.ssce_year1} onChange={e=>setForm({...form, ssce_year1:e.target.value})} style={{ flex: 1, padding: 10, border: "1px solid #ccc", borderRadius: 6 }} />
              <input placeholder="Exam No" value={form.ssce_no1} onChange={e=>setForm({...form, ssce_no1:e.target.value})} style={{ flex: 1, padding: 10, border: "1px solid #ccc", borderRadius: 6 }} />
            </div>
            <div style={{ background: "#f1f5f9", padding: 10, borderRadius: 6 }}>
              {subjects1.map((row, i)=>(
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                  <span style={{ width: 18, fontWeight: 700 }}>{i+1}</span>
                  <select value={row.subject} onChange={e=>onSubjectChange(1, i, "subject", e.target.value)} style={{ flex: 1, padding: 6 }}><option value="">Select Subject</option>{SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}</select>
                  <select value={row.grade} onChange={e=>onSubjectChange(1, i, "grade", e.target.value)} style={{ width: 80, padding: 6 }}><option value="">Grade</option>{GRADES.map(g=><option key={g} value={g}>{g}</option>)}</select>
                </div>
              ))}
            </div>
            {sittingCount===2 && (
              <div style={{ background: "#fef9c3", padding: 10, marginTop: 12, borderRadius: 6, border: "2px solid #eab308" }}>
                <strong>SITTING 2</strong>
                <div style={{ display: "flex", gap: 10, margin: "8px 0" }}>
                  <select value={form.ssce_exam2} onChange={e=>setForm({...form, ssce_exam2:e.target.value})} style={{ flex: 1, padding: 10, border: "1px solid #ccc", borderRadius: 6 }}><option>WAEC</option><option>NECO</option><option>NABTEB</option></select>
                  <input placeholder="Exam Year" value={form.ssce_year2} onChange={e=>setForm({...form, ssce_year2:e.target.value})} style={{ flex: 1, padding: 10, border: "1px solid #ccc", borderRadius: 6 }} />
                  <input placeholder="Exam No" value={form.ssce_no2} onChange={e=>setForm({...form, ssce_no2:e.target.value})} style={{ flex: 1, padding: 10, border: "1px solid #ccc", borderRadius: 6 }} />
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

          {/* 3. JAMB INFORMATION */}
          <div style={{ border: "2px solid #0a4d2e", padding: 16, borderRadius: 8 }}>
            <h3 style={{ margin: "0 0 12px 0", color: "#0a4d2e", borderBottom: "2px solid #0a4d2e", paddingBottom: 6 }}>3. JAMB INFORMATION</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 10 }}>
                <input placeholder="JAMB Reg Number" value={form.jamb_reg} onChange={e=>setForm({...form, jamb_reg:e.target.value})} style={{ flex: 1, padding: 12, border: "1px solid #ccc", borderRadius: 6 }} />
                <input placeholder="JAMB Score" value={form.jamb_score} onChange={e=>setForm({...form, jamb_score:e.target.value})} style={{ flex: 1, padding: 12, border: "1px solid #ccc", borderRadius: 6 }} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <input placeholder="JAMB Year" value={form.jamb_year} onChange={e=>setForm({...form, jamb_year:e.target.value})} style={{ flex: 1, padding: 12, border: "1px solid #ccc", borderRadius: 6 }} />
                <select value={form.course} onChange={e=>setForm({...form, course:e.target.value})} style={{ flex: 1, padding: 12, border: "1px solid #ccc", borderRadius: 6 }}>
                  <option>ND/HND Nursing Science</option><option>ND Community Health</option><option>ND Public Health</option>
                </select>
              </div>
            </div>
          </div>

          {/* 4. DECLARATION */}
          <div style={{ border: "2px solid #dc2626", padding: 16, borderRadius: 8, background: "#fef2f2" }}>
            <h3 style={{ margin: "0 0 8px 0", color: "#dc2626" }}>4. DECLARATION</h3>
            <p style={{ fontSize: 13, lineHeight: "1.5", margin: "0 0 10px 0" }}>
              I hereby declare that all information provided by me in this application is true and correct to the best of my knowledge. I understand that any false information will lead to automatic disqualification. I agree to abide by the rules and regulations of Labe College of Nursing Sciences.
            </p>
            <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 700, cursor: "pointer" }}>
              <input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)} style={{ width: 18, height: 18 }} />
              I agree and accept the above declaration
            </label>
          </div>

          {/* 5. SUBMIT */}
          <button disabled={loading} type="submit" style={{ width: "100%", padding: 16, background: agreed ? "#0a4d2e" : "#9ca3af", color: "white", fontWeight: 900, border: "none", borderRadius: 8, fontSize: 16, cursor: agreed ? "pointer" : "not-allowed" }}>
            {loading ? "SUBMITTING..." : "SUBMIT & PRINT APPLICATION"}
          </button>
        </form>
      </div>
    </div>
  );
}
export default ApplicationFormModal;

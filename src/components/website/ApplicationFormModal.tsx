import { useState } from "react";
import { supabase } from "../../lib/supabase";

const SCHOOL_LOGO = "/logo.png";

const SUBJECTS = [
  "English Language","Mathematics","Biology","Chemistry","Physics",
  "Civic Education","Economics","Geography","Government","Literature in English",
  "Commerce","Financial Accounting","Agricultural Science","Further Mathematics",
  "Christian Religious Studies","Islamic Religious Studies","History","Marketing",
  "Computer Studies","Data Processing","Agric Science","Animal Husbandry","Health Education",
  "Yoruba Language","Igbo Language","Hausa Language","French","Fine Arts"
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
    sponsor_name: "", sponsor_phone: "", sponsor_address: "", sponsor_relationship: "Father",
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

  // FIXED - NO BUCKET NEEDED
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passportFile) { alert("Please upload passport"); return; }
    if (!agreed) { alert("Please accept declaration"); return; }
    setLoading(true);
    try {
      // Convert to base64 - fixes Bucket not found
      const photoUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(passportFile);
      });

      const { count } = await supabase.from("lcns_applicants").select("*", { count: "exact", head: true });
      const num = (count || 0) + 8341 + 1;
      const appNo = `LCNS/2026/${num}`;
      const examNo = `LCNS/2026/EXM/${num}`;
      
      const payload = {
        full_name: form.full_name, application_number: appNo, exam_no: examNo,
        dob: form.dob, gender: form.gender, phone: form.phone, email: form.email,
        state: form.state, lga: form.lga, address: form.address,
        jamb_reg: form.jamb_reg, jamb_score: form.jamb_score, jamb_year: form.jamb_year, course: form.course,
        sponsor_name: form.sponsor_name, sponsor_phone: form.sponsor_phone, sponsor_address: form.sponsor_address, sponsor_relationship: form.sponsor_relationship,
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
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, overflowY: "auto", padding: 16, background: "linear-gradient(135deg, #022c22 0%, #065f46 25%, #10b981 70%, #bbf7d0 100%)" }}>
      <div style={{ maxWidth: 920, margin: "20px auto", background: "rgba(255,255,255,0.97)", borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", border: "4px solid #facc15" }}>
        <div style={{ background: "linear-gradient(90deg, #052e16, #15803d)", padding: "20px 24px", display: "flex", alignItems: "center", gap: 16, color: "white" }}>
          <img src={SCHOOL_LOGO} alt="School Logo" style={{ width: 70, height: 70, borderRadius: "50%", background: "white", padding: 6, objectFit: "contain", border: "3px solid #facc15" }} onError={(e)=>{ (e.target as HTMLImageElement).style.display='none' }} />
          <div>
            <h2 style={{ margin: 0, fontWeight: 900, fontSize: 22 }}>LABE COLLEGE OF NURSING SCIENCES</h2>
            <p style={{ margin: "4px 0 0 0", fontSize: 13, opacity: 0.9 }}>GBOKO, BENUE STATE - 2026/2027 ADMISSION FORM</p>
          </div>
          <div style={{ marginLeft: "auto", background: "#facc15", color: "#052e16", padding: "6px 12px", borderRadius: 20, fontWeight: 900, fontSize: 12 }}>OFFICIAL</div>
        </div>

        <div style={{ padding: 20 }}>
        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ background: "#f0fdf4", border: "2px solid #16a34a", padding: 16, borderRadius: 12 }}>
            <h3 style={{ margin: "0 0 12px 0", color: "#052e16", background: "#bbf7d0", padding: "8px 12px", borderRadius: 8, borderLeft: "5px solid #16a34a" }}>1. BIODATA INFORMATION</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input placeholder="Full Name (Surname First) *" required value={form.full_name} onChange={e=>setForm({...form, full_name:e.target.value})} style={{ padding: 12, border: "1.5px solid #86efac", borderRadius: 8, background: "white" }} />
              <div style={{ display: "flex", gap: 10 }}><input type="date" required value={form.dob} onChange={e=>setForm({...form, dob:e.target.value})} style={{ flex: 1, padding: 12, border: "1.5px solid #86efac", borderRadius: 8 }} /><select value={form.gender} onChange={e=>setForm({...form, gender:e.target.value})} style={{ flex: 1, padding: 12, border: "1.5px solid #86efac", borderRadius: 8 }}><option>Female</option><option>Male</option></select></div>
              <div style={{ display: "flex", gap: 10 }}><input placeholder="Phone *" required value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} style={{ flex: 1, padding: 12, border: "1.5px solid #86efac", borderRadius: 8 }} /><input placeholder="Email *" required type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} style={{ flex: 1, padding: 12, border: "1.5px solid #86efac", borderRadius: 8 }} /></div>
              <div style={{ display: "flex", gap: 10 }}><input placeholder="State" value={form.state} onChange={e=>setForm({...form, state:e.target.value})} style={{ flex: 1, padding: 12, border: "1.5px solid #86efac", borderRadius: 8 }} /><input placeholder="LGA" value={form.lga} onChange={e=>setForm({...form, lga:e.target.value})} style={{ flex: 1, padding: 12, border: "1.5px solid #86efac", borderRadius: 8 }} /></div>
              <input placeholder="Home Address" value={form.address} onChange={e=>setForm({...form, address:e.target.value})} style={{ padding: 12, border: "1.5px solid #86efac", borderRadius: 8 }} />
              <div style={{ border: "2px dashed #16a34a", padding: 14, textAlign: "center", borderRadius: 10, background: "white" }}>
                <p style={{ fontWeight: 800, margin: "0 0 8px 0", color: "#052e16" }}>Upload Passport Photo *</p>
                <input type="file" accept="image/*" required onChange={e=>{ const f = e.target.files?.[0]; if(f){ setPassportFile(f); setPreview(URL.createObjectURL(f)); } }} />
                {preview && <img src={preview} alt="preview" style={{ width: 130, height: 150, objectFit: "cover", marginTop: 12, borderRadius: 10, border: "3px solid #16a34a", display: "block", marginLeft: "auto", marginRight: "auto" }} />}
              </div>
            </div>
          </div>

          <div style={{ background: "#fffbeb", border: "2px solid #f59e0b", padding: 16, borderRadius: 12 }}>
            <h3 style={{ margin: "0 0 12px 0", color: "#78350f", background: "#fef3c7", padding: "8px 12px", borderRadius: 8, borderLeft: "5px solid #f59e0b" }}>SPONSOR / GUARDIAN INFORMATION</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 10 }}><input placeholder="Sponsor Full Name *" required value={form.sponsor_name} onChange={e=>setForm({...form, sponsor_name:e.target.value})} style={{ flex: 2, padding: 12, border: "1.5px solid #fcd34d", borderRadius: 8 }} /><select value={form.sponsor_relationship} onChange={e=>setForm({...form, sponsor_relationship:e.target.value})} style={{ flex: 1, padding: 12, border: "1.5px solid #fcd34d", borderRadius: 8 }}><option>Father</option><option>Mother</option><option>Guardian</option><option>Brother</option><option>Sister</option><option>Other</option></select></div>
              <input placeholder="Sponsor Phone Number *" required value={form.sponsor_phone} onChange={e=>setForm({...form, sponsor_phone:e.target.value})} style={{ padding: 12, border: "1.5px solid #fcd34d", borderRadius: 8 }} />
              <input placeholder="Sponsor Address *" required value={form.sponsor_address} onChange={e=>setForm({...form, sponsor_address:e.target.value})} style={{ padding: 12, border: "1.5px solid #fcd34d", borderRadius: 8 }} />
            </div>
          </div>

          <div style={{ background: "#f0fdf4", border: "2px solid #16a34a", padding: 16, borderRadius: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#bbf7d0", padding: "8px 12px", borderRadius: 8, borderLeft: "5px solid #16a34a", marginBottom: 12 }}><h3 style={{ margin: 0, color: "#052e16" }}>2. SSCE INFORMATION</h3><div style={{ display: "flex", gap: 8 }}><button type="button" onClick={()=>autoFillAll(1)} style={{ padding: "6px 12px", background: "#052e16", color: "#facc15", fontWeight: 900, border: "none", borderRadius: 6, cursor: "pointer" }}>⚡ AUTO-FILL</button><select value={sittingCount} onChange={e=>setSittingCount(Number(e.target.value) as 1|2)} style={{ padding: 6, borderRadius: 6 }}><option value={1}>One Sitting</option><option value={2}>Two Sittings</option></select></div></div>
            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}><select value={form.ssce_exam1} onChange={e=>setForm({...form, ssce_exam1:e.target.value})} style={{ flex: 1, padding: 10, borderRadius: 6, border: "1.5px solid #86efac" }}><option>WAEC</option><option>NECO</option><option>NABTEB</option></select><input placeholder="Year" value={form.ssce_year1} onChange={e=>setForm({...form, ssce_year1:e.target.value})} style={{ flex: 1, padding: 10, borderRadius: 6, border: "1.5px solid #86efac" }} /><input placeholder="Exam No" value={form.ssce_no1} onChange={e=>setForm({...form, ssce_no1:e.target.value})} style={{ flex: 1, padding: 10, borderRadius: 6, border: "1.5px solid #86efac" }} /></div>
            <div style={{ background: "white", padding: 10, borderRadius: 8, border: "1px solid #bbf7d0" }}>{subjects1.map((row, i)=>(<div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}><span style={{ width: 18, fontWeight: 700, color: "#052e16" }}>{i+1}</span><select value={row.subject} onChange={e=>onSubjectChange(1, i, "subject", e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #d1d5db" }}><option value="">Select Subject</option>{SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}</select><select value={row.grade} onChange={e=>onSubjectChange(1, i, "grade", e.target.value)} style={{ width: 85, padding: 8, borderRadius: 6, border: "1px solid #d1d5db" }}><option value="">Grade</option>{GRADES.map(g=><option key={g} value={g}>{g}</option>)}</select></div>))}</div>
          </div>

          <div style={{ background: "#eff6ff", border: "2px solid #3b82f6", padding: 16, borderRadius: 12 }}>
            <h3 style={{ margin: "0 0 12px 0", color: "#1e3a8a", background: "#dbeafe", padding: "8px 12px", borderRadius: 8, borderLeft: "5px solid #3b82f6" }}>3. JAMB INFORMATION</h3>
            <div style={{ display: "flex", gap: 10 }}><input placeholder="JAMB Reg Number" value={form.jamb_reg} onChange={e=>setForm({...form, jamb_reg:e.target.value})} style={{ flex: 1, padding: 12, borderRadius: 8, border: "1.5px solid #93c5fd" }} /><input placeholder="JAMB Score" value={form.jamb_score} onChange={e=>setForm({...form, jamb_score:e.target.value})} style={{ flex: 1, padding: 12, borderRadius: 8, border: "1.5px solid #93c5fd" }} /></div>
          </div>

          <div style={{ background: "linear-gradient(90deg, #fef2f2, #fff)", border: "2px solid #dc2626", padding: 16, borderRadius: 12 }}>
            <h3 style={{ margin: "0 0 8px 0", color: "#991b1b" }}>4. DECLARATION</h3>
            <p style={{ fontSize: 13, lineHeight: 1.5, margin: "0 0 12px 0", color: "#444" }}>I declare that all information provided is true. I understand that false information leads to disqualification.</p>
            <label style={{ display: "flex", gap: 10, alignItems: "center", fontWeight: 800, cursor: "pointer", background: "white", padding: "10px 12px", borderRadius: 8, border: "1px solid #fecaca" }}><input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)} style={{ width: 20, height: 20 }} />I accept the declaration</label>
          </div>

          <button disabled={loading} type="submit" style={{ width: "100%", padding: 16, background: agreed ? "linear-gradient(90deg, #052e16, #16a34a)" : "#9ca3af", color: "white", fontWeight: 900, border: "none", borderRadius: 12, fontSize: 16, cursor: agreed ? "pointer" : "not-allowed" }}>{loading ? "SUBMITTING..." : "SUBMIT & PRINT APPLICATION"}</button>
        </form>
        </div>
      </div>
    </div>
  );
}
export default ApplicationFormModal;

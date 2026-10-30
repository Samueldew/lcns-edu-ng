import { useState } from "react";
import { supabase } from "../../lib/supabase";

const SCHOOL_LOGO = "https://liqwfikatnkndbdbdarx.supabase.co/storage/v1/object/public/school-assets/logo-main-1792311488006.jpg";
const SUBJECTS = ["English Language","Mathematics","Biology","Chemistry","Physics","Civic Education","Economics","Geography","Government","Literature in English","Commerce","Financial Accounting","Agricultural Science","Further Mathematics","Christian Religious Studies","Islamic Religious Studies","History","Marketing","Computer Studies","Data Processing"];
const GRADES = ["A1","B2","B3","C4","C5","C6","D7","E8","F9"] as const;
type SubjectRow = { subject: string; grade: string; };
const makeSubjects = (): SubjectRow[] => Array.from({ length: 9 }, () => ({ subject: "", grade: "" }));
const DEFAULT_SUBJECTS = ["English Language","Mathematics","Biology","Chemistry","Physics","Civic Education","Economics","Geography","Agric Science"];

export function ApplicationFormModal({ open, isOpen, onClose, onOpenAdmissionChecker }: any) {
  const isModalOpen = open ?? isOpen;
  const [step, setStep] = useState(1);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [proofPreview, setProofPreview] = useState<string>("");
  const [sittingCount, setSittingCount] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [generatedNo, setGeneratedNo] = useState<string>("");

  const [form, setForm] = useState({
    full_name: "", dob: "", gender: "Female", phone: "", email: "", state: "Benue", lga: "Gboko", address: "",
    jamb_reg: "", jamb_score: "", jamb_year: "2024", course: "ND/HND Nursing Science",
    sponsor_name: "", sponsor_phone: "", sponsor_address: "", sponsor_relationship: "Father",
    ssce_exam1: "WAEC", ssce_year1: "2024", ssce_no1: "", ssce_exam2: "NECO", ssce_year2: "2024", ssce_no2: "",
  });
  const [subjects1, setSubjects1] = useState<SubjectRow[]>(() => makeSubjects());
  const [subjects2, setSubjects2] = useState<SubjectRow[]>(() => makeSubjects());

  const onSubjectChange = (sitting: 1 | 2, idx: number, field: keyof SubjectRow, value: string) => {
    const list = sitting === 1 ? subjects1 : subjects2;
    const setter = sitting === 1 ? setSubjects1 : setSubjects2;
    const copy = [...list]; copy[idx] = { ...copy[idx], [field]: value }; setter(copy);
  };

  const fileToBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const next = () => {
    if(step === 1 && (!form.full_name || !form.dob || !form.phone)) { alert("Fill Biodata *"); return; }
    if(step === 2 && subjects1.filter(s=>s.subject && s.grade).length < 5) { alert("Fill at least 5 SSCE subjects with grades"); return; }
    if(step === 4 && (!form.sponsor_name || !form.sponsor_phone)) { alert("Fill Sponsor info"); return; }
    if(step === 5 && !passportFile) { alert("Upload Passport"); return; }
    if(step === 5 && !proofFile) { alert("Upload Proof of Payment (Bank Teller) - PNG/PDF"); return; }
    setStep(s => s+1);
  };
  const prev = () => setStep(s => s-1);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) { alert("Accept declaration"); return; }
    if (!passportFile || !proofFile) { alert("Upload Passport and Proof"); return; }
    setLoading(true);
    try {
      const photoUrl = await fileToBase64(passportFile);
      const proofUrl = await fileToBase64(proofFile);
      
      const { count } = await supabase.from("lcns_applicants").select("*", { count: "exact", head: true });
      const num = (count || 0) + 8341 + 1;
      const appNo = `LCNS/2026/${num}`;
      const examNo = `LCNS/2026/EXM/${num}`;

      const payload = {
        id: crypto.randomUUID(),
        full_name: form.full_name, 
        application_number: appNo, 
        exam_no: examNo,
        dob: form.dob, gender: form.gender, phone: form.phone, email: form.email,
        state: form.state, lga: form.lga, address: form.address,
        jamb_reg: form.jamb_reg, jamb_score: form.jamb_score, jamb_year: form.jamb_year, course: form.course,
        sponsor_name: form.sponsor_name, sponsor_phone: form.sponsor_phone, sponsor_address: form.sponsor_address, sponsor_relationship: form.sponsor_relationship,
        photo_url: photoUrl, passport_url: photoUrl, proof_url: proofUrl, payment_proof_url: proofUrl,
        ssce_exam: form.ssce_exam1, ssce_year: form.ssce_year1, ssce_no: form.ssce_no1, ssce_sitting_count: sittingCount,
        status: "PENDING_BURSAR", bursar_status: "PENDING", admission_status: "PENDING",
        ssce_data: { 
          sitting1: { exam: form.ssce_exam1, year: form.ssce_year1, no: form.ssce_no1, subjects: subjects1 }, 
          sitting2: sittingCount === 2 ? { exam: form.ssce_exam2, year: form.ssce_year2, no: form.ssce_no2, subjects: subjects2 } : null,
          jamb: { reg: form.jamb_reg, score: form.jamb_score, year: form.jamb_year }
        }
      };
      
      const { error } = await supabase.from("lcns_applicants").insert([payload]);
      if (error) throw error;
      
      setGeneratedNo(appNo);
      alert(`SUCCESS! Your Application No is: ${appNo}\n\nCopy it. Use it to Check Admission Status.`);
      onClose?.();
      if (onOpenAdmissionChecker) onOpenAdmissionChecker(appNo); 

    } catch (err: any) { 
      alert("Error: " + (err?.message || "Unknown")); 
    } finally { 
      setLoading(false); 
    }
  };

  if (!isModalOpen) return null;
  const progress = (step/6)*100;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, overflowY: "auto", padding: 16, background: "linear-gradient(135deg, #022c22, #065f46, #10b981)" }}>
      <div style={{ maxWidth: 920, margin: "20px auto", background: "white", borderRadius: 16, overflow: "hidden", border: "4px solid #facc15" }}>
        <div style={{ background: "linear-gradient(90deg, #052e16, #16a34a)", padding: 16, display: "flex", alignItems: "center", gap: 14, color: "white" }}>
          <img src={SCHOOL_LOGO} alt="Logo" style={{ width: 60, height: 60, borderRadius: 50, background: "white", padding: 4, border: "3px solid #facc15" }} />
          <div style={{ flex:1 }}><h2 style={{ margin: 0, fontWeight: 900, fontSize: 18 }}>LABE COLLEGE OF NURSING SCIENCES GBOKO</h2><p style={{ margin: 0, fontSize: 11 }}>Step {step} of 6 - {["Biodata","SSCE Info","JAMB Info","Sponsor Info","Uploads","Declaration"][step-1]}</p>
          <div style={{ background: "rgba(255,255,255,0.3)", height: 6, borderRadius: 10, marginTop: 6 }}><div style={{ width: `${progress}%`, height: 6, background: "#facc15", borderRadius: 10, transition: "0.3s" }} /></div>
          </div>
          <button onClick={onClose} style={{ background: "white", color: "#052e16", border: "none", padding: "6px 12px", borderRadius: 8, fontWeight: 900 }}>X</button>
        </div>

        <div style={{ padding: 20 }}>
        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {step === 1 && (
            <div style={{ background: "#f0fdf4", border: "2px solid #16a34a", padding: 16, borderRadius: 12 }}>
              <h3 style={{ margin: "0 0 10px 0", color: "#052e16", background: "#bbf7d0", padding: 8, borderRadius: 8, borderLeft: "5px solid #16a34a" }}>1. BIODATA</h3>
              <input placeholder="Full Name *" required value={form.full_name} onChange={e=>setForm({...form, full_name:e.target.value})} style={{ width: "100%", padding: 12, borderRadius: 8, border: "1.5px solid #86efac", marginBottom: 8 }} />
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}><input type="date" required value={form.dob} onChange={e=>setForm({...form, dob:e.target.value})} style={{ flex: 1, padding: 12, borderRadius: 8, border: "1.5px solid #86efac" }} /><select value={form.gender} onChange={e=>setForm({...form, gender:e.target.value})} style={{ flex: 1, padding: 12, borderRadius: 8, border: "1.5px solid #86efac" }}><option>Female</option><option>Male</option></select></div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}><input placeholder="Phone *" required value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} style={{ flex: 1, padding: 12, borderRadius: 8, border: "1.5px solid #86efac" }} /><input placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} style={{ flex: 1, padding: 12, borderRadius: 8, border: "1.5px solid #86efac" }} /></div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}><input placeholder="State" value={form.state} onChange={e=>setForm({...form, state:e.target.value})} style={{ flex: 1, padding: 12, borderRadius: 8, border: "1.5px solid #86efac" }} /><input placeholder="LGA" value={form.lga} onChange={e=>setForm({...form, lga:e.target.value})} style={{ flex: 1, padding: 12, borderRadius: 8, border: "1.5px solid #86efac" }} /></div>
              <textarea placeholder="Address *" required value={form.address} onChange={e=>setForm({...form, address:e.target.value})} style={{ width: "100%", padding: 12, borderRadius: 8, border: "1.5px solid #86efac" }} />
            </div>
          )}

          {step === 2 && (
            <div style={{ background: "#f0fdf4", border: "2px solid #16a34a", padding: 16, borderRadius: 12 }}>
              <h3 style={{ margin: "0 0 10px 0", background: "#bbf7d0", padding: 8, borderRadius: 8, borderLeft: "5px solid #16a34a" }}>2. SSCE INFORMATION - 9 Subjects</h3>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}><select value={form.ssce_exam1} onChange={e=>setForm({...form, ssce_exam1:e.target.value})} style={{ flex:1, padding: 8 }}><option>WAEC</option><option>NECO</option><option>NABTEB</option></select><input placeholder="Exam No" value={form.ssce_no1} onChange={e=>setForm({...form, ssce_no1:e.target.value})} style={{ flex:1, padding: 8 }} /><input placeholder="Year" value={form.ssce_year1} onChange={e=>setForm({...form, ssce_year1:e.target.value})} style={{ width: 80, padding: 8 }} /></div>
              {subjects1.map((row,i)=>(<div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}><span style={{ width: 16 }}>{i+1}</span><select value={row.subject} onChange={e=>onSubjectChange(1,i,"subject",e.target.value)} style={{ flex: 1, padding: 6 }}><option value="">Select Subject</option>{SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}</select><select value={row.grade} onChange={e=>onSubjectChange(1,i,"grade",e.target.value)} style={{ width: 70 }}><option value="">Grade</option>{GRADES.map(g=><option key={g} value={g}>{g}</option>)}</select></div>))}
              <label style={{ display: "flex", gap: 8, marginTop: 10 }}><input type="checkbox" checked={sittingCount===2} onChange={e=>setSittingCount(e.target.checked?2:1)} /> Two Sittings?</label>
              {sittingCount===2 && <div style={{ marginTop: 10 }}>{subjects2.map((row,i)=>(<div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}><span style={{ width: 16 }}>{i+1}</span><select value={row.subject} onChange={e=>onSubjectChange(2,i,"subject",e.target.value)} style={{ flex: 1, padding: 6 }}><option value="">Select Subject</option>{SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}</select><select value={row.grade} onChange={e=>onSubjectChange(2,i,"grade",e.target.value)} style={{ width: 70 }}><option value="">Grade</option>{GRADES.map(g=><option key={g} value={g}>{g}</option>)}</select></div>))}</div>}
            </div>
          )}

          {step === 3 && (
            <div style={{ background: "#eff6ff", border: "2px solid #3b82f6", padding: 16, borderRadius: 12 }}>
              <h3 style={{ margin: "0 0 10px 0", background: "#dbeafe", padding: 8, borderRadius: 8, borderLeft: "5px solid #3b82f6" }}>3. JAMB INFORMATION</h3>
              <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
                <input placeholder="JAMB Reg Number" value={form.jamb_reg} onChange={e=>setForm({...form, jamb_reg:e.target.value})} style={{ padding: 12, borderRadius: 8, border: "1.5px solid #93c5fd" }} />
                <div style={{ display: "flex", gap: 8 }}><input placeholder="JAMB Score" value={form.jamb_score} onChange={e=>setForm({...form, jamb_score:e.target.value})} style={{ flex:1, padding: 12, borderRadius: 8, border: "1.5px solid #93c5fd" }} /><input placeholder="Year" value={form.jamb_year} onChange={e=>setForm({...form, jamb_year:e.target.value})} style={{ width: 100, padding: 12, borderRadius: 8, border: "1.5px solid #93c5fd" }} /></div>
                <select value={form.course} onChange={e=>setForm({...form, course:e.target.value})} style={{ padding: 12, borderRadius: 8, border: "1.5px solid #93c5fd" }}><option>ND/HND Nursing Science</option><option>Basic Nursing</option><option>Community Nursing</option></select>
                <p style={{ fontSize: 12, color: "#1e40af" }}>Note: JAMB is optional for some programs but required for ND/HND.</p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div style={{ background: "#fffbeb", border: "2px solid #f59e0b", padding: 16, borderRadius: 12 }}>
              <h3 style={{ margin: "0 0 10px 0", background: "#fef3c7", padding: 8, borderRadius: 8, borderLeft: "5px solid #f59e0b" }}>4. SPONSOR INFORMATION</h3>
              <input placeholder="Sponsor Full Name *" required value={form.sponsor_name} onChange={e=>setForm({...form, sponsor_name:e.target.value})} style={{ width: "100%", padding: 12, borderRadius: 8, border: "1.5px solid #fcd34d", marginBottom: 8 }} />
              <select value={form.sponsor_relationship} onChange={e=>setForm({...form, sponsor_relationship:e.target.value})} style={{ width: "100%", padding: 12, borderRadius: 8, border: "1.5px solid #fcd34d", marginBottom: 8 }}><option>Father</option><option>Mother</option><option>Guardian</option><option>Sponsor</option></select>
              <input placeholder="Sponsor Phone *" required value={form.sponsor_phone} onChange={e=>setForm({...form, sponsor_phone:e.target.value})} style={{ width: "100%", padding: 12, borderRadius: 8, border: "1.5px solid #fcd34d", marginBottom: 8 }} />
              <textarea placeholder="Sponsor Address *" required value={form.sponsor_address} onChange={e=>setForm({...form, sponsor_address:e.target.value})} style={{ width: "100%", padding: 12, borderRadius: 8, border: "1.5px solid #fcd34d" }} />
            </div>
          )}

          {step === 5 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ border: "2px dashed #16a34a", padding: 14, textAlign: "center", borderRadius: 10, background: "white" }}>
                <p style={{ fontWeight: 800, color: "#052e16" }}>Upload Passport Photo * (JPG/PNG)</p>
                <input type="file" accept="image/*" onChange={e=>{ const f = e.target.files?.[0]; if(f){ setPassportFile(f); setPreview(URL.createObjectURL(f)); } }} />
                {preview && <img src={preview} alt="Passport" style={{ width: 130, height: 150, objectFit: "cover", marginTop: 10, border: "3px solid #16a34a", borderRadius: 8, display: "block", marginLeft: "auto", marginRight: "auto" }} />}
              </div>
              <div style={{ border: "2px dashed #f59e0b", padding: 14, textAlign: "center", borderRadius: 10, background: "#fffbeb" }}>
                <p style={{ fontWeight: 800, color: "#92400e" }}>Upload Proof of Payment / Bank Teller * (PNG or PDF)</p>
                <p style={{ fontSize: 11, color: "#a16207" }}>For Form/Screening Payment - Bank Teller, Transfer Receipt</p>
                <input type="file" accept="image/*,application/pdf" onChange={e=>{ const f = e.target.files?.[0]; if(f){ setProofFile(f); if(f.type.includes("image")) setProofPreview(URL.createObjectURL(f)); else setProofPreview(""); } }} />
                {proofPreview && <img src={proofPreview} alt="Proof" style={{ width: 200, objectFit: "contain", marginTop: 10, border: "3px solid #f59e0b", borderRadius: 8, display: "block", marginLeft: "auto", marginRight: "auto" }} />}
                {proofFile && !proofPreview && <p style={{ marginTop: 8, fontWeight: 700, color: "green" }}>PDF Uploaded: {proofFile.name}</p>}
              </div>
            </div>
          )}

          {step === 6 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ background: "#f0fdf4", border: "2px solid #16a34a", padding: 16, borderRadius: 12 }}>
                <h3 style={{ margin: "0 0 8px 0" }}>REVIEW & DECLARATION</h3>
                <p style={{ fontSize: 13 }}><b>Name:</b> {form.full_name} | <b>App No:</b> Will be auto-generated on Submit</p>
                <p style={{ fontSize: 13 }}><b>Phone:</b> {form.phone} | <b>Course:</b> {form.course}</p>
                <p style={{ fontSize: 12, color: "#065f46", marginTop: 8 }}>After submit, you can print your application form immediately. After Bursar clears your payment, you will be able to print PDF with official stamp. Then Provost/Registrar will set Aptitude Test. If you pass, you will be invited for Interview. If Registrar/Provost clicks ADMITTED, your dashboard will show: <i>“Congratulations! You have been admitted to study ND/HND at Labe College of Nursing Sciences Gboko. Kindly proceed to the school for further information.”</i></p>
              </div>
              <div style={{ border: "2px solid #dc2626", padding: 12, borderRadius: 10, background: "#fef2f2" }}><label style={{ display: "flex", gap: 8, fontWeight: 800, fontSize: 13 }}><input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)} /> I {form.full_name} declare that the information provided is true and correct to the best of my knowledge. I understand that false information leads to disqualification.</label></div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "space-between" }}>
            {step > 1 ? <button type="button" onClick={prev} style={{ padding: "12px 20px", background: "#e5e7eb", border: "none", borderRadius: 10, fontWeight: 800 }}>PREVIOUS</button> : <div />}
            {step < 6 ? <button type="button" onClick={next} style={{ padding: "12px 28px", background: "linear-gradient(90deg, #052e16, #16a34a)", color: "white", fontWeight: 900, border: "none", borderRadius: 10 }}>NEXT →</button> : <button disabled={loading} type="submit" style={{ padding: "12px 28px", background: "linear-gradient(90deg, #052e16, #16a34a)", color: "white", fontWeight: 900, border: "none", borderRadius: 10 }}>{loading ? "SUBMITTING..." : "SUBMIT & GET APP NO"}</button>}
          </div>

        </form>
        </div>
      </div>
    </div>
  );
}

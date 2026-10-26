import { useState } from "react";
import { supabase } from "../lib/supabase";

const SUBJECTS = ["English Language", "Mathematics", "Biology", "Chemistry", "Physics", "Geography", "Economics", "Agric", "Civic"];
const GRADES = ["A1","B2","B3","C4","C5","C6","D7","E8","F9"];

export default function ApplicantRegistration() {
  const [passportFile, setPassportFile] = useState<File|null>(null);
  const [preview, setPreview] = useState("");
  const [sittingCount, setSittingCount] = useState(1); // 1 or 2
  
  const [form, setForm] = useState({
    full_name: "", dob: "", gender: "Female", phone: "", email: "", state: "Benue", lga: "Gboko", address: "",
    jamb_reg: "", jamb_score: "", course: "ND/HND Nursing Science",
    father_name: "", father_phone: "", mother_name: "", mother_phone: "",
    // SITTING 1
    ssce_exam1: "WAEC", ssce_year1: "2024", ssce_no1: "",
    subjects1: Array(9).fill({ subject: "", grade: "" }),
    // SITTING 2
    ssce_exam2: "NECO", ssce_year2: "2024", ssce_no2: "",
    subjects2: Array(9).fill({ subject: "", grade: "" }),
  });

  const handleSubjectChange = (sitting: 1|2, index: number, field: "subject"|"grade", value: string) => {
    if(sitting===1){
      const newSub = [...form.subjects1];
      newSub[index] = { ...newSub[index], [field]: value };
      setForm({ ...form, subjects1: newSub });
    } else {
      const newSub = [...form.subjects2];
      newSub[index] = { ...newSub[index], [field]: value };
      setForm({ ...form, subjects2: newSub });
    }
  };

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    if(!passportFile) { alert("Upload passport first"); return; }

    // 1. Upload passport - THIS FIXES PASSPORT NOT DISPLAYING
    const fileName = `passport-${Date.now()}-${passportFile.name}`;
    const { error: upError } = await supabase.storage.from("applicant-photos").upload(fileName, passportFile);
    if(upError) { alert("Upload failed: " + upError.message + " - Make bucket PUBLIC"); return; }
    
    const { data: urlData } = supabase.storage.from("applicant-photos").getPublicUrl(fileName);
    const photoUrl = urlData.publicUrl;

    // 2. Generate Application Number
    const { count } = await supabase.from("applicants").select("*", { count: "exact", head: true });
    const num = (count || 0) + 8341 + 1;
    const appNo = `LCNS/2026/${num}`;

    // 3. Save with ALL subject data as JSON
    const { data, error } = await supabase.from("applicants").insert([{
      full_name: form.full_name,
      application_number: appNo,
      exam_no: `LCNS/2026/EXM/${num}`,
      dob: form.dob, gender: form.gender, phone: form.phone, email: form.email, state: form.state, lga: form.lga, address: form.address,
      jamb_reg: form.jamb_reg, jamb_score: form.jamb_score, course: form.course,
      father_name: form.father_name, father_phone: form.father_phone, mother_name: form.mother_name, mother_phone: form.mother_phone,
      // PASSPORT FIX - save in 3 columns so print page must find it
      photo_url: photoUrl,
      passport_url: photoUrl,
      passport: photoUrl,
      // SSCE - Save all as JSON so print can read
      ssce_exam: form.ssce_exam1, ssce_year: form.ssce_year1, ssce_no: form.ssce_no1,
      ssce_sitting_count: sittingCount,
      ssce_data: {
        sitting1: { exam: form.ssce_exam1, year: form.ssce_year1, no: form.ssce_no1, subjects: form.subjects1 },
        sitting2: sittingCount===2 ? { exam: form.ssce_exam2, year: form.ssce_year2, no: form.ssce_no2, subjects: form.subjects2 } : null
      }
    }]).select().single();

    if(error) alert(error.message);
    else {
      alert(`Registered! Your No: ${appNo}`);
      window.location.href = `/print/${data.id}`;
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 15, background: "white" }}>
      <h2 style={{ textAlign: "center", color: "#0a4d2e" }}>LABE COLLEGE - APPLICATION FORM</h2>
      
      <form onSubmit={handleSubmit}>
        {/* BIODATA */}
        <input placeholder="Full Name" required value={form.full_name} onChange={e=>setForm({...form, full_name:e.target.value})} style={{ width: "100%", padding: 10, marginBottom: 10 }} />
        <div style={{ display: "flex", gap: 10 }}>
          <input type="date" required value={form.dob} onChange={e=>setForm({...form, dob:e.target.value})} style={{ flex: 1, padding: 10 }} />
          <select value={form.gender} onChange={e=>setForm({...form, gender:e.target.value})} style={{ flex: 1, padding: 10 }}><option>Male</option><option>Female</option></select>
        </div>

        {/* PASSPORT UPLOAD - PREVIEW */}
        <div style={{ margin: "15px 0", border: "2px dashed #0a4d2e", padding: 10, textAlign: "center" }}>
          <p style={{ fontWeight: 700 }}>Upload Passport (Must be JPG, less than 200KB)</p>
          <input type="file" accept="image/*" onChange={e=>{
            const f = e.target.files?.[0]; if(f){ setPassportFile(f); setPreview(URL.createObjectURL(f)); }
          }} required />
          {preview && <img src={preview} style={{ width: 120, height: 140, objectFit: "cover", marginTop: 10, border: "2px solid #0a4d2e" }} />}
        </div>

        {/* SSCE SECTION WITH 9 SUBJECTS */}
        <div style={{ border: "2px solid #0a4d2e", padding: 12, marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, color: "#0a4d2e" }}>SSCE / O'LEVEL (9 Subjects)</h3>
            <div>
              <label>How many sittings? </label>
              <select value={sittingCount} onChange={e=>setSittingCount(Number(e.target.value) as any)}>
                <option value={1}>One Sitting</option>
                <option value={2}>Two Sittings (Click to Add Second Result)</option>
              </select>
            </div>
          </div>

          {/* SITTING 1 */}
          <div style={{ background: "#f1f5f9", padding: 10, marginTop: 10 }}>
            <h4>SITTING 1</h4>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <select value={form.ssce_exam1} onChange={e=>setForm({...form, ssce_exam1:e.target.value})}><option>WAEC</option><option>NECO</option><option>NABTEB</option></select>
              <input placeholder="Exam No (e.g WAEC/2024/1234567)" value={form.ssce_no1} onChange={e=>setForm({...form, ssce_no1:e.target.value})} style={{ flex: 1 }} />
              <input placeholder="Year (2024)" value={form.ssce_year1} onChange={e=>setForm({...form, ssce_year1:e.target.value})} style={{ width: 100 }} />
            </div>
            {form.subjects1.map((sub, idx)=>(
              <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 5 }}>
                <span style={{ width: 20 }}>{idx+1}</span>
                <select value={sub.subject} onChange={e=>handleSubjectChange(1, idx, "subject", e.target.value)} style={{ flex: 1 }}>
                  <option value="">Select Subject</option>{SUBJECTS.map(s=><option key={s}>{s}</option>)}
                  <option>English Language</option><option>Mathematics</option><option>Biology</option><option>Chemistry</option><option>Physics</option>
                </select>
                <select value={sub.grade} onChange={e=>handleSubjectChange(1, idx, "grade", e.target.value)} style={{ width: 80 }}>
                  <option value="">Grade</option>{GRADES.map(g=><option key={g}>{g}</option>)}
                </select>
              </div>
            ))}
          </div>

          {/* SITTING 2 - Shows only if user clicks Two Sittings */}
          {sittingCount===2 && (
            <div style={{ background: "#fef9c3", padding: 10, marginTop: 10, border: "2px solid #eab308" }}>
              <h4>SITTING 2 (Second Result)</h4>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <select value={form.ssce_exam2} onChange={e=>setForm({...form, ssce_exam2:e.target.value})}><option>WAEC</option><option>NECO</option><option>NABTEB</option></select>
                <input placeholder="Exam No" value={form.ssce_no2} onChange={e=>setForm({...form, ssce_no2:e.target.value})} style={{ flex: 1 }} />
                <input placeholder="Year" value={form.ssce_year2} onChange={e=>setForm({...form, ssce_year2:e.target.value})} style={{ width: 100 }} />
              </div>
              {form.subjects2.map((sub, idx)=>(
                <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 5 }}>
                  <span style={{ width: 20 }}>{idx+1}</span>
                  <select value={sub.subject} onChange={e=>handleSubjectChange(2, idx, "subject", e.target.value)} style={{ flex: 1 }}>
                    <option value="">Select Subject</option><option>English Language</option><option>Mathematics</option><option>Biology</option><option>Chemistry</option><option>Physics</option>
                  </select>
                  <select value={sub.grade} onChange={e=>handleSubjectChange(2, idx, "grade", e.target.value)} style={{ width: 80 }}>
                    <option value="">Grade</option>{GRADES.map(g=><option key={g}>{g}</option>)}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" style={{ width: "100%", padding: 15, background: "#0a4d2e", color: "white", fontWeight: 900, marginTop: 20, border: "none", borderRadius: 8 }}>SUBMIT & PRINT</button>
      </form>
    </div>
  );
}

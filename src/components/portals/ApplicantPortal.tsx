import React, { useState, useEffect } from 'react';
import { getSupabase } from '../../lib/supabase';

// ===== ENTRANCE CBT COMPONENT - ADDED INSIDE APPLICANT PORTAL =====
const EntranceCBTExam = ({ applicant, onScoreUpdate }: { applicant: any, onScoreUpdate: (score:any)=>void }) => {
  const [showExam, setShowExam] = useState(false);
  const [questions, setQuestions] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('lcns_entrance_questions') || '[]'); } catch { return []; }
  });
  const [answers, setAnswers] = useState<Record<string,string>>({});
  const [attempt, setAttempt] = useState<any>(() => {
    try { return JSON.parse(localStorage.getItem('lcns_entrance_attempt_' + applicant.application_number) || 'null'); } catch { return null; }
  });
  const [cbtPublished, setCbtPublished] = useState<any>(() => {
    try { return JSON.parse(localStorage.getItem('lcns_cbt_published_' + applicant.application_number) || 'null'); } catch { return null; }
  });

  // Load questions set by Registrar/Admin
  useEffect(() => {
    const loadQs = () => {
      try {
        const adminQs = JSON.parse(localStorage.getItem('lcns_cbt_questions') || '[]');
        const entranceQs = JSON.parse(localStorage.getItem('lcns_entrance_questions') || '[]');
        const all = adminQs.length ? adminQs : entranceQs;
        if (all.length) setQuestions(all);
        const published = JSON.parse(localStorage.getItem('lcns_cbt_published_' + applicant.application_number) || 'null');
        if (published) setCbtPublished(published);
        const att = JSON.parse(localStorage.getItem('lcns_entrance_attempt_' + applicant.application_number) || 'null');
        if (att) setAttempt(att);
      } catch {}
    };
    loadQs();
    const h = () => loadQs();
    window.addEventListener('storage', h);
    window.addEventListener('focus', h);
    return () => { window.removeEventListener('storage', h); window.removeEventListener('focus', h); };
  }, [applicant.application_number]);

  const defaultQs = [
    { id: '1', question_text: 'Normal adult blood pressure?', option_a: '120/80 mmHg', option_b: '140/90 mmHg', option_c: '100/60', option_d: '160/100', correct_option: 'A' },
    { id: '2', question_text: 'Florence Nightingale is known as?', option_a: 'Lady with lamp', option_b: 'Mother of medicine', option_c: 'First doctor', option_d: 'All of above', correct_option: 'A' },
    { id: '3', question_text: 'Which is compulsory subject for Nursing?', option_a: 'Biology', option_b: 'Chemistry', option_c: 'Physics', option_d: 'All', correct_option: 'D' },
  ];

  const qs = questions.length ? questions : defaultQs;

  const submitExam = () => {
    let score = 0;
    qs.forEach((q:any)=>{ if(answers[q.id]===q.correct_option) score++; });
    const perc = Math.round((score/qs.length)*100);
    const data = { score, total: qs.length, percentage: perc, submitted_at: new Date().toISOString(), jamb_no: applicant.jamb_reg_number, application_number: applicant.application_number, applicant_name: applicant.full_name };
    localStorage.setItem('lcns_entrance_attempt_' + applicant.application_number, JSON.stringify(data));
    // Also save to global attempts for Admin to see
    const allAtt = JSON.parse(localStorage.getItem('lcns_cbt_attempts') || '[]');
    localStorage.setItem('lcns_cbt_attempts', JSON.stringify([data, ...allAtt.filter((a:any)=>a.application_number!==applicant.application_number)]));
    setAttempt(data);
    setShowExam(false);
    onScoreUpdate(data);
    alert(`✅ Entrance Exam Submitted! ${score}/${qs.length} (${perc}%) - Waiting for Registrar to publish result`);
  };

  if (showExam) {
    return (
      <div className="bg-white border-2 border-[#0f4c2e] rounded-2xl p-5">
        <div className="flex justify-between bg-[#0f4c2e] text-white p-3 rounded-xl text-xs mb-4">
          <span>{applicant.full_name} - {applicant.application_number} - JAMB: {applicant.jamb_reg_number}</span>
          <span>Entrance Exam - 40 mins - No Tab Switch</span>
        </div>
        <div className="space-y-4 max-h-[60vh] overflow-auto pr-2">
          {qs.map((q:any,i:number)=>(
            <div key={q.id} className="border-2 rounded-2xl p-4">
              <p className="font-bold text-sm">{i+1}. {q.question_text}</p>
              {['A','B','C','D'].map(o=>(
                <label key={o} className={`flex gap-2 border p-3 rounded-xl mt-2 cursor-pointer text-sm ${answers[q.id]===o?'bg-[#0f4c2e] text-white':''}`}>
                  <input type="radio" className="hidden" name={q.id} checked={answers[q.id]===o} onChange={()=>setAnswers({...answers,[q.id]:o})}/>
                  <b>{o}.</b> {(q as any)[`option_${o.toLowerCase()}`]}
                </label>
              ))}
            </div>
          ))}
        </div>
        <button onClick={submitExam} className="w-full mt-5 bg-yellow-400 text-[#0f2e1f] py-4 rounded-full font-black">Submit Entrance Exam</button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-2xl border-2 border-blue-300 space-y-3">
      <h4 className="font-black text-[#0f4c2e] flex items-center gap-2">📝 ENTRANCE CBT EXAM - Set from Registrar/Admin - JAMB No: {applicant.jamb_reg_number}</h4>
      {!attempt ? (
        <>
          <p className="text-xs text-slate-600">Applicant Entrance Examination for ND/HND Nursing Science 2026/2027 - Set by Registrar/Admin - One attempt only - Anti-cheat enabled - Result hidden until Registrar publishes</p>
          <p className="text-xs font-bold">Questions: {qs.length} - Duration: 40 mins - Application: {applicant.application_number} - Exam No: {applicant.exam_number}</p>
          {applicant.bursar_cleared || applicant.status === 'BURSAR_CLEARED' ? (
            <button onClick={()=>setShowExam(true)} className="w-full bg-[#0f4c2e] hover:bg-black text-white py-3.5 rounded-full font-black">Start Entrance CBT Exam Now</button>
          ) : (
            <div className="bg-amber-100 border border-amber-300 p-3 rounded-xl text-xs font-bold text-amber-800">⏳ Pending Bursar Clearance - You can only write entrance exam after Bursar clears your payment proof. Current: {applicant.status}</div>
          )}
        </>
      ) : (
        <div className="bg-white border rounded-xl p-4">
          <p className="font-black text-sm">✅ Entrance Exam Submitted - Score hidden until Registrar publishes</p>
          <p className="text-xs mt-1">Submitted: {new Date(attempt.submitted_at).toLocaleString()} - App No: {attempt.application_number} - JAMB Reg: {attempt.jamb_no}</p>
          {cbtPublished ? (
            <div className="mt-3 bg-[#0f4c2e] text-white p-4 rounded-xl">
              <p className="text-yellow-300 text-xs font-bold">CBT SCORE PUBLISHED BY REGISTRAR/ADMIN - {cbtPublished.published_by || 'Registrar'}</p>
              <p className="text-2xl font-black mt-1">{cbtPublished.score}/{cbtPublished.total} = {cbtPublished.percentage}%</p>
              <p className="text-xs text-green-200 mt-1">Published at: {cbtPublished.published_at}</p>
            </div>
          ) : (
            <p className="text-xs mt-2 font-bold text-blue-700">⏳ CBT Test Score Publish by Registrar/Admin: Not yet published - Admission in progress - Waiting for Registrar to link JAMB + CBT + Interview</p>
          )}
        </div>
      )}
    </div>
  );
};

export const ApplicantPortal: React.FC<{ currentUser?: any }> = ({ currentUser }) => {
  const [tab, setTab] = useState('apply');
  const [applicants, setApplicants] = useState<any[]>([]);
  
  const [fullName, setFullName] = useState(''); const [phone, setPhone] = useState(''); const [gender, setGender] = useState('Male'); const [stateOrigin, setStateOrigin] = useState('');
  
  const [schoolName, setSchoolName] = useState(''); const [sittingType, setSittingType] = useState('ONE_SITTING');
  const [examType1, setExamType1] = useState('WACE'); const [examNo1, setExamNo1] = useState(''); const [year1, setYear1] = useState('2024');
  const [examType2, setExamType2] = useState('NECO'); const [examNo2, setExamNo2] = useState(''); const [year2, setYear2] = useState('2024');
  const [subjects, setSubjects] = useState<any[]>([
    { subject: 'Mathematics', grade: 'C4', sitting: 1 }, { subject: 'English Language', grade: 'C4', sitting: 1 },
    { subject: 'Chemistry', grade: 'C4', sitting: 1 }, { subject: 'Biology', grade: 'C4', sitting: 1 }, { subject: 'Physics', grade: 'C4', sitting: 1 },
    { subject: 'Geography', grade: 'C5', sitting: 1 }, { subject: 'Economics', grade: 'C5', sitting: 1 }, { subject: 'Civic Education', grade: 'B3', sitting: 1 }, { subject: 'Further Maths', grade: 'C4', sitting: 1 },
  ]);

  const [jambReg, setJambReg] = useState(''); const [jambScore, setJambScore] = useState(''); const [jambYear, setJambYear] = useState('2025'); const [course, setCourse] = useState('ND Nursing'); const [firstChoice, setFirstChoice] = useState('Labe College of Nursing Sciences');
  
  const [passportUrl, setPassportUrl] = useState(''); const [resultUrl1, setResultUrl1] = useState(''); const [paymentUrl, setPaymentUrl] = useState('');
  const [appNo, setAppNo] = useState(''); const [returnAppNo, setReturnAppNo] = useState(''); const [myData, setMyData] = useState<any>(null);

  const load = async () => {
    const sb = getSupabase();
    try { if (sb) { const { data } = await sb.from('lcns_applicants').select('*').limit(100); if (data) setApplicants(data); } } catch {}
    try {
      const local = JSON.parse(localStorage.getItem('lcns_applicants') || '[]');
      if (local.length) setApplicants(prev => [...local, ...prev].slice(0,100));
    } catch {}
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async () => {
    if (!fullName || !phone || !jambReg || !jambScore) return alert('Fill Full Name, Phone, JAMB Reg, JAMB Score');
    const newAppNo = 'LCNS/' + new Date().getFullYear() + '/' + Math.floor(100000 + Math.random()*900000);
    const examNo = 'EXM/' + Math.floor(10000 + Math.random()*90000);
    const newApp: any = {
      id: 'APP-' + Date.now(), application_number: newAppNo, exam_number: examNo, full_name: fullName, phone, gender, state_origin: stateOrigin,
      secondary_school_name: schoolName, sitting_type: sittingType, exam_type_1: examType1, exam_number_1: examNo1, year_1: year1,
      exam_type_2: examType2, exam_number_2: examNo2, year_2: year2, subjects, jamb_reg_number: jambReg, jamb_score: parseInt(jambScore), jamb_year: jambYear,
      first_choice_institution: firstChoice, course_applying: course, passport_url: passportUrl || 'https://via.placeholder.com/150',
      result_upload_1_url: resultUrl1 || 'https://via.placeholder.com/300', payment_proof_url: paymentUrl || 'https://via.placeholder.com/300',
      status: 'PENDING_BURSAR', bursar_cleared: false, admission_status: 'IN_PROGRESS', created_at: new Date().toISOString()
    };
    const sb = getSupabase();
    try { if (sb) await sb.from('lcns_applicants').insert([newApp]); } catch {}
    const local = JSON.parse(localStorage.getItem('lcns_applicants') || '[]'); localStorage.setItem('lcns_applicants', JSON.stringify([newApp, ...local]));
    setAppNo(newAppNo); setMyData(newApp); setTab('success');
  };

  const handleReturn = async () => {
    if (!returnAppNo) return alert('Enter application number');
    const sb = getSupabase(); let found: any = null;
    try { if (sb) { const { data } = await sb.from('lcns_applicants').select('*').eq('application_number', returnAppNo).single(); if (data) found = data; } } catch {}
    if (!found) { const local = JSON.parse(localStorage.getItem('lcns_applicants') || '[]'); found = local.find((a:any)=>a.application_number===returnAppNo); }
    if (!found) return alert('Application number not found');
    // Load updated attempt
    try {
      const attempt = JSON.parse(localStorage.getItem('lcns_entrance_attempt_' + found.application_number) || 'null');
      if (attempt) found.cbt_attempt = attempt;
      const published = JSON.parse(localStorage.getItem('lcns_cbt_published_' + found.application_number) || 'null');
      if (published) { found.cbt_published = true; found.cbt_score = published.score; found.cbt_total = published.total; found.cbt_published_by = published.published_by; }
    } catch {}
    setMyData(found); setTab('dashboard');
  };

  return (
    <div className="max-w-5xl mx-auto p-4 bg-white rounded-xl shadow space-y-4">
      <h2 className="text-xl font-black">Applicant Portal - Apply Online - ENTRANCE EXAM ADDED</h2>
      <div className="flex gap-2 text-xs font-bold flex-wrap">
        <button onClick={()=>setTab('apply')} className={`px-3 py-2 rounded ${tab==='apply'?'bg-blue-700 text-white':'bg-white border'}`}>Apply Online Biodata → Academics → JAMB → Upload</button>
        <button onClick={()=>setTab('return')} className={`px-3 py-2 rounded ${tab==='return'?'bg-amber-500 text-black':'bg-white border'}`}>Return with Application Number</button>
        {myData && <button onClick={()=>setTab('dashboard')} className={`px-3 py-2 rounded ${tab==='dashboard'?'bg-green-700 text-white':'bg-white border'}`}>My Dashboard - JAMB + ENTRANCE CBT + Interview + Admission</button>}
      </div>

      {tab==='apply' && (
        <div className="space-y-4 border-2 p-4 rounded-xl">
          <h3 className="font-black bg-slate-100 p-2 rounded">STEP 1: Biodata</h3>
          <div className="grid md:grid-cols-2 gap-2">
            <input value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Full Name *" className="border px-3 py-2 rounded text-black"/>
            <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone *" className="border px-3 py-2 rounded text-black"/>
            <select value={gender} onChange={e=>setGender(e.target.value)} className="border px-3 py-2 rounded text-black"><option>Male</option><option>Female</option></select>
            <input value={stateOrigin} onChange={e=>setStateOrigin(e.target.value)} placeholder="State of Origin" className="border px-3 py-2 rounded text-black"/>
          </div>

          <h3 className="font-black bg-amber-50 p-2 rounded border">STEP 2: Academics - Name of secondary school, WACE/NECO/NABTEB exam number year, if two seating indicates baths, Mathematics English Chemistry Biology Physics compulsory + choose any other 4 with grading</h3>
          <div className="grid md:grid-cols-2 gap-2 bg-white p-3 border rounded">
            <input value={schoolName} onChange={e=>setSchoolName(e.target.value)} placeholder="Name of Secondary School *" className="border px-3 py-2 rounded text-black md:col-span-2"/>
            <select value={sittingType} onChange={e=>setSittingType(e.target.value)} className="border-2 border-blue-300 px-3 py-2 rounded font-black text-black"><option value="ONE_SITTING">ONE SITTING - One Bath</option><option value="TWO_SITTINGS">TWO SITTINGS - Indicates Baths 1 & 2</option></select>
            <div className="flex gap-1"><select value={examType1} onChange={e=>setExamType1(e.target.value)} className="border px-2 py-2 rounded text-black"><option>WACE</option><option>NECO</option><option>NABTEB</option></select><input value={examNo1} onChange={e=>setExamNo1(e.target.value)} placeholder="Exam Number 1 *" className="border flex-1 px-2 py-2 rounded text-black"/><input value={year1} onChange={e=>setYear1(e.target.value)} placeholder="Year" className="border w-20 px-2 py-2 rounded text-black"/></div>
            {sittingType==='TWO_SITTINGS' && <div className="flex gap-1"><select value={examType2} onChange={e=>setExamType2(e.target.value)} className="border px-2 py-2 rounded text-black"><option>NECO</option><option>WACE</option><option>NABTEB</option></select><input value={examNo2} onChange={e=>setExamNo2(e.target.value)} placeholder="Exam Number 2 - Bath 2" className="border flex-1 px-2 py-2 rounded text-black"/><input value={year2} onChange={e=>setYear2(e.target.value)} placeholder="Year" className="border w-20 px-2 py-2 rounded text-black"/></div>}
          </div>
          <div className="bg-slate-50 p-3 border rounded">
            <p className="text-xs font-bold">Subjects - Mathematics English Chemistry Biology Physics compulsory + 4 others with grading:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">{subjects.map((s,i)=><div key={i} className="flex gap-1 text-xs"><input value={s.subject} onChange={e=>{ const u=[...subjects]; u[i].subject=e.target.value; setSubjects(u); }} className="border flex-1 px-2 py-1 rounded text-black"/><select value={s.grade} onChange={e=>{ const u=[...subjects]; u[i].grade=e.target.value; setSubjects(u); }} className="border px-1 py-1 rounded text-black"><option>A1</option><option>B2</option><option>B3</option><option>C4</option><option>C5</option><option>C6</option><option>D7</option><option>E8</option><option>F9</option></select></div>)}</div>
          </div>

          <h3 className="font-black bg-blue-50 p-2 rounded border">STEP 3: JAMB - JAMB registration number scores year institution first choice Labe College Course ND/HND</h3>
          <div className="grid md:grid-cols-2 gap-2">
            <input value={jambReg} onChange={e=>setJambReg(e.target.value)} placeholder="JAMB Registration Number * e.g. 12345678AB" className="border-2 border-yellow-400 px-3 py-2 rounded font-black text-black"/>
            <input value={jambScore} onChange={e=>setJambScore(e.target.value)} type="number" placeholder="JAMB Score * e.g. 250" className="border-2 border-blue-400 px-3 py-2 rounded font-black text-black"/>
            <input value={jambYear} onChange={e=>setJambYear(e.target.value)} placeholder="JAMB Year" className="border px-3 py-2 rounded text-black"/>
            <input value={firstChoice} onChange={e=>setFirstChoice(e.target.value)} placeholder="First Choice Institution - Labe College" className="border px-3 py-2 rounded text-black"/>
            <select value={course} onChange={e=>setCourse(e.target.value)} className="border-2 border-green-300 px-3 py-2 rounded font-black text-black md:col-span-2"><option>ND Nursing</option><option>HND Nursing</option><option>ND Midwifery</option><option>HND Midwifery</option><option>ND Public Health</option></select>
          </div>

          <h3 className="font-black bg-purple-50 p-2 rounded border">STEP 4: Upload Result WACE - if two seating one box optional + passport + proof of Payments + Review</h3>
          <div className="grid md:grid-cols-3 gap-2">
            <div><label className="text-xs font-bold">Result Upload 1 - WACE (Required)</label><input value={resultUrl1} onChange={e=>setResultUrl1(e.target.value)} placeholder="Paste result image URL" className="border w-full px-3 py-2 rounded text-black text-xs"/><p className="text-[10px] text-slate-500">Upload result WACE box 1</p></div>
            <div><label className="text-xs font-bold">Result Upload 2 - Optional if 2 sittings</label><input placeholder="Optional second result" className="border w-full px-3 py-2 rounded text-black text-xs"/><p className="text-[10px] text-slate-500">If two seating one box optional</p></div>
            <div><label className="text-xs font-bold">Passport Attached *</label><input value={passportUrl} onChange={e=>setPassportUrl(e.target.value)} placeholder="Passport URL" className="border w-full px-3 py-2 rounded text-black text-xs"/><p className="text-[10px]">Passport attached</p></div>
            <div className="md:col-span-3"><label className="text-xs font-bold">Proof of Payment *</label><input value={paymentUrl} onChange={e=>setPaymentUrl(e.target.value)} placeholder="Payment proof URL (PNG/PDF)" className="border-2 border-red-300 w-full px-3 py-2 rounded font-bold text-black text-xs"/><p className="text-[10px] text-red-600">Proof of Payments - Will be cleared by Bursar - After clearance you can write entrance exam</p></div>
          </div>

          <button onClick={handleSubmit} className="w-full bg-blue-700 text-white py-4 rounded-xl font-black text-lg">✅ Submit - Download Biodata with Application Number Exam Number Attached</button>
        </div>
      )}

      {tab==='success' && myData && (
        <div className="border-2 border-green-500 p-6 rounded-2xl bg-green-50 text-center space-y-3">
          <h3 className="text-2xl font-black text-green-800">✅ Application Successful!</h3>
          <p className="font-mono text-lg">Application Number: <b className="bg-yellow-200 px-3 py-1 rounded">{myData.application_number}</b></p>
          <p className="font-mono">Exam Number: <b className="bg-amber-100 px-3 py-1 rounded">{myData.exam_number}</b></p>
          <p className="text-sm">Download biodata with application number and exam number attached, instruction she should kindly come with form on aptitude test day with passport attached - pending bursar clearance - After clearance you will write Entrance CBT Exam</p>
          <div className="bg-white p-4 rounded-xl border text-left text-xs"><p>Full Name: {myData.full_name}</p><p>JAMB Reg: {myData.jamb_reg_number} Score: {myData.jamb_score}</p><p>Course: {myData.course_applying}</p></div>
          <button onClick={()=>{ const w=window.open('','_blank'); w?.document.write(`<html><body style="font-family:monospace;padding:20px"><h2>Labe College of Nursing Sciences</h2><p>Application No: ${myData.application_number}</p><p>Exam No: ${myData.exam_number}</p><p>Name: ${myData.full_name}</p><p>JAMB Reg: ${myData.jamb_reg_number} Score: ${myData.jamb_score}</p><p>Course: ${myData.course_applying}</p><p>School: ${myData.secondary_school_name}</p><p>Subjects: ${myData.subjects.map((s:any)=>s.subject+' '+s.grade).join(', ')}</p><p>Instruction: Kindly come with form on aptitude test day with passport attached - Pending Bursar Clearance - Entrance CBT after clearance</p><img src="${myData.passport_url}" width="100"/></body></html>`); }} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black">📄 Download Biodata Form with Passport Attached</button>
          <button onClick={()=>setTab('return')} className="block w-full mt-2 px-6 py-3 bg-amber-500 text-black rounded-xl font-black">After Bursar Clearance - Use Application Number to Return & Write Entrance Exam</button>
        </div>
      )}

      {tab==='return' && (
        <div className="border-2 p-6 rounded-2xl bg-amber-50 space-y-3">
          <h3 className="font-black">Return with Application Number - After Bursar Clearance - Write Entrance Exam</h3>
          <p className="text-xs">After bursar clearance use application number to return once input application number applicant dashboard open, showing biodata form, JAMB Scores Display, ENTRANCE CBT exams set from Registrar/Admin</p>
          <div className="flex gap-2"><input value={returnAppNo} onChange={e=>setReturnAppNo(e.target.value)} placeholder="Enter Application Number e.g. LCNS/2026/123456" className="flex-1 border-2 border-amber-400 px-4 py-3 rounded-xl font-mono font-black text-black"/><button onClick={handleReturn} className="px-6 py-3 bg-amber-600 text-white rounded-xl font-black">Open Dashboard</button></div>
        </div>
      )}

      {tab==='dashboard' && myData && (
        <div className="space-y-4 border-2 p-4 rounded-2xl">
          <h3 className="font-black">My Dashboard - JAMB Scores Display on Board with JAMB Registration Number + ENTRANCE CBT + Interview + Admission</h3>
          <div className="grid md:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border"><p>App No: <b>{myData.application_number}</b> Exam No: <b>{myData.exam_number}</b></p><p>Name: {myData.full_name}</p><p>Course: {myData.course_applying}</p><p>School: {myData.secondary_school_name}</p><p>Subjects: {myData.subjects.map((s:any)=>s.subject+' '+s.grade).join(', ')}</p></div>
            <div className="bg-yellow-50 p-3 rounded-xl border-2 border-yellow-400"><p className="font-black">JAMB Scores Display on Board with JAMB Registration Number</p><p className="font-mono text-lg mt-2">JAMB Reg: <b className="bg-yellow-200 px-2 rounded">{myData.jamb_reg_number}</b></p><p className="text-lg">JAMB Score: <b className="text-blue-700 text-2xl">{myData.jamb_score}</b> | Year: {myData.jamb_year} | First Choice: {myData.first_choice_institution}</p><p className="mt-2">Status: {myData.bursar_cleared ? '✅ Bursar Cleared' : '⏳ Pending Bursar Clearance'} | {myData.status}</p></div>
          </div>

          {/* ===== ENTRANCE CBT EXAM ADDED HERE - MAINTAINS OTHER INFO ===== */}
          <EntranceCBTExam applicant={myData} onScoreUpdate={(s)=>{ setMyData({...myData, cbt_attempt: s}); }} />

          <div className="bg-purple-50 p-4 rounded-xl border-2 border-purple-200"><h4 className="font-black">Interview Scores Published by Registrar/Admin</h4><p className="font-black mt-2">Interview Score: {myData.interview_published ? `${myData.interview_score}/${myData.interview_total} - Published by ${myData.interview_published_by}` : 'Interview not yet published'}</p><p className="text-sm mt-1">Interview Date: {myData.interview_date||'Not set'} Venue: {myData.interview_venue||'Not set'}</p></div>
          <div className={`p-5 rounded-2xl border-2 ${myData.admission_status==='ADMITTED'?'bg-green-50 border-green-500':'bg-amber-50 border-amber-300'}`}><h4 className="font-black">{myData.admission_status==='ADMITTED' ? '🎉 Congratulations '+myData.full_name+'! You are ADMITTED!' : 'Admission Status: IN PROGRESS - Waiting for JAMB + Entrance CBT + Interview'}</h4>{myData.admission_status==='ADMITTED' ? <div className="mt-3"><p className="font-black text-green-800">Congratulations! Kindly proceed to JAMB CBT center and print your admission number and returns back to school with your biodata form, passport attached, application number, exam number.</p><p className="text-xs mt-2">Admission Note: {myData.admission_note}</p></div> : <p className="text-sm mt-2">Waiting for CBT test and interview scores publish by admin and registrar to link together - If admitted write congratulation full name + kindly proceed to JAMB CBT center and print admission number and returns back to school</p>}</div>
        </div>
      )}
    </div>
  );
};

export default ApplicantPortal;

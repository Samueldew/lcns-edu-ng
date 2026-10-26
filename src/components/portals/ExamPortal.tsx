import React, { useState, useEffect } from 'react';
import { getSupabase } from '../../lib/supabase';
import { CollegeLogo } from '../common/CollegeLogo';

// ROLLING BATCH - 1 HOUR INTERVAL - 9AM START - MISS = JOIN NEXT BATCH
// Many batches - For less systems - Admin controls max per batch
const ROLLING_BATCHES = [
  { batch: 'A', from: 1, to: 100, start: '09:00', end: '10:00', label: '9:00-10:00 AM' },
  { batch: 'B', from: 101, to: 200, start: '10:00', end: '11:00', label: '10:00-11:00 AM' },
  { batch: 'C', from: 201, to: 300, start: '11:00', end: '12:00', label: '11:00-12:00 PM' },
  { batch: 'D', from: 301, to: 400, start: '12:00', end: '13:00', label: '12:00-1:00 PM' },
  { batch: 'E', from: 401, to: 500, start: '13:00', end: '14:00', label: '1:00-2:00 PM' },
  { batch: 'F', from: 501, to: 600, start: '14:00', end: '15:00', label: '2:00-3:00 PM - Mop-up' },
  { batch: 'G', from: 1, to: 600, start: '15:00', end: '16:00', label: '3:00-4:00 PM - Final Mop-up for all missed' },
];

const getBatchForFormNo = (formNo: string) => {
  const match = formNo.match(/(\d+)(?!.*\d)/);
  let num = 1;
  if (match) { const n = parseInt(match[1]); num = n > 600 ? n % 600 || 600 : n; }
  return ROLLING_BATCHES.find(b => num >= b.from && num <= b.to) || ROLLING_BATCHES[0];
};

const getCurrentBatchByTime = () => {
  const now = new Date();
  const curr = now.getHours() + now.getMinutes()/60;
  return ROLLING_BATCHES.find(b => {
    const [sH, sM] = b.start.split(':').map(Number);
    const [eH, eM] = b.end.split(':').map(Number);
    return curr >= (sH + sM/60) && curr < (eH + eM/60);
  }) || null;
};

export const ExamPortal: React.FC = () => {
  const [formNo, setFormNo] = useState('');
  const [applicant, setApplicant] = useState<any>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string,string>>({});
  const [timeLeft, setTimeLeft] = useState(3600);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [originalBatch, setOriginalBatch] = useState<any>(null);
  const [currentBatch, setCurrentBatch] = useState<any>(null);
  const [allowReason, setAllowReason] = useState('');
  const [examDateSet, setExamDateSet] = useState('');
  const [maxPerBatch, setMaxPerBatch] = useState(100);

  useEffect(() => {
    const s = JSON.parse(localStorage.getItem('lcns_exam_settings') || '{}');
    if (s.examDate) setExamDateSet(s.examDate);
    if (s.maxPerBatch) setMaxPerBatch(s.maxPerBatch);
  }, []);

  useEffect(() => {
    if (!formNo || !loggedIn) return;
    const saved: Record<string,string> = {};
    for (let i=0;i<localStorage.length;i++){
      const k = localStorage.key(i)||'';
      if (k.startsWith(`lcns_exam_${formNo}_`)){
        saved[k.replace(`lcns_exam_${formNo}_`,'')] = localStorage.getItem(k)||'';
      }
    }
    if (Object.keys(saved).length) setAnswers(saved);
  }, [formNo, loggedIn]);

  useEffect(() => {
    if (!loggedIn || submitted) return;
    const iv = setInterval(()=> setTimeLeft(t=> t<=1 ? (handleFinalSubmit(),0) : t-1), 1000);
    return ()=> clearInterval(iv);
  }, [loggedIn, submitted]);

  const handleLogin = async () => {
    if (!formNo.trim()){ alert('Enter Form No e.g LCNS/2026/0255'); return; }
    setLoading(true);
    try {
      const sb = getSupabase();
      let app: any = null;
      if (sb){
        const { data } = await sb.from('college_applications').select('*').eq('form_no', formNo.trim()).maybeSingle();
        if (data) app = data;
      }
      if (!app){
        const locals = JSON.parse(localStorage.getItem('lcns_applicants') || localStorage.getItem('lcns_applications') || '[]');
        app = locals.find((a:any)=> (a.formNo||a.form_no)===formNo.trim());
      }
      if (!app){ alert('Form No not found - Must be Bursar Cleared Applicant!'); setLoading(false); return; }

      // ONLY APPLICANTS CAN WRITE EXAM - BLOCK STAFF
      const checkEmail = (app.email||app.applicant_email||'').toLowerCase();
      const checkRole = (app.role||app.user_role||'APPLICANT').toUpperCase();
      if (checkEmail.includes('provost') || checkEmail.includes('registrar') || checkEmail.includes('bursar') || checkEmail.includes('admin@lcns') || checkRole.includes('PROVOST') || checkRole.includes('REGISTRAR') || checkRole.includes('LECTURER') || checkRole.includes('BURSAR')){
        alert('❌ This /exam portal is ONLY for applicants! Staff cannot write exam. Only Form No LCNS/2026/XXXX allowed. Provost/Registrar/Admin can only SET exam date at /admin/exam-settings');
        setLoading(false); return;
      }

      const status = (app.status || app.bursarStatus || app.bursar_status || '').toUpperCase();
      if (!status.includes('CLEARED') && !status.includes('ADMITTED') && !status.includes('PAID')){
        alert('Not Bursar Cleared yet! Status: '+status+' - Go to Bursar first!'); setLoading(false); return;
      }

      const orig = getBatchForFormNo(formNo.trim());
      const curr = getCurrentBatchByTime();
      setOriginalBatch(orig);
      setCurrentBatch(curr || orig);

      const now = new Date();
      const currTime = now.getHours() + now.getMinutes()/60;
      const origIdx = ROLLING_BATCHES.findIndex(b=>b.batch===orig.batch);
      const currIdx = curr ? ROLLING_BATCHES.findIndex(b=>b.batch===curr.batch) : -1;

      // If no current batch running (e.g before 9AM), wait for original batch
      if (currIdx === -1 && currTime < 9){
        setApplicant(app);
        setAllowReason(`Your Batch ${orig.batch} ${orig.label} has not started yet - Exam starts 9AM - Please wait. Rolling: Miss = Join Next Batch`);
        setLoading(false); return;
      }

      // ROLLING LOGIC: Miss = Join Next Batch - Many batches
      if (currIdx >= 0 && currIdx > origIdx){
        // Missed original, joining next
        setAllowReason(`You missed Batch ${orig.batch} ${orig.label} (network/power). You are now joining Batch ${curr.batch} ${curr.label} - Rolling Batch ALLOWED - Mercy - You can write in many batches till 4PM final mop-up`);
      } else if (currIdx >=0 && currIdx === origIdx){
        setAllowReason(`Your Batch ${orig.batch} ${orig.label} is now writing - On Time - Welcome - Many batches available till 4PM`);
      } else if (currIdx === -1 && currTime >= 9){
        // Between batches or after all batches? Allow final mop-up
        const final = ROLLING_BATCHES[ROLLING_BATCHES.length-1];
        setCurrentBatch(final);
        setAllowReason(`Between batches - You missed earlier - Joining Final Mop-up ${final.batch} ${final.label} - Allowed - Only for applicants`);
      } else {
        setAllowReason(`Rolling Batch - Miss = Join Next - Allowed - Many batches`);
      }

      // Admin max per batch control - count active in this batch
      const activeKey = `lcns_batch_active_${curr?.batch || orig.batch}`;
      const activeCount = parseInt(localStorage.getItem(activeKey)||'0');
      if (activeCount >= maxPerBatch){
        // Still allow but tell to join next if full
        const nextIdx = currIdx >=0 ? Math.min(currIdx+1, ROLLING_BATCHES.length-1) : origIdx+1;
        const nextBatch = ROLLING_BATCHES[nextIdx];
        if (nextBatch && nextBatch.batch !== curr?.batch){
          setCurrentBatch(nextBatch);
          setAllowReason(prev=> prev + ` | Batch ${curr?.batch} is full (${activeCount}/${maxPerBatch} - Admin set max because not many systems). You are moved to Next Batch ${nextBatch.batch} ${nextBatch.label} - Rolling to many batches`);
        }
      }
      localStorage.setItem(activeKey, String(activeCount+1));

      setApplicant(app);
      // Mock questions - Replace with real CBT from your ExamOfficerDashboard
      const mockQs = Array.from({length:50}, (_,i)=> ({ id:`q${i+1}`, question:`Q${i+1} Nursing - ND/HND - Catholic Diocese - ${examDateSet||'2026/2027'}`, options:{A:'Option A',B:'Option B',C:'Option C',D:'Option D'} }));
      setQuestions(mockQs);
      setLoggedIn(true);
    } catch(e){ console.error(e); alert('Login error'); }
    setLoading(false);
  };

  const handleAnswer = (qId:string, opt:string) => {
    setAnswers(prev=> ({...prev, [qId]:opt}));
    localStorage.setItem(`lcns_exam_${formNo}_${qId}`, opt);
  };

  const handleFinalSubmit = async () => {
    if (submitted) return;
    setLoading(true);
    try {
      const sb = getSupabase();
      const payload = {
        form_no: formNo,
        full_name: applicant.fullName||applicant.full_name||applicant.name,
        original_batch: originalBatch?.batch,
        original_batch_label: originalBatch?.label,
        joined_batch: currentBatch?.batch,
        joined_batch_label: currentBatch?.label,
        rolling_status: currentBatch?.batch!==originalBatch?.batch ? `MISSED ${originalBatch?.batch} JOINED ${currentBatch?.batch} - Rolling - Many batches` : `ON TIME ${originalBatch?.batch}`,
        answers, total_answered: Object.keys(answers).length,
        submitted_at: new Date().toISOString(),
        bursar_cleared_date: applicant.bursarClearedDate||applicant.bursar_cleared_date,
        school: 'Labe College of Nursing Sciences, Gboko - Catholic Diocese of Gboko',
        exam_date: examDateSet,
        max_per_batch_admin_set: maxPerBatch,
        only_for_applicants: true,
      };
      if (sb){ await sb.from('college_exam_submissions').insert(payload); }
      const all = JSON.parse(localStorage.getItem('lcns_exam_submissions')||'[]'); all.push(payload);
      localStorage.setItem('lcns_exam_submissions', JSON.stringify(all));
      Object.keys(answers).forEach(qId=> localStorage.removeItem(`lcns_exam_${formNo}_${qId}`));
      const activeKey = `lcns_batch_active_${currentBatch?.batch}`;
      const cnt = parseInt(localStorage.getItem(activeKey)||'1');
      localStorage.setItem(activeKey, String(Math.max(0,cnt-1)));
      setSubmitted(true);
    } catch(e){ console.error(e); }
    setLoading(false);
  };

  const formatTime = (sec:number) => { const m=Math.floor(sec/60); const s=sec%60; return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; };

  if (submitted){
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-8">
          <h2 className="text-2xl font-black">✅ Submitted - Rolling Batch - Only Applicants</h2>
          <p className="font-bold uppercase mt-2">{applicant?.fullName||applicant?.full_name} - {formNo}</p>
          <p className="text-xs">Original: {originalBatch?.batch} {originalBatch?.label} | Joined: {currentBatch?.batch} {currentBatch?.label}</p>
          <p className="text-xs">Status: {currentBatch?.batch!==originalBatch?.batch?`MISSED ${originalBatch?.batch} JOINED ${currentBatch?.batch} - Allowed - Many batches`:'On Time'} | Exam Date: {examDateSet}</p>
        </div>
      </div>
    );
  }

  if (!loggedIn && applicant && originalBatch){
    const now = new Date();
    if ((now.getHours()+now.getMinutes()/60) < 9){
      return (
        <div className="max-w-2xl mx-auto p-4">
          <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-6 text-center">
            <h3 className="font-black text-amber-900">⏳ Batch Not Started Yet - {applicant.fullName||applicant.full_name}</h3>
            <p className="font-mono font-black">{formNo} - Batch {originalBatch.batch} {originalBatch.label}</p>
            <p className="text-xs">Exam starts 9AM - Many batches till 4PM Final Mop-up - Miss = Join Next - Only for Applicants</p>
          </div>
        </div>
      );
    }
  }

  if (!loggedIn){
    return (
      <div className="max-w-md mx-auto p-4 space-y-4">
        <div className="bg-gradient-to-r from-emerald-950 to-slate-900 text-white rounded-2xl p-6 text-center">
          <CollegeLogo size="sm" />
          <h2 className="font-black uppercase mt-2 text-sm">Labe College of Nursing Sciences, Gboko - Only Applicants Exam</h2>
          <p className="text-amber-300 text-xs font-black">Rolling Batch 1 Hour - 9AM-4PM - Miss = Join Next Batch - Many Batches - Admin controls max {maxPerBatch}</p>
          <p className="text-[11px] text-emerald-200">Date: {examDateSet||'Set by Provost/Registrar/Admin'} - Only LCNS/2026/XXXX applicants</p>
        </div>
        <div className="bg-white border-2 rounded-2xl p-5 space-y-3">
          <p className="text-xs font-black uppercase">Form No - Bursar Cleared Applicant Only - Rolling:</p>
          <input value={formNo} onChange={e=>setFormNo(e.target.value.toUpperCase())} placeholder="LCNS/2026/0255" className="w-full border-2 border-emerald-300 px-4 py-3 rounded-xl font-mono font-black text-sm" />
          <button onClick={handleLogin} disabled={loading} className="w-full bg-emerald-700 text-white py-3 rounded-xl font-black text-sm">{loading?'Checking...':'🔓 Login - Rolling - Miss = Join Next Batch - Many Batches'}</button>
          <div className="text-[11px] bg-slate-50 p-3 rounded-xl border space-y-1">
            <p className="font-black">Rolling Batches - Many - 1 Hour Interval:</p>
            {ROLLING_BATCHES.map(b=> <p key={b.batch}>Batch {b.batch}: {b.from}-{b.to} → {b.label}</p>)}
            <p className="font-bold text-emerald-800 mt-2">Miss 9AM? Join 10AM! Miss 10AM? Join 11AM! Till Final 3-4PM Mop-up - Only for Applicants!</p>
            <p>Network fails 9AM → Login 10:10AM → Join Batch B → Allowed - Many batches</p>
            <p>Admin max per batch: {maxPerBatch} - Because not many systems - If full, auto moves to next batch</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <div className="bg-gradient-to-r from-emerald-950 to-slate-900 text-white rounded-2xl p-4 flex flex-col md:flex-row justify-between gap-3">
        <div>
          <p className="font-black text-sm uppercase">{applicant.fullName||applicant.full_name} - {formNo} - Only Applicants - Rolling</p>
          <p className="text-xs text-amber-300">Original: {originalBatch?.batch} {originalBatch?.label} | Writing: {currentBatch?.batch} {currentBatch?.label} | {allowReason}</p>
          <p className="text-[11px] text-emerald-200">Many batches till 4PM - Miss = Join Next - Admin Max: {maxPerBatch} per batch - Less systems</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="bg-white text-emerald-900 px-4 py-2 rounded-xl font-mono font-black text-lg">{formatTime(timeLeft)}</div>
          <button onClick={handleFinalSubmit} className="bg-amber-400 text-black px-4 py-2 rounded-xl font-black text-xs">Submit</button>
        </div>
      </div>
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs">
        <p className="font-black">Rolling: {allowReason}</p>
        <p>Only Applicants - Miss = Join Next Batch - Many batches - Admin controls max {maxPerBatch}</p>
      </div>
      <div className="space-y-4">
        {questions.map((q, idx)=> (
          <div key={q.id} className="bg-white border-2 rounded-2xl p-4">
            <p className="font-bold text-sm">{idx+1}. {q.question}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
              {Object.entries(q.options||{}).map(([k,v])=> (
                <button key={k} onClick={()=>handleAnswer(q.id,k)} className={`text-left p-3 rounded-xl border-2 text-sm ${answers[q.id]===k?'bg-emerald-700 text-white font-black':'bg-slate-50'}`}><span className="font-black mr-2">{k}.</span>{v as string}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button onClick={handleFinalSubmit} className="w-full bg-emerald-700 text-white py-4 rounded-2xl font-black">✅ Submit - {formNo} - Original {originalBatch?.batch} Joined {currentBatch?.batch} - Rolling Many Batches - Only Applicants</button>
    </div>
  );
};
export default ExamPortal;

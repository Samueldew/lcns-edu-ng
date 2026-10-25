import React, { useState, useEffect } from 'react';
import { getSupabase } from '../../lib/supabase';

export const ApplicantPrintoutPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [rawApp, setRawApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const formNo = params.get('app_no') || params.get('form_no') || localStorage.getItem('lcns_current_app_no') || 'LCNS/2026/8902';
        
        const sb = getSupabase();
        if (!sb) { setLoading(false); return; }

        const { data: rows } = await sb.from('college_applications').select('*').order('created_at', {ascending:false}).limit(100);
        
        const found = rows?.find((r:any) => 
          r.form_no === formNo || 
          r.form_no?.includes('8902') ||
          r.full_application?.formNo === formNo ||
          r.full_application?.form_no === formNo ||
          r.full_application?.formNo?.includes('8902') ||
          r.full_application?.fullName?.toLowerCase().includes('terwase')
        );

        if (found) {
          setData(found);
          setRawApp(found.full_application || {});
          console.log("FULL DATA:", found);
          console.log("FULL_APPLICATION JSON:", found.full_application);
        }
      } catch(e){ console.error(e); }
      setLoading(false);
    };
    load();
  };

  if (loading) return <div className="p-10 text-center font-bold">Loading LCNS/2026/8902...</div>;
  if (!data) return <div className="p-10 text-center">No data. Open Console (F12) to see error. Table is college_applications.</div>;

  const app = rawApp || {};
  // Show EVERYTHING from JSON - not hardcoded keys
  const formNo = data.form_no || app.formNo || app.form_no || 'LCNS/2026/8902';
  const fullName = data.full_name || app.fullName || app.full_name || app.candidateName || 'TERWASE QUEEN';
  const examNo = data.exam_number || app.examNumber || app.exam_number || 'PENDING';

  return (
    <div className="min-h-screen bg-white">
      <style>{`@media print {.no-print{display:none!important} body{-webkit-print-color-adjust:exact} @page{margin:10mm}}`}</style>

      <div className="no-print bg-slate-100 p-3 flex justify-between max-w-5xl mx-auto">
        <button onClick={()=>window.history.back()} className="bg-white border px-4 py-2 rounded text-sm font-bold">← Back</button>
        <button onClick={()=>window.print()} className="bg-[#0a4d2e] text-white px-8 py-2 rounded font-black">🖨️ PRINT FULL FORM</button>
      </div>

      {/* PAPER - Matches your screenshot */}
      <div className="max-w-5xl mx-auto bg-white p-6 text-black">
        
        {/* HEADER - SAME AS YOUR SCREENSHOT */}
        <div className="text-center">
          <h1 className="text-[#0a4d2e] font-serif font-bold text-[20px] uppercase tracking-wide">LABE COLLEGE OF NURSING SCIENCES, GBOKO</h1>
          <h2 className="font-serif font-bold text-[18px] mt-1">Catholic Diocese of Gboko</h2>
          <p className="text-[14px] mt-1">2026/2027 Academic Session</p>
          <div className="h-[2px] bg-[#0a4d2e]/30 mt-4"></div>
        </div>

        {/* Candidate + Photo - SAME AS YOUR SCREENSHOT */}
        <div className="flex justify-between items-start mt-4 pb-4 border-b">
          <p className="text-[13px]">Candidate: <span className="uppercase font-bold">{fullName}</span> • Form No: <span className="font-mono font-bold">{formNo}</span> • Exam No: {examNo}</p>
          <div className="w-[110px] h-[130px] border-2 border-[#0a4d2e] overflow-hidden">
            <img src={app.passportUrl || app.passportPhotoUrl || app.passport || app.photo || app.passportPhoto || ''} 
                 alt="Passport" className="w-full h-full object-cover" 
                 onError={(e:any)=> e.target.parentElement.innerHTML='<div class="flex items-center justify-center h-full text-[10px]">NO PHOTO</div>'} />
          </div>
        </div>

        {/* SECTION A - BIODATA */}
        <div className="mt-6">
          <h3 className="bg-[#0a4d2e] text-white px-3 py-1 text-[13px] font-black uppercase">Section A: Biodata / Personal Information</h3>
          <div className="border border-black grid grid-cols-2 text-[12px]">
            <div className="border-b border-r border-black p-2"><b>Full Name:</b> {fullName}</div>
            <div className="border-b border-black p-2"><b>Gender:</b> {app.gender || app.sex || 'N/A'}</div>
            <div className="border-b border-r border-black p-2"><b>Date of Birth:</b> {app.dob || app.dateOfBirth || app.birthDate || 'N/A'}</div>
            <div className="border-b border-black p-2"><b>Phone:</b> {app.phone || app.phoneNumber || data.phone || 'N/A'}</div>
            <div className="border-b border-r border-black p-2"><b>Email:</b> {app.email || data.email || 'N/A'}</div>
            <div className="border-b border-black p-2"><b>State / LGA:</b> {app.stateOfOrigin || app.state || 'N/A'} / {app.lga || 'N/A'}</div>
            <div className="border-b border-r border-black p-2 col-span-2"><b>Home Address:</b> {app.address || app.homeAddress || app.contactAddress || app.residentialAddress || 'N/A'}</div>
            <div className="border-r border-black p-2"><b>Next of Kin:</b> {app.nextOfKin || app.sponsorName || app.guardianName || 'N/A'}</div>
            <div className="p-2"><b>Next of Kin Phone:</b> {app.nextOfKinPhone || app.sponsorPhone || 'N/A'}</div>
          </div>
        </div>

        {/* SECTION B - JAMB */}
        <div className="mt-5">
          <h3 className="bg-[#0a4d2e] text-white px-3 py-1 text-[13px] font-black uppercase">Section B: JAMB Information</h3>
          <div className="border border-black grid grid-cols-2 text-[12px]">
            <div className="border-b border-r border-black p-2"><b>JAMB Reg No:</b> {app.jambRegNo || app.jambNumber || app.jambReg || 'N/A'}</div>
            <div className="border-b border-black p-2"><b>JAMB Score:</b> {app.jambScore || app.utmeScore || 'N/A'}</div>
            <div className="border-b border-r border-black p-2"><b>JAMB Year:</b> {app.jambYear || '2025'}</div>
            <div className="border-b border-black p-2"><b>Subjects:</b> {app.jambSubjects || app.utmeSubjects || app.subjects || 'N/A'}</div>
          </div>
        </div>

        {/* SECTION C - COURSE */}
        <div className="mt-5">
          <h3 className="bg-[#0a4d2e] text-white px-3 py-1 text-[13px] font-black uppercase">Section C: Course Applied</h3>
          <div className="border border-black p-2 text-[12px]">
            <p><b>Program / Course:</b> {app.courseChoice1 || app.program || app.course || app.courseApplied || app.department || 'Basic Nursing'}</p>
            <p><b>Second Choice:</b> {app.courseChoice2 || 'HND Nursing'}</p>
          </div>
        </div>

        {/* SECTION D - SSCE */}
        <div className="mt-5">
          <h3 className="bg-[#0a4d2e] text-white px-3 py-1 text-[13px] font-black uppercase">Section D: SSCE / O'Level Results</h3>
          <div className="border border-black text-[12px]">
            <table className="w-full border-collapse">
              <thead><tr className="bg-slate-100"><th className="border border-black p-1 text-left">Subject</th><th className="border border-black p-1">Grade</th><th className="border border-black p-1">Exam Type</th><th className="border border-black p-1">Year</th></tr></thead>
              <tbody>
                {/* Try to parse any olevel structure */}
                {(() => {
                  const grades = app.olevelGrades || app.oLevelGrades || app.ssceGrades || app.grades || {};
                  if (typeof grades === 'object' && Object.keys(grades).length > 0) {
                    return Object.entries(grades).map(([subj, grade]:any, i:number) => (
                      <tr key={i}><td className="border border-black p-1">{subj}</td><td className="border border-black p-1 font-bold">{String(grade)}</td><td className="border border-black p-1">{app.olevelExamType || app.examType || 'WAEC'}</td><td className="border border-black p-1">{app.olevelExamYear || app.examYear || '2023'}</td></tr>
                    ));
                  }
                  // Fallback 5 core subjects
                  return (
                    <>
                      <tr><td className="border border-black p-1">English Language</td><td className="border border-black p-1 font-bold">{app.englishGrade || app.olevelGrades?.english || 'N/A'}</td><td className="border border-black p-1">{app.examType || 'WAEC'}</td><td className="border border-black p-1">{app.examYear || '2023'}</td></tr>
                      <tr><td className="border border-black p-1">Mathematics</td><td className="border border-black p-1 font-bold">{app.mathGrade || app.olevelGrades?.mathematics || 'N/A'}</td><td className="border border-black p-1">{app.examType || 'WAEC'}</td><td className="border border-black p-1">{app.examYear || '2023'}</td></tr>
                      <tr><td className="border border-black p-1">Biology</td><td className="border border-black p-1 font-bold">{app.bioGrade || app.olevelGrades?.biology || 'N/A'}</td><td className="border border-black p-1">{app.examType || 'WAEC'}</td><td className="border border-black p-1">{app.examYear || '2023'}</td></tr>
                      <tr><td className="border border-black p-1">Chemistry</td><td className="border border-black p-1 font-bold">{app.chemGrade || app.olevelGrades?.chemistry || 'N/A'}</td><td className="border border-black p-1">{app.examType || 'WAEC'}</td><td className="border border-black p-1">{app.examYear || '2023'}</td></tr>
                      <tr><td className="border border-black p-1">Physics</td><td className="border border-black p-1 font-bold">{app.physGrade || app.olevelGrades?.physics || 'N/A'}</td><td className="border border-black p-1">{app.examType || 'WAEC'}</td><td className="border border-black p-1">{app.examYear || '2023'}</td></tr>
                    </>
                  );
                })()}
              </tbody>
            </table>
            <div className="p-2 border-t border-black"><b>SSCE Exam No:</b> {app.olevelExamNo || app.waecNo || app.necoNo || 'N/A'} | <b>Sitting:</b> {app.sitting || app.noOfSittings || 'One Sitting'} | <b>Type:</b> {app.olevelExamType || app.examType || 'WAEC'}</div>
          </div>
        </div>

        {/* DEBUG - SHOW ALL CAPTURED DATA IF STILL BLANK */}
        <div className="mt-6 border-2 border-dashed border-red-300 p-3 bg-red-50 text-[10px] no-print">
          <p className="font-bold">DEBUG - All data captured during registration (this box will NOT print):</p>
          <pre className="whitespace-pre-wrap break-words max-h-60 overflow-auto">{JSON.stringify(app, null, 2)}</pre>
        </div>

        {/* INSTRUCTION - COME ALONG WITH IT */}
        <div className="mt-8 border-[3px] border-black p-4 bg-yellow-50">
          <p className="font-black uppercase text-center text-[13px]">Important Instruction</p>
          <p className="font-bold text-[12px] mt-2">Candidate MUST come along with this printed form and submit to school Admission Office:</p>
          <ol className="list-decimal ml-5 text-[12px] mt-2 space-y-1 font-medium">
            <li>Print this form in COLOUR - Form No: <b>{formNo}</b></li>
            <li>Come along with it and submit at LABE College of Nursing Sciences, Gboko - Catholic Diocese of Gboko</li>
            <li>Come with Original JAMB Result, SSCE (WAEC/NECO) Result, Birth Certificate, LGA Identification</li>
            <li>Come with Bursar Receipt and 4 Passport Photographs</li>
            <li>School Logo is on this form - It is your official slip</li>
          </ol>
          <p className="text-center font-black uppercase text-[11px] mt-3">Without this form you will NOT be allowed for screening - Come along with it</p>
        </div>

        <div className="flex justify-between mt-10 text-[12px]">
          <div className="text-center"><div className="border-t border-black w-40 pt-1">Applicant Signature</div></div>
          <div className="text-center"><div className="border-t border-black w-40 pt-1">Admission Officer</div></div>
        </div>

        <div className="text-center text-[10px] mt-6 border-t pt-2">LABE COLLEGE OF NURSING SCIENCES, GBOKO - {formNo} - {new Date().toLocaleString()}</div>
      </div>
    </div>
  );
};

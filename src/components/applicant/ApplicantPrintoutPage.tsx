import React, { useState, useEffect } from 'react';
import { CollegeLogo } from '../common/CollegeLogo';
import { Applicant, COLLEGE_CONFIG } from '../../types';
import { StorageService } from '../../services/storage';
import { getSupabase } from '../../lib/supabase';
import {
  Printer,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  ArrowLeft,
  User,
  ShieldCheck,
} from 'lucide-react';

export const ApplicantPrintoutPage: React.FC = () => {
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [loading, setLoading] = useState(true);
  const [feeConfig, setFeeConfig] = useState<any>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const formNo =
      params.get('app_no') ||
      params.get('form_no') ||
      localStorage.getItem('lcns_current_app_no');

    const applicants = StorageService.getApplicants();
    const found =
      (formNo &&
        applicants.find(
          (a) =>
            a.formNo.toLowerCase() === formNo.toLowerCase() ||
            a.email.toLowerCase() === formNo.toLowerCase()
        )) ||
      applicants[0];

    setApplicant(found || null);
    if (found) {
      loadSupabaseSync(found.formNo);
    } else {
      // Try load directly from Supabase if not in localStorage
      if(formNo) loadSupabaseSync(formNo);
      else setLoading(false);
    }
  }, []);

  const loadSupabaseSync = async (formNo: string) => {
    try {
      const sb = getSupabase();
      if (sb) {
        // FIX 1: Your table is college_applications, not applications
        const { data } = await sb
          .from('college_applications')
          .select('*')
          .or(`form_no.eq.${formNo},form_no.ilike.%${formNo}%`)
          .limit(1);

        // Also try inside JSON
        let row = data && data[0];
        if(!row){
          const { data: data2 } = await sb.from('college_applications').select('*').order('created_at', {ascending: false}).limit(20);
          row = data2?.find((r:any) => r.form_no === formNo || r.full_application?.formNo === formNo || r.full_application?.form_no === formNo);
        }

        if (row) {
          const appJson = row.full_application || {};
          setApplicant((prev) => {
            const base = prev || {
              formNo: row.form_no || appJson.formNo,
              fullName: row.full_name || appJson.fullName,
              email: row.email || appJson.email,
              phone: row.phone || appJson.phone,
            } as Applicant;
            
            return {
              ...base,
              ...appJson, // ALL DATA CAPTURED DURING REGISTRATION
              formNo: row.form_no || appJson.formNo || base.formNo,
              fullName: row.full_name || appJson.fullName || base.fullName,
              email: row.email || appJson.email || base.email,
              phone: row.phone || appJson.phone || base.phone,
              bursar_cleared: row.bursar_cleared ?? row.bursarCleared ?? appJson.bursar_cleared,
              bursarCleared: row.bursar_cleared ?? appJson.bursar_cleared,
              exam_number: row.exam_number || appJson.examNumber,
              examNumber: row.exam_number || appJson.examNumber,
              status: row.status || row.bursar_status || appJson.status,
              bursarStatus: row.bursar_status || appJson.bursarStatus,
              passportPhotoUrl: appJson.passportUrl || appJson.passportPhotoUrl || appJson.passport,
            };
          });
        }

        // Load variable fee config
        const { data: feeData } = await sb.from('lcns_fee_config').select('*');
        if(feeData){
          const screenFee = feeData.find((f:any)=> f.type === 'SCREENING' || f.id === 'screen');
          setFeeConfig(screenFee);
        }
      }
    } catch (err) {
      console.warn('Printout Supabase sync error:', err);
    }
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const isBursarCleared = Boolean(
    applicant &&
      (applicant.bursar_cleared ||
        applicant.bursarCleared ||
        applicant.bursarStatus === 'CLEARED' ||
        applicant.status === 'BURSAR_CLEARED' ||
        applicant.status === 'CLEARED' ||
        applicant.status === 'ADMITTED')
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#0a4d2e] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Loading Application Printout...</p>
        </div>
      </div>
    );
  }

  if (!applicant) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">No Applicant Found</h2>
          <p className="text-xs text-slate-600">Please provide an application number to view printout.</p>
          <a href="/check-admission" className="inline-block py-2 px-4 bg-[#0a4d2e] text-white rounded-xl text-xs font-bold">
            Check Admission Status
          </a>
        </div>
      </div>
    );
  }

  const app: any = applicant as any;
  const screeningFeeText = feeConfig ? `₦${feeConfig.amount.toLocaleString()}` : '₦15,000';

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <style>{`@media print { .no-print{display:none!important} @page{size:A4;margin:10mm} body{-webkit-print-color-adjust:exact} }`}</style>
      
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 no-print bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <a href={`/applicant/dashboard?app_no=${encodeURIComponent(applicant.formNo)}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" /><span>Return to Candidate Dashboard</span>
          </a>
          <div className="flex items-center gap-2">
            {isBursarCleared ? (
              <button onClick={handlePrint} className="px-5 py-2.5 bg-[#0a4d2e] hover:bg-[#073822] text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2">
                <Printer className="w-4 h-4 text-amber-300" /><span>Print Full Application Form (PDF)</span>
              </button>
            ) : (
              <button disabled className="px-5 py-2.5 bg-slate-200 text-slate-400 rounded-xl text-xs font-bold cursor-not-allowed flex items-center gap-2">
                <Printer className="w-4 h-4" /><span>Locked • Awaiting Bursar Clearance</span>
              </button>
            )}
          </div>
        </div>

        {!isBursarCleared ? (
          <div className="p-8 sm:p-12 text-center bg-amber-50 rounded-3xl border-2 border-amber-300 space-y-4 shadow-sm">
            <Clock className="w-16 h-16 text-amber-600 mx-auto" />
            <h2 className="text-xl sm:text-2xl font-black uppercase text-amber-950">Awaiting Bursar Clearance</h2>
            <p className="text-sm text-amber-900 max-w-lg mx-auto">Applicant <strong>{applicant.fullName}</strong> (<code>{applicant.formNo}</code>) cannot print because <strong>{screeningFeeText} Screening Fee</strong> has not yet been cleared by Bursar.</p>
            <div className="inline-block px-4 py-1.5 rounded-full bg-amber-200 text-amber-950 text-xs font-bold uppercase">Status: PENDING_BURSAR</div>
          </div>
        ) : (
          <div className="border-4 border-double border-[#0a4d2e] rounded-2xl p-6 bg-white shadow-xl print-page space-y-6">
            
            {/* HEADER WITH SCHOOL LOGO */}
            <div className="text-center pb-4 border-b-4 border-[#0a4d2e]">
              <div className="flex items-center justify-center gap-4 mb-2">
                <CollegeLogo size="md" />
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-emerald-950 uppercase">Labe College of Nursing Sciences, Gboko</h1>
                  <p className="text-xs font-bold text-[#0a4d2e] uppercase">Benue State, Nigeria • Motto: "Learn, Serve & Save"</p>
                  <p className="text-[11px] text-slate-500">P.M.B. 104, Along Agbile Road, Gboko • info@lcns.edu.ng • 08126799565</p>
                  <div className="inline-block bg-[#0a4d2e] text-white font-bold text-xs uppercase px-5 py-1.5 rounded-full mt-2">2026/2027 Full Application Form - Official Printout</div>
                </div>
              </div>
            </div>

            {/* FORM NO + PHOTO TOP */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              <div className="md:col-span-2 space-y-4">
                
                {/* SECTION A: BIODATA / PERSONAL INFO */}
                <div>
                  <h3 className="bg-[#0a4d2e] text-white px-3 py-1.5 font-black uppercase text-xs rounded">Section A: Biodata / Personal Information</h3>
                  <div className="border border-slate-300 grid grid-cols-2 text-xs">
                    <div className="border-b border-r p-2"><strong>Full Name:</strong> <span className="uppercase font-bold">{app.fullName}</span></div>
                    <div className="border-b p-2"><strong>Application No:</strong> <span className="font-mono font-bold text-[#0a4d2e]">{app.formNo}</span></div>
                    <div className="border-b border-r p-2"><strong>Gender:</strong> {app.gender || 'N/A'}</div>
                    <div className="border-b p-2"><strong>Date of Birth:</strong> {app.dob || app.dateOfBirth || 'N/A'}</div>
                    <div className="border-b border-r p-2"><strong>Phone:</strong> {app.phone}</div>
                    <div className="border-b p-2"><strong>Email:</strong> {app.email}</div>
                    <div className="border-b border-r p-2"><strong>State of Origin:</strong> {app.stateOfOrigin || app.state || 'N/A'}</div>
                    <div className="border-b p-2"><strong>LGA:</strong> {app.lga || 'N/A'}</div>
                    <div className="border-b border-r p-2"><strong>Marital Status:</strong> {app.maritalStatus || 'Single'}</div>
                    <div className="border-b p-2"><strong>Religion:</strong> {app.religion || 'N/A'}</div>
                    <div className="col-span-2 p-2"><strong>Residential Address:</strong> {app.address || app.homeAddress || app.contactAddress || 'N/A'}</div>
                    <div className="border-t border-r p-2"><strong>Next of Kin:</strong> {app.nextOfKin || app.sponsorName || 'N/A'}</div>
                    <div className="border-t p-2"><strong>Next of Kin Phone:</strong> {app.nextOfKinPhone || app.sponsorPhone || 'N/A'}</div>
                  </div>
                </div>

                {/* SECTION B: JAMB INFO */}
                <div>
                  <h3 className="bg-[#0a4d2e] text-white px-3 py-1.5 font-black uppercase text-xs rounded">Section B: JAMB Information</h3>
                  <div className="border border-slate-300 grid grid-cols-2 text-xs">
                    <div className="border-b border-r p-2"><strong>JAMB Reg No:</strong> {app.jambRegNo || app.jambNumber || 'N/A'}</div>
                    <div className="border-b p-2"><strong>JAMB Score:</strong> {app.jambScore || 'N/A'}</div>
                    <div className="border-b border-r p-2"><strong>JAMB Year:</strong> {app.jambYear || '2025'}</div>
                    <div className="border-b p-2"><strong>UTME Subjects:</strong> {app.utmeSubjects || app.jambSubjects || 'English, Biology, Chemistry, Physics'}</div>
                  </div>
                </div>

                {/* SECTION C: COURSE APPLY */}
                <div>
                  <h3 className="bg-[#0a4d2e] text-white px-3 py-1.5 font-black uppercase text-xs rounded">Section C: Course Applied For</h3>
                  <div className="border border-slate-300 p-2 text-xs grid grid-cols-2">
                    <div className="border-r pr-2"><strong>First Choice:</strong> {app.courseChoice1 || app.program || app.course || 'Basic Nursing'}</div>
                    <div className="pl-2"><strong>Second Choice:</strong> {app.courseChoice2 || 'HND Nursing'}</div>
                    <div className="col-span-2 mt-1"><strong>Session:</strong> 2026/2027 | <strong>Exam No:</strong> <span className="font-mono font-bold">{app.exam_number || app.examNumber}</span></div>
                  </div>
                </div>

              </div>

              {/* PASSPORT TOP RIGHT */}
              <div className="flex flex-col items-center">
                <div className="w-36 h-44 border-2 border-[#0a4d2e] rounded-xl overflow-hidden shadow bg-slate-100 flex items-center justify-center">
                  {app.passportPhotoUrl || app.passportUrl || app.passport ? (
                    <img src={app.passportPhotoUrl || app.passportUrl || app.passport} alt="Passport" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-slate-400" />
                  )}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 font-bold uppercase">Official Passport</span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full mt-1 font-bold">Verified Biometric</span>
              </div>
            </div>

            {/* SECTION D: SSCE / O'LEVEL */}
            <div>
              <h3 className="bg-[#0a4d2e] text-white px-3 py-1.5 font-black uppercase text-xs rounded">Section D: SSCE / O'Level Results - Full Details</h3>
              <div className="border border-slate-300">
                <table className="w-full text-xs border-collapse">
                  <thead className="bg-emerald-50 text-emerald-950 font-bold">
                    <tr><th className="border p-2 text-left">Subject</th><th className="border p-2 text-left">Grade</th><th className="border p-2 text-left">Exam Type</th><th className="border p-2 text-left">Exam Year</th><th className="border p-2 text-left">Sitting</th></tr>
                  </thead>
                  <tbody>
                    {[
                      {sub:'English Language', grade: app.olevelGrades?.english || app.englishGrade || 'N/A'},
                      {sub:'Mathematics', grade: app.olevelGrades?.mathematics || app.mathGrade || 'N/A'},
                      {sub:'Biology', grade: app.olevelGrades?.biology || app.bioGrade || 'N/A'},
                      {sub:'Chemistry', grade: app.olevelGrades?.chemistry || app.chemGrade || 'N/A'},
                      {sub:'Physics', grade: app.olevelGrades?.physics || app.physGrade || 'N/A'},
                      ...(app.olevelGrades?.otherSubjects || [])
                    ].map((r:any,i:number)=>(
                      <tr key={i} className="font-medium"><td className="border p-1.5">{r.sub || r.subject}</td><td className="border p-1.5 font-bold">{r.grade}</td><td className="border p-1.5">{app.olevelExamType || app.examType || 'WAEC'}</td><td className="border p-1.5">{app.olevelExamYear || app.examYear || '2023'}</td><td className="border p-1.5">{app.sitting || 'One Sitting'}</td></tr>
                    ))}
                    <tr className="bg-slate-50"><td colSpan={5} className="border p-1.5"><strong>Exam Number:</strong> {app.olevelExamNo || app.waecNo || app.ssceExamNo || 'N/A'} | <strong>Centre:</strong> {app.olevelCentre || 'N/A'}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* BURSAR STAMP */}
            <div className="p-4 rounded-2xl border-2 border-dashed flex flex-col sm:flex-row items-center justify-between gap-4 bg-emerald-50/50">
              <div className="space-y-1 text-xs">
                <span className="font-bold text-emerald-950 block uppercase">Bursary Clearance:</span>
                <p>Payment Voucher: <strong>{app.paymentReceiptName || 'Proof_of_Payment.pdf'}</strong></p>
                <div className="text-[11px] text-[#0a4d2e] font-bold">Screening Fee {screeningFeeText} Verified • Cleared for CBT</div>
              </div>
              <div className="border-4 border-emerald-800 rounded-xl p-3 text-center bg-white rotate-1">
                <div className="text-[10px] font-black uppercase">LABE COLLEGE OF NURSING</div>
                <div className="text-xs font-black text-emerald-800">★ BURSAR CLEARED ★</div>
                <div className="text-[10px] font-mono font-bold">DATE: {app.bursarClearedDate?.substring(0,10) || new Date().toISOString().split('T')[0]}</div>
              </div>
            </div>

            {/* COME ALONG WITH IT INSTRUCTION */}
            <div className="mt-6 bg-amber-50 border-2 border-black p-4 text-sm">
              <h4 className="font-black uppercase text-center mb-2">Important - Come Along With This Form & Submit To School</h4>
              <p className="font-bold">Applicant MUST come along with this printed form and submit it at the College Admission Office with the following documents:</p>
              <ol className="list-decimal ml-5 mt-2 space-y-1 font-medium">
                <li>This Printed Application Form (Coloured) - Application No: <strong>{app.formNo}</strong></li>
                <li>Bursar Clearance Receipt (Screening Fee {screeningFeeText})</li>
                <li>Original JAMB Result Slip (Reg No: {app.jambRegNo})</li>
                <li>Original SSCE Result (WAEC/NECO) - {app.olevelExamType} {app.olevelExamYear}</li>
                <li>Birth Certificate / Declaration of Age</li>
                <li>Local Government Identification Letter</li>
                <li>4 Recent Passport Photographs</li>
                <li>Medical Fitness Certificate</li>
              </ol>
              <p className="mt-3 font-black text-center uppercase text-xs">Without this form, you will NOT be allowed for screening. Come along with it on screening day.</p>
            </div>

            {/* SIGNATURES */}
            <div className="pt-4 flex justify-between items-end text-xs">
              <div className="text-center"><div className="w-40 border-b border-black pb-1 font-bold">Candidate Signature</div><span className="text-[10px] text-slate-500">Applicant: {app.fullName}</span></div>
              <div className="text-center"><div className="w-40 border-b border-black pb-1 font-bold">Barr. Timothy J. Iorbee</div><span className="text-[10px] text-slate-500">College Registrar</span></div>
            </div>

            <div className="text-center text-[10px] mt-4 border-t pt-2">
              <p>Lincoln/Labe College of Nursing Sciences, Gboko - Generated {new Date().toLocaleString()} - {app.formNo} / {app.exam_number || app.examNumber}</p>
              <p>This form is not for sale - Valid for 2026/2027 Session - Come along with it and submit to school</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

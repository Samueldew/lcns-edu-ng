import React, { useRef, useEffect, useState } from 'react';
import { CollegeLogo } from "../common/CollegeLogo";

const ApplicantPrintoutPage: React.FC = () => {
  const printRef = useRef<HTMLDivElement>(null);
  const [applicant, setApplicant] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem('applicantData');
    if (data) { try { setApplicant(JSON.parse(data)); } catch {} }
    if (!data) {
      setApplicant({
        fullName: 'Sample Applicant',
        applicationNo: 'LABE/2024/001',
        email: 'test@example.com',
        phone: '08012345678',
        course: 'General Nursing',
        jambRegNo: '12345678AB'
      });
    }
  }, []);

  const handlePrint = () => {
    if (printRef.current) {
      const content = printRef.current.innerHTML;
      const original = document.body.innerHTML;
      document.body.innerHTML = content;
      window.print();
      document.body.innerHTML = original;
      window.location.reload();
    }
  };

  if (!applicant) return <div className="p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between mb-4">
          <h1 className="font-bold">Application Slip</h1>
          <button onClick={handlePrint} className="bg-emerald-700 text-white px-6 py-2 rounded-lg font-bold">Print</button>
        </div>
        <div ref={printRef} className="bg-white border-4 border-double border-emerald-900 p-8 rounded-xl">
          <div className="flex justify-between items-center border-b-2 border-emerald-900 pb-4 mb-6">
            <CollegeLogo size="lg" />
            <div className="text-center">
              <h1 className="font-black text-xl text-emerald-900">LABE COLLEGE OF NURSING SCIENCES, GBOKO</h1>
              <p className="text-xs font-bold mt-1">ADMISSION APPLICATION SLIP</p>
            </div>
            <CollegeLogo size="lg" />
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex border-b py-2"><span className="font-bold w-48">Application No:</span><span className="font-black">{applicant.applicationNo}</span></div>
            <div className="flex border-b py-2"><span className="font-bold w-48">Full Name:</span><span className="font-bold uppercase">{applicant.fullName}</span></div>
            <div className="flex border-b py-2"><span className="font-bold w-48">Course:</span><span>{applicant.course}</span></div>
            <div className="flex border-b py-2"><span className="font-bold w-48">Email:</span><span>{applicant.email}</span></div>
            <div className="flex border-b py-2"><span className="font-bold w-48">Phone:</span><span>{applicant.phone}</span></div>
            <div className="flex border-b py-2"><span className="font-bold w-48">JAMB Reg:</span><span>{applicant.jambRegNo}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantPrintoutPage;

import React from 'react';
import { CollegeLogo } from './CollegeLogo';

interface Props {
  student: any;
  results: any[];
  academicYear?: string;
  semester?: string;
  gpa?: number;
  cgpa?: number;
  senateApproved?: boolean;
  provostName?: string;
}

// NAMED EXPORT - THIS FIXES YOUR ERROR - HODDashboard imports { PrintableResultWithLogo }
export const PrintableResultWithLogo: React.FC<Props> = ({
  student,
  results = [],
  academicYear = '2026/2027',
  semester = 'First Semester',
  gpa = 0,
  cgpa = 0,
  senateApproved = false,
  provostName = 'Provost'
}) => {
  const totalUnits = results.reduce((s: number, r: any) => s + (r.creditUnit || r.unit || 0), 0);
  const name = student?.fullName || student?.full_name || 'Student';
  const matric = student?.matricNumber || student?.matric_no || student?.email || '-';
  const level = student?.level || 'ND1';
  const dept = student?.department || 'Nursing';
  const sex = student?.sex || '-';

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center border-b-4 border-[#0a4d2e] pb-4 mb-6">
        <CollegeLogo size="lg" />
        <div className="text-center flex-1">
          <h1 className="text-xl font-black uppercase text-[#0a4d2e]">Labe College of Nursing Sciences</h1>
          <p className="text-[11px] font-bold">Catholic Diocese of Gboko</p>
          <p className="text-[11px] font-black mt-1">RESULT - {academicYear} - {semester}</p>
          {senateApproved && <p className="text-[9px] font-black text-emerald-700 border border-emerald-600 px-2 py-0.5 rounded-full inline-block mt-1">SENATE APPROVED - {provostName}</p>}
        </div>
        <CollegeLogo size="lg" />
      </div>

      <div className="grid grid-cols-2 gap-4 bg-slate-50 border-2 rounded-2xl p-4 mb-6 text-[11px]">
        <div><b>Full Name:</b> <span className="font-black">{name}</span></div>
        <div><b>Matric No:</b> <span className="font-mono font-black">{matric}</span></div>
        <div><b>Sex:</b> <span className="font-black">{sex}</span></div>
        <div><b>Level:</b> <span className="font-black">{level}</span></div>
        <div><b>Department:</b> <span className="font-black">{dept}</span></div>
        <div><b>Year:</b> <span className="font-black">{academicYear}</span></div>
      </div>

      <div className="border-2 rounded-2xl overflow-hidden mb-6">
        <table className="w-full text-[11px]">
          <thead className="bg-slate-900 text-white"><tr><th className="p-3 text-left">S/N</th><th className="p-3 text-left">Code</th><th className="p-3 text-left">Title</th><th className="p-3">Unit</th><th className="p-3">Score</th><th className="p-3">Grade</th></tr></thead>
          <tbody>
            {results.length === 0 ? <tr><td colSpan={6} className="p-6 text-center">No results</td></tr> : results.map((r: any, i: number) => (
              <tr key={i} className="border-b"><td className="p-3">{i + 1}</td><td className="p-3 font-black">{r.courseCode || r.code}</td><td className="p-3">{r.courseTitle || r.title}</td><td className="p-3 text-center">{r.creditUnit || r.unit}</td><td className="p-3 text-center font-black">{r.score || r.total}</td><td className="p-3 text-center">{r.grade}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-50 border-2 rounded-xl p-3 text-center"><p className="text-[10px] font-bold">Total Units</p><p className="text-lg font-black">{totalUnits}</p></div>
        <div className="bg-emerald-50 border-2 rounded-xl p-3 text-center"><p className="text-[10px] font-bold">GPA</p><p className="text-lg font-black">{gpa.toFixed(2)}</p></div>
        <div className="bg-blue-50 border-2 rounded-xl p-3 text-center"><p className="text-[10px] font-bold">CGPA</p><p className="text-lg font-black">{cgpa.toFixed(2)}</p></div>
      </div>

      <div className="mt-6 text-center"><button onClick={() => window.print()} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black print:hidden">Print Result - {name} - {matric}</button></div>
    </div>
  );
};

// DEFAULT EXPORT - ALSO KEEP FOR OTHER IMPORTS
export default PrintableResultWithLogo;

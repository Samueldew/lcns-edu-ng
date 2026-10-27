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

export const PrintableResultWithLogo: React.FC<Props> = ({ student, results = [], academicYear = '2026/2027', semester = 'First Semester', gpa = 0, cgpa = 0, senateApproved = false, provostName = 'Provost' }) => {
  const totalUnits = results.reduce((s: number, r: any) => s + (r.creditUnit || r.unit || 0), 0);
  const name = student?.fullName || student?.full_name || 'Student';
  const matric = student?.matricNumber || student?.matric_no || student?.email || '-';
  const level = student?.level || 'ND1';
  const sex = student?.sex || '-';
  const dept = student?.department || 'Nursing';

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center border-b-4 border-[#0a4d2e] pb-4 mb-6">
        <CollegeLogo size="lg" />
        <div className="text-center flex-1">
          <h1 className="text-xl font-black uppercase text-[#0a4d2e]">Labe College of Nursing Sciences</h1>
          <p className="text-[11px] font-bold">Catholic Diocese of Gboko</p>
          <p className="text-[11px] font-black mt-1">RESULT - {academicYear} - {semester}</p>
        </div>
        <CollegeLogo size="lg" />
      </div>
      <div className="grid grid-cols-2 gap-4 bg-slate-50 border-2 rounded-2xl p-4 mb-6 text-[11px]">
        <div><b>Name:</b> {name}</div><div><b>Matric:</b> {matric}</div>
        <div><b>Sex:</b> {sex}</div><div><b>Level:</b> {level}</div>
        <div><b>Dept:</b> {dept}</div><div><b>Year:</b> {academicYear}</div>
      </div>
      <div className="border-2 rounded-2xl overflow-hidden mb-6">
        <table className="w-full text-[11px]">
          <thead className="bg-slate-900 text-white"><tr><th className="p-3 text-left">Code</th><th className="p-3 text-left">Title</th><th className="p-3">Unit</th><th className="p-3">Score</th><th className="p-3">Grade</th></tr></thead>
          <tbody>{results.map((r: any, i: number) => <tr key={i} className="border-b"><td className="p-3 font-black">{r.courseCode || r.code}</td><td className="p-3">{r.courseTitle || r.title}</td><td className="p-3 text-center">{r.creditUnit || r.unit}</td><td className="p-3 text-center font-black">{r.score}</td><td className="p-3 text-center">{r.grade}</td></tr>)}</tbody>
        </table>
      </div>
      <div className="text-center"><button onClick={() => window.print()} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black print:hidden">Print Result</button></div>
    </div>
  );
};

export default PrintableResultWithLogo;

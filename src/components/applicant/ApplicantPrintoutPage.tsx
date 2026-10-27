import React from 'react';
import { CollegeLogo } from './CollegeLogo';

// Helper functions — needed by other files
export const gradeSystem = (score: number) => {
  if (score >= 70) return { grade: 'A', point: 4, remark: 'Excellent' };
  if (score >= 60) return { grade: 'B', point: 3, remark: 'Very Good' };
  if (score >= 50) return { grade: 'C', point: 2, remark: 'Good' };
  if (score >= 40) return { grade: 'D', point: 1, remark: 'Pass' };
  return { grade: 'F', point: 0, remark: 'Fail' };
};

export const getClassOfDiploma = (cgpa: number) => {
  if (cgpa >= 3.5) return { class: 'DISTINCTION' };
  if (cgpa >= 3.0) return { class: 'UPPER CREDIT' };
  if (cgpa >= 2.5) return { class: 'LOWER CREDIT' };
  if (cgpa >= 2.0) return { class: 'PASS' };
  return { class: 'FAIL' };
};

// ✅ NAMED EXPORT — Fixes Provost, Registrar, HOD — 3 errors!
export const PrintableResultWithLogo: React.FC<{
  matricNo: string;
  fullName: string;
  level: string;
  semester?: string;
  session?: string;
  results: any[];
  cgpa?: number;
}> = ({ matricNo, fullName, level, semester, session, results, cgpa }) => {
  const totalUnits = results?.reduce((sum: number, r: any) => sum + (r.creditUnit || r.unit || 0), 0) || 0;
  
  return (
    <div className="printable-result">
      <div id={`printable-${matricNo}`} className="bg-white border-4 border-double border-emerald-900 p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <CollegeLogo size="lg" />
          <div className="text-center">
            <h1 className="font-black text-lg text-emerald-900">LABE COLLEGE OF NURSING SCIENCES, GBOKO</h1>
            <p className="text-xs font-bold">Official Result Sheet</p>
            <p className="text-[11px] mt-1">{matricNo} | {fullName} | {level} | {semester} {session}</p>
            {cgpa !== undefined && <p className="text-[11px] font-black">CGPA: {cgpa.toFixed(2)}</p>}
          </div>
          <CollegeLogo size="lg" />
        </div>
        <table className="w-full text-[11px] border mt-3">
          <thead className="bg-emerald-900 text-white">
            <tr>
              <th className="p-2 text-left">Course Code</th>
              <th className="p-2 text-left">Course Title</th>
              <th className="p-2">Unit</th>
              <th className="p-2">Score</th>
              <th className="p-2">Grade</th>
            </tr>
          </thead>
          <tbody>
            {results?.map((r: any, i: number) => {
              const g = gradeSystem(r.score || r.total || 0);
              return (
                <tr key={i} className="border-b">
                  <td className="p-2 font-bold">{r.courseCode || r.code}</td>
                  <td className="p-2">{r.courseTitle || r.title}</td>
                  <td className="p-2 text-center">{r.creditUnit || r.unit}</td>
                  <td className="p-2 text-center">{r.score || r.total}</td>
                  <td className="p-2 text-center font-black">{g.grade}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="text-[10px] mt-2">Total Units: {totalUnits}</p>
      </div>
    </div>
  );
};

// ✅ DEFAULT EXPORT — Only ONE default — no duplicate!
export default PrintableResultWithLogo;

import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { ApiService } from '../../services/api';
import { ResultScore, COLLEGE_CONFIG } from '../../types';
import {
  FileSpreadsheet,
  Award,
  Printer,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Download,
  Calculator,
} from 'lucide-react';

export const ExamOfficerDashboard: React.FC = () => {
  const [results, setResults] = useState<ResultScore[]>(StorageService.getResults());
  const [selectedSession, setSelectedSession] = useState(COLLEGE_CONFIG.CURRENT_SESSION);
  const [selectedSemester, setSelectedSemester] = useState<'First' | 'Second'>('First');
  const [searchMatric, setSearchMatric] = useState('');
  const [gpaResult, setGpaResult] = useState<{ matric: string; gpa: number; totalUnits: number } | null>(null);

  const filteredResults = results.filter((r) => {
    const matchesSession = r.session === selectedSession;
    const matchesSemester = r.semester === selectedSemester;
    const matchesMatric =
      !searchMatric ||
      r.matricNo.toLowerCase().includes(searchMatric.toLowerCase()) ||
      (r.studentName && r.studentName.toLowerCase().includes(searchMatric.toLowerCase())) ||
      r.courseCode.toLowerCase().includes(searchMatric.toLowerCase());
    return matchesSession && matchesSemester && matchesMatric;
  });

  const handleComputeGPA = (matricNo: string) => {
    const computed = ApiService.calculateGPA(matricNo, selectedSemester, selectedSession);
    setGpaResult({
      matric: matricNo,
      gpa: computed.gpa,
      totalUnits: computed.totalUnits,
    });
  };

  const handlePrintBroadsheet = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-emerald-800 px-3 py-1 rounded-full">
              Examination &amp; Records Unit &bull; Exam Officer
            </span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase font-serif-crest mt-2">
              Dr. Emmanuel O. Agada
            </h1>
            <p className="text-xs text-emerald-200">
              Score Moderation &bull; NMCN Grade Point Computation &bull; Broadsheets
            </p>
          </div>
          <button
            onClick={handlePrintBroadsheet}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl border border-emerald-600 shadow-md transition-all self-start sm:self-auto"
          >
            <Printer className="w-4 h-4" />
            <span>Print Broadsheet</span>
          </button>
        </div>

        {/* Grading standard notice */}
        <div className="mt-6 pt-5 border-t border-emerald-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-amber-400" />
            <span className="text-emerald-200">
              NMCN 5-Point Scale: 70-100% (A=5.0) | 60-69% (B=4.0) | 50-59% (C=3.0) | 40-49% (D=2.0) | 0-39% (F=0.0)
            </span>
          </div>
          <span className="font-bold text-amber-300">Minimum Pass Mark: 50% for Nursing Core</span>
        </div>
      </div>

      {/* FILTER & GPA CALCULATOR BAR */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchMatric}
              onChange={(e) => setSearchMatric(e.target.value)}
              placeholder="Search by Matric No or Course Code..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value as any)}
              className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-emerald-950"
            >
              <option value="First">First Semester</option>
              <option value="Second">Second Semester</option>
            </select>

            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="2026/2027">2026/2027 Session</option>
              <option value="2025/2026">2025/2026 Session</option>
            </select>
          </div>
        </div>

        {/* GPA Quick Result Alert */}
        {gpaResult && (
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-600">GPA Computation for:</span>
              <strong className="text-slate-900 ml-2 font-mono-code">{gpaResult.matric}</strong>
              <span className="text-xs text-slate-500 ml-3">({gpaResult.totalUnits} Credit Units Registered)</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Semester GPA</span>
              <span className="text-2xl font-black text-emerald-900 font-mono-code">{gpaResult.gpa.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* BROADSHEET TABLE */}
        <div className="overflow-x-auto print-page">
          <table className="w-full text-left text-xs">
            <thead className="bg-emerald-900 text-white font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">Matric No &amp; Student</th>
                <th className="p-3">Course</th>
                <th className="p-3 text-center">Units</th>
                <th className="p-3 text-center">CA (30)</th>
                <th className="p-3 text-center">Exam (70)</th>
                <th className="p-3 text-center">Total (100)</th>
                <th className="p-3 text-center">Grade</th>
                <th className="p-3 text-center">Points</th>
                <th className="p-3">Remarks</th>
                <th className="p-3 text-right no-print">Quick Calc</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResults.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3">
                    <span className="font-mono-code font-bold text-emerald-900 block">{r.matricNo}</span>
                    <span className="text-slate-600 font-semibold text-[11px]">{r.studentName}</span>
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-slate-800">{r.courseCode}</span>
                    <span className="block text-[10px] text-slate-500">{r.courseTitle}</span>
                  </td>
                  <td className="p-3 text-center font-bold text-slate-700">{r.units}</td>
                  <td className="p-3 text-center text-slate-800 font-mono-code">{r.caScore}</td>
                  <td className="p-3 text-center text-slate-800 font-mono-code">{r.examScore}</td>
                  <td className="p-3 text-center font-mono-code font-bold text-slate-900 text-sm">
                    {r.totalScore}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-block font-black text-xs px-2 py-0.5 rounded ${
                        r.grade === 'A'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.grade === 'B'
                          ? 'bg-blue-100 text-blue-800'
                          : r.grade === 'C'
                          ? 'bg-amber-100 text-amber-800'
                          : r.grade === 'D'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {r.grade}
                    </span>
                  </td>
                  <td className="p-3 text-center font-mono-code font-bold text-slate-800">
                    {r.point}.0
                  </td>
                  <td className="p-3">
                    <span className="text-[11px] font-semibold text-slate-700">{r.remark}</span>
                  </td>
                  <td className="p-3 text-right no-print">
                    <button
                      onClick={() => handleComputeGPA(r.matricNo)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 text-emerald-900 border border-slate-200 rounded text-[11px] font-bold"
                    >
                      Calc GPA
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

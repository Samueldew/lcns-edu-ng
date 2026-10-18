import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { ApiService } from '../../services/api';
import { ResultScore, COLLEGE_CONFIG } from '../../types';
import {
  FileEdit,
  Save,
  CheckCircle2,
  BookOpen,
  Users,
  Award,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react';

import { CBTExamManager } from '../cbt/CBTExamManager';

export const LecturerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cbt' | 'scores'>('cbt');
  const [results, setResults] = useState<ResultScore[]>(StorageService.getResults());
  const students = StorageService.getStudents();

  // Score Entry State
  const [selectedCourse, setSelectedCourse] = useState('NSC 101');
  const [matricNo, setMatricNo] = useState('LCNS/2026/ND/014');
  const [caScore, setCaScore] = useState<number>(26);
  const [examScore, setExamScore] = useState<number>(56);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Live computed grade and point
  const totalScore = Math.min(100, Math.max(0, (caScore || 0) + (examScore || 0)));
  const gradeInfo = ApiService.getGradeAndPoint(totalScore);

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matricNo) return;

    const studentObj = students.find((s) => s.matricNo === matricNo);
    const studentName = studentObj ? studentObj.fullName : 'Nursing Student';

    const newScore: ResultScore = {
      id: 'res-' + Date.now(),
      matricNo,
      studentName,
      courseCode: selectedCourse,
      courseTitle: selectedCourse === 'NSC 101' ? 'Foundations of Nursing Practice I' : 'Medical Microbiology & Infection Control',
      units: selectedCourse === 'NSC 101' ? 3 : 2,
      caScore,
      examScore,
      totalScore,
      grade: gradeInfo.grade,
      point: gradeInfo.point,
      remark: gradeInfo.remark,
      semester: 'First',
      session: COLLEGE_CONFIG.CURRENT_SESSION,
      status: 'SUBMITTED',
    };

    // Filter out previous record if exists for this course & matric, then prepend
    const filtered = results.filter(
      (r) => !(r.matricNo === matricNo && r.courseCode === selectedCourse)
    );
    const updated = [newScore, ...filtered];

    StorageService.saveResults(updated);
    setResults(updated);
    StorageService.logAction(
      'lecturer@lcns.edu.ng',
      'LECTURER',
      'SCORE_ENTRY',
      `Entered score for ${matricNo} in ${selectedCourse}: Total ${totalScore} (${gradeInfo.grade})`
    );

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const myCourseResults = results.filter((r) => r.courseCode === selectedCourse);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-emerald-800 px-3 py-1 rounded-full">
            Department of Nursing Sciences &bull; Academic Staff
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase font-serif-crest mt-2">
            Nurse Emmanuel Gbaorun (FWACN)
          </h1>
          <p className="text-xs text-emerald-200">
            Course Lecturer: NSC 101 (Foundations of Nursing) &bull; MIC 101 (Microbiology)
          </p>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs no-print">
        <button
          onClick={() => setActiveTab('cbt')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'cbt'
              ? 'bg-[#0a4d2e] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4 text-amber-400" />
          <span>Course CBT Continuous Assessment Tests</span>
        </button>

        <button
          onClick={() => setActiveTab('scores')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'scores'
              ? 'bg-[#0a4d2e] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileEdit className="w-4 h-4 text-emerald-400" />
          <span>Semester Examination Score Entry</span>
        </button>
      </div>

      {activeTab === 'cbt' ? (
        <CBTExamManager
          currentUser={{
            id: 'LCNS/2026/LC/001',
            email: 'lecturer@lcns.edu.ng',
            role: 'LECTURER',
            fullName: 'Nurse Emmanuel Gbaorun (FWACN)',
            status: 'ACTIVE',
          }}
          allowedTypes={['COURSE_TEST']}
        />
      ) : (
        <>
          {/* SCORE ENTRY CARD */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
                  <FileEdit className="w-5 h-5" />
                </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base uppercase font-serif-crest">
                Continuous Assessment (CA) &amp; Semester Exam Score Input
              </h3>
              <p className="text-xs text-slate-500">
                Grades and quality points are automatically computed according to the NMCN 5-point scale.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Active Course:</span>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="p-2 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-950"
            >
              <option value="NSC 101">NSC 101: Foundations of Nursing Practice I (3 Units)</option>
              <option value="MIC 101">MIC 101: Medical Microbiology &amp; Infection Control (2 Units)</option>
            </select>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2 font-bold animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Score successfully recorded and synced with Examination Office!</span>
          </div>
        )}

        <form onSubmit={handleSaveScore} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Student Matric No *</label>
              <select
                value={matricNo}
                onChange={(e) => setMatricNo(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono-code font-bold text-emerald-950"
              >
                {students.map((s) => (
                  <option key={s.matricNo} value={s.matricNo}>
                    {s.matricNo} - {s.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Continuous Assessment (CA) / 30 *</label>
              <input
                type="number"
                min="0"
                max="30"
                value={caScore}
                onChange={(e) => setCaScore(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold font-mono-code"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Semester Exam Score / 70 *</label>
              <input
                type="number"
                min="0"
                max="70"
                value={examScore}
                onChange={(e) => setExamScore(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold font-mono-code"
                required
              />
            </div>

            {/* Real-time Score Preview */}
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Total / Grade</span>
                <span className="text-xl font-black font-mono-code text-slate-900">{totalScore}</span>
                <span className="ml-2 text-sm font-black text-emerald-800 bg-white px-2 py-0.5 rounded shadow-xs">
                  {gradeInfo.grade} ({gradeInfo.point}.0)
                </span>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
              >
                <Save className="w-4 h-4 text-amber-300" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* RECENTLY ENTERED SCORES FOR THIS COURSE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-slate-900 text-base uppercase font-serif-crest">
          Submitted Score Sheet for {selectedCourse}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3">Matric No</th>
                <th className="p-3">Student Name</th>
                <th className="p-3 text-center">CA (30)</th>
                <th className="p-3 text-center">Exam (70)</th>
                <th className="p-3 text-center">Total (100)</th>
                <th className="p-3 text-center">Grade</th>
                <th className="p-3">Remark</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myCourseResults.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono-code font-bold text-emerald-900">{r.matricNo}</td>
                  <td className="p-3 font-semibold text-slate-800">{r.studentName}</td>
                  <td className="p-3 text-center font-mono-code">{r.caScore}</td>
                  <td className="p-3 text-center font-mono-code">{r.examScore}</td>
                  <td className="p-3 text-center font-bold font-mono-code text-sm text-slate-900">{r.totalScore}</td>
                  <td className="p-3 text-center">
                    <span className="font-bold text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      {r.grade}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600">{r.remark}</td>
                  <td className="p-3 text-center">
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold">
                      <CheckCircle2 className="w-3 h-3" /> Submitted
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}
    </div>
  );
};

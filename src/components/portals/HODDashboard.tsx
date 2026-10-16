import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { Course } from '../../types';
import {
  BookOpen,
  UserCheck,
  Stethoscope,
  Plus,
  Users,
  CheckCircle2,
  Calendar,
  Building,
  GraduationCap,
} from 'lucide-react';

export const HODDashboard: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>(StorageService.getCourses());
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [units, setUnits] = useState(3);
  const [level, setLevel] = useState('ND 1');
  const [semester, setSemester] = useState<'First' | 'Second'>('First');
  const [lecturerName, setLecturerName] = useState('Nurse Emmanuel Gbaorun (FWACN)');

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !title) return;

    const newCourse: Course = {
      id: 'crs-' + Date.now(),
      code: code.toUpperCase(),
      title,
      units,
      level,
      semester,
      department: 'Nursing Sciences',
      lecturerName,
    };

    const updated = [...courses, newCourse];
    StorageService.saveCourses(updated);
    setCourses(updated);
    StorageService.logAction(
      'hod.nursing@lcns.edu.ng',
      'HOD',
      'ADD_COURSE',
      `Allocated course ${code}: ${title} to ${lecturerName}`
    );

    setCode('');
    setTitle('');
    setShowAddCourse(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-emerald-800 px-3 py-1 rounded-full">
              Head of Department &bull; Department of Nursing Sciences
            </span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase font-serif-crest mt-2">
              Dr. (Mrs) Rebecca M. Chia
            </h1>
            <p className="text-xs text-emerald-200">
              Curriculum Oversight &bull; Course Allocation &bull; Clinical Posting Rotations
            </p>
          </div>
          <button
            onClick={() => setShowAddCourse(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Allocate New Course</span>
          </button>
        </div>
      </div>

      {/* CURRICULUM & COURSE ALLOCATION TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base uppercase font-serif-crest">
              Semester Course Allocations &amp; Academic Staff
            </h3>
            <p className="text-xs text-slate-500">
              Accredited courses assigned to lecturers and clinical instructors for First Semester.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
            {courses.length} Active Courses
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3">Course Code</th>
                <th className="p-3">Course Title</th>
                <th className="p-3 text-center">Credit Units</th>
                <th className="p-3">Level / Semester</th>
                <th className="p-3">Assigned Academic Staff</th>
                <th className="p-3">Department</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courses.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-mono-code font-bold text-emerald-900">{c.code}</td>
                  <td className="p-3 font-bold text-slate-900">{c.title}</td>
                  <td className="p-3 text-center font-bold text-slate-700">{c.units} Units</td>
                  <td className="p-3 text-slate-600">
                    <span className="font-semibold text-slate-800">{c.level}</span>
                    <span className="block text-[10px] text-slate-500">{c.semester} Semester</span>
                  </td>
                  <td className="p-3 font-semibold text-emerald-950 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{c.lecturerName}</span>
                  </td>
                  <td className="p-3 text-slate-500">{c.department}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CLINICAL POSTINGS ROSTER */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-slate-900 text-base uppercase font-serif-crest flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-emerald-700" />
          <span>Hospital Clinical Postings &amp; Practicum Schedule</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
            <span className="font-bold text-emerald-950 text-sm block">General Hospital, Gboko</span>
            <p className="text-slate-600">Postings: Medical &amp; Surgical Nursing Ward, Emergency Casualty Unit.</p>
            <div className="text-[11px] font-semibold text-emerald-800">Coordinator: Nurse Emmanuel Gbaorun</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 space-y-2">
            <span className="font-bold text-blue-950 text-sm block">BSUTH Makurdi</span>
            <p className="text-slate-600">Postings: Pediatric Intensive Care (PICU) &amp; Psychiatric Healthcare Unit.</p>
            <div className="text-[11px] font-semibold text-blue-800">Coordinator: Dr. Mrs. Rebecca Chia</div>
          </div>
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
            <span className="font-bold text-amber-950 text-sm block">NKST Hospital, Mkar</span>
            <p className="text-slate-600">Postings: Maternal Labor Ward, Antenatal Clinic &amp; Neonatology.</p>
            <div className="text-[11px] font-semibold text-amber-800">Coordinator: Matron Joy Ushahemba</div>
          </div>
        </div>
      </div>

      {/* ADD COURSE MODAL */}
      {showAddCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900 uppercase font-serif-crest">
              Allocate Course to Lecturer
            </h3>
            <form onSubmit={handleCreateCourse} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Course Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. NSC 201"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs uppercase font-mono-code"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Course Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Medical-Surgical Nursing I"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Credit Units</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={units}
                    onChange={(e) => setUnits(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="ND 1">ND 1</option>
                    <option value="ND 2">ND 2</option>
                    <option value="HND 1">HND 1</option>
                    <option value="HND 2">HND 2</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lecturer in Charge *</label>
                <input
                  type="text"
                  required
                  value={lecturerName}
                  onChange={(e) => setLecturerName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCourse(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold shadow-md"
                >
                  Save Course Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { Course, User } from '../../types';
import { StorageService } from '../../services/storage';
import { SheetService } from '../../services/sheetService';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  UserCheck,
  GraduationCap,
  Calendar,
  Layers,
  Award,
  X,
} from 'lucide-react';

interface CourseManagerViewProps {
  portalRole?: string;
}

export const COURSE_LEVEL_SEMESTERS = [
  'N1 1st Sem',
  'N1 2nd Sem',
  'ND1 1st Sem',
  'ND1 2nd Sem',
  'ND2 1st Sem',
  'ND2 2nd Sem',
  'HND1 1st Sem',
  'HND1 2nd Sem',
  'HND2 1st Sem',
  'HND2 2nd Sem',
];

export const CourseManagerView: React.FC<CourseManagerViewProps> = ({ portalRole = 'ADMIN' }) => {
  const [courses, setCourses] = useState<Course[]>(StorageService.getCourses());
  const [users, setUsers] = useState<User[]>(StorageService.getUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  // Form Fields
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [units, setUnits] = useState(3);
  const [selectedLevelSemester, setSelectedLevelSemester] = useState('ND1 1st Sem');
  const [lecturerName, setLecturerName] = useState('Nurse Emmanuel Gbaorun (FWACN)');
  const [department, setDepartment] = useState('Department of Nursing Sciences');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const lecturers = useMemo(() => {
    return users.filter((u) => u.role === 'LECTURER' || u.role === 'HOD');
  }, [users]);

  useEffect(() => {
    const handleUpdate = () => {
      setCourses(StorageService.getCourses());
      setUsers(StorageService.getUsers());
    };
    window.addEventListener('lcns_storage_update', handleUpdate);
    return () => window.removeEventListener('lcns_storage_update', handleUpdate);
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleOpenAdd = () => {
    setEditingCourseId(null);
    setCode('');
    setTitle('');
    setUnits(3);
    setSelectedLevelSemester('ND1 1st Sem');
    setLecturerName(
      lecturers[0]?.fullName || 'Nurse Emmanuel Gbaorun (FWACN)'
    );
    setDepartment('Department of Nursing Sciences');
    setShowModal(true);
  };

  const handleOpenEdit = (c: Course) => {
    setEditingCourseId(c.id);
    setCode(c.code);
    setTitle(c.title);
    setUnits(c.units);
    setSelectedLevelSemester(
      c.level && c.semester ? `${c.level} ${c.semester === 'First' ? '1st Sem' : '2nd Sem'}` : 'ND1 1st Sem'
    );
    setLecturerName(c.lecturerName || 'Unassigned');
    setDepartment(c.department || 'Department of Nursing Sciences');
    setShowModal(true);
  };

  const handleDeleteCourse = (courseId: string, courseCode: string) => {
    if (window.confirm(`Are you sure you want to delete course ${courseCode}?`)) {
      const updated = courses.filter((c) => c.id !== courseId);
      StorageService.saveCourses(updated);
      setCourses(updated);
      showNotification('success', `Deleted course ${courseCode}`);
    }
  };

  const handleSubmitCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !title.trim()) {
      showNotification('error', 'Please enter course code and course title.');
      return;
    }

    // Parse level and semester
    const parts = selectedLevelSemester.split(' ');
    const lvl = parts[0] || 'ND1';
    const sem = selectedLevelSemester.includes('2nd') ? 'Second' : 'First';

    if (editingCourseId) {
      // Update
      const updated = courses.map((c) =>
        c.id === editingCourseId
          ? {
              ...c,
              code: code.trim().toUpperCase(),
              title: title.trim(),
              units: Number(units) || 3,
              level: lvl,
              semester: sem,
              lecturerName,
              department,
            }
          : c
      );
      StorageService.saveCourses(updated);
      setCourses(updated);
      showNotification('success', `Course ${code.toUpperCase()} updated successfully!`);
    } else {
      // Create new
      const newCourse: Course = {
        id: 'crs-' + Date.now(),
        code: code.trim().toUpperCase(),
        title: title.trim(),
        units: Number(units) || 3,
        level: lvl,
        semester: sem,
        lecturerName,
        department,
      };

      const updated = [newCourse, ...courses];
      StorageService.saveCourses(updated);
      setCourses(updated);

      // Sync to Google Sheet if configured
      SheetService.syncCourse({
        code: newCourse.code,
        title: newCourse.title,
        units: newCourse.units,
        levelSemester: selectedLevelSemester,
        lecturerName: newCourse.lecturerName,
        department: newCourse.department,
      });

      showNotification('success', `Allocated new course ${newCourse.code} to ${lecturerName}!`);
    }

    setShowModal(false);
  };

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchSearch =
        searchQuery === '' ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.lecturerName && c.lecturerName.toLowerCase().includes(searchQuery.toLowerCase()));

      const formattedLevelSem = `${c.level} ${c.semester === 'First' ? '1st Sem' : '2nd Sem'}`;
      const matchLevel =
        levelFilter === 'ALL' ||
        c.level?.toLowerCase() === levelFilter.toLowerCase() ||
        formattedLevelSem === levelFilter;

      return matchSearch && matchLevel;
    });
  }, [courses, searchQuery, levelFilter]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0a4d2e] via-[#083e25] to-[#042114] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#ca8a04] bg-emerald-950 px-3 py-1 rounded-full border border-amber-400/30">
              Curriculum &bull; Course Allocation &bull; {portalRole} Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase font-serif-crest text-white">
              Course &amp; Lecturer Assignment
            </h1>
            <p className="text-xs text-emerald-200">
              Manage collegiate accredited courses for N1, ND1, ND2, HND1, and HND2 and assign certified lecturers.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-[#ca8a04] hover:bg-[#b07803] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Course</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 shadow-md ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-[#0a4d2e] border-emerald-300'
              : 'bg-red-50 text-red-700 border-red-300'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Courses Table Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 uppercase font-serif-crest">
              Allocated Courses List ({filteredCourses.length})
            </h3>
            <p className="text-xs text-slate-500">
              Courses, credit units, academic level/semester, and designated academic instructors.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search course or lecturer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0a4d2e]"
              />
            </div>

            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
            >
              <option value="ALL">All Levels / Semesters</option>
              {COURSE_LEVEL_SEMESTERS.map((ls) => (
                <option key={ls} value={ls}>
                  {ls}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Course Code</th>
                <th className="py-3 px-4">Course Title</th>
                <th className="py-3 px-4 text-center">Credit Units</th>
                <th className="py-3 px-4">Level &amp; Semester</th>
                <th className="py-3 px-4">Assigned Lecturer</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    No courses found matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredCourses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono-code font-black text-[#0a4d2e] text-sm">
                      {c.code}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {c.title}
                      <span className="block text-[11px] text-slate-400 font-normal">
                        {c.department || 'Nursing Sciences'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono-code font-bold text-slate-800">
                      {c.units} Units
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 bg-emerald-50 text-[#0a4d2e] border border-emerald-200 rounded-lg text-[11px] font-bold">
                        {c.level} &bull; {c.semester === 'First' ? '1st Sem' : '2nd Sem'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <UserCheck className="w-3.5 h-3.5 text-[#16a34a] shrink-0" />
                        <span>{c.lecturerName || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 text-slate-600 hover:text-[#0a4d2e] hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Course"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(c.id, c.code)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Course"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Course Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-r from-[#0a4d2e] to-[#042114] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-300" />
                <h3 className="text-base font-black uppercase font-serif-crest text-white">
                  {editingCourseId ? 'Edit Course Details' : 'Add & Allocate New Course'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-emerald-300 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCourse} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Course Code *
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. NSC 101, ANA 101, MID 201"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold font-mono-code focus:ring-2 focus:ring-[#0a4d2e]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Course Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Foundations of Nursing Practice I"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-[#0a4d2e]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Credit Units *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={units}
                    onChange={(e) => setUnits(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono-code font-bold focus:ring-2 focus:ring-[#0a4d2e]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Level &amp; Semester *
                  </label>
                  <select
                    value={selectedLevelSemester}
                    onChange={(e) => setSelectedLevelSemester(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-[#0a4d2e]"
                  >
                    {COURSE_LEVEL_SEMESTERS.map((ls) => (
                      <option key={ls} value={ls}>
                        {ls}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Assign Lecturer *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={lecturerName}
                    onChange={(e) => setLecturerName(e.target.value)}
                    placeholder="Enter lecturer name or pick below"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-[#0a4d2e]"
                    required
                  />
                </div>
                {lecturers.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {lecturers.map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => setLecturerName(l.fullName)}
                        className="px-2 py-0.5 rounded-lg text-[10px] bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-[#0a4d2e] border border-slate-200"
                      >
                        {l.fullName}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-[#0a4d2e]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0a4d2e] hover:bg-[#073822] text-white rounded-xl font-bold shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>{editingCourseId ? 'Save Changes' : 'Allocate Course'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { CBTExam, CBTSubmission, CBTQuestion, User, COLLEGE_CONFIG } from '../../types';
import { StorageService } from '../../services/storage';
import { CollegeLogo } from '../common/CollegeLogo';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Plus,
  Eye,
  EyeOff,
  Download,
  Printer,
  Clock,
  Award,
  Search,
  Filter,
  Users,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

interface CBTExamManagerProps {
  currentUser: User;
  allowedTypes?: ('APPLICANT_SCREENING' | 'COURSE_TEST')[];
}

export const CBTExamManager: React.FC<CBTExamManagerProps> = ({
  currentUser,
  allowedTypes = ['APPLICANT_SCREENING', 'COURSE_TEST'],
}) => {
  const [exams, setExams] = useState<CBTExam[]>(StorageService.getCBTExams());
  const [submissions, setSubmissions] = useState<CBTSubmission[]>(
    StorageService.getCBTSubmissions()
  );
  const [activeTab, setActiveTab] = useState<'exams' | 'results'>('exams');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected result for printable PDF slip
  const [selectedSubmission, setSelectedSubmission] = useState<CBTSubmission | null>(null);

  // New Exam Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [examTitle, setExamTitle] = useState('');
  const [examType, setExamType] = useState<'APPLICANT_SCREENING' | 'COURSE_TEST'>(
    allowedTypes.includes('APPLICANT_SCREENING') ? 'APPLICANT_SCREENING' : 'COURSE_TEST'
  );
  const [courseCode, setCourseCode] = useState('NSC 101');
  const [courseTitle, setCourseTitle] = useState('Foundations of Nursing Practice I');
  const [durationMinutes, setDurationMinutes] = useState(20);
  const [totalMarks, setTotalMarks] = useState(30);

  // Questions builder
  const [questions, setQuestions] = useState<CBTQuestion[]>([
    {
      id: 'q-1',
      question: 'What is the primary objective of Nursing Assessment in patient care?',
      options: [
        'To establish a comprehensive client database',
        'To prescribe prescription antibiotics',
        'To bill the patient insurance immediately',
        'To discharge the patient home early',
      ],
      correctAnswer: 0,
      explanation: 'Assessment gathers systematic subjective and objective data for clinical judgment.',
    },
    {
      id: 'q-2',
      question: 'Which vital sign measurement indicates pyrexia (fever) in an adult patient?',
      options: ['36.2 °C', '37.0 °C', '38.5 °C', '35.5 °C'],
      correctAnswer: 2,
      explanation: 'A body temperature of 38.5 °C exceeds normal physiological range indicating pyrexia.',
    },
  ]);

  useEffect(() => {
    const handleUpdate = () => {
      setExams(StorageService.getCBTExams());
      setSubmissions(StorageService.getCBTSubmissions());
    };
    window.addEventListener('lcns_storage_update', handleUpdate);
    return () => window.removeEventListener('lcns_storage_update', handleUpdate);
  }, []);

  const handleTogglePublish = (examId: string, currentStatus: boolean) => {
    const updated = StorageService.togglePublishCBTExam(examId, !currentStatus);
    setExams(updated);
  };

  const handleAddQuestion = () => {
    const newQ: CBTQuestion = {
      id: 'q-' + (questions.length + 1),
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
    };
    setQuestions([...questions, newQ]);
  };

  const handleCreateExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim() || questions.length === 0) return;

    const newExam: CBTExam = {
      id: 'cbt-' + Date.now(),
      title: examTitle.trim(),
      type: examType,
      courseCode: examType === 'COURSE_TEST' ? courseCode : undefined,
      courseTitle: examType === 'COURSE_TEST' ? courseTitle : undefined,
      session: COLLEGE_CONFIG.CURRENT_SESSION,
      semester: 'First',
      durationMinutes,
      totalMarks,
      isPublished: true, // published by default
      createdBy: currentUser.email,
      createdRole: currentUser.role,
      createdAt: new Date().toISOString().split('T')[0],
      questions,
    };

    const currentExams = StorageService.getCBTExams();
    const updated = [newExam, ...currentExams];
    StorageService.saveCBTExams(updated);
    setExams(updated);

    StorageService.logAction(
      currentUser.email,
      currentUser.role,
      'CREATE_CBT_EXAM',
      `Created CBT exam: ${newExam.title} (${newExam.type})`
    );

    // Reset
    setExamTitle('');
    setShowCreateModal(false);
  };

  // Filtered exams
  const filteredExams = exams.filter((ex) => {
    if (!allowedTypes.includes(ex.type)) return false;
    if (filterType !== 'ALL' && ex.type !== filterType) return false;
    if (searchQuery) {
      return (
        ex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ex.courseCode && ex.courseCode.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    return true;
  });

  // Filtered submissions
  const filteredSubmissions = submissions.filter((sub) => {
    if (!allowedTypes.includes(sub.examType)) return false;
    if (filterType !== 'ALL' && sub.examType !== filterType) return false;
    if (searchQuery) {
      return (
        sub.userFullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.examTitle.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Award className="w-3.5 h-3.5 text-emerald-700" />
            <span>Computer-Based Testing (CBT) Center</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase font-serif-crest">
            CBT Examinations &amp; Continuous Assessment Manager
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Author aptitude tests, publish/unpublish exam sessions, inspect candidate scores, and download official result printouts.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0a4d2e] hover:bg-[#073822] text-white text-xs font-bold rounded-2xl shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Create New CBT Test</span>
        </button>
      </div>

      {/* Tabs & Filters */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4 no-print">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab('exams')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'exams'
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              CBT Exams ({filteredExams.length})
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'results'
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Candidate Submissions &amp; Scores ({filteredSubmissions.length})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tests or candidate name..."
                className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 w-56"
              />
            </div>

            {/* Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            >
              <option value="ALL">All Categories</option>
              <option value="APPLICANT_SCREENING">Applicant Screening</option>
              <option value="COURSE_TEST">Course Continuous Assessment</option>
            </select>
          </div>
        </div>

        {/* TAB 1: EXAM LIST */}
        {activeTab === 'exams' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredExams.map((ex) => (
              <div
                key={ex.id}
                className="bg-slate-50 hover:bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span
                      className={`inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        ex.type === 'APPLICANT_SCREENING'
                          ? 'bg-purple-100 text-purple-900'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}
                    >
                      {ex.type === 'APPLICANT_SCREENING' ? 'Pre-Admission Screening' : `Course: ${ex.courseCode}`}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">
                      {ex.title}
                    </h3>
                  </div>

                  {/* Publish Status Toggle */}
                  <button
                    onClick={() => handleTogglePublish(ex.id, ex.isPublished)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                      ex.isPublished
                        ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                        : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                    }`}
                  >
                    {ex.isPublished ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Published</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-amber-700" />
                        <span>Unpublished</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 bg-white rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Duration</span>
                    <strong className="text-slate-800">{ex.durationMinutes} Mins</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Questions</span>
                    <strong className="text-slate-800">{ex.questions?.length || 0} MCQs</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Total Marks</span>
                    <strong className="text-emerald-800 font-bold">{ex.totalMarks} Marks</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                  <span>Author: {ex.createdBy}</span>
                  <span className="font-mono-code">{ex.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: CANDIDATE RESULTS TABLE */}
        {activeTab === 'results' && (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Candidate ID &amp; Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Exam Title</th>
                    <th className="p-3.5 text-center">Score</th>
                    <th className="p-3.5 text-center">Percentage</th>
                    <th className="p-3.5">Submission Date</th>
                    <th className="p-3.5 text-right">PDF Printout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No CBT submissions found for the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5">
                          <strong className="text-slate-900 block">{sub.userFullName}</strong>
                          <span className="font-mono-code text-[11px] text-emerald-800 font-bold">
                            {sub.userId}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                            {sub.userRole}
                          </span>
                        </td>
                        <td className="p-3.5 font-medium text-slate-700 max-w-[200px] truncate">
                          {sub.examTitle}
                        </td>
                        <td className="p-3.5 text-center font-bold font-mono-code text-slate-900">
                          {sub.score} / {sub.totalQuestions}
                        </td>
                        <td className="p-3.5 text-center">
                          <span
                            className={`font-black font-mono-code px-2 py-0.5 rounded text-xs ${
                              sub.percentage >= 70
                                ? 'bg-emerald-100 text-emerald-900'
                                : sub.percentage >= 50
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-red-100 text-red-900'
                            }`}
                          >
                            {sub.percentage}%
                          </span>
                        </td>
                        <td className="p-3.5 font-mono-code text-slate-500 text-[11px]">
                          {sub.submittedAt}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => setSelectedSubmission(sub)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition-all shadow-2xs"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download PDF</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* CREATE CBT EXAM MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in no-print overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-r from-[#0a4d2e] to-[#042114] text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Award className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold uppercase font-serif-crest text-base">
                    Create New CBT Aptitude / Course Test
                  </h3>
                  <p className="text-xs text-emerald-300">
                    Set up questions, multi-choice keys, and examination time limit
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-emerald-300 hover:text-white rounded-xl hover:bg-emerald-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExamSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Exam Title *
                </label>
                <input
                  type="text"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  placeholder="e.g. 2026 Pre-Admission Aptitude & Nursing Screening Test"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Exam Category
                  </label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 font-bold"
                  >
                    <option value="APPLICANT_SCREENING">Applicant Screening</option>
                    <option value="COURSE_TEST">Course CA Test (Students)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 font-bold"
                  />
                </div>
              </div>

              {examType === 'COURSE_TEST' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Course Code</label>
                    <input
                      type="text"
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Course Title</label>
                    <input
                      type="text"
                      value={courseTitle}
                      onChange={(e) => setCourseTitle(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 uppercase tracking-wider">
                    Questions ({questions.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Question</span>
                  </button>
                </div>

                <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                  {questions.map((q, qIdx) => (
                    <div
                      key={q.id}
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-900">Question {qIdx + 1}</span>
                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setQuestions(questions.filter((_, idx) => idx !== qIdx))
                            }
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => {
                          const val = e.target.value;
                          setQuestions((prev) =>
                            prev.map((item, idx) =>
                              idx === qIdx ? { ...item, question: val } : item
                            )
                          );
                        }}
                        placeholder="Type question stem..."
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg font-medium"
                        required
                      />

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-1.5">
                            <input
                              type="radio"
                              name={`correct-${q.id}`}
                              checked={q.correctAnswer === optIdx}
                              onChange={() => {
                                setQuestions((prev) =>
                                  prev.map((item, idx) =>
                                    idx === qIdx ? { ...item, correctAnswer: optIdx } : item
                                  )
                                );
                              }}
                              className="accent-emerald-700"
                            />
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const optVal = e.target.value;
                                setQuestions((prev) =>
                                  prev.map((item, idx) => {
                                    if (idx !== qIdx) return item;
                                    const newOpts = [...item.options];
                                    newOpts[optIdx] = optVal;
                                    return { ...item, options: newOpts };
                                  })
                                );
                              }}
                              placeholder={`Option ${['A', 'B', 'C', 'D'][optIdx]}`}
                              className="w-full p-1.5 bg-white border border-slate-200 rounded-lg"
                              required
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0a4d2e] hover:bg-[#073822] text-white rounded-xl font-bold shadow-md"
                >
                  Publish CBT Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE OFFICIAL RESULT SLIP / PDF MODAL */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden border border-slate-200">
            {/* Action Bar */}
            <div className="bg-emerald-950 text-white p-4 flex items-center justify-between no-print">
              <span className="font-bold text-xs uppercase tracking-wider text-emerald-300">
                Official Examination Certificate
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintSlip}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="p-1.5 text-emerald-300 hover:text-white rounded-lg hover:bg-emerald-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Paper Document */}
            <div className="p-8 sm:p-10 space-y-6 print-page bg-white text-slate-900 border-8 border-double border-emerald-900 m-2 rounded-2xl">
              {/* College Header */}
              <div className="text-center pb-4 border-b-2 border-emerald-900 space-y-2">
                <div className="flex items-center justify-center gap-3">
                  <CollegeLogo size="md" />
                  <div>
                    <h1 className="text-lg sm:text-2xl font-black uppercase font-serif-crest text-emerald-950">
                      Labe College of Nursing Sciences
                    </h1>
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest block">
                      Gboko, Benue State &bull; Office of the Academic Registrar
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Accredited by NBTE &bull; Approved by NMCN &bull; Established by Benue State Law
                    </span>
                  </div>
                </div>

                <div className="inline-block bg-emerald-900 text-amber-300 font-bold uppercase text-xs px-4 py-1 rounded-full mt-2">
                  Computer-Based Test (CBT) Official Statement of Result
                </div>
              </div>

              {/* Candidate Info Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Candidate Name:</span>
                  <strong className="text-slate-900 text-sm uppercase">
                    {selectedSubmission.userFullName}
                  </strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Candidate Number / ID:</span>
                  <strong className="font-mono-code text-sm text-emerald-900">
                    {selectedSubmission.userId}
                  </strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Examination Subject:</span>
                  <strong className="text-slate-800">{selectedSubmission.examTitle}</strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Examination Date:</span>
                  <strong className="font-mono-code text-slate-800">
                    {selectedSubmission.submittedAt}
                  </strong>
                </div>
              </div>

              {/* Big Score Box */}
              <div className="p-6 bg-gradient-to-r from-emerald-900 to-[#042114] text-white rounded-2xl text-center shadow-md space-y-2">
                <span className="text-xs uppercase font-bold tracking-widest text-emerald-200">
                  Certified Examination Standing
                </span>
                <div className="text-4xl sm:text-5xl font-black font-mono-code text-amber-400">
                  {selectedSubmission.score} / {selectedSubmission.totalQuestions}
                </div>
                <div className="text-sm font-bold text-emerald-100">
                  Overall Score Percentage: <strong>{selectedSubmission.percentage}%</strong> &bull;{' '}
                  <span className="text-emerald-300">
                    {selectedSubmission.percentage >= 70
                      ? 'Distinction Pass (Qualified)'
                      : selectedSubmission.percentage >= 50
                      ? 'Credit Pass (Qualified)'
                      : 'Unsuccessful'}
                  </span>
                </div>
              </div>

              {/* Official Stamp & Signatures */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-3 gap-4 text-center text-xs">
                <div>
                  <div className="h-10 border-b border-dashed border-slate-400"></div>
                  <span className="block font-bold text-slate-800 mt-1">Barr. Timothy J. Iorbee</span>
                  <span className="text-[10px] text-slate-500 uppercase">Academic Registrar</span>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-2 border-emerald-900 flex items-center justify-center text-center p-1 text-[8px] font-black uppercase text-emerald-900 rotate-[-12deg]">
                    OFFICIAL CBT SEAL &bull; LCNS GBOKO
                  </div>
                </div>

                <div>
                  <div className="h-10 border-b border-dashed border-slate-400"></div>
                  <span className="block font-bold text-slate-800 mt-1">Dr. Emmanuel O. Agada</span>
                  <span className="text-[10px] text-slate-500 uppercase">Examination Officer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

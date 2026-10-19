import React, { useState, useEffect, useMemo } from 'react';
import { CollegeLogo } from '../common/CollegeLogo';
import { CBTTest, CBTQuestionItem, CBTResult, Applicant } from '../../types';
import { StorageService } from '../../services/storage';
import { SheetService } from '../../services/sheetService';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import {
  FileText,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Download,
  FileSpreadsheet,
  Search,
  Filter,
  Save,
  Check,
  ToggleLeft,
  ToggleRight,
  Eye,
  User,
  GraduationCap,
  Calendar,
  Award,
  RefreshCw,
} from 'lucide-react';

export const AdminApplicantCBTPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'config' | 'results'>('results');
  const [tests, setTests] = useState<CBTTest[]>(StorageService.getCBTTests());
  const [selectedTestId, setSelectedTestId] = useState<string>(
    tests[0]?.id || 'test-attitude-01'
  );

  // Current Test Form State
  const currentTest = useMemo(
    () => tests.find((t) => t.id === selectedTestId) || tests[0],
    [tests, selectedTestId]
  );
  const [testTitle, setTestTitle] = useState(currentTest?.title || 'Attitude & Aptitude Test');
  const [durationMinutes, setDurationMinutes] = useState(
    currentTest?.duration_minutes || 30
  );
  const [isActive, setIsActive] = useState(currentTest?.is_active ?? true);

  // Questions State
  const [questions, setQuestions] = useState<CBTQuestionItem[]>(
    StorageService.getCBTQuestions(currentTest?.id)
  );

  // Results & Applicants State
  const [results, setResults] = useState<CBTResult[]>(StorageService.getCBTResults());
  const [applicants, setApplicants] = useState<Applicant[]>(StorageService.getApplicants());
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Update questions whenever selected test changes
  useEffect(() => {
    if (currentTest) {
      setTestTitle(currentTest.title);
      setDurationMinutes(currentTest.duration_minutes);
      setIsActive(currentTest.is_active);
      setQuestions(StorageService.getCBTQuestions(currentTest.id));
    }
  }, [currentTest]);

  // Reactive updates on storage changes
  useEffect(() => {
    const handleStorageUpdate = () => {
      setTests(StorageService.getCBTTests());
      setResults(StorageService.getCBTResults());
      setApplicants(StorageService.getApplicants());
    };
    window.addEventListener('lcns_storage_update', handleStorageUpdate);
    return () => window.removeEventListener('lcns_storage_update', handleStorageUpdate);
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  // Add new MCQ question
  const handleAddQuestion = () => {
    const newQ: CBTQuestionItem = {
      id: 'q-' + Date.now(),
      test_id: currentTest?.id || 'test-attitude-01',
      question: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'option_a',
      marks: 1,
    };
    setQuestions([...questions, newQ]);
  };

  // Remove MCQ question
  const handleDeleteQuestion = (qId: string) => {
    const updated = questions.filter((q) => q.id !== qId);
    setQuestions(updated);
  };

  // Update a question field
  const handleUpdateQuestion = (
    qId: string,
    field: keyof CBTQuestionItem,
    value: any
  ) => {
    setQuestions(
      questions.map((q) => (q.id === qId ? { ...q, [field]: value } : q))
    );
  };

  // Save CBT Test & Questions
  const handleSaveTestConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testTitle.trim()) {
      showNotification('error', 'Please provide a test title.');
      return;
    }

    const testId = currentTest?.id || 'test-' + Date.now();
    const updatedTest: CBTTest = {
      id: testId,
      title: testTitle.trim(),
      duration_minutes: Number(durationMinutes) || 30,
      is_active: isActive,
      created_at: currentTest?.created_at || new Date().toISOString(),
    };

    const updatedTests = tests.map((t) => (t.id === testId ? updatedTest : t));
    if (!updatedTests.some((t) => t.id === testId)) {
      updatedTests.push(updatedTest);
    }
    StorageService.saveCBTTests(updatedTests);
    setTests(updatedTests);

    // Save Questions
    const sanitizedQuestions = questions.map((q) => ({
      ...q,
      test_id: testId,
    }));
    StorageService.saveCBTQuestions(sanitizedQuestions);
    setQuestions(sanitizedQuestions);

    showNotification('success', 'Applicant CBT Test and Questions updated successfully!');
  };

  // Toggle publish
  const handleTogglePublish = () => {
    const nextState = !isActive;
    setIsActive(nextState);
    if (currentTest) {
      const updated = tests.map((t) =>
        t.id === currentTest.id ? { ...t, is_active: nextState } : t
      );
      StorageService.saveCBTTests(updated);
      setTests(updated);
      showNotification(
        'success',
        `CBT Test ${nextState ? 'Published & Live for candidates' : 'Unpublished (Draft)'}`
      );
    }
  };

  // Combined Results with candidate information
  const mergedResults = useMemo(() => {
    return results.map((res) => {
      const matchedApp = applicants.find(
        (a) =>
          a.formNo.toLowerCase() === res.application_number.toLowerCase() ||
          a.email.toLowerCase() === res.application_number.toLowerCase()
      );

      const candidateName =
        res.applicant_name || matchedApp?.fullName || 'Candidate ' + res.application_number;
      const candidatePhoto =
        res.candidate_photo || matchedApp?.passportPhotoUrl || '';
      const candidateCourse =
        res.course || matchedApp?.courseChoice1 || matchedApp?.program || 'ND Nursing Sciences';
      const percentage =
        res.percentage ?? (res.total > 0 ? Math.round((res.score / res.total) * 100) : res.score);

      return {
        ...res,
        candidateName,
        candidatePhoto,
        candidateCourse,
        percentage,
        applicantRecord: matchedApp,
      };
    });
  }, [results, applicants]);

  // Filtered results
  const filteredResults = useMemo(() => {
    return mergedResults.filter((r) => {
      const matchSearch =
        searchQuery === '' ||
        r.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.application_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.exam_number && r.exam_number.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCourse =
        courseFilter === 'ALL' || r.candidateCourse.includes(courseFilter);

      return matchSearch && matchCourse;
    });
  }, [mergedResults, searchQuery, courseFilter]);

  // Delete Score Action
  const handleDeleteScore = (resultId: string, appNo: string) => {
    if (window.confirm(`Are you sure you want to delete CBT score for ${appNo}?`)) {
      const updated = results.filter((r) => r.id !== resultId);
      StorageService.saveCBTResults(updated);
      setResults(updated);
      showNotification('success', `Deleted CBT result for ${appNo}`);
    }
  };

  // Delete Applicant Action
  const handleDeleteApplicant = (appNo: string) => {
    if (
      window.confirm(
        `Are you sure you want to permanently delete applicant ${appNo} and their data?`
      )
    ) {
      const updatedApps = applicants.filter((a) => a.formNo !== appNo);
      StorageService.saveApplicants(updatedApps);
      setApplicants(updatedApps);

      const updatedRes = results.filter((r) => r.application_number !== appNo);
      StorageService.saveCBTResults(updatedRes);
      setResults(updatedRes);

      showNotification('success', `Permanently deleted applicant ${appNo}`);
    }
  };

  // Download Results as Excel (XLSX)
  const handleDownloadExcel = () => {
    const dataToExport = filteredResults.map((r, idx) => ({
      'S/N': idx + 1,
      'Application Number': r.application_number,
      'Exam Number': r.exam_number || 'N/A',
      'Candidate Name': r.candidateName,
      'Course Choice': r.candidateCourse,
      'Score': r.score,
      'Total Marks': r.total,
      'Percentage (%)': `${r.percentage}%`,
      'Performance Standing':
        r.percentage >= 70 ? 'Distinction' : r.percentage >= 50 ? 'Pass' : 'Fail',
      'Submission Date': r.submitted_at
        ? new Date(r.submitted_at).toLocaleString()
        : '2026-02-18',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'CBT_Results');
    XLSX.writeFile(
      workbook,
      `LCNS_CBT_Screening_Results_${new Date().toISOString().split('T')[0]}.xlsx`
    );
    showNotification('success', 'Exported Excel file successfully!');
  };

  // Download Results as PDF (jspdf)
  const handleDownloadPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

    // Header styling
    doc.setFillColor(10, 77, 46); // deep green
    doc.rect(0, 0, 842, 60, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('LABE COLLEGE OF NURSING SCIENCES, GBOKO', 421, 28, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('OFFICIAL 2026/2027 PRE-ADMISSION CBT SCREENING RESULTS BROAD SHEET', 421, 46, {
      align: 'center',
    });

    // Sub-header metadata
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(9);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 40, 80);
    doc.text(`Total Candidates Processed: ${filteredResults.length}`, 40, 95);

    // Table Header
    let startY = 115;
    doc.setFillColor(241, 245, 249);
    doc.rect(40, startY, 762, 22, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('S/N', 50, startY + 15);
    doc.text('APP NUMBER', 80, startY + 15);
    doc.text('EXAM NO', 180, startY + 15);
    doc.text('CANDIDATE FULL NAME', 280, startY + 15);
    doc.text('COURSE / PROGRAM', 470, startY + 15);
    doc.text('SCORE', 630, startY + 15);
    doc.text('%', 680, startY + 15);
    doc.text('STATUS', 730, startY + 15);

    // Rows
    startY += 26;
    doc.setFont('helvetica', 'normal');
    filteredResults.forEach((r, idx) => {
      if (startY > 540) {
        doc.addPage();
        startY = 50;
      }

      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(40, startY - 12, 762, 20, 'F');
      }

      doc.text(String(idx + 1), 50, startY);
      doc.text(r.application_number, 80, startY);
      doc.text(r.exam_number || 'N/A', 180, startY);
      doc.text(r.candidateName.substring(0, 26), 280, startY);
      doc.text(r.candidateCourse.substring(0, 24), 470, startY);
      doc.text(`${r.score}/${r.total}`, 630, startY);
      doc.text(`${r.percentage}%`, 680, startY);

      if (r.percentage >= 50) {
        doc.setTextColor(16, 120, 60);
        doc.text('CLEARED', 730, startY);
      } else {
        doc.setTextColor(180, 40, 40);
        doc.text('RE-SCREEN', 730, startY);
      }
      doc.setTextColor(30, 41, 59);

      startY += 20;
    });

    // Signature Area at bottom
    if (startY > 500) {
      doc.addPage();
      startY = 50;
    }
    startY += 30;
    doc.line(80, startY, 260, startY);
    doc.text('Admissions Committee Chairman', 80, startY + 14);

    doc.line(340, startY, 520, startY);
    doc.text('Academic Registrar & Secretary', 340, startY + 14);

    doc.line(600, startY, 760, startY);
    doc.text('Provost, LCNS Gboko', 600, startY + 14);

    doc.save(`LCNS_CBT_Screening_Broadsheet_${new Date().toISOString().split('T')[0]}.pdf`);
    showNotification('success', 'Official PDF Broad Sheet generated successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#0a4d2e] via-[#083e25] to-[#042114] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#ca8a04] bg-emerald-950 px-3 py-1 rounded-full border border-amber-400/30">
                Official Admissions Desk
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-200 bg-white/10 px-3 py-1 rounded-full">
                /admin/applicant-cbt
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase font-serif-crest text-white">
              Applicant CBT Test &amp; Results Broad Sheet
            </h1>
            <p className="text-xs text-emerald-200">
              Create and publish screening MCQ questions, evaluate candidate submissions, and export broad sheets.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('results')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'results'
                  ? 'bg-[#ca8a04] text-slate-950 shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Results &amp; Scores ({filteredResults.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'config'
                  ? 'bg-[#ca8a04] text-slate-950 shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Create / Edit CBT</span>
            </button>
          </div>
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

      {/* ======================================================== */}
      {/* TAB 1: RESULTS TABLE & DOWNLOADS (DEFAULT)               */}
      {/* ======================================================== */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Submissions</span>
              <span className="text-2xl font-black text-slate-900 font-mono-code">{mergedResults.length}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Clearing Rate (≥50%)</span>
              <span className="text-2xl font-black text-[#16a34a] font-mono-code">
                {mergedResults.length > 0
                  ? Math.round(
                      (mergedResults.filter((r) => r.percentage >= 50).length /
                        mergedResults.length) *
                        100
                    )
                  : 0}
                %
              </span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Average Score</span>
              <span className="text-2xl font-black text-slate-800 font-mono-code">
                {mergedResults.length > 0
                  ? Math.round(
                      mergedResults.reduce((acc, r) => acc + r.percentage, 0) /
                        mergedResults.length
                    )
                  : 0}
                %
              </span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Highest Recorded</span>
              <span className="text-2xl font-black text-[#ca8a04] font-mono-code">
                {mergedResults.length > 0
                  ? Math.max(...mergedResults.map((r) => r.percentage))
                  : 0}
                %
              </span>
            </div>
          </div>

          {/* Action Header & Search */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 uppercase font-serif-crest">
                  Applicant CBT Results &amp; Moderation Table
                </h3>
                <p className="text-xs text-slate-500">
                  Review applicant test performance, delete invalid tests, or download PDF/Excel broadsheets.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleDownloadPDF}
                  className="px-4 py-2 bg-[#0a4d2e] hover:bg-[#073822] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4 text-amber-300" />
                  <span>Download PDF Broadsheet</span>
                </button>
                <button
                  onClick={handleDownloadExcel}
                  className="px-4 py-2 bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Download Excel (.xlsx)</span>
                </button>
              </div>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search candidate by name, application number, or exam number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0a4d2e] focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
                >
                  <option value="ALL">All Programs</option>
                  <option value="ND">ND Nursing Sciences</option>
                  <option value="HND">HND Nursing Sciences</option>
                </select>
              </div>
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Candidate Info</th>
                    <th className="py-3 px-4">App Number</th>
                    <th className="py-3 px-4">Course Choice</th>
                    <th className="py-3 px-4 text-center">Score / 100</th>
                    <th className="py-3 px-4 text-center">Percentage</th>
                    <th className="py-3 px-4 text-center">Standing</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredResults.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400">
                        No candidate CBT results found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredResults.map((res) => (
                      <tr key={res.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                              {res.candidatePhoto ? (
                                <img
                                  src={res.candidatePhoto}
                                  alt={res.candidateName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="w-5 h-5 text-slate-400 mx-auto mt-2.5" />
                              )}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block uppercase">
                                {res.candidateName}
                              </span>
                              <span className="text-[11px] text-slate-500 font-mono-code">
                                Exam No: {res.exam_number || 'Pending'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono-code font-bold text-[#0a4d2e]">
                          {res.application_number}
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">
                          {res.candidateCourse}
                        </td>
                        <td className="py-3 px-4 text-center font-mono-code font-black text-slate-900 text-sm">
                          {res.score}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-black font-mono-code ${
                              res.percentage >= 70
                                ? 'bg-emerald-100 text-[#0a4d2e]'
                                : res.percentage >= 50
                                ? 'bg-amber-100 text-[#ca8a04]'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {res.percentage}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              res.percentage >= 50
                                ? 'bg-emerald-50 text-[#16a34a] border border-emerald-200'
                                : 'bg-red-50 text-red-600 border border-red-200'
                            }`}
                          >
                            {res.percentage >= 50 ? 'Passed' : 'Needs Review'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleDeleteScore(res.id, res.application_number)}
                              title="Delete CBT Score"
                              className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteApplicant(res.application_number)}
                              title="Delete Applicant Record"
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: CREATE / EDIT CBT TEST & QUESTIONS                */}
      {/* ======================================================== */}
      {activeTab === 'config' && (
        <form onSubmit={handleSaveTestConfig} className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 uppercase font-serif-crest">
                  Applicant CBT Screening Exam Configuration
                </h3>
                <p className="text-xs text-slate-500">
                  Specify exam title, duration, publish status, and multiple choice questions (MCQ).
                </p>
              </div>

              {/* Publish Toggle */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700">Publish to Applicants:</span>
                <button
                  type="button"
                  onClick={handleTogglePublish}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-100 text-[#0a4d2e] border border-emerald-300'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isActive ? (
                    <>
                      <ToggleRight className="w-5 h-5 text-[#16a34a]" />
                      <span>Live &bull; Published</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-5 h-5 text-slate-500" />
                      <span>Unpublished (Draft)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Test Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Examination Title *
                </label>
                <input
                  type="text"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  placeholder="e.g. 2026/2027 Pre-Admission Nursing Aptitude CBT Screening"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#0a4d2e] focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Duration (Minutes) *
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#0a4d2e] focus:bg-white"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Questions Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 uppercase font-serif-crest flex items-center gap-2">
                  <span>Examination Questions ({questions.length})</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Multiple Choice Questions with options A through D. Select the correct option radio button for automated grading.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddQuestion}
                className="px-3.5 py-2 bg-[#0a4d2e] hover:bg-[#073822] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Question</span>
              </button>
            </div>

            {/* Question Cards */}
            <div className="space-y-5">
              {questions.map((q, qIndex) => (
                <div
                  key={q.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-4 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-[#0a4d2e] bg-emerald-100 px-3 py-1 rounded-full">
                      Question #{qIndex + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Question Text:
                    </label>
                    <textarea
                      rows={2}
                      value={q.question}
                      onChange={(e) => handleUpdateQuestion(q.id, 'question', e.target.value)}
                      placeholder="Type screening question here..."
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0a4d2e]"
                      required
                    />
                  </div>

                  {/* Options A - D */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Option A */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <input
                            type="radio"
                            name={`correct-${q.id}`}
                            checked={q.correct_answer === 'option_a'}
                            onChange={() => handleUpdateQuestion(q.id, 'correct_answer', 'option_a')}
                            className="text-[#16a34a] focus:ring-[#16a34a]"
                          />
                          <span>Option A {q.correct_answer === 'option_a' && '(Correct Answer)'}</span>
                        </label>
                      </div>
                      <input
                        type="text"
                        value={q.option_a}
                        onChange={(e) => handleUpdateQuestion(q.id, 'option_a', e.target.value)}
                        placeholder="Option A text..."
                        className={`w-full p-2 rounded-xl text-xs bg-white border ${
                          q.correct_answer === 'option_a'
                            ? 'border-emerald-500 ring-1 ring-emerald-500'
                            : 'border-slate-200'
                        }`}
                        required
                      />
                    </div>

                    {/* Option B */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <input
                            type="radio"
                            name={`correct-${q.id}`}
                            checked={q.correct_answer === 'option_b'}
                            onChange={() => handleUpdateQuestion(q.id, 'correct_answer', 'option_b')}
                            className="text-[#16a34a] focus:ring-[#16a34a]"
                          />
                          <span>Option B {q.correct_answer === 'option_b' && '(Correct Answer)'}</span>
                        </label>
                      </div>
                      <input
                        type="text"
                        value={q.option_b}
                        onChange={(e) => handleUpdateQuestion(q.id, 'option_b', e.target.value)}
                        placeholder="Option B text..."
                        className={`w-full p-2 rounded-xl text-xs bg-white border ${
                          q.correct_answer === 'option_b'
                            ? 'border-emerald-500 ring-1 ring-emerald-500'
                            : 'border-slate-200'
                        }`}
                        required
                      />
                    </div>

                    {/* Option C */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <input
                            type="radio"
                            name={`correct-${q.id}`}
                            checked={q.correct_answer === 'option_c'}
                            onChange={() => handleUpdateQuestion(q.id, 'correct_answer', 'option_c')}
                            className="text-[#16a34a] focus:ring-[#16a34a]"
                          />
                          <span>Option C {q.correct_answer === 'option_c' && '(Correct Answer)'}</span>
                        </label>
                      </div>
                      <input
                        type="text"
                        value={q.option_c}
                        onChange={(e) => handleUpdateQuestion(q.id, 'option_c', e.target.value)}
                        placeholder="Option C text..."
                        className={`w-full p-2 rounded-xl text-xs bg-white border ${
                          q.correct_answer === 'option_c'
                            ? 'border-emerald-500 ring-1 ring-emerald-500'
                            : 'border-slate-200'
                        }`}
                        required
                      />
                    </div>

                    {/* Option D */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <input
                            type="radio"
                            name={`correct-${q.id}`}
                            checked={q.correct_answer === 'option_d'}
                            onChange={() => handleUpdateQuestion(q.id, 'correct_answer', 'option_d')}
                            className="text-[#16a34a] focus:ring-[#16a34a]"
                          />
                          <span>Option D {q.correct_answer === 'option_d' && '(Correct Answer)'}</span>
                        </label>
                      </div>
                      <input
                        type="text"
                        value={q.option_d}
                        onChange={(e) => handleUpdateQuestion(q.id, 'option_d', e.target.value)}
                        placeholder="Option D text..."
                        className={`w-full p-2 rounded-xl text-xs bg-white border ${
                          q.correct_answer === 'option_d'
                            ? 'border-emerald-500 ring-1 ring-emerald-500'
                            : 'border-slate-200'
                        }`}
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Save Bar */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleAddQuestion}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Question</span>
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#0a4d2e] hover:bg-[#073822] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4 text-amber-300" />
                <span>Save All Changes to Database</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

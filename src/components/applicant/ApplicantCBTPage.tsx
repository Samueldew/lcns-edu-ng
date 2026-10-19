import React, { useState, useEffect } from 'react';
import { CollegeLogo } from '../common/CollegeLogo';
import { CBTTest, CBTQuestionItem, CBTResult, Applicant } from '../../types';
import { StorageService } from '../../services/storage';
import { SheetService } from '../../services/sheetService';
import { getSupabase } from '../../lib/supabase';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Send,
  Printer,
  Sparkles,
  HelpCircle,
  Award,
  ArrowRight,
  ShieldAlert,
  User,
  GraduationCap,
  Play,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ApplicantCBTPageProps {
  testIdParam?: string;
}

export const ApplicantCBTPage: React.FC<ApplicantCBTPageProps> = ({ testIdParam }) => {
  // Extract testId
  const [testId, setTestId] = useState<string>(() => {
    if (testIdParam) return testIdParam;
    const path = window.location.pathname;
    const parts = path.split('/applicant/cbt/');
    if (parts.length > 1 && parts[1]) {
      return parts[1].split('?')[0];
    }
    const params = new URLSearchParams(window.location.search);
    return params.get('test_id') || 'test-attitude-01';
  });

  // Candidate Application Number input state
  const [appNumberInput, setAppNumberInput] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return (
      params.get('app_no') ||
      params.get('form_no') ||
      localStorage.getItem('lcns_current_app_no') ||
      'LCNS/APP/2026/014'
    );
  });

  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [test, setTest] = useState<CBTTest | null>(null);
  const [questions, setQuestions] = useState<CBTQuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState<number>(30 * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<CBTResult | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Match applicant whenever appNumberInput changes
  useEffect(() => {
    const allApplicants = StorageService.getApplicants();
    const clean = appNumberInput.trim().toLowerCase();
    const found = allApplicants.find(
      (a) =>
        a.formNo.toLowerCase() === clean ||
        a.email.toLowerCase() === clean ||
        (a.examNumber && a.examNumber.toLowerCase() === clean)
    );
    setApplicant(found || null);
  }, [appNumberInput]);

  useEffect(() => {
    loadTestAndQuestions(testId);
  }, [testId]);

  const loadTestAndQuestions = async (targetTestId: string) => {
    setLoading(true);
    // Local storage lookup
    const allTests = StorageService.getCBTTests();
    const foundTest = allTests.find((t) => t.id === targetTestId) || allTests[0];
    setTest(foundTest || null);
    if (foundTest) {
      setTimeLeft(foundTest.duration_minutes * 60);
    }

    const localQuestions = StorageService.getCBTQuestions(foundTest?.id || targetTestId);
    setQuestions(localQuestions);

    // Sync from Supabase if available
    try {
      const sb = getSupabase();
      if (sb) {
        const { data: dbTest } = await sb
          .from('cbt_tests')
          .select('*')
          .eq('id', targetTestId)
          .single();

        if (dbTest) {
          setTest(dbTest);
          setTimeLeft(dbTest.duration_minutes * 60);
        }

        const { data: dbQ } = await sb
          .from('cbt_questions')
          .select('*')
          .eq('test_id', targetTestId);

        if (dbQ && dbQ.length > 0) {
          setQuestions(dbQ);
        }
      }
    } catch (err) {
      console.warn('Supabase CBT load note:', err);
    }
    setLoading(false);
  };

  // Timer countdown while exam is in progress
  useEffect(() => {
    if (!isExamStarted || loading || submittedResult) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isExamStarted, loading, submittedResult]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSelectOption = (questionId: string, optionKey: string) => {
    if (submittedResult) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  const handleAutoSubmit = () => {
    handleSubmit();
  };

  const handleSubmit = async () => {
    if (isSubmitting || submittedResult) return;
    setIsSubmitting(true);
    setShowConfirmModal(false);

    // Grade test
    let score = 0;
    let totalMarks = 0;

    questions.forEach((q) => {
      const mark = q.marks || 1;
      totalMarks += mark;
      if (selectedAnswers[q.id] === q.correct_answer) {
        score += mark;
      }
    });

    const scaledScore = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;

    const appNo = applicant?.formNo || appNumberInput.trim() || 'LCNS/APP/2026/014';
    const examNo = applicant?.exam_number || applicant?.examNumber || 'LCNS/EXAM/2025/001';
    const candidateName = applicant?.fullName || 'Candidate ' + appNo;
    const candidatePhoto = applicant?.passportPhotoUrl || '';
    const candidateCourse = applicant?.courseChoice1 || applicant?.program || 'ND Nursing Sciences';

    const newResult: CBTResult = {
      id: 'res-' + Date.now(),
      application_number: appNo,
      applicant_name: candidateName,
      candidate_photo: candidatePhoto,
      course: candidateCourse,
      exam_number: examNo,
      score: scaledScore,
      total: 100,
      percentage: scaledScore,
      answers_json: selectedAnswers,
      is_published: true,
      submitted_at: new Date().toISOString(),
      test_id: test?.id || testId,
      test_title: test?.title || 'Pre-Admission Nursing Screening',
    };

    // Save locally
    const existing = StorageService.getCBTResults();
    const updated = [newResult, ...existing.filter((r) => r.application_number !== appNo)];
    StorageService.saveCBTResults(updated);

    // Sync to Google Sheet via SheetService
    SheetService.syncCBTResult({
      appNumber: appNo,
      candidateName,
      candidatePhoto,
      course: candidateCourse,
      score: scaledScore,
      percentage: `${scaledScore}%`,
      submittedAt: newResult.submitted_at,
    });

    // Save to Supabase cbt_results if available
    try {
      const sb = getSupabase();
      if (sb) {
        await sb.from('cbt_results').insert([
          {
            application_number: appNo,
            exam_number: examNo,
            score: scaledScore,
            total: 100,
            answers_json: selectedAnswers,
            is_published: true,
            test_id: test?.id || testId,
          },
        ]);
      }
    } catch (err) {
      console.warn('Supabase CBT result save note:', err);
    }

    setSubmittedResult(newResult);
    setIsSubmitting(false);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // safe fallback
    }
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const currentQ = questions[currentIndex];
  const timerCritical = timeLeft < 300; // less than 5 mins

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#ca8a04] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Loading CBT Examination Portal...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // VIEW 1: CANDIDATE VERIFICATION & CHECK-IN (BEFORE START)
  // ==========================================================
  if (!isExamStarted) {
    return (
      <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-[#0a4d2e] via-[#083e25] to-[#042114] text-white p-6 sm:p-8 rounded-3xl shadow-xl text-center space-y-3 border border-emerald-800">
            <div className="flex justify-center">
              <CollegeLogo size="md" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#ca8a04] bg-emerald-950 px-3 py-1 rounded-full border border-amber-400/30">
                Official Screening Portal &bull; /applicant/cbt
              </span>
              <h1 className="text-xl sm:text-2xl font-black uppercase font-serif-crest text-white mt-2">
                Pre-Admission CBT Screening Examination
              </h1>
              <p className="text-xs text-emerald-200">
                Labe College of Nursing Sciences, Gboko &bull; 2026/2027 Academic Session
              </p>
            </div>
          </div>

          {/* Form & Candidate Auto-Verification Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Enter Your Application Form Number *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={appNumberInput}
                  onChange={(e) => setAppNumberInput(e.target.value)}
                  placeholder="e.g. LCNS/APP/2026/014"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-bold font-mono-code focus:ring-2 focus:ring-[#0a4d2e] focus:bg-white text-slate-900"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Enter your form number to automatically verify and load your biometric admission file.
              </p>
            </div>

            {/* Candidate Info Preview (Auto-Displayed) */}
            {applicant ? (
              <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0a4d2e] uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
                  <span>Candidate Verified:</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  {/* Candidate Passport Photo */}
                  <div className="w-24 h-28 rounded-2xl overflow-hidden border-2 border-[#0a4d2e] bg-slate-200 shadow-md shrink-0">
                    {applicant.passportPhotoUrl ? (
                      <img
                        src={applicant.passportPhotoUrl}
                        alt={applicant.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-emerald-100 text-[#0a4d2e]">
                        <User className="w-10 h-10" />
                      </div>
                    )}
                  </div>

                  {/* Bio details */}
                  <div className="flex-1 space-y-1.5 text-center sm:text-left text-xs">
                    <h3 className="text-base font-black uppercase text-slate-900 font-serif-crest">
                      {applicant.fullName}
                    </h3>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <span className="font-mono-code font-bold text-[#0a4d2e] bg-white px-2.5 py-0.5 rounded-lg border border-emerald-200">
                        {applicant.formNo}
                      </span>
                      <span className="font-mono-code text-slate-600 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                        Exam No: {applicant.exam_number || applicant.examNumber || 'LCNS/EXAM/2025/001'}
                      </span>
                    </div>

                    <div className="pt-2 text-slate-700 space-y-0.5">
                      <p>
                        <strong>Course Choice 1:</strong> {applicant.courseChoice1 || applicant.program}
                      </p>
                      <p>
                        <strong>Course Choice 2:</strong> {applicant.courseChoice2 || 'HND Nursing Sciences'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        State: {applicant.stateOfOrigin} &bull; LGA: {applicant.lga}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  No applicant found matching <code>{appNumberInput}</code>. You can test with <code>LCNS/APP/2026/014</code> or <code>LCNS/APP/2026/089</code>.
                </span>
              </div>
            )}

            {/* Test Specifications Summary */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Exam Duration</span>
                <span className="text-sm font-black text-slate-800 font-mono-code">
                  {test?.duration_minutes || 30} Mins
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Questions</span>
                <span className="text-sm font-black text-slate-800 font-mono-code">
                  {questions.length} MCQs
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Passing Mark</span>
                <span className="text-sm font-black text-[#16a34a] font-mono-code">50%</span>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={() => {
                if (!applicant && !appNumberInput.trim()) {
                  alert('Please enter your Application Form Number first.');
                  return;
                }
                setIsExamStarted(true);
              }}
              className="w-full py-4 bg-[#0a4d2e] hover:bg-[#073822] text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 text-amber-300" />
              <span>Start CBT Examination</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // VIEW 2: CBT EXAM SUBMISSION SUMMARY / RESULT CARD
  // ==========================================================
  if (submittedResult) {
    return (
      <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-3xl flex items-center justify-center mx-auto shadow-md">
              <Award className="w-8 h-8 text-[#16a34a]" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#16a34a] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Exam Successfully Submitted
              </span>
              <h2 className="text-2xl font-black uppercase font-serif-crest text-slate-900 mt-2">
                Candidate CBT Screening Score
              </h2>
              <p className="text-xs text-slate-500">
                Official Result Slip &bull; Labe College of Nursing Sciences, Gboko
              </p>
            </div>

            {/* Candidate Snapshot */}
            <div className="flex items-center justify-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-left">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#0a4d2e] bg-slate-200 shrink-0">
                {applicant?.passportPhotoUrl ? (
                  <img
                    src={applicant.passportPhotoUrl}
                    alt={applicant.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-slate-400 mx-auto mt-3" />
                )}
              </div>
              <div className="text-xs">
                <span className="font-bold text-slate-900 block uppercase">
                  {applicant?.fullName || submittedResult.applicant_name}
                </span>
                <span className="text-slate-500 font-mono-code">
                  App No: {submittedResult.application_number} &bull; Course: {applicant?.courseChoice1 || 'ND Nursing'}
                </span>
              </div>
            </div>

            {/* Score Showcase */}
            <div className="bg-gradient-to-r from-[#0a4d2e] to-[#042114] text-white p-6 sm:p-8 rounded-3xl space-y-2 shadow-xl">
              <span className="text-xs font-bold uppercase text-emerald-300 tracking-widest">
                Automated Grading Score
              </span>
              <div className="text-5xl font-black font-mono-code text-[#ca8a04]">
                {submittedResult.score} / {submittedResult.total}
              </div>
              <div className="text-sm font-bold text-emerald-100">
                Percentage: <strong>{submittedResult.percentage}%</strong> &bull;{' '}
                <span className="text-amber-300">
                  {submittedResult.percentage && submittedResult.percentage >= 70
                    ? 'Distinction (Admissions Priority)'
                    : submittedResult.percentage && submittedResult.percentage >= 50
                    ? 'Satisfactory Pass Standing'
                    : 'Awaiting Admissions Review'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#0a4d2e] hover:bg-[#073822] text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span>Print CBT Result Slip</span>
              </button>
              <a
                href={`/applicant/dashboard?app_no=${encodeURIComponent(submittedResult.application_number)}`}
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <span>Go to Candidate Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // VIEW 3: ACTIVE TEST TAKING INTERFACE
  // ==========================================================
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans select-none">
      {/* Top Testing Header Bar */}
      <header className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center justify-between no-print sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <CollegeLogo size="sm" />
          <div>
            <h1 className="text-xs sm:text-sm font-black uppercase text-white tracking-wide">
              {test?.title || 'Pre-Admission Nursing Aptitude CBT Screening'}
            </h1>
            <p className="text-[10px] text-emerald-400 font-mono-code">
              Candidate: {applicant?.fullName || appNumberInput} ({applicant?.formNo || appNumberInput})
            </p>
          </div>
        </div>

        {/* Live Timer Countdown */}
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border font-mono-code font-black text-sm sm:text-base ${
              timerCritical
                ? 'bg-red-950/80 text-red-300 border-red-500 animate-pulse'
                : 'bg-emerald-950/80 text-[#ca8a04] border-amber-400/40'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{formatTimer(timeLeft)}</span>
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            className="px-4 py-1.5 bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Submit Test</span>
          </button>
        </div>
      </header>

      {/* Main Examination Question Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-between space-y-6">
        {currentQ && (
          <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-sm">
            {/* Question Counter Bar */}
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-[#ca8a04] bg-amber-950/60 px-3 py-1 rounded-full border border-amber-500/30 font-mono-code">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-xs text-slate-400">
                Answered: <strong className="text-white">{answeredCount}</strong> / {questions.length}
              </span>
            </div>

            {/* Question Text */}
            <div className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed">
              {currentQ.question}
            </div>

            {/* Options List A - D */}
            <div className="space-y-3 pt-2">
              {[
                { key: 'option_a', text: currentQ.option_a, letter: 'A' },
                { key: 'option_b', text: currentQ.option_b, letter: 'B' },
                { key: 'option_c', text: currentQ.option_c, letter: 'C' },
                { key: 'option_d', text: currentQ.option_d, letter: 'D' },
              ].map((opt) => {
                const isSelected = selectedAnswers[currentQ.id] === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleSelectOption(currentQ.id, opt.key)}
                    className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm font-medium transition-all flex items-center gap-3.5 ${
                      isSelected
                        ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-md ring-1 ring-emerald-500'
                        : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:bg-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected
                          ? 'bg-[#16a34a] text-white'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {opt.letter}
                    </span>
                    <span className="flex-1">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Question Palette & Nav Controls */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              disabled={currentIndex === questions.length - 1}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Palette */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-md">
            {questions.map((q, idx) => {
              const answered = selectedAnswers[q.id] !== undefined;
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-7 h-7 rounded-lg text-[11px] font-bold font-mono-code transition-all ${
                    isCurrent
                      ? 'bg-[#ca8a04] text-slate-950 ring-2 ring-amber-400 font-black'
                      : answered
                      ? 'bg-[#16a34a] text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            className="px-5 py-2 bg-[#0a4d2e] hover:bg-[#073822] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <span>Finish &amp; Submit</span>
          </button>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl text-center">
            <AlertTriangle className="w-12 h-12 text-[#ca8a04] mx-auto" />
            <h3 className="text-lg font-black uppercase text-white font-serif-crest">
              Confirm Final Submission
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              You have answered <strong>{answeredCount}</strong> out of{' '}
              <strong>{questions.length}</strong> questions. Once submitted, your answers will be permanently saved and graded immediately.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
              >
                Return to Exam
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-5 py-2 bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold rounded-xl shadow-md"
              >
                {isSubmitting ? 'Grading...' : 'Yes, Submit Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

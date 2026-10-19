import React, { useState, useEffect, useRef } from 'react';
import { CBTExam, CBTSubmission, User } from '../../types';
import { StorageService } from '../../services/storage';
import { CollegeLogo } from '../common/CollegeLogo';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Send,
  Printer,
  X,
  Award,
  Sparkles,
  ShieldAlert,
  Maximize2,
  AlertOctagon,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CBTExamSessionProps {
  exam: CBTExam;
  currentUser: User;
  onClose: () => void;
  onCompleted?: (submission: CBTSubmission) => void;
}

export const CBTExamSession: React.FC<CBTExamSessionProps> = ({
  exam,
  currentUser,
  onClose,
  onCompleted,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: number }>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(exam.durationMinutes * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<CBTSubmission | null>(null);

  // Anti-Cheat & Fullscreen State
  const [fullscreenExitCount, setFullscreenExitCount] = useState(0);
  const [antiCheatToast, setAntiCheatToast] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const toastTimeoutRef = useRef<any>(null);

  const showSecurityWarning = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setAntiCheatToast(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setAntiCheatToast(null);
    }, 4500);
  };

  // 1. On Start: Request Fullscreen
  useEffect(() => {
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {
          // Browser may require user gesture on some devices
        });
      }
    } catch {
      // ignore
    }

    return () => {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  // 2. Anti-Cheat: Fullscreen Change, Visibility, Blur, Right-Click, Copy/Paste
  useEffect(() => {
    if (submissionResult) return;

    // Fullscreen detection
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setFullscreenExitCount((prev) => {
          const next = prev + 1;
          if (next === 1) {
            showSecurityWarning(
              'WARNING (1/2): You exited fullscreen mode! Return immediately or your exam will be auto-submitted.'
            );
          } else if (next === 2) {
            showSecurityWarning(
              'FINAL WARNING (2/2): You exited fullscreen mode again! A 3rd exit will result in automatic exam submission.'
            );
          } else if (next >= 3) {
            showSecurityWarning(
              'EXAM TERMINATED: Fullscreen exited 3 times. Automatically submitting examination now...'
            );
            handleSubmitExam('Auto-submitted due to repeated exit from fullscreen mode (Rule Violation).');
          }
          return next;
        });
      }
    };

    // Tab visibility detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        showSecurityWarning(
          'ANTI-CHEAT ALERT: Tab switching or minimizing detected! All violations are logged.'
        );
      }
    };

    // Window blur detection
    const handleWindowBlur = () => {
      showSecurityWarning(
        'ANTI-CHEAT ALERT: Window focus lost! Please remain inside the examination browser window.'
      );
    };

    // Prevent Copy
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      showSecurityWarning('COPY DISABLED: Copying examination content is strictly forbidden.');
    };

    // Prevent Paste
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      showSecurityWarning('PASTE DISABLED: Pasting content is strictly forbidden.');
    };

    // Prevent Right Click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      showSecurityWarning('RIGHT CLICK DISABLED: Context menu is locked during examinations.');
    };

    // Prevent Selection
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
    };
  }, [submissionResult]);

  // 3. Timer Countdown & Auto-Submit
  useEffect(() => {
    if (submissionResult) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam('Timer expired - auto submitted.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [submissionResult]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (submissionResult) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionIndex,
    });
  };

  const handleRequestFullscreenAgain = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  // Submit Exam Function
  const handleSubmitExam = (violationNote?: string) => {
    if (isSubmitting || submissionResult) return;
    setIsSubmitting(true);
    setShowConfirmModal(false);

    const questions = exam.questions || [];
    let correctCount = 0;

    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correctCount += 1;
      }
    });

    const totalQuestions = questions.length;
    const percentage =
      totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    const submission: CBTSubmission = {
      id: 'sub-' + Date.now(),
      examId: exam.id,
      examTitle: exam.title,
      examType: exam.type,
      courseCode: exam.courseCode,
      userId: currentUser.matricNo || currentUser.id,
      userFullName: currentUser.fullName,
      userEmail: currentUser.email,
      userRole: currentUser.role === 'STUDENT' ? 'STUDENT' : 'APPLICANT',
      score: correctCount,
      totalQuestions,
      percentage,
      answers: selectedAnswers,
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'COMPLETED',
    };

    StorageService.saveCBTSubmission(submission);
    setSubmissionResult(submission);
    setIsSubmitting(false);

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // safe fallback
    }

    if (onCompleted) {
      onCompleted(submission);
    }
  };

  const questions = exam.questions || [];
  const currentQ = questions[currentQuestionIndex];
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto animate-fade-in no-print select-none">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full my-6 overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Anti-Cheat Floating Toast */}
        {antiCheatToast && (
          <div className="bg-red-600 text-white px-5 py-3 text-xs font-bold flex items-center justify-between gap-3 shadow-2xl border-b border-red-700 animate-bounce">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-300 shrink-0" />
              <span>{antiCheatToast}</span>
            </div>
            {!document.fullscreenElement && !submissionResult && (
              <button
                type="button"
                onClick={handleRequestFullscreenAgain}
                className="px-3 py-1 bg-white text-red-700 text-xs font-black rounded-lg shadow-xs hover:bg-red-50 flex items-center gap-1"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Return to Fullscreen</span>
              </button>
            )}
          </div>
        )}

        {/* Exam Header */}
        <div className="bg-gradient-to-r from-[#0a4d2e] via-[#073922] to-slate-900 text-white p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4 border-b border-emerald-950">
          <div className="flex items-center gap-3">
            <CollegeLogo size="sm" />
            <div>
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block">
                Official Computer-Based Testing Session &bull; Protected Anti-Cheat
              </span>
              <h2 className="text-base sm:text-lg font-black uppercase font-serif-crest text-white leading-tight">
                {exam.courseCode ? `${exam.courseCode}: ` : ''}
                {exam.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Fullscreen Warning Indicator */}
            {!submissionResult && fullscreenExitCount > 0 && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[11px] font-bold">
                <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
                <span>Exits: {fullscreenExitCount}/3</span>
              </div>
            )}

            {/* Countdown Clock */}
            {!submissionResult && (
              <div
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border font-mono-code font-black text-sm sm:text-base ${
                  timeLeftSeconds <= 180
                    ? 'bg-red-950/80 text-red-300 border-red-500 animate-pulse'
                    : 'bg-emerald-950/80 text-amber-300 border-amber-400/40'
                }`}
              >
                <Clock className="w-4 h-4 text-amber-400" />
                <span>{formatTimer(timeLeftSeconds)}</span>
              </div>
            )}

            {/* Candidate Photo & Bio */}
            <div className="flex items-center gap-2.5 bg-white/10 px-3 py-1.5 rounded-2xl border border-white/10">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-400 bg-emerald-950 shrink-0 flex items-center justify-center">
                {currentUser.photoUrl ? (
                  <img
                    src={currentUser.photoUrl}
                    alt={currentUser.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-bold text-xs text-white">
                    {currentUser.fullName.charAt(0)}
                  </span>
                )}
              </div>
              <div className="text-left text-xs hidden sm:block">
                <span className="font-bold text-white block leading-tight">{currentUser.fullName}</span>
                <span className="text-[10px] text-emerald-300 font-mono-code">
                  {currentUser.matricNo || currentUser.id}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-emerald-300 hover:text-white rounded-lg hover:bg-emerald-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Exam Body / Results View */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {submissionResult ? (
            /* ======================================================== */
            /* 5. AFTER SUBMIT: SHOW RESULT INSTANTLY                   */
            /* ======================================================== */
            <div className="space-y-6 max-w-2xl mx-auto py-4">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-emerald-100 text-[#0a4d2e] rounded-3xl flex items-center justify-center mx-auto shadow-md">
                  <Award className="w-8 h-8 text-[#16a34a]" />
                </div>
                <h3 className="text-2xl font-black uppercase font-serif-crest text-slate-900">
                  CBT Examination Completed!
                </h3>
                <p className="text-xs text-slate-500">
                  Your responses have been graded and recorded in your permanent academic transcript.
                </p>
              </div>

              {/* Score Display Card */}
              <div className="bg-gradient-to-r from-[#0a4d2e] to-[#042114] text-white p-6 sm:p-8 rounded-3xl text-center space-y-3 shadow-xl">
                <span className="text-xs uppercase font-bold text-emerald-300 tracking-widest">
                  Candidate Final Score
                </span>
                <div className="text-5xl font-black font-mono-code text-[#ca8a04]">
                  {submissionResult.score} / {submissionResult.totalQuestions}
                </div>
                <div className="text-base font-bold text-emerald-100">
                  Percentage: <strong className="text-white">{submissionResult.percentage}%</strong> &bull;{' '}
                  <span className="text-amber-300">
                    {submissionResult.percentage >= 70
                      ? 'Distinction (Grade A)'
                      : submissionResult.percentage >= 60
                      ? 'Credit (Grade B)'
                      : submissionResult.percentage >= 50
                      ? 'Pass Standing (Grade C)'
                      : 'Fail / Retake Required'}
                  </span>
                </div>
              </div>

              {/* Review of Question Answers */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 text-sm uppercase flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
                  <span>Test Review &amp; Explanations:</span>
                </h4>
                <div className="space-y-2.5">
                  {questions.map((q, idx) => {
                    const candidateChoice = submissionResult.answers[q.id];
                    const isCorrect = candidateChoice === q.correctAnswer;
                    return (
                      <div
                        key={q.id}
                        className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                          isCorrect
                            ? 'bg-emerald-50 border-emerald-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-slate-800">
                            #{idx + 1}. {q.question}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                              isCorrect ? 'bg-emerald-200 text-[#0a4d2e]' : 'bg-red-200 text-red-800'
                            }`}
                          >
                            {isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600">
                          Your Answer: <strong>{q.options[candidateChoice] || 'No Answer'}</strong>
                        </div>
                        {!isCorrect && (
                          <div className="text-[11px] text-[#0a4d2e] font-bold">
                            Correct Answer: {q.options[q.correctAnswer]}
                          </div>
                        )}
                        {q.explanation && (
                          <div className="text-[10px] text-slate-500 italic mt-1 pt-1 border-t border-slate-200/60">
                            Explanation: {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Close Button */}
              <div className="pt-4 text-center">
                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-[#0a4d2e] hover:bg-[#073822] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            /* ======================================================== */
            /* ACTIVE EXAM QUESTION INTERFACE                           */
            /* ======================================================== */
            <div className="space-y-6">
              {/* Progress Tracker */}
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold text-[#0a4d2e] uppercase">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span>
                  Answered: <strong className="text-slate-900">{answeredCount}</strong> of{' '}
                  {questions.length}
                </span>
              </div>

              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#0a4d2e] h-full transition-all duration-300"
                  style={{
                    width: `${questions.length > 0 ? (answeredCount / questions.length) * 100 : 0}%`,
                  }}
                />
              </div>

              {/* Question Item */}
              {currentQ && (
                <div className="space-y-4 py-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                    {currentQ.question}
                  </h3>

                  {/* Options List */}
                  <div className="space-y-2.5">
                    {currentQ.options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[currentQ.id] === optIdx;
                      const letter = String.fromCharCode(65 + optIdx);
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(currentQ.id, optIdx)}
                          className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm font-medium transition-all flex items-center gap-3.5 ${
                            isSelected
                              ? 'bg-emerald-50 border-[#0a4d2e] text-[#0a4d2e] ring-2 ring-[#0a4d2e]/30 font-bold shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              isSelected
                                ? 'bg-[#0a4d2e] text-white'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}
                          >
                            {letter}
                          </span>
                          <span className="flex-1">{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation Bar (When Active) */}
        {!submissionResult && (
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))
                }
                disabled={currentQuestionIndex === questions.length - 1}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Question Quick Palette */}
            <div className="hidden md:flex flex-wrap items-center gap-1">
              {questions.map((q, idx) => {
                const isAnswered = selectedAnswers[q.id] !== undefined;
                const isCurrent = idx === currentQuestionIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`w-7 h-7 rounded-lg text-[10px] font-bold font-mono-code transition-all ${
                      isCurrent
                        ? 'bg-[#ca8a04] text-slate-950 ring-2 ring-amber-400 font-black'
                        : isAnswered
                        ? 'bg-[#0a4d2e] text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              className="px-6 py-2.5 bg-[#0a4d2e] hover:bg-[#073822] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4 text-amber-300" />
              <span>Submit Examination</span>
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl text-center">
            <AlertTriangle className="w-12 h-12 text-[#ca8a04] mx-auto" />
            <h3 className="text-lg font-black uppercase text-slate-900 font-serif-crest">
              Confirm Examination Submission
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              You have answered <strong>{answeredCount}</strong> out of{' '}
              <strong>{questions.length}</strong> questions. Are you sure you want to finish and submit now?
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Return to Exam
              </button>
              <button
                type="button"
                onClick={() => handleSubmitExam()}
                disabled={isSubmitting}
                className="px-6 py-2 bg-[#0a4d2e] hover:bg-[#073822] text-white text-xs font-bold rounded-xl shadow-md"
              >
                {isSubmitting ? 'Submitting...' : 'Yes, Submit Exam'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

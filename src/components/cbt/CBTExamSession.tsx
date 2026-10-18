import React, { useState, useEffect } from 'react';
import { CBTExam, CBTSubmission, User, COLLEGE_CONFIG } from '../../types';
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
  HelpCircle,
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

  // Timer countdown
  useEffect(() => {
    if (submissionResult) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
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

  const handleAutoSubmit = () => {
    handleSubmitExam();
  };

  const handleSubmitExam = () => {
    if (isSubmitting || submissionResult) return;
    setIsSubmitting(true);

    const questions = exam.questions || [];
    let correctCount = 0;

    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correctCount += 1;
      }
    });

    const totalQuestions = questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fade-in no-print">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full my-6 overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Exam Session Header */}
        <div className="bg-gradient-to-r from-[#0a4d2e] via-[#073922] to-slate-900 text-white p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4 border-b border-emerald-950">
          <div className="flex items-center gap-3">
            <CollegeLogo size="sm" />
            <div>
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block">
                Official Computer-Based Testing Session
              </span>
              <h2 className="text-base sm:text-lg font-black uppercase font-serif-crest text-white leading-tight">
                {exam.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
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
            /* RESULT SUMMARY VIEW */
            <div className="space-y-6 max-w-2xl mx-auto py-4">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-3xl flex items-center justify-center mx-auto shadow-md">
                  <Award className="w-8 h-8 text-[#22c55e]" />
                </div>
                <h3 className="text-2xl font-black uppercase font-serif-crest text-slate-900">
                  CBT Test Submitted Successfully!
                </h3>
                <p className="text-xs text-slate-500">
                  Your answers have been graded and recorded in the academic database.
                </p>
              </div>

              {/* Score Display Card */}
              <div className="bg-gradient-to-r from-[#0a4d2e] to-[#042114] text-white p-6 sm:p-8 rounded-3xl text-center space-y-3 shadow-xl">
                <span className="text-xs uppercase font-bold text-emerald-300 tracking-widest">
                  Candidate Final Score
                </span>
                <div className="text-5xl font-black font-mono-code text-amber-400">
                  {submissionResult.score} / {submissionResult.totalQuestions}
                </div>
                <div className="text-base font-bold text-emerald-100">
                  Percentage: <strong className="text-white">{submissionResult.percentage}%</strong> &bull;{' '}
                  <span className="text-amber-300">
                    {submissionResult.percentage >= 70
                      ? 'Distinction (Excellent)'
                      : submissionResult.percentage >= 50
                      ? 'Pass Standing'
                      : 'Needs Improvement'}
                  </span>
                </div>
              </div>

              {/* Review of Question Answers */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 text-sm uppercase flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
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
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-slate-900">
                            Q{idx + 1}: {q.question}
                          </span>
                          <span
                            className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${
                              isCorrect ? 'bg-emerald-200 text-emerald-900' : 'bg-red-200 text-red-900'
                            }`}
                          >
                            {isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>
                        <p className="text-slate-600">
                          Your Answer: <strong>{q.options[candidateChoice] || 'Not answered'}</strong>
                        </p>
                        {!isCorrect && (
                          <p className="text-emerald-900 font-bold">
                            Correct Answer: <strong>{q.options[q.correctAnswer]}</strong>
                          </p>
                        )}
                        {q.explanation && (
                          <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200/60">
                            Note: {q.explanation}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-[#0a4d2e] hover:bg-[#073822] text-white rounded-xl font-bold text-xs shadow-md transition-all"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            /* ACTIVE EXAM QUESTION INTERFACE */
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Question Stem & Options */}
              <div className="lg:col-span-3 space-y-6">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Answered: <strong>{answeredCount}</strong> / {questions.length}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                    {currentQ?.question}
                  </h3>
                </div>

                {/* Options List */}
                <div className="space-y-3">
                  {currentQ?.options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[currentQ.id] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(currentQ.id, optIdx)}
                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-3.5 text-xs sm:text-sm font-medium ${
                          isSelected
                            ? 'bg-emerald-50 border-[#0a4d2e] text-[#0a4d2e] shadow-sm font-bold'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSelected
                              ? 'bg-[#0a4d2e] text-white'
                              : 'bg-slate-100 text-slate-600 border border-slate-300'
                          }`}
                        >
                          {['A', 'B', 'C', 'D'][optIdx]}
                        </span>
                        <span className="flex-1 leading-snug">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Navigation Buttons */}
                <div className="pt-4 flex items-center justify-between border-t border-slate-200">
                  <button
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  {currentQuestionIndex < questions.length - 1 ? (
                    <button
                      onClick={() =>
                        setCurrentQuestionIndex((prev) =>
                          Math.min(questions.length - 1, prev + 1)
                        )
                      }
                      className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md"
                    >
                      <span>Next Question</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitExam}
                      className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md transition-all"
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit Examination</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Question Palette Sidebar */}
              <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
                <span className="font-bold text-slate-800 text-xs uppercase tracking-wider block">
                  Question Palette
                </span>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, idx) => {
                    const isAnswered = selectedAnswers[q.id] !== undefined;
                    const isCurrent = currentQuestionIndex === idx;
                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={`h-9 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                          isCurrent
                            ? 'ring-2 ring-emerald-800 border-2 border-amber-400 bg-emerald-900 text-white'
                            : isAnswered
                            ? 'bg-[#0a4d2e] text-white shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-slate-200 space-y-1.5 text-[11px] text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-[#0a4d2e]"></span>
                    <span>Answered ({answeredCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-white border border-slate-300"></span>
                    <span>Unanswered ({questions.length - answeredCount})</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSubmitExam}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-xs"
                  >
                    Finish &amp; Submit
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

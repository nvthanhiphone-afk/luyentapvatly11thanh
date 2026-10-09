import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Assignment,
  ExamAttempt,
  Question,
  StudentUser,
  TrueFalseItem
} from '../../types';
import {
  clearActiveExamDraft,
  getActiveExamDraft,
  saveActiveExamDraft,
  calculateExamBreakdown,
  ExamDraft
} from '../../services/storage';
import {
  Clock,
  Flag,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Send,
  HelpCircle,
  Check,
  X,
  FileText,
  Sliders,
  ChevronRight,
  BookmarkCheck
} from 'lucide-react';

interface StudentExamTakingProps {
  assignment: Assignment;
  questions: Question[];
  student: StudentUser;
  attemptNumber: number;
  onSubmitExam: (attempt: ExamAttempt) => void;
  onCancelExam: () => void;
}

interface DisplayOption {
  displayKey: string; // 'A' | 'B' | 'C' | 'D'
  originalKey: string; // 'A' | 'B' | 'C' | 'D'
  text: string;
}

type SectionTab = 'ALL' | 'MCQ' | 'TRUEFALSE' | 'TEXT' | 'ESSAY';

export const StudentExamTaking: React.FC<StudentExamTakingProps> = ({
  assignment,
  questions,
  student,
  attemptNumber,
  onSubmitExam,
  onCancelExam,
}) => {
  // Check if draft exists
  const existingDraft = useMemo(() => {
    return getActiveExamDraft(assignment.id, student.email);
  }, [assignment.id, student.email]);

  // Establish stable question order & options for this attempt
  const { orderedQuestions, optionsMap, deadlineTime, attemptId, initialAnswers, initialFlags } =
    useMemo(() => {
      let qList = [...questions];
      const attId = existingDraft?.attemptId || 'att-' + Date.now();

      // If existing draft is valid, restore question order
      if (existingDraft && existingDraft.questionOrder.length === questions.length) {
        const orderMap = new Map(existingDraft.questionOrder.map((id, idx) => [id, idx]));
        qList.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));
      } else if (assignment.shuffle_questions) {
        qList.sort(() => Math.random() - 0.5);
      }

      // Build options mapping for each MCQ question
      const optMap: Record<string, DisplayOption[]> = {};

      qList.forEach(q => {
        if (q.question_type === 'MCQ') {
          const rawOpts: { origKey: string; text: string }[] = [];
          if (q.option_a) rawOpts.push({ origKey: 'A', text: q.option_a });
          if (q.option_b) rawOpts.push({ origKey: 'B', text: q.option_b });
          if (q.option_c) rawOpts.push({ origKey: 'C', text: q.option_c });
          if (q.option_d) rawOpts.push({ origKey: 'D', text: q.option_d });

          if (assignment.shuffle_answers) {
            rawOpts.sort(() => Math.random() - 0.5);
          }

          const displayKeys = ['A', 'B', 'C', 'D'];
          optMap[q.id] = rawOpts.map((ro, idx) => ({
            displayKey: displayKeys[idx] || String(idx + 1),
            originalKey: ro.origKey,
            text: ro.text,
          }));
        }
      });

      // Calculate deadline
      let deadline = 0;
      if (assignment.duration > 0) {
        if (existingDraft && existingDraft.deadlineTimestamp > Date.now()) {
          deadline = existingDraft.deadlineTimestamp;
        } else {
          deadline = Date.now() + assignment.duration * 60 * 1000;
        }
      }

      return {
        orderedQuestions: qList,
        optionsMap: optMap,
        deadlineTime: deadline,
        attemptId: attId,
        initialAnswers: existingDraft?.answers || {},
        initialFlags: existingDraft?.flags || {},
      };
    }, [assignment, questions, student.email, existingDraft]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);
  const [flags, setFlags] = useState<Record<string, boolean>>(initialFlags);
  const [activeSectionTab, setActiveSectionTab] = useState<SectionTab>('ALL');
  const [showRubricHint, setShowRubricHint] = useState(false);

  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(() => {
    if (deadlineTime > 0) {
      return Math.max(0, Math.floor((deadlineTime - Date.now()) / 1000));
    }
    return 0;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving'>('saved');

  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Countdown timer logic
  useEffect(() => {
    if (deadlineTime <= 0) return;

    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.floor((deadlineTime - Date.now()) / 1000));
      setTimeLeftSeconds(remaining);

      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        handleFinalSubmit(true);
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [deadlineTime]);

  // Real-time auto-saving draft
  useEffect(() => {
    setAutoSaveStatus('saving');
    const draft: ExamDraft = {
      attemptId,
      assignmentId: assignment.id,
      studentId: student.id,
      studentEmail: student.email,
      studentName: student.name,
      studentClass: student.class_name || 'Học sinh',
      attemptNumber,
      startedAt: new Date(startTimeRef.current).toISOString(),
      deadlineTimestamp: deadlineTime,
      answers,
      flags,
      questionOrder: orderedQuestions.map(q => q.id),
    };
    saveActiveExamDraft(draft);
    const t = setTimeout(() => setAutoSaveStatus('saved'), 300);
    return () => clearTimeout(t);
  }, [answers, flags, currentIndex]);

  const currentQuestion = orderedQuestions[currentIndex] || orderedQuestions[0];

  const handleSelectAnswer = (questionId: string, answerValue: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerValue,
    }));
  };

  // Helper for True/False with sub_items
  const handleToggleSubItem = (questionId: string, subItemId: string, value: 'Đúng' | 'Sai') => {
    const raw = answers[questionId];
    let map: Record<string, string> = {};
    try {
      if (raw && raw.startsWith('{')) {
        map = JSON.parse(raw);
      } else if (raw && raw.includes('|')) {
        raw.split('|').forEach(p => {
          const [k, v] = p.split(':');
          if (k && v) map[k.trim()] = v.trim();
        });
      }
    } catch {
      map = {};
    }
    map[subItemId] = value;
    setAnswers(prev => ({
      ...prev,
      [questionId]: JSON.stringify(map),
    }));
  };

  const getSubItemAnswer = (questionId: string, subItemId: string): string => {
    const raw = answers[questionId];
    if (!raw) return '';
    try {
      if (raw.startsWith('{')) {
        const parsed = JSON.parse(raw);
        return parsed[subItemId] || '';
      }
    } catch {
      return '';
    }
    return '';
  };

  const handleToggleFlag = (questionId: string) => {
    setFlags(prev => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  // Check if a question is considered answered
  const isQuestionAnswered = (q: Question) => {
    const val = answers[q.id];
    if (!val || val.trim() === '') return false;
    if (q.question_type === 'TRUEFALSE' && q.sub_items && q.sub_items.length > 0) {
      try {
        const parsed = JSON.parse(val);
        // Answered if at least one sub-item has been answered
        return Object.keys(parsed).length > 0;
      } catch {
        return false;
      }
    }
    return true;
  };

  const completedCount = useMemo(() => {
    return orderedQuestions.filter(q => isQuestionAnswered(q)).length;
  }, [answers, orderedQuestions]);

  const unansweredCount = orderedQuestions.length - completedCount;

  // Grade & submit
  const handleFinalSubmit = (force = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (timerRef.current) clearInterval(timerRef.current);

    // Call comprehensive grading engine
    const breakdown = calculateExamBreakdown(orderedQuestions, answers);
    const timeSpentSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

    const attempt: ExamAttempt = {
      id: attemptId,
      student_id: student.id,
      student_name: student.name,
      student_email: student.email,
      student_class: student.class_name || 'Lớp tự do',
      assignment_id: assignment.id,
      assignment_title: assignment.title,
      attempt_number: attemptNumber,
      correct_count: breakdown.correctCount,
      wrong_count: breakdown.wrongCount,
      unanswered_count: breakdown.unansweredCount,
      total_questions: orderedQuestions.length,
      score: breakdown.totalScore,
      started_at: new Date(startTimeRef.current).toISOString(),
      submitted_at: new Date().toISOString(),
      time_spent_seconds: timeSpentSeconds,
      answers,
      flags,
      is_submitted: true,
    };

    clearActiveExamDraft();
    onSubmitExam(attempt);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Section details for current question
  const getSectionInfo = (q: Question) => {
    if (q.question_type === 'MCQ') {
      return {
        part: 'PHẦN I',
        label: 'TRẮC NGHIỆM 4 LỰA CHỌN',
        scoreHint: '0,25 điểm/câu',
      };
    }
    if (q.question_type === 'TRUEFALSE') {
      return {
        part: 'PHẦN II',
        label: 'TRẮC NGHIỆM ĐÚNG / SAI',
        scoreHint: '1,0 điểm/câu (0,25 điểm/ý đúng)',
      };
    }
    if (q.question_type === 'TEXT') {
      return {
        part: 'PHẦN III',
        label: 'TRẢ LỜI NGẮN',
        scoreHint: '0,25 điểm/câu',
      };
    }
    return {
      part: 'PHẦN IV',
      label: 'TỰ LUẬN',
      scoreHint: '1,0 điểm/câu',
    };
  };

  const getCognitiveLabel = (level?: string) => {
    if (level === 'NHAN_BIET') return 'Nhận biết';
    if (level === 'THONG_HIEU') return 'Thông hiểu';
    if (level === 'VAN_DUNG') return 'Vận dụng';
    return '';
  };

  const curSecInfo = getSectionInfo(currentQuestion);
  const curCognitive = getCognitiveLabel(currentQuestion.cognitive_level);

  // Filtered list for the navigator
  const filteredQuestionIndices = useMemo(() => {
    return orderedQuestions
      .map((q, idx) => ({ q, idx }))
      .filter(({ q }) => {
        if (activeSectionTab === 'ALL') return true;
        return q.question_type === activeSectionTab;
      });
  }, [orderedQuestions, activeSectionTab]);

  return (
    <div className="min-h-screen bg-slate-100/70 pb-16">
      {/* Top Sticky Test Header: Timer, Student Info, Auto-Save Status */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between gap-4">
            {/* Student & Exam Info */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={onCancelExam}
                title="Quay lại danh sách bài tập"
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors shrink-0 cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <span>{student.name}</span>
                  <span aria-hidden="true">·</span>
                  <span>{student.class_name || 'Học sinh'}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-blue-600 font-semibold">Lần làm {attemptNumber}</span>
                </div>
                <h1 className="font-display font-bold text-base sm:text-lg text-slate-900 truncate">
                  {assignment.title}
                </h1>
              </div>
            </div>

            {/* Right: Timer & Submit Button */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Auto-save indicator */}
              <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 font-medium mr-1">
                <span className={`w-2 h-2 rounded-full ${autoSaveStatus === 'saved' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                <span>{autoSaveStatus === 'saved' ? 'Đã tự lưu' : 'Đang lưu...'}</span>
              </div>

              {/* Countdown Timer */}
              {assignment.duration > 0 && (
                <div
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-sm font-mono font-bold tabular-nums transition-colors ${
                    timeLeftSeconds <= 180
                      ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                      : 'bg-slate-50 text-slate-800 border-slate-200'
                  }`}
                >
                  <Clock className={`w-4 h-4 ${timeLeftSeconds <= 180 ? 'text-rose-600' : 'text-slate-500'}`} />
                  <span>{formatTime(timeLeftSeconds)}</span>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  if (unansweredCount > 0) {
                    setShowConfirmModal(true);
                  } else {
                    handleFinalSubmit();
                  }
                }}
                className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-display font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>NỘP BÀI</span>
              </button>
            </div>
          </div>

          {/* Progress Bar & Sub-stats */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              <span>Câu <strong>{currentIndex + 1}</strong> / {orderedQuestions.length}</span>
              <span className="mx-2 text-slate-300">·</span>
              <span>Đã làm: <strong className="text-slate-800">{completedCount}</strong> câu</span>
              {unansweredCount > 0 && (
                <span className="text-amber-600 ml-1">({unansweredCount} câu chưa trả lời)</span>
              )}
            </div>

            <div className="w-48 sm:w-64 bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${(completedCount / orderedQuestions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Question Card (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-8">
              {/* Question Header: Section Kicker & Cognitive Level */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-display font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                    {currentIndex + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-bold text-blue-700">{curSecInfo.part}</span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="font-semibold text-slate-700">{curSecInfo.label}</span>
                      {curCognitive && (
                        <>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="text-indigo-600 font-medium">{curCognitive}</span>
                        </>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Thang điểm: {curSecInfo.scoreHint}
                    </div>
                  </div>
                </div>

                {/* Flag for Review */}
                <button
                  type="button"
                  onClick={() => handleToggleFlag(currentQuestion.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    flags[currentQuestion.id]
                      ? 'bg-amber-50 text-amber-800 border border-amber-300'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Flag className={`w-3.5 h-3.5 ${flags[currentQuestion.id] ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                  <span>{flags[currentQuestion.id] ? 'Đã đánh dấu' : 'Đánh dấu xem lại'}</span>
                </button>
              </div>

              {/* Question Prompt */}
              <div className="text-slate-900 text-base sm:text-lg font-normal leading-relaxed mb-6 whitespace-pre-line">
                {currentQuestion.question_text}
              </div>

              {/* Answer Inputs by Question Type */}
              <div className="pt-2">
                {/* 1. MCQ Single Choice */}
                {currentQuestion.question_type === 'MCQ' && (
                  <div className="space-y-3">
                    {(optionsMap[currentQuestion.id] || []).map(opt => {
                      const isSelected = answers[currentQuestion.id] === opt.originalKey;
                      return (
                        <div
                          key={opt.displayKey}
                          onClick={() => handleSelectAnswer(currentQuestion.id, opt.originalKey)}
                          className={`flex items-start gap-3.5 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/50 shadow-2xs'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/40'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-lg font-display font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-2xs'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {opt.displayKey}
                          </div>
                          <div className="text-sm sm:text-base text-slate-800 font-normal pt-0.5 leading-snug">
                            {opt.text}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 2. TRUE/FALSE with sub_items a, b, c, d */}
                {currentQuestion.question_type === 'TRUEFALSE' && currentQuestion.sub_items && currentQuestion.sub_items.length > 0 && (
                  <div className="space-y-4">
                    <div className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
                      Lệnh hỏi: Hãy chọn tính Đúng hoặc Sai cho từng phát biểu dưới đây (mỗi ý đúng được 0,25đ):
                    </div>

                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/40">
                      {currentQuestion.sub_items.map((sub: TrueFalseItem) => {
                        const curVal = getSubItemAnswer(currentQuestion.id, sub.id);
                        const isDung = curVal.toLowerCase() === 'đúng';
                        const isSai = curVal.toLowerCase() === 'sai';

                        return (
                          <div key={sub.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1">
                              <span className="w-6 h-6 rounded-md bg-white border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                                {sub.id})
                              </span>
                              <span className="text-sm sm:text-base text-slate-800 leading-snug">
                                {sub.statement}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                              <button
                                type="button"
                                onClick={() => handleToggleSubItem(currentQuestion.id, sub.id, 'Đúng')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                  isDung
                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                    : 'bg-white border border-slate-300 text-slate-700 hover:border-emerald-400 hover:bg-emerald-50/30'
                                }`}
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>ĐÚNG</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleSubItem(currentQuestion.id, sub.id, 'Sai')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                  isSai
                                    ? 'bg-rose-600 text-white shadow-2xs'
                                    : 'bg-white border border-slate-300 text-slate-700 hover:border-rose-400 hover:bg-rose-50/30'
                                }`}
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>SAI</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Legacy / Single statement True/False */}
                {currentQuestion.question_type === 'TRUEFALSE' && (!currentQuestion.sub_items || currentQuestion.sub_items.length === 0) && (
                  <div className="grid grid-cols-2 gap-4 max-w-sm pt-2">
                    <button
                      type="button"
                      onClick={() => handleSelectAnswer(currentQuestion.id, 'Đúng')}
                      className={`flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl border-2 text-base font-bold transition-all cursor-pointer ${
                        answers[currentQuestion.id]?.toLowerCase() === 'đúng'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-2xs'
                          : 'border-slate-200 hover:border-emerald-300 text-slate-700 bg-white'
                      }`}
                    >
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>ĐÚNG</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectAnswer(currentQuestion.id, 'Sai')}
                      className={`flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl border-2 text-base font-bold transition-all cursor-pointer ${
                        answers[currentQuestion.id]?.toLowerCase() === 'sai'
                          ? 'border-rose-600 bg-rose-50 text-rose-800 shadow-2xs'
                          : 'border-slate-200 hover:border-rose-300 text-slate-700 bg-white'
                      }`}
                    >
                      <X className="w-4 h-4 text-rose-600" />
                      <span>SAI</span>
                    </button>
                  </div>
                )}

                {/* 3. TEXT Input (Short answer numeric / string) */}
                {currentQuestion.question_type === 'TEXT' && (
                  <div className="max-w-lg space-y-3 pt-1">
                    <label className="block text-xs font-semibold text-slate-600">
                      Nhập đáp số hoặc kết quả tính toán (Số nguyên, số thập phân hoặc công thức ngắn):
                    </label>
                    <input
                      type="text"
                      value={answers[currentQuestion.id] || ''}
                      onChange={e => handleSelectAnswer(currentQuestion.id, e.target.value)}
                      placeholder="Ví dụ: 9.8 hoặc 9,8 hoặc 0.2"
                      className="w-full px-4 py-3 text-base sm:text-lg font-mono font-bold rounded-xl border-2 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
                    />

                    {/* Scientific physics keypad */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] text-slate-400 font-medium mr-1">Chèn nhanh:</span>
                      {['0.2', '0.5', '2', '8', '20', '60', '100', '9.8', '340', 'π', '2π', 'm/s', 'V/m', 'Ω', 'J', 'W'].map(sym => (
                        <button
                          key={sym}
                          type="button"
                          onClick={() => {
                            const cur = answers[currentQuestion.id] || '';
                            handleSelectAnswer(currentQuestion.id, cur ? cur + ' ' + sym : sym);
                          }}
                          className="px-2 py-1 text-xs font-mono font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                        >
                          {sym}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. ESSAY Multi-line Input */}
                {currentQuestion.question_type === 'ESSAY' && (
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-600">
                        Trình bày các bước giải chi tiết, thiết lập biểu thức và tính toán:
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowRubricHint(!showRubricHint)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>{showRubricHint ? 'Ẩn tiêu chí chấm' : 'Xem gợi ý thang điểm (0,25đ x 4 bước)'}</span>
                      </button>
                    </div>

                    {/* Collapsible Rubric Guidance */}
                    {showRubricHint && currentQuestion.rubric && (
                      <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 leading-relaxed whitespace-pre-line">
                        <strong className="block font-bold mb-1">Ma trận tiêu chí chấm tự luận (1,0 điểm):</strong>
                        {currentQuestion.rubric}
                      </div>
                    )}

                    {/* Scientific Symbol Bar */}
                    <div className="flex flex-wrap items-center gap-1.5 pb-1">
                      <span className="text-[11px] text-slate-400 font-medium mr-1">Kí hiệu vật lý:</span>
                      {['π', '√', '²', '³', 'Ω', 'λ', 'ω', 'μ', '°', '±', '→', 'Δ', '·', '≥', '≤'].map(sym => (
                        <button
                          key={sym}
                          type="button"
                          onClick={() => {
                            const cur = answers[currentQuestion.id] || '';
                            handleSelectAnswer(currentQuestion.id, cur + sym);
                          }}
                          className="px-2 py-1 text-xs font-mono font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
                        >
                          {sym}
                        </button>
                      ))}
                    </div>

                    <textarea
                      rows={7}
                      value={answers[currentQuestion.id] || ''}
                      onChange={e => handleSelectAnswer(currentQuestion.id, e.target.value)}
                      placeholder="Nhập các bước lập luận, công thức và đáp số tại đây...&#10;Ví dụ:&#10;a) Áp dụng định luật...&#10;b) Suy ra kết quả..."
                      className="w-full p-4 text-sm sm:text-base font-sans rounded-xl border-2 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all leading-relaxed bg-white"
                    />

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Đã nhập: {(answers[currentQuestion.id] || '').length} kí tự</span>
                      <span>Bài tự luận sẽ được hệ thống lưu trữ và đối chiếu đáp án chi tiết sau khi nộp.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Question Controls: Prev / Next / Submit */}
              <div className="flex items-center justify-between gap-3 pt-6 mt-8 border-t border-slate-100">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-display font-bold text-xs sm:text-sm transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>CÂU TRƯỚC</span>
                </button>

                <div className="text-xs text-slate-400 font-mono hidden sm:block">
                  Câu {currentIndex + 1} / {orderedQuestions.length}
                </div>

                {currentIndex < orderedQuestions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex(prev => Math.min(orderedQuestions.length - 1, prev + 1))}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-display font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
                  >
                    <span>CÂU TIẾP THEO</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      if (unansweredCount > 0) {
                        setShowConfirmModal(true);
                      } else {
                        handleFinalSubmit();
                      }
                    }}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>NỘP BÀI</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Question Navigator (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sticky top-24">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <h3 className="font-display font-bold text-sm text-slate-900">
                  Bảng Điều Hướng Câu Hỏi
                </h3>
                <span className="text-xs font-mono text-slate-500">
                  {completedCount}/{orderedQuestions.length} câu
                </span>
              </div>

              {/* Section Filters */}
              <div className="flex flex-wrap gap-1 p-1 bg-slate-100/80 rounded-xl mb-4 text-xs font-medium">
                {[
                  { key: 'ALL', label: 'Tất cả (25)' },
                  { key: 'MCQ', label: 'P.I (16)' },
                  { key: 'TRUEFALSE', label: 'P.II (2)' },
                  { key: 'TEXT', label: 'P.III (4)' },
                  { key: 'ESSAY', label: 'P.IV (3)' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveSectionTab(tab.key as SectionTab)}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      activeSectionTab === tab.key
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Status convention legend */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 mb-4 pb-3 border-b border-slate-100 font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-blue-600" />
                  <span>Đã trả lời ({completedCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-white border border-slate-300" />
                  <span>Chưa trả lời ({unansweredCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-amber-400" />
                  <span>Đánh dấu xem lại</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md border-2 border-indigo-600 bg-blue-50" />
                  <span>Đang chọn</span>
                </div>
              </div>

              {/* Numbered Grid */}
              <div className="grid grid-cols-5 gap-2 max-h-[340px] overflow-y-auto pr-1">
                {filteredQuestionIndices.map(({ q, idx }) => {
                  const isCurrent = idx === currentIndex;
                  const isAnswered = isQuestionAnswered(q);
                  const isFlagged = flags[q.id];

                  let btnStyle = 'bg-white text-slate-700 border border-slate-200 hover:border-slate-400';

                  if (isFlagged) {
                    btnStyle = 'bg-amber-400 text-slate-900 font-bold border-amber-400';
                  } else if (isAnswered) {
                    btnStyle = 'bg-blue-600 text-white font-bold border-blue-600';
                  }

                  if (isCurrent) {
                    btnStyle += ' ring-2 ring-indigo-500 ring-offset-2 scale-105';
                  }

                  const cognChar =
                    q.cognitive_level === 'NHAN_BIET'
                      ? 'NB'
                      : q.cognitive_level === 'THONG_HIEU'
                      ? 'TH'
                      : 'VD';

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-10 rounded-xl text-xs font-mono font-bold flex flex-col items-center justify-center transition-all cursor-pointer relative ${btnStyle}`}
                    >
                      <span>{idx + 1}</span>
                      <span className="text-[9px] font-sans opacity-70 leading-none">
                        {cognChar}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Big Submit Button below the grid */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    if (unansweredCount > 0) {
                      setShowConfirmModal(true);
                    } else {
                      handleFinalSubmit();
                    }
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-display font-bold text-sm shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  NỘP BÀI THI
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal when unfinished questions exist */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-xl border border-slate-200">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-display text-lg font-bold text-center text-slate-900">
              Xác Nhận Nộp Bài
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 text-center mt-2 leading-relaxed">
              Bạn còn <strong className="text-rose-600 font-bold">{unansweredCount} câu</strong> chưa trả lời.
              Bạn có chắc chắn muốn nộp bài thi ngay bây giờ?
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-display font-bold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                QUAY LẠI LÀM TIẾP
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setShowConfirmModal(false);
                  handleFinalSubmit();
                }}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
              >
                VẪN NỘP BÀI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

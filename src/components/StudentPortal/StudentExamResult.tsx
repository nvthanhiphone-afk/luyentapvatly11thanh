import React, { useEffect, useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Assignment,
  ExamAttempt,
  Question,
  StudentUser,
  TrueFalseItem
} from '../../types';
import {
  calculateExamBreakdown,
  gradeSingleQuestion,
  isAnswerCorrect
} from '../../services/storage';
import {
  Award,
  CheckCircle,
  XCircle,
  AlertCircle,
  RotateCcw,
  BookOpen,
  ArrowLeft,
  Check,
  X,
  Clock,
  ListOrdered,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface StudentExamResultProps {
  attempt: ExamAttempt;
  assignment: Assignment;
  questions: Question[];
  student: StudentUser;
  totalAttemptsCount: number;
  onRetake: () => void;
  onBackToList: () => void;
}

export const StudentExamResult: React.FC<StudentExamResultProps> = ({
  attempt,
  assignment,
  questions,
  student,
  totalAttemptsCount,
  onRetake,
  onBackToList,
}) => {
  const [filterPart, setFilterPart] = useState<'ALL' | 'MCQ' | 'TRUEFALSE' | 'TEXT' | 'ESSAY'>('ALL');

  // Trigger celebration confetti for high achievement
  useEffect(() => {
    if (attempt.score >= 8.0) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [attempt.score]);

  // Compute structured breakdown across 4 official sections and cognitive levels
  const breakdown = useMemo(() => {
    return calculateExamBreakdown(questions, attempt.answers);
  }, [questions, attempt.answers]);

  // Performance Rating Message
  const getRating = (score: number) => {
    if (score >= 9.0) {
      return {
        title: 'Xuất sắc! 🌟',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        message: 'Kiến thức Vật lý 11 của em rất vững vàng! Nắm vững từ lý thuyết nhận biết đến các bài toán vận dụng phức tạp.',
      };
    }
    if (score >= 8.0) {
      return {
        title: 'Rất tốt! 👏',
        color: 'text-blue-700 bg-blue-50 border-blue-200',
        message: 'Bài làm rất tốt! Em nắm chắc hầu hết các khái niệm, công thức và phương pháp giải bài toán.',
      };
    }
    if (score >= 6.5) {
      return {
        title: 'Khá 👍',
        color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
        message: 'Em đã hiểu cơ bản các bài học. Cần rèn luyện thêm phần đúng/sai và các câu tự luận vận dụng để bứt phá điểm số.',
      };
    }
    if (score >= 5.0) {
      return {
        title: 'Đạt 👌',
        color: 'text-amber-700 bg-amber-50 border-amber-200',
        message: 'Em đã đạt yêu cầu bài kiểm tra. Hãy xem kĩ lời giải chi tiết và thang tiêu chí 4 bước bên dưới để rút kinh nghiệm.',
      };
    }
    return {
      title: 'Cần luyện tập thêm 📚',
      color: 'text-rose-700 bg-rose-50 border-rose-200',
      message: 'Đừng nản lòng! Hãy đọc lại lý thuyết SGK Vật lý 11, xem kỹ bài giải mẫu bên dưới và bấm nút Làm lại để thử sức.',
    };
  };

  const rating = getRating(attempt.score);
  const maxAttempts = assignment.max_attempts;
  const canRetake = maxAttempts === 0 || totalAttemptsCount < maxAttempts;

  const showSolutions =
    assignment.show_solution_mode === 'IMMEDIATE' ||
    (assignment.show_solution_mode === 'AFTER_END' &&
      assignment.end_time &&
      new Date(assignment.end_time) <= new Date());

  const formatTimeSpent = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m} phút ${s} giây`;
  };

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      if (filterPart === 'ALL') return true;
      return q.question_type === filterPart;
    });
  }, [questions, filterPart]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Result Hero Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden mb-8">
        <div className="p-6 sm:p-8 text-center border-b border-slate-100">
          <div className="text-xs font-semibold tracking-wider text-blue-700 uppercase mb-2">
            KẾT QUẢ BÀI KIỂM TRA CHUẨN BỘ GIÁO DỤC & ĐÀO TẠO
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            {assignment.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-slate-500 mt-2 font-medium">
            <span>Học sinh: <strong className="text-slate-800">{attempt.student_name}</strong> ({attempt.student_class})</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Lần làm {attempt.attempt_number}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Thời gian: {formatTimeSpent(attempt.time_spent_seconds)}</span>
          </div>

          {/* Big Score Box */}
          <div className="mt-6 inline-block bg-slate-50 text-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200 min-w-[240px]">
            <div className="text-xs font-bold text-slate-500 tracking-wider">
              ĐIỂM SỐ ĐẠT ĐƯỢC
            </div>
            <div className="font-display text-5xl sm:text-6xl font-black text-blue-600 my-1 tabular-nums">
              {attempt.score.toFixed(1)}
              <span className="text-2xl sm:text-3xl font-normal text-slate-400">/10</span>
            </div>
            <div className="mt-2 font-display font-bold text-xs text-slate-700">
              {rating.title}
            </div>
          </div>

          {/* Motivational message */}
          <div className="mt-6 max-w-2xl mx-auto p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-3 text-left">
            <Award className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              <strong className="text-slate-900">Nhận xét của Thầy Thành: </strong>
              {rating.message}
            </div>
          </div>
        </div>

        {/* 4 Official Section Breakdown Cards */}
        <div className="p-6 sm:p-8 bg-slate-50/50 border-b border-slate-100">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Bảng Điểm Chi Tiết Theo 4 Phần Thi Chuẩn Cấu Trúc:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Part I: MCQ */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-bold text-blue-700">PHẦN I: Trắc nghiệm</span>
                <span className="font-mono">16 câu</span>
              </div>
              <div className="text-2xl font-display font-black text-blue-600 tabular-nums">
                {breakdown.part1_mcq.earnedScore.toFixed(2)}
                <span className="text-xs font-normal text-slate-400"> / 4.00 đ</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Đúng {breakdown.part1_mcq.correctCount}/16 câu (0,25đ/câu)
              </div>
            </div>

            {/* Part II: True / False */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-bold text-indigo-700">PHẦN II: Đúng / Sai</span>
                <span className="font-mono">2 câu (8 ý)</span>
              </div>
              <div className="text-2xl font-display font-black text-indigo-600 tabular-nums">
                {breakdown.part2_trueFalse.earnedScore.toFixed(2)}
                <span className="text-xs font-normal text-slate-400"> / 2.00 đ</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Đúng {breakdown.part2_trueFalse.correctSubCount}/8 lệnh hỏi (0,25đ/ý)
              </div>
            </div>

            {/* Part III: Short Text */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-bold text-emerald-700">PHẦN III: Trả lời ngắn</span>
                <span className="font-mono">4 câu</span>
              </div>
              <div className="text-2xl font-display font-black text-emerald-600 tabular-nums">
                {breakdown.part3_text.earnedScore.toFixed(2)}
                <span className="text-xs font-normal text-slate-400"> / 1.00 đ</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Đúng {breakdown.part3_text.correctCount}/4 câu (0,25đ/câu)
              </div>
            </div>

            {/* Part IV: Essay */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-bold text-purple-700">PHẦN IV: Tự luận</span>
                <span className="font-mono">3 câu</span>
              </div>
              <div className="text-2xl font-display font-black text-purple-600 tabular-nums">
                {breakdown.part4_essay.earnedScore.toFixed(2)}
                <span className="text-xs font-normal text-slate-400"> / 3.00 đ</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Đã hoàn thành {breakdown.part4_essay.submittedCount}/3 câu tự luận
              </div>
            </div>
          </div>

          {/* Cognitive Level Matrix Strip */}
          <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
            <span className="font-semibold text-slate-700">Ma trận nhận thức:</span>
            <div className="flex items-center gap-4 font-mono tabular-nums">
              <span>
                Nhận biết (40%): <strong>{breakdown.cognitive.nhanBiet.earnedScore.toFixed(2)} / {breakdown.cognitive.nhanBiet.maxScore.toFixed(2)}đ</strong>
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>
                Thông hiểu (30%): <strong>{breakdown.cognitive.thongHieu.earnedScore.toFixed(2)} / {breakdown.cognitive.thongHieu.maxScore.toFixed(2)}đ</strong>
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>
                Vận dụng (30%): <strong>{breakdown.cognitive.vanDung.earnedScore.toFixed(2)} / {breakdown.cognitive.vanDung.maxScore.toFixed(2)}đ</strong>
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            {canRetake ? (
              <button
                type="button"
                onClick={onRetake}
                className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-display font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>LÀM LẠI BÀI THI (Lượt mới)</span>
              </button>
            ) : (
              <div className="text-xs text-amber-700 bg-amber-50 px-4 py-2.5 rounded-xl border border-amber-200 font-medium">
                Bạn đã dùng hết số lượt làm ({maxAttempts}/{maxAttempts} lượt)
              </div>
            )}

            <button
              type="button"
              onClick={onBackToList}
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-5 rounded-xl border border-slate-300 hover:bg-white text-slate-700 font-display font-bold text-xs sm:text-sm transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay về danh sách bài tập</span>
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Review Section */}
      {showSolutions ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-blue-600" />
                <span>Xem Lại Đáp Án & Lời Giải Chi Tiết</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Đối chiếu bài làm của bạn với đáp án chuẩn và thang tiêu chí 4 bước của Thầy Thành
              </p>
            </div>

            {/* Filter Tabs for Review */}
            <div className="flex flex-wrap gap-1 p-1 bg-slate-200/70 rounded-xl text-xs font-semibold">
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
                  onClick={() => setFilterPart(tab.key as any)}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    filterPart === tab.key
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* List of Questions */}
          {filteredQuestions.map((q, idx) => {
            const studentAns = attempt.answers[q.id];
            const gradeResult = breakdown.questionResults[q.id] || gradeSingleQuestion(q, studentAns);
            const isAnswered = Boolean(studentAns && studentAns.trim() !== '');

            return (
              <div
                key={q.id}
                className={`bg-white rounded-2xl border p-6 transition-all ${
                  !isAnswered
                    ? 'border-slate-200'
                    : gradeResult.isCorrect
                    ? 'border-emerald-300 bg-emerald-50/5'
                    : 'border-rose-200 bg-rose-50/5'
                }`}
              >
                {/* Header Row: Question Number, Section, Cognitive, Status */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-800 font-display font-bold text-xs flex items-center justify-center">
                      {q.order_index}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {q.question_type === 'MCQ'
                        ? 'Trắc nghiệm 4 lựa chọn'
                        : q.question_type === 'TRUEFALSE'
                        ? 'Đúng / Sai'
                        : q.question_type === 'TEXT'
                        ? 'Trả lời ngắn'
                        : 'Tự luận'}
                    </span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="text-xs font-mono text-slate-500">
                      Đạt: <strong className={gradeResult.earnedScore > 0 ? 'text-emerald-700' : 'text-slate-700'}>{gradeResult.earnedScore.toFixed(2)}</strong>/{gradeResult.maxScore.toFixed(2)} đ
                    </span>
                  </div>

                  {/* Status Tag */}
                  <div>
                    {!isAnswered ? (
                      <span className="text-xs font-semibold text-slate-400">
                        Chưa trả lời
                      </span>
                    ) : gradeResult.isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                        <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                        <span>Chính xác</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700">
                        <X className="w-4 h-4 text-rose-600 stroke-[3]" />
                        <span>Chưa chính xác</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Question Prompt */}
                <div className="text-sm sm:text-base text-slate-900 font-medium leading-relaxed mb-4 whitespace-pre-line">
                  {q.question_text}
                </div>

                {/* 1. MCQ Display */}
                {q.question_type === 'MCQ' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 text-xs sm:text-sm">
                    {[
                      { key: 'A', text: q.option_a },
                      { key: 'B', text: q.option_b },
                      { key: 'C', text: q.option_c },
                      { key: 'D', text: q.option_d },
                    ].map(opt => {
                      if (!opt.text) return null;
                      const isCorrectOpt = q.correct_answer === opt.key;
                      const isUserOpt = studentAns === opt.key;

                      let style = 'bg-slate-50 border-slate-200 text-slate-700';
                      if (isCorrectOpt) {
                        style = 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold';
                      } else if (isUserOpt) {
                        style = 'bg-rose-50 border-rose-300 text-rose-900';
                      }

                      return (
                        <div key={opt.key} className={`p-3 rounded-xl border flex items-center gap-2 ${style}`}>
                          <span className="w-6 h-6 rounded-md bg-white border border-slate-200 text-xs font-bold flex items-center justify-center shrink-0">
                            {opt.key}
                          </span>
                          <span>{opt.text}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 2. TRUE / FALSE Sub-items Display */}
                {q.question_type === 'TRUEFALSE' && gradeResult.subItemResults && gradeResult.subItemResults.length > 0 && (
                  <div className="mb-4 space-y-2">
                    <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Chi tiết 4 phát biểu và kết quả đánh giá:
                    </div>
                    <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-slate-50/40 text-xs sm:text-sm">
                      {gradeResult.subItemResults.map(sub => (
                        <div key={sub.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-start gap-2.5">
                            <span className="w-6 h-6 rounded bg-white border border-slate-200 font-bold text-xs flex items-center justify-center shrink-0">
                              {sub.id})
                            </span>
                            <div className="text-slate-800">
                              <span>{sub.statement}</span>
                              {sub.explanation && (
                                <div className="text-xs text-blue-800 mt-1 font-sans">
                                  Giải thích: {sub.explanation}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center font-mono">
                            <span className="text-slate-500">
                              Chọn: <strong className={sub.isCorrect ? 'text-emerald-700' : 'text-rose-600'}>{sub.studentAnswer || '(Bỏ trống)'}</strong>
                            </span>
                            <span className="text-slate-300">/</span>
                            <span className="text-emerald-700 font-bold">
                              Đáp án: {sub.correctAnswer}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${sub.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                              {sub.isCorrect ? '+0,25 đ' : '0 đ'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. TEXT Input Review */}
                {q.question_type === 'TEXT' && (
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/90 mb-3 text-xs sm:text-sm font-mono flex flex-wrap items-center gap-4">
                    <div>
                      <span className="text-slate-500">Đáp án của bạn: </span>
                      <strong className={gradeResult.isCorrect ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                        {studentAns || '(Bỏ trống)'}
                      </strong>
                    </div>
                    <div className="border-l border-slate-300 pl-4">
                      <span className="text-slate-500">Đáp án chuẩn: </span>
                      <strong className="text-emerald-700 font-bold">{q.correct_answer}</strong>
                    </div>
                  </div>
                )}

                {/* 4. ESSAY Review: Student Response & 4-Step Rubric */}
                {q.question_type === 'ESSAY' && (
                  <div className="space-y-3 mb-3">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Bài làm tự luận của em:
                      </div>
                      <p className="text-xs sm:text-sm text-slate-800 font-sans whitespace-pre-line leading-relaxed">
                        {studentAns || '(Chưa nhập bài làm tự luận)'}
                      </p>
                    </div>

                    {q.rubric && (
                      <div className="bg-indigo-50/60 rounded-xl p-4 border border-indigo-200/80 text-xs text-indigo-950">
                        <strong className="block font-bold mb-1 uppercase tracking-wide">
                          Thang tiêu chí chấm chi tiết 4 bước của Thầy Thành (1,0 điểm):
                        </strong>
                        <p className="whitespace-pre-line leading-relaxed font-sans">
                          {q.rubric}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Detailed Explanation / Lời giải chi tiết */}
                {q.explanation && (
                  <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-100 text-xs sm:text-sm">
                    <div className="font-bold text-blue-900 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                      <span>Lời giải chi tiết:</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed font-sans whitespace-pre-line">
                      {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">
            Giáo viên đã cài đặt chế độ chỉ hiển thị điểm số
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Đáp án và lời giải chi tiết sẽ được công bố sau khi kết thúc đợt kiểm tra.
          </p>
        </div>
      )}
    </div>
  );
};

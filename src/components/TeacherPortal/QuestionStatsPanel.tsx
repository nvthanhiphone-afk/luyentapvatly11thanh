import React, { useState } from 'react';
import { Assignment, ExamAttempt, Question } from '../../types';
import { gradeSingleQuestion } from '../../services/storage';
import {
  BarChart2,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  TrendingDown,
  TrendingUp,
  Info
} from 'lucide-react';

interface QuestionStatsPanelProps {
  assignments: Assignment[];
  questions: Question[];
  attempts: ExamAttempt[];
}

export const QuestionStatsPanel: React.FC<QuestionStatsPanelProps> = ({
  assignments,
  questions,
  attempts,
}) => {
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>(
    assignments[0]?.id || ''
  );

  const selectedAssignment = assignments.find(a => a.id === selectedAssignmentId);
  const relevantQuestions = questions.filter(q => q.assignment_id === selectedAssignmentId);
  const relevantAttempts = attempts.filter(a => a.assignment_id === selectedAssignmentId);

  // Compute question statistics
  const questionStats = relevantQuestions.map((q, idx) => {
    let answeredCount = 0;
    let correctCount = 0;
    let wrongCount = 0;

    relevantAttempts.forEach(att => {
      const studentAns = att.answers[q.id];
      if (studentAns !== undefined && studentAns.trim() !== '') {
        answeredCount++;
        const res = gradeSingleQuestion(q, studentAns);
        if (res.isCorrect) {
          correctCount++;
        } else {
          wrongCount++;
        }
      }
    });

    const correctRate =
      answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

    return {
      index: idx + 1,
      question: q,
      answeredCount,
      correctCount,
      wrongCount,
      correctRate,
      isHard: answeredCount > 0 && correctRate < 50,
      isWellMastered: answeredCount > 0 && correctRate >= 80,
    };
  });

  const hardQuestionsCount = questionStats.filter(qs => qs.isHard).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-indigo-600" />
            <span>Thống Kê Chi Tiết Theo Từng Câu Hỏi</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Phân tích tỷ lệ đúng/sai theo câu hỏi để nhận diện các vùng kiến thức học sinh hay bị nhầm lẫn
          </p>
        </div>

        {/* Assignment selector dropdown */}
        <div className="w-full sm:w-auto">
          <select
            value={selectedAssignmentId}
            onChange={e => setSelectedAssignmentId(e.target.value)}
            className="w-full sm:w-80 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-bold text-slate-800 shadow-xs outline-none"
          >
            {assignments.map(a => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Alert banner if there are hard questions */}
      {hardQuestionsCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 text-xs leading-relaxed">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-extrabold text-amber-950">
              Phát hiện {hardQuestionsCount} câu hỏi có tỷ lệ học sinh làm sai cao (&lt; 50% đúng):
            </strong>{' '}
            Thầy Thành nên dành thời gian chữa bài kỹ hoặc giảng lại lý thuyết các phần này trên lớp!
          </div>
        </div>
      )}

      {/* Questions list breakdown */}
      {relevantQuestions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
          Bài tập này chưa có câu hỏi nào.
        </div>
      ) : (
        <div className="space-y-4">
          {questionStats.map(stat => (
            <div
              key={stat.question.id}
              className={`p-5 rounded-2xl bg-white border-2 transition-all ${
                stat.isHard
                  ? 'border-amber-300 bg-amber-50/20 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center ${
                      stat.isHard
                        ? 'bg-amber-500 text-white'
                        : stat.isWellMastered
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {stat.index}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-slate-700">
                      Câu số {stat.index} ({stat.question.question_type})
                    </span>
                    <span className="text-slate-400 text-xs ml-2">
                      • Đáp án chuẩn: <strong className="text-emerald-700">{stat.question.correct_answer}</strong>
                    </span>
                  </div>
                </div>

                {/* Accuracy percentage badge */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-slate-500 font-medium">Tỷ lệ trả lời đúng</div>
                    <div
                      className={`text-lg font-black ${
                        stat.isHard
                          ? 'text-amber-600'
                          : stat.isWellMastered
                          ? 'text-emerald-600'
                          : 'text-blue-600'
                      }`}
                    >
                      {stat.answeredCount > 0 ? `${stat.correctRate}%` : 'Chưa có dữ liệu'}
                    </div>
                  </div>

                  <div className="w-24 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        stat.isHard
                          ? 'bg-amber-500'
                          : stat.isWellMastered
                          ? 'bg-emerald-500'
                          : 'bg-blue-600'
                      }`}
                      style={{ width: `${stat.correctRate}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Question Text */}
              <p className="text-sm font-semibold text-slate-900 mb-2 leading-relaxed">
                {stat.question.question_text}
              </p>

              {/* Counts & Explanation */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span>Số học sinh đã làm: <strong>{stat.answeredCount}</strong></span>
                <span>•</span>
                <span className="text-emerald-700 font-semibold">Đúng: {stat.correctCount}</span>
                <span>•</span>
                <span className="text-rose-700 font-semibold">Sai: {stat.wrongCount}</span>
              </div>

              {/* Warning box if hard question (Section XXIII requirement) */}
              {stat.isHard && (
                <div className="mt-3 p-3 rounded-xl bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    <strong>Cảnh báo sư phạm: </strong> Đây là câu nhiều học sinh trả lời sai ({stat.correctRate}% đúng). Nên ôn tập lại kiến thức này!
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

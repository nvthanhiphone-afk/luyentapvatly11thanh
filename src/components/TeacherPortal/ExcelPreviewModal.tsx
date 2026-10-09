import React, { useState } from 'react';
import {
  ExcelParseResult,
  ClassRoom,
  Assignment
} from '../../types';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  HelpCircle,
  X,
  Shuffle,
  Eye,
  Check
} from 'lucide-react';

interface ExcelPreviewModalProps {
  parseResult: ExcelParseResult;
  classes: ClassRoom[];
  onConfirm: (overrides: Partial<Assignment>) => void;
  onCancel: () => void;
}

export const ExcelPreviewModal: React.FC<ExcelPreviewModalProps> = ({
  parseResult,
  classes,
  onConfirm,
  onCancel,
}) => {
  const { info, questions, warnings } = parseResult;

  // Local editable settings before saving
  const [title, setTitle] = useState(info.title || 'Bài tập Vật lý 11');
  const [topic, setTopic] = useState(info.topic || 'Chương I: Dao động');
  const [description, setDescription] = useState(info.description || '');
  const [duration, setDuration] = useState(info.duration || 30);
  const [maxAttempts, setMaxAttempts] = useState(info.max_attempts || 3);
  const [shuffleQuestions, setShuffleQuestions] = useState(info.shuffle_questions);
  const [shuffleAnswers, setShuffleAnswers] = useState(info.shuffle_answers);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [showSolutionMode, setShowSolutionMode] = useState<'IMMEDIATE' | 'SCORE_ONLY' | 'AFTER_END'>('IMMEDIATE');

  const mcqCount = questions.filter(q => q.type === 'MCQ').length;
  const textCount = questions.filter(q => q.type === 'TEXT').length;
  const tfCount = questions.filter(q => q.type === 'TRUEFALSE').length;
  const totalScore = questions.reduce((acc, q) => acc + (q.score || 1), 0);

  const handleConfirm = () => {
    onConfirm({
      title,
      topic,
      description,
      duration,
      max_attempts: maxAttempts,
      shuffle_questions: shuffleQuestions,
      shuffle_answers: shuffleAnswers,
      allowed_class_ids: selectedClassIds,
      show_solution_mode: showSolutionMode,
      status: 'OPEN',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">
                XEM TRƯỚC BÀI TẬP TỪ EXCEL
              </h2>
              <p className="text-xs text-slate-500">
                Kiểm tra thông số cấu hình và danh sách câu hỏi trước khi chính thức lưu vào hệ thống
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Summary Box (Section XVIII) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-blue-50/70 p-4 rounded-2xl border border-blue-100 text-center">
            <div className="p-2 bg-white rounded-xl shadow-xs">
              <div className="text-2xl font-black text-blue-600">{questions.length}</div>
              <div className="text-xs font-semibold text-slate-600">Tổng câu hỏi</div>
            </div>
            <div className="p-2 bg-white rounded-xl shadow-xs">
              <div className="text-2xl font-black text-indigo-600">{mcqCount}</div>
              <div className="text-xs font-semibold text-slate-600">Trắc nghiệm (MCQ)</div>
            </div>
            <div className="p-2 bg-white rounded-xl shadow-xs">
              <div className="text-2xl font-black text-emerald-600">{tfCount}</div>
              <div className="text-xs font-semibold text-slate-600">Đúng/Sai (TF)</div>
            </div>
            <div className="p-2 bg-white rounded-xl shadow-xs">
              <div className="text-2xl font-black text-amber-600">{textCount}</div>
              <div className="text-xs font-semibold text-slate-600">Điền số (TEXT)</div>
            </div>
            <div className="p-2 bg-white rounded-xl shadow-xs col-span-2 sm:col-span-1">
              <div className="text-2xl font-black text-purple-600">{totalScore}</div>
              <div className="text-xs font-semibold text-slate-600">Tổng thang điểm</div>
            </div>
          </div>

          {/* Warnings if any */}
          {warnings.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Lưu ý cảnh báo ({warnings.length}):</span>
              </div>
              <ul className="list-disc pl-5 space-y-0.5">
                {warnings.map((w, idx) => (
                  <li key={idx}>{w.message}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Assignment Settings Config Form */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
              Cấu hình thông tin bài tập
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên bài tập</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chuyên đề</label>
                <input
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Thời gian làm bài (phút, 0 = không giới hạn)
                </label>
                <input
                  type="number"
                  min="0"
                  value={duration}
                  onChange={e => setDuration(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Số lượt làm bài tối đa (0 = vô hạn)
                </label>
                <input
                  type="number"
                  min="0"
                  value={maxAttempts}
                  onChange={e => setMaxAttempts(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer bg-white p-3 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={e => setShuffleQuestions(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span>Trộn thứ tự câu hỏi</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer bg-white p-3 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  checked={shuffleAnswers}
                  onChange={e => setShuffleAnswers(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span>Trộn thứ tự đáp án (A,B,C,D)</span>
              </label>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Xem lời giải</label>
                <select
                  value={showSolutionMode}
                  onChange={e => setShowSolutionMode(e.target.value as 'IMMEDIATE' | 'SCORE_ONLY')}
                  className="w-full text-xs font-semibold bg-transparent outline-none"
                >
                  <option value="IMMEDIATE">Xem ngay sau khi nộp</option>
                  <option value="SCORE_ONLY">Chỉ hiển thị điểm</option>
                </select>
              </div>
            </div>
          </div>

          {/* Question List Preview */}
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide mb-3">
              Danh sách {questions.length} câu hỏi chuẩn bị nhập
            </h3>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {questions.map((q, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs text-xs">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 font-bold flex items-center justify-center">
                        {q.stt || idx + 1}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-600">
                        {q.type}
                      </span>
                      <span className="text-slate-400">• {q.score} điểm</span>
                    </div>

                    <div className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      Đáp án đúng: {q.correct_answer}
                    </div>
                  </div>

                  <p className="font-semibold text-slate-900 text-sm mb-2">{q.question_text}</p>

                  {q.type === 'MCQ' && (
                    <div className="grid grid-cols-2 gap-1.5 text-slate-600 mb-2 pl-2">
                      <div><strong>A:</strong> {q.option_a}</div>
                      <div><strong>B:</strong> {q.option_b}</div>
                      {q.option_c && <div><strong>C:</strong> {q.option_c}</div>}
                      {q.option_d && <div><strong>D:</strong> {q.option_d}</div>}
                    </div>
                  )}

                  {q.explanation && (
                    <div className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg">
                      <strong>Lời giải:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-sm transition-colors cursor-pointer"
          >
            HỦY
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>XÁC NHẬN NHẬP BÀI TẬP VÀO HỆ THỐNG</span>
          </button>
        </div>
      </div>
    </div>
  );
};

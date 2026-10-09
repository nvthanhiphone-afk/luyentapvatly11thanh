import React, { useState } from 'react';
import {
  ExamAttempt,
  Assignment,
  ClassRoom,
  Question
} from '../../types';
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  X
} from 'lucide-react';
import { gradeSingleQuestion } from '../../services/storage';

interface ResultsTablePanelProps {
  attempts: ExamAttempt[];
  assignments: Assignment[];
  classes: ClassRoom[];
  questions: Question[];
  onExportExcel: () => void;
}

export const ResultsTablePanel: React.FC<ResultsTablePanelProps> = ({
  attempts,
  assignments,
  classes,
  questions,
  onExportExcel,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedAssignment, setSelectedAssignment] = useState('ALL');
  const [scoreFilter, setScoreFilter] = useState('ALL');
  const [sortOption, setSortOption] = useState<'NEWEST' | 'OLDEST' | 'SCORE_DESC' | 'SCORE_ASC'>('NEWEST');
  const [inspectAttempt, setInspectAttempt] = useState<ExamAttempt | null>(null);

  // Filtering
  const filteredAttempts = attempts.filter(att => {
    // Search by name or email
    const term = searchTerm.toLowerCase().trim();
    const matchSearch =
      att.student_name.toLowerCase().includes(term) ||
      att.student_email.toLowerCase().includes(term);

    // Class filter
    const matchClass =
      selectedClass === 'ALL' || att.student_class.toLowerCase().includes(selectedClass.toLowerCase());

    // Assignment filter
    const matchAssignment =
      selectedAssignment === 'ALL' || att.assignment_id === selectedAssignment;

    // Score filter
    let matchScore = true;
    if (scoreFilter === 'PASS') matchScore = att.score >= 5.0;
    else if (scoreFilter === 'FAIL') matchScore = att.score < 5.0;
    else if (scoreFilter === 'EXCELLENT') matchScore = att.score >= 8.5;

    return matchSearch && matchClass && matchAssignment && matchScore;
  });

  // Sorting
  filteredAttempts.sort((a, b) => {
    if (sortOption === 'NEWEST') {
      return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
    }
    if (sortOption === 'OLDEST') {
      return new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
    }
    if (sortOption === 'SCORE_DESC') {
      return b.score - a.score;
    }
    if (sortOption === 'SCORE_ASC') {
      return a.score - b.score;
    }
    return 0;
  });

  const getScoreBadgeColor = (score: number) => {
    if (score >= 9.0) return 'bg-emerald-100 text-emerald-800 font-extrabold';
    if (score >= 8.0) return 'bg-blue-100 text-blue-800 font-bold';
    if (score >= 6.5) return 'bg-indigo-100 text-indigo-800 font-semibold';
    if (score >= 5.0) return 'bg-amber-100 text-amber-800 font-medium';
    return 'bg-rose-100 text-rose-800 font-bold';
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with export & title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
            <span>Kết Quả Làm Bài ({filteredAttempts.length} lượt)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Bảng theo dõi chi tiết điểm số, số câu đúng/sai và thời gian nộp bài của học sinh
          </p>
        </div>

        <button
          type="button"
          onClick={onExportExcel}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>XUẤT BẢNG KẾT QUẢ RA EXCEL (.XLSX)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo họ tên hoặc email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none"
          />
        </div>

        {/* Class Filter */}
        <div>
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium outline-none"
          >
            <option value="ALL">Tất cả lớp học</option>
            {classes.map(c => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Assignment Filter */}
        <div>
          <select
            value={selectedAssignment}
            onChange={e => setSelectedAssignment(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium outline-none"
          >
            <option value="ALL">Tất cả bài tập</option>
            {assignments.map(a => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
        </div>

        {/* Score Filter */}
        <div>
          <select
            value={scoreFilter}
            onChange={e => setScoreFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium outline-none"
          >
            <option value="ALL">Tất cả mức điểm</option>
            <option value="PASS">Đạt (Điểm ≥ 5.0)</option>
            <option value="EXCELLENT">Giỏi (Điểm ≥ 8.5)</option>
            <option value="FAIL">Chưa đạt (&lt; 5.0)</option>
          </select>
        </div>

        {/* Sort Option */}
        <div>
          <select
            value={sortOption}
            onChange={e => setSortOption(e.target.value as 'NEWEST' | 'OLDEST' | 'SCORE_DESC' | 'SCORE_ASC')}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium outline-none"
          >
            <option value="NEWEST">Mới nhất trước</option>
            <option value="OLDEST">Cũ nhất trước</option>
            <option value="SCORE_DESC">Điểm: Cao → Thấp</option>
            <option value="SCORE_ASC">Điểm: Thấp → Cao</option>
          </select>
        </div>
      </div>

      {/* Main Results Table (Section XXI) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-3.5 w-12 text-center">STT</th>
              <th className="py-3 px-3.5">Họ và tên</th>
              <th className="py-3 px-3.5">Email</th>
              <th className="py-3 px-3.5">Lớp</th>
              <th className="py-3 px-3.5">Bài tập</th>
              <th className="py-3 px-3.5 text-center">Lần</th>
              <th className="py-3 px-3.5 text-center text-emerald-600">Đúng</th>
              <th className="py-3 px-3.5 text-center text-rose-600">Sai</th>
              <th className="py-3 px-3.5 text-center font-extrabold text-slate-900">Điểm</th>
              <th className="py-3 px-3.5">Thời gian nộp</th>
              <th className="py-3 px-3.5 text-center w-20">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredAttempts.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-10 text-center text-slate-400">
                  Không tìm thấy kết quả phù hợp với bộ lọc hiện tại.
                </td>
              </tr>
            ) : (
              filteredAttempts.map((att, idx) => (
                <tr key={att.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3.5 text-center text-slate-400 font-bold">{idx + 1}</td>
                  <td className="py-3 px-3.5 font-bold text-slate-900">{att.student_name}</td>
                  <td className="py-3 px-3.5 font-mono text-slate-500">{att.student_email}</td>
                  <td className="py-3 px-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                      {att.student_class}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 font-semibold text-slate-800 max-w-[200px] truncate" title={att.assignment_title}>
                    {att.assignment_title}
                  </td>
                  <td className="py-3 px-3.5 text-center font-bold text-slate-500">
                    Lần {att.attempt_number}
                  </td>
                  <td className="py-3 px-3.5 text-center font-bold text-emerald-600">
                    {att.correct_count}
                  </td>
                  <td className="py-3 px-3.5 text-center font-bold text-rose-600">
                    {att.wrong_count}
                  </td>
                  <td className="py-3 px-3.5 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-xs ${getScoreBadgeColor(att.score)}`}>
                      {att.score.toFixed(1)}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-slate-500 whitespace-nowrap">
                    {new Date(att.submitted_at).toLocaleTimeString('vi-VN')} {new Date(att.submitted_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-3 px-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => setInspectAttempt(att)}
                      title="Xem bài làm của học sinh"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Inspect Student Attempt Modal */}
      {inspectAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">
                  Chi Tiết Bài Làm: {inspectAttempt.student_name}
                </h3>
                <p className="text-xs text-slate-500">
                  Bài: {inspectAttempt.assignment_title} • Lần làm {inspectAttempt.attempt_number} • Điểm: <strong className="text-blue-600 text-sm">{inspectAttempt.score.toFixed(1)}/10</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectAttempt(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 overflow-y-auto space-y-4 flex-1">
              {questions
                .filter(q => q.assignment_id === inspectAttempt.assignment_id)
                .map((q, idx) => {
                  const sAns = inspectAttempt.answers[q.id];
                  const grade = gradeSingleQuestion(q, sAns);
                  const isCorrect = grade.isCorrect;

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-2xl border text-xs ${
                        isCorrect ? 'border-emerald-200 bg-emerald-50/20' : 'border-rose-200 bg-rose-50/20'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5 font-bold">
                        <span>Câu {idx + 1} ({grade.earnedScore.toFixed(2)}/{grade.maxScore.toFixed(2)} điểm):</span>
                        <span className={isCorrect ? 'text-emerald-700' : 'text-rose-700'}>
                          {isCorrect ? '✓ Đúng' : grade.earnedScore > 0 ? `Đúng 1 phần (${grade.earnedScore.toFixed(2)}đ)` : '✗ Sai'}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-900 text-sm mb-2">{q.question_text}</p>
                      <div className="flex flex-wrap gap-4 text-xs">
                        <span>Học sinh chọn: <strong className={isCorrect ? 'text-emerald-700' : 'text-rose-700'}>{sAns || '(Bỏ trống)'}</strong></span>
                        <span>Đáp án đúng: <strong className="text-emerald-700">{q.correct_answer}</strong></span>
                      </div>
                      {q.explanation && (
                        <p className="text-[11px] text-slate-500 italic mt-1.5">
                          Lời giải: {q.explanation}
                        </p>
                      )}
                    </div>
                  );
                })}
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectAttempt(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

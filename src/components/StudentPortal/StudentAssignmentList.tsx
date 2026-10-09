import React, { useState } from 'react';
import {
  Assignment,
  ExamAttempt,
  Question,
  StudentUser
} from '../../types';
import {
  Clock,
  HelpCircle,
  RotateCcw,
  Award,
  Play,
  Search,
  AlertCircle,
  ChevronRight
} from 'lucide-react';

interface StudentAssignmentListProps {
  student: StudentUser;
  assignments: Assignment[];
  questions: Question[];
  attempts: ExamAttempt[];
  onStartExam: (assignmentId: string) => void;
  onViewPreviousResult: (attempt: ExamAttempt) => void;
  onChangeStudent: () => void;
}

export const StudentAssignmentList: React.FC<StudentAssignmentListProps> = ({
  student,
  assignments,
  questions,
  attempts,
  onStartExam,
  onViewPreviousResult,
  onChangeStudent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('ALL');

  // Filter assignments permitted for this student's class
  const availableAssignments = assignments.filter(a => {
    if (a.status === 'DRAFT') return false;
    if (a.allowed_class_ids && a.allowed_class_ids.length > 0 && student.class_id) {
      return a.allowed_class_ids.includes(student.class_id);
    }
    return true;
  });

  const topics = Array.from(new Set(availableAssignments.map(a => a.topic)));

  const filteredAssignments = availableAssignments.filter(a => {
    const matchSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTopic = selectedTopic === 'ALL' || a.topic === selectedTopic;
    return matchSearch && matchTopic;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Student Profile Bar - Clean, unboxed design */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-display font-black text-xl shadow-xs">
            {student.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900">{student.name}</h1>
              <span className="text-xs font-semibold text-slate-500">
                ({student.class_name || 'Lớp tự do'})
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5 font-mono">
              {student.email}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onChangeStudent}
          className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
        >
          Đổi thông tin học sinh
        </button>
      </div>

      {/* Filter and Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Danh Sách Bài Tập
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Lựa chọn chuyên đề để bắt đầu làm bài trực tuyến
          </p>
        </div>

        {/* Search & Topic filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm bài tập..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            />
          </div>

          <select
            value={selectedTopic}
            onChange={e => setSelectedTopic(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="ALL">Tất cả chuyên đề</option>
            {topics.map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assignment Grid */}
      {filteredAssignments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">Chưa có bài tập nào khả dụng</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Không tìm thấy bài tập phù hợp với lớp học hoặc từ khóa tìm kiếm.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssignments.map(asg => {
            const qCount = questions.filter(q => q.assignment_id === asg.id).length;

            const studentAttempts = attempts.filter(
              att =>
                att.assignment_id === asg.id &&
                att.student_email.toLowerCase() === student.email.toLowerCase()
            );

            const attemptsCount = studentAttempts.length;
            const maxAttemptsAllowed = asg.max_attempts;
            const isLimitReached = maxAttemptsAllowed > 0 && attemptsCount >= maxAttemptsAllowed;

            const highestScore =
              studentAttempts.length > 0
                ? Math.max(...studentAttempts.map(a => a.score))
                : null;

            const latestAttempt = studentAttempts[0];

            const isOpen = asg.status === 'OPEN';
            const isClosed = asg.status === 'CLOSED';
            const isUpcoming = asg.status === 'UPCOMING';

            return (
              <div
                key={asg.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-blue-400/80 transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-6 pb-4">
                  {/* Clean unboxed metadata kicker */}
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-semibold text-blue-600">{asg.topic}</span>
                    <span className="font-medium">
                      {isOpen ? (
                        <span className="text-emerald-600 font-semibold">Đang mở</span>
                      ) : isUpcoming ? (
                        <span className="text-amber-600 font-semibold">Chưa mở</span>
                      ) : (
                        <span className="text-slate-400">Đã đóng</span>
                      )}
                    </span>
                  </div>

                  {/* Standard Exam Badge */}
                  {asg.id.startsWith('asg-chuong-') && (
                    <div className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                      <span>Đề Chuẩn 25 Câu Bộ GD&ĐT (10đ)</span>
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="font-display font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors leading-snug mb-2">
                    {asg.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                    {asg.description}
                  </p>

                  {/* 4 Parts Specification Strip for Standard Exams */}
                  {asg.id.startsWith('asg-chuong-') && (
                    <div className="mb-3 text-[11px] font-mono text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span>16 câu trắc nghiệm (0,25đ/câu):</span>
                        <strong className="text-blue-700">4,0đ</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>2 câu Đúng/Sai 4 lệnh (0,25đ/ý):</span>
                        <strong className="text-indigo-700">2,0đ</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>4 câu trả lời ngắn (0,25đ/câu):</span>
                        <strong className="text-emerald-700">1,0đ</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>3 câu tự luận (1,0đ/câu):</span>
                        <strong className="text-purple-700">3,0đ</strong>
                      </div>
                    </div>
                  )}

                  {/* Quiet unboxed specs with separators */}
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 mb-4 pt-3 border-t border-slate-100 font-mono tabular-nums">
                    <span>{qCount} câu hỏi</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span>{asg.duration > 0 ? `${asg.duration} phút` : 'Tự do'}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span>Đã làm: {attemptsCount}{maxAttemptsAllowed > 0 ? `/${maxAttemptsAllowed}` : ''}</span>
                  </div>

                  {/* Highest score notice if present */}
                  {highestScore !== null && (
                    <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 font-mono">
                      <span className="text-slate-600 font-sans">Điểm cao nhất:</span>
                      <strong className="text-emerald-600 font-bold tabular-nums">
                        {highestScore.toFixed(1)}/10
                      </strong>
                    </div>
                  )}
                </div>

                {/* Card Action Controls */}
                <div className="p-6 pt-0 mt-auto border-t border-slate-100 flex flex-col gap-2">
                  {isOpen && !isLimitReached && (
                    <button
                      type="button"
                      onClick={() => onStartExam(asg.id)}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-display font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>{attemptsCount === 0 ? 'BẮT ĐẦU LÀM BÀI' : 'LÀM LẠI BÀI THI'}</span>
                    </button>
                  )}

                  {isLimitReached && (
                    <div className="w-full py-2.5 px-3 rounded-xl bg-slate-100 text-slate-600 text-xs text-center font-medium">
                      Đã đạt giới hạn lượt làm ({maxAttemptsAllowed}/{maxAttemptsAllowed} lượt)
                    </div>
                  )}

                  {!isOpen && (
                    <div className="w-full py-2.5 px-3 rounded-xl bg-slate-100 text-slate-500 text-xs text-center font-medium">
                      {isUpcoming ? 'Bài tập chưa mở' : 'Bài tập đã đóng'}
                    </div>
                  )}

                  {latestAttempt && (
                    <button
                      type="button"
                      onClick={() => onViewPreviousResult(latestAttempt)}
                      className="w-full py-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer text-center"
                    >
                      Xem lại kết quả gần nhất ({latestAttempt.score.toFixed(1)} điểm)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

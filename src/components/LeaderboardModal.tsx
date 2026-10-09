import React, { useState } from 'react';
import { Trophy, Medal, X, Sparkles, Award } from 'lucide-react';
import { Assignment, ExamAttempt, SystemSettings } from '../types';

interface LeaderboardModalProps {
  attempts: ExamAttempt[];
  assignments: Assignment[];
  settings: SystemSettings;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  attempts,
  assignments,
  settings,
  onClose,
}) => {
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('ALL');

  if (!settings.leaderboard_enabled) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl">
          <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">Bảng xếp hạng đang tạm đóng</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Thầy Thành hiện chưa mở tính năng công khai bảng xếp hạng cho học sinh.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  // Filter attempts
  const filtered = selectedAssignmentId === 'ALL'
    ? attempts
    : attempts.filter(a => a.assignment_id === selectedAssignmentId);

  // Group by student email to take HIGHEST score for each student (Section XXIV: chỉ hiển thị Họ tên và Điểm cao nhất, không công khai email)
  const studentMap = new Map<string, { name: string; maxScore: number; className: string }>();

  filtered.forEach(a => {
    const key = a.student_email.toLowerCase();
    const existing = studentMap.get(key);
    if (!existing || a.score > existing.maxScore) {
      studentMap.set(key, {
        name: a.student_name,
        maxScore: a.score,
        className: a.student_class,
      });
    }
  });

  const topStudents = Array.from(studentMap.values())
    .sort((a, b) => b.maxScore - a.maxScore)
    .slice(0, 10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-1.5">
                <span>BẢNG VÀNG THÀNH TÍCH TOP 10</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </h3>
              <p className="text-xs text-slate-500">
                Vinh danh học sinh có điểm cao nhất môn Vật lý 11
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter by assignment */}
        <div className="py-3">
          <select
            value={selectedAssignmentId}
            onChange={e => setSelectedAssignmentId(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 outline-none"
          >
            <option value="ALL">Tất cả các bài kiểm tra</option>
            {assignments.map(a => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
        </div>

        {/* Leaderboard Ranking List */}
        <div className="space-y-2 overflow-y-auto pr-1 flex-1 py-2">
          {topStudents.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              Chưa có học sinh nào hoàn thành bài thi.
            </div>
          ) : (
            topStudents.map((s, idx) => {
              const rank = idx + 1;
              const isTop1 = rank === 1;
              const isTop2 = rank === 2;
              const isTop3 = rank === 3;

              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    isTop1
                      ? 'bg-amber-50/80 border-amber-300 shadow-xs'
                      : isTop2
                      ? 'bg-slate-100/70 border-slate-300'
                      : isTop3
                      ? 'bg-orange-50/70 border-orange-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                        isTop1
                          ? 'bg-amber-500 text-white shadow-xs'
                          : isTop2
                          ? 'bg-slate-400 text-white'
                          : isTop3
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {rank}
                    </div>

                    <div>
                      <div className="font-extrabold text-sm text-slate-900">{s.name}</div>
                      <div className="text-[11px] text-slate-500">{s.className}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-black text-blue-600">
                      {s.maxScore.toFixed(1)}
                      <span className="text-xs text-slate-400">/10</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 italic">
            * Hệ thống tuân thủ bảo mật thông tin: Địa chỉ email của học sinh không được hiển thị công khai.
          </p>
        </div>
      </div>
    </div>
  );
};

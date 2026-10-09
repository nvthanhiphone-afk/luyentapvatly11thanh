import React, { useState } from 'react';
import { StudentUser, ClassRoom, ExamAttempt } from '../../types';
import { Users, Search, GraduationCap, Award, Calendar, Mail } from 'lucide-react';

interface StudentListPanelProps {
  students: StudentUser[];
  classes: ClassRoom[];
  attempts: ExamAttempt[];
}

export const StudentListPanel: React.FC<StudentListPanelProps> = ({
  students,
  classes,
  attempts,
}) => {
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');

  const filtered = students.filter(s => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchClass = classFilter === 'ALL' || s.class_id === classFilter;
    return matchSearch && matchClass;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>Danh Sách Học Sinh ({students.length})</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Quản lý thông tin học sinh, lịch sử làm bài và năng lực học tập
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
            />
          </div>

          <select
            value={classFilter}
            onChange={e => setClassFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold"
          >
            <option value="ALL">Tất cả các lớp</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 w-12 text-center">STT</th>
              <th className="py-3 px-4">Họ và tên</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Lớp học</th>
              <th className="py-3 px-4 text-center">Số lượt làm bài</th>
              <th className="py-3 px-4 text-center">Điểm TB</th>
              <th className="py-3 px-4 text-center">Điểm cao nhất</th>
              <th className="py-3 px-4">Lần làm gần nhất</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  Không tìm thấy học sinh nào phù hợp.
                </td>
              </tr>
            ) : (
              filtered.map((s, idx) => {
                const sAttempts = attempts.filter(
                  a => a.student_email.toLowerCase() === s.email.toLowerCase()
                );
                const sScores = sAttempts.map(a => a.score);
                const avgScore =
                  sScores.length > 0
                    ? (sScores.reduce((acc, curr) => acc + curr, 0) / sScores.length).toFixed(1)
                    : '-';
                const maxScore = sScores.length > 0 ? Math.max(...sScores).toFixed(1) : '-';
                const latestDate = sAttempts[0]?.submitted_at
                  ? new Date(sAttempts[0].submitted_at).toLocaleDateString('vi-VN')
                  : 'Chưa làm';

                return (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 text-center text-slate-400 font-bold">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{s.name}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{s.email}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700">
                        {s.class_name || 'Lớp tự do'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      {sAttempts.length}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-blue-600">
                      {avgScore}
                    </td>
                    <td className="py-3.5 px-4 text-center font-extrabold text-emerald-600">
                      {maxScore}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{latestDate}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

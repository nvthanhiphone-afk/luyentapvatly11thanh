import React, { useState } from 'react';
import {
  Assignment,
  ClassRoom,
  Question,
  AssignmentStatus
} from '../../types';
import {
  Plus,
  Copy,
  Trash2,
  Edit3,
  Clock,
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Share2,
  FileSpreadsheet,
  Eye,
  Sliders,
  Layers
} from 'lucide-react';

interface AssignmentManagementProps {
  assignments: Assignment[];
  questions: Question[];
  classes: ClassRoom[];
  onSaveAssignment: (assignment: Assignment) => void;
  onDeleteAssignment: (id: string) => void;
  onDuplicateAssignment: (id: string) => void;
  onGoToExcelImport: () => void;
}

export const AssignmentManagement: React.FC<AssignmentManagementProps> = ({
  assignments,
  questions,
  classes,
  onSaveAssignment,
  onDeleteAssignment,
  onDuplicateAssignment,
  onGoToExcelImport,
}) => {
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filtered = assignments.filter(a => {
    if (filterStatus === 'ALL') return true;
    return a.status === filterStatus;
  });

  const handleToggleStatus = (asg: Assignment) => {
    let nextStatus: AssignmentStatus = 'OPEN';
    if (asg.status === 'OPEN') nextStatus = 'CLOSED';
    else if (asg.status === 'CLOSED') nextStatus = 'OPEN';
    else if (asg.status === 'UPCOMING') nextStatus = 'OPEN';
    else if (asg.status === 'DRAFT') nextStatus = 'OPEN';

    onSaveAssignment({
      ...asg,
      status: nextStatus,
    });
  };

  const handleCreateQuickDraft = () => {
    const newAsg: Assignment = {
      id: 'asg-' + Date.now(),
      title: 'Bài tập mới ' + new Date().toLocaleDateString('vi-VN'),
      topic: 'Chương I: Dao động',
      description: 'Mô tả bài tập...',
      duration: 30,
      max_attempts: 3,
      shuffle_questions: true,
      shuffle_answers: true,
      status: 'DRAFT',
      allowed_class_ids: [],
      show_solution_mode: 'IMMEDIATE',
      created_at: new Date().toISOString(),
    };
    onSaveAssignment(newAsg);
    setEditingAssignment(newAsg);
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-600" />
            <span>Quản Lý Danh Sách Bài Tập</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Tạo bài, bật/tắt quyền làm bài, gán lớp học, thời gian và số lượt làm bài
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onGoToExcelImport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 font-bold text-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            <span>Nhập đề từ Excel</span>
          </button>

          <button
            type="button"
            onClick={handleCreateQuickDraft}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo bài mới thủ công</span>
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {['ALL', 'OPEN', 'UPCOMING', 'CLOSED', 'DRAFT'].map(st => (
          <button
            key={st}
            type="button"
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filterStatus === st
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {st === 'ALL'
              ? `Tất cả (${assignments.length})`
              : st === 'OPEN'
              ? `Đang mở (${assignments.filter(a => a.status === 'OPEN').length})`
              : st === 'UPCOMING'
              ? `Chưa mở (${assignments.filter(a => a.status === 'UPCOMING').length})`
              : st === 'CLOSED'
              ? `Đã đóng (${assignments.filter(a => a.status === 'CLOSED').length})`
              : `Bản nháp (${assignments.filter(a => a.status === 'DRAFT').length})`}
          </button>
        ))}
      </div>

      {/* Assignment Table / List */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.map(asg => {
          const qCount = questions.filter(q => q.assignment_id === asg.id).length;
          const assignedClassNames = asg.allowed_class_ids.length > 0
            ? classes.filter(c => asg.allowed_class_ids.includes(c.id)).map(c => c.name).join(', ')
            : 'Tất cả các lớp';

          return (
            <div
              key={asg.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                    {asg.topic}
                  </span>

                  {/* Status badge */}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      asg.status === 'OPEN'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : asg.status === 'UPCOMING'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : asg.status === 'CLOSED'
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}
                  >
                    {asg.status === 'OPEN'
                      ? 'Đang mở'
                      : asg.status === 'UPCOMING'
                      ? 'Chưa mở'
                      : asg.status === 'CLOSED'
                      ? 'Đã đóng'
                      : 'Bản nháp'}
                  </span>

                  <span className="text-xs text-slate-400">
                    • Lớp: <strong className="text-slate-700">{assignedClassNames}</strong>
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 mb-1">{asg.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-1 mb-3">{asg.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                  <span>Số câu: <strong className="text-blue-600">{qCount} câu</strong></span>
                  <span>•</span>
                  <span>Thời gian: <strong>{asg.duration > 0 ? `${asg.duration} phút` : 'Không giới hạn'}</strong></span>
                  <span>•</span>
                  <span>Số lượt làm: <strong>{asg.max_attempts > 0 ? `${asg.max_attempts} lần` : 'Vô hạn'}</strong></span>
                  <span>•</span>
                  <span>Trộn đề: <strong>{asg.shuffle_questions ? 'Có' : 'Không'}</strong></span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(asg)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    asg.status === 'OPEN'
                      ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {asg.status === 'OPEN' ? 'Đóng bài' : 'Mở bài ngay'}
                </button>

                <button
                  type="button"
                  onClick={() => setEditingAssignment(asg)}
                  title="Sửa thông số bài tập"
                  className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onDuplicateAssignment(asg.id)}
                  title="Nhân bản bài tập này"
                  className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Bạn có chắc chắn muốn xóa bài tập "${asg.title}" và các câu hỏi liên quan?`)) {
                      onDeleteAssignment(asg.id);
                    }
                  }}
                  title="Xóa bài tập"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Assignment Modal */}
      {editingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-extrabold text-slate-900 mb-4">
              Chỉnh Sửa Bài Tập
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên bài tập</label>
                <input
                  type="text"
                  value={editingAssignment.title}
                  onChange={e => setEditingAssignment({ ...editingAssignment, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Chuyên đề</label>
                  <input
                    type="text"
                    value={editingAssignment.topic}
                    onChange={e => setEditingAssignment({ ...editingAssignment, topic: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Trạng thái</label>
                  <select
                    value={editingAssignment.status}
                    onChange={e => setEditingAssignment({ ...editingAssignment, status: e.target.value as AssignmentStatus })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="OPEN">Đang mở</option>
                    <option value="UPCOMING">Chưa mở</option>
                    <option value="CLOSED">Đã đóng</option>
                    <option value="DRAFT">Bản nháp</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Thời gian (phút)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingAssignment.duration}
                    onChange={e => setEditingAssignment({ ...editingAssignment, duration: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số lượt tối đa (0 = vô hạn)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingAssignment.max_attempts}
                    onChange={e => setEditingAssignment({ ...editingAssignment, max_attempts: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả bài tập</label>
                <textarea
                  rows={2}
                  value={editingAssignment.description}
                  onChange={e => setEditingAssignment({ ...editingAssignment, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingAssignment.shuffle_questions}
                    onChange={e => setEditingAssignment({ ...editingAssignment, shuffle_questions: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span>Trộn thứ tự câu hỏi</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingAssignment.shuffle_answers}
                    onChange={e => setEditingAssignment({ ...editingAssignment, shuffle_answers: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span>Trộn thứ tự đáp án (A, B, C, D)</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Giao cho lớp học nào? (để trống = tất cả các lớp)
                </label>
                <div className="flex flex-wrap gap-2">
                  {classes.map(c => {
                    const isChecked = editingAssignment.allowed_class_ids.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          const updated = isChecked
                            ? editingAssignment.allowed_class_ids.filter(id => id !== c.id)
                            : [...editingAssignment.allowed_class_ids, c.id];
                          setEditingAssignment({ ...editingAssignment, allowed_class_ids: updated });
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                          isChecked
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingAssignment(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  onSaveAssignment(editingAssignment);
                  setEditingAssignment(null);
                }}
                className="px-6 py-2 rounded-xl bg-indigo-600 text-white text-xs font-extrabold hover:bg-indigo-700 shadow-md cursor-pointer"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

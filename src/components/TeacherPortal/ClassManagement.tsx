import React, { useState } from 'react';
import { ClassRoom, StudentUser } from '../../types';
import { Plus, Users, School, Trash2, KeyRound, Check, Edit2 } from 'lucide-react';

interface ClassManagementProps {
  classes: ClassRoom[];
  students: StudentUser[];
  onSaveClass: (cls: ClassRoom) => void;
  onDeleteClass: (id: string) => void;
}

export const ClassManagement: React.FC<ClassManagementProps> = ({
  classes,
  students,
  onSaveClass,
  onDeleteClass,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [className, setClassName] = useState('');
  const [classCode, setClassCode] = useState('');
  const [description, setDescription] = useState('');
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim() || !classCode.trim()) return;

    if (editingClass) {
      onSaveClass({
        ...editingClass,
        name: className.trim(),
        code: classCode.trim().toUpperCase(),
        description: description.trim(),
      });
      setEditingClass(null);
    } else {
      onSaveClass({
        id: 'cls-' + Date.now(),
        name: className.trim(),
        code: classCode.trim().toUpperCase(),
        description: description.trim(),
        created_at: new Date().toISOString(),
      });
      setShowAddForm(false);
    }

    setClassName('');
    setClassCode('');
    setDescription('');
  };

  const handleStartEdit = (cls: ClassRoom) => {
    setEditingClass(cls);
    setClassName(cls.name);
    setClassCode(cls.code);
    setDescription(cls.description || '');
    setShowAddForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <School className="w-6 h-6 text-indigo-600" />
            <span>Quản Lý Lớp Học Vật Lý 11</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Tạo các lớp (Ví dụ: 11A1, 11A2, 11A3...), thiết lập mã lớp để học sinh nhập khi làm bài
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingClass(null);
            setClassName('');
            setClassCode('');
            setDescription('');
            setShowAddForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm lớp học mới</span>
        </button>
      </div>

      {/* Add / Edit Form Modal or Inline */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900">
            {editingClass ? 'Chỉnh sửa thông tin lớp' : 'Thêm lớp học mới'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tên lớp học *</label>
              <input
                type="text"
                placeholder="Ví dụ: Lớp 11A1"
                value={className}
                onChange={e => setClassName(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mã lớp (cho học sinh nhập) *</label>
              <input
                type="text"
                placeholder="Ví dụ: 11A1-2024"
                value={classCode}
                onChange={e => setClassCode(e.target.value.toUpperCase())}
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 uppercase font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả / Ghi chú</label>
              <input
                type="text"
                placeholder="Ví dụ: Chuyên Ban KHTN"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-extrabold hover:bg-indigo-700 shadow-sm cursor-pointer"
            >
              {editingClass ? 'Cập nhật' : 'Tạo lớp'}
            </button>
          </div>
        </form>
      )}

      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map(cls => {
          const studentCount = students.filter(s => s.class_id === cls.id).length;

          return (
            <div
              key={cls.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                    <School className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                    Mã: {cls.code}
                  </span>
                </div>

                <h3 className="font-extrabold text-lg text-slate-900 mb-1">{cls.name}</h3>
                <p className="text-xs text-slate-500 mb-4">{cls.description || 'Không có mô tả'}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-500" />
                  <strong>{studentCount}</strong> học sinh
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(cls)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Bạn có chắc muốn xóa lớp ${cls.name}?`)) {
                        onDeleteClass(cls.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { User, Mail, GraduationCap, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { ClassRoom, StudentUser } from '../../types';

interface StudentAuthFormProps {
  classes: ClassRoom[];
  initialStudent: StudentUser | null;
  onSubmit: (data: { name: string; email: string; class_id?: string; class_name?: string }) => void;
  onBack: () => void;
}

export const StudentAuthForm: React.FC<StudentAuthFormProps> = ({
  classes,
  initialStudent,
  onSubmit,
  onBack,
}) => {
  const [name, setName] = useState(initialStudent?.name || '');
  const [email, setEmail] = useState(initialStudent?.email || '');
  const [selectedClassId, setSelectedClassId] = useState(initialStudent?.class_id || (classes[0]?.id || ''));
  const [classCode, setClassCode] = useState('');
  const [isUsingCode, setIsUsingCode] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; classCode?: string }>({});

  useEffect(() => {
    if (initialStudent) {
      setName(initialStudent.name);
      setEmail(initialStudent.email);
      if (initialStudent.class_id) setSelectedClassId(initialStudent.class_id);
    }
  }, [initialStudent]);

  const validateEmail = (e: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; email?: string; classCode?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Vui lòng nhập họ và tên của bạn.';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Họ và tên quá ngắn.';
    }

    if (!email.trim()) {
      newErrors.email = 'Vui lòng nhập địa chỉ email.';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Email không đúng định dạng (Ví dụ: hocsinh@gmail.com).';
    }

    let resolvedClassId = selectedClassId;
    let resolvedClassName = classes.find(c => c.id === selectedClassId)?.name || 'Lớp tự do';

    if (isUsingCode) {
      if (!classCode.trim()) {
        newErrors.classCode = 'Vui lòng nhập mã lớp do giáo viên cung cấp.';
      } else {
        const matched = classes.find(c => c.code.toLowerCase() === classCode.trim().toLowerCase());
        if (matched) {
          resolvedClassId = matched.id;
          resolvedClassName = matched.name;
        } else {
          newErrors.classCode = 'Mã lớp không tồn tại. Vui lòng kiểm tra lại.';
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      class_id: resolvedClassId,
      class_name: resolvedClassName,
    });
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-12">
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
            <GraduationCap className="w-9 h-9" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Thông Tin Học Sinh
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Nhập thông tin để vào hệ thống làm bài tập Vật lý 11 Thầy Thành. <br />
            <span className="font-semibold text-blue-600">Không cần tạo mật khẩu</span>, hệ thống lưu tự động theo email.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Họ và tên học sinh <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                }}
                placeholder="Ví dụ: Nguyễn Văn An"
                className={`w-full pl-11 pr-4 py-3.5 rounded-xl border text-base transition-all outline-none ${
                  errors.name
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                    : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 bg-slate-50/50 focus:bg-white'
                }`}
              />
            </div>
            {errors.name && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.name}</p>}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Địa chỉ Email <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                }}
                placeholder="Ví dụ: vanan@gmail.com"
                className={`w-full pl-11 pr-4 py-3.5 rounded-xl border text-base transition-all outline-none ${
                  errors.email
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                    : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 bg-slate-50/50 focus:bg-white'
                }`}
              />
            </div>
            {errors.email && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.email}</p>}
            <p className="mt-1.5 text-xs text-slate-400">
              Dùng để lưu kết quả, điểm số và số lần bạn đã làm bài.
            </p>
          </div>

          {/* Class Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-slate-700">
                Lớp học / Mã lớp
              </label>
              <button
                type="button"
                onClick={() => setIsUsingCode(!isUsingCode)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                {isUsingCode ? '← Chọn từ danh sách lớp' : 'Nhập mã lớp riêng'}
              </button>
            </div>

            {!isUsingCode ? (
              <select
                value={selectedClassId}
                onChange={e => setSelectedClassId(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-base font-medium outline-none transition-all"
              >
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} {cls.description ? `(${cls.description})` : ''} - Mã: {cls.code}
                  </option>
                ))}
              </select>
            ) : (
              <div>
                <input
                  type="text"
                  value={classCode}
                  onChange={e => {
                    setClassCode(e.target.value);
                    if (errors.classCode) setErrors(prev => ({ ...prev, classCode: undefined }));
                  }}
                  placeholder="Nhập mã lớp (Ví dụ: 11A1-2024)"
                  className={`w-full px-4 py-3.5 rounded-xl border text-base transition-all outline-none uppercase font-mono ${
                    errors.classCode
                      ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 bg-slate-50/50 focus:bg-white'
                  }`}
                />
                {errors.classCode && (
                  <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.classCode}</p>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
          >
            <span>BẮT ĐẦU LÀM BÀI</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onBack}
            className="w-full py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Quay về trang chủ
          </button>
        </form>
      </div>
    </div>
  );
};

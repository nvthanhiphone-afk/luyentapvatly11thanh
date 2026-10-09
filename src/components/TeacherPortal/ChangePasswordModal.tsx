import React, { useState } from 'react';
import { Lock, KeyRound, Check, X, AlertCircle } from 'lucide-react';
import { updateTeacherPassword, verifyTeacherLogin } from '../../services/storage';

interface ChangePasswordModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ onClose, onSuccess }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsLoading(true);
    try {
      const isOldValid = await verifyTeacherLogin(oldPassword);
      if (!isOldValid) {
        setError('Mật khẩu hiện tại không đúng.');
        setIsLoading(false);
        return;
      }

      await updateTeacherPassword(newPassword);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError('Lỗi khi đổi mật khẩu: ' + message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900">
              Đổi Mật Khẩu Giáo Viên
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Mật khẩu hiện tại *</label>
            <input
              type="password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              placeholder="Nhập mật khẩu hiện tại"
              required
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Mật khẩu mới *</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              required
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Xác nhận mật khẩu mới *</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              required
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-indigo-600"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Đang cập nhật...' : 'Lưu Mật Khẩu Mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

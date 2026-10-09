import React, { useState } from 'react';
import { ShieldCheck, KeyRound, Lock, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';
import { verifyTeacherLogin } from '../../services/storage';

interface TeacherLoginProps {
  onLoginSuccess: (username: string) => void;
  onBack: () => void;
}

export const TeacherLogin: React.FC<TeacherLoginProps> = ({ onLoginSuccess, onBack }) => {
  const [username, setUsername] = useState('thaythanh');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const isValid = await verifyTeacherLogin(password);
      if (isValid) {
        onLoginSuccess(username);
      } else {
        setError('Mật khẩu không chính xác. Mật khẩu mặc định là: thaythanh2024');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError('Đã xảy ra lỗi khi xác thực: ' + message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setUsername('thaythanh');
    setPassword('thaythanh2024');
    setError(null);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Đăng Nhập Giáo Viên
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Hệ thống quản lý bài tập & phân tích điểm thi Vật lý 11
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Tài khoản giáo viên
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-semibold transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Mật khẩu quản trị
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-slate-400">
              Mật khẩu mặc định hệ thống: <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700 font-mono">thaythanh2024</code>
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/25 transition-all cursor-pointer disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isLoading ? 'Đang kiểm tra...' : 'ĐĂNG NHẬP QUẢN TRỊ'}</span>
          </button>

          {/* Quick Demo Button */}
          <button
            type="button"
            onClick={handleFillDemo}
            className="w-full py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Tự điền tài khoản mẫu (Kiểm thử nhanh)</span>
          </button>

          <button
            type="button"
            onClick={onBack}
            className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Quay về trang chủ
          </button>
        </form>
      </div>
    </div>
  );
};

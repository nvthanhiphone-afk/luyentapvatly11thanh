import React from 'react';
import {
  Atom,
  Trophy,
  HelpCircle,
  LogOut,
  User,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { StudentUser } from '../types';

interface HeaderProps {
  currentView: 'home' | 'student-login' | 'student-list' | 'student-exam' | 'student-result' | 'teacher-login' | 'teacher-dash';
  onNavigate: (view: 'home' | 'student-login' | 'student-list' | 'teacher-login' | 'teacher-dash') => void;
  currentStudent: StudentUser | null;
  isTeacherLoggedIn: boolean;
  onStudentLogout: () => void;
  onTeacherLogout: () => void;
  onOpenLeaderboard: () => void;
  onOpenTestingGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  currentStudent,
  isTeacherLoggedIn,
  onStudentLogout,
  onTeacherLogout,
  onOpenLeaderboard,
  onOpenTestingGuide,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Strictly compliant 3-zone Top Bar Contract: Brand - Nav Links - Primary Action */}
        <div className="flex items-center justify-between gap-8 h-18">
          {/* Zone 1: Brand Wordmark (single text element, single-line) */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Atom className="w-6 h-6 animate-[spin_16s_linear_infinite]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight whitespace-nowrap">
                VẬT LÝ 11
              </span>
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                Thầy Thành
              </span>
            </div>
          </div>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className={`hover:text-blue-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentView === 'home' ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              Trang chủ
            </button>

            <button
              type="button"
              onClick={() => {
                if (currentStudent) onNavigate('student-list');
                else onNavigate('student-login');
              }}
              className={`hover:text-blue-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                ['student-login', 'student-list', 'student-exam', 'student-result'].includes(currentView)
                  ? 'text-blue-600 font-semibold'
                  : ''
              }`}
            >
              Luyện tập trực tuyến
            </button>

            <button
              type="button"
              onClick={onOpenLeaderboard}
              className="hover:text-blue-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Bảng vàng</span>
            </button>

            <button
              type="button"
              onClick={onOpenTestingGuide}
              className="hover:text-blue-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span>Hướng dẫn & Kiểm thử</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action & Profile Control */}
          <div className="flex items-center gap-3 shrink-0">
            {/* If Teacher logged in */}
            {isTeacherLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate('teacher-dash')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    currentView === 'teacher-dash'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                  }`}
                >
                  Trang quản trị
                </button>
                <button
                  type="button"
                  onClick={onTeacherLogout}
                  title="Đăng xuất giáo viên"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : currentStudent ? (
              /* If Student logged in */
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate('student-list')}
                  className="text-right text-xs cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <div className="font-bold text-slate-800 truncate max-w-[120px]">
                    {currentStudent.name}
                  </div>
                  <div className="text-[11px] text-blue-600 font-medium">
                    {currentStudent.class_name || 'Học sinh'}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={onStudentLogout}
                  title="Đổi tài khoản học sinh"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Default state: Teacher Access CTA */
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate('teacher-login')}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Giáo viên</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('student-login')}
                  className="px-4.5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm hover:shadow-md whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Học sinh làm bài
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

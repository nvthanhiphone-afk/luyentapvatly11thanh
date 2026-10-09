import React from 'react';
import {
  BookOpen,
  ShieldCheck,
  Activity,
  Waves,
  Zap,
  BatteryCharging,
  ArrowRight,
  Trophy,
  Check,
  ChevronRight,
  Clock,
  Sparkles,
  FileText
} from 'lucide-react';
import { Assignment, ExamAttempt } from '../types';
import { PhysicsHarmonicVisualizer } from './PhysicsHarmonicVisualizer';

interface HomeViewProps {
  onStartStudent: (specificAssignmentId?: string) => void;
  onOpenTeacher: () => void;
  onOpenLeaderboard: () => void;
  assignments: Assignment[];
  attempts: ExamAttempt[];
}

export const HomeView: React.FC<HomeViewProps> = ({
  onStartStudent,
  onOpenTeacher,
  onOpenLeaderboard,
  assignments,
  attempts,
}) => {
  const openAssignments = assignments.filter(a => a.status === 'OPEN');
  const totalAttempts = attempts.length;
  const avgScore =
    attempts.length > 0
      ? (attempts.reduce((acc, curr) => acc + curr.score, 0) / attempts.length).toFixed(1)
      : '8.4';

  const chapterExamCards = [
    {
      id: 'asg-chuong-1',
      chapter: 'Chương I',
      title: 'Dao Động Điều Hòa & Sóng Dao Động',
      icon: Activity,
      color: 'blue',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      description: 'Phương trình li độ x = A·cos(ωt + φ), vận tốc, gia tốc, năng lượng dao động, con lắc lò xo, con lắc đơn và cộng hưởng cơ.',
      formula: 'x = A·cos(ωt + φ) · T = 2π√(l/g)',
    },
    {
      id: 'asg-chuong-2',
      chapter: 'Chương II',
      title: 'Sóng Cơ Học & Sóng Điện Từ',
      icon: Waves,
      color: 'sky',
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
      description: 'Đặc trưng sóng, bước sóng λ, phương trình sóng, hiện tượng giao thoa sóng, sóng dừng trên dây đàn hồi và thang sóng điện từ.',
      formula: 'λ = v/f · d₂ - d₁ = kλ',
    },
    {
      id: 'asg-chuong-3',
      chapter: 'Chương III',
      title: 'Điện Trường & Điện Thế',
      icon: Zap,
      color: 'amber',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      description: 'Định luật Coulomb, điện tích điểm, véc-tơ cường độ điện trường E, công lực điện, hiệu điện thế U và điện dung tụ điện C.',
      formula: 'F = k|q₁q₂|/r² · E = U/d · C = Q/U',
    },
    {
      id: 'asg-chuong-4',
      chapter: 'Chương IV',
      title: 'Dòng Điện Không Đổi & Mạch Điện',
      icon: BatteryCharging,
      color: 'emerald',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      description: 'Cường độ dòng điện, suất điện động E và điện trở trong r, định luật Ohm toàn mạch, ghép điện trở, công và công suất điện.',
      formula: 'I = E/(R_N + r) · P = U·I = I²·R',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex flex-col justify-between">
      {/* Hero Section with Split 2-Column Desktop Presence */}
      <section className="relative overflow-hidden pt-6 pb-12 lg:pt-10 lg:pb-16 border-b border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Editorial & Action Deck (7 cols) */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Clean domain kicker without pill box */}
              <div className="text-xs sm:text-sm font-semibold tracking-wide text-blue-700 flex items-center gap-2">
                <span>Chương trình GDPT 2018</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span>SGK Vật lý 11 Chuẩn Quốc gia</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="text-emerald-700 font-bold">Cập nhật ma trận mới</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-display text-3xl sm:text-5xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15] text-balance">
                LUYỆN TẬP VẬT LÝ 11 <br />
                <span className="text-blue-600">
                  THẦY THÀNH
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl text-balance">
                Hệ thống ôn luyện và kiểm tra trực tuyến toàn diện môn Vật lý 11. Đầy đủ đề thi 4 chương chuẩn 25 câu theo đúng định dạng mới của Bộ GD&ĐT: Trắc nghiệm 4 lựa chọn, Đúng/Sai 4 lệnh, Trả lời ngắn và Tự luận.
              </p>

              {/* 2 Big Prominent Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => onStartStudent()}
                  className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-display font-bold text-base sm:text-lg shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>HỌC SINH LÀM BÀI</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={onOpenTeacher}
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-white border border-slate-300 hover:border-indigo-600 hover:bg-indigo-50/40 text-slate-800 hover:text-indigo-700 font-display font-bold text-base sm:text-lg transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  <span>GIÁO VIÊN</span>
                </button>
              </div>

              {/* Natural Formula Badges without garish pills */}
              <div className="pt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono text-slate-500 border-t border-slate-100">
                <span className="text-slate-400 font-sans font-medium">Hệ thức Vật lý trọng tâm:</span>
                <span>x = A·cos(ωt + φ)</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span>λ = v / f</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span>I = E / (R + r)</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span>E = U / d</span>
              </div>
            </div>

            {/* Right Column: Interactive Sandbox Visualizer (5 cols) */}
            <div className="lg:col-span-5 w-full">
              <PhysicsHarmonicVisualizer />
            </div>
          </div>
        </div>
      </section>

      {/* KPI Metric Strip Below Hero */}
      <section className="bg-slate-50 border-b border-slate-200/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-2xl sm:text-3xl font-display font-black text-blue-600 tabular-nums">
                4 Đề Chuẩn
              </div>
              <div className="text-xs font-semibold text-slate-700 mt-1">Đủ 4 Chương Vật Lý 11</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Mỗi đề chuẩn 25 câu - 10 điểm</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-2xl sm:text-3xl font-display font-black text-indigo-600 tabular-nums">
                {totalAttempts}
              </div>
              <div className="text-xs font-semibold text-slate-700 mt-1">Lượt nộp bài thi</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Chấm tự động & lưu kết quả</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-2xl sm:text-3xl font-display font-black text-emerald-600 tabular-nums">
                {avgScore}<span className="text-base text-slate-400 font-normal">/10</span>
              </div>
              <div className="text-xs font-semibold text-slate-700 mt-1">Điểm số trung bình</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Thang điểm 10 chuẩn hóa</div>
            </div>

            <div
              onClick={onOpenLeaderboard}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-amber-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <div className="text-2xl sm:text-3xl font-display font-black text-amber-600 tabular-nums">
                  Top Điểm Cao
                </div>
                <Trophy className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-xs font-semibold text-slate-700 mt-1">Bảng vàng vinh danh</div>
              <div className="text-[11px] text-slate-400 mt-0.5 group-hover:text-amber-600 transition-colors">
                Xem bảng thành tích học sinh →
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured 4 Standard Chapter Exams (25 questions each, GDPT 2018 matrix) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-semibold tracking-wider text-blue-700 uppercase mb-1">
              BỘ ĐỀ ÔN TẬP TOÀN DIỆN MÔN VẬT LÝ 11
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              4 Đề Ôn Tập Chuẩn Theo Từng Chương (25 Câu - 10,0 Điểm)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Cấu trúc chuẩn: 16 câu trắc nghiệm (4,0đ) · 2 câu Đúng/Sai 4 lệnh (2,0đ) · 4 câu trả lời ngắn (1,0đ) · 3 câu tự luận (3,0đ). Ma trận: 40% Nhận biết, 30% Thông hiểu, 30% Vận dụng.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onStartStudent()}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>Xem tất cả bài tập</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {chapterExamCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 p-6 sm:p-7 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-blue-700 tracking-wide">
                          {card.chapter}
                        </span>
                        <div className="text-xs text-slate-400 font-mono">
                          50 phút · 25 câu hỏi · Thang 10đ
                        </div>
                      </div>
                    </div>

                    <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-semibold">
                      Đang mở thi
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                    {card.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                    {card.description}
                  </p>

                  {/* 4 Parts Specification Strip */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 mb-4 text-xs font-mono space-y-1">
                    <div className="flex items-center justify-between text-slate-700">
                      <span>• P.I: 16 câu trắc nghiệm (0,25đ/câu)</span>
                      <strong className="text-blue-700">4,0 điểm</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span>• P.II: 2 câu Đúng/Sai 4 lệnh (0,25đ/ý)</span>
                      <strong className="text-indigo-700">2,0 điểm</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span>• P.III: 4 câu trả lời ngắn (0,25đ/câu)</span>
                      <strong className="text-emerald-700">1,0 điểm</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span>• P.IV: 3 câu tự luận (1,0đ/câu)</span>
                      <strong className="text-purple-700">3,0 điểm</strong>
                    </div>
                  </div>

                  {/* Formula and Matrix Notice */}
                  <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500 mb-4 font-mono">
                    <span className="text-slate-400">Ma trận:</span>
                    <span>40% Nhận biết</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span>30% Thông hiểu</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span>30% Vận dụng</span>
                  </div>
                </div>

                {/* Card CTA */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">
                    {card.formula}
                  </span>

                  <button
                    type="button"
                    onClick={() => onStartStudent(card.id)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-display font-bold text-xs sm:text-sm shadow-2xs transition-all cursor-pointer"
                  >
                    <span>LÀM BÀI NGAY</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quiet Clean Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="font-semibold text-slate-800">
            LUYỆN TẬP VẬT LÝ 11 — THẦY THÀNH
          </div>
          <div className="text-slate-400">
            Hệ thống kiểm tra trực tuyến, giao bài tập và tự chấm điểm THPT
          </div>
        </div>
      </footer>
    </div>
  );
};

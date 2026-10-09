import React, { useState } from 'react';
import {
  Assignment,
  ClassRoom,
  ExamAttempt,
  Question,
  StudentUser,
  SystemSettings
} from '../../types';
import {
  LayoutDashboard,
  Layers,
  FileSpreadsheet,
  School,
  Users,
  Award,
  BarChart2,
  Download,
  Settings,
  TrendingUp,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  LogOut,
  Trophy,
  KeyRound,
  ShieldAlert,
  Save
} from 'lucide-react';
import { AssignmentManagement } from './AssignmentManagement';
import { ExcelUploadPanel } from './ExcelUploadPanel';
import { ClassManagement } from './ClassManagement';
import { StudentListPanel } from './StudentListPanel';
import { ResultsTablePanel } from './ResultsTablePanel';
import { QuestionStatsPanel } from './QuestionStatsPanel';
import { ChangePasswordModal } from './ChangePasswordModal';
import { exportResultsToExcel } from '../../services/excel';
import { resetAllDataToDefault } from '../../services/storage';

interface TeacherDashboardProps {
  assignments: Assignment[];
  questions: Question[];
  classes: ClassRoom[];
  students: StudentUser[];
  attempts: ExamAttempt[];
  settings: SystemSettings;
  onSaveAssignment: (asg: Assignment) => void;
  onDeleteAssignment: (id: string) => void;
  onDuplicateAssignment: (id: string) => void;
  onImportExcelSuccess: (asg: Assignment, questionCount: number) => void;
  onSaveClass: (cls: ClassRoom) => void;
  onDeleteClass: (id: string) => void;
  onUpdateSettings: (settings: SystemSettings) => void;
  onLogout: () => void;
  onRefreshData: () => void;
}

export type TeacherTab =
  | 'overview'
  | 'assignments'
  | 'excel'
  | 'classes'
  | 'students'
  | 'results'
  | 'stats'
  | 'export'
  | 'settings';

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  assignments,
  questions,
  classes,
  students,
  attempts,
  settings,
  onSaveAssignment,
  onDeleteAssignment,
  onDuplicateAssignment,
  onImportExcelSuccess,
  onSaveClass,
  onDeleteClass,
  onUpdateSettings,
  onLogout,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<TeacherTab>('overview');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // KPI Calculations (Section XXII)
  const uniqueStudentsCount = new Set(attempts.map(a => a.student_email.toLowerCase())).size || students.length;
  const totalAttemptsCount = attempts.length;
  const scores = attempts.map(a => a.score);
  const avgScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '0';
  const maxScore = scores.length > 0 ? Math.max(...scores).toFixed(1) : '0';
  const minScore = scores.length > 0 ? Math.min(...scores).toFixed(1) : '0';
  const passCount = scores.filter(s => s >= 5.0).length;
  const passRate = totalAttemptsCount > 0 ? Math.round((passCount / totalAttemptsCount) * 100) : 0;

  // Score distribution buckets (Section XXII)
  // 0 - <5; 5 - <6.5; 6.5 - <8; 8 - <9; 9 - 10
  const dist = {
    under5: scores.filter(s => s < 5.0).length,
    from5to65: scores.filter(s => s >= 5.0 && s < 6.5).length,
    from65to8: scores.filter(s => s >= 6.5 && s < 8.0).length,
    from8to9: scores.filter(s => s >= 8.0 && s < 9.0).length,
    from9to10: scores.filter(s => s >= 9.0).length,
  };

  const maxBucketCount = Math.max(1, dist.under5, dist.from5to65, dist.from65to8, dist.from8to9, dist.from9to10);

  const handleExportFullExcel = () => {
    exportResultsToExcel(attempts, assignments, questions);
    showToast('Đã xuất file Excel kết quả 3 sheet thành công!');
  };

  const handleResetData = async () => {
    if (confirm('Khôi phục toàn bộ dữ liệu về trạng thái mẫu ban đầu của SGK Vật lý 11?')) {
      await resetAllDataToDefault();
      onRefreshData();
      showToast('Đã khôi phục dữ liệu ban đầu!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Teacher Top Navigation Tabs (9 Menus as required in Section XIII) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-2 mb-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-3 pt-1">
          <div className="flex items-center gap-2">
            <span className="font-display font-extrabold text-sm text-slate-800">
              TRANG QUẢN TRỊ GIÁO VIÊN — THẦY THÀNH
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="text-xs font-bold text-slate-600 hover:text-indigo-600 px-3 py-1.5 rounded-xl hover:bg-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
              <span>Đổi mật khẩu</span>
            </button>
            <button
              onClick={onLogout}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-xl hover:bg-rose-50 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>

        {/* 9 Tabs Scrollable Container */}
        <div className="flex items-center gap-1 overflow-x-auto pt-2 scrollbar-none">
          {[
            { id: 'overview', label: '1. Tổng quan', icon: LayoutDashboard },
            { id: 'assignments', label: '2. Quản lý bài tập', icon: Layers },
            { id: 'excel', label: '3. Tải câu hỏi Excel', icon: FileSpreadsheet, highlight: true },
            { id: 'classes', label: '4. Quản lý lớp học', icon: School },
            { id: 'students', label: '5. Danh sách học sinh', icon: Users },
            { id: 'results', label: '6. Kết quả làm bài', icon: Award },
            { id: 'stats', label: '7. Thống kê câu hỏi', icon: BarChart2 },
            { id: 'export', label: '8. Xuất dữ liệu Excel', icon: Download },
            { id: 'settings', label: '9. Cài đặt', icon: Settings },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (tab.id === 'export') {
                    handleExportFullExcel();
                  } else {
                    setActiveTab(tab.id as TeacherTab);
                  }
                }}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs scale-102'
                    : tab.highlight
                    ? 'text-blue-700 bg-blue-50/70 hover:bg-blue-100 font-extrabold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.highlight ? 'text-blue-600' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT */}

      {/* 1. TỔNG QUAN (Dashboard Overview - Section XXII) */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* Card 1: Học sinh */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="text-xs uppercase font-extrabold text-slate-400">SỐ HỌC SINH</div>
              <div className="text-2xl sm:text-3xl font-display font-black text-blue-600 mt-2 tabular-nums">{uniqueStudentsCount}</div>
              <div className="text-[11px] text-slate-500 mt-1">Đã tham gia làm bài</div>
            </div>

            {/* Card 2: Số lượt làm bài */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="text-xs uppercase font-extrabold text-slate-400">SỐ LƯỢT LÀM</div>
              <div className="text-2xl sm:text-3xl font-display font-black text-indigo-600 mt-2 tabular-nums">{totalAttemptsCount}</div>
              <div className="text-[11px] text-slate-500 mt-1">Lượt nộp bài chính thức</div>
            </div>

            {/* Card 3: Điểm trung bình */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="text-xs uppercase font-extrabold text-slate-400">ĐIỂM TRUNG BÌNH</div>
              <div className="text-2xl sm:text-3xl font-display font-black text-emerald-600 mt-2 tabular-nums">{avgScore}</div>
              <div className="text-[11px] text-slate-500 mt-1">Thang điểm 10</div>
            </div>

            {/* Card 4: Điểm cao nhất */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="text-xs uppercase font-extrabold text-slate-400">ĐIỂM CAO NHẤT</div>
              <div className="text-2xl sm:text-3xl font-display font-black text-purple-600 mt-2 tabular-nums">{maxScore}</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">Thành tích xuất sắc</div>
            </div>

            {/* Card 5: Điểm thấp nhất */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="text-xs uppercase font-extrabold text-slate-400">ĐIỂM THẤP NHẤT</div>
              <div className="text-2xl sm:text-3xl font-display font-black text-amber-600 mt-2 tabular-nums">{minScore}</div>
              <div className="text-[11px] text-slate-500 mt-1">Cần bổ trợ thêm</div>
            </div>

            {/* Card 6: Tỷ lệ đạt */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="text-xs uppercase font-extrabold text-slate-400">TỶ LỆ ĐẠT (≥5)</div>
              <div className="text-2xl sm:text-3xl font-display font-black text-teal-600 mt-2 tabular-nums">{passRate}%</div>
              <div className="text-[11px] text-teal-700 font-semibold mt-1">{passCount}/{totalAttemptsCount} lượt đạt</div>
            </div>
          </div>

          {/* Score Distribution Chart as required in Section XXII */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">
                  Biểu Đồ Phân Bố Phổ Điểm (5 Dải Điểm Chuẩn)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Theo dõi sự phân bố điểm số của toàn bộ học sinh để đánh giá mức độ đồng đều
                </p>
              </div>

              <div className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
                Tổng: {totalAttemptsCount} bài thi
              </div>
            </div>

            {/* Visual Bar Chart */}
            <div className="space-y-4 max-w-3xl">
              {[
                { label: '0 – < 5,0 (Chưa đạt / Cần luyện thêm)', count: dist.under5, color: 'bg-rose-500', textCol: 'text-rose-600' },
                { label: '5,0 – < 6,5 (Đạt / Trung bình)', count: dist.from5to65, color: 'bg-amber-500', textCol: 'text-amber-600' },
                { label: '6,5 – < 8,0 (Khá)', count: dist.from65to8, color: 'bg-blue-500', textCol: 'text-blue-600' },
                { label: '8,0 – < 9,0 (Rất tốt / Giỏi)', count: dist.from8to9, color: 'bg-indigo-500', textCol: 'text-indigo-600' },
                { label: '9,0 – 10,0 (Xuất sắc)', count: dist.from9to10, color: 'bg-emerald-500', textCol: 'text-emerald-600' },
              ].map((item, idx) => {
                const percentage = totalAttemptsCount > 0 ? Math.round((item.count / totalAttemptsCount) * 100) : 0;
                const barWidth = maxBucketCount > 0 ? Math.max(6, Math.round((item.count / maxBucketCount) * 100)) : 0;

                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>{item.label}</span>
                      <span className={item.textCol}>
                        {item.count} lượt ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-6 rounded-xl overflow-hidden p-0.5">
                      <div
                        className={`${item.color} h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2 text-[11px] font-black text-white`}
                        style={{ width: `${barWidth}%` }}
                      >
                        {item.count > 0 ? item.count : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => setActiveTab('excel')}
              className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 hover:shadow-md cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <FileSpreadsheet className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
                <h4 className="font-extrabold text-sm text-slate-900">Tải Đề Excel Mới</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tải file .xlsx có nhiều sheet hoặc dùng tệp thử nghiệm 12 câu để giao ngay cho học sinh.
              </p>
            </div>

            <div
              onClick={() => setActiveTab('results')}
              className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 hover:shadow-md cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform" />
                <h4 className="font-extrabold text-sm text-slate-900">Xem Bảng Điểm Thi</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tìm kiếm theo học sinh, lọc theo lớp, xem chi tiết bài làm đúng sai của từng em.
              </p>
            </div>

            <div
              onClick={handleExportFullExcel}
              className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 hover:shadow-md cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <Download className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform" />
                <h4 className="font-extrabold text-sm text-slate-900">Xuất Kết Quả Excel</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tự động tạo file .xlsx 3 sheet đầy đủ (KET_QUA, TONG_HOP, THONG_KE_CAU_HOI).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. QUẢN LÝ BÀI TẬP */}
      {activeTab === 'assignments' && (
        <AssignmentManagement
          assignments={assignments}
          questions={questions}
          classes={classes}
          onSaveAssignment={onSaveAssignment}
          onDeleteAssignment={onDeleteAssignment}
          onDuplicateAssignment={onDuplicateAssignment}
          onGoToExcelImport={() => setActiveTab('excel')}
        />
      )}

      {/* 3. TẢI CÂU HỎI EXCEL */}
      {activeTab === 'excel' && (
        <ExcelUploadPanel
          classes={classes}
          onImportComplete={(newAsg, count) => {
            onImportExcelSuccess(newAsg, count);
            showToast(`Đã nhập thành công bài tập "${newAsg.title}" với ${count} câu hỏi!`);
            setActiveTab('assignments');
          }}
        />
      )}

      {/* 4. QUẢN LÝ LỚP HỌC */}
      {activeTab === 'classes' && (
        <ClassManagement
          classes={classes}
          students={students}
          onSaveClass={onSaveClass}
          onDeleteClass={onDeleteClass}
        />
      )}

      {/* 5. DANH SÁCH HỌC SINH */}
      {activeTab === 'students' && (
        <StudentListPanel
          students={students}
          classes={classes}
          attempts={attempts}
        />
      )}

      {/* 6. KẾT QUẢ LÀM BÀI */}
      {activeTab === 'results' && (
        <ResultsTablePanel
          attempts={attempts}
          assignments={assignments}
          classes={classes}
          questions={questions}
          onExportExcel={handleExportFullExcel}
        />
      )}

      {/* 7. THỐNG KÊ CÂU HỎI */}
      {activeTab === 'stats' && (
        <QuestionStatsPanel
          assignments={assignments}
          questions={questions}
          attempts={attempts}
        />
      )}

      {/* 9. CÀI ĐẶT */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 max-w-2xl">
          <h3 className="font-black text-lg text-slate-900 border-b border-slate-100 pb-3">
            Cài Đặt Hệ Thống & Bảo Mật
          </h3>

          <div className="space-y-4 text-xs font-semibold">
            {/* Setting 1: Leaderboard toggle (Section XXIV) */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <div className="text-sm font-bold text-slate-800">
                  Hiển thị Bảng xếp hạng Top học sinh
                </div>
                <div className="text-slate-500 text-xs mt-0.5">
                  Cho phép học sinh xem top 10 điểm cao nhất (chỉ hiện Họ tên và Điểm, bảo mật email).
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.leaderboard_enabled}
                onChange={e => onUpdateSettings({ ...settings, leaderboard_enabled: e.target.checked })}
                className="w-5 h-5 text-indigo-600 rounded cursor-pointer"
              />
            </div>

            {/* Change Password */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <div className="text-sm font-bold text-slate-800">
                  Mật khẩu tài khoản giáo viên
                </div>
                <div className="text-slate-500 text-xs mt-0.5">
                  Mật khẩu được mã hóa SHA-256 an toàn. Đổi mật khẩu định kỳ để bảo vệ dữ liệu đề thi.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordModal(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Đổi mật khẩu
              </button>
            </div>

            {/* Reset data */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-50/50 border border-rose-200">
              <div>
                <div className="text-sm font-bold text-rose-900">
                  Khôi phục dữ liệu mẫu SGK Vật lý 11
                </div>
                <div className="text-rose-700 text-xs mt-0.5">
                  Xóa các bài thi thử nghiệm và đặt lại dữ liệu gốc ban đầu.
                </div>
              </div>
              <button
                type="button"
                onClick={handleResetData}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Khôi phục gốc
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <ChangePasswordModal
          onClose={() => setShowPasswordModal(false)}
          onSuccess={() => showToast('Đã đổi mật khẩu giáo viên thành công!')}
        />
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Assignment,
  ClassRoom,
  ExamAttempt,
  Question,
  StudentUser,
  SystemSettings
} from './types';
import {
  getAssignments,
  getClasses,
  getCurrentStudent,
  getQuestions,
  getSettings,
  getAttempts,
  getStudents,
  initializeStorage,
  saveAssignment,
  saveAttempt,
  saveClass,
  saveOrUpdateStudent,
  saveQuestions,
  saveSettings,
  setCurrentStudent,
  deleteAssignment,
  deleteClass,
  getQuestionsByAssignmentId
} from './services/storage';
import {
  clearTeacherSession,
  getTeacherSession,
  setTeacherSession
} from './services/auth';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { StudentAuthForm } from './components/StudentPortal/StudentAuthForm';
import { StudentAssignmentList } from './components/StudentPortal/StudentAssignmentList';
import { StudentExamTaking } from './components/StudentPortal/StudentExamTaking';
import { StudentExamResult } from './components/StudentPortal/StudentExamResult';
import { TeacherLogin } from './components/TeacherPortal/TeacherLogin';
import { TeacherDashboard } from './components/TeacherPortal/TeacherDashboard';
import { LeaderboardModal } from './components/LeaderboardModal';
import { TestingGuideModal } from './components/TestingGuideModal';

type AppView =
  | 'home'
  | 'student-login'
  | 'student-list'
  | 'student-exam'
  | 'student-result'
  | 'teacher-login'
  | 'teacher-dash';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({
    app_name: 'LUYỆN TẬP VẬT LÝ 11',
    teacher_name: 'Thầy Thành',
    leaderboard_enabled: true,
    require_class_code: false,
  });

  const [currentStudent, setCurrentStudentState] = useState<StudentUser | null>(null);
  const [isTeacherLoggedIn, setIsTeacherLoggedIn] = useState(false);

  // Active exam state
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(null);
  const [activeAttemptNumber, setActiveAttemptNumber] = useState<number>(1);
  const [latestAttempt, setLatestAttempt] = useState<ExamAttempt | null>(null);

  // Modals
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showTestingGuide, setShowTestingGuide] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    async function init() {
      await initializeStorage();
      reloadAllData();

      const student = getCurrentStudent();
      if (student) setCurrentStudentState(student);

      const teacherSession = getTeacherSession();
      if (teacherSession?.loggedIn) {
        setIsTeacherLoggedIn(true);
      }
    }
    init();
  }, []);

  const reloadAllData = () => {
    setAssignments(getAssignments());
    setQuestions(getQuestions());
    setClasses(getClasses());
    setStudents(getStudents());
    setAttempts(getAttempts());
    setSettings(getSettings());
  };

  // Pending target assignment when navigating from home card
  const [pendingAssignmentId, setPendingAssignmentId] = useState<string | null>(null);

  // Student auth flow
  const handleStudentSubmit = (data: { name: string; email: string; class_id?: string; class_name?: string }) => {
    const student = saveOrUpdateStudent(data);
    setCurrentStudentState(student);
    reloadAllData();

    if (pendingAssignmentId) {
      const targetId = pendingAssignmentId;
      setPendingAssignmentId(null);
      const previousAttempts = attempts.filter(
        a =>
          a.assignment_id === targetId &&
          a.student_email.toLowerCase() === student.email.toLowerCase()
      );
      setActiveAssignmentId(targetId);
      setActiveAttemptNumber(previousAttempts.length + 1);
      setCurrentView('student-exam');
    } else {
      setCurrentView('student-list');
    }
  };

  const handleStudentLogout = () => {
    setCurrentStudent(null);
    setCurrentStudentState(null);
    setCurrentView('home');
  };

  // Exam flow
  const handleStartExam = (assignmentId: string) => {
    if (!currentStudent) {
      setCurrentView('student-login');
      return;
    }

    const previousAttempts = attempts.filter(
      a =>
        a.assignment_id === assignmentId &&
        a.student_email.toLowerCase() === currentStudent.email.toLowerCase()
    );

    setActiveAssignmentId(assignmentId);
    setActiveAttemptNumber(previousAttempts.length + 1);
    setCurrentView('student-exam');
  };

  const handleExamSubmit = (attempt: ExamAttempt) => {
    saveAttempt(attempt);
    reloadAllData();
    setLatestAttempt(attempt);
    setCurrentView('student-result');
  };

  const handleViewPreviousResult = (attempt: ExamAttempt) => {
    setLatestAttempt(attempt);
    setActiveAssignmentId(attempt.assignment_id);
    setCurrentView('student-result');
  };

  const handleRetakeExam = () => {
    if (activeAssignmentId) {
      handleStartExam(activeAssignmentId);
    } else {
      setCurrentView('student-list');
    }
  };

  // Teacher auth flow
  const handleTeacherLoginSuccess = (username: string) => {
    setTeacherSession(username);
    setIsTeacherLoggedIn(true);
    setCurrentView('teacher-dash');
  };

  const handleTeacherLogout = () => {
    clearTeacherSession();
    setIsTeacherLoggedIn(false);
    setCurrentView('home');
  };

  // Teacher management handlers
  const handleSaveAssignment = (asg: Assignment) => {
    saveAssignment(asg);
    reloadAllData();
  };

  const handleDeleteAssignment = (id: string) => {
    deleteAssignment(id);
    reloadAllData();
  };

  const handleDuplicateAssignment = (id: string) => {
    const original = assignments.find(a => a.id === id);
    if (!original) return;

    const newId = 'asg-' + Date.now();
    const duplicated: Assignment = {
      ...original,
      id: newId,
      title: `${original.title} (Bản sao)`,
      status: 'DRAFT',
      created_at: new Date().toISOString(),
    };
    saveAssignment(duplicated);

    const origQuestions = getQuestionsByAssignmentId(id);
    const duplicatedQuestions: Question[] = origQuestions.map((q, idx) => ({
      ...q,
      id: `q-${newId}-${idx + 1}`,
      assignment_id: newId,
    }));
    saveQuestions(duplicatedQuestions);

    reloadAllData();
  };

  const handleImportExcelSuccess = (newAsg: Assignment, questionCount: number) => {
    saveAssignment(newAsg);
    // Questions are saved inside convertParsedToAssignment or via storage
    // Ensure questions are persisted
    if (newAsg.questions && newAsg.questions.length > 0) {
      saveQuestions(newAsg.questions);
    }
    reloadAllData();
  };

  const handleSaveClass = (cls: ClassRoom) => {
    saveClass(cls);
    reloadAllData();
  };

  const handleDeleteClass = (id: string) => {
    deleteClass(id);
    reloadAllData();
  };

  const handleUpdateSettings = (newSettings: SystemSettings) => {
    saveSettings(newSettings);
    setSettings(newSettings);
  };

  // Selected assignment object for active exam
  const currentAssignment = activeAssignmentId
    ? assignments.find(a => a.id === activeAssignmentId) || assignments[0]
    : null;

  const currentExamQuestions = activeAssignmentId
    ? getQuestionsByAssignmentId(activeAssignmentId)
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-blue-500 selection:text-white">
      {/* Universal Header (hidden only during active full-screen exam for focus) */}
      {currentView !== 'student-exam' && (
        <Header
          currentView={currentView}
          onNavigate={view => {
            if (view === 'student-list' && !currentStudent) {
              setCurrentView('student-login');
            } else {
              setCurrentView(view);
            }
          }}
          currentStudent={currentStudent}
          isTeacherLoggedIn={isTeacherLoggedIn}
          onStudentLogout={handleStudentLogout}
          onTeacherLogout={handleTeacherLogout}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onOpenTestingGuide={() => setShowTestingGuide(true)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {/* VIEW 1: TRANG CHỦ */}
        {currentView === 'home' && (
          <HomeView
            assignments={assignments}
            attempts={attempts}
            onStartStudent={(specificAssignmentId?: string) => {
              if (specificAssignmentId) {
                if (currentStudent) {
                  handleStartExam(specificAssignmentId);
                } else {
                  setPendingAssignmentId(specificAssignmentId);
                  setCurrentView('student-login');
                }
              } else {
                if (currentStudent) {
                  setCurrentView('student-list');
                } else {
                  setCurrentView('student-login');
                }
              }
            }}
            onOpenTeacher={() => {
              if (isTeacherLoggedIn) {
                setCurrentView('teacher-dash');
              } else {
                setCurrentView('teacher-login');
              }
            }}
            onOpenLeaderboard={() => setShowLeaderboard(true)}
          />
        )}

        {/* VIEW 2: TRANG HỌC SINH - ĐĂNG NHẬP / NHẬP THÔNG TIN */}
        {currentView === 'student-login' && (
          <StudentAuthForm
            classes={classes}
            initialStudent={currentStudent}
            onSubmit={handleStudentSubmit}
            onBack={() => setCurrentView('home')}
          />
        )}

        {/* VIEW 3: DANH SÁCH BÀI TẬP CỦA HỌC SINH */}
        {currentView === 'student-list' && currentStudent && (
          <StudentAssignmentList
            student={currentStudent}
            assignments={assignments}
            questions={questions}
            attempts={attempts}
            onStartExam={handleStartExam}
            onViewPreviousResult={handleViewPreviousResult}
            onChangeStudent={() => setCurrentView('student-login')}
          />
        )}

        {/* VIEW 4: GIAO DIỆN LÀM BÀI THI TRỰC TUYẾN */}
        {currentView === 'student-exam' && currentAssignment && currentStudent && (
          <StudentExamTaking
            assignment={currentAssignment}
            questions={currentExamQuestions}
            student={currentStudent}
            attemptNumber={activeAttemptNumber}
            onSubmitExam={handleExamSubmit}
            onCancelExam={() => setCurrentView('student-list')}
          />
        )}

        {/* VIEW 5: KẾT QUẢ BÀI LÀM & LỜI GIẢI CHI TIẾT */}
        {currentView === 'student-result' && latestAttempt && currentAssignment && currentStudent && (
          <StudentExamResult
            attempt={latestAttempt}
            assignment={currentAssignment}
            questions={getQuestionsByAssignmentId(latestAttempt.assignment_id)}
            student={currentStudent}
            totalAttemptsCount={
              attempts.filter(
                a =>
                  a.assignment_id === latestAttempt.assignment_id &&
                  a.student_email.toLowerCase() === currentStudent.email.toLowerCase()
              ).length
            }
            onRetake={handleRetakeExam}
            onBackToList={() => setCurrentView('student-list')}
          />
        )}

        {/* VIEW 6: ĐĂNG NHẬP GIÁO VIÊN */}
        {currentView === 'teacher-login' && (
          <TeacherLogin
            onLoginSuccess={handleTeacherLoginSuccess}
            onBack={() => setCurrentView('home')}
          />
        )}

        {/* VIEW 7: TRANG QUẢN TRỊ GIÁO VIÊN */}
        {currentView === 'teacher-dash' && isTeacherLoggedIn && (
          <TeacherDashboard
            assignments={assignments}
            questions={questions}
            classes={classes}
            students={students}
            attempts={attempts}
            settings={settings}
            onSaveAssignment={handleSaveAssignment}
            onDeleteAssignment={handleDeleteAssignment}
            onDuplicateAssignment={handleDuplicateAssignment}
            onImportExcelSuccess={handleImportExcelSuccess}
            onSaveClass={handleSaveClass}
            onDeleteClass={handleDeleteClass}
            onUpdateSettings={handleUpdateSettings}
            onLogout={handleTeacherLogout}
            onRefreshData={reloadAllData}
          />
        )}
      </main>

      {/* Global Modals */}
      {showLeaderboard && (
        <LeaderboardModal
          attempts={attempts}
          assignments={assignments}
          settings={settings}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      {showTestingGuide && (
        <TestingGuideModal
          onClose={() => setShowTestingGuide(false)}
          onNavigateToTeacher={() => {
            if (isTeacherLoggedIn) setCurrentView('teacher-dash');
            else setCurrentView('teacher-login');
          }}
          onNavigateToStudent={() => {
            if (currentStudent) setCurrentView('student-list');
            else setCurrentView('student-login');
          }}
        />
      )}
    </div>
  );
}

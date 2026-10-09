export type QuestionType = 'MCQ' | 'TRUEFALSE' | 'TEXT' | 'ESSAY';
export type CognitiveLevel = 'NHAN_BIET' | 'THONG_HIEU' | 'VAN_DUNG';

export interface TrueFalseItem {
  id: 'a' | 'b' | 'c' | 'd';
  statement: string;
  correct_answer: 'Đúng' | 'Sai';
  explanation?: string;
}

export interface Question {
  id: string;
  assignment_id: string;
  question_type: QuestionType;
  cognitive_level?: CognitiveLevel;
  question_text: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  sub_items?: TrueFalseItem[];
  correct_answer: string; // 'A'|'B'|'C'|'D' or 'Đúng'|'Sai' or string for TEXT or sample essay key
  explanation: string;
  rubric?: string;
  score: number;
  order_index: number;
}

export type AssignmentStatus = 'OPEN' | 'UPCOMING' | 'CLOSED' | 'DRAFT';

export interface Assignment {
  id: string;
  title: string;
  topic: string;
  description: string;
  duration: number; // minutes (0 for unlimited)
  max_attempts: number; // 0 for unlimited, or 1, 2, 3...
  shuffle_questions: boolean;
  shuffle_answers: boolean;
  start_time?: string; // ISO date string
  end_time?: string; // ISO date string
  status: AssignmentStatus;
  allowed_class_ids: string[]; // empty means all classes
  show_solution_mode: 'IMMEDIATE' | 'SCORE_ONLY' | 'AFTER_END';
  created_at: string;
  questions?: Question[];
}

export interface ClassRoom {
  id: string;
  name: string;
  code: string;
  description?: string;
  created_at: string;
}

export interface StudentUser {
  id: string;
  name: string;
  email: string;
  class_id?: string;
  class_name?: string;
  created_at: string;
}

export interface StudentAnswer {
  question_id: string;
  student_answer: string;
  is_correct: boolean;
  is_flagged?: boolean;
}

export interface ExamAttempt {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  student_class: string;
  assignment_id: string;
  assignment_title: string;
  attempt_number: number;
  correct_count: number;
  wrong_count: number;
  unanswered_count: number;
  total_questions: number;
  score: number; // on 10-point scale
  started_at: string;
  submitted_at: string;
  time_spent_seconds: number;
  answers: Record<string, string>; // questionId -> answer string
  flags: Record<string, boolean>; // questionId -> isFlagged
  is_submitted: boolean;
}

export interface SystemSettings {
  app_name: string;
  teacher_name: string;
  leaderboard_enabled: boolean;
  require_class_code: boolean;
}

export interface TeacherAuth {
  username: string;
  password_hash: string;
  salt: string;
  updated_at: string;
}

export interface ExcelValidationError {
  row: number;
  field: string;
  message: string;
  level: 'error' | 'warning';
}

export interface ParsedAssignmentInfo {
  title: string;
  topic: string;
  description: string;
  duration: number;
  max_attempts: number;
  shuffle_questions: boolean;
  shuffle_answers: boolean;
  start_time?: string;
  end_time?: string;
}

export interface ParsedQuestionRow {
  row_num: number;
  stt: number;
  type: QuestionType;
  cognitive_level?: CognitiveLevel;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
  score: number;
}

export interface ExcelParseResult {
  isValid: boolean;
  errors: ExcelValidationError[];
  warnings: ExcelValidationError[];
  info: ParsedAssignmentInfo;
  questions: ParsedQuestionRow[];
}

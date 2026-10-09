import {
  Assignment,
  ClassRoom,
  ExamAttempt,
  Question,
  QuestionType,
  StudentUser,
  SystemSettings,
  TeacherAuth,
} from '../types';
import { generateSalt, hashPassword } from './auth';
import { ALL_CHAPTER_EXAMS } from '../data/physicsExamsData';

const STORAGE_KEYS = {
  ASSIGNMENTS: 'vl11_assignments',
  QUESTIONS: 'vl11_questions',
  CLASSES: 'vl11_classes',
  USERS: 'vl11_users',
  ATTEMPTS: 'vl11_attempts',
  SETTINGS: 'vl11_settings',
  TEACHER_AUTH: 'vl11_teacher_auth',
  CURRENT_STUDENT: 'vl11_current_student',
  ACTIVE_EXAM_DRAFT: 'vl11_exam_draft',
};

// 4 Standard Chapter Exams (25 questions each, 100 questions total, GDPT 2018 format)
export const STANDARD_CHAPTER_ASSIGNMENTS: Assignment[] = ALL_CHAPTER_EXAMS.map(item => item.assignment);
export const STANDARD_CHAPTER_QUESTIONS: Question[] = ALL_CHAPTER_EXAMS.flatMap(item => item.questions);

// Initial Seed Classes
const INITIAL_CLASSES: ClassRoom[] = [
  { id: 'cls-11a1', name: 'Lớp 11A1', code: '11A1-2024', description: 'Chuyên Ban KHTN 1', created_at: '2026-09-01T08:00:00Z' },
  { id: 'cls-11a2', name: 'Lớp 11A2', code: '11A2-2024', description: 'Chuyên Ban KHTN 2', created_at: '2026-09-01T08:00:00Z' },
  { id: 'cls-11a3', name: 'Lớp 11A3', code: '11A3-2024', description: 'Lớp Tiêu chuẩn', created_at: '2026-09-01T08:00:00Z' },
];

// Initial Assignments prioritizing the 4 comprehensive chapter exams
const INITIAL_ASSIGNMENTS: Assignment[] = [
  ...STANDARD_CHAPTER_ASSIGNMENTS,
  {
    id: 'asg-01',
    title: 'Chuyên đề 11 – Luyện tập nhanh Dao động điều hòa (12 câu)',
    topic: 'Chương I: Dao động',
    description: 'Bài tập khởi động nhanh các đại lượng đặc trưng, phương trình li độ, vận tốc và gia tốc dao động điều hòa.',
    duration: 20,
    max_attempts: 3,
    shuffle_questions: true,
    shuffle_answers: true,
    status: 'OPEN',
    allowed_class_ids: [],
    show_solution_mode: 'IMMEDIATE',
    created_at: '2026-09-10T08:00:00Z',
  },
  {
    id: 'asg-02',
    title: 'Chuyên đề 11 – Luyện tập nhanh Sóng cơ & Giao thoa sóng',
    topic: 'Chương II: Sóng',
    description: 'Khảo sát bước sóng, chu kì truyền sóng, hiện tượng giao thoa sóng và sóng dừng trên dây.',
    duration: 25,
    max_attempts: 2,
    shuffle_questions: true,
    shuffle_answers: true,
    status: 'OPEN',
    allowed_class_ids: [],
    show_solution_mode: 'IMMEDIATE',
    created_at: '2026-09-15T08:00:00Z',
  },
];

// 12 Authentic Questions for quick starter practice (Section XXX test specifications)
// 8 MCQ, 2 TEXT, 2 TRUEFALSE
const QUICK_PRACTICE_QUESTIONS: Question[] = [
  // --- Assignment 1: 12 Questions (8 MCQ, 2 TEXT, 2 TRUEFALSE) ---
  {
    id: 'q-01-01',
    assignment_id: 'asg-01',
    question_type: 'MCQ',
    question_text: 'Một chất điểm dao động điều hoà có quỹ đạo là một đoạn thẳng dài 10 cm. Biên độ dao động của chất điểm là:',
    option_a: '5 cm',
    option_b: '-5 cm',
    option_c: '10 cm',
    option_d: '-10 cm',
    correct_answer: 'A',
    explanation: 'Chiều dài quỹ đạo dao động L = 2A = 10 cm. Do đó biên độ A = L / 2 = 5 cm (biên độ luôn là đại lượng dương).',
    score: 1,
    order_index: 1,
  },
  {
    id: 'q-01-02',
    assignment_id: 'asg-01',
    question_type: 'MCQ',
    question_text: 'Một chất điểm dao động điều hoà trong 10 dao động toàn phần đi được quãng đường dài 120 cm. Quỹ đạo dao động của vật có chiều dài là:',
    option_a: '6 cm',
    option_b: '12 cm',
    option_c: '3 cm',
    option_d: '9 cm',
    correct_answer: 'A',
    explanation: 'Trong mỗi chu kỳ (1 dao động toàn phần), vật đi được quãng đường s = 4A. Vậy trong 10 chu kỳ s = 10 × 4A = 40A = 120 cm ⇒ A = 3 cm. Chiều dài quỹ đạo L = 2A = 6 cm.',
    score: 1,
    order_index: 2,
  },
  {
    id: 'q-01-03',
    assignment_id: 'asg-01',
    question_type: 'MCQ',
    question_text: 'Một chất điểm dao động điều hoà với phương trình x = 5cos(10πt + π/3) (cm). Li độ của chất điểm khi pha dao động bằng π là:',
    option_a: '5 cm',
    option_b: '-5 cm',
    option_c: '2,5 cm',
    option_d: '-2,5 cm',
    correct_answer: 'B',
    explanation: 'Pha dao động là (10πt + π/3) = π. Thay vào phương trình ta được x = 5cos(π) = 5 × (-1) = -5 cm.',
    score: 1,
    order_index: 3,
  },
  {
    id: 'q-01-04',
    assignment_id: 'asg-01',
    question_type: 'MCQ',
    question_text: 'Một chất điểm dao động điều hoà có chu kì T = 1 s. Tần số góc ω của dao động là:',
    option_a: 'π rad/s',
    option_b: '2π rad/s',
    option_c: '1 rad/s',
    option_d: '2 rad/s',
    correct_answer: 'B',
    explanation: 'Công thức liên hệ giữa tần số góc và chu kì: ω = 2π / T = 2π / 1 = 2π (rad/s).',
    score: 1,
    order_index: 4,
  },
  {
    id: 'q-01-05',
    assignment_id: 'asg-01',
    question_type: 'MCQ',
    question_text: 'Chọn kết luận đúng về dao động điều hoà của con lắc lò xo:',
    option_a: 'Quỹ đạo chuyển động là đường hình sin.',
    option_b: 'Quỹ đạo chuyển động là một đoạn thẳng.',
    option_c: 'Vận tốc tỉ lệ thuận với thời gian.',
    option_d: 'Gia tốc tỉ lệ thuận với thời gian.',
    correct_answer: 'B',
    explanation: 'Dao động điều hoà của con lắc lò xo là dao động qua lại quanh vị trí cân bằng, quỹ đạo là một đoạn thẳng có độ dài 2A (đồ thị li độ theo thời gian mới là đường hình sin).',
    score: 1,
    order_index: 5,
  },
  {
    id: 'q-01-06',
    assignment_id: 'asg-01',
    question_type: 'MCQ',
    question_text: 'Đại lượng nào sau đây tăng gấp đôi khi biên độ của dao động điều hoà của con lắc lò xo tăng gấp đôi?',
    option_a: 'Cơ năng của con lắc.',
    option_b: 'Động năng cực đại của con lắc.',
    option_c: 'Vận tốc cực đại của con lắc.',
    option_d: 'Thế năng cực đại của con lắc.',
    correct_answer: 'C',
    explanation: 'Vận tốc cực đại vmax = ωA (tỉ lệ thuận bậc nhất với A). Còn cơ năng, động năng cực đại và thế năng cực đại tỉ lệ với bình phương biên độ (A²) nên sẽ tăng gấp 4 lần.',
    score: 1,
    order_index: 6,
  },
  {
    id: 'q-01-07',
    assignment_id: 'asg-01',
    question_type: 'MCQ',
    question_text: 'Trong dao động điều hòa, gia tốc của vật biến đổi như thế nào so với li độ?',
    option_a: 'Cùng pha với li độ.',
    option_b: 'Ngược pha với li độ.',
    option_c: 'Sớm pha π/2 so với li độ.',
    option_d: 'Trễ pha π/2 so với li độ.',
    correct_answer: 'B',
    explanation: 'Gia tốc a = -ω²x = ω²A·cos(ωt + φ + π), nghĩa là gia tốc luôn biến thiên điều hòa ngược pha với li độ và luôn hướng về vị trí cân bằng.',
    score: 1,
    order_index: 7,
  },
  {
    id: 'q-01-08',
    assignment_id: 'asg-01',
    question_type: 'MCQ',
    question_text: 'Hiện tượng cộng hưởng dao động xảy ra khi nào?',
    option_a: 'Tần số của ngoại lực cưỡng bức bằng tần số dao động riêng của hệ.',
    option_b: 'Biên độ của ngoại lực cưỡng bức đạt giá trị cực đại.',
    option_c: 'Lực cản môi trường đạt giá trị cực đại.',
    option_d: 'Tần số ngoại lực lớn gấp 2 lần tần số riêng của hệ.',
    correct_answer: 'A',
    explanation: 'Hiện tượng cộng hưởng xảy ra khi tần số của ngoại lực cưỡng bức f bằng tần số dao động riêng f₀ của hệ, lúc đó biên độ dao động cưỡng bức tăng đạt giá trị cực đại.',
    score: 1,
    order_index: 8,
  },
  {
    id: 'q-01-09',
    assignment_id: 'asg-01',
    question_type: 'TEXT',
    question_text: 'Một vật dao động điều hòa với tần số f = 5 Hz. Hãy tính chu kì dao động T của vật theo đơn vị giây (s)? (Nhập số thập phân)',
    correct_answer: '0.2',
    explanation: 'Chu kì T = 1 / f = 1 / 5 = 0,2 s (hệ thống chấp nhận cả 0.2 và 0,2).',
    score: 1,
    order_index: 9,
  },
  {
    id: 'q-01-10',
    assignment_id: 'asg-01',
    question_type: 'TEXT',
    question_text: 'Gia tốc trọng trường tiêu chuẩn tại một phòng thí nghiệm vật lý thường lấy xấp xỉ bằng bao nhiêu m/s²?',
    correct_answer: '9.8',
    explanation: 'Gia tốc trọng trường tiêu chuẩn gần đúng là g = 9,8 m/s² (hoặc 9.8).',
    score: 1,
    order_index: 10,
  },
  {
    id: 'q-01-11',
    assignment_id: 'asg-01',
    question_type: 'TRUEFALSE',
    question_text: 'Chu kỳ dao động điều hòa của con lắc đơn phụ thuộc vào khối lượng của vật nặng treo ở đầu dây.',
    correct_answer: 'Sai',
    explanation: 'Chu kỳ con lắc đơn T = 2π√(l/g), chỉ phụ thuộc vào chiều dài dây treo l và gia tốc trọng trường g tại nơi treo con lắc, hoàn toàn không phụ thuộc khối lượng vật nặng m.',
    score: 1,
    order_index: 11,
  },
  {
    id: 'q-01-12',
    assignment_id: 'asg-01',
    question_type: 'TRUEFALSE',
    question_text: 'Trong dao động điều hòa của con lắc lò xo khi bỏ qua ma sát, cơ năng của vật được bảo toàn.',
    correct_answer: 'Đúng',
    explanation: 'Khi không có ma sát và lực cản, cơ năng W = Wđ + Wt = 1/2 kA² là hằng số bảo toàn theo thời gian.',
    score: 1,
    order_index: 12,
  },

  // Questions for Assignment 2 (Sóng cơ)
  {
    id: 'q-02-01',
    assignment_id: 'asg-02',
    question_type: 'MCQ',
    question_text: 'Bước sóng là gì?',
    option_a: 'Khoảng cách giữa hai ngọn sóng liên tiếp.',
    option_b: 'Quãng đường sóng truyền được trong một chu kì sóng.',
    option_c: 'Khoảng cách ngắn nhất giữa hai điểm dao động cùng pha trên phương truyền sóng.',
    option_d: 'Tất cả các khẳng định A, B, C đều đúng.',
    correct_answer: 'D',
    explanation: 'Theo định nghĩa trong SGK Vật lí 11, bước sóng λ là quãng đường sóng truyền trong 1 chu kỳ, đồng thời là khoảng cách giữa 2 điểm gần nhất dao động cùng pha trên cùng phương truyền sóng.',
    score: 1,
    order_index: 1,
  },
  {
    id: 'q-02-02',
    assignment_id: 'asg-02',
    question_type: 'MCQ',
    question_text: 'Một sóng cơ có tần số f = 50 Hz truyền với tốc độ v = 150 m/s. Bước sóng của sóng này là:',
    option_a: '3 m',
    option_b: '0,33 m',
    option_c: '7500 m',
    option_d: '75 m',
    correct_answer: 'A',
    explanation: 'Áp dụng công thức bước sóng: λ = v / f = 150 / 50 = 3 m.',
    score: 1,
    order_index: 2,
  },
  {
    id: 'q-02-03',
    assignment_id: 'asg-02',
    question_type: 'TRUEFALSE',
    question_text: 'Sóng âm có thể truyền được trong môi trường chân không.',
    correct_answer: 'Sai',
    explanation: 'Sóng âm là sóng cơ học nên cần môi trường vật chất (rắn, lỏng, khí) để lan truyền dao động. Sóng âm không truyền được trong chân không.',
    score: 1,
    order_index: 3,
  },
  {
    id: 'q-02-04',
    assignment_id: 'asg-02',
    question_type: 'TEXT',
    question_text: 'Tốc độ truyền âm trong không khí ở nhiệt độ thường xấp xỉ bằng bao nhiêu m/s? (Nhập số nguyên)',
    correct_answer: '340',
    explanation: 'Tốc độ âm thanh trong không khí ở điều kiện thường xấp xỉ 340 m/s.',
    score: 1,
    order_index: 4,
  },

  // Questions for Assignment 3 (Điện)
  {
    id: 'q-03-01',
    assignment_id: 'asg-03',
    question_type: 'MCQ',
    question_text: 'Đơn vị đo của cường độ điện trường trong hệ SI là:',
    option_a: 'N (Niutơn)',
    option_b: 'V/m (Vôn trên mét)',
    option_c: 'C (Culông)',
    option_d: 'J (Jun)',
    correct_answer: 'B',
    explanation: 'Cường độ điện trường E có đơn vị là Vôn trên mét (V/m) hoặc N/C.',
    score: 1,
    order_index: 1,
  },
  {
    id: 'q-03-02',
    assignment_id: 'asg-03',
    question_type: 'MCQ',
    question_text: 'Công thức biểu diễn định luật Ohm cho đoạn mạch thuần điện trở là:',
    option_a: 'I = U / R',
    option_b: 'I = R / U',
    option_c: 'U = I / R',
    option_d: 'R = I / U',
    correct_answer: 'A',
    explanation: 'Cường độ dòng điện chạy qua dây dẫn tỉ lệ thuận với hiệu điện thế giữa hai đầu dây và tỉ lệ nghịch với điện trở của dây: I = U / R.',
    score: 1,
    order_index: 2,
  },
  {
    id: 'q-03-03',
    assignment_id: 'asg-03',
    question_type: 'TEXT',
    question_text: 'Điện trở R = 10 Ω mắc vào hiệu điện thế U = 20 V. Cường độ dòng điện chạy qua điện trở là bao nhiêu ampe (A)?',
    correct_answer: '2',
    explanation: 'Áp dụng định luật Ohm: I = U / R = 20 / 10 = 2 A.',
    score: 1,
    order_index: 3,
  },
];

const INITIAL_QUESTIONS: Question[] = [
  ...STANDARD_CHAPTER_QUESTIONS,
  ...QUICK_PRACTICE_QUESTIONS,
];

// Seed sample students and attempts for realistic statistics
const INITIAL_USERS: StudentUser[] = [
  { id: 'stu-01', name: 'Nguyễn Văn An', email: 'vanan@gmail.com', class_id: 'cls-11a1', class_name: 'Lớp 11A1', created_at: '2026-09-12T09:00:00Z' },
  { id: 'stu-02', name: 'Trần Thị Bích', email: 'bichtran@gmail.com', class_id: 'cls-11a1', class_name: 'Lớp 11A1', created_at: '2026-09-12T09:15:00Z' },
  { id: 'stu-03', name: 'Lê Hoàng Cường', email: 'cuongle@gmail.com', class_id: 'cls-11a2', class_name: 'Lớp 11A2', created_at: '2026-09-12T09:30:00Z' },
  { id: 'stu-04', name: 'Phạm Minh Đức', email: 'ducpham@gmail.com', class_id: 'cls-11a2', class_name: 'Lớp 11A2', created_at: '2026-09-13T10:00:00Z' },
  { id: 'stu-05', name: 'Vũ Thùy Linh', email: 'linhvu@gmail.com', class_id: 'cls-11a3', class_name: 'Lớp 11A3', created_at: '2026-09-13T10:30:00Z' },
];

const INITIAL_ATTEMPTS: ExamAttempt[] = [
  {
    id: 'att-01',
    student_id: 'stu-01',
    student_name: 'Nguyễn Văn An',
    student_email: 'vanan@gmail.com',
    student_class: 'Lớp 11A1',
    assignment_id: 'asg-01',
    assignment_title: 'Chuyên đề 11 – Dao động điều hòa',
    attempt_number: 1,
    correct_count: 10,
    wrong_count: 2,
    unanswered_count: 0,
    total_questions: 12,
    score: 8.3,
    started_at: '2026-09-14T09:00:00Z',
    submitted_at: '2026-09-14T09:16:30Z',
    time_spent_seconds: 990,
    answers: {
      'q-01-01': 'A', 'q-01-02': 'A', 'q-01-03': 'B', 'q-01-04': 'B',
      'q-01-05': 'B', 'q-01-06': 'C', 'q-01-07': 'B', 'q-01-08': 'A',
      'q-01-09': '0.2', 'q-01-10': '9.8', 'q-01-11': 'Đúng', 'q-01-12': 'Sai'
    },
    flags: {},
    is_submitted: true,
  },
  {
    id: 'att-02',
    student_id: 'stu-01',
    student_name: 'Nguyễn Văn An',
    student_email: 'vanan@gmail.com',
    student_class: 'Lớp 11A1',
    assignment_id: 'asg-01',
    assignment_title: 'Chuyên đề 11 – Dao động điều hòa',
    attempt_number: 2,
    correct_count: 12,
    wrong_count: 0,
    unanswered_count: 0,
    total_questions: 12,
    score: 10.0,
    started_at: '2026-09-14T14:00:00Z',
    submitted_at: '2026-09-14T14:14:10Z',
    time_spent_seconds: 850,
    answers: {
      'q-01-01': 'A', 'q-01-02': 'A', 'q-01-03': 'B', 'q-01-04': 'B',
      'q-01-05': 'B', 'q-01-06': 'C', 'q-01-07': 'B', 'q-01-08': 'A',
      'q-01-09': '0.2', 'q-01-10': '9.8', 'q-01-11': 'Sai', 'q-01-12': 'Đúng'
    },
    flags: {},
    is_submitted: true,
  },
  {
    id: 'stu-02-att1',
    student_id: 'stu-02',
    student_name: 'Trần Thị Bích',
    student_email: 'bichtran@gmail.com',
    student_class: 'Lớp 11A1',
    assignment_id: 'asg-01',
    assignment_title: 'Chuyên đề 11 – Dao động điều hòa',
    attempt_number: 1,
    correct_count: 11,
    wrong_count: 1,
    unanswered_count: 0,
    total_questions: 12,
    score: 9.2,
    started_at: '2026-09-15T08:00:00Z',
    submitted_at: '2026-09-15T08:18:00Z',
    time_spent_seconds: 1080,
    answers: {
      'q-01-01': 'A', 'q-01-02': 'A', 'q-01-03': 'B', 'q-01-04': 'B',
      'q-01-05': 'B', 'q-01-06': 'C', 'q-01-07': 'B', 'q-01-08': 'A',
      'q-01-09': '0.2', 'q-01-10': '9.8', 'q-01-11': 'Sai', 'q-01-12': 'Sai'
    },
    flags: {},
    is_submitted: true,
  },
  {
    id: 'stu-03-att1',
    student_id: 'stu-03',
    student_name: 'Lê Hoàng Cường',
    student_email: 'cuongle@gmail.com',
    student_class: 'Lớp 11A2',
    assignment_id: 'asg-01',
    assignment_title: 'Chuyên đề 11 – Dao động điều hòa',
    attempt_number: 1,
    correct_count: 8,
    wrong_count: 4,
    unanswered_count: 0,
    total_questions: 12,
    score: 6.7,
    started_at: '2026-09-15T10:00:00Z',
    submitted_at: '2026-09-15T10:19:40Z',
    time_spent_seconds: 1180,
    answers: {
      'q-01-01': 'A', 'q-01-02': 'B', 'q-01-03': 'B', 'q-01-04': 'B',
      'q-01-05': 'A', 'q-01-06': 'A', 'q-01-07': 'B', 'q-01-08': 'A',
      'q-01-09': '0.2', 'q-01-10': '10', 'q-01-11': 'Sai', 'q-01-12': 'Đúng'
    },
    flags: {},
    is_submitted: true,
  },
  {
    id: 'stu-04-att1',
    student_id: 'stu-04',
    student_name: 'Phạm Minh Đức',
    student_email: 'ducpham@gmail.com',
    student_class: 'Lớp 11A2',
    assignment_id: 'asg-01',
    assignment_title: 'Chuyên đề 11 – Dao động điều hòa',
    attempt_number: 1,
    correct_count: 9,
    wrong_count: 2,
    unanswered_count: 1,
    total_questions: 12,
    score: 7.5,
    started_at: '2026-09-16T15:00:00Z',
    submitted_at: '2026-09-16T15:17:30Z',
    time_spent_seconds: 1050,
    answers: {
      'q-01-01': 'A', 'q-01-02': 'A', 'q-01-03': 'B', 'q-01-04': 'B',
      'q-01-05': 'B', 'q-01-06': 'C', 'q-01-07': 'C', 'q-01-08': 'A',
      'q-01-09': '0.2', 'q-01-10': '9.8', 'q-01-11': 'Sai'
    },
    flags: {},
    is_submitted: true,
  },
  {
    id: 'stu-05-att1',
    student_id: 'stu-05',
    student_name: 'Vũ Thùy Linh',
    student_email: 'linhvu@gmail.com',
    student_class: 'Lớp 11A3',
    assignment_id: 'asg-01',
    assignment_title: 'Chuyên đề 11 – Dao động điều hòa',
    attempt_number: 1,
    correct_count: 6,
    wrong_count: 5,
    unanswered_count: 1,
    total_questions: 12,
    score: 5.0,
    started_at: '2026-09-16T16:00:00Z',
    submitted_at: '2026-09-16T16:19:50Z',
    time_spent_seconds: 1190,
    answers: {
      'q-01-01': 'A', 'q-01-02': 'B', 'q-01-03': 'C', 'q-01-04': 'B',
      'q-01-05': 'C', 'q-01-06': 'A', 'q-01-07': 'B', 'q-01-08': 'A',
      'q-01-09': '0.2', 'q-01-10': '9.8', 'q-01-11': 'Đúng'
    },
    flags: {},
    is_submitted: true,
  },
];

const INITIAL_SETTINGS: SystemSettings = {
  app_name: 'LUYỆN TẬP VẬT LÝ 11',
  teacher_name: 'Thầy Thành',
  leaderboard_enabled: true,
  require_class_code: false,
};

// Initialize Storage
export async function initializeStorage(): Promise<void> {
  // Sync Assignments ensuring the 4 standard chapter exams are always present
  const rawAssignments = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
  if (!rawAssignments) {
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(INITIAL_ASSIGNMENTS));
  } else {
    try {
      const list: Assignment[] = JSON.parse(rawAssignments);
      let changed = false;
      for (const stdAsg of STANDARD_CHAPTER_ASSIGNMENTS) {
        const idx = list.findIndex(a => a.id === stdAsg.id);
        if (idx === -1) {
          list.unshift(stdAsg);
          changed = true;
        } else {
          // Keep metadata refreshed with newest structure
          list[idx] = { ...list[idx], ...stdAsg };
          changed = true;
        }
      }
      if (changed) {
        localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(list));
      }
    } catch {
      localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(INITIAL_ASSIGNMENTS));
    }
  }

  // Sync Questions ensuring all 100 questions from the 4 chapter exams are available
  const rawQuestions = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
  if (!rawQuestions) {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(INITIAL_QUESTIONS));
  } else {
    try {
      const list: Question[] = JSON.parse(rawQuestions);
      const existingIds = new Set(list.map(q => q.id));
      let changed = false;
      for (const stdQ of STANDARD_CHAPTER_QUESTIONS) {
        if (!existingIds.has(stdQ.id)) {
          list.push(stdQ);
          changed = true;
        } else {
          const idx = list.findIndex(q => q.id === stdQ.id);
          if (idx !== -1) {
            list[idx] = stdQ;
            changed = true;
          }
        }
      }
      if (changed) {
        localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(list));
      }
    } catch {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(INITIAL_QUESTIONS));
    }
  }

  if (!localStorage.getItem(STORAGE_KEYS.CLASSES)) {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(INITIAL_CLASSES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ATTEMPTS)) {
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(INITIAL_ATTEMPTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
  }

  // Teacher credentials: default username 'teacher', password 'thaythanh2024'
  if (!localStorage.getItem(STORAGE_KEYS.TEACHER_AUTH)) {
    const salt = generateSalt();
    const hash = await hashPassword('thaythanh2024', salt);
    const auth: TeacherAuth = {
      username: 'thaythanh',
      password_hash: hash,
      salt: salt,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.TEACHER_AUTH, JSON.stringify(auth));
  }
}

// ---------------------- ASSIGNMENTS ----------------------
export function getAssignments(): Assignment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
    return raw ? JSON.parse(raw) : INITIAL_ASSIGNMENTS;
  } catch {
    return INITIAL_ASSIGNMENTS;
  }
}

export function getAssignmentById(id: string): Assignment | null {
  const list = getAssignments();
  return list.find(a => a.id === id) || null;
}

export function saveAssignment(assignment: Assignment): void {
  const list = getAssignments();
  const idx = list.findIndex(a => a.id === assignment.id);
  if (idx >= 0) {
    list[idx] = assignment;
  } else {
    list.unshift(assignment);
  }
  localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(list));
}

export function deleteAssignment(id: string): void {
  const list = getAssignments().filter(a => a.id !== id);
  localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(list));
  // also delete questions
  const questions = getQuestions().filter(q => q.assignment_id !== id);
  localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
}

// ---------------------- QUESTIONS ----------------------
export function getQuestions(): Question[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    return raw ? JSON.parse(raw) : INITIAL_QUESTIONS;
  } catch {
    return INITIAL_QUESTIONS;
  }
}

export function getQuestionsByAssignmentId(assignmentId: string): Question[] {
  const list = getQuestions();
  return list
    .filter(q => q.assignment_id === assignmentId)
    .sort((a, b) => a.order_index - b.order_index);
}

export function saveQuestions(newQuestions: Question[]): void {
  const current = getQuestions();
  const incomingIds = new Set(newQuestions.map(q => q.id));
  const filtered = current.filter(q => !incomingIds.has(q.id));
  const updated = [...filtered, ...newQuestions];
  localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(updated));
}

export function replaceQuestionsForAssignment(assignmentId: string, questions: Question[]): void {
  const current = getQuestions().filter(q => q.assignment_id !== assignmentId);
  const updated = [...current, ...questions];
  localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(updated));
}

// ---------------------- CLASSES ----------------------
export function getClasses(): ClassRoom[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLASSES);
    return raw ? JSON.parse(raw) : INITIAL_CLASSES;
  } catch {
    return INITIAL_CLASSES;
  }
}

export function saveClass(cls: ClassRoom): void {
  const list = getClasses();
  const idx = list.findIndex(c => c.id === cls.id);
  if (idx >= 0) {
    list[idx] = cls;
  } else {
    list.push(cls);
  }
  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(list));
}

export function deleteClass(id: string): void {
  const list = getClasses().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(list));
}

// ---------------------- STUDENTS & USERS ----------------------
export function getStudents(): StudentUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : INITIAL_USERS;
  } catch {
    return INITIAL_USERS;
  }
}

export function saveOrUpdateStudent(data: { name: string; email: string; class_id?: string; class_name?: string }): StudentUser {
  const list = getStudents();
  const normalizedEmail = data.email.trim().toLowerCase();
  let student = list.find(s => s.email.toLowerCase() === normalizedEmail);

  if (student) {
    student.name = data.name.trim();
    if (data.class_id) student.class_id = data.class_id;
    if (data.class_name) student.class_name = data.class_name;
  } else {
    student = {
      id: 'stu-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: data.name.trim(),
      email: normalizedEmail,
      class_id: data.class_id,
      class_name: data.class_name || 'Tự do',
      created_at: new Date().toISOString(),
    };
    list.push(student);
  }
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(list));
  setCurrentStudent(student);
  return student;
}

export function getCurrentStudent(): StudentUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_STUDENT);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentStudent(student: StudentUser | null): void {
  if (student) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_STUDENT, JSON.stringify(student));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_STUDENT);
  }
}

// ---------------------- EXAM ATTEMPTS ----------------------
export function getAttempts(): ExamAttempt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
    return raw ? JSON.parse(raw) : INITIAL_ATTEMPTS;
  } catch {
    return INITIAL_ATTEMPTS;
  }
}

export function getAttemptsByStudent(studentEmail: string, assignmentId?: string): ExamAttempt[] {
  const list = getAttempts();
  const normEmail = studentEmail.trim().toLowerCase();
  return list.filter(a => {
    const matchEmail = a.student_email.toLowerCase() === normEmail;
    if (!matchEmail) return false;
    if (assignmentId) return a.assignment_id === assignmentId;
    return true;
  });
}

export function saveAttempt(attempt: ExamAttempt): void {
  const list = getAttempts();
  const idx = list.findIndex(a => a.id === attempt.id);
  if (idx >= 0) {
    list[idx] = attempt;
  } else {
    list.unshift(attempt);
  }
  localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(list));
}

// ---------------------- EXAM IN-PROGRESS DRAFT ----------------------
export interface ExamDraft {
  attemptId: string;
  assignmentId: string;
  studentId: string;
  studentEmail: string;
  studentName: string;
  studentClass: string;
  attemptNumber: number;
  startedAt: string;
  deadlineTimestamp: number; // in ms
  answers: Record<string, string>;
  flags: Record<string, boolean>;
  questionOrder: string[]; // array of question IDs
  shuffledOptions?: Record<string, { key: string; text: string; origKey: string }[]>;
}

export function getActiveExamDraft(assignmentId: string, studentEmail: string): ExamDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_EXAM_DRAFT);
    if (!raw) return null;
    const draft: ExamDraft = JSON.parse(raw);
    if (draft.assignmentId === assignmentId && draft.studentEmail.toLowerCase() === studentEmail.trim().toLowerCase()) {
      return draft;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveActiveExamDraft(draft: ExamDraft): void {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_EXAM_DRAFT, JSON.stringify(draft));
}

export function clearActiveExamDraft(): void {
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_EXAM_DRAFT);
}

// ---------------------- SETTINGS & TEACHER AUTH ----------------------
export function getSettings(): SystemSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : INITIAL_SETTINGS;
  } catch {
    return INITIAL_SETTINGS;
  }
}

export function saveSettings(settings: SystemSettings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function getTeacherAuth(): TeacherAuth {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEACHER_AUTH);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return {
    username: 'thaythanh',
    password_hash: '',
    salt: '',
    updated_at: '',
  };
}

export async function verifyTeacherLogin(password: string): Promise<boolean> {
  const auth = getTeacherAuth();
  if (!auth.salt || !auth.password_hash) {
    // initialize if missing
    await initializeStorage();
    const updatedAuth = getTeacherAuth();
    const hash = await hashPassword(password, updatedAuth.salt);
    return hash === updatedAuth.password_hash;
  }
  const hash = await hashPassword(password, auth.salt);
  return hash === auth.password_hash;
}

export async function updateTeacherPassword(newPassword: string): Promise<void> {
  const salt = generateSalt();
  const hash = await hashPassword(newPassword, salt);
  const auth = getTeacherAuth();
  auth.salt = salt;
  auth.password_hash = hash;
  auth.updated_at = new Date().toISOString();
  localStorage.setItem(STORAGE_KEYS.TEACHER_AUTH, JSON.stringify(auth));
}

// ---------------------- ANSWER COMPARISON UTILITY ----------------------
/**
 * Normalizes answer and checks correctness.
 * For MCQ: matches 'A', 'B', 'C', 'D' (case insensitive).
 * For TRUEFALSE: matches 'Đúng'/'Sai' (or 'True'/'False', 'D'/'S').
 * For TEXT: parses numbers like 9,8 = 9.8 = 9.80 = 9,80. Or normalized string.
 */
export function isAnswerCorrect(studentAnswer: string | undefined, correctAnswer: string, questionType: QuestionType): boolean {
  if (!studentAnswer) return false;
  const userAns = studentAnswer.trim();
  const targetAns = correctAnswer.trim();

  if (questionType === 'MCQ') {
    return userAns.toUpperCase() === targetAns.toUpperCase();
  }

  if (questionType === 'TRUEFALSE') {
    const normalizeTF = (val: string) => {
      const v = val.toLowerCase().replace(/[^a-z0-9à-ỹ]/gi, '');
      if (['đúng', 'dung', 'true', 'd', 't', '1'].includes(v)) return 'true';
      if (['sai', 'false', 's', 'f', '0'].includes(v)) return 'false';
      return v;
    };
    return normalizeTF(userAns) === normalizeTF(targetAns);
  }

  if (questionType === 'TEXT') {
    // Try numeric comparison: 9,8 vs 9.8 vs 9,80 vs 9.80
    const parseNum = (str: string) => {
      const clean = str.replace(',', '.').replace(/\s+/g, '');
      const num = parseFloat(clean);
      return isNaN(num) ? null : num;
    };

    const num1 = parseNum(userAns);
    const num2 = parseNum(targetAns);

    if (num1 !== null && num2 !== null) {
      // Epsilon tolerance for floating point rounding: 1e-4
      return Math.abs(num1 - num2) < 0.0001;
    }

    // String comparison fallback
    const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').replace(',', '.');
    return norm(userAns) === norm(targetAns);
  }

  return false;
}

// ---------------------- DETAILED GRADING & BREAKDOWN ENGINE ----------------------
export interface SubItemGradeResult {
  id: 'a' | 'b' | 'c' | 'd';
  statement: string;
  studentAnswer: string;
  correctAnswer: 'Đúng' | 'Sai';
  isCorrect: boolean;
  explanation?: string;
}

export interface QuestionGradeResult {
  questionId: string;
  type: QuestionType;
  maxScore: number;
  earnedScore: number;
  isCorrect: boolean;
  subItemResults?: SubItemGradeResult[];
}

export interface ExamScoreBreakdown {
  totalScore: number; // Scaled to 10-point scale (0 - 10.0)
  totalPossibleScore: number; // 10.0
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  totalQuestions: number;
  part1_mcq: {
    earnedScore: number;
    maxScore: number;
    questionCount: number;
    correctCount: number;
  };
  part2_trueFalse: {
    earnedScore: number;
    maxScore: number;
    questionCount: number;
    correctSubCount: number;
    totalSubCount: number;
  };
  part3_text: {
    earnedScore: number;
    maxScore: number;
    questionCount: number;
    correctCount: number;
  };
  part4_essay: {
    earnedScore: number;
    maxScore: number;
    questionCount: number;
    submittedCount: number;
  };
  cognitive: {
    nhanBiet: { earnedScore: number; maxScore: number; count: number; correctCount: number };
    thongHieu: { earnedScore: number; maxScore: number; count: number; correctCount: number };
    vanDung: { earnedScore: number; maxScore: number; count: number; correctCount: number };
  };
  questionResults: Record<string, QuestionGradeResult>;
}

export function gradeSingleQuestion(q: Question, studentAnswer: string | undefined): QuestionGradeResult {
  const maxScore = q.score || (q.question_type === 'TRUEFALSE' || q.question_type === 'ESSAY' ? 1.0 : 0.25);
  const userAns = (studentAnswer || '').trim();

  // If question is unanswered
  if (!userAns) {
    return {
      questionId: q.id,
      type: q.question_type,
      maxScore,
      earnedScore: 0,
      isCorrect: false,
    };
  }

  // 1. MCQ
  if (q.question_type === 'MCQ') {
    const isCorr = isAnswerCorrect(userAns, q.correct_answer, 'MCQ');
    return {
      questionId: q.id,
      type: 'MCQ',
      maxScore,
      earnedScore: isCorr ? maxScore : 0,
      isCorrect: isCorr,
    };
  }

  // 2. TRUE/FALSE
  if (q.question_type === 'TRUEFALSE') {
    // If question has 4 sub-items (a, b, c, d)
    if (q.sub_items && q.sub_items.length > 0) {
      let answersMap: Record<string, string> = {};
      try {
        if (userAns.startsWith('{')) {
          answersMap = JSON.parse(userAns);
        } else if (userAns.includes('|')) {
          const parts = userAns.split('|');
          q.sub_items.forEach((item, idx) => {
            const rawPart = parts[idx] || '';
            if (rawPart.includes(':')) {
              const [k, v] = rawPart.split(':');
              answersMap[k.trim().toLowerCase()] = v ? v.trim() : '';
            } else {
              answersMap[item.id] = rawPart.trim();
            }
          });
        }
      } catch {
        answersMap = {};
      }

      let correctSubCount = 0;
      const subItemResults: SubItemGradeResult[] = q.sub_items.map(item => {
        const itemAns = answersMap[item.id] || '';
        const isCorr = isAnswerCorrect(itemAns, item.correct_answer, 'TRUEFALSE');
        if (isCorr) correctSubCount++;
        return {
          id: item.id,
          statement: item.statement,
          studentAnswer: itemAns,
          correctAnswer: item.correct_answer,
          isCorrect: isCorr,
          explanation: item.explanation,
        };
      });

      // 0.25 points per correct statement in the 4-item True/False question
      const earned = correctSubCount * 0.25;
      const isAllCorrect = correctSubCount === q.sub_items.length;

      return {
        questionId: q.id,
        type: 'TRUEFALSE',
        maxScore,
        earnedScore: earned,
        isCorrect: isAllCorrect,
        subItemResults,
      };
    }

    // Single statement True/False
    const isCorr = isAnswerCorrect(userAns, q.correct_answer, 'TRUEFALSE');
    return {
      questionId: q.id,
      type: 'TRUEFALSE',
      maxScore,
      earnedScore: isCorr ? maxScore : 0,
      isCorrect: isCorr,
    };
  }

  // 3. TEXT Input
  if (q.question_type === 'TEXT') {
    const isCorr = isAnswerCorrect(userAns, q.correct_answer, 'TEXT');
    return {
      questionId: q.id,
      type: 'TEXT',
      maxScore,
      earnedScore: isCorr ? maxScore : 0,
      isCorrect: isCorr,
    };
  }

  // 4. ESSAY
  if (q.question_type === 'ESSAY') {
    // For online practice: student submits an essay attempt (> 15 chars gets full credit with rubric self-assessment)
    const hasMeaningfulText = userAns.length >= 15;
    return {
      questionId: q.id,
      type: 'ESSAY',
      maxScore,
      earnedScore: hasMeaningfulText ? maxScore : 0,
      isCorrect: hasMeaningfulText,
    };
  }

  return {
    questionId: q.id,
    type: q.question_type,
    maxScore,
    earnedScore: 0,
    isCorrect: false,
  };
}

export function calculateExamBreakdown(
  questions: Question[],
  answers: Record<string, string>
): ExamScoreBreakdown {
  let totalRawEarned = 0;
  let totalRawPossible = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;

  const part1 = { earnedScore: 0, maxScore: 0, questionCount: 0, correctCount: 0 };
  const part2 = { earnedScore: 0, maxScore: 0, questionCount: 0, correctSubCount: 0, totalSubCount: 0 };
  const part3 = { earnedScore: 0, maxScore: 0, questionCount: 0, correctCount: 0 };
  const part4 = { earnedScore: 0, maxScore: 0, questionCount: 0, submittedCount: 0 };

  const cognitive = {
    nhanBiet: { earnedScore: 0, maxScore: 0, count: 0, correctCount: 0 },
    thongHieu: { earnedScore: 0, maxScore: 0, count: 0, correctCount: 0 },
    vanDung: { earnedScore: 0, maxScore: 0, count: 0, correctCount: 0 },
  };

  const questionResults: Record<string, QuestionGradeResult> = {};

  questions.forEach(q => {
    const userAns = answers[q.id];
    const isAnswered = Boolean(userAns && userAns.trim() !== '');
    const grade = gradeSingleQuestion(q, userAns);

    questionResults[q.id] = grade;
    totalRawEarned += grade.earnedScore;
    totalRawPossible += grade.maxScore;

    if (!isAnswered) {
      unansweredCount++;
    } else if (grade.isCorrect) {
      correctCount++;
    } else {
      wrongCount++;
    }

    // Section distribution
    if (q.question_type === 'MCQ') {
      part1.earnedScore += grade.earnedScore;
      part1.maxScore += grade.maxScore;
      part1.questionCount++;
      if (grade.isCorrect) part1.correctCount++;
    } else if (q.question_type === 'TRUEFALSE') {
      part2.earnedScore += grade.earnedScore;
      part2.maxScore += grade.maxScore;
      part2.questionCount++;
      if (grade.subItemResults) {
        part2.totalSubCount += grade.subItemResults.length;
        part2.correctSubCount += grade.subItemResults.filter(s => s.isCorrect).length;
      }
    } else if (q.question_type === 'TEXT') {
      part3.earnedScore += grade.earnedScore;
      part3.maxScore += grade.maxScore;
      part3.questionCount++;
      if (grade.isCorrect) part3.correctCount++;
    } else if (q.question_type === 'ESSAY') {
      part4.earnedScore += grade.earnedScore;
      part4.maxScore += grade.maxScore;
      part4.questionCount++;
      if (isAnswered) part4.submittedCount++;
    }

    // Cognitive level distribution
    const levelKey =
      q.cognitive_level === 'NHAN_BIET'
        ? 'nhanBiet'
        : q.cognitive_level === 'THONG_HIEU'
        ? 'thongHieu'
        : 'vanDung';

    cognitive[levelKey].earnedScore += grade.earnedScore;
    cognitive[levelKey].maxScore += grade.maxScore;
    cognitive[levelKey].count++;
    if (grade.isCorrect) cognitive[levelKey].correctCount++;
  });

  // Scale total score out of 10 points
  const scaledScore =
    totalRawPossible > 0
      ? Math.round((totalRawEarned / totalRawPossible) * 10 * 10) / 10
      : 0;

  return {
    totalScore: Math.min(10, Math.max(0, scaledScore)),
    totalPossibleScore: 10,
    correctCount,
    wrongCount,
    unansweredCount,
    totalQuestions: questions.length,
    part1_mcq: part1,
    part2_trueFalse: part2,
    part3_text: part3,
    part4_essay: part4,
    cognitive,
    questionResults,
  };
}

// Reset data to defaults
export async function resetAllDataToDefault(): Promise<void> {
  localStorage.removeItem(STORAGE_KEYS.ASSIGNMENTS);
  localStorage.removeItem(STORAGE_KEYS.QUESTIONS);
  localStorage.removeItem(STORAGE_KEYS.CLASSES);
  localStorage.removeItem(STORAGE_KEYS.USERS);
  localStorage.removeItem(STORAGE_KEYS.ATTEMPTS);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  localStorage.removeItem(STORAGE_KEYS.TEACHER_AUTH);
  localStorage.removeItem(STORAGE_KEYS.CURRENT_STUDENT);
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_EXAM_DRAFT);
  await initializeStorage();
}

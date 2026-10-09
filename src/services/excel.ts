import * as XLSX from 'xlsx';
import {
  Assignment,
  ExamAttempt,
  ExcelParseResult,
  ExcelValidationError,
  ParsedAssignmentInfo,
  ParsedQuestionRow,
  Question,
  QuestionType,
} from '../types';

/**
 * Creates and triggers browser download of the standard Excel template for teachers.
 * Multi-sheet format:
 * - Sheet 1: THONG_TIN_BAI (Assignment settings)
 * - Sheet 2: CAU_HOI (Question bank)
 */
export function downloadSampleExcelTemplate(): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: THONG_TIN_BAI
  const infoData = [
    ['THÔNG TIN BÀI TẬP VẬT LÝ 11', ''],
    ['(Giáo viên điền các thông tin cài đặt bài thi dưới đây)', ''],
    ['', ''],
    ['Thông số', 'Giá trị cấu hình'],
    ['Tên bài tập', 'Chuyên đề 11 – Dao động điều hòa'],
    ['Chuyên đề', 'Chương I: Dao động'],
    ['Mô tả', 'Bài tập kiểm tra kiến thức về phương trình li độ, vận tốc, gia tốc và con lắc lò xo.'],
    ['Thời gian làm bài (phút)', 30],
    ['Số lượt làm tối đa', 3],
    ['Trộn câu hỏi (Có/Không)', 'Có'],
    ['Trộn đáp án (Có/Không)', 'Có'],
    ['Cho xem lời giải sau khi nộp (Có/Không)', 'Có'],
    ['Ngày mở bài (YYYY-MM-DD)', '2026-09-01'],
    ['Ngày đóng bài (YYYY-MM-DD)', '2026-12-31'],
  ];
  const wsInfo = XLSX.utils.aoa_to_sheet(infoData);

  // Set column widths
  wsInfo['!cols'] = [{ wch: 35 }, { wch: 60 }];

  // Sheet 2: CAU_HOI
  const questionsData = [
    ['STT', 'Loại câu', 'Câu hỏi', 'Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D', 'Đáp án đúng', 'Lời giải', 'Điểm'],
    [
      1,
      'MCQ',
      'Chu kỳ dao động điều hòa được ký hiệu là gì?',
      'A',
      'T',
      'f',
      'ω',
      'B',
      'Chu kỳ dao động được ký hiệu là T, đơn vị là giây (s).',
      1,
    ],
    [
      2,
      'MCQ',
      'Một chất điểm dao động điều hòa có chiều dài quỹ đạo là 12 cm. Biên độ dao động A là:',
      '6 cm',
      '12 cm',
      '24 cm',
      '3 cm',
      'A',
      'Chiều dài quỹ đạo L = 2A = 12 cm => A = 6 cm.',
      1,
    ],
    [
      3,
      'TEXT',
      'Gia tốc trọng trường gần mặt đất thường lấy xấp xỉ bằng bao nhiêu m/s²? (Nhập số)',
      '',
      '',
      '',
      '',
      '9.8',
      'Giá trị gần đúng của gia tốc trọng trường g là 9,8 m/s² (hoặc 9.8).',
      1,
    ],
    [
      4,
      'TRUEFALSE',
      'Chu kỳ con lắc đơn phụ thuộc vào khối lượng của quả cầu treo ở đầu dây.',
      'Đúng',
      'Sai',
      '',
      '',
      'Sai',
      'Công thức T = 2π√(l/g) không chứa khối lượng m.',
      1,
    ],
  ];
  const wsQuestions = XLSX.utils.aoa_to_sheet(questionsData);
  wsQuestions['!cols'] = [
    { wch: 6 },
    { wch: 12 },
    { wch: 55 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 14 },
    { wch: 50 },
    { wch: 8 },
  ];

  XLSX.utils.book_append_sheet(wb, wsInfo, 'THONG_TIN_BAI');
  XLSX.utils.book_append_sheet(wb, wsQuestions, 'CAU_HOI');

  XLSX.writeFile(wb, 'Mau_Nhap_De_Thi_Vat_Ly_11.xlsx');
}

/**
 * Downloads a pre-configured 12-question actual Physics 11 test file
 * (8 MCQ, 2 TEXT, 2 TRUEFALSE) meeting the requirement of Section XXX.
 */
export function downloadPhysics11TestExcel(): void {
  const wb = XLSX.utils.book_new();

  const infoData = [
    ['THÔNG TIN BÀI TẬP VẬT LÝ 11', ''],
    ['Thông số', 'Giá trị cấu hình'],
    ['Tên bài tập', 'Đề kiểm tra thử nghiệm 12 câu – Vật lý 11 Thầy Thành'],
    ['Chuyên đề', 'Chương I: Dao động điều hòa'],
    ['Mô tả', 'Đề thi kiểm tra 12 câu chuẩn SGK Vật lý 11 Kết nối tri thức (8 trắc nghiệm, 2 điền số, 2 đúng sai)'],
    ['Thời gian làm bài (phút)', 25],
    ['Số lượt làm tối đa', 3],
    ['Trộn câu hỏi (Có/Không)', 'Có'],
    ['Trộn đáp án (Có/Không)', 'Có'],
    ['Cho xem lời giải sau khi nộp (Có/Không)', 'Có'],
    ['Ngày mở bài (YYYY-MM-DD)', '2026-09-01'],
    ['Ngày đóng bài (YYYY-MM-DD)', '2026-12-31'],
  ];
  const wsInfo = XLSX.utils.aoa_to_sheet(infoData);
  wsInfo['!cols'] = [{ wch: 35 }, { wch: 65 }];

  const questionsData = [
    ['STT', 'Loại câu', 'Câu hỏi', 'Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D', 'Đáp án đúng', 'Lời giải', 'Điểm'],
    [
      1,
      'MCQ',
      'Một chất điểm dao động điều hoà có quỹ đạo là một đoạn thẳng dài 10 cm. Biên độ dao động của chất điểm là:',
      '5 cm',
      '-5 cm',
      '10 cm',
      '-10 cm',
      'A',
      'Chiều dài quỹ đạo L = 2A = 10 cm => A = 5 cm.',
      1,
    ],
    [
      2,
      'MCQ',
      'Một chất điểm dao động điều hoà trong 10 dao động toàn phần đi được quãng đường dài 120 cm. Quỹ đạo dao động của vật có chiều dài là:',
      '6 cm',
      '12 cm',
      '3 cm',
      '9 cm',
      'A',
      'Trong 1 chu kỳ s = 4A. 10 chu kỳ s = 40A = 120 cm => A = 3 cm => Quỹ đạo L = 2A = 6 cm.',
      1,
    ],
    [
      3,
      'MCQ',
      'Một chất điểm dao động điều hoà với phương trình x = 5cos(10πt + π/3) (cm). Li độ của chất điểm khi pha dao động bằng π là:',
      '5 cm',
      '-5 cm',
      '2,5 cm',
      '-2,5 cm',
      'B',
      'Thay pha (10πt + π/3) = π vào phương trình: x = 5cos(π) = -5 cm.',
      1,
    ],
    [
      4,
      'MCQ',
      'Một chất điểm dao động điều hoà có chu kì T = 1 s. Tần số góc ω của dao động là:',
      'π rad/s',
      '2π rad/s',
      '1 rad/s',
      '2 rad/s',
      'B',
      'Tần số góc ω = 2π / T = 2π / 1 = 2π (rad/s).',
      1,
    ],
    [
      5,
      'MCQ',
      'Chọn kết luận đúng về dao động điều hoà của con lắc lò xo:',
      'Quỹ đạo là đường hình sin.',
      'Quỹ đạo là một đoạn thẳng.',
      'Vận tốc tỉ lệ thuận với thời gian.',
      'Gia tốc tỉ lệ thuận với thời gian.',
      'B',
      'Quỹ đạo chuyển động là một đoạn thẳng chiều dài 2A.',
      1,
    ],
    [
      6,
      'MCQ',
      'Đại lượng nào sau đây tăng gấp đôi khi biên độ của dao động điều hoà của con lắc lò xo tăng gấp đôi?',
      'Cơ năng của con lắc.',
      'Động năng con lắc.',
      'Vận tốc cực đại.',
      'Thế năng con lắc.',
      'C',
      'Vận tốc cực đại vmax = ωA tăng gấp đôi khi A tăng gấp đôi.',
      1,
    ],
    [
      7,
      'MCQ',
      'Trong dao động điều hòa, mối liên hệ về pha giữa gia tốc và li độ là:',
      'Cùng pha.',
      'Ngược pha.',
      'Vuông pha sớm hơn π/2.',
      'Vuông pha trễ hơn π/2.',
      'B',
      'Gia tốc a = -ω²x, biến thiên điều hòa ngược pha với li độ.',
      1,
    ],
    [
      8,
      'MCQ',
      'Hiện tượng cộng hưởng dao động xảy ra khi:',
      'Tần số ngoại lực bằng tần số riêng của hệ.',
      'Biên độ ngoại lực đạt cực đại.',
      'Lực cản môi trường đạt cực đại.',
      'Tần số ngoại lực bằng 2 lần tần số riêng.',
      'A',
      'Cộng hưởng xảy ra khi f = f₀, biên độ dao động đạt giá trị cực đại.',
      1,
    ],
    [
      9,
      'TEXT',
      'Một chất điểm dao động điều hoà với tần số f = 5 Hz. Tính chu kì dao động T của vật theo giây (s)?',
      '',
      '',
      '',
      '',
      '0.2',
      'Chu kỳ T = 1 / f = 1 / 5 = 0,2 s.',
      1,
    ],
    [
      10,
      'TEXT',
      'Gia tốc trọng trường gần mặt đất thường lấy xấp xỉ bằng bao nhiêu m/s²?',
      '',
      '',
      '',
      '',
      '9.8',
      'Giá trị tiêu chuẩn g ≈ 9,8 m/s² (hoặc 9.8).',
      1,
    ],
    [
      11,
      'TRUEFALSE',
      'Chu kỳ dao động con lắc đơn phụ thuộc vào khối lượng quả nặng.',
      'Đúng',
      'Sai',
      '',
      '',
      'Sai',
      'Chu kỳ T = 2π√(l/g), không phụ thuộc vào khối lượng m.',
      1,
    ],
    [
      12,
      'TRUEFALSE',
      'Khi bỏ qua mọi ma sát và lực cản, cơ năng của con lắc lò xo dao động điều hòa được bảo toàn.',
      'Đúng',
      'Sai',
      '',
      '',
      'Đúng',
      'Cơ năng W = 1/2 kA² là hằng số bảo toàn theo thời gian.',
      1,
    ],
  ];

  const wsQuestions = XLSX.utils.aoa_to_sheet(questionsData);
  wsQuestions['!cols'] = [
    { wch: 6 },
    { wch: 12 },
    { wch: 55 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 14 },
    { wch: 50 },
    { wch: 8 },
  ];

  XLSX.utils.book_append_sheet(wb, wsInfo, 'THONG_TIN_BAI');
  XLSX.utils.book_append_sheet(wb, wsQuestions, 'CAU_HOI');

  XLSX.writeFile(wb, 'De_Thi_Thu_Nghiem_12_Cau_Vat_Ly_11.xlsx');
}

/**
 * Parses and strictly validates uploaded Excel file (.xlsx / .xls).
 * Validates:
 * - File format
 * - Sheets existence
 * - Column headers
 * - Empty question text
 * - Missing correct answers
 * - Invalid correct answers for MCQ (must be A, B, C, D)
 * - Invalid correct answers for TRUEFALSE (must be Đúng or Sai)
 * - Empty options for MCQ
 * - Duplicate question numbers or text
 * - Valid score numbers
 * Returns structured line-by-line errors and warnings.
 */
export async function parseAndValidateExcel(file: File): Promise<ExcelParseResult> {
  const errors: ExcelValidationError[] = [];
  const warnings: ExcelValidationError[] = [];

  const defaultInfo: ParsedAssignmentInfo = {
    title: file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
    topic: 'Chương I: Dao động',
    description: 'Bài tập nhập từ file Excel ' + file.name,
    duration: 30,
    max_attempts: 3,
    shuffle_questions: true,
    shuffle_answers: true,
  };

  // 1. File extension validation
  const lowerName = file.name.toLowerCase();
  if (!lowerName.endsWith('.xlsx') && !lowerName.endsWith('.xls')) {
    errors.push({
      row: 0,
      field: 'file',
      message: `Định dạng tệp "${file.name}" không hợp lệ. Hệ thống chỉ chấp nhận tệp Excel định dạng .xlsx hoặc .xls.`,
      level: 'error',
    });
    return { isValid: false, errors, warnings, info: defaultInfo, questions: [] };
  }

  // 2. Read array buffer
  let workbook: XLSX.WorkBook;
  try {
    const buffer = await file.arrayBuffer();
    workbook = XLSX.read(buffer, { type: 'array' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    errors.push({
      row: 0,
      field: 'file',
      message: `Không thể đọc nội dung tệp Excel (Tệp có thể bị hỏng hoặc có mật khẩu bảo vệ): ${message}`,
      level: 'error',
    });
    return { isValid: false, errors, warnings, info: defaultInfo, questions: [] };
  }

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    errors.push({
      row: 0,
      field: 'file',
      message: 'Tệp Excel không chứa bất kỳ sheet dữ liệu nào.',
      level: 'error',
    });
    return { isValid: false, errors, warnings, info: defaultInfo, questions: [] };
  }

  // 3. Find sheets
  // Check for THONG_TIN_BAI sheet
  const infoSheetName = workbook.SheetNames.find(
    s => s.trim().toUpperCase() === 'THONG_TIN_BAI' || s.trim().toUpperCase() === 'THONG TIN BAI' || s.trim().toUpperCase() === 'INFO'
  );

  let assignmentInfo = { ...defaultInfo };
  if (infoSheetName) {
    const infoSheet = workbook.Sheets[infoSheetName];
    const infoRows: unknown[][] = XLSX.utils.sheet_to_json(infoSheet, { header: 1 });
    for (const row of infoRows) {
      if (Array.isArray(row) && row.length >= 2) {
        const key = String(row[0] || '').trim().toLowerCase();
        const val = row[1];
        if (key.includes('tên bài')) assignmentInfo.title = String(val).trim();
        else if (key.includes('chuyên đề')) assignmentInfo.topic = String(val).trim();
        else if (key.includes('mô tả')) assignmentInfo.description = String(val).trim();
        else if (key.includes('thời gian')) {
          const num = parseInt(String(val), 10);
          if (!isNaN(num) && num >= 0) assignmentInfo.duration = num;
        } else if (key.includes('số lượt')) {
          const num = parseInt(String(val), 10);
          if (!isNaN(num) && num >= 0) assignmentInfo.max_attempts = num;
        } else if (key.includes('trộn câu')) {
          const s = String(val).trim().toLowerCase();
          assignmentInfo.shuffle_questions = s === 'có' || s === 'yes' || s === 'true' || s === '1';
        } else if (key.includes('trộn đáp án')) {
          const s = String(val).trim().toLowerCase();
          assignmentInfo.shuffle_answers = s === 'có' || s === 'yes' || s === 'true' || s === '1';
        } else if (key.includes('ngày mở')) {
          assignmentInfo.start_time = String(val).trim();
        } else if (key.includes('ngày đóng')) {
          assignmentInfo.end_time = String(val).trim();
        }
      }
    }
  }

  // Find question sheet: CAU_HOI or first sheet if only 1 sheet
  let questionSheetName = workbook.SheetNames.find(
    s => s.trim().toUpperCase() === 'CAU_HOI' || s.trim().toUpperCase() === 'CAU HOI' || s.trim().toUpperCase() === 'QUESTIONS'
  );

  if (!questionSheetName) {
    if (workbook.SheetNames.length === 1) {
      questionSheetName = workbook.SheetNames[0];
    } else {
      // Find a sheet not named info
      const candidate = workbook.SheetNames.find(s => s !== infoSheetName);
      questionSheetName = candidate || workbook.SheetNames[0];
    }
  }

  const qSheet = workbook.Sheets[questionSheetName];
  if (!qSheet) {
    errors.push({
      row: 0,
      field: 'sheet',
      message: 'Không tìm thấy Sheet "CAU_HOI" trong tệp Excel.',
      level: 'error',
    });
    return { isValid: false, errors, warnings, info: assignmentInfo, questions: [] };
  }

  // Convert to 2D array
  const rawRows: unknown[][] = XLSX.utils.sheet_to_json(qSheet, { header: 1 });
  if (rawRows.length < 2) {
    errors.push({
      row: 1,
      field: 'data',
      message: `Sheet "${questionSheetName}" không có dữ liệu câu hỏi nào.`,
      level: 'error',
    });
    return { isValid: false, errors, warnings, info: assignmentInfo, questions: [] };
  }

  // 4. Find header row
  let headerRowIndex = -1;
  let colMap: Record<string, number> = {};

  for (let r = 0; r < Math.min(10, rawRows.length); r++) {
    const row = rawRows[r];
    if (!Array.isArray(row)) continue;

    const map: Record<string, number> = {};
    for (let c = 0; c < row.length; c++) {
      const cellText = String(row[c] || '').trim().toLowerCase();
      if (cellText === 'stt' || cellText === 'no') map['stt'] = c;
      else if (cellText.includes('loại') || cellText.includes('type')) map['type'] = c;
      else if (cellText.includes('câu hỏi') || cellText.includes('nội dung') || cellText === 'question') map['question'] = c;
      else if (cellText === 'đáp án a' || cellText === 'a' || cellText === 'phương án a') map['a'] = c;
      else if (cellText === 'đáp án b' || cellText === 'b' || cellText === 'phương án b') map['b'] = c;
      else if (cellText === 'đáp án c' || cellText === 'c' || cellText === 'phương án c') map['c'] = c;
      else if (cellText === 'đáp án d' || cellText === 'd' || cellText === 'phương án d') map['d'] = c;
      else if (cellText.includes('đáp án đúng') || cellText.includes('đáp án') || cellText === 'correct' || cellText === 'key') map['correct'] = c;
      else if (cellText.includes('lời giải') || cellText.includes('giải thích') || cellText.includes('explanation')) map['explanation'] = c;
      else if (cellText.includes('điểm') || cellText.includes('score') || cellText.includes('mark')) map['score'] = c;
    }

    if (map['question'] !== undefined && map['correct'] !== undefined) {
      headerRowIndex = r;
      colMap = map;
      break;
    }
  }

  if (headerRowIndex === -1) {
    errors.push({
      row: 1,
      field: 'header',
      message: 'Không tìm thấy dòng tiêu đề hợp lệ trong sheet. Tệp cần có ít nhất các cột: "Câu hỏi" và "Đáp án đúng" (hoặc xem mẫu).',
      level: 'error',
    });
    return { isValid: false, errors, warnings, info: assignmentInfo, questions: [] };
  }

  // 5. Parse and validate question rows
  const parsedQuestions: ParsedQuestionRow[] = [];
  const seenSTT = new Set<number>();
  const seenQuestions = new Set<string>();

  for (let r = headerRowIndex + 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    const excelRowNumber = r + 1; // 1-based index in Excel

    // Check if empty row
    if (!row || !Array.isArray(row) || row.every(cell => cell === null || cell === undefined || String(cell).trim() === '')) {
      continue; // Skip entirely blank lines safely
    }

    const getVal = (colKey: string): string => {
      const colIdx = colMap[colKey];
      if (colIdx === undefined || colIdx >= row.length) return '';
      const v = row[colIdx];
      return v !== null && v !== undefined ? String(v).trim() : '';
    };

    const questionText = getVal('question');
    const rawType = getVal('type').toUpperCase();
    const optA = getVal('a');
    const optB = getVal('b');
    const optC = getVal('c');
    const optD = getVal('d');
    const rawCorrect = getVal('correct');
    const explanation = getVal('explanation');
    const rawScore = getVal('score');
    const rawStt = getVal('stt');

    // Validation: Question Text Empty
    if (!questionText) {
      errors.push({
        row: excelRowNumber,
        field: 'Câu hỏi',
        message: `Dòng ${excelRowNumber}: Nội dung câu hỏi đang để trống.`,
        level: 'error',
      });
      continue;
    }

    // Determine type
    let qType: QuestionType = 'MCQ';
    if (rawType.includes('TEXT') || rawType.includes('NHAP') || rawType.includes('ĐIỀN')) {
      qType = 'TEXT';
    } else if (rawType.includes('TRUE') || rawType.includes('ĐÚNG') || rawType.includes('DUNG') || rawType.includes('TF')) {
      qType = 'TRUEFALSE';
    } else if (optA || optB || optC || optD) {
      qType = 'MCQ';
    } else {
      // If no options, might be TEXT
      qType = 'TEXT';
    }

    // Validation: Correct Answer Missing
    if (!rawCorrect) {
      errors.push({
        row: excelRowNumber,
        field: 'Đáp án đúng',
        message: `Dòng ${excelRowNumber}: Chưa nhập đáp án đúng.`,
        level: 'error',
      });
    }

    // Format & validate correct answer based on type
    let finalCorrect = rawCorrect;

    if (qType === 'MCQ') {
      const upperCorrect = rawCorrect.toUpperCase();
      if (!['A', 'B', 'C', 'D'].includes(upperCorrect)) {
        errors.push({
          row: excelRowNumber,
          field: 'Đáp án đúng',
          message: `Dòng ${excelRowNumber}: Đáp án "${rawCorrect}" không hợp lệ. Với câu hỏi trắc nghiệm MCQ, đáp án đúng phải là một trong 4 ký tự A, B, C, hoặc D.`,
          level: 'error',
        });
      } else {
        finalCorrect = upperCorrect;
      }

      // Check if options exist
      if (!optA || !optB) {
        errors.push({
          row: excelRowNumber,
          field: 'Phương án',
          message: `Dòng ${excelRowNumber}: Câu trắc nghiệm MCQ phải có ít nhất 2 phương án (Đáp án A và Đáp án B).`,
          level: 'error',
        });
      }
    } else if (qType === 'TRUEFALSE') {
      const cleanTF = rawCorrect.toLowerCase().replace(/[^a-z0-9à-ỹ]/gi, '');
      if (['đúng', 'dung', 'true', 'd', 't', '1'].includes(cleanTF)) {
        finalCorrect = 'Đúng';
      } else if (['sai', 'false', 's', 'f', '0'].includes(cleanTF)) {
        finalCorrect = 'Sai';
      } else {
        errors.push({
          row: excelRowNumber,
          field: 'Đáp án đúng',
          message: `Dòng ${excelRowNumber}: Đáp án đúng của câu Đúng/Sai phải là "Đúng" hoặc "Sai" (nhập "${rawCorrect}").`,
          level: 'error',
        });
      }
    }

    // Validation: Score
    let finalScore = 1;
    if (rawScore) {
      const numScore = parseFloat(rawScore.replace(',', '.'));
      if (isNaN(numScore) || numScore <= 0) {
        errors.push({
          row: excelRowNumber,
          field: 'Điểm',
          message: `Dòng ${excelRowNumber}: Điểm "${rawScore}" không phải là số hợp lệ (> 0).`,
          level: 'error',
        });
      } else {
        finalScore = numScore;
      }
    }

    // Check Duplicate STT
    let sttNum = parsedQuestions.length + 1;
    if (rawStt) {
      const parsedNum = parseInt(rawStt, 10);
      if (!isNaN(parsedNum)) {
        if (seenSTT.has(parsedNum)) {
          warnings.push({
            row: excelRowNumber,
            field: 'STT',
            message: `Dòng ${excelRowNumber}: STT ${parsedNum} bị trùng lặp.`,
            level: 'warning',
          });
        }
        seenSTT.add(parsedNum);
        sttNum = parsedNum;
      }
    }

    // Check duplicate question text
    const normQ = questionText.toLowerCase().replace(/\s+/g, ' ');
    if (seenQuestions.has(normQ)) {
      warnings.push({
        row: excelRowNumber,
        field: 'Câu hỏi',
        message: `Dòng ${excelRowNumber}: Nội dung câu hỏi có vẻ bị trùng với một câu phía trên.`,
        level: 'warning',
      });
    }
    seenQuestions.add(normQ);

    parsedQuestions.push({
      row_num: excelRowNumber,
      stt: sttNum,
      type: qType,
      question_text: questionText,
      option_a: optA,
      option_b: optB,
      option_c: optC,
      option_d: optD,
      correct_answer: finalCorrect,
      explanation: explanation || 'Xem lại kiến thức trong SGK Vật lý 11 Kết nối tri thức.',
      score: finalScore,
    });
  }

  if (parsedQuestions.length === 0 && errors.length === 0) {
    errors.push({
      row: 0,
      field: 'data',
      message: 'Không tìm thấy câu hỏi hợp lệ nào trong tệp Excel.',
      level: 'error',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    info: assignmentInfo,
    questions: parsedQuestions,
  };
}

/**
 * Converts parsed Excel questions and info into permanent Assignment & Question models.
 */
export function convertParsedToAssignment(
  parsed: ExcelParseResult,
  assignmentOverrides?: Partial<Assignment>
): { assignment: Assignment; questions: Question[] } {
  const assignmentId = 'asg-' + Date.now();
  const assignment: Assignment = {
    id: assignmentId,
    title: assignmentOverrides?.title || parsed.info.title || 'Bài tập Vật lý 11',
    topic: assignmentOverrides?.topic || parsed.info.topic || 'Chuyên đề Vật lý 11',
    description: assignmentOverrides?.description || parsed.info.description || 'Bài tập tải từ file Excel',
    duration: assignmentOverrides?.duration ?? parsed.info.duration ?? 30,
    max_attempts: assignmentOverrides?.max_attempts ?? parsed.info.max_attempts ?? 3,
    shuffle_questions: assignmentOverrides?.shuffle_questions ?? parsed.info.shuffle_questions ?? true,
    shuffle_answers: assignmentOverrides?.shuffle_answers ?? parsed.info.shuffle_answers ?? true,
    status: assignmentOverrides?.status || 'OPEN',
    allowed_class_ids: assignmentOverrides?.allowed_class_ids || [],
    show_solution_mode: assignmentOverrides?.show_solution_mode || 'IMMEDIATE',
    created_at: new Date().toISOString(),
  };

  const questions: Question[] = parsed.questions.map((q, idx) => ({
    id: `q-${assignmentId}-${idx + 1}`,
    assignment_id: assignmentId,
    question_type: q.type,
    question_text: q.question_text,
    option_a: q.option_a,
    option_b: q.option_b,
    option_c: q.option_c,
    option_d: q.option_d,
    correct_answer: q.correct_answer,
    explanation: q.explanation,
    score: q.score,
    order_index: idx + 1,
  }));

  assignment.questions = questions;
  return { assignment, questions };
}

/**
 * Section XXV: Export exam results to Excel (.xlsx) with at least 3 sheets:
 * Sheet 1: KET_QUA
 * Sheet 2: TONG_HOP
 * Sheet 3: THONG_KE_CAU_HOI
 */
export function exportResultsToExcel(
  attempts: ExamAttempt[],
  assignments: Assignment[],
  questions: Question[],
  filterAssignmentId?: string
): void {
  const filteredAttempts = filterAssignmentId
    ? attempts.filter(a => a.assignment_id === filterAssignmentId)
    : attempts;

  const wb = XLSX.utils.book_new();

  // ----------------- SHEET 1: KET_QUA -----------------
  const sheet1Data: (string | number)[][] = [
    [
      'STT',
      'Họ tên',
      'Email',
      'Lớp',
      'Tên bài',
      'Lần làm',
      'Số câu đúng',
      'Số câu sai',
      'Số câu bỏ trống',
      'Điểm số (/10)',
      'Thời gian bắt đầu',
      'Thời gian nộp',
      'Thời gian làm bài',
    ],
  ];

  filteredAttempts.forEach((att, idx) => {
    const timeSpent = `${Math.floor(att.time_spent_seconds / 60)} phút ${att.time_spent_seconds % 60} giây`;
    sheet1Data.push([
      idx + 1,
      att.student_name,
      att.student_email,
      att.student_class,
      att.assignment_title,
      `Lần ${att.attempt_number}`,
      att.correct_count,
      att.wrong_count,
      att.unanswered_count,
      att.score,
      new Date(att.started_at).toLocaleString('vi-VN'),
      new Date(att.submitted_at).toLocaleString('vi-VN'),
      timeSpent,
    ]);
  });

  const wsKetQua = XLSX.utils.aoa_to_sheet(sheet1Data);
  wsKetQua['!cols'] = [
    { wch: 6 },
    { wch: 22 },
    { wch: 25 },
    { wch: 12 },
    { wch: 35 },
    { wch: 10 },
    { wch: 12 },
    { wch: 12 },
    { wch: 14 },
    { wch: 14 },
    { wch: 22 },
    { wch: 22 },
    { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(wb, wsKetQua, 'KET_QUA');

  // ----------------- SHEET 2: TONG_HOP -----------------
  const uniqueStudents = new Set(filteredAttempts.map(a => a.student_email.toLowerCase())).size;
  const totalAttempts = filteredAttempts.length;
  const scores = filteredAttempts.map(a => a.score);
  const avgScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : 0;
  const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
  const minScore = scores.length > 0 ? Math.min(...scores) : 0;
  const passCount = scores.filter(s => s >= 5.0).length;
  const passRate = totalAttempts > 0 ? ((passCount / totalAttempts) * 100).toFixed(1) + '%' : '0%';

  // Distribution
  const dist0_5 = scores.filter(s => s < 5.0).length;
  const dist5_65 = scores.filter(s => s >= 5.0 && s < 6.5).length;
  const dist65_8 = scores.filter(s => s >= 6.5 && s < 8.0).length;
  const dist8_9 = scores.filter(s => s >= 8.0 && s < 9.0).length;
  const dist9_10 = scores.filter(s => s >= 9.0).length;

  const sheet2Data: (string | number)[][] = [
    ['BÁO CÁO TỔNG HỢP KẾT QUẢ HỌC TẬP VẬT LÝ 11 - THẦY THÀNH', ''],
    ['Ngày xuất báo cáo:', new Date().toLocaleString('vi-VN')],
    ['', ''],
    ['Chỉ số thống kê', 'Giá trị'],
    ['Số học sinh tham gia', uniqueStudents],
    ['Số lượt làm bài', totalAttempts],
    ['Điểm trung bình', avgScore],
    ['Điểm cao nhất', maxScore],
    ['Điểm thấp nhất', minScore],
    ['Tỷ lệ đạt (Điểm ≥ 5.0)', passRate],
    ['', ''],
    ['Phân bố phổ điểm', 'Số học sinh / lượt làm'],
    ['Dưới 5.0 (Cần luyện thêm)', dist0_5],
    ['5.0 – < 6.5 (Đạt)', dist5_65],
    ['6.5 – < 8.0 (Khá)', dist65_8],
    ['8.0 – < 9.0 (Rất tốt)', dist8_9],
    ['9.0 – 10.0 (Xuất sắc)', dist9_10],
  ];

  const wsTongHop = XLSX.utils.aoa_to_sheet(sheet2Data);
  wsTongHop['!cols'] = [{ wch: 35 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, wsTongHop, 'TONG_HOP');

  // ----------------- SHEET 3: THONG_KE_CAU_HOI -----------------
  const sheet3Data: (string | number)[][] = [
    ['Câu số', 'Nội dung câu hỏi', 'Loại câu', 'Đáp án đúng', 'Số HS trả lời', 'Số đúng', 'Số sai', 'Tỷ lệ đúng (%)', 'Đánh giá / Ghi chú'],
  ];

  // If filterAssignmentId provided, take its questions; else all questions
  const relevantQuestions = filterAssignmentId
    ? questions.filter(q => q.assignment_id === filterAssignmentId)
    : questions;

  relevantQuestions.forEach((q, idx) => {
    let answeredCount = 0;
    let correctCount = 0;
    let wrongCount = 0;

    filteredAttempts.forEach(att => {
      const studentAns = att.answers[q.id];
      if (studentAns !== undefined && studentAns !== '') {
        answeredCount++;
        // Check correctness
        const isCorrect = isAnswerCorrectForExport(studentAns, q.correct_answer, q.question_type);
        if (isCorrect) correctCount++;
        else wrongCount++;
      }
    });

    const rate = answeredCount > 0 ? ((correctCount / answeredCount) * 100).toFixed(1) : '0';
    let note = 'Bình thường';
    if (answeredCount > 0 && parseFloat(rate) < 50) {
      note = 'CẢNH BÁO: Tỷ lệ sai cao. Nên ôn tập lại kiến thức này!';
    } else if (answeredCount > 0 && parseFloat(rate) >= 85) {
      note = 'Học sinh nắm rất vững';
    }

    sheet3Data.push([
      idx + 1,
      q.question_text,
      q.question_type,
      q.correct_answer,
      answeredCount,
      correctCount,
      wrongCount,
      `${rate}%`,
      note,
    ]);
  });

  const wsThongKeCauHoi = XLSX.utils.aoa_to_sheet(sheet3Data);
  wsThongKeCauHoi['!cols'] = [
    { wch: 8 },
    { wch: 50 },
    { wch: 12 },
    { wch: 14 },
    { wch: 14 },
    { wch: 12 },
    { wch: 12 },
    { wch: 16 },
    { wch: 45 },
  ];
  XLSX.utils.book_append_sheet(wb, wsThongKeCauHoi, 'THONG_KE_CAU_HOI');

  const fileName = filterAssignmentId
    ? `Ket_Qua_${filterAssignmentId}_${Date.now()}.xlsx`
    : `Tong_Ket_Ket_Qua_Vat_Ly_11_${Date.now()}.xlsx`;

  XLSX.writeFile(wb, fileName);
}

function isAnswerCorrectForExport(studentAnswer: string, correctAnswer: string, questionType: QuestionType): boolean {
  if (!studentAnswer) return false;
  const userAns = studentAnswer.trim();
  const targetAns = correctAnswer.trim();

  if (questionType === 'MCQ') {
    return userAns.toUpperCase() === targetAns.toUpperCase();
  }
  if (questionType === 'TRUEFALSE') {
    const norm = (v: string) => (['đúng', 'dung', 'true', 'd', 't', '1'].includes(v.toLowerCase()) ? 'true' : 'false');
    return norm(userAns) === norm(targetAns);
  }
  if (questionType === 'TEXT') {
    const cleanU = parseFloat(userAns.replace(',', '.'));
    const cleanT = parseFloat(targetAns.replace(',', '.'));
    if (!isNaN(cleanU) && !isNaN(cleanT)) {
      return Math.abs(cleanU - cleanT) < 0.0001;
    }
    return userAns.toLowerCase() === targetAns.toLowerCase();
  }
  return false;
}

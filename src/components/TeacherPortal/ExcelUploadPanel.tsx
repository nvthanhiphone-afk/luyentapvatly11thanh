import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  UploadCloud,
  Download,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Play,
  FileQuestion,
  HelpCircle,
  Sparkles,
  Info
} from 'lucide-react';
import {
  convertParsedToAssignment,
  downloadPhysics11TestExcel,
  downloadSampleExcelTemplate,
  parseAndValidateExcel
} from '../../services/excel';
import { Assignment, ClassRoom, ExcelParseResult } from '../../types';
import { saveQuestions } from '../../services/storage';
import { ExcelPreviewModal } from './ExcelPreviewModal';
import * as XLSX from 'xlsx';

interface ExcelUploadPanelProps {
  classes: ClassRoom[];
  onImportComplete: (assignment: Assignment, count: number) => void;
}

export const ExcelUploadPanel: React.FC<ExcelUploadPanelProps> = ({
  classes,
  onImportComplete,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseResult, setParseResult] = useState<ExcelParseResult | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = async (file: File) => {
    setFileName(file.name);
    setIsProcessing(true);
    setParseResult(null);

    try {
      const result = await parseAndValidateExcel(file);
      setParseResult(result);
      if (result.isValid) {
        setShowPreviewModal(true);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setParseResult({
        isValid: false,
        errors: [
          {
            row: 0,
            field: 'file',
            message: `Lỗi đọc file Excel: ${message}`,
            level: 'error',
          },
        ],
        warnings: [],
        info: {
          title: file.name,
          topic: 'Vật lý 11',
          description: '',
          duration: 30,
          max_attempts: 3,
          shuffle_questions: true,
          shuffle_answers: true,
        },
        questions: [],
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleConfirmImport = (overrides: Partial<Assignment>) => {
    if (!parseResult) return;
    const { assignment, questions } = convertParsedToAssignment(parseResult, overrides);
    saveQuestions(questions);
    setShowPreviewModal(false);
    onImportComplete(assignment, questions.length);
  };

  // Quick test file with deliberate errors for Section XXXI verification
  const handleDownloadTestErrorExcel = () => {
    const wb = XLSX.utils.book_new();
    const data = [
      ['STT', 'Loại câu', 'Câu hỏi', 'Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D', 'Đáp án đúng', 'Lời giải', 'Điểm'],
      [1, 'MCQ', 'Một con lắc lò xo dao động điều hòa...', 'A', 'B', 'C', 'D', 'A', 'Lời giải 1', 1],
      [2, 'MCQ', '', 'A', 'B', 'C', 'D', 'B', 'Lời giải 2', 1], // Error: empty question
      [3, 'MCQ', 'Tần số góc của dao động là gì?', 'A', 'B', 'C', 'D', '', 'Lời giải 3', 1], // Error: missing correct answer
      [4, 'MCQ', 'Vận tốc cực đại bằng bao nhiêu?', 'A', 'B', 'C', 'D', 'E', 'Lời giải 4', 1], // Error: invalid key E
      [5, 'TRUEFALSE', 'Sóng âm truyền trong chân không.', 'Đúng', 'Sai', '', '', 'Không rõ', 'Lời giải 5', 1], // Error: invalid TF
      [6, 'MCQ', 'Chu kỳ dao động T là bao nhiêu?', '1s', '2s', '3s', '4s', 'A', 'Lời giải 6', 'sai_diem'], // Error: invalid score
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'CAU_HOI');
    XLSX.writeFile(wb, 'File_Test_Mau_Loi_Kiem_Thu.xlsx');
  };

  return (
    <div className="space-y-8">
      {/* Top Banner / Guidance */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-3xl border border-blue-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            <span>TẢI CÂU HỎI TỪ FILE EXCEL (.XLSX)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Giáo viên không cần nhập từng câu trực tiếp trên website. Chỉ cần chuẩn bị câu hỏi và đáp án trong file Excel theo mẫu, hệ thống sẽ tự động đọc, kiểm tra lỗi và nhập vào ngân hàng đề thi.
          </p>
        </div>

        {/* Action Buttons: Download templates */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={downloadSampleExcelTemplate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>TẢI FILE EXCEL MẪU</span>
          </button>

          <button
            type="button"
            onClick={downloadPhysics11TestExcel}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>TẢI ĐỀ THI THỬ NGHIỆM 12 CÂU (.XLSX)</span>
          </button>
        </div>
      </div>

      {/* Drag & Drop Area (Section XIV) */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-3 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-blue-500 bg-blue-50/80 scale-[1.01]'
            : 'border-slate-300 hover:border-blue-400 bg-white hover:bg-slate-50/50'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept=".xlsx,.xls"
          onChange={e => {
            if (e.target.files && e.target.files.length > 0) {
              handleFileSelected(e.target.files[0]);
            }
          }}
          className="hidden"
        />

        <div className="w-20 h-20 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
          <UploadCloud className="w-10 h-10" />
        </div>

        <h3 className="text-lg sm:text-xl font-black text-slate-800">
          KÉO FILE EXCEL VÀO ĐÂY
        </h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          hoặc bấm vào đây để duyệt tệp từ máy tính của bạn (Định dạng hỗ trợ: .xlsx, .xls)
        </p>

        <button
          type="button"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md shadow-blue-500/20 transition-all"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>CHỌN FILE EXCEL</span>
        </button>

        {isProcessing && (
          <div className="mt-4 text-xs font-bold text-blue-600 animate-pulse">
            Đang đọc và phân tích cú pháp tệp Excel...
          </div>
        )}
      </div>

      {/* Validation Results (Section XVII & XVIII) */}
      {parseResult && !isProcessing && (
        <div className="space-y-4">
          {parseResult.isValid ? (
            /* Valid result notification */
            <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-emerald-950">
                    Tệp Excel hợp lệ! Đã tìm thấy {parseResult.questions.length} câu hỏi.
                  </h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Tệp: <strong>{fileName}</strong> • Tiêu đề bài: <strong>{parseResult.info.title}</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                XEM LẠI & XÁC NHẬN NHẬP
              </button>
            </div>
          ) : (
            /* Error list with line numbers as explicitly requested in Section XVII */
            <div className="p-6 rounded-3xl bg-rose-50 border-2 border-rose-200 text-rose-900 space-y-4 animate-in fade-in">
              <div className="flex items-center gap-3 border-b border-rose-200 pb-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-base text-rose-950">
                    Không thể nhập file Excel ({parseResult.errors.length} lỗi phát hiện)
                  </h4>
                  <p className="text-xs text-rose-700">
                    Hệ thống đã kiểm tra toàn bộ từng dòng trong file. Vui lòng sửa các dòng lỗi sau đây rồi tải lại file:
                  </p>
                </div>
              </div>

              {/* Exact Line-by-Line Error Display as required in Section XVII */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {parseResult.errors.map((err, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-rose-200 text-xs text-rose-800 shadow-2xs"
                  >
                    <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 font-bold font-mono text-[11px] shrink-0">
                      {err.row > 0 ? `Dòng ${err.row}` : 'Cấu trúc file'}
                    </span>
                    <span className="font-medium leading-relaxed">{err.message}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-rose-700">
                <span>💡 Tải file mẫu để đối chiếu đúng tên cột và cú pháp đáp án.</span>
                <button
                  type="button"
                  onClick={downloadSampleExcelTemplate}
                  className="font-bold underline text-rose-900 hover:text-rose-950"
                >
                  Tải lại mẫu chuẩn
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Testing Section XXXI: Quick Error Generator */}
      <div className="p-5 rounded-2xl bg-slate-100/80 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600">
            <strong className="text-slate-800">Kiểm thử trường hợp lỗi (Mục XXXI): </strong>
            Thử tải lên tệp cố tình chứa các lỗi (thiếu câu hỏi, thiếu đáp án, đáp án E, điểm sai) để kiểm tra tính năng bắt lỗi tự động của hệ thống.
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownloadTestErrorExcel}
          className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-xs transition-colors shrink-0 cursor-pointer"
        >
          Tải file test chứa các lỗi mẫu (.xlsx)
        </button>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && parseResult && parseResult.isValid && (
        <ExcelPreviewModal
          parseResult={parseResult}
          classes={classes}
          onConfirm={handleConfirmImport}
          onCancel={() => setShowPreviewModal(false)}
        />
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { X, Copy, Check, Printer, FileText } from 'lucide-react';
import { SystemAnalysis } from '../utils/equation';
import { Language, translations } from '../i18n/translations';

interface HomeworkExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: SystemAnalysis;
  method: 'substitution' | 'elimination';
  lang: Language;
}

export const HomeworkExportModal: React.FC<HomeworkExportModalProps> = ({
  isOpen,
  onClose,
  analysis,
  method,
  lang,
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const t = translations[lang];
  const isZh = lang === 'zh';

  if (!isOpen) return null;

  const solMethod = method === 'substitution' ? analysis.substitutionMethod : analysis.eliminationMethod;

  const generatePlainText = () => {
    if (!analysis.solution || !solMethod) return '';

    const lines: string[] = [];
    if (isZh) {
      lines.push(`【初中数学作业规范答题】`);
      lines.push(`解方程组：`);
      lines.push(`  ① ${analysis.line1.texForm.replace(/-\\frac\{(\d+)\}\{(\d+)\}/g, '-$1/$2').replace(/\\frac\{(\d+)\}\{(\d+)\}/g, '$1/$2')}`);
      lines.push(`  ② ${analysis.line2.texForm.replace(/-\\frac\{(\d+)\}\{(\d+)\}/g, '-$1/$2').replace(/\\frac\{(\d+)\}\{(\d+)\}/g, '$1/$2')}`);
      lines.push(``);
      lines.push(`【解题方法：${solMethod.name}】`);
      lines.push(`解：`);

      solMethod.steps.forEach((step) => {
        lines.push(`${step.title}`);
        lines.push(`  ${step.desc}`);
      });

      lines.push(``);
      lines.push(`所以，原方程组的解为：`);
      lines.push(`  x = ${analysis.solution.x.toString()}`);
      lines.push(`  y = ${analysis.solution.y.toString()}`);
    } else {
      lines.push(`[Standard Algebra Homework Solution]`);
      lines.push(`Solve the system of equations:`);
      lines.push(`  ① ${analysis.line1.texForm.replace(/-\\frac\{(\d+)\}\{(\d+)\}/g, '-$1/$2').replace(/\\frac\{(\d+)\}\{(\d+)\}/g, '$1/$2')}`);
      lines.push(`  ② ${analysis.line2.texForm.replace(/-\\frac\{(\d+)\}\{(\d+)\}/g, '-$1/$2').replace(/\\frac\{(\d+)\}\{(\d+)\}/g, '$1/$2')}`);
      lines.push(``);
      lines.push(`[Method: ${solMethod.name}]`);
      lines.push(`Solution:`);

      solMethod.steps.forEach((step) => {
        lines.push(`${step.title}`);
        lines.push(`  ${step.desc}`);
      });

      lines.push(``);
      lines.push(`Therefore, the solution to the system is:`);
      lines.push(`  x = ${analysis.solution.x.toString()}`);
      lines.push(`  y = ${analysis.solution.y.toString()}`);
    }

    return lines.join('\n');
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">{t.exportTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Homework Paper Sheet Preview */}
        <div className="p-6 overflow-y-auto flex-1 font-sans bg-slate-50/50">
          <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4 print:p-0 print:border-none">
            <div className="border-b border-slate-200 pb-3 text-center">
              <h2 className="text-lg font-bold text-slate-900">{t.exportDocHeader}</h2>
              <p className="text-xs text-slate-400 mt-1">{t.exportDocSub} · {solMethod?.name}</p>
            </div>

            <div className="text-sm text-slate-800 space-y-4 leading-relaxed font-mono">
              <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100 select-all">
                {generatePlainText()}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/80">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>{t.exportPrintBtn}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(generatePlainText(), 'text')}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
            >
              {copiedType === 'text' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedType === 'text' ? t.exportCopiedBtn : t.exportCopyBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

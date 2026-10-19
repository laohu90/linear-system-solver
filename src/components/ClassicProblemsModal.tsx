import React, { useState } from 'react';
import { X, BookOpen, ChevronRight, Check } from 'lucide-react';
import { PRESET_PROBLEMS, PresetProblem } from '../data/presetProblems';
import { parseLinearEquation, EquationStandard } from '../utils/equation';

interface ClassicProblemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProblem: (eq1: EquationStandard, eq2: EquationStandard, title?: string) => void;
}

export const ClassicProblemsModal: React.FC<ClassicProblemsModalProps> = ({
  isOpen,
  onClose,
  onSelectProblem,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');

  if (!isOpen) return null;

  const categories = ['全部', '基础练习', '中考常考', '变式去括号与去分母', '特殊解判定', '经典实际应用题'];

  const filteredProblems =
    selectedCategory === '全部'
      ? PRESET_PROBLEMS
      : PRESET_PROBLEMS.filter((p) => p.category === selectedCategory);

  const handleSelect = (prob: PresetProblem) => {
    try {
      const parsed1 = parseLinearEquation(prob.eq1Str);
      const parsed2 = parseLinearEquation(prob.eq2Str);
      onSelectProblem(
        { a: parsed1.a, b: parsed1.b, c: parsed1.c, rawStr: prob.eq1Str },
        { a: parsed2.a, b: parsed2.b, c: parsed2.c, rawStr: prob.eq2Str },
        prob.title
      );
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">初中经典二元一次方程组精选题库</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 px-6 py-3 border-b border-slate-100 overflow-x-auto text-xs shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Problem List */}
        <div className="p-6 overflow-y-auto space-y-3.5 divide-y divide-slate-100">
          {filteredProblems.map((prob) => (
            <div
              key={prob.id}
              onClick={() => handleSelect(prob)}
              className="pt-3.5 first:pt-0 group cursor-pointer p-4 rounded-xl border border-transparent hover:border-blue-200 hover:bg-blue-50/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {prob.title}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                    {prob.category}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                      prob.difficulty === '基础'
                        ? 'bg-emerald-50 text-emerald-700'
                        : prob.difficulty === '中等'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {prob.difficulty}
                  </span>
                </div>

                {prob.applicationContext ? (
                  <div className="p-2.5 bg-slate-50 rounded-lg text-xs text-slate-700 space-y-1">
                    <p className="font-serif italic text-slate-800">“{prob.applicationContext.story}”</p>
                    <div className="text-[11px] text-slate-500">
                      <strong>设元与列式：</strong> {prob.applicationContext.letVars}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">{prob.desc}</p>
                )}

                <div className="font-mono text-xs text-blue-700 font-semibold bg-blue-50/60 inline-block px-2.5 py-1 rounded">
                  {prob.eq1Str} ； {prob.eq2Str}
                </div>
              </div>

              <button className="flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:text-blue-800 shrink-0 self-start md:self-center">
                <span>载入求解</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

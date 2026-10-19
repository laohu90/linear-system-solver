import React, { useState } from 'react';
import { X, BookOpen, ChevronRight } from 'lucide-react';
import { PRESET_PROBLEMS, PresetProblem } from '../data/presetProblems';
import { parseLinearEquation, EquationStandard } from '../utils/equation';
import { Language, translations } from '../i18n/translations';

interface ClassicProblemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProblem: (eq1: EquationStandard, eq2: EquationStandard, title?: string) => void;
  lang: Language;
}

export const ClassicProblemsModal: React.FC<ClassicProblemsModalProps> = ({
  isOpen,
  onClose,
  onSelectProblem,
  lang,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const t = translations[lang];
  const isZh = lang === 'zh';

  if (!isOpen) return null;

  const categoryOptions = [
    { key: 'all', label: t.catAll },
    { key: 'basic', label: t.catBasic, zh: '基础练习', en: 'Foundations' },
    { key: 'exam', label: t.catExam, zh: '中考常考', en: 'Exam Standards' },
    { key: 'transform', label: t.catTransform, zh: '变式去括号与去分母', en: 'Brackets & Fractions' },
    { key: 'special', label: t.catSpecial, zh: '特殊解判定', en: 'Special Cases' },
    { key: 'applied', label: t.catApplied, zh: '经典实际应用题', en: 'Word Problems' },
  ];

  const filteredProblems = PRESET_PROBLEMS.filter((p) => {
    if (selectedCategory === 'all') return true;
    const opt = categoryOptions.find((o) => o.key === selectedCategory);
    return opt && (p.category === opt.zh || p.categoryEn === opt.en);
  });

  const handleSelect = (prob: PresetProblem) => {
    try {
      const parsed1 = parseLinearEquation(prob.eq1Str);
      const parsed2 = parseLinearEquation(prob.eq2Str);
      onSelectProblem(
        { a: parsed1.a, b: parsed1.b, c: parsed1.c, rawStr: prob.eq1Str },
        { a: parsed2.a, b: parsed2.b, c: parsed2.c, rawStr: prob.eq2Str },
        isZh ? prob.title : prob.titleEn
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
            <h3 className="text-base font-bold text-slate-900">{t.presetsTitle}</h3>
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
          {categoryOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSelectedCategory(opt.key)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium ${
                selectedCategory === opt.key
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {opt.label}
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
                    {isZh ? prob.title : prob.titleEn}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                    {isZh ? prob.category : prob.categoryEn}
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
                    {isZh ? prob.difficulty : prob.difficultyEn}
                  </span>
                </div>

                {prob.applicationContext ? (
                  <div className="p-2.5 bg-slate-50 rounded-lg text-xs text-slate-700 space-y-1">
                    <p className="font-serif italic text-slate-800">
                      “{isZh ? prob.applicationContext.story : prob.applicationContext.storyEn}”
                    </p>
                    <div className="text-[11px] text-slate-500">
                      <strong>{t.setupFormula}</strong>{' '}
                      {isZh ? prob.applicationContext.letVars : prob.applicationContext.letVarsEn}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">{isZh ? prob.desc : prob.descEn}</p>
                )}

                <div className="font-mono text-xs text-blue-700 font-semibold bg-blue-50/60 inline-block px-2.5 py-1 rounded">
                  {prob.eq1Str} ; {prob.eq2Str}
                </div>
              </div>

              <button className="flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:text-blue-800 shrink-0 self-start md:self-center">
                <span>{t.btnLoadProblem}</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

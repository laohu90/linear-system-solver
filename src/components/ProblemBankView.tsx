import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  ArrowRight,
  Sparkles,
  Layers,
  GraduationCap,
  CheckCircle2,
} from 'lucide-react';
import { MathView } from './MathView';
import { PRESET_PROBLEMS, PresetProblem } from '../data/presetProblems';
import { parseLinearEquation, EquationStandard } from '../utils/equation';
import { Language, translations } from '../i18n/translations';

interface ProblemBankViewProps {
  onLoadProblem: (eq1: EquationStandard, eq2: EquationStandard, title?: string) => void;
  lang?: Language;
}

export const ProblemBankView: React.FC<ProblemBankViewProps> = ({
  onLoadProblem,
  lang = 'en',
}) => {
  const t = translations[lang];
  const isZh = lang === 'zh';

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loadedId, setLoadedId] = useState<string | null>(null);

  const categories = useMemo(() => {
    return [
      { id: 'all', label: isZh ? '全部' : 'All' },
      { id: '基础练习', label: isZh ? '基础练习' : 'Foundations' },
      { id: '中考常考', label: isZh ? '中考常考' : 'Exam Standards' },
      { id: '变式去括号与去分母', label: isZh ? '去括号与去分母' : 'Brackets & Fractions' },
      { id: '特殊解判定', label: isZh ? '特殊解判定' : 'Special Cases' },
      { id: '经典实际应用题', label: isZh ? '实际应用题' : 'Word Problems' },
    ];
  }, [isZh]);

  const filteredProblems = useMemo(() => {
    return PRESET_PROBLEMS.filter((p) => {
      const matchesCat = activeCategory === 'all' || p.category === activeCategory;
      if (!matchesCat) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const title = (isZh ? p.title : p.titleEn).toLowerCase();
      const desc = (isZh ? p.desc || '' : p.descEn || '').toLowerCase();
      const story = p.applicationContext
        ? (isZh ? p.applicationContext.story : p.applicationContext.storyEn).toLowerCase()
        : '';
      return title.includes(q) || desc.includes(q) || story.includes(q) || p.eq1Str.includes(q) || p.eq2Str.includes(q);
    });
  }, [activeCategory, searchQuery, isZh]);

  const handleSelect = (prob: PresetProblem) => {
    try {
      const eq1 = parseLinearEquation(prob.eq1Str, ['x', 'y'], lang);
      const eq2 = parseLinearEquation(prob.eq2Str, ['x', 'y'], lang);
      setLoadedId(prob.id);
      setTimeout(() => {
        onLoadProblem(
          { a: eq1.a, b: eq1.b, c: eq1.c, rawStr: prob.eq1Str },
          { a: eq2.a, b: eq2.b, c: eq2.c, rawStr: prob.eq2Str },
          isZh ? prob.title : prob.titleEn
        );
      }, 300);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <span>{t.problemBankHeading}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">{t.problemBankSub}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
              {filteredProblems.length} {isZh ? '道精选题' : 'Curated Problems'}
            </span>
          </div>
        </div>

        {/* Search & Categories Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchProblems}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Problem Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProblems.map((prob) => {
          const isSelected = loadedId === prob.id;

          return (
            <div
              key={prob.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Badges */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                    {isZh ? prob.category : prob.categoryEn}
                  </span>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      prob.difficulty === '基础'
                        ? 'bg-emerald-50 text-emerald-700'
                        : prob.difficulty === '中等'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {isZh ? prob.difficulty : prob.difficultyEn}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                  {isZh ? prob.title : prob.titleEn}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {isZh ? prob.desc : prob.descEn}
                </p>

                {/* Applied Story Box */}
                {prob.applicationContext && (
                  <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-lg text-xs text-amber-950 mb-3 space-y-1.5">
                    <p className="leading-relaxed font-serif text-[11px]">
                      {isZh ? prob.applicationContext.story : prob.applicationContext.storyEn}
                    </p>
                    <div className="text-[10px] text-amber-800 font-medium">
                      💡 {isZh ? prob.applicationContext.letVars : prob.applicationContext.letVarsEn}
                    </div>
                  </div>
                )}

                {/* Math Formulas */}
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg text-center font-mono my-3">
                  <MathView math={`\\begin{cases} ${prob.eq1Str} \\\\ ${prob.eq2Str} \\end{cases}`} />
                </div>
              </div>

              {/* Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {prob.category === '经典实际应用题' ? (isZh ? '应用题建模' : 'Applied Modeling') : (isZh ? '代数消元' : 'Standard Elimination')}
                </span>
                <button
                  onClick={() => handleSelect(prob)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    isSelected
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xs'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t.loadedToSolver}</span>
                    </>
                  ) : (
                    <>
                      <span>{t.loadProblem}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProblems.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-sm font-semibold text-slate-700">
            {isZh ? '没有找到符合条件的题目' : 'No matching problems found'}
          </h4>
          <p className="text-xs text-slate-400">
            {isZh ? '可尝试更换筛选类别或搜索关键词' : 'Try clearing the search or switching categories.'}
          </p>
        </div>
      )}
    </div>
  );
};

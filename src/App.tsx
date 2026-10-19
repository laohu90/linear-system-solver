import React, { useState, useMemo, useEffect } from 'react';
import {
  Compass,
  GraduationCap,
  FileText,
  HelpCircle,
  Languages,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { EquationStandard, solveLinearSystem, SystemAnalysis } from './utils/equation';
import { Fraction } from './utils/fraction';
import { EquationInputPanel } from './components/EquationInputPanel';
import { SolutionStepsView } from './components/SolutionStepsView';
import { CoordinateGraph } from './components/CoordinateGraph';
import { EliminationQuizPractice } from './components/EliminationQuizPractice';
import { ClassicProblemsModal } from './components/ClassicProblemsModal';
import { HomeworkExportModal } from './components/HomeworkExportModal';
import { Language, translations } from './i18n/translations';

export default function App() {
  // Language state: Default to English ('en') as requested, with fallback checking URL and storage
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get('lang');
      if (urlLang === 'en' || urlLang === 'zh') return urlLang;
      const stored = localStorage.getItem('app_lang');
      if (stored === 'en' || stored === 'zh') return stored;
    }
    return 'en';
  });

  const t = translations[lang];
  const isZh = lang === 'zh';

  // Synchronize document title and html lang attribute for SEO & accessibility
  useEffect(() => {
    document.documentElement.lang = isZh ? 'zh-CN' : 'en';
    document.title = isZh
      ? '二元一次方程组求解器 - 初一代入消元与加减消元计算器'
      : 'Linear System Solver – Step-by-Step Substitution & Elimination Calculator';
  }, [isZh]);

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    try {
      localStorage.setItem('app_lang', newLang);
      const url = new URL(window.location.href);
      url.searchParams.set('lang', newLang);
      window.history.replaceState({}, '', url.toString());
    } catch {
      // ignore in iframe environments
    }
  };

  // Main Navigation Tab
  const [activeNav, setActiveNav] = useState<'solver' | 'practice' | 'knowledge'>('solver');

  // Linear system state: Default is a standard problem 2x + 3y = 7, 3x - 2y = 4
  const [eq1, setEq1] = useState<EquationStandard>({
    a: new Fraction(2n),
    b: new Fraction(3n),
    c: new Fraction(7n),
    rawStr: '2x + 3y = 7',
  });

  const [eq2, setEq2] = useState<EquationStandard>({
    a: new Fraction(3n),
    b: new Fraction(-2n),
    c: new Fraction(4n),
    rawStr: '3x - 2y = 4',
  });

  // Current problem title if loaded from preset
  const [customProblemTitle, setCustomProblemTitle] = useState<string | null>(null);

  // Active solution method tab (substitution vs elimination)
  const [activeMethod, setActiveMethod] = useState<'substitution' | 'elimination'>('elimination');

  // Modals
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Compute full analytical solution with current language
  const analysis: SystemAnalysis = useMemo(() => {
    return solveLinearSystem(eq1, eq2, lang);
  }, [eq1, eq2, lang]);

  // Handle equation update
  const handleUpdateEquations = (newEq1: EquationStandard, newEq2: EquationStandard) => {
    setEq1(newEq1);
    setEq2(newEq2);
    // Auto adapt recommended method
    const tempAnalysis = solveLinearSystem(newEq1, newEq2, lang);
    if (tempAnalysis.substitutionMethod?.recommended) {
      setActiveMethod('substitution');
    } else {
      setActiveMethod('elimination');
    }
  };

  const handleSelectPreset = (newEq1: EquationStandard, newEq2: EquationStandard, title?: string) => {
    handleUpdateEquations(newEq1, newEq2);
    if (title) setCustomProblemTitle(title);
    setActiveNav('solver');
  };

  const currentDisplayTitle = customProblemTitle || t.defaultProblemTitle;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100">
      {/* 1. Top Bar Contract: Brand - Nav links - Primary action + Language Switcher */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 sm:gap-8 px-4 sm:px-6 py-3.5">
          {/* Zone 1: Single text element Brand */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setActiveNav('solver');
            }}
            className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              xy
            </span>
            <span>{t.appTitle}</span>
          </a>

          {/* Zone 2: Navigation links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveNav('solver')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                activeNav === 'solver' ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              {t.navSolver}
            </button>
            <button
              onClick={() => setActiveNav('practice')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                activeNav === 'practice' ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              {t.navPractice}
            </button>
            <button
              onClick={() => setIsPresetsOpen(true)}
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              {t.navPresets}
            </button>
            <button
              onClick={() => setActiveNav('knowledge')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                activeNav === 'knowledge' ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              {t.navKnowledge}
            </button>
          </nav>

          {/* Zone 3: Language Toggle & Primary Action */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Language Switcher */}
            <div className="inline-flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs">
              <button
                onClick={() => handleLanguageChange('en')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  lang === 'en'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to English"
              >
                EN
              </button>
              <button
                onClick={() => handleLanguageChange('zh')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  lang === 'zh'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="切换到中文"
              >
                中文
              </button>
            </div>

            {/* Export Action */}
            <button
              onClick={() => setIsExportOpen(true)}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t.exportHomework}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Educational Sandbox Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Navigation Sub-bar for Mobile / Quick Toggles */}
        <div className="flex md:hidden items-center justify-around bg-white border border-slate-200 rounded-lg p-1 mb-5 text-xs font-medium">
          <button
            onClick={() => setActiveNav('solver')}
            className={`px-3 py-1.5 rounded-md ${
              activeNav === 'solver' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600'
            }`}
          >
            {t.mobileNavSolver}
          </button>
          <button
            onClick={() => setActiveNav('practice')}
            className={`px-3 py-1.5 rounded-md ${
              activeNav === 'practice' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600'
            }`}
          >
            {t.mobileNavPractice}
          </button>
          <button
            onClick={() => setIsPresetsOpen(true)}
            className="px-3 py-1.5 rounded-md text-slate-600"
          >
            {t.mobileNavPresets}
          </button>
          <button
            onClick={() => setActiveNav('knowledge')}
            className={`px-3 py-1.5 rounded-md ${
              activeNav === 'knowledge' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600'
            }`}
          >
            {t.mobileNavKnowledge}
          </button>
        </div>

        {/* VIEW 1: Main Equation Solver & Geometric Coordinate Visualization */}
        {activeNav === 'solver' && (
          <div className="space-y-6">
            {/* Top Info Strip with Clean Metadata */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-900">{currentDisplayTitle}</span>
                <span aria-hidden="true">·</span>
                <span>{t.metaBadge1}</span>
                <span aria-hidden="true">·</span>
                <span>{t.metaBadge2}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>{t.metaPrecision}</span>
                <span aria-hidden="true">·</span>
                <span>{t.metaGraphDesc}</span>
              </div>
            </div>

            {/* Two-Column Education Stage Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column (5 Cols): Equation Input & Coordinate Graph */}
              <div className="lg:col-span-5 space-y-6">
                {/* 1. Equation Input Panel */}
                <EquationInputPanel
                  eq1={eq1}
                  eq2={eq2}
                  onUpdate={handleUpdateEquations}
                  onOpenPresets={() => setIsPresetsOpen(true)}
                  lang={lang}
                />

                {/* 2. Interactive Coordinate Graph Stage */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-blue-600" />
                      <span>{t.graphTitle}</span>
                    </span>
                    <span className="text-slate-500">{t.graphHint}</span>
                  </div>
                  <CoordinateGraph analysis={analysis} lang={lang} />
                </div>
              </div>

              {/* Right Column (7 Cols): Step-by-Step Pedagogical Steps */}
              <div className="lg:col-span-7 space-y-6">
                <SolutionStepsView
                  analysis={analysis}
                  activeMethod={activeMethod}
                  onMethodChange={setActiveMethod}
                  lang={lang}
                />
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: Interactive Step-by-Step Elimination Quiz Practice */}
        {activeNav === 'practice' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-1 mb-4">
              <h2 className="text-xl font-bold text-slate-900">{t.practiceHeading}</h2>
              <p className="text-xs text-slate-500">{t.practiceSub}</p>
            </div>
            <EliminationQuizPractice
              onLoadProblem={(p1, p2) => {
                handleUpdateEquations(p1, p2);
                setCustomProblemTitle(t.practiceTransferred);
                setActiveNav('solver');
              }}
              lang={lang}
            />
          </div>
        )}

        {/* VIEW 3: Concept & Traps Reference / SEO Rich Educational Guide */}
        {activeNav === 'knowledge' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  <span>{t.knowledgeTitle}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">{t.knowledgeSubtitle}</p>
              </div>

              {/* Grid of Knowledge Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
                {/* Method Comparison */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h3 className="text-sm font-bold text-blue-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <span>{t.k1Title}</span>
                  </h3>
                  <div className="space-y-1.5 text-slate-700">
                    <p>{t.k1DescSub}</p>
                    <p>{t.k1DescElim}</p>
                    <p className="text-amber-800 font-medium bg-amber-50 p-2 rounded border border-amber-200/60">
                      {t.k1Chant}
                    </p>
                  </div>
                </div>

                {/* Core Thought */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span>{t.k2Title}</span>
                  </h3>
                  <div className="space-y-1.5 text-slate-700">
                    <p>{t.k2Desc}</p>
                    <div className="p-2.5 bg-white rounded border border-slate-200 text-center font-mono text-emerald-800 font-semibold flex items-center justify-center gap-2 flex-wrap">
                      <span>{t.k2Diagram}</span>
                    </div>
                  </div>
                </div>

                {/* Common Pitfalls */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h3 className="text-sm font-bold text-rose-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-600" />
                    <span>{t.k3Title}</span>
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    <li>{t.k3Trap1}</li>
                    <li>{t.k3Trap2}</li>
                    <li>{t.k3Trap3}</li>
                    <li>{t.k3Trap4}</li>
                  </ul>
                </div>

                {/* Geometric Interpretation */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h3 className="text-sm font-bold text-purple-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-600" />
                    <span>{t.k4Title}</span>
                  </h3>
                  <div className="space-y-1.5 text-slate-700">
                    <p>{t.k4Desc}</p>
                    <div className="space-y-1 text-[11px] bg-white p-2 rounded border border-slate-200">
                      <div>{t.k4Item1}</div>
                      <div>{t.k4Item2}</div>
                      <div>{t.k4Item3}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Frequently Asked Questions (FAQ) Section - Matches Google FAQPage Schema */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  <span>{isZh ? '常见问题与答疑（FAQ）' : 'Frequently Asked Questions (FAQ)'}</span>
                </h3>
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="font-semibold text-slate-900 mb-1">
                      {isZh
                        ? 'Q1: 如何用代入消元法解二元一次方程组？'
                        : 'Q1: How do you solve a system of linear equations by substitution?'}
                    </p>
                    <p>
                      {isZh
                        ? '1) 观察系数，选用含某一未知数系数为 1 或 -1 的方程进行移项变形，将其表达为含另一未知数的代数式 ③；2) 将 ③ 式代入另一个方程消去该未知数；3) 求解所得的一元一次方程；4) 将求得的数值回代入 ③ 式求出另一个未知数。'
                        : '1) Select an equation and isolate one variable (ideally with coefficient ±1). 2) Substitute this expression into the second equation to eliminate that variable. 3) Solve the resulting single-variable equation. 4) Back-substitute to find the remaining variable.'}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="font-semibold text-slate-900 mb-1">
                      {isZh
                        ? 'Q2: 什么时候用加减消元法比代入法更高效？'
                        : 'Q2: When is elimination better than substitution?'}
                    </p>
                    <p>
                      {isZh
                        ? '当方程组中某一未知数的系数相同、互为相反数，或者两系数的最小公倍数很小时，两式直接相加或相减消元最快，能避免产生复杂分数。'
                        : 'Use elimination when coefficients of a variable are already matching, opposite, or easily equalized via their Least Common Multiple (LCM), avoiding fractions in intermediate steps.'}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="font-semibold text-slate-900 mb-1">
                      {isZh
                        ? 'Q3: 遇到带括号或分母的复杂方程组该怎么化简？'
                        : 'Q3: How to handle equations with parentheses and denominators?'}
                    </p>
                    <p>
                      {isZh
                        ? '先通过“去分母”（两边乘以分母的最小公倍数）和“去括号”（利用乘法分配律注意符号），再移项合并同类项，化为标准形式 ax + by = c 后再进行消元。'
                        : 'First clear denominators by multiplying both sides by the Least Common Denominator, expand parentheses carefully with the distributive law, and collect like terms into standard ax + by = c form.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            <span>{t.footerDesc}</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPresetsOpen(true)}
              className="hover:text-slate-900 transition-colors"
            >
              {t.footerApplied}
            </button>
            <button
              onClick={() => setActiveNav('knowledge')}
              className="hover:text-slate-900 transition-colors"
            >
              {t.footerKnowledge}
            </button>
            <button
              onClick={() => setIsExportOpen(true)}
              className="hover:text-slate-900 transition-colors"
            >
              {t.footerExport}
            </button>
            <button
              onClick={() => handleLanguageChange(lang === 'en' ? 'zh' : 'en')}
              className="text-blue-600 hover:text-blue-800 transition-colors font-medium flex items-center gap-1"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? '中文版' : 'English'}</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ClassicProblemsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onSelectProblem={handleSelectPreset}
        lang={lang}
      />

      <HomeworkExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        analysis={analysis}
        method={activeMethod}
        lang={lang}
      />
    </div>
  );
}

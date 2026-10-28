import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Compass,
  GraduationCap,
  FileText,
  HelpCircle,
  Languages,
  BookOpen,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import {
  EquationGeneral,
  solveGeneralLinearSystem,
  SystemAnalysis,
  getDefaultVarNames,
} from './utils/equation';
import { Fraction } from './utils/fraction';
import { EquationInputPanel } from './components/EquationInputPanel';
import { SolutionStepsView } from './components/SolutionStepsView';
import { CoordinateGraph } from './components/CoordinateGraph';
import { EliminationQuizPractice } from './components/EliminationQuizPractice';
import { ClassicProblemsModal } from './components/ClassicProblemsModal';
import { HomeworkExportModal } from './components/HomeworkExportModal';
import { ProblemBankView } from './components/ProblemBankView';
import { PrivacyView } from './components/PrivacyView';
import { Language, SupportedLang, translations, resolveInitialLanguage } from './i18n/translations';

export type AppRoute = 'solver' | 'practice' | 'knowledge' | 'problem-bank' | 'privacy';

export default function App() {
  // Language state
  const [langState, setLangState] = useState<{ currentLang: SupportedLang; isAuto: boolean }>(() => {
    const init = resolveInitialLanguage();
    return { currentLang: init.lang, isAuto: init.isAuto };
  });
  const lang = langState.currentLang;
  const isZh = lang === 'zh';
  const t = translations[lang];

  // Routing state based on window.location.pathname (POINT 6 & Task 3)
  const getInitialRoute = (): AppRoute => {
    if (typeof window === 'undefined') return 'solver';
    const path = window.location.pathname.toLowerCase();
    if (path === '/practice' || path.startsWith('/practice/')) return 'practice';
    if (path === '/guide' || path === '/knowledge' || path.startsWith('/guide/')) return 'knowledge';
    if (path === '/problem-bank' || path.startsWith('/problem-bank/')) return 'problem-bank';
    if (path === '/privacy' || path.startsWith('/privacy/')) return 'privacy';
    return 'solver';
  };

  const [activeNav, setActiveNav] = useState<AppRoute>(getInitialRoute);

  const navigateTo = useCallback((route: AppRoute) => {
    setActiveNav(route);
    let targetPath = '/';
    if (route === 'practice') targetPath = '/practice';
    else if (route === 'knowledge') targetPath = '/guide';
    else if (route === 'problem-bank') targetPath = '/problem-bank';
    else if (route === 'privacy') targetPath = '/privacy';

    const currentParams = window.location.search;
    window.history.pushState({ route }, '', `${targetPath}${currentParams}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      if (path === '/practice' || path.startsWith('/practice/')) setActiveNav('practice');
      else if (path === '/guide' || path === '/knowledge' || path.startsWith('/guide/')) setActiveNav('knowledge');
      else if (path === '/problem-bank' || path.startsWith('/problem-bank/')) setActiveNav('problem-bank');
      else if (path === '/privacy' || path.startsWith('/privacy/')) setActiveNav('privacy');
      else setActiveNav('solver');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update SEO Meta Tags per Route & Language (applet-seo skill & Task 3)
  useEffect(() => {
    document.documentElement.lang = isZh ? 'zh-CN' : 'en';

    let pageTitle = '';
    let pageDesc = '';
    let canonicalUrl = 'https://linear-system-solver.formulacalckit.com/';

    if (activeNav === 'solver') {
      pageTitle = isZh
        ? '二元及多元一次方程组求解器 - 高斯消元与代入加减计算器'
        : 'Linear System Solver – n×n Gaussian Elimination & Step-by-Step Calculator';
      pageDesc = isZh
        ? '支持 n×n 多元一次方程组与初中二元一次方程组，提供高斯消元法、代入与加减消元规范分步步骤、行列式与矩阵秩计算。'
        : 'Solve n×n and 2×2 systems of linear equations step by step using Gaussian elimination, substitution, and elimination with exact fractions and rank analysis.';
      canonicalUrl = 'https://linear-system-solver.formulacalckit.com/';
    } else if (activeNav === 'practice') {
      pageTitle = isZh
        ? '二元一次方程组消元演练场 - 互动自测与解题思维训练'
        : 'Linear System Elimination Practice Workshop – Interactive Quiz & Strategy';
      pageDesc = isZh
        ? '初一代数消元思维互动自测：自主选择优先消去的未知数与消元方法，计算检验解的正确性，并附名师提示。'
        : 'Interactive practice workshop for secondary algebra: master substitution and elimination method selection with real-time feedback and hints.';
      canonicalUrl = 'https://linear-system-solver.formulacalckit.com/practice';
    } else if (activeNav === 'problem-bank') {
      pageTitle = isZh
        ? '二元及多元一次方程组经典题库 - 中考常考与实际应用题精选 | Problem Bank'
        : 'Linear System Problem Bank – Curated Secondary Algebra & Word Problems';
      pageDesc = isZh
        ? '精选中考常考二元一次方程组、去括号去分母变式题、实际生活应用题（鸡兔同笼、行程流水、工程配套），支持一键载入分步求解与演练。'
        : 'Browse standard secondary algebra linear system problem sets, applied word problems, fractions, and parentheses with instant step-by-step solver loading.';
      canonicalUrl = 'https://linear-system-solver.formulacalckit.com/problem-bank';
    } else if (activeNav === 'privacy') {
      pageTitle = isZh
        ? '隐私政策与数据安全说明 | 二元一次方程组求解器'
        : 'Privacy Policy & Data Security – Linear System Solver';
      pageDesc = isZh
        ? '100% 浏览器本地离线高精度计算，无跨站追踪 Cookie，严格保护每位师生的教育与作业数据隐私。'
        : '100% In-browser local mathematical computation. Zero third-party tracking, zero external data transmission, fully compliant with student privacy.';
      canonicalUrl = 'https://linear-system-solver.formulacalckit.com/privacy';
    } else {
      pageTitle = isZh
        ? '一次方程组与消元法核心考点指南 - 初中代数与线性代数易错总结'
        : 'Linear Systems & Elimination Guide – Methods, Geometry, Determinants & Pitfalls';
      pageDesc = isZh
        ? '全方位梳理代入消元法与加减消元法选法秘籍、四大解题陷阱、函数图像几何交点意义及克莱姆法则与矩阵秩。'
        : 'Comprehensive curriculum guide covering substitution vs elimination criteria, algebraic pitfalls, coordinate geometry, and Cramer’s rule.';
      canonicalUrl = 'https://linear-system-solver.formulacalckit.com/guide';
    }

    document.title = pageTitle;

    const setMeta = (nameAttr: string, valAttr: string, content: string) => {
      let meta = document.querySelector(`meta[${nameAttr}="${valAttr}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(nameAttr, valAttr);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    setMeta('name', 'description', pageDesc);
    setMeta('property', 'og:title', pageTitle);
    setMeta('property', 'og:description', pageDesc);
    setMeta('property', 'og:url', canonicalUrl);
    setMeta('name', 'twitter:title', pageTitle);
    setMeta('name', 'twitter:description', pageDesc);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);
  }, [activeNav, isZh]);

  const handleLanguageChange = (newLang: SupportedLang) => {
    setLangState({ currentLang: newLang, isAuto: false });
    try {
      localStorage.setItem('linear_system_user_chosen_lang_v3', newLang);
      localStorage.removeItem('app_lang');
      const url = new URL(window.location.href);
      url.searchParams.set('lang', newLang);
      window.history.replaceState({}, '', url.toString());
    } catch {}
  };

  // n×n System State
  const [varNames, setVarNames] = useState<string[]>(['x', 'y']);
  const [equations, setEquations] = useState<EquationGeneral[]>([
    {
      coeffs: [new Fraction(2n), new Fraction(3n)],
      c: new Fraction(7n),
      rawStr: '2x + 3y = 7',
    },
    {
      coeffs: [new Fraction(3n), new Fraction(-2n)],
      c: new Fraction(4n),
      rawStr: '3x - 2y = 4',
    },
  ]);

  const [customProblemTitle, setCustomProblemTitle] = useState<string | null>(null);
  const [activeMethod, setActiveMethod] = useState<'substitution' | 'elimination' | 'gaussian'>('elimination');

  // Modals
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Compute full analytical solution
  const analysis: SystemAnalysis = useMemo(() => {
    return solveGeneralLinearSystem(equations, varNames, lang);
  }, [equations, varNames, lang]);

  // Add Equation Handler
  const handleAddEquation = () => {
    const currentDim = equations.length;
    if (currentDim >= 6) return;
    const nextDim = currentDim + 1;
    const nextVarNames = getDefaultVarNames(nextDim);

    const nextEqs: EquationGeneral[] = equations.map((eq) => ({
      coeffs: [...eq.coeffs, new Fraction(0n)],
      c: eq.c,
    }));

    const newRowCoeffs = Array.from({ length: nextDim }, (_, i) =>
      new Fraction(i === currentDim ? 1n : 1n)
    );
    nextEqs.push({
      coeffs: newRowCoeffs,
      c: new Fraction(BigInt(nextDim * 2)),
    });

    setVarNames(nextVarNames);
    setEquations(nextEqs);
    setCustomProblemTitle(`${nextDim} × ${nextDim} ${isZh ? '多元线性方程组' : 'System of Linear Equations'}`);
    setActiveMethod('gaussian');
  };

  // Remove Equation Handler
  const handleRemoveEquation = () => {
    const currentDim = equations.length;
    if (currentDim <= 2) return;
    const nextDim = currentDim - 1;
    const nextVarNames = getDefaultVarNames(nextDim);

    const nextEqs: EquationGeneral[] = equations.slice(0, nextDim).map((eq) => ({
      coeffs: eq.coeffs.slice(0, nextDim),
      c: eq.c,
    }));

    setVarNames(nextVarNames);
    setEquations(nextEqs);
    setCustomProblemTitle(
      nextDim === 2 ? null : `${nextDim} × ${nextDim} ${isZh ? '多元线性方程组' : 'System of Linear Equations'}`
    );
    if (nextDim === 2) {
      setActiveMethod('elimination');
    }
  };

  const handleUpdateEquations = (newEqs: EquationGeneral[], newVars: string[]) => {
    setEquations(newEqs);
    setVarNames(newVars);
  };

  // Preset Selection
  const handleSelectPreset = (eq1: any, eq2: any, title?: string) => {
    setVarNames(['x', 'y']);
    setEquations([
      { coeffs: [eq1.a, eq1.b], c: eq1.c, rawStr: eq1.rawStr },
      { coeffs: [eq2.a, eq2.b], c: eq2.c, rawStr: eq2.rawStr },
    ]);
    if (title) setCustomProblemTitle(title);
    setIsPresetsOpen(false);
    navigateTo('solver');
  };

  const currentDisplayTitle = customProblemTitle || (equations.length === 2 ? t.defaultProblemTitle : `${equations.length} × ${equations.length} ${isZh ? '多元线性方程组' : 'Linear System'}`);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 sm:gap-8 px-4 sm:px-6 py-3.5">
          {/* Brand */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('solver');
            }}
            className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              xy
            </span>
            <span>{t.appTitle}</span>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-slate-600">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('solver');
              }}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                activeNav === 'solver' ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              {t.navSolver}
            </a>
            <a
              href="/practice"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('practice');
              }}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                activeNav === 'practice' ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              {t.navPractice}
            </a>
            <a
              href="/problem-bank"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('problem-bank');
              }}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                activeNav === 'problem-bank' ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              {t.navProblemBank}
            </a>
            <a
              href="/guide"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('knowledge');
              }}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                activeNav === 'knowledge' ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              {t.navKnowledge}
            </a>
          </nav>

          {/* Language Toggle & Primary Action */}
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

            {/* Export Homework Action */}
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

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Mobile Navigation Sub-bar */}
        <div className="flex md:hidden items-center justify-around bg-white border border-slate-200 rounded-lg p-1 mb-5 text-xs font-medium overflow-x-auto">
          <button
            onClick={() => navigateTo('solver')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
              activeNav === 'solver' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600'
            }`}
          >
            {t.mobileNavSolver}
          </button>
          <button
            onClick={() => navigateTo('practice')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
              activeNav === 'practice' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600'
            }`}
          >
            {t.mobileNavPractice}
          </button>
          <button
            onClick={() => navigateTo('problem-bank')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
              activeNav === 'problem-bank' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600'
            }`}
          >
            {t.navProblemBank}
          </button>
          <button
            onClick={() => navigateTo('knowledge')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
              activeNav === 'knowledge' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600'
            }`}
          >
            {t.mobileNavKnowledge}
          </button>
        </div>

        {/* VIEW 1: Main Equation Solver */}
        {activeNav === 'solver' && (
          <div className="space-y-6">
            {/* Top Info Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-900">{currentDisplayTitle}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {equations.length === 2 ? t.metaBadge1 : `${equations.length} × ${equations.length} ${isZh ? '高阶线性方程组' : 'Linear System'}`}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {equations.length === 2
                    ? t.metaBadge2
                    : isZh
                    ? '高斯消元法与克莱姆法则'
                    : 'Gaussian Elimination & Cramer'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>{t.metaPrecision}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {equations.length === 2
                    ? t.metaGraphDesc
                    : isZh
                    ? '矩阵初等行变换'
                    : 'Elementary Row Operations'}
                </span>
              </div>
            </div>

            {/* Split Layout: Left Column / Right Column */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column (5 Cols) */}
              <div className="lg:col-span-5 space-y-6">
                <EquationInputPanel
                  equations={equations}
                  varNames={varNames}
                  onUpdate={handleUpdateEquations}
                  onAddEquation={handleAddEquation}
                  onRemoveEquation={handleRemoveEquation}
                  onOpenPresets={() => setIsPresetsOpen(true)}
                  lang={lang}
                />

                {/* 2D Coordinate Graph (2x2) or Multi-Variable Structure Card */}
                {equations.length === 2 ? (
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
                ) : (
                  <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-blue-600" />
                        <span>{isZh ? '多元线性方程组结构概览' : 'Higher-Order System Overview'}</span>
                      </span>
                      <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                        n = {equations.length}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {isZh
                        ? `当前系统包含 ${equations.length} 个方程与 ${equations.length} 个未知数 (${varNames.join(', ')})。在多维欧几里得空间中，方程表示几何超平面，交点通过右侧高斯消元初等行变换精确求解。`
                        : `Current system comprises ${equations.length} equations in ${equations.length} variables (${varNames.join(', ')}). In higher dimensional space, equations represent hyperplanes solved via row reduction.`}
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column (7 Cols) */}
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

        {/* VIEW 2: Interactive Elimination Quiz Practice (/practice) */}
        {activeNav === 'practice' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-1 mb-4">
              <h2 className="text-xl font-bold text-slate-900">{t.practiceHeading}</h2>
              <p className="text-xs text-slate-500">{t.practiceSub}</p>
            </div>
            <EliminationQuizPractice
              onLoadProblem={(p1, p2) => {
                setVarNames(['x', 'y']);
                setEquations([
                  { coeffs: [p1.a, p1.b], c: p1.c, rawStr: p1.rawStr },
                  { coeffs: [p2.a, p2.b], c: p2.c, rawStr: p2.rawStr },
                ]);
                setCustomProblemTitle(t.practiceTransferred);
                navigateTo('solver');
              }}
              lang={lang}
            />
          </div>
        )}

        {/* VIEW 3: Dedicated Problem Bank Page (/problem-bank) */}
        {activeNav === 'problem-bank' && (
          <ProblemBankView
            onLoadProblem={handleSelectPreset}
            lang={lang}
          />
        )}

        {/* VIEW 4: Concept & Traps Reference / SEO Educational Guide (/guide) */}
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

                {/* Geometric Interpretation & Matrix Rank */}
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

              {/* Frequently Asked Questions (FAQ) Section */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  <span>{isZh ? '常见问题与答疑（FAQ）' : 'Frequently Asked Questions (FAQ)'}</span>
                </h3>
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="font-semibold text-slate-900 mb-1">
                      {isZh
                        ? 'Q1: 如何用高斯消元法求解多元线性方程组？'
                        : 'Q1: How does Gaussian elimination solve systems of linear equations?'}
                    </p>
                    <p>
                      {isZh
                        ? '1) 提取系数与常数项构建增广矩阵 [A | b]；2) 选取非零主元，通过初等行变换将各主元下方的元素消为 0，化为上三角行阶梯形（REF）；3) 由最末行向上进行逆序回代，依次求出各未知数的精确解。'
                        : '1) Construct augmented matrix [A | b]; 2) Perform elementary row operations to eliminate entries below each pivot into Row Echelon Form (REF); 3) Back-substitute from bottom row to top to find all variables.'}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="font-semibold text-slate-900 mb-1">
                      {isZh
                        ? 'Q2: 行列式 D 与矩阵的秩如何判断方程组解的情况？'
                        : 'Q2: How do determinant D and matrix rank determine solution existence?'}
                    </p>
                    <p>
                      {isZh
                        ? '根据朗歇-卡佩利定理（Rouché-Capelli Theorem）：当 rank(A) = rank([A|b]) = n 时，方程组有且仅有唯一解（此时 det(A) ≠ 0）；当 rank(A) < rank([A|b]) 时，出现矛盾等式，方程组无解；当 rank(A) = rank([A|b]) < n 时，方程组有无穷多组解。'
                        : 'By Rouché-Capelli Theorem: if rank(A) = rank([A|b]) = n, unique solution exists (det(A) ≠ 0); if rank(A) < rank([A|b]), inconsistent (no solution); if rank(A) = rank([A|b]) < n, infinitely many solutions.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: Dedicated Privacy Policy Page (/privacy) */}
        {activeNav === 'privacy' && (
          <PrivacyView lang={lang} />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            <span>{t.footerDesc}</span>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('solver');
              }}
              className="hover:text-slate-900 transition-colors"
            >
              {t.navSolver}
            </a>
            <a
              href="/practice"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('practice');
              }}
              className="hover:text-slate-900 transition-colors"
            >
              {t.navPractice}
            </a>
            <a
              href="/problem-bank"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('problem-bank');
              }}
              className="hover:text-slate-900 transition-colors font-medium text-blue-600 hover:text-blue-700"
            >
              {t.navProblemBank}
            </a>
            <a
              href="/guide"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('knowledge');
              }}
              className="hover:text-slate-900 transition-colors"
            >
              {t.footerKnowledge}
            </a>
            <a
              href="/privacy"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('privacy');
              }}
              className="hover:text-slate-900 transition-colors"
            >
              {t.navPrivacy}
            </a>
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

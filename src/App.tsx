import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Compass,
  BookOpen,
  GraduationCap,
  Sparkles,
  FileText,
  HelpCircle,
  TrendingUp,
  Layers,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { EquationStandard, solveLinearSystem, SystemAnalysis } from './utils/equation';
import { Fraction } from './utils/fraction';
import { EquationInputPanel } from './components/EquationInputPanel';
import { SolutionStepsView } from './components/SolutionStepsView';
import { CoordinateGraph } from './components/CoordinateGraph';
import { EliminationQuizPractice } from './components/EliminationQuizPractice';
import { ClassicProblemsModal } from './components/ClassicProblemsModal';
import { HomeworkExportModal } from './components/HomeworkExportModal';

export default function App() {
  // Main Navigation Tab
  const [activeNav, setActiveNav] = useState<'solver' | 'practice' | 'knowledge'>('solver');

  // Linear system state: Default is a classic Grade 7 problem 2x + 3y = 7, 3x - 2y = 4
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
  const [currentProblemTitle, setCurrentProblemTitle] = useState<string>('典型初一整系数方程组');

  // Active solution method tab (代入 vs 加减)
  const [activeMethod, setActiveMethod] = useState<'substitution' | 'elimination'>('elimination');

  // Modals
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Compute full analytical solution
  const analysis: SystemAnalysis = useMemo(() => {
    return solveLinearSystem(eq1, eq2);
  }, [eq1, eq2]);

  // Handle equation update
  const handleUpdateEquations = (newEq1: EquationStandard, newEq2: EquationStandard) => {
    setEq1(newEq1);
    setEq2(newEq2);
    // Auto adapt recommended method
    const tempAnalysis = solveLinearSystem(newEq1, newEq2);
    if (tempAnalysis.substitutionMethod?.recommended) {
      setActiveMethod('substitution');
    } else {
      setActiveMethod('elimination');
    }
  };

  const handleSelectPreset = (newEq1: EquationStandard, newEq2: EquationStandard, title?: string) => {
    handleUpdateEquations(newEq1, newEq2);
    if (title) setCurrentProblemTitle(title);
    setActiveNav('solver');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100">
      {/* 1. Universal Top Bar Contract: [Brand title] - [Nav links] - [Primary action] */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
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
            <span>二元一次方程组求解器</span>
          </a>

          {/* Zone 2: 4 Clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveNav('solver')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                activeNav === 'solver' ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              计算与分步步骤
            </button>
            <button
              onClick={() => setActiveNav('practice')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                activeNav === 'practice' ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              消元互动演练
            </button>
            <button
              onClick={() => setIsPresetsOpen(true)}
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              中考经典题库
            </button>
            <button
              onClick={() => setActiveNav('knowledge')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                activeNav === 'knowledge' ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              初一核心考点速查
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsExportOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>导出作业格式</span>
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
              activeNav === 'solver' ? 'bg-blue-600 text-white' : 'text-slate-600'
            }`}
          >
            方程求解
          </button>
          <button
            onClick={() => setActiveNav('practice')}
            className={`px-3 py-1.5 rounded-md ${
              activeNav === 'practice' ? 'bg-blue-600 text-white' : 'text-slate-600'
            }`}
          >
            消元演练
          </button>
          <button
            onClick={() => setIsPresetsOpen(true)}
            className="px-3 py-1.5 rounded-md text-slate-600"
          >
            题库
          </button>
          <button
            onClick={() => setActiveNav('knowledge')}
            className={`px-3 py-1.5 rounded-md ${
              activeNav === 'knowledge' ? 'bg-blue-600 text-white' : 'text-slate-600'
            }`}
          >
            考点总结
          </button>
        </div>

        {/* VIEW 1: Main Equation Solver & Geometric Coordinate Visualization */}
        {activeNav === 'solver' && (
          <div className="space-y-6">
            {/* Top Info Strip with Clean Unboxed Metadata */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pb-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-900">{currentProblemTitle}</span>
                <span aria-hidden="true">·</span>
                <span>初中七年级下册核心内容</span>
                <span aria-hidden="true">·</span>
                <span>代入消元法与加减消元法双轨对照</span>
              </div>
              <div className="flex items-center gap-2">
                <span>精确度：既约分数 / 整数</span>
                <span aria-hidden="true">·</span>
                <span>图像：实时解析几何平面交点</span>
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
                />

                {/* 2. Interactive Coordinate Graph Stage */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-blue-600" />
                      <span>平面直角坐标系 · 函数图象与交点</span>
                    </span>
                    <span className="text-slate-500">支持拖拽平移与滚轮缩放</span>
                  </div>
                  <CoordinateGraph analysis={analysis} />
                </div>
              </div>

              {/* Right Column (7 Cols): Step-by-Step Pedagogical Steps */}
              <div className="lg:col-span-7 space-y-6">
                <SolutionStepsView
                  analysis={analysis}
                  activeMethod={activeMethod}
                  onMethodChange={setActiveMethod}
                />
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: Interactive Step-by-Step Elimination Quiz Practice */}
        {activeNav === 'practice' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-1 mb-4">
              <h2 className="text-xl font-bold text-slate-900">初一二元一次方程组消元演练场</h2>
              <p className="text-xs text-slate-500">
                攻克“代入法变形”与“加减法找最小公倍数”两大难点，自主探索最优解题路径
              </p>
            </div>
            <EliminationQuizPractice
              onLoadProblem={(p1, p2) => {
                handleUpdateEquations(p1, p2);
                setCurrentProblemTitle('演练题目转入求解器');
                setActiveNav('solver');
              }}
            />
          </div>
        )}

        {/* VIEW 3: Middle School Curriculum Concept & Traps Reference */}
        {activeNav === 'knowledge' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  <span>初一数学《二元一次方程组》满分考点全景梳理</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  依据人教版、北师大版、苏教版七年级教材精炼整理
                </p>
              </div>

              {/* Grid of Knowledge Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
                {/* Method Comparison */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h3 className="text-sm font-bold text-blue-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <span>代入消元法 vs 加减消元法 选法秘籍</span>
                  </h3>
                  <div className="space-y-1.5 text-slate-700">
                    <p>
                      <strong>代入法适用特征：</strong>
                      方程组中存在某一未知数的系数为 <strong>1 或 -1</strong>（如 $x - 2y = 3$），此时移项不会产生分数，代入最顺畅。
                    </p>
                    <p>
                      <strong>加减法适用特征：</strong>
                      某一未知数的系数<strong>相同或互为相反数</strong>，或两系数较小且容易求出最小公倍数（LCM）。
                    </p>
                    <p className="text-amber-800 font-medium bg-amber-50 p-2 rounded border border-amber-200/60">
                      口诀：“系数有 1 选代入，系数相同直接减，系数相反直接加；都不相同求公倍，异号相加更稳当！”
                    </p>
                  </div>
                </div>

                {/* Core Thought */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span>核心数学思想：转化与化归</span>
                  </h3>
                  <div className="space-y-1.5 text-slate-700">
                    <p>
                      <strong>消元思想：</strong>
                      “二元”是未知的难点，“一元”是已学掌握的熟知领域。通过代入或加减将两个未知数消为一个未知数，即：
                    </p>
                    <div className="p-2.5 bg-white rounded border border-slate-200 text-center font-mono text-emerald-800 font-semibold flex items-center justify-center gap-2 flex-wrap">
                      <span>二元一次方程组</span>
                      <span className="text-blue-600 font-sans">──【消元】──▶</span>
                      <span>一元一次方程</span>
                      <span className="text-blue-600 font-sans">──【求解】──▶</span>
                      <span>回代得全解</span>
                    </div>
                    <p>
                      这种将未知问题转化为已知模型的方法，是初中数学最重要的思想方法之一。
                    </p>
                  </div>
                </div>

                {/* Common Pitfalls */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h3 className="text-sm font-bold text-rose-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-600" />
                    <span>初一易错“四大陷阱”防范指南</span>
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    <li>
                      <strong>两边乘数漏乘常数项：</strong>
                      例如方程两边乘以 2 时，右边的常数项忘记乘 2。
                    </li>
                    <li>
                      <strong>减法消元括号未变号：</strong>
                      计算 ③ - ④ 时，负项在括号内作差应变为正号。
                    </li>
                    <li>
                      <strong>去分母时整式项漏乘：</strong>
                      含分母方程通分时，没有分母的单项忘记乘以公分母。
                    </li>
                    <li>
                      <strong>未规范写出答语：</strong>
                      中考规范要求最终用大括号联立写出 x 和 y 的值。
                    </li>
                  </ul>
                </div>

                {/* Geometric Interpretation */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h3 className="text-sm font-bold text-purple-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-600" />
                    <span>二元一次方程组与一次函数的内在联系</span>
                  </h3>
                  <div className="space-y-1.5 text-slate-700">
                    <p>每个二元一次方程 ax + by = c 都可以改写为一次函数 y = kx + b 的形式，其所有解对应坐标平面上的一条直线：</p>
                    <div className="space-y-1 text-[11px] bg-white p-2 rounded border border-slate-200">
                      <div>· 两直线相交于一点 ⟺ 方程组有唯一解 (x₀, y₀)</div>
                      <div>· 两直线平行无交点 ⟺ 方程组无解</div>
                      <div>· 两直线完全重合 ⟺ 方程组有无穷多组解</div>
                    </div>
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
            <span>二元一次方程组教学求解器 · 初中数学消元规范教学与自测工具</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPresetsOpen(true)}
              className="hover:text-slate-900 transition-colors"
            >
              经典应用题专题
            </button>
            <button
              onClick={() => setActiveNav('knowledge')}
              className="hover:text-slate-900 transition-colors"
            >
              考点速查
            </button>
            <button
              onClick={() => setIsExportOpen(true)}
              className="hover:text-slate-900 transition-colors"
            >
              作业导出
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ClassicProblemsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onSelectProblem={handleSelectPreset}
      />

      <HomeworkExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        analysis={analysis}
        method={activeMethod}
      />
    </div>
  );
}

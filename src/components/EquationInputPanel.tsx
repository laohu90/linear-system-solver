import React, { useState } from 'react';
import { Sparkles, ArrowUpDown, RotateCcw, BookOpen, AlertCircle, Edit3, Grid } from 'lucide-react';
import { MathView } from './MathView';
import { EquationStandard, parseLinearEquation, formatSystemTeX } from '../utils/equation';
import { Fraction } from '../utils/fraction';

interface EquationInputPanelProps {
  eq1: EquationStandard;
  eq2: EquationStandard;
  onUpdate: (eq1: EquationStandard, eq2: EquationStandard) => void;
  onOpenPresets: () => void;
}

export const EquationInputPanel: React.FC<EquationInputPanelProps> = ({
  eq1,
  eq2,
  onUpdate,
  onOpenPresets,
}) => {
  const [mode, setMode] = useState<'standard' | 'freeform'>('standard');

  // Local state for standard inputs
  const [a1, setA1] = useState(eq1.a.toString());
  const [b1, setB1] = useState(eq1.b.toString());
  const [c1, setC1] = useState(eq1.c.toString());

  const [a2, setA2] = useState(eq2.a.toString());
  const [b2, setB2] = useState(eq2.b.toString());
  const [c2, setC2] = useState(eq2.c.toString());

  // Local state for freeform inputs
  const [free1, setFree1] = useState('2x + 3y = 7');
  const [free2, setFree2] = useState('3x - 2y = 4');

  const [inputError, setInputError] = useState<string | null>(null);

  // Sync when eq1 / eq2 prop change from outside (e.g. preset selection)
  React.useEffect(() => {
    setA1(eq1.a.toString());
    setB1(eq1.b.toString());
    setC1(eq1.c.toString());

    setA2(eq2.a.toString());
    setB2(eq2.b.toString());
    setC2(eq2.c.toString());

    if (eq1.rawStr) setFree1(eq1.rawStr);
    if (eq2.rawStr) setFree2(eq2.rawStr);
    setInputError(null);
  }, [eq1, eq2]);

  const commitStandard = (
    nextA1: string,
    nextB1: string,
    nextC1: string,
    nextA2: string,
    nextB2: string,
    nextC2: string
  ) => {
    try {
      const fracA1 = Fraction.from(nextA1 || '0');
      const fracB1 = Fraction.from(nextB1 || '0');
      const fracC1 = Fraction.from(nextC1 || '0');

      const fracA2 = Fraction.from(nextA2 || '0');
      const fracB2 = Fraction.from(nextB2 || '0');
      const fracC2 = Fraction.from(nextC2 || '0');

      if (fracA1.isZero() && fracB1.isZero()) {
        setInputError('方程①中 x 和 y 的系数不能同时为 0');
        return;
      }
      if (fracA2.isZero() && fracB2.isZero()) {
        setInputError('方程②中 x 和 y 的系数不能同时为 0');
        return;
      }

      setInputError(null);
      onUpdate(
        { a: fracA1, b: fracB1, c: fracC1 },
        { a: fracA2, b: fracB2, c: fracC2 }
      );
    } catch (e: any) {
      setInputError(e.message || '输入格式有误，请输入整数、小数或如 2/3 的分数');
    }
  };

  const commitFreeform = (str1: string, str2: string) => {
    try {
      const parsed1 = parseLinearEquation(str1);
      const parsed2 = parseLinearEquation(str2);
      setInputError(null);
      onUpdate(
        { a: parsed1.a, b: parsed1.b, c: parsed1.c, rawStr: str1 },
        { a: parsed2.a, b: parsed2.b, c: parsed2.c, rawStr: str2 }
      );
    } catch (e: any) {
      setInputError(e.message || '方程解析失败，请检查等号与未知数符号');
    }
  };

  const handleSwap = () => {
    onUpdate(eq2, eq1);
  };

  const handleReset = () => {
    const defaultEq1 = { a: new Fraction(2n), b: new Fraction(3n), c: new Fraction(7n) };
    const defaultEq2 = { a: new Fraction(3n), b: new Fraction(-2n), c: new Fraction(4n) };
    setA1('2');
    setB1('3');
    setC1('7');
    setA2('3');
    setB2('-2');
    setC2('4');
    setFree1('2x + 3y = 7');
    setFree2('3x - 2y = 4');
    setInputError(null);
    onUpdate(defaultEq1, defaultEq2);
  };

  const handleGenerateRandom = () => {
    // Generate a random high-quality secondary school problem with clean integer or small fraction solution
    const x = Math.floor(Math.random() * 9) - 4; // -4 to 4
    const y = Math.floor(Math.random() * 9) - 4; // -4 to 4

    // Pick small non-zero coefficients
    const coeffs = [-3, -2, -1, 1, 2, 3, 4, 5];
    const a1Val = coeffs[Math.floor(Math.random() * coeffs.length)];
    let b1Val = coeffs[Math.floor(Math.random() * coeffs.length)];

    let a2Val = coeffs[Math.floor(Math.random() * coeffs.length)];
    let b2Val = coeffs[Math.floor(Math.random() * coeffs.length)];

    // Ensure not parallel
    if (a1Val * b2Val - a2Val * b1Val === 0) {
      b2Val = b2Val === 1 ? 2 : 1;
    }

    const c1Val = a1Val * x + b1Val * y;
    const c2Val = a2Val * x + b2Val * y;

    const newEq1 = { a: new Fraction(BigInt(a1Val)), b: new Fraction(BigInt(b1Val)), c: new Fraction(BigInt(c1Val)) };
    const newEq2 = { a: new Fraction(BigInt(a2Val)), b: new Fraction(BigInt(b2Val)), c: new Fraction(BigInt(c2Val)) };

    setA1(a1Val.toString());
    setB1(b1Val.toString());
    setC1(c1Val.toString());
    setA2(a2Val.toString());
    setB2(b2Val.toString());
    setC2(c2Val.toString());

    setInputError(null);
    onUpdate(newEq1, newEq2);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      {/* Header and Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>输入二元一次方程组</span>
            <span className="text-xs font-normal text-slate-500">（支持初一代入法与加减法解析）</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            可填入整数、小数或分数（如 2/3、-5/4），系统将进行精确代数化简。
          </p>
        </div>

        {/* Input Mode Selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg shrink-0">
          <button
            onClick={() => setMode('standard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mode === 'standard' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>系数填空</span>
          </button>
          <button
            onClick={() => setMode('freeform')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mode === 'freeform' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>自由整式输入</span>
          </button>
        </div>
      </div>

      {/* Input Fields */}
      <div className="mt-5">
        {mode === 'standard' ? (
          <div className="space-y-4">
            {/* Equation 1 */}
            <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-blue-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span>方程 ①</span>
                </span>
                <span className="text-xs text-slate-400 font-mono">a₁x + b₁y = c₁</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-800">
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={a1}
                    onChange={(e) => {
                      setA1(e.target.value);
                      commitStandard(e.target.value, b1, c1, a2, b2, c2);
                    }}
                    placeholder="2"
                    className="w-16 px-2.5 py-1.5 text-center font-mono font-medium bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <span className="font-semibold text-slate-700">x</span>
                </div>

                <span className="text-slate-400">+</span>

                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={b1}
                    onChange={(e) => {
                      setB1(e.target.value);
                      commitStandard(a1, e.target.value, c1, a2, b2, c2);
                    }}
                    placeholder="3"
                    className="w-16 px-2.5 py-1.5 text-center font-mono font-medium bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <span className="font-semibold text-slate-700">y</span>
                </div>

                <span className="text-slate-400">=</span>

                <input
                  type="text"
                  value={c1}
                  onChange={(e) => {
                    setC1(e.target.value);
                    commitStandard(a1, b1, e.target.value, a2, b2, c2);
                  }}
                  placeholder="7"
                  className="w-20 px-2.5 py-1.5 text-center font-mono font-medium bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Equation 2 */}
            <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-600" />
                  <span>方程 ②</span>
                </span>
                <span className="text-xs text-slate-400 font-mono">a₂x + b₂y = c₂</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-800">
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={a2}
                    onChange={(e) => {
                      setA2(e.target.value);
                      commitStandard(a1, b1, c1, e.target.value, b2, c2);
                    }}
                    placeholder="3"
                    className="w-16 px-2.5 py-1.5 text-center font-mono font-medium bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                  <span className="font-semibold text-slate-700">x</span>
                </div>

                <span className="text-slate-400">+</span>

                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={b2}
                    onChange={(e) => {
                      setB2(e.target.value);
                      commitStandard(a1, b1, c1, a2, e.target.value, c2);
                    }}
                    placeholder="-2"
                    className="w-16 px-2.5 py-1.5 text-center font-mono font-medium bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                  <span className="font-semibold text-slate-700">y</span>
                </div>

                <span className="text-slate-400">=</span>

                <input
                  type="text"
                  value={c2}
                  onChange={(e) => {
                    setC2(e.target.value);
                    commitStandard(a1, b1, c1, a2, b2, e.target.value);
                  }}
                  placeholder="4"
                  className="w-20 px-2.5 py-1.5 text-center font-mono font-medium bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                方程 ① 表达式（支持带括号、分数，如 2(x-1) = 3y + 4 或 x/2 + y/3 = 5）：
              </label>
              <input
                type="text"
                value={free1}
                onChange={(e) => {
                  setFree1(e.target.value);
                  commitFreeform(e.target.value, free2);
                }}
                placeholder="2x + 3y = 7"
                className="w-full px-3 py-2 font-mono text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                方程 ② 表达式：
              </label>
              <input
                type="text"
                value={free2}
                onChange={(e) => {
                  setFree2(e.target.value);
                  commitFreeform(free1, e.target.value);
                }}
                placeholder="3x - 2y = 4"
                className="w-full px-3 py-2 font-mono text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        )}

        {/* Error message banner */}
        {inputError && (
          <div className="mt-3 flex items-center gap-2 p-2.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{inputError}</span>
          </div>
        )}

        {/* Live LaTeX System Preview */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-500 shrink-0">当前方程组：</span>
            <MathView math={formatSystemTeX(eq1, eq2)} />
          </div>

          {/* Quick Tools */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={handleGenerateRandom}
              title="生成初一典型题"
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>随机练习题</span>
            </button>
            <button
              onClick={onOpenPresets}
              title="初一经典题库与实际应用题"
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>题库与应用题</span>
            </button>
            <button
              onClick={handleSwap}
              title="互换方程①与方程②"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              title="恢复默认"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

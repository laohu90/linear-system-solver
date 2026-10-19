import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Award, CheckCircle, RefreshCw, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';
import { MathView } from './MathView';
import { EquationStandard, solveLinearSystem, formatEquationTeX } from '../utils/equation';
import { Fraction } from '../utils/fraction';

interface EliminationQuizPracticeProps {
  onLoadProblem: (eq1: EquationStandard, eq2: EquationStandard) => void;
}

interface PracticeProblem {
  id: string;
  name: string;
  eq1: EquationStandard;
  eq2: EquationStandard;
  bestVar: 'x' | 'y';
  bestMethod: 'substitution' | 'elimination';
  subTransformHint: string;
  elimM1: number;
  elimM2: number;
  elimOp: '+' | '-';
  xAns: string;
  yAns: string;
}

const QUIZ_BANK: PracticeProblem[] = [
  {
    id: 'q1',
    name: '基础题：加减消元相反数秒杀',
    eq1: { a: new Fraction(2n), b: new Fraction(3n), c: new Fraction(13n) },
    eq2: { a: new Fraction(4n), b: new Fraction(-3n), c: new Fraction(5n) },
    bestVar: 'y',
    bestMethod: 'elimination',
    subTransformHint: '观察 y 的系数为 +3 与 -3，互为相反数，加减消元最快！',
    elimM1: 1,
    elimM2: 1,
    elimOp: '+',
    xAns: '3',
    yAns: '7/3',
  },
  {
    id: 'q2',
    name: '基础题：代入法含系数1的方程',
    eq1: { a: new Fraction(1n), b: new Fraction(-2n), c: new Fraction(1n) },
    eq2: { a: new Fraction(3n), b: new Fraction(4n), c: new Fraction(13n) },
    bestVar: 'x',
    bestMethod: 'substitution',
    subTransformHint: '方程①中 x 的系数为 1，变形得 x = 2y + 1 最为简便！',
    elimM1: 3,
    elimM2: 1,
    elimOp: '-',
    xAns: '3',
    yAns: '1',
  },
  {
    id: 'q3',
    name: '提高题：乘倍数对齐系数',
    eq1: { a: new Fraction(3n), b: new Fraction(2n), c: new Fraction(12n) },
    eq2: { a: new Fraction(2n), b: new Fraction(3n), c: new Fraction(13n) },
    bestVar: 'x',
    bestMethod: 'elimination',
    subTransformHint: '消去 x 时，①×2 且 ②×3，使 x 系数均为 6。',
    elimM1: 2,
    elimM2: 3,
    elimOp: '-',
    xAns: '2',
    yAns: '3',
  },
];

export const EliminationQuizPractice: React.FC<EliminationQuizPracticeProps> = ({ onLoadProblem }) => {
  const [problemIndex, setProblemIndex] = useState(0);
  const currentProblem = QUIZ_BANK[problemIndex];

  // User input states
  const [chosenVar, setChosenVar] = useState<'x' | 'y' | null>(null);
  const [chosenMethod, setChosenMethod] = useState<'substitution' | 'elimination' | null>(null);
  const [userM1, setUserM1] = useState('');
  const [userM2, setUserM2] = useState('');
  const [userOp, setUserOp] = useState<'+' | '-' | null>(null);
  const [userX, setUserX] = useState('');
  const [userY, setUserY] = useState('');

  const [feedback, setFeedback] = useState<{
    status: 'idle' | 'success' | 'partial' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });

  const [showHint, setShowHint] = useState(false);

  const resetQuiz = (index: number) => {
    setProblemIndex(index);
    setChosenVar(null);
    setChosenMethod(null);
    setUserM1('');
    setUserM2('');
    setUserOp(null);
    setUserX('');
    setUserY('');
    setFeedback({ status: 'idle', message: '' });
    setShowHint(false);
  };

  const handleCheck = () => {
    // Check answer values
    const analysis = solveLinearSystem(currentProblem.eq1, currentProblem.eq2);
    if (!analysis.solution) return;

    const realX = analysis.solution.x;
    const realY = analysis.solution.y;

    let inputXFrac: Fraction | null = null;
    let inputYFrac: Fraction | null = null;

    try {
      inputXFrac = Fraction.from(userX);
    } catch {
      // not parsed
    }

    try {
      inputYFrac = Fraction.from(userY);
    } catch {
      // not parsed
    }

    const xCorrect = inputXFrac ? inputXFrac.equals(realX) : false;
    const yCorrect = inputYFrac ? inputYFrac.equals(realY) : false;

    if (xCorrect && yCorrect) {
      setFeedback({
        status: 'success',
        message: '太棒了！消元思路清晰，最终解完全正确！🎉',
      });
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } else if (xCorrect || yCorrect) {
      setFeedback({
        status: 'partial',
        message: `其中一个未知数已算对，请仔细核对另一个代入计算过程！`,
      });
    } else {
      setFeedback({
        status: 'error',
        message: '解与标准答案不一致，请检查符号和移项计算，可点击下方“解题思路提示”。',
      });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">消元思维挑战与自测</h3>
            <p className="text-xs text-slate-500">根据初一教学大纲设计：自主决策消元路径，巩固答题套路</p>
          </div>
        </div>

        {/* Change Question */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => resetQuiz((problemIndex + 1) % QUIZ_BANK.length)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>换一题</span>
          </button>
          <button
            onClick={() => onLoadProblem(currentProblem.eq1, currentProblem.eq2)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
          >
            <span>载入计算器解析</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Current Question Math */}
      <div className="my-5 p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
        <div className="text-xs font-semibold text-slate-500 mb-2">{currentProblem.name}</div>
        <MathView
          math={`\\begin{cases} ${formatEquationTeX(
            currentProblem.eq1.a,
            currentProblem.eq1.b,
            currentProblem.eq1.c
          )} & \\text{①} \\\\[4pt] ${formatEquationTeX(
            currentProblem.eq2.a,
            currentProblem.eq2.b,
            currentProblem.eq2.c
          )} & \\text{②} \\end{cases}`}
          block
        />
      </div>

      {/* Interactive Step-by-Step Questioning */}
      <div className="space-y-4 text-xs">
        {/* Step 1: Choose Variable */}
        <div className="p-3 bg-slate-50/50 border border-slate-200/70 rounded-lg">
          <div className="font-semibold text-slate-800 mb-2">
            1. 观察两方程系数，你打算优先消去哪一个未知数？
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setChosenVar('x')}
              className={`px-4 py-1.5 rounded-md font-medium transition-colors ${
                chosenVar === 'x'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              消去 x
            </button>
            <button
              onClick={() => setChosenVar('y')}
              className={`px-4 py-1.5 rounded-md font-medium transition-colors ${
                chosenVar === 'y'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              消去 y
            </button>
            {chosenVar && (
              <span className="text-slate-500">
                {chosenVar === currentProblem.bestVar ? '✨ 极佳决策！' : '可行，计算时注意通分'}
              </span>
            )}
          </div>
        </div>

        {/* Step 2: Choose Method */}
        <div className="p-3 bg-slate-50/50 border border-slate-200/70 rounded-lg">
          <div className="font-semibold text-slate-800 mb-2">2. 你认为使用哪种消元方法更省时不易错？</div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setChosenMethod('substitution')}
              className={`px-4 py-1.5 rounded-md font-medium transition-colors ${
                chosenMethod === 'substitution'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              代入消元法
            </button>
            <button
              onClick={() => setChosenMethod('elimination')}
              className={`px-4 py-1.5 rounded-md font-medium transition-colors ${
                chosenMethod === 'elimination'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              加减消元法
            </button>
            {chosenMethod && (
              <span className="text-slate-500">
                {chosenMethod === currentProblem.bestMethod ? '👍 推荐方法' : '也可以顺利解出'}
              </span>
            )}
          </div>
        </div>

        {/* Step 3: Enter Solutions */}
        <div className="p-3 bg-slate-50/50 border border-slate-200/70 rounded-lg">
          <div className="font-semibold text-slate-800 mb-2">
            3. 请在草稿纸上完成化简演算，并填入你求得的最终解（支持整数或分数如 7/3）：
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-slate-700">x =</span>
              <input
                type="text"
                value={userX}
                onChange={(e) => setUserX(e.target.value)}
                placeholder="例如: 3"
                className="w-24 px-2.5 py-1.5 text-center font-mono bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-slate-700">y =</span>
              <input
                type="text"
                value={userY}
                onChange={(e) => setUserY(e.target.value)}
                placeholder="例如: 7/3"
                className="w-24 px-2.5 py-1.5 text-center font-mono bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <button
              onClick={handleCheck}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
            >
              提交核对
            </button>
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-1 text-xs text-amber-700 hover:underline"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showHint ? '隐藏提示' : '解题提示'}</span>
            </button>
          </div>
        </div>

        {/* Hint Box */}
        {showHint && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 leading-relaxed">
            <div className="font-semibold mb-1">💡 老师点拨：</div>
            <p>{currentProblem.subTransformHint}</p>
          </div>
        )}

        {/* Feedback message */}
        {feedback.status !== 'idle' && (
          <div
            className={`p-3 rounded-lg border flex items-center gap-2 ${
              feedback.status === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : feedback.status === 'partial'
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {feedback.status === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <HelpCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}
      </div>
    </div>
  );
};
